package com.ironpal.poc

import kotlin.math.abs
import kotlin.math.hypot
import kotlin.math.ln
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt
import kotlin.math.PI

/**
 * On-device DSP (design §5). Kotlin port of src/signal/dsp.ts — the two MUST
 * stay in agreement (the TS version is the unit-testable reference). Runs on a
 * background thread inside [SignalModule]; the 50 Hz stream never crosses the
 * RN bridge (D1/D6).
 *
 *   band-pass · autocorrelation periodicity · peak detection · feature
 *   extraction (tempo/amplitude/orientation-invariant, accel-only baseline,
 *   gyro optional — D5) · kNN distance · amplitude/time-normalized DTW.
 */
object Dsp {

  const val CANONICAL_RATE_HZ = 50.0
  const val REP_BAND_LOW_HZ = 0.2
  const val REP_BAND_HIGH_HZ = 1.5

  // -------------------------------------------------------------------------
  // Resampling (D4) — linear interpolation to the canonical rate.
  // series: [N][C]
  // -------------------------------------------------------------------------
  fun resample(series: Array<DoubleArray>, srcRateHz: Double, dstRateHz: Double = CANONICAL_RATE_HZ): Array<DoubleArray> {
    if (series.isEmpty()) return emptyArray()
    if (srcRateHz == dstRateHz) return Array(series.size) { series[it].copyOf() }
    val channels = series[0].size
    val srcDurationSec = (series.size - 1) / srcRateHz
    val dstCount = max(1, Math.round(srcDurationSec * dstRateHz).toInt() + 1)
    return Array(dstCount) { i ->
      val t = i / dstRateHz
      val srcPos = t * srcRateHz
      val i0 = min(Math.floor(srcPos).toInt(), series.size - 1)
      val i1 = min(i0 + 1, series.size - 1)
      val frac = srcPos - i0
      DoubleArray(channels) { c ->
        val a = series[i0][c]
        val b = series[i1][c]
        a + (b - a) * frac
      }
    }
  }

  // -------------------------------------------------------------------------
  // Band-pass = one-pole high-pass (low corner) → one-pole low-pass (high corner)
  // -------------------------------------------------------------------------
  private fun onePoleHighPass(x: DoubleArray, cutoffHz: Double, rateHz: Double): DoubleArray {
    val rc = 1.0 / (2.0 * PI * cutoffHz)
    val dt = 1.0 / rateHz
    val alpha = rc / (rc + dt)
    val y = DoubleArray(x.size)
    var prevY = 0.0
    var prevX = if (x.isNotEmpty()) x[0] else 0.0
    for (i in x.indices) {
      val cur = if (i == 0) x[0] else alpha * (prevY + x[i] - prevX)
      y[i] = cur
      prevY = cur
      prevX = x[i]
    }
    return y
  }

  private fun onePoleLowPass(x: DoubleArray, cutoffHz: Double, rateHz: Double): DoubleArray {
    val rc = 1.0 / (2.0 * PI * cutoffHz)
    val dt = 1.0 / rateHz
    val alpha = dt / (rc + dt)
    val y = DoubleArray(x.size)
    var prev = if (x.isNotEmpty()) x[0] else 0.0
    for (i in x.indices) {
      val cur = prev + alpha * (x[i] - prev)
      y[i] = cur
      prev = cur
    }
    return y
  }

  fun bandPass(
    x: DoubleArray,
    rateHz: Double = CANONICAL_RATE_HZ,
    lowHz: Double = REP_BAND_LOW_HZ,
    highHz: Double = REP_BAND_HIGH_HZ,
  ): DoubleArray = onePoleLowPass(onePoleHighPass(x, lowHz, rateHz), highHz, rateHz)

  // -------------------------------------------------------------------------
  // Stats / helpers
  // -------------------------------------------------------------------------
  fun magnitudeSeries(series: Array<DoubleArray>): DoubleArray =
    DoubleArray(series.size) { i ->
      val r = series[i]
      hypot(hypot(r.getOrElse(0) { 0.0 }, r.getOrElse(1) { 0.0 }), r.getOrElse(2) { 0.0 })
    }

  fun column(series: Array<DoubleArray>, c: Int): DoubleArray =
    DoubleArray(series.size) { series[it].getOrElse(c) { 0.0 } }

  private fun mean(x: DoubleArray): Double {
    if (x.isEmpty()) return 0.0
    var s = 0.0
    for (v in x) s += v
    return s / x.size
  }

  private fun energy(x: DoubleArray): Double {
    var s = 0.0
    for (v in x) s += v * v
    return s
  }

  private fun zNormalize(x: DoubleArray): DoubleArray {
    val m = mean(x)
    var varSum = 0.0
    for (v in x) varSum += (v - m) * (v - m)
    val std = sqrt(varSum / max(1, x.size)).let { if (it == 0.0) 1.0 else it }
    return DoubleArray(x.size) { (x[it] - m) / std }
  }

  // -------------------------------------------------------------------------
  // Autocorrelation periodicity (motion gate — Q4)
  // -------------------------------------------------------------------------
  data class Periodicity(val cadenceHz: Double, val score: Double)

  fun autocorrelationPeriodicity(
    signal: DoubleArray,
    rateHz: Double = CANONICAL_RATE_HZ,
    lowHz: Double = REP_BAND_LOW_HZ,
    highHz: Double = REP_BAND_HIGH_HZ,
  ): Periodicity {
    val x = zNormalize(signal)
    val n = x.size
    if (n < 4) return Periodicity(0.0, 0.0)
    val minLag = max(1, Math.floor(rateHz / highHz).toInt())
    val maxLag = min(n - 1, Math.ceil(rateHz / lowHz).toInt())
    val r0 = energy(x).let { if (it == 0.0) 1.0 else it }
    var bestLag = 0
    var bestVal = 0.0
    var prev = Double.NEGATIVE_INFINITY
    var rising = false
    var lag = minLag
    while (lag <= maxLag) {
      var s = 0.0
      var i = 0
      while (i + lag < n) {
        s += x[i] * x[i + lag]
        i++
      }
      val norm = s / r0
      if (norm > prev) {
        rising = true
      } else if (rising && norm < prev) {
        if (prev > bestVal) {
          bestVal = prev
          bestLag = lag - 1
        }
        rising = false
      }
      prev = norm
      lag++
    }
    if (bestLag == 0) return Periodicity(0.0, 0.0)
    return Periodicity(rateHz / bestLag, max(0.0, min(1.0, bestVal)))
  }

  // -------------------------------------------------------------------------
  // Peak detection → rep counting (design §5.3)
  // -------------------------------------------------------------------------
  data class PeakResult(val peaks: IntArray, val reps: Int, val asymmetry: Double)

  fun detectPeaks(
    signal: DoubleArray,
    rateHz: Double = CANONICAL_RATE_HZ,
    maxCadenceHz: Double = REP_BAND_HIGH_HZ,
  ): PeakResult {
    val n = signal.size
    if (n < 3) return PeakResult(IntArray(0), 0, 0.0)
    val rms = sqrt(energy(signal) / n)
    val minHeight = 0.35 * rms
    val minSpacing = max(1, Math.floor(rateHz / maxCadenceHz).toInt())
    val peaks = ArrayList<Int>()
    var lastPeak = -minSpacing
    for (i in 1 until n - 1) {
      if (signal[i] > minHeight &&
        signal[i] >= signal[i - 1] &&
        signal[i] > signal[i + 1] &&
        i - lastPeak >= minSpacing
      ) {
        peaks.add(i)
        lastPeak = i
      }
    }
    var asymAccum = 0.0
    var asymCount = 0
    for (p in peaks) {
      var left = p
      while (left > 0 && signal[left - 1] <= signal[left]) left--
      var right = p
      while (right < n - 1 && signal[right + 1] <= signal[right]) right++
      val rise = p - left
      val fall = right - p
      val denom = rise + fall
      if (denom > 0) {
        asymAccum += (rise - fall).toDouble() / denom
        asymCount++
      }
    }
    val asym = if (asymCount > 0) asymAccum / asymCount else 0.0
    return PeakResult(peaks.toIntArray(), peaks.size, asym)
  }

  // -------------------------------------------------------------------------
  // Feature extraction (design §5.4) — invariant features; accel-only baseline,
  // gyro optional (D5).
  // -------------------------------------------------------------------------
  private fun spectralFlatness(signal: DoubleArray): Double {
    val x = zNormalize(signal)
    val n = x.size
    if (n < 8) return 0.0
    val r0 = energy(x).let { if (it == 0.0) 1.0 else it }
    var acc = 0.0
    var count = 0
    val maxLag = min(n - 1, n / 2)
    var lag = 1
    while (lag <= maxLag) {
      var s = 0.0
      var i = 0
      while (i + lag < n) {
        s += x[i] * x[i + lag]
        i++
      }
      acc += abs(s / r0)
      count++
      lag++
    }
    return if (count > 0) max(0.0, min(1.0, acc / count)) else 0.0
  }

  private fun normalizedJerk(signal: DoubleArray, rateHz: Double): Double {
    val n = signal.size
    if (n < 2) return 0.0
    var jerkEnergy = 0.0
    for (i in 1 until n) {
      val d = (signal[i] - signal[i - 1]) * rateHz
      jerkEnergy += d * d
    }
    val amp = sqrt(energy(signal) / n).let { if (it == 0.0) 1.0 else it }
    return sqrt(jerkEnergy / n) / (amp * rateHz)
  }

  fun extractFeatures(
    accel: Array<DoubleArray>,
    rateHz: Double = CANONICAL_RATE_HZ,
    gyro: Array<DoubleArray>? = null,
  ): FeatureVector {
    val ax = bandPass(column(accel, 0), rateHz)
    val ay = bandPass(column(accel, 1), rateHz)
    val az = bandPass(column(accel, 2), rateHz)

    val ex = energy(ax)
    val ey = energy(ay)
    val ez = energy(az)
    val total = (ex + ey + ez).let { if (it == 0.0) 1.0 else it }
    val axisEnergyRatio = doubleArrayOf(ex / total, ey / total, ez / total)

    val cols = arrayOf(ax, ay, az)
    val dominantIdx = axisEnergyRatio.indices.maxByOrNull { axisEnergyRatio[it] } ?: 0
    val dominant = cols[dominantIdx]

    val periodicity = autocorrelationPeriodicity(dominant, rateHz)
    val peaks = detectPeaks(dominant, rateHz)

    val rms = sqrt(energy(dominant) / max(1, dominant.size)).let { if (it == 0.0) 1.0 else it }
    var active = 0
    for (v in dominant) if (abs(v) > 0.25 * rms) active++
    val motionDuty = if (dominant.isNotEmpty()) active.toDouble() / dominant.size else 0.0

    var gyroEnergyRatio: DoubleArray? = null
    if (gyro != null && gyro.isNotEmpty()) {
      val gx = energy(bandPass(column(gyro, 0), rateHz))
      val gy = energy(bandPass(column(gyro, 1), rateHz))
      val gz = energy(bandPass(column(gyro, 2), rateHz))
      val gTotal = (gx + gy + gz).let { if (it == 0.0) 1.0 else it }
      gyroEnergyRatio = doubleArrayOf(gx / gTotal, gy / gTotal, gz / gTotal)
    }

    return FeatureVector(
      axisEnergyRatio = axisEnergyRatio,
      normalizedCadenceHz = periodicity.cadenceHz,
      motionDutyRatio = motionDuty,
      peakAsymmetry = peaks.asymmetry,
      spectralFlatness = spectralFlatness(dominant),
      normalizedJerk = normalizedJerk(dominant, rateHz),
      gyroEnergyRatio = gyroEnergyRatio,
      hasGyro = gyro != null,
    )
  }

  // -------------------------------------------------------------------------
  // kNN distance over the feature vector (Q6)
  // -------------------------------------------------------------------------
  private const val W_AXIS = 2.0
  private const val W_CADENCE = 0.8
  private const val W_DUTY = 1.2
  private const val W_ASYM = 1.0
  private const val W_FLAT = 1.0
  private const val W_JERK = 0.8
  private const val W_GYRO = 1.5

  fun featureDistance(a: FeatureVector, b: FeatureVector): Double {
    var d = 0.0
    for (i in 0 until 3) {
      val diff = a.axisEnergyRatio[i] - b.axisEnergyRatio[i]
      d += W_AXIS * diff * diff
    }
    val ca = max(1e-3, a.normalizedCadenceHz)
    val cb = max(1e-3, b.normalizedCadenceHz)
    val cd = ln(ca / cb)
    d += W_CADENCE * cd * cd

    val md = a.motionDutyRatio - b.motionDutyRatio
    d += W_DUTY * md * md
    val pa = a.peakAsymmetry - b.peakAsymmetry
    d += W_ASYM * pa * pa
    val sf = a.spectralFlatness - b.spectralFlatness
    d += W_FLAT * sf * sf
    val nj = a.normalizedJerk - b.normalizedJerk
    d += W_JERK * nj * nj

    val ag = a.gyroEnergyRatio
    val bg = b.gyroEnergyRatio
    if (ag != null && bg != null) {
      for (i in 0 until 3) {
        val diff = ag[i] - bg[i]
        d += W_GYRO * diff * diff
      }
    }
    return sqrt(d)
  }

  // -------------------------------------------------------------------------
  // Amplitude/time-normalized DTW (Q6/D7) with Sakoe-Chiba band.
  // -------------------------------------------------------------------------
  fun normalizedDtw(a: DoubleArray, b: DoubleArray, bandFraction: Double = 0.2): Double {
    val x = zNormalize(a)
    val y = zNormalize(b)
    val n = x.size
    val m = y.size
    if (n == 0 || m == 0) return Double.POSITIVE_INFINITY
    val band = max(1, Math.floor(bandFraction * max(n, m)).toInt())
    val INF = Double.POSITIVE_INFINITY
    var prev = DoubleArray(m + 1) { INF }
    var curr = DoubleArray(m + 1) { INF }
    prev[0] = 0.0
    for (i in 1..n) {
      curr.fill(INF)
      val jStart = max(1, i - band)
      val jEnd = min(m, i + band)
      for (j in jStart..jEnd) {
        val cost = abs(x[i - 1] - y[j - 1])
        val best = min(prev[j], min(curr[j - 1], prev[j - 1]))
        curr[j] = cost + (if (best == INF) 0.0 else best)
      }
      val tmp = prev
      prev = curr
      curr = tmp
    }
    val raw = prev[m]
    if (raw.isInfinite()) return Double.POSITIVE_INFINITY
    return raw / (n + m)
  }

  fun distanceToConfidence(distance: Double, scale: Double = 1.0): Double {
    if (distance.isInfinite()) return 0.0
    return 1.0 / (1.0 + distance / scale)
  }

  // -------------------------------------------------------------------------
  // Full matcher: kNN fused with normalized-DTW against cached templates.
  // -------------------------------------------------------------------------
  data class MatcherOutput(
    val exercise: String,
    val confidence: Double,
    val knnDistance: Double,
    val dtwDistance: Double,
  )

  fun matchAgainstTemplates(
    liveFeatures: FeatureVector,
    liveWindowAccel: Array<DoubleArray>,
    templates: List<Template>,
    rejectThreshold: Double,
  ): MatcherOutput {
    if (templates.isEmpty()) {
      return MatcherOutput("unknown", 0.0, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY)
    }
    val liveMag = bandPass(magnitudeSeries(liveWindowAccel))

    var bestLabel: String? = null
    var bestKnn = Double.POSITIVE_INFINITY
    var bestDtw = Double.POSITIVE_INFINITY
    var bestFused = Double.POSITIVE_INFINITY

    for (t in templates) {
      val knn = featureDistance(liveFeatures, t.featureVector)
      val accelOnly = Array(t.imuSeriesResampled.size) { idx ->
        val row = t.imuSeriesResampled[idx]
        DoubleArray(min(3, row.size)) { c -> row[c] }
      }
      val tMag = bandPass(magnitudeSeries(accelOnly))
      val dtw = normalizedDtw(liveMag, tMag)
      val fused = 0.6 * knn + 0.4 * dtw
      if (fused < bestFused) {
        bestFused = fused
        bestLabel = t.exerciseLabel
        bestKnn = knn
        bestDtw = dtw
      }
    }

    val confidence = distanceToConfidence(bestFused)
    val exercise = if (confidence < rejectThreshold) "unknown" else (bestLabel ?: "unknown")
    return MatcherOutput(exercise, confidence, bestKnn, bestDtw)
  }
}
