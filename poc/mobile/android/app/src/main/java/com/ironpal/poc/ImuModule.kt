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

  @ReactMethod
  fun start(promise: Promise) {
    try {
      ImuPipeline.start()
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
