// Model store schema (design §7.2, consolidated from both PRDs). Runs in the same SQLite
// database as the POC tables (store/db.ts). Encryption (op-sqlite/SQLCipher, ledger Q11) is
// the D6 spike; until it lands the file is app-private and the manifest disables backup.

export const MODEL_SCHEMA_VERSION = 2;

export const MODEL_SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS model_templates (
     id TEXT PRIMARY KEY,
     exercise_id TEXT NOT NULL,
     kind TEXT NOT NULL CHECK (kind IN ('set','rep','negative','prior')),
     source TEXT NOT NULL CHECK (source IN ('own','founder','gym_pack')),
     labeled_set_id TEXT,
     session_id TEXT,
     features TEXT NOT NULL,
     window_f16 TEXT NOT NULL,
     channels INTEGER NOT NULL,
     rate_hz INTEGER NOT NULL,
     canonical_rotation TEXT,
     extractor_version TEXT NOT NULL,
     checksum INTEGER NOT NULL,
     pinned INTEGER NOT NULL DEFAULT 0,
     created_at INTEGER NOT NULL
   );`,
  `CREATE INDEX IF NOT EXISTS model_templates_ex ON model_templates(exercise_id, kind);`,
  `CREATE TABLE IF NOT EXISTS fitted_params (
     scope TEXT NOT NULL, exercise_id TEXT NOT NULL DEFAULT '', name TEXT NOT NULL,
     value TEXT NOT NULL, fitted_from_n INTEGER NOT NULL, package_default TEXT, updated_at INTEGER NOT NULL,
     PRIMARY KEY (scope, exercise_id, name)
   );`,
  `CREATE TABLE IF NOT EXISTS model_sessions (
     id TEXT PRIMARY KEY, started_at INTEGER NOT NULL, gym_id TEXT, rig_id TEXT, imu_source TEXT,
     calibration_json TEXT, rotation_deg INTEGER, seq_gaps INTEGER, free_space_ok INTEGER, log_dir TEXT
   );`,
  `CREATE TABLE IF NOT EXISTS labeled_sets (
     id TEXT PRIMARY KEY, session_id TEXT NOT NULL, exercise_id TEXT NOT NULL,
     t_start REAL NOT NULL, t_end REAL NOT NULL, rep_marks TEXT NOT NULL,
     reps_confirmed INTEGER, reps_detected INTEGER,
     weight_declared REAL, weight_unit TEXT, weight_ocr REAL, weight_ocr_conf REAL,
     weight_state TEXT NOT NULL,
     cadence_hz REAL, amp_median REAL, dominant_channel INTEGER, duration_sec REAL,
     gates_json TEXT NOT NULL, counted INTEGER NOT NULL,
     clip_path TEXT, clip_state TEXT, created_at INTEGER NOT NULL
   );`,
  `CREATE TABLE IF NOT EXISTS exemplar_frames (
     id TEXT PRIMARY KEY, labeled_set_id TEXT NOT NULL, role TEXT NOT NULL, t REAL, path TEXT NOT NULL,
     width INTEGER, height INTEGER
   );`,
  `CREATE TABLE IF NOT EXISTS weight_priors (
     exercise_id TEXT NOT NULL, gym_id TEXT NOT NULL DEFAULT '', station_id TEXT NOT NULL DEFAULT '',
     weight REAL NOT NULL, unit TEXT NOT NULL, last_used INTEGER NOT NULL,
     PRIMARY KEY (exercise_id, gym_id, station_id)
   );`,
  `CREATE TABLE IF NOT EXISTS level_progress (
     exercise_id TEXT NOT NULL, gym_id TEXT NOT NULL DEFAULT '',
     state TEXT NOT NULL, clean_sets INTEGER NOT NULL, distinct_weights INTEGER NOT NULL,
     integrity REAL NOT NULL, xp INTEGER NOT NULL, last_change INTEGER NOT NULL,
     consecutive_corrections INTEGER NOT NULL DEFAULT 0, sessions_with_hard_mode INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (exercise_id, gym_id)
   );`,
  `CREATE TABLE IF NOT EXISTS integrity_history (exercise_id TEXT NOT NULL, session_id TEXT, value REAL NOT NULL, at INTEGER NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS decisions (
     id TEXT PRIMARY KEY, session_id TEXT, labeled_set_id TEXT, kind TEXT NOT NULL, value TEXT,
     confidence REAL, source TEXT, explanation TEXT NOT NULL, created_at INTEGER NOT NULL
   );`,
  `CREATE TABLE IF NOT EXISTS model_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, exercise_id TEXT, change TEXT NOT NULL, integrity_after REAL);`,
  `CREATE TABLE IF NOT EXISTS model_packages (
     package_version TEXT PRIMARY KEY, extractor_version TEXT NOT NULL, engine_min TEXT NOT NULL,
     applied_at INTEGER, state TEXT NOT NULL, signature_ok INTEGER, smoke_ok INTEGER, blob TEXT NOT NULL
   );`,
  `CREATE TABLE IF NOT EXISTS quarantine (row_ref TEXT PRIMARY KEY, reason TEXT NOT NULL, at INTEGER NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS model_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`,
  // ---- schema v2: the Studio / After Action (studio design §12) ----
  `CREATE TABLE IF NOT EXISTS clips (
     id TEXT PRIMARY KEY, session_id TEXT NOT NULL, labeled_set_id TEXT,
     rig_id TEXT, source TEXT NOT NULL CHECK (source IN ('app','module','shenyao','gallery')),
     master_path TEXT, proxy_path TEXT, pts_path TEXT, thumbs_path TEXT,
     rotation_deg INTEGER NOT NULL DEFAULT 0, width INTEGER, height INTEGER, frames INTEGER, duration_us INTEGER,
     sync_json TEXT NOT NULL,
     state TEXT NOT NULL CHECK (state IN ('recording','ingesting','ready','reduced','pinned','deleted')),
     created_at INTEGER NOT NULL
   );`,
  `CREATE INDEX IF NOT EXISTS clips_session ON clips(session_id);`,
  `CREATE TABLE IF NOT EXISTS regions (
     id TEXT PRIMARY KEY, session_id TEXT NOT NULL, t0_ns INTEGER NOT NULL, t1_ns INTEGER NOT NULL,
     cycles INTEGER NOT NULL DEFAULT 0, state TEXT NOT NULL CHECK (state IN ('open','tagged','dismissed')),
     reason TEXT, labeled_set_id TEXT, updated_at INTEGER NOT NULL
   );`,
  `CREATE INDEX IF NOT EXISTS regions_session ON regions(session_id);`,
  `CREATE TABLE IF NOT EXISTS queue (
     id TEXT PRIMARY KEY, kind TEXT NOT NULL, priority INTEGER NOT NULL, labeled_set_id TEXT, region_id TEXT,
     clip_id TEXT, focus TEXT NOT NULL, text TEXT NOT NULL,
     state TEXT NOT NULL CHECK (state IN ('open','resolved','dismissed')), created_at INTEGER NOT NULL, resolved_at INTEGER
   );`,
  `CREATE TABLE IF NOT EXISTS studio_events (
     id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, labeled_set_id TEXT, kind TEXT NOT NULL, ms INTEGER, n INTEGER
   );`,
  `CREATE TABLE IF NOT EXISTS studio_drafts (labeled_set_id TEXT PRIMARY KEY, answers_json TEXT NOT NULL, updated_at INTEGER NOT NULL);`,
];

/**
 * Column additions for existing tables (SQLite has no ADD COLUMN IF NOT EXISTS). Each is applied
 * once and its failure ("duplicate column") is swallowed by the migrator in store/db.ts.
 */
export const MODEL_MIGRATIONS_V2: string[] = [
  `ALTER TABLE labeled_sets ADD COLUMN label_source TEXT NOT NULL DEFAULT 'debrief';`,
  `ALTER TABLE labeled_sets ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;`,
  `ALTER TABLE labeled_sets ADD COLUMN imu_available INTEGER NOT NULL DEFAULT 1;`,
  `ALTER TABLE labeled_sets ADD COLUMN clip_id TEXT;`,
  `ALTER TABLE labeled_sets ADD COLUMN t_start_host_ns INTEGER;`,
  `ALTER TABLE labeled_sets ADD COLUMN t_end_host_ns INTEGER;`,
  `ALTER TABLE labeled_sets ADD COLUMN window_f16 TEXT;`,
  `ALTER TABLE labeled_sets ADD COLUMN channels INTEGER;`,
  `ALTER TABLE labeled_sets ADD COLUMN rate_hz REAL;`,
  `ALTER TABLE labeled_sets ADD COLUMN result_json TEXT;`,
  `ALTER TABLE exemplar_frames ADD COLUMN source TEXT NOT NULL DEFAULT 'auto';`,
  `ALTER TABLE exemplar_frames ADD COLUMN crop_json TEXT;`,
  `ALTER TABLE exemplar_frames ADD COLUMN pts_us INTEGER;`,
  `ALTER TABLE exemplar_frames ADD COLUMN clip_id TEXT;`,
];
