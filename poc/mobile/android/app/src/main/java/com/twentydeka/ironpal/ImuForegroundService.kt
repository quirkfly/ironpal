package com.twentydeka.ironpal

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder

/**
 * Keeps the headband BLE stream alive while the screen is off.
 *
 * Without this the session dies silently. A gym session is ~65 min with the
 * phone pocketed, and Android aggressively suspends background processes once
 * the screen goes off — BLE callbacks simply stop arriving. The failure mode is
 * the bad one: the app looks fine, the log just ends early, and it is only
 * noticed at ingest. A foreground service with an ongoing notification is what
 * exempts the process.
 *
 * The notification is also the founder's only in-gym signal that capture is
 * still running, so it carries live packet counts rather than a static string.
 */
class ImuForegroundService : Service() {

  companion object {
    private const val CHANNEL_ID = "ironpal_capture"
    private const val NOTIF_ID = 4201

    fun start(context: Context) {
      val i = Intent(context, ImuForegroundService::class.java)
      if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(i)
      else context.startService(i)
    }

    fun stop(context: Context) {
      context.stopService(Intent(context, ImuForegroundService::class.java))
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    if (Build.VERSION.SDK_INT >= 26) {
      val ch = NotificationChannel(
        CHANNEL_ID, "IronPal capture", NotificationManager.IMPORTANCE_LOW
      )
      ch.setShowBadge(false)
      (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
        .createNotificationChannel(ch)
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val notif = buildNotification()
    if (Build.VERSION.SDK_INT >= 34) {
      /* API 34+ requires declaring WHY the service runs in the foreground, and the platform
       * VALIDATES the claim: CONNECTED_DEVICE additionally demands that a Bluetooth runtime
       * permission actually be GRANTED, not merely declared in the manifest.
       *
       * That is a crash, not a warning. With the phone IMU (or the e2e replay source) nothing
       * ever requests Bluetooth, so startForeground threw SecurityException and killed the
       * process on every session start — the app relaunched and died again ("IronPal POC keeps
       * stopping"). It went unnoticed because the headband path was the only one exercised by
       * hand, and it was the e2e suite that surfaced it.
       *
       * So pick the type from what the service is actually doing: CONNECTED_DEVICE only when a
       * BLE session is genuinely permitted, otherwise DATA_SYNC, which is the honest description
       * of buffering on-board sensor samples. Both are declared in the manifest.
       */
      startForeground(NOTIF_ID, notif, foregroundType())
    } else {
      startForeground(NOTIF_ID, notif)
    }
    // STICKY so a low-memory kill restarts capture rather than ending the
    // session without telling anyone.
    return START_STICKY
  }

  /** CONNECTED_DEVICE is only legal with a granted Bluetooth permission; otherwise DATA_SYNC. */
  private fun foregroundType(): Int {
    val bleGranted = Build.VERSION.SDK_INT < 31 ||
      checkSelfPermission(android.Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED ||
      checkSelfPermission(android.Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED
    return if (ImuPipeline.source == ImuPipeline.Source.BLE && bleGranted) {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE
    } else {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
    }
  }

  override fun onDestroy() {
    super.onDestroy()
  }

  private fun buildNotification(): Notification {
    val builder = if (Build.VERSION.SDK_INT >= 26)
      Notification.Builder(this, CHANNEL_ID) else @Suppress("DEPRECATION") Notification.Builder(this)
    val state = if (BleImuSource.connected) "streaming" else "searching for headband"
    return builder
      .setContentTitle("IronPal — capturing")
      .setContentText("$state · ${BleImuSource.samples} samples")
      .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
      .setOngoing(true)
      .build()
  }
}
