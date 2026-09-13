# IronPal Device-Hosted Model — Product Requirements Document

**Status:** Draft v1.1 · 2026-09-13 — design review complete (auto mode)
**Owner:** founder (solo)

> **Decisions from the design review are in
> [`ironpal-self-training-model-prd_grilled.md`](ironpal-self-training-model-prd_grilled.md)
> (Q1–Q17) and are folded in below.** The review ran **without user interaction**: 8 decisions rest
> on evidence in the repo, 9 are assumptions tagged for veto, none are open — nothing in this
> document spends money or binds legally; the feature PRD's open items still apply.
**Companion to:** [`ironpal-self-training-prd.md`](ironpal-self-training-prd.md) — that document specifies
the *feature* (the self-training loop, the game, the gym pack). This one specifies the **model
component** that feature trains and runs: what it is, what it learns, how it fits on a phone, how it
explains itself, how it fails, and how it is updated.
**Grounded in:** the POC's native signal pipeline (`poc/mobile/android/.../Dsp.kt`, `SignalModule.kt`,
`ImuPipeline.kt`), the ontology (`docs/video-analysis-kb/ontology.json`), the sensor-fusion and
pipeline-strategy notes in `docs/video-analysis-kb/`, and the transfer doc
(`ironpal-poc-to-production-transfer.md`).

---

## 0. One-paragraph summary

The IronPal model is a **device-hosted, instance-based recogniser** for the three metrics — exercise,
reps, weight — that learns from the user's own confirmed sets and never needs a server to run. Its
trainable state is a store of labelled IMU windows, per-exercise fitted parameters, visual exemplars,
weight priors and rig calibrations; "training" is appending to that store and re-fitting a handful of
parameters, which takes under two seconds and cannot forget. Inference is a gate → match → decide
ladder that abstains instead of guessing and produces an explanation with every decision. The model
ships as **data** (a versioned model package) on top of a fixed native signal engine, so it can be
updated without reinstalling the app. A trainable neural tier is designed as a later addition, gated
on evidence that the instance-based tier has hit its ceiling.

---

## 1. Scope

**In scope — "the model":**

- the on-device **signal engine** (fixed code): resampling, band-pass, motion gate, periodicity, peak
  detection, feature extraction, normalised DTW;
- the **trainable state**: templates, negatives, fitted parameters, exemplars, priors, calibrations;
- the **inference ladder**: exercise recognition, rep clock, weight prior + OCR reconciliation, level
  states, abstention;
- the **learning loop**: incremental update, integrity, pruning, drift handling;
- **explanations**, **local security**, **packaging and update**, **error handling**, and the
  **verification harness**.

**Out of scope (peers, not parts):** the cloud weight-OCR service (a stateless peer the model calls
with one cropped still; `ironpal-poc-v1-design.md` D3), gym-pack assembly (backend; self-training PRD
§6.5), the game layer and the tagging UI (self-training PRD §7–8), and the headband firmware.

---

## 2. The twelve requirements, made concrete

The task lists twelve requirements. Each is restated below as something a test can pass or fail, with
the section that designs it.

| # | Requirement (as given) | Concrete acceptance criterion | Designed in |
|---|---|---|---|
| **R1** | Train incrementally on the device from the user's labelled footage | A confirmed set is folded into the model on the phone with no network, in ≤ 2 s on a Galaxy A52, and the next live set already benefits from it. No batch retraining step exists. | §4 |
| **R2** | Operate within the device's compute and memory | Live tick ≤ 15 ms CPU at 2 Hz; set-end match ≤ 150 ms; update ≤ 2 s; resident memory ≤ 60 MB for the model; store ≤ 50 MB for 37 certified exercises; battery ≤ 25 %/h in a session. | §5 |
| **R3** | Real-time feedback during recordings | Rep cue within 150 ms of *detection*, and detection within 400 ms of the physical top of the rep; gate-open within 2 rep cycles; target-acquired ≤ 500 ms after the still. The latency budget is stated, not hidden. | §6 |
| **R4** | Securely store and manage the user's data locally | All model data encrypted at rest with a key held in the Android Keystore; nothing leaves the device except the OCR still and explicit exports/contributions; per-set deletion and full erasure in one action. | §7 |
| **R5** | Update itself without full reinstallation | Model behaviour that lives in data (priors, thresholds, parameter defaults, ontology, campaign map, extractor configuration) ships as a signed **model package** applied in-app with migration and rollback; only native engine changes need an app update, and the store survives them because raw windows are kept. | §8 |
| **R6** | Operate autonomously on the user's patterns and preferences | Level states drive auto-logging; the model proposes, decides above thresholds, abstains below them, and generates its own next-data requests (missions) from its gaps. A bounded list of things it never does alone. | §9 |
| **R7** | Explain its decisions and recommendations | Every decision carries a structured explanation (evidence, alternatives, confidence, what would change it), generated at decision time and rendered by the UI; an audit log of model changes is readable by the user. | §10 |
| **R8** | Adapt to changes in routine and environment | Drift detectors on integrity, calibration, tempo/amplitude, gym; responses are demotion, recency weighting, re-calibration prompts and hard-mode missions; a rig change is absorbed through the canonical frame. | §11 |
| **R9** | Full functionality offline | Everything except cloud OCR and pack refresh works with the radio off; OCR is queued and reconciled later; the app states which values are pending. | §12 |
| **R10** | Integrate with other local apps and services | Workouts written to Android Health Connect (opt-in); CSV/JSON export via the share sheet; BLE headband; intents for start/stop; no third-party data is read. | §13 |
| **R11** | Robust error handling and recovery | A failure catalogue with detection, recovery and user message for every known failure; crash mid-set loses at most that set; a bad model package rolls back automatically. | §14 |
| **R12** | User-friendly interfaces and accessibility | Confidence is shown in words, every model interaction is one tap, abstention has a plain-language wording, every audio cue has a haptic twin, large-type mode; no interaction required under load. | §15 |

---

## 3. Architecture

### 3.1 Layers

```
 L6  Packaging & update     signed model package (data) · store migrations · rollback
 L5  Explanation & audit    per-decision evidence · model_audit · integrity history
 L4  Learning               append · fit parameters · negatives · integrity · prune · drift
 L3  Inference              gate → prefilter (kNN) → DTW on top-k → fuse → ladder → abstain
                            rep clock (peaks on fitted band) · weight prior ⇄ OCR reconcile
 L2  Trainable state        templates (set/rep/negative) · fitted params · exemplars ·
                            weight priors · rig calibration · priors (founder / gym pack)
 L1  Signal engine (fixed)  resample→50 Hz · band-pass 0.2–1.5 Hz · gate · periodicity ·
                            peaks · features · normalised DTW           [Dsp.kt]
 L0  Sensing                IMU ring buffer 24 s @ 50 Hz (phone or BLE) · sharpest still
                                                                        [ImuPipeline.kt, CameraModule.kt]
```

L0–L1 are native Kotlin and change only with app releases. L2–L6 are data plus small orchestration
code; everything the model *learns* lives in L2 and everything it can be *updated with* short of a
release lives in L6's package.

### 3.2 Two tiers

| Tier | What | Status | Why |
|---|---|---|---|
| **A — instance-based** | kNN on a 6–9 dimensional invariant feature vector fused with normalised DTW on the band-passed accel magnitude, plus per-exercise fitted parameters | **v1, ships** | Already implemented in the POC; incremental by construction; explainable ("matched your set from 12 May"); trivially deletable; no training framework on the phone. |
| **B — embedding + prototypes** | a small temporal-conv encoder (≤ 200 k parameters) producing a 32-d embedding; classes are prototypes (means of the user's embedded sets); on-device fine-tuning of the encoder with a supervised-contrastive loss over the user's store | **v2, designed, not built** | Only worth it if Tier A's ceiling is hit: integrity plateaus below 0.9 on Campaign 1 for users with ≥ 10 sets per exercise. Prototype classes keep the instance-based virtues (append, delete, explain by nearest set). |

**Promotion gate for Tier B:** measured on ≥ 5 users' stores replayed in the harness (§17): Tier B
must beat Tier A by ≥ 5 points of exercise accuracy on Campaign 1 *and* keep confident-wrong at zero.
Until then Tier B is not in the app binary.

### 3.3 Where the two campaigns differ

The model's competence is bounded by the ontology's `rep_signal` (self-training PRD §5). For `imu`
and `fusion` exercises the IMU path delivers exercise and reps; for `vision` exercises the IMU path
delivers a gate, set boundaries and a coarse exercise prior, and the visual exemplar store plus the
cloud recogniser deliver the fine call; for `hard` exercises the model records exercise and weight and
explicitly declines to certify reps. The model never reports a rep count it cannot back with a
periodic signal.

---

## 4. R1 — Incremental training: what is actually learned

"Training" in Tier A is two things, both incremental, both bounded:

### 4.1 Appending examples

After each confirmed set (self-training PRD §6.3): the set window, the per-rep windows sliced at the
confirmed rep tops, and negatives harvested from non-periodic REST/walk windows are canonicalised
(rig rotation from the session calibration, 50 Hz, SI units) and appended with both representations
— feature vector and raw window. Raw windows are kept **forever** (a certified exercise's store is
~20 × 4 s × 50 Hz × 6 channels × 4 B ≈ 100 kB): they are what lets a future extractor version
re-derive features without re-recording (§8.3).

### 4.2 Fitting parameters

A small set of per-exercise and per-user parameters is re-fitted from the store after every append.
These are the model's "weights"; there are few of them, each has a physical meaning, and each has a
default from the model package that the fit overrides only when the store has enough data.

| Parameter | Scope | Fitted from | Default (package) | Used by |
|---|---|---|---|---|
| Cadence band `[f_lo, f_hi]` | exercise | 10th–90th percentile of confirmed rep cadences ± 20 % | 0.2–1.5 Hz | peak detector min-spacing, gate periodicity window |
| Peak amplitude threshold | exercise | 40 % of the median confirmed rep peak amplitude (band-passed magnitude) | fixed prominence | rep clock: rejects head-bob blips |
| Dominant channel | exercise | channel with the highest rep-band energy across confirmed sets | magnitude | rep clock and DTW input |
| Rep-shape template | exercise | median of per-rep windows (time-normalised) | none | DTW target for rep-level matching; explanation graphic |
| Set duration prior | exercise | median set length, IQR | none | gate-close timing, "did the set end?" |
| Reject threshold `T_reject` | user | chosen so that leave-one-out negatives score below it at the 95th percentile while positives clear it | 0.45 | the UNKNOWN decision |
| Prior weight | user × exercise | 1 / (1 + own sets) | 1.0 | how much founder / gym-pack priors count in matching |
| Recency weight | user × exercise | exponential, half-life 30 sessions | uniform | drift adaptation (§11) |

Fits are closed-form (percentiles, medians, energies) — no iterative optimisation, no risk of
divergence, deterministic given the store. Every fit is recorded in `model_audit` with the values
before and after.

### 4.3 What is deliberately *not* learned in Tier A

- The feature definitions and their fusion weights (`Dsp.kt` W\_\*): changing them changes what a
  template *means*; they belong to the package (§8) and are validated in the harness, not fitted on a
  phone.
- Anything about other users: pooled priors are read, never fitted from.
- Vision: the visual exemplar store is nearest-neighbour by construction; the cloud recogniser is not
  trained.

---

## 5. R2 — Efficiency budgets

Target device: Samsung Galaxy A52 (SM-A525F, 2021, Snapdragon 720G, 6 GB), the POC's measured
device. Budgets are per-operation and enforced by the benchmark in §17.

### 5.1 Compute

| Operation | Frequency | Budget | Design that meets it |
|---|---|---|---|
| Live tick (gate + features + prefilter) | fixed-delay executor in `SignalModule` over the 4 s `ANALYSIS_WINDOW_SEC` snapshot (200 samples); 2 Hz assumed, the period is a package parameter | ≤ 15 ms | band-pass and autocorrelation are O(n) and O(n·lags); features are cheap; **kNN prefilter only** on ticks — no DTW during the set |
| DTW match at set end | once per set | ≤ 150 ms | DTW only against the **top-k = 8** candidates from the kNN prefilter, Sakoe-Chiba band 0.2 (200 × 40 cells); template band-passed magnitudes **cached at load**, not recomputed per comparison (the POC recomputes them inside the loop — `Dsp.matchAgainstTemplates`) |
| Update after a confirmed set | once per set | ≤ 2 s | append + closed-form fits + leave-one-out integrity over the campaign (≤ 15 exercises × ≤ 20 sets: ≤ 300 kNN + ≤ 300 × 8 DTW ≈ 2 400 DTW ≈ 1.5 s worst case; incremental: only re-score sets whose top-k included the changed exercise) |
| Rep clock | per sample | negligible | peak detection on the fitted band, incremental |
| Sharpest-still selection | during glance | ≤ 30 ms/frame at 720p | variance of Laplacian on a downscaled frame (exists in `CameraModule`) |

### 5.2 Memory and storage

| Item | Budget | Notes |
|---|---|---|
| Resident model memory | ≤ 60 MB | ring buffer 24 s × 6 ch × 8 B ≈ 115 kB; loaded templates ≤ 37 × 20 × 100 kB ≈ 74 MB **uncompressed** → keep windows as `float16` on disk and load per campaign: ≤ 25 MB resident |
| Store on disk | ≤ 50 MB for 37 certified exercises | windows `float16`, exemplar frames ≤ 100 kB each, ≤ 8 per set |
| Model package | ≤ 8 MB | founder priors ≈ 4–5 MB + configuration |
| Video (feature's responsibility, not the model's) | per self-training PRD §9.6 | the model asks for ≤ 8 frames per set and nothing else |

### 5.3 Battery

≤ 25 % per hour in a session with BLE IMU, per-set video and live ticks (self-training PRD §10).
The model's share: ticks at 2 Hz ≈ 3 % of one core; BLE IMU ≈ 1–2 %/h. Video capture dominates.

---

## 6. R3 — Real-time feedback: the honest latency chain

"Real-time" has a floor set by physics, not code. A peak cannot be confirmed until the signal has
turned around, so a rep is detected **after** its top. The budget:

| Stage | Latency | Note |
|---|---|---|
| IMU sample → phone | ~17 ms (BLE, 60 Hz notifications, 0 seq gaps measured) or ~0 (phone IMU) | firmware README |
| Resample/ring buffer | ≤ 20 ms | |
| Peak confirmation | **150–400 ms** | needs ≈ ¼ cycle of post-peak samples at 0.5–1.5 Hz cadence |
| Decision → cue (audio/haptic) | ≤ 150 ms | R3 as specified |
| **Rep cue after physical top** | **≤ 550 ms typical, ≤ 400 ms at fast cadence** | stated in the UI settings as "cues land just after the top of the rep" |
| Gate open | ≤ 2 cycles after set start | periodicity needs ≥ 2 cycles to be measurable |
| Gate close | set-duration prior + 1.5 × cycle without a peak | |
| Target-acquired (glance) | ≤ 500 ms after the still is judged sharp | |

Live exercise *recognition* is a rolling kNN-only estimate during the set and becomes final at set
end with DTW; the HUD labels it "provisional" until then. This is why the self-training PRD makes the
set screen-free: the feedback that is reliable in real time is the rep cue, and it is audio.

---

## 7. R4 — Secure local storage

**Threat model.** A lost or stolen phone; a curious app on the same device; a backup landing on a
cloud the user did not intend; a bystander's face in an exemplar. Not in scope: a rooted device with
a hostile OS.

| Asset | Protection |
|---|---|
| Store (SQLite: templates, sets, params, priors, progress, audit) | encrypted database (SQLCipher-compatible), key generated in and wrapped by the **Android Keystore**, hardware-backed where available; opened only while the app is foreground or in a recording foreground service |
| Exemplar frames, per-set clips | app-private storage, encrypted with a per-file key wrapped by the same Keystore key; clips reduced per the retention policy (self-training PRD §9.6) |
| Model package | signed by IronPal; signature verified before apply (§8) |
| Exports / backups | encrypted with a user passphrase (Argon2id-derived key); the app never uploads them itself |
| OCR egress | one cropped still per glance, TLS, deleted server-side after inference (design D3); listed on the "what leaves the phone" screen |
| Contributions (gym pack) | reduced form only, opt-in, revocable (self-training PRD C9) |

**Data management.** Per-set delete removes templates, exemplars, clip and audit references in one
transaction; per-exercise and full reset return to package priors; full erasure also destroys the
Keystore key, which makes any remaining ciphertext unrecoverable. Android's auto-backup is **excluded**
for the store — the POC manifest already sets `android:allowBackup="false"` — and replaced by the
explicit passphrase export. The encrypted database is provided by an SQLCipher-compatible SQLite
binding (the design doc's own alternative, `op-sqlite`, ships one); the POC's
`react-native-sqlite-storage` is replaced in P0, which is small because the store API in
`store/db.ts` is thin.

---

## 8. R5 — Updating the model without reinstalling the app

### 8.1 The split

| Changes with… | Delivered by | Examples |
|---|---|---|
| **Model package** (data) | signed bundle fetched opportunistically, applied in-app, rollback-able | founder priors, parameter defaults, cadence bands, `T_reject` default, fusion weights, ontology and campaign map, extractor *configuration* (which features are on, their weights), explanation templates, error-message text |
| **App release** (code) | Play/APK update | native signal engine (`Dsp.kt`, `ImuPipeline.kt`), storage schema *code*, new sensors, Tier B encoder |

Most tuning discovered in dogfood — integrity bars, thresholds, priors — is package territory, so it
ships in days, not with a release.

### 8.2 Package format and application

- `model_package.json` + priors blob; fields: `package_version`, `min_engine_version`,
  `store_schema_version`, `extractor_version`, `params`, `ontology`, `campaign_map`, `priors[]`,
  `explanations`, `signature`.
- Apply = verify signature → check `min_engine_version` ≤ installed engine → open a transaction →
  run store migrations (§8.3) → swap active package → smoke-test on 3 golden windows bundled with the
  package → commit. Any failure rolls back to the previous package and reports (§14).
- Packages are fetched when online and applied at the **next app start**, never mid-session.

### 8.3 Extractor changes and the store

If `extractor_version` changes, feature vectors in the store are stale. Because raw windows are kept
(§4.1, and D7 in the POC), the migration **re-extracts features from raw windows** and re-fits
parameters; it runs in the background with progress, and the previous package stays active until it
finishes. A schema change that cannot be migrated automatically is a release, not a package.

---

## 9. R6 — Autonomy, bounded

### 9.1 What the model decides on its own

| Decision | Rule |
|---|---|
| Exercise label in live mode | ladder: gate → `T_reject` → IMU high-confidence (≥ 0.7) → vision high-confidence (≥ 0.65) → agreement → else ask (POC fusion §7, unchanged) |
| Whether to auto-log a set | only for **Certified** exercises and only above the exercise's confidence threshold; Provisional always asks; Recon proposes only |
| Reps | IMU count for `imu`/`fusion`; vision or user count for `vision`; declines for `hard` |
| Weight | prior pre-fill; OCR read accepted when it agrees or is ≥ 0.6 confident *and* within one increment of the prior; otherwise asks |
| Next data to request | missions generated from store gaps (second weight, hard-mode session, uncharted station) |
| Demotion | two consecutive live corrections on a certified exercise |
| Pruning | drop the oldest set whose removal does not lower integrity, when over the cap |

### 9.2 What it never does alone

Overwrite a user-entered value; delete user data (except the pruning rule above, which never touches
a set the user pinned); share or upload anything; change level state upward without the set counts
and integrity bars; apply a model package mid-session; claim a rep count on a `hard` exercise; report
a weight without a source.

### 9.3 Preferences it learns

Preferred cue volume/haptics, whether the user wants provisional labels shown, typical rest length
(for when to open the debrief), typical loads per exercise, and the user's own rep tempo. All are
stored as parameters (§4.2) and visible in the model inspector.

---

## 10. R7 — Explanations

Every decision object carries an `explanation` generated **at decision time** from the evidence that
produced it — never reconstructed afterwards.

| Decision | Explanation contents | Rendered as |
|---|---|---|
| Exercise | top-3 candidates with fused distance and confidence; the nearest stored set (date, weight, reps) for the winner; which representation decided (kNN vs DTW); whether a prior or the user's own set matched; what would flip it ("goblet squat would need a shorter cadence") | "Matched your goblet squat from 12 May (0.86). Runner-up: front squat (0.41)." + trace overlay |
| Reps | peak timestamps, the fitted band and amplitude threshold, rejected candidate peaks and why (below amplitude, too close), confidence | rep marks on the IMU trace with rejected ones greyed |
| Weight | the glance frame, the OCR read and confidence, the prior, which rule accepted or asked | frame thumbnail + "read 24 kg (0.91), your usual 24 kg" |
| Gate / UNKNOWN | energy and periodicity scores vs thresholds | "no steady rhythm found (periodicity 0.31 < 0.5)" |
| Level change | set count, distinct weights, integrity before/after, the set that tipped it | integrity meter animation + one sentence |
| Abstention | which evidence was missing | "no staging glance — I never saw the weight" |
| Model update | what was added, what was pruned, parameter deltas, integrity delta | `model_audit` row, readable in the inspector |

Explanations are structured data (JSON) so the UI, the audit log and the harness all consume the
same object; the plain-language sentence is produced from templates in the model package, which
keeps wording updatable (§8).

---

## 11. R8 — Adaptation to routine and environment

| Signal of change | Detector | Response |
|---|---|---|
| Recognition drifting | leave-one-out integrity falls > 0.1 below its 10-session median | demote to Provisional; ask for one confirming set; recency weighting favours recent sets |
| Rig fit changed | calibration rotation delta ≥ 10° from the store's median (self-training PRD §8.1) | re-canonicalise live windows with the new rotation; award hard-mode credit; if integrity drops anyway, prompt a re-calibration |
| Tempo / strength changed | confirmed cadence or amplitude outside the fitted band for 3 sets | widen the band from the new sets; note it as "your tempo changed" in the inspector |
| New gym | check-in at a different gym | separate campaign map and pack; IMU stores shared (they are about the body), atlas not |
| New exercise variant | repeated corrections from exercise X to a sibling Y | offer to chart Y as its own level |
| Long absence | > 30 days without a session | nothing forgotten; first session shows "priors re-enabled for one set" only if integrity re-check fails |
| New hardware (production headband) | `rig_id` changes; calibration ritual on first session | canonical frame absorbs axis and FOV differences; bridge validation per the transfer doc §7 before trusting certified states, which are set to Provisional until one clean set confirms |

Adaptation never deletes history; it re-weights it.

---

## 12. R9 — Offline matrix

| Function | Offline | Note |
|---|---|---|
| Sensing, gate, rep clock, recognition, level states | ✅ | fully on device |
| Confirmed-set update, integrity, fits | ✅ | |
| Explanations, inspector, audit | ✅ | |
| Weight OCR | ⏳ queued | pre-filled from the prior; reconciled when back online; the set counts toward certification without it (only the bonus waits) |
| Gym pack refresh, Scout contribution | ⏳ opportunistic | cached pack used |
| Model package fetch | ⏳ opportunistic | applied at next start |
| Health Connect write, export | ✅ | local |

The UI marks pending values with the existing "…" state (POC Q8).

---

## 13. R10 — Integration with local apps and services

| Integration | Direction | Mechanism | Default |
|---|---|---|---|
| **Android Health Connect** | write | one `ExerciseSession` per gym session with per-set exercise, reps and weight as segments/records; the user's other apps read it from there | opt-in |
| Share sheet | out | CSV / JSON of sessions; encrypted store export | on demand |
| Intents | in | `START_SESSION`, `STOP_SESSION`, `OPEN_LEVEL` for shortcuts, Wear/assistant triggers | on |
| BLE headband | in | IMU stream (existing `BleImuSource`), control/telemetry | on |
| Notifications | out | debrief ready, mission available, package applied | on, quiet during a set |
| Third-party workout apps' data | — | **not read**; IronPal is a source, not a consumer, of other apps' data | — |

Nothing here creates a server dependency; Health Connect is on-device.

---

## 14. R11 — Failure catalogue

| Failure | Detection | Recovery | User message |
|---|---|---|---|
| BLE link drops mid-set | `seq_gaps > 0`, no packets > 1 s | keep the set with a gap flag; rep clock pauses; auto-reconnect; re-anchor on next nods | "Headband lost for 3 s — this set won't count for certification" |
| IMU saturation | `saturated > 0` | flag set; exclude clipped windows from templates | "Too explosive for the sensor — set kept, not trained on" |
| Orientation jump / band slip | rotation estimate jumps > 25° within a set | flag; ask for re-nod | "Band moved — nod three times when you can" |
| No staging glance | no sharp implement frame in the ARM window | set counts for exercise/reps, weight abstains | "I never saw the weight" |
| OCR failure or timeout | HTTP error / > 20 s | queue and retry with backoff; prior used | "Weight read pending" |
| Storage full | free space < 500 MB at session start or during capture | refuse to start video; IMU-only session still allowed; reduce old clips | "Low storage: recording sensor only" |
| Corrupted template / window | checksum on load | quarantine the row; exclude; log | none (inspector shows "1 set quarantined") |
| Store migration failure | exception in migration | roll back to previous package; keep old schema active | "Update postponed" |
| Bad model package | signature or smoke-test failure | reject; keep active package | none (audit row) |
| Crash mid-set | WAL journaling; set state machine persisted per tick | on restart, recover the set as "unconfirmed" and offer the debrief | "Recovered your last set" |
| Integrity check timeout (> 5 s) | timer | skip incremental re-score; schedule full re-score in background | none |
| Clock skew between IMU and video | sync correlation peak < 0.2 | mark clip unsynced; trace-only debrief | "Couldn't align video — trace only" |

Every failure produces a `model_audit` row; none produces a silent wrong value — the rule inherited
from the KB's confident-wrong gate.

---

## 15. R12 — Interface principles for a model

- **Confidence in words, not numbers:** "sure / probably / not sure / didn't see it", with the number
  available on tap.
- **One tap per decision;** "all correct" when nothing changed; abstention is a first-class answer.
- **Nothing under load:** no interaction from gate-open to 5 s after gate-close; cues are audio with
  haptic twins; the debrief waits.
- **The inspector is the model's UI:** per exercise, its sets, parameters, integrity history, priors
  in use, last explanations, audit log; plain language, large-type mode, colour never the only
  channel.
- **Accessibility:** every cue distinguishable with gym headphones on and reproduced as a haptic
  pattern; screen-reader labels on every model output; no time-boxed interaction anywhere.

---

## 16. Data model additions (local, extends the self-training PRD §11)

```sql
CREATE TABLE fitted_params (
  scope TEXT CHECK (scope IN ('exercise','user','user_exercise')),
  exercise_id TEXT, name TEXT, value TEXT,            -- JSON value
  fitted_from_n INTEGER, package_default TEXT, updated_at INTEGER,
  PRIMARY KEY (scope, exercise_id, name)
);
CREATE TABLE model_packages (
  package_version TEXT PRIMARY KEY, extractor_version TEXT, engine_min TEXT,
  applied_at INTEGER, state TEXT CHECK (state IN ('active','previous','rejected')),
  signature_ok INTEGER, smoke_ok INTEGER
);
CREATE TABLE decisions (
  id TEXT PRIMARY KEY, session_id TEXT, labeled_set_id TEXT, kind TEXT,   -- exercise|reps|weight|gate|level
  value TEXT, confidence REAL, source TEXT, explanation TEXT,            -- JSON
  created_at INTEGER
);
CREATE TABLE quarantine (row_ref TEXT PRIMARY KEY, reason TEXT, at INTEGER);
-- templates gain: canonical_rotation TEXT, extractor_version TEXT, window_f16 BLOB, checksum TEXT
```

---

## 17. Verification harness

The model is tested the way the KB already is: **replay, score, gate on confident-wrong**.

- **Session replay:** `imu.jsonl` + labels from real sessions (the capture programme's output, and
  the founder's own store) replayed through the engine on device *and* in CI (Kotlin unit tests
  against the same `Dsp` code, plus the TS mirror `src/signal/dsp.ts`).
- **Scorers:** `scripts/kb/score_reps.py` (exact for `imu`, ±1 range otherwise) and
  `score_weights.py` (four-state, confident-wrong = build failure) consume the model's decisions.
- **Golden stores:** three frozen user stores with known integrity and level states; any package or
  engine change must reproduce their decisions or explain the delta.
- **Benchmarks:** the §5 budgets measured on the A52 in CI-on-device (adb) — tick, match, update,
  memory, and a 60-minute battery run.
- **Chaos:** the §14 catalogue injected (BLE drop, saturation, storage full, bad package) with the
  expected recovery asserted.
- **Explanation check:** every decision in a replay must carry an explanation whose evidence
  references exist (peaks, templates, frames).

---

## 18. Metrics

| Metric | Target | Source |
|---|---|---|
| Update latency (append + fit + integrity) | p95 ≤ 2 s on A52 | benchmark |
| Live tick CPU | p95 ≤ 15 ms | benchmark |
| Rep cue after physical top | p95 ≤ 550 ms | replay with video ground truth |
| Confident-wrong (exercise, reps, weight) | **0** | scorers |
| Exercise accuracy, certified Campaign-1 exercises | ≥ 95 % | live corrections |
| Reps exact, certified `imu` exercises | ≥ 90 % | live corrections |
| Abstention rate, certified exercises | ≤ 10 % | decisions |
| Explanation coverage | 100 % of decisions | harness |
| Package apply success | ≥ 99 %, 0 unrecoverable | `model_packages` |
| Store size at 37 certified exercises | ≤ 50 MB | inspector |
| Battery per hour | ≤ 25 % | measured |

---

## 19. Rollout (maps to the self-training PRD phases)

| Phase | Model work |
|---|---|
| **P0** | Tier A store + append + fits + integrity; template magnitude cache and kNN prefilter (§5.1); raw windows `float16`; encrypted store; `decisions` with explanations; inspector v0 |
| **P1** | rep clock on fitted bands; glance/still path; OCR reconcile; failure catalogue items for BLE/saturation/storage; harness replay in CI |
| **P2** | model package format, signing, apply/rollback, extractor re-derivation; drift detectors; missions from gaps |
| **P3** | Health Connect write; intents; benchmarks and battery run on testers' phones; golden stores frozen |
| **P4** | pack priors as a prior source with the same weighting rules; bridge-validation hook for the production headband |
| **Later** | Tier B behind the promotion gate (§3.2) |

---

## 20. Risks

| # | Risk | Mitigation |
|---|---|---|
| M1 | Tier A ceiling: kNN + DTW on head-IMU cannot separate squat-family exercises for some users | integrity is measured per user and shown; Tier B designed with a promotion gate; Campaign 1 stays honest per `rep_signal` |
| M2 | Fitted parameters overfit a few sets | fits only override defaults at ≥ 3 sets; percentiles, not extremes; audit shows deltas |
| M3 | Latency floor disappoints ("cue is late") | stated in the UI; audio timing tuned to the *next* rep's rhythm rather than the last peak (predictive cue) as a P2 experiment |
| M4 | Encryption cost on low-end phones | measure in P0; SQLCipher overhead is small at this store size |
| M5 | Package update breaks a store | migrations transactional; smoke test; rollback; raw windows allow re-derivation |
| M6 | Explanations reveal bystanders (frames) | explanations reference crops only; frames follow the retention policy |
| M7 | Health Connect permission friction | opt-in, off by default, one screen |
| M8 | Solo scope: harness + chaos tests cost time | the harness reuses the KB scorers and the session replay tool that already exist |

---

## 21. Open questions — resolved in review

The draft's six open items were all engineering choices, and the review settled them (ledger
Q3, Q4, Q8, Q10, Q11, Q15). What remains conditional is inherited from the feature PRD (data-sharing
legal basis, gym partnership, monetisation, marketing claims) and is not repeated here.

| Was open | Resolved as | Ledger |
|---|---|---|
| Encrypted SQLite implementation | SQLCipher-compatible binding (`op-sqlite`), key wrapped by the Android Keystore; library swapped in P0 | Q11 |
| Tier B framework | deferred to the promotion gate; not in the binary until it is met | Q3 |
| Predictive cue | P2 experiment, off by default, kept as a setting once measured | Q10 |
| Model package distribution | served by the existing FastAPI backend, bundled package as fallback, applied at next start; never a run-time dependency | Q8 |
| Health Connect as the only local integration | yes for v1; Wear OS out, revisited by the game layer if a wrist cue channel is wanted | Q15 |
| Raw-window retention | forever, as `float16`; bounded by the 20-set cap per exercise | Q4 |
