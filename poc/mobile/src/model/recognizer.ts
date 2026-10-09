// Neural design v2 — the recogniser (§3.4, §4.2, §5.3): weighted cosine per CANDIDATE exercise
// over the user's own enrolled embeddings, prototype + k-nearest exemplars, and the reject rule.
// Pure: rows in, a ranked answer with its evidence out. No row is ever compared without saying
// which exercise is being asked about, because the weights depend on the candidate.

import ontology from './ontology_weights.json';
import {BLOCKS, cosine, l2, type Block, type Embedding} from './embed';

export interface EmbeddingRow {
  id: string;
  exerciseId: string;
  kind: 'set' | 'negative';
  emb: Embedding;
}

export interface RecognizerParams {
  k: number;
  tReject: number;
  margin: number;
  /** A candidate whose distance exceeds this multiple of its own spread "looked different". */
  spreadFactor: number;
}

export const DEFAULT_RECOGNIZER: RecognizerParams = {k: 3, tReject: 0.45, margin: 0.08, spreadFactor: 2};

type Onto = {head: string | null; vis: string | null; rep: string | null};
const ONTO = (ontology as unknown as {exercises: Record<string, Onto>}).exercises;

/** w_m(c): how much each modality can see of candidate c (design §A.3 table). */
export function weightsFor(exerciseId: string): Record<Block, number> {
  const o = ONTO[exerciseId];
  const imu = o?.head === 'still' ? 0.15 : o?.head === 'floor_reference' ? 0.6 : 1.0;
  const pose = o?.vis === 'occluded' ? 0.3 : o?.vis === 'partial' ? 0.6 : 1.0;
  return {video: 1.0, pose, imu};
}

export interface BlockSims {
  video: number | null;
  pose: number | null;
  imu: number | null;
}

/** d(e, x | c) = Σ w·a·(1 − cos) / Σ w·a, plus the per-block similarities as the explanation. */
export function distance(q: Embedding, x: Embedding, w: Record<Block, number>): {d: number; sims: BlockSims; weightUsed: number} {
  let num = 0;
  let den = 0;
  const sims: BlockSims = {video: null, pose: null, imu: null};
  for (const m of BLOCKS) {
    const a = q[m];
    const b = x[m];
    if (!a || !b) {
      continue; // availability a_m = 0
    }
    const c = cosine(a, b);
    sims[m] = c;
    num += w[m] * (1 - c);
    den += w[m];
  }
  return den > 0 ? {d: num / den, sims, weightUsed: den} : {d: Number.POSITIVE_INFINITY, sims, weightUsed: 0};
}

/** Per-block mean of rows, re-normalised; a block missing from every row stays null. */
export function prototype(rows: Embedding[]): Embedding {
  const out: Embedding = {video: null, pose: null, imu: null};
  for (const m of BLOCKS) {
    const vs = rows.map(r => r[m]).filter((v): v is number[] => !!v);
    if (!vs.length) {
      continue;
    }
    const acc = new Array<number>(vs[0].length).fill(0);
    for (const v of vs) {
      v.forEach((x, i) => (acc[i] += x));
    }
    out[m] = l2(acc);
  }
  return out;
}

export interface Candidate {
  exerciseId: string;
  d: number;
  confidence: number;
  dPrototype: number;
  dExemplar: number;
  sims: BlockSims;
  /** Enrolled sets of this exercise. */
  n: number;
  /** Median leave-one-out distance among this exercise's own sets (null below 2 sets). */
  spread: number | null;
}

export interface Recognition {
  label: string; // exercise id or 'unknown'
  confidence: number;
  rejectReason: null | 'no_enrolment' | 'low_confidence' | 'tie' | 'negative' | 'looked_different' | 'nothing_seen';
  candidates: Candidate[];
  enrolledExercises: number;
}

function scoreCandidate(q: Embedding, own: EmbeddingRow[], exerciseId: string, p: RecognizerParams): Candidate {
  const w = weightsFor(exerciseId);
  const proto = distance(q, prototype(own.map(r => r.emb)), w);
  const ex = own.map(r => distance(q, r.emb, w)).sort((a, b) => a.d - b.d).slice(0, p.k);
  const dEx = ex.reduce((s, e) => s + e.d, 0) / Math.max(1, ex.length);
  const d = 0.5 * proto.d + 0.5 * dEx;
  let spread: number | null = null;
  if (own.length >= 2) {
    const loo = own.map((r, i) => {
      const rest = own.filter((_, j) => j !== i).map(o => o.emb);
      return distance(r.emb, prototype(rest), w).d;
    });
    loo.sort((a, b) => a - b);
    spread = loo[Math.floor(loo.length / 2)];
  }
  return {exerciseId, d, confidence: 1 / (1 + d), dPrototype: proto.d, dExemplar: dEx, sims: proto.sims, n: own.length, spread};
}

/** Rank the user's enrolled exercises for one set and apply the reject rule (design §5.3). */
export function recognize(q: Embedding, rows: EmbeddingRow[], p: RecognizerParams = DEFAULT_RECOGNIZER): Recognition {
  if (!q.video && !q.pose && !q.imu) {
    return {label: 'unknown', confidence: 0, rejectReason: 'nothing_seen', candidates: [], enrolledExercises: 0};
  }
  const byEx = new Map<string, EmbeddingRow[]>();
  for (const r of rows) {
    if (r.kind === 'set') {
      byEx.set(r.exerciseId, [...(byEx.get(r.exerciseId) ?? []), r]);
    }
  }
  if (!byEx.size) {
    return {label: 'unknown', confidence: 0, rejectReason: 'no_enrolment', candidates: [], enrolledExercises: 0};
  }
  const cands = [...byEx.entries()].map(([ex, own]) => scoreCandidate(q, own, ex, p)).sort((a, b) => a.d - b.d);
  const best = cands[0];
  const out: Recognition = {label: best.exerciseId, confidence: best.confidence, rejectReason: null, candidates: cands, enrolledExercises: byEx.size};

  const negatives = rows.filter(r => r.kind === 'negative');
  const nearestNeg = negatives.length ? Math.min(...negatives.map(n => distance(q, n.emb, weightsFor(best.exerciseId)).d)) : Number.POSITIVE_INFINITY;
  const w = weightsFor(best.exerciseId);
  const sightWeight = (q.pose ? w.pose : 0) + (q.video ? 1 : 0);

  if (best.confidence < p.tReject) {
    out.rejectReason = 'low_confidence';
  } else if (cands.length > 1 && cands[1].d - best.d < p.margin) {
    out.rejectReason = 'tie';
  } else if (nearestNeg < best.dExemplar) {
    out.rejectReason = 'negative';
  } else if (ONTO[best.exerciseId]?.head === 'still' && sightWeight < 0.5) {
    out.rejectReason = 'nothing_seen';
  } else if (best.spread != null && best.dPrototype > p.spreadFactor * Math.max(best.spread, 0.02)) {
    // same scale as the spread: both are distances to a prototype
    out.rejectReason = 'looked_different';
  }
  if (out.rejectReason) {
    out.label = 'unknown';
  }
  return out;
}
