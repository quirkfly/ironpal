# IronPal Self-Training — Product Requirements Document

**Status:** Draft v1.2 · 2026-09-13 — design review complete (auto mode); **revised the same day for
the two founding premises (§1.4): one home gym per user, and one user's data serving the whole gym**
**Owner:** founder (solo — product, engineering, user zero)

> **Decisions from the design review are in
> [`ironpal-self-training-prd_grilled.md`](ironpal-self-training-prd_grilled.md) (Q1–Q26) and are
> folded in below.** The review ran **without user interaction**: 15 decisions rest on evidence in
> the repo, 15 are assumptions tagged for veto, 5 are open (data-sharing legal basis, the gym
> partnership and its reward, monetisation, marketing claims — §15). Read the ledger's "worth a
> veto" list before building on §8.2's thresholds or §6.5's gym pack.
**Working title of the feature:** *Campaign* (the gamified self-training mode)
**Supersedes:** the centralised-training path in
[`ironpal-supervised-learning-phase-plan.md`](ironpal-supervised-learning-phase-plan.md) (Track B as a
founder-trained, shipped model) and decision **Q1** of
[`ironpal-poc-v1_grilled.md`](ironpal-poc-v1_grilled.md) ("end users never enroll").
**Builds on:** [`ironpal-poc-v1-design.md`](ironpal-poc-v1-design.md) (enrollment templates, on-device
matcher, RN app in `poc/mobile/`), [`video-analysis-kb/ontology.json`](video-analysis-kb/ontology.json)
(37 Tier-1 exercises with `rep_signal` / `head_motion_class`),
[`ironpal-essential-exercise-video-capture-plan.md`](ironpal-essential-exercise-video-capture-plan.md)
(the capture protocol this feature turns into gameplay),
[`ironpal-poc-to-production-transfer.md`](ironpal-poc-to-production-transfer.md) (calibration ritual,
canonical data form).

---

## 0. One-paragraph summary

IronPal cannot afford to collect and label a multi-gym training set. Instead, **every user trains
their own IronPal.** The user records their own sets with the headband (camera + IMU), the app
proposes labels (exercise, set boundaries, rep marks, weight), the user confirms or corrects them in
a short tagging round during the rest period, and every confirmed set is folded **incrementally** into
a **model that lives only on that user's phone**. Because this is tedious if presented as a chore, it
is presented as a game: a first-person campaign whose "first-person view" is literally the headband
camera, whose targets are plates and pin stacks, whose hits are reps, and whose levels are exercises
that the user *certifies* by recording enough clean, correctly-tagged sets. The reward for finishing a
level is real: that exercise is now recognised, counted and logged automatically in live workouts.
Because each user trains at one home gym, the equipment-side knowledge one committed user builds
there (which machines, which stacks, which plates, what they look like from the headband) is
packaged as a **gym pack** that every other member of that gym starts from — and the user who built
it, the **Scout**, is rewarded when the gym adopts it (§1.4, §6.5).

---

## 1. Background — why self-training

### 1.1 What changed

The supervised-learning plan assumed the founder captures ~13 gym sessions, labels them (with Claude
pre-labelling), and distils a small on-device model that ships to everyone. Two things make this
untenable for a solo founder:

1. **Coverage.** One lifter, one gym, one rig fit produces a model that generalises to one lifter.
   The POC's own grilling (Q2) already flagged cross-user generalisation of head-IMU templates as the
   central risk; the honest fix is per-user data, which a central pipeline cannot collect.
2. **Cost and time.** Capturing, labelling and re-labelling every exercise, and every variant, is
   weeks of one person's time per iteration, and it never ends — the long tail of exercises is long.

### 1.2 What already exists and is reused

| Asset | Where | Role in self-training |
|---|---|---|
| Enrollment mode: record a take, extract a tempo/amplitude/orientation-invariant feature vector + resampled IMU window, store as a template | `poc/mobile/src/controller/useEnroll.ts`, native `SignalModule`/`Dsp.kt` | Becomes the user-facing recording step. Today it is founder-only (Q1); this PRD opens it to every user. |
| On-device matcher: kNN on features + normalised DTW on the window, reject threshold → UNKNOWN | `Dsp.matchAgainstTemplates`, `fusion/fusion.ts` | **Is the model.** Instance-based, so "incremental update" = append a template — no gradient training on the phone. |
| Motion gate (energy + periodicity), rep peak detection | `SignalModule.runLiveTick` | Provides the automatic proposals the user confirms. |
| Confirm/correct screen: detected vs corrected values | `screens/ConfirmCorrectScreen.tsx` | The 1-tap confirm loop, expanded into the tagging round. |
| Headband IMU over BLE (Nano 33 BLE Rev2, 60 Hz, ±8 g / ±1000 dps, 0 seq gaps) fed into the same ring buffer as the phone IMU | `poc/firmware/`, `BleImuSource.kt` | Sensor source; no DSP change needed. |
| Exercise ontology, 37 Tier-1 entries with `rep_signal`, `head_motion_class`, `egocentric_visibility`, `weight_read_strategy` | `docs/video-analysis-kb/ontology.json` | Defines what a level *can* teach (§5) and the label vocabulary. |
| Staging-glance habit, two-weights-per-exercise, 60 s settle, three nods | capture plan §2 | Turned into mission mechanics. |
| Weight OCR via a single cloud call on a still frame, deleted after inference | design D3, marketing guardrails | The "headshot" check on the staging glance. |
| Scorers: weight (four-state, confident-wrong gate) and reps (±1 range bar) | `scripts/kb/score_weights.py`, `score_reps.py` | The same rules become the in-app quality gates. |

### 1.3 The claim this PRD makes

**A per-user, instance-based model trained by the user's own confirmed sets will recognise and count
that user's exercises better than any founder-trained shared model could**, for every exercise where
the head IMU carries the signal. For exercises where it does not (head-still arm work), self-training
still buys per-user visual exemplars and per-user weight priors, but it cannot buy rep certification,
and the game must not pretend otherwise (§5.3).

---

### 1.4 The two founding premises

The initiative rests on two premises stated by the founder, and the design has to be honest about
what each one buys.

**Premise 1 — a user trains at the same gym, consistently.** The environment is controlled and
familiar: the same stations, stacks, plate sets, lighting and floor. Self-training therefore does not
have to generalise across gyms at all; it has to get *this* gym right, and it gets many repeated
looks at it.

**Premise 2 — many other members of that gym can profit from user A's data.** The first member who
plays through the campaign at a gym leaves behind an accurate map of that gym's equipment as seen
from a headband. Every later member should start from that map instead of from zero.

**The reward.** When adoption at the gym happens, user A is awarded a discount on their gym
membership or a comparable benefit, so that continuing to contribute high-quality labelled data is
in their interest.

**What actually transfers from user A to user B — and what does not.** This is the design-critical
split, and the repo already contains the evidence for it:

| Channel | Transfers across bodies at the same gym? | Why |
|---|---|---|
| **Equipment atlas** — which stations exist, what each looks like from the headband, stack label layout and increment per machine, plate inventory and colours, dumbbell rack labels | **Yes, strongly.** | This is a property of the *gym*, not the lifter. It is exactly what the weight-reading procedures need (`weight-reading.md`: count empty holes, per-rig calibration note) and what the vision arbiter needs for exercise ID. |
| **Visual exemplars per station** (cropped implement/stack frames, never wide frames) | **Yes.** | Same machine, same paint, same angle range from a headband. |
| **Weight priors per station** (the typical loads members use) | **Weakly** — as a prior only. | Loads are personal; the pack carries the distribution, not a value. |
| **IMU fingerprints** | **No, not as truth.** | `ironpal-supervised-learning-phase-plan.md` §1.2b: an IMU trace "is a property of the human movement, not the paint on the machine". Cross-body IMU generalisation is the risk the POC flagged (Q2). User A's IMU templates can serve user B only as **pooled priors**, exactly like the founder's. |

So premise 2 is **true for the equipment and weight side, and only a prior for the rep-counting
side**. The gym pack (§6.5) is built on that split; the game's Scout mechanic (§8.6) rewards the part
that genuinely transfers.

---

## 2. Goals and non-goals

### 2.1 Goals

- **G1 — Zero central training.** No IronPal-run labelling pipeline is required for a user to get a
  working recogniser for their exercises.
- **G2 — Personal, local-first, incremental model.** The model is on the phone, improves with each
  confirmed set, can be inspected, exported and deleted by the user. Nothing leaves the phone except
  what the user explicitly contributes to their gym's pack (G7), in reduced form.
- **G7 — One member's work serves the whole gym.** A Scout's equipment atlas becomes the gym pack
  every later member at that gym starts from, so their first session already knows the stations,
  stacks and plates.
- **G8 — The Scout is rewarded for adoption, not for volume.** The incentive triggers on other
  members actually using the pack, which is what makes it an incentive for *quality*.
- **G3 — Labels at source, verified not authored.** The app proposes; the user confirms or corrects.
  A tagging round for one set takes well under a minute and fits inside a normal rest period.
- **G4 — Real payoff per level.** Finishing an exercise's level turns on automatic recognition for it
  in live workouts. Progress in the game is progress in the product.
- **G5 — Honest progression.** The game never awards a certification the sensors cannot back. Where
  reps cannot be certified from the headband, the level says so and rewards what *can* be learned.
- **G6 — Safety first.** Nothing in the game asks the user to look at, touch or think about the phone
  while under load.

### 2.2 Non-goals (v1)

- Form analysis / coaching feedback (future; the labelled data enables it).
- Social features: leaderboards, friends, sharing runs. (The gym pack is infrastructure, not a social
  feature: members never see each other's sets, names or progress.)
- Cross-gym generalisation. Premise 1 means a user's model is for their home gym; a second gym is a
  second campaign map, seeded by that gym's pack if one exists.
- Training a neural network on the phone. v1's model is the template store (§6). A distilled
  classifier trained *from* the template store is a v2 option.
- Custom exercises outside the 37 Tier-1 ontology entries (v1.1 — §5.4).
- Any 3D rendered game world. The first-person view is the real camera.
- Replacing the founder's own capture programme. The three-visit capture plan still runs — as the
  first playthrough of this feature (§13).

---

## 3. Users

| Persona | Who | What they need from self-training |
|---|---|---|
| **User zero** | the founder | Dogfood the loop on all 37 Tier-1 exercises; produce the founder template pack that ships as cold-start priors. |
| **Committed lifter** (primary) | trains 3–5×/week, follows a programme, already logs sets manually in an app like Fitbod | Stop typing sets. Willing to invest a few sessions if the payoff is automatic logging that is *right*. Will abandon if tagging feels like data entry. |
| **Beta tester** | 2–3 gym acquaintances on their own phones + a loaned headband | Same as above; additionally the source of cross-user evidence. |
| **Scout** (user A) | the first committed lifter at a gym to play through the campaign — the founder at gym #1 | Wants their work to count beyond themselves and to be rewarded for it. Needs visible adoption progress and a reward that is real, not points. |
| **Follower** (user B…N) | later members at the same gym | Wants day-one accuracy on the machines they use. Does not want to know or care who the Scout is. |
| **Gym operator** (stakeholder, not a user) | owner/manager of the gym | Must consent to headband capture on the premises (a blocking requirement already in the supervised plan §1.2) and is the counterparty for the membership discount. |

**What the primary persona will not tolerate:** being made to record sets that do not count as
training, being asked to hold a phone mid-set, a game that awards points for junk, and a
"certified" exercise that then miscounts.

---

## 4. Constraints

- **C1 — Solo founder.** Everything must be buildable by one person in the existing React Native +
  Kotlin app. No new engine, no new backend service beyond the existing FastAPI.
- **C2 — Hardware.** Headband camera + IMU; phone in pocket or on a bench. In the POC the phone's own
  IMU or the BLE Nano supplies motion; the production module supplies both camera and IMU wirelessly
  (BLE control/telemetry, Wi-Fi bulk — `ironpal-wireless-offload-plan.md`). The feature must work
  across all three capture sources through the existing ring-buffer abstraction.
- **C3 — Offline-first.** Recording, tagging, model update and gameplay work with no network. Only
  weight OCR uses the cloud, asynchronously, and it is never on the critical path.
- **C4 — Privacy.** Video never leaves the phone. One cropped still per staging glance may go to the
  backend for OCR and is deleted after inference (design D3). Bystanders are in a 200° fisheye's
  frame by default — the app must make retention short and visible.
- **C5 — Ontology is the vocabulary.** Every label resolves to an `ontology.json` entry; `rep_signal`
  decides what a level can certify.
- **C6 — No third-party game IP.** Counter-Strike and Wolfenstein are *genre* references for the
  brief only. No names, assets, sounds, fonts or level designs from them may appear in the product or
  its marketing.
- **C7 — Marketing guardrails.** The feature may be described as "learns your exercises"; weight
  reading remains a vision-assisted, confirm-when-unsure feature and is never claimed as fully
  automatic. Privacy claims stay "one frame to the cloud, deleted", never "no cloud".
- **C8 — Gym identity without equipment instrumentation.** A gym is identified by the user's choice
  plus a location check at session start. No QR codes, no stickers, no per-machine tagging — the
  original no-instrumentation constraint stands at gym level too.
- **C9 — Contributions are consented and reduced.** Only a Scout who has opted in contributes, and
  only in the reduced form (§6.5): cropped implement/stack frames and derived calibrations, never
  clips, never wide frames, never anything a bystander could be identified from.

---

## 5. What a level can teach — the honest map

The single most important design input is the ontology's `rep_signal` column. It fixes what the
user's own data can and cannot certify, per exercise. The game's campaigns are built directly on it.

### 5.1 Tier-1 by sensor class

| `rep_signal` | Count | Exercises | What self-training certifies |
|---|---|---|---|
| `imu` | 13 | back squat, front squat, deadlift, RDL, goblet squat, Bulgarian split squat, walking lunge, hack squat, standing calf raise, pull-up, chin-up, dip, push-up | **Exercise + reps** from the head IMU alone. Full certification. |
| `fusion` | 2 | overhead press, hip thrust | Exercise from IMU; reps from IMU with vision cross-check. Full certification with a confirm prompt when the two disagree. |
| `vision` | 20 | the pressing, rowing, curling and raising family; leg press, leg extension, lat pulldown, cable rows/curls/raises, machine chest/shoulder press | **Exercise identification support** (per-user visual exemplars + head-motion prior) and **weight prior**. Reps stay vision-led with a user confirm. |
| `hard` | 2 | triceps cable pushdown, seated leg curl | Exercise and weight only. **Reps cannot be certified from a headband**; the level says so up front. |

### 5.2 Consequence: three campaigns, not one list

- **Campaign 1 — "Ground game"** (13 `imu` + 2 `fusion`): the flagship. Every level ends with a
  fully automatic exercise. This is where the pitch "it learns you" is literally true.
- **Campaign 2 — "Arms"** (20 `vision`): levels reward the staging glance (weight), the per-user
  exemplar set (exercise ID) and the user's declared rep count as ground truth for the vision path.
  Certification here means "recognised and weight-primed", not "counted by the headband".
- **Campaign 3 — "Black ops"** (2 `hard`): explicitly framed as intel-gathering. The level's brief
  states that a headband cannot count these reps and that the mission is exercise + weight only.

### 5.2b Confusability inside Campaign 1

Grouping Tier-1 by motion plane and head-motion class puts **14 of the 15 Campaign-1 exercises in
one bucket** (sagittal, head moving); pull-up is the only frontal one. The head IMU therefore has to
separate squat-pattern from hinge-pattern from press-pattern within a single family, and the
integrity check (§6.3) is run over the **whole campaign's stores**, not per exercise pair.

### 5.3 The rule the game must never break

**A level may only award a certification the sensor can back.** The `imu` badge is never shown on a
`vision` exercise. If future hardware (wrist IMU, cable sensor) moves an exercise's `rep_signal`, the
campaign map updates from the ontology, not from a game asset.

### 5.4 Custom exercises (v1.1)

Users will want exercises outside Tier-1. Allowed later via "name it, tell us if your head moves":
the user creates an entry mapped to a Tier-2 ontology row or `custom`, declares `head_motion_class`,
and the app assigns the conservative sensor class (`vision`) until a set proves periodic head motion,
at which point it may promote to `imu`. Out of v1 to keep the campaign map fixed while the loop is
validated.

---

## 6. The model — what is being trained

### 6.1 Definition

> **Superseded for exercise recognition (2026-09-17).** The recogniser is no longer a distance over
> IMU templates — it is a multimodal network over pixels, pose and IMU
> ([`ironpal-neural-model-design.md`](ironpal-neural-model-design.md)). The *per-user* part of the
> model below survives in changed form: the user's confirmed sets become 256-d embeddings and,
> above ~20 sets, an on-device LoRA adapter. Everything else in this section — exemplars, weight
> priors, rig calibration, the lifecycle, the cap, the erasure guarantees — is unchanged.

The per-user model is a **store of confirmed, labelled examples plus derived priors**, all local:

| Component | Contents | Used by |
|---|---|---|
| **IMU templates** | per confirmed set: feature vector + resampled window (both representations, design D7) + per-rep windows sliced at the confirmed rep marks | on-device matcher (exercise), rep peak-detector tuning (cadence/amplitude per exercise) |
| **Negative templates** | auto-harvested from IMU-gated REST/walk windows of the same sessions, labelled `unknown` — no user effort | the reject class (POC Q4) |
| **Visual exemplars** | per confirmed set: the staging-glance still (cropped to implement) + 3–6 IMU-selected rep-endpoint frames, downscaled | vision arbitration for head-still pairs (`sensor-fusion.md`) via nearest-neighbour against the user's own exemplars; few-shot context for the cloud recogniser |
| **Weight priors** | per exercise: the user's recent loads, per-gym stack/plate notes | pre-filling the weight field; sanity-checking OCR |
| **Rig calibration** | per session: IMU axis-to-head rotation, mount rotation, sync anchors | canonicalising every template into a rig-independent frame (`ironpal-poc-to-production-transfer.md` §4) so a new headband does not invalidate the store |

There is **no gradient training on the phone in v1.** The matcher is instance-based, so an update is
an append, is instant, cannot forget, is explainable ("matched your set from 12 May"), and is
deletable per set — which also makes GDPR erasure trivial.

### 6.2 Cold start

The founder's own template pack for the 37 Tier-1 exercises ships **inside the app binary** as
**priors** (≈ 4–5 MB: ~5 windows per exercise at 50 Hz). They give the matcher something to say on
day one ("this looks like a goblet squat — confirm?"), which makes the first tagging rounds mostly
confirmations rather than blank forms. Priors are down-weighted as the user's own templates
accumulate and are ignored once an exercise is certified (§8.2). Beta testers start *with* priors;
every proposal records whether it matched a prior or a user template, so the cross-user question the
POC still owes (its Q2) is answered from the logs, and a debug toggle can run a tester priors-off.

### 6.3 Incremental update — what happens after each confirmed set

1. Slice the set window at the confirmed rep marks; extract features; canonicalise using the session
   calibration.
2. Append the set template and the rep templates to the exercise's store.
3. Harvest negatives from adjacent REST/walk windows — **excluding any window the motion gate
   flagged as periodic**, so an untagged real set never becomes an `unknown` example.
4. **Self-consistency check (leave-one-out):** re-match every stored set in the exercise's
   **campaign** (§5.2b — for Campaign 1 that is all IMU/fusion stores) against the store without
   itself. The per-exercise agreement rate is the exercise's **integrity meter** in the game (§8.3)
   and the gate for certification. For Campaigns 2 and 3 the IMU store does not certify, so the
   meter shown there is glance + exemplar coverage; integrity is still computed for the
   exercise-ID prior.
5. If the store exceeds its cap (20 sets per exercise), drop the oldest set whose removal does not
   lower the leave-one-out agreement.
6. Bump the local model version; write the change to the audit log (what was added, what was
   dropped, resulting integrity).

Runtime cost is negligible: kNN/DTW over tens of windows on a phone is milliseconds.

### 6.4 Model lifecycle

- **Inspect:** per exercise, list of contributing sets with date, weight, rep count, integrity
  contribution; tap to replay the set.
- **Delete a set:** removes its templates and exemplars; re-runs the consistency check.
- **Reset an exercise / everything:** returns to priors.
- **Export:** JSON + IMU windows + exemplar frames, for the user or for a future rig migration.
- **Backup/restore:** the store rides along with the app's normal backup, opt-in; it never syncs to
  IronPal servers by default (§11).

---

### 6.5 The gym pack — how user A's work reaches user B

A **gym pack** is the rig-independent, body-independent part of a gym's stores, assembled on the
backend from Scout contributions and downloaded by every member who checks in at that gym.

| Pack component | Source | Used by followers for |
|---|---|---|
| **Station atlas** | one entry per machine/rack the Scout certified: ontology exercise ids performed there, `weight_read_strategy`, cropped exemplar frames of the station and its stack/plates from the headband viewpoint | exercise-ID arbitration on day one; the tagging round's top-1 proposal at that station |
| **Weight-reading calibration per station** | stack label layout and increment (count-empty-holes reference), plate inventory and colour code, dumbbell rack labels, bar weights | pre-filling and sanity-checking the weight; fewer OCR abstentions on a known stack |
| **Weight prior per station** | distribution of confirmed loads (binned, no user ids) | pre-fill |
| **Pooled IMU priors** | Scout's certified IMU templates, canonicalised, anonymised, **flagged as priors** | the same role the founder's priors play — down-weighted from the follower's first own set, retired at Certified |
| **Pack metadata** | gym id, version, contributing-scout count, per-station quality score, last update | precedence and refresh |

**Precedence on a follower's phone:** own store → gym pack → founder priors. A follower's own
confirmed set at a station always outranks the pack; the pack never overwrites a user's data.

**What the pack never contains:** video clips, wide frames, faces, timestamps that place a person
at the gym, user identifiers, or any IMU window labelled as *truth* for someone else.

**Assembly.** Contributions arrive per certified station as reduced-form bundles (C9). The backend
merges by station: exemplars are deduplicated, calibrations must agree (a disagreement between two
Scouts on a stack's increment flags the station for review rather than averaging), quality score =
the Scout's integrity and glance coverage at that station. Multiple Scouts per gym are normal; credit
is proportional to accepted contributions per station.

**Refresh.** Members pull the pack on check-in when its version changed. A Scout's later corrections
at a station (a re-labelled machine, a new plate set) propagate as a new pack version; followers'
own stores are untouched.

**Why this is not "federated learning".** Nothing is averaged into a shared model; the pack is a
catalogue of the gym plus priors. That keeps it explainable, deletable per contribution, and inside
the same instance-based design as §6.1.

---

## 7. The core loop

Everything below happens inside one gym session. One iteration ≈ one set.

```
BRIEF ──► ARM ──► FIRE (the set) ──► DEBRIEF (tagging round) ──► SCORE ──► UPDATE ──► next set
 (choose     (staging   (audio-only     (rest period:               (quality    (append +
  level /     glance;    HUD; no phone)   confirm proposals)          gates)      integrity)
  set)        crosshair)
```

### 7.1 BRIEF — choose what to record

The campaign map shows exercises grouped by campaign with their state (§8.2). The user picks a level
(exercise) and the app shows the mission card: what will be recorded, what the sensors can certify,
how many clean sets remain to certify, and the two-weights requirement. Fits on one screen; no
reading required after the first time.

### 7.2 ARM — the staging glance

The user racks/loads/pins the weight, then does the **staging glance**: ~2 s, still, face-on at the
plate face, dumbbell head or pin. In the game this is *aiming*: the app confirms "target acquired"
with a sound and a haptic when the IMU reports stillness and the camera reports a sharp frame (the
existing sharpest-still selection). The sharpest still is captured for OCR and for the exemplar
store. **No phone touch happens here** — the weight is declared in the debrief (§7.4), pre-filled
from the weight prior and from OCR once it has arrived.

The glance is the highest-value two seconds of the whole protocol — it is the only frame weight
reading can use, and it marks the set boundary in the video.

A *live* first-person preview during ARM exists only on the production module (preview over Wi-Fi).
On the POC rigs the cue fires without a preview; on the ShenYao rig the app never sees the video
until ingest, so the debrief there is trace-only.

### 7.3 FIRE — the set

Phone in pocket or on the bench. **No screen interaction.** Feedback is audio and haptic only:

- a "hit" tick per detected rep (IMU-class exercises; vision-class exercises give a neutral tick per
  detected motion cycle, clearly labelled in the brief as unverified);
- a distinct cue when the motion gate opens (set started) and closes (set ended);
- an alert if the IMU link drops or the band slips (accelerometer saturation / orientation jump).

Rep audio can be muted per user preference; the mission still records.

### 7.4 DEBRIEF — the tagging round

Opens automatically when the motion gate closes and stays quiet if the user is not looking. Target:
**≤ 20 s median for a clean set.**

The screen is the just-recorded set as a first-person replay with the IMU trace underneath — the
Label-Studio half of the brief, reduced to four questions the app has already answered:

| Question | App's proposal | User action |
|---|---|---|
| **Which exercise?** | best match from the store/priors, with the confusable neighbour as the alternative | tap to confirm, or pick the alternative / search |
| **Where is the set?** | motion-gate boundaries with ±10 s pre/post roll | drag the handles only if wrong |
| **How many reps?** | IMU peak count, with rep marks drawn on the trace and the replay | confirm; or type the number; or tap a proposed mark to toggle it off/on |
| **What weight?** | pre-filled from the weight prior; OCR shown only after the user has entered a value, and only if it disagrees | confirm; if OCR disagrees, both values are shown and the user picks |

Rep marks use one frozen convention: **the top of the rep** (lockout / top of the looming cycle).
**v1 has no free placement of new marks** — the detector's peaks can be toggled, or the count typed.
If dogfood shows the detector missing more than 5 % of real peaks on `imu` exercises, "add mark at
playhead" is the first thing added.

"Unreadable" and "not sure" are first-class answers for weight and reps; they never block the set
from counting toward the exercise level, they only withhold the corresponding bonus.

### 7.5 SCORE — quality gates

A set **counts** toward certification only if it passes the gates. Gates are the scorers' rules,
applied live:

| Gate | Rule | Source |
|---|---|---|
| Motion | motion gate open ≥ 3 cycles, periodicity above threshold | `SignalModule` |
| Link | `seq_gaps = 0`, no saturation during the set | `BleLinkInfo` |
| Rep agreement (`imu`, `fusion`) | IMU count within ±1 of the confirmed count; exact match earns the bonus | `score_reps.py` bar |
| Glance | a still, sharp implement frame exists | `CameraModule` |
| Weight (bonus only) | OCR reads and agrees with the declared weight, within one plate increment | `score_weights.py` rules |
| Rig | calibration ritual done this session; rotation recorded | transfer doc §5 |

A failed gate shows *why* ("no staging glance — the camera never saw the weight") and offers a redo.
No points are lost; the set simply does not count. Failed sets are still kept for the user's log.

### 7.6 UPDATE

The confirmed set is folded in (§6.3). The exercise's integrity meter moves. If a threshold is
crossed the level state changes (§8.2) and, for a certification, the app says what just changed in
the product: "Goblet squat is now recognised automatically."

---

## 8. Game design

### 8.1 Metaphor mapping — where the FPS framing is literal

| Game element | What it actually is |
|---|---|
| First-person view | the headband camera's real footage (live preview during ARM; replay during DEBRIEF) |
| Crosshair / "aim" | the staging glance on the weight |
| Target | plates, dumbbell heads, pin stacks — never people |
| Hit marker | one detected rep |
| "Headshot" | OCR read of the glance agrees with the declared weight |
| Magazine | the sets planned for this level today; "reload" is the rest period |
| Level | one exercise |
| Campaign | one sensor class (§5.2) |
| Boot camp | first session: rig calibration ritual + one tutorial level |
| Rank | overall XP tier (cosmetic) |
| Integrity meter ("armour") | leave-one-out agreement of the exercise's template store |
| Hard mode | sets recorded under a different rig fit — detected as a ≥ 10° change in the calibration ritual's axis-to-head rotation from the store's median, or self-declared until the ritual is validated on hardware |
| Mission failed | a quality gate failed, with the reason |

No 3D world, no enemies, no violence: the shooting vocabulary is aimed at iron.

### 8.2 Level states — the progression that matters

| State | Entry condition | Effect in live workouts |
|---|---|---|
| **Locked** | — | not recognised (matches the reject class) |
| **Recon** | 1 clean set confirmed | proposals only; the exercise appears as a suggestion in the tagging round |
| **Provisional** | 3 clean sets, integrity ≥ 0.8 | recognised live; **always asks to confirm** |
| **Certified** | 5 clean sets at ≥ 2 different weights, integrity ≥ 0.9, priors no longer needed | recognised and counted live; auto-logged above the confidence threshold, confirm only on doubt |
| **Veteran** | certified + 3 sets across ≥ 2 sessions with different rig fits (hard mode) | as certified, with the widest tolerance |

The set counts come from the capture programme (5 sets per exercise, two weights). The integrity
bars are **assumptions**: 0.80 sits well above the matcher's reject line (0.45) and 0.90 above its
high-confidence line (0.70), so a certified store clears the live thresholds with margin — but no
integrity distribution has been measured yet. **P0 must publish the measured distribution before
these numbers are trusted**; if Campaign-1 integrity clusters near 0.7, the bars move, not the loop.

Certification can be **lost**: if live workouts produce two corrections in a row on a certified
exercise, it drops to Provisional and the app asks for one confirming set. The game says "integrity
compromised — one set to restore", never "you lost".

### 8.3 Economy

- **XP** is awarded only for sets that pass the quality gates. Base XP per clean set; bonuses for
  exact rep agreement, a headshot (OCR agreement), a new weight, a new rig fit, a new session.
- **No penalties, no streak loss, no timers during a set, no purchases, no loot.** The only
  time-boxed element is the tagging round, and it can be deferred to end-of-session.
- **Ranks** are cosmetic. **Certifications** are the real reward and are shown on the live HUD.
- **Daily/weekly missions** nudge coverage the store needs (e.g. "record a second weight for
  deadlift", "one hard-mode session"): they are generated from the store's gaps, not from a calendar.

### 8.4 Audio and haptics

Because the set is screen-free, the sound design carries the in-set experience: gate-open,
hit, gate-close, link-lost, and target-acquired must be distinguishable with gym headphones on and
each must have a haptic twin on the phone (and on the headband module when it gains a motor).
Volume follows the phone's media volume; all cues are optional.

### 8.5 Boot camp (first session)

1. Pair the headband, check the link (MTU, gaps).
2. **Calibration ritual** as a tutorial: six static holds of the band ("calibrate armour"), three
   sharp nods ("sync"), a checkerboard/ArUco card from the box at arm's length ("zero the scope"),
   a known plate at a marked distance ("range check"). ~60 s, gamified with the same cues.
3. One tutorial level from Campaign 1 chosen by the user (any `imu` exercise), one set, one tagging
   round, one integrity reveal.

The calibration ritual repeats at the start of every session (shortened: nods + holds), because it
is what keeps the store valid across rig changes.

### 8.6 Territory — the Scout mechanic

The gym is the map; its stations are the territory. This is the one place the game reaches beyond a
single player, and it does so without ever showing one member to another.

| Element | What it is |
|---|---|
| **Check-in** | choosing the gym (C8) at session start; the map shows this gym's stations |
| **Uncharted station** | no pack entry yet — the first member to certify an exercise there **charts** it |
| **Charting** | opting in as Scout and contributing that station's reduced-form bundle (§6.5) after certifying it; one tap after the level's certification screen, with the "what leaves the phone" summary shown every time |
| **Charted station** | pack entry exists; followers see it as pre-mapped — their tagging rounds start with the Scout's proposals |
| **Adoption meter** | per gym, per Scout: how many *verified* other members have used the pack in ≥ 3 sessions in the last 30 days. Shown to the Scout as territory held; shown to nobody else |
| **Reward tiers** | adoption thresholds at which the Scout's benefit is unlocked (§9.8); the benefit itself is external and conditional (§15) |
| **Scout rank** | cosmetic tier from stations charted × adoption; never gates a feature |

**Verified member** = a session captured with IronPal headband hardware inside the gym's location
check, on an account with its own device. This is what makes the meter hard to inflate (R13).

**Followers are never asked to become Scouts** until they have certified at least one exercise
themselves; the offer is then a single, dismissible prompt per station.

---

## 9. Functional requirements

### 9.1 Capture

- **FR-C1** Record IMU at the canonical rate from any source (phone, BLE Nano, production module)
  through the existing ring buffer; store both device and host clocks.
- **FR-C2** Record video **per set only**: from ARM (glance) to gate-close plus pre/post roll, when the
  app owns the camera. When it does not (ShenYao path), record continuously and segment at ingest.
- **FR-C3** Capture the sharpest still during the staging glance; fire the target-acquired cue from
  IMU stillness + on-device sharpness (no preview required); use a live preview only where the rig
  provides one (production module).
- **FR-C4** Detect link loss, saturation and orientation jumps during a set and mark the set.
- **FR-C5** Pre-check free storage and battery at session start; show remaining recording time.
- **FR-C6** Run the per-session calibration ritual and store its outputs in the session metadata.

### 9.2 Tagging round

- **FR-T1** Show the set replay (where the rig provides the file) with the IMU trace and proposed
  rep marks; scrub by dragging the trace; marks are toggleable, not freely placeable (v1).
- **FR-T2** Propose exercise (top-1 + confusable alternative), set boundaries, rep count/marks and
  weight; all confirmable in one tap each; a single "all correct" tap when nothing changed.
- **FR-T3** Support "unreadable" / "not sure" for weight and reps.
- **FR-T4** Allow deferring the round to end-of-session; queue rounds in order.
- **FR-T5** Never require the round to be completed to start the next set.
- **FR-T6** Show the weight OCR result when it arrives (async) and reconcile: if it agrees, award the
  bonus silently; if it disagrees, ask once.

### 9.3 Model

- **FR-M1** Append confirmed sets as templates (set + rep windows), canonicalised; harvest negatives
  from non-periodic REST/walk windows only.
- **FR-M2** Compute leave-one-out integrity per exercise after every update, over all stores in the
  same campaign.
- **FR-M3** Apply level-state transitions from integrity and set counts (§8.2), both up and down.
- **FR-M4** Ship founder priors; down-weight and retire them per §6.2.
- **FR-M5** Cap the store per exercise; prune without lowering integrity.
- **FR-M6** Inspect, delete per set, reset per exercise/all, export, opt-in backup.
- **FR-M7** Keep an audit log of model changes readable by the user.

### 9.4 Game

- **FR-G1** Campaign map from the ontology: three campaigns, level states, integrity meters.
- **FR-G2** Mission card per level with the honest certification statement for its sensor class.
- **FR-G3** XP, bonuses, ranks and generated missions per §8.3; no purchases, no penalties.
- **FR-G4** Audio/haptic cue set per §8.4 with a settings screen to audition and mute each cue.
- **FR-G5** Boot camp flow per §8.5; calibration is mandatory, the tutorial level is skippable.

### 9.5 Live-workout integration

- **FR-L1** The live HUD uses the user's store first, priors second, and honours level states: no
  auto-logging below Certified.
- **FR-L2** Every live correction is a labelled example: it enters the store like a confirmed set
  (after the same gates) and can demote a certification (§8.2).
- **FR-L3** A live set on a Locked exercise is offered as a Recon set for that level ("this looked new
  — tag it?").

### 9.6 Data, privacy, retention

- **FR-D1** Video stays on the phone. Per-set clips are kept until the tagging round is confirmed plus
  7 days, then reduced to the exemplar frames + IMU windows unless the user pins the clip.
- **FR-D2** Only the cropped staging still is sent for OCR; it is deleted server-side after inference;
  the app shows a "what leaves the phone" screen with exactly this.
- **FR-D3** Storage cap for the feature (default 2 GB) with oldest-first reduction and a visible meter.
- **FR-D4** Export and delete everything (templates, exemplars, clips, progress) from one screen.
- **FR-D5** No upload of a user's templates, exemplars or clips to IronPal **except** a Scout's
  opt-in, per-station, reduced-form contribution to their gym pack (FR-P4). The contribution is the
  only egress besides the OCR still, and the app's "what leaves the phone" screen lists both. The
  legal basis and consent text for contributions are open (§15); until settled, the contribution
  path ships behind a server-side flag, off.

### 9.7 Gym pack

- **FR-P1** Gym selection at session start with a location check; a gym record is created on first
  use; no equipment tagging of any kind.
- **FR-P2** Download the gym pack on check-in when its version changed; work fully offline with the
  cached pack.
- **FR-P3** Apply precedence own store → gym pack → founder priors in the matcher, the vision
  arbiter and the weight pre-fill; a pack entry never overwrites a user's own data.
- **FR-P4** A Scout contributes per certified station, opt-in, in reduced form only (C9), with the
  "what leaves the phone" summary shown at every contribution; contributions are revocable and
  revocation removes them from the next pack version.
- **FR-P5** Backend assembly per §6.5: merge by station, flag calibration disagreements for review,
  score quality, version the pack, keep credit per Scout per station.
- **FR-P6** A user may belong to several gyms; each has its own campaign map and pack; the user's
  IMU stores are shared across gyms (they are about the body), the atlas is not.

### 9.8 Scout incentive

- **FR-S1** Compute the adoption meter per gym per Scout from verified sessions only (§8.6).
- **FR-S2** Reward tiers are configuration, not code; defaults 5 / 20 / 50 verified adopters.
- **FR-S3** When a tier is reached, notify the Scout and record an eligibility event with the gym id;
  **fulfilment of the reward is external to the app** and depends on the gym agreement (§15).
- **FR-S4** Anti-fraud: one account per device per headband; sessions without a location check do not
  count; adoption by accounts created from the Scout's device or network does not count; the meter
  is recomputed, never incremented.
- **FR-S5** A Scout can see their adoption meter and eligibility history; nobody can see who adopted.

### 9.9 Accessibility and safety

- **FR-A1** Every audio cue has a haptic equivalent; every colour state has a shape/label.
- **FR-A2** No interaction is required within 5 s of gate-close; the debrief waits.
- **FR-A3** Text on the mission card is readable at arm's length on a bench (large type mode).

---

## 10. Non-functional requirements

| Area | Requirement |
|---|---|
| Latency | hit cue ≤ 150 ms after the IMU peak; target-acquired ≤ 500 ms after the still is detected; tagging round opens ≤ 1 s after gate-close |
| Model update | append + integrity check ≤ 2 s on a mid-range 2021 Android phone (Galaxy A52 class) |
| Battery | ≤ 25 % phone drain per hour in a session with BLE IMU and per-set video |
| Storage | per-set clip ≤ 200 MB at capture; reduced to ≤ 2 MB after the retention window |
| Reliability | a crash loses at most the current set; the store is transactional (SQLite) |
| Offline | all of §7 with the network off; OCR queued |
| Privacy | no frame persists on the server; no video leaves the phone; auditable in the app |

---

## 11. Data model (local, extends the POC schema)

```sql
-- user-authored templates; the POC `templates` table becomes the priors table
CREATE TABLE user_templates (
  id TEXT PRIMARY KEY, exercise_id TEXT NOT NULL,        -- ontology id
  labeled_set_id TEXT NOT NULL, kind TEXT CHECK (kind IN ('set','rep','negative')),
  feature_vector TEXT NOT NULL, imu_window TEXT NOT NULL, -- canonical frame, JSON
  rig_id TEXT, created_at INTEGER, model_version INTEGER
);
CREATE TABLE labeled_sets (
  id TEXT PRIMARY KEY, session_id TEXT, exercise_id TEXT,
  t_start REAL, t_end REAL, rep_marks TEXT,               -- confirmed rep tops (s)
  reps_confirmed INTEGER, reps_detected INTEGER,
  weight_declared REAL, weight_unit TEXT, weight_ocr REAL, weight_ocr_conf REAL,
  weight_state TEXT CHECK (weight_state IN ('confirmed','unreadable','unsure')),
  gates_json TEXT, counted INTEGER,                        -- passed all gates?
  clip_path TEXT, clip_state TEXT CHECK (clip_state IN ('full','reduced','pinned','deleted')),
  created_at INTEGER
);
CREATE TABLE exemplar_frames (
  id TEXT PRIMARY KEY, labeled_set_id TEXT, role TEXT CHECK (role IN ('glance','rep_top','rep_bottom')),
  t REAL, path TEXT, width INTEGER, height INTEGER
);
CREATE TABLE weight_priors (exercise_id TEXT, gym_id TEXT, weight REAL, unit TEXT, last_used INTEGER);
CREATE TABLE sessions (
  id TEXT PRIMARY KEY, started_at INTEGER, rig_id TEXT, imu_source TEXT,
  calibration_json TEXT, rotation_deg INTEGER, seq_gaps INTEGER, free_space_ok INTEGER
);
CREATE TABLE level_progress (
  exercise_id TEXT PRIMARY KEY, state TEXT, clean_sets INTEGER, distinct_weights INTEGER,
  integrity REAL, xp INTEGER, last_change INTEGER
);
CREATE TABLE model_audit (id INTEGER PRIMARY KEY, at INTEGER, exercise_id TEXT, change TEXT, integrity_after REAL);

-- gym pack (local cache of the downloaded pack + this user's contributions)
CREATE TABLE gyms (id TEXT PRIMARY KEY, name TEXT, lat REAL, lon REAL, pack_version INTEGER, checked_in_at INTEGER);
CREATE TABLE gym_stations (
  id TEXT PRIMARY KEY, gym_id TEXT, exercise_ids TEXT, weight_read_strategy TEXT,
  calibration_json TEXT,                                   -- stack layout/increment, plate set, bar weight
  weight_prior_json TEXT, quality REAL, pack_version INTEGER
);
CREATE TABLE gym_station_exemplars (id TEXT PRIMARY KEY, station_id TEXT, role TEXT, path TEXT);
CREATE TABLE contributions (                               -- this user's Scout contributions
  id TEXT PRIMARY KEY, gym_id TEXT, station_id TEXT, exercise_id TEXT,
  bundle_hash TEXT, state TEXT CHECK (state IN ('pending','accepted','rejected','revoked')),
  submitted_at INTEGER
);
```

Backend (PostgreSQL) gains `gyms`, `gym_packs` (versioned blobs), `station_contributions`
(Scout, station, bundle, review state), `adoption_events` (verified sessions per gym per account, no
content) and `scout_eligibility` (gym, scout, tier, reached_at). Contribution bundles contain the
reduced form only and are deleted when revoked.

The backend's `session_sets` table (detected vs corrected, device metadata) continues to receive
**metrics only** (no windows, no frames) so the founder can measure the feature (§12) without
receiving user data. Each proposal also records whether it matched a prior or a user template, so
cross-user generalisation of the priors is measurable from metrics alone.

---

## 12. Success metrics

| Metric | Target (dogfood → beta) | How measured |
|---|---|---|
| Clean sets per session | ≥ 8 | `labeled_sets.counted` |
| Tagging round duration, median | ≤ 20 s (clean set) | app timing |
| "All correct" rate on proposals | ≥ 60 % by a user's third session | tagging events |
| Rep agreement on `imu` exercises | ≥ 90 % within ±1; ≥ 70 % exact | detected vs confirmed |
| Confident-wrong (weight, reps) | **0** | scorer rules applied to live sets |
| Sessions to certify a Campaign-1 exercise | ≤ 2 | `level_progress` |
| Live recognition accuracy on certified exercises | ≥ 95 % exercise, ≥ 90 % reps exact | corrections in live mode |
| Certifications lost per 100 live sets | ≤ 2 | demotion events |
| 30-day continuation of the loop | ≥ 40 % of activated users still tagging | sessions |
| Phone battery per hour | ≤ 25 % | measured on the A52 |
| Follower day-one uplift (gym #1) | "all correct" rate in a follower's first session ≥ 2× a no-pack baseline; weight abstentions on charted stacks ≤ ½ baseline | P4 A/B: testers with and without the pack |
| Stations charted at gym #1 | all Tier-1 stations present at the gym | pack metadata |
| Adoption at gym #1 | ≥ 5 verified adopters within 60 days of the pack existing (tier 1) | `adoption_events` |
| Scout retention | the Scout still contributes corrections 60 days after charting | `contributions` |

---

## 13. Rollout

Solo-founder sizing; each phase ends with the founder using it in a real session.

| Phase | Scope | Exit | Effort |
|---|---|---|---|
| **P0 — user-authored model** | open Enroll to all roles; store templates locally; canonicalise; negatives; integrity check; level states without UI polish | founder certifies 3 `imu` exercises at home with the phone IMU | ~2 weeks |
| **P1 — tagging round** | per-set clip recording (own camera path), replay + trace + rep marks, four-question debrief, quality gates, OCR reconcile | one full gym block tagged in-app, ≤ 20 s median | ~3 weeks |
| **P2 — game layer** | campaign map, mission cards, XP/bonuses, audio/haptics (new small RN sound + haptic libraries; no engine), boot camp, integrity meter, demotion | the three-visit capture plan is played in its fixed visit order: Visit 1 = Campaign 2 station levels + both Campaign 3 levels (shakedown), Visit 2 = Campaign 2 free-weight levels, Visit 3 = all of Campaign 1 | ~3 weeks |
| **P3 — beta** | 2–3 testers on their own phones with a loaned headband; metrics dashboard from `session_sets` | §12 targets measured on non-founder users; go/no-go on the MVP | ~2 weeks |
| **P4 — gym pack pilot** | gym check-in, Scout contribution (reduced form, behind the flag), backend assembly, pack download and precedence, adoption meter; the founder is the Scout at gym #1 | testers run one session with the pack and one without; follower uplift measured (§12); the gym operator conversation (permission + reward) has happened | ~3 weeks |

The founder's three-visit capture plan is **not replaced**: it becomes the P2 playthrough, so the
capability map it was designed to produce comes out of the game — and, in P4, the first gym pack.

---

## 14. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | Tagging feels like data entry → abandonment | proposals first, one-tap confirm, deferrable, ≤ 20 s target measured from day one; if median exceeds 30 s in dogfood, cut rep-mark editing to "type the number" |
| R2 | Users tag junk for XP | XP only after gates; integrity check catches inconsistent labels; no penalties so there is no incentive to fake |
| R3 | A certified exercise miscounts in live use | demotion on two corrections; corrections feed the store; confident-wrong tracked as a hard zero |
| R4 | Head-still exercises disappoint ("it learned nothing") | Campaign 2 framing and mission cards say exactly what is learned; weight priming and exemplar ID are visible payoffs |
| R5 | Bystander video on the phone | per-set clips only, 7-day reduction, visible storage meter, no upload |
| R6 | Founder priors mislead other bodies | priors down-weighted from the first user set; retired at Certified; POC Q2 cross-user evidence collected in P3 |
| R7 | Rig change invalidates the store | per-session calibration + canonical frame; a rig-mismatch warning if the ritual's rotation differs from the store's |
| R8 | Game tone reads as violent or juvenile | targets are iron, never people; vocabulary reviewed against C6/C7; cosmetic ranks only |
| R9 | Solo scope creep into a "real" game | no 3D, no social, no economy beyond XP; P2 is capped at three weeks |
| R10 | Integrity bars (0.80 / 0.90) are unmeasured assumptions | P0 publishes the measured distribution on the founder's own stores before P1 starts; bars are config, not code |
| R11 | Auto-harvested negatives swallow an untagged real set | periodic windows are never harvested; the debrief queue shows untagged sets until resolved |
| R12 | The gym partnership (permission + discount) never materialises | the pack and the Scout mechanic work without it; the reward has an IronPal-controlled fallback (§15); permission is needed for capture anyway, so it is one conversation, held before P4 |
| R13 | Scouts inflate adoption (fake accounts, shared devices) | verified-member rule (§8.6), FR-S4; tiers recomputed from events, never incremented |
| R14 | A pack leaks bystanders or the gym's own imagery | reduced form only (C9): tight implement/stack crops, no wide frames, no faces; review queue for flagged stations; gym operator consent covers on-premises capture |
| R15 | User A's IMU priors misclassify user B | pooled priors carry the same down-weight/retire rules as founder priors; a follower's first own set outranks them; cross-body accuracy is measured in P3/P4 before priors are enabled by default |
| R16 | Two Scouts disagree on a station's calibration | never averaged; station flagged for review; the higher-quality contribution is served meanwhile |

---

## 15. Open questions — the decisions that are not the founder-as-engineer's to make alone

Everything else in the earlier draft's open list was resolved in the review (ledger Q8, Q9, Q13,
Q14). These involve money, law or external parties and stay conditional in the text above:

1. **Legal basis and consent for Scout contributions (ledger Q24, reopened as Q28).** Premise 2 makes
   sharing a feature, not an option, so "no sharing in v1" no longer holds. What is still open is the
   GDPR basis for motion-derived data and on-premises imagery, the consent wording, and retention.
   *Recommendation:* build the pipeline behind a server-side flag (FR-D5); reduced form only (C9);
   get counsel's wording before the flag is turned on for anyone but the founder.
2. **The gym partnership and the reward (ledger Q32).** A membership discount can only be granted by
   the gym. *Recommendation:* fold it into the capture-permission conversation the supervised plan
   already requires (§1.2, a blocking requirement), starting with gym #1; until a gym signs, the
   Scout reward is an IronPal-controlled benefit (subscription credit or hardware credit) so the
   mechanic is real from day one and the discount is an upgrade, not a promise.
3. **Monetisation boundary (ledger Q25).** Base product or a tier? *Recommendation:* base product —
   it is how the product becomes accurate. The economy in §8.3 never gates features on XP,
   certifications or Scout rank, so either answer remains possible.
4. **Marketing claims (ledger Q26).** *Recommendation under the claim guardrails:* "learns your
   exercises" and "counts your reps automatically" only for Campaign-1 exercises and only after the
   §12 targets are measured; "recognises your lifts" across campaigns; "knows your gym" only once a
   pack exists there; weight stays "reads it when it can, asks when it can't".

---

## Appendix A — Glossary

- **Template** — one labelled IMU example (feature vector + canonical window).
- **Store** — a user's templates, exemplars and priors for one exercise.
- **Integrity** — leave-one-out agreement of an exercise's store, 0–1.
- **Clean set** — a set that passed all quality gates and counts toward certification.
- **Priors** — founder-recorded templates shipped for cold start.
- **Staging glance** — the ~2 s still, face-on look at the weight before the set.
- **Sensor class** — `rep_signal` in the ontology: `imu`, `fusion`, `vision`, `hard`.
- **Gym pack** — the body-independent part of a gym's stores (station atlas, calibrations, weight
  priors, pooled IMU priors), assembled from Scout contributions and downloaded on check-in.
- **Scout** — a member who opts in to contribute certified stations to their gym's pack.
- **Follower** — a member who starts from the gym pack.
- **Verified adopter** — a different account, on its own device, with ≥ 3 headband sessions inside
  the gym's location check in 30 days, using the pack.
