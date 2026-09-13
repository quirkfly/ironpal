// ModelParams composition (design §4.3): package defaults first, fitted values override per key
// when present and above their minimum-data rule, with a `source` map for the inspector.

import type {EngineParams, ExerciseParams, FittedParam, LevelParams} from '../types/model';

/** Package `2026.09.0`: the POC's exact constants, so the engine swap changes nothing. */
export const ENGINE_DEFAULTS: EngineParams = {
  canonical_rate_hz: 50,
  rep_band_low_hz: 0.2,
  rep_band_high_hz: 1.5,
  gate_p_on: 0.35,
  gate_p_off: 0.25,
  gate_e_on: 0.02,
  gate_arm_ticks: 2,
  closing_grace_sec: 1.5,
  s_conf_ms_min: 150,
  s_conf_ms_max: 400,
  peak_height_rms_factor: 0.35,
  t_reject: 0.45,
  t_imu_high: 0.7,
  t_vis_high: 0.65,
  t_ocr: 0.6,
  w_knn: 0.6,
  w_dtw: 0.4,
  feature_weights: {axis: 2.0, cadence: 0.8, duty: 1.2, asym: 1.0, flat: 1.0, jerk: 0.8, gyro: 1.5},
  top_k: 8,
  dtw_band: 0.2,
  prior_penalty_per_own: 1 / 3,
  tick_ms: 400,
  window_sec: 4,
  negatives_per_session: 5,
  per_exercise: {},
};

export const LEVEL_DEFAULTS: LevelParams = {
  provisional: {sets: 3, integrity: 0.8},
  certified: {sets: 5, weights: 2, integrity: 0.9},
  veteran: {sets: 3, sessions: 2},
  demoteAfterCorrections: 2,
  storeCapPerExercise: 20,
};

export interface ComposedParams {
  engine: EngineParams;
  levels: LevelParams;
  /** key → 'package' | 'fitted' */
  source: Record<string, 'package' | 'fitted'>;
}

const EXERCISE_KEYS: (keyof ExerciseParams)[] = [
  'cadence_low_hz',
  'cadence_high_hz',
  'a_min',
  'dominant_channel',
  'set_duration_median_sec',
  'set_duration_iqr_sec',
];

/**
 * @param packageParams the active package's `params` (partial; missing keys fall back to defaults)
 * @param fitted rows from `fitted_params` — only those already past their minimum-data rule are
 *   stored, so every row here overrides.
 */
export function compose(
  packageParams: Partial<EngineParams> & {levels?: Partial<LevelParams>},
  fitted: FittedParam[],
): ComposedParams {
  const {levels: pkgLevels, ...pkgEngine} = packageParams;
  const engine: EngineParams = {
    ...ENGINE_DEFAULTS,
    ...pkgEngine,
    feature_weights: {...ENGINE_DEFAULTS.feature_weights, ...(pkgEngine.feature_weights ?? {})},
    per_exercise: {...(pkgEngine.per_exercise ?? {})},
  };
  const levels: LevelParams = {
    ...LEVEL_DEFAULTS,
    ...(pkgLevels ?? {}),
    provisional: {...LEVEL_DEFAULTS.provisional, ...(pkgLevels?.provisional ?? {})},
    certified: {...LEVEL_DEFAULTS.certified, ...(pkgLevels?.certified ?? {})},
    veteran: {...LEVEL_DEFAULTS.veteran, ...(pkgLevels?.veteran ?? {})},
  };
  const source: Record<string, 'package' | 'fitted'> = {};
  for (const key of Object.keys(engine)) {
    source[key] = 'package';
  }
  for (const f of fitted) {
    if (f.scope === 'user' && f.name === 't_reject') {
      engine.t_reject = f.value as number;
      source.t_reject = 'fitted';
    } else if (f.scope === 'exercise' && f.exerciseId && EXERCISE_KEYS.includes(f.name as keyof ExerciseParams)) {
      const ex = (engine.per_exercise[f.exerciseId] = engine.per_exercise[f.exerciseId] ?? {});
      (ex as Record<string, unknown>)[f.name] = f.value;
      source[`per_exercise.${f.exerciseId}.${f.name}`] = 'fitted';
    }
  }
  return {engine, levels, source};
}

/** The exact JSON string `SignalModule.configure` receives. */
export function toEngineJson(engine: EngineParams): string {
  return JSON.stringify(engine);
}
