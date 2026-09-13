import React, {useMemo} from 'react';
import {LayoutChangeEvent, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors} from '../components/theme';

// The IMU trace with rep marks — the labeling round's centrepiece (design §7.4, FR-T1).
//
// Drawn with plain Views rather than react-native-svg: a bar chart of the band-passed rep
// channel needs no vector library, and adding a native dependency to the P0 build would mean
// another native rebuild for no visual gain.
//
// Marks are TOGGLEABLE, not freely placeable (ledger Q9): the detector's peaks can be turned
// off when it over-counts, and the count can be typed when it under-counts, but dragging new
// marks onto the trace is deliberately not offered in v1.

const BARS = 88;

interface Props {
  /** Decoded window [N][channels]; channel 0..2 = accel, 3..5 = gyro. */
  window: number[][];
  rateHz: number;
  /** Which channel carries the rep signal (from SetResult.dominantChannel; -1 = magnitude). */
  channel: number;
  /** Proposed rep tops in seconds from the window start. */
  marks: number[];
  /** Marks the user has switched OFF (by index into `marks`). */
  disabled: Set<number>;
  onToggle: (index: number) => void;
  /** Set boundaries in seconds, shaded to show what will be learned from. */
  tStart: number;
  tEnd: number;
}

export function RepTrace({window: win, rateHz, channel, marks, disabled, onToggle, tStart, tEnd}: Props) {
  const [width, setWidth] = React.useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const {bars, duration} = useMemo(() => {
    const n = win.length;
    if (n === 0) {
      return {bars: [] as number[], duration: 0};
    }
    const pick = (row: number[]) =>
      channel >= 0 && channel < 3 ? row[channel] : Math.hypot(row[0] ?? 0, row[1] ?? 0, row[2] ?? 0);
    // Bucket the window into BARS columns, each the peak |value| in its slice — peaks are what
    // the rep clock keys on, so averaging would hide exactly the feature being labelled.
    const out: number[] = [];
    const per = Math.max(1, Math.floor(n / BARS));
    for (let i = 0; i < n; i += per) {
      let peak = 0;
      for (let k = i; k < Math.min(n, i + per); k++) {
        peak = Math.max(peak, Math.abs(pick(win[k])));
      }
      out.push(peak);
    }
    const max = out.reduce((a, b) => Math.max(a, b), 0) || 1;
    return {bars: out.map(v => v / max), duration: n / rateHz};
  }, [win, rateHz, channel]);

  const activeCount = marks.length - disabled.size;

  if (bars.length === 0) {
    return (
      <View testID="rep-trace-empty" style={styles.empty}>
        <Text style={styles.emptyText}>No IMU samples in this set — nothing to label.</Text>
      </View>
    );
  }

  const x = (t: number) => (duration > 0 ? (t / duration) * width : 0);

  return (
    <View style={styles.wrap}>
      <View testID="rep-trace" style={styles.chart} onLayout={onLayout}>
        {/* shaded set window */}
        {width > 0 ? (
          <View style={[styles.setBand, {left: x(tStart), width: Math.max(2, x(tEnd) - x(tStart))}]} />
        ) : null}
        <View style={styles.bars}>
          {bars.map((v, i) => (
            <View key={i} style={[styles.bar, {height: `${Math.max(3, v * 100)}%`}]} />
          ))}
        </View>
        {/* rep marks */}
        {width > 0
          ? marks.map((t, i) => {
              const off = disabled.has(i);
              return (
                <Pressable
                  testID={`rep-mark-${i + 1}`}
                  key={i}
                  onPress={() => onToggle(i)}
                  hitSlop={10}
                  style={[styles.markHit, {left: x(t) - 11}]}>
                  <View style={[styles.mark, off && styles.markOff]} />
                  <View style={[styles.markDot, off && styles.markDotOff]}>
                    <Text style={[styles.markNum, off && styles.markNumOff]}>{off ? '–' : i + 1}</Text>
                  </View>
                </Pressable>
              );
            })
          : null}
      </View>
      <Text testID="rep-trace-caption" style={styles.caption}>
        {activeCount} of {marks.length} rep marks on · tap a mark to drop it · {duration.toFixed(1)} s window
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 6},
  chart: {height: 120, backgroundColor: '#0B0E12', borderRadius: 10, overflow: 'hidden', justifyContent: 'flex-end'},
  setBand: {position: 'absolute', top: 0, bottom: 0, backgroundColor: 'rgba(0,229,204,0.10)'},
  bars: {flexDirection: 'row', alignItems: 'flex-end', height: '100%', paddingHorizontal: 2, gap: 1},
  bar: {flex: 1, backgroundColor: '#3A4652', borderRadius: 1, minWidth: 1},
  markHit: {position: 'absolute', top: 0, bottom: 0, width: 22, alignItems: 'center'},
  mark: {position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.accent},
  markOff: {backgroundColor: '#4A5560'},
  markDot: {
    position: 'absolute', top: 2, width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  markDotOff: {backgroundColor: '#2A323B'},
  markNum: {color: '#0B0E12', fontSize: 11, fontWeight: '800'},
  markNumOff: {color: '#8E8E9A'},
  caption: {color: colors.textSecondary, fontSize: 12},
  empty: {height: 120, borderRadius: 10, backgroundColor: '#0B0E12', alignItems: 'center', justifyContent: 'center', padding: 12},
  emptyText: {color: '#FF6B35', fontSize: 13, textAlign: 'center'},
});
