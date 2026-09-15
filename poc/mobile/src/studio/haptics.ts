import {Vibration} from 'react-native';

// Haptics for the Studio's detents, snaps and pins (studio design §7.4, §7.5, §15).
//
// Every call goes through here for one reason: `Vibration.vibrate` throws
// `SecurityException: Requires VIBRATE permission` and **kills the process** when the permission
// is missing or the device refuses. That crashed the app on the second frame step of e2e flow 07
// (LG G7, Android 10) before `android.permission.VIBRATE` was declared. The permission is
// declared now, but a tick is a nicety and must never be able to take the app down with it — and
// FR-A1 lets the user turn haptics off entirely, which this is the single place to honour.

let enabled = true;

/** Turn every tick on or off (the accessibility/haptics setting — FR-A1). */
export function setHapticsEnabled(on: boolean): void {
  enabled = on;
}

export function hapticsEnabled(): boolean {
  return enabled;
}

/** One tick. `pattern` follows Vibration.vibrate: ms, or an on/off pattern array. */
export function tick(pattern: number | number[] = 10): void {
  if (!enabled) {
    return;
  }
  try {
    Vibration.vibrate(pattern);
  } catch {
    // No vibrator, no permission, or a vendor refusal — silence is the correct outcome.
  }
}

/** A detent on the jog wheel: one frame of travel. */
export const detent = () => tick(10);

/** A placement snapped to a peak. */
export const snapped = () => tick(8);

/** A placement the user pulled OFF the snap — a double tick, so it feels different (§9.1). */
export const offSnap = () => tick([0, 8, 40, 8]);
