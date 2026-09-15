// Timeline maths for the Studio (studio design §8.1, §7.3, §9). Pure functions only, so every
// rule that decides where a frame or a mark lands is unit-tested without a device.

import type {ClipSync, ScannedRegion, SetResult, SyncClass} from '../types/model';
import type {LabeledSetRow} from './store';

/** host_ns(pts) = pts0HostNs + ptsNs × rate (design §8.1). */
export function hostNsForPts(sync: ClipSync, ptsUs: number): number {
  return sync.pts0HostNs + ptsUs * 1000 * sync.rate;
}

export function ptsUsForHost(sync: ClipSync, hostNs: number): number {
  const rate = sync.rate === 0 ? 1 : sync.rate;
  return (hostNs - sync.pts0HostNs) / (1000 * rate);
}

/** Index of the last frame whose PTS ≤ the host time; clamped; -1 for an empty table. */
export function frameIndexAtHost(ptsUs: number[], sync: ClipSync, hostNs: number): number {
  const n = ptsUs.length;
  if (n === 0) {
    return -1;
  }
  const target = ptsUsForHost(sync, hostNs);
  if (target < ptsUs[0]) {
    return 0;
  }
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ptsUs[mid] <= target) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo;
}

/** Seek target in seconds for frame i: floor(pts_ms) + 1 ms lands on i, never on i + 1 (design §8.1). */
export function seekTargetSec(ptsUs: number): number {
  return (Math.floor(ptsUs / 1000) + 1) / 1000;
}

/** Effective frame rate around frame i, from the real PTS spacing (VFR-aware). */
export function localFps(ptsUs: number[], i: number, span = 15): number {
  const n = ptsUs.length;
  if (n < 2) {
    return 0;
  }
  const a = Math.max(0, i - span);
  const b = Math.min(n - 1, i + span);
  if (b <= a) {
    return 0;
  }
  const dt = (ptsUs[b] - ptsUs[a]) / 1e6;
  return dt > 0 ? (b - a) / dt : 0;
}

/** Nearest snap point within the radius, or null. `pointsNs` must be sorted ascending. */
export function nearestSnap(pointsNs: number[], tNs: number, radiusNs: number): number | null {
  const n = pointsNs.length;
  if (n === 0) {
    return null;
  }
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (pointsNs[mid] < tNs) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  let best: number | null = null;
  let bestD = Infinity;
  for (const k of [lo - 1, lo]) {
    if (k >= 0 && k < n) {
      const d = Math.abs(pointsNs[k] - tNs);
      if (d < bestD) {
        bestD = d;
        best = pointsNs[k];
      }
    }
  }
  return best !== null && bestD <= radiusNs ? best : null;
}

export function resolveMarksVsCount(marks: number, typed: number | null): 'ok' | 'marks_fewer' | 'marks_more' {
  if (typed == null || typed === marks) {
    return 'ok';
  }
  return marks < typed ? 'marks_fewer' : 'marks_more';
}

/** The sync plan's residual classes (§5): < 40 ms accept, 40–80 flag, > 80 reject. */
export function syncClassFromResidual(residualMs: number | null, sameClock: boolean): SyncClass {
  if (residualMs == null) {
    return sameClock ? 'exact' : 'none';
  }
  const r = Math.abs(residualMs);
  if (r < 40) {
    return 'accept';
  }
  if (r <= 80) {
    return 'flag';
  }
  return 'reject';
}

/**
 * Regions not already covered by a set: a region more than half covered is dropped, a partially
 * overlapped one is trimmed to its uncovered part (the larger remaining piece).
 */
export function subtractSets(regions: ScannedRegion[], sets: {t0Ns: number; t1Ns: number}[]): ScannedRegion[] {
  const out: ScannedRegion[] = [];
  for (const r of regions) {
    const len = r.t1Ns - r.t0Ns;
    if (len <= 0) {
      continue;
    }
    let covered = 0;
    let t0 = r.t0Ns;
    let t1 = r.t1Ns;
    for (const s of sets) {
      const a = Math.max(r.t0Ns, s.t0Ns);
      const b = Math.min(r.t1Ns, s.t1Ns);
      if (b > a) {
        covered += b - a;
        // Trim: keep the larger uncovered side.
        const left = a - t0;
        const right = t1 - b;
        if (left >= right) {
          t1 = Math.min(t1, a);
        } else {
          t0 = Math.max(t0, b);
        }
      }
    }
    if (covered / len > 0.5 || t1 <= t0) {
      continue;
    }
    const frac = (t1 - t0) / len;
    out.push({...r, t0Ns: t0, t1Ns: t1, cycles: Math.max(0, Math.round(r.cycles * frac))});
  }
  return out;
}

function candidateConfidence(row: LabeledSetRow, exerciseId: string): number | null {
  if (!row.resultJson) {
    return null;
  }
  try {
    const res = JSON.parse(row.resultJson) as SetResult;
    const c = res.match?.candidates.find(x => x.exerciseId === exerciseId);
    return c ? 1 / (1 + c.dFused) : null;
  } catch {
    return null;
  }
}

/**
 * Propagate (design §7.8): ids of the following sets, in order, whose own analysis ranked the
 * anchor's exercise at or above T_imu_high — stopping at the first that does not (a block is
 * contiguous, so a break ends the offer).
 */
export function propagateCandidates(anchorExerciseId: string, following: LabeledSetRow[], tImuHigh: number): string[] {
  const out: string[] = [];
  for (const s of following) {
    const conf = candidateConfidence(s, anchorExerciseId);
    if (conf == null || conf < tImuHigh) {
      break;
    }
    out.push(s.id);
  }
  return out;
}

/** The rep window around a mark: ±½ cycle (design §3.3); default cycle 1.2 s when no cadence. */
export function repWindowNs(markNs: number, cadenceHz: number | null): {t0Ns: number; t1Ns: number} {
  const cycleNs = cadenceHz && cadenceHz > 0 ? 1e9 / cadenceHz : 1.2e9;
  return {t0Ns: markNs - cycleNs / 2, t1Ns: markNs + cycleNs / 2};
}

export function zoomClamp(zoom: number): number {
  if (!Number.isFinite(zoom)) {
    return 1;
  }
  return Math.min(32, Math.max(1, zoom));
}

/** Host-time marks → the ConfirmedSet's window-relative seconds plus their snap flags. */
export function marksToConfirmed(marksHostNs: number[], snapped: boolean[], windowStartNs: number): {repTopsSec: number[]; repTopsSnapped: boolean[]} {
  const idx = marksHostNs.map((t, i) => ({t, s: snapped[i] !== false})).sort((a, b) => a.t - b.t);
  return {repTopsSec: idx.map(m => (m.t - windowStartNs) / 1e9), repTopsSnapped: idx.map(m => m.s)};
}

/**
 * Video/IMU offset detector (design §9.4): pair each user mark with its nearest IMU peak; the
 * median signed offset is systematic when it exceeds 150 ms over at least three pairs.
 */
export function offsetDetector(userMarksNs: number[], imuPeaksNs: number[]): {medianOffsetMs: number; systematic: boolean} {
  if (!userMarksNs.length || !imuPeaksNs.length) {
    return {medianOffsetMs: 0, systematic: false};
  }
  const peaks = [...imuPeaksNs].sort((a, b) => a - b);
  const offsets: number[] = [];
  for (const m of userMarksNs) {
    let best = peaks[0];
    for (const p of peaks) {
      if (Math.abs(p - m) < Math.abs(best - m)) {
        best = p;
      }
    }
    offsets.push((m - best) / 1e6);
  }
  offsets.sort((a, b) => a - b);
  const k = Math.floor(offsets.length / 2);
  const median = offsets.length % 2 ? offsets[k] : (offsets[k - 1] + offsets[k]) / 2;
  return {medianOffsetMs: median, systematic: offsets.length >= 3 && Math.abs(median) > 150};
}
