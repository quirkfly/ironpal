import {NativeModules, NativeEventEmitter, PermissionsAndroid, Platform} from 'react-native';
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
  /** Select the sample source. Must precede start() (Q1/Q2). */
  setSource(source: ImuSource): Promise<void>;
  /** Start logging imu.jsonl + meta.json; returns the session directory. */
  startSession(sessionId: string): Promise<string>;
  /** Flush the log, write final meta.json, release the foreground service. */
  stopSession(): Promise<string | null>;
  /** Free space on the volume holding session logs (blocking pre-session gate). */
  getFreeSpace(): Promise<FreeSpace>;
}

export interface FreeSpace {
  freeBytes: number;
  freeGb: number;
  /** Rough capture minutes at this rig's ~470 MB/min 4K rate. */
  estimatedMinutes: number;
  path: string;
}

/**
 * `phone` is POC v1's on-board IMU. `ble` is the headband unit
 * (poc/firmware) used by the collection rig. Both fill the same native
 * buffers, so nothing downstream of this choice differs.
 */
export type ImuSource = 'PHONE' | 'BLE';

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
  setSource(source: ImuSource): Promise<void> {
    return assertNative().setSource(source);
  },
  /**
   * Apply the rig flag before sampling starts. Returns the source actually
   * selected — which may be 'PHONE' even when 'BLE' was asked for, if the
   * permissions were declined. Falling back is deliberate: a session with the
   * phone IMU is degraded but still usable, whereas one with no IMU is not.
   */
  async prepare(source: ImuSource): Promise<ImuSource> {
    if (source === 'BLE') {
      const ok = await this.requestBlePermissions();
      if (!ok) {
        await this.setSource('PHONE');
        return 'PHONE';
      }
    }
    await this.setSource(source);
    return source;
  },
  startSession(sessionId: string): Promise<string> {
    return assertNative().startSession(sessionId);
  },
  stopSession(): Promise<string | null> {
    return assertNative().stopSession();
  },
  getFreeSpace(): Promise<FreeSpace> {
    return assertNative().getFreeSpace();
  },
  /**
   * Request the runtime permissions BLE scanning needs. Call this before
   * setSource('BLE'); the manifest entries are not sufficient on their own.
   * Returns true if every required permission was granted.
   *
   * Pre-31 needs ACCESS_FINE_LOCATION: without it a scan returns zero devices
   * silently, which is indistinguishable from the headband being off.
   */
  async requestBlePermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    const wanted =
      Platform.Version >= 31
        ? [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]
        : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
    const res = await PermissionsAndroid.requestMultiple(wanted);
    return wanted.every(
      p => res[p] === PermissionsAndroid.RESULTS.GRANTED,
    );
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
