# IronPal Neural Model v2 — Enrol once, recognise by embedding

**Status:** Draft v1.1 · 2026-09-22 — design review complete (auto mode) · **first slice implemented 2026-10-08** (per-set enrol + recognise; see `poc/README.md`, "Neural model v2")
**Owner:** founder (solo)
**Source of the brief:** [`movinet_knn_pipeline.txt`](movinet_knn_pipeline.txt) — the licence-vetted,
Apache-2.0-only stack (MoViNet · MediaPipe Pose · MobileNetV4 · PaddleOCR; **no YOLO**, which is
AGPL) plus a *local kNN classifier that is our own code*.
**Relationship to v1:** [`ironpal-neural-model-design.md`](ironpal-neural-model-design.md)
(IronPal-Net) is the roadmap for **when training data exists** — it fine-tunes encoders and adds
learned heads. **v2 is what ships first**: the same modalities, a much smaller model, and **no
training**. v1's data plan, KB integration and studio loop are inherited unchanged; its trained
heads are deferred until v2 has produced the data they need.

> **Decisions from the design review are in
> [`ironpal-neural-model-design-v2_grilled.md`](ironpal-neural-model-design-v2_grilled.md)
> (Q1–Q35) and are folded in below.** The review ran **without user interaction**: 18 decisions rest
> on evidence in the repo, the knowledge base or the vendor documentation, 16 are assumptions tagged
> for veto, 1 is open (on-device OCR replacing the cloud call — a cost and claims decision). The five
> assumptions most worth a veto are at the top of the ledger; the load-bearing one is that
> unsupervised whitening of the frozen video feature is enough (Q9).

---

## A. The embedding in plain language

> Written for the founder, who is new to neural-network design. It explains the one formula the rest
> of the document is built on, before any of the engineering around it. Every term introduced here
> in **bold** is used unchanged from §1 onward. §3 says the same things again, precisely, in tables.

The formula at the centre of this design is one recipe plus one ruler:

```
EMBED(window) = [ video: MoViNet-A0-Stream pooled feature → whiten → 128-d ]
              ⊕ [ pose:  MediaPipe Pose Lite → 8 geometric channels → stats → 48-d ]
              ⊕ [ IMU:   the engine's window → 9 features + 32-bin spectrum → 41-d ]
  each block L2-normalised; distance = Σ_m w_m · (1 − cos_m), w_m per candidate exercise
```

The **recipe** turns a few seconds of recorded set into a single fingerprint. The **ruler** says how
far that fingerprint sits from one the user already labelled. Recognition is nothing more than
running the recipe on live sensor data and asking the ruler which stored fingerprint is nearest.

### A.1 The recipe: three blocks over one window

`EMBED(window)` takes a **window**, roughly four seconds of synchronised video frames, pose landmarks
and IMU samples, and returns one vector of 217 numbers. It is built from three independent blocks.
The `⊕` is concatenation, so the blocks are stacked, never mixed.

**Video, 128 numbers.** MoViNet-A0-Stream is a small video network Google trained to name 600
everyday actions. We discard the final naming layer and keep the layer beneath it. That layer is a
numeric summary of what kind of motion just happened, and it is far more general than the 600 labels
it was trained to produce. **Pooled** means the network's grid of spatial responses is averaged down
to one vector for the whole frame.

**Whitening** is the step that makes that vector usable as a fingerprint, and it is worth
understanding because the whole no-training claim rests on it. A feature trained for classification
has a few directions that vary enormously across any footage, such as overall lighting and
background clutter. Cosine distance treats every direction as equally important, so those loud
directions would drown out the quiet ones that actually separate a curl from a raise. Whitening
rescales each direction by how much it varies, removes the correlation between directions, and keeps
the 128 most informative. It is fitted once from unlabelled footage, so it costs no training data.

**Pose, 48 numbers.** MediaPipe finds body joints in each frame. We do not feed raw joint
coordinates into anything. We compute eight human-meaningful measurements per frame, such as elbow
angle and wrist height relative to the nose, each divided by shoulder width so body size cancels.
Then each of those eight channels is summarised over the window by six statistics: mean, standard
deviation, minimum, maximum, range and dominant period. Eight channels times six statistics is 48.
Nothing here is learned. This block is the **discriminator**, because the video block knows "arm
moving rhythmically" while this block knows "elbow swept through 110 degrees with the upper arm
pinned".

**IMU, 41 numbers.** The nine orientation-invariant features the engine already computes, plus a
32-bin spectrum of the rep channel between 0.1 and 3 Hz. The spectrum is the cadence signature,
which separates a slow grind from a bounce.

### A.2 Why each block is normalised on its own

**L2-normalising** a vector means dividing it by its own length, so it lands on the unit sphere with
length 1. Done per block, it puts the three blocks on comparable footing even though they have
different dimensions and different natural scales. It also makes the cosine of two blocks a plain
dot product, which is cheap. The decisive reason is the next section: when a block is missing, the
other two keep their meaning unchanged, because nothing was ever normalised jointly.

### A.3 The ruler, and the part that matters most

`cos` is cosine similarity, which is 1 when two vectors point the same way and falls toward 0 as they
diverge. So `1 − cos` is a distance that starts at 0 for a perfect match. The sum runs over the three
modalities.

The subtle piece is `w_m(c)`. The weight depends on `c`, the **candidate exercise** being tested, not
only on the recorded window. The same window is scored against a barbell squat using mostly video and
pose, and against a kettlebell swing with the IMU counting fully. The weights come from the ontology,
which already records for each of the 37 Tier-1 exercises whether the head moves and how visible the
lift is from a headband camera.

| Modality | Condition on the candidate | Weight |
|---|---|---|
| IMU | head moving | 1.00 |
| IMU | head still | 0.15 |
| Pose | lift visible | 1.00 |
| Pose | partial | 0.60 |
| Pose | occluded | 0.30 |
| Video | always | 1.00 |

That table is the fix for what sank the earlier matcher. Twenty-two of the 37 exercises are
head-still, so for those the headband IMU carries almost no information, and any distance that
weighted it equally was voting on noise.

`a_m` is **availability**, either 1 or 0 for this particular window. An imported clip with no sensor
data sets the IMU term to zero. A phone left in a pocket sets video and pose to zero. The surviving
weights are renormalised to sum to 1, which keeps distances on the same scale no matter how many
modalities were present. That is what lets a single reject threshold work across all of them.

One consequence worth naming: because `w` depends on the candidate, this is a **scoring function per
candidate**, not a distance metric. Comparing two fingerprints without saying which exercise you are
asking about is not a defined operation here, and no part of the system does it.

---

## 0. The goal, verbatim, and what it forces

The end-user goal for the model, as stated:

1. **On the first visit** the user records and labels their exercises using both IMU and video.
2. **The model provides embeddings** for each labelled exercise; the (label, embedding) pairs are
   stored in the app database, later in the backend database.
3. **On subsequent visits** the model uses the stored embeddings to recognise exercises **in real
   time**, giving feedback and tracking progress, without the user re-labelling.

Two constraints on top: **compact and fast**, and **no extensive training data** — the small
MoViNet, not the full one.

Those five sentences settle the architecture more than any benchmark would:

| The brief says | So the design is |
|---|---|
| "provides embeddings" and "uses the stored embeddings to recognise" | an **embedding model + nearest-neighbour over the user's own enrolled sets**. Not a 37-way classifier: there is no training set for one, and the user does not need one — they need *their* ten exercises told apart |
| "not requiring extensive training data" | **frozen, pretrained encoders**. Nothing is fine-tuned to ship. The only fitted numbers are unsupervised (a whitening transform) or come from the user's own enrolment |
| "compact and fast … the small version" | **MoViNet-A0-Stream** (the smallest MoViNet), MediaPipe **Pose Lite**, and the IMU engine that already runs at 4.4 ms — a ~10 MB package |
| "in real time" | a **streaming** recogniser: the video backbone is causal with stream buffers, so it advances one frame at a time and never re-reads the clip |
| "first visit … subsequent visits" | the existing enrolment loop (ARM → set → Debrief → Studio) is the labelling step, and the level machine's counts decide when an exercise is "known" |

### 0.1 Why this is not the matcher that was rejected

The kNN that was thrown out compared **nine hand-picked numbers about head motion**. Twenty-two of
the 37 exercises do not move the head, so for them those numbers were noise, and the match was a
coin toss. Here the comparison happens over a **pretrained video representation plus explicit
pose geometry** — the pixel cues the knowledge base showed to be decisive (elbow flexion, hand
proximity, grip) — with the IMU as one modality among three, weighted by how much the ontology says
it can see. Same shape of question ("which of my sets is this most like?"), an incomparably better
space to ask it in, and the space is not something a human guessed.

And it is honest about what nearest-neighbour buys: **within one user's own exercise list**, at one
gym, on one rig, the problem is ten-way, not thirty-seven-way, and the exemplars are that user's
own body performing that exact movement at that exact station. That is the regime in which frozen
features and a good distance genuinely work.

---

## 1. One-page summary

```
                 ENROL (first visit)                          RECOGNISE (every later visit)
 ┌──────────────────────────────────────┐        ┌────────────────────────────────────────────┐
 │ record a set: clip + IMU             │        │ camera streams at 5 fps while the IMU gate │
 │ label it in the Debrief / Studio     │        │ says "in a set"                            │
 │ EMBED the set  ──► (label, e) stored │        │ every second: EMBED the last window        │
 │ 2 clean sets ⇒ the exercise is known │        │ cosine kNN vs the user's stored (label, e) │
 └──────────────────────────────────────┘        │ smooth over 3 s ⇒ label + confidence ⇒ HUD │
                                                 │ reps: IMU clock, or embedding-periodicity  │
                                                 │ set ends ⇒ logged; user confirms only if   │
                                                 │ confidence is low                           │
                                                 └────────────────────────────────────────────┘

 EMBED(window) = [ video: MoViNet-A0-Stream pooled feature → whiten → 128-d ]
               ⊕ [ pose:  MediaPipe Pose Lite → 8 geometric channels → stats → 48-d ]
               ⊕ [ IMU:   the engine's window → 9 features + 32-bin spectrum → 41-d ]
   each block L2-normalised; distance = Σ_m w_m · (1 − cos_m), w_m per candidate exercise
```

Everything the product already has — the gate, the streaming rep clock, the session recorder, the
clip pipeline, the store, levels, integrity, the Debrief, the Studio, the signed package — is kept.
The one thing that changes is **what a stored example is** (an embedding, not an IMU window) and
**what "compare" means** (a weighted cosine over three learned-or-geometric blocks).

---

## 2. Why it can work with no training — and where that stops

**The regime.** A committed lifter at a home gym runs a programme of roughly 8–15 exercises. The
recogniser never has to answer "which of 37" for a stranger; it answers "which of *these* 12, for
*this* person, at *these* stations, from *this* headband". Three facts make frozen features
sufficient in that regime:

1. **Pretrained video features already separate gross motion classes.** A Kinetics-600 backbone
   distinguishes "lifting overhead" from "hinging at the hip" from "curling" without any exercise
   data — those are the kinds of motion it was trained on 600 ways of. What it *cannot* do reliably
   is fine distinctions (front raise vs lateral raise) from video alone.
2. **The pose-geometry block does the fine distinctions, and needs no training at all.** Elbow angle,
   hand-to-torso distance and hand height against the nose are computed, not learned. The knowledge
   base established on real footage that these are exactly the curl-vs-raise deciders. They are
   discriminative by construction.
3. **The exemplars are the user's own.** A prototype built from this user's goblet squats at this
   rack is a far tighter target than any population model. Intra-user variance is small; that is
   what makes one-shot-per-exercise plausible and five-shot solid.

**Where it stops, stated up front:**

- **No cross-user recognition.** A new user starts from zero and enrols. The gym pack (PRD §6.5)
  can seed *stations and weights*, not this user's movement embeddings — the same body/equipment
  split the PRD already draws.
- **Two exercises that differ only in what the camera cannot see** (a neutral-grip vs supinated
  curl with the hand out of frame) will collide. The reject rule (§5.3) makes that an honest
  "not sure" rather than a wrong answer, and the Studio is one tap away.
- **Rep certification stays a per-class right**, exactly as the ontology's `rep_signal` says: the
  IMU clock certifies `imu`/`fusion` classes; the embedding-periodicity counter (§5.4) *proposes*
  for `vision` classes and the user confirms; `hard` classes get exercise and weight only.
- **When accuracy plateaus** — when a user's own prototypes stop separating two exercises they care
  about — that is the signal to move to v1's learned projection, trained on the embeddings and
  labels v2 will by then have collected. v2 is the data-collection instrument for v1.

---

## 3. Model anatomy

> [§A](#a-the-embedding-in-plain-language) explains these three blocks and the distance in
> plain language. This section is the precise version: the same decisions, with the numbers,
> the vendor constraints and the reason each choice was made.

### 3.1 Video block — MoViNet-A0-Stream, frozen

| Choice | Value | Why |
|---|---|---|
| Backbone | **MoViNet-A0-Stream**, Kinetics-600 checkpoint, **Apache 2.0** (`tensorflow/models`) | the smallest MoViNet: ~2.7 GFLOPs per 50-frame clip ⇒ **~55 MFLOPs per frame**; 72 % Kinetics-600 top-1 at MobileNetV3-Large latency; *causal* with stream buffers, so it runs on a live feed |
| Precision / runtime | **float16 on the LiteRT GPU delegate**; INT8 as fallback | the published INT8 build drops squeeze-and-excitation and forces relu6, and loses accuracy; fp16 does not. GPU delegate needs OpenGL ES 3.1+, which the A52 has |
| Input | 172×172, **5 fps** | reps run at 0.2–1.5 Hz; 5 fps is ≥ 3× the fastest rep and a sixth of 30 fps decode. The KB found 2 fps aliases turnarounds; 3+ is the floor |
| What is taken | the **pooled penultimate feature** (the 600-way head is discarded) | the head knows Kinetics classes; the feature under it knows motion |
| Projection | **PCA-whitening to 128-d**, fitted unsupervised on ~1 000 windows from the KB clips + any public fitness footage | no labels needed; whitening is what makes cosine distance meaningful on a feature that was never trained for retrieval. Refit only with a model version bump |
| Stream state | reset at gate open; advanced one frame at a time | so a 40 s set costs 200 frame-steps, never a re-read; between sets the state idles |

The feature is emitted **once per second** (every 5 frames) from the stream — each emission
summarises everything since the gate opened, because that is what a causal stream buffer holds.

### 3.2 Pose-geometry block — the discriminator, computed not learned

MediaPipe **Pose Landmarker Lite** (Apache 2.0) on the same 5 fps frames. Lite runs at ~20–40 ms
per frame on a mobile CPU and 2–5× faster on GPU; its ~5–10 % accuracy loss against the full model
is irrelevant for joint *angles* at this scale.

From the upper-body landmarks and their visibilities, eight channels per frame, each normalised by
shoulder width so a tall and a short user look alike:

| Channel | The KB cue it encodes |
|---|---|
| elbow angle, left and right | "elbow flexes, upper arm pinned" (curl) vs "arm straight" (raise) |
| wrist-to-shoulder-midpoint distance | "dumbbell close to the torso" vs "out at arm's length" |
| wrist height minus nose height | "tops near the face, not over" (curl vs press) |
| shoulder abduction | lateral vs front raise |
| left/right wrist asymmetry | alternating vs simultaneous — the 2×/÷2 rep confound of case 001 |
| fraction of frames with the wrist below the frame edge | "bottom of rep out of frame toward the hip" |
| mean wrist visibility | how much the camera saw at all — feeds the reliability weight |

Over the window: mean, standard deviation, min, max, range and the dominant period of each channel
→ **48-d**, z-scored with statistics fitted on the same unsupervised set as the whitening.

Hands landmarks (for pronation) are **v2.1**: they double the pose cost and the visibility from a
headband is poor; the elbow/distance channels carry the curl-vs-raise decision without them.

### 3.3 IMU block — the engine's descriptor, weighted by what it can see

The existing engine already produces, per set, the nine orientation-invariant features and the
band-passed rep channel. v2 takes those nine plus a **32-bin log-magnitude spectrum** of the rep
channel (0.1–3 Hz) → **41-d**, z-scored.

This block is *not* the model. It is one of three blocks, and its weight in the distance is set
**per candidate exercise from the ontology**: for a `head_motion_class: still` candidate the IMU
block is nearly ignored; for a `moving` one it dominates. The ontology tells the distance which
sensor to trust for which answer — no learning required, and it encodes exactly the fact that sank
the old matcher.

### 3.4 The set embedding and its distance

```
e = [ v ∈ ℝ¹²⁸ , p ∈ ℝ⁴⁸ , i ∈ ℝ⁴¹ ]           each block L2-normalised separately

d(e, x | c) = Σ_m  w_m(c) · a_m · (1 − cos(e_m, x_m))       m ∈ {video, pose, imu}

  w_m(c)  reliability of modality m for candidate exercise c, from the ontology:
          imu:  moving → 1.0 · still → 0.15 ;  pose: visible → 1.0 · partial → 0.6 · occluded → 0.3
          video: 1.0 always
  a_m     availability of modality m in THIS window (0 when absent), weights renormalised to sum 1
```

Missing modalities are therefore handled by arithmetic, not by special cases: an imported clip with
no IMU sets `a_imu = 0`; a phone in a pocket sets `a_video = a_pose = 0`. The three cases of the old
design's §18.5 fall out of one formula.

An optional **learned 64-d projection** trained with a supervised-contrastive loss on the KB clips
plus the user's own enrolments is **v2.1**, switched on per user only when their prototypes stop
separating — it is the bridge to v1, not part of the ship-first model.

---

## 4. The embedding store

### 4.1 Schema (app database, `schema.ts` v3)

```sql
CREATE TABLE embeddings (
  id TEXT PRIMARY KEY,
  exercise_id TEXT NOT NULL,                 -- ontology id; 'unknown' for rest/walk negatives
  labeled_set_id TEXT, session_id TEXT NOT NULL, gym_id TEXT, station_id TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('set','negative','prior')),
  source TEXT NOT NULL CHECK (source IN ('own','gym_pack')),
  video_f16 BLOB, pose_f16 BLOB, imu_f16 BLOB,   -- 128 / 48 / 41 halves; NULL = modality absent
  quality_json TEXT NOT NULL,                -- {poseVisibility, gateCycles, clipPresent, syncClass}
  model_version TEXT NOT NULL,               -- whitening + backbone version; mismatched rows are re-embedded or dropped
  weight_declared REAL, created_at INTEGER NOT NULL, revision INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX embeddings_ex ON embeddings(exercise_id, kind, source);
```

One row is ~450 bytes. A fully enrolled exercise (20 sets) is under 10 kB; the old store held
~65 kB *per set*. Raw IMU windows and clips stay where they are for the Studio and for v1's future
training — the embedding is an *additional* artefact, not a replacement for the evidence.

### 4.2 Prototypes and negatives

- **Prototype** per (exercise, user): the per-block mean of that exercise's own `set` rows,
  re-normalised. Recomputed on load and on every commit; cached in memory.
- **Exemplars kept too**: kNN with k = 3 over individual rows, blended with the prototype distance.
  Prototypes are robust to a bad set; exemplars catch a user who does two distinct variants.
- **Negatives**: the rest/walk windows the engine already harvests are embedded as `unknown` and
  compete in the search — the reject class survives from the old design and costs nothing.

### 4.3 Sync to the backend (later)

Mirror the existing `/templates/sync`: `POST /embeddings` per row, `GET /embeddings/sync?since=`
version-gated, cached locally and loaded on launch. Rows carry only vectors, ids and quality flags;
never clips, never windows, never frames. Precedence on the phone stays **own → gym pack**. The gym
pack contributes `prior` rows *for stations and weights only*; it never contributes another user's
movement embeddings as truth (PRD §1.4).

---

## 5. Recognition — real time, on later visits

### 5.1 The loop

```
while session open:
  IMU tick every 400 ms (existing) ──► gate state, rep clock, link health
  if gate ARMING/ACTIVE:
     camera at 5 fps ──► per frame: MoViNet stream step (GPU) · Pose Lite (CPU) · geometry channels
     every 1 s:        pooled video feature → whiten → v ; pose stats → p ; IMU descriptor → i
                       d(e, ·) against prototypes + k=3 exemplars + negatives
                       posterior over the user's exercises  ──► temporal smoothing (§5.2)
                       ──► HUD label + confidence; audio cue on a label change
  if gate CLOSED:      finalise: majority label over the set, reps (§5.4), weight (§5.5)
                       ──► auto-log if confidence ≥ T_auto and level ≥ Certified, else Debrief
  between sets:        camera idles at 1 fps (scene/station recognition only) or off (§5.6)
```

### 5.2 Temporal smoothing

Per-second posteriors are combined with an exponential moving average over 3 s and a hysteresis
of two consecutive agreeing seconds before the HUD label changes. A set of 20 s therefore yields
~17 votes; the finalised label is the plurality with its mean confidence. This is what turns a
per-second recogniser into something that does not flicker.

### 5.3 Confidence and the reject rule

```
conf = 1 / (1 + d_best)                          the existing convention, so thresholds carry over
label = unknown  if  conf < T_reject (0.45, fitted per user as today)
                 or  d_second − d_best < margin (0.08)            two of the user's exercises tie
                 or  the nearest row is a negative
                 or  a_pose·w_pose + a_video < 0.5 for a `still` candidate   the sensors that could see it did not
```

Every one of those routes to the Debrief instead of the log. **Confident-wrong remains the failure
the CI harness fails on**, via the same four-state scorers.

### 5.4 Reps

| Class | Counter | Certifies? |
|---|---|---|
| `imu`, `fusion` | the existing streaming `RepClock` | yes, as today |
| `vision` | **embedding periodicity**: the per-second video features form a sequence; its temporal self-similarity matrix has a period; count = window ÷ period, refined by peak-picking on the pose channels (elbow angle for curls, wrist height for raises) | proposes; user confirms |
| `hard` | none | no — exercise and weight only, honestly |

The periodicity counter needs no training: it is the RepNet *idea* (repetition shows as stripes in
self-similarity) applied to features that already exist, without RepNet's learned head. It is class-
agnostic and it works precisely where the head IMU is silent.

### 5.5 Weight

Unchanged: the staging-glance still → OCR. The pose block adds one thing for free — the glance frame
is chosen where wrist visibility is high *and* motion is low, which is a better legibility proxy
than sharpness alone. Replacing the cloud gpt-5-nano call with **on-device PaddleOCR** (Apache 2.0)
is the one **OPEN** item of the review: it would let the product say *nothing* leaves the phone, but
it is a cost, accuracy and marketing-claim decision, not an engineering one.

### 5.6 Camera duty cycle and battery

Continuous 5 fps decode + GPU inference for an hour is the design's real battery risk. The rule:
the video and pose blocks run **only while the IMU gate is ARMING or ACTIVE** (the user armed a set
or is visibly moving rhythmically), and idle otherwise. A 60-minute session with 12 sets of 40 s
runs video for ~8 minutes. The PRD's ≤ 25 % per hour budget is measured in V0 with this duty cycle.

### 5.7 Budget — estimates to be measured in V0, not results

| Stage | Per sampled frame (A52, Snapdragon 720G / Adreno 618) | Per second at 5 fps |
|---|---|---|
| decode + resize 172² | ~4 ms | 20 ms |
| MoViNet-A0-Stream fp16 step, GPU | **~10 ms** (A0 is ~55 MFLOPs/frame) | 50 ms |
| Pose Lite, CPU | ~25 ms (2–5× less on GPU if the delegate takes the graph whole) | 125 ms |
| geometry + IMU descriptor + kNN + smoothing | < 1 ms | ~5 ms |
| **Total** | | **≈ 200 ms of compute per second of video** ⇒ ~20 % of one core while a set is live; ~0 between sets |

| Artefact | Size |
|---|---|
| MoViNet-A0-Stream fp16 | ~6 MB |
| Pose Landmarker Lite | ~3 MB |
| whitening + stats | < 0.1 MB |
| **Package delta** | **~9–10 MB**, inside the existing signed package |

---

## 6. Enrolment — the first visit

Nothing new is asked of the user. The existing loop *is* enrolment; v2 adds one step to its commit.

| Step | Existing | Added |
|---|---|---|
| ARM → set → gate close | as today | the video/pose blocks run during the set, so the embedding is ready at gate close |
| Debrief (≤ 20 s) | four proposals — but on a first visit **the exercise proposal is the user's choice**, not a guess, because there are no exemplars yet; the picker is the whole card | — |
| Studio, if needed | marks, bounds, relabel, pins | — |
| `learner.commit` | templates, fits, integrity, levels | **embed the set → one `embeddings` row**; recompute the prototype |

**Enrolment quality gates** (a set that fails them is kept but does not become an exemplar):
pose visibility ≥ 50 % of frames for `still` classes, IMU gate open ≥ 3 cycles, a clip present
with sync class better than `reject`. The reasons are shown, as every failed gate is today.

**When is an exercise "known"?** The level machine's own counts: 1 clean set → Recon (recognition
*proposes*), 3 → Provisional (recognised live, always asks), 5 at two weights + integrity ≥ 0.9 →
Certified (auto-logged). Integrity is now leave-one-out over embeddings — same meaning, microseconds.

**Re-enrolment** is prompted, never demanded: when a certified exercise's live embeddings drift from
its prototype (median distance over the last 3 sets above the prototype's own spread ×2), the
Debrief says "this looked different from your usual goblet squat — confirm to update", and a
confirmation refreshes the prototype. New rack, new headband fit, new form: all handled by one
tap.

---

## 7. Integration with the app

### 7.1 Component map

```
poc/mobile/
├── android/.../EmbedModule.kt        (new)  LiteRT interpreter for MoViNet-A0-Stream (GPU delegate,
│                                            stream state), MediaPipe PoseLandmarker, geometry channels,
│                                            whitening; emits EmbeddingEvent once per second
├── android/.../SignalModule.kt       (kept) gate, rep clock, recorder, range analysis; now also
│                                            exposes the 41-d IMU descriptor per window
└── src/
    ├── model/embed.ts                (new)  block assembly, normalisation, model_version guard
    ├── model/recognizer.ts           (new)  prototypes, exemplars, negatives, weighted cosine,
    │                                        smoothing, reject rule, per-set finalisation
    ├── model/repPeriodicity.ts       (new)  self-similarity period counter over feature sequences
    ├── model/learner.ts              (ext.) commit/relabel also write/update the embeddings row
    ├── model/store.ts                (ext.) embeddings table, prototype cache
    ├── controller/useSet.ts          (ext.) starts/stops the embed stream with the gate
    ├── controller/useLiveSet.ts      (rewired) consumes RecognizerEvent instead of MatchEvent
    └── screens/LiveHudScreen.tsx     (ext.)  label + confidence + "confirm?" affordance
```

`EmbedModule` is the only new native surface. It owns three things that must never cross the
bridge as data: frames, landmarks, and the MoViNet stream state. What crosses is one 217-float
vector per second.

### 7.2 Where each existing piece plugs in

| Piece | Role in v2 |
|---|---|
| `GateMachine` / `RepClock` | unchanged; the gate *drives* the camera duty cycle |
| `SessionRecorder`, `analyzeRange`, `explainRange`, `scanRegions`, `peakNear` | unchanged — the Studio depends on them |
| `CameraModule.startClip` / `ClipModule.ingest` | unchanged; the same 5 fps frames feed both the clip recorder and the embedder |
| `learner.commit` / `relabel` | +1 write each: the embeddings row (relabel moves it) |
| `integrity`, `levels`, `drift` | same contracts; integrity now over embeddings |
| `decide.ts` | the exercise explanation gains "closest to your set from 12 May (video 0.91 · pose 0.88 · IMU 0.40)" — per-block similarities are the explanation |
| Debrief | proposals come from the recogniser's finalised set; on a first visit, from nothing — the picker |
| **Studio** | **no change** — labels, marks, bounds and pins are what enrolment consumes; the Compare view already shows nearest-own-set |
| `packageManager` | the package gains the two model binaries, the whitening matrix and `model_version`; signing, rollback and smoke tests unchanged. The ontology-hash check from v1 §7.7 applies |
| `templateSync` → `embeddingSync` | same shape, new table, new routes |

### 7.3 The Studio is the enrolment tool, and stays exactly as built

The user's label, the trimmed bounds and the confirmed rep marks are what turn a recorded set into
an exemplar. The Studio already produces them at frame accuracy, with the model's evidence beside
the choice. When recognition is wrong on a later visit, "Open in After Action" from the Debrief is
the correction path, and a relabel there moves the embedding row and rebuilds the prototype. The
loop that v1 called "the Studio closes the loop" is unchanged in shape; only the artefact it writes
is smaller.

---

## 8. Progress tracking — what "tracking progress" means here

Recognition without re-labelling is only useful if it lands in a log the user can read. Per set:
exercise, reps, weight, `label_source` (auto / confirmed / corrected), and confidence, into the
existing `labeled_sets`; per exercise: `level_progress` and its integrity; per session: sets,
volume (reps × weight), the automation rate (sets auto-logged ÷ sets performed). The last number
is the one to watch: it is the product's promise, measured. The PRD's economy rules — XP only
through gates, no penalties, no streak loss — apply unchanged.

---

## 9. Licensing — the constraint the brief came with

| Component | Licence | Use |
|---|---|---|
| MoViNet-A0-Stream (`tensorflow/models`) | Apache 2.0 | video block; attribution kept in the app's notices |
| MediaPipe Pose Landmarker | Apache 2.0 | pose block |
| MobileNetV4 via `timm` | Apache 2.0 | **not used in v2**; reserved for a future plate/implement detector |
| PaddleOCR | Apache 2.0 | the OPEN on-device OCR option (§5.5) |
| YOLOv8 / v11 (Ultralytics) | **AGPL-3.0** | **never** — it would oblige releasing the app's source. Permissive YOLO forks (YOLOX, YOLO-NAS) exist if a detector is ever needed |
| the kNN / recogniser | our code | — |

`docs/ASSET_LICENCES.md`-style record to be added under `poc/`, mirroring the game-asset licence
log, before the first package ships a model binary.

---

## 10. Build plan

| Phase | Deliverable | Exit | Est. |
|---|---|---|---|
| **V0 — measure** | `EmbedModule` running MoViNet-A0-Stream fp16 + Pose Lite on the A52 over the e2e fixture clip; the §5.7 table replaced by measurements; battery over a 30-min duty-cycled session | ≤ 250 ms compute per second of video, ≤ 25 %/h battery — or the fps, the pose model or the duty cycle changes | 1 wk |
| **V1 — embed + store** | whitening fitted on the KB clips, `embeddings` table, commit/relabel write rows, prototypes, integrity over embeddings | the founder's existing labelled sets are re-embedded; leave-one-out on the KB's case clips separates curl from pushdown from squat | 2 wk |
| **V2 — recognise live** | streaming recogniser, smoothing, reject rule, HUD, Debrief wiring, camera duty cycle | enrol 3 exercises in one session, recognise them live in the next with the automation rate reported | 2 wk |
| **V3 — reps and weight** | embedding-periodicity counter for `vision` classes; glance-frame choice from pose visibility | ±1 on the case-001 fixture (6 reps) without the IMU | 1 wk |
| **V4 — sync** | `/embeddings` routes, `embeddingSync`, gym-pack `prior` rows for stations | a second device restores a user's prototypes from the backend | 1 wk |

Sequencing rule, unchanged from every design in this repo: **V0 measures before V1 builds.**

---

## 11. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | Frozen Kinetics features do not separate a user's fine-grained pairs | the pose block is the separator by design; the reject rule surfaces ties as "not sure"; v2.1's learned projection is the escalation, trained on v2's own data |
| R2 | A52 budget or battery missed | V0 measures first; fallbacks are 3 fps, pose on GPU, or video only during ACTIVE (not ARMING) |
| R3 | Pose fails from a headband (arm out of frame) | visibility feeds `a_pose`; the KB's field-of-view requirement on the production camera stands |
| R4 | The user enrols sloppily and prototypes are poisoned | enrolment gates; exemplar kNN alongside prototypes; re-enrol prompt on drift; relabel moves the row |
| R5 | Whitening fitted on nine minutes of clips is unrepresentative | fit on KB clips + public egocentric footage; refit is a package version bump and rows are re-embedded from the retained windows/clips |
| R6 | Three runtimes on the phone (LiteRT, MediaPipe, the engine) | both are Google AAR dependencies with GPU delegates; a one-day spike confirms they share the GL context |
| R7 | A licence slip (a convenient AGPL detector) | the §9 table is a checklist; the licence log is a pre-ship gate |
| R8 | The embedding row's `model_version` diverges from the package | rows with a stale version are re-embedded from retained evidence, or dropped with an audit row |

---

## 12. Verification

- **Jest:** block normalisation, weighted cosine with availability masks, smoothing/hysteresis,
  the reject rule, prototype/exemplar blending, the periodicity counter on synthetic feature
  sequences with known periods.
- **JVM:** `EmbedModule`'s geometry channels on synthetic landmark tracks (a curl vs a raise
  trajectory must produce separable elbow/distance statistics); whitening round trip.
- **Maestro (device):** `13-enrol-and-recognise`: enrol two exercises off two fixtures in session
  one; in session two, the HUD must show each label live within 3 s of the gate opening, and the
  set must auto-log only above the threshold. `14-video-only-recognise`: the case-001 clip alone
  (no IMU) must be recognised once enrolled.
- **On-device benchmark:** `EmbedModule.benchmark()` next to the engine's — ms per frame per block,
  memory, and a 30-minute duty-cycled battery run.
- **Gate:** the KB's four-state scorers on the case clips: **zero confident-wrong**.

---

## Appendix — parameters (package config, not code)

| Parameter | Default | Where |
|---|---|---|
| video fps | 5 | `embed.fps` |
| input size | 172 | `embed.side` |
| emission interval | 1 s | `embed.emitEverySec` |
| whitening dims | 128 | `embed.videoDims` |
| pose channels / stats | 8 / 6 → 48 | `embed.poseDims` |
| IMU descriptor | 9 + 32 → 41 | `embed.imuDims` |
| modality weights | imu: moving 1.0 / still 0.15 · pose: visible 1.0 / partial 0.6 / occluded 0.3 | `recognizer.weights` |
| kNN k | 3 | `recognizer.k` |
| smoothing | EMA 3 s, hysteresis 2 votes | `recognizer.smoothing` |
| T_reject / margin | 0.45 (fitted per user) / 0.08 | `recognizer.reject` |
| T_auto | 0.70 (= `t_imu_high`) | `recognizer.auto` |
| camera duty | ARMING+ACTIVE only; idle 1 fps or off | `embed.duty` |
| enrol gates | pose ≥ 50 % (`still`), ≥ 3 cycles, sync ≠ reject | `enrol.gates` |
| drift prompt | median d over last 3 sets > 2 × prototype spread | `enrol.drift` |
