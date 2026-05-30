import {getDb} from './db';
import type {FeatureVector, Template} from '../types/domain';

// Local cache of synced founder templates for OFFLINE matching (design §4.1).
// Stores both representations (D7): feature_vector + imu_series_resampled.

function rowToTemplate(row: any): Template {
  return {
    id: row.id,
    exerciseLabel: row.exercise_label,
    takeId: row.take_id,
    deviceOrientation: row.device_orientation
      ? JSON.parse(row.device_orientation)
      : null,
    sampleRateHz: row.sample_rate_hz,
    featureVector: JSON.parse(row.feature_vector) as FeatureVector,
    imuSeriesResampled: row.imu_series_resampled
      ? (JSON.parse(row.imu_series_resampled) as number[][])
      : [],
    version: row.version,
  };
}

export async function upsertTemplates(templates: Template[]): Promise<void> {
  const db = await getDb();
  for (const t of templates) {
    await db.executeSql(
      `INSERT OR REPLACE INTO templates
         (id, exercise_label, take_id, device_orientation, sample_rate_hz,
          feature_vector, imu_series_resampled, version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.id,
        t.exerciseLabel,
        t.takeId,
        t.deviceOrientation ? JSON.stringify(t.deviceOrientation) : null,
        t.sampleRateHz,
        JSON.stringify(t.featureVector),
        t.imuSeriesResampled ? JSON.stringify(t.imuSeriesResampled) : null,
        t.version,
      ],
    );
  }
}

export async function getAllTemplates(): Promise<Template[]> {
  const db = await getDb();
  const [result] = await db.executeSql('SELECT * FROM templates');
  const out: Template[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    out.push(rowToTemplate(result.rows.item(i)));
  }
  return out;
}

export async function getSyncVersion(): Promise<number> {
  const db = await getDb();
  const [result] = await db.executeSql(
    "SELECT version FROM sync_state WHERE key = 'templates'",
  );
  if (result.rows.length > 0) {
    return result.rows.item(0).version as number;
  }
  return 0;
}

export async function setSyncVersion(version: number): Promise<void> {
  const db = await getDb();
  await db.executeSql(
    `INSERT OR REPLACE INTO sync_state (key, version) VALUES ('templates', ?)`,
    [version],
  );
}
