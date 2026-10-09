import {NativeModules} from 'react-native';

// JS wrapper over the Kotlin `EmbedModule` — neural design v2, the video and pose blocks of
// EMBED (§3.1–§3.2), computed per set from the recorded clip. Frames never cross the bridge.

export interface ClipEmbedding {
  /** MoViNet-A0-Stream logits averaged over the set's frames (600). Whitened in JS (embed.ts). */
  video: number[];
  /** Pose-geometry statistics: 8 channels × 6 stats (48), raw; z-scored in JS. */
  pose: number[];
  /** Fraction of frames where an elbow angle was measurable. */
  poseVisible: number;
  frames: number;
  ms: {decode: number; movinet: number; pose: number; total: number};
}

interface EmbedNative {
  embedClip(masterPath: string, rotationDeg: number, startUs: number, endUs: number, fps: number): Promise<ClipEmbedding>;
  selfTest(): Promise<{ok: boolean; loadMs: number; stepMs: number}>;
}

const native = NativeModules.EmbedModule as EmbedNative | undefined;

export const EmbedModule = {
  isAvailable: () => !!native,
  embedClip: (masterPath: string, rotationDeg: number, startUs: number, endUs: number, fps = 5) =>
    native!.embedClip(masterPath, rotationDeg, startUs, endUs, fps),
  selfTest: () => native!.selfTest(),
};
