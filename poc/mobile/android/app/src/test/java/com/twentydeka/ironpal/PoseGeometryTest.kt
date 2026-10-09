package com.twentydeka.ironpal

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

/** Neural design v2 §12 (JVM): the geometry channels separate a curl from a raise on synthetic tracks. */
class PoseGeometryTest {
  private fun body(lElbow: Pair<Float, Float>, lWrist: Pair<Float, Float>, rElbow: Pair<Float, Float>, rWrist: Pair<Float, Float>): List<PoseGeometry.Lm> {
    val lm = MutableList(33) { PoseGeometry.Lm(0.5f, 0.5f, 0.0f) }
    lm[0] = PoseGeometry.Lm(0.5f, 0.2f, 1f)          // nose
    lm[11] = PoseGeometry.Lm(0.6f, 0.35f, 1f)        // left shoulder (image right)
    lm[12] = PoseGeometry.Lm(0.4f, 0.35f, 1f)
    lm[23] = PoseGeometry.Lm(0.58f, 0.7f, 1f)        // left hip
    lm[13] = PoseGeometry.Lm(lElbow.first, lElbow.second, 1f)
    lm[15] = PoseGeometry.Lm(lWrist.first, lWrist.second, 1f)
    lm[14] = PoseGeometry.Lm(rElbow.first, rElbow.second, 1f)
    lm[16] = PoseGeometry.Lm(rWrist.first, rWrist.second, 1f)
    return lm
  }

  /** Alternate curl: upper arm pinned (elbow under the shoulder), forearm swings through ~120°. */
  private fun curl(n: Int, fps: Double, hz: Double): List<DoubleArray> = (0 until n).map { t ->
    val phase = 2 * PI * hz * t / fps
    val aL = (0.5 + 0.5 * sin(phase)) * 2.1     // 0..120° of flexion
    val aR = (0.5 + 0.5 * sin(phase + PI)) * 2.1 // the other arm, half a cycle later
    val eL = 0.6f to 0.52f; val eR = 0.4f to 0.52f
    val wL = (eL.first + 0.17f * sin(aL).toFloat()) to (eL.second + 0.17f * cos(aL).toFloat())
    val wR = (eR.first - 0.17f * sin(aR).toFloat()) to (eR.second + 0.17f * cos(aR).toFloat())
    PoseGeometry.channels(body(eL, wL, eR, wR))
  }

  /** Lateral raise: arms straight, both lifted sideways together to shoulder height. */
  private fun raise(n: Int, fps: Double, hz: Double): List<DoubleArray> = (0 until n).map { t ->
    val a = (0.5 + 0.5 * sin(2 * PI * hz * t / fps)) * (PI / 2)
    val sL = 0.6f to 0.35f; val sR = 0.4f to 0.35f
    val eL = (sL.first + 0.17f * sin(a).toFloat()) to (sL.second + 0.17f * cos(a).toFloat())
    val wL = (sL.first + 0.34f * sin(a).toFloat()) to (sL.second + 0.34f * cos(a).toFloat())
    val eR = (sR.first - 0.17f * sin(a).toFloat()) to (sR.second + 0.17f * cos(a).toFloat())
    val wR = (sR.first - 0.34f * sin(a).toFloat()) to (sR.second + 0.34f * cos(a).toFloat())
    PoseGeometry.channels(body(eL, wL, eR, wR))
  }

  private val fps = 5.0

  @Test fun elbowRangeSeparatesCurlFromRaise() {
    val c = PoseGeometry.stats(curl(100, fps, 0.4), fps)
    val r = PoseGeometry.stats(raise(100, fps, 0.4), fps)
    // channel 0 = left elbow angle; stat 4 = range
    assertTrue("curl elbow range ${c[4]}", c[4] > 90)
    assertTrue("raise elbow range ${r[4]}", r[4] < 10)
  }

  @Test fun asymmetrySeparatesAlternatingFromSimultaneous() {
    val c = PoseGeometry.stats(curl(100, fps, 0.4), fps)
    val r = PoseGeometry.stats(raise(100, fps, 0.4), fps)
    // channel 5 = L/R wrist height asymmetry; stat 1 = std
    val o = 5 * PoseGeometry.STATS
    assertTrue("curl asymmetry std ${c[o + 1]}", c[o + 1] > 0.3)
    assertTrue("raise asymmetry std ${r[o + 1]}", r[o + 1] < 0.01)
  }

  @Test fun dominantPeriodIsTheRepPeriod() {
    val c = PoseGeometry.stats(curl(100, fps, 0.4), fps)
    assertEquals(2.5, c[5], 0.3) // 0.4 Hz → 2.5 s, channel 0 period
  }

  @Test fun unseenJointsAreNanAndDropOut() {
    val none = PoseGeometry.channels(null)
    assertTrue(none.all { it.isNaN() })
    val s = PoseGeometry.stats(List(20) { none }, fps)
    assertTrue(s.all { it == 0.0 })
    assertEquals(0.0, PoseGeometry.visibleFraction(List(20) { none }), 0.0)
  }
}
