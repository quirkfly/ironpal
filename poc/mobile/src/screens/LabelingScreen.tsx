import React, {useMemo, useState} from 'react';
import {Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radii, spacing} from '../components/theme';
import {BACKDROP, BADGE, glyphFor, HUD} from '../game/assets';
import {RepTrace} from '../game/RepTrace';
import {decodeF16} from '../model/f16';
import type {DebriefAnswers} from '../controller/useDebrief';
import type {Proposals} from '../model/decide';
import type {LevelState, QueueFocus, SetResult} from '../types/model';

// The exercise labeling UI — the debrief / tagging round (design §7.4, §17.2).
//
// Four questions, each already answered by the model and each confirmable in one tap:
//   exercise · set interval · reps (marks on the trace) · weight
// Every proposal shows the explanation the model generated at decision time (§5, FR-T2),
// so the user is verifying a claim with its evidence, not filling in a blank form.

interface Props {
  result: SetResult;
  proposals: Proposals;
  answers: DebriefAnswers;
  onChange: (a: DebriefAnswers) => void;
  exercises: {id: string; name: string; state: LevelState}[];
  busy: boolean;
  onSave: () => void;
  onBack: () => void;
  outcome: string | null;
  /** Studio design §6: each card links to After Action, positioned on that card. */
  onOpenStudio?: (focus: QueueFocus) => void;
}

export function LabelingScreen({result, proposals, answers, onChange, exercises, busy, onSave, onBack, outcome, onOpenStudio}: Props) {
  const studioLink = (focus: QueueFocus, id: string) =>
    onOpenStudio ? (
      <Pressable testID={id} onPress={() => onOpenStudio(focus)} hitSlop={8} style={styles.studioLink}>
        <Text style={styles.why}>Open in After Action ›</Text>
      </Pressable>
    ) : null;
  const [disabled, setDisabled] = useState<Set<number>>(new Set());
  const [showEvidence, setShowEvidence] = useState<string | null>(null);

  const win = useMemo(() => decodeF16(result.windowF16, result.channels), [result.windowF16, result.channels]);
  const marks = useMemo(() => result.reps.map(r => r.tPeakSec), [result.reps]);

  const toggleMark = (i: number) => {
    const next = new Set(disabled);
    if (next.has(i)) {
      next.delete(i);
    } else {
      next.add(i);
    }
    setDisabled(next);
    const kept = marks.filter((_, k) => !next.has(k));
    onChange({...answers, repsConfirmed: kept.length, repTopsSec: kept});
  };

  const tStart = (result.tOpenNs - result.tStartNs) / 1e9;
  const tEnd = (result.tCloseNs - result.tStartNs) / 1e9;
  const agree = answers.repsConfirmed != null && Math.abs(answers.repsConfirmed - result.repsDetected) <= 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKDROP.debrief} style={styles.bg} imageStyle={styles.bgImg}>
        <ScrollView testID="labeling-screen" contentContainerStyle={styles.container}>
          <View style={styles.topBar}>
            <Pressable testID="labeling-back" onPress={onBack} hitSlop={12}>
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>
            <Text testID="labeling-title" style={styles.title}>DEBRIEF</Text>
            <Image source={HUD.hitmarker} style={styles.hitmarker} />
          </View>

          {/* 1 — reps on the trace */}
          <View style={styles.card}>
            <Text style={styles.q}>How many reps?</Text>
            <RepTrace
              window={win}
              rateHz={result.rateHz}
              channel={result.dominantChannel ?? -1}
              marks={marks}
              disabled={disabled}
              onToggle={toggleMark}
              tStart={tStart}
              tEnd={tEnd}
            />
            <Text testID="labeling-reps-explain" style={styles.explain}>{proposals.reps.explanation.summary}</Text>
            {studioLink('marks', 'labeling-open-studio-reps')}
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>confirmed reps</Text>
                <TextInput
                  testID="labeling-reps-input"
                  style={styles.input}
                  keyboardType="numeric"
                  value={answers.repsConfirmed == null ? '' : String(answers.repsConfirmed)}
                  onChangeText={v => onChange({...answers, repsConfirmed: v === '' ? null : Number(v)})}
                  placeholder="—"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.gateBox}>
                <Text style={styles.label}>headband said</Text>
                <Text testID="labeling-detected-reps" style={styles.gateVal}>{result.repsDetected}</Text>
                <Text testID="labeling-rep-gate" style={[styles.gatePill, agree ? styles.gateOk : styles.gateBad]}>
                  {agree ? 'within ±1 ✓' : 'off by >1'}
                </Text>
              </View>
            </View>
          </View>

          {/* 2 — exercise */}
          <View style={styles.card}>
            <Text style={styles.q}>Which exercise?</Text>
            <Text testID="labeling-exercise-explain" style={styles.explain}>{proposals.exercise.explanation.summary}</Text>
            <View style={styles.grid}>
              {exercises.map(ex => {
                const on = answers.exerciseId === ex.id;
                return (
                  <Pressable testID={`labeling-exercise-${ex.id}`} key={ex.id} style={[styles.exBtn, on && styles.exBtnOn]} onPress={() => onChange({...answers, exerciseId: ex.id})}>
                    <Image source={glyphFor(ex.id)} style={styles.exGlyph} />
                    <Text style={[styles.exName, on && styles.exNameOn]} numberOfLines={2}>{ex.name}</Text>
                    <Image source={BADGE[ex.state]} style={styles.exBadge} />
                  </Pressable>
                );
              })}
            </View>
            {proposals.exercise.explanation.alternatives?.length ? (
              <Pressable testID="labeling-why" onPress={() => setShowEvidence(showEvidence === 'exercise' ? null : 'exercise')}>
                <Text style={styles.why}>{showEvidence === 'exercise' ? 'hide' : 'why?'}</Text>
              </Pressable>
            ) : null}
            {showEvidence === 'exercise'
              ? proposals.exercise.explanation.alternatives?.map(a => (
                  <Text key={a.label} style={styles.alt}>
                    {a.label} · {Math.round(a.score * 100)}%
                  </Text>
                ))
              : null}
            {studioLink('exercise', 'labeling-open-studio-exercise')}
          </View>

          {/* 3 — weight */}
          <View style={styles.card}>
            <Text style={styles.q}>What weight?</Text>
            <Text testID="labeling-weight-explain" style={styles.explain}>{proposals.weight.explanation.summary}</Text>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>{answers.weightUnit}</Text>
                <TextInput
                  testID="labeling-weight-input"
                  style={styles.input}
                  keyboardType="numeric"
                  value={answers.weight == null ? '' : String(answers.weight)}
                  onChangeText={v => onChange({...answers, weight: v === '' ? null : Number(v), weightState: v === '' ? 'unsure' : 'confirmed'})}
                  placeholder="—"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <Pressable
                testID="labeling-weight-unreadable"
                style={[styles.unreadable, answers.weightState === 'unreadable' && styles.unreadableOn]}
                onPress={() => onChange({...answers, weight: null, weightState: 'unreadable'})}>
                <Text style={styles.unreadableText}>Couldn't see it</Text>
              </Pressable>
            </View>
            {studioLink('weight', 'labeling-open-studio-weight')}
          </View>

          <View style={{height: spacing.xl}} />
        </ScrollView>

        {/* The save bar is a fixed footer, not the last card: the round is supposed to be one tap
            (PRD §7.4), and a primary action you must scroll to is both slower and — with a list
            still gliding — a press the scroll view steals. The outcome sits above it, where the
            user is already looking. */}
        <View style={styles.footer}>
          {outcome ? <Text testID="labeling-outcome" style={styles.outcome}>{outcome}</Text> : null}
          <Pressable
            testID="labeling-save"
            style={[styles.save, (busy || !answers.exerciseId) && styles.disabled]}
            onPress={onSave}
            disabled={busy || !answers.exerciseId}>
            <Text style={styles.saveText}>{busy ? 'Saving…' : 'ALL CORRECT — SAVE'}</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  bg: {flex: 1},
  bgImg: {opacity: 0.35, resizeMode: 'cover'},
  container: {padding: spacing.lg, gap: spacing.md},
  topBar: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  back: {color: colors.accent, fontSize: 16},
  title: {color: colors.textPrimary, fontSize: 20, fontWeight: '900', letterSpacing: 2, flex: 1},
  hitmarker: {width: 28, height: 28, resizeMode: 'contain'},
  card: {backgroundColor: 'rgba(20,25,32,0.92)', borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm},
  q: {color: colors.textPrimary, fontSize: 17, fontWeight: '800'},
  explain: {color: colors.textSecondary, fontSize: 13, lineHeight: 19},
  row: {flexDirection: 'row', gap: spacing.md, alignItems: 'flex-end'},
  field: {flex: 1},
  label: {color: colors.textTertiary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1},
  input: {color: colors.textPrimary, borderColor: colors.textTertiary, borderWidth: 1, borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 22, fontWeight: '700'},
  gateBox: {alignItems: 'center', minWidth: 96},
  gateVal: {color: colors.accent, fontSize: 26, fontWeight: '900'},
  gatePill: {fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden'},
  gateOk: {color: '#0B0E12', backgroundColor: colors.accent},
  gateBad: {color: '#fff', backgroundColor: '#FF6B35'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  exBtn: {width: '31%', backgroundColor: '#0B0E12', borderRadius: radii.lg, padding: spacing.sm, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'transparent'},
  exBtnOn: {borderColor: colors.accent, backgroundColor: '#10222A'},
  exGlyph: {width: 34, height: 34, resizeMode: 'contain'},
  exName: {color: colors.textSecondary, fontSize: 10, textAlign: 'center', minHeight: 26},
  exNameOn: {color: colors.textPrimary, fontWeight: '700'},
  exBadge: {width: 16, height: 16, resizeMode: 'contain'},
  why: {color: colors.accent, fontSize: 12},
  studioLink: {alignSelf: 'flex-start', paddingVertical: 2},
  alt: {color: colors.textTertiary, fontSize: 12},
  unreadable: {paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radii.lg, backgroundColor: '#0B0E12'},
  unreadableOn: {backgroundColor: '#3A2A18'},
  unreadableText: {color: colors.textSecondary, fontSize: 13},
  footer: {paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, paddingTop: spacing.sm, backgroundColor: 'rgba(11,14,18,0.96)', gap: spacing.xs},
  save: {backgroundColor: colors.accent, borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center'},
  saveText: {color: '#0B0E12', fontSize: 16, fontWeight: '900', letterSpacing: 1},
  disabled: {opacity: 0.4},
  outcome: {color: colors.accent, fontSize: 14, textAlign: 'center'},
});
