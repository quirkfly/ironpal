import React, {useEffect, useRef} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radii, spacing} from '../components/theme';
import {Icon} from './glyphs';
import {JogWheel} from './JogWheel';

// Transport row (studio design §7.4): step buttons, the jog wheel, play/pause with rates, loop-a-rep.
// Long-press on a frame button shuttles at 0.25× in that direction until release.

export const RATES = [0.25, 0.5, 1, 2] as const;

interface Props {
  playing: boolean;
  rate: number;
  loop: boolean;
  canStepSet: {prev: boolean; next: boolean};
  onStepFrame: (dir: 1 | -1) => void;
  onStepRep: (dir: 1 | -1) => void;
  onStepSet: (dir: 1 | -1) => void;
  onJog: (frames: number) => void;
  onTogglePlay: () => void;
  onCycleRate: () => void;
  onToggleLoop: () => void;
  onShuttle: (dir: 1 | -1 | 0) => void;
}

export function Transport(p: Props) {
  const shuttle = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopShuttle = () => {
    if (shuttle.current) {
      clearInterval(shuttle.current);
      shuttle.current = null;
      p.onShuttle(0);
    }
  };
  useEffect(() => stopShuttle, []); // eslint-disable-line react-hooks/exhaustive-deps
  const startShuttle = (dir: 1 | -1) => {
    stopShuttle();
    p.onShuttle(dir);
    shuttle.current = setInterval(() => p.onStepFrame(dir), 133); // 0.25× at 30 fps
  };

  return (
    <View style={styles.row}>
      <Btn testID="studio-step-set-prev" onPress={() => p.onStepSet(-1)} disabled={!p.canStepSet.prev}><Icon kind="set-prev" /></Btn>
      <Btn testID="studio-step-rep-prev" onPress={() => p.onStepRep(-1)}><Icon kind="rep-prev" /></Btn>
      <Btn testID="studio-step-frame-prev" onPress={() => p.onStepFrame(-1)} onLongPress={() => startShuttle(-1)} onPressOut={stopShuttle}><Icon kind="frame-prev" /></Btn>
      <View style={styles.centre}>
        <JogWheel onStep={p.onJog} />
        <View style={styles.playRow}>
          <Pressable testID="studio-play" onPress={p.onTogglePlay} hitSlop={8} style={styles.play}>
            <Icon kind={p.playing ? 'pause' : 'play'} color="#0B0E12" />
          </Pressable>
          <Pressable testID="studio-rate" onPress={p.onCycleRate} hitSlop={8} style={styles.chip}>
            <Text style={styles.chipText}>{p.rate}×</Text>
          </Pressable>
          <Pressable testID="studio-loop-rep" onPress={p.onToggleLoop} hitSlop={8} style={[styles.chip, p.loop && styles.chipOn]}>
            <Icon kind="loop" size={16} color={p.loop ? '#0B0E12' : colors.textSecondary} />
          </Pressable>
        </View>
      </View>
      <Btn testID="studio-step-frame-next" onPress={() => p.onStepFrame(1)} onLongPress={() => startShuttle(1)} onPressOut={stopShuttle}><Icon kind="frame-next" /></Btn>
      <Btn testID="studio-step-rep-next" onPress={() => p.onStepRep(1)}><Icon kind="rep-next" /></Btn>
      <Btn testID="studio-step-set-next" onPress={() => p.onStepSet(1)} disabled={!p.canStepSet.next}><Icon kind="set-next" /></Btn>
    </View>
  );
}

function Btn({testID, onPress, onLongPress, onPressOut, disabled, children}: {testID: string; onPress: () => void; onLongPress?: () => void; onPressOut?: () => void; disabled?: boolean; children: React.ReactNode}) {
  return (
    <Pressable testID={testID} onPress={onPress} onLongPress={onLongPress} onPressOut={onPressOut} disabled={disabled} hitSlop={6} style={[styles.btn, disabled && styles.btnOff]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, gap: 2},
  btn: {width: 44, height: 44, borderRadius: radii.md, backgroundColor: '#161B22', alignItems: 'center', justifyContent: 'center'},
  btnOff: {opacity: 0.3},
  centre: {alignItems: 'center', gap: 4},
  playRow: {flexDirection: 'row', gap: 6, alignItems: 'center'},
  play: {width: 36, height: 28, borderRadius: radii.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center'},
  chip: {height: 28, minWidth: 40, paddingHorizontal: 8, borderRadius: radii.md, backgroundColor: '#161B22', alignItems: 'center', justifyContent: 'center'},
  chipOn: {backgroundColor: colors.accent},
  chipText: {color: colors.textSecondary, fontSize: 12, fontWeight: '700'},
});
