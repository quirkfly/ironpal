# Grilled — Neural Model Design v2 (auto mode)

Decisions resolved on **2026-09-22** against
[`ironpal-neural-model-design-v2.md`](ironpal-neural-model-design-v2.md), **without user
interaction**: each question was posed and answered by walking the design tree, in order, one
branch at a time.

Provenance tags — read them before trusting anything below:

- **EVIDENCE** — answered from the codebase, the knowledge base, the brief, vendor documentation or
  arithmetic; the source is cited.
- **ASSUMED** — the answer that would have been recommended in an interactive session; one line of
  rationale and the strongest argument against, so it can be vetoed cheaply.
- **OPEN** — not mine to settle (money, legal, external claims). Recommendation stated; the design's
  wording stays conditional on it.

Every resolved decision is folded into the design in place. This ledger is the only record of
*which* statements were decided by evidence and which were invented.

**Tally: 35 questions — 18 EVIDENCE · 16 ASSUMED · 1 OPEN.**

**Worth a veto first (riskiest assumptions, in order):**

1. **Q9 — unsupervised PCA-whitening of the frozen MoViNet feature is enough to make cosine
   distance meaningful for exercises.** This is the load-bearing "no training" claim. If a user's
   fine-grained pairs do not separate, the escalation is the v2.1 learned projection — which is
   training, on data v2 must first collect.
2. **Q28 — the camera runs only while the IMU gate is ARMING/ACTIVE.** It is what makes an hour's
   battery plausible; it also means a set the gate misses is never seen by video. For `still`
   exercises the gate opens on much weaker motion — V0 must show it still opens.
3. **Q27 — the embedding-periodicity rep counter works for `vision` classes.** Untested on any
   footage. If it does not reach ±1 on the case-001 fixture, `vision` classes get proposals from
   the pose channels alone, or none.
4. **Q29 — the budget table.** Every number is an estimate; V0 exists to replace it.
5. **Q3 — v2 ships first and v1 waits for v2's data.** A product-sequencing call, not an
   engineering one; it is the recommendation, and the founder may prefer to train earlier.

---

## Branch A — Scope and shape

### Q1 — A classifier, or an embedding model with nearest-neighbour over enrolled sets?

**EVIDENCE — embedding + nearest-neighbour.** The brief's three goals say "the model will provide
embeddings", "stored in the app database", and "use the stored embeddings to recognise". A
classifier would also need a 37-way training set that does not exist: the package ships **0
priors** (`assets/model_package.json`) and the KB holds **8 clips, ~9 minutes**
(`input/kb/clips/`). Per-user nearest-neighbour is the only shape that needs neither.

### Q2 — Are the encoders fine-tuned, or frozen?

**EVIDENCE — frozen.** The brief: "not requiring extensive amount of training data". With nine
minutes of footage, fine-tuning a video encoder would overfit on day one. The only fitted numbers
in v2 are unsupervised (Q9) or the user's own enrolments.

### Q3 — How does v2 relate to v1 (IronPal-Net)?

**ASSUMED — v2 ships first; v1 is the escalation once v2 has collected labelled embeddings.** They
share modalities and the whole app loop, so nothing in v2 is thrown away when v1's trained heads
arrive — v2's embeddings and labels *are* v1's training set.
*Against:* the founder may want the trained model sooner. v1's own plan says it needs ~300 sets of
own data before it beats frozen features; v2 is how those sets get labelled.

### Q4 — What makes a training-free recogniser plausible at all?

**EVIDENCE for the regime, ASSUMED for the size.** PRD premise 1 (`ironpal-self-training-prd.md`
§1.4): one user trains at one home gym, consistently — same stations, rig, lighting. So the
question is "which of *this user's* exercises", not "which of 37 for anyone". The 8–15 exercise
programme size is an assumption about committed lifters.
*Against:* a user who rotates through 30 exercises has a harder problem; the reject rule and the
Studio cover the collisions.

---

## Branch B — The video block

### Q5 — MoViNet-A0-Stream, or A1, or something else?

**EVIDENCE — A0-Stream.** The brief: "we do not need full-fledged movinet, only the small version".
A0 is the smallest of the family: ~2.7 GFLOPs per 50-frame clip (≈ 55 MFLOPs/frame), 71.5–72 %
Kinetics-600 top-1 at MobileNetV3-Large latency (MoViNets paper; TF model zoo). It is causal with
stream buffers, which is what "real time" needs (Q24). Licence Apache 2.0 (`tensorflow/models`;
the brief's licence review).

### Q6 — float16 or INT8?

**EVIDENCE — float16 on the GPU delegate, INT8 only as a fallback.** The published INT8 MoViNet
builds drop squeeze-and-excitation and force relu6, with a documented accuracy loss (Kaggle model
card, TF blog). The LiteRT GPU delegate runs 16-bit float natively and needs OpenGL ES 3.1+, which
the A52 has.

### Q7 — Frame rate?

**EVIDENCE — 5 fps.** The KB's frame-extraction rules, measured on real clips: 2 fps aliased
turnarounds into a miscount (case 002); ≥ 3 fps is the floor for reps; 4–6 for ballistic lifts.
Reps run 0.2–1.5 Hz, so 5 fps is ≥ 3× the fastest rep. Decode cost is a sixth of 30 fps.

### Q8 — Which tensor is "the feature"?

**ASSUMED — the pooled penultimate activation, with the 600-way Kinetics head discarded.** The head
is a linear map onto Kinetics classes; the layer beneath it is the motion representation.
*Against:* an earlier, less pooled layer may keep more spatial detail useful for fine distinctions.
V1 can compare two candidate layers on the KB clips in an afternoon.

### Q9 — How is the raw feature turned into something cosine distance works on?

**ASSUMED — PCA-whitening to 128-d, fitted unsupervised on ~1 000 windows.** Retrieval over
features that were trained for classification, not for distance, is well known to improve
markedly with whitening; it needs no labels, so it does not violate Q2.
*Against:* a supervised projection would separate the user's pairs better. That is v2.1, gated on
data v2 must first produce. **This is the load-bearing assumption of the design.**

### Q10 — How often is an embedding emitted?

**ASSUMED — once per second (every 5 frames), from the stream state.** Enough votes per set
(~17 on a 20 s set) for the smoothing to work, at a fifth of per-frame kNN cost.
*Against:* per-frame emission gives sharper rep boundaries; it is not needed for a label.

---

## Branch C — The pose block

### Q11 — Pose Landmarker Lite, Full or Heavy?

**EVIDENCE — Lite.** ~20–40 ms/frame on a mobile CPU, 2–5× faster on GPU; the ~5–10 % accuracy
loss against Full concerns landmark precision, which joint *angles* at headband scale do not need
(vendor guides and latency notes).

### Q12 — Which geometric channels?

**EVIDENCE — the eight in §3.2.** Every one is a cue the KB established on real footage:
`sensor-fusion.md`'s curl-vs-raise table (elbow flexes vs straight; close vs far; endpoint near
chin vs shoulder height), `dumbbell-biceps-curl.md`'s ranked signature (bottom of rep out of
frame; alternating vs simultaneous — case 001's 2×/÷2 confound), and the field-of-view limit
(visibility as a channel). They are computed, not learned, so they cost no training.

### Q13 — Hand landmarks for pronation?

**ASSUMED — deferred to v2.1.** Hands double the pose cost, and from a headband the hand is often
small or out of frame. The elbow and distance channels already carry the curl-vs-raise decision.
*Against:* grip inverts an answer (case 002, curl vs upright row). When that pair matters to a user,
enable hands for them.

### Q14 — Temporal statistics, or a learned temporal network over the channels?

**ASSUMED — statistics (mean, sd, min, max, range, dominant period) → 48-d.** No training (Q2), and
they capture what distinguishes exercises: range of elbow angle, mean distance, period.
*Against:* a TCN learns interactions; it is v1's pose encoder, for later.

---

## Branch D — The IMU block

### Q15 — Keep an IMU block at all, after the kNN over IMU features was rejected?

**ASSUMED — yes, as one of three blocks, never alone.** For the 13 `imu` exercises it remains the
best signal (the engine's tick is 4.4 ms, measured), and it is the only block available with the
phone in a pocket. The rejection was of IMU-*only* matching over hand-picked features as the whole
model.
*Against:* dropping it simplifies the distance. It would also blind the phone-in-pocket case.

### Q16 — How much does the IMU block count for a given candidate?

**EVIDENCE — by the ontology's `head_motion_class`, per candidate.** 22 of 37 Tier-1 exercises are
`still`, 15 `moving` (`ontology.json`). For a `still` candidate the head IMU carries almost nothing
— the exact fact the old matcher ignored. The weights (moving 1.0 / still 0.15) are a starting
point; the *rule* is evidence, the numbers are config.

### Q17 — Add a spectrum to the nine features?

**ASSUMED — a 32-bin log-magnitude spectrum of the rep channel, 0.1–3 Hz.** Cadence and its
harmonics distinguish a slow grind from a bounce and cost nothing.
*Against:* it is more hand-crafting. As one block among three, weighted down for `still` classes,
it is harmless where it is useless and useful where it is not.

---

## Branch E — Distance, prototypes and the store

### Q18 — One concatenated vector, or per-block distances?

**ASSUMED — per-block cosine, weighted by reliability × availability, renormalised.** It is what lets
a missing modality be arithmetic instead of a special case (the three cases of the old §18.5), and
it is what lets the ontology weight a modality per candidate (Q16).
*Against:* a single learned metric would be better; it is training.

### Q19 — Prototypes only, or exemplars too?

**ASSUMED — both: the per-exercise prototype blended with k = 3 nearest exemplars.** Prototypes are
robust to one bad enrolment; exemplars catch a user who does two variants of one exercise.
*Against:* two mechanisms to explain. The Compare view already shows nearest-own-set, so the
exemplar path is visible to the user anyway.

### Q20 — Where does the reject class come from?

**EVIDENCE — the rest/walk windows the engine already harvests.** `SignalModule.tick` collects ≤ 5
non-periodic 4 s windows per session (design §4.1, R11); embedding them as `unknown` costs nothing
and keeps the reject class the old design had.

### Q21 — Does the embedding replace the stored IMU windows and clips?

**ASSUMED — no; it is an additional artefact.** The windows and clips are the Studio's evidence and
v1's future training set (v1 §9 "nothing collected is wasted"); an embedding cannot be re-derived
from itself after a model version bump (Q34 / R8), but it can be re-derived from retained evidence.
*Against:* storage. The embedding is ~450 bytes; the retention policy on clips is unchanged.

### Q22 — Row size and store size?

**EVIDENCE — arithmetic.** 128 + 48 + 41 halves = 434 bytes of vectors + ids ≈ 450 bytes; 20 sets
< 10 kB per exercise; the old store held 24 kB of `float16` window per set (§18.2 of the old
design, corrected on 2026-09-17).

### Q23 — How does the backend sync work?

**EVIDENCE — mirror `/templates/sync`.** `src/store/templateSync.ts` and
`backend/api/templates_routes.py` already implement version-gated deltas with offline fallback;
`embeddingSync` is the same shape over a new table. Precedence own → gym pack is PRD FR-P3.

---

## Branch F — Recognition

### Q24 — Real-time streaming, or rest-period inference like v1?

**EVIDENCE — streaming.** The brief says "recognise exercises in real time, providing feedback".
MoViNet-Stream is causal with stream buffers precisely so it can advance frame by frame on a live
feed (paper §3; TF Hub streaming tutorial). A0's ~55 MFLOPs/frame is what makes it affordable.

### Q25 — Smoothing?

**ASSUMED — EMA over 3 s and two consecutive agreeing votes before a label change.** A per-second
recogniser flickers; a 20 s set yields ~17 votes.
*Against:* a slower response to a genuine exercise change; sets are separated by rest, so this
does not arise within a set.

### Q26 — Confidence convention and thresholds?

**EVIDENCE — reuse `conf = 1/(1 + d)`, `T_reject` 0.45 fitted per user, `T_auto` = `t_imu_high`
0.7.** These are the package's existing keys (`model_package.json` `params`) and the level machine
and live HUD already interpret them; the fit of `T_reject` (`integrity.fitTReject`) carries over
unchanged. The margin (0.08) is a new number and is ASSUMED.

### Q27 — Reps for the classes the IMU cannot count?

**EVIDENCE for the split, ASSUMED for the counter.** The ontology's `rep_signal` says which classes
the headband may certify (13 `imu` + 2 `fusion`), and the PRD's honesty rule (§5.3) forbids
claiming more. The **embedding-periodicity counter** for `vision` classes is an assumption: the
RepNet idea (repetition = stripes in temporal self-similarity) over features that already exist,
with no learned head.
*Against:* untested. Exit criterion in V3: ±1 on the case-001 fixture without the IMU. Failing
that, `vision` classes get proposals from the pose channels' dominant period alone.

### Q28 — Camera duty cycle?

**ASSUMED — video and pose run only while the gate is ARMING or ACTIVE; idle otherwise.** Continuous
5 fps decode + GPU for an hour is the battery risk; ~12 sets × 40 s ≈ 8 minutes of video per
session.
*Against:* the gate opens on rhythmic *head* motion, which is weak for `still` classes — a set the
gate misses is never seen by video. ARM (the user's explicit tap) starts video regardless of the
gate, and V0 must show the gate still opens on the head-still fixtures.

### Q29 — The budget numbers?

**ASSUMED — estimates, marked as such in the design.** ~10 ms/frame for A0 fp16 on Adreno 618 is
scaled from A0's FLOPs and MobileNetV3-Large-class latency; ~25 ms for Pose Lite on CPU is the
vendor range. V0 replaces the table with measurements, as the engine's benchmark did.

---

## Branch G — Enrolment

### Q30 — When is an exercise "known"?

**EVIDENCE — the level machine's counts.** `levels.ts`: 1 clean set → Recon, 3 + integrity ≥ 0.8 →
Provisional, 5 at ≥ 2 weights + integrity ≥ 0.9 → Certified. Recognition's automation follows
`automation(state)` exactly as the live HUD does today. Nothing new to explain to the user.

### Q31 — Enrolment quality gates?

**ASSUMED — pose visibility ≥ 50 % for `still` classes, gate open ≥ 3 cycles, sync class ≠ reject.**
A set whose sensors saw nothing must not become an exemplar; the reasons are shown like every
failed gate today.
*Against:* the 50 % is a guess; V1's leave-one-out on the KB clips will say where the cliff is.

### Q32 — Re-enrolment?

**ASSUMED — prompted on drift (median distance of the last 3 sets > 2 × the prototype's spread),
never demanded.** New rack, new headband fit, changed form: one confirmation refreshes the
prototype. This is `drift.ts`'s `rigMoved` and `tempoShift` logic applied to embeddings.
*Against:* a prompt that fires too often is a nag; the ×2 is tunable config.

### Q33 — Does the Studio change?

**EVIDENCE — no.** It already emits exactly what enrolment consumes — a confirmed exercise, trimmed
bounds, per-rep marks, pins — and `learner.commit`/`relabel` are the single write path, so adding
the embeddings row there covers both the Debrief and the Studio (studio design §10.3, verified
in `learner.ts`).

---

## Branch H — Licensing and the weight path

### Q34 — Replace the cloud OCR with on-device PaddleOCR?

**OPEN.** Engineering says yes: Apache 2.0, runs on the phone, and it would make "nothing leaves
the phone" literally true. But it changes a cost line (the gpt-5-nano spend), an accuracy baseline
that is itself unvalidated (marketing guardrails memory: weight reading is a vision *feature*, not
a claim), and a marketing claim. *Recommendation:* prototype it in V3 behind a flag; decide on
measured accuracy against `ground_truth.json` with `score_weights.py`; do not change the privacy
copy until it wins.

### Q35 — Any AGPL component anywhere in the stack?

**EVIDENCE — none, by construction.** The brief's licence review: MoViNet, MediaPipe, MobileNetV4
(timm), PaddleOCR are Apache 2.0; **YOLOv8/v11 are AGPL-3.0** and would oblige releasing the app's
source. The §9 table is the checklist and a licence log is a pre-ship gate.
