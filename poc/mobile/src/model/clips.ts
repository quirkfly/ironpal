// Clip lifecycle (studio design §8.2–§8.3, §11): record per set, ingest (PTS table, proxy,
// filmstrip), import rig video, retention and the storage meter. Video never crosses the
// bridge; this module only moves rows and paths.

import {CameraModule} from '../native/CameraModule';
import {ClipModule} from '../native/ClipModule';
import * as store from './store';
import {syncClassFromResidual} from './timeline';
import type {ClipRow, ClipSource, ClipSync} from '../types/model';

export const CLIP_CAP_BYTES = 2 * 1024 * 1024 * 1024;
const NEAR_CAP = 0.9;

let baseDir: string | null = null;

export async function clipDir(clipId: string): Promise<string> {
  if (!baseDir) {
    baseDir = await ClipModule.clipsDir();
  }
  return `${baseDir}/${clipId}`;
}

export async function beginSetClip(sessionId: string, setId: string, rigId: string | null, rotationDeg: number): Promise<ClipRow | null> {
  if (!CameraModule.isAvailable() || !ClipModule.isAvailable()) {
    return null;
  }
  const clipId = `clip_${setId}`;
  try {
    const dir = await clipDir(clipId);
    const info = await CameraModule.startClip(clipId, `${dir}/master.mp4`);
    const sync: ClipSync = {
      pts0HostNs: info.pts0HostNs,
      rate: 1,
      residualMs: null,
      class: info.syncSource === 'sensor_timestamps' ? 'exact' : 'accept',
      source: info.syncSource,
    };
    const row: ClipRow = {
      id: clipId,
      sessionId,
      labeledSetId: null,
      rigId,
      source: 'app',
      masterPath: info.path,
      proxyPath: null,
      ptsPath: null,
      thumbsPath: null,
      rotationDeg,
      width: info.width,
      height: info.height,
      frames: null,
      durationUs: null,
      sync,
      state: 'recording',
      createdAt: Date.now(),
    };
    await store.upsertClip(row);
    return row;
  } catch (e) {
    await store.audit(null, {event: 'clip_start_failed', setId, error: String((e as Error).message ?? e)}, null).catch(() => undefined);
    return null;
  }
}

export async function endSetClip(clipId: string, labeledSetId: string | null): Promise<{clip: ClipRow; glanceJpegB64: string | null} | null> {
  const row = await store.clip(clipId);
  if (!row) {
    return null;
  }
  try {
    const info = await CameraModule.stopClip();
    await store.updateClip(clipId, {durationUs: info.durationUs, labeledSetId, state: 'ingesting', masterPath: info.path});
    const clip = (await store.clip(clipId)) ?? row;
    void ingestClip(clipId).catch(async e => {
      await store.audit(null, {event: 'clip_ingest_failed', clipId, error: String((e as Error).message ?? e)}, null).catch(() => undefined);
    });
    return {clip, glanceJpegB64: info.glanceJpegB64 ?? null};
  } catch (e) {
    await store.audit(null, {event: 'clip_stop_failed', clipId, error: String((e as Error).message ?? e)}, null).catch(() => undefined);
    await store.updateClip(clipId, {state: 'ready'}).catch(() => undefined);
    return {clip: row, glanceJpegB64: null};
  }
}

export async function ingestClip(clipId: string, rangeUs?: {t0Us: number; t1Us: number} | null): Promise<ClipRow> {
  const row = await store.clip(clipId);
  if (!row || !row.masterPath) {
    throw new Error(`clip ${clipId} has no master`);
  }
  try {
    const res = await ClipModule.ingest(clipId, row.masterPath, row.rotationDeg, rangeUs ?? null);
    await store.updateClip(clipId, {
      ptsPath: res.ptsPath,
      proxyPath: res.proxyPath,
      thumbsPath: res.thumbsPath,
      frames: res.frames,
      durationUs: res.durationUs,
      width: res.width,
      height: res.height,
      state: row.state === 'pinned' ? 'pinned' : 'ready',
    });
    await store.audit(null, {event: 'clip_ingested', clipId, timingsMs: res.timingsMs, frames: res.frames}, null);
  } catch (e) {
    // The Studio never depends on the proxy or filmstrip existing (design §8.2): try the PTS
    // table alone so frame stepping still works on the master.
    let ptsPath: string | null = null;
    try {
      const pts = await ClipModule.buildPtsTable(clipId, row.masterPath);
      ptsPath = pts.ptsPath;
      await store.updateClip(clipId, {ptsPath, frames: pts.frames, durationUs: pts.durationUs});
    } catch {
      // keep going
    }
    await store.updateClip(clipId, {state: row.state === 'pinned' ? 'pinned' : 'ready'});
    await store.audit(null, {event: 'clip_ingest_failed', clipId, error: String((e as Error).message ?? e), ptsOk: !!ptsPath}, null);
  }
  return (await store.clip(clipId))!;
}

export async function importClip(input: {sessionId: string; masterPath: string; source: ClipSource; rotationDeg: number; sync: ClipSync; labeledSetId?: string | null}): Promise<ClipRow> {
  const clipId = `clip_import_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  let probe = {width: null as number | null, height: null as number | null, durationUs: null as number | null, frames: null as number | null};
  try {
    const p = await ClipModule.probe(input.masterPath);
    probe = {width: p.width, height: p.height, durationUs: p.durationUs, frames: p.frames};
  } catch {
    // ingest probes again
  }
  const row: ClipRow = {
    id: clipId,
    sessionId: input.sessionId,
    labeledSetId: input.labeledSetId ?? null,
    rigId: null,
    source: input.source,
    masterPath: input.masterPath,
    proxyPath: null,
    ptsPath: null,
    thumbsPath: null,
    rotationDeg: input.rotationDeg,
    width: probe.width,
    height: probe.height,
    frames: probe.frames,
    durationUs: probe.durationUs,
    sync: input.sync,
    state: 'ingesting',
    createdAt: Date.now(),
  };
  await store.upsertClip(row);
  return ingestClip(clipId);
}

export async function attachClipToSet(clipId: string, labeledSetId: string): Promise<void> {
  await store.updateClip(clipId, {labeledSetId});
}

export async function loadPtsTable(clip: ClipRow): Promise<number[]> {
  if (!clip.ptsPath || !ClipModule.isAvailable()) {
    return [];
  }
  try {
    return await ClipModule.readPtsTable(clip.ptsPath);
  } catch {
    return [];
  }
}

/** FR-D1: masters and proxies go 7 days after the set was confirmed; pinned clips stay. */
export async function reduceExpiredClips(now = Date.now(), retentionDays = 7): Promise<number> {
  const cutoff = now - retentionDays * 86400e3;
  let n = 0;
  for (const c of await store.clipPaths()) {
    if (c.state !== 'ready') {
      continue;
    }
    const row = await store.clip(c.id);
    if (!row) {
      continue;
    }
    let confirmedAt = row.createdAt;
    if (row.labeledSetId) {
      const s = await store.labeledSet(row.labeledSetId);
      if (s) {
        confirmedAt = s.createdAt;
      }
    }
    if (confirmedAt > cutoff) {
      continue;
    }
    const paths = [row.masterPath, row.proxyPath].filter((p): p is string => !!p);
    if (paths.length && ClipModule.isAvailable()) {
      await ClipModule.deleteClipFiles(paths).catch(() => undefined);
    }
    await store.updateClip(row.id, {masterPath: null, proxyPath: null, state: 'reduced'});
    n++;
  }
  if (n) {
    await store.audit(null, {event: 'clips_reduced', count: n}, null);
  }
  return n;
}

export async function pinClip(clipId: string, pinned: boolean): Promise<void> {
  const row = await store.clip(clipId);
  if (!row) {
    return;
  }
  if (pinned && (row.state === 'ready' || row.state === 'ingesting')) {
    await store.updateClip(clipId, {state: 'pinned'});
  } else if (!pinned && row.state === 'pinned') {
    await store.updateClip(clipId, {state: 'ready'});
  }
}

export async function storageMeter(): Promise<{masterBytes: number; proxyBytes: number; thumbsBytes: number; capBytes: number; nearCap: boolean}> {
  const rows = await store.clipPaths();
  const masters = rows.map(r => r.masterPath).filter((p): p is string => !!p);
  const proxies = rows.map(r => r.proxyPath).filter((p): p is string => !!p);
  const thumbs = rows.map(r => r.thumbsPath).filter((p): p is string => !!p);
  let masterBytes = 0;
  let proxyBytes = 0;
  let thumbsBytes = 0;
  if (ClipModule.isAvailable()) {
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    try {
      masterBytes = sum(await ClipModule.fileSizes(masters));
      proxyBytes = sum(await ClipModule.fileSizes(proxies));
      thumbsBytes = sum(await ClipModule.fileSizes(thumbs));
    } catch {
      // meter stays at zero rather than failing the screen
    }
  }
  const total = masterBytes + proxyBytes + thumbsBytes;
  return {masterBytes, proxyBytes, thumbsBytes, capBytes: CLIP_CAP_BYTES, nearCap: total >= NEAR_CAP * CLIP_CAP_BYTES};
}

/** Sync record for an imported clip from a laptop `session.json` (sync plan §4.4, §5). */
export function syncFromSessionJson(sessionJson: {sync?: {offset_host_ns?: number; pts0_host_ns?: number; rate?: number; a?: number; residual_ms?: number | null}} | null): ClipSync {
  const s = sessionJson?.sync;
  if (!s) {
    return {pts0HostNs: 0, rate: 1, residualMs: null, class: 'none', source: 'none'};
  }
  const residual = s.residual_ms ?? null;
  return {
    pts0HostNs: s.pts0_host_ns ?? s.offset_host_ns ?? 0,
    rate: s.rate ?? s.a ?? 1,
    residualMs: residual,
    class: syncClassFromResidual(residual, false),
    source: 'session_json',
  };
}
