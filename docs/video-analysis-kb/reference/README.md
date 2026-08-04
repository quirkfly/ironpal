# Tier-1 exercise reference sheets (labeling aid)

One tile per Tier-1 exercise: **start position | end position** side by side (the pair is the
movement), grouped by equipment class, captioned `[rep_signal | egocentric_visibility]`.

| Sheet | Exercises |
|---|---|
| [`tier1-barbell.jpg`](tier1-barbell.jpg) | 10 |
| [`tier1-dumbbell.jpg`](tier1-dumbbell.jpg) | 10 |
| [`tier1-machine.jpg`](tier1-machine.jpg) | 6 |
| [`tier1-cable.jpg`](tier1-cable.jpg) | 5 |
| [`tier1-bodyweight.jpg`](tier1-bodyweight.jpg) | 4 |

Regenerate: `python3 scripts/kb/build_exercise_sheets.py --fetch`

## What these are for

Settling **naming** questions during labeling — *is this set a front raise or a lateral raise?* Every
label must resolve to one `id` in [`../ontology.json`](../ontology.json), and these make the
distinctions visible without reading the JSON.

## What these are NOT

> **These are third-person gym-catalogue photos. They do not show what the headband camera sees.**

Egocentric recognition is the whole problem, and none of these images represent it. Do not use them
as a visual reference for what the model will encounter — for that, use the extracted frames in
[`../cases/`](../cases/), which are real clips from the actual rig.

The caption is what keeps this honest. A tile reading `[imu | occluded]` — Barbell Back Squat, for
instance — is telling you that the barbell dominating the photograph is **invisible to our camera**,
because it sits behind the neck. Depth comes from floor distance and the IMU carries the rep. The
photo shows the movement; the caption shows our problem.

Caption vocabulary (full definitions in `scripts/kb/build_ontology.py`):

- **`rep_signal`** — which sensor can actually certify a rep: `imu` (head/torso translates),
  `vision` (head still, implement enters frame), `fusion`, or `hard` (**neither works alone**).
- **`egocentric_visibility`** — `visible` / `partial` / `occluded` / `floor_reference`.

## Known gaps and artifacts

- **2 of 37 Tier-1 exercises have no imagery** — *Bulgarian Split Squat* and *Chest Press (Machine)*
  are absent from free-exercise-db. The split squat is a POC v1 target, so it is worth shooting our
  own reference for it.
- **Walking Lunge shows a barbell**, because the nearest source record was "barbell walking lunge"
  while our entry is classed as `dumbbell`. The movement pattern is right, the implement is not.
- Several tiles are a near variant rather than the exact canonical movement (e.g. *Leg Extension* ←
  "single leg leg extension"). Each entry's `source_match` field in `ontology.json` records exactly
  which source record it came from, so any suspect tile can be traced.

## Provenance

Images from [free-exercise-db](https://github.com/yuhonas/free-exercise-db), released under the
**Unlicense (public domain)** — no attribution or share-alike obligation, which is why they can be
redistributed here. Deliberately **not** sourced from any competitor's app; see §1.1 of
`docs/ironpal-supervised-learning-phase-plan.md` for the reasoning.
