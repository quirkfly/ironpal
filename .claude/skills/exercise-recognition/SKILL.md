---
name: exercise-recognition
description: >
  Identify the exercise performed in an egocentric (headband / first-person) workout video clip,
  and report the reasoning. Built from the IronPal video-analysis KB (docs/video-analysis-kb/).
  Use when asked to analyse, recognise, or name the exercise in a clip — e.g. "what exercise is
  this clip", "analyse the next clip from the device", "/exercise-recognition <clip>".
---

# Exercise recognition (egocentric workout clips)

Goal: given a first-person headband clip, name the **exercise being performed**, with a confidence,
the **evidence**, and the **alternatives rejected**. This skill covers exercise NAMING; reps and
weight have their own KB sections (`docs/video-analysis-kb/rep-counting.md`, `weight-reading.md`).

There is **no pose-estimation model or action classifier** in the loop. The "model" is a multimodal
LLM (Claude) reading extracted JPEG frames + the accumulated heuristics in
`docs/video-analysis-kb/`. Accuracy comes from *how frames are sampled and routed*, not a recogniser.

## Inputs
- A clip path, OR pull the latest from a device:
  `adb -s <SERIAL> shell 'ls -t /sdcard/DCIM/Camera/*.mp4 | head' ` then `adb -s <SERIAL> pull <path> input/kb/clips/`
- This rig (Galaxy A52) records **4K HEVC, ~30fps, and frames come out ROTATED 90°** — critical, see Step 2.

## Tooling notes (this environment)
- `ffprobe` on PATH is a symlink to static `ffmpeg` and rejects ffprobe-only flags → read the header
  with `ffmpeg -i <clip> 2>&1 | grep -E "Duration|Stream.*Video"`.
- The static ffmpeg lacks `drawtext` → no burned-in timestamps; map tile→time by arithmetic instead.
- Helper: `scripts/kb/extract_frames.sh <clip> [fps] [outdir]`.

## The method — a resolution/temporal FUNNEL (don't read 200 frames)

Match the frames to the question. Naming an exercise is about **motion + equipment**, which read
*better* in a low-res montage than by scrolling 200 stills. ~1:15 @30fps ≈ 2000 frames — look at ~10.

### Step 1 — Structure pass (cheap, wide; ~3–5 reads)
Contact sheets at 1 fps, downscaled, tiled:
```
ffmpeg -nostdin -loglevel error -i <clip> -vf "fps=1,scale=640:-1,tile=5x5" -q:v 3 out/contact_%02d.jpg
```
Each 5×5 sheet = 25 s; read L→R, top→bottom; tile index i → t = (sheet-1)*25 + i seconds. Seeing 25
sequential frames at once makes the motion pattern legible. Get: perspective, equipment, rough posture,
and whether a rep cycle exists. **Annotate for all three questions at once** (exercise cues, rep cues,
AND a still face-on STAGING frame for weight) so you don't re-extract later.

### Step 2 — ACCOUNT FOR THE 90° ROTATION (do this before judging orientation)
Frames are sideways on this rig. Un-rotate with `-vf transpose=2` — a **horizontal barbell looks
vertical** until un-rotated (case 002: read as "a vertically-held bar" → wrongly called it assembly).
**NOT mirrored — do NOT hflip** (verified: transpose=2 gives readable mat text AND the watch on the
LEFT wrist, both correct). **Orientation check:** after transpose=2, confirm (a) mat text reads
forward and (b) watch on the LEFT wrist; if text is backward you added a spurious mirror — remove it.

### Step 3a — Barbell? Split LOAD → GRASP → PERFORM; read only PERFORM
A barbell clip = (1) load plates, (2) grasp with both hands, (3) perform the repeated movement = the
exercise. **Only phase 3 is the exercise.** Loading/assembly can eat most of the clip (case 002:
~⅔ was loading) and will mislead you into "not an exercise"/endless-handling reads. Find the
load→grasp boundary (bar fully loaded + both hands on it + person rising), ignore everything before
it, and name the lift from the **post-grasp movement path** (floor→hip = deadlift; hip→knee→hip =
RDL; thigh→chest = curl; thigh→chin = upright row; on-back = squat).

**VERIFY TRAJECTORY DIRECTION — a shared bottom pose is NOT an ID (case 002 reversal).** "Standing,
loaded bar at thighs, straight arms" is the bottom of a deadlift AND a curl AND an upright row AND an
RDL — identical at that instant. They split by where the bar goes NEXT:
- bar **DOWN to the floor**, arms stay **straight**, legs hinge → **deadlift**.
- bar **UP to the chest/chin** while the person **stands still** → must be **arm-driven (elbows
  FLEX)** → **curl / upright row, NOT a deadlift** (confound-proof: if the legs don't hinge, only the
  arms can raise the bar; head-tilt can't fake the bar clearing the hips).
Never name a barbell lift from the thigh pose alone — confirm the **direction** the bar travels and
whether the **elbows bend**. (Case 002: I called "deadlift" for many turns; phase-3 bar actually rose
thigh→chest off the floor while standing → curl/upright-row family.)

### Step 3 — Is it even an exercise? (HIGH bar for "no")
Confirm a real **rep cycle / load path** exists. But **do not over-dismiss** — declaring "not an
exercise" is dangerous (case 002 was a real deadlift I wrongly dismissed). A spare collar on the mat,
a "vertical" bar (rotation!), or hands together low are NOT proof of setup. Only call non-exercise with
strong positive evidence (plates actively coming on/off, no load path over the WHOLE clip); else name
the most likely exercise at low confidence.

### Step 3b — EXAMINE THE HELD IMPLEMENT FIRST — and everything attached to it (case 003 MISS)
**Ask "what is actually in the HANDS?" before anything on the floor.** Case 003 was a real instrumented
barbell lift I dismissed as "setup" for many turns because a **cluttered floor** (mats, ab-wheel, foam
rollers, adjustable-DB blocks, EMG pads, wobble board) read as "prepping multiple things." Only ONE
thing was ever *held* — a loaded barbell. **Equipment count ≠ exercise count; ambient clutter must NOT
lower the prior toward "no exercise."**
1. **Isolate the held implement** — find what each hand grips; ignore anything not touched by a hand. A
   long bar foreshortened in a head-down egocentric view *looks* short/central — trace its full extent.
2. **ZOOM IN on everything ATTACHED to it.** Decisive tells live here:
   - A **thin cable/wire from the implement to a small fixed FLOOR ANCHOR** = a **draw-wire /
     string-potentiometer displacement tether**. You only rig that on a bar you lift **up & down** →
     **hard proof of a repeated vertical stroke = a real exercise**, and a signature of an
     **instrumented ground-truth capture** (often with EMG pads / the headband on the floor). In case
     003 this tether was the smoking gun the "handling" was a lift.
   - **Chains** at the bar end = accommodating resistance / collar-snap; note, don't over-read.
   - **Exposed collar threading** = possibly a loading instant; weigh it.
**Rule:** a loaded implement **held in both hands** ⇒ default *an exercise is happening* — rule IN a
load path and check attachments before ever calling "no exercise." Don't let the floor decide.

### Step 4 — Name it via the four signals (in order of discriminating power)
1. **Equipment** — barbell / dumbbell / machine / cable / kettlebell / bodyweight (strongest; visible
   even in bad frames). **Read the HELD one (Step 3b), not the floor clutter.**
2. **Posture / stance** — standing / seated / split / hinged / squat (bent knees, thighs up = squat;
   straighter legs, hips back = hinge).
3. **Motion arc & plane** — the load's path and which joints drive it.
4. **Perspective conditioning (egocentric)** — you see hands/implement/environment, rarely your own
   body. Cues invert: squat = **floor rises/falls**; pushdown = forearms+cable, little head motion.

**Forearm & arm orientation (read it FIRST — strong cue + handling detector):** straight arm with the
**forearm hanging vertical, perpendicular to a horizontal bar**, passive grip = a hanging hold
(deadlift/row/RDL); **elbow flexes / forearm sweeps up** = curl; **straight arm pivoting at the
shoulder** = raise/press. **Handling tell:** one hand, a **forearm angled across the implement**, or
an actively-flexed/braced arm = **carrying/loading, not a rep** (case 002 t56). Read grip + forearm
as physical facts and let them constrain the name — don't bend the reading to fit a hypothesis.

**GRIP (pronated vs supinated) decides curl-vs-uprightrow/row/deadlift — RESOLVE it, don't guess
(case 002 MISS).** Both a curl and an upright row raise the bar thigh→chest; the GRIP separates them.
Read it by **palm-vs-knuckles on the sharpest frame**: pronated = you can **count ~4 KNUCKLES** (back
of hand), no palm; supinated = you see the **PALM/finger-pads, NO knuckles**. **If you can't see
distinct knuckles, do NOT claim pronated.** NEVER infer the grip from a wristwatch (wearing-side
ambiguous) and never assert a grip feature on a blurry/edge/rotated frame. (Case 002: I called
pronated→upright row from a watch + "knuckles" that a zoom showed didn't exist; it was supinated→a
**barbell curl**.)

### Step 5 — Track the TRAJECTORY (not a static frame) — names the lift
**What "tracking" means here:** NOT a CV object-tracker (no detector/box/optical-flow). It is
*sampled visual following, anchored to the body*: in each sampled frame, locate the implement and
estimate its position **relative to stable anchors** (feet, floor, hip, torso) — NOT its position in
the image, because the head-mounted camera swings. Read position via proxies (apparent size/proximity;
relation to anchors; on-floor/held/overhead state), connect the per-frame estimates into an ordered
**world-frame path**, and read the path's shape (floor↔hip cyclic = deadlift; near-body looming = curl).
Subtract the camera's own motion first (un-rotate; anchor to floor/feet). It's a reconstruction from
sparse samples, not a measurement → watch for aliasing (fast motion between samples), FOV gaps, and
re-identifying which implement is which. On the product, the IMU does the camera-motion subtraction
and the rep clock; a detector would give true per-frame position.

Mark the **moment use starts** (separates loading/staging from the set), then **follow the implement
continuously** through the working window: build a **readable large-tile montage** (`fps=2..3,
scale~360, tile 6x6`) and follow the load's PATH frame to frame. Name the lift from the **trajectory**,
not any single frame — static appearance is confusable (a rotated horizontal bar + a spare collar
*looks* like assembly), a trajectory is not (bar on floor → rises as body stands → returns = deadlift).
This is the fix for the case-002 false negative. Read posture by floor distance (standing = room
ahead; bottom = floor/feet close & large).

### Step 6 — Apply the KB discriminators
- **Looming vs distant (proximity, NOT apparent height):** implement looming large & close to the body
  = curl-type (near body); small & out at arm's length = raise-type. Head-tilt corrupts apparent
  *height*, so lead with apparent *size*. (`exercises/dumbbell-biceps-curl.md` / `dumbbell-shoulder-raise.md`)
- **Head-still arm pairs (curl vs raise vs press):** can't separate by head motion — read the arm
  (elbow flexes vs stays straight; supination vs pronation) on the top-of-rep frame.
- **Floor distance = squat depth:** feet large/close = bottom; small/far + room ahead = top.
- See `exercise-identification.md` and the `exercises/*.md` signature files.

### Step 6b — VERIFY by falsifying alternatives (template match)
Don't just name the best-fit. For the top candidate AND 2–4 alternatives, write the **expected
equipment trajectory** (where the implement goes relative to body anchors) and **check each against
the observed path — actively trying to FALSIFY it**. A candidate is confirmed when it matches AND the
alternatives are **positively contradicted** by specific observations, not merely outranked. Example
(case 002): observed bar floor↔hip, in hands, squat↔stand → deadlift matches; *bar resting on the
floor* falsifies RDL/row/squat/curl; *hip-height (not shoulder) top* falsifies the clean. Alternatives
falsified ⇒ raise confidence; alternatives merely unlikely ⇒ keep confidence modest and state them.
Tables of expected trajectories per exercise live in `docs/video-analysis-kb/exercises/*.md`.

### Step 7 — Report
```
Exercise: <name>            (confidence 0..1)
Evidence: <frames + cues: equipment, posture, motion arc, perspective>
Alternatives rejected: <...and why>
Perspective: egocentric (rotation accounted for)
```
Then **log a case** in `docs/video-analysis-kb/cases/` (predicted vs actual) and, if ground truth is
revealed, encode any *generalizable* correction back into the KB.

## Discipline (the hardest-won lesson)
This egocentric footage is genuinely hard and **invites premature confident conclusions**. Across
cases I repeatedly declared things "unreadable / unresolvable / not an exercise" that more careful
looking overturned. **Hold conclusions loosely; extract legible frames and look before declaring a
limit.** Prefer a calibrated 0.5 with stated alternatives over a false 0.9. The blind-test + case
ledger (`cases/INDEX.md`) is the real accuracy check — not argument.

## Honest limits → the product
Egocentric vision alone names the exercise well but can't certify reps or read unpainted weights. On
the IronPal product the headband IMU supplies the rep clock and world-vertical, and disambiguates
head-moving exercises; vision arbitrates head-still arm pairs. See `docs/video-analysis-kb/sensor-fusion.md`.
A wide, slightly-downward camera FOV (keeping the arm/implement in view) is a hardware requirement.
