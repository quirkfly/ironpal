import {NativeModules, NativeEventEmitter} from 'react-native';
import type {
  FeatureVector,
  MatchResult,
  Template,
} from '../types/domain';

// JS wrapper over the custom Kotlin `SignalModule` (decisions D1/D6).
//
// The DSP (band-pass, autocorrelation periodicity, peak detection, feature
// extraction, kNN, normalized DTW) runs natively over the IMU window buffer
// shared with ImuModule. Only RESULTS cross the bridge: MatchResult events
// during live mode, and an extracted {featureVector, imuSeriesResampled}
// pair when enrollment finishes a take.

interface SignalNativeModule {
  /** Load the synced founder templates into the native matcher cache (D7). */
  setTemplates(templatesJson: string): Promise<void>;
  /** Begin live matching; emits 'SignalResult' events (~2–4 Hz). */
  startLive(): Promise<void>;
  /** Stop live matching. */
  stopLive(): Promise<void>;
  /** Begin recording an enrollment take for the given label. */
  startEnroll(exerciseLabel: string): Promise<void>;
  /**
   * Finish the enrollment take. Resolves with the extracted feature vector
   * and the resampled raw window (both representations — D7), as JSON.
   */
  finishEnroll(): Promise<string>;
}

const native = NativeModules.SignalModule as SignalNativeModule | undefined;

const emitter = native
  ? new NativeEventEmitter(NativeModules.SignalModule)
  : undefined;

interface EnrollResultJson {
  featureVector: FeatureVector;
  imuSeriesResampled: number[][];
  sampleRateHz: number;
}

export interface EnrollResult {
  featureVector: FeatureVector;
  imuSeriesResampled: number[][];
  sampleRateHz: number;
}

function assertNative(): SignalNativeModule {
  if (!native) {
    throw new Error(
      '[SignalModule] Native module not linked. Build an APK; the DSP ' +
        'pipeline runs in Kotlin and cannot run in a JS-only environment.',
    );
  }
  return native;
}

export const SignalModule = {
  async setTemplates(templates: Template[]): Promise<void> {
    await assertNative().setTemplates(JSON.stringify(templates));
  },
  startLive(): Promise<void> {
    return assertNative().startLive();
  },
  stopLive(): Promise<void> {
    return assertNative().stopLive();
  },
  startEnroll(exerciseLabel: string): Promise<void> {
    return assertNative().startEnroll(exerciseLabel);
  },
  async finishEnroll(): Promise<EnrollResult> {
    const json = await assertNative().finishEnroll();
    const parsed = JSON.parse(json) as EnrollResultJson;
    return {
      featureVector: parsed.featureVector,
      imuSeriesResampled: parsed.imuSeriesResampled,
      sampleRateHz: parsed.sampleRateHz,
    };
  },
  /** Subscribe to live match results (exercise/reps/confidence, results only). */
  onResult(cb: (r: MatchResult) => void): () => void {
    if (!emitter) {
      return () => {};
    }
    const sub = emitter.addListener('SignalResult', cb);
    return () => sub.remove();
  },
  isAvailable(): boolean {
    return !!native;
  },
};
