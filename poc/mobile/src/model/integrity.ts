// Leave-one-out integrity (design §4.4, ledger Q1): the native engine scores every own set
// template against the campaign index minus itself (`scoreAll`); this module only aggregates.

import type {ScoreAllRow} from '../types/model';

export interface IntegrityReport {
  perExercise: Record<string, number>;
  /** Own negatives that were (correctly) rejected as unknown, over all own negatives. */
  negativeRejectRate: number | null;
  scored: number;
}

/** Pure aggregation, so it is unit-testable with synthetic rows. */
export function aggregate(rows: ScoreAllRow[]): IntegrityReport {
  const hit: Record<string, number> = {};
  const tot: Record<string, number> = {};
  let negTotal = 0;
  let negRejected = 0;
  for (const r of rows) {
    if (r.exerciseId === 'unknown') {
      negTotal++;
      if (r.label === 'unknown') {
        negRejected++;
      }
      continue;
    }
    tot[r.exerciseId] = (tot[r.exerciseId] ?? 0) + 1;
    if (r.label === r.exerciseId) {
      hit[r.exerciseId] = (hit[r.exerciseId] ?? 0) + 1;
    }
  }
  const perExercise: Record<string, number> = {};
  for (const e of Object.keys(tot)) {
    perExercise[e] = (hit[e] ?? 0) / tot[e];
  }
  return {perExercise, negativeRejectRate: negTotal ? negRejected / negTotal : null, scored: rows.length};
}

/**
 * The per-user reject threshold fit (design §4.2): the confidence bar such that ≥ 95 % of own
 * negatives fall below it and ≥ 90 % of own sets clear it, searched over a grid; null when the
 * data rule is not met (≥ 20 negatives, ≥ 10 own sets) or no bar satisfies both.
 */
export function fitTReject(rows: ScoreAllRow[], minNegatives = 20, minSets = 10): number | null {
  const negs = rows.filter(r => r.exerciseId === 'unknown').map(r => r.confidence);
  const sets = rows.filter(r => r.exerciseId !== 'unknown').map(r => r.confidence);
  if (negs.length < minNegatives || sets.length < minSets) {
    return null;
  }
  // Grid over fused distance d ∈ [0.6, 2.0] ⇒ confidence 1/(1+d) ∈ [0.33, 0.63].
  let best: number | null = null;
  for (let d = 0.6; d <= 2.0001; d += 0.02) {
    const bar = 1 / (1 + d);
    const negOk = negs.filter(c => c < bar).length / negs.length >= 0.95;
    const setOk = sets.filter(c => c >= bar).length / sets.length >= 0.9;
    if (negOk && setOk) {
      // Prefer the highest bar that still keeps 90 % of sets (most conservative rejection).
      best = best === null ? bar : Math.max(best, bar);
    }
  }
  return best === null ? null : Math.round(best * 1000) / 1000;
}
