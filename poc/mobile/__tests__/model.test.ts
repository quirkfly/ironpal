// Unit tests for the JS learning layer (design §11): pure functions only — the store and the
// native engine are exercised on device and in the Kotlin JVM tests.

import {crc32, decodeF16, encodeF16, fromHalf, toHalf} from '../src/model/f16';
import {compose, ENGINE_DEFAULTS, LEVEL_DEFAULTS, toEngineJson} from '../src/model/params';
import {afterCleanSet, afterLiveCorrection, automation, eligibleState, emptyProgress} from '../src/model/levels';
import {aggregate, fitTReject} from '../src/model/integrity';
import {fitExercise, median, percentile} from '../src/model/learner';
import {gateExplanation, propose} from '../src/model/decide';
import {angleBetween, apply, fromRitual} from '../src/model/canonical';
import {campaignOf, repSignalOf, signedPayload} from '../src/model/packageManager';
import type {LabeledSetRow} from '../src/model/store';
import type {ModelPackage, ScoreAllRow, SetResult} from '../src/types/model';

describe('f16', () => {
  it('round-trips within half precision', () => {
    for (const v of [0, 1, -1, 9.81, -12.345, 0.001, 100.5]) {
      expect(Math.abs(fromHalf(toHalf(v)) - v)).toBeLessThan(Math.max(0.002, Math.abs(v) * 0.001));
    }
    const w = [[1, -2, 3.5, 0, 0, 0], [0.25, 0.5, -0.75, 1, 2, 3]];
    const back = decodeF16(encodeF16(w), 6);
    expect(back.length).toBe(2);
    expect(back[1][2]).toBeCloseTo(-0.75, 3);
    expect(crc32('abc')).toBe(0x352441c2);
  });
});

describe('params', () => {
  it('defaults are the POC constants and fits override per key', () => {
    const c = compose({}, []);
    expect(c.engine.t_reject).toBe(0.45);
    expect(c.engine.tick_ms).toBe(400);
    expect(c.levels).toEqual(LEVEL_DEFAULTS);
    const f = compose({t_reject: 0.5}, [
      {scope: 'exercise', exerciseId: 'squat', name: 'a_min', value: 1.2, fittedFromN: 4, packageDefault: null, updatedAt: 1},
      {scope: 'user', exerciseId: null, name: 't_reject', value: 0.52, fittedFromN: 40, packageDefault: 0.45, updatedAt: 1},
    ]);
    expect(f.engine.per_exercise.squat.a_min).toBe(1.2);
    expect(f.engine.t_reject).toBe(0.52);
    expect(f.source.t_reject).toBe('fitted');
    expect(f.source['per_exercise.squat.a_min']).toBe('fitted');
    expect(JSON.parse(toEngineJson(ENGINE_DEFAULTS)).feature_weights.gyro).toBe(1.5);
  });
});

describe('levels', () => {
  const P = LEVEL_DEFAULTS;
  it('moves up through the states as counts and integrity allow', () => {
    let p = emptyProgress('squat', null);
    expect(eligibleState(p, P)).toBe('locked');
    p = {...p, cleanSets: 1, integrity: 0.5};
    expect(afterCleanSet(p, P, 1).progress.state).toBe('recon');
    p = {...p, cleanSets: 3, integrity: 0.85};
    let r = afterCleanSet({...p, state: 'recon'}, P, 2);
    expect(r.progress.state).toBe('provisional');
    p = {...r.progress, cleanSets: 5, distinctWeights: 2, integrity: 0.95};
    r = afterCleanSet(p, P, 3);
    expect(r.progress.state).toBe('certified');
    expect(r.transition?.to).toBe('certified');
    // Not certified with one weight.
    const one = afterCleanSet({...p, state: 'provisional', distinctWeights: 1}, P, 4);
    expect(one.progress.state).toBe('provisional');
  });
  it('demotes on two consecutive live corrections and on an integrity drop', () => {
    const p = {...emptyProgress('squat', null), state: 'certified' as const, cleanSets: 6, distinctWeights: 2, integrity: 0.95};
    const a = afterLiveCorrection(p, P, 1);
    expect(a.progress.state).toBe('certified');
    expect(a.progress.consecutiveCorrections).toBe(1);
    const b = afterLiveCorrection(a.progress, P, 2);
    expect(b.progress.state).toBe('provisional');
    const drop = afterCleanSet({...p, integrity: 0.7}, P, 3);
    expect(drop.progress.state).toBe('provisional');
    expect(automation('certified')).toBe('auto');
    expect(automation('provisional')).toBe('ask');
  });
});

describe('integrity', () => {
  const row = (t: string, e: string, label: string, conf: number): ScoreAllRow => ({templateId: t, exerciseId: e, label, confidence: conf, topK: []});
  it('aggregates per exercise and negatives separately', () => {
    const rep = aggregate([row('a', 'squat', 'squat', 0.8), row('b', 'squat', 'lunge', 0.6), row('c', 'lunge', 'lunge', 0.7), row('n1', 'unknown', 'unknown', 0.3), row('n2', 'unknown', 'squat', 0.5)]);
    expect(rep.perExercise.squat).toBe(0.5);
    expect(rep.perExercise.lunge).toBe(1);
    expect(rep.negativeRejectRate).toBe(0.5);
  });
  it('fits t_reject only with enough data and separable scores', () => {
    const rows: ScoreAllRow[] = [];
    for (let i = 0; i < 25; i++) {
      rows.push(row(`n${i}`, 'unknown', 'unknown', 0.3 + (i % 5) * 0.02));
    }
    for (let i = 0; i < 12; i++) {
      rows.push(row(`s${i}`, 'squat', 'squat', 0.6 + (i % 4) * 0.05));
    }
    const t = fitTReject(rows);
    expect(t).not.toBeNull();
    expect(t!).toBeGreaterThan(0.4);
    expect(t!).toBeLessThanOrEqual(0.6);
    expect(fitTReject(rows.slice(0, 20))).toBeNull();
  });
});

describe('learner fits', () => {
  const set = (i: number, cadence: number, amp: number, ch: number, dur: number): LabeledSetRow => ({
    id: `s${i}`, sessionId: 'sess', exerciseId: 'squat', tStart: 0, tEnd: dur, repMarks: [], repsConfirmed: 8, repsDetected: 8,
    weightDeclared: 40, weightUnit: 'kg', weightOcr: null, weightOcrConf: null, weightState: 'confirmed',
    cadenceHz: cadence, ampMedian: amp, dominantChannel: ch, durationSec: dur, gates: {}, counted: true, createdAt: i,
  });
  it('median/percentile helpers', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(percentile([1, 2, 3, 4, 5], 50)).toBe(3);
  });
  it('needs three sets, then fits band, amplitude, channel and duration', () => {
    expect(fitExercise('squat', [set(1, 0.6, 3, 2, 20), set(2, 0.7, 3.2, 2, 22)], ENGINE_DEFAULTS, 1)).toEqual([]);
    const fits = fitExercise('squat', [set(1, 0.6, 3, 2, 20), set(2, 0.7, 3.2, 2, 22), set(3, 0.65, 2.8, 0, 18)], ENGINE_DEFAULTS, 1);
    const byName = Object.fromEntries(fits.map(f => [f.name, f.value]));
    expect(byName.cadence_low_hz).toBeCloseTo(0.48, 2);
    expect(byName.cadence_high_hz).toBeCloseTo(0.84, 2);
    expect(byName.a_min).toBeCloseTo(1.2, 2);
    expect(byName.dominant_channel).toBe(2);
    expect(byName.set_duration_median_sec).toBe(20);
    expect(fits.every(f => f.scope === 'exercise' && f.exerciseId === 'squat')).toBe(true);
  });
});

describe('decide', () => {
  const result: SetResult = {
    setId: 's', sessionId: 'x', tStartNs: 0, tEndNs: 1, tOpenNs: 0, tCloseNs: 1, gateState: 'CLOSED', rateHz: 50, samples: 200,
    windowF16: '', channels: 6, hasGyro: false, reps: [{n: 1, tPeakSec: 1, amplitude: 2, tConfirmedSec: 1.3}, {n: 2, tPeakSec: 2.2, amplitude: 2.1, tConfirmedSec: 2.5}],
    repsDetected: 2, peaksZeroPhase: [1, 2.2, 3.1], cadenceHz: 0.8, periodicity: 0.7, energy: 0.1, dominantChannel: 2, seqGaps: 0, saturated: 0,
    match: {label: 'squat', confidence: 0.82, margin: 0.4, provisional: false, candidates: [
      {exerciseId: 'squat', dFused: 0.22, dKnn: 0.3, dDtw: 0.1, templateId: 'own1', kind: 'set', source: 'own'},
      {exerciseId: 'lunge', dFused: 0.62, dKnn: 0.6, dDtw: 0.65, templateId: 'p2', kind: 'prior', source: 'founder'},
    ]},
  };
  const thresholds = {t_reject: 0.45, t_imu_high: 0.7, t_ocr: 0.6};
  it('explains an own-template match and does not ask when certified and confident', () => {
    const p = propose({result, repSignal: 'imu', levelState: 'certified', weightPrior: {weight: 24, unit: 'kg'}, ocr: {weight: 24, unit: 'kg', confidence: 0.91}, thresholds, names: {squat: 'Goblet Squat', lunge: 'Walking Lunge'}, bestSetInfo: {date: '12 May', weight: 24, reps: 8}});
    expect(p.exercise.value).toBe('squat');
    expect(p.exercise.needsConfirm).toBe(false);
    expect(p.exercise.explanation.summary).toContain('Goblet Squat from 12 May (82%)');
    expect(p.exercise.explanation.alternatives?.[1].label).toBe('Walking Lunge');
    expect(p.reps.value).toBe(2);
    expect(p.reps.explanation.summary).toContain('1 candidate peak(s) rejected');
    expect(p.weight.value).toBe(24);
    expect(p.weight.needsConfirm).toBe(false);
  });
  it('asks on provisional, on OCR disagreement, and declines reps on hard exercises', () => {
    const p = propose({result, repSignal: 'hard', levelState: 'provisional', weightPrior: {weight: 24, unit: 'kg'}, ocr: {weight: 30, unit: 'kg', confidence: 0.9}, thresholds});
    expect(p.exercise.needsConfirm).toBe(true);
    expect(p.reps.value).toBeNull();
    expect(p.reps.source).toBe('manual');
    expect(p.weight.needsConfirm).toBe(true);
    expect(p.weight.explanation.summary).toContain('which is it');
  });
  it('marks unknown and prior matches honestly', () => {
    const unk = propose({result: {...result, match: {...result.match!, label: 'unknown', confidence: 0.3}}, repSignal: 'imu', levelState: 'recon', weightPrior: null, ocr: null, thresholds});
    expect(unk.exercise.source).toBe('unknown');
    expect(unk.weight.explanation.summary).toBe('I never saw the weight.');
    const prior = propose({result: {...result, match: {...result.match!, candidates: [{...result.match!.candidates[1], exerciseId: 'squat'}]}}, repSignal: 'imu', levelState: 'recon', weightPrior: null, ocr: null, thresholds});
    expect(prior.exercise.source).toBe('prior');
    const g = gateExplanation(0.2, 0.01, 0.35);
    expect(g.explanation.summary).toContain('0.20 < 0.35');
  });
});

describe('canonical', () => {
  it('recovers the upright frame and measures a tilt', () => {
    const c = fromRitual([0, 0, -9.81], [5, 0.2, 0.1]);
    expect(apply(c.rotation, [0, 0, 1])[2]).toBeCloseTo(1, 9);
    expect(c.residualDeg).toBeLessThan(0.5);
    const t = (20 * Math.PI) / 180;
    const c2 = fromRitual([0, 9.81 * Math.sin(t), -9.81 * Math.cos(t)], [5, 0.2, 0.1]);
    expect(Math.abs(angleBetween(c.rotation, c2.rotation) - 20)).toBeLessThan(1);
  });
});

describe('packageManager', () => {
  const pkg = {campaign_map: {imu: ['squat'], fusion: ['ohp'], vision: ['curl'], hard: ['pushdown']}, signature: 'x', package_version: '1'} as unknown as ModelPackage;
  it('maps exercises to campaigns and strips the signature for the signed payload', () => {
    expect(repSignalOf(pkg, 'ohp')).toBe('fusion');
    expect(campaignOf(pkg, 'squat')).toEqual(['squat', 'ohp']);
    expect(campaignOf(pkg, 'curl')).toEqual(['curl']);
    expect(signedPayload(pkg)).not.toContain('"signature"');
  });
});
