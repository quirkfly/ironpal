# Grilled — Device-Hosted Model PRD (auto mode)

Decisions resolved on **2026-09-13** against
[`ironpal-self-training-model-prd.md`](ironpal-self-training-model-prd.md), **without user
interaction**. Tags: **EVIDENCE** (answered from the repo, cited) · **ASSUMED** (the recommendation I
would have made interactively, with the strongest counter) · **OPEN** (money, legal, external —
not mine to settle).

This PRD sits under the self-training PRD; decisions already made there
([`ironpal-self-training-prd_grilled.md`](ironpal-self-training-prd_grilled.md) Q1–Q35) are inherited
and not re-asked. Nothing in this document spends money, publishes externally or binds legally, so
**no new OPEN items arise**; the feature PRD's five open items still apply.

**Tally: 17 questions — 8 EVIDENCE · 9 ASSUMED · 0 OPEN.**

---

## Branch A — What is learned

### Q1 — Is "train incrementally on the device" satisfied without gradient training?

**EVIDENCE.** The POC matcher is instance-based (`Dsp.matchAgainstTemplates`: kNN over
`extractFeatures` fused 0.6/0.4 with `normalizedDtw`, reject at `T_REJECT = 0.45`). Appending a
labelled window *is* the training step and takes effect on the next match. The feature PRD's ledger
Q1 already fixed this as v1.

**Decision:** yes. Tier A "training" = append + closed-form parameter fits (§4). The wording of R1 is
met literally: incremental, on device, from the user's labelled footage, no batch step.

### Q2 — Which parameters are fitted, and from what defaults?

**EVIDENCE** for the defaults: `CANONICAL_RATE_HZ = 50`, `REP_BAND_LOW/HIGH_HZ = 0.2/1.5`, fusion
weights `W_*`, `T_REJECT = 0.45`, `T_IMU_HIGH = 0.7`, `T_VIS_HIGH = 0.65`, `T_OCR = 0.6`
(`Dsp.kt`, `src/config/index.ts`). **ASSUMED** for the fitted set: cadence band, peak amplitude
threshold, dominant channel, rep-shape template, set-duration prior, per-user `T_reject`, prior and
recency weights — all closed-form (percentiles, medians, energies) so a fit can never diverge.
*Against:* eight parameters is still eight ways to overfit three sets; hence fits override defaults
only at ≥ 3 sets (R M2).

### Q3 — Build Tier B (trainable encoder) now?

**ASSUMED.** No. Designed with a promotion gate (≥ 5 points over Tier A on Campaign 1 across ≥ 5
replayed stores, confident-wrong still 0) and kept out of the binary until then. The framework
choice (TFLite on-device training vs ONNX Runtime Mobile vs a hand-written encoder) is deferred to
the gate. *Against:* squat-family separation from a head IMU may need learned features from day one;
the harness will show that before any user does.

### Q4 — Raw-window retention: forever or capped?

**ASSUMED.** Forever, as `float16`: a certified exercise's windows are ≈ 100 kB, the whole store
≤ 50 MB, and raw windows are what make an extractor change survivable (Q7). *Against:* "forever" on a
phone sounds unbounded; the cap on sets per exercise (20) bounds it in practice.

## Branch B — Fitting on the phone

### Q5 — Does the current matcher meet the compute budget?

**EVIDENCE that it does not, yet.** `matchAgainstTemplates` recomputes `bandPass(magnitudeSeries(...))`
for **every template on every call** and runs DTW against **every** template, with no prefilter. At
POC scale (a handful of templates) this is invisible; at 37 exercises × 20 sets it is ~740 DTWs per
call. **Decision:** cache each template's band-passed magnitude at load, run kNN on features first,
and DTW only the top-8 candidates — and never run DTW during live ticks, only at set end (§5.1).

### Q6 — Live tick period and window?

**EVIDENCE.** `SignalModule` runs the live tick on a single-thread scheduled executor over a
`windowSec = 4.0` snapshot of the 1 200-sample (24 s at 50 Hz) ring buffer (`ImuPipeline.CAPACITY`).
The PRD's budget assumes 2 Hz ticks over the 4 s window; the constant is package territory (§8).

### Q7 — What survives an engine or extractor change?

**EVIDENCE.** Design D7 stores both the feature vector **and** the resampled raw window per
template (`templates.imu_series_resampled`, `store/templateStore.ts`). So a new `extractor_version`
re-derives features from raw windows in a background migration instead of asking the user to
re-record. **Decision:** split "model package" (data, re-derivable) from "app release" (native
engine) exactly on that line (§8.1).

### Q8 — Where is the model package served from?

**ASSUMED.** From the existing FastAPI backend, fetched opportunistically and applied at next app
start, with the shipped package bundled in app assets as the fallback. This is not a build or run
dependency, so it is consistent with the device-first stance. *Against:* it is one more server touch;
acceptable because it only ever *improves* a working offline model and never gates it.

## Branch C — Real-time and honesty

### Q9 — Can the rep cue be "real time"?

**EVIDENCE** for the floor: `detectPeaks` confirms a peak only after `minSpacing` samples past it, and
any peak detector needs post-peak samples to know the signal turned. At 0.5–1.5 Hz cadence that is
150–400 ms; BLE adds ~17 ms (firmware README, 60 Hz, 0 gaps). **Decision:** state the chain (§6),
promise ≤ 150 ms after *detection* and ≤ 550 ms after the physical top, and label live recognition
"provisional" until set end.

### Q10 — Predictive cue (cue on the predicted next top)?

**ASSUMED.** A P2 experiment, off by default: it removes the latency floor but fires a false cue after
the last rep of a set. Kept as a setting once measured. *Against:* if users love it, the "honest"
delayed cue looks sluggish by comparison; the experiment decides.

## Branch D — Security, update, integration

### Q11 — Encryption at rest: which mechanism?

**EVIDENCE** for the posture: the manifest already sets `android:allowBackup="false"`, and D3 keeps
frames off the server. **ASSUMED** for the mechanism: an SQLCipher-compatible encrypted SQLite (the
design doc's own alternative `op-sqlite` ships an SQLCipher build) with the key wrapped by the
Android Keystore; `react-native-sqlite-storage`'s SQLCipher path is iOS-oriented and its Android
build lacks the `jcenter` fix already noted in `poc/README.md`, so the library changes. *Against:*
a library swap in P0 is scope; it is small because the store API (`store/db.ts`) is thin.

### Q12 — Autonomy bounds?

**EVIDENCE** for the decision ladder (fusion thresholds above, `fusion/fusion.ts`). **ASSUMED** for the
never-list (§9.2): no overwriting user values, no deletion beyond the pruning rule, no upload, no
upward level change without the bars, no mid-session package apply, no rep count on `hard`, no weight
without a source. *Against:* a stricter reading would forbid pruning too; pruning is kept because it
never removes a pinned set and never lowers integrity.

### Q13 — Explanation format?

**ASSUMED.** Structured JSON generated at decision time, wording rendered from package templates, the
same object feeding UI, audit and harness. *Against:* templates in a data package can drift from the
engine's semantics; the harness's explanation check (§17) catches missing evidence references.

### Q14 — Drift detectors and thresholds?

**EVIDENCE** for the rig-change signal (calibration rotation from the six static holds, transfer doc
§5; ≥ 10° adopted in the feature PRD Q14). **ASSUMED** for the rest: integrity −0.1 vs its 10-session
median, three sets outside the fitted band, 30-day absence, sibling-correction pattern. *Against:*
all untuned; they are package parameters so they can be tuned without a release.

### Q15 — Local integration surface?

**ASSUMED.** Health Connect write (opt-in, off by default), share-sheet exports, start/stop/open
intents, BLE headband; no reading of third-party data; Wear OS out of v1. *Against:* a wrist cue
channel would be a strong fit for the screen-free set; it is a feature decision for the game layer,
not the model.

### Q16 — Failure catalogue: is it grounded?

**EVIDENCE.** `BleLinkInfo` already exposes `seqGaps`, `saturated`, `mtu`, `lastDtUs`, `error`
(`src/types/domain.ts`); the sync plan mandates a free-space precheck and re-nod after gaps > 2 s;
`sync_imu_video.py` rejects correlation peaks < 0.2. The catalogue (§14) maps each to a recovery and a
message. **ASSUMED** for crash-mid-set recovery via WAL + per-tick persisted set state.

### Q17 — Verification harness: new or reused?

**EVIDENCE.** Reused: `scripts/kb/score_reps.py` and `score_weights.py` (four-state, confident-wrong
fails the build), the TS mirror `src/signal/dsp.ts` with `__tests__/dsp.test.ts`, session replay via
`imu.jsonl` + `sync_imu_video.py`. New: golden stores, on-device benchmarks, chaos injection (§17).

---

## Assumptions most worth a human veto (riskiest first)

1. **Q2 — the fitted-parameter set.** If squat-family separation needs learned features, no amount
   of closed-form fitting reaches the integrity bars; Tier B's gate is the safety valve, but it is
   late.
2. **Q11 — swapping the SQLite library in P0** for encryption. Small in code, but it touches the
   store every other phase depends on.
3. **Q9/Q10 — the stated latency floor.** Honest, and possibly disappointing; the predictive-cue
   experiment is the only lever.
4. **Q8 — a server-served model package.** Convenient for tuning; the one recurring server touch in
   an otherwise device-first model.
