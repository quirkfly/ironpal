// Priors (design §6.2 of the feature PRD; §3.5 kind penalties): founder templates from the
// package (and later gym-pack priors) enter the store as kind='prior'. Precedence is enforced
// by the engine's kind penalty, which grows with the user's own set count per exercise.

import {SignalModule} from '../native/SignalModule';
import {crc32} from './f16';
import {EXTRACTOR_VERSION} from './learner';
import * as store from './store';
import type {ModelPackage, TemplateRow} from '../types/model';

export async function installPackagePriors(pkg: ModelPackage): Promise<number> {
  const existing = new Set((await store.templates({kinds: ['prior'], sources: ['founder']})).map(t => t.id));
  let n = 0;
  await store.transaction(async () => {
    for (const p of pkg.priors) {
      if (existing.has(p.id)) {
        continue;
      }
      const row: TemplateRow = {
        id: p.id,
        exerciseId: p.exercise_id,
        kind: 'prior',
        source: 'founder',
        labeledSetId: null,
        sessionId: null,
        features: p.features,
        windowF16: p.window_f16,
        channels: p.channels,
        rateHz: 50,
        extractorVersion: pkg.extractor_version || EXTRACTOR_VERSION,
        checksum: crc32(p.window_f16),
        pinned: true,
        createdAt: Date.now(),
      };
      await store.insertTemplate(row, null);
      n++;
    }
  });
  return n;
}

/**
 * Load the whole index for a session: own sets + negatives + priors for the given exercises.
 * Priors of an exercise the user has CERTIFIED are left out (retired, feature PRD §6.2).
 */
export async function loadIndex(exerciseIds: string[], certified: Set<string>): Promise<{count: number; bytes: number} | null> {
  const rows = (await store.templates({kinds: ['set', 'negative', 'prior']})).filter(t => {
    if (t.kind === 'negative') {
      return true;
    }
    if (!exerciseIds.includes(t.exerciseId)) {
      return false;
    }
    return !(t.kind === 'prior' && certified.has(t.exerciseId));
  });
  if (!SignalModule.isAvailable()) {
    return null;
  }
  return SignalModule.loadTemplateRows(rows, await store.ownSetCounts(), 'replace');
}
