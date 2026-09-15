package com.twentydeka.ironpal

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
    val pk = Dsp.detectPeaks(signal, rateHz, cadenceHigh, ex?.aMin, p.peakHeightRmsFactor, p.peakMinAbs)
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
    val peaks = Dsp.detectPeaks(sig, p.canonicalRateHz, ex?.cadenceHighHz ?: p.repBandHighHz, ex?.aMin, p.peakHeightRmsFactor, p.peakMinAbs)
    val features = Dsp.extractFeatures(accel, p.canonicalRateHz, gyro)
    val liveMag = Dsp.bandPass(Dsp.magnitudeSeries(accel), p.canonicalRateHz, p.repBandLowHz, p.repBandHighHz)
    val match = index.match(features, liveMag, null, provisional = false)
    return Result(features, match, peaks.peaks, per.cadenceHz, per.score, energy, ch)
  }
}

// ---------------------------------------------------------------------------
// RangeAnalysis — offline analysis of an arbitrary host-time range (studio design §10.2)
// ---------------------------------------------------------------------------

/**
 * Pure, JVM-testable. A [ImuPipeline.Window] plus its start time `t0Ns` (host time of sample 0:
 * `endNs − (N−1)/rate`) is replayed through the SAME GateMachine / RepClock the live tick loop
 * runs, so what the Studio shows is what the engine would have done — nothing is re-derived
 * with different rules. Windows are expected already rotated into the head frame.
 */
object RangeAnalysis {
  data class Tick(val tNs: Long, val energy: Double, val periodicity: Double, val gateState: String, val provisionalLabel: String?, val confidence: Double)
  data class Span(val openNs: Long, val closeNs: Long, val cycles: Int, val periodicity: Double)
  data class Simulation(val ticks: List<Tick>, val reps: List<RepClock.Rep>, val spans: List<Span>)

  private fun sampleTimeNs(t0Ns: Long, i: Int, rate: Double): Long = t0Ns + (i / rate * 1e9).toLong()

  /**
   * Replay the tick loop over [win]. The gate is armed at the start and re-armed after every
   * CLOSED so a whole session can be scanned in one pass; `rearm=false` stops after the first
   * close (a single set). Mirrors SignalModule.tick: cadence EMA, clock only while the gate is
   * ACTIVE/CLOSING, provisional match only while ACTIVE.
   */
  fun simulate(win: ImuPipeline.Window, p: ModelParams, ex: ExerciseParams?, t0Ns: Long, index: TemplateIndex? = null, rearm: Boolean = true): Simulation {
    val rate = p.canonicalRateHz
    val accel = win.accel
    val n = accel.size
    val windowN = (p.windowSec * rate).toInt()
    val tickN = (p.tickMs / 1000.0 * rate).toInt().coerceAtLeast(1)
    val ticks = ArrayList<Tick>()
    val reps = ArrayList<RepClock.Rep>()
    val spans = ArrayList<Span>()
    if (n < 8) return Simulation(ticks, reps, spans)
    val gate = GateMachine(p); gate.arm()
    val clock = RepClock(p, ex); clock.reset(t0Ns)
    var lastCadenceHz = ex?.let { e -> ((e.cadenceLowHz ?: p.repBandLowHz) + (e.cadenceHighHz ?: p.repBandHighHz)) / 2 } ?: 0.8
    var openNs = 0L
    var perAccum = 0.0; var perCount = 0
    var end = min(windowN, n)
    var closedOnce = false
    while (end <= n) {
      val start = max(0, end - windowN)
      val slice = Array(end - start) { k -> accel[start + k] }
      val gSlice = win.gyro?.takeIf { it.size >= end }?.let { g -> Array(end - start) { k -> g[start + k] } }
      val (_, sig) = SetAnalyzer.repChannel(slice, p, ex)
      val per = Dsp.autocorrelationPeriodicity(sig, rate, ex?.cadenceLowHz ?: p.repBandLowHz, ex?.cadenceHighHz ?: p.repBandHighHz)
      var e = 0.0; for (v in sig) e += v * v
      val energy = if (sig.isEmpty()) 0.0 else e / sig.size
      if (per.score > 0.2 && per.cadenceHz > 0) lastCadenceHz = 0.7 * lastCadenceHz + 0.3 * per.cadenceHz
      val nowNs = sampleTimeNs(t0Ns, end - 1, rate)
      if (gate.state == GateMachine.State.ACTIVE || gate.state == GateMachine.State.CLOSING) {
        reps.addAll(clock.update(sig, rate, nowNs, lastCadenceHz, nowNs))
      }
      val tr = gate.tick(energy, per.score, lastCadenceHz, clock.lastPeakNs, nowNs)
      if (tr != null) {
        if (tr.to == GateMachine.State.ACTIVE && tr.from == GateMachine.State.ARMING) { openNs = tr.atNs; perAccum = 0.0; perCount = 0 }
        if (tr.to == GateMachine.State.CLOSED) {
          val closeNs = tr.atNs
          val cycles = reps.count { it.tPeakNs >= openNs - (0.5e9 / max(0.2, lastCadenceHz)).toLong() && it.tPeakNs <= closeNs }
          spans.add(Span(openNs, closeNs, cycles, if (perCount > 0) perAccum / perCount else 0.0))
          closedOnce = true
          if (rearm) { gate.arm(); clock.reset(closeNs) } 
        }
      }
      if (gate.state == GateMachine.State.ACTIVE) { perAccum += per.score; perCount++ }
      var label: String? = null; var conf = 0.0
      if (index != null && gate.state == GateMachine.State.ACTIVE) {
        val f = Dsp.extractFeatures(slice, rate, gSlice)
        val m = index.match(f, null, null, provisional = true)
        label = m.label; conf = m.confidence
      }
      ticks.add(Tick(nowNs, energy, per.score, gate.state.name, label, conf))
      if (!rearm && closedOnce) break
      if (end == n) break
      end = min(n, end + tickN)
    }
    // A set still open at the end of the range closes there.
    if (gate.state == GateMachine.State.ACTIVE || gate.state == GateMachine.State.CLOSING) {
      val closeNs = sampleTimeNs(t0Ns, n - 1, rate)
      val cycles = reps.count { it.tPeakNs >= openNs && it.tPeakNs <= closeNs }
      spans.add(Span(openNs, closeNs, cycles, if (perCount > 0) perAccum / perCount else 0.0))
    }
    return Simulation(ticks, reps, spans)
  }

  /** The `RangeExplanation` JSON (src/types/model.ts). */
  fun explain(win: ImuPipeline.Window, p: ModelParams, ex: ExerciseParams?, t0Ns: Long, index: TemplateIndex? = null): JSONObject {
    val rate = p.canonicalRateHz
    val sim = simulate(win, p, ex, t0Ns, index, rearm = true)
    val out = JSONObject()
    val ticks = JSONArray()
    for (t in sim.ticks) ticks.put(JSONObject().apply {
      put("tNs", t.tNs); put("energy", t.energy); put("periodicity", t.periodicity); put("gateState", t.gateState)
      put("provisionalLabel", t.provisionalLabel ?: JSONObject.NULL); put("confidence", t.confidence)
    })
    out.put("ticks", ticks)
    val peaks = JSONArray(); val rejected = JSONArray()
    val n = win.accel.size
    if (n >= 8) {
      val (_, sig) = SetAnalyzer.repChannel(win.accel, p, ex)
      val det = Dsp.detectPeaksDetailed(sig, rate, ex?.cadenceHighHz ?: p.repBandHighHz, ex?.aMin, p.peakHeightRmsFactor, p.peakMinAbs)
      val sConfSec = p.sConfMsMax / 1000.0
      for (i in det.peaks) {
        val ageSec = (n - 1 - i) / rate
        if (ageSec < sConfSec) rejected.put(JSONObject().apply { put("tNs", sampleTimeNs(t0Ns, i, rate)); put("amplitude", sig[i]); put("reason", "unconfirmed") })
        else peaks.put(JSONObject().apply { put("tNs", sampleTimeNs(t0Ns, i, rate)); put("amplitude", sig[i]) })
      }
      for (r in det.rejected) rejected.put(JSONObject().apply { put("tNs", sampleTimeNs(t0Ns, r.index, rate)); put("amplitude", r.amplitude); put("reason", r.reason) })
      out.put("trace", traceJson(sig, t0Ns, rate))
    } else {
      out.put("trace", JSONObject().apply { put("t0Ns", t0Ns); put("t1Ns", t0Ns); put("values", JSONArray()) })
    }
    out.put("peaks", peaks); out.put("rejected", rejected)
    out.put("gaps", JSONArray()); out.put("saturated", JSONArray())
    return out
  }

  /** Downsample to ≤ [maxPoints] keeping the extreme value per bucket so peaks survive. */
  fun traceJson(sig: DoubleArray, t0Ns: Long, rate: Double, maxPoints: Int = 2000): JSONObject {
    val n = sig.size
    val per = max(1, Math.ceil(n.toDouble() / maxPoints).toInt())
    val vals = JSONArray()
    var i = 0
    while (i < n) {
      var best = sig[i]
      var k = i
      while (k < min(n, i + per)) { if (abs(sig[k]) > abs(best)) best = sig[k]; k++ }
      vals.put(best)
      i += per
    }
    return JSONObject().apply { put("t0Ns", t0Ns); put("t1Ns", sampleTimeNs(t0Ns, max(0, n - 1), rate)); put("values", vals) }
  }

  /** Periodic spans ≥ 3 cycles across the whole window (the Reel's "?" candidates). */
  fun scanRegions(win: ImuPipeline.Window, p: ModelParams, t0Ns: Long): JSONArray {
    val sim = simulate(win, p, null, t0Ns, null, rearm = true)
    val out = JSONArray()
    for (s in sim.spans) if (s.cycles >= 3) out.put(JSONObject().apply {
      put("t0Ns", s.openNs); put("t1Ns", s.closeNs); put("cycles", s.cycles); put("periodicity", s.periodicity)
    })
    return out
  }

  /** Host time of the local maximum of the rep channel within ±[windowMs] of [tNs]; [tNs] when empty. */
  fun peakNear(win: ImuPipeline.Window, p: ModelParams, ex: ExerciseParams?, tNs: Long, windowMs: Double, t0Ns: Long): Long {
    val n = win.accel.size
    if (n < 8) return tNs
    val rate = p.canonicalRateHz
    val (_, sig) = SetAnalyzer.repChannel(win.accel, p, ex)
    val halfNs = (windowMs * 1e6).toLong()
    var best = -1; var bestV = Double.NEGATIVE_INFINITY
    for (i in 0 until n) {
      val t = sampleTimeNs(t0Ns, i, rate)
      if (t < tNs - halfNs || t > tNs + halfNs) continue
      if (sig[i] > bestV) { bestV = sig[i]; best = i }
    }
    return if (best < 0) tNs else sampleTimeNs(t0Ns, best, rate)
  }

  /** The `IntegrityPreview` JSON: what adding this set would do (studio design §7.7). */
  fun previewIntegrity(index: TemplateIndex, exerciseId: String, features: FeatureVector, accel: Array<DoubleArray>, p: ModelParams, campaign: Set<String>): JSONObject {
    val liveMag = if (accel.size >= 8) Dsp.bandPass(Dsp.magnitudeSeries(accel), p.canonicalRateHz, p.repBandLowHz, p.repBandHighHz) else null
    val m = index.match(features, liveMag, null, provisional = false)
    val winner = m.candidates.firstOrNull()
    val selfHit = winner != null && winner.exerciseId == exerciseId && m.label != "unknown"
    val selfConfidence = if (selfHit) m.confidence else 0.0
    val other = m.candidates.firstOrNull { it.exerciseId != exerciseId && (campaign.isEmpty() || it.exerciseId in campaign || it.exerciseId == "unknown") }
    val rows = index.scoreAll(setOf(exerciseId))
    var n = 0; var hits = 0
    for (i in 0 until rows.length()) {
      val r = rows.getJSONObject(i)
      if (r.optString("kind") != "set" || r.optString("exerciseId") != exerciseId) continue
      n++
      if (r.optString("label") == exerciseId) hits++
    }
    val out = JSONObject()
    out.put("integrityIfAdded", if (n == 0) JSONObject.NULL else (hits + (if (selfHit) 1 else 0)).toDouble() / (n + 1))
    out.put("nearestOther", if (other == null) JSONObject.NULL else JSONObject().apply { put("exerciseId", other.exerciseId); put("dFused", other.dFused) })
    out.put("selfConfidence", selfConfidence)
    return out
  }
}
