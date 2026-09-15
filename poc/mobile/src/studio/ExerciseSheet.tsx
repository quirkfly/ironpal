import React, {useEffect, useMemo, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import Svg, {Polyline} from 'react-native-svg';
import {colors, radii, spacing} from '../components/theme';
import {BADGE, CAMPAIGN, glyphFor} from '../game/assets';
import {repShape as loadRepShape} from '../model/repShape';
import * as store from '../model/store';
import type {IntegrityPreview, LevelState, ModelPackage, RepSignal, SetResult} from '../types/model';
import {STUDIO_COLORS} from './glyphs';

// The exercise sheet (studio design §7.7, §9.3): candidates with evidence → Compare → field-guide
// line → search/browse → consistency check. Built for the confusable case (PRD §5.2b).

interface Props {
  pkg: ModelPackage;
  result: SetResult;
  value: string;
  names: Record<string, string>;
  levels: Record<string, LevelState>;
  preview: IntegrityPreview | null;
  levelBar: {provisional: number; certified: number};
  currentLevel: LevelState;
  thisSetFrameUri: string | null;
  onChange: (exerciseId: string) => void;
  onClose: () => void;
}

const CAMPAIGN_ORDER: RepSignal[] = ['imu', 'fusion', 'vision', 'hard'];

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

export function ExerciseSheet({pkg, result, value, names, levels, preview, levelBar, currentLevel, thisSetFrameUri, onChange, onClose}: Props) {
  const [q, setQ] = useState('');
  const [compare, setCompare] = useState<string | null>(null);
  const [candShape, setCandShape] = useState<number[] | null>(null);
  const [thisShape, setThisShape] = useState<number[] | null>(null);
  const [candFrame, setCandFrame] = useState<string | null>(null);
  const name = (id: string) => names[id] ?? id;
  const fieldGuide = (pkg as unknown as {field_guide?: Record<string, string>}).field_guide ?? {};

  const candidates = useMemo(() => {
    const cs = result.match?.candidates ?? [];
    const ids = cs.filter(c => c.exerciseId !== 'unknown').map(c => c.exerciseId);
    // The confusable neighbour is always shown (§7.7): the runner-up of the campaign match.
    return [...new Set(ids)].slice(0, 4).map(id => ({id, cand: cs.find(c => c.exerciseId === id)!}));
  }, [result.match]);

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    return CAMPAIGN_ORDER.map(k => ({
      key: k,
      title: CAMPAIGN[k].title,
      certifies: CAMPAIGN[k].certifies,
      ids: (pkg.campaign_map[k] ?? []).filter(id => !term || id.includes(term) || name(id).toLowerCase().includes(term)),
    })).filter(g => g.ids.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg, q, names]);

  // Compare: this set's rep shape (median over its own rep windows) vs the candidate's fitted shape.
  useEffect(() => {
    let alive = true;
    if (!compare) {
      return;
    }
    (async () => {
      const [cs, frames] = await Promise.all([
        loadRepShape(compare, result.dominantChannel ?? -1).catch(() => null),
        store.exemplarFramesForExercise(compare, 1).catch(() => []),
      ]);
      if (alive) {
        setCandShape(cs);
        setCandFrame(frames[0]?.path ? `file://${frames[0].path}` : null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [compare, result.dominantChannel]);

  useEffect(() => {
    setThisShape(shapeFromResult(result));
  }, [result]);

  const consistency = preview
    ? `matches your other ${name(value)} at ${Math.round((preview.selfConfidence ?? 0) * 100)}%${preview.nearestOther ? ` · nearest other: ${name(preview.nearestOther.exerciseId)} ${Math.round((1 / (1 + preview.nearestOther.dFused)) * 100)}%` : ''}`
    : null;
  const demotion =
    preview?.integrityIfAdded != null && ((currentLevel === 'certified' || currentLevel === 'veteran') && preview.integrityIfAdded < levelBar.certified)
      ? `Saving this label would drop ${name(value)} below its certified bar (${Math.round(preview.integrityIfAdded * 100)}% < ${Math.round(levelBar.certified * 100)}%) — integrity compromised, one set to restore.`
      : preview?.integrityIfAdded != null && currentLevel === 'provisional' && preview.integrityIfAdded < levelBar.provisional
        ? `Saving this label would drop ${name(value)} below its provisional bar (${Math.round(preview.integrityIfAdded * 100)}%).`
        : null;

  return (
    <View testID="studio-exercise" style={styles.sheet}>
      <View style={styles.head}>
        <Text style={styles.title}>WHICH EXERCISE?</Text>
        <Pressable testID="studio-exercise-done" onPress={onClose} hitSlop={10}>
          <Text style={styles.done}>Done</Text>
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
        {candidates.length ? (
          <>
            <Text style={styles.section}>CANDIDATES</Text>
            {candidates.map(({id, cand}) => {
              const on = value === id;
              const conf = 1 / (1 + cand.dFused);
              return (
                <Pressable testID={`studio-candidate-${id}`} key={id} style={[styles.cand, on && styles.candOn]} onPress={() => onChange(id)}>
                  <Image source={glyphFor(id)} style={styles.glyph} />
                  <View style={{flex: 1}}>
                    <Text style={[styles.candName, on && styles.candNameOn]}>{name(id)}</Text>
                    <Text style={styles.candMeta}>
                      {Math.round(conf * 100)}% · {cand.source === 'own' ? `your ${cand.kind} template` : cand.source === 'gym_pack' ? 'gym pack prior' : 'founder prior'} · margin {result.match?.margin != null && Number.isFinite(result.match.margin) ? result.match.margin.toFixed(2) : '—'}
                    </Text>
                  </View>
                  <Image source={BADGE[levels[id] ?? 'locked']} style={styles.badge} />
                  <Pressable testID={`studio-compare-${id}`} onPress={() => setCompare(compare === id ? null : id)} hitSlop={8} style={styles.compareBtn}>
                    <Text style={styles.compareText}>{compare === id ? 'hide' : 'compare'}</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </>
        ) : null}

        {compare ? (
          <View testID="studio-compare" style={styles.compare}>
            <Text style={styles.section}>COMPARE · this set vs {name(compare).toUpperCase()}</Text>
            <View style={styles.compareRow}>
              <Shape values={thisShape} color={colors.textPrimary} label="this set" />
              <Shape values={candShape} color={colors.accent} label={candShape ? `${name(compare)} (fitted)` : 'not enough reps stored yet'} />
            </View>
            <View style={styles.compareRow}>
              <Frame uri={thisSetFrameUri} label="this set" />
              <Frame uri={candFrame} label={candFrame ? `your ${name(compare)}` : 'no exemplar yet'} />
            </View>
            {fieldGuide[pairKey(value, compare)] ? (
              <Text testID="studio-field-guide" style={styles.guide}>{fieldGuide[pairKey(value, compare)]}</Text>
            ) : null}
          </View>
        ) : null}

        {consistency ? <Text testID="studio-consistency" style={styles.consistency}>{consistency}</Text> : null}
        {demotion ? <Text testID="studio-demotion" style={styles.demotion}>{demotion}</Text> : null}

        <TextInput testID="studio-exercise-search" style={styles.search} placeholder="Search exercises…" placeholderTextColor={colors.textTertiary} value={q} onChangeText={setQ} autoCapitalize="none" />
        {groups.map(g => (
          <View key={g.key}>
            <Text style={styles.section}>{g.title.toUpperCase()} · {g.certifies}</Text>
            <View style={styles.grid}>
              {g.ids.map(id => {
                const on = value === id;
                return (
                  <Pressable testID={`studio-exercise-${id}`} key={id} style={[styles.exBtn, on && styles.exBtnOn]} onPress={() => onChange(id)}>
                    <Image source={glyphFor(id)} style={styles.exGlyph} />
                    <Text style={[styles.exName, on && styles.exNameOn]} numberOfLines={2}>{name(id)}</Text>
                    <Image source={BADGE[levels[id] ?? 'locked']} style={styles.exBadge} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{height: spacing.xl}} />
      </ScrollView>
    </View>
  );
}

/** Median time-normalised rep shape of this set from its own window and marks (64 samples). */
export function shapeFromResult(result: SetResult): number[] | null {
  try {
    // Lazy import keeps the sheet free of the f16 decoder on first paint.
    const {decodeF16} = require('../model/f16') as typeof import('../model/f16');
    const win = decodeF16(result.windowF16, result.channels);
    if (!win.length || result.reps.length < 2) {
      return null;
    }
    const ch = result.dominantChannel ?? -1;
    const pick = (row: number[]) => (ch >= 0 && ch < 3 ? row[ch] : Math.hypot(row[0] ?? 0, row[1] ?? 0, row[2] ?? 0));
    const tops = result.reps.map(r => r.tPeakSec);
    const cad = tops.length >= 2 ? (tops.length - 1) / (tops[tops.length - 1] - tops[0]) : result.cadenceHz ?? 0.8;
    const half = 0.5 / Math.max(0.2, cad);
    const N = 64;
    const shapes: number[][] = [];
    for (const t of tops) {
      const a = Math.floor((t - half) * result.rateHz);
      const b = Math.ceil((t + half) * result.rateHz);
      if (a < 0 || b >= win.length) {
        continue;
      }
      const s: number[] = [];
      for (let i = 0; i < N; i++) {
        const idx = a + Math.round((i / (N - 1)) * (b - a));
        s.push(pick(win[Math.min(win.length - 1, idx)]));
      }
      shapes.push(s);
    }
    if (!shapes.length) {
      return null;
    }
    return Array.from({length: N}, (_, i) => {
      const col = shapes.map(s => s[i]).sort((x, y) => x - y);
      const m = Math.floor(col.length / 2);
      return col.length % 2 ? col[m] : (col[m - 1] + col[m]) / 2;
    });
  } catch {
    return null;
  }
}

function Shape({values, color, label}: {values: number[] | null; color: string; label: string}) {
  const W = 150;
  const H = 60;
  const pts = values && values.length
    ? (() => {
        const max = values.reduce((a, b) => Math.max(a, Math.abs(b)), 0) || 1;
        return values.map((v, i) => `${((i / (values.length - 1)) * W).toFixed(1)},${(H / 2 - (v / max) * (H / 2.2)).toFixed(1)}`).join(' ');
      })()
    : '';
  return (
    <View style={styles.shape}>
      <Svg width={W} height={H}>{pts ? <Polyline points={pts} fill="none" stroke={color} strokeWidth={2} /> : null}</Svg>
      <Text style={styles.shapeLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function Frame({uri, label}: {uri: string | null; label: string}) {
  return (
    <View style={styles.shape}>
      {uri ? <Image source={{uri}} style={styles.frame} /> : <View style={[styles.frame, styles.frameEmpty]} />}
      <Text style={styles.shapeLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {flex: 1, backgroundColor: 'rgba(11,14,18,0.98)', borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg},
  head: {flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: '#21262D'},
  title: {flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '900', letterSpacing: 1},
  done: {color: colors.accent, fontSize: 15, fontWeight: '700'},
  body: {padding: spacing.md, gap: spacing.sm},
  section: {color: colors.textTertiary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: spacing.sm},
  cand: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#161B22', borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: 'transparent'},
  candOn: {borderColor: colors.accent, backgroundColor: '#10222A'},
  glyph: {width: 30, height: 30, resizeMode: 'contain'},
  candName: {color: colors.textSecondary, fontSize: 14, fontWeight: '700'},
  candNameOn: {color: colors.textPrimary},
  candMeta: {color: colors.textTertiary, fontSize: 11},
  badge: {width: 18, height: 18, resizeMode: 'contain'},
  compareBtn: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm, backgroundColor: '#0B0E12'},
  compareText: {color: colors.accent, fontSize: 11},
  compare: {backgroundColor: '#0B0E12', borderRadius: radii.md, padding: spacing.sm, gap: spacing.sm},
  compareRow: {flexDirection: 'row', justifyContent: 'space-around', gap: spacing.sm},
  shape: {alignItems: 'center', gap: 2},
  shapeLabel: {color: colors.textTertiary, fontSize: 10, maxWidth: 150},
  frame: {width: 150, height: 90, borderRadius: radii.sm, backgroundColor: '#161B22', resizeMode: 'cover'},
  frameEmpty: {borderWidth: 1, borderColor: '#2A323B'},
  guide: {color: STUDIO_COLORS.glance, fontSize: 12, fontStyle: 'italic', lineHeight: 17},
  consistency: {color: colors.textSecondary, fontSize: 12},
  demotion: {color: STUDIO_COLORS.warning, fontSize: 12, lineHeight: 17},
  search: {color: colors.textPrimary, borderColor: colors.textTertiary, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  exBtn: {width: '31%', backgroundColor: '#0B0E12', borderRadius: radii.md, padding: spacing.sm, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'transparent'},
  exBtnOn: {borderColor: colors.accent, backgroundColor: '#10222A'},
  exGlyph: {width: 30, height: 30, resizeMode: 'contain'},
  exName: {color: colors.textSecondary, fontSize: 10, textAlign: 'center', minHeight: 26},
  exNameOn: {color: colors.textPrimary, fontWeight: '700'},
  exBadge: {width: 14, height: 14, resizeMode: 'contain'},
});
