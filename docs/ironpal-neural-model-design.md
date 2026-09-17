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

## 7. Data — the real constraint

A solo founder cannot label a 37-class video dataset. The strategy is therefore borrowed
supervision first, own supervision second:

| Stage | Source | Rough scale | Buys |
|---|---|---|---|
| **P0 pretrain** | Kinetics-600 → distil an Ego4D/EPIC-pretrained teacher | public | generic motion + egocentric priors |
| **P1 fitness adapt** | public gym/fitness video datasets, third-person included (with a domain-adaptation loss) | thousands of clips | exercise-shaped priors |
| **P2 own data** | the founder's three-visit capture plan + the existing KB cases, Claude-pre-labelled and human-confirmed as the repo already does | ~200–400 sets | the egocentric, this-rig, this-ontology fit |
| **P3 beta** | testers' opt-in confirmed sets | grows | the long tail and cross-body evidence |

**Honest expectation for v1:** a reliable closed set covering the 15 Campaign-1 exercises and the
most common Campaign-2 ones, with everything else served by prototypes at lower confidence and an
`unknown` class that is used rather than avoided. Claiming 37-way accuracy off 300 sets would be
the same overreach this document is replacing.

---

## 8. Migration — nothing collected is wasted

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

## 9. Build plan

| Phase | Deliverable | Exit | Est. |
|---|---|---|---|
| **N0 — feasibility, measure first** | MoViNet-A1-Stream + BlazePose running on the A52 over a recorded clip; the §4.2 table replaced with measurements | ≤ 8 s per 40 s set, or the architecture is re-cut | 1 wk |
| **N1 — train v0** | pretrain/distil, fine-tune on KB + founder data, 15-class closed set + embedding | beats the current matcher on a held-out founder split — a low bar, and it must clear it | 3 wk |
| **N2 — on device** | export (ExecuTorch + TFLite), package integration, rest-period inference wired into `useSet` → `useDebrief` | proposals appear in the Debrief from video, on the phone | 2 wk |
| **N3 — rep head** | density-map rep counting, marks fed to the Studio | vision rep proposals on a head-still exercise, ±1 against human count | 2 wk |
| **N4 — personalization** | prototypes, then the LoRA adapter job with rollback | a user's fifth set measurably improves their own accuracy | 2 wk |

Sequencing rule, same as the old design's: **N0 is measured before N1 starts.** If a 40 s set costs
30 s of compute on the A52, the frame rate, the backbone or the "every set" assumption changes, and
it is far cheaper to learn that in week one.

---

## 10. Risks

| # | Risk | Mitigation |
|---|---|---|
| V1 | The A52 cannot hit the budget | N0 measures first; fall back to 2 fps, MoViNet-A0, pose-only on the glance window, or inference only on sets the user opens in the Studio |
| V2 | Not enough data for 37 classes | ship a 15-class closed set + prototypes + a real `unknown`; grow with beta |
| V3 | Egocentric occlusion (11 of 37 exercises partial/occluded) | pose visibility flags, modality dropout, and the ontology's own `egocentric_visibility` used to cap the confidence a class may claim |
| V4 | Three runtimes (TFLite, MediaPipe, ExecuTorch) | one-day spike to try MoViNet under ExecuTorch; accept three if it fails, they are all AAR dependencies |
| V5 | Battery and thermals across a 60-minute session | inference is per set, not continuous; defer below 30 % battery; the existing storage/battery prechecks extend to it |
| V6 | A neural net is a black box, and the product promises explanations | keep the evidence surface: top-3 with confidences, the nearest own set by embedding distance ("closest to your set from 12 May"), the pose overlay on the rep frame, and Grad-CAM on the glance frame for the weight path |
| V7 | Regression against a matcher that at least worked for squats | the 13 `imu` classes are a fixed benchmark; the new model must not lose to the old one on them, and the IMU stream exists so it should not |

---

## 11. What this does not change

The PRD's promises, the game layer, the gym pack, the privacy envelope (video never leaves the
phone; one cropped still to OCR, deleted after inference), the level machine, the quality gates,
the integrity meter, and the labeling studio. This is a replacement of the *recognition engine*
inside an otherwise intact product — which is the only reason a solo founder can attempt it.
