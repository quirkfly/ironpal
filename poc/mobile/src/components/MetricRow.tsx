import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from './theme';

// A single HUD metric line with a per-metric confidence badge (spec §9).
// Renders a pending "…" when the value is an async LLM result not yet back (Q8).

interface Props {
  label: string;
  value: string;
  confidence: number | null;
  pending: boolean;
  big?: boolean;
}

function confColor(confidence: number | null): string {
  if (confidence == null) {
    return colors.textTertiary;
  }
  return confidence >= 0.7 ? colors.confHigh : colors.confLow;
}

export function MetricRow({label, value, confidence, pending, big}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueWrap}>
        <Text style={[styles.value, big && styles.valueBig]}>
          {pending ? '…' : value}
        </Text>
        {!pending && confidence != null ? (
          <Text style={[styles.conf, {color: confColor(confidence)}]}>
            {Math.round(confidence * 100)}%
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  valueWrap: {flexDirection: 'row', alignItems: 'baseline'},
  value: {color: colors.textPrimary, fontSize: 22, fontWeight: '700'},
  valueBig: {fontSize: 44},
  conf: {marginLeft: spacing.sm, fontSize: 14, fontWeight: '600'},
});
