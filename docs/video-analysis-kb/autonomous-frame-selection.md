# Autonomous frame selection — analysing a raw clip with NOBODY pushing me to frames

**Why this doc exists.** In the raw-footage sessions I answered exercise / reps / weight correctly —
but only *after a human pointed me at the right frames* ("look at t=9s for the plate", "count around
the turnaround"). That reliance is the limitation: the recognition works; the **frame routing** was
manual. This doc turns the routing into a **self-driving protocol** the three KB skills run as their
Step 0, so a raw clip is analysed end-to-end with no human seed.

It does **not** replace `frame-extraction.md` (the legibility recipe) or the per-skill method — it is
the **router that decides which extractions to run, in what order, and when to stop or abstain**.

## The core insight: a model-free motion signal replaces the human's eye
The human was doing two things I couldn't: (1) *segmenting* the clip into setup / staging / perform /
rest, and (2) *locating* the one still, face-on frame where a plate is legible. Both are recoverable
**without a detector and without an IMU**, from pixel **motion energy**:

- ffmpeg `scdet` emits a per-frame `lavfi.scd.score` = frame-to-frame change energy.
- **High score = motion** → the PERFORM phase (exercise ID + reps live here).
- **Low score = still** → STAGING glances (weight-OCR lives here — plate at rest, face-on).
- **Periodic high/low = reps** → the rep clock, when the motion is head-visible.

This is the **poor-man's IMU**: on the product the headband IMU segments load/perform/rest and gives
world-vertical; on an offline KB clip, pixel motion energy does the same job, more noisily. Same
division of labour as `sensor-fusion.md` — motion carries routing, vision arbitrates identity — just
with the sensor synthesised from the video itself.

Helper: `scripts/kb/motion_profile.sh <clip>` prints the whole-clip profile + an auto-route.

## The protocol (run top-to-bottom; no human input at any step)

### Pass 0 — COVERAGE GUARANTEE (this is the anti-"push me to frames" rule)
**Always sweep the ENTIRE timeline t=0 → end before answering anything.** Never analyse a
human-chosen sub-window; there is no human. Two whole-clip passes, cheap:
1. `scripts/kb/motion_profile.sh <clip>` → motion-energy profile + auto-routed STILL / PERFORM windows.
2. Structure contact sheets at 1 fps across the whole clip (un-rotated — `transpose=2`, see
   `frame-extraction.md`): `fps=1,scale=640:-1,tile=5x5`. Read every sheet.
Annotate **all three questions at once** on this single sweep (case-001 lesson: don't discard a
weight-legible frame while doing exercise ID). Coverage is now guaranteed by construction, not by
someone remembering to mention t=9s.

### Pass 1 — SEGMENT phases from the motion profile (no human boundaries)
From the profile, derive boundaries mechanically:
- **PERFORM window** = the longest contiguous run at/above median motion energy (the auto-route line
  labels it). Exercise ID and reps come from *here only*. This is the automated version of the
  README's "ignore setup/grasp, read only phase 3."
- **STAGING windows** = local motion troughs (below median), especially ones adjacent to the perform
  window (pick-up just before, set-down just after). Weight-OCR targets these — stillness beats
  proximity (`frame-extraction.md`).
- **Setup/rest** = everything else; ignore for ID, but keep staging troughs inside it for weight.

### Pass 2 — ROUTE each question to its own extraction (re-scan from the segments, not the last window)
Each question wants different frames — route independently (README "re-scan when the question changes"):

| Question | Source window | Extraction | Auto fps rule |
|---|---|---|---|
| **Exercise** | PERFORM | large low-res montage `fps=2,scale=360,tile=6x6` | 2 fps (motion, not detail) |
| **Reps** | PERFORM | montage at the turnarounds | **3 fps default; 4–6 fps if peak motion score is high** (ballistic) — else turnarounds alias (case 002) |
| **Weight** | STAGING troughs | high-res, **no downscale**, `-q:v 2`, small window around each trough | re-extract at higher fps around the trough only if 2 fps misses the glance |

The fps for reps is chosen from the profile's peak score, not guessed: a kettlebell-swing spike auto-
selects 5–6 fps; a slow grind stays at 3.

### Pass 3 — SELF-TERMINATE / ABSTAIN (calibrated, no confabulation)
Stop refining and answer when:
- **Exercise:** top candidate matches its expected trajectory AND ≥2 alternatives are *positively
  falsified* (Step 6b of the skill), not merely outranked. Else report best guess at ≤0.5 with
  alternatives listed.
- **Reps:** a clean periodic motion signature in the PERFORM window → count the turnarounds at the
  chosen fps. **Abstain rule:** if PERFORM motion is only marginally above median with **no
  periodicity**, this is an **axial / head-still lift** (cable pushdown = case 003; the headband sees
  almost no motion). Vision cannot certify reps here — say "reps not vision-certifiable (axial stroke,
  head-still)"; on the product this is the wrist-IMU / cable-tension case. Never emit a confident count
  from a flat motion profile.
- **Weight:** if no staging trough yields a still, face-on, legible number → **"unreadable"**, never a
  guess. A cable/lever rig decouples plate mass from working weight (case 003) → say so, don't add it up.

Low confidence on any answer → that's the product's 1-tap user-confirm (active learning), not a bluff.

## Worked example — the router on `20260615_122213.mp4` (case 003, blind to routing)
`motion_profile.sh` on this clip (whole-timeline, no human seed) returns:
- median motion 2.5, max 20.9; profile is a **flat plateau ~3–4** across 15–85 s with troughs at
  10–15 s / 50–65 s and end-spike at 85–90 s.
- Auto-route: STAGING = 10–15 s, 50–65 s, 70–75 s; PERFORM = the 15–50 s plateau.
- **Abstain check FIRES:** the plateau is only marginally above median with no clear periodicity →
  flagged axial/head-still. Ground truth: this *is* a triceps cable pushdown — reps genuinely are
  head-invisible (the case-003 lesson). The router reaches the right posture (route weight to the
  troughs, ID from the plateau, **do not fake a rep count**) with nobody pushing it to a frame.

That is the whole point: same correct answers, arrived at **autonomously**.

## Honest limits (so the router doesn't over-promise)
- **Egocentric camera bob is noise** in the motion signal — walking up to the rack, head turns and
  re-racks all spike `scdet`. The profile *routes*, it doesn't *decide*; vision still confirms every
  phase boundary the motion suggested.
- **Axial/head-still lifts** (pushdown, shrug, calf raise) are weak in *both* pixel motion and the
  headband IMU → the honest output there is abstention on reps, not a number. Product answer: wrist
  IMU / cable-tension (`sensor-fusion.md`), not more frames.
- **`scdet` is change energy, not true optical flow** — it can't tell a rep turnaround from a head
  turn on its own. It is a *router*, upstream of the vision reads that actually name and count.
- This closes the "human points at frames" gap for **routing**; it does not add a recogniser. Accuracy
  still comes from the vision method in the three skills — this just feeds it the right frames itself.

See also: `frame-extraction.md` (legibility recipe), `analysis-pipeline-strategy.md` (the sensor-first
product pipeline this mirrors), `sensor-fusion.md` (IMU division of labour), `cases/003-*.md`.
