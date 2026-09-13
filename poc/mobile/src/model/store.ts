// Data access for the model store (design §7). Thin, explicit SQL over the shared SQLite
// handle; every write that must be atomic runs inside `transaction`.

import {getDb} from '../store/db';
import type {
  Decision,
  FittedParam,
  LevelProgress,
  LevelState,
  TemplateKind,
  TemplateRow,
  TemplateSource,
} from '../types/model';

type Row = Record<string, unknown>;

async function all(sql: string, params: unknown[] = []): Promise<Row[]> {
  const db = await getDb();
  const [res] = await db.executeSql(sql, params);
  const out: Row[] = [];
  for (let i = 0; i < res.rows.length; i++) {
    out.push(res.rows.item(i) as Row);
  }
  return out;
}

async function run(sql: string, params: unknown[] = []): Promise<void> {
  const db = await getDb();
  await db.executeSql(sql, params);
}

export async function transaction(fn: () => Promise<void>): Promise<void> {
  await run('BEGIN');
  try {
    await fn();
    await run('COMMIT');
  } catch (e) {
    await run('ROLLBACK');
    throw e;
  }
}

// ---------------------------------------------------------------- templates

function rowToTemplate(r: Row): TemplateRow {
  return {
    id: r.id as string,
    exerciseId: r.exercise_id as string,
    kind: r.kind as TemplateKind,
    source: r.source as TemplateSource,
    labeledSetId: (r.labeled_set_id as string) ?? null,
    sessionId: (r.session_id as string) ?? null,
    features: JSON.parse(r.features as string),
    windowF16: r.window_f16 as string,
    channels: r.channels as number,
    rateHz: r.rate_hz as number,
    extractorVersion: r.extractor_version as string,
    checksum: r.checksum as number,
    pinned: !!r.pinned,
    createdAt: r.created_at as number,
  };
}

export async function insertTemplate(t: TemplateRow, canonicalRotation: number[][] | null): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO model_templates
       (id, exercise_id, kind, source, labeled_set_id, session_id, features, window_f16, channels, rate_hz,
        canonical_rotation, extractor_version, checksum, pinned, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      t.id, t.exerciseId, t.kind, t.source, t.labeledSetId, t.sessionId, JSON.stringify(t.features),
      t.windowF16, t.channels, t.rateHz, canonicalRotation ? JSON.stringify(canonicalRotation) : null,
      t.extractorVersion, t.checksum, t.pinned ? 1 : 0, t.createdAt,
    ],
  );
}

export async function deleteTemplatesForSet(labeledSetId: string): Promise<string[]> {
  const rows = await all('SELECT id FROM model_templates WHERE labeled_set_id = ?', [labeledSetId]);
  await run('DELETE FROM model_templates WHERE labeled_set_id = ?', [labeledSetId]);
  return rows.map(r => r.id as string);
}

export async function templates(filter: {exerciseIds?: string[]; kinds?: TemplateKind[]; sources?: TemplateSource[]} = {}): Promise<TemplateRow[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.exerciseIds?.length) {
    where.push(`exercise_id IN (${filter.exerciseIds.map(() => '?').join(',')})`);
    params.push(...filter.exerciseIds);
  }
  if (filter.kinds?.length) {
    where.push(`kind IN (${filter.kinds.map(() => '?').join(',')})`);
    params.push(...filter.kinds);
  }
  if (filter.sources?.length) {
    where.push(`source IN (${filter.sources.map(() => '?').join(',')})`);
    params.push(...filter.sources);
  }
  const rows = await all(
    `SELECT * FROM model_templates ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at`,
    params,
  );
  return rows.map(rowToTemplate);
}

/** Own `set` templates per exercise — the prior weighting input (design §3.5). */
export async function ownSetCounts(): Promise<Record<string, number>> {
  const rows = await all(
    `SELECT exercise_id, COUNT(*) AS n FROM model_templates WHERE source='own' AND kind='set' GROUP BY exercise_id`,
  );
  const out: Record<string, number> = {};
  for (const r of rows) {
    out[r.exercise_id as string] = r.n as number;
  }
  return out;
}

// ---------------------------------------------------------------- labeled sets

export interface LabeledSetRow {
  id: string;
  sessionId: string;
  exerciseId: string;
  tStart: number;
  tEnd: number;
  repMarks: number[];
  repsConfirmed: number | null;
  repsDetected: number | null;
  weightDeclared: number | null;
  weightUnit: string | null;
  weightOcr: number | null;
  weightOcrConf: number | null;
  weightState: string;
  cadenceHz: number | null;
  ampMedian: number | null;
  dominantChannel: number | null;
  durationSec: number | null;
  gates: Record<string, boolean>;
  counted: boolean;
  createdAt: number;
}

export async function insertLabeledSet(s: LabeledSetRow): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO labeled_sets
       (id, session_id, exercise_id, t_start, t_end, rep_marks, reps_confirmed, reps_detected,
        weight_declared, weight_unit, weight_ocr, weight_ocr_conf, weight_state,
        cadence_hz, amp_median, dominant_channel, duration_sec, gates_json, counted, clip_path, clip_state, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      s.id, s.sessionId, s.exerciseId, s.tStart, s.tEnd, JSON.stringify(s.repMarks), s.repsConfirmed, s.repsDetected,
      s.weightDeclared, s.weightUnit, s.weightOcr, s.weightOcrConf, s.weightState,
      s.cadenceHz, s.ampMedian, s.dominantChannel, s.durationSec, JSON.stringify(s.gates), s.counted ? 1 : 0, null, null, s.createdAt,
    ],
  );
}

export async function labeledSets(exerciseId: string, countedOnly = true): Promise<LabeledSetRow[]> {
  const rows = await all(
    `SELECT * FROM labeled_sets WHERE exercise_id = ? ${countedOnly ? 'AND counted = 1' : ''} ORDER BY created_at`,
    [exerciseId],
  );
  return rows.map(r => ({
    id: r.id as string,
    sessionId: r.session_id as string,
    exerciseId: r.exercise_id as string,
    tStart: r.t_start as number,
    tEnd: r.t_end as number,
    repMarks: JSON.parse(r.rep_marks as string),
    repsConfirmed: (r.reps_confirmed as number) ?? null,
    repsDetected: (r.reps_detected as number) ?? null,
    weightDeclared: (r.weight_declared as number) ?? null,
    weightUnit: (r.weight_unit as string) ?? null,
    weightOcr: (r.weight_ocr as number) ?? null,
    weightOcrConf: (r.weight_ocr_conf as number) ?? null,
    weightState: r.weight_state as string,
    cadenceHz: (r.cadence_hz as number) ?? null,
    ampMedian: (r.amp_median as number) ?? null,
    dominantChannel: (r.dominant_channel as number) ?? null,
    durationSec: (r.duration_sec as number) ?? null,
    gates: JSON.parse(r.gates_json as string),
    counted: !!r.counted,
    createdAt: r.created_at as number,
  }));
}

export async function deleteLabeledSet(id: string): Promise<void> {
  await run('DELETE FROM labeled_sets WHERE id = ?', [id]);
}

// ---------------------------------------------------------------- fitted params

export async function upsertFitted(p: FittedParam): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO fitted_params (scope, exercise_id, name, value, fitted_from_n, package_default, updated_at)
     VALUES (?,?,?,?,?,?,?)`,
    [p.scope, p.exerciseId ?? '', p.name, JSON.stringify(p.value), p.fittedFromN, JSON.stringify(p.packageDefault ?? null), p.updatedAt],
  );
}

export async function fittedParams(): Promise<FittedParam[]> {
  const rows = await all('SELECT * FROM fitted_params');
  return rows.map(r => ({
    scope: r.scope as FittedParam['scope'],
    exerciseId: (r.exercise_id as string) || null,
    name: r.name as string,
    value: JSON.parse(r.value as string),
    fittedFromN: r.fitted_from_n as number,
    packageDefault: JSON.parse((r.package_default as string) ?? 'null'),
    updatedAt: r.updated_at as number,
  }));
}

export async function deleteFittedForExercise(exerciseId: string): Promise<void> {
  await run(`DELETE FROM fitted_params WHERE scope='exercise' AND exercise_id = ?`, [exerciseId]);
}

// ---------------------------------------------------------------- levels

export async function levelProgress(exerciseId: string, gymId: string | null): Promise<LevelProgress | null> {
  const rows = await all('SELECT * FROM level_progress WHERE exercise_id = ? AND gym_id = ?', [exerciseId, gymId ?? '']);
  if (!rows.length) {
    return null;
  }
  const r = rows[0];
  return {
    exerciseId,
    gymId,
    state: r.state as LevelState,
    cleanSets: r.clean_sets as number,
    distinctWeights: r.distinct_weights as number,
    integrity: r.integrity as number,
    xp: r.xp as number,
    lastChange: r.last_change as number,
    consecutiveCorrections: r.consecutive_corrections as number,
    sessionsWithHardMode: r.sessions_with_hard_mode as number,
  };
}

export async function allLevelProgress(): Promise<LevelProgress[]> {
  const rows = await all('SELECT * FROM level_progress');
  return rows.map(r => ({
    exerciseId: r.exercise_id as string,
    gymId: (r.gym_id as string) || null,
    state: r.state as LevelState,
    cleanSets: r.clean_sets as number,
    distinctWeights: r.distinct_weights as number,
    integrity: r.integrity as number,
    xp: r.xp as number,
    lastChange: r.last_change as number,
    consecutiveCorrections: r.consecutive_corrections as number,
    sessionsWithHardMode: r.sessions_with_hard_mode as number,
  }));
}

export async function saveLevelProgress(p: LevelProgress): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO level_progress
       (exercise_id, gym_id, state, clean_sets, distinct_weights, integrity, xp, last_change, consecutive_corrections, sessions_with_hard_mode)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [p.exerciseId, p.gymId ?? '', p.state, p.cleanSets, p.distinctWeights, p.integrity, p.xp, p.lastChange, p.consecutiveCorrections, p.sessionsWithHardMode],
  );
}

// ---------------------------------------------------------------- decisions / audit / meta

export async function insertDecision(id: string, sessionId: string | null, labeledSetId: string | null, d: Decision): Promise<void> {
  await run(
    `INSERT INTO decisions (id, session_id, labeled_set_id, kind, value, confidence, source, explanation, created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, sessionId, labeledSetId, d.kind, JSON.stringify(d.value), d.confidence, d.source, JSON.stringify(d.explanation), Date.now()],
  );
}

export async function audit(exerciseId: string | null, change: Record<string, unknown>, integrityAfter: number | null): Promise<void> {
  await run('INSERT INTO model_audit (at, exercise_id, change, integrity_after) VALUES (?,?,?,?)', [
    Date.now(), exerciseId, JSON.stringify(change), integrityAfter,
  ]);
}

export async function auditRows(limit = 100): Promise<{at: number; exerciseId: string | null; change: Record<string, unknown>; integrityAfter: number | null}[]> {
  const rows = await all('SELECT * FROM model_audit ORDER BY id DESC LIMIT ?', [limit]);
  return rows.map(r => ({at: r.at as number, exerciseId: (r.exercise_id as string) ?? null, change: JSON.parse(r.change as string), integrityAfter: (r.integrity_after as number) ?? null}));
}

export async function recordIntegrity(exerciseId: string, sessionId: string | null, value: number): Promise<void> {
  await run('INSERT INTO integrity_history (exercise_id, session_id, value, at) VALUES (?,?,?,?)', [exerciseId, sessionId, value, Date.now()]);
}

export async function getMeta(key: string): Promise<string | null> {
  const rows = await all('SELECT value FROM model_meta WHERE key = ?', [key]);
  return rows.length ? (rows[0].value as string) : null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await run('INSERT OR REPLACE INTO model_meta (key, value) VALUES (?,?)', [key, value]);
}

export async function upsertWeightPrior(exerciseId: string, gymId: string | null, stationId: string | null, weight: number, unit: string): Promise<void> {
  await run(
    'INSERT OR REPLACE INTO weight_priors (exercise_id, gym_id, station_id, weight, unit, last_used) VALUES (?,?,?,?,?,?)',
    [exerciseId, gymId ?? '', stationId ?? '', weight, unit, Date.now()],
  );
}

export async function weightPrior(exerciseId: string, gymId: string | null): Promise<{weight: number; unit: string} | null> {
  const rows = await all('SELECT weight, unit FROM weight_priors WHERE exercise_id = ? AND gym_id = ? ORDER BY last_used DESC LIMIT 1', [exerciseId, gymId ?? '']);
  return rows.length ? {weight: rows[0].weight as number, unit: rows[0].unit as string} : null;
}

/** Full erasure of the model (design §7.1). The caller destroys the Keystore key afterwards. */
export async function eraseAll(): Promise<void> {
  await transaction(async () => {
    for (const t of ['model_templates', 'fitted_params', 'model_sessions', 'labeled_sets', 'exemplar_frames', 'weight_priors', 'level_progress', 'integrity_history', 'decisions', 'model_audit', 'quarantine', 'model_meta']) {
      await run(`DELETE FROM ${t}`);
    }
  });
}
