import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {colors, radii, spacing} from '../components/theme';
import type {DebriefAnswers} from '../controller/useDebrief';
import type {ExemplarFrameRow} from '../model/store';
import type {IntegrityPreview} from '../types/model';
import {STUDIO_COLORS} from './glyphs';

// The label dock (studio design §7.7): three cells, each expanding to a sheet. The Exercise sheet
// is its own component; the Reps and Weight sheets are small enough to live here.

export type DockCell = 'exercise' | 'reps' | 'weight';

interface Props {
  answers: DebriefAnswers;
  exerciseName: string;
  confidence: number | null;
  marksOn: number;
  marksVsCount: 'ok' | 'marks_fewer' | 'marks_more';
  repsDetected: number;
  repSignal: string;
  pins: ExemplarFrameRow[];
  preview: IntegrityPreview | null;
  open: DockCell | null;
  onOpen: (cell: DockCell | null) => void;
  onChange: (a: DebriefAnswers) => void;
  onUseMarksCount: () => void;
  onAddMarkHint: () => void;
}

export function LabelDock(p: Props) {
  const a = p.answers;
  const repsLabel = a.repsConfirmed == null ? '?' : String(a.repsConfirmed);
  const weightLabel = a.weightState === 'unreadable' ? 'unreadable' : a.weightState === 'unsure' ? 'not sure' : a.weight == null ? '—' : `${a.weight} ${a.weightUnit}`;
  const agree = a.repsConfirmed != null && Math.abs(a.repsConfirmed - p.repsDetected) <= 1;
  return (
    <View style={styles.dock}>
      <View style={styles.cells}>
        <Cell testID="studio-dock-exercise" on={p.open === 'exercise'} label="Exercise" value={p.exerciseName || 'choose'} sub={p.confidence != null ? `${Math.round(p.confidence * 100)}%` : ''} onPress={() => p.onOpen(p.open === 'exercise' ? null : 'exercise')} />
        <Cell testID="studio-dock-reps" on={p.open === 'reps'} label="Reps" value={repsLabel} sub={p.marksVsCount === 'ok' ? `${p.marksOn} marks ✓` : `${p.marksOn} marks ≠`} onPress={() => p.onOpen(p.open === 'reps' ? null : 'reps')} />
        <Cell testID="studio-dock-weight" on={p.open === 'weight'} label="Weight" value={weightLabel} sub={a.weightState === 'confirmed' && a.weight != null ? '✓' : ''} onPress={() => p.onOpen(p.open === 'weight' ? null : 'weight')} />
      </View>

      {p.open === 'reps' ? (
        <View testID="studio-reps-sheet" style={styles.sheet}>
          <Text style={styles.q}>How many reps?</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>confirmed reps</Text>
              <TextInput
                testID="studio-reps-input"
                style={styles.input}
                keyboardType="numeric"
                value={a.repsConfirmed == null ? '' : String(a.repsConfirmed)}
                onChangeText={v => p.onChange({...a, repsConfirmed: v === '' ? null : Number(v)})}
                placeholder="—"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={styles.gateBox}>
              <Text style={styles.label}>headband said</Text>
              <Text testID="studio-detected-reps" style={styles.gateVal}>{p.repsDetected}</Text>
              <Text testID="studio-rep-gate" style={[styles.gatePill, agree ? styles.gateOk : styles.gateBad]}>
                {p.repSignal === 'imu' || p.repSignal === 'fusion' ? (agree ? 'within ±1 ✓' : 'off by >1') : 'not certifiable'}
              </Text>
            </View>
          </View>
          {p.marksVsCount !== 'ok' ? (
            <View testID="studio-marks-vs-count" style={styles.question}>
              <Text style={styles.qText}>
                {p.marksOn} marks · you typed {a.repsConfirmed ?? '?'} — {p.marksVsCount === 'marks_fewer' ? 'add a mark or keep' : 'drop a mark or keep'} {p.marksOn}?
              </Text>
              <View style={styles.row}>
                <Pressable testID="studio-keep-marks" style={styles.smallBtn} onPress={p.onUseMarksCount}>
                  <Text style={styles.smallBtnText}>keep {p.marksOn}</Text>
                </Pressable>
                <Pressable testID="studio-fix-marks" style={styles.smallBtn} onPress={p.onAddMarkHint}>
                  <Text style={styles.smallBtnText}>{p.marksVsCount === 'marks_fewer' ? 'add marks' : 'edit marks'}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          <Pressable testID="studio-reps-unsure" style={[styles.unreadable, a.repsConfirmed == null && styles.unreadableOn]} onPress={() => p.onChange({...a, repsConfirmed: null})}>
            <Text style={styles.unreadableText}>Not sure</Text>
          </Pressable>
        </View>
      ) : null}

      {p.open === 'weight' ? (
        <View testID="studio-weight-sheet" style={styles.sheet}>
          <Text style={styles.q}>What weight?</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>{a.weightUnit}</Text>
              <TextInput
                testID="studio-weight-input"
                style={styles.input}
                keyboardType="numeric"
                value={a.weight == null ? '' : String(a.weight)}
                onChangeText={v => p.onChange({...a, weight: v === '' ? null : Number(v), weightState: v === '' ? 'unsure' : 'confirmed'})}
                placeholder="—"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <Pressable testID="studio-weight-unit" style={styles.smallBtn} onPress={() => p.onChange({...a, weightUnit: a.weightUnit === 'kg' ? 'lb' : 'kg'})}>
              <Text style={styles.smallBtnText}>{a.weightUnit} ⇄</Text>
            </Pressable>
            <Pressable testID="studio-weight-unreadable" style={[styles.unreadable, a.weightState === 'unreadable' && styles.unreadableOn]} onPress={() => p.onChange({...a, weight: null, weightState: 'unreadable'})}>
              <Text style={styles.unreadableText}>Couldn't see it</Text>
            </Pressable>
          </View>
          <Pressable testID="studio-ocr-frame" disabled={!p.pins.length} style={[styles.ocr, !p.pins.length && styles.disabled]}>
            <Text style={styles.ocrText}>Read this frame</Text>
            <Text style={styles.ocrSub}>
              {p.pins.length ? 'Sends the pinned crop only — one still, deleted after inference.' : 'Pin a frame first (Pins mode). One still leaves the phone, deleted after inference.'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Cell({testID, on, label, value, sub, onPress}: {testID: string; on: boolean; label: string; value: string; sub: string; onPress: () => void}) {
  return (
    <Pressable testID={testID} onPress={onPress} style={[styles.cell, on && styles.cellOn]}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.cellSub} numberOfLines={1}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dock: {gap: spacing.sm},
  cells: {flexDirection: 'row', gap: spacing.sm},
  cell: {flex: 1, backgroundColor: '#161B22', borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: 'transparent', minHeight: 58},
  cellOn: {borderColor: colors.accent, backgroundColor: '#10222A'},
  cellLabel: {color: colors.textTertiary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1},
  cellValue: {color: colors.textPrimary, fontSize: 15, fontWeight: '800'},
  cellSub: {color: colors.textSecondary, fontSize: 10},
  sheet: {backgroundColor: 'rgba(20,25,32,0.96)', borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm},
  q: {color: colors.textPrimary, fontSize: 15, fontWeight: '800'},
  row: {flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end'},
  field: {flex: 1},
  label: {color: colors.textTertiary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1},
  input: {color: colors.textPrimary, borderColor: colors.textTertiary, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 20, fontWeight: '700'},
  gateBox: {alignItems: 'center', minWidth: 90},
  gateVal: {color: colors.accent, fontSize: 22, fontWeight: '900'},
  gatePill: {fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden'},
  gateOk: {color: '#0B0E12', backgroundColor: colors.accent},
  gateBad: {color: '#fff', backgroundColor: STUDIO_COLORS.warning},
  question: {backgroundColor: '#0B0E12', borderRadius: radii.md, padding: spacing.sm, gap: spacing.xs},
  qText: {color: colors.textSecondary, fontSize: 12},
  smallBtn: {paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md, backgroundColor: '#21262D'},
  smallBtnText: {color: colors.textPrimary, fontSize: 12, fontWeight: '700'},
  unreadable: {paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md, backgroundColor: '#0B0E12', alignSelf: 'flex-start'},
  unreadableOn: {backgroundColor: '#3A2A18'},
  unreadableText: {color: colors.textSecondary, fontSize: 13},
  ocr: {backgroundColor: '#0B0E12', borderRadius: radii.md, padding: spacing.sm, gap: 2},
  ocrText: {color: colors.accent, fontSize: 13, fontWeight: '700'},
  ocrSub: {color: colors.textTertiary, fontSize: 11},
  disabled: {opacity: 0.5},
});
