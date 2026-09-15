import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {answersToConfirmed, evaluateGates, type DebriefAnswers, type DebriefContext} from '../controller/useDebrief';
import {detent, offSnap, snapped as snapTick, tick} from './haptics';
import {ImuModule} from '../native/ImuModule';
import {SignalStudio} from '../native/SignalModule';
import {attachClipToSet, clipDir, importClip, loadPtsTable} from '../model/clips';
import {decodeF16} from '../model/f16';
import {commit, markRegionTagged, pinFrame, relabel, type CommitInput, type CommitOutcome} from '../model/learner';
import {compose} from '../model/params';
import {campaignOf, ensureBundled, repSignalOf} from '../model/packageManager';
import {enqueueAfterCommit, resolveQueueItem} from '../model/queue';
import {repShape as loadRepShape} from '../model/repShape';
import * as store from '../model/store';
import {frameIndexAtHost, hostNsForPts, marksToConfirmed, nearestSnap, offsetDetector, resolveMarksVsCount} from '../model/timeline';
import type {ClipRow, IntegrityPreview, QueueFocus, RangeExplanation, SetResult, SyncClass} from '../types/model';
import type {StudioDraft, StudioMode, StudioOpen} from './nav';

// The Studio controller (studio design §7, §8, §9, §10.5). Everything is in HOST time
// (elapsedRealtimeNanos); the viewer maps host → PTS through the clip's sync record.

export interface StudioMark {
  id: string;
  tNs: number;
  snapped: boolean;
  source: 'imu' | 'user';
  on: boolean;
}

export interface StudioState {
  loading: boolean;
  error: string | null;
  labeledSetId: string | null;
  sessionId: string | null;
  result: SetResult | null;
  clip: ClipRow | null;
  pts: number[];
  /** Host-time window the timeline is drawn over. */
  t0Ns: number;
  t1Ns: number;
  playhead: number;
  mode: StudioMode;
  marks: StudioMark[];
  selectedMark: string | null;
  bounds: {startNs: number; endNs: number};
  answers: DebriefAnswers;
  explain: RangeExplanation | null;
  trace: {t0Ns: number; t1Ns: number; values: number[]} | null;
  ghost: number[] | null;
  preview: IntegrityPreview | null;
  syncClass: SyncClass;
  degraded: string | null;
  pins: store.ExemplarFrameRow[];
  outcome: string | null;
  busy: boolean;
  focus: QueueFocus | null;
  lanes: Record<'filmstrip' | 'trace' | 'gate' | 'reps' | 'glance' | 'sync', boolean>;
}

const EMPTY_ANSWERS: DebriefAnswers = {exerciseId: '', repsConfirmed: null, weight: null, weightUnit: 'kg', weightState: 'confirmed'};
const SNAP_MS = 150;
const STEP_NO_CLIP_NS = 20_000_000; // 1/50 s

function traceFromWindow(result: SetResult): {t0Ns: number; t1Ns: number; values: number[]} | null {
  const win = decodeF16(result.windowF16, result.channels);
  if (!win.length) {
    return null;
  }
  const ch = result.dominantChannel ?? -1;
  const pick = (row: number[]) => (ch >= 0 && ch < 3 ? row[ch] : Math.hypot(row[0] ?? 0, row[1] ?? 0, row[2] ?? 0));
  const per = Math.max(1, Math.floor(win.length / 2000));
  const values: number[] = [];
  for (let i = 0; i < win.length; i += per) {
    values.push(pick(win[i]));
  }
  return {t0Ns: result.tStartNs, t1Ns: result.tEndNs, values};
}

/** Local maximum of |trace| within ±windowMs of tNs (the no-native fallback for snap-to-peak). */
export function localPeak(trace: {t0Ns: number; t1Ns: number; values: number[]}, tNs: number, windowMs: number): number | null {
  const n = trace.values.length;
  if (n < 2) {
    return null;
  }
  const dur = trace.t1Ns - trace.t0Ns;
  const toIdx = (t: number) => Math.round(((t - trace.t0Ns) / dur) * (n - 1));
  const a = Math.max(0, toIdx(tNs - windowMs * 1e6));
  const b = Math.min(n - 1, toIdx(tNs + windowMs * 1e6));
  if (a > b) {
    return null;
  }
  let best = a;
  for (let i = a; i <= b; i++) {
    if (Math.abs(trace.values[i]) > Math.abs(trace.values[best])) {
      best = i;
    }
  }
  return trace.t0Ns + (best / (n - 1)) * dur;
}

function classLine(cls: SyncClass, clip: ClipRow | null, hasImu: boolean): string | null {
  if (!clip) {
    return hasImu ? 'No video for this set — the headband data is all there is.' : null;
  }
  if (clip.state === 'reduced') {
    return 'Video reduced to exemplar frames — trace, marks and relabel still work.';
  }
  if (!hasImu) {
    return 'No headband data — this teaches exercise and weight, not reps.';
  }
  if (cls === 'flag') {
    return 'Video and headband may be up to 80 ms apart here.';
  }
  if (cls === 'reject') {
    return 'Video could not be aligned — marks come from the headband only.';
  }
  if (!clip.proxyPath && clip.state === 'ingesting') {
    return 'Preparing smooth scrubbing…';
  }
  return null;
}

let markSeq = 0;
const newMarkId = () => `m${Date.now().toString(36)}_${markSeq++}`;

export function useStudio(open: StudioOpen, opts: {names: Record<string, string>; onSaved?: (outcome: CommitOutcome) => void}) {
  const [s, setS] = useState<StudioState>({
    loading: true, error: null, labeledSetId: null, sessionId: null, result: null, clip: null, pts: [], t0Ns: 0, t1Ns: 1, playhead: 0,
    mode: 'review', marks: [], selectedMark: null, bounds: {startNs: 0, endNs: 1}, answers: EMPTY_ANSWERS, explain: null, trace: null, ghost: null,
    preview: null, syncClass: 'none', degraded: null, pins: [], outcome: null, busy: false, focus: open.focus ?? null,
    lanes: {filmstrip: true, trace: true, gate: true, reps: true, glance: true, sync: true},
  });
  const ctxRef = useRef<DebriefContext | null>(null);
  const openedAt = useRef(Date.now());
  const draftRef = useRef<StudioDraft | null>(open.kind === 'draft' ? open.draft : null);
  const lastStep = useRef(0);

  // ---------------------------------------------------------------- load
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let result: SetResult;
        let clip: ClipRow | null = null;
        let answers: DebriefAnswers;
        let labeledSetId: string | null = null;
        let hasImu = true;
        let marksInit: StudioMark[] = [];
        let snappedInit: boolean[] | undefined;
        if (open.kind === 'draft') {
          result = open.draft.result;
          answers = open.draft.answers;
          ctxRef.current = open.draft.ctx;
          clip = open.draft.clipId ? await store.clip(open.draft.clipId) : null;
        } else {
          const row = await store.labeledSet(open.labeledSetId);
          if (!row) {
            throw new Error('Set not found');
          }
          labeledSetId = row.id;
          hasImu = row.imuAvailable !== false;
          result = row.resultJson
            ? (JSON.parse(row.resultJson) as SetResult)
            : ({
                setId: row.id, sessionId: row.sessionId, tStartNs: row.tStartHostNs ?? 0, tEndNs: row.tEndHostNs ?? (row.tStartHostNs ?? 0) + row.durationSec! * 1e9,
                tOpenNs: row.tStartHostNs ?? 0, tCloseNs: row.tEndHostNs ?? 0, gateState: 'CLOSED', rateHz: row.rateHz ?? 50, samples: 0,
                windowF16: row.windowF16 ?? '', channels: row.channels ?? 6, hasGyro: true, reps: [], repsDetected: row.repsDetected ?? 0, seqGaps: 0, saturated: 0,
              } as SetResult);
          const draft = await store.loadDraft<DebriefAnswers>(row.id);
          answers = draft ?? {exerciseId: row.exerciseId, repsConfirmed: row.repsConfirmed, weight: row.weightDeclared, weightUnit: row.weightUnit ?? 'kg', weightState: row.weightState as DebriefAnswers['weightState']};
          clip = await store.clipForSet(row.id);
          const pkg = await ensureBundled();
          const sess = await store.session(row.sessionId);
          ctxRef.current = {pkg, params: compose(pkg.params, await store.fittedParams()), sessionId: row.sessionId, gymId: sess?.gymId ?? null, rotation: null, calibrated: row.gates.rig !== false, clipId: clip?.id ?? null};
          // Stored marks (v2 rows carry snap flags) become the initial mark set.
          const origin = row.tStartHostNs ?? result.tStartNs;
          snappedInit = row.repMarksSnapped;
          marksInit = row.repMarks.map((sec, i) => ({id: newMarkId(), tNs: origin + sec * 1e9, snapped: snappedInit ? snappedInit[i] : true, source: 'imu' as const, on: true}));
        }
        // E2E: attach the fixture clip so the flows can step frames without a camera (§17).
        // `getE2eConfig().file` is ABSOLUTE (ImuModule resolves it against the external files
        // dir), so the fixture sits next to it — take its directory, never re-prefix it.
        let e2eError: string | null = null;
        if (!clip && ImuModule.isAvailable()) {
          try {
            const e2e = await ImuModule.getE2eConfig();
            if (e2e.enabled && e2e.file) {
              const dir = e2e.file.slice(0, e2e.file.lastIndexOf('/'));
              clip = await importClip({
                sessionId: result.sessionId ?? 'e2e',
                masterPath: `${dir}/studio-clip.mp4`,
                source: 'gallery',
                rotationDeg: 0,
                sync: {pts0HostNs: result.tStartNs, rate: 1, residualMs: 0, class: 'exact', source: 'session_json'},
                labeledSetId: labeledSetId ?? undefined,
              });
            }
          } catch (e) {
            // Only reachable with a marker present (i.e. in the harness). Surfacing it matters:
            // a silently missing clip makes a video flow look like a product bug.
            e2eError = `e2e clip not attached: ${(e as Error).message}`;
          }
        }
        if (marksInit.length === 0) {
          marksInit = result.reps.map(r => ({id: newMarkId(), tNs: result.tStartNs + r.tPeakSec * 1e9, snapped: true, source: 'imu' as const, on: true}));
        }
        const pts = clip ? await loadPtsTable(clip).catch(() => [] as number[]) : [];
        const t0Ns = result.tStartNs;
        const t1Ns = Math.max(result.tEndNs, t0Ns + 1e9);
        let explain: RangeExplanation | null = null;
        if (result.sessionId && SignalStudio.isAvailable()) {
          try {
            const info = await SignalStudio.recorderInfo(result.sessionId);
            if (info.loaded) {
              explain = await SignalStudio.explainRange(result.sessionId, t0Ns, t1Ns);
            }
          } catch {
            explain = null;
          }
        }
        const trace = explain?.trace ?? traceFromWindow(result);
        const pins = labeledSetId ? await store.exemplarFrames(labeledSetId) : [];
        const syncClass: SyncClass = clip ? clip.sync.class : 'none';
        let ghost: number[] | null = null;
        try {
          ghost = answers.exerciseId ? await loadRepShape(answers.exerciseId, result.dominantChannel ?? -1) : null;
        } catch {
          ghost = null;
        }
        if (!alive) {
          return;
        }
        // Clamp the bounds and the playhead into the window the timeline actually draws. A gate
        // that opened before the analysed window starts would otherwise put the playhead at a
        // NEGATIVE time, where stepping back clamps and a frame step stops being reversible.
        const clamp = (t: number) => Math.min(t1Ns, Math.max(t0Ns, t));
        const startNs = clamp(result.tOpenNs || t0Ns);
        const endNs = clamp(result.tCloseNs || t1Ns);
        setS(prev => ({
          ...prev, loading: false, labeledSetId, sessionId: result.sessionId, result, clip, pts, t0Ns, t1Ns, playhead: startNs, marks: marksInit,
          bounds: {startNs, endNs}, answers, explain, trace, ghost, syncClass, degraded: e2eError ?? classLine(syncClass, clip, hasImu), pins,
          mode: open.focus === 'marks' ? 'marks' : open.focus === 'bounds' ? 'bounds' : 'review',
        }));
        void store.studioEvent({kind: 'open', labeledSetId, ms: Date.now() - openedAt.current});
      } catch (e) {
        if (alive) {
          setS(prev => ({...prev, loading: false, error: (e as Error).message}));
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------- derived
  const frameIndex = useMemo(() => (s.clip && s.pts.length ? frameIndexAtHost(s.pts, s.clip.sync, s.playhead) : -1), [s.clip, s.pts, s.playhead]);
  const onMarks = useMemo(() => s.marks.filter(m => m.on).sort((a, b) => a.tNs - b.tNs), [s.marks]);
  const snapPoints = useMemo(() => {
    const pts: number[] = onMarks.map(m => m.tNs);
    pts.push(s.bounds.startNs, s.bounds.endNs);
    if (s.explain) {
      for (const p of s.explain.peaks) {
        pts.push(p.tNs);
      }
    }
    return [...new Set(pts)].sort((a, b) => a - b);
  }, [onMarks, s.bounds, s.explain]);
  const repSignal = useMemo(() => (ctxRef.current && s.answers.exerciseId ? repSignalOf(ctxRef.current.pkg, s.answers.exerciseId) ?? 'vision' : 'vision'), [s.answers.exerciseId]);
  const marksVsCount = useMemo(() => resolveMarksVsCount(onMarks.length, s.answers.repsConfirmed), [onMarks.length, s.answers.repsConfirmed]);
  const gates = useMemo(() => {
    if (!s.result || !ctxRef.current) {
      return {} as Record<string, boolean>;
    }
    const r = {...s.result, tOpenNs: s.bounds.startNs, tCloseNs: s.bounds.endNs};
    return evaluateGates(r, s.answers, repSignal, ctxRef.current.calibrated);
  }, [s.result, s.bounds, s.answers, repSignal]);
  const offset = useMemo(() => {
    const user = s.marks.filter(m => m.on && m.source === 'user').map(m => m.tNs);
    const imu = s.explain ? s.explain.peaks.map(p => p.tNs) : s.result ? s.result.reps.map(r => s.result!.tStartNs + r.tPeakSec * 1e9) : [];
    return user.length && imu.length ? offsetDetector(user, imu) : null;
  }, [s.marks, s.explain, s.result]);

  // ---------------------------------------------------------------- integrity preview (debounced)
  useEffect(() => {
    if (!s.result || !s.answers.exerciseId || !ctxRef.current || !SignalStudio.isAvailable() || !s.result.features) {
      return;
    }
    const ctx = ctxRef.current;
    const h = setTimeout(() => {
      SignalStudio.previewIntegrity(s.answers.exerciseId, s.result!.windowF16, s.result!.channels, s.result!.features, campaignOf(ctx.pkg, s.answers.exerciseId))
        .then(p => setS(prev => ({...prev, preview: p})))
        .catch(() => setS(prev => ({...prev, preview: null})));
    }, 250);
    return () => clearTimeout(h);
  }, [s.answers.exerciseId, s.result]);

  // Ghost follows the chosen exercise.
  useEffect(() => {
    if (!s.answers.exerciseId || !s.result) {
      return;
    }
    let alive = true;
    loadRepShape(s.answers.exerciseId, s.result.dominantChannel ?? -1)
      .then(g => alive && setS(prev => ({...prev, ghost: g})))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [s.answers.exerciseId, s.result]);

  // Autosave answers as a draft for stored sets.
  useEffect(() => {
    if (s.labeledSetId && !s.loading) {
      void store.saveDraft(s.labeledSetId, s.answers);
    }
  }, [s.answers, s.labeledSetId, s.loading]);

  // ---------------------------------------------------------------- navigation
  const seekHost = useCallback((tNs: number, snap = false) => {
    setS(prev => {
      let t = Math.min(prev.t1Ns, Math.max(prev.t0Ns, tNs));
      if (snap) {
        const radiusNs = ((prev.t1Ns - prev.t0Ns) / 60) | 0; // ≈ 12 px at 1× on a ~720 px lane
        const near = nearestSnap(snapPoints, t, radiusNs);
        if (near != null && near !== prev.playhead) {
          t = near;
          snapTick();
        }
      }
      return t === prev.playhead ? prev : {...prev, playhead: t};
    });
  }, [snapPoints]);

  const stepFrame = useCallback((dir: 1 | -1) => {
    const t0 = Date.now();
    setS(prev => {
      let t = prev.playhead;
      if (prev.clip && prev.pts.length) {
        const i = frameIndexAtHost(prev.pts, prev.clip.sync, prev.playhead);
        const j = Math.min(prev.pts.length - 1, Math.max(0, i + dir));
        t = hostNsForPts(prev.clip.sync, prev.pts[j]);
      } else {
        t = prev.playhead + dir * STEP_NO_CLIP_NS;
      }
      t = Math.min(prev.t1Ns, Math.max(prev.t0Ns, t));
      return {...prev, playhead: t};
    });
    detent();
    const now = Date.now();
    if (now - lastStep.current > 20) {
      void store.studioEvent({kind: 'step', labeledSetId: s.labeledSetId, ms: now - t0});
    }
    lastStep.current = now;
  }, [s.labeledSetId]);

  const stepRep = useCallback((dir: 1 | -1) => {
    setS(prev => {
      const pts = onMarks.map(m => m.tNs);
      const eps = 1_000_000;
      const next = dir > 0 ? pts.find(p => p > prev.playhead + eps) : [...pts].reverse().find(p => p < prev.playhead - eps);
      return next == null ? prev : {...prev, playhead: next};
    });
  }, [onMarks]);

  const setMode = useCallback((mode: StudioMode) => setS(prev => ({...prev, mode, selectedMark: null})), []);
  const toggleLane = useCallback((lane: keyof StudioState['lanes']) => setS(prev => ({...prev, lanes: {...prev.lanes, [lane]: !prev.lanes[lane]}})), []);

  // ---------------------------------------------------------------- marks
  const snapTo = useCallback(async (tNs: number): Promise<{tNs: number; snapped: boolean}> => {
    if (s.sessionId && s.explain && SignalStudio.isAvailable()) {
      try {
        const p = await SignalStudio.peakNear(s.sessionId, tNs, SNAP_MS);
        if (p > 0) {
          return {tNs: p, snapped: true};
        }
      } catch {
        // fall through to the local search
      }
    }
    if (s.trace) {
      const p = localPeak(s.trace, tNs, SNAP_MS);
      if (p != null) {
        return {tNs: p, snapped: true};
      }
    }
    return {tNs, snapped: false};
  }, [s.sessionId, s.explain, s.trace]);

  const addMark = useCallback(async (atNs?: number) => {
    const t = atNs ?? s.playhead;
    const snapped = await snapTo(t);
    if (snapped.snapped) { snapTick(); } else { offSnap(); }
    setS(prev => {
      if (prev.marks.some(m => Math.abs(m.tNs - snapped.tNs) < 50_000_000)) {
        return prev; // 50 ms: already a mark here
      }
      const m: StudioMark = {id: newMarkId(), tNs: snapped.tNs, snapped: snapped.snapped, source: 'user', on: true};
      const marks = [...prev.marks, m].sort((a, b) => a.tNs - b.tNs);
      return {...prev, marks, selectedMark: m.id, answers: {...prev.answers, repsConfirmed: marks.filter(x => x.on).length}, playhead: snapped.tNs};
    });
    void store.studioEvent({kind: 'mark_add', labeledSetId: s.labeledSetId});
  }, [s.playhead, s.labeledSetId, snapTo]);

  const moveMark = useCallback(async (id: string, toNs: number, finalize: boolean) => {
    if (!finalize) {
      setS(prev => ({...prev, marks: prev.marks.map(m => (m.id === id ? {...m, tNs: toNs} : m)), playhead: toNs}));
      return;
    }
    const snapped = await snapTo(toNs);
    if (snapped.snapped) { snapTick(); } else { offSnap(); }
    setS(prev => ({...prev, marks: prev.marks.map(m => (m.id === id ? {...m, tNs: snapped.tNs, snapped: snapped.snapped, source: 'user' as const} : m)).sort((a, b) => a.tNs - b.tNs), playhead: snapped.tNs}));
    void store.studioEvent({kind: 'mark_move', labeledSetId: s.labeledSetId});
  }, [snapTo, s.labeledSetId]);

  const toggleMark = useCallback((id: string) => {
    setS(prev => {
      const marks = prev.marks.map(m => (m.id === id ? {...m, on: !m.on} : m));
      return {...prev, marks, selectedMark: id, answers: {...prev.answers, repsConfirmed: marks.filter(x => x.on).length}};
    });
  }, []);

  const selectMark = useCallback((id: string | null) => setS(prev => ({...prev, selectedMark: id, playhead: id ? prev.marks.find(m => m.id === id)?.tNs ?? prev.playhead : prev.playhead})), []);

  const deleteMark = useCallback((id?: string) => {
    setS(prev => {
      const target = id ?? prev.selectedMark ?? [...prev.marks].sort((a, b) => Math.abs(a.tNs - prev.playhead) - Math.abs(b.tNs - prev.playhead))[0]?.id;
      if (!target) {
        return prev;
      }
      const marks = prev.marks.filter(m => m.id !== target);
      return {...prev, marks, selectedMark: null, answers: {...prev.answers, repsConfirmed: marks.filter(x => x.on).length}};
    });
    void store.studioEvent({kind: 'mark_delete', labeledSetId: s.labeledSetId});
  }, [s.labeledSetId]);

  /** Reps sheet: "8 marks · you typed 9" → keep the marks' count or keep the typed number. */
  const useMarksCount = useCallback(() => setS(prev => ({...prev, answers: {...prev.answers, repsConfirmed: prev.marks.filter(m => m.on).length}})), []);

  // ---------------------------------------------------------------- bounds
  const setBound = useCallback((side: 'start' | 'end', tNs?: number) => {
    setS(prev => {
      const t = tNs ?? prev.playhead;
      const b = side === 'start' ? {startNs: Math.min(t, prev.bounds.endNs - 1e9), endNs: prev.bounds.endNs} : {startNs: prev.bounds.startNs, endNs: Math.max(t, prev.bounds.startNs + 1e9)};
      return {...prev, bounds: b};
    });
    void store.studioEvent({kind: 'bounds', labeledSetId: s.labeledSetId});
  }, [s.labeledSetId]);

  // ---------------------------------------------------------------- answers
  const setAnswers = useCallback((a: DebriefAnswers | ((prev: DebriefAnswers) => DebriefAnswers)) => {
    setS(prev => ({...prev, answers: typeof a === 'function' ? a(prev.answers) : a, outcome: null}));
  }, []);

  // ---------------------------------------------------------------- pins
  const pinCurrentFrame = useCallback(async (role: 'glance' | 'rep_top' | 'rep_bottom', crop: {x: number; y: number; w: number; h: number} | null) => {
    if (!s.clip || !s.pts.length || frameIndex < 0) {
      return null;
    }
    const setId = s.labeledSetId ?? s.result?.setId;
    if (!setId) {
      return null;
    }
    const row = await pinFrame({labeledSetId: setId, clipId: s.clip.id, ptsUs: s.pts[frameIndex], role, crop});
    setS(prev => ({...prev, pins: [...prev.pins.filter(p => p.id !== row.id), row]}));
    tick(12);
    void store.studioEvent({kind: 'pin', labeledSetId: s.labeledSetId});
    return row;
  }, [s.clip, s.pts, frameIndex, s.labeledSetId, s.result]);

  // ---------------------------------------------------------------- save
  const save = useCallback(async () => {
    const ctx = ctxRef.current;
    if (!s.result || !ctx || !s.answers.exerciseId) {
      return null;
    }
    setS(prev => ({...prev, busy: true, outcome: null}));
    const t0 = Date.now();
    try {
      const rs = repSignalOf(ctx.pkg, s.answers.exerciseId) ?? 'vision';
      const result = {...s.result, tOpenNs: s.bounds.startNs, tCloseNs: s.bounds.endNs};
      const g = evaluateGates(result, s.answers, rs, ctx.calibrated);
      const confirmed = answersToConfirmed(result, s.answers, ctx);
      const conv = marksToConfirmed(onMarks.map(m => m.tNs), onMarks.map(m => m.snapped), s.result.tStartNs);
      const input: CommitInput = {
        result,
        confirmed: {
          ...confirmed,
          setId: s.labeledSetId ?? confirmed.setId,
          tStartSec: Math.max(0, (s.bounds.startNs - s.result.tStartNs) / 1e9),
          tEndSec: Math.max(1, (s.bounds.endNs - s.result.tStartNs) / 1e9),
          repTopsSec: conv.repTopsSec,
          repTopsSnapped: conv.repTopsSnapped,
          labelSource: 'studio',
          clipId: s.clip?.id ?? null,
          tStartHostNs: s.bounds.startNs,
          tEndHostNs: s.bounds.endNs,
          imuAvailable: s.result.samples > 0,
        },
        repSignal: rs,
        campaign: campaignOf(ctx.pkg, s.answers.exerciseId),
        gates: g,
        packageParams: ctx.pkg.params,
        canonicalRotation: ctx.rotation,
      };
      const out: CommitOutcome = s.labeledSetId ? await relabel(s.labeledSetId, input) : await commit(input);
      const setId = input.confirmed.setId;
      if (s.clip) {
        await attachClipToSet(s.clip.id, setId).catch(() => undefined);
      }
      if (!s.labeledSetId && draftRef.current?.regionId) {
        await markRegionTagged(draftRef.current.regionId, setId);
      }
      const top1 = s.result.match?.candidates[0]?.exerciseId;
      await enqueueAfterCommit({setId, result, gates: g, repsConfirmed: s.answers.repsConfirmed, repSignal: rs, exerciseId: s.answers.exerciseId, chosenAgainstTop1: !!top1 && top1 !== s.answers.exerciseId, names: opts.names});
      if (open.kind === 'set' && open.queueItemId) {
        await resolveQueueItem(open.queueItemId, out.counted ? 'clean' : 'not_counted');
        void store.studioEvent({kind: 'queue_resolve', labeledSetId: setId});
      }
      if (s.labeledSetId) {
        await store.deleteDraft(s.labeledSetId);
      }
      void store.studioEvent({kind: s.labeledSetId ? 'relabel' : 'save', labeledSetId: setId, ms: Date.now() - t0, n: s.marks.filter(m => m.source === 'user').length});
      const line = out.counted
        ? `Clean set · +${out.xpEarned} XP · ${out.templatesAdded} templates${out.integrity != null ? ` · integrity ${Math.round(out.integrity * 100)}%` : ''}${out.level ? ` · ${out.level.from} → ${out.level.to}` : ''}`
        : 'Set kept but not counted — a quality gate failed.';
      setS(prev => ({...prev, busy: false, outcome: line, labeledSetId: setId}));
      opts.onSaved?.(out);
      return out;
    } catch (e) {
      setS(prev => ({...prev, busy: false, outcome: `Save failed: ${(e as Error).message}`}));
      return null;
    }
  }, [s.result, s.answers, s.bounds, s.labeledSetId, s.clip, s.marks, onMarks, open, opts]);

  const gateSummary = useMemo(() => {
    const failed = Object.entries(gates).filter(([, v]) => !v).map(([k]) => k);
    return failed.length ? `gate: ${failed.join(', ')} ✗` : 'all gates ✓';
  }, [gates]);

  return {
    s,
    ctx: ctxRef.current,
    frameIndex,
    onMarks,
    snapPoints,
    repSignal,
    marksVsCount,
    gates,
    gateSummary,
    offset,
    seekHost,
    stepFrame,
    stepRep,
    setMode,
    toggleLane,
    addMark,
    moveMark,
    toggleMark,
    selectMark,
    deleteMark,
    useMarksCount,
    setBound,
    setAnswers,
    pinCurrentFrame,
    save,
    setPlayheadFromPlayer: (tNs: number) => setS(prev => ({...prev, playhead: tNs})),
  };
}

export type Studio = ReturnType<typeof useStudio>;
export {clipDir};
