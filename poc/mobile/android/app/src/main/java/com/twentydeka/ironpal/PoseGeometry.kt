package com.twentydeka.ironpal

import kotlin.math.PI
import kotlin.math.acos
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * The pose-geometry block of neural design v2 (§3.2): eight per-frame channels computed from
 * MediaPipe landmarks, then six statistics per channel over the set → 48 numbers. Nothing here is
 * learned. Pure Kotlin so the JVM tests can feed it synthetic landmark tracks.
 *
 * MUST stay identical to `scripts/model/embed_fit.py` (`geom` / `stats`): the z-score statistics
 * shipped in `embed_params.json` were fitted on that function's output.
 */
object PoseGeometry {
  const val CHANNELS = 8
  const val STATS = 6
  const val DIMS = CHANNELS * STATS

  /** One landmark: normalised image x/y (0..1, may exceed) and visibility. */
  data class Lm(val x: Float, val y: Float, val v: Float)

  private fun angle(a: Lm, b: Lm, c: Lm): Double {
    val v1x = (a.x - b.x).toDouble(); val v1y = (a.y - b.y).toDouble()
    val v2x = (c.x - b.x).toDouble(); val v2y = (c.y - b.y).toDouble()
    val d = (hypot(v1x, v1y) * hypot(v2x, v2y)) + 1e-6
    return Math.toDegrees(acos(((v1x * v2x + v1y * v2y) / d).coerceIn(-1.0, 1.0)))
  }

  /**
   * Channels: elbow angle L, elbow angle R, wrist-to-shoulder-midpoint distance, nose-minus-wrist
   * height, shoulder abduction (elbow–shoulder–hip), L/R wrist height asymmetry, fraction of
   * wrists below the frame edge, mean wrist visibility. Distances are in shoulder widths.
   * NaN marks a channel whose joints were not seen.
   */
  fun channels(lm: List<Lm>?): DoubleArray {
    if (lm == null || lm.size < 25) return DoubleArray(CHANNELS) { Double.NaN }
    val ls = lm[11]; val rs = lm[12]; val le = lm[13]; val re = lm[14]; val lw = lm[15]; val rw = lm[16]; val nose = lm[0]
    val sw = hypot((ls.x - rs.x).toDouble(), (ls.y - rs.y).toDouble()) + 1e-6
    val midX = (ls.x + rs.x) / 2.0; val midY = (ls.y + rs.y) / 2.0
    val wX = (lw.x + rw.x) / 2.0; val wY = (lw.y + rw.y) / 2.0
    return doubleArrayOf(
      if (minOf(ls.v, le.v, lw.v) > 0.3f) angle(ls, le, lw) else Double.NaN,
      if (minOf(rs.v, re.v, rw.v) > 0.3f) angle(rs, re, rw) else Double.NaN,
      hypot(wX - midX, wY - midY) / sw,
      (nose.y - wY) / sw,
      if (lm[23].v > 0.3f) angle(le, ls, lm[23]) else Double.NaN,
      (lw.y - rw.y) / sw,
      ((if (lw.y > 1f) 1.0 else 0.0) + (if (rw.y > 1f) 1.0 else 0.0)) / 2.0,
      (lw.v + rw.v) / 2.0,
    )
  }

  /**
   * Six statistics per channel over the frames: mean, std, min, max, range, dominant period (s).
   * A channel with fewer than 3 seen frames contributes zeros.
   */
  fun stats(frames: List<DoubleArray>, fps: Double): DoubleArray {
    val out = DoubleArray(DIMS)
    for (c in 0 until CHANNELS) {
      val xs = frames.map { it[c] }.filter { !it.isNaN() }
      if (xs.size < 3) continue
      val n = xs.size
      val mean = xs.average()
      val std = sqrt(xs.sumOf { (it - mean) * (it - mean) } / n)
      val mn = xs.min(); val mx = xs.max()
      // dominant non-DC frequency bin of the de-meaned series (numpy rfft argmax over bins 1..)
      var best = 1; var bestMag = -1.0
      for (k in 1..n / 2) {
        var re = 0.0; var im = 0.0
        for (t in 0 until n) { val a = -2.0 * PI * k * t / n; re += (xs[t] - mean) * cos(a); im += (xs[t] - mean) * sin(a) }
        val mag = re * re + im * im
        if (mag > bestMag + 1e-12) { bestMag = mag; best = k }
      }
      val period = n.toDouble() / best / fps
      val o = c * STATS
      out[o] = mean; out[o + 1] = std; out[o + 2] = mn; out[o + 3] = mx; out[o + 4] = mx - mn; out[o + 5] = period
    }
    return out
  }

  /** Fraction of frames in which the left elbow angle was measurable (the visibility gate). */
  fun visibleFraction(frames: List<DoubleArray>): Double =
    if (frames.isEmpty()) 0.0 else frames.count { !it[0].isNaN() || !it[1].isNaN() }.toDouble() / frames.size
}
