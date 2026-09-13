import {useCallback, useEffect, useRef, useState} from 'react';
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
}

export interface SetCues {
  onGateOpen?: () => void;
  onGateClose?: () => void;
  onRep?: (n: number) => void;
  onLinkLost?: () => void;
}

export function useSet(cues: SetCues = {}) {
  const [live, setLive] = useState<LiveSet>({phase: 'idle', setId: null, exerciseHint: null, reps: 0, lastRepLatencyMs: null, provisionalLabel: null, provisionalConfidence: 0, link: null, result: null, error: null});
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

  const arm = useCallback(async (exerciseHint: string | null) => {
    const setId = `set_${Date.now()}`;
    try {
      if (SignalModule.isAvailable()) {
        await SignalModule.startSet(setId, exerciseHint);
      }
      setLive({phase: 'armed', setId, exerciseHint, reps: 0, lastRepLatencyMs: null, provisionalLabel: null, provisionalConfidence: 0, link: null, result: null, error: null});
    } catch (e) {
      setLive(s => ({...s, error: (e as Error).message}));
    }
  }, []);

  const end = useCallback(async (): Promise<SetResult | null> => {
    if (!live.setId) {
      return null;
    }
    try {
      const result = SignalModule.isAvailable() ? await SignalModule.endSet(live.setId) : null;
      setLive(s => ({...s, phase: 'ended', result}));
      return result;
    } catch (e) {
      setLive(s => ({...s, error: (e as Error).message}));
      return null;
    }
  }, [live.setId]);

  const reset = useCallback(() => setLive(s => ({...s, phase: 'idle', setId: null, reps: 0, result: null, provisionalLabel: null})), []);

  return {live, arm, end, reset};
}
