import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radii, spacing} from '../components/theme';
import {importClip, syncFromSessionJson} from '../model/clips';
import {enqueueImported} from '../model/queue';
import * as store from '../model/store';
import {ClipModule, type IngestProgress} from '../native/ClipModule';
import type {ClipSource, ClipSync} from '../types/model';

// Import & sync (studio design §7.10) — the founder path for rig video. No document picker is
// installed, so paths are typed or pasted; the ShenYao rig writes to /sdcard/DCIM/USBCamera/.

interface Props {
  onBack: () => void;
  onDone: (sessionId: string) => void;
}

const ROTATIONS = [0, 90, 180, 270];

export function ImportScreen({onBack, onDone}: Props) {
  const [master, setMaster] = useState('/sdcard/DCIM/USBCamera/');
  const [sessionJson, setSessionJson] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [rotation, setRotation] = useState(180);
  const [source, setSource] = useState<ClipSource>('shenyao');
  const [progress, setProgress] = useState<IngestProgress | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => ClipModule.onProgress(setProgress), []);
  useEffect(() => {
    const name = master.split('/').pop() ?? '';
    setRotation(name.startsWith('IPS_') ? 180 : 90);
  }, [master]);

  const run = async () => {
    setBusy(true);
    setLine(null);
    try {
      let sync: ClipSync = {pts0HostNs: 0, rate: 1, residualMs: null, class: 'none', source: 'none'};
      if (sessionJson.trim()) {
        try {
          sync = syncFromSessionJson(JSON.parse(await ClipModule.readTextFile(sessionJson.trim())));
        } catch (e) {
          setLine(`session.json unreadable (${(e as Error).message}) — importing as video-only.`);
        }
      }
      const sid = sessionId.trim() || `import_${Date.now()}`;
      const existing = await store.session(sid);
      if (!existing) {
        await store.upsertSession({id: sid, startedAt: Date.now(), gymId: null, rigId: source === 'shenyao' ? 'elp-shenyao' : 'gallery', imuSource: null, rotationDeg: rotation, seqGaps: 0, logDir: null});
      }
      const clip = await importClip({sessionId: sid, masterPath: master.trim(), source, rotationDeg: rotation, sync});
      await enqueueImported(sid, clip.id);
      setLine(`Imported ${clip.frames ?? '?'} frames · sync ${clip.sync.class}${clip.proxyPath ? ' · proxy ready' : ' · no proxy (master will play)'}`);
      onDone(sid);
    } catch (e) {
      setLine(`Import failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView testID="import-screen" contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <Pressable testID="import-back" onPress={onBack} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable>
          <Text style={styles.title}>IMPORT & SYNC</Text>
        </View>
        <Text style={styles.hint}>Founder path for rig video. The clip stays on the phone; a proxy is built for scrubbing. Alignment comes from the laptop's session.json (scripts/kb/sync_imu_video.py); without it the clip imports as video-only.</Text>

        <Text style={styles.label}>video file</Text>
        <TextInput testID="import-master" style={styles.input} value={master} onChangeText={setMaster} autoCapitalize="none" autoCorrect={false} placeholder="/sdcard/DCIM/USBCamera/IPS_….mp4" placeholderTextColor={colors.textTertiary} />
        <Text style={styles.label}>session.json (optional)</Text>
        <TextInput testID="import-session-json" style={styles.input} value={sessionJson} onChangeText={setSessionJson} autoCapitalize="none" autoCorrect={false} placeholder="/sdcard/…/session.json" placeholderTextColor={colors.textTertiary} />
        <Text style={styles.label}>session id (optional — attach to an existing session)</Text>
        <TextInput testID="import-session-id" style={styles.input} value={sessionId} onChangeText={setSessionId} autoCapitalize="none" autoCorrect={false} placeholder="sess_…" placeholderTextColor={colors.textTertiary} />

        <Text style={styles.label}>rotation</Text>
        <View style={styles.row}>
          {ROTATIONS.map(r => (
            <Pressable testID={`import-rotation-${r}`} key={r} style={[styles.chip, rotation === r && styles.chipOn]} onPress={() => setRotation(r)}>
              <Text style={[styles.chipText, rotation === r && styles.chipTextOn]}>{r}°</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>source</Text>
        <View style={styles.row}>
          {(['shenyao', 'gallery'] as ClipSource[]).map(s => (
            <Pressable testID={`import-source-${s}`} key={s} style={[styles.chip, source === s && styles.chipOn]} onPress={() => setSource(s)}>
              <Text style={[styles.chipText, source === s && styles.chipTextOn]}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable testID="import-run" style={[styles.primary, busy && styles.disabled]} disabled={busy} onPress={() => void run()}>
          <Text style={styles.primaryText}>{busy ? 'IMPORTING…' : 'IMPORT'}</Text>
        </Pressable>
        {progress ? <Text testID="import-progress" style={styles.hint}>{progress.step} · {Math.round(progress.progress * 100)}%{progress.error ? ` · ${progress.error}` : ''}</Text> : null}
        {line ? <Text testID="import-line" style={styles.line}>{line}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  container: {padding: spacing.lg, gap: spacing.sm},
  topBar: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  back: {color: colors.accent, fontSize: 26, width: 24},
  title: {color: colors.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 2},
  hint: {color: colors.textSecondary, fontSize: 12, lineHeight: 17},
  label: {color: colors.textTertiary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.sm},
  input: {color: colors.textPrimary, borderColor: colors.textTertiary, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 13},
  row: {flexDirection: 'row', gap: 6, flexWrap: 'wrap'},
  chip: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full, backgroundColor: '#161B22'},
  chipOn: {backgroundColor: colors.accent},
  chipText: {color: colors.textSecondary, fontSize: 12},
  chipTextOn: {color: '#0B0E12', fontWeight: '700'},
  primary: {backgroundColor: colors.accent, borderRadius: radii.lg, padding: spacing.md, alignItems: 'center', marginTop: spacing.md},
  primaryText: {color: '#0B0E12', fontSize: 15, fontWeight: '900', letterSpacing: 1},
  disabled: {opacity: 0.4},
  line: {color: colors.accent, fontSize: 13},
});
