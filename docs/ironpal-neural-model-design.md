# IronPal Neural Model — Technical Design (IronPal-Net v1)

**Status:** Draft v0.1 · 2026-09-17 — architecture proposal, not yet reviewed
**Owner:** founder (solo)
**Supersedes:** the exercise-recognition half of
[`ironpal-self-training-model-design.md`](ironpal-self-training-model-design.md) — its kNN + DTW
matcher over nine hand-crafted IMU features. The gate, the rep clock, the session recorder, the
store, the level machine, the package pipeline and the labeling studio are **kept as they are**.
**Reason:** the matcher is blind exactly where the product needs to see.

### How to read this document

It is written for two readers at once. If neural networks are new to you, the first two sections are
for you and are enough on their own:

| Start here | Section | What it gives you |
|---|---|---|
| **1st** | **[§A — a primer](#a-a-primer--what-this-model-is-for-someone-new-to-neural-networks)** | every idea the design uses, built from scratch: weights, training, encoders, embeddings, attention, transfer learning, prototypes, calibration. Ends with a glossary |
| **2nd** | **[§B — one set, end to end](#b-one-set-end-to-end--every-phase-with-real-numbers)** | a single real set followed through all seven phases — capture, preprocessing, feature extraction, fusion, proposal, confirmation, learning — with the file that does each job and the cost of each step |
| then | §0–§6 | the specification: why the old matcher fails, the architecture, the encoders, the heads, the phone budget, personalisation |
| then | §7–§8 | how the knowledge base is used as six different assets, and how the model and the labeling studio feed each other |
| last | §9–§12 | migration, build plan, risks, and what deliberately does not change |

§A and §B repeat each other on purpose: §A explains the concepts with analogies, §B shows the same
machinery working on a real clip with real numbers. Nothing in §0 onward assumes you read them.

---

## A. A primer — what this model is, for someone new to neural networks

> Written for the founder, who is new to NN design. It builds the ideas from scratch, in the order
> the model actually uses them, and every analogy is cashed out against the real components later
> in the document. If a term appears here in **bold**, it is defined here and used unchanged from
> §1 onward. Skip this section once it is familiar — nothing below depends on reading it twice.

### A.1 The problem, before any machine learning

A user finishes a set. The phone has two recordings of it: a **video** from the headband camera and
a **motion trace** from the accelerometer and gyroscope on the same headband. The app must answer
three questions:

1. Which exercise was that? (one of 37)
2. When did each repetition happen?
3. Which video frame shows the weight clearly enough to read a number off it?

The old approach answered question 1 by boiling the motion trace down to nine hand-chosen numbers
(how much energy on each axis, how fast the rhythm was, how jerky it was, and so on) and then
finding the most similar set the user had recorded before. That is a reasonable engineering idea,
and it works for squats, where the head bobs up and down half a metre. It cannot work for a biceps
curl, because during a curl **the head does not move at all** — the nine numbers are nearly
identical for a curl, a lateral raise and a shoulder press. Two thirds of the exercise list is in
that situation. The information needed to tell them apart is in the pixels: is the elbow bending,
is the palm turning, is the dumbbell close to the chest or out at arm's length.

So the model has to look at video. Everything below follows from that.

### A.2 What a neural network actually is, in one paragraph

A neural network is a very large mathematical function with millions of adjustable numbers in it,
called **weights**. You feed it an input (here: some frames and some sensor samples) and it produces
an output (here: "this is a goblet squat, 82 % confident"). At the start the weights are random and
the output is nonsense. **Training** means: show it an example whose correct answer you know,
measure how wrong the output is (this measure is the **loss**), and then nudge every weight a tiny
amount in the direction that would have made the loss smaller. Repeat a few hundred thousand times.
The nudging procedure is called **gradient descent**, and it is the only thing "learning" means in
this context.

Two things follow that matter for this product:

- **Training needs a lot of examples.** Nudging weights from random to useful takes tens of
  thousands of labelled examples at minimum. IronPal has about nine minutes of labelled footage.
  §A.6 explains how the design gets around that; it is the single most important idea in the
  document.
- **Training is expensive, inference is cheap.** Running the finished function forward to get an
  answer costs a fraction of what it cost to find the weights. That asymmetry is why training
  happens on a workstation and inference happens on the phone.

### A.3 Encoders and embeddings — the one idea to take away

The central concept of the whole design is the **embedding**.

An embedding is a list of numbers — here, 256 of them — that summarises something complicated. The
network learns to produce these summaries so that **similar things get similar lists**. If you
imagine each list as a point in space, then all the goblet squats end up clustered in one region,
all the biceps curls in another, and the distance between two points means "how different are these
two sets".

The part of the network that turns raw input into an embedding is called an **encoder**. A video
encoder turns a clip into a list of numbers; a motion encoder turns sensor samples into a list of
numbers. The word "encode" is literal: it compresses something large and messy (200 video frames)
into something small and comparable (256 numbers).

Why this matters here: once sets are points in a space where distance means similarity, "which
exercise was this?" becomes "which cluster is this point in?" — and crucially, you can answer that
for a *new* exercise the network was never trained on, just by having one or two examples of it to
compare against. That is what makes per-user personalisation possible at all.

**The contrast with the old approach.** The old matcher also measured distance between sets. The
difference is where the numbers came from. The old nine numbers were *chosen by a human* who
guessed which properties would matter. An embedding is *learned*: the training process discovers
which properties distinguish the exercises, including properties nobody would think to write down.
Same shape of question, incomparably better answer — the way a face-recognition system is not just
a better version of comparing two photographs pixel by pixel.

### A.4 Why three encoders instead of one

The model has three separate encoders, one per input type, because the three inputs are different
kinds of data and the mathematics that works for one is wrong for the others.

| Stream | What it is | Encoder | Why this kind |
|---|---|---|---|
| **Video** | ~200 images, 5 per second | a **convolutional** video network | convolutions are built to find local visual patterns (an edge, a hand, a plate) and to notice how they move between frames |
| **Pose** | where the joints are in each frame — 2D coordinates of shoulder, elbow, wrist, hands | a small **temporal** network over those coordinates | the input is already a handful of numbers per frame, so it needs a small, cheap network, not an image network |
| **Motion (IMU)** | 6 sensor channels, 50 samples per second | a **1D convolutional** network | the same idea as the video convolutions but along time only — it finds rhythms and shapes in a waveform |

Separating them also means each can be **missing**. A clip imported from the gallery has no motion
trace; a set recorded with the phone in a pocket has no video. Because each stream is encoded
independently and then combined, the model can work with whatever it has, instead of failing.

### A.5 Fusion — how the three are combined

The three encoders produce three sets of numbers. Something has to combine them into one answer,
and it needs to do so *adaptively*: for a squat the motion trace is the reliable evidence, for a
curl the pixels are, and the model should learn that by itself rather than being told.

The component that does this is a **transformer**. The only property you need to know about it is
**attention**: when producing its output, a transformer learns how much to weight each piece of its
input, and that weighting depends on the input itself. So for a set whose motion trace is flat and
featureless, the transformer learns to lean on the video; for one where the camera is pointed at
the ceiling, it learns to lean on the motion. Nobody writes that rule — it emerges from training.

There is one deliberate trick here, called **modality dropout**. During training, the model is
randomly shown examples with one of the three streams deleted. This forces it to cope, and it means
the "video only" and "motion only" cases at inference time are situations it has already practised
thousands of times rather than surprises.

### A.6 The data problem, and the two ideas that solve it

Training a video network from scratch needs tens of thousands of clips. IronPal has eight. The
design solves this with two standard techniques, and understanding them is the key to why the whole
thing is feasible for one person.

**Idea 1 — transfer learning.** Do not start from random weights. Start from a network somebody
else already trained on an enormous public video dataset. Such a network has already learned what
hands, objects, motion and occlusion look like; it simply does not know about exercises. Adapting
it to a new task with a small dataset is called **fine-tuning**, and it works because the hard,
generic part of the learning is already done. The plan goes further and starts from a network
trained on **egocentric** video — footage shot from a camera on someone's head — because that is
exactly what a headband produces, and the visual statistics are very different from ordinary video.

**Idea 2 — few-shot learning by prototype.** Even after fine-tuning, a user's individual style is
unknown. Rather than retrain for each user, the model uses the embedding space from §A.3: each
confirmed set becomes a point, and the average of a user's points for one exercise is called its
**prototype**. Classifying a new set means finding the nearest prototype. This needs *one* example
to start working, and it improves with every set the user confirms.

So there are two levels of learning, on very different timescales:

| | Where | How often | What changes |
|---|---|---|---|
| **Pretraining + fine-tuning** | a workstation | once per release | millions of weights, using public data plus the founder's clips |
| **Personalisation** | the user's phone | after every confirmed set | one prototype (a 256-number average), instantly |

And a third level, once a user has enough data: **adapter training** on the phone. Rather than
retrain millions of weights — impossible on a phone, and hopeless from 100 examples — a few thousand
extra weights are inserted into the frozen network and only those are trained. This is called a
**LoRA adapter**. It runs while the phone is charging, takes minutes, and is rolled back
automatically if it makes the model worse on a held-out check.

### A.7 The three outputs, and why the model produces all three at once

The network ends in three **heads** — small final layers that each produce a different answer from
the same shared understanding of the set.

| Head | Output | How it works, informally |
|---|---|---|
| **Exercise** | one of 37, with a confidence, plus the 256-number embedding | a scoring layer over the classes, and the embedding for prototypes |
| **Reps** | the count, and the timestamp of each rep | it compares every moment of the set to every other moment; repetitions make a visible striped pattern, and the model reads the stripes |
| **Legibility** | for each frame, "is the weight readable here" | a single score per frame, used to choose which frame gets sent for text recognition |

Training all three together is deliberate and is called **multi-task learning**. The three tasks
share the same encoders, so what the model learns about recognising a curl also helps it find the
curl's repetitions. With a small dataset this sharing is worth a great deal: every labelled set
teaches three things instead of one.

The same reasoning extends further. The exercise list carries attributes for each entry — whether
it uses a barbell or a cable, whether it pushes or pulls, which plane it moves in. The model is
trained to predict those too. Predicting "this uses a cable" is a much easier problem than naming
the exact exercise, and getting it right rules out ten alternatives at a stroke. That one addition
directly fixes a real failure in the knowledge base, where a cable machine was read as a barbell.

### A.8 Confidence, and the right to say "I don't know"

A network will always output something. Asked to classify a photograph of a sandwich, an exercise
classifier will confidently name an exercise. Preventing that is a design requirement here, not a
nicety, because the product's promise is that it never asserts a number it is not sure of — the
existing scoring harness fails the build if the model is ever confidently wrong.

Three mechanisms, all standard:

- an explicit **"unknown" class**, trained on real recordings of resting and walking, so "none of
  these" is an answer the model can actively give rather than the absence of one;
- **calibration** — a post-training adjustment so that "80 % confident" is right about 80 % of the
  time, which raw networks are notoriously bad at;
- an **abstention rule**: if the top two answers are close, or the video and motion streams
  disagree, the model declines and asks the user instead.

### A.9 Where it all runs — the two clocks

The model is not fast enough to run on live video while the user is lifting, and it does not need
to be. The design uses two separate timescales:

- **During the set**, only the cheap motion path runs: it detects that a set has started, ticks
  once per repetition for the audio cue, and does no video work at all. This is the existing code
  and it is unchanged.
- **After the set**, during the rest period, the full model runs over the recorded clip — a handful
  of seconds — and its answers populate the confirmation screen the user is about to look at.

This split is why a mid-range phone is enough. It also explains the whole architecture of the app:
the tagging round happens in the rest period precisely because that is when there is time.

### A.10 The loop the whole product is built around

Putting it together, the life of one set:

```
1. RECORD      the headband films; the IMU streams; the motion path detects the set live
2. INFER       (rest period) the model reads clip + pose + motion → exercise, reps, glance frame
3. PROPOSE     the confirmation screen shows those answers WITH their evidence
4. CONFIRM     the user taps once, or corrects — in the labeling studio if it needs real work
5. LEARN       the confirmed answer becomes a labelled example: a prototype updates immediately,
               and the example joins the pool that trains the on-device adapter later
6. REPEAT      the next set is recognised slightly better than the last
```

Step 4 is the labeling studio, and it is worth seeing why it matters so much. A neural network is
only as good as its labels, and labels are expensive — normally you pay people to draw them. Here
the user produces them as a by-product of confirming their own workout, in a surface built to make
that fast and accurate. The studio is not a debugging tool bolted on the side; it is the annotation
front end of the training pipeline, and the reason this model can improve without a labelling
budget.

### A.11 Glossary

| Term | Meaning here |
|---|---|
| **weights** | the millions of adjustable numbers inside the network |
| **training** | adjusting those numbers so the outputs get less wrong |
| **loss** | the number that measures how wrong an output was |
| **inference** | running the trained network forward to get an answer |
| **encoder** | the part that turns raw input into a compact summary |
| **embedding** | that summary — 256 numbers where distance means similarity |
| **transformer / attention** | the component that combines the streams, learning how much to trust each |
| **modality dropout** | training with a stream deleted, so missing inputs are normal |
| **transfer learning / fine-tuning** | starting from a network trained on public data and adapting it |
| **prototype** | the average embedding of a user's confirmed sets for one exercise |
| **LoRA adapter** | a few thousand extra weights trained on the phone while the rest stays frozen |
| **head** | a small final layer producing one specific output |
| **multi-task learning** | training several heads together so they share what they learn |
| **calibration** | making the reported confidence match the real hit rate |
| **quantisation** | storing weights in fewer bits so the model is smaller and faster |

---

## B. One set, end to end — every phase with real numbers

> §A explained the ideas; this section follows a single set through the machine, in order, naming
> the file that does each job. The set is the knowledge base's **case 001**: a standing alternating
> dumbbell biceps curl, human-confirmed at **6 reps per arm** with **5 kg** dumbbells, filmed on the
> A52 headband. It is `head_motion_class: still` and `rep_signal: vision` — precisely the case the
> old matcher could not do — and it is already a committed e2e fixture, so every number below is
> checkable.

### B.0 The phases at a glance

```
   ┌ PHASE 1 ───────┐ ┌ PHASE 2 ──────┐ ┌ PHASE 3 ─────────┐ ┌ PHASE 4 ──────┐
   │ capture        │ │ preprocess    │ │ encode           │ │ fuse + decide │
   │ live, 0 ms     │►│ rest period   │►│ ~7 s on the A52  │►│ ~0.2 s        │
   └────────────────┘ └───────────────┘ └──────────────────┘ └───────────────┘
                                                                      │
   ┌ PHASE 7 ───────┐ ┌ PHASE 6 ──────┐ ┌ PHASE 5 ─────────┐          │
   │ learn          │◄│ confirm       │◄│ propose          │◄─────────┘
   │ instant + idle │ │ the user, ≤20s│ │ Debrief / Studio │
   └────────────────┘ └───────────────┘ └──────────────────┘
```

### Phase 1 — Capture (live, during the set)

Nothing neural runs here. The phone is in a pocket and the user is lifting.

| What | Where | Detail |
|---|---|---|
| Video | `CameraModule.startClip` | 1280×720 at 30 fps, H.264, recording from ARM (before the first rep) so the staging glance is inside the clip by construction |
| Motion | `ImuPipeline` → `SessionRecorder` | 6 channels, resampled to 50 Hz, rotated into a head-fixed frame using the session's calibration |
| Set boundaries | `GateMachine` | opens when rhythmic motion is detected, closes after silence — this is the cheap signal-processing path, not the network |
| Live rep cue | `RepClock` | ticks per detected peak. **On this set it will under-report**, because the head barely moves during a curl. That is expected, and it is what the video rep head exists to fix |

Cost: about 4.4 ms per 400 ms tick, measured. The user gets audio feedback with no perceptible delay
and the screen stays dark.

### Phase 2 — Preprocessing (rest period begins)

Now the set is over and the model's inputs must be built. Three jobs, none of them neural.

**2a. Where to look.** Rather than sample the whole clip uniformly, the sampler uses the motion
trace to find the interesting parts — the knowledge base's own routing idea, but with a real sensor
instead of pixel motion energy:

```
PERFORM window  = the span the gate held open           → exercise + reps sample here
STILL troughs   = low-motion spans adjacent to it       → legibility + weight sample here
```

For case 001 the perform span is roughly 30–45 s into the clip; the staging glance sits just before
it, which is exactly where the knowledge base found the only legible view of the plates.

**2b. Frames.** From the perform window, 64 frames at 5 fps, each resized to 172×172.

- *Why 5 fps and not 30?* Repetitions happen between 0.2 and 1.5 times per second. Sampling at 5 fps
  is more than three times the fastest rep rate, which is enough to see every turnaround, and it is
  a sixth of the decoding cost. The knowledge base independently found that 2 fps is too slow — it
  aliased case 002's turnarounds into a wrong count — and that 3+ fps is required.
- *Why 172×172?* It is the input size the chosen video network was designed and pretrained for.
- **Rotation is applied first.** The A52 rig records sideways. Getting this wrong is not cosmetic:
  case 007 was read as an overhead press instead of a curl purely because the frames were upside
  down. There is a measured subtlety here — these clips carry a rotation flag that modern decoders
  apply automatically, so applying the rig's rotation on top rotates it a second time.

**2c. Joints.** The same 64 frames go through a pose estimator, giving the 2D position of shoulders,
elbows, wrists and hands, each with a confidence. From those, six geometric quantities the knowledge
base names as decisive are computed explicitly — how close the dumbbell is to the torso, the elbow
angle, the hand height relative to the chin, and so on.

Then everything is normalised: pixels scaled to a fixed range, sensor channels divided by their
training-set standard deviation, joint coordinates expressed relative to shoulder width so that a
tall user and a short one look the same.

### Phase 3 — Feature extraction (the three encoders)

Each stream is compressed into numbers that mean something. This is the expensive phase.

| Encoder | Input | Output | Cost on the A52 | What it contributes for case 001 |
|---|---|---|---|---|
| **Video** | 64 frames × 172² | 64 per-frame vectors | ~20 ms/frame → ~4.0 s | the dumbbell growing large as it rises and hugging the body — the "looming" cue that decides curl vs raise |
| **Pose** | 64 frames × joints | 64 vectors, 128-d | ~12 ms/frame → ~2.4 s | elbow angle collapsing from ~165° to ~45° while the upper arm stays still |
| **Motion** | 6 × 50 Hz over the set | one 128-d vector | < 0.1 s | very little here — and reporting *that* is useful: a flat trace is evidence for a head-still exercise |

Total roughly 7 s for a 40-second set, against an 8-second budget. These are estimates to be
measured in phase N0 before anything is trained; the repo's convention is to publish measurements,
and this table is the hypothesis they will test.

### Phase 4 — Fusion and the four answers

All those vectors go into the transformer together, plus one extra slot called the `[SET]` token
whose only job is to accumulate a summary of the whole set. Attention decides what to trust: on this
set, the motion stream carries almost no information, and the model — having seen thousands of
head-still examples in training — leans on video and pose.

Out come four things:

| Output | For case 001 | Notes |
|---|---|---|
| **Exercise** | `dumbbell-biceps-curl`, plus a confidence | from the 37-way scoring layer |
| **Attributes** | equipment `dumbbell`, force `pull`, isolation, sagittal plane | the cheap extra predictions; they narrow the answer and explain it |
| **Embedding** | 256 numbers | compared against the user's own prototypes |
| **Reps** | 6, with a timestamp for each | from the striped pattern of repeated moments |
| **Glance frame** | the frame just before the lift, where the plates face the camera | sent for weight reading |

Then the safety layer. If the top two candidates are close, or the streams disagree, or the chosen
exercise is one the ontology marks as poorly visible from a headband, the model lowers its
confidence or declines outright. Declining is a valid outcome; being confidently wrong fails the
build.

### Phase 5 — Proposal

The answers become the four questions on the confirmation screen, each with its evidence: the
candidate list with confidences, the rep marks drawn on the trace, the weight pre-filled, and a
plain-language reason. Because the attribute heads ran, the reason can be specific — "dumbbell,
pulling, isolation" is a far better explanation than a distance number.

**This is the moment the rewrite pays for itself.** Under the old matcher this set produced an empty
rep lane and a near-random exercise guess, because a motionless head carries neither. Now it
produces six timestamped marks and a named exercise.

### Phase 6 — Confirmation (the user, and the labeling studio)

One tap if everything is right. If not, the labeling studio is where it gets fixed, and every fix is
a better training label than a confirmation:

| The user does | The model gains |
|---|---|
| taps "all correct" | a confirmed label |
| drags a rep mark off a peak onto where the rep really was | a *hard* label — the model was wrong here, which is the most informative kind |
| relabels the exercise | a correction, weighted higher in training than a first-pass confirmation |
| pins a frame as the readable one | a direct label for the legibility head |
| tags a stretch of motion that was never recorded as a set | an entirely new example |
| dismisses a stretch with a reason | a typed negative example |

The studio was designed as a correction surface. It happens to be exactly an annotation tool, and
that is what makes this model trainable without a labelling budget.

### Phase 7 — Learning

Two timescales, as in §A.6.

**Immediately.** The confirmed set's 256-number embedding is stored, and the user's prototype for
that exercise is updated. Next time they curl, that set is in the comparison. This costs
milliseconds and needs no training.

**Later, while charging.** Once enough sets have accumulated, a small adapter is trained on the
phone against the stored embeddings, then validated against held-out sets of the user's own. If it
does not improve them, it is discarded. The heavy encoders never change on the phone.

**And centrally, between releases.** Confirmed sets that the user opted to contribute join the pool
for the next fine-tune, which ships as a new signed model package.

### B.1 What this set teaches, and what it still cannot

Case 001 is `rep_signal: vision`, which in the app's own rules means the headband may *recognise*
this exercise and *prime the weight*, but may not *certify the rep count* the way it does for a
squat. The model respects that: it proposes six marks, the user confirms them, and the exercise
level says "recognised and weight-primed" rather than "counted". The constraint lives in the
exercise list, not in anyone's good intentions.

And one honest note on the weight. The model does not read "5 kg" — it chooses the frame most likely
to show the number, and a separate text-recognition step reads it. The knowledge base's case 001 is
a caution here: the plates were read correctly and the answer was still wrong, because a 2 kg handle
was added that does not exist. Weight remains the least-validated part of the system, and the
product's language reflects that.

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
