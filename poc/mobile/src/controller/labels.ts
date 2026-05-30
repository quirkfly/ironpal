import type {ExerciseLabel} from '../types/domain';

// Human-readable labels and the fixed enrollment label list (spec §5.1).

export const EXERCISE_DISPLAY: Record<ExerciseLabel, string> = {
  bulgarian_split_squat: 'Bulgarian Split Squat',
  triceps_pushdown: 'Triceps Cable Pushdown',
  unknown: '—',
};

/**
 * Enrollment label list (founder-only, Q1). Includes the UNKNOWN seed
 * activities so the matcher can say "not a tracked exercise" (Q4).
 * The seed labels all map to the `unknown` class but are recorded as
 * distinct takes so the founder can seed idle / walking / racking / a
 * bicep curl etc.
 */
export interface EnrollOption {
  /** The class label stored on the template. */
  label: ExerciseLabel;
  /** UI title. */
  title: string;
  /** Optional seed-activity hint shown for UNKNOWN seeds. */
  seedHint?: string;
}

export const ENROLL_OPTIONS: EnrollOption[] = [
  {label: 'bulgarian_split_squat', title: 'Bulgarian Split Squat'},
  {label: 'triceps_pushdown', title: 'Triceps Cable Pushdown'},
  {label: 'unknown', title: 'UNKNOWN: Idle / Rest', seedHint: 'sit/stand still'},
  {label: 'unknown', title: 'UNKNOWN: Walking', seedHint: 'walk to the machine'},
  {
    label: 'unknown',
    title: 'UNKNOWN: Racking / Unracking',
    seedHint: 'rack & unrack weights',
  },
  {
    label: 'unknown',
    title: 'UNKNOWN: Off-target (Bicep Curl)',
    seedHint: 'do a few curls',
  },
];

/** Pushdown is vision-led (spec §6.2) — needs a /vision/recognize call. */
export function isVisionLed(label: ExerciseLabel): boolean {
  return label === 'triceps_pushdown';
}
