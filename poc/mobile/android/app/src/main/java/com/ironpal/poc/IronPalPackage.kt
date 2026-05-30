package com.ironpal.poc

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * Registers the custom IronPal native modules (decision D6).
 *
 * ImuModule + SignalModule share a single IMU sampling pipeline (the shared
 * [ImuPipeline] singleton) so raw 50 Hz samples stay native and only results
 * cross the bridge (D1/D6). CameraModule provides CameraX frame access.
 */
class IronPalPackage : ReactPackage {

  override fun createNativeModules(
    reactContext: ReactApplicationContext
  ): List<NativeModule> {
    return listOf(
      ImuModule(reactContext),
      SignalModule(reactContext),
      CameraModule(reactContext),
    )
  }

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): List<ViewManager<*, *>> = emptyList()
}
