import {NativeModules, NativeEventEmitter} from 'react-native';

// JS wrapper over the Kotlin `ClipModule` — clip ingest (studio design §8.2–§8.3, §11):
// PTS table, scrub proxy (360p, GOP 0.25 s, rotation baked in), filmstrip sprite, frame extraction.
// Video never crosses the bridge; only paths and metadata do.

export interface ClipProbe {
  width: number;
  height: number;
  durationUs: number;
  frames: number;
  /** Rotation metadata in the container (0/90/180/270), if any. */
  rotationDeg: number;
  fpsNominal: number;
}

export interface IngestResult {
  ptsPath: string;
  proxyPath: string | null;
  thumbsPath: string | null;
  thumbsIndexPath: string | null;
  frames: number;
  durationUs: number;
  width: number;
  height: number;
  /** Ms per step in the ingest job, for the inspector. */
  timingsMs: {pts: number; proxy: number; thumbs: number};
}

export interface IngestProgress {
  clipId: string;
  step: 'pts' | 'proxy' | 'thumbs' | 'done' | 'error';
  progress: number;
  error?: string;
}

interface ClipNative {
  probe(path: string): Promise<ClipProbe>;
  /** Read every video sample's presentation time (µs) into a binary table; returns its path + count. */
  buildPtsTable(clipId: string, masterPath: string): Promise<{ptsPath: string; frames: number; durationUs: number}>;
  /** The whole ingest job (pts → proxy → thumbs) with progress events `ClipIngestProgress`. */
  ingest(clipId: string, masterPath: string, rotationDeg: number, rangeUs: string | null): Promise<IngestResult>;
  /** Read the PTS table back as a JSON array of µs (≤ 20 000 entries; longer tables are decimated). */
  readPtsTable(ptsPath: string): Promise<string>;
  /** Extract one frame from the master at ptsUs (nearest ≤), optional crop {x,y,w,h} in master pixels; returns the JPEG path. */
  extractFrame(masterPath: string, ptsUs: number, rotationDeg: number, cropJson: string | null, outPath: string): Promise<{path: string; width: number; height: number}>;
  /** Frame-difference motion energy of the proxy at ~10 fps, for the nod cross-check (v1: on demand). */
  motionEnergy(proxyPath: string): Promise<string>;
  deleteClipFiles(pathsJson: string): Promise<void>;
  /** Sizes in bytes for each path (0 when missing), same order as the input. */
  fileSizes(pathsJson: string): Promise<string>;
  clipsDir(): Promise<string>;
  /** Read a small UTF-8 text file (thumbs.json, session.json); rejects when missing. */
  readTextFile(path: string): Promise<string>;
  benchmark(proxyPath: string): Promise<{stepMsP95: number; stepMsMedian: number; steps: number}>;
}

const native = NativeModules.ClipModule as ClipNative | undefined;
const emitter = native ? new NativeEventEmitter(NativeModules.ClipModule) : undefined;

function assertNative(): ClipNative {
  if (!native) {
    throw new Error('[ClipModule] Native module not linked. Build an APK; clip ingest runs in Kotlin.');
  }
  return native;
}

export const ClipModule = {
  isAvailable: () => !!native,
  probe: (path: string) => assertNative().probe(path),
  buildPtsTable: (clipId: string, masterPath: string) => assertNative().buildPtsTable(clipId, masterPath),
  ingest: (clipId: string, masterPath: string, rotationDeg: number, rangeUs: {t0Us: number; t1Us: number} | null) =>
    assertNative().ingest(clipId, masterPath, rotationDeg, rangeUs ? JSON.stringify(rangeUs) : null),
  async readPtsTable(ptsPath: string): Promise<number[]> {
    return JSON.parse(await assertNative().readPtsTable(ptsPath)) as number[];
  },
  extractFrame: (masterPath: string, ptsUs: number, rotationDeg: number, crop: {x: number; y: number; w: number; h: number} | null, outPath: string) =>
    assertNative().extractFrame(masterPath, ptsUs, rotationDeg, crop ? JSON.stringify(crop) : null, outPath),
  async motionEnergy(proxyPath: string): Promise<{tUs: number; energy: number}[]> {
    return JSON.parse(await assertNative().motionEnergy(proxyPath)) as {tUs: number; energy: number}[];
  },
  deleteClipFiles: (paths: string[]) => assertNative().deleteClipFiles(JSON.stringify(paths)),
  async fileSizes(paths: string[]): Promise<number[]> {
    return JSON.parse(await assertNative().fileSizes(JSON.stringify(paths))) as number[];
  },
  clipsDir: () => assertNative().clipsDir(),
  readTextFile: (path: string) => assertNative().readTextFile(path),
  benchmark: (proxyPath: string) => assertNative().benchmark(proxyPath),
  onProgress(cb: (p: IngestProgress) => void): () => void {
    if (!emitter) {
      return () => {};
    }
    const sub = emitter.addListener('ClipIngestProgress', cb);
    return () => sub.remove();
  },
};
