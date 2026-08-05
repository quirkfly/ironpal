package com.ironpal.poc

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorManager
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * Custom Kotlin `ImuModule` (decisions D5/D6).
 *
 * Owns the IMU lifecycle and reports device capability/metadata (D4/D5). It
 * does NOT stream samples to JS — the raw stream lives in [ImuPipeline] and is
 * consumed by [SignalModule]. The only event surfaced here is a coarse,
 * human-paced motion-gate transition (Q4).
 */
class ImuModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ImuModule"

  init {
    ImuPipeline.init(reactContext)
  }

  @ReactMethod
  fun getDeviceInfo(promise: Promise) {
    try {
      ImuPipeline.init(reactContext)
      val sm = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
      val accel = sm.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
      val gyro = sm.getDefaultSensor(Sensor.TYPE_GYROSCOPE)

      val sensorInfo = Arguments.createMap()
      sensorInfo.putString("accelerometer", accel?.name ?: "none")
      sensorInfo.putString("gyroscope", gyro?.name ?: "none")
      accel?.let { sensorInfo.putDouble("accelMaxRange", it.maximumRange.toDouble()) }
      gyro?.let { sensorInfo.putDouble("gyroMaxRange", it.maximumRange.toDouble()) }

      val result: WritableMap = Arguments.createMap()
      result.putString("deviceModel", "${Build.MANUFACTURER} ${Build.MODEL}")
      result.putMap("sensorInfo", sensorInfo)
      result.putString("source", ImuPipeline.source.name)

      if (ImuPipeline.source == ImuPipeline.Source.BLE) {
        // Link health, so a bad session is visible while the founder is still
        // in the gym rather than at ingest time. Mirrors ble_validate.py.
        val ble = Arguments.createMap()
        ble.putBoolean("connected", BleImuSource.connected)
        ble.putInt("mtu", BleImuSource.negotiatedMtu)
        ble.putInt("deviceOdrHz", BleImuSource.deviceOdrHz)
        ble.putString("firmware", BleImuSource.firmware)
        ble.putDouble("packets", BleImuSource.packets.toDouble())
        ble.putDouble("samples", BleImuSource.samples.toDouble())
        ble.putDouble("seqGaps", BleImuSource.seqGaps.toDouble())
        ble.putDouble("saturated", BleImuSource.saturated.toDouble())
        ble.putInt("lastDtUs", BleImuSource.lastDtUs)
        BleImuSource.lastError?.let { ble.putString("error", it) }
        result.putMap("ble", ble)
      }
      // Native rate may be 0 until sampling has run; report the measured rate
      // if available, else a nominal SENSOR_DELAY_GAME estimate (~50 Hz).
      val rate = if (ImuPipeline.nativeRateHz > 0) ImuPipeline.nativeRateHz else 50.0
      result.putDouble("sampleRateHz", rate)
      result.putBoolean("hasGyro", gyro != null)
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("IMU_INFO_ERROR", e.message, e)
    }
  }

  /**
   * Select the IMU source: `"PHONE"` (POC v1, default) or `"BLE"` (headband
   * unit, collection rig). Must be called before [start]; switching while
   * sampling is rejected rather than silently splicing two clocks into one
   * buffer.
   */
  @ReactMethod
  fun setSource(source: String, promise: Promise) {
    try {
      ImuPipeline.init(reactContext)
      ImuPipeline.setSource(
        when (source.uppercase()) {
          "BLE" -> ImuPipeline.Source.BLE
          "PHONE" -> ImuPipeline.Source.PHONE
          else -> throw IllegalArgumentException("unknown source: $source")
        }
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("IMU_SOURCE_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun start(promise: Promise) {
    try {
      ImuPipeline.start()
      // Scanning is async, but permission / bluetooth-off failures are known
      // synchronously. Surface them now rather than letting the session look
      // like it started and yield an empty imu.jsonl an hour later.
      if (ImuPipeline.source == ImuPipeline.Source.BLE) {
        BleImuSource.lastError?.let {
          ImuPipeline.stop()
          promise.reject("IMU_BLE_UNAVAILABLE", it)
          return
        }
      }
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("IMU_START_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    try {
      ImuPipeline.stop()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("IMU_STOP_ERROR", e.message, e)
    }
  }

  /**
   * Begin logging the raw headband stream to `imu.jsonl` + `meta.json`, and
   * hold a foreground service so the session survives screen-off.
   * Resolves with the session directory.
   */
  @ReactMethod
  fun startSession(sessionId: String, promise: Promise) {
    try {
      val path = ImuSessionLogger.start(reactContext, sessionId)
      ImuForegroundService.start(reactContext)
      promise.resolve(path)
    } catch (e: Exception) {
      promise.reject("IMU_SESSION_START_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun stopSession(promise: Promise) {
    try {
      ImuSessionLogger.stop()
      ImuForegroundService.stop(reactContext)
      promise.resolve(ImuSessionLogger.sessionDir)
    } catch (e: Exception) {
      promise.reject("IMU_SESSION_STOP_ERROR", e.message, e)
    }
  }

  /**
   * Free space on the volume holding session logs.
   *
   * A blocking pre-session gate (sync plan): the A52 has ~17 GB free, which is
   * roughly 36 min of 4K, so running out mid-session is a live risk rather than
   * a theoretical one. Checking after the fact is worthless — a truncated
   * session cannot be recovered.
   */
  @ReactMethod
  fun getFreeSpace(promise: Promise) {
    try {
      val dir = reactContext.getExternalFilesDir(null)
        ?: throw IllegalStateException("no external files dir")
      val stat = android.os.StatFs(dir.absolutePath)
      val freeBytes = stat.availableBlocksLong * stat.blockSizeLong
      val out = Arguments.createMap()
      out.putDouble("freeBytes", freeBytes.toDouble())
      out.putDouble("freeGb", freeBytes / 1e9)
      // ~470 MB/min measured for this rig's 4K stream; IMU logging is ~1 % of
      // that and is not the constraint.
      out.putDouble("estimatedMinutes", freeBytes / 470e6)
      out.putString("path", dir.absolutePath)
      promise.resolve(out)
    } catch (e: Exception) {
      promise.reject("IMU_FREE_SPACE_ERROR", e.message, e)
    }
  }

  /** Emit a coarse motion-gate transition to JS (Q4). Called by SignalModule. */
  fun emitMotionGate(repping: Boolean, energy: Double, periodicity: Double) {
    val payload = Arguments.createMap()
    payload.putBoolean("repping", repping)
    payload.putDouble("energy", energy)
    payload.putDouble("periodicity", periodicity)
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("ImuMotionGate", payload)
  }

  // Required for NativeEventEmitter on the JS side (no-op listener accounting).
  @ReactMethod
  fun addListener(eventName: String) {}

  @ReactMethod
  fun removeListeners(count: Int) {}
}
