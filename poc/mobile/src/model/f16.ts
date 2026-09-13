// IEEE 754 half-precision windows, base64 of little-endian int16 halves, row-major [N][C].
// Mirrors android/.../F16.kt (design §4.1). Used by the inspector, tests and priors packaging.

import {Buffer} from 'buffer';

export function toHalf(val: number): number {
  const f32 = new Float32Array(1);
  const u32 = new Uint32Array(f32.buffer);
  f32[0] = val;
  const x = u32[0];
  const sign = (x >>> 16) & 0x8000;
  let m = (x >>> 12) & 0x07ff;
  const e = (x >>> 23) & 0xff;
  if (e < 103) {
    return sign;
  }
  if (e > 142) {
    return sign | 0x7c00 | (e === 255 && (x & 0x007fffff) ? 1 : 0);
  }
  if (e < 113) {
    m |= 0x0800;
    return sign | ((m >> (114 - e)) + ((m >> (113 - e)) & 1));
  }
  return sign | ((e - 112) << 10) | (m >> 1);
}

export function fromHalf(h: number): number {
  const s = (h & 0x8000) >> 15;
  const e = (h & 0x7c00) >> 10;
  const f = h & 0x03ff;
  if (e === 0) {
    return (s ? -1 : 1) * Math.pow(2, -14) * (f / Math.pow(2, 10));
  }
  if (e === 0x1f) {
    return f ? NaN : (s ? -1 : 1) * Infinity;
  }
  return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / Math.pow(2, 10));
}

export function encodeF16(series: number[][]): string {
  if (series.length === 0) {
    return '';
  }
  const c = series[0].length;
  const buf = Buffer.alloc(series.length * c * 2);
  let k = 0;
  for (const row of series) {
    for (let j = 0; j < c; j++) {
      buf.writeUInt16LE(toHalf(row[j]), k);
      k += 2;
    }
  }
  return buf.toString('base64');
}

export function decodeF16(b64: string, channels: number): number[][] {
  if (!b64 || channels <= 0) {
    return [];
  }
  const buf = Buffer.from(b64, 'base64');
  const n = Math.floor(buf.length / (2 * channels));
  const out: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const row = new Array<number>(channels);
    for (let j = 0; j < channels; j++) {
      row[j] = fromHalf(buf.readUInt16LE((i * channels + j) * 2));
    }
    out[i] = row;
  }
  return out;
}

/** CRC32 of the encoded window — the store's `checksum` (design §7.2). */
export function crc32(str: string): number {
  let c = ~0;
  for (let i = 0; i < str.length; i++) {
    c ^= str.charCodeAt(i) & 0xff;
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}
