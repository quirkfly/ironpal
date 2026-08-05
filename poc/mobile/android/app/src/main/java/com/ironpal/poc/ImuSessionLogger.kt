package com.ironpal.poc

import android.content.Context
import android.os.SystemClock
import android.util.Log
import org.json.JSONObject
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter

/**
 * Writes the raw headband IMU stream to `imu.jsonl` + `meta.json` for
 * post-hoc alignment against the ELP camera's video (sync plan §3).
 *
 * This is deliberately SEPARATE from [ImuPipeline]'s ring buffer. The ring
 * buffer is the live DSP view — resampled, gravity-subtracted, overwritten
 * every ~20 s. The log is the archival record, and alignment quality depends on
 * it being raw and lossless: `seq`, `device_ts_us` and the measured `dt_us`
 * exactly as they came off the wire.
 *
 * ## One line per PACKET, not per sample
 * The host clock is only genuinely known once per notification. Stamping every
 * sample with a host time would fabricate precision that does not exist —
 * within a packet, the device's own `dt_us` is the only real timing evidence.
 * So each line carries the packet header plus its sample block, and the
 * expansion to per-sample rows happens offline in `scripts/kb/sync_imu_video.py`
 * where the interpolation is explicit and auditable.
 *
 * ## Both clocks, on every line
 * - `device_ts_us` — the board's `micros()`, already unwrapped past the 71.6 min
 *   uint32 rollover by [BleImuSource].
 * - `host_ns` — `SystemClock.elapsedRealtimeNanos()`, which unlike
 *   `System.currentTimeMillis()` is monotonic and keeps counting in deep sleep,
 *   so an NTP correction mid-session cannot shear the timeline.
 *
 * Cross-correlating the two is what bounds clock drift; keeping only one would
 * make drift invisible rather than absent.
 */
object ImuSessionLogger {

  private const val TAG = "ImuSessionLogger"
  private const val FLUSH_EVERY_PACKETS = 30   // ~4 s at 7.5 packets/s

  private val lock = Any()
  private var writer: BufferedWriter? = null
  private var dir: File? = null
  private var sinceFlush = 0
  private var startedHostNs = 0L
  private var lines = 0L

  @Volatile var active: Boolean = false
    private set

  /** Absolute path of the session directory, or null when not logging. */
  val sessionDir: String? get() = dir?.absolutePath

  /**
   * Begin a session. Returns the directory holding `imu.jsonl`/`meta.json`.
   * Lives under getExternalFilesDir so `adb pull` works without root.
   */
  fun start(context: Context, sessionId: String): String {
    synchronized(lock) {
      stopLocked()
      val base = File(context.getExternalFilesDir(null), "sessions/$sessionId")
      base.mkdirs()
      dir = base
      writer = BufferedWriter(FileWriter(File(base, "imu.jsonl"), false))
      startedHostNs = SystemClock.elapsedRealtimeNanos()
      sinceFlush = 0
      lines = 0
      active = true
      Log.i(TAG, "logging to ${base.absolutePath}")
      return base.absolutePath
    }
  }

  /**
   * Append one packet exactly as received. [samples] is the flat interleaved
   * block of n*6 int16 values, kept in RAW LSB rather than scaled units — the
   * scales are in meta.json, so the log stays a faithful record of the wire and
   * a future scale correction can be reapplied without re-collecting a session.
   */
  fun logPacket(
    seq: Int,
    deviceTsUs: Long,
    n: Int,
    dtUs: Int,
    samples: IntArray,
    hostNs: Long,
  ) {
    synchronized(lock) {
      val w = writer ?: return
      val o = JSONObject()
      o.put("seq", seq)
      o.put("device_ts_us", deviceTsUs)
      o.put("host_ns", hostNs)
      o.put("n", n)
      o.put("dt_us", dtUs)
      val arr = StringBuilder(samples.size * 5)
      arr.append('[')
      for (i in samples.indices) {
        if (i > 0) arr.append(',')
        arr.append(samples[i])
      }
      arr.append(']')
      // Assembled by hand so the sample block stays compact ints on one line.
      w.write(o.toString().dropLast(1))
      w.write(",\"s\":")
      w.write(arr.toString())
      w.write("}\n")
      lines++
      if (++sinceFlush >= FLUSH_EVERY_PACKETS) {
        w.flush()
        sinceFlush = 0
        // Rewrite meta each flush: a session killed by battery or a full disk
        // still leaves usable metadata instead of an unreadable orphan log.
        writeMetaLocked(partial = true)
      }
    }
  }

  /** Finish the session and write the final `meta.json`. */
  fun stop() {
    synchronized(lock) {
      if (!active) return
      writeMetaLocked(partial = false)
      stopLocked()
    }
  }

  private fun stopLocked() {
    try { writer?.flush(); writer?.close() } catch (e: Exception) {
      Log.e(TAG, "close failed: ${e.message}")
    }
    writer = null
    active = false
  }

  private fun writeMetaLocked(partial: Boolean) {
    val d = dir ?: return
    try {
      val m = JSONObject()
      m.put("schema", "ironpal.imu/1")
      m.put("partial", partial)
      m.put("source", ImuPipeline.source.name)
      m.put("packets_logged", lines)

      // Clocks. host_ns is elapsedRealtimeNanos, which is NOT wall time -- the
      // wall-clock anchor below is what maps a session onto the video file.
      val clocks = JSONObject()
      clocks.put("host_clock", "SystemClock.elapsedRealtimeNanos")
      clocks.put("device_clock", "micros() unwrapped past uint32 rollover")
      clocks.put("started_host_ns", startedHostNs)
      clocks.put("started_wall_ms", System.currentTimeMillis())
      m.put("clocks", clocks)

      val dev = JSONObject()
      dev.put("name", BleImuSource.DEVICE_NAME)
      dev.put("firmware", BleImuSource.firmware)
      dev.put("nominal_odr_hz", BleImuSource.deviceOdrHz)
      dev.put("accel_scale_g_per_lsb", BleImuSource.accelScaleGPerLsb)
      dev.put("gyro_scale_dps_per_lsb", BleImuSource.gyroScaleDpsPerLsb)
      dev.put("accel_fsr_g", BleImuSource.accelFsrG)
      dev.put("gyro_fsr_dps", BleImuSource.gyroFsrDps)
      dev.put("sample_order", "ax,ay,az,gx,gy,gz")
      dev.put("sample_units", "raw int16 LSB — multiply by the scales above")
      m.put("device", dev)

      // Link health. seq_gaps > 0 means the timeline has holes, so ingest should
      // invalidate rather than interpolate across them.
      val link = JSONObject()
      link.put("mtu", BleImuSource.negotiatedMtu)
      link.put("packets", BleImuSource.packets)
      link.put("samples", BleImuSource.samples)
      link.put("seq_gaps", BleImuSource.seqGaps)
      link.put("saturated_values", BleImuSource.saturated)
      BleImuSource.lastError?.let { link.put("last_error", it) }
      m.put("link", link)

      File(d, "meta.json").writeText(m.toString(2))
    } catch (e: Exception) {
      Log.e(TAG, "meta write failed: ${e.message}")
    }
  }
}
