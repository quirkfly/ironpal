# Grilled — 37-exercise capture plan

Decisions resolved by interview on **2026-08-09**, against
[`ironpal-essential-exercise-video-capture-plan.md`](ironpal-essential-exercise-video-capture-plan.md).
Each entry records the question, the answer, and the consequence for the plan.

---

## Q1 — What are the 3 visits actually for?

**Tension found:** [`ironpal-supervised-learning-phase-plan.md`](ironpal-supervised-learning-phase-plan.md)
budgets **~13 sessions** for the training dataset, while this plan covers all 37 exercises in **3
visits**. At 2 sets each that is ~74 clips — ample to *evaluate* a pipeline, nowhere near enough to
*train* one.

**ANSWER: a coverage / feasibility pass.**

The deliverable is a **capability map plus an honest failure list** — which of the 37 the rig can and
cannot handle — not a trained model. The ~13 sessions follow afterwards, targeted only at the
exercises that passed.

**Consequences:**
- 2 sets per exercise is correct. **Breadth beats depth**; do not add sets at the cost of coverage.
- Scoring must happen **after Visit 1**, not after all three — an evaluation that reports at the end
  cannot change anything.
- "Not capturable" is a valid, valuable result. The plan is not trying to succeed at all 37.

---

## Q2 — Did session 01 happen?

**ANSWER: no. The rig is unproven.**

Confirmed independently: no clips on disk since 2026-08-02, latest case is 007, nothing committed.

**Consequences — this reorders the visits:**

The shakedown must fold into the front of Visit 1, so Visit 1 should be the **smallest and most
controlled** group. Swapped from the original assignment:

| Visit | Group | Was | Why |
|---|---|---|---|
| **1** | **Group 2** — 10 cable/machine | was Group 1 | Seated, fixed paths, painted stacks, minimal snag risk. The best place to discover a mount/sweat/framing failure, and the smallest group so the shakedown overhead hurts least. |
| **2** | **Group 1** — 12 free weights | was Group 2 | Rig procedure is routine by now. |
| **3** | **Group 3** — 15 IMU | unchanged | As specified: the Nano group goes last. |

Also: build the headband rig **and bench-test it at home** before Visit 1 is scheduled. Three visits
is the whole budget; there is no fourth to absorb a build failure.

---

## Q3 — Can all 37 actually be captured at the Gym80 site?

**ANSWER: yes — all 37. No missing stations, no exercises that cannot be performed cleanly.**

**Consequence:** no substitutions needed, and the group tables stand exactly as written. Had a station
been missing, the rule would have been to substitute the nearest exercise with the *same*
`rep_signal` **and** `weight_read_strategy`, and record the substitution — never silently drop a row.

---

## Q4 — What counts as a rep-counting PASS?

**Resolved from the codebase, not asked:** weight scoring is already mechanised.
[`score_weights.py`](../scripts/kb/score_weights.py) implements **correct / wrong / abstained /
confident-wrong**, with a per-case `tolerance_kg` (painted pin stacks: tolerance 0) and a 0.7
confidence threshold, exiting non-zero on any confident-wrong. Abstentions cost **coverage, not
correctness**. No decision needed there.

Reps had no equivalent — no tolerance defined anywhere, no scorer, and the rep skill deliberately
reports a **range**, not an integer.

**ANSWER: PASS = the true count falls inside the reported range AND the range is no wider than 2 (±1).**

The width cap is the point: without it, a useless "6–12" would score as correct.

**Stricter bar for Visit 3.** For `imu` exercises the IMU is supposed to *deliver* the integer, so the
bar there is an **exact match**. Failing that bar on Visit 3 is a real finding about the IMU path.

**Consequence — new deliverable:** `scripts/kb/score_reps.py`, mirroring `score_weights.py`'s
four-state semantics and its non-zero exit on confident-wrong.

**Recognition, decided without asking:** the ontology carries a `synonyms` field per exercise, so
PASS = prediction matches `canonical_name` or any listed synonym.

---

## Q5 — How do we stop the ground-truth log contaminating the measurement?

The founder holds the labels for all ~74 sets. If that log reaches the analyst before analysis, the
coverage numbers are scored against already-seen answers and mean nothing.

**Established practice, confirmed:** case 007 places **"GROUND TRUTH (founder-confirmed)"** in a
section *after* the verdict. Predict first, reveal after. Nothing currently enforces it.

**ANSWER: blind on set 1, open on set 2.**

- **Set 1 of every exercise (37 clips) is the measurement.** Analysed and written to
  `predictions.json` **before** any ground-truth entry for that clip is visible.
- **Set 2 is open.** Used to debug failures and improve the KB, with labels in hand.

Gives one clean coverage number *plus* material to iterate on, at half the blind-analysis cost.

**Consequence — the mechanic must be explicit**, or it will be violated by accident:
1. Photograph the paper log; keep it in a **gitignored staging path**
   (e.g. `input/kb/groundtruth-sealed/`) — **not** in `docs/`.
2. Analyse every set-1 clip and write `predictions.json`.
3. Only then transcribe the log into
   [`ground-truth.md`](video-analysis-kb/ground-truth.md) and run the scorers.
4. Set-2 clips may be analysed freely with labels visible.

---

## Q6 — What halts the programme after Visit 1?

**ANSWER: all four proposed tripwires — with the fourth scoped (see below).**

| Tripwire | Halts? | Rationale |
|---|---|---|
| **Any confident-wrong reading** | ✅ | The KB's one inviolable rule. Indicates a *method* bug that will poison Visits 2–3 identically. |
| **Sync / alignment failure** | ✅ | Correlation peak under threshold, or `seq_gaps > 0` on most blocks. Rig-level; repeats identically; everything downstream becomes guesswork. |
| **Video unusable** (framing / focus / sweat / board death) | ✅ | Rig-level and unrecoverable by any amount of analysis. |
| **High abstention rate** | ⚠️ **scoped** | See below. |

### The abstention tripwire, and why it needed scoping

I argued against halting on abstention and was overruled — correctly, in the sense that *something*
should catch a pipeline that abstains on everything. But applied as a blunt rate it is self-defeating:

**Visit 1 uses cast plates and dumbbell cast numbers — the known-hard OCR case. Heavy weight
abstention there is the expected baseline being measured.** Visit 2 exists precisely to test whether
that abstention is *the plates* or *the pipeline*, because it uses painted pin stacks. Halt after
Visit 1 on abstention and that comparison is never made.

**So the tripwire is scoped by axis rather than applied as a single rate:**

| Axis | Abstention halts? |
|---|---|
| **Weight**, on cast plates / dumbbell cast numbers (Visit 1) | ❌ No — expected baseline, and the whole point of the Visit 1 ↔ Visit 2 comparison |
| **Exercise recognition** | ✅ Yes if > ~30 % — recognition does not depend on plate legibility, so heavy failure here is a pipeline problem |
| **Reps on `imu` exercises** | ✅ Yes — the IMU is supposed to deliver these; abstention means the IMU path is not working |
| **Reps on `vision` exercises** | ❌ No — the skill states outright that egocentric vision cannot certify an integer |

This honours the tripwire while preserving the experiment it would otherwise blind.

---

## Consolidated changes to the plan

1. Reframed as a **coverage/feasibility pass**, not a training-data collection.
2. **Visit order swapped** to Group 2 → Group 1 → Group 3, with the shakedown folded into Visit 1.
3. **Build + home bench-test** added as a precondition ahead of Visit 1.
4. **Rep pass bar** defined (in-range, width ≤ 2; exact for `imu`), plus `score_reps.py` as a new
   deliverable.
5. **Blind protocol** specified with a concrete sealed-log mechanic.
6. **Halt conditions** defined, with the abstention tripwire scoped by axis.

## Still open — deliberately

- **Segmentation effort.** ~74 per-set clips must be cut from ~15 block recordings. Intended approach
  is `motion_profile.sh` plus the staging glances to auto-propose cut points with human confirmation,
  but this is unbuilt and its cost is unmeasured.
- **`sync_imu_video.py` has never run against a genuinely simultaneous capture.** Verified against
  synthetic offsets, and its clock fit verified on real B2 data, but the full chain is unproven.
  Visit 1 is its first real test — if it misbehaves, suspect the script before the session.
