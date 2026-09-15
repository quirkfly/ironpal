import React, {useRef} from 'react';
import {StyleSheet, View, Vibration} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Svg, {Circle, Line, Path} from 'react-native-svg';
import {colors} from '../components/theme';
import {STUDIO_COLORS} from './glyphs';

// The jog wheel (studio design §7.4, ledger Q15): a circular pan whose angular travel maps to
// frames with detents — 12° per frame at rest, ×4 above 360°/s — each detent a haptic tick.
// Final Cut Pro for iPad's wheel behaviour, calibrated to a phone thumb.

const SIZE = 96;
const DEG_PER_FRAME = 12;
const FAST_DEG_PER_SEC = 360;

interface Props {
  onStep: (frames: number) => void;
  disabled?: boolean;
}

export function JogWheel({onStep, disabled}: Props) {
  const lastAngle = useRef<number | null>(null);
  const lastTime = useRef(0);
  const acc = useRef(0);

  const angleOf = (x: number, y: number) => (Math.atan2(y - SIZE / 2, x - SIZE / 2) * 180) / Math.PI;

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin(e => {
      lastAngle.current = angleOf(e.x, e.y);
      lastTime.current = Date.now();
      acc.current = 0;
    })
    .onUpdate(e => {
      if (disabled) {
        return;
      }
      const a = angleOf(e.x, e.y);
      if (lastAngle.current == null) {
        lastAngle.current = a;
        return;
      }
      let d = a - lastAngle.current;
      if (d > 180) {
        d -= 360;
      } else if (d < -180) {
        d += 360;
      }
      lastAngle.current = a;
      const now = Date.now();
      const dt = Math.max(1, now - lastTime.current) / 1000;
      lastTime.current = now;
      const speed = Math.abs(d) / dt;
      const perDetent = speed > FAST_DEG_PER_SEC ? 0.25 : 1;
      acc.current += d / DEG_PER_FRAME / perDetent;
      const whole = acc.current > 0 ? Math.floor(acc.current) : Math.ceil(acc.current);
      if (whole !== 0) {
        acc.current -= whole;
        onStep(whole);
        Vibration.vibrate(10);
      }
    })
    .onFinalize(() => {
      lastAngle.current = null;
    });

  const ticks = [];
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    const r1 = SIZE / 2 - 4;
    const r2 = i % 5 === 0 ? SIZE / 2 - 12 : SIZE / 2 - 8;
    ticks.push(<Line key={i} x1={SIZE / 2 + r1 * Math.cos(a)} y1={SIZE / 2 + r1 * Math.sin(a)} x2={SIZE / 2 + r2 * Math.cos(a)} y2={SIZE / 2 + r2 * Math.sin(a)} stroke={STUDIO_COLORS.idle} strokeWidth={i % 5 === 0 ? 2 : 1} />);
  }

  return (
    <GestureDetector gesture={pan}>
      <View testID="studio-jog" accessibilityLabel="jog wheel" accessibilityRole="adjustable" style={[styles.wrap, disabled && styles.disabled]}>
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 1} fill="#11161C" stroke={STUDIO_COLORS.idle} strokeWidth={1.5} />
          {ticks}
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 18} fill="#0B0E12" stroke="#2A323B" />
          <Path d={`M ${SIZE / 2} ${SIZE / 2 - 22} L ${SIZE / 2 - 5} ${SIZE / 2 - 12} L ${SIZE / 2 + 5} ${SIZE / 2 - 12} Z`} fill={colors.accent} />
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={5} fill={colors.accent} />
        </Svg>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center'},
  disabled: {opacity: 0.4},
});
