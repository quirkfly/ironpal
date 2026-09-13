// Calibration-ritual maths (design §3.1), mirroring Canonicalizer in SignalEngine.kt so the
// JS layer can compute fit quality and rig-change angles in tests and in the inspector.

export type Mat3 = [number[], number[], number[]];

const norm = (v: number[]) => Math.hypot(v[0], v[1], v[2]);
const unit = (v: number[]) => {
  const n = norm(v) || 1;
  return [v[0] / n, v[1] / n, v[2] / n];
};
const cross = (a: number[], b: number[]) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export interface Calibration {
  rotation: Mat3;
  residualDeg: number;
  nodAxisDominance: number;
}

export function fromRitual(wornGravity: number[], nodGyroEnergy: number[], gravityMag = 9.81): Calibration {
  const up = unit(wornGravity.map(x => -x));
  let axis = 0;
  for (let i = 1; i < 3; i++) {
    if (nodGyroEnergy[i] > nodGyroEnergy[axis]) {
      axis = i;
    }
  }
  const total = nodGyroEnergy.reduce((a, b) => a + b, 0) || 1;
  const pitchRaw = [0, 0, 0];
  pitchRaw[axis] = 1;
  const p = dot(pitchRaw, up);
  const pitch = unit(pitchRaw.map((x, i) => x - p * up[i]));
  const forward = unit(cross(up, pitch));
  const left = unit(cross(up, forward));
  const magErr = Math.abs(norm(wornGravity) - gravityMag) / gravityMag;
  return {
    rotation: [forward, left, up] as Mat3,
    residualDeg: (Math.asin(Math.max(-1, Math.min(1, magErr))) * 180) / Math.PI,
    nodAxisDominance: nodGyroEnergy[axis] / total,
  };
}

export function apply(r: Mat3, v: number[]): number[] {
  return [0, 1, 2].map(i => r[i][0] * v[0] + r[i][1] * v[1] + r[i][2] * v[2]);
}

/** Geodesic angle between two rotations in degrees (rig-change detector input, design §6.2). */
export function angleBetween(a: Mat3, b: Mat3): number {
  let tr = 0;
  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      tr += a[k][i] * b[k][i];
    }
  }
  const c = Math.max(-1, Math.min(1, (tr - 1) / 2));
  return (Math.acos(c) * 180) / Math.PI;
}

export const IDENTITY: Mat3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
