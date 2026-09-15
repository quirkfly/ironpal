// The exercise's fitted rep shape (design §4.2 `repShape(e)`): the median of the user's own rep
// windows after time-normalisation to n samples. Drawn as the "ghost" under the trace (§9.1).

import {decodeF16} from './f16';
import * as store from './store';

const MIN_WINDOWS = 5;

function pick(row: number[], channel: number): number {
  if (channel >= 0 && channel < 3) {
    return row[channel] ?? 0;
  }
  return Math.hypot(row[0] ?? 0, row[1] ?? 0, row[2] ?? 0);
}

function resampleTo(series: number[], n: number): number[] {
  const m = series.length;
  if (m === 0) {
    return new Array(n).fill(0);
  }
  if (m === 1) {
    return new Array(n).fill(series[0]);
  }
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * (m - 1);
    const a = Math.floor(x);
    const b = Math.min(m - 1, a + 1);
    const f = x - a;
    out[i] = series[a] * (1 - f) + series[b] * f;
  }
  return out;
}

function zNorm(series: number[]): number[] {
  const mean = series.reduce((s, v) => s + v, 0) / series.length;
  const sd = Math.sqrt(series.reduce((s, v) => s + (v - mean) * (v - mean), 0) / series.length) || 1;
  return series.map(v => (v - mean) / sd);
}

/** Pure: windows [W][N][C] → median z-normalised shape of n samples, or null when < 5 windows. */
export function repShapeFromWindows(windows: number[][][], channel: number, n = 64): number[] | null {
  const usable = windows.filter(w => w.length >= 2);
  if (usable.length < MIN_WINDOWS) {
    return null;
  }
  const shapes = usable.map(w => zNorm(resampleTo(w.map(r => pick(r, channel)), n)));
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const col = shapes.map(s => s[i]).sort((a, b) => a - b);
    const k = Math.floor(col.length / 2);
    out[i] = col.length % 2 ? col[k] : (col[k - 1] + col[k]) / 2;
  }
  return out;
}

export async function repShape(exerciseId: string, channel: number): Promise<number[] | null> {
  const rows = await store.templates({exerciseIds: [exerciseId], kinds: ['rep'], sources: ['own']});
  const windows = rows.map(r => decodeF16(r.windowF16, r.channels));
  return repShapeFromWindows(windows, channel);
}
