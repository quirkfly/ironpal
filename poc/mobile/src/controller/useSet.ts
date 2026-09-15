import {useCallback, useEffect, useRef, useState} from 'react';
import {beginSetClip, endSetClip} from '../model/clips';
import {CameraModule} from '../native/CameraModule';
import {SignalModule} from '../native/SignalModule';
import type {GateEvent, LinkEvent, MatchEvent, RepEvent, SetResult} from '../types/model';

// Set controller (design §2.2): ARM → FIRE → gate-close → SetResult. Screen-free during the
// set: the only outputs are counters for the optional minimal live view and the cue hooks.

export type SetPhase = 'idle' | 'armed' | 'active' | 'closing' | 'ended';

export interface LiveSet {
  phase: SetPhase;
  setId: string | null;
  exerciseHint: string | null;
  reps: number;
  lastRepLatencyMs: number | null;
  provisionalLabel: string | null;
  provisionalConfidence: number;
  link: LinkEvent | null;
  result: SetResult | null;
  error: string | null;
  /** Per-set clip (studio design §11.1); null when the camera is unavailable or the clip failed. */
  clipId: string | null;
  /** Sharpest still seen during the glance window, base64 JPEG (from the clip's analysis stream). */
  glanceJpegB64: string | null;
}

export interface ArmOptions {
  sessionId: string | null;
  rigId: string | null;
  rotationDeg: number;
}

export interface SetCues {
  onGateOpen?: () => void;
  onGateClose?: () => void;
  onRep?: (n: number) => void;
  onLinkLost?: () => void;
}

export function useSet(cues: SetCues = {}) {
  const [live, setLive] = useState<LiveSet>({phase: 'idle', setId: null, exerciseHint: null, reps: 0, lastRepLatencyMs: null, provisionalLabel: null, provisionalConfidence: 0, link: null, result: null, error: null, clipId: null, glanceJpegB64: null});
  const clipRef = useRef<string | null>(null);
  const cuesRef = useRef(cues);
  cuesRef.current = cues;

  useEffect(() => {
    const offs = [
      SignalModule.onGate((e: GateEvent) => {
        setLive(s => {
          if (e.to === 'ACTIVE' && s.phase !== 'active') {
            cuesRef.current.onGateOpen?.();
          }
          if (e.to === 'CLOSED') {
            cuesRef.current.onGateClose?.();
          }
          return {...s, phase: e.to === 'ACTIVE' ? 'active' : e.to === 'CLOSING' ? 'closing' : e.to === 'CLOSED' ? 'ended' : s.phase};
        });
      }),
      SignalModule.onRep((e: RepEvent) => {
        cuesRef.current.onRep?.(e.n);
        setLive(s => ({...s, reps: e.n, lastRepLatencyMs: e.latencyMs}));
      }),
      SignalModule.onMatch((e: MatchEvent) => setLive(s => ({...s, provisionalLabel: e.label, provisionalConfidence: e.confidence}))),
      SignalModule.onLink((e: LinkEvent) => {
        setLive(s => {
          if (s.link?.connected && !e.connected) {
            cuesRef.current.onLinkLost?.();
          }
          return {...s, link: e};
        });
      }),
    ];
    return () => offs.forEach(f => f());
  }, []);

  const arm = useCallback(async (exerciseHint: string | null, opts?: ArmOptions) => {
    const setId = `set_${Date.now()}`;
    try {
      if (SignalModule.isAvailable()) {
        await SignalModule.startSet(setId, exerciseHint);
      }
      // The clip starts at ARM so the glance and the pre-roll are inside it by construction
      // (design §11.1). A clip failure never breaks the set.
      let clipId: string | null = null;
      if (opts?.sessionId && CameraModule.isAvailable()) {
        const clip = await beginSetClip(opts.sessionId, setId, opts.rigId, opts.rotationDeg).catch(() => null);
        clipId = clip?.id ?? null;
      }
      clipRef.current = clipId;
      setLive({phase: 'armed', setId, exerciseHint, reps: 0, lastRepLatencyMs: null, provisionalLabel: null, provisionalConfidence: 0, link: null, result: null, error: null, clipId, glanceJpegB64: null});
    } catch (e) {
      setLive(s => ({...s, error: (e as Error).message}));
    }
  }, []);

  const end = useCallback(async (): Promise<SetResult | null> => {
    if (!live.setId) {
      return null;
    }
    // Stop the clip first so its post-roll ends where the user ended the set (the user presses
    // END SET after the set; the gate closed earlier, so that IS the post-roll).
    let glanceJpegB64: string | null = null;
    const clipId = clipRef.current;
    if (clipId) {
      const stopped = await endSetClip(clipId, null).catch(() => null);
      glanceJpegB64 = stopped?.glanceJpegB64 ?? null;
    }
    try {
      const result = SignalModule.isAvailable() ? await SignalModule.endSet(live.setId) : null;
      setLive(s => ({...s, phase: 'ended', result, clipId, glanceJpegB64}));
      return result;
    } catch (e) {
      setLive(s => ({...s, error: (e as Error).message, clipId, glanceJpegB64}));
      return null;
    }
  }, [live.setId]);

  const reset = useCallback(() => {
    clipRef.current = null;
    setLive(s => ({...s, phase: 'idle', setId: null, reps: 0, result: null, provisionalLabel: null, clipId: null, glanceJpegB64: null}));
  }, []);

  return {live, arm, end, reset};
}
