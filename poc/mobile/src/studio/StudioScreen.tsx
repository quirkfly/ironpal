import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, ImageBackground, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Video, {type OnProgressData, type VideoRef} from 'react-native-video';
import {colors, radii, spacing} from '../components/theme';
import type {DebriefAnswers} from '../controller/useDebrief';
import {BACKDROP, HUD} from '../game/assets';
import {clipDir, pinClip} from '../model/clips';
import {exportSessionLabels} from '../model/exportLabels';
import {ClipModule} from '../native/ClipModule';
import {hostNsForPts, localFps, repWindowNs, seekTargetSec} from '../model/timeline';
import type {LevelState} from '../types/model';
import {ExerciseSheet} from './ExerciseSheet';
import {Icon, STUDIO_COLORS} from './glyphs';
import {DockCells, LabelSheet, type DockCell} from './LabelDock';
import type {StudioMode, StudioOpen} from './nav';
import {Timeline} from './Timeline';
import {RATES, Transport} from './Transport';
import {useStudio} from './useStudio';

// The Studio / After Action set view (studio design §7.1): viewer · timeline · transport · mode
// bar · label dock · save bar. Portrait only. Everything the user repeats sits in the thumb zone.

interface Props {
  open: StudioOpen;
  names: Record<string, string>;
  levels: Record<string, LevelState>;
  /** Back with the current answers (the Debrief re-uses them when the round was still open). */
  onBack: (answers: DebriefAnswers | null) => void;
  /** Neighbour sets in the session, when opened from the Reel. */
  neighbours?: {prev: string | null; next: string | null};
  onOpenSet?: (labeledSetId: string) => void;
}

interface Thumbs {
  uri: string;
  count: number;
  perSecond: number;
  w: number;
  h: number;
  cols: number;
}

const MODES: {key: StudioMode; label: string}[] = [
  {key: 'review', label: 'Review'},
  {key: 'marks', label: 'Marks'},
  {key: 'bounds', label: 'Bounds'},
  {key: 'pins', label: 'Pins'},
];

export function StudioScreen({open, names, levels, onBack, neighbours, onOpenSet}: Props) {
  const st = useStudio(open, {names});
  const {s} = st;
  const video = useRef<VideoRef>(null);
  const [playing, setPlaying] = useState(false);
  const [rateIdx, setRateIdx] = useState(2);
  const [loop, setLoop] = useState(false);
  const [dock, setDock] = useState<DockCell | null>(open.focus === 'exercise' ? 'exercise' : open.focus === 'weight' ? 'weight' : null);
  const [sheet, setSheet] = useState<'none' | 'gestures' | 'menu'>('none');
  const [thumbs, setThumbs] = useState<Thumbs | null>(null);
  const [pinRole, setPinRole] = useState<'glance' | 'rep_top' | 'rep_bottom'>('glance');
  const [pinCentreCrop, setPinCentreCrop] = useState(true);
  const seekBusy = useRef(false);
  const seekPending = useRef<number | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const clip = s.clip;
  const videoPath = clip ? clip.proxyPath ?? clip.masterPath : null;
  const videoUri = videoPath && clip && clip.state !== 'reduced' && clip.state !== 'deleted' ? `file://${videoPath}` : null;

  // Thumbnail sprite index (a grid — ClipModule writes cols per row).
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!clip?.thumbsPath || !ClipModule.isAvailable()) {
        setThumbs(null);
        return;
      }
      try {
        const dir = await clipDir(clip.id);
        const idx = JSON.parse(await ClipModule.readTextFile(`${dir}/thumbs.json`)) as {frameW: number; frameH: number; count: number; stepUs: number; cols?: number};
        if (alive) {
          setThumbs({uri: `file://${clip.thumbsPath}`, count: idx.count, perSecond: 1e6 / Math.max(1, idx.stepUs), w: idx.frameW, h: idx.frameH, cols: idx.cols ?? idx.count});
        }
      } catch {
        if (alive) {
          setThumbs(null);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [clip]);

  // ---------------------------------------------------------------- seeking (coalesced)
  const doSeek = useCallback((sec: number) => {
    if (!video.current) {
      return;
    }
    if (seekBusy.current) {
      seekPending.current = sec;
      return;
    }
    seekBusy.current = true;
    video.current.seek(sec);
  }, []);

  const onSeekDone = useCallback(() => {
    seekBusy.current = false;
    const p = seekPending.current;
    seekPending.current = null;
    if (p != null) {
      doSeek(p);
    }
  }, [doSeek]);

  useEffect(() => {
    if (playing || !clip || st.frameIndex < 0 || !videoReady) {
      return;
    }
    doSeek(seekTargetSec(s.pts[st.frameIndex]));
  }, [st.frameIndex, playing, clip, s.pts, doSeek, videoReady]);

  const onProgress = useCallback(
    (e: OnProgressData) => {
      if (!clip || !playing) {
        return;
      }
      const t = hostNsForPts(clip.sync, e.currentTime * 1e6);
      if (loop) {
        const m = st.onMarks.find(x => Math.abs(x.tNs - s.playhead) < 1.5e9) ?? st.onMarks[0];
        if (m) {
          const w = repWindowNs(m.tNs, s.result?.cadenceHz ?? null);
          if (t > w.t1Ns || t < w.t0Ns - 0.5e9) {
            doSeek((w.t0Ns - clip.sync.pts0HostNs) / clip.sync.rate / 1e9);
            return;
          }
        }
      }
      if (t >= s.t1Ns) {
        setPlaying(false);
      }
      st.setPlayheadFromPlayer(Math.min(s.t1Ns, Math.max(s.t0Ns, t)));
    },
    [clip, playing, loop, st, s.playhead, s.result, s.t0Ns, s.t1Ns, doSeek],
  );

  // ---------------------------------------------------------------- derived labels
  const frameHud = useMemo(() => {
    const tSec = ((s.playhead - s.t0Ns) / 1e9).toFixed(2);
    if (!clip || st.frameIndex < 0) {
      return `t ${tSec} s · no video`;
    }
    const fps = s.pts.length > 1 ? localFps(s.pts, st.frameIndex).toFixed(1) : '—';
    return `t ${tSec} s · f ${st.frameIndex + 1} · ${fps} fps`;
  }, [s.playhead, s.t0Ns, clip, st.frameIndex, s.pts]);

  const repUnderPlayhead = useMemo(() => {
    let n = 0;
    for (const m of st.onMarks) {
      if (m.tNs <= s.playhead + 1e6) {
        n++;
      }
    }
    return n;
  }, [st.onMarks, s.playhead]);

  const gateNow = useMemo(() => {
    if (s.explain) {
      let state = 'IDLE';
      for (const t of s.explain.ticks) {
        if (t.tNs <= s.playhead) {
          state = t.gateState;
        } else {
          break;
        }
      }
      return state;
    }
    return s.playhead >= s.bounds.startNs && s.playhead <= s.bounds.endNs ? 'ACTIVE' : 'IDLE';
  }, [s.explain, s.playhead, s.bounds]);

  const onGlance = useMemo(() => s.pins.some(p => p.role === 'glance' && p.ptsUs != null && clip && Math.abs(hostNsForPts(clip.sync, p.ptsUs) - s.playhead) < 40e6), [s.pins, clip, s.playhead]);

  const exerciseName = s.answers.exerciseId ? names[s.answers.exerciseId] ?? s.answers.exerciseId : '';
  const confidence = s.result?.match && s.result.match.label === s.answers.exerciseId ? s.result.match.confidence : null;
  const currentLevel = (s.answers.exerciseId && levels[s.answers.exerciseId]) || 'locked';
  const levelBar = st.ctx ? {provisional: st.ctx.params.levels.provisional.integrity, certified: st.ctx.params.levels.certified.integrity} : {provisional: 0.8, certified: 0.9};
  const thisFrameUri = s.pins.find(p => p.role === 'glance')?.path ?? s.pins[0]?.path ?? null;

  const saveLine = useMemo(() => {
    const parts = [st.gateSummary];
    if (s.preview?.integrityIfAdded != null && s.answers.exerciseId) {
      const before = levels[s.answers.exerciseId] ? null : null;
      void before;
      parts.push(`integrity → ${Math.round(s.preview.integrityIfAdded * 100)}%`);
    }
    return parts.join(' · ');
  }, [st.gateSummary, s.preview, s.answers.exerciseId, levels]);

  // ---------------------------------------------------------------- actions
  const togglePlay = () => {
    if (!videoUri) {
      return;
    }
    setPlaying(p => !p);
  };
  const cycleRate = () => setRateIdx(i => (i + 1) % RATES.length);
  const onJog = (frames: number) => {
    const dir = frames > 0 ? 1 : -1;
    for (let i = 0; i < Math.min(8, Math.abs(frames)); i++) {
      st.stepFrame(dir);
    }
  };
  const onStepSet = (dir: 1 | -1) => {
    const id = dir > 0 ? neighbours?.next : neighbours?.prev;
    if (id && onOpenSet) {
      onOpenSet(id);
    }
  };
  const onPinTap = async () => {
    if (s.mode !== 'pins' || !clip) {
      return;
    }
    const w = clip.width ?? 1280;
    const h = clip.height ?? 720;
    const crop = pinCentreCrop ? {x: Math.round(w * 0.2), y: Math.round(h * 0.2), w: Math.round(w * 0.6), h: Math.round(h * 0.6)} : null;
    await st.pinCurrentFrame(pinRole, crop);
  };
  const exportLabels = async () => {
    if (!s.sessionId || !st.ctx) {
      return;
    }
    const json = await exportSessionLabels(s.sessionId, st.ctx.pkg);
    await Share.share({message: json, title: 'IronPal labels'});
  };

  if (s.loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text testID="studio-loading" style={styles.hint}>Opening After Action…</Text>
      </SafeAreaView>
    );
  }
  if (s.error || !s.result) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable testID="studio-back" onPress={() => onBack(null)} hitSlop={12}><Text style={styles.back}>‹ Back</Text></Pressable>
        <Text testID="studio-error" style={styles.warn}>{s.error ?? 'Nothing to show.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKDROP.debrief} style={styles.bg} imageStyle={styles.bgImg}>
        <View testID="studio-screen" style={styles.root}>
          {/* top bar */}
          <View style={styles.topBar}>
            <Pressable testID="studio-back" onPress={() => onBack(s.answers)} hitSlop={12}>
              <Text style={styles.back}>‹</Text>
            </Pressable>
            <Pressable testID="studio-exercise-chip" style={styles.chip} onPress={() => setDock(dock === 'exercise' ? null : 'exercise')}>
              <Text style={styles.chipText} numberOfLines={1}>{exerciseName || 'AFTER ACTION'}</Text>
            </Pressable>
            <Text testID="studio-sync" style={[styles.sync, s.syncClass === 'exact' || s.syncClass === 'accept' ? styles.syncOk : s.syncClass === 'none' ? styles.syncNone : styles.syncWarn]}>
              ◉ {s.syncClass === 'none' ? 'no sync' : `sync ${s.syncClass}`}
            </Text>
            <Pressable testID="studio-menu" onPress={() => setSheet('menu')} hitSlop={12}>
              <Text style={styles.back}>⋯</Text>
            </Pressable>
          </View>

          {/* viewer */}
          <Pressable testID="studio-viewer" style={styles.viewer} onPress={() => (s.mode === 'pins' ? void onPinTap() : togglePlay())} onLongPress={() => setSheet('gestures')}>
            {videoUri ? (
              // pointerEvents none: the Video surface otherwise swallows the viewer's tap and
              // long press, so play/pause and the gesture sheet never fired (e2e flow 07).
              // Every control is the transport or the timeline; the video itself is never touched.
              <Video
                pointerEvents="none"
                ref={video}
                source={{uri: videoUri}}
                style={styles.video}
                resizeMode="contain"
                paused={!playing}
                rate={RATES[rateIdx]}
                muted
                progressUpdateInterval={50}
                onProgress={onProgress}
                onSeek={onSeekDone}
                onLoad={() => setVideoReady(true)}
                onEnd={() => setPlaying(false)}
                onError={() => setVideoReady(false)}
              />
            ) : (
              <View style={styles.noVideo}>
                {thisFrameUri ? <Image source={{uri: `file://${thisFrameUri}`}} style={[styles.video, styles.dim]} /> : null}
                <Text style={styles.noVideoText}>{s.degraded ?? 'No video for this set.'}</Text>
              </View>
            )}
            <View pointerEvents="none" style={styles.overlayTL}>
              <Text testID="studio-rep-counter" style={styles.repCounter}>rep {repUnderPlayhead} / {st.onMarks.length}</Text>
              <Text testID="studio-gate-pill" style={[styles.gatePill, gateNow === 'ACTIVE' ? styles.gateOn : null]}>{gateNow}</Text>
            </View>
            <View pointerEvents="none" style={styles.overlayBL}>
              <Text testID="studio-frame" style={styles.frameHud}>{frameHud}</Text>
            </View>
            {onGlance ? <View pointerEvents="none" style={styles.crosshairWrap}><Image source={HUD.crosshairLocked} style={styles.crosshair} /></View> : null}
            {s.mode === 'pins' ? (
              <View pointerEvents="none" style={styles.overlayTR}>
                <Text style={styles.pinHint}>tap to pin · {pinRole.replace('_', ' ')}{pinCentreCrop ? ' · centre crop' : ''}</Text>
              </View>
            ) : null}
          </Pressable>
          {s.degraded && videoUri ? <Text testID="studio-degraded" style={styles.degraded}>{s.degraded}</Text> : null}
          {st.offset?.systematic ? (
            <Text testID="studio-offset-warning" style={styles.degraded}>
              Your marks are ~{Math.round(st.offset.medianOffsetMs)} ms {st.offset.medianOffsetMs > 0 ? 'after' : 'before'} the headband's — check sync or the convention (top of the rep).
            </Text>
          ) : null}

          {/* timeline */}
          <Timeline
            s={s}
            onMarks={st.onMarks}
            frameThumbs={thumbs}
            onScrub={(t, snap) => {
              setPlaying(false);
              st.seekHost(t, snap);
            }}
            onMarkPress={st.selectMark}
            onMarkMove={(id, t, fin) => void st.moveMark(id, t, fin)}
            onBoundDrag={(side, t) => st.setBound(side, t)}
            onAddMarkAt={t => void st.addMark(t)}
            onLongPress={() => setSheet('gestures')}
          />

          {/* transport */}
          <Transport
            playing={playing}
            rate={RATES[rateIdx]}
            loop={loop}
            canStepSet={{prev: !!neighbours?.prev, next: !!neighbours?.next}}
            onStepFrame={d => {
              setPlaying(false);
              st.stepFrame(d);
            }}
            onStepRep={d => {
              setPlaying(false);
              st.stepRep(d);
            }}
            onStepSet={onStepSet}
            onJog={f => {
              setPlaying(false);
              onJog(f);
            }}
            onTogglePlay={togglePlay}
            onCycleRate={cycleRate}
            onToggleLoop={() => setLoop(l => !l)}
            onShuttle={() => setPlaying(false)}
          />

          {/* mode bar */}
          <View style={styles.modeRow}>
            {MODES.map(m => (
              <Pressable testID={`studio-mode-${m.key}`} key={m.key} style={[styles.mode, s.mode === m.key && styles.modeOn]} onPress={() => st.setMode(m.key)}>
                <Text style={[styles.modeText, s.mode === m.key && styles.modeTextOn]}>{m.label}</Text>
              </Pressable>
            ))}
            {s.mode === 'marks' ? (
              <>
                <Pressable testID="studio-mark-add" style={styles.twin} onPress={() => void st.addMark()} hitSlop={6}><Icon kind="mark" size={16} /><Text style={styles.twinText}>+</Text></Pressable>
                <Pressable testID="studio-mark-delete" style={styles.twin} onPress={() => st.deleteMark()} hitSlop={6}><Icon kind="mark" size={16} /><Text style={styles.twinText}>−</Text></Pressable>
              </>
            ) : null}
            {s.mode === 'bounds' ? (
              <>
                <Pressable testID="studio-bound-start" style={styles.twin} onPress={() => st.setBound('start')} hitSlop={6}><Text style={styles.twinText}>[ start</Text></Pressable>
                <Pressable testID="studio-bound-end" style={styles.twin} onPress={() => st.setBound('end')} hitSlop={6}><Text style={styles.twinText}>end ]</Text></Pressable>
              </>
            ) : null}
            {s.mode === 'pins' ? (
              <>
                <Pressable testID="studio-pin-role" style={styles.twin} onPress={() => setPinRole(r => (r === 'glance' ? 'rep_top' : r === 'rep_top' ? 'rep_bottom' : 'glance'))} hitSlop={6}><Text style={styles.twinText}>{pinRole.replace('_', ' ')}</Text></Pressable>
                <Pressable testID="studio-pin-crop" style={styles.twin} onPress={() => setPinCentreCrop(c => !c)} hitSlop={6}><Text style={styles.twinText}>{pinCentreCrop ? 'crop' : 'full'}</Text></Pressable>
                <Pressable testID="studio-pin" style={styles.twin} onPress={() => void onPinTap()} hitSlop={6}><Icon kind="pin" size={16} /></Pressable>
              </>
            ) : null}
          </View>
          <Text testID="studio-marks-caption" style={styles.caption}>
            {st.onMarks.length} of {s.marks.length} marks on · {s.marks.filter(m => m.source === 'user').length} placed by you · {s.pins.length} pins
          </Text>

          {/* dock */}
          <ScrollView style={styles.dockScroll} keyboardShouldPersistTaps="handled">
            <DockCells
              answers={s.answers}
              exerciseName={exerciseName}
              confidence={confidence}
              marksOn={st.onMarks.length}
              marksVsCount={st.marksVsCount}
              repsDetected={s.result.repsDetected}
              repSignal={st.repSignal}
              pins={s.pins}
              preview={s.preview}
              open={dock === 'exercise' ? null : dock}
              onOpen={setDock}
              onChange={st.setAnswers}
              onUseMarksCount={st.useMarksCount}
              onAddMarkHint={() => {
                setDock(null);
                st.setMode('marks');
              }}
            />
            <View style={{height: spacing.sm}} />
          </ScrollView>

          {/* Save bar: fixed, never scrolled to. The outcome sits above it — it answers the tap
              the user just made, and inside the scroll view the press was lost to momentum. */}
          {s.outcome ? <Text testID="studio-outcome" style={styles.outcome}>{s.outcome}</Text> : null}
          <Pressable testID="studio-save" style={[styles.save, (s.busy || !s.answers.exerciseId) && styles.disabled]} disabled={s.busy || !s.answers.exerciseId} onPress={() => void st.save()}>
            <Text style={styles.saveText}>{s.busy ? 'SAVING…' : s.labeledSetId ? 'SAVE CHANGES' : 'SAVE'}</Text>
            <Text style={styles.saveSub}>{saveLine}</Text>
          </Pressable>
        </View>
      </ImageBackground>

      {/* reps / weight sheets — over the viewer, not squeezed into the dock (design §7.1) */}
      <Modal visible={dock === 'reps' || dock === 'weight'} animationType="slide" transparent onRequestClose={() => setDock(null)}>
        <Pressable style={styles.sheetDim} onPress={() => setDock(null)}>
          <Pressable style={styles.sheetHolder} onPress={() => undefined}>
            <LabelSheet
              answers={s.answers}
              exerciseName={exerciseName}
              confidence={confidence}
              marksOn={st.onMarks.length}
              marksVsCount={st.marksVsCount}
              repsDetected={s.result.repsDetected}
              repSignal={st.repSignal}
              pins={s.pins}
              preview={s.preview}
              open={dock}
              onOpen={setDock}
              onChange={st.setAnswers}
              onUseMarksCount={st.useMarksCount}
              onAddMarkHint={() => {
                setDock(null);
                st.setMode('marks');
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* exercise sheet */}
      <Modal visible={dock === 'exercise'} animationType="slide" transparent onRequestClose={() => setDock(null)}>
        <View style={styles.modalWrap}>
          <ExerciseSheet
            pkg={st.ctx!.pkg}
            result={s.result}
            value={s.answers.exerciseId}
            names={names}
            levels={levels}
            preview={s.preview}
            levelBar={levelBar}
            currentLevel={currentLevel}
            thisSetFrameUri={thisFrameUri ? `file://${thisFrameUri}` : null}
            onChange={id => st.setAnswers(a => ({...a, exerciseId: id}))}
            onClose={() => setDock(null)}
          />
        </View>
      </Modal>

      {/* gesture cheat sheet + menu */}
      <Modal visible={sheet !== 'none'} animationType="fade" transparent onRequestClose={() => setSheet('none')}>
        <Pressable style={styles.modalDim} onPress={() => setSheet('none')}>
          <View style={styles.sheetBox}>
            {/* An explicit close: dismissing by tapping the dim area is easy to miss, and a
                coordinate tap can land on whatever is underneath. */}
            <Pressable testID="studio-sheet-close" style={styles.sheetClose} onPress={() => setSheet('none')} hitSlop={10}>
              <Text style={styles.sheetCloseText}>Close</Text>
            </Pressable>
            {sheet === 'gestures' ? (
              <>
                <Text style={styles.sheetTitle}>CONTROLS</Text>
                <Text testID="studio-gesture-sheet" style={styles.sheetText}>
                  {'NAVIGATE  tap video: play/pause · double-tap L/R: ◀ rep / rep ▶ · drag trace: scrub\n' +
                    '          pinch: zoom · two-finger drag: pan · wheel: frames (1 detent = 1 frame)\n' +
                    '          hold ◀/▶: shuttle 0.25× · loop: repeat this rep\n' +
                    'MARKS     two-finger tap: add at playhead · drag: move (snaps to peak) · − : delete\n' +
                    'BOUNDS    drag [ ]: trim (snaps to gate / marks)\n' +
                    'PINS      tap video: pin this frame · crop: centre 60 % · "read this frame": one still, deleted\n' +
                    'SAVE      gates and integrity impact are shown before you commit'}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.sheetTitle}>LANES</Text>
                <View style={styles.laneRow}>
                  {(Object.keys(s.lanes) as (keyof typeof s.lanes)[]).map(k => (
                    <Pressable testID={`studio-lane-${k}`} key={k} style={[styles.laneChip, s.lanes[k] && styles.laneChipOn]} onPress={() => st.toggleLane(k)}>
                      <Text style={[styles.laneText, s.lanes[k] && styles.laneTextOn]}>{k}</Text>
                    </Pressable>
                  ))}
                </View>
                {clip ? (
                  <Pressable testID="studio-pin-clip" style={styles.menuItem} onPress={() => void pinClip(clip.id, clip.state !== 'pinned').then(() => setSheet('none'))}>
                    <Text style={styles.menuText}>{clip.state === 'pinned' ? 'Unpin clip (7-day reduction resumes)' : 'Pin clip (keep the video)'}</Text>
                  </Pressable>
                ) : null}
                <Pressable testID="studio-export" style={styles.menuItem} onPress={() => void exportLabels()}>
                  <Text style={styles.menuText}>Export this session's labels</Text>
                </Pressable>
                {/* A button twin for the long-press cheat sheet (§7.5 / FR-A1): a gesture the user
                    has not discovered — or cannot perform — must never be the only way in. */}
                <Pressable testID="studio-controls" style={styles.menuItem} onPress={() => setSheet('gestures')}>
                  <Text style={styles.menuText}>Controls &amp; gestures</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  bg: {flex: 1},
  bgImg: {opacity: 0.22, resizeMode: 'cover'},
  root: {flex: 1, paddingHorizontal: spacing.sm, gap: 4},
  topBar: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 2},
  back: {color: colors.accent, fontSize: 24, width: 24, textAlign: 'center'},
  chip: {flex: 1, backgroundColor: '#161B22', borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: 4},
  chipText: {color: colors.textPrimary, fontSize: 13, fontWeight: '800', letterSpacing: 1},
  sync: {fontSize: 11, fontWeight: '700'},
  syncOk: {color: colors.confHigh},
  syncWarn: {color: STUDIO_COLORS.warning},
  syncNone: {color: colors.textTertiary},
  viewer: {aspectRatio: 16 / 9, maxHeight: 220, flexShrink: 1, backgroundColor: '#000', borderRadius: radii.md, overflow: 'hidden', justifyContent: 'center'},
  video: {width: '100%', height: '100%'},
  dim: {opacity: 0.35, position: 'absolute'},
  noVideo: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md},
  noVideoText: {color: colors.textSecondary, fontSize: 13, textAlign: 'center'},
  overlayTL: {position: 'absolute', top: 6, left: 8, gap: 2},
  overlayTR: {position: 'absolute', top: 6, right: 8},
  overlayBL: {position: 'absolute', bottom: 6, left: 8},
  repCounter: {color: colors.textPrimary, fontSize: 13, fontWeight: '800', textShadowColor: '#000', textShadowRadius: 4},
  gatePill: {color: colors.textSecondary, fontSize: 10, letterSpacing: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, borderRadius: 6, alignSelf: 'flex-start', overflow: 'hidden'},
  gateOn: {color: '#0B0E12', backgroundColor: colors.accent},
  frameHud: {color: colors.textPrimary, fontSize: 11, fontVariant: ['tabular-nums'], backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden'},
  crosshairWrap: {position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center'},
  crosshair: {width: 72, height: 72, resizeMode: 'contain', opacity: 0.9},
  pinHint: {color: STUDIO_COLORS.glance, fontSize: 11, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden'},
  degraded: {color: STUDIO_COLORS.glance, fontSize: 11, paddingHorizontal: 4},
  modeRow: {flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap'},
  mode: {paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.md, backgroundColor: '#161B22'},
  modeOn: {backgroundColor: colors.accent},
  modeText: {color: colors.textSecondary, fontSize: 12, fontWeight: '700'},
  modeTextOn: {color: '#0B0E12'},
  twin: {flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 6, borderRadius: radii.md, backgroundColor: '#21262D'},
  twinText: {color: colors.textPrimary, fontSize: 12, fontWeight: '800'},
  caption: {color: colors.textTertiary, fontSize: 10, paddingHorizontal: 4},
  dockScroll: {flexGrow: 0, flexShrink: 1},
  save: {backgroundColor: colors.accent, borderRadius: radii.lg, padding: spacing.md, alignItems: 'center', marginBottom: spacing.xs},
  saveText: {color: '#0B0E12', fontSize: 15, fontWeight: '900', letterSpacing: 1},
  saveSub: {color: '#0B0E12', fontSize: 11, opacity: 0.75},
  disabled: {opacity: 0.4},
  outcome: {color: colors.accent, fontSize: 13, textAlign: 'center', marginTop: spacing.sm, marginBottom: 2},
  hint: {color: colors.textSecondary, fontSize: 14, padding: spacing.lg},
  warn: {color: STUDIO_COLORS.warning, fontSize: 14, padding: spacing.lg},
  modalWrap: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 80},
  sheetDim: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)'},
  sheetHolder: {width: '100%'},
  modalDim: {flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: spacing.lg},
  sheetBox: {backgroundColor: '#161B22', borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm},
  sheetClose: {alignSelf: 'flex-end', paddingHorizontal: spacing.sm, paddingVertical: 2},
  sheetCloseText: {color: colors.accent, fontSize: 14, fontWeight: '700'},
  sheetTitle: {color: colors.textPrimary, fontSize: 13, fontWeight: '900', letterSpacing: 2},
  sheetText: {color: colors.textSecondary, fontSize: 11, fontFamily: 'monospace', lineHeight: 16},
  laneRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  laneChip: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.full, backgroundColor: '#0B0E12'},
  laneChipOn: {backgroundColor: colors.accent},
  laneText: {color: colors.textSecondary, fontSize: 12},
  laneTextOn: {color: '#0B0E12', fontWeight: '700'},
  menuItem: {paddingVertical: spacing.sm},
  menuText: {color: colors.accent, fontSize: 14},
});
