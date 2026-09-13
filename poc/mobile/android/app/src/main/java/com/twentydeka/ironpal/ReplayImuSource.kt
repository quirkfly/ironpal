package com.twentydeka.ironpal

import android.os.SystemClock
import android.util.Log
import org.json.JSONObject
import java.io.File
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.roundToLong

/**
 * Deterministic IMU source: replays a recorded `imu.jsonl` into [ImuPipeline] (design §11).
 *
 * Why this exists. The model is driven by the IMU, so an end-to-end test that relies on live
 * sensors can assert nothing: the rep count depends on how the phone was waved. Replaying a
 * recorded session makes the whole loop — gate, rep clock, matcher, labeling round, level
 * transitions — reproducible, which is what lets the Maestro flows assert exact numbers.
 *
 * It is a TEST/DEV path, never a product one. It is reachable only through
 * `ImuModule.setSource("REPLAY")`, which the app itself never calls.
 *
 * ## Fidelity
 * The file format is exactly what [ImuSessionLogger] writes (raw int16 LSB per packet), and the
 * conversion here mirrors [BleImuSource] line for line — the same scale factors, the same g→m/s²,
 * dps→rad/s, and the same slow-EMA gravity subtraction. A replayed session therefore reaches the
 * DSP as the live rig's samples did, rather than as something merely similar.
 *
 * ## Timing
 * Samples are re-based onto the CURRENT clock: the engine slices set windows against
 * `elapsedRealtimeNanos`, so replaying the original timestamps (hours or months old) would put
 * every sample outside every window. Spacing comes from the recording's own measured `dt_us`, so
 * cadence — the thing the band-pass filter and rep clock actually key on — is preserved.
 *
 * Playback is REAL TIME by design. Speeding it up would shift the rep cadence out of the
 * 0.2–1.5 Hz band and the gate would never open, so short fixtures are the right lever for short
 * tests, not a speed multiplier.
 */
object ReplayImuSource {

  private const val TAG = "ReplayImuSource"
  private const val AXES = 6
  private const val G_TO_MS2 = 9.80665
  private const val DEG_TO_RAD = Math.PI / 180.0
  /** Same corner as the BLE path: ~0.1 Hz, an octave below the rep band. */
  private const val GRAVITY_ALPHA = 0.002

  private val running = AtomicBoolean(false)
  private var thread: Thread? = null

  @Volatile var file: String? = null
    private set
  @Volatile var loop: Boolean = false
  @Volatile var packetsPlayed: Int = 0
    private set
  @Volatile var samplesPlayed: Int = 0
    private set
  @Volatile var finished: Boolean = false
    private set
  @Volatile var lastError: String? = null
    private set

  /** Scales from the recording's `meta.json` when present, else the firmware defaults. */
  @Volatile private var accelScaleGPerLsb = 0.001
  @Volatile private var gyroScaleDpsPerLsb = 0.0625

  fun configure(path: String, loopPlayback: Boolean) {
    file = path
    loop = loopPlayback
    lastError = null
    val meta = File(File(path).parentFile, "meta.json")
    if (meta.exists()) {
      try {
        val dev = JSONObject(meta.readText()).optJSONObject("device")
        dev?.let {
          accelScaleGPerLsb = it.optDouble("accel_scale_g_per_lsb", accelScaleGPerLsb)
          gyroScaleDpsPerLsb = it.optDouble("gyro_scale_dps_per_lsb", gyroScaleDpsPerLsb)
        }
      } catch (e: Exception) {
        Log.w(TAG, "meta.json unreadable, using firmware defaults: ${e.message}")
      }
    }
  }

  fun start() {
    val path = file
    if (path == null) { lastError = "no replay file configured"; return }
    val f = File(path)
    if (!f.exists()) { lastError = "replay file not found: $path"; return }
    if (!running.compareAndSet(false, true)) return

    packetsPlayed = 0; samplesPlayed = 0; finished = false
    thread = Thread({ play(f) }, "ImuReplay").also { it.isDaemon = true; it.start() }
  }

  fun stop() {
    running.set(false)
    thread?.interrupt()
    thread = null
  }

  private fun play(f: File) {
    try {
      do {
        val gravity = DoubleArray(3)
        var gravityInit = false
        var prevTsUs = -1L
        var wrapOffsetUs = 0L
        var baseWallNs = 0L          // elapsedRealtime at the first replayed sample
        var firstDeviceUs = -1L

        f.forEachLine { line ->
          if (!running.get()) return@forEachLine
          if (line.isBlank()) return@forEachLine
          val o = try { JSONObject(line) } catch (e: Exception) { return@forEachLine }
          val n = o.optInt("n", 0)
          val dtUs = o.optInt("dt_us", 16667)
          val s = o.optJSONArray("s") ?: return@forEachLine
          if (n <= 0 || s.length() < n * AXES) return@forEachLine

          var tsUs = o.optLong("device_ts_us", 0L)
          // The logger already unwraps the uint32 rollover, but a hand-made fixture may not.
          if (prevTsUs >= 0 && tsUs < prevTsUs) wrapOffsetUs += 0x1_0000_0000L
          prevTsUs = tsUs
          tsUs += wrapOffsetUs
          if (firstDeviceUs < 0) { firstDeviceUs = tsUs; baseWallNs = SystemClock.elapsedRealtimeNanos() }

          for (i in 0 until n) {
            if (!running.get()) return@forEachLine
            val o6 = i * AXES
            val ax = s.getInt(o6) * accelScaleGPerLsb * G_TO_MS2
            val ay = s.getInt(o6 + 1) * accelScaleGPerLsb * G_TO_MS2
            val az = s.getInt(o6 + 2) * accelScaleGPerLsb * G_TO_MS2
            if (!gravityInit) { gravity[0] = ax; gravity[1] = ay; gravity[2] = az; gravityInit = true }
            gravity[0] += GRAVITY_ALPHA * (ax - gravity[0])
            gravity[1] += GRAVITY_ALPHA * (ay - gravity[1])
            gravity[2] += GRAVITY_ALPHA * (az - gravity[2])

            // Re-base the recorded timeline onto now, keeping the recording's own spacing.
            val offsetUs = (tsUs - firstDeviceUs) + i.toLong() * dtUs
            val tsNs = baseWallNs + offsetUs * 1000L

            // Real-time playback: wait until this sample is actually due.
            val dueIn = tsNs - SystemClock.elapsedRealtimeNanos()
            if (dueIn > 500_000L) {
              try { Thread.sleep(dueIn / 1_000_000L, (dueIn % 1_000_000L).toInt()) }
              catch (e: InterruptedException) { running.set(false); return@forEachLine }
            }

            ImuPipeline.pushExternalSample(
              ax - gravity[0], ay - gravity[1], az - gravity[2],
              s.getInt(o6 + 3) * gyroScaleDpsPerLsb * DEG_TO_RAD,
              s.getInt(o6 + 4) * gyroScaleDpsPerLsb * DEG_TO_RAD,
              s.getInt(o6 + 5) * gyroScaleDpsPerLsb * DEG_TO_RAD,
              tsNs,
            )
            samplesPlayed++
          }
          packetsPlayed++
        }
      } while (running.get() && loop)
      finished = true
      Log.i(TAG, "replay done: $packetsPlayed packets / $samplesPlayed samples")
    } catch (e: Exception) {
      lastError = e.message
      Log.e(TAG, "replay failed", e)
    } finally {
      running.set(false)
    }
  }

  /** Round-trip helper for fixtures generated on the host: LSB from SI. */
  fun gToLsb(g: Double): Int = (g / 0.001).roundToLong().toInt()
}
