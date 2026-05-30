import {NativeModules} from 'react-native';

// JS wrapper over the custom Kotlin `CameraModule` (CameraX).
//
// Two jobs (design §4.1):
//  1. Weight glance (Q5): during a ~2 s window, grab the SHARPEST still frame
//     (variance-of-Laplacian sharpness selection done natively) → base64 JPEG.
//  2. Pushdown vision: buffer a short frame sequence for /vision/recognize.

interface CameraNativeModule {
  /**
   * Capture the sharpest still during a glance window (Q5).
   * @param windowMs window length in ms.
   * @returns base64-encoded JPEG of the sharpest frame.
   */
  captureSharpestStill(windowMs: number): Promise<string>;
  /**
   * Capture a short frame sequence for vision recognition (pushdown).
   * @param count number of frames.
   * @param intervalMs spacing between frames.
   * @returns array of base64-encoded JPEGs.
   */
  captureFrameSequence(count: number, intervalMs: number): Promise<string[]>;
}

const native = NativeModules.CameraModule as CameraNativeModule | undefined;

function assertNative(): CameraNativeModule {
  if (!native) {
    throw new Error(
      '[CameraModule] Native module not linked. Build an APK; CameraX ' +
        'frame access cannot run in a JS-only environment.',
    );
  }
  return native;
}

export const CameraModule = {
  captureSharpestStill(windowMs: number): Promise<string> {
    return assertNative().captureSharpestStill(windowMs);
  },
  captureFrameSequence(count: number, intervalMs: number): Promise<string[]> {
    return assertNative().captureFrameSequence(count, intervalMs);
  },
  isAvailable(): boolean {
    return !!native;
  },
};
