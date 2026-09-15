import {NativeModules, NativeEventEmitter} from 'react-native';
import type {FeatureVector, MatchResult, Template} from '../types/domain';
import type {
  IntegrityPreview,
  RangeExplanation,
  ScannedRegion,
  GateEvent,
  LinkEvent,
  MatchEvent,
  RepEvent,
  ScoreAllRow,
  SetResult,
  TemplateRow,
} from '../types/model';

// JS wrapper over the Kotlin `SignalModule` — the bridge for the signal engine (design §9).
// Only results cross (D6): events GateEvent / RepEvent / MatchEvent / LinkEvent, one SetResult
// per set, and per-template scores for integrity. The legacy POC surface (setTemplates,
// startLive/stopLive, startEnroll/finishEnroll) is kept for the founder's prior-pack authoring.

interface SignalNative {
  configure(paramsJson: string, rHeadJson: string | null): Promise<void>;
  loadTemplates(json: string, mode: 'replace' | 'delta'): Promise<{count: number; bytes: number}>;
  startSession(sessionId: string): Promise<void>;
  stopSession(): Promise<{sessionId: string | null; seqGaps: number; saturated: number; negativesHarvested: number}>;
  runCalibration(step: string): Promise<string>;
  computeCalibration(wornGravityJson: string, nodEnergyJson: string): Promise<string>;
  startSet(setId: string, hint: string | null): Promise<void>;
  endSet(setId: string): Promise<string>;
  harvestNegatives(): Promise<string>;
  scoreAll(exerciseIdsJson: string): Promise<string>;
  benchmark(): Promise<{tickMs: number; matchMs: number; templates: number; memMb: number}>;
  // legacy
  setTemplates(templatesJson: string): Promise<void>;
  startLive(): Promise<void>;
  stopLive(): Promise<void>;
  startEnroll(exerciseLabel: string): Promise<void>;
  finishEnroll(): Promise<string>;
}

const native = NativeModules.SignalModule as SignalNative | undefined;
const emitter = native ? new NativeEventEmitter(NativeModules.SignalModule) : undefined;

function assertNative(): SignalNative {
  if (!native) {
    throw new Error(
      '[SignalModule] Native module not linked. Build an APK; the signal engine runs in Kotlin.',
    );
  }
  return native;
}

export interface CalibrationStep {
  step: string;
  samples: number;
  meanAccel?: number[];
  nodGyroEnergy?: number[];
}
export interface CalibrationResult {
  rotation: number[][];
  residualDeg: number;
  nodAxisDominance: number;
  angleToPreviousDeg: number;
}
export interface LoadTemplate {
  id: string;
  exerciseId: string;
  kind: string;
  source: string;
  features: FeatureVector;
  windowF16: string;
  channels: number;
  remove?: boolean;
}

function on<T>(name: string, cb: (e: T) => void): () => void {
  if (!emitter) {
    return () => {};
  }
  const sub = emitter.addListener(name, cb);
  return () => sub.remove();
}

export const SignalModule = {
  isAvailable: () => !!native,

  configure(engineJson: string, rHead: number[][] | null): Promise<void> {
    return assertNative().configure(engineJson, rHead ? JSON.stringify(rHead) : null);
  },
  loadTemplates(templates: LoadTemplate[], ownCounts: Record<string, number>, mode: 'replace' | 'delta') {
    return assertNative().loadTemplates(JSON.stringify({templates, ownCounts}), mode);
  },
  loadTemplateRows(rows: TemplateRow[], ownCounts: Record<string, number>, mode: 'replace' | 'delta') {
    return this.loadTemplates(
      rows.map(r => ({
        id: r.id,
        exerciseId: r.exerciseId,
        kind: r.kind,
        source: r.source,
        features: r.features,
        windowF16: r.windowF16,
        channels: r.channels,
      })),
      ownCounts,
      mode,
    );
  },
  startSession: (sessionId: string) => assertNative().startSession(sessionId),
  stopSession: () => assertNative().stopSession(),
  async runCalibration(step: 'hold_0' | 'hold_1' | 'hold_2' | 'hold_3' | 'hold_4' | 'hold_5' | 'nods'): Promise<CalibrationStep> {
    return JSON.parse(await assertNative().runCalibration(step)) as CalibrationStep;
  },
  async computeCalibration(wornGravity: number[], nodEnergy: number[]): Promise<CalibrationResult> {
    return JSON.parse(
      await assertNative().computeCalibration(JSON.stringify(wornGravity), JSON.stringify(nodEnergy)),
    ) as CalibrationResult;
  },
  startSet: (setId: string, hint: string | null) => assertNative().startSet(setId, hint),
  async endSet(setId: string): Promise<SetResult> {
    return JSON.parse(await assertNative().endSet(setId)) as SetResult;
  },
  async harvestNegatives(): Promise<{windowF16: string; channels: number}[]> {
    return JSON.parse(await assertNative().harvestNegatives());
  },
  async scoreAll(exerciseIds: string[]): Promise<ScoreAllRow[]> {
    return JSON.parse(await assertNative().scoreAll(JSON.stringify(exerciseIds))) as ScoreAllRow[];
  },
  benchmark: () => assertNative().benchmark(),

  onGate: (cb: (e: GateEvent) => void) => on<GateEvent>('GateEvent', cb),
  onRep: (cb: (e: RepEvent) => void) => on<RepEvent>('RepEvent', cb),
  onMatch: (cb: (e: MatchEvent) => void) => on<MatchEvent>('MatchEvent', cb),
  onLink: (cb: (e: LinkEvent) => void) => on<LinkEvent>('LinkEvent', cb),

  // ---- legacy POC surface (founder prior authoring + POC live HUD) ----
  async setTemplates(templates: Template[]): Promise<void> {
    await assertNative().setTemplates(JSON.stringify(templates));
  },
  startLive: () => assertNative().startLive(),
  stopLive: () => assertNative().stopLive(),
  startEnroll: (exerciseLabel: string) => assertNative().startEnroll(exerciseLabel),
  async finishEnroll(): Promise<{featureVector: FeatureVector; imuSeriesResampled: number[][]; sampleRateHz: number}> {
    return JSON.parse(await assertNative().finishEnroll());
  },
  onResult: (cb: (r: MatchResult) => void) => on<MatchResult>('SignalResult', cb),
};

// ---------------------------------------------------------------------------
// Studio bridge additions (studio design §10.2). All ranges are HOST time (elapsedRealtimeNanos).
// ---------------------------------------------------------------------------

interface SignalStudioNative {
  analyzeRange(sessionId: string, t0Ns: number, t1Ns: number, hint: string | null): Promise<string>;
  explainRange(sessionId: string, t0Ns: number, t1Ns: number): Promise<string>;
  scanRegions(sessionId: string): Promise<string>;
  previewIntegrity(exerciseId: string, windowF16: string, channels: number, featuresJson: string, campaignJson: string): Promise<string>;
  peakNear(sessionId: string, tNs: number, windowMs: number): Promise<number>;
  recorderInfo(sessionId: string): Promise<{samples: number; t0Ns: number; t1Ns: number; rateHz: number; loaded: boolean}>;
}

const studioNative = NativeModules.SignalModule as (SignalStudioNative & SignalNative) | undefined;

function assertStudio(): SignalStudioNative {
  if (!studioNative) {
    throw new Error('[SignalModule] Native module not linked.');
  }
  return studioNative;
}

export const SignalStudio = {
  isAvailable: () => !!studioNative,
  /** Full set analysis over an arbitrary host-time range of the session recorder (same shape as endSet). */
  async analyzeRange(sessionId: string, t0Ns: number, t1Ns: number, hint: string | null): Promise<SetResult> {
    return JSON.parse(await assertStudio().analyzeRange(sessionId, t0Ns, t1Ns, hint)) as SetResult;
  },
  async explainRange(sessionId: string, t0Ns: number, t1Ns: number): Promise<RangeExplanation> {
    return JSON.parse(await assertStudio().explainRange(sessionId, t0Ns, t1Ns)) as RangeExplanation;
  },
  /** Periodic windows (≥ 3 cycles) in the whole session — the Reel's candidate untagged sets. */
  async scanRegions(sessionId: string): Promise<ScannedRegion[]> {
    return JSON.parse(await assertStudio().scanRegions(sessionId)) as ScannedRegion[];
  },
  async previewIntegrity(exerciseId: string, windowF16: string, channels: number, features: unknown, campaign: string[]): Promise<IntegrityPreview> {
    return JSON.parse(await assertStudio().previewIntegrity(exerciseId, windowF16, channels, JSON.stringify(features), JSON.stringify(campaign))) as IntegrityPreview;
  },
  /** Host time of the local maximum of the rep channel within ±windowMs of tNs (snap-to-peak). */
  peakNear: (sessionId: string, tNs: number, windowMs: number) => assertStudio().peakNear(sessionId, tNs, windowMs),
  recorderInfo: (sessionId: string) => assertStudio().recorderInfo(sessionId),
};
