package com.twentydeka.ironpal

import java.io.BufferedOutputStream
import java.io.DataInputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * The session sample log (studio design §10.1 — "recorder-based slicing").
 *
 * [ImuPipeline]'s ring buffer is the live DSP view: ~2 min, overwritten. Anything that needs an
 * arbitrary host-time range of the session — the Studio's regions, split/merge, relabel of a past
 * set, imported sessions — needs the WHOLE session, sliceable by `elapsedRealtimeNanos`. That is
 * this log: one row per sample in the pipeline's SI units (linear accel m/s², gyro rad/s), fed
 * from every source (phone, BLE, replay) by [ImuPipeline], held in memory and appended to
 * `samples.bin` so a session can be reopened after the app restarts.
 *
 * `samples.bin` layout (little-endian): 16-byte header — magic "IPSR", u8 version, u8 hasGyro,
 * 10 reserved — then 32 bytes per sample: i64 tsNs, 6 × f32 (ax ay az gx gy gz).
 *
 * [SampleLog] is pure Kotlin (no Android imports) so slicing is JVM-testable; [SessionRecorder]
 * holds two slots — `live` (recording) and `loaded` (a past session opened read-only) — so
 * opening an old session in the Studio never clobbers a session being recorded.
 */
class SampleLog(val sessionId: String, private val dir: File?, val hasGyro: Boolean) {
  companion object {
    const val FILE_NAME = "samples.bin"
    private const val MAGIC = 0x52535049 // "IPSR" little-endian
    private const val VERSION = 1
    private const val HEADER = 16
    private const val ROW = 32
    private const val FLUSH_EVERY_NS = 2_000_000_000L

    /** Read a log back from `dir/samples.bin`; null when absent or unreadable. */
    fun load(sessionId: String, dir: File): SampleLog? {
      val f = File(dir, FILE_NAME)
      if (!f.exists() || f.length() < HEADER) return null
      DataInputStream(FileInputStream(f).buffered()).use { ins ->
        val head = ByteArray(HEADER); ins.readFully(head)
        val hb = ByteBuffer.wrap(head).order(ByteOrder.LITTLE_ENDIAN)
        if (hb.int != MAGIC) return null
        val version = hb.get().toInt(); if (version != VERSION) return null
        val hasGyro = hb.get().toInt() != 0
        val log = SampleLog(sessionId, null, hasGyro)
        val n = ((f.length() - HEADER) / ROW).toInt()
        log.ensure(n)
        val buf = ByteArray(ROW * 256)
        val bb = ByteBuffer.wrap(buf).order(ByteOrder.LITTLE_ENDIAN)
        var remaining = n
        while (remaining > 0) {
          val rows = minOf(256, remaining)
          ins.readFully(buf, 0, rows * ROW)
          bb.rewind()
          for (r in 0 until rows) {
            val i = log.count
            log.ts[i] = bb.long
            val base = i * 6
            for (c in 0 until 6) log.data[base + c] = bb.float
            log.count++
          }
          remaining -= rows
        }
        log.loaded = true
        return log
      }
    }
  }

  private var ts = LongArray(4096)
  private var data = FloatArray(4096 * 6)
  var count = 0
    private set
  var loaded = false
    private set
  private var out: BufferedOutputStream? = null
  private var writtenCount = 0
  private var lastFlushNs = 0L
  private val lock = Any()

  val t0Ns: Long get() = synchronized(lock) { if (count == 0) 0L else ts[0] }
  val t1Ns: Long get() = synchronized(lock) { if (count == 0) 0L else ts[count - 1] }

  /** Measured rate over the whole log (samples per second), 0 when < 2 samples. */
  val rateHz: Double
    get() = synchronized(lock) {
      if (count < 2) 0.0 else (count - 1) / ((ts[count - 1] - ts[0]) / 1e9)
    }

  private fun ensure(n: Int) {
    if (n <= ts.size) return
    var cap = ts.size
    while (cap < n) cap *= 2
    ts = ts.copyOf(cap)
    data = data.copyOf(cap * 6)
  }

  /** Open `samples.bin` for appending (truncating) and write the header. No-op without a dir. */
  fun openForWrite() {
    val d = dir ?: return
    d.mkdirs()
    val fos = FileOutputStream(File(d, FILE_NAME), false)
    val head = ByteBuffer.allocate(HEADER).order(ByteOrder.LITTLE_ENDIAN)
    head.putInt(MAGIC); head.put(VERSION.toByte()); head.put(if (hasGyro) 1 else 0)
    fos.write(head.array())
    out = BufferedOutputStream(fos, 64 * 1024)
    writtenCount = 0
  }

  fun append(ax: Double, ay: Double, az: Double, gx: Double, gy: Double, gz: Double, tsNs: Long) {
    synchronized(lock) {
      ensure(count + 1)
      val i = count
      ts[i] = tsNs
      val b = i * 6
      data[b] = ax.toFloat(); data[b + 1] = ay.toFloat(); data[b + 2] = az.toFloat()
      data[b + 3] = gx.toFloat(); data[b + 4] = gy.toFloat(); data[b + 5] = gz.toFloat()
      count++
      if (out != null && tsNs - lastFlushNs > FLUSH_EVERY_NS) { flushLocked(); lastFlushNs = tsNs }
    }
  }

  private fun flushLocked() {
    val o = out ?: return
    if (writtenCount >= count) return
    val rows = count - writtenCount
    val bb = ByteBuffer.allocate(rows * ROW).order(ByteOrder.LITTLE_ENDIAN)
    for (i in writtenCount until count) {
      bb.putLong(ts[i])
      val b = i * 6
      for (c in 0 until 6) bb.putFloat(data[b + c])
    }
    o.write(bb.array())
    o.flush()
    writtenCount = count
  }

  fun flush() = synchronized(lock) { flushLocked() }

  fun close() {
    synchronized(lock) {
      try { flushLocked(); out?.close() } catch (_: Exception) {}
      out = null
    }
  }

  /** First index with ts ≥ t (binary search). */
  private fun lowerBound(t: Long): Int {
    var lo = 0; var hi = count
    while (lo < hi) { val mid = (lo + hi) ushr 1; if (ts[mid] < t) lo = mid + 1 else hi = mid }
    return lo
  }

  /** Raw samples in [t0Ns, t1Ns]: timestamps + [N][6] SI values. */
  fun raw(t0Ns: Long, t1Ns: Long): Pair<LongArray, Array<DoubleArray>> {
    synchronized(lock) {
      val a = lowerBound(t0Ns)
      var b = lowerBound(t1Ns)
      if (b < count && ts[b] == t1Ns) b++
      val n = (b - a).coerceAtLeast(0)
      val outTs = LongArray(n) { ts[a + it] }
      val rows = Array(n) { k -> val base = (a + k) * 6; DoubleArray(6) { c -> data[base + c].toDouble() } }
      return outTs to rows
    }
  }

  /**
   * Chronological samples in [t0Ns, t1Ns] resampled to [canonicalRateHz], with the same Window
   * semantics as [ImuPipeline.snapshot]: `endNs` is the last raw sample's timestamp and sample i
   * sits at `endNs − (N−1−i)/rate`. Gyro is null when the source had none, so feature
   * extraction behaves exactly as on the live path.
   */
  fun slice(t0Ns: Long, t1Ns: Long, canonicalRateHz: Double = Dsp.CANONICAL_RATE_HZ): ImuPipeline.Window {
    val (rts, rows) = raw(t0Ns, t1Ns)
    if (rows.size < 4) return ImuPipeline.Window(emptyArray(), if (hasGyro) emptyArray() else null, 0.0, if (rts.isEmpty()) 0L else rts.last())
    val nativeRate = (rows.size - 1) / ((rts.last() - rts.first()) / 1e9)
    if (nativeRate <= 0 || nativeRate.isNaN() || nativeRate.isInfinite()) return ImuPipeline.Window(emptyArray(), if (hasGyro) emptyArray() else null, 0.0, rts.last())
    val accel = Array(rows.size) { i -> DoubleArray(3) { c -> rows[i][c] } }
    val gyro = if (hasGyro) Array(rows.size) { i -> DoubleArray(3) { c -> rows[i][3 + c] } } else null
    return ImuPipeline.Window(
      Dsp.resample(accel, nativeRate, canonicalRateHz),
      gyro?.let { Dsp.resample(it, nativeRate, canonicalRateHz) },
      nativeRate,
      rts.last(),
    )
  }

  /** The whole log as one Window (for region scanning). */
  fun all(canonicalRateHz: Double = Dsp.CANONICAL_RATE_HZ): ImuPipeline.Window =
    if (count == 0) ImuPipeline.Window(emptyArray(), if (hasGyro) emptyArray() else null, 0.0, 0L) else slice(t0Ns, t1Ns, canonicalRateHz)

  /** Does the log hold samples that reach back to [t0Ns]? (false = fall back to the ring buffer) */
  fun covers(t0Ns: Long): Boolean = synchronized(lock) { count > 0 && ts[0] <= t0Ns }
}

object SessionRecorder {
  data class Info(val samples: Int, val t0Ns: Long, val t1Ns: Long, val rateHz: Double, val loaded: Boolean, val hasGyro: Boolean)

  @Volatile private var live: SampleLog? = null
  @Volatile private var loaded: SampleLog? = null

  val active: Boolean get() = live != null
  val liveSessionId: String? get() = live?.sessionId

  fun sessionDir(context: android.content.Context, sessionId: String): File =
    File(context.getExternalFilesDir(null), "sessions/$sessionId")

  /** Start recording [sessionId] into [dir]; replaces any live log. */
  fun start(dir: File, sessionId: String, hasGyro: Boolean) {
    stop()
    val log = SampleLog(sessionId, dir, hasGyro)
    try { log.openForWrite() } catch (_: Exception) { /* memory-only when the disk refuses */ }
    live = log
  }

  fun start(context: android.content.Context, sessionId: String) =
    start(sessionDir(context, sessionId), sessionId, ImuPipeline.hasGyro)

  fun stop() {
    live?.close()
    // The finished session stays in memory as the "loaded" slot so the Studio can open it
    // immediately after the session ends without a disk round trip.
    live?.let { loaded = it }
    live = null
  }

  /** Called by ImuPipeline for every sample of every source. Cheap when not recording. */
  fun append(ax: Double, ay: Double, az: Double, gx: Double, gy: Double, gz: Double, tsNs: Long) {
    live?.append(ax, ay, az, gx, gy, gz, tsNs)
  }

  /** Open a past session read-only from its directory. */
  fun load(dir: File, sessionId: String): Boolean {
    live?.let { if (it.sessionId == sessionId) return true }
    loaded?.let { if (it.sessionId == sessionId) return true }
    val log = SampleLog.load(sessionId, dir) ?: return false
    loaded = log
    return true
  }

  fun load(context: android.content.Context, sessionId: String): Boolean = load(sessionDir(context, sessionId), sessionId)

  /** The log for [sessionId] if it is live or already loaded. */
  fun get(sessionId: String): SampleLog? {
    live?.let { if (it.sessionId == sessionId) return it }
    loaded?.let { if (it.sessionId == sessionId) return it }
    return null
  }

  fun info(sessionId: String): Info {
    val log = get(sessionId) ?: return Info(0, 0L, 0L, 0.0, false, false)
    return Info(log.count, log.t0Ns, log.t1Ns, log.rateHz, true, log.hasGyro)
  }

  fun slice(sessionId: String, t0Ns: Long, t1Ns: Long, canonicalRateHz: Double = Dsp.CANONICAL_RATE_HZ): ImuPipeline.Window? =
    get(sessionId)?.slice(t0Ns, t1Ns, canonicalRateHz)
}
