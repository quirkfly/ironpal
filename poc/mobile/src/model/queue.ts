// The queue — "the model asks" (studio design §7.9). Items are one sentence in the model's
// voice, ordered by what it is least sure of; every resolution or dismissal is a decisions row
// so the learner can read why.

import * as store from './store';
import type {Decision, QueueItem, QueueKind, RegionRow, RepSignal, SetResult} from '../types/model';

export const QUEUE_PRIORITY: Record<QueueKind, number> = {
  gate_fixable: 1,
  low_margin: 2,
  region: 3,
  ocr_disagree: 4,
  live_correction: 5,
  imported: 6,
};

export const DISMISS_REASONS: {key: string; label: string}[] = [
  {key: 'was_rest', label: 'Was rest'},
  {key: 'wrong_rig', label: 'Wrong rig'},
  {key: 'not_exercise', label: 'Not an exercise'},
  {key: 'duplicate', label: 'Duplicate'},
  {key: 'other', label: 'Other'},
];

export const DEFAULT_QUEUE_TEMPLATES: Record<string, string> = {
  queue_gate_fixable: 'The headband counted {detected}, you said {confirmed} — one mark may fix it.',
  queue_gate_motion: 'Barely three cycles of motion here — check the set bounds.',
  queue_low_margin: 'This looked like {exercise} at {conf}, but {runner} was close — which was it?',
  queue_against_top1: 'You chose {exercise} over my {top1} — worth a second look.',
  queue_region: 'Gate opened here for {cycles} cycles, nothing tagged.',
  queue_ocr_disagree: 'The plate read {ocr} {unit}, you said {declared} {unit}.',
  queue_live_correction: 'You corrected {from} to {to} live — was the store wrong?',
  queue_imported: 'An imported session is waiting for labels.',
};

const LOW_MARGIN = 0.1;

function fill(t: string, vars: Record<string, unknown>): string {
  return t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '?'));
}
const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Priority asc, then createdAt asc; at most one open item per labeled set (the most urgent one). */
export function orderQueue(items: QueueItem[]): QueueItem[] {
  const sorted = [...items].sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);
  const seen = new Set<string>();
  const out: QueueItem[] = [];
  for (const it of sorted) {
    if (it.labeledSetId) {
      if (seen.has(it.labeledSetId)) {
        continue;
      }
      seen.add(it.labeledSetId);
    }
    out.push(it);
  }
  return out;
}

export interface AfterCommitInput {
  setId: string;
  result: SetResult;
  gates: Record<string, boolean>;
  repsConfirmed: number | null;
  repSignal: RepSignal;
  exerciseId: string;
  chosenAgainstTop1: boolean;
  names: Record<string, string>;
  templates?: Record<string, string>;
  now?: number;
  /** OCR reconcile data when present (P1); the rule is skipped without it. */
  weightOcr?: {value: number; unit: string} | null;
  weightDeclared?: number | null;
}

/** Pure rules for what a just-committed set puts on the queue. */
export function queueItemsAfterCommit(input: AfterCommitInput): QueueItem[] {
  const T = {...DEFAULT_QUEUE_TEMPLATES, ...(input.templates ?? {})};
  const now = input.now ?? Date.now();
  const names = input.names;
  const name = (id: string) => names[id] ?? id;
  const out: QueueItem[] = [];
  const g = input.gates;
  const linkAndRigOk = (g.link ?? true) && (g.rig ?? true);

  if (linkAndRigOk && (g.repAgreement === false || g.motion === false)) {
    const text =
      g.repAgreement === false
        ? fill(T.queue_gate_fixable, {detected: input.result.repsDetected, confirmed: input.repsConfirmed ?? '?'})
        : T.queue_gate_motion;
    out.push({
      id: `q:${input.setId}:gate_fixable`,
      kind: 'gate_fixable',
      priority: QUEUE_PRIORITY.gate_fixable,
      labeledSetId: input.setId,
      regionId: null,
      clipId: null,
      focus: g.repAgreement === false ? 'marks' : 'bounds',
      text,
      state: 'open',
      createdAt: now,
      resolvedAt: null,
    });
  }

  const m = input.result.match;
  if (m && (m.margin < LOW_MARGIN || input.chosenAgainstTop1)) {
    const top1 = m.candidates[0];
    const runner = m.candidates[1];
    const text = input.chosenAgainstTop1
      ? fill(T.queue_against_top1, {exercise: name(input.exerciseId), top1: name(top1?.exerciseId ?? m.label)})
      : fill(T.queue_low_margin, {exercise: name(m.label), conf: pct(m.confidence), runner: runner ? name(runner.exerciseId) : '—'});
    out.push({
      id: `q:${input.setId}:low_margin`,
      kind: 'low_margin',
      priority: QUEUE_PRIORITY.low_margin,
      labeledSetId: input.setId,
      regionId: null,
      clipId: null,
      focus: 'exercise',
      text,
      state: 'open',
      createdAt: now,
      resolvedAt: null,
    });
  }

  if (input.weightOcr && input.weightDeclared != null) {
    const tol = Math.max(2.5, 0.1 * input.weightDeclared);
    if (Math.abs(input.weightOcr.value - input.weightDeclared) > tol) {
      out.push({
        id: `q:${input.setId}:ocr_disagree`,
        kind: 'ocr_disagree',
        priority: QUEUE_PRIORITY.ocr_disagree,
        labeledSetId: input.setId,
        regionId: null,
        clipId: null,
        focus: 'weight',
        text: fill(T.queue_ocr_disagree, {ocr: input.weightOcr.value, unit: input.weightOcr.unit, declared: input.weightDeclared}),
        state: 'open',
        createdAt: now,
        resolvedAt: null,
      });
    }
  }
  return out;
}

export async function enqueueAfterCommit(input: AfterCommitInput): Promise<QueueItem[]> {
  const items = queueItemsAfterCommit(input);
  // One open item per set: a new commit (or relabel) replaces whatever was open for it.
  for (const old of await store.queueItemsForSet(input.setId)) {
    if (old.state === 'open') {
      await store.setQueueState(old.id, 'resolved');
    }
  }
  const kept = orderQueue(items);
  for (const it of kept) {
    await store.upsertQueueItem(it);
  }
  return kept;
}

export async function enqueueRegions(sessionId: string, regions: RegionRow[]): Promise<QueueItem[]> {
  const now = Date.now();
  const out: QueueItem[] = [];
  for (const r of regions) {
    if (r.state !== 'open') {
      continue;
    }
    const it: QueueItem = {
      id: `q:region:${r.id}`,
      kind: 'region',
      priority: QUEUE_PRIORITY.region,
      labeledSetId: null,
      regionId: r.id,
      clipId: null,
      focus: 'reel',
      text: fill(DEFAULT_QUEUE_TEMPLATES.queue_region, {cycles: r.cycles}),
      state: 'open',
      createdAt: now,
      resolvedAt: null,
    };
    const existing = await store.queueItem(it.id);
    if (existing && existing.state !== 'open') {
      continue; // already handled once; never nag (design §7.9)
    }
    await store.upsertQueueItem(existing ?? it);
    out.push(existing ?? it);
  }
  void sessionId;
  return out;
}

export async function enqueueLiveCorrection(labeledSetId: string, fromExerciseId: string, toExerciseId: string, names: Record<string, string>): Promise<QueueItem> {
  const it: QueueItem = {
    id: `q:${labeledSetId}:live_correction`,
    kind: 'live_correction',
    priority: QUEUE_PRIORITY.live_correction,
    labeledSetId,
    regionId: null,
    clipId: null,
    focus: 'exercise',
    text: fill(DEFAULT_QUEUE_TEMPLATES.queue_live_correction, {from: names[fromExerciseId] ?? fromExerciseId, to: names[toExerciseId] ?? toExerciseId}),
    state: 'open',
    createdAt: Date.now(),
    resolvedAt: null,
  };
  await store.upsertQueueItem(it);
  return it;
}

export async function enqueueImported(sessionId: string, clipId: string): Promise<QueueItem> {
  const it: QueueItem = {
    id: `q:imported:${sessionId}:${clipId}`,
    kind: 'imported',
    priority: QUEUE_PRIORITY.imported,
    labeledSetId: null,
    regionId: null,
    clipId,
    focus: 'reel',
    text: DEFAULT_QUEUE_TEMPLATES.queue_imported,
    state: 'open',
    createdAt: Date.now(),
    resolvedAt: null,
  };
  await store.upsertQueueItem(it);
  return it;
}

function decision(kind: 'queue' | 'dismiss', value: string, summary: string, evidence: Record<string, unknown>): Decision<string> {
  return {kind, value, confidence: 1, source: 'manual', needsConfirm: false, explanation: {summary, evidence}};
}

export async function resolveQueueItem(id: string, outcome: string): Promise<void> {
  const it = await store.queueItem(id);
  await store.setQueueState(id, 'resolved');
  await store.insertDecision(`d:${id}:${Date.now()}`, null, it?.labeledSetId ?? null, decision('queue', outcome, `Resolved: ${outcome}`, {queueId: id, kind: it?.kind}));
}

export async function dismissQueueItem(id: string, reason: string): Promise<void> {
  const it = await store.queueItem(id);
  await store.setQueueState(id, 'dismissed');
  await store.insertDecision(`d:${id}:${Date.now()}`, null, it?.labeledSetId ?? null, decision('dismiss', reason, `Dismissed: ${reason}`, {queueId: id, kind: it?.kind}));
}

export async function openQueueWithContext(): Promise<(QueueItem & {exerciseId: string | null; sessionId: string | null})[]> {
  const items = orderQueue(await store.openQueue());
  const out: (QueueItem & {exerciseId: string | null; sessionId: string | null})[] = [];
  for (const it of items) {
    let exerciseId: string | null = null;
    let sessionId: string | null = null;
    if (it.labeledSetId) {
      const s = await store.labeledSet(it.labeledSetId);
      exerciseId = s?.exerciseId ?? null;
      sessionId = s?.sessionId ?? null;
    } else if (it.regionId) {
      const r = await store.region(it.regionId);
      sessionId = r?.sessionId ?? null;
    }
    out.push({...it, exerciseId, sessionId});
  }
  return out;
}
