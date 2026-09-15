import React from 'react';
import Svg, {Circle, Line, Path, Rect, Text as SvgText} from 'react-native-svg';
import {colors} from '../components/theme';

// Precision glyphs for the Studio (design §13, ledger Q39): code-drawn, tinted by state, no PNGs.
// idle = gunmetal, active = teal-ish accent, bonus = lime, warning = ember (design §17.3).

export const STUDIO_COLORS = {
  idle: '#3A4652',
  active: colors.accent,
  bonus: '#A6E22E',
  warning: '#FF6B35',
  ghost: 'rgba(240,243,246,0.18)',
  lane: '#0B0E12',
  laneAlt: '#11161C',
  trace: '#6B7A89',
  gate: 'rgba(88,166,255,0.16)',
  glance: '#E3B341',
  sync: '#B48EFF',
};

/** A rep mark: a vertical stem with a numbered dot. state: on | off | proposed | rejected. */
export function MarkGlyph({x, h, n, state, selected}: {x: number; h: number; n: number | string; state: 'on' | 'off' | 'proposed' | 'rejected'; selected?: boolean}) {
  const fill = state === 'on' ? STUDIO_COLORS.active : state === 'proposed' ? 'transparent' : state === 'rejected' ? '#2A323B' : '#2A323B';
  const stroke = state === 'on' ? STUDIO_COLORS.active : state === 'proposed' ? STUDIO_COLORS.active : state === 'rejected' ? '#4A5560' : '#4A5560';
  return (
    <>
      <Line x1={x} y1={0} x2={x} y2={h} stroke={stroke} strokeWidth={selected ? 3 : state === 'on' ? 2 : 1} strokeDasharray={state === 'rejected' ? '2,3' : undefined} />
      <Circle cx={x} cy={11} r={selected ? 11 : 9} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {state === 'rejected' ? <Line x1={x - 5} y1={6} x2={x + 5} y2={16} stroke="#8E8E9A" strokeWidth={1.5} /> : null}
      <SvgText x={x} y={15} fontSize={10} fontWeight="800" fill={state === 'on' ? '#0B0E12' : '#8E8E9A'} textAnchor="middle">
        {String(n)}
      </SvgText>
    </>
  );
}

/** A set-bound handle: a bracket shape, so it is a shape and not just a colour (FR-A1). */
export function BoundHandle({x, h, side, active}: {x: number; h: number; side: 'start' | 'end'; active?: boolean}) {
  const d = side === 'start' ? `M ${x + 8} 2 L ${x} 2 L ${x} ${h - 2} L ${x + 8} ${h - 2}` : `M ${x - 8} 2 L ${x} 2 L ${x} ${h - 2} L ${x - 8} ${h - 2}`;
  return <Path d={d} stroke={active ? STUDIO_COLORS.bonus : STUDIO_COLORS.active} strokeWidth={active ? 3 : 2} fill="none" />;
}

/** A pin marker on the filmstrip lane. */
export function PinGlyph({x, y, active}: {x: number; y: number; active?: boolean}) {
  return (
    <>
      <Path d={`M ${x} ${y + 14} L ${x - 6} ${y + 4} A 6 6 0 1 1 ${x + 6} ${y + 4} Z`} fill={active ? STUDIO_COLORS.bonus : STUDIO_COLORS.glance} />
      <Circle cx={x} cy={y + 4} r={2} fill="#0B0E12" />
    </>
  );
}

/** Small inline icons for buttons. */
export function Icon({kind, size = 20, color = colors.textPrimary}: {kind: 'play' | 'pause' | 'frame-prev' | 'frame-next' | 'rep-prev' | 'rep-next' | 'set-prev' | 'set-next' | 'loop' | 'mark' | 'pin' | 'bracket'; size?: number; color?: string}) {
  const s = size;
  const c = s / 2;
  switch (kind) {
    case 'play':
      return <Svg width={s} height={s}><Path d={`M ${c - 5} ${c - 7} L ${c + 7} ${c} L ${c - 5} ${c + 7} Z`} fill={color} /></Svg>;
    case 'pause':
      return <Svg width={s} height={s}><Rect x={c - 6} y={c - 7} width={4} height={14} fill={color} /><Rect x={c + 2} y={c - 7} width={4} height={14} fill={color} /></Svg>;
    case 'frame-prev':
      return <Svg width={s} height={s}><Rect x={c - 7} y={c - 6} width={2} height={12} fill={color} /><Path d={`M ${c + 6} ${c - 6} L ${c - 3} ${c} L ${c + 6} ${c + 6} Z`} fill={color} /></Svg>;
    case 'frame-next':
      return <Svg width={s} height={s}><Rect x={c + 5} y={c - 6} width={2} height={12} fill={color} /><Path d={`M ${c - 6} ${c - 6} L ${c + 3} ${c} L ${c - 6} ${c + 6} Z`} fill={color} /></Svg>;
    case 'rep-prev':
      return <Svg width={s} height={s}><Circle cx={c - 6} cy={c} r={2.5} fill={color} /><Path d={`M ${c + 7} ${c - 6} L ${c - 2} ${c} L ${c + 7} ${c + 6} Z`} fill={color} /></Svg>;
    case 'rep-next':
      return <Svg width={s} height={s}><Circle cx={c + 6} cy={c} r={2.5} fill={color} /><Path d={`M ${c - 7} ${c - 6} L ${c + 2} ${c} L ${c - 7} ${c + 6} Z`} fill={color} /></Svg>;
    case 'set-prev':
      return <Svg width={s} height={s}><Rect x={c - 8} y={c - 6} width={2} height={12} fill={color} /><Path d={`M ${c - 1} ${c - 6} L ${c - 6} ${c} L ${c - 1} ${c + 6} Z`} fill={color} /><Path d={`M ${c + 7} ${c - 6} L ${c + 2} ${c} L ${c + 7} ${c + 6} Z`} fill={color} /></Svg>;
    case 'set-next':
      return <Svg width={s} height={s}><Rect x={c + 6} y={c - 6} width={2} height={12} fill={color} /><Path d={`M ${c + 1} ${c - 6} L ${c + 6} ${c} L ${c + 1} ${c + 6} Z`} fill={color} /><Path d={`M ${c - 7} ${c - 6} L ${c - 2} ${c} L ${c - 7} ${c + 6} Z`} fill={color} /></Svg>;
    case 'loop':
      return <Svg width={s} height={s}><Path d={`M ${c - 6} ${c} A 6 6 0 1 1 ${c} ${c + 6}`} stroke={color} strokeWidth={2} fill="none" /><Path d={`M ${c - 2} ${c + 3} L ${c + 1} ${c + 6} L ${c - 2} ${c + 9}`} stroke={color} strokeWidth={2} fill="none" /></Svg>;
    case 'mark':
      return <Svg width={s} height={s}><Line x1={c} y1={2} x2={c} y2={s - 2} stroke={color} strokeWidth={2} /><Circle cx={c} cy={6} r={4} fill={color} /></Svg>;
    case 'pin':
      return <Svg width={s} height={s}><PinGlyph x={c} y={2} /></Svg>;
    case 'bracket':
      return <Svg width={s} height={s}><Path d={`M ${c - 2} 3 L ${c - 7} 3 L ${c - 7} ${s - 3} L ${c - 2} ${s - 3}`} stroke={color} strokeWidth={2} fill="none" /><Path d={`M ${c + 2} 3 L ${c + 7} 3 L ${c + 7} ${s - 3} L ${c + 2} ${s - 3}`} stroke={color} strokeWidth={2} fill="none" /></Svg>;
  }
}
