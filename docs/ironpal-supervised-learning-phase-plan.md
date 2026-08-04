# IronPal — Supervised Learning Phase Plan (Real-Gym Data Collection & Training)

**Status:** Draft v1 · 2026-08-02
**Prerequisites met:** ELP 4K fisheye camera validated for exercise recognition, rep counting, and
weight identification (cases 001–007, `docs/video-analysis-kb/`); IMU external unit selected
(Arduino Nano 33 BLE Rev2, see `docs/ironpal-imu-poc-integration-plan.md`).

---

## 0. Executive summary

Move from single-clip home validation to a **systematically labeled dataset** covering the curated
exercise catalogue, captured **solo at one Gym80-equipped gym over 8–12 sessions**, and use it two
ways:

- **Track A (immediate):** Claude as the recognition engine — labeled clips grow the
  few-shot knowledge base (exercise signatures, plate calibrations, per-rig settings) that the
  three analysis skills already consume. "Training" here = KB growth + measured accuracy on a
  held-out set, exactly the loop the case ledger and `score_weights.py` harness already run.
- **Track B (last, and cuttable):** distill the labeled dataset into a small **on-device model**
  for real-time recognition on the phone — scoped to the 13 Tier-1 exercises where the head IMU
  actually carries the rep. Claude is the *teacher/labeler*, not the runtime.

**One gym is sufficient for both, and cross-gym data is for *measuring* generalisation rather than
achieving it** (§1.2b): IMU signatures barely notice the equipment manufacturer, and visual
generalisation is Claude's job. **Generated/synthetic clips are explicitly rejected as training
data** — they carry no IMU, no valid physics for plate OCR, and self-fulfilling labels.

The 700 MB/clip problem is handled by **IMU-gated segmentation + H.265 on ingest**, taking a 1-hour
session from ~28 GB raw to **~1–2 GB of relevant, per-set footage**. Note this happens at *ingest*,
not at capture: the third-party ShenYao camera app cannot be started/stopped programmatically, so
the phone still writes the full session (≥64 GB card needed). Capture-time gating returns with our
own camera app — see `docs/ironpal-imu-camera-sync-plan.md`.

### An important correction to the premise

Claude models (Opus 4.8, Fable 5, Opus 5) **cannot be fine-tuned or gradient-trained on our
video data** — they are API models. "Supervised learning with Claude" therefore concretely means:

1. **Claude as pre-labeler** — batch-annotate clips (exercise, rep boundaries, weight) that a
   human then confirms/corrects in the labeling tool (the 1-tap confirm loop from case 007,
   industrialized).
2. **Claude as recognizer with a learned context** — labeled exemplars become per-exercise
   signature documents retrieved into the prompt (the existing `exercises/*.md` pattern, scaled
   to the full catalogue). Accuracy improves because the *context* improves, not the weights.
3. **A separately trained small model** (Track B) is the only component that undergoes literal
   supervised training — and it's the one that can run on-device in real time for the MVP.

---

## Challenge 1 — Data collection, labeling & training

### 1.1 Exercise ontology (what we label against)

**Built and committed:** `docs/video-analysis-kb/ontology.json` — 738 entries (37 Tier 1, 701
Tier 2). Rebuild with `python3 scripts/kb/build_ontology.py --fetch`.

> **Corrected 2026-08-02.** An earlier draft of this section said to derive the catalogue from
> **Fitbod's exercise list**. That instruction was wrong and has been removed. Fitbod is a named
> competitor; bulk-extracting their curated catalogue — via their API on a logged-in account or by
> decompiling the APK — implicates their terms of service, **EU database rights**
> (Directive 96/9/EC, in force in Slovakia, which protect the *compilation* even where the
> individual facts are free), and, in the EU, the narrow interoperability-only limits on lawful
> decompilation. Exercise names are facts and nobody owns them; a competitor's curated database is
> a different thing. Do not reinstate this.

**Sources actually used:**

| Source | License | Role |
|---|---|---|
| [free-exercise-db](https://github.com/yuhonas/free-exercise-db) | Unlicense (public domain) | Exercise names + muscle/mechanic/force metadata — **the only source copied** |
| [wger](https://wger.de/api/v2/) | CC-BY-SA 4.0 | **Coverage cross-check only, nothing copied** — its copyleft would otherwise force share-alike obligations onto our ontology |
| IronPal | proprietary | `head_motion_class`, `egocentric_visibility`, `rep_signal`, synonyms, tier |

Per-entry fields: canonical name, synonyms, equipment class (barbell / dumbbell / cable / machine /
kettlebell / bodyweight / band), `weight_read_strategy` (maps 1:1 onto the procedures in
`weight-reading.md`), motion plane, and the three IronPal-specific fields below.

**The fields that matter most exist in no public dataset**, because nobody else is doing egocentric
recognition:

- `head_motion_class` — moving vs still. Decides whether the headband IMU can see the rep at all.
- `egocentric_visibility` — visible / partial / occluded / floor_reference. A back squat's bar is
  behind the neck and never enters frame; a dumbbell curl looms large in it.
- `rep_signal` — **which sensor can actually certify a rep**: `imu` (212 entries), `vision` (522),
  `fusion` (2), or `hard` (2 — neither works alone; case 003's cable pushdown counted 0 of 5 real
  reps from video). This is the single most decision-relevant column in the file.

These are hand-authored for all 37 Tier-1 entries, grounded in the case ledger. Tier 2 is
heuristically inferred and every entry carries `needs_review: true` — **confirm before training on
an inferred field**; a wrong label is worse than a gap.

- Every label in the system must resolve to one ontology entry — this is what makes labels
  consistent across sessions and labelers.
- Priority tiers: **Tier 1** covers the common gym movements *and* every exercise named in POC v1
  and the task log (Bulgarian split squat, triceps cable pushdown, hack squat, machine calf raise,
  dumbbell fly/pullover); **Tier 2** is the long tail. Collection targets are per-tier, not global.
- 137 stretching/cardio records were excluded as out of scope: they are not resistance sets with
  countable reps and a readable load.

### 1.2 Capture protocol (real gym)

> **Revised 2026-08-04 for the actual constraint: one solo founder, one gym.** The previous version
> assumed a research team across ≥3 gyms with 3–5 volunteers. That was never the reality. The good
> news is that the multi-gym requirement was mostly *wrong*, not just unaffordable — see
> §1.2b for why one Gym80 gym gets you most of the way.

- **Rig:** ELP 4K fisheye on headband + Nano 33 BLE Rev2 IMU module streaming to the phone
  (per `docs/ironpal-imu-poc-integration-plan.md`). Record the **rig calibration** with every
  session: the ELP rig is **180° rotated** (case 007) — this must be a per-session metadata
  field, never an assumption baked into tooling.
- **Calibration ritual (~60 s, every session, non-negotiable):** ArUco/checkerboard target at a
  marked distance → camera intrinsics/FOV/distortion; a known plate at a marked distance → weight-OCR
  legibility benchmark; six static orientation holds → IMU bias, scale and axis-to-head rotation;
  three sharp head nods → video↔IMU sync anchor. This makes every session **self-document its rig**,
  so a hardware change is detectable from the data instead of from memory — the POC camera, app and
  IMU are all throwaway, and this is what stops that invalidating the dataset. Full rationale:
  `docs/ironpal-poc-to-production-transfer.md`.
- **Session script:** for each exercise: (1) a deliberate ~1 s face-on *staging glance* at the
  weight before pickup (the single highest-value habit for weight OCR — cases 001/007), (2) the
  working set, (3) set-down glance. Spoken or app-tapped ground truth immediately after each set
  (exercise + reps + weight) while memory is fresh — this *is* the label, captured at source.
- **Primary site:** one gym, **Gym80** equipment, founder as lifter. This is the training set.
- **Per-exercise target:** **5 clean sets per Tier-1 exercise** (not 20). At ~20 labeled sets per
  90-minute capture session, full Tier-1 coverage is **8–12 gym sessions** — three to four weeks of
  normal training, not a research programme. Tier 2 is opportunistic: capture it when you happen to
  do it, never make a special trip.
- **Diversity axes, ranked by value-per-euro** (track all in `meta.json`):
  1. **Rig fit** — deliberately vary headband tightness and tilt between sessions. Free, and it is
     the variance that actually breaks egocentric geometry in the field. Highest value on the list.
  2. **Tempo and fatigue** — capture sets at the start and end of a session. Late-set rep slowdown
     is signal, not noise (it is the form-analysis feature the product eventually sells).
  3. **Lifter body geometry** — 2–3 training partners at the *same* gym. Different height changes
     camera height and therefore the whole egocentric projection. Costs nothing but asking.
  4. **Lighting / time of day** — free.
  5. **Other manufacturers' equipment** — day passes at 2–3 other gyms, ~€10–15 each. **This is a
     validation set, not a training set** (§1.2b). Two sessions total, late in the programme.
- **Privacy & consent (blocking requirement):** gym management written permission + signage;
  other members in frame → footage restricted to internal training use, faces blurred before any
  clip leaves the encrypted store; training partners sign a release. Settle this before session 1.
  Off-peak capture massively reduces the bystander problem and is worth scheduling around.

### 1.2b One gym is enough — and why generated clips are not

The instinct is that a single-gym dataset cannot generalise, so the gap must be filled by
synthesising clips from other manufacturers' equipment and other gym environments. **The premise is
wrong and the proposed fix does not work.** Both halves matter, so both are recorded here.

**Why one gym gets you most of the way:**

- **IMU signatures are largely manufacturer-agnostic.** A Gym80 leg press and a Technogym leg press
  produce near-identical head-IMU traces, because the trace is a property of *the human movement*,
  not the paint on the machine. The equipment brand barely enters the signal. For the ~212 `imu`
  entries in `ontology.json`, cross-manufacturer data adds little.
- **Visual generalisation is Claude's job, not ours.** Track A recognises exercises from KB
  signatures and already generalises across gyms without gym-specific training data. The expensive
  thing synthesis would try to buy is the thing we are explicitly *not* training.
- **What genuinely varies by manufacturer is the weight-reading interface** — stack label layout,
  increment, plate shape. That is a `weight-reading.md` problem, and its solution is already
  manufacturer-independent: **count empty holes from the top**, never eyeball the knob (case 005).
  New manufacturers need a calibration note, not a thousand synthetic clips.

**Why generated video fails as training data — four independent reasons, any one fatal:**

1. **Generated clips have no IMU.** This is decisive on its own. Half the sensor design is a 100 Hz
   accelerometer/gyroscope stream time-synced to video; no generative model emits one. Synthetic
   clips could therefore only ever train the vision half — the half we are not training.
2. **The physics does not survive, and we have already paid to learn this.** The Kling logo test
   (2026-05-29) baked the IronPal icon into headband keyframes; in motion it floated off the band,
   because generative video has no notion of a texture locked to a moving surface. Now apply that to
   a plate stamped `2 KG / 4.4 LBS`. Weight reading is OCR of real embossing on a real face at a
   real angle; a generated plate carries hallucinated digits. We would be training a weight reader
   on invented numbers.
3. **Synthetic ground truth is a confident-wrong factory.** The labels would describe what was
   *requested*, not what was *produced* — ask for 10 reps at 20 kg and get 8 malformed reps with an
   illegible plate, and you have injected a confidently-wrong label, at scale, into the one metric
   (`score_weights.py`) whose entire purpose is holding confident-wrong at zero. The KB's rule is
   that a wrong label is worse than a gap; synthesis mass-produces wrong labels.
4. **Sourcing the environments is not clean.** Pulling gym footage from YouTube and equipment
   imagery from manufacturer sites means copyrighted audiovisual works and product photography used
   as generative input — YouTube's ToS prohibits the download outright, and it is the same category
   of problem as §1.1's competitor scrape. Not worth the exposure for data that would not work.

**What IS valid — augmentation on real captures.** Transforming a real capture preserves physical
validity and its label; generating a new one does not. All of this is standard practice:

- **IMU:** rotate the sensor frame (simulates headband fit), inject realistic sensor noise,
  time-warp for tempo. Physically principled and cheap — this is the real multiplier on a small set.
- **Video:** brightness/contrast/colour jitter, mild blur and compression, FOV crop, slight rotation
  about the optical axis. **Never horizontal flip** — egocentric handedness is signal.
- **Compositing, not generation**, is also fine for privacy: blurring or masking bystanders in real
  footage is a legitimate post-process on a real capture.

**Where generative AI still earns its place:** Kickstarter and marketing visuals, exactly as already
used. The distinction is that a marketing clip only has to *look* right to a human, while training
data has to *be* right to a metric.

### 1.3 Labeling pipeline

**Tool: Label Studio (self-hosted)** rather than a from-scratch internal tool — it natively
supports video timeline segmentation + time-series (IMU) alignment, per-frame classification,
and JSON export. Configure one template with exactly the four annotation types from the task:

| Annotation | Type | Notes |
|---|---|---|
| Exercise interval | timeline segment | start/end of each set within the session clip |
| Exercise label | choice (from ontology) | forced choice + "other/unknown" escape |
| Rep boundaries | timeline point events | one marker per rep top (or bottom — pick one convention and freeze it) |
| Weight | structured fields | total kg, per-implement decomposition (`plates + bar`), unit, readability flag |

**Claude pre-labeling (the force multiplier).** Before human labeling, run every clip through a
batch pipeline that emits *draft* annotations in Label Studio's pre-annotation format:

1. `scripts/kb/motion_profile.sh` segments the session into candidate set intervals (free, local).
2. Each candidate interval → frame extraction per question (the funnel from the three skills)
   → **Claude via the Message Batches API** (50% price, results within ~1 h — ideal since
   labeling is offline) with **structured outputs** (`output_config.format` with a JSON schema
   mirroring the annotation types) so drafts import without parsing failures.
3. The stable KB context (skills' heuristics + ontology + plate calibrations) goes in the system
   prompt with **prompt caching** (`cache_control`), so per-clip marginal cost is mostly frames.
4. Human = **verifier, not annotator**: confirm/correct drafts. Case-007 experience suggests
   exercise and reps drafts will be right most of the time; weight will abstain often (by
   design) and need the human's 1-tap confirm — which is exactly the product's UX, rehearsed.

**Label QA / consistency:**
- **Gold set:** 30 clips labeled by the founder with extreme care → every new labeler (and every
  prompt/KB revision) is scored against it first. This extends `ground_truth.json` +
  `score_weights.py` — add `score_exercises.py` and `score_reps.py` with the ledger's scoring
  rules (exercise: exact/synonym match; reps: exact ≤15, ±1 = near-miss; weight: within one
  plate increment, **confident-wrong must stay 0**).
- **Double-labeling:** 10% random sample labeled twice; disagreements adjudicated and turned
  into ontology clarifications (the KB's "lesson banking" applied to labels).
- **Abstention is a first-class label** ("unreadable", "unverified — needs confirmation") —
  never force a guess into the dataset; a wrong label poisons training worse than a gap.

### 1.4 Model choice & training approach

**Model facts (current, from the API reference):**

| Model | ID | Price in/out per MTok | Notes |
|---|---|---|---|
| Claude Opus 5 | `claude-opus-5` | $5 / $25 | Successor to Opus 4.8 **at the same price** — strictly better choice than 4.8 for new work |
| Claude Opus 4.8 | `claude-opus-4-8` | $5 / $25 | The model the task named; superseded by Opus 5 |
| Claude Fable 5 | `claude-fable-5` | $10 / $50 | Most capable; 2× Opus price; requires 30-day data retention |
| Claude Sonnet 5 | `claude-sonnet-5` | $3 / $15 (intro $2/$10) | Bulk pre-labeling candidate |

**Recommendation:** use **`claude-opus-5`** as the default annotator/recognizer — it is the
current Opus at the price the task budgeted for Opus 4.8, with high-resolution vision (2576 px
long edge — directly useful for embossed plate reads). Reserve **`claude-fable-5`** for the
hard 10%: adjudicating double-label disagreements, unreadable-weight escalations, and building
new exercise signature docs — where its extra capability justifies 2× cost. Trial
**`claude-sonnet-5`** on the easy bulk (exercise interval detection, clear-cut exercises) and
promote it if gold-set accuracy holds; that roughly halves pre-labeling spend.

**Track A — Claude-based recognition (no gradient training):**
- Labeled clips → per-exercise **signature documents** (`exercises/<name>.md`): expected
  egocentric trajectory, equipment cues, discriminators vs confusable neighbors, IMU signature
  sketch. This is the "model"; adding a labeled exercise = adding a signature.
- **Validation:** frozen held-out test set (≥5 clips/Tier-1 exercise, never used to write
  signatures), scored by the harness each KB revision. Report per-exercise accuracy, macro-F1
  across the catalogue, rep MAE and ±1-rate, weight within-increment accuracy, abstention rate,
  and **confident-wrong count (gate: 0)**. Regression = revert the KB change.
- Once trained/tuned on an exercise, generalization is tested explicitly: the held-out clips for
  that exercise must come from a *different gym or lifter* than the signature's source clips.

**Track B — distilled on-device model (scoped for solo capture):**
- **Do not attempt 37-class on-device recognition.** Scope v1 to the **13 Tier-1 exercises with
  `rep_signal: imu`** — back squat, front squat, deadlift, RDL, walking lunge, Bulgarian split
  squat, goblet squat, hack squat, standing calf raise, pull-up, chin-up, dip, push-up (query
  `ontology.json` for the authoritative list). These are precisely the ones where a head IMU works, and
  they are reachable from a single-gym dataset because the IMU barely notices the manufacturer.
  Everything else stays with Claude until the data justifies otherwise.
- **Data needed is smaller than it looks.** IMU classification is low-dimensional: 5 sets ×
  ~10 reps × 13 classes ≈ 650 labeled rep-windows, multiplied several-fold by the principled IMU
  augmentation in §1.2b. That is a viable first model — tight, but viable, and it is why the
  per-exercise target dropped from 20 sets to 5.
- **Architecture:** IMU-only temporal conv/GRU classifier (tiny, μW-class) plus rep detection as
  peak regression on the IMU. Vision (MobileNetV3/MoViNet-stream + temporal head) and late fusion
  per `sensor-fusion.md` are **phase 2**, once the IMU baseline is measured — building fusion first
  hides which channel is actually carrying the result.
- Standard supervised recipes on a workstation/Colab; no cloud training infra at this scale.
  Export TFLite for the Android app.
- **Claude stays in the loop** as the long-tail fallback and the weight reader (plate OCR is not a
  small-model problem) — matching the POC's hybrid design.

**Estimated Claude labeling cost** (order of magnitude): ~40–60 K input tokens/clip
(exercise montages + rep strips + hi-res weight crops) at Opus 5 batch pricing ≈ **$0.10–0.20
per clip**, plus one-time cached KB context. 1,000 clips ≈ **$150–250** — negligible next to
the founder's time; do not over-optimize model choice for cost.

---

## Challenge 2 — Large-clip handling, capture reduction & storage

### 2.1 IMU-gated capture (record less, not compress more)

The Nano 33 BLE Rev2's IMU (BMI270 + BMM150) streams to the phone over BLE; the app applies a
simple, robust gate — no ML needed at first:

> **Scope correction 2026-08-04 — the gate segments, it does not yet gate.** Capture runs through
> the third-party **ShenYao** USB-camera app, which cannot be started or stopped programmatically.
> So for now: **record continuously and apply the gate at ingest.** You still get per-set clips and
> still discard rest footage; you just pay the full disk write during capture instead of avoiding
> it. Budget accordingly — ~28 GB for a 1-hour session before trimming, so a ≥64 GB card and a
> free-space check before each session. True capture-time gating returns with our own camera app.
> Full reasoning and the sync architecture: `docs/ironpal-imu-camera-sync-plan.md`.

- **Activity detector:** rolling accelerometer variance over a 3 s window. Below threshold for
  >30 s = REST; above threshold = ACTIVE. Add ±10 s pre/post roll buffers so staging glances
  (weight reads!) and set-downs are never clipped — the KB shows the *staging* moments are the most
  valuable frames in the clip, so the gate must be tuned **recall-first** (keep too much rather
  than too little).
- **Walking rejection (phase 2):** walking between stations is "active" to a variance gate; a
  step-frequency band-stop (1.5–2.5 Hz periodicity typical of gait) demotes it to REST. Accept
  false-ACTIVE at first — storage is cheaper than lost sets.
- **Expected reduction:** a 1 h session has typically 15–25 min of set+staging activity →
  **~60–75% of footage discarded**, and — critically — the clips arrive **segmented per set**,
  which is exactly the unit the labeling pipeline wants. The IMU gate does double duty: volume
  reduction *and* the LOAD/PERFORM/REST segmentation that `motion_profile.sh` currently
  reconstructs noisily from pixels. Note the reduction is now realised **at ingest** rather than at
  capture (see the scope correction above) — same training-data outcome, different storage profile.
- The IMU stream itself is recorded alongside (timestamped, ~100 Hz, a few MB/hour) — it is
  Track B training data and the rep-clock ground truth channel.

### 2.2 Segmentation & compression

- **Chunked recording:** the app writes 2-minute MP4 segments (or one file per ACTIVE bout).
  No single 700 MB+ file to move or seek through; a crash loses ≤2 min.
- **Re-encode on ingest (laptop):** the ELP writes H.264 @ ~62 Mbps. Batch-transcode to
  **H.265 CRF 26–28** → ~6–10× smaller with negligible impact on the analysis (the skills read
  at ≤3 fps and 4K stills; verify once against a gold clip that plate-embossing reads survive —
  if not, keep a **4K near-lossless cut of staging windows only** and compress the rest hard).
  Today's 790 MB clip → **~80–120 MB**; a full gym session → **~1–2 GB**.
- **Two-tier retention:** `raw/` (original H.264, cold storage, deletable after label lock) and
  `work/` (H.265 + extracted frames), so we can always re-derive if a compression choice proves
  wrong.

### 2.3 Storage & data management

```
data/
  sessions/<date>_<gym>_<lifter>_<session-id>/
    meta.json          # rig id + ROTATION + rig_spec_version + calibration results
    imu/imu.jsonl      # raw IMU stream, BOTH clocks (device_ts + host_rx)
    raw/seg_000.mp4 …  # original chunks (cold)
    work/seg_000.mkv … # H.265 working copies
    canonical/         # <-- TRAIN ON THIS: undistorted + canonical-FOV video,
                       #     IMU rotated to canonical head frame, fixed ODR, SI units
    labels/session.json# Label Studio export (confirmed labels)
```

The **`canonical/` tier is what makes the dataset outlive the POC hardware.** Raw is rig-specific
and expires when the ELP/Nano are replaced; canonical is rig-independent, so a future rig only needs
its own calibration into the same space. Train on `canonical/`, keep `raw/` for re-derivation.
See `docs/ironpal-poc-to-production-transfer.md` §4.

- **`meta.json` is mandatory** and includes the per-rig rotation (A52 = 90°, ELP = 180°) — the
  case-007 lesson institutionalized as data, not tribal knowledge.
- Primary store: 4 TB external SSD/NAS at home; nightly rsync to a second disk. Cloud object
  storage only for the labeled `work/` tier if/when collaboration requires it (privacy: blurred
  copies only). A 100-session collection ≈ 150–200 GB in `work/` — comfortably local.
- **Label/metadata index:** one SQLite db (or the existing JSON harness files, extended) mapping
  every labeled set → clip segment + frame ranges + labels + QA status. This is what training
  and evaluation scripts query — never the filesystem directly.

### 2.4 Preprocessing & augmentation (for Track B)

- Preprocessing = the skills' extraction funnel, made deterministic: un-rotate per `meta.json`,
  per-question frame rates (exercise 2 fps small, reps 3–6 fps, weight native stills),
  fisheye kept as-is (the model should learn the lens the product ships with).
- Augmentation for the small model: temporal jitter/crops of set windows, brightness/contrast
  and mild blur (gym lighting), IMU noise injection and axis-tilt perturbation (headband fit
  variance). **No horizontal flips** — egocentric handedness is signal, not noise.
- Class imbalance: weighted sampling by ontology class. The small model trains **only on the 13
  `rep_signal: imu` Tier-1 classes with ≥5 confirmed sets**; everything else — the whole long tail,
  and every `vision`/`hard` class — is served by Claude fallback. Restricting the class set is what
  makes a solo-captured dataset sufficient rather than merely thin.
- **Augmentation is the multiplier that replaces the volunteers we do not have.** The IMU
  transforms in particular (frame rotation, noise, time-warp) are physically principled and expand
  ~650 real rep-windows into a trainable set — see §1.2b for why this is legitimate where
  generating new clips is not.

---

## Milestones

Sized for one person training normally at one gym — roughly 3 sessions a week.

| # | Milestone | Exit criterion | Solo effort |
|---|---|---|---|
| M0 | Consent + gym permission, capture app with IMU gate + chunking | one full gym session captured, gated, ingested end-to-end | ~1 week |
| M1 | Label Studio up + Claude pre-label batch pipeline | 3 sessions labeled; gold set (30 clips) frozen; harness extended to exercise/reps | ~1 week |
| M2 | Tier-1 coverage at the Gym80 site | **5 confirmed sets × 37 exercises**; held-out accuracy report v1 | 8–12 gym sessions (3–4 weeks) |
| M3 | KB/signature build-out (Track A "training") | per-exercise signatures; macro-F1 ≥0.85 on Tier 1, confident-wrong = 0 | ~1 week, overlaps M2 |
| M4 | Cross-gym **validation** (not training) | 2 day-pass sessions elsewhere; generalisation gap measured and written down | ~1 week |
| M5 | Track B v1 — IMU-only, 13 `rep_signal: imu` classes | beats a majority-class baseline on held-out; TFLite running on device | ~2 weeks |
| M6 | **Bridge validation** — *only once production hardware exists* | ~20 sets captured on both rigs; per-task accuracy delta measured through the existing harness; go/no-go on dataset transfer recorded | 1 gym session + 1 day |

Total: roughly **8–10 weeks alongside normal training**, with no hired help and no second site
until M4. If that is still too much, cut M5 and ship Track A — Claude plus the KB is a working
product path on its own.

## Top risks

1. **Privacy/consent blocks gym capture** → off-peak hours at one friendly gym; the fallback is
   home + home equipment for the free-weight subset of Tier 1.
2. **Solo capture stalls** (illness, travel, gym closure) — the single largest schedule risk now
   that there is one capturer → keep M2 exercise-ordered rather than session-ordered, so a partial
   dataset is still a *usable* dataset covering whole exercises rather than a random fragment.
3. **Compression destroys weight-read frames** → gold-clip A/B before committing; staging-window
   4K carve-out is the designed escape hatch.
4. **Label drift across sessions** → gold set + ontology as single source of truth; every
   disagreement becomes a written rule. (Double-labeling is dropped: it needs a second labeler.
   Substitute is re-labeling the gold set yourself after a 2-week gap and diffing against the
   original — catches your own drift, which is the real risk when there is only one labeler.)
5. **IMU gate clips staging glances** → recall-first thresholds + pre/post roll; weekly audit of
   REST-classified windows on a sample.
6. **Over-investment in Track B too early** → M5 is last and cuttable; Track A (Claude + KB) is
   the product path until then and remains the long-tail path after.
7. **Temptation to fill gaps with generated clips** → §1.2b. The failure is silent: synthetic data
   produces a model that scores well on synthetic held-out and fails in the gym. If coverage is
   thin, ship fewer exercises rather than synthetic ones.
