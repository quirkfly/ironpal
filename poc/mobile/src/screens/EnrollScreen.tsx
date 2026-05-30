import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radii, spacing} from '../components/theme';
import {ENROLL_OPTIONS, type EnrollOption} from '../controller/labels';
import {useEnroll} from '../controller/useEnroll';

// Enroll screen (founder-only, Q1; spec §5.1). Founder picks a label (incl.
// UNKNOWN seed activities — Q4), records N clean reps, and the take is
// segmented + feature-extracted natively then POSTed to /templates.

interface Props {
  onBack: () => void;
}

export function EnrollScreen({onBack}: Props) {
  const {phase, lastSaved, error, startRecording, stopAndSave} = useEnroll();
  const recording = phase === 'recording';
  const saving = phase === 'saving';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} hitSlop={12} disabled={recording}>
            <Text style={[styles.back, recording && styles.disabled]}>
              ‹ Back
            </Text>
          </Pressable>
          <Text style={styles.title}>Enroll (founder)</Text>
        </View>

        <Text style={styles.subtitle}>
          Mount up, pick a label, tap Record, perform 8–12 clean reps, then
          Stop. Record 3–5 takes per exercise across days. Seed the UNKNOWN
          class with idle, walking, racking, and an off-target lift (Q4).
        </Text>

        {ENROLL_OPTIONS.map((opt: EnrollOption, idx) => (
          <Pressable
            key={`${opt.title}-${idx}`}
            style={[styles.option, recording && styles.disabledCard]}
            disabled={recording || saving}
            onPress={() => void startRecording(opt)}>
            <Text style={styles.optionTitle}>{opt.title}</Text>
            {opt.seedHint ? (
              <Text style={styles.optionHint}>{opt.seedHint}</Text>
            ) : null}
          </Pressable>
        ))}

        {recording ? (
          <View style={styles.recordingBar}>
            <View style={styles.recDot} />
            <Text style={styles.recordingText}>Recording take…</Text>
            <Pressable style={styles.stopBtn} onPress={() => void stopAndSave()}>
              <Text style={styles.stopBtnText}>Stop & save</Text>
            </Pressable>
          </View>
        ) : null}

        {saving ? <Text style={styles.info}>Saving template…</Text> : null}
        {lastSaved ? (
          <Text style={styles.success}>Saved: {lastSaved}</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  container: {padding: spacing.lg, gap: spacing.md},
  topBar: {flexDirection: 'row', alignItems: 'center', gap: spacing.lg},
  back: {color: colors.accent, fontSize: 16},
  disabled: {opacity: 0.4},
  title: {color: colors.textPrimary, fontSize: 20, fontWeight: '800'},
  subtitle: {color: colors.textSecondary, fontSize: 14, lineHeight: 20},
  option: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  disabledCard: {opacity: 0.35},
  optionTitle: {color: colors.textPrimary, fontSize: 17, fontWeight: '600'},
  optionHint: {color: colors.textTertiary, fontSize: 13, marginTop: spacing.xs},
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  recDot: {width: 12, height: 12, borderRadius: 6, backgroundColor: colors.rec},
  recordingText: {color: colors.textPrimary, fontSize: 15, flex: 1},
  stopBtn: {
    backgroundColor: colors.danger,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  stopBtnText: {color: '#0B0E12', fontWeight: '700'},
  info: {color: colors.textSecondary, fontSize: 14},
  success: {color: colors.confHigh, fontSize: 14},
  error: {color: colors.danger, fontSize: 13},
});
