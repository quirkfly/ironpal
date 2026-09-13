package com.ironpal.poc

import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.acos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/**
 * The signal engine (design §3): pure Kotlin, no Android imports, so every piece runs in
 * JVM unit tests and in the replay CLI. [SignalModule] is the only Android-facing caller.
 *
 *  Canonicalizer  — per-session head frame from the calibration ritual (§3.1)
 *  GateMachine    — IDLE → ARMING → ACTIVE → CLOSING → CLOSED with hysteresis (§3.2)
 *  RepClock       — streaming, confirmed-peak rep counting with a per-set count (§3.3)
 *  TemplateIndex  — cached magnitudes, kNN prefilter, DTW on top-k, kind penalties, LOO (§3.5)
 *  SetAnalyzer    — the full set-end match (§2.2)
 */

// ---------------------------------------------------------------------------
// Canonicalizer
// ---------------------------------------------------------------------------

/** Row-major 3x3 rotation; apply(v) = R · v. Identity = "device axes are the head frame". */
class Rotation(val m: Array<DoubleArray>) {
  fun apply(v: DoubleArray): DoubleArray = DoubleArray(3) { r -> m[r][0] * v[0] + m[r][1] * v[1] + m[r][2] * v[2] }
  fun apply(series: Array<DoubleArray>): Array<DoubleArray> = Array(series.size) { i ->
    val row = series[i]
    val rot = apply(doubleArrayOf(row[0], row[1], row[2]))
    if (row.size > 3) DoubleArray(row.size) { c -> if (c < 3) rot[c] else row[c] } else rot
  }

  /** Angle in degrees between this rotation and [other] (geodesic distance on SO(3)). */
  fun angleTo(other: Rotation): Double {
    // trace(R1ᵀ R2)
    var tr = 0.0
    for (i in 0 until 3) for (k in 0 until 3) tr += m[k][i] * other.m[k][i]
    val c = ((tr - 1.0) / 2.0).coerceIn(-1.0, 1.0)
    return Math.toDegrees(acos(c))
  }

  fun toJson(): JSONArray = JSONArray().apply { for (r in m) put(JSONArray(r.toList())) }

  companion object {
    val IDENTITY = Rotation(arrayOf(doubleArrayOf(1.0, 0.0, 0.0), doubleArrayOf(0.0, 1.0, 0.0), doubleArrayOf(0.0, 0.0, 1.0)))
    fun fromJson(a: JSONArray?): Rotation {
      if (a == null || a.length() != 3) return IDENTITY
      return Rotation(Array(3) { r -> val row = a.getJSONArray(r); DoubleArray(3) { c -> row.getDouble(c) } })
    }
  }
}

object Canonicalizer {
  data class Calibration(val rotation: Rotation, val residualDeg: Double, val nodAxisDominance: Double)

  private fun norm(v: DoubleArray) = sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
  private fun unit(v: DoubleArray): DoubleArray { val n = norm(v).let { if (it == 0.0) 1.0 else it }; return DoubleArray(3) { v[it] / n } }
  private fun cross(a: DoubleArray, b: DoubleArray) = doubleArrayOf(
    a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
  private fun dot(a: DoubleArray, b: DoubleArray) = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

  /**
   * Design §3.1. [wornGravity] is the mean *total* acceleration while worn upright (points DOWN in
   * device axes), [nodGyroEnergy] is per-axis gyro energy in the 1–3 Hz band during the three nods.
   * Up = −gravity; pitch axis = the device axis with the most nod energy; forward = up × pitch.
   * Residual = how far the worn gravity magnitude is from 1 g (as an angle-equivalent, degrees)
   * — a soft band that tilted between holds shows up here.
   */
  fun fromRitual(wornGravity: DoubleArray, nodGyroEnergy: DoubleArray, gravityMag: Double = 9.81): Calibration {
    val up = unit(DoubleArray(3) { -wornGravity[it] })
    val axis = (0 until 3).maxByOrNull { nodGyroEnergy[it] } ?: 0
    val total = nodGyroEnergy.sum().let { if (it == 0.0) 1.0 else it }
    val dominance = nodGyroEnergy[axis] / total
    val pitchRaw = DoubleArray(3).also { it[axis] = 1.0 }
    // Remove any component along up so the triad is orthonormal.
    val p = dot(pitchRaw, up)
    val pitch = unit(DoubleArray(3) { pitchRaw[it] - p * up[it] })
    val forward = unit(cross(up, pitch))
    val left = unit(cross(up, forward))
    val r = Rotation(arrayOf(forward, left, up))
    val magErr = abs(norm(wornGravity) - gravityMag) / gravityMag
    val residualDeg = Math.toDegrees(asinSafe(magErr))
    return Calibration(r, residualDeg, dominance)
  }

  private fun asinSafe(x: Double) = Math.asin(x.coerceIn(-1.0, 1.0))
}

// ---------------------------------------------------------------------------
// GateMachine
// ---------------------------------------------------------------------------

class GateMachine(private val p: ModelParams) {
  enum class State { IDLE, ARMING, ACTIVE, CLOSING, CLOSED }
  data class Transition(val from: State, val to: State, val atNs: Long)

  var state: State = State.IDLE
    private set
  var openNs: Long = 0L; private set
  var closeNs: Long = 0L; private set
  private var qualifying = 0
  private var closingSinceNs = 0L

  fun arm() { state = State.ARMING; qualifying = 0; openNs = 0; closeNs = 0 }
  fun reset() { state = State.IDLE; qualifying = 0 }

  /**
   * One tick. [cadenceHz] is the best current cadence estimate (fitted or measured),
   * [lastPeakNs] the newest confirmed rep (0 = none). Returns a transition when one happened.
   */
  fun tick(energy: Double, periodicity: Double, cadenceHz: Double, lastPeakNs: Long, nowNs: Long): Transition? {
    val cycleNs = (1e9 / max(0.2, cadenceHz)).toLong()
    when (state) {
      State.IDLE, State.CLOSED -> return null
      State.ARMING -> {
        if (energy >= p.gateEOn && periodicity >= p.gatePOn) qualifying++ else qualifying = 0
        if (qualifying >= p.gateArmTicks) {
          state = State.ACTIVE
          openNs = nowNs - (p.windowSec * 1e9 / 2).toLong()
          return Transition(State.ARMING, State.ACTIVE, openNs)
        }
        return null
      }
      State.ACTIVE -> {
        val silence = if (lastPeakNs == 0L) nowNs - openNs else nowNs - lastPeakNs
        val limit = max((1.5 * cycleNs).toLong(), 2_000_000_000L)
        if (silence > limit && periodicity < p.gatePOff) {
          state = State.CLOSING; closingSinceNs = nowNs
          return Transition(State.ACTIVE, State.CLOSING, nowNs)
        }
        return null
      }
      State.CLOSING -> {
        if (lastPeakNs > closingSinceNs) {
          state = State.ACTIVE
          return Transition(State.CLOSING, State.ACTIVE, nowNs)
        }
        if (nowNs - closingSinceNs >= (p.closingGraceSec * 1e9).toLong()) {
          state = State.CLOSED
          closeNs = if (lastPeakNs > 0) lastPeakNs + cycleNs / 2 else closingSinceNs
          return Transition(State.CLOSING, State.CLOSED, closeNs)
        }
        return null
      }
    }
  }
}

// ---------------------------------------------------------------------------
// RepClock
// ---------------------------------------------------------------------------

class RepClock(private val p: ModelParams, private val ex: ExerciseParams?) {
  data class Rep(val n: Int, val tPeakNs: Long, val amplitude: Double, val tConfirmedNs: Long)

  private val reps = ArrayList<Rep>()
  private var startNs = 0L
  val count: Int get() = reps.size
  val all: List<Rep> get() = reps
  val lastPeakNs: Long get() = reps.lastOrNull()?.tPeakNs ?: 0L

  fun reset(startNs: Long) { reps.clear(); this.startNs = startNs }

  private val cadenceHigh get() = ex?.cadenceHighHz ?: p.repBandHighHz

  /** Confirmation delay in seconds: ¼ cycle at the current cadence, clamped (design §3.3). */
  fun sConfSec(cadenceHz: Double): Double {
    val quarter = 0.25 / max(0.2, cadenceHz)
    return quarter.coerceIn(p.sConfMsMin / 1000.0, p.sConfMsMax / 1000.0)
  }

  /**
   * Feed the newest window (band-passed rep channel, [rateHz], ending at [endNs]). Peaks are
   * confirmed once at least sConf of post-peak samples exist, then de-duplicated by time
   * against everything already counted. Returns the newly confirmed reps in order.
   */
  fun update(signal: DoubleArray, rateHz: Double, endNs: Long, cadenceHz: Double, nowNs: Long): List<Rep> {
    val n = signal.size
    if (n < 3) return emptyList()
    val pk = Dsp.detectPeaks(signal, rateHz, cadenceHigh, ex?.aMin, p.peakHeightRmsFactor)
    val sConf = sConfSec(cadenceHz)
    val minSepNs = (0.5e9 / cadenceHigh).toLong()
    val out = ArrayList<Rep>()
    for (i in pk.peaks) {
      val ageSec = (n - 1 - i) / rateHz
      if (ageSec < sConf) continue                         // not yet confirmable
      val tNs = endNs - (ageSec * 1e9).toLong()
      if (tNs < startNs) continue
      if (reps.any { abs(it.tPeakNs - tNs) < minSepNs }) continue
      val rep = Rep(reps.size + 1, tNs, signal[i], nowNs)
      reps.add(rep); out.add(rep)
    }
    return out
  }
}

// ---------------------------------------------------------------------------
// TemplateIndex
// ---------------------------------------------------------------------------

data class IndexedTemplate(
  val id: String,
  val exerciseId: String,
  val kind: String,      // set | rep | negative | prior
  val source: String,    // own | founder | gym_pack
  val features: FeatureVector,
  /** Band-passed accel magnitude at the canonical rate — cached once at load (ledger Q5). */
  val mag: DoubleArray,
)

data class Candidate(val exerciseId: String, val dFused: Double, val dKnn: Double, val dDtw: Double, val templateId: String, val kind: String, val source: String)

data class Match(
  val label: String,
  val confidence: Double,
  val margin: Double,
  val candidates: List<Candidate>,
  val provisional: Boolean,
) {
  fun toJson(): JSONObject {
    val o = JSONObject()
    o.put("label", label); o.put("confidence", confidence); o.put("margin", margin); o.put("provisional", provisional)
    val arr = JSONArray()
    for (c in candidates) arr.put(JSONObject().apply {
      put("exerciseId", c.exerciseId); put("dFused", c.dFused); put("dKnn", c.dKnn); put("dDtw", c.dDtw)
      put("templateId", c.templateId); put("kind", c.kind); put("source", c.source)
    })
    o.put("candidates", arr)
    return o
  }
}

class TemplateIndex(private var p: ModelParams) {
  private val templates = ArrayList<IndexedTemplate>()
  private var ownCounts: Map<String, Int> = emptyMap()

  val size: Int get() = templates.size
  fun setParams(np: ModelParams) { p = np }
  fun setOwnCounts(counts: Map<String, Int>) { ownCounts = counts }

  fun clear() = templates.clear()

  /** Build the cached magnitude for a window [N][C≥3] and add the template. */
  fun add(id: String, exerciseId: String, kind: String, source: String, features: FeatureVector, window: Array<DoubleArray>) {
    val accel = Array(window.size) { i -> DoubleArray(3) { c -> window[i][c] } }
    val mag = Dsp.bandPass(Dsp.magnitudeSeries(accel), p.canonicalRateHz, p.repBandLowHz, p.repBandHighHz)
    templates.removeAll { it.id == id }
    templates.add(IndexedTemplate(id, exerciseId, kind, source, features, mag))
  }

  fun remove(id: String) { templates.removeAll { it.id == id } }

  private fun kindPenalty(t: IndexedTemplate): Double =
    if (t.kind == "prior" || t.source != "own") 1.0 + (ownCounts[t.exerciseId] ?: 0) * p.priorPenaltyPerOwn else 1.0

  /** Two-stage match (design §3.5). [excludeId] implements leave-one-out. */
  fun match(features: FeatureVector, liveMag: DoubleArray?, excludeId: String? = null, provisional: Boolean = false): Match {
    if (templates.isEmpty()) return Match("unknown", 0.0, 0.0, emptyList(), provisional)
    // Stage 1: kNN on features.
    val scored = ArrayList<Pair<IndexedTemplate, Double>>(templates.size)
    for (t in templates) {
      if (t.id == excludeId) continue
      scored.add(t to Dsp.featureDistance(features, t.features, p.featureWeights) * kindPenalty(t))
    }
    if (scored.isEmpty()) return Match("unknown", 0.0, 0.0, emptyList(), provisional)
    scored.sortBy { it.second }
    val k = min(p.topK, scored.size)
    // Stage 2: DTW on the top-k (skipped on provisional/live ticks).
    val cands = ArrayList<Candidate>(k)
    for (i in 0 until k) {
      val (t, dk) = scored[i]
      val dd = if (provisional || liveMag == null) dk else Dsp.normalizedDtw(liveMag, t.mag, p.dtwBand) * kindPenalty(t)
      val fused = if (provisional || liveMag == null) dk else p.wKnn * dk + p.wDtw * dd
      cands.add(Candidate(exerciseLabelOf(t), fused, dk, dd, t.id, t.kind, t.source))
    }
    // Per exercise: best template.
    val best = LinkedHashMap<String, Candidate>()
    for (c in cands.sortedBy { it.dFused }) if (!best.containsKey(c.exerciseId)) best[c.exerciseId] = c
    val ranked = best.values.sortedBy { it.dFused }
    val winner = ranked[0]
    val margin = if (ranked.size > 1) ranked[1].dFused - winner.dFused else Double.POSITIVE_INFINITY
    val conf = Dsp.distanceToConfidence(winner.dFused)
    val label = if (conf < p.tReject) "unknown" else winner.exerciseId
    return Match(label, conf, margin, ranked.take(3), provisional)
  }

  private fun exerciseLabelOf(t: IndexedTemplate) = if (t.kind == "negative") "unknown" else t.exerciseId

  /**
   * Leave-one-out scores for integrity (ledger Q1): for every own set template of the given
   * exercises, its top candidates with itself excluded. Only `set` templates are scored.
   */
  fun scoreAll(exerciseIds: Set<String>): JSONArray {
    val out = JSONArray()
    for (t in templates) {
      // Own set templates (integrity) and own negatives (the T_reject fit, design §4.2).
      if (t.source != "own" || (t.kind != "set" && t.kind != "negative") || (t.kind == "set" && t.exerciseId !in exerciseIds)) continue
      val m = match(t.features, t.mag, excludeId = t.id, provisional = false)
      val o = JSONObject()
      o.put("templateId", t.id); o.put("exerciseId", exerciseLabelOf(t)); o.put("kind", t.kind); o.put("label", m.label)
      o.put("confidence", m.confidence)
      val top = JSONArray()
      for (c in m.candidates) top.put(JSONObject().apply { put("templateId", c.templateId); put("exerciseId", c.exerciseId); put("dFused", c.dFused) })
      o.put("topK", top)
      out.put(o)
    }
    return out
  }
}

// ---------------------------------------------------------------------------
// SetAnalyzer
// ---------------------------------------------------------------------------

object SetAnalyzer {
  data class Result(
    val features: FeatureVector,
    val match: Match,
    val peaks: IntArray,
    val cadenceHz: Double,
    val periodicity: Double,
    val energy: Double,
    val dominantChannel: Int,
  )

  /** Choose the rep channel: fitted dominant axis, else the axis with the most rep-band energy (-1 = magnitude). */
  fun repChannel(accel: Array<DoubleArray>, p: ModelParams, ex: ExerciseParams?): Pair<Int, DoubleArray> {
    val lo = ex?.cadenceLowHz ?: p.repBandLowHz
    val hi = ex?.cadenceHighHz ?: p.repBandHighHz
    val fixed = ex?.dominantChannel
    if (fixed != null) {
      val sig = if (fixed < 0) Dsp.bandPass(Dsp.magnitudeSeries(accel), p.canonicalRateHz, lo, hi)
      else Dsp.bandPass(Dsp.column(accel, fixed), p.canonicalRateHz, lo, hi)
      return fixed to sig
    }
    var bestAxis = 0; var bestE = -1.0; var best: DoubleArray = DoubleArray(0)
    for (a in 0 until 3) {
      val s = Dsp.bandPass(Dsp.column(accel, a), p.canonicalRateHz, lo, hi)
      var e = 0.0; for (v in s) e += v * v
      if (e > bestE) { bestE = e; bestAxis = a; best = s }
    }
    return bestAxis to best
  }

  fun analyze(accel: Array<DoubleArray>, gyro: Array<DoubleArray>?, index: TemplateIndex, p: ModelParams, ex: ExerciseParams?): Result {
    val (ch, sig) = repChannel(accel, p, ex)
    val per = Dsp.autocorrelationPeriodicity(sig, p.canonicalRateHz, ex?.cadenceLowHz ?: p.repBandLowHz, ex?.cadenceHighHz ?: p.repBandHighHz)
    var e = 0.0; for (v in sig) e += v * v
    val energy = if (sig.isEmpty()) 0.0 else e / sig.size
    val peaks = Dsp.detectPeaks(sig, p.canonicalRateHz, ex?.cadenceHighHz ?: p.repBandHighHz, ex?.aMin, p.peakHeightRmsFactor)
    val features = Dsp.extractFeatures(accel, p.canonicalRateHz, gyro)
    val liveMag = Dsp.bandPass(Dsp.magnitudeSeries(accel), p.canonicalRateHz, p.repBandLowHz, p.repBandHighHz)
    val match = index.match(features, liveMag, null, provisional = false)
    return Result(features, match, peaks.peaks, per.cadenceHz, per.score, energy, ch)
  }
}
