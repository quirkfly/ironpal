# IronPal Neural Model — Technical Design (IronPal-Net v1)

**Status:** Draft v0.1 · 2026-09-17 — architecture proposal, not yet reviewed
**Owner:** founder (solo)
**Supersedes:** the exercise-recognition half of
[`ironpal-self-training-model-design.md`](ironpal-self-training-model-design.md) — its kNN + DTW
matcher over nine hand-crafted IMU features. The gate, the rep clock, the session recorder, the
store, the level machine, the package pipeline and the labeling studio are **kept as they are**.
**Reason:** the matcher is blind exactly where the product needs to see.

---

## 0. Why the current matcher cannot work, in numbers from this repo

This is not a matter of taste. Counted from `docs/video-analysis-kb/ontology.json`:

| Fact | Count | Consequence |
|---|---|---|
| Tier-1 exercises | 37 | the recognition target |
| `head_motion_class: still` | **22 of 37** | the head IMU sees almost nothing |
| `rep_signal: vision` | **20** | already conceded to vision by the ontology |
| `rep_signal: hard` | 2 | conceded to *nothing* today |
| `egocentric_visibility: partial` or `occluded` | 11 | vision is necessary but not sufficient either |

And the failure is already recorded in the knowledge base's own case files:

- **Case 001** (dumbbell curl): the discriminator against a front raise is *elbow flexion with the
  upper arm pinned, the dumbbell close to the torso, forearm supinating*. An accelerometer on the
  skull has no access to any of those. Vision got it right only after the KB added a
  proximity/"looming" rule — a **pixel** cue.
- **Case 002** (barbell curl, called an upright row): "a grip drives the whole ID — supinated =
  curl, pronated = upright row". A **pixel** cue, and one that inverts the answer.
- **Case 003** (triceps cable pushdown, called a deadlift): "trace what the bar connects to — a
  cable to a stack means a cable machine, not a barbell". A **pixel** cue about scene context.

A nine-number summary of head acceleration — axis energy split, cadence, duty, peak asymmetry,
spectral flatness, jerk, gyro split — provably cannot encode grip, elbow angle or whether a cable
runs off the bar. For the 13 `imu` exercises it is a good signal and stays in the model. For the
other 24 it is close to a coin toss dressed up as a distance.

**So the model must consume raw pixels.** The rest of this document is how, on a 2021 mid-range
Android phone, with a solo founder's data budget.

---

## 1. What the model is

**IronPal-Net** is a small multimodal network that maps *one set* — a video clip, a 2D pose track
and an IMU window — to three outputs: **what exercise it was**, **where each rep happened**, and
**which frame to read the weight from**. It is pretrained centrally, shipped signed inside the
model package, and **personalised on the phone** from the user's own confirmed sets.

```
            ┌──────────── per-set inputs ────────────┐
   clip ───►│ Video encoder   (MoViNet-A1-Stream)    │──┐
   pose ───►│ Pose encoder    (TCN over 2D keypoints)│──┤   ┌──────────────┐   ┌─ exercise (37+unknown, and a
   IMU  ───►│ IMU encoder     (dilated 1D CNN)       │──┴──►│  Fusion      │──►├─ 256-d embedding for few-shot)
            └────────────────────────────────────────┘      │  transformer │   ├─ reps (per-frame density → count
                                                            │  4 × d256    │   │        + rep timestamps)
                                                            └──────────────┘   └─ glance legibility (which frame
                                                                                    to send to OCR)
```

Three properties make it fit this product rather than a paper:

1. **Missing modalities are normal, not an error.** Trained with modality dropout, so it degrades
   honestly: video+IMU (the product path), video only (an imported gym clip), IMU only (phone in a
   pocket, or a clip reduced after the 7-day retention window).
2. **Few-shot by construction.** The classifier head covers the exercises the shipped model was
   trained on; the 256-d metric embedding covers everything else, including the custom exercises
   the PRD defers to v1.1, from as little as one confirmed set.
3. **It inherits the existing loop untouched.** Gates, integrity, levels, the campaign map, the
   Studio and the package signing all keep working — what changes is the thing being compared and
   the space it is compared in.

### 1.1 On the honest relationship to what is being replaced

The personalization head still asks "which of my own confirmed sets is this most like". That
question was never the problem. The problems were that the comparison happened (a) over **nine
hand-designed numbers** instead of a learned representation, and (b) over the **wrong sensor** for
two thirds of the exercise list. A learned 256-d embedding trained with a contrastive objective on
egocentric video is a different object from a weighted Euclidean distance over spectral flatness,
in the same way that a face-recognition embedding is a different object from a histogram of pixel
intensities. And above ~20 confirmed sets the phone stops relying on prototypes at all and trains a
real classifier head (§5.2).

---

## 2. The three encoders

### 2.1 Video — the stream that was missing

| Choice | Value | Why |
|---|---|---|
| Backbone | **MoViNet-A1-Stream** | built for mobile video, *causal* with stream buffers (so it can also run live later), ships as TFLite, A5-Stream matches X3D-XL on Kinetics-600 at 80 % fewer FLOPs |
| Input | 172×172, **5 fps**, up to 64 frames per set (12.8 s of coverage, strided over longer sets) | reps run at 0.2–1.5 Hz; 5 fps is ≥ 3× the Nyquist rate of the fastest rep and a sixth of the decode cost of 30 fps |
| Precision | **float16 on the GPU/NNAPI delegate**, INT8 only as a fallback | measured caveat: MoViNet's INT8 export drops squeeze-and-excitation and forces relu6, and loses accuracy for it. Do not start at INT8 |
| Pretraining | Kinetics-600, then **distilled from an egocentric teacher** (EgoVLP / EgoVideo-V class, Ego4D + EPIC-Kitchens) | a third-person Kinetics prior is the wrong prior for a headband: egocentric video has the actor's hands and attention in frame and the body out of it |

Egocentric pretraining is the single highest-leverage choice here. Ego4D's EgoClip pairs (3.8 M
clip-text) exist precisely to teach a model what a first-person view of manipulation looks like,
and the repo's whole corpus is first-person.

### 2.2 Pose — the discriminator the knowledge base already specified

The KB does not merely say "use vision". It names the features:

> Elbow **flexes**, upper arm pinned · DB **close** to torso at the top · forearm **supinating**,
> palm toward face · endpoint near the chin — versus arm **straight**, pivoting at the shoulder,
> **far** from the torso, pronated, endpoint at shoulder height.

Those are joint angles and distances, which is a pose problem, not a generic video problem.

- **MediaPipe BlazePose (Lite) + Hands**, 5 fps, on the same frames the video encoder samples.
- Per frame: upper-body keypoints with visibility, plus hand landmarks when present.
- Derived, scale-normalised channels: **elbow angle**, shoulder abduction, wrist pronation proxy,
  hand-to-torso distance, hand height relative to the chin, left/right asymmetry.
- Encoder: a 4-layer dilated TCN over the (T × K) keypoint track → 128-d.

This stream is cheap and carries most of the discriminative power for the 20 `vision` exercises. It
also degrades gracefully: when the arm is out of frame (the KB's "hard limit — field of view"), the
visibility flags go to zero and the fusion learns to lean on the other streams rather than
hallucinate.

### 2.3 IMU — kept, but learned

The hand-crafted feature vector is replaced by a **dilated 1D CNN** (6 channels × 50 Hz, receptive
field ≈ 8 s) → 128-d. Same input, learned representation. For the 13 `imu` and 2 `fusion`
exercises this stream remains the strongest evidence, and it keeps the two things video is bad at:
no aliasing of fast turnarounds, and a clean set/rest segmentation.

The existing `GateMachine` and `RepClock` are **not** replaced. They stay as the cheap, always-on,
sub-150 ms live cue (§4.1) — a neural rep count arriving 6 s after the set is useless as a hit
marker during it.

---

## 3. Fusion and heads

**Fusion.** Tokens from the three encoders (plus a learned `[SET]` token) go through a 4-layer,
256-d, 4-head transformer encoder. Modality embeddings mark each token's origin; **modality
dropout** (p=0.3 per stream, never all three) is applied during training. This is what buys case
(b) and case (c) of §6 for free instead of as special-cased code.

**Head 1 — exercise.** Two outputs from the `[SET]` token:
- a **37-way + unknown** softmax (the shipped closed set), trained with cross-entropy and label
  smoothing;
- a **256-d L2-normalised embedding**, trained with a supervised contrastive loss so that two sets
  of the same exercise by the same person are closer than two sets of different exercises.

Both are used: the softmax when the exercise is in the shipped set and the user has few examples,
the embedding when it is not (custom exercises, and the per-user prototypes of §5.1). The
`unknown` class is trained on the harvested rest/walk windows the store already collects — the
reject class survives the rewrite.

**Head 2 — reps.** A **temporal self-similarity** block over the fused per-frame features, in the
lineage of RepNet, but taking the 2024 correction that a raw TSM discards too much: predict a
**per-frame rep-start density** at full temporal resolution and integrate it for the count
(TransRAC's density-map formulation, and the "rethinking TSM" full-resolution variant). Output is
a count **and per-rep timestamps**.

Those timestamps matter beyond the number: they are exactly what the labeling studio draws as rep
marks and what `learner.commit` slices per-rep templates at. A vision rep clock means the 22
head-still exercises finally get proposed marks instead of an empty lane.

**Head 3 — glance legibility.** A per-frame scalar: *is the weight readable in this frame*. Case
001's lesson was that the number is legible for a brief staging moment, not during the lift, and
that anchoring the search to the lift produced a false "unreadable". A learned legibility score
picks the OCR frame far better than variance-of-Laplacian sharpness alone, and it costs one extra
output channel.

**Loss.** `L = CE_exercise + λ_c · SupCon + λ_r · (density MSE + count L1) + λ_g · BCE_legibility`,
with λ tuned on the validation split. Rep and legibility losses are masked when their labels are
absent, so partially-labelled data still trains the parts it can.

---

## 4. Running it on the phone

### 4.1 Two clocks, deliberately

The single most important runtime decision: **video inference is a rest-period job, not a live
one.**

| When | What runs | Budget | Purpose |
|---|---|---|---|
| **During the set** (every 400 ms) | the existing `GateMachine` + `RepClock` + the IMU encoder only | tick ≤ 15 ms (measured today: 4.4 ms) | the hit marker, the gate cue, a provisional label. Screen-free, real-time, no camera decode |
| **At gate close** (the rest period) | full IronPal-Net over the recorded clip | ≤ 8 s wall clock for a 40 s set | the proposals the Debrief shows |

This matches the product: the Debrief opens ≤ 1 s after gate-close with the trace, and the video
proposals land a few seconds later — well inside the ≤ 20 s tagging round, and invisible if the
user is still racking the weight.

### 4.2 Estimated cost on a Galaxy A52 (Snapdragon 720G / Adreno 618)

**These are estimates to be measured in S0, not results.** The repo's norm is to publish the
measurement; this table is the hypothesis it will test.

| Stage | Per unit | For a 40 s set (200 frames @ 5 fps) |
|---|---|---|
| Decode + resize to 172² | ~4 ms/frame | ~0.8 s |
| MoViNet-A1-Stream fp16, GPU delegate | ~20 ms/frame | ~4.0 s |
| BlazePose Lite + Hands | ~12 ms/frame | ~2.4 s |
| TCN + IMU CNN + fusion + heads | once per set | < 0.2 s |
| **Total** | | **≈ 7.4 s**, against an ≤ 8 s budget |

Falsifiable in a day with a benchmark harness, exactly as `SignalModule.benchmark()` was.

| Artefact | Size (fp16) |
|---|---|
| MoViNet-A1-Stream | ~10 MB |
| Pose (BlazePose Lite + Hands) | ~6 MB |
| IMU CNN + TCN + fusion + heads | ~6 MB |
| **Package total** | **~22 MB** |

That rides inside the existing signed model package (`engine_min`, ECDSA P-256, smoke tests,
rollback) with no new distribution mechanism.

### 4.3 Runtime

**ExecuTorch** (PyTorch Edge) for the fusion and heads, because it is the path that also gives
on-device *training* (§5.2): it lowers forward and backward graphs, writes updated weights as new
checkpoints, and supports LoRA adapters sharing one foundation weight file — all validated on
Android. MoViNet stays **TFLite/LiteRT** with the GPU delegate (it is published that way); pose
stays **MediaPipe**. Three runtimes is one more than ideal, and the alternative — porting MoViNet
to ExecuTorch — is a spike worth one day before committing.

---

## 5. Personalization — the self-training loop, preserved and upgraded

The product promise is unchanged: *every user trains their own IronPal*. What changes is what
"trains" does.

### 5.1 Level 1 — prototypes, from the first confirmed set

Each confirmed set is encoded once and stored as its **256-d embedding** (1 kB) instead of a raw
`float16` window (~24 kB). The per-exercise prototype is the running mean of the user's own
embeddings; classification is the shipped softmax blended with cosine similarity to the user's
prototypes, weighted by how many own sets exist — the same "priors retire as your own data
arrives" rule the PRD already specifies, now over a learned space.

Three side effects, all good: the store shrinks by ~20×, the leave-one-out **integrity** check
becomes a cheap dot product over embeddings (so it can still run after every set), and an
embedding is far less reconstructable than a raw sensor window if the store is ever exfiltrated.

### 5.2 Level 2 — on-device adapter training, at ~20 sets

When the user has enough confirmed sets across enough exercises, the phone trains for real:

- **LoRA adapters** on the last fusion block plus a fresh linear classifier head. Backbones stay
  frozen — there is no world in which 100 sets fine-tunes a video encoder.
- A **replay buffer of embeddings** (the store from §5.1) makes an epoch cheap: hundreds of
  256-d vectors, not hundreds of clips.
- Runs only while **charging and idle**, in a WorkManager job, a few minutes. Never mid-session.
- Validated the way a package is: a **smoke set** of held-out user sets must not regress, or the
  adapter is rolled back. The existing package apply/rollback machinery already does this.

### 5.3 Level 3 — the gym pack, unchanged in spirit

What a Scout contributes stays reduced-form: station exemplar crops, calibrations, weight priors,
and now **adapter deltas or prototypes** — never clips, never raw windows, never faces. The
PRD's split holds: the equipment side transfers between members, the body side does not.

---

## 6. What happens to a video the model has never seen

Rewriting §18.5 of the old design, which said the matcher never reads pixels. It does now.

| Case | Inputs present | What IronPal-Net does | What it still cannot do |
|---|---|---|---|
| **(a) Video + IMU** — the product path | all three streams | full inference: exercise, rep timestamps, glance frame | — |
| **(b) Video alone** — an imported gym clip, a KB case file, ShenYao before alignment | video + pose, IMU tokens dropped | **full exercise recognition and a vision rep count** — this is the case the old design could not serve at all | no IMU-certified rep timing, so the level says "recognised", and rep marks are proposals a human confirms |
| **(c) IMU alone** — phone in a pocket, clip reduced after 7 days | IMU tokens only | exercise for the 13 `imu` classes, reps from the rep clock | the head-still exercises stay ambiguous, honestly labelled `unknown` rather than guessed |

Case (b) is the point of the whole rewrite. The knowledge-base clips — 2 GB of real egocentric
footage with human-confirmed labels, currently usable only as e2e fixtures — become both training
data and a class of input the product can actually serve.

---

## 7. Leveraging the knowledge base — the asset this model is built on

A solo founder cannot label a 37-class egocentric video dataset. What the founder *does* have is a
year of accumulated, human-confirmed analysis in `docs/video-analysis-kb/`, and it is worth far more
than its size suggests — provided it is used as six different things rather than treated as "some
clips".

| Asset | Size | Used as |
|---|---|---|
| `ontology.json` | 37 Tier-1 entries, 8 structured attributes each | the label space **and** auxiliary supervision (§7.1) |
| `exercises/*.md` | 7 hand-authored cards with *ranked* egocentric cues | the engineered-feature spec and the hard-pair mining set (§7.2) |
| `cases/*.md` + `INDEX.md` | 6 analysed clips, each with a *diagnosed* failure | the diagnostic regression suite (§7.3) |
| `ground_truth.json` + `score_{weights,reps}.py` | machine-readable truth + a four-state scorer | the CI gate, unchanged (§7.3) |
| `frame-extraction.md`, `autonomous-frame-selection.md` | the extraction and routing recipes | the frame sampler (§7.4) |
| `input/kb/clips/` + `input/kb/sessions/` | ~9 min of real 4K egocentric footage, 1 real IMU session | the in-domain fine-tuning set (§7.5) |
| the `/exercise-recognition`, `/repetition-counting`, `/weight-lifted-analysis` skills | the KB method, executable | the pre-labelling engine (§7.6) |

### 7.1 The ontology is supervision, not just a list of names

Every Tier-1 entry carries eight attributes that are free labels on every clip:

| Attribute | Vocabulary | Why the model should predict it |
|---|---|---|
| `equipment_class` | barbell 10 · dumbbell 11 · cable 5 · machine 7 · bodyweight 4 | **case 003's failure exactly**: a cable straight-bar looks like a barbell until you trace the cable. A 5-way head is far easier to learn than 37-way and fixes the most damaging confusion class |
| `motion_plane` | sagittal 31 · frontal 4 · transverse 2 | separates pull-up from the sagittal crowd |
| `force` | push 21 · pull 14 | cheap, highly learnable, halves the candidate set |
| `mechanic` | compound 24 · isolation 11 | correlates with whole-body vs limb motion |
| `head_motion_class` | still 22 · moving 15 | lets the model predict *which sensor should be trusted for this set* |
| `rep_signal` | imu 13 · vision 20 · fusion 2 · hard 2 | gates which rep head may certify |
| `egocentric_visibility` | visible 25 · partial 7 · occluded 4 · floor_reference 1 | caps the confidence a class may claim from vision alone |
| `weight_read_strategy` | 5 values | routes the weight path (plate faces vs pin stack vs not applicable) |

Three concrete uses:

**Auxiliary heads.** Add one small linear head per attribute on the fused `[SET]` token. With a few
hundred training sets, multi-task supervision is the difference between a model that memorises and
one that generalises: each clip teaches seven cheap facts instead of one hard one.

**A structured loss.** Confusing two exercises that share every attribute (front raise vs lateral
raise) is a small error; confusing across `equipment_class` (cable pushdown vs deadlift) is the
error that embarrassed the KB. Weight the classification loss by attribute distance so the model is
punished in proportion to how wrong the mistake actually is.

**Inference-time constraints.** The attribute heads are not decoration — they constrain the answer.
If the equipment head says `cable` with high confidence, the 5 cable exercises are boosted and the
10 barbell ones suppressed. If `egocentric_visibility` for the argmax class is `occluded`, the
confidence is capped and the set routes to the Debrief for confirmation rather than auto-logging.
This is the same honesty rule the campaign map already enforces at the product level (PRD §5.3),
applied one layer down.

### 7.2 The exercise cards name the features — so compute them explicitly

The cards do not say "use vision". They say, ranked by what a headband can actually see:

> 1. **"Looming" — apparent size / proximity (best cue)** … the weight appears large and looming,
>    entering from the bottom/near side, growing as it rises … **never small/distant out over the
>    room**. ← used to call case 001.
> 2. Bottom of rep: dumbbell drops **out of frame toward the hip**.
> 3. Forearm **supination** if the hand is catchable.
> 4. Elbow flexion — cleanest in theory but usually an **egocentric blind spot**.

A learned encoder *may* discover proximity-from-apparent-size on its own, given enough data. With
~300 sets it will not. So these become **named geometric channels** computed per frame and
concatenated to the pose stream before the TCN:

| Channel | Computation | The card it comes from |
|---|---|---|
| implement looming | area of the tracked implement box ÷ frame area, and its time derivative | `dumbbell-biceps-curl.md` cue 1 |
| hand-to-torso distance | wrist-to-shoulder-midpoint, normalised by shoulder width | curl vs raise |
| hand height vs chin | wrist y minus nose y, normalised | "tops near face, not over" |
| elbow angle | shoulder–elbow–wrist, with a visibility flag | cue 4, honestly flagged as often absent |
| wrist pronation proxy | hand-landmark orientation | cue 3 |
| out-of-frame-low fraction | proportion of the cycle the wrist is below the frame | cue 2 |

These are ~8 numbers per frame against a 128-d learned pose embedding: negligible cost, and they
encode a year of human observation the network would otherwise have to rediscover.

**The "Distinguish from" sections are the hard-negative set.** They already exist in machine
form — `poc/model/package/field_guide.json`, 33 confusable pairs, built for the Studio's Compare
view. The same file drives **hard-pair mining** for the contrastive loss: sample batches so that
confusable pairs appear together, which is where the margin actually matters.

### 7.3 The case files are the regression suite, and they force calibrated abstention

Six cases is not a test set. It is something more useful: **six named failure modes with diagnoses**.

| Case | The failure | What the model must demonstrate |
|---|---|---|
| 001 | called it at 0.40 confidence, right for weak reasons; added a phantom 2 kg handle | proximity cue drives the call; weight = plate sum |
| 002 | grip misread → upright row instead of curl | supinated vs pronated changes the answer |
| 003 | cable machine read as a barbell deadlift | `equipment_class` head says cable |
| 004 | two different plate sizes called "the same" | per-plate reading, not a global guess |
| 005 | eyeballed a pin stack four times, all high | count empty holes, or abstain |
| 007 | 180° rotation made a curl look like an overhead press | rig rotation applied before inference |

These run as **`kb_eval`, never in training**, and they are scored by the *existing* harness —
`score_weights.py` and `score_reps.py`, with their four states (CORRECT / WRONG / IMPRECISE /
ABSTAIN) and their rule that **a confident-wrong answer fails the build**.

That rule has an architectural consequence, and it is the most important thing the KB imposes on
this model: **the network must be able to abstain, and its confidence must be calibrated.** An
argmax over a softmax is not enough. So:

- temperature scaling fitted on a held-out split, so the reported confidence means something;
- an explicit `unknown` class trained on the harvested rest/walk windows;
- an **abstention rule** that fires on low margin, on attribute disagreement between streams (video
  says cable, IMU says free weight), or on an `occluded` class predicted from vision alone;
- the four-state scorer as a CI gate on every model build, exactly as it gates the KB today.

IMPRECISE is deliberately not counted as wrong — a wide rep range is a soft abstention, and it
costs coverage rather than accuracy. The model inherits that semantics rather than inventing one.

### 7.4 The method docs are the frame sampler

`autonomous-frame-selection.md` already solved frame routing without a detector: pixel motion
energy segments a clip into STILL and PERFORM windows, and each question gets its own extraction.
That is exactly the sampling policy this model needs, and it is cheaper than uniform sampling:

```
KbSampler(clip, imu)
  PERFORM window  ← IMU gate ACTIVE span (better than the KB's pixel proxy — we have the sensor)
      → exercise + rep heads sample here, ≥ 5 fps, denser at turnarounds
  STILL troughs   ← low motion energy adjacent to the perform span
      → legibility + OCR sample here, full resolution, NO downscale (weight numbers die under
        compression — frame-extraction.md)
  rotation        ← per-rig, and CHECK for a container display matrix first (measured 2026-09-15;
                    applying the rig table on top of ffmpeg's autorotate double-rotates)
```

The fps rules come from the KB too: ≥ 3 fps for rep counting (2 fps aliased case 002's turnarounds
into a miscount), 4–6 fps for ballistic lifts.

### 7.5 The clips are small, in-domain, and the only ones that exist

Eight clips, about nine minutes, one real IMU session. As a training set that is nothing; as a
**fine-tuning and domain-adaptation** set after egocentric pretraining it is the most valuable data
in the project, because it is the founder's own rig, the product's own ontology, and human-confirmed.

Treated accordingly: temporal crops and stride augmentation, rotation jitter around the rig's
nominal, brightness/blur matching the gym, and — critically — **never** augmented across the
distinctions the KB says are decisive (no horizontal flip: it inverts the grip and the watch-side
check that `frame-extraction.md` uses to verify orientation).

### 7.6 The KB skills are the pre-labelling engine

The repo already has the KB method as executable skills: `/exercise-recognition`,
`/repetition-counting`, `/weight-lifted-analysis`. They emit structured predictions with confidence
and honest abstention, and they were built to be run blind.

That is the bootstrap loop:

```
unlabelled clip ──► KB skill (LLM + the KB method) ──► candidate label + confidence
                                                          │
                                     the Studio shows it as a proposal to confirm or correct
                                                          │
                                          confirmed ──────► training example
                                          corrected ──────► training example, weighted higher
```

The founder's labelling cost drops from "watch and annotate" to "confirm or fix", which is exactly
what the Studio was built for. Pseudo-labels are never trained on unconfirmed.

### 7.7 Provenance — the label space must not drift

The package already carries `ontology_ref: sha256`. Extend it: a training run records the ontology
hash, the hashes of the KB method docs it followed, and the `kb_eval` case-set version, and the app
**refuses to apply a model whose ontology hash does not match its own campaign map**. A recogniser
and a campaign map that disagree about what "goblet squat" means is a silent, total failure, and it
costs one comparison to make impossible.

### 7.8 Honest expectation for v1

A reliable closed set covering the 15 Campaign-1 exercises and the most common Campaign-2 ones;
everything else served by prototypes at lower confidence, with the `unknown` class used rather than
avoided. Claiming 37-way accuracy off ~300 sets would be the same overreach this document replaces.

---

## 8. Integration with the labeling studio and the app

The second half of the requirement: the model must not be a component bolted to the side. It is the
recognition engine *inside* an app whose capture, labelling, storage, gating and packaging already
exist — and, luckily, the labeling studio already emits exactly what a network needs to train on.

### 8.1 What the Studio already produces, and what it trains

No new capture work is required. Every column the Studio writes maps to a training target:

| Studio / Debrief output | Schema | Trains |
|---|---|---|
| confirmed `exercise_id` | `labeled_sets.exercise_id` | the 37-way head, the embedding, and all seven attribute heads (looked up from the ontology) |
| trimmed bounds | `t_start_host_ns` / `t_end_host_ns` | the set segmentation, and which frames are sampled |
| per-rep marks, with `snapped` flags | `rep_marks` (`{t, snapped}`) | the **rep density map** — a user-placed, off-peak mark is a *harder* and more informative label than a snapped one |
| pinned frames with crops and roles | `exemplar_frames` (`source='user'`) | the **legibility head** (a human chose this frame as readable) and hard examples for the implement detector |
| declared weight + state | `weight_declared`, `weight_state` | the weight path end to end, scored by `score_weights.py` |
| `counted` and `gates_json` | | sample weighting: only gate-passing sets train the certifying heads |
| `label_source` and `revision` | | a **corrected** label (`studio`, revision ≥ 2) outranks a first-pass confirmation — the user looked twice |
| dismissed regions with reasons | `regions.state='dismissed'` | negatives for the `unknown` class, with a reason that says which kind of negative |

That last pair is the quiet win. `revision` and `label_source` were added for the Studio's audit
trail; they turn out to be exactly the sample-weighting signal a noisy-label training run needs.

### 8.2 What the model gives back to the Studio

| Model output | Studio surface |
|---|---|
| top-3 with calibrated confidence | the exercise sheet's candidate list, ordered, with the confusable neighbour always shown |
| **attribute heads** | the *explanation*: "equipment: cable (0.94)" is why it is not a barbell row — a far better reason than a distance |
| rep density map → timestamps | the proposed rep marks in the reps lane, **including for the 22 head-still exercises that have none today** |
| nearest own set by embedding | "closest to your goblet squat from 12 May" in the Compare view, with that set's clip one tap away |
| legibility head | which frame Pins mode suggests, and which crop "read this frame" sends |
| per-frame confidence | the timeline's trace lane gains a confidence band, so a user can see *where* the model got lost |

### 8.3 The queue becomes real active learning

The After Action queue already orders work by what the model is least sure of. With a calibrated
network that stops being a heuristic and becomes standard uncertainty sampling:

| Queue priority | Signal |
|---|---|
| 1 | low margin between top-1 and top-2 |
| 2 | **stream disagreement** — video says one equipment class, IMU says another |
| 3 | attribute inconsistency (predicted `rep_signal: imu` but the IMU stream is silent) |
| 4 | high-entropy rep density (the count is a guess) |
| 5 | an untagged region the model thinks is a set |
| 6 | a live correction on a certified exercise |

Every resolved item is a labelled example chosen because it was maximally informative. That is the
whole self-training premise, now with a principled sampler instead of a rule of thumb.

### 8.4 The closed loop

```
   capture ──► IronPal-Net (rest period) ──► proposals ──► DEBRIEF (≤ 20 s)
                     ▲                                          │
                     │                                    "Open in After Action"
                     │                                          ▼
          adapter / prototypes                        STUDIO: fix marks, bounds,
          (charging + idle, rollback)                 exercise, pins
                     ▲                                          │
                     │                                          ▼
              embedding store ◄── learner.commit / relabel ── gates
                     │                                          │
                     └──────── integrity, levels, campaign map ◄┘
                                          │
                     queue (uncertainty) ─┘ ──► back to the Studio
```

### 8.5 What each existing component does under the new engine

| Component | Change |
|---|---|
| `ImuPipeline`, `SessionRecorder`, `GateMachine`, `RepClock` | **none** — still the live, screen-free path |
| `CameraModule`, `ClipModule` | none; the clip and PTS table the Studio needs are the model's input too |
| `SignalModule.analyzeRange` / `explainRange` / `scanRegions` / `peakNear` | none — the Studio depends on them and they are IMU-side |
| `TemplateIndex.match` | **retired** |
| `learner.commit` | stores a 256-d embedding instead of `float16` windows; everything else identical |
| `integrity` | leave-one-out over embeddings — same contract, cheaper |
| `levels`, `drift`, `decide` | unchanged; `decide` gains the attribute evidence in its explanation objects |
| `packageManager` | unchanged mechanism; the package gains model binaries, `model_arch` and the ontology-hash check |
| the Studio | **no change required** — it already emits what the model trains on |
| `exportSessionLabels` | already emits `predictions.json`-compatible rows, so the KB scorers can grade device-collected labels with the same CI gate |

### 8.6 Runtime placement

The model runs where the app already has a natural pause. `useSet.end()` closes the gate and starts
the clip ingest; the same job chain adds an inference step, and `useDebrief.open()` waits on it with
the trace already on screen. If inference has not finished — a long set, a cold GPU — the Debrief
shows the IMU-only proposal immediately and upgrades it when the video result lands, which is the
behaviour the Studio's degraded-state copy already describes.

---

## 9. Migration — nothing collected is wasted

1. Every stored `float16` IMU window, exemplar frame and retained clip in the current store is
   **labelled training data** for P2. The kNN store's whole contents convert into the new model's
   supervision set.
2. `SignalModule` keeps the gate, the rep clock, the recorder and the range-analysis calls the
   Studio depends on (`analyzeRange`, `explainRange`, `scanRegions`, `peakNear`). Only
   `TemplateIndex.match` is retired.
3. `previewIntegrity` keeps its contract; its implementation becomes leave-one-out over embeddings.
4. The package format gains model binaries and a `model_arch` version; signing, `engine_min`,
   smoke tests and rollback are unchanged.
5. The labeling studio needs **no change at all** — it already produces exactly what this model
   trains on: a confirmed exercise, trimmed bounds, per-rep timestamps, pinned frames. Its rep
   marks become the density-map labels for Head 2, and its pins become hard examples for Head 3.

The Studio was built for a store of windows and turns out to be the right labelling front end for
a network. That is the one piece of luck in this rewrite.

---

## 10. Build plan

| Phase | Deliverable | Exit | Est. |
|---|---|---|---|
| **N0 — feasibility, measure first** | MoViNet-A1-Stream + BlazePose running on the A52 over a recorded clip; the §4.2 table replaced with measurements | ≤ 8 s per 40 s set, or the architecture is re-cut | 1 wk |
| **N0.5 — the KB as a dataset** | `scripts/kb/build_dataset.py`: ontology attributes → multi-label targets, `KbSampler` (§7.4), the 6 case files frozen as `kb_eval`, the four-state scorers wired as the CI gate, the pre-labelling loop (§7.6) run over the 8 clips | a dataset builder that regenerates from the repo, and a red CI on a deliberately confident-wrong model | 1 wk |
| **N1 — train v0** | pretrain/distil, fine-tune on KB + founder data, 15-class closed set + embedding + the seven attribute heads | beats the current matcher on a held-out founder split, and `kb_eval` shows **zero confident-wrong** | 3 wk |
| **N2 — on device** | export (ExecuTorch + TFLite), package integration with the ontology-hash check, rest-period inference wired into `useSet` → `useDebrief` | proposals appear in the Debrief from video, on the phone | 2 wk |
| **N3 — rep head** | density-map rep counting, marks fed to the Studio's reps lane | vision rep proposals on a **head-still** exercise, ±1 against the human count | 2 wk |
| **N4 — personalization** | prototypes, then the LoRA adapter job with rollback; the queue switched to uncertainty sampling (§8.3) | a user's fifth set measurably improves their own accuracy | 2 wk |

Sequencing rule, same as the old design's: **N0 is measured before N1 starts.** If a 40 s set costs
30 s of compute on the A52, the frame rate, the backbone or the "every set" assumption changes, and
it is far cheaper to learn that in week one.

---

## 11. Risks

| # | Risk | Mitigation |
|---|---|---|
| V1 | The A52 cannot hit the budget | N0 measures first; fall back to 2 fps, MoViNet-A0, pose-only on the glance window, or inference only on sets the user opens in the Studio |
| V2 | Not enough data for 37 classes | ship a 15-class closed set + prototypes + a real `unknown`; grow with beta |
| V3 | Egocentric occlusion (11 of 37 exercises partial/occluded) | pose visibility flags, modality dropout, and the ontology's own `egocentric_visibility` used to cap the confidence a class may claim |
| V4 | Three runtimes (TFLite, MediaPipe, ExecuTorch) | one-day spike to try MoViNet under ExecuTorch; accept three if it fails, they are all AAR dependencies |
| V5 | Battery and thermals across a 60-minute session | inference is per set, not continuous; defer below 30 % battery; the existing storage/battery prechecks extend to it |
| V6 | A neural net is a black box, and the product promises explanations | keep the evidence surface: top-3 with confidences, the nearest own set by embedding distance ("closest to your set from 12 May"), the pose overlay on the rep frame, and Grad-CAM on the glance frame for the weight path |
| V7 | Regression against a matcher that at least worked for squats | the 13 `imu` classes are a fixed benchmark; the new model must not lose to the old one on them, and the IMU stream exists so it should not |
| V8 | **`kb_eval` is six cases** — it characterises failure modes, it does not measure accuracy | treat it as a gate, never as a score; real accuracy comes from the held-out founder split and, later, beta users. Grow the case set as clips are analysed |
| V9 | Pseudo-labels from the KB skills drift the model toward the LLM's mistakes | never train on unconfirmed labels; corrected labels (`revision ≥ 2`) outweigh confirmations; the case files exist precisely because the skills *did* get 001–003 wrong at first |
| V10 | The ontology changes and silently invalidates a trained model | the ontology hash is in the package and checked at apply time (§7.7) |

---

## 12. What this does not change

The PRD's promises, the game layer, the gym pack, the privacy envelope (video never leaves the
phone; one cropped still to OCR, deleted after inference), the level machine, the quality gates,
the integrity meter, and the labeling studio. This is a replacement of the *recognition engine*
inside an otherwise intact product — which is the only reason a solo founder can attempt it.
