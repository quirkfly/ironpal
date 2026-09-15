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
  /**
   * Studio design §11.1: record a per-set clip (720p30 H.264) with ImageAnalysis bound alongside
   * for the glance sharpness selection. Resolves once recording has actually started, with the
   * host time (elapsedRealtimeNanos) pinned to the first frame and how it was pinned.
   */
  startClip(clipId: string, outPath: string): Promise<ClipStartInfo>;
  /** Stop the clip; resolves the final file info. */
  stopClip(): Promise<ClipStopInfo>;
  isRecordingClip(): Promise<boolean>;
}

export interface ClipStartInfo {
  path: string;
  /** Host time at which the clip's PTS = 0. */
  pts0HostNs: number;
  syncSource: 'sensor_timestamps' | 'camera_start';
  /** Whether ImageAnalysis could be bound together with VideoCapture on this device (ledger Q34). */
  analysisBound: boolean;
  width: number;
  height: number;
}
export interface ClipStopInfo {
  path: string;
  durationUs: number;
  bytes: number;
  /** Sharpest still seen by the analysis stream during the glance window, base64 JPEG (null if analysis was not bound). */
  glanceJpegB64: string | null;
  glanceHostNs: number | null;
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
  startClip(clipId: string, outPath: string): Promise<ClipStartInfo> {
    return assertNative().startClip(clipId, outPath);
  },
  stopClip(): Promise<ClipStopInfo> {
    return assertNative().stopClip();
  },
  isRecordingClip(): Promise<boolean> {
    return native ? native.isRecordingClip() : Promise.resolve(false);
  },
};
