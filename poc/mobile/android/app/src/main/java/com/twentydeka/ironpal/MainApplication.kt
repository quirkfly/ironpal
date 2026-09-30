package com.twentydeka.ironpal

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Custom native modules (decision D6 — no react-native-sensors).
          // Raw IMU samples never cross the bridge; only results do.
          add(IronPalPackage())
        },
      // Without this the debug build cannot use Metro. getDefaultReactHost defaults
      // useDevSupport to React Native's OWN BuildConfig.DEBUG, and the prebuilt RN artifacts
      // are built in release — so a debuggable app still took the assets path, failed on a
      // missing index.android.bundle and red-screened with "Unable to load script".
      useDevSupport = BuildConfig.DEBUG,
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
