package com.ironpal.poc

import android.os.SystemClock
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledExecutorService
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

/**
 * The RN bridge for [SignalEngine] (design §9). Results only cross the bridge (D6):
 * events `GateEvent`, `RepEvent`, `MatchEvent`, `LinkEvent`; one `SetResult` per set.
 *
 * Legacy POC methods (`setTemplates`, `startLive`, `stopLive`, `startEnroll`, `finishEnroll`)
 * are kept so the founder's prior-pack authoring screen and the POC live HUD still work
 * (design §13.4); they run on the same engine.
 */
class SignalModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "SignalModule"

  @Volatile private var params: ModelParams = ModelParams.DEFAULT
  @Volatile private var rHead: Rotation = Rotation.IDENTITY
  private val index = TemplateIndex(params)

  private val executor: ScheduledExecutorService = Executors.newSingleThreadScheduledExecutor()
  private var tickTask: ScheduledFuture<*>? = null

  // Session / set state.
  @Volatile private var sessionId: String? = null
  @Volatile private var setId: String? = null
  @Volatile private var exerciseHint: String? = null
  private var gate = GateMachine(params)
  private var clock = RepClock(params, null)
  private var lastCadenceHz = 1.0
  private var setStartNs = 0L
  // Negative harvesting: non-periodic 4 s windows, ≤ negativesPerSession, sampled ≥ 30 s apart.
  private val negatives = ArrayList<Array<DoubleArray>>()
  private var lastNegativeNs = 0L
  // Legacy live-mode flag.
  @Volatile private var legacyLive = false
  @Volatile private var lastRepping = false
  @Volatile private var enrolling = false

  init { ImuPipeline.init(reactContext) }

  // ---------------------------------------------------------------- configure / templates

  @ReactMethod
  fun configure(paramsJson: String, rHeadJson: String?, promise: Promise) {
    try {
      params = ModelParams.fromJson(paramsJson)
      index.setParams(params)
      rHead = if (rHeadJson.isNullOrBlank()) Rotation.IDENTITY else Rotation.fromJson(JSONArray(rHeadJson))
      gate = GateMachine(params)
      promise.resolve(null)
    } catch (e: Exception) { promise.reject("SIGNAL_CONFIGURE", e.message, e) }
  }

  /**
   * Load templates: `[{id, exerciseId, kind, source, features, windowF16, channels}]`, `mode`
   * = "replace" | "delta". Also accepts `ownCounts: {exerciseId: n}` in a wrapper object.
   */
  @ReactMethod
  fun loadTemplates(json: String, mode: String, promise: Promise) {
    try {
      val root = JSONObject(json)
      val arr = root.getJSONArray("templates")
      if (mode == "replace") index.clear()
      var bytes = 0L
      for (i in 0 until arr.length()) {
        val o = arr.getJSONObject(i)
        if (o.optBoolean("remove", false)) { index.remove(o.getString("id")); continue }
        val b64 = o.getString("windowF16"); bytes += b64.length
        val window = F16.decode(b64, o.optInt("channels", 6))
        index.add(o.getString("id"), o.getString("exerciseId"), o.optString("kind", "set"), o.optString("source", "own"),
          FeatureVector.fromJson(o.getJSONObject("features")), window)
      }
      root.optJSONObject("ownCounts")?.let { oc ->
        val m = HashMap<String, Int>(); for (k in oc.keys()) m[k] = oc.getInt(k); index.setOwnCounts(m)
      }
      val out = Arguments.createMap(); out.putInt("count", index.size); out.putDouble("bytes", bytes.toDouble())
      promise.resolve(out)
    } catch (e: Exception) { promise.reject("SIGNAL_LOAD_TEMPLATES", e.message, e) }
  }

  // ---------------------------------------------------------------- session

  @ReactMethod
  fun startSession(id: String, promise: Promise) {
    try {
      ImuPipeline.start()
      sessionId = id; negatives.clear(); lastNegativeNs = 0L
      tickTask?.cancel(false)
      tickTask = executor.scheduleWithFixedDelay({ tick() }, 300, params.tickMs, TimeUnit.MILLISECONDS)
      promise.resolve(null)
    } catch (e: Exception) { promise.reject("SIGNAL_SESSION_START", e.message, e) }
  }

  @ReactMethod
  fun stopSession(promise: Promise) {
    try {
      tickTask?.cancel(false); tickTask = null
      ImuPipeline.stop()
      val out = Arguments.createMap()
      out.putString("sessionId", sessionId)
      out.putDouble("seqGaps", BleImuSource.seqGaps.toDouble())
      out.putDouble("saturated", BleImuSource.saturated.toDouble())
      out.putInt("negativesHarvested", negatives.size)
      sessionId = null; setId = null
      promise.resolve(out)
    } catch (e: Exception) { promise.reject("SIGNAL_SESSION_STOP", e.message, e) }
  }

  /**
   * Calibration step over the last ~1.5 s (holds) or ~3 s (nods). `hold_0` is the worn-upright
   * hold. Resolves the raw measurement; JS calls `computeCalibration` once all steps are in.
   */
  @ReactMethod
  fun runCalibration(step: String, promise: Promise) {
    try {
      val win = ImuPipeline.snapshot(if (step == "nods") 3.0 else 1.5)
      if (win.accel.size < 8) { promise.reject("SIGNAL_CALIBRATION_EMPTY", "not enough samples"); return }
      val out = JSONObject(); out.put("step", step); out.put("samples", win.accel.size)
      if (step == "nods") {
        val g = win.gyro
        val e = DoubleArray(3)
        if (g != null && g.isNotEmpty()) for (c in 0 until 3) {
          val s = Dsp.bandPass(Dsp.column(g, c), params.canonicalRateHz, 1.0, 3.0)
          var acc = 0.0; for (v in s) acc += v * v; e[c] = acc
        } else for (c in 0 until 3) {
          // No gyro: fall back to accel jerk energy per axis in the nod band.
          val s = Dsp.bandPass(Dsp.column(win.accel, c), params.canonicalRateHz, 1.0, 3.0)
          var acc = 0.0; for (v in s) acc += v * v; e[c] = acc
        }
        out.put("nodGyroEnergy", JSONArray(e.toList()))
      } else {
        val mean = DoubleArray(3)
        for (r in win.accel) for (c in 0 until 3) mean[c] += r[c]
        for (c in 0 until 3) mean[c] /= win.accel.size
        // The pipeline is gravity-removed; the hold's residual mean is the tilt signal. The JS
        // side adds the nominal −g along the device's resting axis to form the worn-gravity vector.
        out.put("meanAccel", JSONArray(mean.toList()))
      }
      promise.resolve(out.toString())
    } catch (e: Exception) { promise.reject("SIGNAL_CALIBRATION", e.message, e) }
  }

  @ReactMethod
  fun computeCalibration(wornGravityJson: String, nodEnergyJson: String, promise: Promise) {
    try {
      val g = JSONArray(wornGravityJson).let { a -> DoubleArray(3) { a.getDouble(it) } }
      val n = JSONArray(nodEnergyJson).let { a -> DoubleArray(3) { a.getDouble(it) } }
      val cal = Canonicalizer.fromRitual(g, n)
      val prev = rHead
      rHead = cal.rotation
      val out = JSONObject()
      out.put("rotation", cal.rotation.toJson()); out.put("residualDeg", cal.residualDeg)
      out.put("nodAxisDominance", cal.nodAxisDominance); out.put("angleToPreviousDeg", prev.angleTo(cal.rotation))
      promise.resolve(out.toString())
    } catch (e: Exception) { promise.reject("SIGNAL_CALIBRATION_COMPUTE", e.message, e) }
  }

  // ---------------------------------------------------------------- set

  @ReactMethod
  fun startSet(id: String, hint: String?, promise: Promise) {
    try {
      setId = id; exerciseHint = hint?.takeIf { it.isNotBlank() }
      gate = GateMachine(params); gate.arm()
      clock = RepClock(params, params.exercise(exerciseHint))
      setStartNs = SystemClock.elapsedRealtimeNanos()
      clock.reset(setStartNs)
      lastCadenceHz = params.exercise(exerciseHint)?.let { e -> ((e.cadenceLowHz ?: params.repBandLowHz) + (e.cadenceHighHz ?: params.repBandHighHz)) / 2 } ?: 0.8
      promise.resolve(null)
    } catch (e: Exception) { promise.reject("SIGNAL_SET_START", e.message, e) }
  }

  /** Finish the set: slice the window, run the full analysis, return the SetResult (design §2.2). */
  @ReactMethod
  fun endSet(id: String, promise: Promise) {
    executor.execute {
      try {
        val nowNs = SystemClock.elapsedRealtimeNanos()
        val openNs = if (gate.openNs > 0) gate.openNs else setStartNs
        val closeNs = if (gate.closeNs > 0) gate.closeNs else nowNs
        val rollNs = 10_000_000_000L
        val fromNs = maxOf(setStartNs, openNs - rollNs)
        val toNs = minOf(nowNs, closeNs + rollNs)
        val seconds = (nowNs - fromNs) / 1e9
        val win = ImuPipeline.snapshot(seconds.coerceAtLeast(4.0))
        val rate = params.canonicalRateHz
        // Trim to [fromNs, toNs] using the window's end timestamp.
        val n = win.accel.size
        fun idxAt(t: Long): Int = (n - 1 - ((win.endNs - t) / 1e9 * rate)).toInt().coerceIn(0, maxOf(0, n - 1))
        val i0 = idxAt(fromNs); val i1 = idxAt(toNs)
        val accelRaw = Array(maxOf(0, i1 - i0 + 1)) { k -> win.accel[i0 + k] }
        val gyroRaw = win.gyro?.let { g -> Array(accelRaw.size) { k -> g[i0 + k] } }
        val accel = rHead.apply(accelRaw)
        val gyro = gyroRaw?.let { rHead.apply(it) }
        val ex = params.exercise(exerciseHint)
        val res = if (accel.size >= 8) SetAnalyzer.analyze(accel, gyro, index, params, ex) else null

        val out = JSONObject()
        out.put("setId", id); out.put("sessionId", sessionId)
        out.put("tStartNs", fromNs); out.put("tEndNs", toNs); out.put("tOpenNs", openNs); out.put("tCloseNs", closeNs)
        out.put("gateState", gate.state.name)
        out.put("rateHz", rate); out.put("samples", accel.size)
        // Combined [N][6] window (gyro zeros when absent) as float16 base64 — the store's format.
        val combined = Array(accel.size) { k -> DoubleArray(6) { c -> if (c < 3) accel[k][c] else (gyro?.getOrNull(k)?.getOrNull(c - 3) ?: 0.0) } }
        out.put("windowF16", F16.encode(combined)); out.put("channels", 6)
        out.put("hasGyro", gyro != null)
        // Confirmed reps from the streaming clock, relative to the window start.
        val reps = JSONArray()
        for (r in clock.all) reps.put(JSONObject().apply {
          put("n", r.n); put("tPeakSec", (r.tPeakNs - fromNs) / 1e9); put("amplitude", r.amplitude); put("tConfirmedSec", (r.tConfirmedNs - fromNs) / 1e9)
        })
        out.put("reps", reps); out.put("repsDetected", clock.count)
        if (res != null) {
          out.put("features", res.features.toJson())
          out.put("match", res.match.toJson())
          out.put("peaksZeroPhase", JSONArray(res.peaks.map { it / rate }))
          out.put("cadenceHz", res.cadenceHz); out.put("periodicity", res.periodicity); out.put("energy", res.energy)
          out.put("dominantChannel", res.dominantChannel)
        }
        out.put("seqGaps", BleImuSource.seqGaps); out.put("saturated", BleImuSource.saturated)
        setId = null
        promise.resolve(out.toString())
      } catch (e: Exception) { promise.reject("SIGNAL_SET_END", e.message, e) }
    }
  }

  /** Non-periodic windows collected this session (design §4.1), as [{windowF16, channels}]. Clears the ring. */
  @ReactMethod
  fun harvestNegatives(promise: Promise) {
    try {
      val arr = JSONArray()
      synchronized(negatives) {
        for (w in negatives) arr.put(JSONObject().apply { put("windowF16", F16.encode(w)); put("channels", 6) })
        negatives.clear()
      }
      promise.resolve(arr.toString())
    } catch (e: Exception) { promise.reject("SIGNAL_NEGATIVES", e.message, e) }
  }

  @ReactMethod
  fun scoreAll(exerciseIdsJson: String, promise: Promise) {
    executor.execute {
      try {
        val a = JSONArray(exerciseIdsJson); val ids = HashSet<String>(); for (i in 0 until a.length()) ids.add(a.getString(i))
        promise.resolve(index.scoreAll(ids).toString())
      } catch (e: Exception) { promise.reject("SIGNAL_SCORE_ALL", e.message, e) }
    }
  }

  @ReactMethod
  fun benchmark(promise: Promise) {
    executor.execute {
      try {
        val n = (params.windowSec * params.canonicalRateHz).toInt()
        val w = Array(n) { i -> DoubleArray(3) { c -> Math.sin(2 * Math.PI * 0.8 * i / params.canonicalRateHz + c) } }
        val t0 = System.nanoTime()
        val f = Dsp.extractFeatures(w, params.canonicalRateHz, null)
        val mag = Dsp.bandPass(Dsp.magnitudeSeries(w), params.canonicalRateHz, params.repBandLowHz, params.repBandHighHz)
        index.match(f, null, null, provisional = true)
        val t1 = System.nanoTime()
        index.match(f, mag, null, provisional = false)
        val t2 = System.nanoTime()
        val rt = Runtime.getRuntime()
        val out = Arguments.createMap()
        out.putDouble("tickMs", (t1 - t0) / 1e6); out.putDouble("matchMs", (t2 - t1) / 1e6)
        out.putInt("templates", index.size); out.putDouble("memMb", (rt.totalMemory() - rt.freeMemory()) / 1e6)
        promise.resolve(out)
      } catch (e: Exception) { promise.reject("SIGNAL_BENCHMARK", e.message, e) }
    }
  }

  // ---------------------------------------------------------------- the tick

  private fun tick() {
    try {
      val win = ImuPipeline.snapshot(params.windowSec)
      if (win.accel.size < 8) return
      val nowNs = SystemClock.elapsedRealtimeNanos()
      val accel = rHead.apply(win.accel)
      val ex = params.exercise(exerciseHint)
      val (_, sig) = SetAnalyzer.repChannel(accel, params, ex)
      val per = Dsp.autocorrelationPeriodicity(sig, params.canonicalRateHz, ex?.cadenceLowHz ?: params.repBandLowHz, ex?.cadenceHighHz ?: params.repBandHighHz)
      var e = 0.0; for (v in sig) e += v * v
      val energy = if (sig.isEmpty()) 0.0 else e / sig.size
      if (per.score > 0.2 && per.cadenceHz > 0) lastCadenceHz = 0.7 * lastCadenceHz + 0.3 * per.cadenceHz

      val inSet = setId != null
      if (inSet) {
        // Rep clock runs only once the gate is open (ARMING ticks would count setup motion).
        if (gate.state == GateMachine.State.ACTIVE || gate.state == GateMachine.State.CLOSING) {
          for (r in clock.update(sig, params.canonicalRateHz, win.endNs, lastCadenceHz, nowNs)) emitRep(r)
        }
        gate.tick(energy, per.score, lastCadenceHz, clock.lastPeakNs, nowNs)?.let { emitGate(it, energy, per.score) }
        if (gate.state == GateMachine.State.ACTIVE) {
          val f = Dsp.extractFeatures(accel, params.canonicalRateHz, win.gyro?.let { rHead.apply(it) })
          val m = index.match(f, null, null, provisional = true)
          emitMatch(m)
        }
      } else {
        // Between sets: harvest non-periodic windows as negatives, ≥ 30 s apart.
        if (per.score < params.gatePOff && energy < params.gateEOn * 4 && nowNs - lastNegativeNs > 30_000_000_000L) {
          synchronized(negatives) {
            if (negatives.size < params.negativesPerSession) {
              val g = win.gyro
              negatives.add(Array(accel.size) { k -> DoubleArray(6) { c -> if (c < 3) accel[k][c] else (g?.getOrNull(k)?.getOrNull(c - 3) ?: 0.0) } })
              lastNegativeNs = nowNs
            }
          }
        }
      }

      if (legacyLive) legacyTick(win, accel, sig, per.score, energy)
      if (ImuPipeline.source == ImuPipeline.Source.BLE) emitLink()
    } catch (_: Exception) {
      // Never let a tick crash the scheduler.
    }
  }

  // ---------------------------------------------------------------- legacy POC surface

  @ReactMethod
  fun setTemplates(templatesJson: String, promise: Promise) {
    try {
      // POC templates (founder library) become priors in the index.
      index.clear()
      for (t in Template.listFromJson(templatesJson)) index.add(t.id, t.exerciseLabel, "prior", "founder", t.featureVector, t.imuSeriesResampled)
      promise.resolve(null)
    } catch (e: Exception) { promise.reject("SIGNAL_TEMPLATES_ERROR", e.message, e) }
  }

  @ReactMethod
  fun startLive(promise: Promise) {
    try {
      ImuPipeline.start(); legacyLive = true
      if (tickTask == null) tickTask = executor.scheduleWithFixedDelay({ tick() }, 300, params.tickMs, TimeUnit.MILLISECONDS)
      promise.resolve(null)
    } catch (e: Exception) { promise.reject("SIGNAL_START_ERROR", e.message, e) }
  }

  @ReactMethod
  fun stopLive(promise: Promise) {
    try {
      legacyLive = false
      if (sessionId == null) { tickTask?.cancel(false); tickTask = null; ImuPipeline.stop() }
      promise.resolve(null)
    } catch (e: Exception) { promise.reject("SIGNAL_STOP_ERROR", e.message, e) }
  }

  private fun legacyTick(win: ImuPipeline.Window, accel: Array<DoubleArray>, sig: DoubleArray, periodicity: Double, energy: Double) {
    val isRepping = periodicity >= 0.3 && energy >= 0.02
    val peaks = Dsp.detectPeaks(sig, params.canonicalRateHz)
    val m = if (!isRepping) null else index.match(Dsp.extractFeatures(accel, params.canonicalRateHz, win.gyro), Dsp.bandPass(Dsp.magnitudeSeries(accel), params.canonicalRateHz, params.repBandLowHz, params.repBandHighHz))
    val payload = Arguments.createMap()
    payload.putString("exercise", m?.label ?: "unknown")
    payload.putInt("reps", if (m != null && m.label != "unknown") peaks.reps else 0)
    payload.putDouble("confidence", m?.confidence ?: periodicity)
    payload.putBoolean("isRepping", isRepping)
    payload.putDouble("knnDistance", m?.candidates?.firstOrNull()?.dKnn ?: -1.0)
    payload.putDouble("dtwDistance", m?.candidates?.firstOrNull()?.dDtw ?: -1.0)
    emit("SignalResult", payload)
    if (isRepping != lastRepping) {
      lastRepping = isRepping
      val g = Arguments.createMap(); g.putBoolean("repping", isRepping); g.putDouble("energy", energy); g.putDouble("periodicity", periodicity)
      emit("ImuMotionGate", g)
    }
  }

  @ReactMethod
  fun startEnroll(exerciseLabel: String, promise: Promise) {
    try { ImuPipeline.start(); enrolling = true; promise.resolve(null) } catch (e: Exception) { promise.reject("SIGNAL_ENROLL_START_ERROR", e.message, e) }
  }

  @ReactMethod
  fun finishEnroll(promise: Promise) {
    try {
      val win = ImuPipeline.snapshot(20.0)
      enrolling = false
      if (sessionId == null) ImuPipeline.stop()
      if (win.accel.size < 8) { promise.reject("SIGNAL_ENROLL_EMPTY", "Not enough samples recorded."); return }
      val features = Dsp.extractFeatures(win.accel, params.canonicalRateHz, win.gyro)
      val series = JSONArray()
      for (i in win.accel.indices) {
        val row = JSONArray(); row.put(win.accel[i][0]); row.put(win.accel[i][1]); row.put(win.accel[i][2])
        win.gyro?.let { g -> if (i < g.size) { row.put(g[i][0]); row.put(g[i][1]); row.put(g[i][2]) } }
        series.put(row)
      }
      val out = JSONObject(); out.put("featureVector", features.toJson()); out.put("imuSeriesResampled", series); out.put("sampleRateHz", params.canonicalRateHz.toInt())
      promise.resolve(out.toString())
    } catch (e: Exception) { promise.reject("SIGNAL_ENROLL_FINISH_ERROR", e.message, e) }
  }

  // ---------------------------------------------------------------- events

  private fun emit(name: String, payload: com.facebook.react.bridge.WritableMap) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(name, payload)
  }

  private fun emitRep(r: RepClock.Rep) {
    val m = Arguments.createMap()
    m.putString("setId", setId); m.putInt("n", r.n); m.putDouble("tPeakNs", r.tPeakNs.toDouble())
    m.putDouble("amplitude", r.amplitude); m.putDouble("latencyMs", (r.tConfirmedNs - r.tPeakNs) / 1e6)
    emit("RepEvent", m)
  }

  private fun emitGate(t: GateMachine.Transition, energy: Double, periodicity: Double) {
    val m = Arguments.createMap()
    m.putString("setId", setId); m.putString("from", t.from.name); m.putString("to", t.to.name)
    m.putDouble("atNs", t.atNs.toDouble()); m.putDouble("energy", energy); m.putDouble("periodicity", periodicity)
    emit("GateEvent", m)
  }

  private fun emitMatch(match: Match) {
    val m = Arguments.createMap()
    m.putString("setId", setId); m.putString("label", match.label); m.putDouble("confidence", match.confidence)
    m.putBoolean("provisional", true)
    emit("MatchEvent", m)
  }

  private fun emitLink() {
    val m = Arguments.createMap()
    m.putBoolean("connected", BleImuSource.connected); m.putInt("mtu", BleImuSource.negotiatedMtu)
    m.putDouble("seqGaps", BleImuSource.seqGaps.toDouble()); m.putDouble("saturated", BleImuSource.saturated.toDouble())
    emit("LinkEvent", m)
  }

  @ReactMethod fun addListener(eventName: String) {}
  @ReactMethod fun removeListeners(count: Int) {}
}
