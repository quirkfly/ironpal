// Neural design v2 §12 (Jest): block normalisation, weighted cosine with availability masks,
// per-candidate weights from the ontology, prototype/exemplar blending and the reject rule.

import {buildEmbedding, cosine, imuBlock, l2, poseBlock, spectrum, videoBlock, type Embedding} from '../src/model/embed';
import {clipRangeUs, enrolGates} from '../src/model/enrol';
import {distance, prototype, recognize, weightsFor, type EmbeddingRow} from '../src/model/recognizer';
import {encodeF16} from '../src/model/f16';
import type {SetResult} from '../src/types/model';

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296 - 0.5;
  };
}
const vec = (n: number, r: () => number) => Array.from({length: n}, r);
function jitter(v: number[], amt: number, r: () => number) {
  return l2(v.map(x => x + amt * r()));
}
const emb = (video: number[] | null, pose: number[] | null, imu: number[] | null): Embedding => ({video, pose, imu});
const row = (id: string, exerciseId: string, e: Embedding, kind: 'set' | 'negative' = 'set'): EmbeddingRow => ({id, exerciseId, kind, emb: e});

describe('embed blocks', () => {
  it('L2-normalises each block on its own', () => {
    const r = rng(1);
    const v = videoBlock(vec(600, r));
    expect(v).toHaveLength(64);
    expect(Math.hypot(...v)).toBeCloseTo(1, 6);
    const p = poseBlock(vec(48, r), 0.8)!;
    expect(p).toHaveLength(48);
    expect(Math.hypot(...p)).toBeCloseTo(1, 6);
  });

  it('treats an unseen pose as absent, not as zeros', () => {
    expect(poseBlock(new Array(48).fill(0), 0)).toBeNull();
  });

  it('puts the spectrum peak at the rep cadence', () => {
    const rate = 50;
    const win = Array.from({length: 1000}, (_, t) => [Math.sin((2 * Math.PI * 0.5 * t) / rate), 0, 0]);
    const s = spectrum(win, rate);
    const fOf = (b: number) => 0.1 * Math.pow(30, b / 31);
    const peak = s.indexOf(Math.max(...s));
    // |sin| doubles the fundamental of the magnitude: 0.5 Hz motion → 1 Hz in |a|
    expect(fOf(peak)).toBeGreaterThan(0.8);
    expect(fOf(peak)).toBeLessThan(1.25);
  });

  it('has no IMU block for a set without samples', () => {
    const result = {samples: 0, windowF16: '', channels: 6, rateHz: 50} as unknown as SetResult;
    expect(imuBlock(result)).toBeNull();
    const withSamples = {samples: 100, windowF16: encodeF16(Array.from({length: 100}, (_, t) => [Math.sin(t / 8), 0, 0, 0, 0, 0])), channels: 6, rateHz: 50} as unknown as SetResult;
    const b = imuBlock(withSamples)!;
    expect(Math.hypot(...b)).toBeCloseTo(1, 4);
    expect(buildEmbedding(null, withSamples).video).toBeNull();
  });
});

describe('the distance (§3.4)', () => {
  it('weights the head IMU down for head-still candidates and keeps it for head-moving ones', () => {
    expect(weightsFor('dumbbell-biceps-curl')).toEqual({video: 1, pose: 1, imu: 0.15});
    const squat = weightsFor('barbell-back-squat');
    expect(squat.imu).toBeGreaterThanOrEqual(0.6);
  });

  it('renormalises over the blocks present, so a missing block does not shift the scale', () => {
    const r = rng(2);
    const a = emb(l2(vec(8, r)), l2(vec(8, r)), l2(vec(8, r)));
    const b = emb(jitter(a.video!, 0.1, r), jitter(a.pose!, 0.1, r), null);
    const w = {video: 1, pose: 1, imu: 1};
    const {d, sims} = distance(a, b, w);
    const expected = ((1 - cosine(a.video!, b.video!)) + (1 - cosine(a.pose!, b.pose!))) / 2;
    expect(d).toBeCloseTo(expected, 9);
    expect(sims.imu).toBeNull();
    expect(distance(emb(null, null, null), b, w).d).toBe(Number.POSITIVE_INFINITY);
  });

  it('prototype is the per-block mean, re-normalised', () => {
    const p = prototype([emb([1, 0], null, null), emb([0, 1], null, null)]);
    expect(p.video![0]).toBeCloseTo(Math.SQRT1_2, 9);
    expect(p.pose).toBeNull();
  });
});

describe('recognize (§5.3)', () => {
  const r = rng(3);
  const curl = emb(l2(vec(64, r)), l2(vec(48, r)), l2(vec(43, r)));
  const raise = emb(l2(vec(64, r)), l2(vec(48, r)), l2(vec(43, r)));
  const curlSets = [0, 1, 2].map(i => row(`c${i}`, 'dumbbell-biceps-curl', emb(jitter(curl.video!, 0.05, r), jitter(curl.pose!, 0.05, r), jitter(curl.imu!, 0.3, r))));
  const raiseSets = [0, 1, 2].map(i => row(`r${i}`, 'dumbbell-lateral-raise', emb(jitter(raise.video!, 0.05, r), jitter(raise.pose!, 0.05, r), jitter(raise.imu!, 0.3, r))));

  it('says so when nothing is enrolled', () => {
    expect(recognize(curl, []).rejectReason).toBe('no_enrolment');
  });

  it('recognises a new curl among curls and raises', () => {
    const q = emb(jitter(curl.video!, 0.05, r), jitter(curl.pose!, 0.05, r), null); // no IMU, e.g. imported clip
    const out = recognize(q, [...curlSets, ...raiseSets]);
    expect(out.label).toBe('dumbbell-biceps-curl');
    expect(out.rejectReason).toBeNull();
    expect(out.candidates[0].sims.video!).toBeGreaterThan(0.9);
    expect(out.enrolledExercises).toBe(2);
  });

  it('with one enrolled exercise, rejects a different movement as looked_different or low_confidence', () => {
    const out = recognize(raise, curlSets);
    expect(out.label).toBe('unknown');
    expect(['looked_different', 'low_confidence']).toContain(out.rejectReason);
  });

  it('accepts a repeat of the one enrolled exercise', () => {
    const q = emb(jitter(curl.video!, 0.05, r), jitter(curl.pose!, 0.05, r), jitter(curl.imu!, 0.3, r));
    const out = recognize(q, curlSets);
    expect(out.label).toBe('dumbbell-biceps-curl');
  });

  it('calls a near-tie between two exercises "not sure"', () => {
    const mid = emb(l2(curl.video!.map((x, i) => x + raise.video![i])), l2(curl.pose!.map((x, i) => x + raise.pose![i])), null);
    const out = recognize(mid, [...curlSets, ...raiseSets], {k: 3, tReject: 0, margin: 0.08, spreadFactor: 1000});
    expect(out.rejectReason).toBe('tie');
  });

  it('routes to "negative" when a rest window is nearer than the exercise', () => {
    const rest = emb(l2(vec(64, r)), l2(vec(48, r)), null);
    const out = recognize(rest, [...curlSets, row('n0', 'unknown', emb(jitter(rest.video!, 0.02, r), jitter(rest.pose!, 0.02, r), null), 'negative')], {k: 3, tReject: 0, margin: 0, spreadFactor: 1000});
    expect(out.rejectReason).toBe('negative');
  });
});

describe('enrolment helpers', () => {
  it('trims the clip to the IMU gate when it opened, otherwise keeps the whole clip', () => {
    const pts0 = 1_000_000_000;
    const res = {tStartNs: pts0, tOpenNs: pts0 + 5e9, tCloseNs: pts0 + 25e9} as SetResult;
    expect(clipRangeUs(res, pts0, 30_000_000)).toEqual([4_000_000, 26_000_000]);
    const neverOpened = {tStartNs: pts0, tOpenNs: pts0, tCloseNs: pts0} as SetResult;
    expect(clipRangeUs(neverOpened, pts0, 30_000_000)).toEqual([0, 30_000_000]);
  });

  it('does not demand head-IMU cycles of a head-still vision class', () => {
    const q = {poseVisible: 0.8, frames: 100, imuSamples: 900, clipPresent: true, ms: 1};
    expect(enrolGates(q, 'vision', true, 0)).toEqual({clip: true, poseVisible: true});
    expect(enrolGates(q, 'imu', false, 1)).toEqual({clip: true, imuCycles: false});
  });
});
