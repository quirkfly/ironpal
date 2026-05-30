import {NativeModules, NativeEventEmitter} from 'react-native';
import type {DeviceInfo} from '../types/domain';

// JS wrapper over the custom Kotlin `ImuModule` (decision D6).
//
// IMPORTANT (D1/D6): raw 50 Hz samples NEVER cross the bridge. This module
// only starts/stops native sampling and reports capability/metadata. The
// continuous IMU stream is consumed entirely inside SignalModule (Kotlin).
// The only IMU "event" surfaced to JS is a coarse motion-gate state change,
// which is cheap and human-paced.

interface ImuNativeModule {
  /** Detect sensors + native rate; returns device metadata (D4/D5). */
  getDeviceInfo(): Promise<DeviceInfo>;
  /** Begin native sampling (linear-accel baseline + gyro when present). */
  start(): Promise<void>;
  /** Stop native sampling. */
  stop(): Promise<void>;
}

const native = NativeModules.ImuModule as ImuNativeModule | undefined;

const emitter = native
  ? new NativeEventEmitter(NativeModules.ImuModule)
  : undefined;

export interface MotionGateEvent {
  /** True = actively repping (energy + periodicity above gate, Q4). */
  repping: boolean;
  energy: number;
  periodicity: number;
}

function assertNative(): ImuNativeModule {
  if (!native) {
    throw new Error(
      '[ImuModule] Native module not linked. Build a debug/release APK; ' +
        'this cannot run in a JS-only environment.',
    );
  }
  return native;
}

export const ImuModule = {
  getDeviceInfo(): Promise<DeviceInfo> {
    return assertNative().getDeviceInfo();
  },
  start(): Promise<void> {
    return assertNative().start();
  },
  stop(): Promise<void> {
    return assertNative().stop();
  },
  /** Subscribe to coarse motion-gate transitions (not the raw stream). */
  onMotionGate(cb: (e: MotionGateEvent) => void): () => void {
    if (!emitter) {
      return () => {};
    }
    const sub = emitter.addListener('ImuMotionGate', cb);
    return () => sub.remove();
  },
  isAvailable(): boolean {
    return !!native;
  },
};
