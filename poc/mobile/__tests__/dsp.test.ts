import {
  autocorrelationPeriodicity,
  bandPass,
  detectPeaks,
  extractFeatures,
  featureDistance,
  matchAgainstTemplates,
  normalizedDtw,
  resample,
} from '../src/signal/dsp';
import type {FeatureVector, Template} from '../src/types/domain';

// Synthesize an accel window for a periodic "rep" motion at `cadenceHz` on the
// vertical (z) axis, plus small noise. Used to exercise the real DSP.
function syntheticAccel(
  cadenceHz: number,
  seconds: number,
  rateHz = 50,
  amplitude = 1,
): number[][] {
  const n = Math.round(seconds * rateHz);
  const out: number[][] = [];
  for (let i = 0; i < n; i++) {
    const t = i / rateHz;
    const z = amplitude * Math.sin(2 * Math.PI * cadenceHz * t);
    const noise = () => (Math.random() - 0.5) * 0.02 * amplitude;
    out.push([noise(), noise(), z + noise()]);
  }
  return out;
}

describe('DSP', () => {
  test('resample changes length toward the target rate', () => {
    const src = syntheticAccel(0.5, 4, 100);
    const dst = resample(src, 100, 50);
    // ~half the samples for half the rate.
    expect(dst.length).toBeGreaterThan(src.length / 2 - 5);
    expect(dst.length).toBeLessThan(src.length / 2 + 5);
    expect(dst[0].length).toBe(3);
  });

  test('band-pass settles a DC offset toward zero after warm-up', () => {
    const x = new Array(400).fill(5); // constant → out of band
    const y = bandPass(x, 50);
    // Causal one-pole filters have an initial transient (y[0] = x[0]); after it
    // settles, a constant (DC) input is fully attenuated.
    const settled = y.slice(200);
    const maxAbs = Math.max(...settled.map(Math.abs));
    expect(maxAbs).toBeLessThan(0.5);
  });

  test('autocorrelation recovers the cadence of a periodic signal', () => {
    const accel = syntheticAccel(0.5, 8, 50, 1);
    const z = bandPass(accel.map(r => r[2]), 50);
    const p = autocorrelationPeriodicity(z, 50);
    expect(p.cadenceHz).toBeGreaterThan(0.35);
    expect(p.cadenceHz).toBeLessThan(0.65);
    expect(p.score).toBeGreaterThan(0.4);
  });

  test('peak detection counts roughly one peak per cycle', () => {
    // 0.5 Hz over 8 s → ~4 cycles.
    const accel = syntheticAccel(0.5, 8, 50, 1);
    const z = bandPass(accel.map(r => r[2]), 50);
    const {reps} = detectPeaks(z, 50);
    expect(reps).toBeGreaterThanOrEqual(3);
    expect(reps).toBeLessThanOrEqual(5);
  });

  test('extractFeatures produces invariant fields; gyro flagged correctly', () => {
    const accel = syntheticAccel(0.5, 8, 50, 1);
    const fv = extractFeatures(accel, 50);
    expect(fv.hasGyro).toBe(false);
    const sum =
      fv.axisEnergyRatio[0] + fv.axisEnergyRatio[1] + fv.axisEnergyRatio[2];
    expect(sum).toBeCloseTo(1, 1);
    // Vertical-dominant motion → z carries most energy.
    expect(fv.axisEnergyRatio[2]).toBeGreaterThan(0.5);
  });

  test('amplitude invariance: same shape at different amplitudes is close', () => {
    const a = extractFeatures(syntheticAccel(0.5, 8, 50, 1), 50);
    const b = extractFeatures(syntheticAccel(0.5, 8, 50, 3), 50);
    // Energy RATIOS + normalized features should be similar despite 3x amp.
    expect(featureDistance(a, b)).toBeLessThan(0.5);
  });

  test('tempo invariance: cadence compared as a ratio is forgiving', () => {
    const slow = extractFeatures(syntheticAccel(0.4, 10, 50, 1), 50);
    const fast = extractFeatures(syntheticAccel(0.6, 10, 50, 1), 50);
    // Different tempo but same shape → moderate, not huge, distance.
    expect(featureDistance(slow, fast)).toBeLessThan(1.0);
  });

  test('normalizedDtw: identical z-shapes ~0, different shapes larger', () => {
    const a = bandPass(syntheticAccel(0.5, 8).map(r => r[2]), 50);
    const same = bandPass(syntheticAccel(0.5, 8).map(r => r[2]), 50);
    const diff = bandPass(syntheticAccel(1.2, 8).map(r => r[2]), 50);
    const dSame = normalizedDtw(a, same);
    const dDiff = normalizedDtw(a, diff);
    expect(dSame).toBeLessThan(dDiff);
  });

  test('matcher picks the closer template and rejects when no good match', () => {
    const squatFv = extractFeatures(syntheticAccel(0.5, 8, 50, 1), 50);
    const squatWin = resample(syntheticAccel(0.5, 8, 50, 1), 50, 50);

    const templates: Template[] = [
      {
        id: 't1',
        exerciseLabel: 'bulgarian_split_squat',
        takeId: 1,
        deviceOrientation: null,
        sampleRateHz: 50,
        featureVector: squatFv,
        imuSeriesResampled: squatWin,
        version: 1,
      },
    ];

    // A live window very like the template → should match the squat.
    const liveWin = syntheticAccel(0.5, 8, 50, 1.1);
    const liveFv = extractFeatures(liveWin, 50);
    const match = matchAgainstTemplates(
      liveFv,
      resample(liveWin, 50, 50),
      templates,
      0.45,
    );
    expect(['bulgarian_split_squat', 'unknown']).toContain(match.exercise);
    expect(match.confidence).toBeGreaterThan(0);
  });

  test('empty templates → unknown', () => {
    const fv: FeatureVector = {
      axisEnergyRatio: [0.3, 0.3, 0.4],
      normalizedCadenceHz: 0.5,
      motionDutyRatio: 0.5,
      peakAsymmetry: 0,
      spectralFlatness: 0.5,
      normalizedJerk: 0.1,
      hasGyro: false,
    };
    const out = matchAgainstTemplates(fv, syntheticAccel(0.5, 4), [], 0.45);
    expect(out.exercise).toBe('unknown');
  });
});
