// Unit tests for the Studio's pure model layer (studio design §17): timeline maths, rep shape,
// queue rules, rep-mark serialisation, the scorer export and sync classes.

import {
  frameIndexAtHost,
  hostNsForPts,
  localFps,
  marksToConfirmed,
  nearestSnap,
  offsetDetector,
  propagateCandidates,
  ptsUsForHost,
  repWindowNs,
  resolveMarksVsCount,
  seekTargetSec,
  subtractSets,
  syncClassFromResidual,
  zoomClamp,
} from '../src/model/timeline';
import {repShapeFromWindows} from '../src/model/repShape';
import {orderQueue, queueItemsAfterCommit, QUEUE_PRIORITY} from '../src/model/queue';
import {parseRepMarks, serializeRepMarks, type LabeledSetRow} from '../src/model/store';
import {buildPredictions} from '../src/model/exportLabels';
import type {ClipSync, QueueItem, SetResult} from '../src/types/model';

const sync: ClipSync = {pts0HostNs: 1_000_000_000, rate: 1, residualMs: null, class: 'exact', source: 'sensor_timestamps'};

/** A VFR table: 21.7 fps for the first third, 30 fps after (the ShenYao warm-up transient). */
function vfrTable(): number[] {
  const out: number[] = [];
  let t = 0;
  for (let i = 0; i < 90; i++) {
    out.push(Math.round(t));
    t += i < 30 ? 46100 : 33333;
  }
  return out;
}

function set(id: string, over: Partial<LabeledSetRow> = {}): LabeledSetRow {
  return {
    id, sessionId: 'sess', exerciseId: 'goblet-squat', tStart: 0, tEnd: 20, repMarks: [1, 2, 3], repsConfirmed: 3, repsDetected: 3,
    weightDeclared: 24, weightUnit: 'kg', weightOcr: null, weightOcrConf: null, weightState: 'confirmed',
    cadenceHz: 0.5, ampMedian: 2, dominantChannel: 2, durationSec: 20, gates: {motion: true, link: true, repAgreement: true, rig: true}, counted: true, createdAt: 1,
    ...over,
  };
}

function resultWith(candidates: {exerciseId: string; dFused: number}[], margin = 0.5): SetResult {
  return {
    setId: 's', sessionId: 'sess', tStartNs: 0, tEndNs: 20e9, tOpenNs: 1e9, tCloseNs: 19e9, gateState: 'CLOSED', rateHz: 50, samples: 1000,
    windowF16: '', channels: 6, hasGyro: true, reps: [], repsDetected: 8, seqGaps: 0, saturated: 0,
    match: {label: candidates[0]?.exerciseId ?? 'unknown', confidence: candidates[0] ? 1 / (1 + candidates[0].dFused) : 0, margin, provisional: false,
      candidates: candidates.map(c => ({...c, dKnn: c.dFused, dDtw: c.dFused, templateId: 't', kind: 'set', source: 'own'}))},
  };
}

describe('timeline: pts ↔ host', () => {
  it('maps both ways with the rate', () => {
    const s = {...sync, rate: 1.00005};
    const h = hostNsForPts(s, 2_000_000);
    expect(ptsUsForHost(s, h)).toBeCloseTo(2_000_000, 3);
    expect(hostNsForPts(sync, 0)).toBe(sync.pts0HostNs);
  });
  it('frameIndexAtHost finds the last frame ≤ t on a VFR table and clamps', () => {
    const pts = vfrTable();
    expect(frameIndexAtHost([], sync, 0)).toBe(-1);
    expect(frameIndexAtHost(pts, sync, sync.pts0HostNs - 5e9)).toBe(0);
    expect(frameIndexAtHost(pts, sync, sync.pts0HostNs + 1e12)).toBe(pts.length - 1);
    for (const i of [0, 1, 29, 30, 31, 88, 89]) {
      const exact = sync.pts0HostNs + pts[i] * 1000;
      expect(frameIndexAtHost(pts, sync, exact)).toBe(i);
      expect(frameIndexAtHost(pts, sync, exact + 1000)).toBe(i);
      if (i > 0) {
        expect(frameIndexAtHost(pts, sync, exact - 1000)).toBe(i - 1);
      }
    }
  });
  it('seekTargetSec lands on frame i and never on i + 1 (the 1 ms rule)', () => {
    const pts = vfrTable();
    for (let i = 0; i < pts.length - 1; i++) {
      const target = seekTargetSec(pts[i]) * 1e6;
      expect(target).toBeGreaterThanOrEqual(pts[i]);
      expect(target).toBeLessThan(pts[i + 1]);
    }
    expect(seekTargetSec(33333)).toBeCloseTo(0.034, 6);
  });
  it('localFps reflects the VFR transient', () => {
    const pts = vfrTable();
    expect(localFps(pts, 10, 5)).toBeCloseTo(21.7, 0);
    expect(localFps(pts, 70, 5)).toBeCloseTo(30, 0);
    expect(localFps([0], 0)).toBe(0);
  });
});

describe('timeline: snapping, counts, sync', () => {
  it('nearestSnap respects the radius and picks the closer neighbour', () => {
    const pts = [1e9, 2e9, 3e9];
    expect(nearestSnap(pts, 2.1e9, 0.2e9)).toBe(2e9);
    expect(nearestSnap(pts, 2.6e9, 0.2e9)).toBeNull();
    expect(nearestSnap(pts, 2.6e9, 0.5e9)).toBe(3e9);
    expect(nearestSnap(pts, 0, 2e9)).toBe(1e9);
    expect(nearestSnap([], 1, 1)).toBeNull();
  });
  it('resolveMarksVsCount', () => {
    expect(resolveMarksVsCount(8, null)).toBe('ok');
    expect(resolveMarksVsCount(8, 8)).toBe('ok');
    expect(resolveMarksVsCount(8, 9)).toBe('marks_fewer');
    expect(resolveMarksVsCount(9, 8)).toBe('marks_more');
  });
  it('syncClassFromResidual follows the sync plan table', () => {
    expect(syncClassFromResidual(null, true)).toBe('exact');
    expect(syncClassFromResidual(null, false)).toBe('none');
    expect(syncClassFromResidual(12, false)).toBe('accept');
    expect(syncClassFromResidual(40, false)).toBe('flag');
    expect(syncClassFromResidual(80, false)).toBe('flag');
    expect(syncClassFromResidual(-81, false)).toBe('reject');
  });
  it('zoomClamp and repWindowNs', () => {
    expect(zoomClamp(0.2)).toBe(1);
    expect(zoomClamp(64)).toBe(32);
    expect(zoomClamp(NaN)).toBe(1);
    expect(repWindowNs(10e9, 0.5)).toEqual({t0Ns: 9e9, t1Ns: 11e9});
    expect(repWindowNs(10e9, null)).toEqual({t0Ns: 9.4e9, t1Ns: 10.6e9});
  });
  it('marksToConfirmed sorts and converts to window seconds', () => {
    const r = marksToConfirmed([12e9, 11e9], [false, true], 10e9);
    expect(r.repTopsSec).toEqual([1, 2]);
    expect(r.repTopsSnapped).toEqual([true, false]);
  });
  it('offsetDetector flags a systematic offset over ≥ 3 pairs', () => {
    const peaks = [1e9, 2e9, 3e9, 4e9];
    expect(offsetDetector([1.2e9, 2.2e9, 3.19e9], peaks).systematic).toBe(true);
    expect(offsetDetector([1.2e9, 2.2e9], peaks).systematic).toBe(false);
    const small = offsetDetector([1.05e9, 2.04e9, 3.06e9], peaks);
    expect(small.systematic).toBe(false);
    expect(small.medianOffsetMs).toBeCloseTo(50, 0);
    expect(offsetDetector([], peaks)).toEqual({medianOffsetMs: 0, systematic: false});
  });
});

describe('timeline: regions and propagate', () => {
  it('subtractSets drops covered regions and trims partial overlaps', () => {
    const regions = [
      {t0Ns: 0, t1Ns: 10e9, cycles: 10, periodicity: 0.5},
      {t0Ns: 20e9, t1Ns: 30e9, cycles: 10, periodicity: 0.5},
      {t0Ns: 40e9, t1Ns: 50e9, cycles: 10, periodicity: 0.5},
    ];
    const out = subtractSets(regions, [{t0Ns: 2e9, t1Ns: 9e9}, {t0Ns: 28e9, t1Ns: 35e9}]);
    expect(out.map(r => [r.t0Ns, r.t1Ns])).toEqual([[20e9, 28e9], [40e9, 50e9]]);
    expect(out[0].cycles).toBe(8);
  });
  it('propagateCandidates stops at the first non-qualifying set', () => {
    const rj = (c: {exerciseId: string; dFused: number}[]) => JSON.stringify(resultWith(c));
    const following = [
      set('a', {resultJson: rj([{exerciseId: 'goblet-squat', dFused: 0.2}])}),
      set('b', {resultJson: rj([{exerciseId: 'front-squat', dFused: 0.1}, {exerciseId: 'goblet-squat', dFused: 0.3}])}),
      set('c', {resultJson: rj([{exerciseId: 'goblet-squat', dFused: 1.5}])}),
      set('d', {resultJson: rj([{exerciseId: 'goblet-squat', dFused: 0.1}])}),
    ];
    expect(propagateCandidates('goblet-squat', following, 0.7)).toEqual(['a', 'b']);
    expect(propagateCandidates('goblet-squat', [set('x')], 0.7)).toEqual([]);
  });
});

describe('repShape', () => {
  const win = (phase: number) => Array.from({length: 40}, (_, i) => [0, 0, Math.sin((2 * Math.PI * i) / 40 + phase), 0, 0, 0]);
  it('needs five windows, then peaks near the middle for a centred rep', () => {
    expect(repShapeFromWindows([win(0), win(0), win(0), win(0)], 2)).toBeNull();
    // Windows are ±½ cycle around the top, so the top sits in the middle: phase −π/2 puts sin's max at i = 10 of 40 → shift to centre.
    const centred = Array.from({length: 5}, () => Array.from({length: 40}, (_, i) => [0, 0, Math.cos((2 * Math.PI * (i - 20)) / 40), 0, 0, 0]));
    const shape = repShapeFromWindows(centred, 2)!;
    expect(shape.length).toBe(64);
    const argmax = shape.indexOf(Math.max(...shape));
    expect(Math.abs(argmax - 32)).toBeLessThanOrEqual(1);
    const mean = shape.reduce((a, b) => a + b, 0) / shape.length;
    expect(Math.abs(mean)).toBeLessThan(0.05);
  });
  it('uses the magnitude for channel -1', () => {
    const w = Array.from({length: 5}, () => Array.from({length: 20}, (_, i) => [i, i, i, 0, 0, 0]));
    const s = repShapeFromWindows(w, -1, 8)!;
    expect(s[7]).toBeGreaterThan(s[0]);
  });
});

describe('queue', () => {
  const base = {setId: 'set1', repsConfirmed: 8, repSignal: 'imu' as const, exerciseId: 'goblet-squat', names: {'goblet-squat': 'Goblet squat', 'front-squat': 'Front squat'}, now: 5};
  const gatesOk = {motion: true, link: true, repAgreement: true, rig: true};
  it('queues a fixable gate failure, not a link failure', () => {
    const r = resultWith([{exerciseId: 'goblet-squat', dFused: 0.2}]);
    const a = queueItemsAfterCommit({...base, result: r, gates: {...gatesOk, repAgreement: false}, chosenAgainstTop1: false});
    expect(a.map(x => x.kind)).toEqual(['gate_fixable']);
    expect(a[0].focus).toBe('marks');
    expect(a[0].text).toContain('8');
    const b = queueItemsAfterCommit({...base, result: r, gates: {...gatesOk, repAgreement: false, link: false}, chosenAgainstTop1: false});
    expect(b).toEqual([]);
    const c = queueItemsAfterCommit({...base, result: r, gates: {...gatesOk, motion: false}, chosenAgainstTop1: false});
    expect(c[0].focus).toBe('bounds');
  });
  it('queues low margin and choices against the top-1', () => {
    const low = resultWith([{exerciseId: 'goblet-squat', dFused: 0.2}, {exerciseId: 'front-squat', dFused: 0.25}], 0.05);
    const a = queueItemsAfterCommit({...base, result: low, gates: gatesOk, chosenAgainstTop1: false});
    expect(a.map(x => x.kind)).toEqual(['low_margin']);
    expect(a[0].text).toContain('Front squat');
    const wide = resultWith([{exerciseId: 'front-squat', dFused: 0.2}], 0.5);
    const b = queueItemsAfterCommit({...base, result: wide, gates: gatesOk, chosenAgainstTop1: true});
    expect(b[0].kind).toBe('low_margin');
    expect(b[0].text).toContain('Goblet squat');
    expect(queueItemsAfterCommit({...base, result: wide, gates: gatesOk, chosenAgainstTop1: false})).toEqual([]);
  });
  it('queues an OCR disagreement only with data', () => {
    const r = resultWith([{exerciseId: 'goblet-squat', dFused: 0.2}]);
    const a = queueItemsAfterCommit({...base, result: r, gates: gatesOk, chosenAgainstTop1: false, weightOcr: {value: 22.5, unit: 'kg'}, weightDeclared: 30});
    expect(a.map(x => x.kind)).toEqual(['ocr_disagree']);
    const b = queueItemsAfterCommit({...base, result: r, gates: gatesOk, chosenAgainstTop1: false, weightOcr: {value: 30, unit: 'kg'}, weightDeclared: 30});
    expect(b).toEqual([]);
  });
  it('orderQueue sorts by priority then time and keeps one item per set', () => {
    const it = (id: string, kind: QueueItem['kind'], setId: string | null, createdAt: number): QueueItem => ({id, kind, priority: QUEUE_PRIORITY[kind], labeledSetId: setId, regionId: null, clipId: null, focus: 'review', text: '', state: 'open', createdAt, resolvedAt: null});
    const out = orderQueue([it('a', 'low_margin', 's1', 3), it('b', 'gate_fixable', 's1', 4), it('c', 'region', null, 1), it('d', 'gate_fixable', 's2', 2)]);
    expect(out.map(x => x.id)).toEqual(['d', 'b', 'c']);
  });
});

describe('rep marks serialisation', () => {
  it('reads legacy seconds and v2 objects, writes both', () => {
    expect(parseRepMarks('[1.5,2.5]')).toEqual({t: [1.5, 2.5], snapped: undefined});
    expect(parseRepMarks('[{"t":1.5,"snapped":true},{"t":2.5,"snapped":false}]')).toEqual({t: [1.5, 2.5], snapped: [true, false]});
    expect(parseRepMarks('[]')).toEqual({t: [], snapped: undefined});
    expect(serializeRepMarks([1, 2])).toBe('[1,2]');
    const round = parseRepMarks(serializeRepMarks([1, 2], [true, false]));
    expect(round).toEqual({t: [1, 2], snapped: [true, false]});
  });
});

describe('export for the scorers', () => {
  it('imu → exact range, vision → ±1, weight abstains when not confirmed', () => {
    const file = buildPredictions(
      [set('a'), set('b', {exerciseId: 'dumbbell-biceps-curl', repsConfirmed: 6, weightState: 'unreadable', weightDeclared: null}), set('c', {repsConfirmed: null, repMarks: []})],
      id => (id === 'goblet-squat' ? 'imu' : 'vision'),
      {'goblet-squat': 'Goblet squat'},
    );
    const [a, b, c] = file.predictions;
    expect(a.reps_range).toEqual([3, 3]);
    expect(a.predicted_reps).toBe(3);
    expect(a.predicted_kg).toBe(24);
    expect(a.abstained).toBe(false);
    expect(a.exercise_name).toBe('Goblet squat');
    expect(b.reps_range).toEqual([5, 7]);
    expect(b.abstained).toBe(true);
    expect(b.predicted_kg).toBeNull();
    expect(c.reps_abstained).toBe(true);
    expect(c.reps_range).toBeNull();
    expect(file.predictions.every(p => typeof p.id === 'string' && 'confidence' in p)).toBe(true);
  });
});
