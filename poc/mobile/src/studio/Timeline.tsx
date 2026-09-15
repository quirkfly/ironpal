import React, {useMemo, useRef, useState} from 'react';
import {Image, LayoutChangeEvent, StyleSheet, Text, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {runOnJS, useAnimatedReaction, useSharedValue} from 'react-native-reanimated';
import Svg, {Circle, G, Line, Polyline, Rect, Text as SvgText} from 'react-native-svg';
import {colors} from '../components/theme';
import {zoomClamp} from '../model/timeline';
import type {RangeExplanation} from '../types/model';
import {BoundHandle, MarkGlyph, PinGlyph, STUDIO_COLORS} from './glyphs';
import type {StudioMode} from './nav';
import type {StudioMark, StudioState} from './useStudio';

// The timeline (studio design §7.3): stacked lanes on one zoom/pan model. Gestures run on the UI
// thread through Reanimated shared values; JS is only told when something it must redraw
// changed (playhead / view window), and the redraw is throttled to ~30 fps.

const LANE_H = {filmstrip: 44, trace: 56, gate: 12, reps: 30, glance: 14, sync: 14};
const MIN_ZOOM = 1;
const MAX_ZOOM = 32;

interface Props {
  s: StudioState;
  onMarks: StudioMark[];
  /** A horizontal sprite of `count` thumbnails, each w×h, one per (1/perSecond) s of the clip. */
  frameThumbs: {uri: string; count: number; perSecond: number; w: number; h: number; cols: number} | null;
  onScrub: (tNs: number, snap: boolean) => void;
  onMarkPress: (id: string) => void;
  onMarkMove: (id: string, toNs: number, finalize: boolean) => void;
  onBoundDrag: (side: 'start' | 'end', toNs: number) => void;
  onAddMarkAt: (tNs: number) => void;
  onLongPress: () => void;
}

export function Timeline({s, onMarks, frameThumbs, onScrub, onMarkPress, onMarkMove, onBoundDrag, onAddMarkAt, onLongPress}: Props) {
  const [width, setWidth] = useState(0);
  const [view, setView] = useState<{zoom: number; startNs: number}>({zoom: 1, startNs: s.t0Ns});
  const zoom = useSharedValue(1);
  const startNs = useSharedValue(s.t0Ns);
  const pinchStart = useSharedValue(1);
  const panStart = useSharedValue(0);
  const total = Math.max(1, s.t1Ns - s.t0Ns);
  const lastEmit = useRef(0);
  const modeRef = useRef<StudioMode>(s.mode);
  modeRef.current = s.mode;
  const dragging = useRef<{kind: 'mark' | 'bound'; id: string; side?: 'start' | 'end'} | null>(null);

  // The visible window is [startNs, startNs + total / zoom].
  const visNs = total / view.zoom;
  const x = (t: number) => ((t - view.startNs) / visNs) * width;
  const tAt = (px: number) => view.startNs + (px / width) * visNs;

  useAnimatedReaction(
    () => ({z: zoom.value, st: startNs.value}),
    (cur, prev) => {
      if (!prev || cur.z !== prev.z || cur.st !== prev.st) {
        runOnJS(setView)({zoom: cur.z, startNs: cur.st});
      }
    },
  );

  const clampStart = (st: number, z: number) => {
    'worklet';
    const vis = total / z;
    return Math.min(s.t1Ns - vis, Math.max(s.t0Ns, st));
  };

  const emitScrub = (t: number) => {
    const now = Date.now();
    if (now - lastEmit.current < 16) {
      return;
    }
    lastEmit.current = now;
    onScrub(t, true);
  };

  // One finger: scrub (Review), move the selected/nearest mark (Marks), drag the nearer bound (Bounds).
  const drag = Gesture.Pan()
    .maxPointers(1)
    .runOnJS(true)
    .onBegin(e => {
      const t = tAt(e.x);
      const mode = modeRef.current;
      dragging.current = null;
      if (mode === 'marks') {
        const near = nearestMark(onMarks, t, (visNs / width) * 14);
        if (near) {
          dragging.current = {kind: 'mark', id: near.id};
          onMarkPress(near.id);
          return;
        }
      }
      if (mode === 'bounds') {
        const dS = Math.abs(s.bounds.startNs - t);
        const dE = Math.abs(s.bounds.endNs - t);
        dragging.current = {kind: 'bound', id: '', side: dS <= dE ? 'start' : 'end'};
        return;
      }
      emitScrub(t);
    })
    .onUpdate(e => {
      const t = Math.min(s.t1Ns, Math.max(s.t0Ns, tAt(e.x)));
      const d = dragging.current;
      if (d?.kind === 'mark') {
        onMarkMove(d.id, t, false);
      } else if (d?.kind === 'bound' && d.side) {
        onBoundDrag(d.side, t);
      } else {
        emitScrub(t);
      }
    })
    .onEnd(e => {
      const t = Math.min(s.t1Ns, Math.max(s.t0Ns, tAt(e.x)));
      const d = dragging.current;
      if (d?.kind === 'mark') {
        onMarkMove(d.id, t, true);
      } else if (d?.kind === 'bound' && d.side) {
        onBoundDrag(d.side, t);
      } else {
        onScrub(t, true);
      }
      dragging.current = null;
    });

  // Two fingers: pan the view.
  const pan2 = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onBegin(() => {
      panStart.value = startNs.value;
    })
    .onUpdate(e => {
      const vis = total / zoom.value;
      startNs.value = clampStart(panStart.value - (e.translationX / Math.max(1, width)) * vis, zoom.value);
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      pinchStart.value = zoom.value;
    })
    .onUpdate(e => {
      const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStart.value * e.scale));
      // Zoom around the pinch focal point.
      const visBefore = total / zoom.value;
      const focalT = startNs.value + (e.focalX / Math.max(1, width)) * visBefore;
      const visAfter = total / z;
      zoom.value = z;
      startNs.value = clampStart(focalT - (e.focalX / Math.max(1, width)) * visAfter, z);
    });

  const tap2 = Gesture.Tap()
    .minPointers(2)
    .runOnJS(true)
    .onEnd((e: {x: number}) => {
      if (modeRef.current === 'marks') {
        onAddMarkAt(tAt(e.x));
      }
    });

  const longPress = Gesture.LongPress().runOnJS(true).onStart(() => onLongPress());

  const gesture = Gesture.Race(Gesture.Simultaneous(pinch, pan2), Gesture.Exclusive(tap2, drag), longPress);

  void zoomClamp;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const lanes = useMemo(() => {
    const out: {key: keyof typeof LANE_H; y: number; h: number}[] = [];
    let y = 0;
    for (const key of ['filmstrip', 'trace', 'gate', 'reps', 'glance', 'sync'] as const) {
      if (!s.lanes[key]) {
        continue;
      }
      if (key === 'sync' && !s.explain) {
        continue;
      }
      out.push({key, y, h: LANE_H[key]});
      y += LANE_H[key] + 2;
    }
    return {rows: out, height: y};
  }, [s.lanes, s.explain]);

  const tracePoints = useMemo(() => {
    if (!s.trace || width === 0) {
      return '';
    }
    const lane = lanes.rows.find(r => r.key === 'trace');
    if (!lane) {
      return '';
    }
    const n = s.trace.values.length;
    const max = s.trace.values.reduce((a, b) => Math.max(a, Math.abs(b)), 0) || 1;
    const dur = s.trace.t1Ns - s.trace.t0Ns;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const t = s.trace.t0Ns + (i / Math.max(1, n - 1)) * dur;
      const px = x(t);
      if (px < -10 || px > width + 10) {
        continue;
      }
      const v = s.trace.values[i] / max;
      pts.push(`${px.toFixed(1)},${(lane.y + lane.h / 2 - (v * lane.h) / 2.2).toFixed(1)}`);
    }
    return pts.join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.trace, width, view, lanes]);

  const ghostPath = useMemo(() => {
    if (!s.ghost || width === 0 || !s.result) {
      return [] as string[];
    }
    const lane = lanes.rows.find(r => r.key === 'trace');
    if (!lane) {
      return [];
    }
    const cad = s.result.cadenceHz && s.result.cadenceHz > 0 ? s.result.cadenceHz : 0.8;
    const cycleNs = 1e9 / cad;
    const max = s.ghost.reduce((a, b) => Math.max(a, Math.abs(b)), 0) || 1;
    return onMarks.map(m => {
      const pts: string[] = [];
      s.ghost!.forEach((v, i) => {
        const t = m.tNs - cycleNs / 2 + (i / (s.ghost!.length - 1)) * cycleNs;
        pts.push(`${x(t).toFixed(1)},${(lane.y + lane.h / 2 - ((v / max) * lane.h) / 2.2).toFixed(1)}`);
      });
      return pts.join(' ');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.ghost, onMarks, width, view, lanes, s.result]);

  const secondsTicks = useMemo(() => {
    if (width === 0) {
      return [] as number[];
    }
    const stepSec = visNs / 1e9 > 40 ? 10 : visNs / 1e9 > 12 ? 5 : visNs / 1e9 > 4 ? 1 : 0.5;
    const first = Math.ceil((view.startNs - s.t0Ns) / 1e9 / stepSec) * stepSec;
    const out: number[] = [];
    for (let sec = first; sec * 1e9 + s.t0Ns <= view.startNs + visNs; sec += stepSec) {
      out.push(sec);
    }
    return out;
  }, [width, view, visNs, s.t0Ns]);

  const explain: RangeExplanation | null = s.explain;
  const playX = x(s.playhead);

  return (
    <GestureDetector gesture={gesture}>
      <View testID="studio-timeline" style={styles.wrap} onLayout={onLayout}>
        {width > 0 ? (
          <Svg width={width} height={lanes.height + 14}>
            {lanes.rows.map(r => (
              <Rect key={r.key} x={0} y={r.y} width={width} height={r.h} fill={r.key === 'trace' ? STUDIO_COLORS.lane : STUDIO_COLORS.laneAlt} rx={3} />
            ))}
            {/* set band */}
            {lanes.rows.map(r => (
              <Rect key={`band-${r.key}`} x={x(s.bounds.startNs)} y={r.y} width={Math.max(2, x(s.bounds.endNs) - x(s.bounds.startNs))} height={r.h} fill="rgba(0,229,204,0.08)" />
            ))}
            {/* filmstrip */}
            {lanes.rows.filter(r => r.key === 'filmstrip').map(r =>
              frameThumbs && view.zoom < 8 ? (
                <G key="film">
                  {filmSlots(view.startNs, visNs, width, s.t0Ns, frameThumbs.perSecond).map(slot => (
                    <Rect key={slot.i} x={slot.x} y={r.y + 2} width={slot.w - 1} height={r.h - 4} fill="#1C232B" />
                  ))}
                </G>
              ) : (
                <SvgText key="film-empty" x={6} y={r.y + r.h / 2 + 4} fontSize={10} fill={colors.textTertiary}>
                  {s.clip ? (view.zoom >= 8 ? 'frames' : 'filmstrip') : 'no video'}
                </SvgText>
              ),
            )}
            {/* trace + ghost */}
            {ghostPath.map((d, i) => (d ? <Polyline key={`g${i}`} points={d} fill="none" stroke={STUDIO_COLORS.ghost} strokeWidth={1.5} /> : null))}
            {tracePoints ? <Polyline points={tracePoints} fill="none" stroke={STUDIO_COLORS.trace} strokeWidth={1.5} /> : null}
            {/* gate */}
            {lanes.rows.filter(r => r.key === 'gate').map(r => (
              <G key="gate">
                {explain
                  ? gateSpans(explain).map((g, i) => <Rect key={i} x={x(g.t0)} y={r.y} width={Math.max(1, x(g.t1) - x(g.t0))} height={r.h} fill={g.state === 'ACTIVE' ? 'rgba(88,166,255,0.55)' : g.state === 'CLOSING' ? 'rgba(88,166,255,0.3)' : 'rgba(88,166,255,0.12)'} />)
                  : <Rect x={x(s.bounds.startNs)} y={r.y} width={Math.max(1, x(s.bounds.endNs) - x(s.bounds.startNs))} height={r.h} fill="rgba(88,166,255,0.45)" />}
                {explain?.gaps.map((g, i) => <Rect key={`gap${i}`} x={x(g.t0Ns)} y={r.y} width={Math.max(2, x(g.t1Ns) - x(g.t0Ns))} height={r.h} fill={STUDIO_COLORS.warning} />)}
              </G>
            ))}
            {/* reps */}
            {lanes.rows.filter(r => r.key === 'reps').map(r => (
              <G key="reps" y={r.y}>
                {explain?.rejected.map((p, i) => <MarkGlyph key={`rj${i}`} x={x(p.tNs)} h={r.h} n="⊘" state="rejected" />)}
                {s.marks.map(m => (
                  <MarkGlyph key={m.id} x={x(m.tNs)} h={r.h} n={m.on ? onMarks.indexOf(m) + 1 : '–'} state={m.on ? 'on' : 'off'} selected={s.selectedMark === m.id} />
                ))}
              </G>
            ))}
            {/* glance */}
            {lanes.rows.filter(r => r.key === 'glance').map(r => (
              <G key="glance" y={r.y}>
                {s.pins.map(p => (p.ptsUs != null && s.clip ? <PinGlyph key={p.id} x={x(s.clip.sync.pts0HostNs + p.ptsUs * 1000 * s.clip.sync.rate)} y={-2} active /> : null))}
                {explain?.peaks.map((p, i) => <Circle key={`pk${i}`} cx={x(p.tNs)} cy={r.h / 2} r={2} fill={STUDIO_COLORS.trace} />)}
              </G>
            ))}
            {/* sync */}
            {lanes.rows.filter(r => r.key === 'sync').map(r => (
              <G key="sync" y={r.y}>
                <SvgText x={4} y={r.h - 3} fontSize={9} fill={STUDIO_COLORS.sync}>sync {s.syncClass}</SvgText>
              </G>
            ))}
            {/* bounds */}
            <BoundHandle x={x(s.bounds.startNs)} h={lanes.height} side="start" active={s.mode === 'bounds'} />
            <BoundHandle x={x(s.bounds.endNs)} h={lanes.height} side="end" active={s.mode === 'bounds'} />
            {/* seconds ruler */}
            {secondsTicks.map(sec => (
              <G key={sec}>
                <Line x1={x(s.t0Ns + sec * 1e9)} y1={lanes.height} x2={x(s.t0Ns + sec * 1e9)} y2={lanes.height + 4} stroke={colors.textTertiary} />
                <SvgText x={x(s.t0Ns + sec * 1e9) + 2} y={lanes.height + 12} fontSize={9} fill={colors.textTertiary}>{sec}s</SvgText>
              </G>
            ))}
            {/* playhead */}
            <Line x1={playX} y1={0} x2={playX} y2={lanes.height} stroke={colors.textPrimary} strokeWidth={1.5} />
            <Rect x={playX - 5} y={lanes.height} width={10} height={6} fill={colors.textPrimary} />
          </Svg>
        ) : null}
        {frameThumbs && view.zoom < 8 && width > 0 ? (
          <View pointerEvents="none" style={[styles.film, {height: LANE_H.filmstrip - 4}]}>
            {filmSlots(view.startNs, visNs, width, s.t0Ns, frameThumbs.perSecond).map(slot => (
              <View key={slot.i} style={{position: 'absolute', left: slot.x, width: slot.w - 1, height: LANE_H.filmstrip - 4, overflow: 'hidden'}}>
                <Image
                  source={{uri: frameThumbs.uri}}
                  style={{
                    position: 'absolute',
                    left: -(Math.min(slot.i, frameThumbs.count - 1) % frameThumbs.cols) * frameThumbs.w * ((LANE_H.filmstrip - 4) / frameThumbs.h),
                    top: -Math.floor(Math.min(slot.i, frameThumbs.count - 1) / frameThumbs.cols) * (LANE_H.filmstrip - 4),
                    width: frameThumbs.w * frameThumbs.cols * ((LANE_H.filmstrip - 4) / frameThumbs.h),
                    height: (LANE_H.filmstrip - 4) * Math.ceil(frameThumbs.count / frameThumbs.cols),
                  }}
                />
              </View>
            ))}
          </View>
        ) : null}
        <Text testID="studio-zoom" style={styles.zoom}>{view.zoom.toFixed(1)}×</Text>
      </View>
    </GestureDetector>
  );
}

function nearestMark(marks: StudioMark[], tNs: number, radiusNs: number): StudioMark | null {
  let best: StudioMark | null = null;
  for (const m of marks) {
    const d = Math.abs(m.tNs - tNs);
    if (d <= radiusNs && (!best || d < Math.abs(best.tNs - tNs))) {
      best = m;
    }
  }
  return best;
}

function gateSpans(e: RangeExplanation): {t0: number; t1: number; state: string}[] {
  const out: {t0: number; t1: number; state: string}[] = [];
  for (let i = 0; i < e.ticks.length; i++) {
    const t = e.ticks[i];
    const t1 = i + 1 < e.ticks.length ? e.ticks[i + 1].tNs : t.tNs + 400e6;
    const last = out[out.length - 1];
    if (last && last.state === t.gateState) {
      last.t1 = t1;
    } else if (t.gateState !== 'IDLE' && t.gateState !== 'CLOSED') {
      out.push({t0: t.tNs, t1, state: t.gateState});
    }
  }
  return out;
}

/** One thumbnail slot per second of the visible window (at ≤ 8×). */
function filmSlots(startNs: number, visNs: number, width: number, t0Ns: number, perSecond: number): {i: number; x: number; w: number}[] {
  const out: {i: number; x: number; w: number}[] = [];
  const secW = (1e9 / visNs) * width;
  const first = Math.floor((startNs - t0Ns) / 1e9);
  const last = Math.ceil((startNs + visNs - t0Ns) / 1e9);
  for (let sec = Math.max(0, first); sec <= last; sec++) {
    const i = Math.floor(sec * perSecond);
    out.push({i, x: ((t0Ns + sec * 1e9 - startNs) / visNs) * width, w: secW});
  }
  return out;
}

const styles = StyleSheet.create({
  wrap: {backgroundColor: '#080A0D', borderRadius: 10, paddingVertical: 4, overflow: 'hidden'},
  film: {position: 'absolute', left: 0, right: 0, top: 6},
  zoom: {position: 'absolute', right: 6, top: 4, color: colors.textTertiary, fontSize: 9},
});
