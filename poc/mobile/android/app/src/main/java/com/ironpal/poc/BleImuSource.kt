package com.ironpal.poc

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.os.Build
import android.util.Log
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.UUID

/**
 * BLE source for the headband IMU (Arduino Nano 33 BLE Rev2).
 *
 * This is the second backend behind [ImuPipeline] (design review Q1/Q2): the
 * phone-IMU path stays intact for POC v1, and the collection rig selects this
 * one via [ImuPipeline.source]. Samples are pushed into the SAME ring buffers,
 * so `Dsp`, `SignalModule`, fusion, labels and every screen are untouched —
 * `ImuPipeline.snapshot()` already resamples by measured rate to the 50 Hz
 * canonical rate, which handles 60 -> 50 with no extra code.
 *
 * Wire format and firmware: poc/firmware/ (README documents the packet layout).
 * Reference parser: poc/firmware/tools/ble_validate.py -- if this disagrees
 * with that, that one is right; it is what validated milestone B1.
 */
object BleImuSource {

  private const val TAG = "BleImuSource"
  const val DEVICE_NAME = "IronPal-IMU"

  private val SVC_UUID: UUID = UUID.fromString("6e40a000-b5a3-f393-e0a9-e50e24dcca9e")
  private val CHR_IMU: UUID = UUID.fromString("6e40a001-b5a3-f393-e0a9-e50e24dcca9e")
  private val CHR_CONTROL: UUID = UUID.fromString("6e40a002-b5a3-f393-e0a9-e50e24dcca9e")
  private val CHR_CONFIG: UUID = UUID.fromString("6e40a003-b5a3-f393-e0a9-e50e24dcca9e")
  private val CCCD: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

  /* Packet is 106 B, so ATT MTU must be >= 109 (payload + 3 B ATT header).
   * Linux/BlueZ negotiated this fine during B1, but ANDROID NEGOTIATES
   * SEPARATELY and silently truncates notifications that exceed the MTU --
   * which would look like corrupt packets rather than a config problem. Ask for
   * comfortably more than the minimum and verify in onMtuChanged.
   */
  private const val HEADER_BYTES = 10
  private const val AXES = 6
  private const val REQUESTED_MTU = 185
  private const val MIN_USABLE_MTU = 109

  private const val G_TO_MS2 = 9.80665
  private const val DEG_TO_RAD = 0.017453292519943295

  /* Gravity estimate. The phone path feeds TYPE_LINEAR_ACCELERATION, which is
   * gravity-REMOVED; the BMI270 reports total acceleration including gravity.
   * Pushing raw would be a semantic mismatch, not just a unit one, and every
   * downstream threshold assumes the gravity-free convention. So we estimate
   * gravity with a slow EMA and subtract it, which is what Android's own
   * linear-acceleration virtual sensor does internally.
   *
   * alpha = dt / (RC + dt), RC = 1/(2*pi*fc). At 60 Hz with fc = 0.1 Hz this is
   * ~0.010. The cutoff sits an octave below the rep band (Dsp.REP_BAND_LOW_HZ =
   * 0.2 Hz) so slow reps are not attenuated along with gravity.
   */
  private const val GRAVITY_ALPHA = 0.010
  private val gravity = DoubleArray(3)
  private var gravityInit = false

  // ---- config read from the device ----
  @Volatile var deviceOdrHz: Int = 0; private set
  @Volatile var accelScaleGPerLsb: Double = 0.0; private set
  @Volatile var gyroScaleDpsPerLsb: Double = 0.0; private set
  @Volatile var accelFsrG: Int = 0; private set
  @Volatile var gyroFsrDps: Int = 0; private set
  @Volatile var firmware: String = "?"; private set

  // ---- link health (mirrors ble_validate.py's audit) ----
  @Volatile var connected: Boolean = false; private set
  @Volatile var negotiatedMtu: Int = 23; private set
  @Volatile var packets: Long = 0; private set
  @Volatile var samples: Long = 0; private set
  @Volatile var seqGaps: Long = 0; private set
  @Volatile var saturated: Long = 0; private set
  @Volatile var lastDtUs: Int = 0; private set
  @Volatile var lastError: String? = null; private set

  private var gatt: BluetoothGatt? = null
  private var scanning = false
  @Volatile private var connecting = false
  private var prevSeq: Int = -1
  private var prevTsUs: Long = -1
  private var tsWrapOffsetUs: Long = 0

  private var appContext: Context? = null

  fun init(context: Context) { appContext = context.applicationContext }

  private fun adapter(): BluetoothAdapter? =
    (appContext?.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager)?.adapter

  /**
   * Runtime permissions needed to scan and connect. These are *dangerous*
   * permissions: the manifest entry alone is not enough, and without them
   * startScan throws SecurityException (API 31+) or, worse on pre-31, returns
   * zero results silently with no error at all. JS should call
   * `requestBlePermissions()` before selecting the BLE source.
   */
  fun requiredPermissions(): Array<String> =
    if (Build.VERSION.SDK_INT >= 31)
      arrayOf("android.permission.BLUETOOTH_SCAN", "android.permission.BLUETOOTH_CONNECT")
    else
      arrayOf("android.permission.ACCESS_FINE_LOCATION")

  fun missingPermissions(): List<String> {
    val ctx = appContext ?: return requiredPermissions().toList()
    return requiredPermissions().filter {
      ctx.checkSelfPermission(it) != android.content.pm.PackageManager.PERMISSION_GRANTED
    }
  }

  @SuppressLint("MissingPermission")
  fun start() {
    val ctx = appContext ?: run { lastError = "not initialised"; return }
    val missing = missingPermissions()
    if (missing.isNotEmpty()) {
      lastError = "missing permission(s): ${missing.joinToString()}"
      Log.e(TAG, lastError!!)
      return
    }
    val adapter = adapter()
    if (adapter == null || !adapter.isEnabled) { lastError = "bluetooth off"; return }
    if (scanning || connected) return

    resetStats()
    val scanner = adapter.bluetoothLeScanner ?: run { lastError = "no scanner"; return }
    val filters = listOf(ScanFilter.Builder().setDeviceName(DEVICE_NAME).build())
    val settings = ScanSettings.Builder()
      .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
      .build()
    scanning = true
    scanner.startScan(filters, settings, scanCallback)
    Log.i(TAG, "scanning for $DEVICE_NAME")
  }

  @SuppressLint("MissingPermission")
  fun stop() {
    val adapter = adapter()
    if (scanning) {
      adapter?.bluetoothLeScanner?.stopScan(scanCallback)
      scanning = false
    }
    gatt?.disconnect()
    gatt?.close()
    gatt = null
    connecting = false
    connected = false
  }

  private fun resetStats() {
    packets = 0; samples = 0; seqGaps = 0; saturated = 0
    prevSeq = -1; prevTsUs = -1; tsWrapOffsetUs = 0
    gravityInit = false; lastError = null
  }

  private val scanCallback = object : ScanCallback() {
    @SuppressLint("MissingPermission")
    override fun onScanResult(callbackType: Int, result: ScanResult) {
      val dev: BluetoothDevice = result.device ?: return
      val ctx = appContext ?: return
      // stopScan is asynchronous, so a second advertisement can still land here
      // before it takes effect. Observed on hardware: connectGatt ran twice and
      // leaked a second GATT client. Claim the connect exactly once.
      synchronized(this) {
        if (connecting || gatt != null) return
        connecting = true
      }
      adapter()?.bluetoothLeScanner?.stopScan(this)
      scanning = false
      Log.i(TAG, "found ${dev.address}, connecting")
      gatt = dev.connectGatt(ctx, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
    }

    override fun onScanFailed(errorCode: Int) {
      scanning = false
      lastError = "scan failed: $errorCode"
      Log.e(TAG, lastError!!)
    }
  }

  private val gattCallback = object : BluetoothGattCallback() {

    @SuppressLint("MissingPermission")
    override fun onConnectionStateChange(g: BluetoothGatt, status: Int, newState: Int) {
      if (newState == BluetoothProfile.STATE_CONNECTED) {
        connected = true
        // MTU first, then discover: a later MTU change can invalidate cached
        // characteristic sizes on some stacks.
        g.requestMtu(REQUESTED_MTU)
      } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
        connected = false
        connecting = false
        Log.w(TAG, "disconnected (status=$status)")
      }
    }

    @SuppressLint("MissingPermission")
    override fun onMtuChanged(g: BluetoothGatt, mtu: Int, status: Int) {
      negotiatedMtu = mtu
      if (mtu < MIN_USABLE_MTU) {
        // Do not fail silently: a short MTU truncates every notification, which
        // downstream looks like corrupt data rather than a negotiation problem.
        lastError = "MTU $mtu < $MIN_USABLE_MTU — packets will be truncated"
        Log.e(TAG, lastError!!)
      }
      g.discoverServices()
    }

    @SuppressLint("MissingPermission")
    override fun onServicesDiscovered(g: BluetoothGatt, status: Int) {
      val svc = g.getService(SVC_UUID) ?: run {
        lastError = "service not found"; return
      }
      // Read config first so scales are known before the first sample arrives.
      svc.getCharacteristic(CHR_CONFIG)?.let { g.readCharacteristic(it) }
        ?: enableNotifications(g)
    }

    @Deprecated("pre-33 callback")
    @SuppressLint("MissingPermission")
    override fun onCharacteristicRead(
      g: BluetoothGatt, ch: BluetoothGattCharacteristic, status: Int
    ) {
      @Suppress("DEPRECATION")
      if (ch.uuid == CHR_CONFIG) { parseConfig(ch.value); enableNotifications(g) }
    }

    @SuppressLint("MissingPermission")
    override fun onCharacteristicRead(
      g: BluetoothGatt, ch: BluetoothGattCharacteristic, value: ByteArray, status: Int
    ) {
      if (ch.uuid == CHR_CONFIG) { parseConfig(value); enableNotifications(g) }
    }

    @Deprecated("pre-33 callback")
    override fun onCharacteristicChanged(g: BluetoothGatt, ch: BluetoothGattCharacteristic) {
      @Suppress("DEPRECATION")
      if (ch.uuid == CHR_IMU) ch.value?.let { onPacket(it) }
    }

    override fun onCharacteristicChanged(
      g: BluetoothGatt, ch: BluetoothGattCharacteristic, value: ByteArray
    ) {
      if (ch.uuid == CHR_IMU) onPacket(value)
    }
  }

  @SuppressLint("MissingPermission")
  private fun enableNotifications(g: BluetoothGatt) {
    val ch = g.getService(SVC_UUID)?.getCharacteristic(CHR_IMU) ?: run {
      lastError = "imu characteristic not found"; return
    }
    g.setCharacteristicNotification(ch, true)
    val cccd = ch.getDescriptor(CCCD) ?: run { lastError = "no CCCD"; return }
    if (Build.VERSION.SDK_INT >= 33) {
      g.writeDescriptor(cccd, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)
    } else {
      @Suppress("DEPRECATION")
      run {
        cccd.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
        g.writeDescriptor(cccd)
      }
    }
    Log.i(TAG, "notifications enabled (mtu=$negotiatedMtu)")
  }

  private fun parseConfig(v: ByteArray?) {
    if (v == null || v.size < 10) return
    val b = ByteBuffer.wrap(v).order(ByteOrder.LITTLE_ENDIAN)
    deviceOdrHz = b.get().toInt() and 0xFF
    b.get() // samples per packet (read from each packet instead)
    accelScaleGPerLsb = (b.short.toInt() and 0xFFFF) / 1e6
    gyroScaleDpsPerLsb = (b.short.toInt() and 0xFFFF) / 1e4
    accelFsrG = b.get().toInt() and 0xFF
    gyroFsrDps = (b.get().toInt() and 0xFF) * 100
    firmware = "${b.get().toInt() and 0xFF}.${b.get().toInt() and 0xFF}"
    Log.i(TAG, "config odr=$deviceOdrHz fw=$firmware aScale=$accelScaleGPerLsb gScale=$gyroScaleDpsPerLsb")
  }

  /** Parse one notification and push its samples into [ImuPipeline]. */
  private fun onPacket(data: ByteArray) {
    if (data.size < HEADER_BYTES) { lastError = "short packet ${data.size}B"; return }
    val b = ByteBuffer.wrap(data).order(ByteOrder.LITTLE_ENDIAN)
    val seq = b.short.toInt() and 0xFFFF
    val tsUs = b.int.toLong() and 0xFFFFFFFFL
    val n = b.get().toInt() and 0xFF
    b.get() // nominal odr — sanity only; dtUs below is the measured truth
    val dtUs = b.short.toInt() and 0xFFFF

    if (data.size < HEADER_BYTES + n * AXES * 2) {
      // Almost always a too-small MTU rather than a firmware fault.
      lastError = "truncated packet ${data.size}B (mtu=$negotiatedMtu)"
      return
    }

    if (prevSeq >= 0 && seq != ((prevSeq + 1) and 0xFFFF)) seqGaps++
    prevSeq = seq

    /* device_ts_us is uint32 micros() and wraps every 71.6 min, counting from
     * board power-on rather than connect. A backwards step is unambiguously a
     * wrap: seq is monotonic and packets arrive in order.
     */
    if (prevTsUs >= 0 && tsUs < prevTsUs) tsWrapOffsetUs += 0x1_0000_0000L
    prevTsUs = tsUs
    val baseUs = tsUs + tsWrapOffsetUs

    val aScale = if (accelScaleGPerLsb > 0) accelScaleGPerLsb else 0.001
    val gScale = if (gyroScaleDpsPerLsb > 0) gyroScaleDpsPerLsb else 0.0625

    // Host clock stamped once per notification — see ImuSessionLogger on why
    // per-sample host times would be invented precision.
    val hostNs = android.os.SystemClock.elapsedRealtimeNanos()
    val logBlock = if (ImuSessionLogger.active) IntArray(n * AXES) else null

    val raw = IntArray(AXES)
    for (i in 0 until n) {
      for (k in 0 until AXES) {
        val v = b.short.toInt()
        raw[k] = v
        logBlock?.set(i * AXES + k, v)
        // Count saturated VALUES across all six axes, matching ble_validate.py.
        // Clipped data differs in kind from unclipped, so it has to stay
        // visible rather than be quietly trained on.
        if (v == Short.MAX_VALUE.toInt() || v == Short.MIN_VALUE.toInt()) saturated++
      }
      val (axRaw, ayRaw, azRaw) = Triple(raw[0], raw[1], raw[2])
      val gxRaw = raw[3]; val gyRaw = raw[4]; val gzRaw = raw[5]

      // total acceleration, m/s^2
      val ax = axRaw * aScale * G_TO_MS2
      val ay = ayRaw * aScale * G_TO_MS2
      val az = azRaw * aScale * G_TO_MS2

      if (!gravityInit) { gravity[0] = ax; gravity[1] = ay; gravity[2] = az; gravityInit = true }
      gravity[0] += GRAVITY_ALPHA * (ax - gravity[0])
      gravity[1] += GRAVITY_ALPHA * (ay - gravity[1])
      gravity[2] += GRAVITY_ALPHA * (az - gravity[2])

      // Sample i sits at base + i*dt — use the MEASURED dtUs, never 1/odr.
      val tsNs = (baseUs + i.toLong() * dtUs) * 1000L

      ImuPipeline.pushExternalSample(
        ax - gravity[0], ay - gravity[1], az - gravity[2],   // linear accel, m/s^2
        gxRaw * gScale * DEG_TO_RAD,                          // gyro, rad/s
        gyRaw * gScale * DEG_TO_RAD,
        gzRaw * gScale * DEG_TO_RAD,
        tsNs,
      )
      samples++
      lastDtUs = dtUs
    }
    packets++
    // Log the UNWRAPPED device timestamp so downstream never has to redo the
    // 71.6 min rollover correction.
    logBlock?.let { ImuSessionLogger.logPacket(seq, baseUs, n, dtUs, it, hostNs) }
  }
}
