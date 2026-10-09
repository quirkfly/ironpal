// Neural design v2 — EMBED(set) block assembly (§3, §A). Three blocks, each L2-normalised on its
// own so a missing block leaves the others' meaning unchanged:
//   video: MoViNet logits (600) → unsupervised whitening → 64-d
//   pose:  8 geometry channels × 6 stats (48) → z-score
//   imu:   the engine's feature vector + a 32-bin log spectrum of the accel magnitude (0.1–3 Hz)
// Pure functions; the native part is EmbedModule.

import params from './embed_params.json';
import {decodeF16} from './f16';
import type {FeatureVector} from '../types/domain';
import type {SetResult} from '../types/model';

export const EMBED_MODEL_VERSION: string = params.model_version;
export const SPECTRUM_BINS = 32;

export type Block = 'video' | 'pose' | 'imu';
export const BLOCKS: Block[] = ['video', 'pose', 'imu'];

export interface Embedding {
  video: number[] | null;
  pose: number[] | null;
  imu: number[] | null;
}

export interface EmbedQuality {
  poseVisible: number | null;
  frames: number | null;
  imuSamples: number;
  clipPresent: boolean;
  ms: number | null;
}

export function l2(v: number[]): number[] {
  let s = 0;
  for (const x of v) {
    s += x * x;
  }
  const n = Math.sqrt(s);
  return n > 1e-9 ? v.map(x => x / n) : v.map(() => 0);
}

export function cosine(a: number[], b: number[]): number {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    s += a[i] * b[i];
  }
  return s;
}

/** 600 logits → whitened 64-d, L2-normalised. */
export function videoBlock(logits: number[]): number[] {
  const {mean, proj, out_dims: k} = params.video;
  const out = new Array<number>(k).fill(0);
  for (let i = 0; i < logits.length; i++) {
    const x = logits[i] - mean[i];
    const row = proj[i];
    for (let j = 0; j < k; j++) {
      out[j] += x * row[j];
    }
  }
  return l2(out);
}

/** 48 raw pose statistics → z-scored, L2-normalised. Null when nothing was seen. */
export function poseBlock(stats: number[], visible: number): number[] | null {
  if (visible <= 0 || stats.every(x => x === 0)) {
    return null;
  }
  const {mean, std} = params.pose;
  return l2(stats.map((x, i) => (x - mean[i]) / std[i]));
}

function featureNumbers(f: FeatureVector): number[] {
  return [
    ...f.axisEnergyRatio,
    f.normalizedCadenceHz,
    f.motionDutyRatio,
    f.peakAsymmetry,
    f.spectralFlatness,
    f.normalizedJerk,
    ...(f.hasGyro && f.gyroEnergyRatio ? f.gyroEnergyRatio : [0, 0, 0]),
  ];
}

/** Log-magnitude spectrum of the accel magnitude at 32 log-spaced frequencies in [0.1, 3] Hz. */
export function spectrum(window: number[][], rateHz: number, bins = SPECTRUM_BINS): number[] {
  const n = window.length;
  if (n < 8 || rateHz <= 0) {
    return new Array(bins).fill(0);
  }
  const mag = window.map(r => Math.hypot(r[0] ?? 0, r[1] ?? 0, r[2] ?? 0));
  const mu = mag.reduce((a, b) => a + b, 0) / n;
  const out: number[] = [];
  for (let b = 0; b < bins; b++) {
    const f = 0.1 * Math.pow(3 / 0.1, b / (bins - 1));
    let re = 0;
    let im = 0;
    for (let t = 0; t < n; t++) {
      const a = (-2 * Math.PI * f * t) / rateHz;
      re += (mag[t] - mu) * Math.cos(a);
      im += (mag[t] - mu) * Math.sin(a);
    }
    out.push(Math.log1p(Math.hypot(re, im) / n));
  }
  return out;
}

/** IMU block from the engine's SetResult; null when the set has no IMU samples. */
export function imuBlock(result: SetResult | null): number[] | null {
  if (!result || result.samples <= 0 || !result.windowF16) {
    return null;
  }
  const win = decodeF16(result.windowF16, result.channels);
  const spec = l2(spectrum(win, result.rateHz));
  const feats = result.features ? l2(featureNumbers(result.features)) : [];
  return l2([...feats, ...spec]);
}

export function buildEmbedding(clip: {video: number[]; pose: number[]; poseVisible: number} | null, result: SetResult | null): Embedding {
  return {
    video: clip ? videoBlock(clip.video) : null,
    pose: clip ? poseBlock(clip.pose, clip.poseVisible) : null,
    imu: imuBlock(result),
  };
}
