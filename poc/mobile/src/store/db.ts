import SQLite from 'react-native-sqlite-storage';

// Local SQLite cache (design §4.1): cached founder templates for offline
// matching, queued SessionSet rows, and queued vision requests for retry.
// Uses react-native-sqlite-storage (per design §4.1 alternatives).

SQLite.enablePromise(true);

const DB_NAME = 'ironpal_poc.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA = [
  // Synced founder templates (D7: both feature vector + resampled raw window).
  `CREATE TABLE IF NOT EXISTS templates (
     id TEXT PRIMARY KEY,
     exercise_label TEXT NOT NULL,
     take_id INTEGER NOT NULL,
     device_orientation TEXT,
     sample_rate_hz INTEGER,
     feature_vector TEXT NOT NULL,
     imu_series_resampled TEXT,          -- nullable: raw window is optional (D7)
     version INTEGER NOT NULL
   );`,
  // Local sync-version watermark (single row keyed 'templates').
  `CREATE TABLE IF NOT EXISTS sync_state (
     key TEXT PRIMARY KEY,
     version INTEGER NOT NULL
   );`,
  // Completed sets queued for POST /sessions (Q8 offline queue).
  `CREATE TABLE IF NOT EXISTS session_queue (
     id TEXT PRIMARY KEY,
     payload TEXT NOT NULL,
     attempts INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL
   );`,
  // Queued vision requests for retry (Q8): weight OCR + pushdown recognize.
  `CREATE TABLE IF NOT EXISTS vision_queue (
     id TEXT PRIMARY KEY,
     kind TEXT NOT NULL,             -- 'weight' | 'recognize'
     payload TEXT NOT NULL,
     attempts INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL
   );`,
];

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabase({
        name: DB_NAME,
        location: 'default',
      });
      for (const stmt of SCHEMA) {
        await db.executeSql(stmt);
      }
      return db;
    })();
  }
  return dbPromise;
}

export async function resetDbForTests(): Promise<void> {
  dbPromise = null;
}
