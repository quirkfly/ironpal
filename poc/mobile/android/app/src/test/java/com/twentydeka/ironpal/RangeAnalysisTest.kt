package com.twentydeka.ironpal

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.io.File
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.sin

/**
 * Offline range analysis (studio design §10.2): the same engine the live tick loop runs,
 * replayed over a window. Fixtures are the e2e IMU recordings decoded exactly as
 * ReplayImuSource does (the same conversion FixtureReplayTest uses).
 */
class RangeAnalysisTest {

  private val fixtures = File("../../e2e/fixtures")
  private val p = ModelParams.DEFAULT
  private val rate = p.canonicalRateHz

  /** Decode a fixture into a Window on host time starting at [t0Ns]. */
  private fun window(name: String, t0Ns: Long): ImuPipeline.Window? {
    val f = File(fixtures, name)
    if (!f.exists()) return null
    var aScale = 0.001; var gScale = 0.0625
    val meta = File(fixtures, name.removeSuffix(".jsonl") + ".meta.json")
    if (meta.exists()) JSONObject(meta.readText()).optJSONObject("device")?.let {
      aScale = it.optDouble("accel_scale_g_per_lsb", aScale); gScale = it.optDouble("gyro_scale_dps_per_lsb", gScale)
    }
    val gToMs2 = 9.80665; val degToRad = PI / 180.0; val alpha = 0.002
    val gravity = DoubleArray(3); var init = false
    val accel = ArrayList<DoubleArray>(); val gyro = ArrayList<DoubleArray>()
    var deviceRate = 60.0
    f.forEachLine { line ->
      if (line.isBlank()) return@forEachLine
      val o = JSONObject(line)
      val n = o.optInt("n", 0); val dtUs = o.optInt("dt_us", 16667)
      if (dtUs > 0) deviceRate = 1e6 / dtUs
      val s = o.optJSONArray("s") ?: return@forEachLine
      for (i in 0 until n) {
        val k = i * 6
        val ax = s.getInt(k) * aScale * gToMs2; val ay = s.getInt(k + 1) * aScale * gToMs2; val az = s.getInt(k + 2) * aScale * gToMs2
        if (!init) { gravity[0] = ax; gravity[1] = ay; gravity[2] = az; init = true }
        gravity[0] += alpha * (ax - gravity[0]); gravity[1] += alpha * (ay - gravity[1]); gravity[2] += alpha * (az - gravity[2])
        accel.add(doubleArrayOf(ax - gravity[0], ay - gravity[1], az - gravity[2]))
        gyro.add(doubleArrayOf(s.getInt(k + 3) * gScale * degToRad, s.getInt(k + 4) * gScale * degToRad, s.getInt(k + 5) * gScale * degToRad))
      }
    }
    if (accel.isEmpty()) return null
    val a = Dsp.resample(accel.toTypedArray(), deviceRate, rate)
    val g = Dsp.resample(gyro.toTypedArray(), deviceRate, rate)
    val endNs = t0Ns + ((a.size - 1) / rate * 1e9).toLong()
    return ImuPipeline.Window(a, g, rate, endNs)
  }

  private fun t0Of(win: ImuPipeline.Window): Long = win.endNs - ((win.accel.size - 1) / rate * 1e9).toLong()

  @Test
  fun splitSquatFixtureYieldsOneRegionOfAboutEightCycles() {
    val win = window("split-squat-8reps.jsonl", 10_000_000_000L)
    assumeTrue("fixture missing", win != null)
    val regions = RangeAnalysis.scanRegions(win!!, p, t0Of(win))
    assertTrue("regions=${regions.length()}", regions.length() >= 1)
    var total = 0
    for (i in 0 until regions.length()) total += regions.getJSONObject(i).getInt("cycles")
    assertTrue("cycles=$total", total in 6..10)
    val r = regions.getJSONObject(0)
    assertTrue(r.getLong("t0Ns") >= 10_000_000_000L)
    assertTrue(r.getLong("t1Ns") > r.getLong("t0Ns"))
  }

  @Test
  fun stationaryFixtureYieldsNoRegion() {
    val win = window("real-stationary.jsonl", 0L)
    assumeTrue("fixture missing", win != null)
    assertEquals(0, RangeAnalysis.scanRegions(win!!, p, t0Of(win)).length())
  }

  @Test
  fun explainReportsPeaksTicksAndTrace() {
    val win = window("split-squat-8reps.jsonl", 3_000_000_000L)
    assumeTrue("fixture missing", win != null)
    val ex = RangeAnalysis.explain(win!!, p, null, t0Of(win))
    val peaks = ex.getJSONArray("peaks")
    assertTrue("peaks=${peaks.length()}", peaks.length() in 6..10)
    assertTrue(ex.getJSONArray("ticks").length() > 10)
    assertNotNull(ex.getJSONArray("rejected"))
    val trace = ex.getJSONObject("trace")
    assertTrue(trace.getJSONArray("values").length() in 2..2000)
    assertEquals(3_000_000_000L, trace.getLong("t0Ns"))
    // Peaks are in host time and inside the window.
    for (i in 0 until peaks.length()) {
      val t = peaks.getJSONObject(i).getLong("tNs")
      assertTrue(t >= 3_000_000_000L && t <= win.endNs)
    }
  }

  @Test
  fun peakNearSnapsToTheTopWithin150Ms() {
    // A clean 1 Hz sinusoid: tops at t = 0.25 s + k.
    val n = (10 * rate).toInt()
    val accel = Array(n) { i -> val t = i / rate; doubleArrayOf(0.0, 0.0, 2.0 * sin(2 * PI * t)) }
    val t0 = 100_000_000_000L
    val win = ImuPipeline.Window(accel, null, rate, t0 + ((n - 1) / rate * 1e9).toLong())
    // Drop 100 ms after the top at 3.25 s → should snap back to ≈ 3.25 s (band-pass shifts little at 1 Hz).
    val dropped = t0 + 3_350_000_000L
    val snapped = RangeAnalysis.peakNear(win, p, null, dropped, 150.0, t0)
    val err = abs(snapped - (t0 + 3_250_000_000L)) / 1e6
    assertTrue("err=$err ms", err <= 150.0)
    assertTrue(snapped != dropped)
  }

  @Test
  fun previewIntegrityOnASmallOwnStore() {
    val index = TemplateIndex(p)
    fun w(phase: Double, cad: Double) = Array((8 * rate).toInt()) { i -> val t = i / rate; doubleArrayOf(0.1 * sin(3 * t), 0.0, 2.0 * sin(2 * PI * cad * t + phase)) }
    for (k in 0 until 3) {
      val win = w(k * 0.3, 0.9)
      index.add("own$k", "goblet-squat", "set", "own", Dsp.extractFeatures(win, rate, null), win)
    }
    val other = w(0.0, 0.4)
    index.add("other", "romanian-deadlift", "set", "own", Dsp.extractFeatures(other, rate, null), other)
    index.setOwnCounts(mapOf("goblet-squat" to 3, "romanian-deadlift" to 1))
    val cand = w(1.0, 0.9)
    val out = RangeAnalysis.previewIntegrity(index, "goblet-squat", Dsp.extractFeatures(cand, rate, null), cand, p, setOf("goblet-squat", "romanian-deadlift"))
    val integ = out.optDouble("integrityIfAdded", -1.0)
    assertTrue("integ=$integ", integ in 0.0..1.0)
    assertTrue(out.getDouble("selfConfidence") > 0.0)
    assertTrue(out.has("nearestOther"))
  }
}
