// Shared domain types for the IronPal POC mobile app.
// These mirror the design doc §4.3 schema and §6 API contract so the
// TS layer, native bridge results, and backend payloads all speak the
// same vocabulary.

/** The three recognition outcomes — 3-way incl. UNKNOWN (spec Q4). */
export type ExerciseLabel =
  | 'bulgarian_split_squat'
  | 'triceps_pushdown'
  | 'unknown';

/** Where a given metric's value came from (design §4.3 *_source columns). */
export type MetricSource =
  | 'imu'
  | 'vision'
  | 'fused'
  | 'manual'
  | 'unknown';

export type AppMode = 'enroll' | 'live';
export type UserRole = 'founder' | 'tester';

/**
 * Normalized, tempo/amplitude/orientation-invariant feature vector
 * extracted on-device (design §5.4 / Q6). Accel-only baseline; gyro
 * fields are present only when has_gyro (D5).
 */
export interface FeatureVector {
  /** Per-axis energy as a fraction of total accel energy (orientation-robust). */
  axisEnergyRatio: [number, number, number];
  /** Dominant rep cadence in Hz, from autocorrelation/peak spacing. */
  normalizedCadenceHz: number;
  /** Ratio of active-motion duration to total window (shape descriptor). */
  motionDutyRatio: number;
  /** Peak shape: mean rise/fall asymmetry of detected rep cycles, in [-1,1]. */
  peakAsymmetry: number;
  /** Spectral flatness of the band-passed dominant axis (periodicity quality). */
  spectralFlatness: number;
  /** Mean absolute jerk normalized by accel amplitude (smooth vs. jerky). */
  normalizedJerk: number;
  /** Gyro rotation energy ratio per axis — only meaningful when hasGyro (D5). */
  gyroEnergyRatio?: [number, number, number];
  /** Whether gyro features above are populated (D5). */
  hasGyro: boolean;
}

/**
 * A founder-authored template (design §4.3 templates table). Synced to the
 * device and carries BOTH representations (D7): the feature vector (kNN)
 * and the resampled raw window (normalized-DTW).
 */
export interface Template {
  id: string;
  exerciseLabel: ExerciseLabel;
  takeId: number;
  deviceOrientation: Record<string, unknown> | null;
  sampleRateHz: number;
  featureVector: FeatureVector;
  /**
   * Resampled raw IMU window for normalized-DTW (D4/D7).
   * Shape: [N samples][3 accel axes] (+ optionally 3 gyro axes when hasGyro).
   */
  imuSeriesResampled: number[][];
  version: number;
}

/** Result emitted by SignalModule's matcher (native → JS, results only — D6). */
export interface MatchResult {
  exercise: ExerciseLabel;
  reps: number;
  /** 0..1 recognition confidence; below T_reject the exercise is 'unknown'. */
  confidence: number;
  /** True when the motion gate says the user is actively repping (Q4). */
  isRepping: boolean;
  /** kNN best distance (debug/telemetry). */
  knnDistance: number;
  /** Normalized-DTW best distance (debug/telemetry). */
  dtwDistance: number;
}

/** Device capability/metadata captured natively (D4/D5). */
export interface DeviceInfo {
  deviceModel: string;
  sensorInfo: Record<string, unknown>;
  /** Native sampling rate BEFORE resample-to-canonical (D4). */
  sampleRateHz: number;
  hasGyro: boolean;
}

/** A single confidence-tagged metric on the HUD / in a session row. */
export interface DetectedMetric<T> {
  value: T | null;
  confidence: number | null;
  source: MetricSource;
  /** Pending = an async LLM value not yet returned (Q8 "…"). */
  pending: boolean;
}

/** Live HUD state assembled by the mode controller. */
export interface HudState {
  exercise: DetectedMetric<ExerciseLabel>;
  reps: DetectedMetric<number>;
  weight: DetectedMetric<number>;
  weightUnit: string;
  setNumber: number;
  recording: boolean;
  weightGlancePrompt: boolean;
}

/**
 * A completed set written locally and POSTed to /sessions (design §6).
 * Carries detected + corrected values, sources, confidences, and the
 * device metadata required by D4/D5/Q4.
 */
export interface SessionSet {
  id: string;
  startedAt: string;
  endedAt: string;

  detectedExercise: ExerciseLabel | null;
  exerciseConfidence: number | null;
  exerciseSource: MetricSource;

  detectedReps: number | null;
  repsConfidence: number | null;
  repsSource: MetricSource;

  detectedWeight: number | null;
  weightConfidence: number | null;
  weightSource: MetricSource;

  correctedExercise: ExerciseLabel | null;
  correctedReps: number | null;
  correctedWeight: number | null;

  isRestWindow: boolean;

  deviceModel: string;
  sensorInfo: Record<string, unknown>;
  sampleRateHz: number;
  hasGyro: boolean;

  llmCalls: number;
  llmCostEstimate: number;
  notes: string | null;
}

/** Vision OCR result (design §6 POST /vision/weight). */
export interface WeightVisionResult {
  weight: number;
  unit: string;
  confidence: number;
}

/** Vision recognition result (design §6 POST /vision/recognize). */
export interface RecognizeVisionResult {
  exercise: ExerciseLabel;
  reps: number;
  confidence: number;
}
