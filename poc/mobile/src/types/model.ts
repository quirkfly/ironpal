// Types for the self-training model layer (design §4–§8, §16). Mirrors the Kotlin engine's
// JSON shapes (ModelParams.kt, SignalEngine.kt) and the store schema (design §7.2).

import type {FeatureVector} from './domain';

export type TemplateKind = 'set' | 'rep' | 'negative' | 'prior';
export type TemplateSource = 'own' | 'founder' | 'gym_pack';
export type LevelState = 'locked' | 'recon' | 'provisional' | 'certified' | 'veteran';
export type RepSignal = 'imu' | 'fusion' | 'vision' | 'hard';

/** The flat JSON the engine consumes (ModelParams.fromJson). Keys are snake_case on purpose. */
export interface EngineParams {
  canonical_rate_hz: number;
  rep_band_low_hz: number;
  rep_band_high_hz: number;
  gate_p_on: number;
  gate_p_off: number;
  gate_e_on: number;
  gate_arm_ticks: number;
  closing_grace_sec: number;
  s_conf_ms_min: number;
  s_conf_ms_max: number;
  peak_height_rms_factor: number;
  t_reject: number;
  t_imu_high: number;
  t_vis_high: number;
  t_ocr: number;
  w_knn: number;
  w_dtw: number;
  feature_weights: {axis: number; cadence: number; duty: number; asym: number; flat: number; jerk: number; gyro: number};
  top_k: number;
  dtw_band: number;
  prior_penalty_per_own: number;
  tick_ms: number;
  window_sec: number;
  negatives_per_session: number;
  per_exercise: Record<string, ExerciseParams>;
}

export interface ExerciseParams {
  cadence_low_hz?: number;
  cadence_high_hz?: number;
  a_min?: number;
  dominant_channel?: number;
  set_duration_median_sec?: number;
  set_duration_iqr_sec?: number;
}

/** Level bars are package config too (design §6.1) but live outside the engine. */
export interface LevelParams {
  provisional: {sets: number; integrity: number};
  certified: {sets: number; weights: number; integrity: number};
  veteran: {sets: number; sessions: number};
  demoteAfterCorrections: number;
  storeCapPerExercise: number;
}

export interface ModelPackage {
  package_version: string;
  engine_min: string;
  store_schema_version: number;
  extractor_version: string;
  signed_at: number;
  params: Partial<EngineParams> & {levels?: Partial<LevelParams>};
  campaign_map: Record<RepSignal, string[]>;
  ontology_ref?: string;
  priors: PriorTemplate[];
  explanations: Record<string, string>;
  smoke: {window_f16: string; channels: number; features: FeatureVector; expect: string}[];
  signature?: string;
}

export interface PriorTemplate {
  id: string;
  exercise_id: string;
  features: FeatureVector;
  window_f16: string;
  channels: number;
}

export interface TemplateRow {
  id: string;
  exerciseId: string;
  kind: TemplateKind;
  source: TemplateSource;
  labeledSetId: string | null;
  sessionId: string | null;
  features: FeatureVector;
  windowF16: string;
  channels: number;
  rateHz: number;
  extractorVersion: string;
  checksum: number;
  pinned: boolean;
  createdAt: number;
}

export interface FittedParam {
  scope: 'exercise' | 'user' | 'user_exercise';
  exerciseId: string | null;
  name: string;
  value: unknown;
  fittedFromN: number;
  packageDefault: unknown;
  updatedAt: number;
}

export interface Candidate {
  exerciseId: string;
  dFused: number;
  dKnn: number;
  dDtw: number;
  templateId: string;
  kind: TemplateKind;
  source: TemplateSource;
}

export interface Match {
  label: string;
  confidence: number;
  margin: number;
  candidates: Candidate[];
  provisional: boolean;
}

export interface RepMark {
  n: number;
  tPeakSec: number;
  amplitude: number;
  tConfirmedSec: number;
}

/** What `SignalModule.endSet` resolves (design §2.2). */
export interface SetResult {
  setId: string;
  sessionId: string | null;
  tStartNs: number;
  tEndNs: number;
  tOpenNs: number;
  tCloseNs: number;
  gateState: string;
  rateHz: number;
  samples: number;
  windowF16: string;
  channels: number;
  hasGyro: boolean;
  reps: RepMark[];
  repsDetected: number;
  features?: FeatureVector;
  match?: Match;
  peaksZeroPhase?: number[];
  cadenceHz?: number;
  periodicity?: number;
  energy?: number;
  dominantChannel?: number;
  seqGaps: number;
  saturated: number;
}

export interface GateEvent {
  setId: string | null;
  from: string;
  to: string;
  atNs: number;
  energy: number;
  periodicity: number;
}
export interface RepEvent {
  setId: string | null;
  n: number;
  tPeakNs: number;
  amplitude: number;
  latencyMs: number;
}
export interface MatchEvent {
  setId: string | null;
  label: string;
  confidence: number;
  provisional: boolean;
}
export interface LinkEvent {
  connected: boolean;
  mtu: number;
  seqGaps: number;
  saturated: number;
}

export interface ScoreAllRow {
  templateId: string;
  exerciseId: string;
  label: string;
  confidence: number;
  topK: {templateId: string; exerciseId: string; dFused: number}[];
}

/** User confirmation of one set (the debrief's four answers). */
export interface ConfirmedSet {
  setId: string;
  sessionId: string;
  exerciseId: string;
  tStartSec: number;
  tEndSec: number;
  repTopsSec: number[];
  repsConfirmed: number | null;
  weight: number | null;
  weightUnit: string;
  weightState: 'confirmed' | 'unreadable' | 'unsure';
  gymId: string | null;
  stationId: string | null;
}

export type DecisionKind = 'exercise' | 'reps' | 'weight' | 'gate' | 'level';

/** A decision with its explanation, generated at decision time (design §5). */
export interface Decision<T = unknown> {
  kind: DecisionKind;
  value: T;
  confidence: number;
  source: 'imu' | 'vision' | 'fused' | 'manual' | 'unknown' | 'prior' | 'rule';
  needsConfirm: boolean;
  explanation: Explanation;
}

export interface Explanation {
  summary: string;
  evidence: Record<string, unknown>;
  alternatives?: {label: string; score: number}[];
  flipIf?: string;
}

export interface LevelProgress {
  exerciseId: string;
  gymId: string | null;
  state: LevelState;
  cleanSets: number;
  distinctWeights: number;
  integrity: number;
  xp: number;
  lastChange: number;
  consecutiveCorrections: number;
  sessionsWithHardMode: number;
}
