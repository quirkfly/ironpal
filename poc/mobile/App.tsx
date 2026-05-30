import React, {useEffect, useState} from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {colors, radii, spacing} from './src/components/theme';
import {USER_ROLE} from './src/config';
import {EnrollScreen} from './src/screens/EnrollScreen';
import {LiveHudScreen} from './src/screens/LiveHudScreen';
import {drainQueues} from './src/store/offlineQueue';
import {syncAndLoadTemplates} from './src/store/templateSync';
import type {AppMode} from './src/types/domain';

// Mode controller (design §4.1): enroll (founder-only, Q1) vs live. Testers
// (role=tester) only get live mode — they never enroll (Q1/Q2).

type Screen = 'home' | 'enroll' | 'live';

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('home');
  const isFounder = USER_ROLE === 'founder';

  // On launch: drain queued work and refresh the template cache (DR3 / Q8).
  useEffect(() => {
    (async () => {
      try {
        await drainQueues();
        await syncAndLoadTemplates();
      } catch (e) {
        console.warn('[App] launch sync/drain failed (offline ok):', e);
      }
    })();
  }, []);

  const goMode = (mode: AppMode) =>
    setScreen(mode === 'enroll' ? 'enroll' : 'live');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {screen === 'enroll' ? (
        <EnrollScreen onBack={() => setScreen('home')} />
      ) : screen === 'live' ? (
        <LiveHudScreen onBack={() => setScreen('home')} />
      ) : (
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
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
          </View>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  container: {flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.lg},
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
