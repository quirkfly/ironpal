# IronPal — Supervised Learning Phase Plan (Real-Gym Data Collection & Training)

**Status:** Draft v1 · 2026-08-02
**Prerequisites met:** ELP 4K fisheye camera validated for exercise recognition, rep counting, and
weight identification (cases 001–007, `docs/video-analysis-kb/`); IMU external unit selected
(Arduino Nano 33 BLE Rev2, see `docs/ironpal-imu-poc-integration-plan.md`).

---

## 0. Executive summary

Move from single-clip home validation to a **systematically labeled, gym-diverse dataset** that
covers the curated exercise catalogue, and use it two ways:

- **Track A (immediate):** Claude as the recognition engine — labeled clips grow the
  few-shot knowledge base (exercise signatures, plate calibrations, per-rig settings) that the
  three analysis skills already consume. "Training" here = KB growth + measured accuracy on a
  held-out set, exactly the loop the case ledger and `score_weights.py` harness already run.
- **Track B (deferred until ~500 labeled clips):** distill the labeled dataset into a small
  **on-device model** (IMU + vision) for real-time recognition on the phone — Claude is the
  *teacher/labeler*, not the runtime.

The 700 MB/clip problem is solved at the **source**, not in post: IMU-gated capture (record only
during activity bouts), chunked recording, and H.265 re-encode bring a 1-hour session from ~28 GB
raw to **~1–2 GB of relevant, pre-segmented footage**.

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

- Derive the catalogue from **Fitbod's exercise list** (https://fitbod.me/) — scrape/transcribe
  into `docs/video-analysis-kb/ontology.json`: canonical name, synonyms, equipment class
  (barbell / dumbbell / cable / machine / pin-stack / bodyweight / kettlebell), motion plane,
  head-motion class (head-moving vs head-still — decides whether IMU or vision carries reps).
- Every label in the system must resolve to one ontology entry — this is what makes labels
  consistent across sessions and labelers.
- Priority tiers: **Tier 1** = the ~30 most common gym exercises (squat, deadlift, bench,
  rows, presses, curls, pushdowns, lat pulldown, leg press…); **Tier 2** = the long tail.
  Collection targets are per-tier, not global.

### 1.2 Capture protocol (real gym)

- **Rig:** ELP 4K fisheye on headband + Nano 33 BLE Rev2 IMU module streaming to the phone
  (per `docs/ironpal-imu-poc-integration-plan.md`). Record the **rig calibration** with every
  session: the ELP rig is **180° rotated** (case 007) — this must be a per-session metadata
  field, never an assumption baked into tooling.
- **Session script:** for each exercise: (1) a deliberate ~1 s face-on *staging glance* at the
  weight before pickup (the single highest-value habit for weight OCR — cases 001/007), (2) the
  working set, (3) set-down glance. Spoken or app-tapped ground truth immediately after each set
  (exercise + reps + weight) while memory is fresh — this *is* the label, captured at source.
- **Diversity axes** (tracked in metadata, targeted in collection): gym environment (≥3 different
  gyms), equipment brand (plate markings vary wildly — the KB's DOMYOS calibrations prove
  per-brand work is needed), lighting, lifter (founder first; then 3–5 volunteers of varying
  height/handedness — camera height changes the egocentric geometry), tempo, and loading style
  (fixed dumbbells vs plate-loaded vs pin-stack).
- **Per-clip minimums:** Tier 1: ≥20 labeled sets per exercise across ≥2 gyms and ≥2 lifters
  before an exercise counts as "covered." Tier 2: ≥5 sets.
- **Privacy & consent (blocking requirement):** gym management written permission + signage;
  other members in frame → footage restricted to internal training use, faces blurred before any
  clip leaves the encrypted store; volunteers sign a release. This aligns with the existing
  privacy stance (hybrid, minimal cloud exposure) and must be settled before the first gym session.

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

**Track B — distilled on-device model (starts at ~500 labeled clips):**
- **Architecture candidates:** (1) IMU-only temporal conv/GRU classifier (tiny, μW-class,
  handles head-moving exercises + rep clock); (2) vision: MobileNetV3/MoViNet-stream frame
  embeddings + temporal head for head-still arm exercises; (3) late fusion per
  `sensor-fusion.md` (IMU routes/segments, vision arbitrates identity).
- Trained with standard supervised recipes (cross-entropy over ontology classes; rep detection
  as peak regression on IMU), on a workstation/Colab — no cloud training infra needed at this
  scale. Export TFLite for the Android app.
- **Claude stays in the loop** as the long-tail fallback and the weight reader (OCR of plates is
  not a small-model problem) — matching the POC's hybrid design.

**Estimated Claude labeling cost** (order of magnitude): ~40–60 K input tokens/clip
(exercise montages + rep strips + hi-res weight crops) at Opus 5 batch pricing ≈ **$0.10–0.20
per clip**, plus one-time cached KB context. 1,000 clips ≈ **$150–250** — negligible next to
the founder's time; do not over-optimize model choice for cost.

---

## Challenge 2 — Large-clip handling, capture reduction & storage

### 2.1 IMU-gated capture (record less, not compress more)

The Nano 33 BLE Rev2's IMU (BMI270 + BMM150) streams to the phone over BLE; the app applies a
simple, robust gate — no ML needed at first:

- **Activity detector:** rolling accelerometer variance over a 3 s window. Below threshold for
  >30 s = REST (stop/pause recording); above threshold = ACTIVE (record). Add ±10 s pre/post
  roll buffers so staging glances (weight reads!) and set-downs are never clipped — the KB shows
  the *staging* moments are the most valuable frames in the clip, so the gate must be tuned
  **recall-first** (record too much rather than too little).
- **Walking rejection (phase 2):** walking between stations is "active" to a variance gate; a
  step-frequency band-stop (1.5–2.5 Hz periodicity typical of gait) demotes it to REST. Accept
  false-ACTIVE at first — storage is cheaper than lost sets.
- **Expected reduction:** a 1 h session has typically 15–25 min of set+staging activity →
  **~60–75% raw footage eliminated at the source**, and — critically — the clips arrive
  **pre-segmented per set**, which is exactly the unit the labeling pipeline wants. The IMU gate
  is doing double duty: capture reduction *and* the LOAD/PERFORM/REST segmentation that
  `motion_profile.sh` currently reconstructs noisily from pixels.
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
    meta.json          # rig id + ROTATION, gym, lifter, consent ref, device serials
    imu/imu.jsonl      # timestamped IMU stream
    raw/seg_000.mp4 …  # original chunks (cold)
    work/seg_000.mkv … # H.265 working copies
    labels/session.json# Label Studio export (confirmed labels)
```

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
- Class imbalance: weighted sampling by ontology class; the long tail is served by Claude
  fallback until its data catches up, so the small model only trains on classes with ≥20 sets.

---

## Milestones

| # | Milestone | Exit criterion |
|---|---|---|
| M0 | Consent + gym permission, capture app with IMU gate + chunking | one full gym session captured, gated, ingested end-to-end |
| M1 | Ontology v1 + Label Studio up + Claude pre-label batch pipeline | 20 sessions labeled; gold set frozen; harness extended to exercise/reps |
| M2 | Tier-1 coverage | ≥20 confirmed sets × ~30 exercises; held-out accuracy report v1 |
| M3 | KB/signature build-out (Track A "training") | per-exercise signatures; macro-F1 target ≥0.85 on Tier 1, confident-wrong = 0 |
| M4 | Track B first distilled model | IMU+vision classifier beats IMU-only baseline on held-out; TFLite on device |

## Top risks

1. **Privacy/consent blocks gym capture** → start with off-peak hours + a single friendly gym;
   fallback: home + volunteers with home equipment for Tier-1 free-weight coverage.
2. **Compression destroys weight-read frames** → gold-clip A/B before committing; staging-window
   4K carve-out is the designed escape hatch.
3. **Label drift across sessions** → gold set + double-labeling + ontology as single source of
   truth; every disagreement becomes a written rule.
4. **IMU gate clips staging glances** → recall-first thresholds + pre/post roll; weekly audit of
   REST-classified windows on a sample.
5. **Over-investment in Track B too early** → hard gate at 500 labeled clips; Track A (Claude +
   KB) is the product path until then and remains the long-tail path after.
