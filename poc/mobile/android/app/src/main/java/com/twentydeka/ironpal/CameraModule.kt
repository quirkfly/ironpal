package com.twentydeka.ironpal

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraMetadata
import android.os.SystemClock
import android.util.Base64
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.camera2.interop.ExperimentalCamera2Interop
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FallbackStrategy
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.lifecycle.LifecycleOwner
import java.io.File
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import java.io.ByteArrayOutputStream
import java.util.concurrent.Executors
import kotlin.math.abs

/**
 * Custom Kotlin `CameraModule` (CameraX). Two jobs (design §4.1):
 *
 *  1. captureSharpestStill — during a glance window (Q5), analyse frames, score
 *     each by a variance-of-Laplacian sharpness metric, and return the sharpest
 *     as a base64 JPEG. Decouples weight CAPTURE from OCR (Q5).
 *  2. captureFrameSequence — grab N evenly-spaced frames for pushdown vision
 *     recognition (/vision/recognize).
 *
 * Frames are produced here and handed to JS as base64; the backend deletes
 * them after inference (D3) — nothing is persisted on device.
 */
class CameraModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "CameraModule"

  private val analysisExecutor = Executors.newSingleThreadExecutor()

  // ---------------------------------------------------------------- per-set clip (studio design §11.1)

  /** Everything about the clip being recorded; null when idle. */
  private class ClipSession(val clipId: String, val outPath: String) {
    var recording: Recording? = null
    var provider: ProcessCameraProvider? = null
    var analysisBound = false
    var timestampsRealtime = false
    var startHostNs = 0L
    var pts0HostNs = 0L
    var syncSource = "camera_start"
    var started = false
    var startPromise: Promise? = null
    var stopPromise: Promise? = null
    var width = 0
    var height = 0
    var glanceJpeg: ByteArray? = null
    var glanceScore = 0.0
    var glanceHostNs = 0L
    var firstFrameSeen = false
  }

  @Volatile private var clip: ClipSession? = null
  private val mainHandler = android.os.Handler(android.os.Looper.getMainLooper())

  /** How long after Start the analysis stream keeps hunting for the sharpest (glance) frame. */
  private val glanceWindowNs = 4_000_000_000L

  @ReactMethod
  fun isRecordingClip(promise: Promise) { promise.resolve(clip != null) }

  @OptIn(ExperimentalCamera2Interop::class)
  @ReactMethod
  fun startClip(clipId: String, outPath: String, promise: Promise) {
    if (clip != null) { promise.reject("CAMERA_BUSY", "a clip is already recording"); return }
    val activity = reactContext.currentActivity
    if (activity == null || activity !is LifecycleOwner) { promise.reject("CAMERA_NO_ACTIVITY", "no lifecycle owner"); return }
    val cs = ClipSession(clipId, outPath)
    cs.startPromise = promise
    clip = cs
    mainHandler.post {
      try {
        val providerFuture = ProcessCameraProvider.getInstance(reactContext)
        providerFuture.addListener({
          try {
            val provider = providerFuture.get()
            cs.provider = provider
            val recorder = Recorder.Builder()
              .setQualitySelector(QualitySelector.from(Quality.HD, FallbackStrategy.lowerQualityOrHigherThan(Quality.HD)))
              .build()
            val videoCapture = VideoCapture.withOutput(recorder)
            val analysis = ImageAnalysis.Builder().setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build()
            analysis.setAnalyzer(analysisExecutor) { proxy -> try { onClipFrame(cs, proxy) } finally { proxy.close() } }
            provider.unbindAll()
            val camera = try {
              val c = provider.bindToLifecycle(activity as LifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, videoCapture, analysis)
              cs.analysisBound = true
              c
            } catch (e: Exception) {
              // The device refused VideoCapture + ImageAnalysis (ledger Q34): record alone, the glance
              // still is then taken from the clip at ingest.
              provider.unbindAll()
              cs.analysisBound = false
              provider.bindToLifecycle(activity as LifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, videoCapture)
            }
            try {
              val src = Camera2CameraInfo.from(camera.cameraInfo).getCameraCharacteristic(CameraCharacteristics.SENSOR_INFO_TIMESTAMP_SOURCE)
              cs.timestampsRealtime = src == CameraMetadata.SENSOR_INFO_TIMESTAMP_SOURCE_REALTIME
            } catch (_: Exception) { cs.timestampsRealtime = false }
            val file = File(outPath); file.parentFile?.mkdirs()
            val pending = recorder.prepareRecording(reactContext, FileOutputOptions.Builder(file).build())
            // No audio: withAudioEnabled() is deliberately not called (no RECORD_AUDIO permission).
            cs.recording = pending.start(analysisExecutor) { event -> onRecordEvent(cs, event) }
            // Never leave the caller hanging: resolve with camera_start if Start never arrives.
            mainHandler.postDelayed({
              if (cs.startPromise != null) {
                if (cs.started) resolveStart(cs) else { cs.startPromise?.reject("CAMERA_CLIP_START_TIMEOUT", "recording did not start"); cs.startPromise = null; abortClip(cs) }
              }
            }, 5000)
          } catch (e: Exception) {
            cs.startPromise?.reject("CAMERA_CLIP_START", e.message, e); cs.startPromise = null
            abortClip(cs)
          }
        }, { it.run() })
      } catch (e: Exception) {
        cs.startPromise?.reject("CAMERA_CLIP_START", e.message, e); cs.startPromise = null
        abortClip(cs)
      }
    }
  }

  private fun abortClip(cs: ClipSession) {
    try { cs.recording?.stop() } catch (_: Exception) {}
    mainHandler.post { try { cs.provider?.unbindAll() } catch (_: Exception) {} }
    if (clip === cs) clip = null
  }

  private fun onRecordEvent(cs: ClipSession, event: VideoRecordEvent) {
    when (event) {
      is VideoRecordEvent.Start -> {
        cs.startHostNs = SystemClock.elapsedRealtimeNanos()
        cs.started = true
        if (!(cs.analysisBound && cs.timestampsRealtime)) {
          cs.pts0HostNs = cs.startHostNs; cs.syncSource = "camera_start"
          resolveStart(cs)
        } else {
          // Wait (≤ 1 s) for the first analysed frame, whose sensor timestamp is on CLOCK_BOOTTIME.
          mainHandler.postDelayed({ if (cs.startPromise != null) { cs.pts0HostNs = cs.startHostNs; cs.syncSource = "camera_start"; resolveStart(cs) } }, 1000)
        }
      }
      is VideoRecordEvent.Finalize -> {
        val p = cs.stopPromise; cs.stopPromise = null
        mainHandler.post { try { cs.provider?.unbindAll() } catch (_: Exception) {} }
        if (clip === cs) clip = null
        val file = File(cs.outPath)
        if (event.hasError() && !file.exists()) {
          p?.reject("CAMERA_CLIP_ERROR", "recording failed (${event.error})")
          return
        }
        val out = Arguments.createMap()
        out.putString("path", cs.outPath)
        out.putDouble("durationUs", event.recordingStats.recordedDurationNanos / 1000.0)
        out.putDouble("bytes", event.recordingStats.numBytesRecorded.toDouble())
        val g = cs.glanceJpeg
        if (g != null) { out.putString("glanceJpegB64", Base64.encodeToString(g, Base64.NO_WRAP)); out.putDouble("glanceHostNs", cs.glanceHostNs.toDouble()) }
        else { out.putNull("glanceJpegB64"); out.putNull("glanceHostNs") }
        p?.resolve(out)
      }
      else -> {}
    }
  }

  private fun resolveStart(cs: ClipSession) {
    val p = cs.startPromise ?: return
    cs.startPromise = null
    val out = Arguments.createMap()
    out.putString("path", cs.outPath)
    out.putDouble("pts0HostNs", cs.pts0HostNs.toDouble())
    out.putString("syncSource", cs.syncSource)
    out.putBoolean("analysisBound", cs.analysisBound)
    out.putInt("width", cs.width); out.putInt("height", cs.height)
    p.resolve(out)
  }

  /** Analysis frames while a clip records: pin PTS 0 to the first frame after Start, keep the sharpest early frame. */
  private fun onClipFrame(cs: ClipSession, proxy: ImageProxy) {
    if (cs.width == 0) { cs.width = proxy.width; cs.height = proxy.height }
    if (!cs.started) return
    val frameHostNs = if (cs.timestampsRealtime) proxy.imageInfo.timestamp else SystemClock.elapsedRealtimeNanos()
    if (!cs.firstFrameSeen) {
      cs.firstFrameSeen = true
      if (cs.timestampsRealtime) { cs.pts0HostNs = frameHostNs; cs.syncSource = "sensor_timestamps" } else { cs.pts0HostNs = cs.startHostNs; cs.syncSource = "camera_start" }
      resolveStart(cs)
    }
    if (frameHostNs - cs.pts0HostNs > glanceWindowNs) return
    val jpeg = proxyToJpeg(proxy) ?: return
    val score = sharpnessScore(jpeg)
    if (score > cs.glanceScore) { cs.glanceScore = score; cs.glanceJpeg = jpeg; cs.glanceHostNs = frameHostNs }
  }

  @ReactMethod
  fun stopClip(promise: Promise) {
    val cs = clip
    if (cs == null) { promise.reject("CAMERA_NOT_RECORDING", "no clip is recording"); return }
    if (cs.stopPromise != null) { promise.reject("CAMERA_BUSY", "stop already pending"); return }
    cs.stopPromise = promise
    try { cs.recording?.stop() } catch (e: Exception) { cs.stopPromise = null; promise.reject("CAMERA_CLIP_STOP", e.message, e); abortClip(cs) }
  }

  @ReactMethod
  fun captureSharpestStill(windowMs: Double, promise: Promise) {
    if (clip != null) { promise.reject("CAMERA_BUSY", "a clip is recording"); return }
    runCapture(
      windowMs = windowMs.toLong(),
      maxFrames = 1,
      keepSharpestOnly = true,
    ) { frames ->
      if (frames.isEmpty()) {
        promise.reject("CAMERA_NO_FRAME", "No frame captured in glance window.")
      } else {
        promise.resolve(frames[0])
      }
    }
  }

  @ReactMethod
  fun captureFrameSequence(count: Double, intervalMs: Double, promise: Promise) {
    if (clip != null) { promise.reject("CAMERA_BUSY", "a clip is recording"); return }
    val n = count.toInt().coerceAtLeast(1)
    val interval = intervalMs.toLong().coerceAtLeast(50)
    runCapture(
      windowMs = n * interval,
      maxFrames = n,
      keepSharpestOnly = false,
    ) { frames ->
      val arr: WritableArray = Arguments.createArray()
      for (f in frames) arr.pushString(f)
      promise.resolve(arr)
    }
  }

  // -------------------------------------------------------------------------
  // Core capture: bind ImageAnalysis on the main thread, collect frames for
  // [windowMs], select sharpest (or evenly subsample), unbind, return base64.
  // -------------------------------------------------------------------------
  private fun runCapture(
    windowMs: Long,
    maxFrames: Int,
    keepSharpestOnly: Boolean,
    onDone: (List<String>) -> Unit,
  ) {
    val activity = reactContext.currentActivity
    if (activity == null || activity !is LifecycleOwner) {
      onDone(emptyList())
      return
    }
    val mainHandler = android.os.Handler(android.os.Looper.getMainLooper())
    mainHandler.post {
      try {
        val providerFuture = ProcessCameraProvider.getInstance(reactContext)
        providerFuture.addListener({
          val provider = providerFuture.get()
          val analysis = ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build()

          val collected = ArrayList<Pair<Double, ByteArray>>()
          val startTime = System.currentTimeMillis()

          analysis.setAnalyzer(analysisExecutor) { proxy ->
            try {
              val jpeg = proxyToJpeg(proxy)
              if (jpeg != null) {
                val sharpness = if (keepSharpestOnly) sharpnessScore(jpeg) else 0.0
                synchronized(collected) { collected.add(sharpness to jpeg) }
              }
            } finally {
              proxy.close()
            }
          }

          provider.unbindAll()
          provider.bindToLifecycle(
            activity as LifecycleOwner,
            CameraSelector.DEFAULT_BACK_CAMERA,
            analysis,
          )

          mainHandler.postDelayed({
            provider.unbindAll()
            val frames = selectFrames(collected, maxFrames, keepSharpestOnly)
            onDone(frames)
          }, windowMs)
        }, { it.run() })
      } catch (e: Exception) {
        onDone(emptyList())
      }
    }
  }

  private fun selectFrames(
    collected: List<Pair<Double, ByteArray>>,
    maxFrames: Int,
    keepSharpestOnly: Boolean,
  ): List<String> {
    synchronized(collected) {
      if (collected.isEmpty()) return emptyList()
      val chosen: List<ByteArray> = if (keepSharpestOnly) {
        listOf(collected.maxByOrNull { it.first }!!.second)
      } else {
        // Evenly subsample maxFrames across the collected sequence.
        val step = (collected.size.toDouble() / maxFrames).coerceAtLeast(1.0)
        val out = ArrayList<ByteArray>()
        var idx = 0.0
        while (out.size < maxFrames && idx.toInt() < collected.size) {
          out.add(collected[idx.toInt()].second)
          idx += step
        }
        out
      }
      return chosen.map { Base64.encodeToString(it, Base64.NO_WRAP) }
    }
  }

  /** Convert a YUV/JPEG ImageProxy to a JPEG byte array. */
  private fun proxyToJpeg(proxy: ImageProxy): ByteArray? {
    return try {
      when (proxy.format) {
        ImageFormat.JPEG -> {
          val buffer = proxy.planes[0].buffer
          ByteArray(buffer.remaining()).also { buffer.get(it) }
        }
        else -> {
          // YUV_420_888 → NV21 → JPEG.
          val yBuffer = proxy.planes[0].buffer
          val uBuffer = proxy.planes[1].buffer
          val vBuffer = proxy.planes[2].buffer
          val ySize = yBuffer.remaining()
          val uSize = uBuffer.remaining()
          val vSize = vBuffer.remaining()
          val nv21 = ByteArray(ySize + uSize + vSize)
          yBuffer.get(nv21, 0, ySize)
          vBuffer.get(nv21, ySize, vSize)
          uBuffer.get(nv21, ySize + vSize, uSize)
          val yuv = YuvImage(nv21, ImageFormat.NV21, proxy.width, proxy.height, null)
          val out = ByteArrayOutputStream()
          yuv.compressToJpeg(Rect(0, 0, proxy.width, proxy.height), 85, out)
          out.toByteArray()
        }
      }
    } catch (e: Exception) {
      null
    }
  }

  /**
   * Variance-of-Laplacian sharpness on a downscaled grayscale of the JPEG.
   * Higher = sharper; used to pick the best still in the glance window (Q5).
   */
  private fun sharpnessScore(jpeg: ByteArray): Double {
    val opts = BitmapFactory.Options().apply { inSampleSize = 4 }
    val bmp: Bitmap = BitmapFactory.decodeByteArray(jpeg, 0, jpeg.size, opts) ?: return 0.0
    val w = bmp.width
    val h = bmp.height
    if (w < 3 || h < 3) {
      bmp.recycle()
      return 0.0
    }
    val gray = IntArray(w * h)
    val pixels = IntArray(w * h)
    bmp.getPixels(pixels, 0, w, 0, 0, w, h)
    for (i in pixels.indices) {
      val p = pixels[i]
      val r = (p shr 16) and 0xFF
      val g = (p shr 8) and 0xFF
      val b = p and 0xFF
      gray[i] = (0.299 * r + 0.587 * g + 0.114 * b).toInt()
    }
    bmp.recycle()
    // Laplacian kernel response variance.
    var sum = 0.0
    var sumSq = 0.0
    var n = 0
    for (y in 1 until h - 1) {
      for (x in 1 until w - 1) {
        val c = gray[y * w + x]
        val lap = (gray[(y - 1) * w + x] + gray[(y + 1) * w + x] +
          gray[y * w + (x - 1)] + gray[y * w + (x + 1)] - 4 * c)
        sum += lap
        sumSq += (lap * lap).toDouble()
        n++
      }
    }
    if (n == 0) return 0.0
    val mean = sum / n
    return abs(sumSq / n - mean * mean)
  }
}
