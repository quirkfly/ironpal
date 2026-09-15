import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radii, spacing} from '../components/theme';
import {useDebrief, type DebriefAnswers} from '../controller/useDebrief';
import {useSession} from '../controller/useSession';
import {useSet} from '../controller/useSet';
import {BACKDROP, BADGE, CAMPAIGN, EMBLEM, glyphFor, HUD, rankFor, type CampaignKey} from '../game/assets';
import {repSignalOf} from '../model/packageManager';
import * as store from '../model/store';
import {SignalModule} from '../native/SignalModule';
import type {LevelProgress, LevelState} from '../types/model';
import {LabelingScreen} from './LabelingScreen';
import {IMU_SOURCE} from '../config';
import type {StudioDraft} from '../studio/nav';
import {StudioScreen} from '../studio/StudioScreen';
import type {QueueFocus} from '../types/model';

// The Campaign — the self-training loop wearing the game layer (design §17).
// BRIEF (campaign map + mission card) → ARM (crosshair) → FIRE (rep HUD) → DEBRIEF (the
// labeling round, LabelingScreen) → level change. Audio/haptic cues remain P2.

interface Props {
  onBack: () => void;
  onOpenQueue?: () => void;
  onOpenReel?: (exerciseId: string | null) => void;
}

const CAMPAIGN_ORDER: CampaignKey[] = ['imu', 'vision', 'hard'];

/** Budgets from design §5.1, shown next to the measurement so a regression is legible. */
function benchLine(b: {tickMs: number; matchMs: number; templates: number; memMb: number}): string {
  return (
    `tick ${b.tickMs.toFixed(1)} ms (budget 15) · ` +
    `match ${b.matchMs.toFixed(1)} ms (budget 150) · ` +
    `${b.templates} templates · ${b.memMb.toFixed(0)} MB (budget 60)`
  );
}

/**
 * One string, one Text node — so it reads correctly for every source and so an e2e assertion
 * matches a whole node rather than a fragment React split across children.
 */
function imuStatusLine(
  source: 'PHONE' | 'BLE' | 'REPLAY' | null,
  replayLabel: string | null,
  link: {connected: boolean; mtu: number} | null,
): string {
  if (source === 'BLE') {
    return link?.connected
      ? `IMU: BLE · headband connected (MTU ${link.mtu})`
      : 'IMU: BLE · headband NOT connected — no samples will arrive';
  }
  if (source === 'REPLAY') {
    return `IMU: REPLAY · fixture ${replayLabel ?? 'unknown'}`;
  }
  if (source === 'PHONE') {
    return 'IMU: PHONE · phone sensor';
  }
  return 'IMU: —';
}

export function CampaignScreen({onBack, onOpenQueue, onOpenReel}: Props) {
  const session = useSession();
  const set = useSet();
  const debrief = useDebrief();
  const [campaign, setCampaign] = useState<CampaignKey>('imu');
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<DebriefAnswers>({exerciseId: '', repsConfirmed: null, weight: null, weightUnit: 'kg', weightState: 'confirmed'});
  const [levels, setLevels] = useState<LevelProgress[]>([]);
  const [bench, setBench] = useState<{tickMs: number; matchMs: number; templates: number; memMb: number} | null>(null);
  const [labeling, setLabeling] = useState(false);
  const [studio, setStudio] = useState<{draft: StudioDraft; focus: QueueFocus} | null>(null);
  const [queueCount, setQueueCount] = useState(0);

  const pkg = session.state.pkg;
  const names = useMemo(() => ((pkg as unknown as {exercise_names?: Record<string, string>})?.exercise_names ?? {}), [pkg]);

  const levelOf = useCallback((id: string): LevelState => levels.find(l => l.exerciseId === id)?.state ?? 'locked', [levels]);

  const ids = useMemo(() => {
    if (!pkg) {
      return [] as string[];
    }
    return campaign === 'imu' ? [...pkg.campaign_map.imu, ...pkg.campaign_map.fusion] : pkg.campaign_map[campaign] ?? [];
  }, [pkg, campaign]);

  const xp = levels.reduce((a, l) => a + l.xp, 0);
  const rank = rankFor(xp);

  const refresh = useCallback(async () => {
    setLevels(await store.allLevelProgress());
    setQueueCount(await store.openQueueCount().catch(() => 0));
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh, debrief.outcome]);

  const ctx = pkg && session.state.params && session.state.sessionId
    ? {pkg, params: session.state.params, sessionId: session.state.sessionId, gymId: session.gymId, rotation: session.state.rotation, calibrated: session.state.calibration != null, clipId: set.live.clipId ?? null}
    : null;

  // The phone-on-the-headband rig records sideways (frame-extraction.md: 90°); the BLE rig has no app camera.
  const armOpts = session.state.sessionId ? {sessionId: session.state.sessionId, rigId: IMU_SOURCE === 'BLE' ? 'elp-nano' : 'phone', rotationDeg: 90} : undefined;

  const endSet = async () => {
    const result = await set.end();
    if (result && ctx) {
      await debrief.open(result, ctx, exerciseId);
      const proposed = result.match?.label && result.match.label !== 'unknown' ? result.match.label : exerciseId ?? '';
      const prior = await store.weightPrior(proposed, ctx.gymId);
      setAnswers({
        exerciseId: proposed,
        repsConfirmed: result.repsDetected,
        repTopsSec: result.reps.map(r => r.tPeakSec),
        weight: prior?.weight ?? null,
        weightUnit: prior?.unit ?? 'kg',
        weightState: 'confirmed',
      });
      setLabeling(true);
    }
  };

  const save = async () => {
    if (set.live.result && ctx) {
      const out = await debrief.confirm(set.live.result, answers, ctx);
      if (out) {
        await refresh();
      }
    }
  };

  // ---------------------------------------------------------------- After Action on the open round
  if (studio) {
    return (
      <StudioScreen
        open={{kind: 'draft', draft: studio.draft, focus: studio.focus}}
        names={names}
        levels={Object.fromEntries(levels.map(l => [l.exerciseId, l.state]))}
        onBack={a => {
          if (a) {
            setAnswers(a);
          }
          setStudio(null);
        }}
      />
    );
  }

  // ---------------------------------------------------------------- labeling round
  if (labeling && set.live.result && debrief.proposals) {
    const outcome = debrief.outcome
      ? debrief.outcome.counted
        ? `Clean set · +${debrief.outcome.xpEarned} XP · ${debrief.outcome.templatesAdded} templates${debrief.outcome.level ? ` · ${debrief.outcome.level.from} → ${debrief.outcome.level.to}` : ''}`
        : 'Set kept but not counted — a quality gate failed.'
      : debrief.error;
    return (
      <LabelingScreen
        result={set.live.result}
        proposals={debrief.proposals}
        answers={answers}
        onChange={setAnswers}
        exercises={ids.map(id => ({id, name: names[id] ?? id, state: levelOf(id)}))}
        busy={debrief.busy}
        onSave={() => void save()}
        onBack={() => {
          setLabeling(false);
          set.reset();
        }}
        outcome={outcome}
        onOpenStudio={ctx ? focus => setStudio({draft: {result: set.live.result!, clipId: set.live.clipId ?? null, answers, ctx}, focus}) : undefined}
      />
    );
  }

  // ---------------------------------------------------------------- ARM / FIRE
  if (set.live.phase !== 'idle' && set.live.phase !== 'ended') {
    const armed = set.live.phase === 'armed';
    return (
      <SafeAreaView style={styles.safe}>
        <View testID="hud-root" style={styles.hudRoot}>
          <Text style={styles.hudExercise}>{exerciseId ? (names[exerciseId] ?? exerciseId).toUpperCase() : 'UNKNOWN'}</Text>
          <Image source={armed ? HUD.crosshairIdle : HUD.crosshairLocked} style={styles.crosshair} />
          <Text testID="hud-reps" style={styles.repCount}>{set.live.reps}</Text>
          <Text style={styles.repLabel}>REPS</Text>
          <View style={styles.hudRow}>
            <Image source={armed ? HUD.gateClose : HUD.gateOpen} style={styles.hudIcon} />
            <Text testID="hud-gate-state" style={styles.hudState}>{armed ? 'WAITING FOR MOTION' : set.live.phase.toUpperCase()}</Text>
          </View>
          {set.live.lastRepLatencyMs != null ? <Text style={styles.hudMeta}>cue +{set.live.lastRepLatencyMs.toFixed(0)} ms</Text> : null}
          {set.live.provisionalLabel ? (
            <Text style={styles.hudMeta}>
              {names[set.live.provisionalLabel] ?? set.live.provisionalLabel} · {Math.round(set.live.provisionalConfidence * 100)}% (provisional)
            </Text>
          ) : null}
          {session.state.imuSource === 'BLE' && !set.live.link?.connected ? (
            <View style={styles.linkWarn}>
              <Image source={HUD.linkLost} style={styles.hudIcon} />
              <Text testID="hud-link-warning" style={styles.linkWarnText}>Headband not connected — no samples</Text>
            </View>
          ) : null}
          <Pressable testID="hud-end-set" style={styles.endBtn} onPress={() => void endSet()}>
            <Text style={styles.endBtnText}>END SET</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------- campaign map
  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKDROP.campaign_map} style={styles.bg} imageStyle={styles.bgImg}>
        <ScrollView testID="campaign-screen" contentContainerStyle={styles.container}>
          <View style={styles.topBar}>
            <Pressable onPress={onBack} hitSlop={12}>
              <Text style={styles.back}>‹</Text>
            </Pressable>
            <Text style={styles.title}>CAMPAIGN</Text>
            <View style={styles.rank}>
              <Image source={rank.icon} style={styles.rankIcon} />
              <View>
                <Text testID="rank-name" style={styles.rankName}>{rank.name}</Text>
                <Text testID="rank-xp" style={styles.rankXp}>{xp} XP</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            {session.state.phase === 'idle' ? (
              <Pressable testID="campaign-start-session" style={styles.primary} onPress={() => void session.start(null)}>
                <Image source={EMBLEM.bootcamp} style={styles.primaryIcon} />
                <Text style={styles.primaryText}>START SESSION</Text>
              </Pressable>
            ) : null}
            {session.state.phase === 'starting' ? <Text style={styles.hint}>Starting…</Text> : null}
            {session.state.phase === 'calibrating' ? (
              <>
                <Text style={styles.hint}>Boot camp: wear the band, nod three times sharply, then calibrate.</Text>
                <Pressable testID="campaign-calibrate" style={styles.primary} onPress={() => void session.calibrate()}>
                  <Text style={styles.primaryText}>CALIBRATE</Text>
                </Pressable>
                <Pressable testID="campaign-skip-calibration" onPress={session.skipCalibration}>
                  <Text style={styles.why}>skip</Text>
                </Pressable>
              </>
            ) : null}
            {session.state.phase === 'ready' ? (
              <>
                <Text style={styles.hint}>
                  {session.state.indexCount} templates ·{' '}
                  {session.state.calibration ? `calibrated (${session.state.calibration.angleToPreviousDeg.toFixed(0)}° vs last)` : 'not calibrated'}
                </Text>
                <Text testID="session-imu-status" style={session.state.imuSource === 'BLE' && !set.live.link?.connected ? styles.warn : styles.hint}>
                  {imuStatusLine(session.state.imuSource, session.state.replayLabel, set.live.link)}
                </Text>
                <Pressable testID="campaign-end-session" onPress={() => void session.stop()}>
                  <Text style={styles.why}>end session</Text>
                </Pressable>
              </>
            ) : null}
            {session.state.error ? <Text style={styles.warn}>{session.state.error}</Text> : null}
          </View>

          <View style={styles.tabs}>
            {CAMPAIGN_ORDER.map(key => {
              const on = campaign === key;
              return (
                <Pressable testID={`campaign-tab-${key}`} key={key} style={[styles.tab, on && styles.tabOn]} onPress={() => setCampaign(key)}>
                  <Image source={CAMPAIGN[key].emblem} style={styles.tabEmblem} />
                  <Text style={[styles.tabText, on && styles.tabTextOn]}>{CAMPAIGN[key].title}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text testID="campaign-certifies" style={styles.certifies}>{CAMPAIGN[campaign].certifies}</Text>

          <View style={styles.grid}>
            {ids.map(id => {
              const st = levelOf(id);
              const on = exerciseId === id;
              const prog = levels.find(l => l.exerciseId === id);
              return (
                <Pressable testID={`level-${id}`} key={id} style={[styles.level, on && styles.levelOn]} onPress={() => setExerciseId(id)}>
                  <Image source={BADGE[st]} style={styles.levelBadge} />
                  <Image source={glyphFor(id)} style={styles.levelGlyph} />
                  <Text style={[styles.levelName, on && styles.levelNameOn]} numberOfLines={2}>
                    {names[id] ?? id}
                  </Text>
                  <Text style={styles.levelState}>
                    {st}
                    {prog && prog.cleanSets > 0 ? ` · ${prog.cleanSets}/5` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {session.state.phase === 'ready' && exerciseId ? (
            <ImageBackground source={CAMPAIGN[campaign].backdrop} style={styles.mission} imageStyle={styles.missionImg}>
              <Text testID="mission-title" style={styles.missionTitle}>{(names[exerciseId] ?? exerciseId).toUpperCase()}</Text>
              <Text style={styles.missionLine}>{CAMPAIGN[(pkg && repSignalOf(pkg, exerciseId)) || campaign].certifies}</Text>
              <Text style={styles.missionLine}>
                Two different weights are required to certify · {Math.max(0, 5 - (levels.find(l => l.exerciseId === exerciseId)?.cleanSets ?? 0))} clean sets to go.
              </Text>
              <Pressable testID="mission-arm" style={styles.armBtn} onPress={() => void set.arm(exerciseId, armOpts)}>
                <Image source={HUD.crosshairIdle} style={styles.armIcon} />
                <Text style={styles.armText}>ARM SET</Text>
              </Pressable>
            </ImageBackground>
          ) : null}

          <Pressable testID="campaign-after-action" style={styles.card} onPress={onOpenQueue}>
            <View style={styles.afterAction}>
              <Image source={EMBLEM.scout} style={styles.afterActionEmblem} />
              <View style={{flex: 1}}>
                <Text style={styles.section}>AFTER ACTION</Text>
                <Text testID="campaign-after-action-count" style={styles.hint}>{queueCount ? `${queueCount} to review` : 'nothing to review'} · replay any set frame by frame</Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.card}>
            <Text testID="inspector" style={styles.section}>INSPECTOR</Text>
            {levels.length === 0 ? <Text style={styles.hint}>No levels yet — finish a set to start one.</Text> : null}
            {levels.map(l => (
              <View key={`${l.exerciseId}:${l.gymId}`} style={styles.inspectorRow}>
                <Text testID={`inspector-level-${l.exerciseId}`} style={[styles.hint, {flex: 1}]}>
                  {names[l.exerciseId] ?? l.exerciseId}: {l.state} · {l.cleanSets} sets · {l.distinctWeights} weights · integrity {Math.round(l.integrity * 100)}%
                </Text>
                {onOpenReel ? (
                  <Pressable testID={`inspector-replay-${l.exerciseId}`} onPress={() => onOpenReel(l.exerciseId)} hitSlop={8}>
                    <Text style={styles.why}>replay</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            <Pressable testID="inspector-benchmark" onPress={() => void SignalModule.benchmark().then(setBench)}>
              <Text style={styles.why}>run benchmark</Text>
            </Pressable>
            {bench ? (
              <Text testID="inspector-bench-result" style={styles.hint}>
                {benchLine(bench)}
              </Text>
            ) : null}
          </View>
          <View style={styles.tail} />
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  bg: {flex: 1},
  bgImg: {opacity: 0.28, resizeMode: 'cover'},
  container: {padding: spacing.lg, gap: spacing.md},
  tail: {height: spacing.xl},
  topBar: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  back: {color: colors.accent, fontSize: 26, width: 24},
  title: {color: colors.textPrimary, fontSize: 20, fontWeight: '900', letterSpacing: 2, flex: 1},
  rank: {flexDirection: 'row', alignItems: 'center', gap: 6},
  rankIcon: {width: 34, height: 34, resizeMode: 'contain'},
  rankName: {color: colors.textPrimary, fontSize: 12, fontWeight: '700'},
  rankXp: {color: colors.textSecondary, fontSize: 11},
  card: {backgroundColor: 'rgba(20,25,32,0.92)', borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm},
  afterAction: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  afterActionEmblem: {width: 40, height: 40, resizeMode: 'contain'},
  inspectorRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  section: {color: colors.textSecondary, fontSize: 12, fontWeight: '800', letterSpacing: 1},
  hint: {color: colors.textSecondary, fontSize: 13, lineHeight: 18},
  warn: {color: '#FF6B35', fontSize: 13, lineHeight: 18},
  why: {color: colors.accent, fontSize: 13},
  primary: {backgroundColor: colors.accent, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm},
  primaryIcon: {width: 26, height: 26, resizeMode: 'contain'},
  primaryText: {color: '#0B0E12', fontSize: 15, fontWeight: '900', letterSpacing: 1},
  tabs: {flexDirection: 'row', gap: spacing.sm},
  tab: {flex: 1, alignItems: 'center', padding: spacing.sm, borderRadius: radii.lg, backgroundColor: 'rgba(20,25,32,0.9)', borderWidth: 1, borderColor: 'transparent', gap: 4},
  tabOn: {borderColor: colors.accent},
  tabEmblem: {width: 44, height: 44, resizeMode: 'contain'},
  tabText: {color: colors.textSecondary, fontSize: 11, fontWeight: '700'},
  tabTextOn: {color: colors.textPrimary},
  certifies: {color: colors.textSecondary, fontSize: 12, fontStyle: 'italic'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  level: {width: '31%', backgroundColor: 'rgba(11,14,18,0.92)', borderRadius: radii.lg, padding: spacing.sm, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: 'transparent'},
  levelOn: {borderColor: colors.accent, backgroundColor: '#10222A'},
  levelBadge: {width: 22, height: 22, resizeMode: 'contain'},
  levelGlyph: {width: 36, height: 36, resizeMode: 'contain'},
  levelName: {color: colors.textSecondary, fontSize: 10, textAlign: 'center', minHeight: 24},
  levelNameOn: {color: colors.textPrimary, fontWeight: '700'},
  levelState: {color: colors.textTertiary, fontSize: 9},
  mission: {borderRadius: radii.lg, overflow: 'hidden', padding: spacing.lg, gap: spacing.sm},
  missionImg: {opacity: 0.5, resizeMode: 'cover'},
  missionTitle: {color: colors.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 1},
  missionLine: {color: colors.textSecondary, fontSize: 13, lineHeight: 18},
  armBtn: {backgroundColor: colors.accent, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm},
  armIcon: {width: 24, height: 24, resizeMode: 'contain'},
  armText: {color: '#0B0E12', fontSize: 16, fontWeight: '900', letterSpacing: 1},
  hudRoot: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg},
  hudExercise: {color: colors.textSecondary, fontSize: 14, letterSpacing: 2, fontWeight: '700'},
  crosshair: {width: 160, height: 160, resizeMode: 'contain'},
  repCount: {color: colors.accent, fontSize: 88, fontWeight: '900', lineHeight: 92},
  repLabel: {color: colors.textTertiary, fontSize: 12, letterSpacing: 4},
  hudRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  hudIcon: {width: 26, height: 26, resizeMode: 'contain'},
  hudState: {color: colors.textSecondary, fontSize: 13, letterSpacing: 1},
  hudMeta: {color: colors.textTertiary, fontSize: 12},
  linkWarn: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(255,107,53,0.15)', padding: spacing.sm, borderRadius: radii.lg},
  linkWarnText: {color: '#FF6B35', fontSize: 12},
  endBtn: {marginTop: spacing.xl, backgroundColor: colors.accent, borderRadius: radii.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md},
  endBtnText: {color: '#0B0E12', fontSize: 16, fontWeight: '900', letterSpacing: 1},
});
