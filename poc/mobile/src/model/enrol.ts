// Neural design v2 — enrolment and recognition around one set (§5, §6).
//   embedSet:      the set's clip (+ the engine's IMU window) → Embedding
//   recognizeSet:  Embedding vs the user's stored rows → Recognition (with evidence)
//   enrolSet:      the user's label → one `embeddings` row (the gates decide if it is an exemplar)
//
// Deviation from §6 (recorded in poc/README.md): "IMU gate open ≥ 3 cycles" is enforced only for
// `imu`/`fusion` classes. For a head-still `vision` class (a curl from a headband) the head IMU
// barely moves, and that gate would refuse exactly the sets this design exists to learn.

import {EmbedModule, type ClipEmbedding} from '../native/EmbedModule';
import {buildEmbedding, EMBED_MODEL_VERSION, type Embedding, type EmbedQuality} from './embed';
import {recognize, type Recognition} from './recognizer';
import * as store from './store';
import type {SetResult} from '../types/model';

export const EMBED_FPS = 5;
/** Margin kept around the IMU gate's open/close when trimming the clip to the set. */
const GATE_PAD_US = 1_000_000;

export interface SetEmbedding {
  emb: Embedding;
  quality: EmbedQuality;
  /** Raw native output, kept for the inspector. */
  native: ClipEmbedding | null;
  rangeUs: [number, number];
}

/**
 * The clip range to embed: the IMU gate's [open, close] padded by 1 s when the gate opened,
 * otherwise the whole clip (a head-still set may never open a head-IMU gate).
 */
export function clipRangeUs(result: SetResult | null, pts0HostNs: number | null, durationUs: number | null): [number, number] {
  const whole: [number, number] = [0, durationUs ?? 0];
  if (!result || !pts0HostNs || result.tCloseNs <= result.tOpenNs || result.tOpenNs <= result.tStartNs) {
    return whole;
  }
  const a = (result.tOpenNs - pts0HostNs) / 1000 - GATE_PAD_US;
  const b = (result.tCloseNs - pts0HostNs) / 1000 + GATE_PAD_US;
  if (b - a < 3_000_000) {
    return whole; // a gate shorter than ~3 s is not the set
  }
  return [Math.max(0, a), durationUs ? Math.min(durationUs, b) : b];
}

export async function embedSet(clipId: string | null, result: SetResult | null): Promise<SetEmbedding> {
  let native: ClipEmbedding | null = null;
  let rangeUs: [number, number] = [0, 0];
  if (clipId && EmbedModule.isAvailable()) {
    const clip = await store.clip(clipId);
    if (clip?.masterPath) {
      rangeUs = clipRangeUs(result, clip.sync.pts0HostNs, clip.durationUs);
      native = await EmbedModule.embedClip(clip.masterPath, clip.rotationDeg, rangeUs[0], rangeUs[1], EMBED_FPS);
    }
  }
  return {
    emb: buildEmbedding(native, result),
    quality: {
      poseVisible: native?.poseVisible ?? null,
      frames: native?.frames ?? null,
      imuSamples: result?.samples ?? 0,
      clipPresent: !!native,
      ms: native?.ms.total ?? null,
    },
    native,
    rangeUs,
  };
}

export async function recognizeSet(e: SetEmbedding): Promise<Recognition> {
  return recognize(e.emb, await store.recognizerRows(EMBED_MODEL_VERSION));
}

/** Enrolment quality gates (§6), evaluated per the exercise's rep class. */
export function enrolGates(q: EmbedQuality, repSignal: string, headStill: boolean, repsDetected: number): Record<string, boolean> {
  const gates: Record<string, boolean> = {clip: q.clipPresent};
  if (headStill) {
    gates.poseVisible = (q.poseVisible ?? 0) >= 0.5;
  }
  if (repSignal === 'imu' || repSignal === 'fusion') {
    gates.imuCycles = repsDetected >= 3;
  }
  return gates;
}

export async function enrolSet(input: {
  setId: string;
  sessionId: string;
  gymId: string | null;
  exerciseId: string;
  e: SetEmbedding;
  gates: Record<string, boolean>;
  weight: number | null;
}): Promise<void> {
  await store.upsertEmbedding({
    id: `emb_${input.setId}`,
    exerciseId: input.exerciseId,
    labeledSetId: input.setId,
    sessionId: input.sessionId,
    gymId: input.gymId,
    kind: 'set',
    source: 'own',
    emb: input.e.emb,
    quality: {...input.e.quality, gates: input.gates},
    modelVersion: EMBED_MODEL_VERSION,
    weightDeclared: input.weight,
    createdAt: Date.now(),
    revision: 1,
  });
  await store.audit(input.exerciseId, {event: 'embedding_enrolled', setId: input.setId, gates: input.gates, quality: input.e.quality}, null);
}
