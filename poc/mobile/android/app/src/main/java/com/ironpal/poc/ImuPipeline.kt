package com.ironpal.poc

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.HandlerThread
import android.os.Handler

/**
 * Shared, native IMU sampling pipeline (decisions D1/D5/D6).
 *
 * - Subscribes to TYPE_LINEAR_ACCELERATION (gravity-removed baseline) and,
 *   when present, TYPE_GYROSCOPE (optional enhancement — D5).
 * - Buffers a rolling window of raw samples in a ring buffer. Raw samples
 *   NEVER leave this process via the RN bridge — only [ImuModule]/[SignalModule]
 *   read this buffer to compute results (D6).
 * - Tracks the native sample rate (for D4 metadata) and resamples windows to
 *   the canonical rate before matching/feature extraction.
 *
 * A single shared singleton is used by both ImuModule (lifecycle + metadata)
 * and SignalModule (DSP), so there is exactly one sampling subscription.
 */
object ImuPipeline : SensorEventListener {

  // ~12 s window at 100 Hz upper bound; the matcher uses the last few seconds.
  private const val CAPACITY = 1200

  private val lock = Any()

  private var sensorManager: SensorManager? = null
  private var accelSensor: Sensor? = null
  private var gyroSensor: Sensor? = null

  private var handlerThread: HandlerThread? = null
  private var handler: Handler? = null

  // Ring buffers for accel (3) + gyro (3). Latest gyro is held and stamped onto
  // each accel sample so the two channels stay aligned per row.
  private val accel = Array(CAPACITY) { DoubleArray(3) }
  private val gyro = Array(CAPACITY) { DoubleArray(3) }
  private val timestampsNs = LongArray(CAPACITY)
  private var head = 0
  private var count = 0

  private var lastGyro = DoubleArray(3)

  @Volatile var hasGyro: Boolean = false
    private set

  @Volatile var nativeRateHz: Double = 0.0
    private set

  @Volatile var running: Boolean = false
    private set

  private var startCount = 0

  fun init(context: Context) {
    synchronized(lock) {
      if (sensorManager == null) {
        sensorManager = context.applicationContext
          .getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
        gyroSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
        hasGyro = gyroSensor != null
      }
    }
  }

  fun start() {
    synchronized(lock) {
      startCount++
      if (running) return
      val sm = sensorManager ?: return
      handlerThread = HandlerThread("ImuPipeline").also { it.start() }
      handler = Handler(handlerThread!!.looper)
      // SENSOR_DELAY_GAME ≈ 50 Hz (design §4.1 / spec §4.1).
      accelSensor?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME, handler) }
      gyroSensor?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME, handler) }
      head = 0
      count = 0
      running = true
    }
  }

  fun stop() {
    synchronized(lock) {
      if (!running) return
      startCount = (startCount - 1).coerceAtLeast(0)
      if (startCount > 0) return // another consumer still needs sampling
      sensorManager?.unregisterListener(this)
      handlerThread?.quitSafely()
      handlerThread = null
      handler = null
      running = false
    }
  }

  override fun onSensorChanged(event: SensorEvent) {
    when (event.sensor.type) {
      Sensor.TYPE_GYROSCOPE -> {
        lastGyro = doubleArrayOf(
          event.values[0].toDouble(),
          event.values[1].toDouble(),
          event.values[2].toDouble(),
        )
      }
      Sensor.TYPE_LINEAR_ACCELERATION -> synchronized(lock) {
        val i = head
        accel[i][0] = event.values[0].toDouble()
        accel[i][1] = event.values[1].toDouble()
        accel[i][2] = event.values[2].toDouble()
        gyro[i][0] = lastGyro[0]
        gyro[i][1] = lastGyro[1]
        gyro[i][2] = lastGyro[2]
        timestampsNs[i] = event.timestamp
        head = (head + 1) % CAPACITY
        if (count < CAPACITY) count++
        updateRate()
      }
    }
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

  private fun updateRate() {
    if (count < 2) return
    val newest = timestampsNs[(head - 1 + CAPACITY) % CAPACITY]
    val window = minOf(count, 50)
    val oldest = timestampsNs[(head - window + CAPACITY) % CAPACITY]
    val dtSec = (newest - oldest) / 1e9
    if (dtSec > 0) nativeRateHz = (window - 1) / dtSec
  }

  /**
   * Snapshot the last [seconds] of samples in chronological order.
   * Returns accel [N][3] resampled to the canonical rate, plus gyro [N][3]
   * (resampled) when [hasGyro], else null.
   */
  data class Window(
    val accel: Array<DoubleArray>,
    val gyro: Array<DoubleArray>?,
    val nativeRateHz: Double,
  )

  fun snapshot(seconds: Double): Window {
    synchronized(lock) {
      if (count < 4 || nativeRateHz <= 0) {
        return Window(emptyArray(), if (hasGyro) emptyArray() else null, nativeRateHz)
      }
      val want = minOf(count, (seconds * nativeRateHz).toInt().coerceAtLeast(4))
      val accelWin = Array(want) { DoubleArray(3) }
      val gyroWin = if (hasGyro) Array(want) { DoubleArray(3) } else null
      for (k in 0 until want) {
        val idx = (head - want + k + CAPACITY) % CAPACITY
        accelWin[k] = accel[idx].copyOf()
        gyroWin?.set(k, gyro[idx].copyOf())
      }
      val rAccel = Dsp.resample(accelWin, nativeRateHz)
      val rGyro = gyroWin?.let { Dsp.resample(it, nativeRateHz) }
      return Window(rAccel, rGyro, nativeRateHz)
    }
  }
}
