package com.ironpal.poc

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.util.Base64
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.lifecycle.LifecycleOwner
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

  @ReactMethod
  fun captureSharpestStill(windowMs: Double, promise: Promise) {
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
