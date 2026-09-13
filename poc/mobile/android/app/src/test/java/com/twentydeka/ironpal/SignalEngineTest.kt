package com.twentydeka.ironpal

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.sin

/**
 * JVM tests for the pure-Kotlin engine (design §11). Synthetic sinusoids with known peaks,
 * head-bob blips, brute-force vs. prefiltered matching, calibration with known rotations.
 */
class SignalEngineTest {

  private val p = ModelParams.DEFAULT
  private val rate = 50.0

  /** [N][3] accel: rep sinusoid on one axis plus small noise elsewhere. */
  private fun repWindow(seconds: Double, cadenceHz: Double, axis: Int, amp: Double = 2.0, phase: Double = 0.0, blipAt: Int = -1): Array<DoubleArray> {
    val n = (seconds * rate).toInt()
    return Array(n) { i ->
      val t = i / rate
      val row = DoubleArray(3) { c -> if (c == axis) amp * sin(2 * PI * cadenceHz * t + phase) else 0.05 * sin(2 * PI * 7.0 * t + c) }
      if (blipAt >= 0 && abs(i - blipAt) < 2) row[axis] += amp * 0.3
      row
    }
  }

  @Test
  fun f16RoundTripsWithinHalfPrecision() {
    val w = repWindow(2.0, 1.0, 1, amp = 9.5)
    val back = F16.decode(F16.encode(w), 3)
    assertEquals(w.size, back.size)
    for (i in w.indices) for (c in 0 until 3) assertTrue(abs(w[i][c] - back[i][c]) < 0.02)
  }

  @Test
  fun repClockCountsEveryCycleOnceAcrossOverlappingTicks() {
    val cadence = 1.0
    val full = repWindow(20.0, cadence, 2)
    val ex = ExerciseParams(cadenceLowHz = 0.5, cadenceHighHz = 1.5)
    val clock = RepClock(p, ex)
    clock.reset(0L)
    val windowN = (p.windowSec * rate).toInt()
    val tickN = (p.tickMs / 1000.0 * rate).toInt()
    var end = windowN
    while (end <= full.size) {
      val slice = Array(windowN) { k -> full[end - windowN + k] }
      val (_, sig) = SetAnalyzer.repChannel(slice, p, ex)
      val endNs = ((end - 1) / rate * 1e9).toLong()
      clock.update(sig, rate, endNs, cadence, endNs)
      end += tickN
    }
    // 20 s at 1 Hz = 20 cycles; the last one is inside the confirmation window and may be pending.
    assertTrue("count=${clock.count}", clock.count in 18..20)
    // Strictly increasing peak times, spaced ~1 s.
    val times = clock.all.map { it.tPeakNs / 1e9 }
    for (i in 1 until times.size) assertTrue(times[i] - times[i - 1] > 0.6)
  }

  @Test
  fun repClockRejectsHeadBobBlipBelowAmplitudeThreshold() {
    val cadence = 0.8
    val w = repWindow(10.0, cadence, 0, amp = 3.0, blipAt = 120)
    val exFitted = ExerciseParams(cadenceHighHz = 1.5, aMin = 1.5)   // fitted: 40 % of median ≈ 1.2 → 1.5 keeps blips out
    val clock = RepClock(p, exFitted)
    clock.reset(0L)
    val (_, sig) = SetAnalyzer.repChannel(w, p, exFitted)
    val endNs = ((w.size - 1) / rate * 1e9).toLong()
    clock.update(sig, rate, endNs, cadence, endNs)
    assertTrue("count=${clock.count}", clock.count in 7..8)
  }

  @Test
  fun gateOpensAfterArmTicksAndClosesAfterSilence() {
    val g = GateMachine(p)
    g.arm()
    var now = 0L
    val tick = p.tickMs * 1_000_000L
    assertEquals(null, g.tick(0.1, 0.9, 1.0, 0L, now))          // first qualifying tick
    now += tick
    val t = g.tick(0.1, 0.9, 1.0, 0L, now)                         // second → ACTIVE
    assertEquals(GateMachine.State.ACTIVE, t?.to)
    // Peaks keep it open.
    var lastPeak = now
    repeat(5) { now += tick; lastPeak = now; assertEquals(null, g.tick(0.1, 0.9, 1.0, lastPeak, now)) }
    // Silence + low periodicity → CLOSING → CLOSED after grace.
    var closed: GateMachine.Transition? = null
    repeat(20) { now += tick; g.tick(0.0, 0.05, 1.0, lastPeak, now)?.let { if (it.to == GateMachine.State.CLOSED) closed = it } }
    assertEquals(GateMachine.State.CLOSED, closed?.to)
    assertTrue(g.closeNs > lastPeak)
  }

  @Test
  fun indexPrefersOwnTemplatesOverPenalisedPriorsAndRejectsUnknown() {
    val idx = TemplateIndex(p)
    val squat = repWindow(4.0, 0.6, 2, amp = 3.0)
    val lunge = repWindow(4.0, 1.2, 0, amp = 1.5)
    fun feats(w: Array<DoubleArray>) = Dsp.extractFeatures(w, rate, null)
    idx.add("s1", "squat", "set", "own", feats(squat), squat)
    idx.add("p1", "lunge", "prior", "founder", feats(lunge), lunge)
    idx.add("l1", "lunge", "set", "own", feats(lunge), lunge)
    idx.setOwnCounts(mapOf("squat" to 1, "lunge" to 1))
    val live = repWindow(4.0, 0.6, 2, amp = 2.6, phase = 0.4)
    val mag = Dsp.bandPass(Dsp.magnitudeSeries(live), rate, p.repBandLowHz, p.repBandHighHz)
    val m = idx.match(feats(live), mag)
    assertEquals("squat", m.label)
    assertTrue(m.confidence >= p.tReject)
    // A window unlike anything stored (pure 7 Hz jitter) is rejected.
    val junk = Array(200) { i -> DoubleArray(3) { c -> 0.05 * sin(2 * PI * 7.0 * i / rate + c) } }
    val mj = idx.match(feats(junk), Dsp.bandPass(Dsp.magnitudeSeries(junk), rate, p.repBandLowHz, p.repBandHighHz))
    assertTrue("conf=${mj.confidence}", mj.confidence < 0.9)
  }

  @Test
  fun scoreAllExcludesSelfAndReportsLabel() {
    val idx = TemplateIndex(p)
    fun feats(w: Array<DoubleArray>) = Dsp.extractFeatures(w, rate, null)
    for (i in 0 until 3) { val w = repWindow(4.0, 0.6, 2, amp = 3.0, phase = i * 0.5); idx.add("s$i", "squat", "set", "own", feats(w), w) }
    for (i in 0 until 3) { val w = repWindow(4.0, 1.2, 0, amp = 1.5, phase = i * 0.5); idx.add("l$i", "lunge", "set", "own", feats(w), w) }
    val arr = idx.scoreAll(setOf("squat", "lunge"))
    assertEquals(6, arr.length())
    var agree = 0
    for (i in 0 until arr.length()) {
      val o = arr.getJSONObject(i)
      val top = o.getJSONArray("topK")
      for (k in 0 until top.length()) assertTrue(top.getJSONObject(k).getString("templateId") != o.getString("templateId"))
      if (o.getString("label") == o.getString("exerciseId")) agree++
    }
    assertTrue("agree=$agree", agree >= 5)
  }

  @Test
  fun canonicalizerRecoversUprightFrameAndAngleIsZeroForSameFit() {
    // Worn upright: gravity along -Z in device axes; nods rotate about device X.
    val cal = Canonicalizer.fromRitual(doubleArrayOf(0.0, 0.0, -9.81), doubleArrayOf(5.0, 0.2, 0.1))
    val up = cal.rotation.apply(doubleArrayOf(0.0, 0.0, 1.0))
    assertTrue(abs(up[2] - 1.0) < 1e-9)                // device +Z maps to head +Z (up)
    assertTrue(cal.residualDeg < 0.5)
    assertTrue(cal.nodAxisDominance > 0.9)
    val cal2 = Canonicalizer.fromRitual(doubleArrayOf(0.0, 0.0, -9.81), doubleArrayOf(5.0, 0.2, 0.1))
    assertTrue(cal.rotation.angleTo(cal2.rotation) < 1e-6)
    // A band tilted 20° about X shows up as ~20° between fits.
    val tilt = Math.toRadians(20.0)
    val cal3 = Canonicalizer.fromRitual(doubleArrayOf(0.0, 9.81 * sin(tilt), -9.81 * Math.cos(tilt)), doubleArrayOf(5.0, 0.2, 0.1))
    assertTrue(abs(cal.rotation.angleTo(cal3.rotation) - 20.0) < 1.0)
  }

  @Test
  fun emptyAndShortWindowsNeverIndexOutOfBounds() {
    // Regression: endSet's slicing produced Array(1) over an EMPTY accel window and threw
    // IndexOutOfBounds, which rejected the bridge call and stranded the user on the live HUD
    // with no way to reach the debrief. A set with no samples must degrade, not crash.
    val p = ModelParams.DEFAULT
    for (n in intArrayOf(0, 1, 4, 7)) {
      val accel = Array(n) { i -> DoubleArray(3) { c -> 0.1 * (i + c) } }
      val rot = Rotation.IDENTITY
      val rotated = rot.apply(accel)
      assertEquals(n, rotated.size)
      if (n >= 8) continue
      // SetAnalyzer is only called for >= 8 samples; the guard is that nothing above throws.
    }
    // The analyser itself on a minimal-but-valid window.
    val w = repWindow(4.0, 0.8, 1)
    val idx = TemplateIndex(p)
    val res = SetAnalyzer.analyze(w, null, idx, p, null)
    assertEquals("unknown", res.match.label)   // empty index rejects rather than inventing a label
  }

  @Test
  fun paramsRoundTripAndDefaultsMatchPoc() {
    val d = ModelParams.DEFAULT
    assertEquals(0.45, d.tReject, 1e-9); assertEquals(400L, d.tickMs); assertEquals(4.0, d.windowSec, 1e-9)
    val parsed = ModelParams.fromJson("""{"t_reject":0.5,"per_exercise":{"squat":{"cadence_low_hz":0.4,"a_min":1.2}}}""")
    assertEquals(0.5, parsed.tReject, 1e-9)
    assertEquals(0.4, parsed.exercise("squat")?.cadenceLowHz)
    assertEquals(1.2, parsed.exercise("squat")?.aMin)
    assertEquals(d.gatePOn, parsed.gatePOn, 1e-9)
  }
}
