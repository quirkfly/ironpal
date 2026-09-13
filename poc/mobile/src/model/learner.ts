// The learning loop (design §2.3, §4): commit a confirmed set → append templates (set + rep
// windows), harvest negatives, fit the closed-form parameters, recompute integrity natively,
// apply level transitions, prune, audit, and hot-reload the engine.

import {SignalModule} from '../native/SignalModule';
import {crc32, decodeF16, encodeF16} from './f16';
import {aggregate, fitTReject} from './integrity';
import {afterCleanSet, emptyProgress, XP} from './levels';
import {compose, toEngineJson, type ComposedParams} from './params';
import * as store from './store';
import type {ConfirmedSet, EngineParams, FittedParam, LevelParams, RepSignal, SetResult, TemplateRow} from '../types/model';

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
