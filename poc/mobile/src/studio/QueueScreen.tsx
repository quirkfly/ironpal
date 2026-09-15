import React, {useCallback, useEffect, useState} from 'react';
import {Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radii, spacing} from '../components/theme';
import {BACKDROP, EMBLEM} from '../game/assets';
import {DISMISS_REASONS, dismissQueueItem, openQueueWithContext} from '../model/queue';
import * as store from '../model/store';
import type {QueueItem} from '../types/model';
import type {StudioOpen} from './nav';

// After Action — the queue (studio design §7.9): the model's questions, ordered by what it is
// least sure of. Each row is one sentence in the model's voice and one tap from the Studio.

interface Props {
  names: Record<string, string>;
  onBack: () => void;
  onOpenStudio: (open: StudioOpen) => void;
  onOpenReel: (sessionId: string | null) => void;
}

type Row = QueueItem & {exerciseId: string | null; sessionId: string | null};

export function QueueScreen({names, onBack, onOpenStudio, onOpenReel}: Props) {
  const [items, setItems] = useState<Row[]>([]);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [regions, setRegions] = useState(0);

  const refresh = useCallback(async () => {
    setItems(await openQueueWithContext());
    setRegions(await store.openRegionCount());
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openItem = async (q: Row) => {
    if (q.labeledSetId) {
      onOpenStudio({kind: 'set', labeledSetId: q.labeledSetId, focus: q.focus, queueItemId: q.id});
    } else {
      onOpenReel(q.sessionId);
    }
  };

  const dismiss = async (q: Row, reason: string) => {
    await dismissQueueItem(q.id, reason);
    void store.studioEvent({kind: 'queue_dismiss', labeledSetId: q.labeledSetId});
    setDismissing(null);
    await refresh();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKDROP.debrief} style={styles.bg} imageStyle={styles.bgImg}>
        <ScrollView testID="queue-screen" contentContainerStyle={styles.container}>
          <View style={styles.topBar}>
            <Pressable testID="queue-back" onPress={onBack} hitSlop={12}>
              <Text style={styles.back}>‹</Text>
            </Pressable>
            <Image source={EMBLEM.scout} style={styles.emblem} />
            <View style={{flex: 1}}>
              <Text style={styles.title}>AFTER ACTION</Text>
              <Text testID="queue-count" style={styles.sub}>{items.length} to review{regions ? ` · ${regions} untagged` : ''}</Text>
            </View>
            <Pressable testID="queue-open-reel" onPress={() => onOpenReel(null)} hitSlop={10}>
              <Text style={styles.link}>Reel</Text>
            </Pressable>
          </View>

          {items.length === 0 ? (
            <View style={styles.card}>
              <Text testID="queue-empty" style={styles.hint}>Nothing to review. The model has no open questions — every set is either clean, tagged, or dismissed with a reason.</Text>
            </View>
          ) : null}

          {items.map(q => (
            <View key={q.id} style={styles.card}>
              <Pressable testID={`queue-item-${q.id}`} onPress={() => void openItem(q)} onLongPress={() => setDismissing(dismissing === q.id ? null : q.id)}>
                <Text style={styles.kind}>
                  {q.priority} · {q.kind.replace('_', ' ')}{q.exerciseId ? ` · ${names[q.exerciseId] ?? q.exerciseId}` : ''}
                </Text>
                <Text style={styles.text}>{q.text}</Text>
                <Text style={styles.meta}>opens on {q.focus} · long-press to dismiss</Text>
              </Pressable>
              {dismissing === q.id ? (
                <View style={styles.reasons}>
                  {DISMISS_REASONS.map(r => (
                    <Pressable testID={`queue-dismiss-${r.key}`} key={r.key} style={styles.reason} onPress={() => void dismiss(q, r.key)}>
                      <Text style={styles.reasonText}>{r.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
          <View style={{height: spacing.xl}} />
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  bg: {flex: 1},
  bgImg: {opacity: 0.22, resizeMode: 'cover'},
  container: {padding: spacing.lg, gap: spacing.md},
  topBar: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  back: {color: colors.accent, fontSize: 26, width: 24},
  emblem: {width: 44, height: 44, resizeMode: 'contain'},
  title: {color: colors.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 2},
  sub: {color: colors.textSecondary, fontSize: 12},
  link: {color: colors.accent, fontSize: 14, fontWeight: '700'},
  card: {backgroundColor: 'rgba(20,25,32,0.92)', borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs},
  kind: {color: colors.textTertiary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1},
  text: {color: colors.textPrimary, fontSize: 14, lineHeight: 20},
  meta: {color: colors.textTertiary, fontSize: 11},
  hint: {color: colors.textSecondary, fontSize: 13, lineHeight: 18},
  reasons: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs},
  reason: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.full, backgroundColor: '#0B0E12'},
  reasonText: {color: colors.textSecondary, fontSize: 12},
});
