package com.ironpal.poc

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
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
      // API 34+ requires declaring WHY the service runs in the foreground.
      // CONNECTED_DEVICE is the correct type for a BLE peripheral session;
      // an undeclared or mismatched type throws at startForeground.
      startForeground(NOTIF_ID, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE)
    } else {
      startForeground(NOTIF_ID, notif)
    }
    // STICKY so a low-memory kill restarts capture rather than ending the
    // session without telling anyone.
    return START_STICKY
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
