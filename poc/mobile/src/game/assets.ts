// Static asset registry for the Campaign layer (design §17.6).
//
// React Native's bundler resolves `require` of an image at BUILD time from a string
// LITERAL — it cannot resolve `require('../../assets/game/' + id + '.png')`. Anything
// not literally required here is simply absent from the APK, which is exactly what
// happened to the first 44 generated files: they sat in the repo and shipped nothing.
// Every asset the game can draw must therefore appear, spelled out, in this file.

import type {ImageSourcePropType} from 'react-native';
import type {LevelState} from '../types/model';

// --- HUD glyphs (drawn locally by scripts/game/draw-hud.py, tintable geometry) ---
export const HUD = {
  crosshairIdle: require('../../assets/game/hud/hud_crosshair_idle.png'),
  crosshairLocked: require('../../assets/game/hud/hud_crosshair_locked.png'),
  hitmarker: require('../../assets/game/hud/hud_hitmarker.png'),
  hitmarkerBonus: require('../../assets/game/hud/hud_hitmarker_bonus.png'),
  gateOpen: require('../../assets/game/hud/hud_gate_open.png'),
  gateClose: require('../../assets/game/hud/hud_gate_close.png'),
  linkLost: require('../../assets/game/hud/hud_link_lost.png'),
  armorMeter: require('../../assets/game/hud/hud_armor_meter.png'),
  magazine: require('../../assets/game/hud/hud_magazine.png'),
  targetPlate: require('../../assets/game/hud/hud_target_plate.png'),
  targetPin: require('../../assets/game/hud/hud_target_pin.png'),
  targetDumbbell: require('../../assets/game/hud/hud_target_dumbbell.png'),
} satisfies Record<string, ImageSourcePropType>;

// --- Campaign emblems (Leonardo SDXL) ---
export const EMBLEM = {
  ground_game: require('../../assets/game/emblems/emblem_ground_game.png'),
  arms: require('../../assets/game/emblems/emblem_arms.png'),
  black_ops: require('../../assets/game/emblems/emblem_black_ops.png'),
  scout: require('../../assets/game/emblems/emblem_scout.png'),
  bootcamp: require('../../assets/game/emblems/emblem_bootcamp.png'),
} satisfies Record<string, ImageSourcePropType>;

// --- Level-state badges ---
export const BADGE: Record<LevelState, ImageSourcePropType> = {
  locked: require('../../assets/game/badges/badge_locked.png'),
  recon: require('../../assets/game/badges/badge_recon.png'),
  provisional: require('../../assets/game/badges/badge_provisional.png'),
  certified: require('../../assets/game/badges/badge_certified.png'),
  veteran: require('../../assets/game/badges/badge_veteran.png'),
};

// --- Equipment-class glyphs (ontology `equipment_class`) ---
export const GLYPH = {
  barbell: require('../../assets/game/glyphs/glyph_barbell.png'),
  dumbbell: require('../../assets/game/glyphs/glyph_dumbbell.png'),
  cable: require('../../assets/game/glyphs/glyph_cable.png'),
  machine: require('../../assets/game/glyphs/glyph_machine.png'),
  bodyweight: require('../../assets/game/glyphs/glyph_bodyweight.png'),
} satisfies Record<string, ImageSourcePropType>;

// --- Rank insignia (cosmetic, XP tiers) ---
export const RANK: ImageSourcePropType[] = [
  require('../../assets/game/ranks/rank_1_recruit.png'),
  require('../../assets/game/ranks/rank_2_private.png'),
  require('../../assets/game/ranks/rank_3_corporal.png'),
  require('../../assets/game/ranks/rank_4_sergeant.png'),
  require('../../assets/game/ranks/rank_5_lieutenant.png'),
  require('../../assets/game/ranks/rank_6_commander.png'),
];

export const RANK_NAME = ['Recruit', 'Private', 'Corporal', 'Sergeant', 'Lieutenant', 'Commander'];

// --- Station markers (Scout territory) ---
export const FLAG = {
  uncharted: require('../../assets/game/territory/flag_uncharted.png'),
  charted: require('../../assets/game/territory/flag_charted.png'),
  contested: require('../../assets/game/territory/flag_contested.png'),
} satisfies Record<string, ImageSourcePropType>;

// --- Wide backdrops ---
export const BACKDROP = {
  campaign_map: require('../../assets/game/backdrops/bg_campaign_map.jpg'),
  briefing_ground: require('../../assets/game/backdrops/bg_briefing_ground.jpg'),
  briefing_arms: require('../../assets/game/backdrops/bg_briefing_arms.jpg'),
  briefing_blackops: require('../../assets/game/backdrops/bg_briefing_blackops.jpg'),
  bootcamp: require('../../assets/game/backdrops/bg_bootcamp.jpg'),
  debrief: require('../../assets/game/backdrops/bg_debrief.jpg'),
  level_cleared: require('../../assets/game/backdrops/bg_level_cleared.jpg'),
  mission_failed: require('../../assets/game/backdrops/bg_mission_failed.jpg'),
} satisfies Record<string, ImageSourcePropType>;

/** Campaigns are keyed on the ontology's `rep_signal` (design §5.2). */
export type CampaignKey = 'imu' | 'fusion' | 'vision' | 'hard';

export const CAMPAIGN = {
  imu: {title: 'Ground Game', emblem: EMBLEM.ground_game, backdrop: BACKDROP.briefing_ground, certifies: 'Exercise + reps from the headband.'},
  fusion: {title: 'Ground Game', emblem: EMBLEM.ground_game, backdrop: BACKDROP.briefing_ground, certifies: 'Exercise + reps, with a vision cross-check.'},
  vision: {title: 'Arms', emblem: EMBLEM.arms, backdrop: BACKDROP.briefing_arms, certifies: 'Exercise ID + weight. Reps need your confirmation.'},
  hard: {title: 'Black Ops', emblem: EMBLEM.black_ops, backdrop: BACKDROP.briefing_blackops, certifies: 'Exercise + weight only — a headband cannot count these reps.'},
} as const;

/** Best-effort equipment glyph from an ontology exercise id. */
export function glyphFor(exerciseId: string): ImageSourcePropType {
  const id = exerciseId.toLowerCase();
  if (id.includes('barbell') || id.includes('deadlift') || id.includes('squat') === false && id.includes('bench')) {
    return GLYPH.barbell;
  }
  if (id.includes('dumbbell') || id.includes('goblet') || id.includes('lunge') || id.includes('split-squat')) {
    return GLYPH.dumbbell;
  }
  if (id.includes('cable') || id.includes('pulldown') || id.includes('pushdown') || id.includes('row') && id.includes('seated')) {
    return GLYPH.cable;
  }
  if (id.includes('machine') || id.includes('press') && id.includes('leg') || id.includes('extension') || id.includes('curl') && id.includes('seated')) {
    return GLYPH.machine;
  }
  if (id.includes('pull-up') || id.includes('chin-up') || id.includes('dip') || id.includes('push-up')) {
    return GLYPH.bodyweight;
  }
  if (id.includes('squat')) {
    return GLYPH.barbell;
  }
  return GLYPH.machine;
}

export function rankFor(xp: number): {icon: ImageSourcePropType; name: string; tier: number} {
  const tier = Math.min(RANK.length - 1, Math.floor(xp / 500));
  return {icon: RANK[tier], name: RANK_NAME[tier], tier: tier + 1};
}
