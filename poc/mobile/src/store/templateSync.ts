import {templatesSync, NetworkError} from '../api/client';
import {SignalModule} from '../native/SignalModule';
import {
  getAllTemplates,
  getSyncVersion,
  setSyncVersion,
  upsertTemplates,
} from './templateStore';
import type {FeatureVector, Template} from '../types/domain';
import type {TemplateSyncWire} from '../api/types';

// Template sync (design §4.1, DR3): GET /templates/sync on launch + at
// "Start set". Version-gated deltas. Stores BOTH representations (D7) and
// loads the synced set into the native matcher cache.

function wireToTemplate(w: TemplateSyncWire): Template {
  return {
    id: w.id,
    exerciseLabel: w.exercise_label,
    takeId: w.take_id,
    deviceOrientation: w.device_orientation,
    sampleRateHz: w.sample_rate_hz,
    featureVector: w.feature_vector as unknown as FeatureVector,
    imuSeriesResampled: w.imu_series_resampled,
    version: w.version,
  };
}

/**
 * Sync templates from the backend if reachable, then push the full local set
 * into the native matcher. Offline-tolerant: on network failure it falls back
 * to the cached templates so matching still works (Q8).
 *
 * @returns the templates now loaded into the matcher.
 */
export async function syncAndLoadTemplates(): Promise<Template[]> {
  try {
    const since = await getSyncVersion();
    const resp = await templatesSync(since);
    if (resp.templates.length > 0) {
      const mapped = resp.templates.map(wireToTemplate);
      await upsertTemplates(mapped);
    }
    if (resp.version > since) {
      await setSyncVersion(resp.version);
    }
  } catch (e) {
    if (!(e instanceof NetworkError)) {
      throw e;
    }
    // Offline — proceed with whatever is cached locally.
  }

  const templates = await getAllTemplates();
  if (SignalModule.isAvailable()) {
    await SignalModule.setTemplates(templates);
  }
  return templates;
}
