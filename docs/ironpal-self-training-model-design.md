# IronPal Self-Training Model — Technical Design

**Status:** Draft v1.3 · 2026-09-17 — design review complete (auto mode); **§17 game layer**
(feel, engagement, assets) and **§18 anatomy** (how training works, how an unseen video is handled,
how the labeling studio closes the loop) added
**Owner:** founder (solo)

> **Decisions from the design review are in
> [`ironpal-self-training-model-design_grilled.md`](ironpal-self-training-model-design_grilled.md)
> (Q1–Q12) and are folded in below.** 5 rest on evidence in the repo, 7 are assumptions tagged for
> veto, none are open. Two evidence-driven changes against the draft: package signatures use
> **ECDSA P-256** (Ed25519 is not in the platform below API 33; minSdk is 24), and integrity runs
> **natively** through a `scoreAll` bridge call (windows never cross into JS — D6).
**Implements:** [`ironpal-self-training-prd.md`](ironpal-self-training-prd.md) (the feature: loop,
levels, gym pack) and [`ironpal-self-training-model-prd.md`](ironpal-self-training-model-prd.md) (the
model: R1–R12). Decisions in their `_grilled.md` ledgers are inputs here and are not re-opened.
**Grounded in:** `poc/mobile/android/app/src/main/java/com/twentydeka/ironpal/` (`Dsp.kt`, `SignalModule.kt`,
`ImuPipeline.kt`, `CameraModule.kt`, `BleImuSource.kt`, `ImuSessionLogger.kt`), `poc/mobile/src/`
(`fusion/`, `store/`, `controller/`, `config/`), `poc/backend/src/ironpal_poc/api/`,
`scripts/kb/{score_reps,score_weights,sync_imu_video}.py`.

> This is the **how**. The PRDs say what the model must do; this document says which module does it,
> with which algorithm, over which tables, across which bridge calls, and in what order it gets built
> by one person.

---

## 0. Summary and what changes against the POC

The model is a **native signal engine** (Kotlin, fixed) under a **JS learning layer** (TypeScript,
data-driven), both on the phone. The POC already has most of the engine; the design below keeps its
maths and changes its shape in seven places:

| Area | POC today | This design | Why |
|---|---|---|---|
| Templates | founder-authored, one flat list, synced from the backend | a per-user **store** with kinds `set` / `rep` / `negative` / `prior`, indexed per campaign, plus gym-pack priors | self-training PRD §6; precedence own → pack → founder |
| Matcher | linear scan; recomputes each template's band-passed magnitude per call; DTW against every template | **TemplateIndex** with cached magnitudes; kNN prefilter on features; DTW on top-8; no DTW on live ticks | model PRD §5.1 budget (ledger Q5) |
| Rep counting | `detectPeaks` over each 4 s window; `reps` = peaks in the window | a **streaming rep clock** with causal filtering, per-set cumulative count, confirmed-peak events, fitted amplitude threshold | reps per set, real-time cue, R3 |
| Set capture | `finishEnroll` snapshots the last 20 s of the ring buffer | the **session recorder** keeps the whole session (it already writes `imu.jsonl`); a set is a time slice of it | sets longer than 20 s; per-rep slicing; replay |
| Thresholds | hard-coded in Kotlin (`gatePeriodicity 0.3`, `gateEnergy 0.02`, peak height `0.35·RMS`, `rejectThreshold 0.45`) and duplicated in `config/index.ts` | one **ModelParams** object: package defaults overridden by fitted values, pushed into the engine at session start | R5 updatability; fitted parameters (model PRD §4.2) |
| Storage | plain SQLite (`react-native-sqlite-storage`) | **encrypted SQLite** (`op-sqlite` SQLCipher build), key wrapped by the Android Keystore; encrypted frame files | R4 (ledger Q11) |
| Frame of reference | device axes, rotation assumed | **canonical head frame** from the per-session calibration ritual | transfer doc §4; rig independence |

Everything else — ring buffer, resampling, band-pass, periodicity, feature vector, DTW, fusion ladder,
offline queues, OCR peer — is reused as is.

> **New reader, or coming back to this after a while? Start at [§18](#18-anatomy--how-the-model-is-trained-and-what-happens-to-an-unseen-video).**
> It answers the four questions this document otherwise spreads across ten sections: what the model
> *is* (a searchable memory of your own confirmed sets, not a network with weights), what goes in
> and comes out, what one confirmed set actually changes, and what happens to a video the model has
> never seen — including the case that surprises people, where a clip arrives **without** any IMU.

---

## 1. Component map

```
poc/mobile/
├── android/.../com/twentydeka/ironpal/
│   ├── ImuPipeline.kt        (unchanged) 50 Hz ring buffer, phone or BLE source
│   ├── BleImuSource.kt       (unchanged) Nano packets → pipeline + logger
│   ├── ImuSessionLogger.kt   (extended)  imu.jsonl + meta.json  → SessionRecorder
│   ├── Dsp.kt                (unchanged maths; params injected)  band-pass · periodicity · peaks · features · DTW
│   ├── SignalEngine.kt       (new)       ModelParams · Canonicalizer · GateMachine · RepClock · TemplateIndex · SetAnalyzer
│   ├── SignalModule.kt       (rewritten) the RN bridge for SignalEngine (results only cross — D6)
│   ├── CameraModule.kt       (extended)  captureSharpestStill + glanceWatch (still+sharp+implement)
│   ├── KeystoreModule.kt     (new)       AES key in Android Keystore; wrap/unwrap the DB key and file keys
│   └── HealthConnectModule.kt (new, P3)  write ExerciseSession records
└── src/
    ├── model/
    │   ├── params.ts         ModelParams: package defaults ⊕ fitted values → engine
    │   ├── store.ts          encrypted SQLite access: templates, sets, params, decisions, audit…
    │   ├── learner.ts        append · slice reps · harvest negatives · fit parameters
    │   ├── integrity.ts      leave-one-out over a campaign; incremental re-score
    │   ├── levels.ts         Locked → Recon → Provisional → Certified → Veteran; demotion
    │   ├── decide.ts         the decision ladder (wraps fusion/) + explanation objects
    │   ├── drift.ts          detectors and responses
    │   ├── priors.ts         founder pack + gym pack loading, weighting, retirement
    │   ├── packageManager.ts fetch · verify · migrate · smoke-test · apply · rollback
    │   ├── canonical.ts      calibration ritual maths (mirrors Kotlin for tests)
    │   └── replay.ts         run a recorded session through the model (harness)
    ├── controller/
    │   ├── useSession.ts     check-in, calibration, recorder, package apply gate
    │   ├── useSet.ts         ARM → FIRE → gate-close → SetResult
    │   └── useDebrief.ts     proposals → confirmations → learner
    ├── signal/dsp.ts         (kept) TS mirror of Dsp.kt for unit tests
    └── fusion/fusion.ts      (kept) ladder rules, thresholds now from ModelParams
poc/backend/src/ironpal_poc/api/
    ├── model_routes.py       (new) GET /model/package
    └── sessions_routes.py    (extended) metrics fields: prior_vs_own, integrity, level_state
scripts/model/
    ├── replay.py             (new) imu.jsonl + labels → decisions → score_reps / score_weights
    └── build_package.py      (new) assemble + sign a model package
```

The game layer (`src/game/`) and the tagging UI consume `SetResult`, decisions and level events; the
feature PRD specifies them and §17 below designs their feel, screens, audio, engagement systems and
asset pipeline.

---

## 2. Data flows

### 2.1 Session start

```
useSession.start(gymId)
  ├─ packageManager.applyPendingIfAny()          # never mid-session (R5)
  ├─ store.open()                                 # KeystoreModule.unwrap → op-sqlite key
  ├─ ImuModule.getFreeSpace() ≥ 500 MB ? else IMU-only session
  ├─ SessionRecorder.start(sessionId)             # imu.jsonl + meta.json (exists)
  ├─ calibration ritual (§3.1): holds + nods → R_head, rotationDeg, anchors → sessions.calibration_json
  ├─ params = ModelParams.compose(packageDefaults, fittedParams[user, exercises])
  ├─ SignalModule.configure(params, R_head)
  └─ SignalModule.loadTemplates(TemplateIndex for campaign(s) of this gym's map)   # cached magnitudes
```

### 2.2 A set, live

```
ARM   useSet.arm(exerciseHint?)
        CameraModule.glanceWatch(WEIGHT_GLANCE_SEC) ─▶ GlanceEvent{sharp, implementLikely, jpegRef}
        SignalModule.startSet(setId)               # GateMachine → ARMING
FIRE  IMU samples → ImuPipeline → SignalEngine tick (400 ms):
        GateMachine: energy+periodicity, hysteresis ─▶ GateEvent{open|close, t}
        RepClock (per sample, causal) ─▶ RepEvent{n, tPeak, amplitude, tConfirmed}   → audio/haptic
        every tick while open: kNN-only provisional match ─▶ MatchEvent{label, conf, provisional:true}
CLOSE GateMachine → CLOSING → CLOSED
        SetAnalyzer.finish(): window = recorder slice [tOpen−10 s, tClose+10 s]
          features · DTW top-8 · fused · margin · per-rep slices
        ─▶ SetResult{setId, tOpen, tClose, peaks[], features, candidates[3], windowRef, gaps, saturation}
DEBRIEF useDebrief: decide.propose(SetResult, glance, ocrPending) → four proposals + explanations
```

### 2.3 A confirmed set → learning

```
learner.commit(setId, confirmed{exerciseId, tStart, tEnd, repTops[], weight|unreadable})
  1. slices  = recorder.slice(tStart, tEnd)  + per-rep windows around repTops (±½ cycle)
  2. canon   = Canonicalizer.apply(slices, R_head)          # rotate, SI, 50 Hz
  3. store.appendTemplates(kind=set|rep, exerciseId, features, window_f16, checksum)
  4. negatives = recorder.restWindows(session) − periodicWindows  → kind=negative
  5. fits     = learner.fit(exerciseId)                       # §4.2 closed-form
  6. integ    = integrity.update(campaignOf(exerciseId), changed=exerciseId)   # incremental LOO
  7. level    = levels.apply(exerciseId, counts, distinctWeights, integ)
  8. store.audit({added, pruned, paramDeltas, integrityBefore/After, levelChange})
  9. SignalModule.loadTemplates(delta) ; SignalModule.configure(params)        # hot
```

Budget: ≤ 2 s (model PRD R1); measured in the harness.

### 2.4 Package apply (at app start, online at some earlier point)

```
packageManager.fetch()   GET /model/package?since=<version>  → bytes cached
packageManager.apply():
  verify ECDSA P-256 signature (public key in binary) → check engine_min ≤ engine → BEGIN
  migrate store schema if store_schema_version bumped
  if extractor_version changed: re-derive features for all templates from window_f16 (background job, progress)
  swap active package → smoke-test 3 bundled golden windows → COMMIT
  any failure → ROLLBACK → previous stays active → audit row
```

---

## 3. Signal engine (Kotlin)

### 3.1 Canonicalizer — the per-session head frame

Inputs from the ritual (transfer doc §5): six static holds and three nods. Output: rotation `R_head`
mapping device axes → head frame (+X forward through the nose, +Z up), plus `rotationDeg` for video.

Algorithm:

1. **Gravity axis.** During each hold, mean raw accel over 1.5 s → six vectors `g_k`. Fit the
   orthonormal triad by least squares (Kabsch on the ±axes) → device "up" = the axis anti-parallel to
   gravity in the *worn* hold (the first hold is worn, upright).
2. **Forward axis.** During the three nods, gyro energy is maximal about the head's lateral (pitch)
   axis; the pitch axis is the device axis with the largest nod-band (1–3 Hz) gyro energy;
   forward = up × pitch.
3. `R_head = [forward, up × forward, up]ᵀ`, orthonormalised. Applied to accel and gyro of every window
   at ingest: `a_head = R_head · a_dev`.
4. **Units:** BLE path already converts g → m/s², dps → rad/s and subtracts a slow gravity EMA
   (`BleImuSource`); the phone path supplies `TYPE_LINEAR_ACCELERATION`. Both land in the same ring
   buffer; canonicalisation happens on the snapshot, not on the stream.
5. **Fit quality** = residual of step 1 (deg) and the nod-axis dominance ratio; both go into
   `sessions.calibration_json` and drive the "rig moved" detector (§6).

Shortened ritual (nods only) reuses the last `R_head` and only re-checks the nod axis.

### 3.2 GateMachine

Replaces the boolean `isRepping` with a state machine so gate-open/close are events with timestamps:

| State | Enter when | Leave when |
|---|---|---|
| `IDLE` | — | `ARMING` on `startSet` |
| `ARMING` | user armed the set | energy ≥ E_on **and** periodicity ≥ P_on for ≥ 2 consecutive ticks → `ACTIVE` (open, t = first qualifying tick − window/2) |
| `ACTIVE` | gate open | no confirmed peak for `max(1.5 · cycle, 2 s)` **and** periodicity < P_off → `CLOSING` |
| `CLOSING` | grace period 1.5 s | new peak → back to `ACTIVE`; else → `CLOSED` (close, t = last peak + ½ cycle) |
| `CLOSED` | set ended | `SetAnalyzer.finish()` then `IDLE` |

Hysteresis: `P_on = 0.35`, `P_off = 0.25`, `E_on = 0.02` (package defaults; today's constants are
`0.3 / 0.02`). Cycle = 1 / fitted cadence, else 1 / periodicity cadence.

### 3.3 RepClock — streaming peaks, one count per set

Runs **per sample** (not per tick) on the canonical stream:

```
channel  = fitted dominant channel for the armed exercise hint, else band-passed magnitude
x        = causal band-pass (one-pole HP 0.2 Hz → one-pole LP f_hi)     # same filters as Dsp.bandPass
candidate at i-1 when x[i-2] ≤ x[i-1] > x[i]  and  x[i-1] ≥ A_min  and  (i-1) − lastPeak ≥ S_min
confirm  at i-1 + S_conf  if no higher sample appeared within S_conf   → RepEvent(n++, tPeak, amp, tConfirmed)
```

- `A_min` = fitted amplitude threshold (model PRD §4.2), default `0.35 · running RMS` (today's rule).
- `S_min` = `rate / f_hi` (min spacing), `S_conf` = `¼ · rate / f_cadence` clamped to `[150, 400] ms`.
- Peaks are indexed by absolute sample index, so ticks cannot double-count; the count resets on
  `startSet`.
- **Latency:** `tConfirmed − tPeak = S_conf` — the stated floor (model PRD §6).
- At set end the per-rep windows are `[tPeak − ½ cycle, tPeak + ½ cycle]` from the recorder.

### 3.4 Features and distances

`Dsp.extractFeatures` unchanged (6 accel-derived + 3 gyro-derived, orientation-invariant), computed on
the canonical window. `featureDistance` weights (`W_*`) and the fusion weights (`0.6 / 0.4`) move from
constants to `ModelParams`. Confidence stays `1 / (1 + d_fused)`, so the package thresholds map to
distances: `T_reject 0.45 ⇔ d ≈ 1.22`, `T_imu_high 0.7 ⇔ d ≈ 0.43`.

### 3.5 TemplateIndex and the two-stage match

```
load(campaign): for each template t:  t.mag = bandPass(magnitude(t.window_accel))   # cached once
                bucket by exerciseId; note kind and weight
match(live):
   1. f = features(live);  d_knn(t) = featureDistance(f, t.f) · kindPenalty(t)
   2. K = top-8 templates by d_knn (across all buckets)                  # O(N) on ≤ 740 vectors
   3. for t in K: d_dtw(t) = normalizedDtw(live.mag, t.mag)              # 8 DTWs, band 0.2
      d_fused(t) = w_knn · d_knn + w_dtw · d_dtw
   4. per exercise e: d_e = min over its templates in K   (index holds set, negative and prior
      templates; per-rep templates stay out of it — they feed the rep-shape fit and explanations)
      winner = argmin d_e; runner-up = next; margin = d_runner − d_winner
   5. conf = 1/(1 + d_winner); label = conf ≥ T_reject_user ? winner : unknown
   returns Match{label, conf, margin, bestTemplateId, byRepresentation: {knn, dtw}, candidates[3]}
kindPenalty: own set/rep = 1.0 ; prior (founder or gym pack) = 1 + n_own(e)/3 ; retired at Certified
             negative templates carry label `unknown` and compete normally (they *are* the reject class)
```

Live ticks call steps 1–2 only (`provisional = true`, emitted but **hidden on the HUD by default** —
an opt-in setting shows it); `SetAnalyzer.finish` runs the full match.

### 3.6 ModelParams (the injected constants)

`SignalModule.configure(json)` replaces every hard-coded number: canonical rate, band corners, gate
thresholds, `S_conf` bounds, `T_reject`, fusion and feature weights, top-k, DTW band, tick period,
plus a per-exercise map `{cadenceBand, A_min, dominantChannel, setDurationPrior}`. The JS side
composes it (§4.3) and the engine treats it as read-only for the session.

---

## 4. Learning layer (TypeScript)

### 4.1 Append and slice

- Set window `[tStart, tEnd]` and rep windows are cut from the recorder's session log by host time
  (`host_ns`), never by sample index (sync-plan rule).
- Stored as `window_f16` (little-endian `float16`, 6 channels, 50 Hz) with a CRC32 `checksum`;
  features stored alongside; `extractor_version` stamped.
- Negatives: REST/walk windows of the same session where the gate was never `ACTIVE` and periodicity
  stayed < `P_off`; at most 5 per session, 4 s each, kind `negative`, label `unknown`.

### 4.2 Fits (closed form)

```
cadenceBand(e)   = [p10(cad) · 0.8, p90(cad) · 1.2]   clamped to [0.2, 1.5] Hz   ; needs ≥ 3 sets
A_min(e)         = 0.4 · median(peak amplitude of confirmed reps)                  ; ≥ 3 sets
dominant(e)      = argmax_channel Σ_sets repBandEnergy(channel)                    ; ≥ 3 sets
repShape(e)      = median over rep windows after time-normalising to 64 samples    ; ≥ 5 reps
setDuration(e)   = {median, IQR} of (tEnd − tStart)                                ; ≥ 3 sets
T_reject(user)   = choose d* s.t. 95 % of negatives have conf < 1/(1+d*) and ≥ 90 % of own sets clear it
                   (grid over d ∈ [0.6, 2.0]); default 0.45 until ≥ 20 negatives and ≥ 10 own sets
priorWeight(u,e) = 1 / (1 + n_own(e))            recencyWeight(u,e) = 2^(−age_sessions / 30)
```

A fit below its minimum data keeps the package default; every change is an audit row with before/after.

### 4.3 ModelParams composition

`params.compose(packageDefaults, fitted)`: package values first, fitted values override per key when
present and above their minimum-data rule, and a `source` map (`package` | `fitted`) rides along for
the inspector and explanations.

### 4.4 Integrity (leave-one-out over a campaign)

```
integrity(e) = (# own set templates of e whose LOO match, against the campaign index minus themselves,
               returns e) / (# own set templates of e)
```

Scoring runs **natively**: `SignalModule.scoreAll(exerciseIds)` returns each template's top-k with
itself excluded; `integrity.ts` only aggregates (windows never cross the bridge — D6; the TS mirror
stays a test fixture). Incremental rule after adding set `s` to exercise `e`: re-score only templates
whose previous top-8 contained a template of `e`, plus all templates of `e`. Worst case ≈ 300 kNN + 2 400 DTW ≈ 1.5 s on
the A52; typical ≪ 1 s. A full re-score runs in the background on package apply and weekly.

### 4.5 Pruning

When an exercise exceeds 20 own set templates: for each candidate (oldest first, never a pinned set),
compute integrity without it; drop the first whose removal does not lower integrity; rep templates
and exemplars of the dropped set go with it. Audit row.

---

## 5. Decisions and explanations (`decide.ts`)

The ladder is `fusion.ts` unchanged in rules, fed by `Match` and level state:

| Decision | Inputs | Output + explanation fields |
|---|---|---|
| exercise | `Match`, level state, vision result (Campaign 2/3), gate | `{value, conf, source, needsConfirm}` + `{candidates[3] with d_fused, bestTemplate{setId, date, weight, reps}, decidedBy: knn|dtw, priorMatched: bool, flipIf: text}` |
| reps | `RepEvent[]`, rejected candidates, `rep_signal` class | `{value|null, conf, source}` + `{peaks[], rejected[{t, reason}], band, A_min, source: imu|vision|user}` |
| weight | prior, OCR `{value, conf}`, declared | `{value, unit, conf, source}` + `{frameRef, ocr, prior, rule}` |
| gate/unknown | energy, periodicity vs thresholds | `{reason, energy, periodicity, thresholds}` |
| level | counts, distinct weights, integrity | `{from, to, counts, integrityBefore, integrityAfter, tippingSetId}` |

Explanation objects are written to `decisions` at decision time; wording is rendered from
`package.explanations[kind]` templates with placeholders, so copy changes are package changes.

---

## 6. Levels and drift

### 6.1 Level state machine (`levels.ts`)

| From → To | Condition |
|---|---|
| Locked → Recon | first clean own set |
| Recon → Provisional | ≥ 3 clean sets ∧ integrity ≥ 0.80 |
| Provisional → Certified | ≥ 5 clean sets ∧ ≥ 2 distinct weights ∧ integrity ≥ 0.90 |
| Certified → Veteran | ≥ 3 clean sets across ≥ 2 sessions with hard-mode credit |
| Certified/Veteran → Provisional | two consecutive live corrections, or integrity < 0.80 |
| any → Recon | user reset of the exercise |

"Clean" = passed the feature PRD §7.5 gates. Bars are `ModelParams` keys.

### 6.2 Drift detectors (`drift.ts`)

| Detector | Signal | Response |
|---|---|---|
| integrityDrop | integrity(e) < median(last 10 sessions) − 0.10 | demote; request one confirming set |
| rigMoved | angle(R_head, median R_head over store) ≥ 10° or calibration residual > 5° | re-canonicalise live; hard-mode credit; prompt re-ritual if integrity drops |
| tempoShift | 3 consecutive sets with cadence outside `cadenceBand(e)` | refit band; inspector note |
| siblingConfusion | ≥ 3 corrections e → e′ within 10 sessions | offer to chart e′ |
| absence | > 30 days | re-enable priors for one set only if the LOO check fails |
| newRig | `rig_id` change | levels → Provisional until one clean set; bridge-validation hook |

---

## 7. Storage

### 7.1 Engine and encryption

- **Database:** `op-sqlite` built with SQLCipher; opened with a 32-byte random key that is generated
  once and stored wrapped by an AES-256-GCM key living in the **Android Keystore** (`KeystoreModule`:
  `getOrCreateKey()`, `wrap(bytes)`, `unwrap(blob)`); hardware-backed when the device offers it. The
  DB stays open only while the app is foreground or the recording foreground service runs.
- **Files** (exemplar crops, per-set clips): AES-256-GCM per file with a random file key, itself
  wrapped by the Keystore key; header carries the wrapped key and nonce.
- **Export:** a zip of JSON + `window_f16` blobs + frames, encrypted with a passphrase-derived key
  (Argon2id, 64 MB, 3 iterations).
- **Erasure:** transaction deleting rows and files, then `KeystoreModule.destroy()`.
- `android:allowBackup="false"` stays.

### 7.2 Schema (consolidated from both PRDs)

```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY, exercise_id TEXT NOT NULL,
  kind TEXT CHECK (kind IN ('set','rep','negative','prior')) NOT NULL,
  source TEXT CHECK (source IN ('own','founder','gym_pack')) NOT NULL,
  labeled_set_id TEXT, session_id TEXT,
  features TEXT NOT NULL,                 -- JSON FeatureVector
  window_f16 BLOB NOT NULL, channels INTEGER NOT NULL, rate_hz INTEGER NOT NULL,
  canonical_rotation TEXT, extractor_version TEXT NOT NULL, checksum INTEGER NOT NULL,
  pinned INTEGER DEFAULT 0, created_at INTEGER NOT NULL
);
CREATE INDEX templates_ex ON templates(exercise_id, kind);
CREATE TABLE fitted_params (scope TEXT, exercise_id TEXT, name TEXT, value TEXT, fitted_from_n INTEGER,
  package_default TEXT, updated_at INTEGER, PRIMARY KEY (scope, exercise_id, name));
CREATE TABLE sessions (id TEXT PRIMARY KEY, started_at INTEGER, gym_id TEXT, rig_id TEXT, imu_source TEXT,
  calibration_json TEXT, rotation_deg INTEGER, seq_gaps INTEGER, free_space_ok INTEGER, log_dir TEXT);
CREATE TABLE labeled_sets (id TEXT PRIMARY KEY, session_id TEXT, exercise_id TEXT, t_start REAL, t_end REAL,
  rep_marks TEXT, reps_confirmed INTEGER, reps_detected INTEGER, weight_declared REAL, weight_unit TEXT,
  weight_ocr REAL, weight_ocr_conf REAL, weight_state TEXT, gates_json TEXT, counted INTEGER,
  clip_path TEXT, clip_state TEXT, created_at INTEGER);
CREATE TABLE exemplar_frames (id TEXT PRIMARY KEY, labeled_set_id TEXT, role TEXT, t REAL, path TEXT,
  width INTEGER, height INTEGER);
CREATE TABLE weight_priors (exercise_id TEXT, gym_id TEXT, station_id TEXT, weight REAL, unit TEXT, last_used INTEGER);
CREATE TABLE level_progress (exercise_id TEXT PRIMARY KEY, gym_id TEXT, state TEXT, clean_sets INTEGER,
  distinct_weights INTEGER, integrity REAL, xp INTEGER, last_change INTEGER);
CREATE TABLE integrity_history (exercise_id TEXT, session_id TEXT, value REAL, at INTEGER);
CREATE TABLE decisions (id TEXT PRIMARY KEY, session_id TEXT, labeled_set_id TEXT, kind TEXT, value TEXT,
  confidence REAL, source TEXT, explanation TEXT, created_at INTEGER);
CREATE TABLE model_audit (id INTEGER PRIMARY KEY, at INTEGER, exercise_id TEXT, change TEXT, integrity_after REAL);
CREATE TABLE model_packages (package_version TEXT PRIMARY KEY, extractor_version TEXT, engine_min TEXT,
  applied_at INTEGER, state TEXT, signature_ok INTEGER, smoke_ok INTEGER, blob_path TEXT);
CREATE TABLE quarantine (row_ref TEXT PRIMARY KEY, reason TEXT, at INTEGER);
-- gym pack cache: gyms, gym_stations, gym_station_exemplars, contributions  (feature PRD §11)
```

The POC `templates` table is migrated into this one as `kind='prior', source='founder'`.

---

## 8. Model package

```json
{
  "package_version": "2026.09.1", "engine_min": "1.0.0", "store_schema_version": 3,
  "extractor_version": "fx-1", "signed_at": 1757721600,
  "params": { "canonical_rate_hz": 50, "rep_band_hz": [0.2, 1.5], "gate": {"p_on": 0.35, "p_off": 0.25, "e_on": 0.02},
              "s_conf_ms": [150, 400], "t_reject": 0.45, "t_imu_high": 0.7, "t_vis_high": 0.65, "t_ocr": 0.6,
              "fusion": {"w_knn": 0.6, "w_dtw": 0.4}, "feature_weights": {"axis": 2.0, "cadence": 0.8, "duty": 1.2,
              "asym": 1.0, "flat": 1.0, "jerk": 0.8, "gyro": 1.5}, "top_k": 8, "dtw_band": 0.2, "tick_ms": 400,
              "levels": {"provisional": {"sets": 3, "integrity": 0.8}, "certified": {"sets": 5, "weights": 2, "integrity": 0.9}},
              "per_exercise_defaults": { "bulgarian-split-squat": {"cadence_band_hz": [0.3, 0.9]} } },
  "ontology_ref": "sha256:…", "campaign_map": { "imu": [...], "fusion": [...], "vision": [...], "hard": [...] },
  "priors": "priors.bin",  "explanations": { "exercise": "Matched your {exercise} from {date} ({conf}).", "...": "..." },
  "smoke": [ {"window_ref": "smoke/goblet.f16", "expect": "goblet-squat"}, ... ],
  "signature": "ecdsa-p256:…"
}
```

- `priors.bin`: founder templates (`kind='prior'`), `float16` windows + features, ≈ 4–5 MB.
- Signed with an IronPal **ECDSA P-256** key (`SHA256withECDSA`, in `java.security` on every
  supported API level — Ed25519 only arrives at API 33 and `minSdk` is 24); the public key is
  compiled into the app; no crypto dependency added.
- Served by `GET /model/package?since=<version>` (returns 304 when current); the shipped package is in
  app assets as the fallback.
- Apply algorithm in §2.4; extractor re-derivation reuses `learner.fit` after re-featurising.

---

## 9. Bridge API (`SignalModule`, results only cross)

| Method | Args | Returns / emits |
|---|---|---|
| `configure(paramsJson, rHeadJson)` | ModelParams, 3×3 rotation | Promise<void> |
| `loadTemplates(indexJson, mode)` | templates with `window_f16` base64, `mode: replace|delta` | Promise<{count, bytes}> |
| `startSession(sessionId)` | — | Promise<void> (recorder + pipeline) |
| `runCalibration(step)` | `hold_k` / `nods` | Promise<CalibrationSample> |
| `startSet(setId, exerciseHint?)` | — | Promise<void>; then events |
| `endSet(setId)` | — | Promise<SetResult> |
| `stopSession()` | — | Promise<SessionSummary{seqGaps, saturated, durationSec}> |
| `scoreAll(exerciseIdsJson)` | campaign exercise ids | Promise<[{templateId, topK:[{templateId, exerciseId, dFused}]}]> (self excluded) — for integrity |
| `benchmark()` | — | Promise<{tickMs, matchMs, dtwMs, memMb}> |
| events | `GateEvent`, `RepEvent`, `MatchEvent(provisional)`, `LinkEvent{seqGaps, saturated, mtu}` | |

`CameraModule.glanceWatch(windowMs)` → `GlanceEvent{sharp, score, implementLikely, jpegRef}`;
`captureSharpestStill` kept. `KeystoreModule` as in §7.1. `HealthConnectModule.writeSession(json)`.

---

## 10. Backend additions

- `GET /model/package?since=` — static file with ETag; auth as today.
- `POST /sessions` — metrics gain `prior_vs_own` per decision, `integrity`, `level_state`,
  `params_source` summary; never windows or frames (feature PRD §11).
- Gym pack endpoints are the feature PRD's; the model consumes packs through `priors.ts` only.

---

## 11. Verification harness

- **Unit:** a JVM test source set is **added** (none exists today — no `app/src/test`, no JUnit
  dependency): Kotlin tests for `GateMachine`, `RepClock` (synthetic sinusoids with known peaks, noise,
  head-bob blips), `TemplateIndex` (top-k equals brute force), `Canonicalizer` (known rotations);
  Jest on `dsp.ts` and `canonical.ts` mirrors; `learner`/`integrity`/`levels` on fixtures.
- **Replay:** `scripts/model/replay.py --session <dir> --labels <json>` feeds `imu.jsonl` (host time)
  through the **same Kotlin engine** via a small JVM `SignalEngineCli` (JUnit source set) and writes
  `predictions.json` for `score_reps.py` / `score_weights.py`; confident-wrong fails CI. On-device
  replay (`replay.ts`) runs the same sessions through the phone build for parity.
- **Golden stores:** three frozen stores (founder + two testers) with expected decisions and
  integrity; any package or engine change diffs against them.
- **Benchmarks:** `SignalModule.benchmark()` on the A52 in CI-on-device: tick p95 ≤ 15 ms, match
  ≤ 150 ms, update ≤ 2 s, resident ≤ 60 MB; 60-minute battery run.
- **Chaos:** injected BLE gaps, saturation, storage full, bad signature, failing migration — assert
  the failure catalogue's recovery and audit row.

---

## 12. Performance analysis (A52)

| Operation | Cost model | Estimate |
|---|---|---|
| Tick (gate + features + kNN) | 3× one-pole filters over 200 samples; autocorr 200×(lags ≤ 250); features; ≤ 740 feature distances | ≈ 4–8 ms |
| RepClock per sample | 2 filter taps + comparisons | ≪ 1 µs |
| Set-end match | 8 × DTW(200×200, band 40) ≈ 8 × 16 k cells | ≈ 10–30 ms |
| Update | append + fits + incremental LOO (≤ 2 400 DTW worst) | ≤ 1.5 s worst, < 0.3 s typical |
| Index load per campaign | 15 × 20 × (band-pass 200) | < 50 ms |
| Resident memory | index ≤ 300 windows × 200 × 6 × 4 B ≈ 1.4 MB + magnitudes; store handles | < 25 MB |

---

## 13. Migration from the POC

1. Add `SignalEngine.kt`; move the tick loop and constants out of `SignalModule.kt` into it; keep
   `Dsp.kt` untouched (only its callers change).
2. Introduce `ModelParams` with today's constants as the first package (`2026.09.0`) so behaviour is
   unchanged before anything is fitted.
3. Swap `react-native-sqlite-storage` → `op-sqlite` (SQLCipher); migrate `templates` rows to
   `kind='prior', source='founder'`; delete the `jcenter` patch step from the README.
4. Replace `useEnroll` with `useSet` + `useDebrief`; keep `EnrollScreen` as the founder's prior-pack
   authoring tool behind the `founder` role.
5. Backend: add `/model/package`; extend `/sessions` metrics; leave `/templates/*` for the founder's
   pack authoring.

---

## 14. Build plan (solo, maps to the feature PRD phases)

| Phase | Deliverables | Exit | Est. |
|---|---|---|---|
| **P0** | `SignalEngine` (GateMachine, RepClock, TemplateIndex, ModelParams), `SessionRecorder` slicing, `Canonicalizer`, encrypted store + `KeystoreModule`, `learner` (append, fits, negatives), `integrity`, `levels`, `decisions` with explanations, inspector v0 | founder certifies 3 `imu` exercises at home; benchmark within budget; unit tests green | ~2.5 wk |
| **P1** | `glanceWatch`, OCR reconcile, `useSet`/`useDebrief` wiring, failure catalogue (BLE/saturation/storage/crash), replay harness in CI, golden store #1 | one gym block replayed with confident-wrong = 0; debrief ≤ 20 s median | ~2.5 wk |
| **P2** | package format + signing + apply/rollback + extractor re-derivation, `drift.ts`, missions from gaps, predictive-cue experiment (flag) | package round-trip on device; drift demotion reproduced in chaos test | ~2 wk |
| **P3** | `HealthConnectModule`, intents, on-device benchmarks and battery run on testers' phones, golden stores #2–3 | §12 budgets met on two non-founder phones | ~1.5 wk |
| **P4** | `priors.ts` gym-pack loading and precedence; bridge-validation hook for the production rig | follower session uses pack priors with correct weighting; metrics show `prior_vs_own` | ~1 wk |

Sequencing rule: nothing in P1+ starts until P0's benchmark passes — the budget is the design's
riskiest assumption and the cheapest to verify.

> **P0 status (2026-09-13):** implemented — engine, bridge, Keystore module, JS learning layer,
> controllers, bare-bones Campaign screen, signed package, backend route; JVM 8/8, Jest 23, pytest
> 13, `tsc` clean. **Not yet done:** the on-device benchmark (no phone attached), the SQLCipher
> spike (D6), and the recorder-based set slicing (ring buffer used instead). See `poc/README.md`
> "Self-training model — P0 status" for the exact list of deviations.
>
> **Benchmark, partially closed (A52, release build):** tick **4.4 ms** vs the 15 ms budget (§5.1
> predicted 4–8 ms) and 6 MB resident vs 60 MB. The **match budget remains unverified** — the
> bundled package has no priors, so the measurement ran against an empty index.

---

## 15. Risks specific to this design

| # | Risk | Mitigation |
|---|---|---|
| D1 | The canonical rotation from six holds is noisy on a soft headband | fit-quality residual gates the ritual; fall back to last good `R_head`; features are orientation-invariant anyway, so rotation mainly protects DTW and rep-channel choice |
| D2 | Causal one-pole filters shift peaks vs the zero-phase analysis in `extractFeatures` | rep tops are stored from the causal clock and re-aligned at set end with the zero-phase pass; the explanation shows both |
| D3 | Negative templates dominate top-8 and suppress true labels | cap negatives per session; `kindPenalty` never below 1; integrity would show it immediately |
| D4 | `float16` loses precision on small-amplitude reps | values are m/s² and rad/s in ±100 range; 3 significant digits suffice for DTW after z-normalisation; verified in golden diff |
| D5 | Incremental LOO misses re-scores after pruning | pruning triggers a full re-score of the exercise; weekly full pass |
| D6 | `op-sqlite` + SQLCipher on RN 0.84 new architecture — **unproven anywhere in the portfolio** | one-day spike on the A52 is day one of P0; fallback is `EncryptedFile`-wrapped plain SQLite with the same `store.ts` API |

---

## 16. Open questions — resolved in review

All six were engineering choices and the review settled them; nothing remains conditional in this
document (the PRDs' open items are unchanged).

| Was open | Resolved as | Ledger |
|---|---|---|
| LOO in Kotlin or JS | native `scoreAll` bridge call; JS aggregates | Q1 |
| Rep windows as index templates | no — rep-shape fit and explanations only | Q2 |
| Provisional live label | emitted, hidden by default, opt-in setting | Q3 |
| Signature library | ECDSA P-256 from `java.security`, no dependency | Q4 |
| Replay parity | JVM test source set + `SignalEngineCli` running the shipped Kotlin | Q5 |
| Negative cap | 5 per session; `T_reject` fits after ≈ 4 sessions | Q6 |

---

## 17. Game layer — design refinement for feel and engagement

> Added 2026-09-13 on the founder's direction: the model's self-training loop must *feel* like
> playing a tactical first-person shooter — the round rhythm, the crosshair, the hit marker, the
> rank and the mission briefing of a Counter-Strike or Wolfenstein — while remaining original work.
> Those titles are the **genre reference for the feel**; none of their names, art, sounds, fonts,
> characters or level designs appear in IronPal (constraint C6 in the feature PRD). The first-person
> view is the user's real headband camera; the game is the interface around it.

### 17.1 Where the feel comes from — and where it cannot

A shooter's feel is built from a few reliable ingredients: a **round structure** with a tense
pre-round and a clean end-of-round scoreboard, a **crosshair that tells you when you are on target**,
an **instant hit marker with a sound**, a **feed** of what just happened, a **rank** that moves
slowly, a **map** with territory, and a **briefing** before each level. All of these map onto the
self-training loop without inventing anything the loop does not already do:

| Shooter ingredient | IronPal equivalent | Where it lives |
|---|---|---|
| Buy phase / freeze time | **ARM** — choose the level, glance at the weight, crosshair locks | phone screen, before the set |
| Round live | **FIRE** — the set; screen-free; audio and haptic only | headband + pocket phone |
| Hit marker + sound | **RepEvent** confirmed by the RepClock (§3.3) | audio/haptic in ≤ 150 ms of detection |
| Kill feed | **Rep feed** on the debrief: one line per rep with timing and amplitude, rejected candidates greyed | debrief |
| Round end scoreboard | **DEBRIEF** — four proposals, one-tap confirm, XP breakdown | rest period |
| Weapon select | **Level select** on the campaign map (exercise = weapon, campaign = loadout class) | map |
| Mission briefing | **Mission card** with campaign emblem, sensor-class statement, sets remaining | before ARM |
| Rank / XP | cosmetic ranks (six tiers), XP only for gated-clean sets | profile, debrief |
| Armour | **integrity meter** (§4.4) shown as a six-segment plate | level card, debrief |
| Map control / territory | **Scout** charting stations; fog of war = uncharted stations | gym map |
| Boot camp | calibration ritual + tutorial level | first session |
| Level cleared | **certification**: the exercise is now automatic in live workouts | level-cleared card |

Two ingredients deliberately do **not** carry over. There is no **timer** during a set and no
**enemy**: the target is always iron, the clock is the user's own rest. A shooter's pressure comes
from the opponent; IronPal's comes from the rep you are about to do, which is pressure enough under
a loaded bar (G6).

### 17.2 Screen-by-screen

| Screen | Composition | Feel cues |
|---|---|---|
| **Campaign map** | `bg_campaign_map` backdrop; stations as `flag_*` markers on the gym's holographic floor plan; three campaign emblems as tabs; level badges (`badge_*`) with integrity segments | fog of war on uncharted stations; slow teal scan-line sweep; emblem glow on the active campaign |
| **Mission briefing** | `bg_briefing_<campaign>` left-lit backdrop; emblem top-left; mission card centre: exercise, sensor-class statement in plain words, sets to certify, two-weights rule, `hud_magazine` showing today's sets | stencil-style headline type, typewriter reveal of the card lines (≤ 600 ms total), a single low "deploy" tone |
| **ARM (live view)** | live preview where the rig has one, else the last exemplar frame dimmed; `hud_crosshair_idle` centred; `hud_target_*` glyph for the expected implement bottom-right; weight prior chip | crosshair snaps to `hud_crosshair_locked` + "target acquired" tone + haptic when the glance is sharp and still; no button to press |
| **FIRE** | phone screen dark or in pocket; optional minimal live view with `hud_gate_open` and the rep count only | per-rep hit tick; exact-rep streak changes tick pitch subtly; gate-close "round over" tone; link-lost warning two-tone |
| **DEBRIEF** | `bg_debrief` with the replay (or trace-only) centred; rep feed right; four proposal rows each with a one-tap confirm; `hud_hitmarker` flashes on confirm | scoreboard cadence: rows slide in one at a time; XP counter ticks up; "all correct" is one big control |
| **Level cleared** | `bg_level_cleared`; badge upgrade animation; one sentence on what changed in the product | ascending three-note sting; haptic double pulse |
| **Mission failed** | `bg_mission_failed`; the failed gate in plain words; a redo control | short descending tone; no penalty copy |
| **Boot camp** | `bg_bootcamp`; `emblem_bootcamp`; the ritual steps as a checklist with the same cues | "calibrate armour", "sync", "zero the scope", "range check" callouts |
| **Profile / rank** | `rank_*` insignia; XP; stations charted; certifications list | insignia change animation on rank-up |

### 17.3 HUD composition rules

- **Layering:** backdrop → live/replay view → SVG glyphs (tinted at runtime) → text. Generated
  emblems and badges are composited with **screen/additive blending** over dark UI so their glow
  survives and a residual dark background costs nothing.
- **Glyph states are colour, not new art:** idle = gunmetal, active = teal, bonus = lime, warning =
  ember. One SVG per glyph, `currentColor` tint (`draw-hud.py`).
- **Never over the set:** during FIRE the HUD is the audio. The optional minimal live view shows
  only the gate state and the count, no controls (FR-A2).
- **Motion budget:** hit marker 120 ms scale-in, 240 ms fade; crosshair lock 160 ms; feed rows 90 ms
  stagger; nothing loops during a set except the gate-open pulse.
- **Type:** a condensed stencil-flavoured display face for headlines (an open-licence face, chosen
  in P2), the app's body face for everything else; all-caps only on headlines and callouts.

### 17.4 Audio, voice and haptics

| Cue | Trigger | Sound design (original, synthesised) | Haptic |
|---|---|---|---|
| deploy | briefing confirmed | low 80 Hz thump + short riser | single 30 ms |
| target acquired | glance sharp + still | two-note click, second note teal-bright | double 20 ms |
| gate open | GateMachine → ACTIVE | rising sweep 200 ms | single 40 ms |
| hit | RepEvent | 40 ms transient click with a 1.2 kHz body; pitch +2 % per exact-rep streak step | 15 ms tick |
| hit bonus | exact-rep bonus at set end | the hit click plus a short lime chime | double tick |
| gate close | GateMachine → CLOSED | falling sweep + soft "round over" tone | 60 ms |
| link lost | LinkEvent | two-tone warning, repeats every 5 s until restored | long 120 ms |
| level cleared | certification | three ascending notes | double pulse |
| mission failed | gate failed | two descending notes, quiet | single |

An **operator voice** (on-device TTS, short original lines: "target acquired", "set complete",
"headband lost", "level cleared") is optional and off by default; it never speaks during a set
except for the link-lost warning. All cues follow media volume; every cue has its haptic twin and
can be muted individually (FR-G4, FR-A1).

### 17.5 Engagement systems

The loop has to be worth returning to for weeks, without dark patterns (feature PRD §8.3).

| System | Mechanic | What it drives | Guardrail |
|---|---|---|---|
| **Certification** | the real reward: an exercise becomes automatic in live workouts | completing levels | the only reward that gates anything, and it gates only automation |
| **XP and ranks** | XP for gated-clean sets; bonuses for exact reps, headshot (OCR agreement), new weight, new rig fit, new session; six cosmetic ranks | steady progress feeling | ranks unlock nothing; XP never lost |
| **Missions from gaps** | generated from the store: "second weight for deadlift", "one hard-mode session", "chart the leg press" | the data the model actually needs | no calendar streaks; a missed mission simply stays available |
| **Territory** | Scout charts stations; adoption meter; reward tiers (feature PRD §8.6) | contribution and long-term retention | reward fulfilment external and conditional; nobody sees anyone else |
| **Integrity as armour** | leave-one-out agreement shown as a plate gauge that can dent and be repaired | quality of labels | demotion is framed as "integrity compromised — one set to restore" |
| **Deployment log** | a plain count of sessions and clean sets, per campaign; no streak, no loss | competence, not compulsion | shown, never nagged |
| **Debrief pacing** | the round-end scoreboard is the one moment the game asks for attention, and it fits a rest period | habit of tagging | deferrable to end of session; never blocks the next set |

Why this works for the persona: competence (integrity, certification), autonomy (choose the level,
choose the weight, skip the game entirely and still log), and relatedness handled without social
exposure (territory). The shooter framing supplies the *rhythm* — arm, fire, debrief — that makes a
chore feel like rounds.

### 17.6 Asset pipeline

Two channels, chosen by what each tool is good at:

| Channel | Assets | Tool | Why |
|---|---|---|---|
| **Code-drawn SVG** | crosshair (idle, locked), hit marker (normal, bonus), gate open/close, link lost, armour meter, magazine, three target glyphs | `scripts/game/draw-hud.py` → `poc/mobile/assets/game/hud/*.svg` (+ PNG previews) | exact geometry, runtime tint, zero credits. The first Leonardo test turned a hit marker into a 3D crystal; precision glyphs are not a diffusion job |
| **Leonardo (SDXL 1.0)** | 5 emblems, 5 equipment glyphs, 6 rank insignia, 5 level badges, 3 station flags, 8 backdrops (32 images) | `docs/ironpal-game-asset-prompts.md` → `scripts/game/leonardo_gen.py` → `input/game-assets/leonardo/` (gitignored, paid) → `scripts/game/install-assets.py` (rembg cut for squares, resize for backdrops) → `poc/mobile/assets/game/<section>/` | painterly, on-brand chrome; ~11 credits per image on the shared account, generator guarded by a 2 500-credit floor so Reddy keeps its budget |

Licence: generated under the account's paid API plan (commercial use granted for paid-tier output),
recorded the same way as `../reddy/docs/ASSET_LICENCES.md`. Raw generations are paid output — back
them up outside the repo.

**Originality checklist applied to every prompt and every accepted image:** no game names, no
weapon shapes, no soldier or character figures, no faces, no counter-terrorist/terrorist or
Nazi-era iconography, no lifted colourways beyond the IronPal palette, no typography from any game.
Targets are plates, pins and dumbbells.

### 17.7 Implementation notes (P2)

- `react-native-svg` for the glyphs; `react-native-reanimated` for the hit marker, crosshair lock and
  feed animations; a small sound library and a haptic module (both new, per feature ledger Q19).
- Assets ship in the app binary under `assets/game/` (≈ 6 MB after `install-assets.py`); backdrops
  at 1360×768 only (they sit behind UI and are never zoomed).
- The game state machine (`src/game/`) subscribes to `GateEvent`, `RepEvent`, `SetResult`, level
  changes and drift events from the model layer (§9) and owns nothing the model needs.
- Engagement KPIs added to §12 of the feature PRD's spirit: debrief completion rate ≥ 85 %, median
  debrief ≤ 20 s, sessions per week per active user ≥ 2, certifications per user per month ≥ 2,
  "all correct" rate rising session over session.

---

## 18. Anatomy — how the model is trained, and what happens to an unseen video

> Added 2026-09-17 on the founder's request: a single place that answers "what *is* the model,
> what goes into it, what comes out, and where does the labeling studio fit". Everything here
> describes code that exists in `poc/mobile/`; the constants are the shipped package's
> (`2026.09.1`), not aspirations.

### 18.1 The one sentence, and why it matters

**The model is a searchable memory of the user's own confirmed sets, not a network with weights.**
Recognition is a nearest-neighbour lookup: the phone compares the set just performed against every
set the user has already confirmed, and the closest match is the answer. "Training" is therefore
**writing a row**, not running an optimiser — which is why an update is instant, cannot forget,
can be explained ("this matched your set from 12 May"), and can be deleted one set at a time.

Three consequences follow, and they explain most of the design:

1. **There is no training run.** No epochs, no loss curve, no checkpoint. Adding the fifth goblet
   squat takes the same milliseconds as adding the first.
2. **Accuracy is a property of the store, not of a fit.** Whether the model is any good is measured
   by asking it to re-identify its own examples with each one removed in turn (§4.4's integrity),
   which is a question you can ask after every single set.
3. **The matcher never reads pixels.** It consumes IMU windows. Video earns its place in three
   other roles (§18.5), and confusing those roles is the fastest way to misunderstand the system.

### 18.2 Anatomy — the five parts, and where each one lives

| # | Part | What it physically is | Written by | Read by |
|---|---|---|---|---|
| 1 | **Template store** | rows in `model_templates`: the feature vector of §3.4 (axis energy split, cadence, motion duty, peak asymmetry, spectral flatness, jerk, plus the gyro energy split) + a `float16` IMU window, 6 channels at 50 Hz; kind `set` / `rep` / `negative` / `prior` | `learner.commit` | `TemplateIndex` (native), via `loadTemplates` |
| 2 | **Fitted parameters** | rows in `fitted_params`: per exercise cadence band, amplitude floor `A_min`, dominant channel, set-duration prior; per user `T_reject` | `learner.fit` after ≥ 3 sets | `params.compose` → `SignalModule.configure` |
| 3 | **Visual side** | `exemplar_frames` (glance / rep-top / rep-bottom crops, `auto` or user-pinned) + `weight_priors` | `learner.commit`, `learner.pinFrame` | the weight pre-fill, the Studio's Compare view, the future vision arbiter |
| 4 | **Claims** | `level_progress` (locked → recon → provisional → certified → veteran) + `integrity_history` | `levels.apply` | the live HUD's automation rule, the campaign map |
| 5 | **The package** | `assets/model_package.json`: engine defaults, thresholds, level bars, campaign map, explanation strings, the 33-pair `field_guide`, founder priors | `scripts/model/build_package.py`, signed ECDSA P-256 | everything, as the floor under the fitted values |

Parts 1–4 are the **user's model** and never leave the phone. Part 5 is the **shipped prior**, the
same for everyone, and is deliberately down-weighted as the user's own store fills (§3.5's
`kindPenalty`: a prior's distance is multiplied by `1 + n_own/3`, so it is ignored once the
exercise is certified).

**Size, in practice.** One set at 0.5 Hz for 40 s produces one set template (2 000 samples × 6
channels × 2 bytes = 24 kB) plus about 20 rep templates of one cycle each (≈ 24 kB together) —
call it 48 kB of `float16`, or ~65 kB once base64-encoded into the row. The store is capped at 20
set templates per exercise (§4.5), so a fully-trained exercise lands near 1.3 MB and all 37 Tier-1
exercises together stay far under the 2 GB feature cap, which is dominated by video, not by the
model.

### 18.3 What goes in and what comes out

**Two streams in.** Everything else is derived.

| Stream | Shape | Where it is made canonical |
|---|---|---|
| **IMU** | 6 channels (linear accel m/s², gyro rad/s) at the source's native rate — 50 Hz phone, 60 Hz headband — resampled to a canonical 50 Hz, rotated into the head frame by the session's calibration | `ImuPipeline` → `Dsp.resample` → `Rotation.apply` |
| **Video** | one clip per set (720p30 when the app owns the camera), plus the sharpest still of the ~2 s staging glance | `CameraModule.startClip`, `ClipModule.ingest` |

**Four answers out**, each with the evidence that produced it (`decide.ts` writes an explanation
object at decision time, so the reason is stored, not reconstructed later):

| Answer | Source | Confidence | What it is allowed to do |
|---|---|---|---|
| **Exercise** | the two-stage match (§18.4) | `1 / (1 + d_fused)` | auto-log only at Certified; below that it proposes |
| **Reps** | the streaming rep clock | periodicity-derived | certify only for `imu` / `fusion` exercises |
| **Weight** | prior, then OCR of the glance still | OCR's own | pre-fill; ask when the two disagree |
| **Gate / unknown** | energy and periodicity against their thresholds | the periodicity itself | refuse to answer, with the numbers that made it refuse |

### 18.4 Training — what one confirmed set actually does

This is `learner.commit`, in order. Nothing here is asynchronous magic; it is ten writes.

```
confirmed set (exercise, bounds, rep tops, weight)
  │
  1. persist the labelled set ──────────► labeled_sets  (+ the window, the SetResult JSON,
  │                                        host-time bounds, label source, revision)
  2. gates all pass? ──── no ───────────► stop. The set is KEPT and visible, but teaches nothing.
  │                                        (studio design §7.5 — a failed gate is explained, never silent)
  3. IMU present? ─────── no ───────────► video-only set: exemplars + weight prior only (§18.5c)
  │
  4. slice the set window [tStart,tEnd] ─► one `set` template
  5. slice ±½ cycle around each rep top ─► N `rep` templates  (a 40 s set at 0.5 Hz → ~20)
  6. harvest rest windows ──────────────► ≤ 5 `negative` templates per session, 4 s each,
  │                                        ≥ 30 s apart, and ONLY where the gate never opened
  │                                        and periodicity stayed below P_off (R11)
  7. closed-form fits over this exercise's counted sets (needs ≥ 3):
  │      cadence band = [p10·0.8, p90·1.2]      A_min = 0.4 × median rep amplitude
  │      dominant channel = modal axis          set duration = median + IQR
  8. leave-one-out integrity over the whole campaign, natively (`scoreAll`)
  9. level transition from (clean sets, distinct weights, integrity)
 10. prune above 20 sets, audit row, hot-reload the engine (`loadTemplates` delta + `configure`)
```

Two details are worth dwelling on because they are where the honesty lives.

**Step 6 — negatives are the reject class.** Without them a nearest-neighbour matcher answers
*something* for every input, including scratching your nose. The rest windows between sets are
harvested automatically, labelled `unknown`, and compete in the match on equal terms; a live window
that lands nearest a negative is reported as unknown rather than as a lift. They cost the user
nothing. The rule that a *periodic* window is never harvested exists so an untagged real set cannot
be turned into a permanent example of "not exercise".

**Step 8 — integrity is the model grading itself.** For every own `set` template of the campaign,
the engine re-runs the match with that template excluded and asks whether it still lands on the
right exercise. The hit rate is the exercise's integrity, and it is the gate for every claim the
game makes (§6.1: 0.80 for Provisional, 0.90 for Certified). It is computed after **every** set, so
the answer to "is this working" is never older than one set.

### 18.5 Inference — an unseen set, and an unseen *video*

**The live path** (`SignalModule.tick`, every 400 ms over the last 4 s):

```
window → head frame → rep channel (fitted dominant axis, band-passed 0.2–1.5 Hz)
   ├─ energy + periodicity ──► GateMachine   (P_on 0.35 / P_off 0.25, hysteresis, 2 qualifying ticks)
   ├─ per-sample causal peaks ► RepClock     (confirmed after ¼ cycle, 150–400 ms; that delay IS the
   │                                          cue latency floor)
   └─ features + kNN only ───► provisional label (no DTW on a tick — that is the §12 budget)

at gate close: SetAnalyzer.finish
   stage 1  kNN over ≤ ~740 feature vectors, weighted (axis 2.0, cadence 0.8 log-ratio, duty 1.2,
            asymmetry 1.0, flatness 1.0, jerk 0.8, gyro 1.5) → top 8
   stage 2  banded DTW (band 0.2) on the z-normalised band-passed magnitude of those 8
   fuse     d = 0.6·d_knn + 0.4·d_dtw ;  confidence = 1/(1+d) ;  below T_reject 0.45 → unknown
   → SetResult: candidates[3] with distances and provenance, peaks, periodicity, the window itself
```

**Now the question the founder actually asked: what happens to an unseen video?** The honest answer
has three cases, and the difference between them is the whole design.

| Case | What the app has | What the model does with it | What it can never do |
|---|---|---|---|
| **(a) Video + IMU, same session** — the product path | a per-set clip whose PTS maps onto the IMU's host clock | the **IMU** answers exercise and reps; the video supplies the glance still for weight OCR, the exemplar crops, and the Studio's replay surface for checking the answer | — |
| **(b) Video alone** — a KB clip, a gallery import, the ShenYao rig before alignment | pixels and nothing else | it becomes a **video-only set** (`imu_available = 0`): it writes exemplar frames and a weight prior, and **writes no templates at all** | it can never certify reps, and never counts toward Campaign-1 certification. `learner.commit` returns early, by design |
| **(c) IMU alone** — phone in a pocket, clip reduced after 7 days | a window and a trace | the full training path of §18.4 | no exemplars, no weight OCR |

So: **the model does not "watch" an unseen video and decide what it is.** Nothing in the matcher
reads a frame. A video's contribution is (i) one still that the cloud OCR may read a number from,
(ii) crops kept as visual exemplars for the future vision arbiter and the gym pack, and (iii) a
surface a human can scrub to place the labels the model learns from. That is why case (b) teaches
the equipment side and nothing about the body — exactly the split the feature PRD's §1.4 table
draws between what transfers between people and what does not.

The e2e harness now demonstrates case (b) with real footage: the knowledge base's case-001 clip
(a confirmed 6-rep, 5 kg dumbbell curl) is imported as a gallery clip with sync class `none`, and
the app says so rather than pretending it aligned.

### 18.6 How the labeling studio closes the loop

The Studio (`docs/ironpal-video-labeling-studio-design.md`) is not a viewer bolted on the side. It
is the **correction surface of the training loop**, and every one of its actions is a write into
the five parts of §18.2 through the same gates the 20-second Debrief uses.

```
     ┌──────────────────────────────────────────────────────────────────┐
     │  SET  ──► engine ──► proposals ──► DEBRIEF (≤ 20 s, one tap)     │
     │                            │                                     │
     │                            └──► "Open in After Action"            │
     │                                        │                         │
     │   STUDIO ◄── queue (what the model is least sure of) ◄───────────┤
     │     │                                                            │
     │     ├─ move / add / delete a rep mark  ──► rep templates change   │
     │     ├─ trim the bounds                ──► the set template changes│
     │     ├─ relabel the exercise           ──► templates move store    │
     │     ├─ tag an untagged region         ──► a whole new set appears │
     │     ├─ pin a frame                    ──► exemplar_frames         │
     │     └─ save ──► same gates ──► learner ──► integrity ──► level ───┘
```

What each Studio action does to the model, precisely:

| Studio action | Bridge call | Effect on the store |
|---|---|---|
| Scrub / step a frame | — (PTS table only) | none: navigation never writes |
| Add or move a rep mark | `peakNear` to snap | changes which windows become `rep` templates, and the fitted `A_min` / cadence band that follow from them |
| Trim the set bounds | — | changes the `set` template's window, and the `set_duration` fit |
| Relabel the exercise | `previewIntegrity` first, then `learner.relabel` | deletes the set's templates and its *auto* exemplars (user pins survive), re-commits under the new exercise, bumps `revision`, recomputes campaign integrity, then re-evaluates the level of **both** the old and the new exercise — because `commit` only ever moves a level up, and a set leaving an exercise can legitimately take its certification with it. The sheet warns before the write |
| Tag an untagged region | `scanRegions` → `analyzeRange` | a set that was never recorded becomes a first-class labelled set |
| Dismiss a region | — | the region row goes to `dismissed` with its reason, plus a `decisions` row; the Reel's next scan recognises it and does not raise it again. (It is not *also* excluded from negative harvesting — it does not need to be: a region is periodic by definition, and the harvester only ever takes non-periodic windows, R11.) |
| Pin a frame | `extractFrame` | a user exemplar that outranks the IMU-chosen one for that role |

Two of these deserve emphasis:

**`previewIntegrity` is a dry run of step 8.** Before the user commits a label, the engine matches
the candidate against the campaign index and reports what the exercise's integrity *would become*.
That is why the exercise sheet can say "saving this label would drop goblet squat below its
certified bar" — the model is asked the consequence before the consequence happens.

**`relabel` is a delete-and-recommit, not an edit.** The templates carry the label implicitly
(they live under an exercise id), so changing the label has to move the data, not rename it.
Doing it any other way would leave the store holding windows filed under an exercise the user
already corrected — the single most damaging thing that can happen to a nearest-neighbour model.

### 18.7 Worked example — KB case 001, end to end

The clip the e2e harness uses, followed through the whole system.

| Stage | What happens | What the model gains |
|---|---|---|
| Record | headband films 68 s; the IMU logs the whole session | a session log sliceable by host time |
| Gate | periodicity crosses 0.35 for two ticks ~30 s in | a set boundary, and a set id |
| Count | the rep clock confirms peaks ¼ cycle after each | a provisional count |
| Propose | kNN + DTW against the store; on a cold store the top candidate is a **founder prior**, so the proposal says so in as many words | nothing yet |
| Debrief | the user confirms "dumbbell biceps curl", **6 reps**, **5 kg** | — |
| Commit | gates pass → 1 set template, ~6 rep templates, up to 5 negatives, the weight prior 5 kg | the store's first curl |
| Integrity | leave-one-out over Campaign 2 | a number, probably 1.0 on a single example — which is *why* the bar needs 3 and 5 sets, not 1 |
| Level | locked → **recon** | the exercise now appears as a suggestion |
| Studio | the user re-opens it, finds the detector missed a rep at 41 s, adds the mark, saves | one more `rep` template, a corrected `A_min` fit, integrity re-run |

And what it still cannot do after all that: certify the rep count. The curl is `rep_signal: vision`
in the ontology — the head barely moves — so the level says "recognised and weight-primed", never
"counted by the headband". The model is prevented from making the claim by the campaign map, not by
good intentions.

### 18.8 The limits, stated plainly

- **No cross-body truth.** Another person's IMU templates enter only as priors, down-weighted from
  the follower's first own set and retired at Certified. An IMU trace is a property of a body.
- **No rep certification outside `imu` / `fusion`.** 22 of 37 Tier-1 exercises keep the head still.
- **No pixels in the matcher.** Vision arbitration against the user's own exemplars is designed
  (`sensor-fusion.md`) but not built; today the visual side is exemplars, the glance still and
  weight priors.
- **Cold start is priors, and says so.** Every proposal records whether it matched a prior or the
  user's own template, which is how the POC's open question about cross-user generalisation gets
  answered from logs rather than from opinion.
- **Nothing here is validated on a body yet.** The integrity bars (0.80 / 0.90) remain the
  assumption the feature PRD flagged: P0 must publish the measured distribution before they are
  trusted.
