// IronPal on-device DSP — reference implementation (design §5).
//
// This is a real, working implementation of the signal pipeline:
//   band-pass filter, autocorrelation periodicity, peak detection,
//   tempo/amplitude/orientation-invariant feature extraction, kNN distance,
//   and amplitude/time-normalized DTW.
//
// On a real device this logic runs in the Kotlin `SignalModule` so the 50 Hz
// stream and the matcher stay off the JS thread (D1/D6). This TS module is the
// authoritative reference for that port AND is unit-testable in CI/sandbox.
// The constants here mirror src/config so both layers agree.

import {
  CANONICAL_SAMPLE_RATE_HZ,
  REP_BAND_LOW_HZ,
  REP_BAND_HIGH_HZ,
} from '../config';
import type {ExerciseLabel, FeatureVector, Template} from '../types/domain';

export type Vec3 = [number, number, number];

// ---------------------------------------------------------------------------
// Resampling to a canonical rate (D4) — linear interpolation.
// ---------------------------------------------------------------------------

/**
 * Resample a [N][C] series sampled at `srcRateHz` to `dstRateHz` using linear
 * interpolation. Channel-agnostic (3 for accel-only, 6 for accel+gyro).
 */
export function resample(
  series: number[][],
  srcRateHz: number,
  dstRateHz: number = CANONICAL_SAMPLE_RATE_HZ,
): number[][] {
  if (series.length === 0) {
    return [];
  }
  if (srcRateHz === dstRateHz) {
    return series.map(row => row.slice());
  }
  const channels = series[0].length;
  const srcDurationSec = (series.length - 1) / srcRateHz;
  const dstCount = Math.max(1, Math.round(srcDurationSec * dstRateHz) + 1);
  const out: number[][] = [];
  for (let i = 0; i < dstCount; i++) {
    const t = i / dstRateHz; // seconds
    const srcPos = t * srcRateHz; // fractional source index
    const i0 = Math.min(Math.floor(srcPos), series.length - 1);
    const i1 = Math.min(i0 + 1, series.length - 1);
    const frac = srcPos - i0;
    const row: number[] = [];
    for (let c = 0; c < channels; c++) {
      const a = series[i0][c];
      const b = series[i1][c];
      row.push(a + (b - a) * frac);
    }
    out.push(row);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Band-pass filter (design §5.1): cascade of one-pole high-pass + low-pass.
// Corners default to the rep-cadence band (~0.2–1.5 Hz).
// ---------------------------------------------------------------------------

function onePoleHighPass(x: number[], cutoffHz: number, rateHz: number): number[] {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / rateHz;
  const alpha = rc / (rc + dt);
  const y = new Array<number>(x.length);
  let prevY = 0;
  let prevX = x.length > 0 ? x[0] : 0;
  for (let i = 0; i < x.length; i++) {
    const cur = i === 0 ? x[0] : alpha * (prevY + x[i] - prevX);
    y[i] = cur;
    prevY = cur;
    prevX = x[i];
  }
  return y;
}

function onePoleLowPass(x: number[], cutoffHz: number, rateHz: number): number[] {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / rateHz;
  const alpha = dt / (rc + dt);
  const y = new Array<number>(x.length);
  let prev = x.length > 0 ? x[0] : 0;
  for (let i = 0; i < x.length; i++) {
    const cur = prev + alpha * (x[i] - prev);
    y[i] = cur;
    prev = cur;
  }
  return y;
}

export function bandPass(
  x: number[],
  rateHz: number = CANONICAL_SAMPLE_RATE_HZ,
  lowHz: number = REP_BAND_LOW_HZ,
  highHz: number = REP_BAND_HIGH_HZ,
): number[] {
  // High-pass at the low corner removes drift/gravity residue; low-pass at the
  // high corner removes high-frequency jitter — leaving the rep-cadence band.
  return onePoleLowPass(onePoleHighPass(x, lowHz, rateHz), highHz, rateHz);
}

// ---------------------------------------------------------------------------
// Basic vector stats
// ---------------------------------------------------------------------------

export function magnitudeSeries(series: number[][]): number[] {
  return series.map(r => Math.hypot(r[0] ?? 0, r[1] ?? 0, r[2] ?? 0));
}

export function column(series: number[][], c: number): number[] {
  return series.map(r => r[c] ?? 0);
}

function mean(x: number[]): number {
  if (x.length === 0) {
    return 0;
  }
  let s = 0;
  for (const v of x) {
    s += v;
  }
  return s / x.length;
}

function energy(x: number[]): number {
  let s = 0;
  for (const v of x) {
    s += v * v;
  }
  return s;
}

function zNormalize(x: number[]): number[] {
  const m = mean(x);
  let varSum = 0;
  for (const v of x) {
    varSum += (v - m) * (v - m);
  }
  const std = Math.sqrt(varSum / Math.max(1, x.length)) || 1;
  return x.map(v => (v - m) / std);
}

// ---------------------------------------------------------------------------
// Autocorrelation periodicity (motion gate — Q4).
// Returns the dominant cadence (Hz) within the rep band and a periodicity
// score in [0,1] (height of the dominant autocorrelation peak).
// ---------------------------------------------------------------------------

export interface Periodicity {
  cadenceHz: number;
  score: number; // 0..1
}

export function autocorrelationPeriodicity(
  signal: number[],
  rateHz: number = CANONICAL_SAMPLE_RATE_HZ,
  lowHz: number = REP_BAND_LOW_HZ,
  highHz: number = REP_BAND_HIGH_HZ,
): Periodicity {
  const x = zNormalize(signal);
  const n = x.length;
  if (n < 4) {
    return {cadenceHz: 0, score: 0};
  }
  // Lag range corresponding to the cadence band.
  const minLag = Math.max(1, Math.floor(rateHz / highHz));
  const maxLag = Math.min(n - 1, Math.ceil(rateHz / lowHz));
  const r0 = energy(x) || 1;
  let bestLag = 0;
  let bestVal = 0;
  let prev = -Infinity;
  let rising = false;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < n; i++) {
      s += x[i] * x[i + lag];
    }
    const norm = s / r0;
    // Track the first prominent local maximum (the fundamental period).
    if (norm > prev) {
      rising = true;
    } else if (rising && norm < prev) {
      // prev was a local peak
      if (prev > bestVal) {
        bestVal = prev;
        bestLag = lag - 1;
      }
      rising = false;
    }
    prev = norm;
  }
  if (bestLag === 0) {
    return {cadenceHz: 0, score: 0};
  }
  const cadenceHz = rateHz / bestLag;
  // Clamp score into [0,1]; autocorrelation peak height is the periodicity.
  const score = Math.max(0, Math.min(1, bestVal));
  return {cadenceHz, score};
}

// ---------------------------------------------------------------------------
// Peak detection → rep counting (design §5.3).
// One up-crossing peak per rep cycle on the band-passed dominant axis.
// ---------------------------------------------------------------------------

export interface PeakResult {
  /** Indices of detected peaks. */
  peaks: number[];
  /** Rep count (= number of detected peaks). */
  reps: number;
  /** Mean rise/fall asymmetry across cycles, in [-1,1]. */
  asymmetry: number;
}

export function detectPeaks(
  signal: number[],
  rateHz: number = CANONICAL_SAMPLE_RATE_HZ,
  maxCadenceHz: number = REP_BAND_HIGH_HZ,
): PeakResult {
  const n = signal.length;
  if (n < 3) {
    return {peaks: [], reps: 0, asymmetry: 0};
  }
  // Adaptive amplitude threshold: fraction of the signal's RMS.
  const rms = Math.sqrt(energy(signal) / n);
  const minHeight = 0.35 * rms;
  // Minimum spacing between peaks from the max plausible cadence (refractory).
  const minSpacing = Math.max(1, Math.floor(rateHz / maxCadenceHz));
  const peaks: number[] = [];
  let lastPeak = -minSpacing;
  for (let i = 1; i < n - 1; i++) {
    if (
      signal[i] > minHeight &&
      signal[i] >= signal[i - 1] &&
      signal[i] > signal[i + 1] &&
      i - lastPeak >= minSpacing
    ) {
      peaks.push(i);
      lastPeak = i;
    }
  }
  // Rise/fall asymmetry: compare time from prior trough→peak vs peak→next trough.
  let asymAccum = 0;
  let asymCount = 0;
  for (let k = 0; k < peaks.length; k++) {
    const p = peaks[k];
    // local trough before/after
    let left = p;
    while (left > 0 && signal[left - 1] <= signal[left]) {
      left--;
    }
    let right = p;
    while (right < n - 1 && signal[right + 1] <= signal[right]) {
      right++;
    }
    const rise = p - left;
    const fall = right - p;
    const denom = rise + fall;
    if (denom > 0) {
      asymAccum += (rise - fall) / denom;
      asymCount++;
    }
  }
  const asymmetry = asymCount > 0 ? asymAccum / asymCount : 0;
  return {peaks, reps: peaks.length, asymmetry};
}

// ---------------------------------------------------------------------------
// Feature extraction (design §5.4) — tempo/amplitude/orientation-invariant.
// Accel-only baseline; gyro features added only when present (D5).
// ---------------------------------------------------------------------------

function spectralFlatness(signal: number[]): number {
  // Crude flatness proxy from short-lag autocorrelation decay: a clean
  // periodic signal has structured autocorrelation (low flatness/high
  // structure). We map to [0,1] where higher = more periodic structure.
  const x = zNormalize(signal);
  const n = x.length;
  if (n < 8) {
    return 0;
  }
  const r0 = energy(x) || 1;
  let acc = 0;
  let count = 0;
  const maxLag = Math.min(n - 1, Math.floor(n / 2));
  for (let lag = 1; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < n; i++) {
      s += x[i] * x[i + lag];
    }
    acc += Math.abs(s / r0);
    count++;
  }
  return count > 0 ? Math.max(0, Math.min(1, acc / count)) : 0;
}

function normalizedJerk(signal: number[], rateHz: number): number {
  const n = signal.length;
  if (n < 2) {
    return 0;
  }
  let jerkEnergy = 0;
  for (let i = 1; i < n; i++) {
    const d = (signal[i] - signal[i - 1]) * rateHz;
    jerkEnergy += d * d;
  }
  const amp = Math.sqrt(energy(signal) / n) || 1;
  // Normalize by amplitude so a faster/bigger rep doesn't inflate jerk.
  return Math.sqrt(jerkEnergy / n) / (amp * rateHz);
}

export function extractFeatures(
  accel: number[][],
  rateHz: number = CANONICAL_SAMPLE_RATE_HZ,
  gyro?: number[][],
): FeatureVector {
  // Band-pass each accel axis to the rep band.
  const ax = bandPass(column(accel, 0), rateHz);
  const ay = bandPass(column(accel, 1), rateHz);
  const az = bandPass(column(accel, 2), rateHz);

  const ex = energy(ax);
  const ey = energy(ay);
  const ez = energy(az);
  const total = ex + ey + ez || 1;
  // Axis energy RATIOS are orientation-robust (no absolute magnitudes — D4).
  const axisEnergyRatio: Vec3 = [ex / total, ey / total, ez / total];

  // Dominant axis = the one carrying the most rep-band energy.
  const cols = [ax, ay, az];
  const dominant = cols[axisEnergyRatio.indexOf(Math.max(...axisEnergyRatio))];

  const periodicity = autocorrelationPeriodicity(dominant, rateHz);
  const peaks = detectPeaks(dominant, rateHz);

  // Motion duty: fraction of samples whose |value| exceeds a small fraction
  // of RMS — a tempo/amplitude-invariant "how much of the window was active".
  const rms = Math.sqrt(energy(dominant) / Math.max(1, dominant.length)) || 1;
  let active = 0;
  for (const v of dominant) {
    if (Math.abs(v) > 0.25 * rms) {
      active++;
    }
  }
  const motionDutyRatio = dominant.length > 0 ? active / dominant.length : 0;

  const fv: FeatureVector = {
    axisEnergyRatio,
    normalizedCadenceHz: periodicity.cadenceHz,
    motionDutyRatio,
    peakAsymmetry: peaks.asymmetry,
    spectralFlatness: spectralFlatness(dominant),
    normalizedJerk: normalizedJerk(dominant, rateHz),
    hasGyro: !!gyro,
  };

  if (gyro && gyro.length > 0) {
    const gx = energy(bandPass(column(gyro, 0), rateHz));
    const gy = energy(bandPass(column(gyro, 1), rateHz));
    const gz = energy(bandPass(column(gyro, 2), rateHz));
    const gTotal = gx + gy + gz || 1;
    fv.gyroEnergyRatio = [gx / gTotal, gy / gTotal, gz / gTotal];
  }

  return fv;
}

// ---------------------------------------------------------------------------
// kNN distance over the normalized feature vector (Q6).
// All components are already scale-invariant, so a weighted Euclidean is fine.
// ---------------------------------------------------------------------------

const FEATURE_WEIGHTS = {
  axisEnergyRatio: 2.0,
  normalizedCadenceHz: 0.8,
  motionDutyRatio: 1.2,
  peakAsymmetry: 1.0,
  spectralFlatness: 1.0,
  normalizedJerk: 0.8,
  gyroEnergyRatio: 1.5,
};

export function featureDistance(a: FeatureVector, b: FeatureVector): number {
  let d = 0;
  for (let i = 0; i < 3; i++) {
    const diff = a.axisEnergyRatio[i] - b.axisEnergyRatio[i];
    d += FEATURE_WEIGHTS.axisEnergyRatio * diff * diff;
  }
  // Cadence compared as a ratio (tempo-invariant): log-ratio distance.
  const ca = Math.max(1e-3, a.normalizedCadenceHz);
  const cb = Math.max(1e-3, b.normalizedCadenceHz);
  const cd = Math.log(ca / cb);
  d += FEATURE_WEIGHTS.normalizedCadenceHz * cd * cd;

  const md = a.motionDutyRatio - b.motionDutyRatio;
  d += FEATURE_WEIGHTS.motionDutyRatio * md * md;

  const pa = a.peakAsymmetry - b.peakAsymmetry;
  d += FEATURE_WEIGHTS.peakAsymmetry * pa * pa;

  const sf = a.spectralFlatness - b.spectralFlatness;
  d += FEATURE_WEIGHTS.spectralFlatness * sf * sf;

  const nj = a.normalizedJerk - b.normalizedJerk;
  d += FEATURE_WEIGHTS.normalizedJerk * nj * nj;

  // Gyro only contributes when BOTH have it (D5) — keeps accel-only fair.
  if (a.gyroEnergyRatio && b.gyroEnergyRatio) {
    for (let i = 0; i < 3; i++) {
      const diff = a.gyroEnergyRatio[i] - b.gyroEnergyRatio[i];
      d += FEATURE_WEIGHTS.gyroEnergyRatio * diff * diff;
    }
  }
  return Math.sqrt(d);
}

// ---------------------------------------------------------------------------
// Amplitude/time-normalized DTW on the resampled raw window (Q6/D7).
// We z-normalize each series (amplitude-invariance) and use a Sakoe-Chiba
// band (time-warp tolerance) to compare the band-passed magnitude shape.
// ---------------------------------------------------------------------------

export function normalizedDtw(
  a: number[],
  b: number[],
  bandFraction = 0.2,
): number {
  const x = zNormalize(a);
  const y = zNormalize(b);
  const n = x.length;
  const m = y.length;
  if (n === 0 || m === 0) {
    return Infinity;
  }
  const band = Math.max(1, Math.floor(bandFraction * Math.max(n, m)));
  const INF = Infinity;
  // Two-row rolling DP.
  let prev = new Array<number>(m + 1).fill(INF);
  let curr = new Array<number>(m + 1).fill(INF);
  prev[0] = 0;
  for (let i = 1; i <= n; i++) {
    curr.fill(INF);
    const jStart = Math.max(1, i - band);
    const jEnd = Math.min(m, i + band);
    for (let j = jStart; j <= jEnd; j++) {
      const cost = Math.abs(x[i - 1] - y[j - 1]);
      const best = Math.min(prev[j], curr[j - 1], prev[j - 1]);
      curr[j] = cost + (best === INF ? 0 : best);
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  const raw = prev[m];
  if (!isFinite(raw)) {
    return Infinity;
  }
  // Normalize by path length so longer windows aren't penalized.
  return raw / (n + m);
}

// ---------------------------------------------------------------------------
// Convert a distance to a confidence in [0,1]. Smaller distance = higher conf.
// ---------------------------------------------------------------------------

export function distanceToConfidence(distance: number, scale = 1.0): number {
  if (!isFinite(distance)) {
    return 0;
  }
  return 1 / (1 + distance / scale);
}

// ---------------------------------------------------------------------------
// Full matcher: kNN (features) fused with normalized-DTW (raw window),
// against cached founder templates (Q6/D7). Returns best label + confidence.
// ---------------------------------------------------------------------------

export interface MatcherOutput {
  exercise: ExerciseLabel;
  confidence: number;
  knnDistance: number;
  dtwDistance: number;
}

export function matchAgainstTemplates(
  liveFeatures: FeatureVector,
  liveWindowAccel: number[][],
  templates: Template[],
  rejectThreshold: number,
): MatcherOutput {
  if (templates.length === 0) {
    return {
      exercise: 'unknown',
      confidence: 0,
      knnDistance: Infinity,
      dtwDistance: Infinity,
    };
  }
  const liveMag = bandPass(magnitudeSeries(liveWindowAccel));

  let best: {
    label: ExerciseLabel;
    knn: number;
    dtw: number;
    fused: number;
  } | null = null;

  for (const t of templates) {
    const knn = featureDistance(liveFeatures, t.featureVector);
    const tMag = bandPass(
      magnitudeSeries(
        // template raw window may include gyro channels; use first 3 (accel)
        t.imuSeriesResampled.map(r => r.slice(0, 3)),
      ),
    );
    const dtw = normalizedDtw(liveMag, tMag);
    // Fuse: weight kNN and DTW; both are smaller-is-better.
    const fused = 0.6 * knn + 0.4 * dtw;
    if (!best || fused < best.fused) {
      best = {label: t.exerciseLabel, knn, dtw, fused};
    }
  }

  if (!best) {
    return {
      exercise: 'unknown',
      confidence: 0,
      knnDistance: Infinity,
      dtwDistance: Infinity,
    };
  }

  const confidence = distanceToConfidence(best.fused);
  // Below the reject threshold OR the best template is itself an UNKNOWN seed
  // → report UNKNOWN (Q4 safety net).
  const exercise: ExerciseLabel =
    confidence < rejectThreshold ? 'unknown' : best.label;
  return {
    exercise,
    confidence,
    knnDistance: best.knn,
    dtwDistance: best.dtw,
  };
}
