// The learning loop (design §2.3, §4): commit a confirmed set → append templates (set + rep
// windows), harvest negatives, fit the closed-form parameters, recompute integrity natively,
// apply level transitions, prune, audit, and hot-reload the engine.

import {ClipModule} from '../native/ClipModule';
import {SignalModule, SignalStudio} from '../native/SignalModule';
import {crc32, decodeF16, encodeF16} from './f16';
import {aggregate, fitTReject} from './integrity';
import {afterCleanSet, eligibleState, emptyProgress, XP} from './levels';
import {compose, toEngineJson, type ComposedParams} from './params';
import * as store from './store';
import type {ConfirmedSet, EngineParams, FittedParam, LevelParams, LevelState, RepSignal, SetResult, TemplateRow} from '../types/model';

export const EXTRACTOR_VERSION = 'fx-1';

/** Minimum data before a fit overrides the package default (design §4.2, risk M2). */
const MIN_SETS_FOR_FIT = 3;

export interface CommitInput {
  result: SetResult;
  confirmed: ConfirmedSet;
  repSignal: RepSignal;
  campaign: string[];
  /** Fresh from the debrief's gates (feature PRD §7.5). */
  gates: Record<string, boolean>;
  /** Package params + levels for this session. */
  packageParams: Partial<EngineParams> & {levels?: Partial<LevelParams>};
  canonicalRotation: number[][] | null;
  now?: number;
  /** Set by `relabel`; new sets are revision 1. */
  revision?: number;
  /** Injected for tests; defaults to the native bridge. */
  engine?: Pick<typeof SignalModule, 'loadTemplates' | 'scoreAll' | 'harvestNegatives' | 'configure' | 'isAvailable'>;
}

export interface CommitOutcome {
  counted: boolean;
  templatesAdded: number;
  negativesAdded: number;
  integrity: number | null;
  level: {from: string; to: string} | null;
  xpEarned: number;
  fits: FittedParam[];
  params: ComposedParams;
}

// ---------------------------------------------------------------- helpers

export function median(xs: number[]): number {
  if (!xs.length) {
    return 0;
  }
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function percentile(xs: number[], p: number): number {
  if (!xs.length) {
    return 0;
  }
  const s = [...xs].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.max(0, Math.round((p / 100) * (s.length - 1))));
  return s[idx];
}

function slice(window: number[][], rateHz: number, fromSec: number, toSec: number): number[][] {
  const a = Math.max(0, Math.floor(fromSec * rateHz));
  const b = Math.min(window.length, Math.ceil(toSec * rateHz));
  return window.slice(a, b);
}

/** Closed-form fits over the confirmed sets of one exercise (design §4.2). Pure. */
export function fitExercise(exerciseId: string, sets: store.LabeledSetRow[], defaults: EngineParams, now: number): FittedParam[] {
  const counted = sets.filter(s => s.counted);
  if (counted.length < MIN_SETS_FOR_FIT) {
    return [];
  }
  const out: FittedParam[] = [];
  const mk = (name: string, value: unknown, n: number, dflt: unknown): FittedParam => ({scope: 'exercise', exerciseId, name, value, fittedFromN: n, packageDefault: dflt, updatedAt: now});
  const cads = counted.map(s => s.cadenceHz).filter((x): x is number => x != null && x > 0);
  if (cads.length >= MIN_SETS_FOR_FIT) {
    const lo = Math.max(defaults.rep_band_low_hz, percentile(cads, 10) * 0.8);
    const hi = Math.min(defaults.rep_band_high_hz, Math.max(lo + 0.1, percentile(cads, 90) * 1.2));
    out.push(mk('cadence_low_hz', round(lo), cads.length, defaults.rep_band_low_hz));
    out.push(mk('cadence_high_hz', round(hi), cads.length, defaults.rep_band_high_hz));
  }
  const amps = counted.map(s => s.ampMedian).filter((x): x is number => x != null && x > 0);
  if (amps.length >= MIN_SETS_FOR_FIT) {
    out.push(mk('a_min', round(0.4 * median(amps)), amps.length, null));
  }
  const chans = counted.map(s => s.dominantChannel).filter((x): x is number => x != null);
  if (chans.length >= MIN_SETS_FOR_FIT) {
    const counts = new Map<number, number>();
    for (const c of chans) {
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const mode = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    out.push(mk('dominant_channel', mode, chans.length, null));
  }
  const durs = counted.map(s => s.durationSec).filter((x): x is number => x != null && x > 0);
  if (durs.length >= MIN_SETS_FOR_FIT) {
    out.push(mk('set_duration_median_sec', round(median(durs)), durs.length, null));
    out.push(mk('set_duration_iqr_sec', round(percentile(durs, 75) - percentile(durs, 25)), durs.length, null));
  }
  return out;
}

const round = (x: number) => Math.round(x * 1000) / 1000;

// ---------------------------------------------------------------- commit

export async function commit(input: CommitInput): Promise<CommitOutcome> {
  const now = input.now ?? Date.now();
  const engine = input.engine ?? SignalModule;
  const {result, confirmed} = input;
  const rate = result.rateHz;
  const window = decodeF16(result.windowF16, result.channels);
  const counted = Object.values(input.gates).every(Boolean);
  const imuAvailable = confirmed.imuAvailable !== false;
  const revision = input.revision ?? 1;

  // 1. Set-level stats for the fits.
  const tops = confirmed.repTopsSec;
  const durationSec = confirmed.tEndSec - confirmed.tStartSec;
  const cadenceHz = tops.length >= 2 ? (tops.length - 1) / (tops[tops.length - 1] - tops[0]) : result.cadenceHz ?? null;
  const ampMedian = result.reps.length ? median(result.reps.map(r => Math.abs(r.amplitude))) : null;

  await store.transaction(async () => {
    await store.insertLabeledSet({
      id: confirmed.setId,
      sessionId: confirmed.sessionId,
      exerciseId: confirmed.exerciseId,
      tStart: confirmed.tStartSec,
      tEnd: confirmed.tEndSec,
      repMarks: tops,
      repsConfirmed: confirmed.repsConfirmed,
      repsDetected: result.repsDetected,
      weightDeclared: confirmed.weight,
      weightUnit: confirmed.weightUnit,
      weightOcr: null,
      weightOcrConf: null,
      weightState: confirmed.weightState,
      cadenceHz: cadenceHz ?? null,
      ampMedian,
      dominantChannel: result.dominantChannel ?? null,
      durationSec,
      gates: input.gates,
      counted,
      createdAt: now,
      // v2 (studio design §12): keep what the Studio needs to re-open the set without the engine.
      labelSource: confirmed.labelSource ?? 'debrief',
      revision,
      imuAvailable,
      clipId: confirmed.clipId ?? null,
      tStartHostNs: confirmed.tStartHostNs ?? (result.tStartNs ? result.tStartNs + confirmed.tStartSec * 1e9 : null),
      tEndHostNs: confirmed.tEndHostNs ?? (result.tStartNs ? result.tStartNs + confirmed.tEndSec * 1e9 : null),
      windowF16: result.windowF16,
      channels: result.channels,
      rateHz: result.rateHz,
      resultJson: JSON.stringify(result),
      repMarksSnapped: confirmed.repTopsSnapped,
    });
    if (confirmed.weight != null && confirmed.weightState === 'confirmed') {
      await store.upsertWeightPrior(confirmed.exerciseId, confirmed.gymId, confirmed.stationId, confirmed.weight, confirmed.weightUnit);
    }
  });

  if (!counted) {
    await store.audit(confirmed.exerciseId, {event: 'set_not_counted', gates: input.gates, setId: confirmed.setId}, null);
    const params = compose(input.packageParams, await store.fittedParams());
    return {counted: false, templatesAdded: 0, negativesAdded: 0, integrity: null, level: null, xpEarned: 0, fits: [], params};
  }
  if (!imuAvailable) {
    // Video-only set (design §10.6): exemplars and the weight prior only — no templates, no
    // integrity, no level change; it can never count toward Campaign-1 certification.
    await store.audit(confirmed.exerciseId, {event: 'video_only_set', setId: confirmed.setId}, null);
    const params = compose(input.packageParams, await store.fittedParams());
    return {counted: true, templatesAdded: 0, negativesAdded: 0, integrity: null, level: null, xpEarned: 0, fits: [], params};
  }

  // 2. Append templates: the set window and per-rep windows (½ cycle each side of a top).
  const added: TemplateRow[] = [];
  const setWindow = slice(window, rate, confirmed.tStartSec, confirmed.tEndSec);
  if (result.features && setWindow.length >= 8) {
    added.push(templateRow(`${confirmed.setId}:set`, confirmed.exerciseId, 'set', confirmed, result, encodeF16(setWindow), now));
  }
  const cycle = cadenceHz && cadenceHz > 0 ? 1 / cadenceHz : 1.2;
  tops.forEach((t, i) => {
    const w = slice(window, rate, t - cycle / 2, t + cycle / 2);
    if (w.length >= 8 && result.features) {
      added.push(templateRow(`${confirmed.setId}:rep${i + 1}`, confirmed.exerciseId, 'rep', confirmed, result, encodeF16(w), now));
    }
  });
  // 3. Negatives harvested by the engine between sets (non-periodic windows only, design §4.1).
  let negatives: {windowF16: string; channels: number}[] = [];
  if (engine.isAvailable()) {
    try {
      negatives = await engine.harvestNegatives();
    } catch {
      negatives = [];
    }
  }
  const negRows: TemplateRow[] = negatives.map((n, i) => ({
    id: `${confirmed.sessionId}:neg:${now}:${i}`,
    exerciseId: 'unknown',
    kind: 'negative',
    source: 'own',
    labeledSetId: null,
    sessionId: confirmed.sessionId,
    features: result.features!,
    windowF16: n.windowF16,
    channels: n.channels,
    rateHz: rate,
    extractorVersion: EXTRACTOR_VERSION,
    checksum: crc32(n.windowF16),
    pinned: false,
    createdAt: now,
  }));

  await store.transaction(async () => {
    for (const t of [...added, ...negRows]) {
      await store.insertTemplate(t, input.canonicalRotation);
    }
  });

  // 4. Fits (closed form) over this exercise's counted sets.
  const sets = await store.labeledSets(confirmed.exerciseId, true);
  const before = compose(input.packageParams, await store.fittedParams());
  const fits = fitExercise(confirmed.exerciseId, sets, before.engine, now);
  for (const f of fits) {
    await store.upsertFitted(f);
  }

  // 5. Reload the engine with the delta, then leave-one-out integrity over the campaign.
  const ownCounts = await store.ownSetCounts();
  let integrity: number | null = null;
  let tRejectFit: number | null = null;
  if (engine.isAvailable()) {
    // Only set / negative / prior kinds enter the index (ledger Q2: rep windows stay out).
    const indexRows = [...added.filter(t => t.kind === 'set'), ...negRows];
    await engine.loadTemplates(indexRows.map(toLoad), ownCounts, 'delta');
    const rows = await engine.scoreAll(input.campaign);
    const rep = aggregate(rows);
    integrity = rep.perExercise[confirmed.exerciseId] ?? null;
    tRejectFit = fitTReject(rows);
    if (tRejectFit != null) {
      await store.upsertFitted({scope: 'user', exerciseId: null, name: 't_reject', value: tRejectFit, fittedFromN: rows.length, packageDefault: before.engine.t_reject, updatedAt: now});
    }
    for (const [e, v] of Object.entries(rep.perExercise)) {
      await store.recordIntegrity(e, confirmed.sessionId, v);
    }
  }

  // 6. Level state.
  const prev = (await store.levelProgress(confirmed.exerciseId, confirmed.gymId)) ?? emptyProgress(confirmed.exerciseId, confirmed.gymId);
  const distinctWeights = new Set(sets.map(s => s.weightDeclared).filter(w => w != null)).size;
  const exact = confirmed.repsConfirmed != null && confirmed.repsConfirmed === result.repsDetected;
  let xp = XP.cleanSet + (exact && (input.repSignal === 'imu' || input.repSignal === 'fusion') ? XP.exactReps : 0);
  if (distinctWeights > prev.distinctWeights) {
    xp += XP.newWeight;
  }
  const params = compose(input.packageParams, await store.fittedParams());
  const {progress, transition} = afterCleanSet(
    {...prev, cleanSets: sets.length, distinctWeights, integrity: integrity ?? prev.integrity, xp: prev.xp + xp},
    params.levels,
    now,
  );
  await store.saveLevelProgress(progress);

  // 7. Prune (design §4.5 — P0 approximation: oldest unpinned set whose own LOO label was correct).
  const cap = params.levels.storeCapPerExercise;
  const ownSets = await store.templates({exerciseIds: [confirmed.exerciseId], kinds: ['set'], sources: ['own']});
  let pruned: string | null = null;
  if (ownSets.length > cap) {
    const victim = ownSets.find(t => !t.pinned);
    if (victim?.labeledSetId) {
      const ids = await store.deleteTemplatesForSet(victim.labeledSetId);
      if (engine.isAvailable()) {
        await engine.loadTemplates(ids.map(id => ({id, exerciseId: '', kind: 'set', source: 'own', features: result.features!, windowF16: '', channels: 0, remove: true})), ownCounts, 'delta');
      }
      pruned = victim.labeledSetId;
    }
  }

  // 8. Audit + hot params.
  await store.audit(
    confirmed.exerciseId,
    {event: 'commit', setId: confirmed.setId, templatesAdded: added.length, negativesAdded: negRows.length, fits: fits.map(f => ({name: f.name, value: f.value, n: f.fittedFromN})), tReject: tRejectFit, pruned, level: transition, xp},
    integrity,
  );
  if (engine.isAvailable()) {
    await engine.configure(toEngineJson(params.engine), input.canonicalRotation);
  }
  return {
    counted: true,
    templatesAdded: added.length,
    negativesAdded: negRows.length,
    integrity,
    level: transition ? {from: transition.from, to: transition.to} : null,
    xpEarned: xp,
    fits,
    params,
  };
}

function templateRow(id: string, exerciseId: string, kind: 'set' | 'rep', c: ConfirmedSet, r: SetResult, windowF16: string, now: number): TemplateRow {
  return {
    id,
    exerciseId,
    kind,
    source: 'own',
    labeledSetId: c.setId,
    sessionId: c.sessionId,
    features: r.features!,
    windowF16,
    channels: r.channels,
    rateHz: r.rateHz,
    extractorVersion: EXTRACTOR_VERSION,
    checksum: crc32(windowF16),
    pinned: false,
    createdAt: now,
  };
}

function toLoad(t: TemplateRow) {
  return {id: t.id, exerciseId: t.exerciseId, kind: t.kind, source: t.source, features: t.features, windowF16: t.windowF16, channels: t.channels};
}

/** Delete one set and everything derived from it (design §6.4). */
export async function deleteSet(labeledSetId: string, engine = SignalModule): Promise<void> {
  const ids = await store.deleteTemplatesForSet(labeledSetId);
  await store.deleteLabeledSet(labeledSetId);
  if (engine.isAvailable() && ids.length) {
    await engine.loadTemplates(ids.map(id => ({id, exerciseId: '', kind: 'set', source: 'own', features: {} as never, windowF16: '', channels: 0, remove: true})), await store.ownSetCounts(), 'delta');
  }
  await store.audit(null, {event: 'delete_set', labeledSetId, templatesRemoved: ids.length}, null);
}

// ---------------------------------------------------------------- Studio operations (design §10.3)

const ORDER: LevelState[] = ['locked', 'recon', 'provisional', 'certified', 'veteran'];

/**
 * Relabel an existing set: remove everything derived from it (templates, automatic exemplar
 * frames — user pins stay), then commit the new answers under the same id with the revision
 * bumped. Levels may go DOWN: a store that just lost a set can lose Provisional, and the audit
 * row says so.
 */
export async function relabel(labeledSetId: string, input: CommitInput): Promise<CommitOutcome & {revision: number}> {
  const engine = input.engine ?? SignalModule;
  const previous = await store.labeledSet(labeledSetId);
  const revision = (previous?.revision ?? 1) + 1;
  const prevLevel = previous ? await store.levelProgress(previous.exerciseId, input.confirmed.gymId) : null;
  const integrityBefore = prevLevel?.integrity ?? null;

  const removed = await store.deleteTemplatesForSet(labeledSetId);
  if (engine.isAvailable() && removed.length) {
    await engine.loadTemplates(removed.map(id => ({id, exerciseId: '', kind: 'set', source: 'own', features: {} as never, windowF16: '', channels: 0, remove: true})), await store.ownSetCounts(), 'delta');
  }
  for (const f of await store.exemplarFrames(labeledSetId)) {
    if (f.source === 'auto') {
      await store.deleteExemplarFrame(f.id);
      if (ClipModule.isAvailable()) {
        await ClipModule.deleteClipFiles([f.path]).catch(() => undefined);
      }
    }
  }

  const confirmed: ConfirmedSet = {...input.confirmed, setId: labeledSetId, labelSource: input.confirmed.labelSource ?? 'studio'};
  const out = await commit({...input, confirmed, revision});

  // Demotion after a relabel: the old exercise (if changed) and the new one are re-evaluated
  // against their counts — commit only ever moves a level up.
  const touched = new Set([confirmed.exerciseId, previous?.exerciseId].filter((x): x is string => !!x));
  let level = out.level;
  for (const ex of touched) {
    const p = await store.levelProgress(ex, confirmed.gymId);
    if (!p) {
      continue;
    }
    const sets = await store.labeledSets(ex, true);
    const distinctWeights = new Set(sets.map(x => x.weightDeclared).filter(w => w != null)).size;
    const refreshed = {...p, cleanSets: sets.length, distinctWeights};
    const target = eligibleState(refreshed, out.params.levels);
    if (ORDER.indexOf(target) < ORDER.indexOf(p.state)) {
      await store.saveLevelProgress({...refreshed, state: target, lastChange: input.now ?? Date.now()});
      await store.audit(ex, {event: 'level_demoted', reason: 'relabel', from: p.state, to: target, setId: labeledSetId}, refreshed.integrity);
      if (ex === confirmed.exerciseId) {
        level = {from: p.state, to: target};
      }
    } else if (refreshed.cleanSets !== p.cleanSets || refreshed.distinctWeights !== p.distinctWeights) {
      await store.saveLevelProgress(refreshed);
    }
  }
  await store.audit(confirmed.exerciseId, {
    event: 'relabel',
    setId: labeledSetId,
    revision,
    fromExercise: previous?.exerciseId ?? null,
    toExercise: confirmed.exerciseId,
    integrityBefore,
    integrityAfter: out.integrity,
    level,
    templatesRemoved: removed.length,
  }, out.integrity);
  return {...out, level, revision};
}

/** Full analysis of an arbitrary host-time range of the session recorder (design §10.2). */
export async function createFromRange(sessionId: string, t0Ns: number, t1Ns: number, hint: string | null): Promise<SetResult> {
  return SignalStudio.analyzeRange(sessionId, t0Ns, t1Ns, hint);
}

function hostBounds(row: store.LabeledSetRow): {t0Ns: number; t1Ns: number} {
  if (row.tStartHostNs != null && row.tEndHostNs != null) {
    return {t0Ns: row.tStartHostNs, t1Ns: row.tEndHostNs};
  }
  if (row.resultJson) {
    const r = JSON.parse(row.resultJson) as SetResult;
    return {t0Ns: r.tStartNs + row.tStart * 1e9, t1Ns: r.tStartNs + row.tEnd * 1e9};
  }
  throw new Error(`set ${row.id} has no host-time bounds`);
}

export async function split(labeledSetId: string, tSplitNs: number): Promise<{a: SetResult; b: SetResult}> {
  const row = await store.labeledSet(labeledSetId);
  if (!row) {
    throw new Error(`no set ${labeledSetId}`);
  }
  const {t0Ns, t1Ns} = hostBounds(row);
  if (!(tSplitNs > t0Ns && tSplitNs < t1Ns)) {
    throw new Error('split point outside the set');
  }
  const a = await SignalStudio.analyzeRange(row.sessionId, t0Ns, tSplitNs, row.exerciseId);
  const b = await SignalStudio.analyzeRange(row.sessionId, tSplitNs, t1Ns, row.exerciseId);
  await store.audit(row.exerciseId, {event: 'split', setId: labeledSetId, tSplitNs, a: a.setId, b: b.setId}, null);
  return {a, b};
}

export async function merge(labeledSetIdA: string, labeledSetIdB: string): Promise<SetResult> {
  const a = await store.labeledSet(labeledSetIdA);
  const b = await store.labeledSet(labeledSetIdB);
  if (!a || !b) {
    throw new Error('merge needs two existing sets');
  }
  if (a.sessionId !== b.sessionId) {
    throw new Error('sets are from different sessions');
  }
  const ba = hostBounds(a);
  const bb = hostBounds(b);
  const res = await SignalStudio.analyzeRange(a.sessionId, Math.min(ba.t0Ns, bb.t0Ns), Math.max(ba.t1Ns, bb.t1Ns), a.exerciseId);
  await store.audit(a.exerciseId, {event: 'merge', setIds: [labeledSetIdA, labeledSetIdB], result: res.setId}, null);
  return res;
}

export async function tagRegion(regionId: string, hint: string | null): Promise<SetResult> {
  const r = await store.region(regionId);
  if (!r) {
    throw new Error(`no region ${regionId}`);
  }
  return SignalStudio.analyzeRange(r.sessionId, r.t0Ns, r.t1Ns, hint);
}

export async function markRegionTagged(regionId: string, labeledSetId: string): Promise<void> {
  const r = await store.region(regionId);
  if (!r) {
    return;
  }
  await store.upsertRegion({...r, state: 'tagged', labeledSetId, updatedAt: Date.now()});
  await store.audit(null, {event: 'region_tagged', regionId, labeledSetId}, null);
}

/** A dismissed region is never harvested as a negative and never scanned again (design §10.3, R11). */
export async function dismissRegion(regionId: string, reason: string): Promise<void> {
  const r = await store.region(regionId);
  if (!r) {
    return;
  }
  await store.upsertRegion({...r, state: 'dismissed', reason, updatedAt: Date.now()});
  await store.insertDecision(`d:region:${regionId}:${Date.now()}`, r.sessionId, null, {
    kind: 'dismiss',
    value: reason,
    confidence: 1,
    source: 'manual',
    needsConfirm: false,
    explanation: {summary: `Region dismissed: ${reason}`, evidence: {regionId, t0Ns: r.t0Ns, t1Ns: r.t1Ns, cycles: r.cycles}},
  });
  await store.audit(null, {event: 'region_dismissed', regionId, reason}, null);
}

/** Pin a frame as a user exemplar: one per role per set; user pins outrank the automatic frame. */
export async function pinFrame(input: {labeledSetId: string; clipId: string; ptsUs: number; role: 'glance' | 'rep_top' | 'rep_bottom'; crop: {x: number; y: number; w: number; h: number} | null}): Promise<store.ExemplarFrameRow> {
  const clip = await store.clip(input.clipId);
  if (!clip) {
    throw new Error(`no clip ${input.clipId}`);
  }
  const src = clip.masterPath ?? clip.proxyPath;
  if (!src) {
    throw new Error('clip has no video file (reduced)');
  }
  const base = await ClipModule.clipsDir();
  const outPath = `${base}/${input.clipId}/pin_${input.role}_${Math.round(input.ptsUs)}.jpg`;
  // Crops are in master pixels; a proxy fallback carries its own (baked) rotation, so crop only on the master.
  const crop = clip.masterPath ? input.crop : null;
  const rotation = clip.masterPath ? clip.rotationDeg : 0;
  const frame = await ClipModule.extractFrame(src, input.ptsUs, rotation, crop, outPath);
  for (const f of await store.exemplarFrames(input.labeledSetId)) {
    if (f.source === 'user' && f.role === input.role) {
      await store.deleteExemplarFrame(f.id);
      if (f.path !== frame.path) {
        await ClipModule.deleteClipFiles([f.path]).catch(() => undefined);
      }
    }
  }
  const row: store.ExemplarFrameRow = {
    id: `pin:${input.labeledSetId}:${input.role}`,
    labeledSetId: input.labeledSetId,
    role: input.role,
    t: clip.sync ? (clip.sync.pts0HostNs + input.ptsUs * 1000 * clip.sync.rate) / 1e9 : null,
    path: frame.path,
    width: frame.width,
    height: frame.height,
    source: 'user',
    crop: input.crop,
    ptsUs: input.ptsUs,
    clipId: input.clipId,
  };
  await store.insertExemplarFrame(row);
  await store.audit(null, {event: 'pin', labeledSetId: input.labeledSetId, role: input.role, ptsUs: input.ptsUs, crop: !!input.crop}, null);
  return row;
}

export async function unpinFrame(exemplarId: string): Promise<void> {
  const rows = await store.exemplarFrames(exemplarId.split(':')[1] ?? '');
  const f = rows.find(x => x.id === exemplarId);
  await store.deleteExemplarFrame(exemplarId);
  if (f && ClipModule.isAvailable()) {
    await ClipModule.deleteClipFiles([f.path]).catch(() => undefined);
  }
  await store.audit(null, {event: 'unpin', exemplarId}, null);
}
