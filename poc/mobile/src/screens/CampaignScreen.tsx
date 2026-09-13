import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radii, spacing} from '../components/theme';
import {useDebrief, type DebriefAnswers} from '../controller/useDebrief';
import {useSession} from '../controller/useSession';
import {useSet} from '../controller/useSet';
import * as store from '../model/store';
import type {LevelProgress} from '../types/model';

// Campaign P0 (design §14 P0 exit: "founder certifies 3 imu exercises at home"). Bare-bones:
// session → calibration → pick level → arm → set → end → debrief (four answers) → outcome,
// plus the inspector v0 (levels, integrity, audit). The game chrome (§17) is P2.

interface Props {
  onBack: () => void;
}

export function CampaignScreen({onBack}: Props) {
  const session = useSession();
  const set = useSet();
  const debrief = useDebrief();
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<DebriefAnswers>({exerciseId: '', repsConfirmed: null, weight: null, weightUnit: 'kg', weightState: 'confirmed'});
  const [levels, setLevels] = useState<LevelProgress[]>([]);
  const [audit, setAudit] = useState<{at: number; exerciseId: string | null; change: Record<string, unknown>; integrityAfter: number | null}[]>([]);

  const pkg = session.state.pkg;
  const names = useMemo(() => ((pkg as unknown as {exercise_names?: Record<string, string>})?.exercise_names ?? {}), [pkg]);
  const campaign1 = useMemo(() => (pkg ? [...pkg.campaign_map.imu, ...pkg.campaign_map.fusion] : []), [pkg]);

  const refreshInspector = useCallback(async () => {
    setLevels(await store.allLevelProgress());
    setAudit(await store.auditRows(12));
  }, []);

  useEffect(() => {
    void refreshInspector();
  }, [refreshInspector, debrief.outcome]);

  const ctx = session.state.pkg && session.state.params && session.state.sessionId
    ? {pkg: session.state.pkg, params: session.state.params, sessionId: session.state.sessionId, gymId: session.gymId, rotation: session.state.rotation, calibrated: session.state.calibration != null}
    : null;

  const endSet = async () => {
    const result = await set.end();
    if (result && ctx) {
      await debrief.open(result, ctx, exerciseId);
      const proposedExercise = result.match?.label && result.match.label !== 'unknown' ? result.match.label : exerciseId ?? '';
      const prior = await store.weightPrior(proposedExercise, ctx.gymId);
      setAnswers({exerciseId: proposedExercise, repsConfirmed: result.repsDetected, weight: prior?.weight ?? null, weightUnit: prior?.unit ?? 'kg', weightState: 'confirmed'});
    }
  };

  const confirmAll = async () => {
    if (set.live.result && ctx) {
      await debrief.confirm(set.live.result, answers, ctx);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
          <Text style={styles.title}>Campaign · P0</Text>
        </View>

        {/* Session */}
        <Section title={`Session · ${session.state.phase}`}>
          {session.state.phase === 'idle' ? (
            <Btn label="Start session" onPress={() => void session.start(null)} primary />
          ) : null}
          {session.state.phase === 'calibrating' ? (
            <>
              <Text style={styles.hint}>Wear the band upright, then nod three times sharply and tap Calibrate.</Text>
              <Btn label="Calibrate (nods)" onPress={() => void session.calibrate()} primary />
              <Btn label="Skip calibration" onPress={session.skipCalibration} />
            </>
          ) : null}
          {session.state.phase === 'ready' ? (
            <>
              <Text style={styles.hint}>
                Index: {session.state.indexCount} templates · calibration {session.state.calibration ? `${session.state.calibration.angleToPreviousDeg.toFixed(0)}° vs last, residual ${session.state.calibration.residualDeg.toFixed(1)}°` : 'skipped'}
              </Text>
              <Btn label="End session" onPress={() => void session.stop()} />
            </>
          ) : null}
          {session.state.error ? <Text style={styles.error}>{session.state.error}</Text> : null}
        </Section>

        {/* Level pick + set */}
        {session.state.phase === 'ready' ? (
          <Section title="Level (Campaign 1 — IMU)">
            <View style={styles.wrap}>
              {campaign1.map(id => (
                <Pressable key={id} style={[styles.chip, exerciseId === id && styles.chipOn]} onPress={() => setExerciseId(id)}>
                  <Text style={[styles.chipText, exerciseId === id && styles.chipTextOn]}>{names[id] ?? id}</Text>
                </Pressable>
              ))}
            </View>
            {set.live.phase === 'idle' || set.live.phase === 'ended' ? (
              <Btn label="ARM set" onPress={() => void set.arm(exerciseId)} primary disabled={!exerciseId} />
            ) : (
              <>
                <Text style={styles.big}>{set.live.reps} reps</Text>
                <Text style={styles.hint}>
                  gate {set.live.phase} · {set.live.provisionalLabel ? `${names[set.live.provisionalLabel] ?? set.live.provisionalLabel} (${Math.round(set.live.provisionalConfidence * 100)}%, provisional)` : '…'}
                  {set.live.lastRepLatencyMs != null ? ` · cue +${set.live.lastRepLatencyMs.toFixed(0)} ms` : ''}
                </Text>
                <Btn label="END set" onPress={() => void endSet()} primary />
              </>
            )}
            {set.live.error ? <Text style={styles.error}>{set.live.error}</Text> : null}
          </Section>
        ) : null}

        {/* Debrief */}
        {debrief.proposals && set.live.result ? (
          <Section title="Debrief">
            <Text style={styles.line}>Exercise: {names[String(debrief.proposals.exercise.value)] ?? String(debrief.proposals.exercise.value)} — {debrief.proposals.exercise.explanation.summary}</Text>
            <Text style={styles.line}>Reps: {debrief.proposals.reps.explanation.summary}</Text>
            <Text style={styles.line}>Weight: {debrief.proposals.weight.explanation.summary}</Text>
            <View style={styles.row}>
              <Field label="reps" value={answers.repsConfirmed == null ? '' : String(answers.repsConfirmed)} onChange={v => setAnswers(a => ({...a, repsConfirmed: v === '' ? null : Number(v)}))} />
              <Field label="kg" value={answers.weight == null ? '' : String(answers.weight)} onChange={v => setAnswers(a => ({...a, weight: v === '' ? null : Number(v), weightState: v === '' ? 'unreadable' : 'confirmed'}))} />
            </View>
            <View style={styles.wrap}>
              {campaign1.map(id => (
                <Pressable key={id} style={[styles.chip, answers.exerciseId === id && styles.chipOn]} onPress={() => setAnswers(a => ({...a, exerciseId: id}))}>
                  <Text style={[styles.chipText, answers.exerciseId === id && styles.chipTextOn]}>{names[id] ?? id}</Text>
                </Pressable>
              ))}
            </View>
            <Btn label={debrief.busy ? 'Saving…' : 'All correct — save'} onPress={() => void confirmAll()} primary disabled={debrief.busy || !answers.exerciseId} />
            {debrief.outcome ? (
              <Text style={styles.success}>
                {debrief.outcome.counted ? `Clean set · +${debrief.outcome.xpEarned} XP · ${debrief.outcome.templatesAdded} templates · integrity ${debrief.outcome.integrity == null ? '—' : Math.round(debrief.outcome.integrity * 100) + '%'}` : 'Set kept but not counted (a gate failed)'}
                {debrief.outcome.level ? ` · ${debrief.outcome.level.from} → ${debrief.outcome.level.to}` : ''}
              </Text>
            ) : null}
            {debrief.error ? <Text style={styles.error}>{debrief.error}</Text> : null}
          </Section>
        ) : null}

        {/* Inspector v0 */}
        <Section title="Inspector">
          {levels.length === 0 ? <Text style={styles.hint}>No levels yet.</Text> : null}
          {levels.map(l => (
            <Text key={`${l.exerciseId}:${l.gymId}`} style={styles.line}>
              {names[l.exerciseId] ?? l.exerciseId}: {l.state} · {l.cleanSets} sets · {l.distinctWeights} weights · integrity {Math.round(l.integrity * 100)}% · {l.xp} XP
            </Text>
          ))}
          {audit.map((a, i) => (
            <Text key={i} style={styles.audit}>
              {new Date(a.at).toLocaleTimeString()} {a.exerciseId ?? ''} {String(a.change.event)} {a.integrityAfter != null ? `→ ${Math.round(a.integrityAfter * 100)}%` : ''}
            </Text>
          ))}
          <Btn label="Refresh" onPress={() => void refreshInspector()} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Btn({label, onPress, primary, disabled}: {label: string; onPress: () => void; primary?: boolean; disabled?: boolean}) {
  return (
    <Pressable style={[styles.btn, primary && styles.btnPrimary, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

function Field({label, value, onChange}: {label: string; value: string; onChange: (v: string) => void}) {
  return (
    <View style={styles.field}>
      <Text style={styles.hint}>{label}</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={value} onChangeText={onChange} placeholder="—" placeholderTextColor={colors.textTertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  container: {padding: spacing.lg, gap: spacing.md},
  topBar: {flexDirection: 'row', alignItems: 'center', gap: spacing.lg},
  back: {color: colors.accent, fontSize: 16},
  title: {color: colors.textPrimary, fontSize: 20, fontWeight: '800'},
  section: {backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm},
  sectionTitle: {color: colors.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase'},
  hint: {color: colors.textSecondary, fontSize: 13, lineHeight: 18},
  line: {color: colors.textPrimary, fontSize: 14, lineHeight: 20},
  audit: {color: colors.textTertiary, fontSize: 12},
  big: {color: colors.accent, fontSize: 48, fontWeight: '900'},
  success: {color: colors.accent, fontSize: 14},
  error: {color: '#FF6B35', fontSize: 13},
  wrap: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs},
  chip: {borderRadius: radii.lg, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.bg},
  chipOn: {backgroundColor: colors.accent},
  chipText: {color: colors.textSecondary, fontSize: 12},
  chipTextOn: {color: '#0B0E12', fontWeight: '700'},
  row: {flexDirection: 'row', gap: spacing.md},
  field: {flex: 1},
  input: {color: colors.textPrimary, borderColor: colors.textTertiary, borderWidth: 1, borderRadius: radii.lg, padding: spacing.sm, fontSize: 18},
  btn: {backgroundColor: colors.bg, borderRadius: radii.lg, padding: spacing.md, alignItems: 'center'},
  btnPrimary: {backgroundColor: colors.accent},
  btnText: {color: colors.textPrimary, fontSize: 15, fontWeight: '700'},
  btnTextPrimary: {color: '#0B0E12'},
  disabled: {opacity: 0.4},
});
