package com.twentydeka.ironpal

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.nio.file.Files
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.sin

/**
 * The session sample log (studio design §10.1): slicing by host time, resampling to the
 * canonical rate, and the `samples.bin` round trip a reopened session depends on.
 */
class SessionRecorderTest {

  private val odr = 60.0

  /** 20 s of a 1 Hz rep sinusoid on Z at 60 Hz, timestamps starting at t0. */
  private fun fill(log: SampleLog, seconds: Double, t0Ns: Long) {
    val n = (seconds * odr).toInt()
    for (i in 0 until n) {
      val t = i / odr
      log.append(0.05 * sin(7.0 * t), 0.02, 2.0 * sin(2 * PI * 1.0 * t), 0.0, 0.0, 0.1, t0Ns + (t * 1e9).toLong())
    }
  }

  @Test
  fun sliceByHostTimeResamplesToCanonicalRate() {
    val log = SampleLog("s1", null, hasGyro = true)
    val t0 = 5_000_000_000L
    fill(log, 20.0, t0)
    assertEquals(1200, log.count)
    assertEquals(t0, log.t0Ns)
    assertTrue(abs(log.rateHz - odr) < 0.5)

    val win = log.slice(t0 + 4_000_000_000L, t0 + 8_000_000_000L)
    // 4 s at 50 Hz ≈ 200 samples (±2 for the edges).
    assertTrue("n=${win.accel.size}", win.accel.size in 196..202)
    assertNotNull(win.gyro)
    assertEquals(win.accel.size, win.gyro!!.size)
    // endNs is the last raw sample inside the range.
    assertTrue(win.endNs <= t0 + 8_000_000_000L && win.endNs > t0 + 7_900_000_000L)
    assertTrue(abs(win.nativeRateHz - odr) < 1.0)
  }

  @Test
  fun outOfRangeSliceIsEmptyAndCoversIsHonest() {
    val log = SampleLog("s2", null, hasGyro = false)
    val t0 = 1_000_000_000L
    fill(log, 5.0, t0)
    val before = log.slice(0L, t0 - 1)
    assertEquals(0, before.accel.size)
    val after = log.slice(t0 + 60_000_000_000L, t0 + 70_000_000_000L)
    assertEquals(0, after.accel.size)
    assertTrue(log.covers(t0))
    assertTrue(log.covers(t0 + 1_000_000_000L))
    assertFalse(log.covers(t0 - 1))
    assertEquals(null, log.slice(t0, t0 + 2_000_000_000L).gyro)
  }

  @Test
  fun samplesBinRoundTripsThroughDisk() {
    val dir = Files.createTempDirectory("ironpal-recorder").toFile()
    try {
      val log = SampleLog("s3", dir, hasGyro = true)
      log.openForWrite()
      val t0 = 42_000_000_000L
      fill(log, 10.0, t0)
      log.close()
      val f = File(dir, SampleLog.FILE_NAME)
      assertTrue(f.exists())
      assertEquals(16L + 600L * 32L, f.length())

      val back = SampleLog.load("s3", dir)
      assertNotNull(back)
      assertEquals(600, back!!.count)
      assertTrue(back.loaded)
      assertTrue(back.hasGyro)
      assertEquals(log.t0Ns, back.t0Ns)
      assertEquals(log.t1Ns, back.t1Ns)
      val (_, rows) = back.raw(t0 + 2_000_000_000L, t0 + 2_100_000_000L)
      assertTrue(rows.isNotEmpty())
      // float32 storage: within 1e-4 of the appended values.
      val (_, orig) = log.raw(t0 + 2_000_000_000L, t0 + 2_100_000_000L)
      for (i in rows.indices) for (c in 0 until 6) assertTrue(abs(rows[i][c] - orig[i][c]) < 1e-4)
    } finally {
      dir.deleteRecursively()
    }
  }

  @Test
  fun recorderSlotsKeepLiveAndLoadedApart() {
    val dir = Files.createTempDirectory("ironpal-recorder2").toFile()
    try {
      SessionRecorder.start(dir, "live", hasGyro = true)
      for (i in 0 until 300) SessionRecorder.append(0.0, 0.0, sin(i / 10.0), 0.0, 0.0, 0.0, 1_000_000_000L + i * 16_666_667L)
      val info = SessionRecorder.info("live")
      assertEquals(300, info.samples)
      assertTrue(info.loaded)
      SessionRecorder.stop()
      // After stop the finished session is still reachable (the Studio opens it right away).
      assertEquals(300, SessionRecorder.info("live").samples)
      assertEquals(0, SessionRecorder.info("missing").samples)
      assertFalse(SessionRecorder.load(File(dir, "nowhere"), "missing"))
    } finally {
      SessionRecorder.stop()
      dir.deleteRecursively()
    }
  }
}
