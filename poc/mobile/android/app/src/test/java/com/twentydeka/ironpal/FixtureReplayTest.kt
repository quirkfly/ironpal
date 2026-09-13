package com.twentydeka.ironpal

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.io.File

/**
 * Replay parity (design §11, ledger Q5): push the e2e fixtures through the SAME engine the
 * device runs and assert the rep counts the Maestro flows will assert.
 *
 * This is what stops the e2e suite from encoding wishful numbers. If a flow expects 8 reps, that
 * number is verified here first, on the host, in seconds — rather than discovered to be wrong
 * after a 3-minute build/install/tap cycle.
 *
 * The conversion below mirrors ReplayImuSource/BleImuSource exactly: raw int16 LSB → SI, with the
 * same slow-EMA gravity subtraction, so the samples reach the DSP as they do in the app.
 */
class FixtureReplayTest {

  private val fixtures = File("../../e2e/fixtures")
  private val p = ModelParams.DEFAULT
  private val rate = p.canonicalRateHz

  private data class Replayed(val accel: Array<DoubleArray>, val gyro: Array<DoubleArray>, val rateHz: Double)

  /** Decode a fixture exactly as ReplayImuSource does, then resample to the canonical rate. */
  private fun replay(name: String): Replayed? {
    val f = File(fixtures, name)
    if (!f.exists()) return null
    var aScale = 0.001
    var gScale = 0.0625
    val meta = File(fixtures, name.removeSuffix(".jsonl") + ".meta.json")
    if (meta.exists()) {
      JSONObject(meta.readText()).optJSONObject("device")?.let {
        aScale = it.optDouble("accel_scale_g_per_lsb", aScale)
        gScale = it.optDouble("gyro_scale_dps_per_lsb", gScale)
      }
    }
    val gToMs2 = 9.80665
    val degToRad = Math.PI / 180.0
    val alpha = 0.002
    val gravity = DoubleArray(3)
    var gravityInit = false
    val accel = ArrayList<DoubleArray>()
    val gyro = ArrayList<DoubleArray>()
    var deviceRate = 60.0

    f.forEachLine { line ->
      if (line.isBlank()) return@forEachLine
      val o = JSONObject(line)
      val n = o.optInt("n", 0)
      val dtUs = o.optInt("dt_us", 16667)
      if (dtUs > 0) deviceRate = 1e6 / dtUs
      val s = o.optJSONArray("s") ?: return@forEachLine
      for (i in 0 until n) {
        val k = i * 6
        val ax = s.getInt(k) * aScale * gToMs2
        val ay = s.getInt(k + 1) * aScale * gToMs2
        val az = s.getInt(k + 2) * aScale * gToMs2
        if (!gravityInit) { gravity[0] = ax; gravity[1] = ay; gravity[2] = az; gravityInit = true }
        gravity[0] += alpha * (ax - gravity[0])
        gravity[1] += alpha * (ay - gravity[1])
        gravity[2] += alpha * (az - gravity[2])
        accel.add(doubleArrayOf(ax - gravity[0], ay - gravity[1], az - gravity[2]))
        gyro.add(doubleArrayOf(
          s.getInt(k + 3) * gScale * degToRad,
          s.getInt(k + 4) * gScale * degToRad,
          s.getInt(k + 5) * gScale * degToRad,
        ))
      }
    }
    if (accel.isEmpty()) return null
    return Replayed(
      Dsp.resample(accel.toTypedArray(), deviceRate, rate),
      Dsp.resample(gyro.toTypedArray(), deviceRate, rate),
      rate,
    )
  }

  /** Run the streaming RepClock over the whole fixture the way SignalModule's tick loop does. */
  private fun countReps(r: Replayed, ex: ExerciseParams?): Int {
    val clock = RepClock(p, ex)
    clock.reset(0L)
    val windowN = (p.windowSec * r.rateHz).toInt()
    val tickN = (p.tickMs / 1000.0 * r.rateHz).toInt().coerceAtLeast(1)
    var end = windowN
    while (end <= r.accel.size) {
      val slice = Array(windowN) { k -> r.accel[end - windowN + k] }
      val (_, sig) = SetAnalyzer.repChannel(slice, p, ex)
      val endNs = ((end - 1) / r.rateHz * 1e9).toLong()
      val cadence = Dsp.autocorrelationPeriodicity(sig, r.rateHz).cadenceHz.takeIf { it > 0 } ?: 0.5
      clock.update(sig, r.rateHz, endNs, cadence, endNs)
      end += tickN
    }
    return clock.count
  }

  private fun gateOpens(r: Replayed): Boolean {
    val gate = GateMachine(p)
    gate.arm()
    val clock = RepClock(p, null)
    clock.reset(0L)
    val windowN = (p.windowSec * r.rateHz).toInt()
    val tickN = (p.tickMs / 1000.0 * r.rateHz).toInt().coerceAtLeast(1)
    var end = windowN
    var opened = false
    while (end <= r.accel.size) {
      val slice = Array(windowN) { k -> r.accel[end - windowN + k] }
      val (_, sig) = SetAnalyzer.repChannel(slice, p, null)
      val per = Dsp.autocorrelationPeriodicity(sig, r.rateHz)
      var e = 0.0; for (v in sig) e += v * v
      val energy = e / sig.size
      val nowNs = ((end - 1) / r.rateHz * 1e9).toLong()
      clock.update(sig, r.rateHz, nowNs, if (per.cadenceHz > 0) per.cadenceHz else 0.5, nowNs)
      gate.tick(energy, per.score, if (per.cadenceHz > 0) per.cadenceHz else 0.5, clock.lastPeakNs, nowNs)
      if (gate.state == GateMachine.State.ACTIVE) opened = true
      end += tickN
    }
    return opened
  }

  @Test
  fun syntheticFixturesProduceTheRepCountsTheFlowsAssert() {
    val cases = listOf(
      Triple("split-squat-8reps.jsonl", 8, ExerciseParams(cadenceLowHz = 0.25, cadenceHighHz = 0.8)),
      Triple("case001-curl-6reps.jsonl", 6, ExerciseParams(cadenceLowHz = 0.25, cadenceHighHz = 0.8)),
      Triple("case002-curl-4reps.jsonl", 4, ExerciseParams(cadenceLowHz = 0.25, cadenceHighHz = 0.8)),
      Triple("case003-pushdown-5reps.jsonl", 5, ExerciseParams(cadenceLowHz = 0.25, cadenceHighHz = 0.8)),
    )
    var checked = 0
    for ((file, expected, ex) in cases) {
      val r = replay(file) ?: continue
      val got = countReps(r, ex)
      // ±1 is the design's own rep gate (score_reps.py); the flows assert the same tolerance.
      assertTrue("$file: expected ~$expected reps, engine counted $got", Math.abs(got - expected) <= 1)
      checked++
    }
    assumeTrue("fixtures not generated (run scripts/e2e/make_imu_fixtures.py)", checked > 0)
    assertEquals(cases.size, checked)
  }

  @Test
  fun theRealStationaryRecordingYieldsNoRepsAndNeverOpensTheGate() {
    // The genuine 2026-08-05 bring-up recording: a board sitting still. If this ever produced
    // reps, the gate or the peak threshold would be inventing motion that is not there.
    val r = replay("real-stationary.jsonl")
    assumeTrue("real-stationary fixture not present", r != null)
    val reps = countReps(r!!, null)
    assertEquals("a stationary recording must yield zero reps", 0, reps)
    assertTrue("the gate must never open on a stationary recording", !gateOpens(r))
  }

  @Test
  fun aperiodicNoiseNeverOpensTheGate() {
    val r = replay("noise-no-reps.jsonl")
    assumeTrue("noise fixture not present", r != null)
    assertTrue("energy without periodicity must not open the gate", !gateOpens(r!!))
  }

  @Test
  fun aRepFixtureDoesOpenTheGate() {
    val r = replay("split-squat-8reps.jsonl")
    assumeTrue("split-squat fixture not present", r != null)
    assertTrue("a periodic rep trace must open the gate", gateOpens(r!!))
  }
}
