import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radii, spacing} from '../components/theme';
import {EXERCISE_DISPLAY} from '../controller/labels';
import type {ReviewData} from '../controller/useLiveSet';
import type {ExerciseLabel} from '../types/domain';

// Confirm/correct screen (spec §5.2 step 6). The user corrects any wrong
// detected value — these corrections ARE the ground truth (Q9) and become the
// evaluation backbone (detected-vs-corrected → verdict matrix).

interface Props {
  review: ReviewData;
  onConfirm: (corrected: {
    exercise: ExerciseLabel | null;
    reps: number | null;
    weight: number | null;
    isRestWindow: boolean;
    notes: string | null;
  }) => Promise<void>;
}

const EXERCISE_CHOICES: ExerciseLabel[] = [
  'bulgarian_split_squat',
  'triceps_pushdown',
  'unknown',
];

export function ConfirmCorrectScreen({review, onConfirm}: Props) {
  const [exercise, setExercise] = useState<ExerciseLabel>(
    review.exercise.exercise,
  );
  const [reps, setReps] = useState<string>(
    review.reps.reps != null ? String(review.reps.reps) : '',
  );
  const [weight, setWeight] = useState<string>(
    review.weight.weight != null ? String(review.weight.weight) : '',
  );
  const [isRest, setIsRest] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    await onConfirm({
      exercise,
      reps: reps.trim() === '' ? null : parseInt(reps, 10),
      weight: weight.trim() === '' ? null : parseFloat(weight),
      isRestWindow: isRest,
      notes: notes.trim() === '' ? null : notes.trim(),
    });
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Confirm / correct</Text>
        <Text style={styles.subtitle}>
          Detected values shown below. Fix anything wrong — your correction is
          the ground-truth label.
        </Text>

        <Text style={styles.section}>Exercise</Text>
        <Text style={styles.detected}>
          detected: {EXERCISE_DISPLAY[review.exercise.exercise]} (
          {review.exercise.source},{' '}
          {Math.round(review.exercise.confidence * 100)}%)
        </Text>
        <View style={styles.choiceRow}>
          {EXERCISE_CHOICES.map(c => (
            <Pressable
              key={c}
              style={[
                styles.choice,
                exercise === c && styles.choiceActive,
              ]}
              onPress={() => setExercise(c)}>
              <Text
                style={[
                  styles.choiceText,
                  exercise === c && styles.choiceTextActive,
                ]}>
                {EXERCISE_DISPLAY[c]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Reps</Text>
        <Text style={styles.detected}>
          detected: {review.reps.reps ?? '—'} ({review.reps.source},{' '}
          {Math.round(review.reps.confidence * 100)}%)
        </Text>
        <TextInput
          style={styles.input}
          value={reps}
          onChangeText={setReps}
          keyboardType="number-pad"
          placeholder="reps"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.section}>Weight</Text>
        <Text style={styles.detected}>
          detected: {review.weight.weight ?? '—'} {review.weight.unit} (
          {review.weight.source}, {Math.round(review.weight.confidence * 100)}%)
        </Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder="weight"
          placeholderTextColor={colors.textTertiary}
        />

        <View style={styles.switchRow}>
          <Text style={styles.section}>Rest / transition window?</Text>
          <Switch value={isRest} onValueChange={setIsRest} />
        </View>
        <Text style={styles.hint}>
          Mark true if this was idle/transition — feeds the false-reps-at-rest
          KPI (Q4).
        </Text>

        <Text style={styles.section}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notes]}
          value={notes}
          onChangeText={setNotes}
          placeholder="optional"
          placeholderTextColor={colors.textTertiary}
          multiline
        />

        <Pressable
          style={styles.primaryBtn}
          onPress={() => void submit()}
          disabled={saving}>
          <Text style={styles.primaryBtnText}>
            {saving ? 'Saving…' : 'Save set'}
          </Text>
        </Pressable>
        <Text style={styles.hint}>
          {review.llmCalls} LLM call(s) · est. ${review.llmCostEstimate.toFixed(
            2,
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  container: {padding: spacing.lg, gap: spacing.sm},
  title: {color: colors.textPrimary, fontSize: 24, fontWeight: '800'},
  subtitle: {color: colors.textSecondary, fontSize: 14, marginBottom: spacing.md},
  section: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detected: {color: colors.textTertiary, fontSize: 13},
  choiceRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  choice: {
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  choiceActive: {backgroundColor: colors.accent},
  choiceText: {color: colors.textSecondary, fontSize: 13},
  choiceTextActive: {color: '#0B0E12', fontWeight: '700'},
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  notes: {minHeight: 60, textAlignVertical: 'top'},
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  hint: {color: colors.textTertiary, fontSize: 12, lineHeight: 18},
  primaryBtn: {
    backgroundColor: colors.confHigh,
    borderRadius: radii.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryBtnText: {color: '#0B0E12', fontSize: 17, fontWeight: '700'},
});
