package com.twentydeka.ironpal

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.Presentation
import androidx.media3.effect.ScaleAndRotateTransformation
import androidx.media3.transformer.Composition
import androidx.media3.transformer.DefaultEncoderFactory
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.Effects
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.ProgressHolder
import androidx.media3.transformer.Transformer
import androidx.media3.transformer.VideoEncoderSettings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/**
 * Clip ingest (studio design §8.2–§8.3, §10.2): the PTS table, the scrub proxy and the filmstrip
 * for one clip, plus frame extraction for pins/OCR and the motion-energy series for the nod
 * cross-check. Video never crosses the bridge — only paths, numbers and progress events do.
 *
 * Rotation convention: `rotationDeg` is COUNTER-CLOCKWISE degrees, matching the KB's per-rig table
 * (`frame-extraction.md`: A52 headband = 90 = ffmpeg `transpose=2`, ELP = 180). Crops passed to
 * [extractFrame] are in PRE-rotation master pixels (the frame as the decoder delivers it).
 *
 * `thumbs.json` is `{frameW, frameH, count, stepUs, cols, rows}`: the sprite is a GRID (cols per
 * row) rather than one long strip, because a 200-frame strip would exceed the texture width an
 * image view can draw. Frame k sits at column k % cols, row k / cols.
 */
@OptIn(UnstableApi::class)
class ClipModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ClipModule"

  private val executor = Executors.newSingleThreadExecutor()
  private val transformerThread = HandlerThread("ClipTransformer").also { it.start() }
  private val transformerHandler = Handler(transformerThread.looper)

  private fun clipsRoot(): File = File(reactContext.getExternalFilesDir(null), "clips").also { it.mkdirs() }
  private fun clipDir(clipId: String): File = File(clipsRoot(), clipId).also { it.mkdirs() }

  private fun emitProgress(clipId: String, step: String, progress: Double, error: String? = null) {
    val m = Arguments.createMap()
    m.putString("clipId", clipId); m.putString("step", step); m.putDouble("progress", progress)
    if (error != null) m.putString("error", error)
    try {
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("ClipIngestProgress", m)
    } catch (_: Exception) {}
  }

  // ---------------------------------------------------------------- probe

  private data class Probe(val width: Int, val height: Int, val durationUs: Long, val frames: Int, val rotationDeg: Int, val fpsNominal: Double)

  private fun probeFile(path: String): Probe {
    val r = MediaMetadataRetriever()
    var width = 0; var height = 0; var durationUs = 0L; var rotation = 0; var frames = -1; var fps = 0.0
    try {
      r.setDataSource(path)
      width = r.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull() ?: 0
      height = r.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull() ?: 0
      durationUs = (r.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0L) * 1000L
      rotation = r.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)?.toIntOrNull() ?: 0
      if (Build.VERSION.SDK_INT >= 28) {
        frames = r.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_FRAME_COUNT)?.toIntOrNull() ?: -1
      }
      fps = r.extractMetadata(MediaMetadataRetriever.METADATA_KEY_CAPTURE_FRAMERATE)?.toDoubleOrNull() ?: 0.0
    } finally { try { r.release() } catch (_: Exception) {} }
    if (frames < 0) frames = countVideoSamples(path)
    if (fps <= 0 && durationUs > 0) fps = frames / (durationUs / 1e6)
    return Probe(width, height, durationUs, frames, rotation, fps)
  }

  private fun videoTrack(ex: MediaExtractor): Int {
    for (i in 0 until ex.trackCount) {
      val mime = ex.getTrackFormat(i).getString(MediaFormat.KEY_MIME) ?: continue
      if (mime.startsWith("video/")) return i
    }
    return -1
  }

  private fun countVideoSamples(path: String): Int = readSampleTimes(path).size

  /** Every video sample's presentation time in µs, sorted (B-frames arrive out of order). */
  private fun readSampleTimes(path: String): LongArray {
    val ex = MediaExtractor()
    val times = ArrayList<Long>()
    try {
      ex.setDataSource(path)
      val t = videoTrack(ex)
      if (t < 0) return LongArray(0)
      ex.selectTrack(t)
      while (true) {
        val st = ex.sampleTime
        if (st < 0) break
        times.add(st)
        if (!ex.advance()) break
      }
    } finally { try { ex.release() } catch (_: Exception) {} }
    val arr = times.toLongArray(); arr.sort()
    return arr
  }

  @ReactMethod
  fun probe(path: String, promise: Promise) {
    executor.execute {
      try {
        val p = probeFile(path)
        val out = Arguments.createMap()
        out.putInt("width", p.width); out.putInt("height", p.height); out.putDouble("durationUs", p.durationUs.toDouble())
        out.putInt("frames", p.frames); out.putInt("rotationDeg", p.rotationDeg); out.putDouble("fpsNominal", p.fpsNominal)
        promise.resolve(out)
      } catch (e: Exception) { promise.reject("CLIP_PROBE", e.message, e) }
    }
  }

  // ---------------------------------------------------------------- PTS table

  private fun writePtsTable(clipId: String, masterPath: String): Triple<String, Int, Long> {
    val times = readSampleTimes(masterPath)
    val f = File(clipDir(clipId), "pts.u32")
    val bb = ByteBuffer.allocate(times.size * 4).order(ByteOrder.LITTLE_ENDIAN)
    for (t in times) bb.putInt((t.coerceIn(0L, 0xFFFFFFFFL)).toInt())
    FileOutputStream(f).use { it.write(bb.array()) }
    val durationUs = if (times.isEmpty()) 0L else times.last()
    return Triple(f.absolutePath, times.size, durationUs)
  }

  private fun readPts(ptsPath: String): LongArray {
    val f = File(ptsPath)
    if (!f.exists()) return LongArray(0)
    val n = (f.length() / 4).toInt()
    val out = LongArray(n)
    RandomAccessFile(f, "r").use { raf ->
      val buf = ByteArray(n * 4); raf.readFully(buf)
      val bb = ByteBuffer.wrap(buf).order(ByteOrder.LITTLE_ENDIAN)
      for (i in 0 until n) out[i] = bb.int.toLong() and 0xFFFFFFFFL
    }
    return out
  }

  @ReactMethod
  fun buildPtsTable(clipId: String, masterPath: String, promise: Promise) {
    executor.execute {
      try {
        val (path, frames, durationUs) = writePtsTable(clipId, masterPath)
        val out = Arguments.createMap()
        out.putString("ptsPath", path); out.putInt("frames", frames); out.putDouble("durationUs", durationUs.toDouble())
        promise.resolve(out)
      } catch (e: Exception) { promise.reject("CLIP_PTS", e.message, e) }
    }
  }

  @ReactMethod
  fun readTextFile(path: String, promise: Promise) {
    executor.execute {
      try {
        val f = File(path)
        if (!f.exists() || f.length() > 4_000_000L) { promise.reject("CLIP_READ_TEXT", "missing or too large: $path"); return@execute }
        promise.resolve(f.readText())
      } catch (e: Exception) { promise.reject("CLIP_READ_TEXT", e.message, e) }
    }
  }

  @ReactMethod
  fun readPtsTable(ptsPath: String, promise: Promise) {
    executor.execute {
      try {
        val pts = readPts(ptsPath)
        val step = maxOf(1, Math.ceil(pts.size / 20000.0).toInt())
        val arr = JSONArray()
        var i = 0
        while (i < pts.size) { arr.put(pts[i]); i += step }
        promise.resolve(arr.toString())
      } catch (e: Exception) { promise.reject("CLIP_PTS_READ", e.message, e) }
    }
  }

  // ---------------------------------------------------------------- proxy (Media3 Transformer)

  /** Blocks the caller (the ingest executor) until the export completes; returns null on failure. */
  private fun buildProxy(clipId: String, masterPath: String, rotationDeg: Float, rangeUs: JSONObject?): String? {
    val outFile = File(clipDir(clipId), "proxy.mp4")
    if (outFile.exists()) outFile.delete()
    val latch = CountDownLatch(1)
    var failure: Exception? = null
    var transformer: Transformer? = null
    val progressTask = object : Runnable {
      override fun run() {
        val t = transformer ?: return
        val holder = ProgressHolder()
        try { t.getProgress(holder) } catch (_: Exception) {}
        emitProgress(clipId, "proxy", holder.progress / 100.0)
        transformerHandler.postDelayed(this, 500)
      }
    }
    transformerHandler.post {
      try {
        val itemBuilder = MediaItem.Builder().setUri(Uri.fromFile(File(masterPath)))
        if (rangeUs != null) {
          itemBuilder.setClippingConfiguration(
            MediaItem.ClippingConfiguration.Builder()
              .setStartPositionMs(rangeUs.optLong("t0Us", 0L) / 1000L)
              .setEndPositionMs(rangeUs.optLong("t1Us", Long.MAX_VALUE / 2000L) / 1000L)
              .build(),
          )
        }
        val effects = ArrayList<androidx.media3.common.Effect>()
        if (rotationDeg != 0f) effects.add(ScaleAndRotateTransformation.Builder().setRotationDegrees(rotationDeg).build())
        effects.add(Presentation.createForHeight(360))
        val edited = EditedMediaItem.Builder(itemBuilder.build())
          .setEffects(Effects(emptyList(), effects))
          .setRemoveAudio(true)
          .build()
        val encoderSettings = VideoEncoderSettings.Builder()
          .setBitrate(2_500_000)
          .setiFrameIntervalSeconds(0.25f)
          .build()
        val encoderFactory = DefaultEncoderFactory.Builder(reactContext).setRequestedVideoEncoderSettings(encoderSettings).build()
        val t = Transformer.Builder(reactContext)
          .setVideoMimeType(MimeTypes.VIDEO_H264)
          .setEncoderFactory(encoderFactory)
          .setLooper(transformerThread.looper)
          .addListener(object : Transformer.Listener {
            override fun onCompleted(composition: Composition, exportResult: ExportResult) { transformerHandler.removeCallbacks(progressTask); latch.countDown() }
            override fun onError(composition: Composition, exportResult: ExportResult, exportException: ExportException) {
              transformerHandler.removeCallbacks(progressTask); failure = exportException; latch.countDown()
            }
          })
          .build()
        transformer = t
        t.start(edited, outFile.absolutePath)
        transformerHandler.postDelayed(progressTask, 500)
      } catch (e: Exception) { failure = e; latch.countDown() }
    }
    // A 90 s set at ≤ 0.5× realtime is 45 s; allow far more before declaring it stuck.
    if (!latch.await(15, TimeUnit.MINUTES)) { transformerHandler.post { try { transformer?.cancel() } catch (_: Exception) {} }; return null }
    if (failure != null || !outFile.exists() || outFile.length() == 0L) { outFile.delete(); return null }
    return outFile.absolutePath
  }

  // ---------------------------------------------------------------- filmstrip

  private fun frameAt(r: MediaMetadataRetriever, tUs: Long, option: Int, dstH: Int): Bitmap? {
    val bmp = if (Build.VERSION.SDK_INT >= 27) {
      // Width hint generous; the retriever keeps the aspect and fits inside.
      r.getScaledFrameAtTime(tUs, option, dstH * 4, dstH)
    } else r.getFrameAtTime(tUs, option)
    bmp ?: return null
    if (bmp.height == dstH) return bmp
    val w = Math.round(bmp.width * dstH.toDouble() / bmp.height).toInt().coerceAtLeast(1)
    val scaled = Bitmap.createScaledBitmap(bmp, w, dstH, true)
    if (scaled !== bmp) bmp.recycle()
    return scaled
  }

  private fun buildThumbs(clipId: String, sourcePath: String, durationUs: Long): Pair<String, String>? {
    val frameH = 96
    var stepUs = 1_000_000L
    var count = maxOf(1, (durationUs / stepUs).toInt() + 1)
    if (count > 200) { stepUs = 2_000_000L; count = maxOf(1, (durationUs / stepUs).toInt() + 1) }
    if (count > 400) { stepUs = durationUs / 399; count = 400 }
    val r = MediaMetadataRetriever()
    try {
      r.setDataSource(sourcePath)
      val first = frameAt(r, 0L, MediaMetadataRetriever.OPTION_CLOSEST_SYNC, frameH) ?: return null
      val frameW = first.width
      val cols = 20
      val rows = (count + cols - 1) / cols
      val sprite = Bitmap.createBitmap(frameW * cols, frameH * rows, Bitmap.Config.RGB_565)
      val canvas = Canvas(sprite); canvas.drawColor(Color.BLACK)
      canvas.drawBitmap(first, 0f, 0f, null); first.recycle()
      for (k in 1 until count) {
        val bmp = frameAt(r, k * stepUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC, frameH) ?: continue
        val x = (k % cols) * frameW; val y = (k / cols) * frameH
        canvas.drawBitmap(bmp, x.toFloat(), y.toFloat(), null)
        bmp.recycle()
      }
      val dir = clipDir(clipId)
      val jpg = File(dir, "thumbs.jpg")
      FileOutputStream(jpg).use { sprite.compress(Bitmap.CompressFormat.JPEG, 80, it) }
      sprite.recycle()
      val idx = File(dir, "thumbs.json")
      idx.writeText(JSONObject().apply {
        put("frameW", frameW); put("frameH", frameH); put("count", count); put("stepUs", stepUs); put("cols", cols); put("rows", rows)
      }.toString())
      return jpg.absolutePath to idx.absolutePath
    } catch (_: Exception) {
      return null
    } finally { try { r.release() } catch (_: Exception) {} }
  }

  // ---------------------------------------------------------------- ingest

  @ReactMethod
  fun ingest(clipId: String, masterPath: String, rotationDeg: Double, rangeUs: String?, promise: Promise) {
    executor.execute {
      try {
        val timings = JSONObject()
        emitProgress(clipId, "pts", 0.0)
        var t0 = System.nanoTime()
        val (ptsPath, frames, ptsDuration) = writePtsTable(clipId, masterPath)
        val probe = probeFile(masterPath)
        timings.put("pts", (System.nanoTime() - t0) / 1e6)
        emitProgress(clipId, "pts", 1.0)

        val range = rangeUs?.let { try { JSONObject(it) } catch (_: Exception) { null } }
        emitProgress(clipId, "proxy", 0.0)
        t0 = System.nanoTime()
        val proxyPath = try { buildProxy(clipId, masterPath, rotationDeg.toFloat(), range) } catch (_: Exception) { null }
        timings.put("proxy", (System.nanoTime() - t0) / 1e6)
        emitProgress(clipId, "proxy", 1.0, if (proxyPath == null) "proxy failed; master will play" else null)

        emitProgress(clipId, "thumbs", 0.0)
        t0 = System.nanoTime()
        val durationUs = if (ptsDuration > 0) ptsDuration else probe.durationUs
        val thumbDuration = if (range != null) (range.optLong("t1Us", durationUs) - range.optLong("t0Us", 0L)).coerceAtLeast(1_000_000L) else durationUs
        val thumbs = buildThumbs(clipId, proxyPath ?: masterPath, thumbDuration)
        timings.put("thumbs", (System.nanoTime() - t0) / 1e6)
        emitProgress(clipId, "thumbs", 1.0)
        emitProgress(clipId, "done", 1.0)

        val out = Arguments.createMap()
        out.putString("ptsPath", ptsPath)
        if (proxyPath != null) out.putString("proxyPath", proxyPath) else out.putNull("proxyPath")
        if (thumbs != null) { out.putString("thumbsPath", thumbs.first); out.putString("thumbsIndexPath", thumbs.second) } else { out.putNull("thumbsPath"); out.putNull("thumbsIndexPath") }
        out.putInt("frames", frames); out.putDouble("durationUs", durationUs.toDouble())
        out.putInt("width", probe.width); out.putInt("height", probe.height)
        val tm = Arguments.createMap()
        tm.putDouble("pts", timings.optDouble("pts", 0.0)); tm.putDouble("proxy", timings.optDouble("proxy", 0.0)); tm.putDouble("thumbs", timings.optDouble("thumbs", 0.0))
        out.putMap("timingsMs", tm)
        promise.resolve(out)
      } catch (e: Exception) {
        emitProgress(clipId, "error", 0.0, e.message)
        promise.reject("CLIP_INGEST", e.message, e)
      }
    }
  }

  // ---------------------------------------------------------------- frames

  @ReactMethod
  fun extractFrame(masterPath: String, ptsUs: Double, rotationDeg: Double, cropJson: String?, outPath: String, promise: Promise) {
    executor.execute {
      val r = MediaMetadataRetriever()
      try {
        r.setDataSource(masterPath)
        var bmp = r.getFrameAtTime(ptsUs.toLong(), MediaMetadataRetriever.OPTION_CLOSEST) ?: throw IllegalStateException("no frame at $ptsUs")
        // Crop in pre-rotation master pixels, then rotate counter-clockwise.
        cropJson?.let {
          val c = JSONObject(it)
          val x = c.optInt("x", 0).coerceIn(0, bmp.width - 1); val y = c.optInt("y", 0).coerceIn(0, bmp.height - 1)
          val w = c.optInt("w", bmp.width).coerceIn(1, bmp.width - x); val h = c.optInt("h", bmp.height).coerceIn(1, bmp.height - y)
          val cropped = Bitmap.createBitmap(bmp, x, y, w, h)
          if (cropped !== bmp) bmp.recycle()
          bmp = cropped
        }
        val deg = ((rotationDeg % 360) + 360) % 360
        if (deg != 0.0) {
          val m = Matrix(); m.postRotate(-deg.toFloat())
          val rotated = Bitmap.createBitmap(bmp, 0, 0, bmp.width, bmp.height, m, true)
          if (rotated !== bmp) bmp.recycle()
          bmp = rotated
        }
        File(outPath).parentFile?.mkdirs()
        FileOutputStream(outPath).use { bmp.compress(Bitmap.CompressFormat.JPEG, 92, it) }
        val out = Arguments.createMap()
        out.putString("path", outPath); out.putInt("width", bmp.width); out.putInt("height", bmp.height)
        bmp.recycle()
        promise.resolve(out)
      } catch (e: Exception) { promise.reject("CLIP_EXTRACT_FRAME", e.message, e) }
      finally { try { r.release() } catch (_: Exception) {} }
    }
  }

  private fun gray64(bmp: Bitmap): IntArray {
    val w = 64; val h = maxOf(1, Math.round(bmp.height * 64.0 / bmp.width).toInt())
    val small = Bitmap.createScaledBitmap(bmp, w, h, true)
    val px = IntArray(w * h); small.getPixels(px, 0, w, 0, 0, w, h)
    if (small !== bmp) small.recycle()
    return IntArray(px.size) { i -> val p = px[i]; (((p shr 16) and 0xFF) * 299 + ((p shr 8) and 0xFF) * 587 + (p and 0xFF) * 114) / 1000 }
  }

  @ReactMethod
  fun motionEnergy(proxyPath: String, promise: Promise) {
    executor.execute {
      val r = MediaMetadataRetriever()
      try {
        r.setDataSource(proxyPath)
        val durationUs = (r.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0L) * 1000L
        val stepUs = 100_000L
        val out = JSONArray()
        var prev: IntArray? = null
        var t = 0L
        while (t <= durationUs) {
          val bmp = r.getFrameAtTime(t, MediaMetadataRetriever.OPTION_CLOSEST) ?: break
          val g = gray64(bmp); bmp.recycle()
          val p = prev
          if (p != null && p.size == g.size) {
            var acc = 0L; for (i in g.indices) acc += Math.abs(g[i] - p[i])
            out.put(JSONObject().apply { put("tUs", t); put("energy", acc.toDouble() / g.size) })
          }
          prev = g
          t += stepUs
        }
        promise.resolve(out.toString())
      } catch (e: Exception) { promise.reject("CLIP_MOTION_ENERGY", e.message, e) }
      finally { try { r.release() } catch (_: Exception) {} }
    }
  }

  // ---------------------------------------------------------------- files

  @ReactMethod
  fun deleteClipFiles(pathsJson: String, promise: Promise) {
    executor.execute {
      try {
        val a = JSONArray(pathsJson)
        for (i in 0 until a.length()) { val f = File(a.getString(i)); if (f.exists()) f.delete() }
        promise.resolve(null)
      } catch (e: Exception) { promise.reject("CLIP_DELETE", e.message, e) }
    }
  }

  @ReactMethod
  fun fileSizes(pathsJson: String, promise: Promise) {
    executor.execute {
      try {
        val a = JSONArray(pathsJson)
        val out = JSONArray()
        for (i in 0 until a.length()) { val f = File(a.optString(i, "")); out.put(if (f.exists()) f.length() else 0L) }
        promise.resolve(out.toString())
      } catch (e: Exception) { promise.reject("CLIP_SIZES", e.message, e) }
    }
  }

  @ReactMethod
  fun clipsDir(promise: Promise) {
    try { promise.resolve(clipsRoot().absolutePath) } catch (e: Exception) { promise.reject("CLIP_DIR", e.message, e) }
  }

  /** Backward frame-step cost on the proxy: 30 consecutive PTS entries, newest to oldest. */
  @ReactMethod
  fun benchmark(proxyPath: String, promise: Promise) {
    executor.execute {
      val r = MediaMetadataRetriever()
      try {
        val pts = readSampleTimes(proxyPath)
        r.setDataSource(proxyPath)
        val n = minOf(30, pts.size)
        val times = ArrayList<Double>()
        for (k in 0 until n) {
          val t = pts[pts.size - 1 - k]
          val t0 = System.nanoTime()
          r.getFrameAtTime(t, MediaMetadataRetriever.OPTION_CLOSEST)?.recycle()
          times.add((System.nanoTime() - t0) / 1e6)
        }
        times.sort()
        val out = Arguments.createMap()
        out.putDouble("stepMsMedian", if (times.isEmpty()) 0.0 else times[times.size / 2])
        out.putDouble("stepMsP95", if (times.isEmpty()) 0.0 else times[minOf(times.size - 1, (times.size * 0.95).toInt())])
        out.putInt("steps", times.size)
        promise.resolve(out)
      } catch (e: Exception) { promise.reject("CLIP_BENCHMARK", e.message, e) }
      finally { try { r.release() } catch (_: Exception) {} }
    }
  }

  @ReactMethod fun addListener(eventName: String) {}
  @ReactMethod fun removeListeners(count: Int) {}
}
