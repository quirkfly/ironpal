package com.ironpal.poc

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
 * Custom Kotlin `SignalModule` (decisions D1/D6). Runs the DSP pipeline over
 * the shared [ImuPipeline] window buffer on a background executor — off the JS
 * thread — and emits only RESULTS to JS.
 *
 *  - Live mode: every ~400 ms, snapshot the window, gate on motion/periodicity
 *    (Q4), count reps (peak detection), match the shape vs. cached templates
 *    (kNN + normalized-DTW — Q6/D7), and emit {exercise, reps, confidence}.
 *  - Enroll mode: record a take and, on finish, return the extracted feature
 *    vector + resampled raw window (both representations — D7).
 */
class SignalModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "SignalModule"

  // Window length for the matcher/rep counter (mirrors ANALYSIS_WINDOW_SEC).
  private val windowSec = 4.0
  // Motion-gate thresholds (Q4): require both energy and periodicity.
  private val gatePeriodicity = 0.3
  private val gateEnergy = 0.02

  // Reject threshold mirrors src/config T_REJECT.
  private val rejectThreshold = 0.45

  private var templates: List<Template> = emptyList()

  private val executor: ScheduledExecutorService =
    Executors.newSingleThreadScheduledExecutor()
  private var liveTask: ScheduledFuture<*>? = null

  @Volatile private var lastRepping = false

  // Enrollment accumulation: we snapshot a long window at finish.
  @Volatile private var enrolling = false

  init {
    ImuPipeline.init(reactContext)
  }

  @ReactMethod
  fun setTemplates(templatesJson: String, promise: Promise) {
    try {
      templates = Template.listFromJson(templatesJson)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("SIGNAL_TEMPLATES_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun startLive(promise: Promise) {
    try {
      ImuPipeline.start()
      liveTask?.cancel(false)
      liveTask = executor.scheduleWithFixedDelay(
        { runLiveTick() },
        300, 400, TimeUnit.MILLISECONDS,
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("SIGNAL_START_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun stopLive(promise: Promise) {
    try {
      liveTask?.cancel(false)
      liveTask = null
      ImuPipeline.stop()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("SIGNAL_STOP_ERROR", e.message, e)
    }
  }

  private fun runLiveTick() {
    try {
      val win = ImuPipeline.snapshot(windowSec)
      if (win.accel.size < 8) return

      val dominant = dominantBandPassed(win)
      val periodicity = Dsp.autocorrelationPeriodicity(dominant)
      val energy = meanSquare(dominant)
      val isRepping = periodicity.score >= gatePeriodicity && energy >= gateEnergy

      val peaks = Dsp.detectPeaks(dominant)

      val match: Dsp.MatcherOutput
      if (!isRepping) {
        match = Dsp.MatcherOutput("unknown", periodicity.score, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY)
      } else {
        val features = Dsp.extractFeatures(win.accel, Dsp.CANONICAL_RATE_HZ, win.gyro)
        match = Dsp.matchAgainstTemplates(features, win.accel, templates, rejectThreshold)
      }

      val reps = if (isRepping && match.exercise != "unknown") peaks.reps else 0

      emitResult(match.exercise, reps, match.confidence, isRepping, match.knnDistance, match.dtwDistance)

      if (isRepping != lastRepping) {
        lastRepping = isRepping
        emitMotionGate(isRepping, energy, periodicity.score)
      }
    } catch (_: Exception) {
      // Never let a tick crash the scheduler.
    }
  }

  private fun dominantBandPassed(win: ImuPipeline.Window): DoubleArray {
    val ax = Dsp.bandPass(Dsp.column(win.accel, 0))
    val ay = Dsp.bandPass(Dsp.column(win.accel, 1))
    val az = Dsp.bandPass(Dsp.column(win.accel, 2))
    val ex = sumSquares(ax)
    val ey = sumSquares(ay)
    val ez = sumSquares(az)
    return when {
      ex >= ey && ex >= ez -> ax
      ey >= ex && ey >= ez -> ay
      else -> az
    }
  }

  private fun sumSquares(x: DoubleArray): Double {
    var s = 0.0
    for (v in x) s += v * v
    return s
  }

  private fun meanSquare(x: DoubleArray): Double =
    if (x.isEmpty()) 0.0 else sumSquares(x) / x.size

  // -------------------------------------------------------------------------
  // Enrollment
  // -------------------------------------------------------------------------
  @ReactMethod
  fun startEnroll(exerciseLabel: String, promise: Promise) {
    try {
      ImuPipeline.start()
      enrolling = true
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("SIGNAL_ENROLL_START_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun finishEnroll(promise: Promise) {
    try {
      // Grab a long window covering the whole take (cap at the buffer length).
      val win = ImuPipeline.snapshot(20.0)
      enrolling = false
      ImuPipeline.stop()

      if (win.accel.size < 8) {
        promise.reject("SIGNAL_ENROLL_EMPTY", "Not enough samples recorded.")
        return
      }

      val features = Dsp.extractFeatures(win.accel, Dsp.CANONICAL_RATE_HZ, win.gyro)

      // Build the resampled raw window (accel + gyro channels when present, D7).
      val series = JSONArray()
      for (i in win.accel.indices) {
        val row = JSONArray()
        row.put(win.accel[i][0]); row.put(win.accel[i][1]); row.put(win.accel[i][2])
        win.gyro?.let { g ->
          if (i < g.size) {
            row.put(g[i][0]); row.put(g[i][1]); row.put(g[i][2])
          }
        }
        series.put(row)
      }

      val out = JSONObject()
      out.put("featureVector", features.toJson())
      out.put("imuSeriesResampled", series)
      out.put("sampleRateHz", Dsp.CANONICAL_RATE_HZ.toInt())
      promise.resolve(out.toString())
    } catch (e: Exception) {
      promise.reject("SIGNAL_ENROLL_FINISH_ERROR", e.message, e)
    }
  }

  // -------------------------------------------------------------------------
  // Event emission (results only — D6)
  // -------------------------------------------------------------------------
  private fun emitResult(
    exercise: String,
    reps: Int,
    confidence: Double,
    isRepping: Boolean,
    knnDistance: Double,
    dtwDistance: Double,
  ) {
    val payload = Arguments.createMap()
    payload.putString("exercise", exercise)
    payload.putInt("reps", reps)
    payload.putDouble("confidence", confidence)
    payload.putBoolean("isRepping", isRepping)
    payload.putDouble("knnDistance", if (knnDistance.isInfinite()) -1.0 else knnDistance)
    payload.putDouble("dtwDistance", if (dtwDistance.isInfinite()) -1.0 else dtwDistance)
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("SignalResult", payload)
  }

  private fun emitMotionGate(repping: Boolean, energy: Double, periodicity: Double) {
    val payload = Arguments.createMap()
    payload.putBoolean("repping", repping)
    payload.putDouble("energy", energy)
    payload.putDouble("periodicity", periodicity)
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("ImuMotionGate", payload)
  }

  @ReactMethod
  fun addListener(eventName: String) {}

  @ReactMethod
  fun removeListeners(count: Int) {}
}
