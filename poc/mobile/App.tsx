import React, {useEffect, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {colors, radii, spacing} from './src/components/theme';
import {USER_ROLE} from './src/config';
import {ensureBundled} from './src/model/packageManager';
import {reduceExpiredClips} from './src/model/clips';
import * as store from './src/model/store';
import {CampaignScreen} from './src/screens/CampaignScreen';
import {EnrollScreen} from './src/screens/EnrollScreen';
import {LiveHudScreen} from './src/screens/LiveHudScreen';
import {ImportScreen} from './src/studio/ImportScreen';
import type {ReelOpen, StudioOpen} from './src/studio/nav';
import {QueueScreen} from './src/studio/QueueScreen';
import {ReelScreen} from './src/studio/ReelScreen';
import {StudioScreen} from './src/studio/StudioScreen';
import {drainQueues} from './src/store/offlineQueue';
import {syncAndLoadTemplates} from './src/store/templateSync';
import type {AppMode} from './src/types/domain';
import type {LevelState} from './src/types/model';

// Mode controller (design §4.1): enroll (founder-only, Q1) vs live. Testers
// (role=tester) only get live mode — they never enroll (Q1/Q2).

type Screen = 'home' | 'enroll' | 'live' | 'campaign' | 'queue' | 'reel' | 'studio' | 'import';

/** The Studio surfaces' navigation params (studio design §6) — a tiny stack, no nav library. */
interface StudioNav {
  reel: ReelOpen;
  studio: {open: StudioOpen; neighbours: {prev: string | null; next: string | null}; from: 'queue' | 'reel'} | null;
}

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('home');
  const [nav, setNav] = useState<StudioNav>({reel: {}, studio: null});
  const [names, setNames] = useState<Record<string, string>>({});
  const [levels, setLevels] = useState<Record<string, LevelState>>({});
  const [queueCount, setQueueCount] = useState(0);
  const isFounder = USER_ROLE === 'founder';

  // Package names + level states feed the Studio surfaces; refreshed whenever we return home.
  const refreshStudioContext = async () => {
    try {
      const pkg = await ensureBundled();
      setNames((pkg as unknown as {exercise_names?: Record<string, string>}).exercise_names ?? {});
      const lv: Record<string, LevelState> = {};
      for (const l of await store.allLevelProgress()) {
        lv[l.exerciseId] = l.state;
      }
      setLevels(lv);
      setQueueCount(await store.openQueueCount());
    } catch {
      // first run / offline: the screens cope with empty maps
    }
  };
  useEffect(() => {
    if (screen === 'home' || screen === 'queue' || screen === 'reel') {
      void refreshStudioContext();
    }
  }, [screen]);

  // On launch: drain queued work and refresh the template cache (DR3 / Q8).
  useEffect(() => {
    (async () => {
      try {
        await drainQueues();
        await syncAndLoadTemplates();
        await reduceExpiredClips().catch(() => 0); // 7-day reduction (studio design §11.4)
      } catch (e) {
        console.warn('[App] launch sync/drain failed (offline ok):', e);
      }
    })();
  }, []);

  const goMode = (mode: AppMode) =>
    setScreen(mode === 'enroll' ? 'enroll' : 'live');

  const openStudio = (open: StudioOpen, neighbours: {prev: string | null; next: string | null}, from: 'queue' | 'reel') => {
    setNav(n => ({...n, studio: {open, neighbours, from}}));
    setScreen('studio');
  };
  const openReel = (reel: ReelOpen) => {
    setNav(n => ({...n, reel}));
    setScreen('reel');
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {screen === 'enroll' ? (
        <EnrollScreen onBack={() => setScreen('home')} />
      ) : screen === 'live' ? (
        <LiveHudScreen onBack={() => setScreen('home')} />
      ) : screen === 'campaign' ? (
        <CampaignScreen onBack={() => setScreen('home')} onOpenQueue={() => setScreen('queue')} onOpenReel={exerciseId => openReel({exerciseId})} />
      ) : screen === 'queue' ? (
        <QueueScreen names={names} onBack={() => setScreen('home')} onOpenStudio={open => openStudio(open, {prev: null, next: null}, 'queue')} onOpenReel={sessionId => openReel({sessionId})} />
      ) : screen === 'reel' ? (
        <ReelScreen
          names={names}
          initialSessionId={nav.reel.sessionId ?? null}
          initialExerciseId={nav.reel.exerciseId ?? null}
          onBack={() => setScreen('home')}
          onOpenStudio={(open, neighbours) => openStudio(open, neighbours, 'reel')}
        />
      ) : screen === 'studio' && nav.studio ? (
        <StudioScreen
          key={nav.studio.open.kind === 'set' ? nav.studio.open.labeledSetId : 'draft'}
          open={nav.studio.open}
          names={names}
          levels={levels}
          neighbours={nav.studio.neighbours}
          onOpenSet={id => openStudio({kind: 'set', labeledSetId: id}, {prev: null, next: null}, nav.studio!.from)}
          onBack={() => setScreen(nav.studio!.from)}
        />
      ) : screen === 'import' ? (
        <ImportScreen onBack={() => setScreen('home')} onDone={sessionId => openReel({sessionId})} />
      ) : (
        <SafeAreaView style={styles.safe}>
          {/* Scrollable: the home list grew past one screen on a 1440x3120 phone once After
              Action and Import were added, which pushed the brand off the top. */}
          <ScrollView testID="home-screen" contentContainerStyle={styles.container}>
            <Text style={styles.brand}>IronPal</Text>
            <Text style={styles.tag}>POC v1 · {USER_ROLE}</Text>

            {isFounder ? (
              <Pressable
                style={styles.btn}
                onPress={() => goMode('enroll')}>
                <Text style={styles.btnText}>Enroll templates</Text>
                <Text style={styles.btnSub}>Founder-only · record fingerprints</Text>
              </Pressable>
            ) : null}

            <Pressable style={styles.btn} onPress={() => setScreen('campaign')}>
              <Text style={styles.btnText}>Campaign (self-training P0)</Text>
              <Text style={styles.btnSub}>Session · calibrate · arm · set · debrief · learn</Text>
            </Pressable>

            <Pressable testID="home-after-action" style={styles.btn} onPress={() => setScreen('queue')}>
              <Text style={styles.btnText}>After Action{queueCount ? ` · ${queueCount}` : ''}</Text>
              <Text style={styles.btnSub}>Replay sets · fix labels · the model's questions</Text>
            </Pressable>

            {isFounder ? (
              <Pressable testID="home-import" style={styles.btn} onPress={() => setScreen('import')}>
                <Text style={styles.btnText}>Import rig video</Text>
                <Text style={styles.btnSub}>Founder-only · ShenYao / gallery clips + session.json</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => goMode('live')}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>
                Live workout
              </Text>
              <Text style={[styles.btnSub, styles.btnSubPrimary]}>
                Recognize · count reps · read weight
              </Text>
            </Pressable>

            {!isFounder ? (
              <Text style={styles.note}>
                Tester mode: live only. Templates are founder-authored (Q1).
              </Text>
            ) : null}
            <View style={styles.tail} />
          </ScrollView>
        </SafeAreaView>
      )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  // Top-aligned, not centred: centring content that is TALLER than the viewport clips it at
  // both ends, which hid the brand on a 411x830 dp screen and failed the launch assertion.
  container: {flexGrow: 1, padding: spacing.xl, paddingTop: spacing.xxl, gap: spacing.lg},
  tail: {height: spacing.xl},
  brand: {color: colors.textPrimary, fontSize: 40, fontWeight: '900'},
  tag: {color: colors.textSecondary, fontSize: 15, marginBottom: spacing.xl},
  btn: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  btnPrimary: {backgroundColor: colors.accent},
  btnText: {color: colors.textPrimary, fontSize: 20, fontWeight: '700'},
  btnTextPrimary: {color: '#0B0E12'},
  btnSub: {color: colors.textSecondary, fontSize: 13, marginTop: spacing.xs},
  btnSubPrimary: {color: '#0B0E12', opacity: 0.7},
  note: {color: colors.textTertiary, fontSize: 13, marginTop: spacing.lg},
});

export default App;
