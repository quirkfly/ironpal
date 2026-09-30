import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {BackHandler, Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import Svg, {Polyline} from 'react-native-svg';

/**
 * Live set — the screen the promo shows (K7).
 *
 * Deliberately the landing page's interface, not the mission HUD: brand bar, the recognised
 * exercise, reps and weight side by side, an IMU trace and the set log. See
 * web/src/components/AppModules.astro — every colour and weight below is lifted from it so the
 * site and the film show the same product.
 *
 * Driven, not animated. `liveset-tap-rep` adds a rep and `liveset-tap-set` closes the set and
 * starts the next one; both are FULLY TRANSPARENT so a recording of this screen carries no
 * controls. That is what lets a Maestro flow beat out reps in time with the picture instead of
 * the screen running on its own clock (scripts/k7/liveset_demo.yaml).
 *
 * The screen states nothing it cannot support: the weight shown is the one the lifter entered for
 * the set, never a reading the camera produced. Weight-reading is unvalidated — claim 9.
 */

const ACCENT = '#00E5CC';
const HEADING = '#F0F4F8';
const BODY = '#9aa0b4';
const GROUND = '#101023';

export interface LiveSetScreenProps {
  onBack: () => void;
  exercise?: string;
  weightKg?: number;
  /** Reps to close a set at; the log row is written when `liveset-tap-set` fires. */
  repsPerSet?: number;
}

interface LoggedSet {
  n: number;
  reps: number;
  weightKg: number;
}

export function LiveSetScreen({
  onBack,
  exercise = 'Bicep Curl',
  weightKg = 12,
  repsPerSet = 12,
}: LiveSetScreenProps) {
  const [reps, setReps] = useState(0);
  const [setNo, setSetNo] = useState(1);
  const [log, setLog] = useState<LoggedSet[]>([]);
  const [pulse, setPulse] = useState(0);

  // No visible chrome on this screen — it is framed as an inset — so hardware back is the way out.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  // The trace advances on its own so the screen is alive between taps; the SPIKES come from reps.
  useEffect(() => {
    const id = setInterval(() => setPulse(p => p + 1), 90);
    return () => clearInterval(id);
  }, []);

  const addRep = useCallback(() => setReps(r => r + 1), []);

  const closeSet = useCallback(() => {
    setLog(prev => [...prev, {n: setNo, reps: reps || repsPerSet, weightKg}]);
    setSetNo(n => n + 1);
    setReps(0);
  }, [setNo, reps, repsPerSet, weightKg]);

  // A sharp zigzag, matching the trace on the landing page and the approved screen — a sine
  // reads as a heartbeat, a triangle wave reads as motion data.
  const points = useMemo(() => {
    const out: string[] = [];
    const period = 26;
    const amp = 11 + (reps % 2 === 0 ? 0 : 2);
    for (let x = 0; x <= 240; x += period / 2) {
      const k = Math.floor((x + pulse * 2.6) / (period / 2));
      out.push(`${x},${(28 + (k % 2 === 0 ? -amp : amp)).toFixed(1)}`);
    }
    return out.join(' ');
  }, [pulse, reps]);

  return (
    <SafeAreaView style={s.safe} testID="liveset-screen">
      <View style={s.screen}>
        <View style={s.top}>
          <View style={s.brandRow}>
            <View style={s.ring} />
            <Text style={s.brand}>IRONPAL</Text>
          </View>
          <Text style={s.live}>● live</Text>
        </View>

        <View style={[s.card, s.cardFocus]}>
          <Text style={s.lbl}>Exercise</Text>
          <Text testID="liveset-exercise" style={s.exercise}>
            {exercise}
          </Text>
        </View>

        <View style={s.stats}>
          <View style={s.card}>
            <Text style={s.lbl}>Reps</Text>
            <Text testID="liveset-reps" style={s.big}>
              {reps}
            </Text>
          </View>
          <View style={s.card}>
            <Text style={s.lbl}>Weight</Text>
            <Text testID="liveset-weight" style={s.big}>
              {weightKg}
              <Text style={s.unit}> kg</Text>
            </Text>
          </View>
        </View>

        <Svg style={s.spark} viewBox="0 0 240 56" preserveAspectRatio="none">
          <Polyline points={points} fill="none" stroke={ACCENT} strokeWidth={2} />
        </Svg>

        <View style={s.log}>
          {log.map(l => (
            <View key={l.n} style={s.row}>
              <Text style={s.rowText}>Set {l.n}</Text>
              <Text style={s.rowText}>
                {l.reps} × {l.weightKg} kg
              </Text>
            </View>
          ))}
          <View testID="liveset-current-row" style={[s.row, s.rowCur]}>
            <Text style={[s.rowText, s.rowTextCur]}>Set {setNo}</Text>
            <Text style={[s.rowText, s.rowTextCur]}>logging…</Text>
          </View>
        </View>
      </View>

      {/* Invisible drivers. Nothing renders; they exist so Maestro can beat out the set. */}
      <Pressable testID="liveset-tap-rep" style={s.zoneRep} onPress={addRep} />
      <Pressable testID="liveset-tap-set" style={s.zoneSet} onPress={closeSet} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#07070f'},
  screen: {flex: 1, backgroundColor: GROUND, padding: 22, gap: 14},
  top: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  ring: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ACCENT,
    borderBottomColor: 'transparent',
  },
  brand: {color: HEADING, fontWeight: '800', fontSize: 16, letterSpacing: 2},
  live: {color: ACCENT, fontSize: 13, letterSpacing: 1},
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  cardFocus: {flex: 0, borderColor: 'rgba(0,229,204,0.55)', backgroundColor: 'rgba(0,229,204,0.08)'},
  lbl: {color: BODY, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase'},
  exercise: {color: ACCENT, fontWeight: '700', fontSize: 22},
  stats: {flexDirection: 'row', gap: 12},
  big: {color: HEADING, fontWeight: '800', fontSize: 42},
  unit: {color: BODY, fontWeight: '600', fontSize: 18},
  spark: {width: '100%', height: 70, opacity: 0.9},
  log: {marginTop: 'auto', gap: 8},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  rowCur: {backgroundColor: 'rgba(0,229,204,0.07)'},
  rowText: {color: BODY, fontSize: 14},
  rowTextCur: {color: ACCENT},
  // Transparent and unlabelled by design: see the header comment.
  zoneRep: {position: 'absolute', left: 0, right: 0, top: 0, height: '62%'},
  zoneSet: {position: 'absolute', left: 0, width: 90, bottom: 0, height: 90},
});
