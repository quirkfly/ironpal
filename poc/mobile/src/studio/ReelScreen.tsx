import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ImageBackground, Pressable, ScrollView, Share, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Polyline, Rect, Text as SvgText} from 'react-native-svg';
import {colors, radii, spacing} from '../components/theme';
import {answersToConfirmed, evaluateGates} from '../controller/useDebrief';
import {BACKDROP} from '../game/assets';
import {exportSessionLabels} from '../model/exportLabels';
import {commit, deleteSet, dismissRegion, merge, relabel, split, tagRegion, type CommitInput} from '../model/learner';
import {compose} from '../model/params';
import {campaignOf, ensureBundled, repSignalOf} from '../model/packageManager';
import {DISMISS_REASONS, enqueueRegions} from '../model/queue';
import * as store from '../model/store';
import {propagateCandidates, subtractSets} from '../model/timeline';
import {SignalStudio} from '../native/SignalModule';
import type {ClipRow, ModelPackage, RegionRow, SetResult} from '../types/model';
import {STUDIO_COLORS} from './glyphs';
import type {StudioOpen} from './nav';

// The Reel — session view (studio design §7.8): every set of a session on one strip, untagged
// periodic regions as "?", split / merge / propagate, sync badges, export.

interface Props {
  names: Record<string, string>;
  initialSessionId?: string | null;
  initialExerciseId?: string | null;
  onBack: () => void;
  onOpenStudio: (open: StudioOpen, neighbours: {prev: string | null; next: string | null}) => void;
}

const STRIP_H = 96;

export function ReelScreen({names, initialSessionId, initialExerciseId, onBack, onOpenStudio}: Props) {
  const [sessions, setSessions] = useState<store.SessionRow[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [sets, setSets] = useState<store.LabeledSetRow[]>([]);
  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [clips, setClips] = useState<ClipRow[]>([]);
  const [trace, setTrace] = useState<{t0Ns: number; t1Ns: number; values: number[]} | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [selected2, setSelected2] = useState<string | null>(null);
  const [splitFrac, setSplitFrac] = useState(0.5);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [pkg, setPkg] = useState<ModelPackage | null>(null);

  useEffect(() => {
    (async () => {
      const p = await ensureBundled();
      setPkg(p);
      const ss = await store.sessions();
      setSessions(ss);
      if (!sessionId) {
        if (initialExerciseId) {
          const recent = (await store.recentLabeledSets(200)).find(r => r.exerciseId === initialExerciseId);
          setSessionId(recent?.sessionId ?? ss[0]?.id ?? null);
        } else {
          setSessionId(ss[0]?.id ?? null);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    const rows = await store.labeledSetsForSession(sessionId);
    setSets(rows);
    setClips(await store.clipsForSession(sessionId));
    let regs = await store.regionsForSession(sessionId);
    // Scan the recorder for periodic windows nobody tagged (design §7.8).
    if (SignalStudio.isAvailable()) {
      try {
        const info = await SignalStudio.recorderInfo(sessionId);
        if (info.loaded && info.samples > 0) {
          const scanned = await SignalStudio.scanRegions(sessionId);
          const covered = rows.filter(r => r.tStartHostNs != null && r.tEndHostNs != null).map(r => ({t0Ns: r.tStartHostNs!, t1Ns: r.tEndHostNs!}));
          const open = subtractSets(scanned, covered);
          const fresh: RegionRow[] = [];
          for (const g of open) {
            const known = regs.find(r => Math.abs(r.t0Ns - g.t0Ns) < 2e9 && Math.abs(r.t1Ns - g.t1Ns) < 2e9);
            if (known) {
              continue;
            }
            const row: RegionRow = {id: `reg_${sessionId}_${Math.round(g.t0Ns / 1e6)}`, sessionId, t0Ns: g.t0Ns, t1Ns: g.t1Ns, cycles: g.cycles, state: 'open', reason: null, labeledSetId: null, updatedAt: Date.now()};
            await store.upsertRegion(row);
            fresh.push(row);
          }
          if (fresh.length) {
            await enqueueRegions(sessionId, fresh).catch(() => undefined);
            regs = await store.regionsForSession(sessionId);
          }
          const ex = await SignalStudio.explainRange(sessionId, info.t0Ns, info.t1Ns).catch(() => null);
          setTrace(ex?.trace ?? null);
        } else {
          setTrace(null);
        }
      } catch {
        setTrace(null);
      }
    }
    setRegions(regs);
  }, [sessionId]);
  useEffect(() => {
    void load();
  }, [load]);

  // The strip spans the session's first set/region to its last.
  const span = useMemo(() => {
    const t0s = [...sets.map(r => r.tStartHostNs ?? Infinity), ...regions.map(r => r.t0Ns), trace?.t0Ns ?? Infinity].filter(Number.isFinite);
    const t1s = [...sets.map(r => r.tEndHostNs ?? -Infinity), ...regions.map(r => r.t1Ns), trace?.t1Ns ?? -Infinity].filter(Number.isFinite);
    const t0 = t0s.length ? Math.min(...t0s) : 0;
    const t1 = t1s.length ? Math.max(...t1s) : t0 + 1e9;
    return {t0, t1: Math.max(t1, t0 + 1e9)};
  }, [sets, regions, trace]);
  const x = (t: number) => ((t - span.t0) / (span.t1 - span.t0)) * width;

  const sel = sets.find(r => r.id === selected) ?? null;
  const sel2 = sets.find(r => r.id === selected2) ?? null;
  const adjacent = sel && sel2 ? Math.abs(sets.indexOf(sel) - sets.indexOf(sel2)) === 1 : false;

  const openSet = (id: string, focus?: StudioOpen extends {focus?: infer F} ? F : never) => {
    const i = sets.findIndex(r => r.id === id);
    onOpenStudio({kind: 'set', labeledSetId: id, focus}, {prev: sets[i - 1]?.id ?? null, next: sets[i + 1]?.id ?? null});
  };

  const ctxFor = async (row: store.LabeledSetRow) => {
    const p = pkg ?? (await ensureBundled());
    const sess = await store.session(row.sessionId);
    return {pkg: p, params: compose(p.params, await store.fittedParams()), sessionId: row.sessionId, gymId: sess?.gymId ?? null, rotation: null, calibrated: row.gates.rig !== false, clipId: row.clipId ?? null};
  };

  const inputFor = async (row: store.LabeledSetRow, result: SetResult, exerciseId: string): Promise<CommitInput> => {
    const ctx = await ctxFor(row);
    const answers = {exerciseId, repsConfirmed: row.repsConfirmed, weight: row.weightDeclared, weightUnit: row.weightUnit ?? 'kg', weightState: row.weightState as 'confirmed' | 'unreadable' | 'unsure', repTopsSec: result.reps.map(r => r.tPeakSec)};
    const rs = repSignalOf(ctx.pkg, exerciseId) ?? 'vision';
    return {result, confirmed: {...answersToConfirmed(result, answers, ctx, 'studio')}, repSignal: rs, campaign: campaignOf(ctx.pkg, exerciseId), gates: evaluateGates(result, answers, rs, ctx.calibrated), packageParams: ctx.pkg.params, canonicalRotation: null};
  };

  const doTagRegion = async (g: RegionRow) => {
    setBusy(g.id);
    try {
      const result = await tagRegion(g.id, null);
      const row = sets[0];
      const p = pkg ?? (await ensureBundled());
      const sess = await store.session(g.sessionId);
      const ctx = {pkg: p, params: compose(p.params, await store.fittedParams()), sessionId: g.sessionId, gymId: sess?.gymId ?? null, rotation: null, calibrated: row ? row.gates.rig !== false : true, clipId: null};
      const proposed = result.match?.label && result.match.label !== 'unknown' ? result.match.label : result.match?.candidates[0]?.exerciseId ?? '';
      onOpenStudio({kind: 'draft', draft: {result, clipId: null, ctx, regionId: g.id, answers: {exerciseId: proposed, repsConfirmed: result.repsDetected, weight: null, weightUnit: 'kg', weightState: 'confirmed', repTopsSec: result.reps.map(r => r.tPeakSec)}}, focus: 'exercise'}, {prev: null, next: null});
    } catch (e) {
      setLine(`Could not analyse the region: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const doSplit = async () => {
    if (!sel || sel.tStartHostNs == null || sel.tEndHostNs == null) {
      return;
    }
    setBusy(sel.id);
    try {
      const tSplit = sel.tStartHostNs + (sel.tEndHostNs - sel.tStartHostNs) * splitFrac;
      const {a, b} = await split(sel.id, tSplit);
      const original = sel;
      // Both halves keep the original label; the user relabels either in the Studio.
      for (const r of [a, b]) {
        const input = await inputFor(original, r, original.exerciseId);
        await commit({...input, confirmed: {...input.confirmed, setId: r.setId}});
      }
      await deleteSet(original.id);
      await store.audit(original.exerciseId, {event: 'split', from: original.id, to: [a.setId, b.setId]}, null);
      setLine(`Split into two sets at ${((tSplit - sel.tStartHostNs) / 1e9).toFixed(1)} s.`);
      setSelected(null);
      await load();
    } catch (e) {
      setLine(`Split failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const doMerge = async () => {
    if (!sel || !sel2 || !adjacent) {
      return;
    }
    setBusy(sel.id);
    try {
      const first = sets.indexOf(sel) < sets.indexOf(sel2) ? sel : sel2;
      const second = first === sel ? sel2 : sel;
      const result = await merge(first.id, second.id);
      const input = await inputFor(first, result, first.exerciseId);
      await commit({...input, confirmed: {...input.confirmed, setId: result.setId}});
      await deleteSet(first.id);
      await deleteSet(second.id);
      await store.audit(first.exerciseId, {event: 'merge', from: [first.id, second.id], to: result.setId}, null);
      setLine('Merged into one set.');
      setSelected(null);
      setSelected2(null);
      await load();
    } catch (e) {
      setLine(`Merge failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const propagate = useMemo(() => {
    if (!sel || !pkg) {
      return [] as string[];
    }
    const following = sets.slice(sets.indexOf(sel) + 1);
    const tHigh = compose(pkg.params, []).engine.t_imu_high;
    return propagateCandidates(sel.exerciseId, following, tHigh).filter(id => sets.find(r => r.id === id)?.exerciseId !== sel.exerciseId);
  }, [sel, sets, pkg]);

  const doPropagate = async () => {
    if (!sel || !propagate.length) {
      return;
    }
    setBusy(sel.id);
    try {
      let n = 0;
      for (const id of propagate) {
        const row = sets.find(r => r.id === id);
        if (!row?.resultJson) {
          continue;
        }
        const result = JSON.parse(row.resultJson) as SetResult;
        await relabel(row.id, await inputFor(row, result, sel.exerciseId));
        n++;
      }
      setLine(`${names[sel.exerciseId] ?? sel.exerciseId} applied to ${n} following set${n === 1 ? '' : 's'}.`);
      await load();
    } catch (e) {
      setLine(`Propagate failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const doExport = async () => {
    if (!sessionId) {
      return;
    }
    const p = pkg ?? (await ensureBundled());
    await Share.share({message: await exportSessionLabels(sessionId, p), title: 'IronPal labels'});
  };

  const tracePoints = useMemo(() => {
    if (!trace || width === 0) {
      return '';
    }
    const n = trace.values.length;
    const max = trace.values.reduce((a, b) => Math.max(a, Math.abs(b)), 0) || 1;
    return trace.values.map((v, i) => `${x(trace.t0Ns + (i / Math.max(1, n - 1)) * (trace.t1Ns - trace.t0Ns)).toFixed(1)},${(STRIP_H * 0.72 - (v / max) * STRIP_H * 0.18).toFixed(1)}`).join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trace, width, span]);

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKDROP.debrief} style={styles.bg} imageStyle={styles.bgImg}>
        <ScrollView testID="reel-screen" contentContainerStyle={styles.container}>
          <View style={styles.topBar}>
            <Pressable testID="reel-back" onPress={onBack} hitSlop={12}>
              <Text style={styles.back}>‹</Text>
            </Pressable>
            <Text style={styles.title}>REEL</Text>
            <Pressable testID="reel-export" onPress={() => void doExport()} hitSlop={10} disabled={!sessionId}>
              <Text style={styles.link}>export</Text>
            </Pressable>
          </View>

          {/* sessions */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sessions}>
            {sessions.map(ss => (
              <Pressable testID={`reel-session-${ss.id}`} key={ss.id} style={[styles.sessionChip, ss.id === sessionId && styles.sessionChipOn]} onPress={() => setSessionId(ss.id)}>
                <Text style={[styles.sessionText, ss.id === sessionId && styles.sessionTextOn]}>{new Date(ss.startedAt).toLocaleString()}</Text>
                <Text style={styles.sessionSub}>{ss.imuSource ?? '—'}{ss.seqGaps ? ` · ${ss.seqGaps} gaps` : ''}</Text>
              </Pressable>
            ))}
            {sessions.length === 0 ? <Text style={styles.hint}>No sessions yet.</Text> : null}
          </ScrollView>

          {/* strip */}
          <View testID="reel-strip" style={styles.strip} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
            {width > 0 ? (
              <Svg width={width} height={STRIP_H}>
                <Rect x={0} y={0} width={width} height={STRIP_H} fill="#080A0D" rx={8} />
                {tracePoints ? <Polyline points={tracePoints} fill="none" stroke={STUDIO_COLORS.trace} strokeWidth={1} /> : null}
                {clips.map(c => {
                  const t0 = c.sync.pts0HostNs;
                  const t1 = t0 + (c.durationUs ?? 0) * 1000 * c.sync.rate;
                  return <Rect key={c.id} x={x(t0)} y={STRIP_H - 10} width={Math.max(2, x(t1) - x(t0))} height={6} fill={c.sync.class === 'reject' ? STUDIO_COLORS.warning : c.sync.class === 'flag' ? STUDIO_COLORS.glance : STUDIO_COLORS.sync} rx={2} />;
                })}
                {regions.filter(g => g.state === 'open').map(g => (
                  <Rect key={g.id} x={x(g.t0Ns)} y={4} width={Math.max(6, x(g.t1Ns) - x(g.t0Ns))} height={STRIP_H * 0.45} fill="rgba(227,179,65,0.35)" stroke={STUDIO_COLORS.glance} rx={4} />
                ))}
                {sets.map(r => {
                  if (r.tStartHostNs == null || r.tEndHostNs == null) {
                    return null;
                  }
                  const on = r.id === selected || r.id === selected2;
                  return (
                    <Rect key={r.id} x={x(r.tStartHostNs)} y={4} width={Math.max(6, x(r.tEndHostNs) - x(r.tStartHostNs))} height={STRIP_H * 0.45} fill={r.counted ? 'rgba(88,166,255,0.55)' : 'rgba(88,166,255,0.2)'} stroke={on ? colors.textPrimary : 'transparent'} rx={4} />
                  );
                })}
                {sel && sel.tStartHostNs != null && sel.tEndHostNs != null ? (
                  <Rect x={x(sel.tStartHostNs + (sel.tEndHostNs - sel.tStartHostNs) * splitFrac) - 1} y={0} width={2} height={STRIP_H} fill={STUDIO_COLORS.warning} />
                ) : null}
                <SvgText x={4} y={STRIP_H - 14} fontSize={9} fill={colors.textTertiary}>{((span.t1 - span.t0) / 60e9).toFixed(1)} min</SvgText>
              </Svg>
            ) : null}
          </View>

          {/* sets */}
          <View style={styles.card}>
            <Text style={styles.section}>SETS · {sets.length}</Text>
            {sets.length === 0 ? <Text testID="reel-sets-empty" style={styles.hint}>No sets in this session.</Text> : null}
            {sets.map((r, i) => (
              <View key={r.id} style={[styles.setRow, (r.id === selected || r.id === selected2) && styles.setRowOn]}>
                <Pressable testID={`reel-set-${r.id}`} style={{flex: 1}} onPress={() => openSet(r.id)} onLongPress={() => (selected && selected !== r.id ? setSelected2(r.id) : setSelected(r.id))}>
                  <Text style={styles.setName}>
                    {i + 1}. {names[r.exerciseId] ?? r.exerciseId} · {r.weightDeclared != null ? `${r.weightDeclared} ${r.weightUnit ?? 'kg'}` : r.weightState} × {r.repsConfirmed ?? '?'}
                  </Text>
                  <Text style={styles.setMeta}>
                    {r.counted ? 'clean' : 'not counted'} · {r.labelSource} r{r.revision}{r.clipId ? ' · video' : ''}{r.imuAvailable === false ? ' · video-only' : ''}
                  </Text>
                </Pressable>
                <Pressable testID={`reel-select-${r.id}`} hitSlop={8} onPress={() => (selected === r.id ? setSelected(null) : selected ? setSelected2(selected2 === r.id ? null : r.id) : setSelected(r.id))}>
                  <Text style={styles.link}>{r.id === selected ? '◉' : r.id === selected2 ? '◎' : '○'}</Text>
                </Pressable>
              </View>
            ))}
            {sel ? (
              <View style={styles.tools}>
                <Text style={styles.hint}>Selected: {names[sel.exerciseId] ?? sel.exerciseId}{sel2 ? ` + ${names[sel2.exerciseId] ?? sel2.exerciseId}` : ''}</Text>
                <View style={styles.row}>
                  <Pressable testID="reel-split-earlier" style={styles.tool} onPress={() => setSplitFrac(f => Math.max(0.1, f - 0.1))}><Text style={styles.toolText}>◀</Text></Pressable>
                  <Pressable testID="reel-split" style={[styles.tool, busy && styles.disabled]} disabled={!!busy} onPress={() => void doSplit()}><Text style={styles.toolText}>split at {Math.round(splitFrac * 100)}%</Text></Pressable>
                  <Pressable testID="reel-split-later" style={styles.tool} onPress={() => setSplitFrac(f => Math.min(0.9, f + 0.1))}><Text style={styles.toolText}>▶</Text></Pressable>
                  <Pressable testID="reel-merge" style={[styles.tool, (!adjacent || !!busy) && styles.disabled]} disabled={!adjacent || !!busy} onPress={() => void doMerge()}><Text style={styles.toolText}>merge</Text></Pressable>
                </View>
                {propagate.length ? (
                  <Pressable testID="reel-propagate" style={[styles.tool, busy && styles.disabled]} disabled={!!busy} onPress={() => void doPropagate()}>
                    <Text style={styles.toolText}>same exercise for the next {propagate.length} set{propagate.length === 1 ? '' : 's'}?</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* regions */}
          <View style={styles.card}>
            <Text style={styles.section}>UNTAGGED MOTION</Text>
            {regions.filter(g => g.state === 'open').length === 0 ? <Text testID="reel-regions-empty" style={styles.hint}>None — every periodic window in this session is a set or was dismissed.</Text> : null}
            {regions.filter(g => g.state === 'open').map(g => (
              <View key={g.id} testID={`reel-region-${g.id}`} style={styles.setRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.setName}>? · {g.cycles} cycles at {((g.t0Ns - span.t0) / 1e9).toFixed(0)} s</Text>
                  <Text style={styles.setMeta}>{((g.t1Ns - g.t0Ns) / 1e9).toFixed(0)} s of motion with no set tagged</Text>
                </View>
                <Pressable testID="reel-region-tag" style={[styles.tool, busy === g.id && styles.disabled]} disabled={!!busy} onPress={() => void doTagRegion(g)}><Text style={styles.toolText}>Tag it</Text></Pressable>
                <Pressable testID="reel-region-dismiss" style={styles.tool} onPress={() => setDismissing(dismissing === g.id ? null : g.id)}><Text style={styles.toolText}>Dismiss</Text></Pressable>
                {dismissing === g.id ? (
                  <View style={styles.reasons}>
                    {DISMISS_REASONS.map(r => (
                      <Pressable testID={`reel-dismiss-${r.key}`} key={r.key} style={styles.reason} onPress={() => void dismissRegion(g.id, r.key).then(() => { setDismissing(null); return load(); })}>
                        <Text style={styles.reasonText}>{r.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>

          {/* clips */}
          <View style={styles.card}>
            <Text style={styles.section}>CLIPS · {clips.length}</Text>
            {clips.map(c => (
              <Text key={c.id} testID={`reel-clip-${c.id}`} style={styles.hint}>
                {c.source} · {c.state} · sync {c.sync.class}{c.sync.residualMs != null ? ` (${c.sync.residualMs} ms)` : ''} ·{' '}
                {c.frames != null ? `${c.frames} frames` : c.durationUs != null ? `${(c.durationUs / 1e6).toFixed(1)} s` : 'length unknown'}
                {c.proxyPath ? ' · proxy' : ' · no proxy'}
              </Text>
            ))}
            {clips.length === 0 ? <Text style={styles.hint}>No video in this session.</Text> : null}
          </View>
          {line ? <Text testID="reel-line" style={styles.line}>{line}</Text> : null}
          <View style={{height: spacing.xl}} />
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  bg: {flex: 1},
  bgImg: {opacity: 0.22, resizeMode: 'cover'},
  container: {padding: spacing.lg, gap: spacing.md},
  topBar: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  back: {color: colors.accent, fontSize: 26, width: 24},
  title: {color: colors.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 2, flex: 1},
  link: {color: colors.accent, fontSize: 14, fontWeight: '700'},
  sessions: {gap: spacing.sm},
  sessionChip: {backgroundColor: '#161B22', borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: 'transparent'},
  sessionChipOn: {borderColor: colors.accent},
  sessionText: {color: colors.textSecondary, fontSize: 12, fontWeight: '700'},
  sessionTextOn: {color: colors.textPrimary},
  sessionSub: {color: colors.textTertiary, fontSize: 10},
  strip: {height: STRIP_H, borderRadius: radii.md, overflow: 'hidden'},
  card: {backgroundColor: 'rgba(20,25,32,0.92)', borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm},
  section: {color: colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1},
  hint: {color: colors.textSecondary, fontSize: 12, lineHeight: 17},
  setRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', paddingVertical: 4, borderRadius: radii.md, paddingHorizontal: 4},
  setRowOn: {backgroundColor: '#10222A'},
  setName: {color: colors.textPrimary, fontSize: 13, fontWeight: '700'},
  setMeta: {color: colors.textTertiary, fontSize: 11},
  tools: {gap: spacing.xs, marginTop: spacing.xs},
  row: {flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center'},
  tool: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.md, backgroundColor: '#21262D'},
  toolText: {color: colors.textPrimary, fontSize: 12, fontWeight: '700'},
  disabled: {opacity: 0.4},
  reasons: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, width: '100%'},
  reason: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.full, backgroundColor: '#0B0E12'},
  reasonText: {color: colors.textSecondary, fontSize: 12},
  line: {color: colors.accent, fontSize: 13, textAlign: 'center'},
});
