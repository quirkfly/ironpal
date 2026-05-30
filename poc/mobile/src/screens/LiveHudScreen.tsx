import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MetricRow} from '../components/MetricRow';
import {colors, radii, spacing} from '../components/theme';
import {EXERCISE_DISPLAY} from '../controller/labels';
import {useLiveSet} from '../controller/useLiveSet';
import {ConfirmCorrectScreen} from './ConfirmCorrectScreen';

// Live HUD (spec §9). On-device IMU values are instant; LLM values show "…"
// until they patch in (Q8). Shows "—" on UNKNOWN (Q4); weight-glance prompt
// during the glance window (Q5); per-metric confidence.

interface Props {
  onBack: () => void;
}

export function LiveHudScreen({onBack}: Props) {
  const {phase, hud, review, error, startSet, endSet, confirmSet} =
    useLiveSet();

  if (phase === 'review' && review) {
    return (
      <ConfirmCorrectScreen
        review={review}
        onConfirm={confirmSet}
      />
    );
  }

  const exerciseLabel = hud.exercise.value
    ? EXERCISE_DISPLAY[hud.exercise.value]
    : '—';
  const repsLabel = hud.reps.value != null ? String(hud.reps.value) : '—';
  const weightLabel =
    hud.weight.value != null ? `${hud.weight.value} ${hud.weightUnit}` : '—';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
          <View style={styles.recWrap}>
            {hud.recording ? <View style={styles.recDot} /> : null}
            <Text style={styles.recText}>
              {hud.recording ? 'REC' : 'IDLE'} · Set {hud.setNumber}
            </Text>
          </View>
        </View>

        {hud.weightGlancePrompt ? (
          <View style={styles.glanceBanner}>
            <Text style={styles.glanceText}>
              Glance at the weight for ~2 s…
            </Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <MetricRow
            label="Exercise"
            value={exerciseLabel}
            confidence={hud.exercise.confidence}
            pending={hud.exercise.pending}
          />
          <View style={styles.divider} />
          <MetricRow
            label="Reps"
            value={repsLabel}
            confidence={hud.reps.confidence}
            pending={hud.reps.pending}
            big
          />
          <View style={styles.divider} />
          <MetricRow
            label="Weight"
            value={weightLabel}
            confidence={hud.weight.confidence}
            pending={hud.weight.pending}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          {phase === 'idle' ? (
            <Pressable style={styles.primaryBtn} onPress={() => void startSet()}>
              <Text style={styles.primaryBtnText}>Start set</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.primaryBtn, styles.endBtn]}
              onPress={() => void endSet()}
              disabled={phase === 'syncing'}>
              <Text style={styles.primaryBtnText}>
                {phase === 'syncing' ? 'Syncing…' : 'End set'}
              </Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.hint}>
          IMU reps/name update instantly & offline. Weight and pushdown
          reps/name fill in from the backend (shown as “…” until they return).
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  container: {padding: spacing.lg, gap: spacing.lg},
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {color: colors.accent, fontSize: 16},
  recWrap: {flexDirection: 'row', alignItems: 'center', gap: spacing.xs},
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.rec,
    marginRight: spacing.xs,
  },
  recText: {color: colors.textSecondary, fontSize: 13, letterSpacing: 1},
  glanceBanner: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  glanceText: {color: colors.confLow, fontSize: 15, textAlign: 'center'},
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  divider: {height: 1, backgroundColor: colors.surfaceElevated},
  error: {color: colors.danger, fontSize: 13},
  actions: {marginTop: spacing.sm},
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  endBtn: {backgroundColor: colors.danger},
  primaryBtnText: {color: '#0B0E12', fontSize: 17, fontWeight: '700'},
  hint: {color: colors.textTertiary, fontSize: 12, lineHeight: 18},
});
