package com.twentydeka.ironpal

import android.graphics.Bitmap
import android.graphics.Matrix
import android.media.MediaMetadataRetriever
import android.os.Build
import android.os.SystemClock
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import java.util.concurrent.Executors

/**
 * Neural design v2 — the video and pose blocks of EMBED (§3.1–§3.2), run per SET over the clip the
 * app already records from ARM to END SET (studio design §11.1). Frames, landmarks and the MoViNet
 * stream state never cross the bridge; what crosses is 600 + 48 numbers and the timings.
 *
 * Deviations from the design, on purpose (recorded in poc/README.md, "Neural model v2"):
 *  - per set from the recorded clip, not a live 5 fps stream (the live HUD is phase V2);
 *  - the video feature is MoViNet's 600 logits averaged over the set — a fixed linear map of the
 *    2048-d pooled feature, so whitening (in JS) recovers the same subspace without model surgery;
 *  - CPU interpreter, 4 threads (the GPU delegate is a V0 measurement, not a prerequisite).
 */
class EmbedModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "EmbedModule"

  private val executor = Executors.newSingleThreadExecutor()
  @Volatile private var movinet: Interpreter? = null
  @Volatile private var pose: PoseLandmarker? = null

  private fun asset(name: String): MappedByteBuffer {
    val fd = reactContext.assets.openFd(name)
    FileInputStream(fd.fileDescriptor).channel.use { ch ->
      return ch.map(FileChannel.MapMode.READ_ONLY, fd.startOffset, fd.declaredLength)
    }
  }

  private fun ensureModels() {
    if (movinet == null) {
      movinet = Interpreter(asset("models/movinet_a0_stream_fp16.tflite"), Interpreter.Options().setNumThreads(4))
    }
    if (pose == null) {
      pose = PoseLandmarker.createFromOptions(
        reactContext,
        PoseLandmarker.PoseLandmarkerOptions.builder()
          .setBaseOptions(BaseOptions.builder().setModelAssetPath("models/pose_landmarker_lite.task").build())
          .setRunningMode(RunningMode.IMAGE)
          .setNumPoses(1)
          .build(),
      )
    }
  }

  /** MoViNet-A0-Stream with its 43 state tensors, reset per set (design §3.1 "stream state"). */
  private inner class Stream(private val it: Interpreter) {
    private val sig = "serving_default"
    private val stateNames: List<String> = it.getSignatureInputs(sig).filter { n -> n != "image" }
    private var states = HashMap<String, ByteBuffer>()
    private var outStates = HashMap<String, ByteBuffer>()
    private val image = ByteBuffer.allocateDirect(172 * 172 * 3 * 4).order(ByteOrder.nativeOrder())
    private val logits = ByteBuffer.allocateDirect(600 * 4).order(ByteOrder.nativeOrder())

    init {
      for (n in stateNames) {
        val bytes = it.getInputTensorFromSignature(n, sig).numBytes()
        states[n] = ByteBuffer.allocateDirect(bytes).order(ByteOrder.nativeOrder())
        outStates[n] = ByteBuffer.allocateDirect(bytes).order(ByteOrder.nativeOrder())
      }
    }

    /** One frame (172×172 RGB) → 600 logits; the state advances. */
    fun step(bmp172: Bitmap): FloatArray {
      val px = IntArray(172 * 172); bmp172.getPixels(px, 0, 172, 0, 0, 172, 172)
      image.rewind()
      for (p in px) { image.putFloat(((p shr 16) and 0xFF) / 255f); image.putFloat(((p shr 8) and 0xFF) / 255f); image.putFloat((p and 0xFF) / 255f) }
      image.rewind()
      val inputs = HashMap<String, Any>(); inputs["image"] = image
      for (k in stateNames) { val v = states.getValue(k); v.rewind(); inputs[k] = v }
      val outputs = HashMap<String, Any>(); logits.rewind(); outputs["logits"] = logits
      for (k in stateNames) { val v = outStates.getValue(k); v.rewind(); outputs[k] = v }
      it.runSignature(inputs, outputs, sig)
      // this step's output state is the next step's input state
      val swap = states; states = outStates; outStates = swap
      logits.rewind()
      return FloatArray(600) { logits.float }
    }
  }

  private fun rotate(bmp: Bitmap, rotationDeg: Double): Bitmap {
    val deg = ((rotationDeg % 360) + 360) % 360
    if (deg == 0.0) return bmp
    val m = Matrix(); m.postRotate(-deg.toFloat()) // counter-clockwise, as ClipModule
    val r = Bitmap.createBitmap(bmp, 0, 0, bmp.width, bmp.height, m, true)
    if (r !== bmp) bmp.recycle()
    return r
  }

  private fun centerSquare(bmp: Bitmap, side: Int): Bitmap {
    val s = minOf(bmp.width, bmp.height)
    val c = Bitmap.createBitmap(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s)
    val out = Bitmap.createScaledBitmap(c, side, side, true)
    if (c !== bmp && c !== out) c.recycle()
    return out
  }

  /**
   * Embed one set: decode [startUs, endUs] of the clip at [fps], run MoViNet (stream reset at the
   * first frame) and Pose Lite on each frame. Resolves {video: number[600], pose: number[48],
   * poseVisible, frames, ms: {decode, movinet, pose, total}}.
   */
  @ReactMethod
  fun embedClip(masterPath: String, rotationDeg: Double, startUs: Double, endUs: Double, fps: Double, promise: Promise) {
    executor.execute {
      val r = MediaMetadataRetriever()
      try {
        val t0 = SystemClock.elapsedRealtime()
        ensureModels()
        r.setDataSource(masterPath)
        val durUs = (r.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLong() ?: 0L) * 1000
        val a = startUs.toLong().coerceAtLeast(0)
        val b = if (endUs > 0) minOf(endUs.toLong(), durUs) else durUs
        val stepUs = (1e6 / fps).toLong()
        val stream = Stream(movinet!!)
        val sum = DoubleArray(600)
        val geo = ArrayList<DoubleArray>()
        var nFrames = 0; var msDecode = 0L; var msMov = 0L; var msPose = 0L
        var t = a
        while (t < b) {
          val d0 = SystemClock.elapsedRealtime()
          val raw = if (Build.VERSION.SDK_INT >= 27) r.getScaledFrameAtTime(t, MediaMetadataRetriever.OPTION_CLOSEST, 480, 480)
                    else r.getFrameAtTime(t, MediaMetadataRetriever.OPTION_CLOSEST)
          if (raw == null) { t += stepUs; continue }
          val frame = rotate(raw, rotationDeg)
          val sq = centerSquare(frame, 172)
          val d1 = SystemClock.elapsedRealtime()
          val lg = stream.step(sq)
          for (i in 0 until 600) sum[i] += lg[i]
          val d2 = SystemClock.elapsedRealtime()
          val argb = if (frame.config == Bitmap.Config.ARGB_8888) frame else frame.copy(Bitmap.Config.ARGB_8888, false)
          val res = pose!!.detect(BitmapImageBuilder(argb).build())
          val lms = res.landmarks().firstOrNull()?.map { l -> PoseGeometry.Lm(l.x(), l.y(), l.visibility().orElse(0f)) }
          geo.add(PoseGeometry.channels(lms))
          val d3 = SystemClock.elapsedRealtime()
          msDecode += d1 - d0; msMov += d2 - d1; msPose += d3 - d2
          sq.recycle(); if (argb !== frame) argb.recycle(); frame.recycle()
          nFrames++; t += stepUs
        }
        if (nFrames == 0) throw IllegalStateException("no frames decoded in [$a, $b] µs")
        val out = Arguments.createMap()
        val v = Arguments.createArray(); for (x in sum) v.pushDouble(x / nFrames); out.putArray("video", v)
        val p = Arguments.createArray(); for (x in PoseGeometry.stats(geo, fps)) p.pushDouble(x); out.putArray("pose", p)
        out.putDouble("poseVisible", PoseGeometry.visibleFraction(geo))
        out.putInt("frames", nFrames)
        val ms = Arguments.createMap()
        ms.putDouble("decode", msDecode.toDouble()); ms.putDouble("movinet", msMov.toDouble()); ms.putDouble("pose", msPose.toDouble())
        ms.putDouble("total", (SystemClock.elapsedRealtime() - t0).toDouble())
        out.putMap("ms", ms)
        promise.resolve(out)
      } catch (e: Throwable) {
        promise.reject("EMBED_CLIP", e.message, e)
      } finally {
        try { r.release() } catch (_: Exception) {}
      }
    }
  }

  /** True when both model assets load (the package smoke test for this block). */
  @ReactMethod
  fun selfTest(promise: Promise) {
    executor.execute {
      try {
        val t0 = SystemClock.elapsedRealtime(); ensureModels()
        val s = Stream(movinet!!)
        val bmp = Bitmap.createBitmap(172, 172, Bitmap.Config.ARGB_8888)
        val t1 = SystemClock.elapsedRealtime(); val lg = s.step(bmp); val t2 = SystemClock.elapsedRealtime()
        val out = Arguments.createMap()
        out.putBoolean("ok", lg.size == 600 && lg.all { it.isFinite() })
        out.putDouble("loadMs", (t1 - t0).toDouble()); out.putDouble("stepMs", (t2 - t1).toDouble())
        promise.resolve(out)
      } catch (e: Throwable) { promise.reject("EMBED_SELFTEST", e.message, e) }
    }
  }
}
