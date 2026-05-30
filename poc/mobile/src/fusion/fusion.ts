import {T_IMU_HIGH, T_OCR, T_REJECT, T_VIS_HIGH} from '../config';
import type {
  ExerciseLabel,
  MatchResult,
  MetricSource,
  RecognizeVisionResult,
  WeightVisionResult,
} from '../types/domain';

// Fusion / decision logic (spec §7). A small, explicit rule set — 3-way incl.
// UNKNOWN (Q4). On-device IMU leads the split squat; backend vision leads the
// pushdown. Every uncertain call routes to the confirm/correct screen.

export interface ExerciseDecision {
  exercise: ExerciseLabel;
  confidence: number;
  source: MetricSource;
  /** True → route to confirm screen (ambiguous / low confidence). */
  needsConfirm: boolean;
}

export interface RepsDecision {
  reps: number | null;
  confidence: number;
  source: MetricSource;
  needsConfirm: boolean;
}

export interface WeightDecision {
  weight: number | null;
  unit: string;
  confidence: number;
  source: MetricSource;
  needsConfirm: boolean;
}

/**
 * Decide the exercise label from the on-device IMU match and (optionally) the
 * backend vision result. Implements the §7 EXERCISE ladder verbatim.
 */
export function fuseExercise(
  imu: MatchResult,
  vision: RecognizeVisionResult | null,
): ExerciseDecision {
  // Motion gate first (Q4): not actively repping → UNKNOWN, no scoring.
  if (!imu.isRepping) {
    return {
      exercise: 'unknown',
      confidence: imu.confidence,
      source: 'unknown',
      needsConfirm: false,
    };
  }
  // Forgiving matcher's safety net.
  if (imu.confidence < T_REJECT && (!vision || vision.confidence < T_VIS_HIGH)) {
    return {
      exercise: 'unknown',
      confidence: imu.confidence,
      source: 'unknown',
      needsConfirm: false,
    };
  }
  // IMU high → trust IMU (split squat / A path).
  if (imu.confidence >= T_IMU_HIGH && imu.exercise !== 'unknown') {
    return {
      exercise: imu.exercise,
      confidence: imu.confidence,
      source: 'imu',
      needsConfirm: false,
    };
  }
  // Vision high → trust vision (pushdown / B path).
  if (vision && vision.confidence >= T_VIS_HIGH) {
    return {
      exercise: vision.exercise,
      confidence: vision.confidence,
      source: 'vision',
      needsConfirm: false,
    };
  }
  // Agreement → high-confidence fused.
  if (vision && imu.exercise === vision.exercise && imu.exercise !== 'unknown') {
    return {
      exercise: imu.exercise,
      confidence: Math.max(imu.confidence, vision.confidence),
      source: 'fused',
      needsConfirm: false,
    };
  }
  // Otherwise ambiguous → ask the user to confirm.
  const best =
    vision && vision.confidence > imu.confidence
      ? {exercise: vision.exercise, confidence: vision.confidence, source: 'vision' as MetricSource}
      : {exercise: imu.exercise, confidence: imu.confidence, source: 'imu' as MetricSource};
  return {...best, needsConfirm: true};
}

/**
 * Decide reps. If the chosen exercise has a strong IMU rep signal (split
 * squat), use IMU peak count; otherwise (pushdown) use the vision count.
 */
export function fuseReps(
  exercise: ExerciseLabel,
  imu: MatchResult,
  vision: RecognizeVisionResult | null,
): RepsDecision {
  if (exercise === 'unknown') {
    return {reps: null, confidence: 0, source: 'unknown', needsConfirm: false};
  }
  if (exercise === 'bulgarian_split_squat') {
    // Strong IMU rep signal (A). Flag if vision disagrees by > 1.
    const needsConfirm =
      vision != null && Math.abs(imu.reps - vision.reps) > 1;
    return {
      reps: imu.reps,
      confidence: imu.confidence,
      source: 'imu',
      needsConfirm,
    };
  }
  // Pushdown (B): vision leads; head IMU is near-flat.
  if (vision) {
    return {
      reps: vision.reps,
      confidence: vision.confidence,
      source: 'vision',
      needsConfirm: vision.confidence < T_VIS_HIGH,
    };
  }
  // Vision not yet returned (pending) — no reps yet.
  return {reps: null, confidence: 0, source: 'vision', needsConfirm: false};
}

/**
 * Decide weight from OCR. Below T_OCR → prompt manual confirm (§7 WEIGHT).
 */
export function fuseWeight(
  ocr: WeightVisionResult | null,
): WeightDecision {
  if (!ocr) {
    return {
      weight: null,
      unit: 'kg',
      confidence: 0,
      source: 'vision',
      needsConfirm: false,
    };
  }
  return {
    weight: ocr.weight,
    unit: ocr.unit,
    confidence: ocr.confidence,
    source: 'vision',
    needsConfirm: ocr.confidence < T_OCR,
  };
}
