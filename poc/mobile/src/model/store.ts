// Data access for the model store (design §7). Thin, explicit SQL over the shared SQLite
// handle; every write that must be atomic runs inside `transaction`.

import {getDb} from '../store/db';
import type {
  ClipRow,
  Decision,
  FittedParam,
  QueueItem,
  RegionRow,
  StudioEvent,
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
  // ---- v2 (studio design §12); optional so legacy callers and rows keep working ----
  labelSource?: 'debrief' | 'studio' | 'live';
  revision?: number;
  imuAvailable?: boolean;
  clipId?: string | null;
  /** Host-time bounds (elapsedRealtimeNanos) — what the Studio's timeline is drawn in. */
  tStartHostNs?: number | null;
  tEndHostNs?: number | null;
  /** The analysed window, kept so a set can be re-opened in the Studio without the engine. */
  windowF16?: string | null;
  channels?: number | null;
  rateHz?: number | null;
  /** The full SetResult JSON at save time (proposals can be re-rendered from it). */
  resultJson?: string | null;
  /** Per-mark snap flags parallel to repMarks (v2 rows); undefined for legacy rows. */
  repMarksSnapped?: boolean[];
}

/** rep_marks accepts both the legacy array of seconds and the v2 array of {t, snapped} (design §10.3). */
export function parseRepMarks(json: string): {t: number[]; snapped: boolean[] | undefined} {
  const raw = JSON.parse(json) as unknown;
  if (!Array.isArray(raw)) {
    return {t: [], snapped: undefined};
  }
  if (raw.length && typeof raw[0] === 'object' && raw[0] !== null) {
    const objs = raw as {t: number; snapped?: boolean}[];
    return {t: objs.map(o => o.t), snapped: objs.map(o => o.snapped !== false)};
  }
  return {t: raw as number[], snapped: undefined};
}

export function serializeRepMarks(t: number[], snapped?: boolean[]): string {
  if (!snapped) {
    return JSON.stringify(t);
  }
  return JSON.stringify(t.map((x, i) => ({t: x, snapped: snapped[i] !== false})));
}

export async function insertLabeledSet(s: LabeledSetRow): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO labeled_sets
       (id, session_id, exercise_id, t_start, t_end, rep_marks, reps_confirmed, reps_detected,
        weight_declared, weight_unit, weight_ocr, weight_ocr_conf, weight_state,
        cadence_hz, amp_median, dominant_channel, duration_sec, gates_json, counted, clip_path, clip_state, created_at,
        label_source, revision, imu_available, clip_id, t_start_host_ns, t_end_host_ns, window_f16, channels, rate_hz, result_json)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      s.id, s.sessionId, s.exerciseId, s.tStart, s.tEnd, serializeRepMarks(s.repMarks, s.repMarksSnapped), s.repsConfirmed, s.repsDetected,
      s.weightDeclared, s.weightUnit, s.weightOcr, s.weightOcrConf, s.weightState,
      s.cadenceHz, s.ampMedian, s.dominantChannel, s.durationSec, JSON.stringify(s.gates), s.counted ? 1 : 0, null, null, s.createdAt,
      s.labelSource ?? 'debrief', s.revision ?? 1, s.imuAvailable === false ? 0 : 1, s.clipId ?? null,
      s.tStartHostNs ?? null, s.tEndHostNs ?? null, s.windowF16 ?? null, s.channels ?? null, s.rateHz ?? null, s.resultJson ?? null,
    ],
  );
}

function rowToLabeledSet(r: Row): LabeledSetRow {
  const marks = parseRepMarks(r.rep_marks as string);
  return {
    id: r.id as string,
    sessionId: r.session_id as string,
    exerciseId: r.exercise_id as string,
    tStart: r.t_start as number,
    tEnd: r.t_end as number,
    repMarks: marks.t,
    repMarksSnapped: marks.snapped,
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
    labelSource: ((r.label_source as string) ?? 'debrief') as LabeledSetRow['labelSource'],
    revision: (r.revision as number) ?? 1,
    imuAvailable: r.imu_available == null ? true : !!r.imu_available,
    clipId: (r.clip_id as string) ?? null,
    tStartHostNs: (r.t_start_host_ns as number) ?? null,
    tEndHostNs: (r.t_end_host_ns as number) ?? null,
    windowF16: (r.window_f16 as string) ?? null,
    channels: (r.channels as number) ?? null,
    rateHz: (r.rate_hz as number) ?? null,
    resultJson: (r.result_json as string) ?? null,
  };
}

export async function labeledSet(id: string): Promise<LabeledSetRow | null> {
  const rows = await all('SELECT * FROM labeled_sets WHERE id = ?', [id]);
  return rows.length ? rowToLabeledSet(rows[0]) : null;
}

export async function labeledSetsForSession(sessionId: string): Promise<LabeledSetRow[]> {
  const rows = await all('SELECT * FROM labeled_sets WHERE session_id = ? ORDER BY COALESCE(t_start_host_ns, created_at)', [sessionId]);
  return rows.map(rowToLabeledSet);
}

export async function recentLabeledSets(limit = 50): Promise<LabeledSetRow[]> {
  const rows = await all('SELECT * FROM labeled_sets ORDER BY created_at DESC LIMIT ?', [limit]);
  return rows.map(rowToLabeledSet);
}

export async function labeledSets(exerciseId: string, countedOnly = true): Promise<LabeledSetRow[]> {
  const rows = await all(
    `SELECT * FROM labeled_sets WHERE exercise_id = ? ${countedOnly ? 'AND counted = 1' : ''} ORDER BY created_at`,
    [exerciseId],
  );
  return rows.map(rowToLabeledSet);
}


export async function deleteLabeledSet(id: string): Promise<void> {
  await run('DELETE FROM labeled_sets WHERE id = ?', [id]);
}

// ---------------------------------------------------------------- sessions (Reel)

export interface SessionRow {
  id: string;
  startedAt: number;
  gymId: string | null;
  rigId: string | null;
  imuSource: string | null;
  rotationDeg: number | null;
  seqGaps: number;
  logDir: string | null;
}

export async function sessions(limit = 30): Promise<SessionRow[]> {
  const rows = await all('SELECT * FROM model_sessions ORDER BY started_at DESC LIMIT ?', [limit]);
  return rows.map(r => ({
    id: r.id as string,
    startedAt: r.started_at as number,
    gymId: (r.gym_id as string) ?? null,
    rigId: (r.rig_id as string) ?? null,
    imuSource: (r.imu_source as string) ?? null,
    rotationDeg: (r.rotation_deg as number) ?? null,
    seqGaps: (r.seq_gaps as number) ?? 0,
    logDir: (r.log_dir as string) ?? null,
  }));
}

export async function session(id: string): Promise<SessionRow | null> {
  const s = (await sessions(1000)).find(x => x.id === id);
  return s ?? null;
}

export async function upsertSession(s: SessionRow): Promise<void> {
  await run(
    'INSERT OR REPLACE INTO model_sessions (id, started_at, gym_id, rig_id, imu_source, calibration_json, rotation_deg, seq_gaps, free_space_ok, log_dir) VALUES (?,?,?,?,?,(SELECT calibration_json FROM model_sessions WHERE id = ?),?,?,1,?)',
    [s.id, s.startedAt, s.gymId, s.rigId, s.imuSource, s.id, s.rotationDeg, s.seqGaps, s.logDir],
  );
}

// ---------------------------------------------------------------- clips (studio design §12)

function rowToClip(r: Row): ClipRow {
  return {
    id: r.id as string,
    sessionId: r.session_id as string,
    labeledSetId: (r.labeled_set_id as string) ?? null,
    rigId: (r.rig_id as string) ?? null,
    source: r.source as ClipRow['source'],
    masterPath: (r.master_path as string) ?? null,
    proxyPath: (r.proxy_path as string) ?? null,
    ptsPath: (r.pts_path as string) ?? null,
    thumbsPath: (r.thumbs_path as string) ?? null,
    rotationDeg: (r.rotation_deg as number) ?? 0,
    width: (r.width as number) ?? null,
    height: (r.height as number) ?? null,
    frames: (r.frames as number) ?? null,
    durationUs: (r.duration_us as number) ?? null,
    sync: JSON.parse(r.sync_json as string),
    state: r.state as ClipRow['state'],
    createdAt: r.created_at as number,
  };
}

export async function upsertClip(c: ClipRow): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO clips (id, session_id, labeled_set_id, rig_id, source, master_path, proxy_path, pts_path, thumbs_path,
       rotation_deg, width, height, frames, duration_us, sync_json, state, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [c.id, c.sessionId, c.labeledSetId, c.rigId, c.source, c.masterPath, c.proxyPath, c.ptsPath, c.thumbsPath,
      c.rotationDeg, c.width, c.height, c.frames, c.durationUs, JSON.stringify(c.sync), c.state, c.createdAt],
  );
}

export async function clip(id: string): Promise<ClipRow | null> {
  const rows = await all('SELECT * FROM clips WHERE id = ?', [id]);
  return rows.length ? rowToClip(rows[0]) : null;
}

export async function clipForSet(labeledSetId: string): Promise<ClipRow | null> {
  const rows = await all(`SELECT * FROM clips WHERE labeled_set_id = ? AND state != 'deleted' ORDER BY created_at DESC LIMIT 1`, [labeledSetId]);
  return rows.length ? rowToClip(rows[0]) : null;
}

export async function clipsForSession(sessionId: string): Promise<ClipRow[]> {
  const rows = await all(`SELECT * FROM clips WHERE session_id = ? AND state != 'deleted' ORDER BY created_at`, [sessionId]);
  return rows.map(rowToClip);
}

export async function updateClip(id: string, patch: Partial<Pick<ClipRow, 'labeledSetId' | 'masterPath' | 'proxyPath' | 'ptsPath' | 'thumbsPath' | 'width' | 'height' | 'frames' | 'durationUs' | 'sync' | 'state' | 'rotationDeg'>>): Promise<void> {
  const cols: string[] = [];
  const vals: unknown[] = [];
  const map: Record<string, string> = {labeledSetId: 'labeled_set_id', masterPath: 'master_path', proxyPath: 'proxy_path', ptsPath: 'pts_path', thumbsPath: 'thumbs_path', width: 'width', height: 'height', frames: 'frames', durationUs: 'duration_us', sync: 'sync_json', state: 'state', rotationDeg: 'rotation_deg'};
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) {
      continue;
    }
    cols.push(`${map[k]} = ?`);
    vals.push(k === 'sync' ? JSON.stringify(v) : v);
  }
  if (!cols.length) {
    return;
  }
  vals.push(id);
  await run(`UPDATE clips SET ${cols.join(', ')} WHERE id = ?`, vals);
}

/** Bytes of master + proxy per state, for the storage meter (design §11.4). Paths only; sizes are read by the caller. */
export async function clipPaths(): Promise<{id: string; state: ClipRow['state']; masterPath: string | null; proxyPath: string | null; thumbsPath: string | null; createdAt: number}[]> {
  const rows = await all(`SELECT id, state, master_path, proxy_path, thumbs_path, created_at FROM clips WHERE state != 'deleted' ORDER BY created_at`);
  return rows.map(r => ({id: r.id as string, state: r.state as ClipRow['state'], masterPath: (r.master_path as string) ?? null, proxyPath: (r.proxy_path as string) ?? null, thumbsPath: (r.thumbs_path as string) ?? null, createdAt: r.created_at as number}));
}

// ---------------------------------------------------------------- exemplar frames

export interface ExemplarFrameRow {
  id: string;
  labeledSetId: string;
  role: 'glance' | 'rep_top' | 'rep_bottom';
  t: number | null;
  path: string;
  width: number | null;
  height: number | null;
  source: 'auto' | 'user';
  crop: {x: number; y: number; w: number; h: number} | null;
  ptsUs: number | null;
  clipId: string | null;
}

export async function insertExemplarFrame(f: ExemplarFrameRow): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO exemplar_frames (id, labeled_set_id, role, t, path, width, height, source, crop_json, pts_us, clip_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [f.id, f.labeledSetId, f.role, f.t, f.path, f.width, f.height, f.source, f.crop ? JSON.stringify(f.crop) : null, f.ptsUs, f.clipId],
  );
}

export async function exemplarFrames(labeledSetId: string): Promise<ExemplarFrameRow[]> {
  const rows = await all('SELECT * FROM exemplar_frames WHERE labeled_set_id = ?', [labeledSetId]);
  return rows.map(r => ({
    id: r.id as string,
    labeledSetId: r.labeled_set_id as string,
    role: r.role as ExemplarFrameRow['role'],
    t: (r.t as number) ?? null,
    path: r.path as string,
    width: (r.width as number) ?? null,
    height: (r.height as number) ?? null,
    source: ((r.source as string) ?? 'auto') as ExemplarFrameRow['source'],
    crop: r.crop_json ? JSON.parse(r.crop_json as string) : null,
    ptsUs: (r.pts_us as number) ?? null,
    clipId: (r.clip_id as string) ?? null,
  }));
}

/** Exemplars of every counted set of an exercise, user pins first — the Compare view's picture side. */
export async function exemplarFramesForExercise(exerciseId: string, limit = 6): Promise<ExemplarFrameRow[]> {
  const rows = await all(
    `SELECT f.* FROM exemplar_frames f JOIN labeled_sets s ON s.id = f.labeled_set_id
     WHERE s.exercise_id = ? ORDER BY CASE f.source WHEN 'user' THEN 0 ELSE 1 END, s.created_at DESC LIMIT ?`,
    [exerciseId, limit],
  );
  return rows.map(r => ({
    id: r.id as string,
    labeledSetId: r.labeled_set_id as string,
    role: r.role as ExemplarFrameRow['role'],
    t: (r.t as number) ?? null,
    path: r.path as string,
    width: (r.width as number) ?? null,
    height: (r.height as number) ?? null,
    source: ((r.source as string) ?? 'auto') as ExemplarFrameRow['source'],
    crop: r.crop_json ? JSON.parse(r.crop_json as string) : null,
    ptsUs: (r.pts_us as number) ?? null,
    clipId: (r.clip_id as string) ?? null,
  }));
}

export async function deleteExemplarFrame(id: string): Promise<void> {
  await run('DELETE FROM exemplar_frames WHERE id = ?', [id]);
}

export async function deleteExemplarFramesForSet(labeledSetId: string): Promise<string[]> {
  const rows = await all('SELECT path FROM exemplar_frames WHERE labeled_set_id = ?', [labeledSetId]);
  await run('DELETE FROM exemplar_frames WHERE labeled_set_id = ?', [labeledSetId]);
  return rows.map(r => r.path as string);
}

// ---------------------------------------------------------------- regions

function rowToRegion(r: Row): RegionRow {
  return {
    id: r.id as string,
    sessionId: r.session_id as string,
    t0Ns: r.t0_ns as number,
    t1Ns: r.t1_ns as number,
    cycles: (r.cycles as number) ?? 0,
    state: r.state as RegionRow['state'],
    reason: (r.reason as string) ?? null,
    labeledSetId: (r.labeled_set_id as string) ?? null,
    updatedAt: r.updated_at as number,
  };
}

export async function upsertRegion(g: RegionRow): Promise<void> {
  await run(
    'INSERT OR REPLACE INTO regions (id, session_id, t0_ns, t1_ns, cycles, state, reason, labeled_set_id, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
    [g.id, g.sessionId, g.t0Ns, g.t1Ns, g.cycles, g.state, g.reason, g.labeledSetId, g.updatedAt],
  );
}

export async function regionsForSession(sessionId: string): Promise<RegionRow[]> {
  const rows = await all('SELECT * FROM regions WHERE session_id = ? ORDER BY t0_ns', [sessionId]);
  return rows.map(rowToRegion);
}

export async function region(id: string): Promise<RegionRow | null> {
  const rows = await all('SELECT * FROM regions WHERE id = ?', [id]);
  return rows.length ? rowToRegion(rows[0]) : null;
}

export async function openRegionCount(): Promise<number> {
  const rows = await all(`SELECT COUNT(*) AS n FROM regions WHERE state = 'open'`);
  return (rows[0]?.n as number) ?? 0;
}

// ---------------------------------------------------------------- queue

function rowToQueue(r: Row): QueueItem {
  return {
    id: r.id as string,
    kind: r.kind as QueueItem['kind'],
    priority: r.priority as number,
    labeledSetId: (r.labeled_set_id as string) ?? null,
    regionId: (r.region_id as string) ?? null,
    clipId: (r.clip_id as string) ?? null,
    focus: r.focus as QueueItem['focus'],
    text: r.text as string,
    state: r.state as QueueItem['state'],
    createdAt: r.created_at as number,
    resolvedAt: (r.resolved_at as number) ?? null,
  };
}

export async function upsertQueueItem(q: QueueItem): Promise<void> {
  await run(
    'INSERT OR REPLACE INTO queue (id, kind, priority, labeled_set_id, region_id, clip_id, focus, text, state, created_at, resolved_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [q.id, q.kind, q.priority, q.labeledSetId, q.regionId, q.clipId, q.focus, q.text, q.state, q.createdAt, q.resolvedAt],
  );
}

export async function openQueue(): Promise<QueueItem[]> {
  const rows = await all(`SELECT * FROM queue WHERE state = 'open' ORDER BY priority, created_at`);
  return rows.map(rowToQueue);
}

export async function queueItemsForSet(labeledSetId: string): Promise<QueueItem[]> {
  const rows = await all('SELECT * FROM queue WHERE labeled_set_id = ? ORDER BY created_at', [labeledSetId]);
  return rows.map(rowToQueue);
}

export async function queueItem(id: string): Promise<QueueItem | null> {
  const rows = await all('SELECT * FROM queue WHERE id = ?', [id]);
  return rows.length ? rowToQueue(rows[0]) : null;
}

export async function setQueueState(id: string, state: QueueItem['state']): Promise<void> {
  await run('UPDATE queue SET state = ?, resolved_at = ? WHERE id = ?', [state, state === 'open' ? null : Date.now(), id]);
}

export async function openQueueCount(): Promise<number> {
  const rows = await all(`SELECT COUNT(*) AS n FROM queue WHERE state = 'open'`);
  return (rows[0]?.n as number) ?? 0;
}

// ---------------------------------------------------------------- studio events + drafts

export async function studioEvent(e: StudioEvent): Promise<void> {
  await run('INSERT INTO studio_events (at, labeled_set_id, kind, ms, n) VALUES (?,?,?,?,?)', [Date.now(), e.labeledSetId ?? null, e.kind, e.ms ?? null, e.n ?? null]);
}

export async function studioEventStats(): Promise<{kind: string; n: number; medianMs: number | null; p95Ms: number | null}[]> {
  const rows = await all('SELECT kind, ms FROM studio_events ORDER BY kind');
  const byKind = new Map<string, number[]>();
  for (const r of rows) {
    const k = r.kind as string;
    const arr = byKind.get(k) ?? [];
    if (r.ms != null) {
      arr.push(r.ms as number);
    }
    byKind.set(k, arr);
  }
  const counts = await all('SELECT kind, COUNT(*) AS n FROM studio_events GROUP BY kind');
  return counts.map(c => {
    const ms = [...(byKind.get(c.kind as string) ?? [])].sort((a, b) => a - b);
    const q = (p: number) => (ms.length ? ms[Math.min(ms.length - 1, Math.floor(p * (ms.length - 1)))] : null);
    return {kind: c.kind as string, n: c.n as number, medianMs: q(0.5), p95Ms: q(0.95)};
  });
}

export async function saveDraft(labeledSetId: string, answers: unknown): Promise<void> {
  await run('INSERT OR REPLACE INTO studio_drafts (labeled_set_id, answers_json, updated_at) VALUES (?,?,?)', [labeledSetId, JSON.stringify(answers), Date.now()]);
}

export async function loadDraft<T>(labeledSetId: string): Promise<T | null> {
  const rows = await all('SELECT answers_json FROM studio_drafts WHERE labeled_set_id = ?', [labeledSetId]);
  return rows.length ? (JSON.parse(rows[0].answers_json as string) as T) : null;
}

export async function deleteDraft(labeledSetId: string): Promise<void> {
  await run('DELETE FROM studio_drafts WHERE labeled_set_id = ?', [labeledSetId]);
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
    for (const t of ['model_templates', 'fitted_params', 'model_sessions', 'labeled_sets', 'exemplar_frames', 'weight_priors', 'level_progress', 'integrity_history', 'decisions', 'model_audit', 'quarantine', 'model_meta', 'clips', 'regions', 'queue', 'studio_events', 'studio_drafts']) {
      await run(`DELETE FROM ${t}`);
    }
  });
}
