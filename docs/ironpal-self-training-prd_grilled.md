# Grilled — Self-Training PRD (auto mode)

Decisions resolved on **2026-09-13** against
[`ironpal-self-training-prd.md`](ironpal-self-training-prd.md), **without user interaction**: each
question was posed and answered by walking the design tree, in order, one branch at a time.

Provenance tags — read them before trusting anything below:

- **EVIDENCE** — answered from the codebase, docs, ontology or a measurement; the source is cited.
- **ASSUMED** — the answer that would have been recommended in an interactive session; one line of
  rationale and the strongest argument against, so it can be vetoed cheaply.
- **OPEN** — not mine to settle (money, legal, external publishing). Recommendation stated; the PRD's
  wording stays conditional on it.

Every resolved decision is folded into the PRD in place. This ledger is the only record of *which*
statements in the PRD were decided by evidence and which were invented.

**Tally: 35 questions — 15 EVIDENCE · 15 ASSUMED · 5 OPEN.** (Q1–Q26 from the first pass;
Q27–Q35 added the same day when the founder stated the two founding premises — see Branch E.)

---

## Branch A — What is being trained

### Q1 — Is "the model" a neural network trained on the phone, or something else?

**EVIDENCE.** The POC matcher is instance-based: kNN over a normalised feature vector fused with
normalised DTW over the resampled window (`poc/mobile/android/.../Dsp.kt`
`matchAgainstTemplates`, `extractFeatures`, `normalizedDtw`; thresholds `T_REJECT = 0.45`,
`T_IMU_HIGH = 0.7` in `poc/mobile/src/config/index.ts`). Adding a labelled example *is* the training
step. Nothing in the repo trains weights, on device or off.

**Decision:** v1 "model" = the user's template store + exemplars + priors (PRD §6). No gradient
training on the phone. A distilled classifier trained *from* the store is a v2 option, gated on data.

**Consequence:** incremental update is an append; forgetting is impossible; per-set deletion is
trivial; erasure requests are trivial.

### Q2 — Does this reverse POC decision Q1 ("end users never enroll")?

**EVIDENCE.** Yes. `ironpal-poc-v1_grilled.md` Q1 chose founder-authored templates and explicitly
flagged cross-user generalisation as "the central IMU risk"; Q2 planned to test it on 1–2 others.
That test has not run (no gym session since 2026-08-02 — capture plan §0). The PRD's premise is that
per-user data is the fix for the risk Q1 created.

**Decision:** Q1 is superseded. The founder's templates survive only as cold-start **priors** (Q13).
The PRD header names the superseded decision so nobody reads the two documents as consistent.

### Q3 — Which exercises can self-training certify, and how is the campaign map derived?

**EVIDENCE.** `ontology.json` Tier-1: `rep_signal` = `imu` 13, `fusion` 2, `vision` 20, `hard` 2
(`python3 -c` over the file). The `hard` pair is the case-003 pushdown (0 of 5 reps seen from video)
and seated leg curl. `head_motion_class`: 15 moving / 22 still.

**Decision:** three campaigns keyed on `rep_signal`, derived from the ontology at build time, never
from a hand-maintained list. Certification badges follow §5.3 of the PRD.

### Q4 — What is the "confusable neighbour" set for the integrity check?

**EVIDENCE.** Grouping Tier-1 by (`motion_plane`, `head_motion_class`): **(sagittal, moving) holds 14
of the 15 IMU/fusion exercises**; pull-up is the lone (frontal, moving). So the "neighbour set" of any
Campaign-1 exercise is effectively the whole campaign.

**Decision:** integrity is leave-one-out agreement over **all stores in the same campaign**, not a
per-pair heuristic. Cheap (tens of windows), and it is the honest question: "can the phone tell
*this* squat pattern from the user's other squat patterns?" For Campaigns 2 and 3 the IMU store is
not what certifies, so integrity there is computed but not shown as armour; the meter shows glance and
exemplar coverage instead.

### Q5 — Certification thresholds: how many sets, how many weights, what integrity?

**EVIDENCE** for the counts: 5 clean sets per Tier-1 exercise is the supervised plan's per-exercise
target (§1.2, "not 20"); two different weights per exercise is the capture plan's rule (§2.4, "proves
weight reading is reading rather than recalling").

**ASSUMED** for the meters: Recon 1 set; Provisional 3 sets + integrity ≥ 0.80; Certified 5 sets,
≥ 2 weights, integrity ≥ 0.90. Rationale: 0.80 sits well above the matcher's reject line (0.45) and
0.90 above its "high confidence" line (0.70), so a certified store clears the live thresholds with
margin. *Against:* these are tuned on nothing yet; dogfood P0 must publish the measured integrity
distribution before the numbers are trusted. The PRD says so.

### Q6 — What is the rep-agreement gate for a clean set?

**EVIDENCE.** `scripts/kb/score_reps.py`: for `rep_signal == 'imu'` only an exact match is CORRECT;
for everything else a range containing the truth with width ≤ 2 is CORRECT. The capture plan §7b
adopts the same.

**Decision:** clean-set gate on `imu`/`fusion` = IMU count within ±1 of the confirmed count (a set
that is off by one still teaches the pattern); the XP bonus requires exact. Confident-wrong (IMU
confident and off by ≥ 2) is logged as a hard-zero KPI, mirroring the scorers.

### Q7 — Which rep-mark convention?

**EVIDENCE.** `rep-counting.md`: "anchor the count to one unambiguous moment per rep (e.g. top
lockout only)", and the egocentric method counts *looming* cycles at the top. The supervised plan
§1.3 says pick one convention and freeze it.

**Decision:** rep marks = **top of the rep**. Frozen.

## Branch B — The loop

### Q8 — When is the weight declared: before the set (ARM) or in the tagging round?

**ASSUMED.** In the **tagging round**, pre-filled from the weight prior and, when it has arrived, the
OCR read. The staging glance itself needs no phone touch — the target-acquired cue is audio/haptic.
Rationale: G6/safety and R1/friction — one fewer phone interaction per set, and OCR is asynchronous
anyway (POC Q8), so declaring first buys no immediacy. *Against:* declaring before the set makes the
declaration independent of what the user then sees in the replay; mitigated by showing the OCR value
only *after* the user has entered theirs when the two differ.

### Q9 — How much rep-mark editing in v1?

**ASSUMED.** Type-the-number plus tap-to-toggle the proposed marks. No free placement of new marks on
the trace in v1. Rationale: R1 (tagging must stay ≤ 20 s), and the case ledger shows rep boundaries
on head-still exercises are genuinely ambiguous even for a careful human — a free-placement UI
invites slow, inconsistent labels. *Against:* for `imu` exercises the marks are the training slices
(§6.3), and toggling cannot fix a peak the detector never found; if dogfood shows missed peaks
> 5 %, add "add mark at playhead".

### Q10 — Is the set really screen-free?

**EVIDENCE** that it must be: POC Q3 head-mounts the phone (no visible screen at all in the POC), and
the ShenYao rig has the phone driving a USB camera with no live overlay. **ASSUMED** as a product
rule: no interaction required from gate-open to 5 s after gate-close on any rig, production included.
*Against:* a wrist glance at a live rep count is genuinely motivating; it is allowed as an *optional*
view, never a required one.

### Q11 — What is the unit of video capture, and what is retained?

**EVIDENCE.** Per-set capture with ±10 s pre/post roll around IMU-ACTIVE windows, recall-first, is the
supervised plan §2.1 design; the same section records that the ShenYao path cannot be started or
stopped programmatically, so it records continuously and segments at ingest. Free-space precheck and
the ~65 min cap come from `ironpal-imu-camera-sync-plan_grilled.md` Q5.

**ASSUMED** for retention: full clip until the tagging round is confirmed + 7 days, then reduce to
exemplar frames + IMU window; 2 GB default cap. Rationale: the frames the model needs are a handful
per set (`sensor-fusion.md` "vision on IMU-chosen endpoint frames"), and bystander footage should not
accumulate. *Against:* users may want their sets as video; hence "pin" keeps a clip.

### Q12 — Where do the negatives (reject class) come from?

**EVIDENCE.** POC Q4 requires an UNKNOWN class seeded with idle/walking/racking/off-target
(`controller/labels.ts` `ENROLL_OPTIONS`). Asking every user to record "walking" is exactly the chore
this PRD exists to remove.

**ASSUMED.** Harvest negatives automatically from IMU-gated REST/walk windows in the same session,
labelled `unknown`, no user action. *Against:* a REST window may contain an un-tagged real set (user
skipped the debrief); mitigated by excluding any window the motion gate flagged as periodic.

### Q13 — Do the founder's priors ship, and do beta testers start with them?

**ASSUMED.** Ship them in the app binary (37 exercises × ~5 windows × 50 Hz × ~20 s × 6 axes ≈ 4–5 MB)
and start testers *with* priors. Rationale: the day-one experience must propose something, and the
cross-user question is still answerable because every proposal records whether it matched a prior or a
user template. *Against:* the cleanest cross-user experiment is priors-off; keep a debug toggle for
it in P3.

### Q14 — How is "hard mode" (different rig fit) detected?

**EVIDENCE.** The per-session calibration ritual (`ironpal-poc-to-production-transfer.md` §5) yields
the IMU axis-to-head rotation from six static holds. A different fit shows up as a rotation delta.

**ASSUMED** threshold: rotation delta ≥ 10° from the store's median, or a self-declared tightness
change. *Against:* the ritual itself is unproven on hardware (§2.2 of that doc: "nothing measured
yet"); until it is, hard mode can be self-declared only.

### Q15 — When does a certified exercise get demoted?

**ASSUMED.** Two live corrections in a row → Provisional; one clean set restores. Rationale: one
correction is noise (a bad rep, a slipped band); two in a row is a pattern, and the cost of a wrong
auto-log is the persona's stated deal-breaker. *Against:* a user who corrects for a reason unrelated
to recognition (typo) triggers it; acceptable, since restoration costs one set.

### Q16 — Does the tagging round ever block the next set?

**ASSUMED.** Never (FR-T5); rounds queue and can be finished at end-of-session. *Against:* deferred
rounds lose the "memory is fresh" property the capture plan relies on for the log line. Mitigated:
proposals are frozen at gate-close, so deferral only delays confirmation, not the evidence.

### Q17 — Where does the first-person view come from on each rig?

**EVIDENCE.** POC head-mounted phone: `CameraModule.captureSharpestStill` (variance-of-Laplacian)
exists and runs without a preview. ShenYao rig: no preview available to the app at all
(`ironpal-imu-camera-sync-plan.md` §0). Production module: preview over Wi-Fi is in the offload plan.

**Decision:** the *live* first-person view is production-only. On the POC rigs the target-acquired cue
fires from IMU stillness + on-device sharpness, with no preview; the *replay* view in the tagging
round works on every rig that gives the app the file (POC phone: yes; ShenYao: only after ingest, so
the debrief on that rig is trace-only). The PRD's FR-C3 is written this way.

### Q18 — Do live-workout corrections feed the store?

**EVIDENCE.** POC Q9: corrections are ground truth; `ConfirmCorrectScreen` already captures
`corrected_*` and posts detected + corrected. **Decision:** yes, through the same gates as a tagged
set (FR-L2), and they can demote (Q15).

## Branch C — Game

### Q19 — Rendering and dependencies: engine, or overlays in the existing app?

**EVIDENCE.** `poc/mobile/package.json` has no sound, haptics, animation or canvas libraries; the app
is bare React Native 0.84 with custom Kotlin modules. There is no engine to inherit and no budget for
one (C1).

**Decision:** overlays in RN over the camera preview / replay, native audio + haptics via small
libraries (a sound player and a haptic-feedback module; exact packages chosen in P2), no 3D. The
"game" is a state machine over the existing enroll/live controllers.

### Q20 — Third-party game IP.

**EVIDENCE** (legal constraint, not a preference): Counter-Strike and Wolfenstein are registered
marks with protected assets; the same project already had to rewrite a Fitbod-lookalike prompt for
copyright risk (TASK log). **Decision:** genre inspiration only; C6 stands; the PRD's vocabulary
("target", "hit marker", "reload", "boot camp") is generic.

### Q21 — Tone: is the shooting metaphor acceptable for a fitness product?

**ASSUMED.** Yes with two rules: targets are iron, never people; no violence imagery. Rationale: the
brief asks for it and the mechanics map cleanly (glance = aim, rep = hit). *Against:* some of the
committed-lifter persona will find it juvenile; ranks are cosmetic and the whole layer can be toned
down without touching the loop, which is why the loop (§7) and the game (§8) are separate sections.

### Q22 — Which order does the founder play the campaigns in the three-visit plan?

**EVIDENCE.** The capture plan's grilled Q2 fixed the visit order: Visit 1 = Group 2 (stations,
shakedown) → Visit 2 = Group 1 (free weights) → Visit 3 = Group 3 (IMU). Mapped to campaigns: Visit 1
covers Campaign 2's station levels plus both Campaign 3 levels; Visit 2 the rest of Campaign 2;
Visit 3 all of Campaign 1. The PRD draft's "Campaigns 2 → 1 → 3" was wrong and is corrected.

## Branch D — Data, money, claims

### Q23 — Storage precheck and session cap.

**EVIDENCE.** Sync-plan grilled Q5: free-space precheck with live remaining-recording-time; cap ~65 min
against a 77 min hard ceiling on the capture phone. Carried into FR-C5 unchanged.

### Q24 — Data-sharing programme (users sending sets to IronPal).

**OPEN.** Involves consent wording, a legal basis under GDPR for biometric-adjacent motion data and
bystander video, retention, and possibly an incentive — none of which an auto-grill may settle.
**Recommendation:** ship v1 with sharing **off and absent from the UI**; design the store so a later
opt-in can export exactly the reduced form (exemplar frames + IMU windows, never clips); revisit after
P3 with counsel. The PRD keeps FR-D5 conditional.

### Q25 — Monetisation boundary.

**OPEN.** Whether self-training is base product or a tier is a pricing decision.
**Recommendation:** base product — it is how the product becomes accurate, and gating it would gate
accuracy. The PRD's game economy is written so that XP and certifications never gate features, which
keeps both answers possible.

### Q26 — Marketing claims for the feature.

**OPEN.** External claims are governed by the claim guardrails (weight = vision-assisted, never
"no cloud"). **Recommendation:** "learns your exercises" and "counts your reps automatically" are
supportable **for Campaign-1 exercises only** once dogfood shows the §12 targets; "recognises your
lifts" is supportable across campaigns; no claim about weight beyond "reads the weight when it can,
asks when it can't". The PRD's C7 stays conditional on this.

---

## Branch E — The two founding premises (added 2026-09-13, second pass)

The founder added two premises after the first pass: (1) a user trains at one gym consistently;
(2) many other members of that gym profit from user A's data, and user A is rewarded (a membership
discount or similar) when that adoption happens. Premise 2 directly contradicts Q24's "no sharing in
v1", so that branch is reopened here.

### Q27 — What of user A's data actually helps user B at the same gym?

**EVIDENCE.** `ironpal-supervised-learning-phase-plan.md` §1.2b: IMU signatures are "a property of
the human movement, not the paint on the machine" — they are manufacturer-agnostic, i.e. they do
*not* carry gym-specific information, and they *are* body-specific (POC grilled Q2 names cross-body
IMU generalisation the central risk). What the same section says *does* vary by gym is the
weight-reading interface (stack label layout, increment, plate shape), which `weight-reading.md`
handles with per-rig calibration notes.

**Decision:** the shared artefact — the **gym pack** — is an equipment atlas (per-station exemplars,
weight-reading calibrations, weight priors) plus user A's IMU templates **as pooled priors only**,
under the same down-weight/retire rules as the founder's priors. The PRD says this in §1.4 and §6.5
and does not let the game imply that user A's reps train user B's counter.

### Q28 — Q24 reopened: sharing is now a premise, so what ships?

**OPEN** (legal basis), **ASSUMED** (mechanism). The mechanism: opt-in per certified station,
reduced form only (tight implement/stack crops, calibrations, anonymised IMU windows flagged as
priors), revocable, shown on the "what leaves the phone" screen. What remains open is the GDPR basis
for motion-derived data and on-premises imagery, and the consent wording. **Recommendation:** build
the contribution path behind a server-side flag, on for the founder only, until counsel has written
the consent text; the schema needs no change either way. *Against the mechanism:* even reduced
crops of a gym's machines are the gym's premises — hence Q32 ties operator consent to it.

### Q29 — How is "the same gym" identified?

**ASSUMED.** User-selected gym plus a location check at session start; a gym record is created on
first use. Rationale: the project's original no-instrumentation rule (no QR codes, no per-machine
stickers) is a product principle, and gym-level identity needs nothing physical. *Against:* two gyms
in one building, or a gym that moves stations, break the assumption that "gym" ≈ "fixed set of
stations"; the pack is keyed by station and versioned, so a moved machine is a new station, not a
corruption.

### Q30 — Precedence between a user's own store, the gym pack, and founder priors.

**ASSUMED.** Own store → gym pack → founder priors, and the pack never overwrites user data.
Rationale: the user's own confirmed set at a station is the only body-specific truth available;
the pack is the best gym-specific prior; the founder pack is the generic fallback. *Against:* a
brand-new user's first set is noisier than a mature pack entry; mitigated because "own store" only
outranks the pack once the exercise reaches Recon (one clean set), not on a failed gate.

### Q31 — What counts as "mass adoption", and how is it measured?

**ASSUMED.** Adoption = number of *verified* other members who used the pack in ≥ 3 sessions in the
last 30 days; verified = a different account on its own device with headband sessions inside the
gym's location check. Tiers 5 / 20 / 50 as configuration. Rationale: it measures the thing the
premise claims (other people benefit), it is hard to fake without buying hardware, and it is
recomputed from events rather than incremented. *Against:* a small gym may never reach 20; tiers
must be per-gym-size eventually — hence configuration, not code.

### Q32 — The reward: who grants it, and what does the app promise?

**OPEN** (commercial). A membership discount can only be granted by the gym operator, who is also
the party whose written permission the supervised plan §1.2 already lists as a **blocking**
requirement for on-premises capture. **Recommendation:** treat permission and reward as one
conversation, starting with gym #1 (the founder's Gym80 site) before P4; until a gym signs, the
Scout reward is an IronPal-controlled benefit (subscription or hardware credit) so the mechanic is
real and the discount is an upgrade. The app records *eligibility events* only; fulfilment is
outside the app (FR-S3).

### Q33 — Anti-fraud for the adoption meter.

**ASSUMED.** One account per device per headband; no location check → no credit; adopters created
from the Scout's device or network are excluded; the meter is recomputed from events. *Against:*
households legitimately sharing a headband are excluded; acceptable at pilot scale.

### Q34 — Multiple Scouts at one gym.

**ASSUMED.** Normal, not an edge case: merge per station; calibrations that disagree are flagged
for review and never averaged (a wrong stack increment is a confident-wrong factory); credit is
proportional to accepted contributions per station. *Against:* first-mover advantage may
discourage a second Scout; mitigated because credit is per station, and uncharted stations remain.

### Q35 — What may a pack contain, given bystanders and the gym's own premises?

**EVIDENCE.** Design D3 (frames deleted after inference, testers' frames never retained), C4, and
the supervised plan's privacy rule (footage restricted; faces blurred before any clip leaves the
encrypted store) all point the same way. **Decision:** reduced form only — tight crops of implements
and stacks, calibrations, binned weight priors, anonymised IMU windows; no clips, no wide frames, no
faces, no timestamps that place a person. Codified as C9 and FR-P4; disagreements and flagged
stations go to a review queue.

---

## Assumptions most worth a human veto (riskiest first)

1. **Q5 — certification thresholds (3/5 sets, 0.80/0.90 integrity)** are unmeasured. If dogfood
   integrity clusters near 0.7, Campaign 1 never certifies and the payoff loop breaks.
2. **Q8 — weight declared in the debrief, not before the set.** Removes a phone touch, but breaks
   the capture plan's "log immediately" habit if rounds are deferred.
3. **Q12 — auto-harvested negatives.** If REST windows contain untagged sets, the reject class learns
   real exercises as "unknown" and recognition silently degrades.
4. **Q13 — testers start with founder priors.** Convenient for the product; muddier for the
   cross-user evidence the POC still owes.
5. **Q21 — the shooting metaphor.** Cheap to tone down later, expensive to have built assets around
   if the persona rejects it.
6. **Q27 — user A's IMU data is only a prior for user B.** This is evidence-backed, but it narrows
   premise 2 to the equipment side. If the founder's mental model was "user A trains the rep
   counter for everyone", that expectation needs resetting now, not after P4.
7. **Q31 — the adoption metric and tiers (5/20/50 verified adopters).** Chosen for fraud-resistance,
   not calibrated to any gym's size; a wrong tier makes the reward unreachable and the Scout mechanic
   hollow.
