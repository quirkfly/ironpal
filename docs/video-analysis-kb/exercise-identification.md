# Exercise identification — general method

Naming an **arbitrary** exercise from a clip. No allow-list: the answer can be any exercise.

## The four-signal read

Decide from the combination of:

1. **Equipment** — barbell / dumbbell / fixed machine / cable stack / kettlebell / bodyweight.
   Often the single strongest discriminator and usually visible even in bad frames.
2. **Body posture & stance** — standing / seated / lying / split stance / hinged.
3. **Motion arc & plane** — the path the load travels (vertical press, horizontal row, hip-hinge
   arc, knee-dominant squat) and which joints drive it.
4. **Camera perspective** — see below; it changes *which* of the above you can even see.

Write the answer as a specific, conventional name (e.g. "barbell back squat", "seated cable row",
"dumbbell shoulder press"), not a category.

## Is it an exercise? Use a HIGH bar for "no" (case 002 — I got this WRONG)

Some clips are pure handling (the 20260614_120353 camera-test). But **declaring "not an exercise"
is dangerous** — I did it to case 002 (a real barbell deadlift) and was wrong. The cues I used
("vertical" implement, collars on the mat, hands together near the floor) were ALL misleading:
- **90° frame rotation** (this rig records sideways): a **horizontal barbell looks vertical**. Undo
  the rotation before judging implement orientation. A "vertical bar" is often a horizontal one.
- **A spare collar on the mat** is just a spare — NOT proof of active loading.
- **Hands together at a low point** fits a deadlift/row grip as much as assembly.
Only call "not an exercise" with STRONG positive evidence of handling — **plates actively coming on/
off across frames**, no load path over the WHOLE clip — and even then prefer "uncertain" + ask. A
loaded long bar worked from the floor with a bent posture is almost always a **deadlift / bent-over
row**, not setup. When unsure, name the most likely exercise with low confidence; don't dismiss it.

## Camera perspective changes everything

- **Egocentric (headband / first-person)** — the IronPal product perspective. You rarely see the
  athlete's own body; you see their *hands, the implement, and the environment moving*. Cues invert:
  a squat reads as the *floor rising and falling*; a pushdown reads as *forearms and a cable in the
  lower frame with little head motion*. Lean on hands + implement + environment motion.
- **Third-person / fixed tripod** — you see the whole body; posture and motion arc dominate. This is
  the easier case for naming the exercise.
- **State the perspective in the report** — it conditions every cue and our confidence.

## Track the TRAJECTORY, don't judge a static frame (case 002 fix)

The single biggest naming error so far (case 002: a deadlift misread as "equipment assembly") came
from judging the exercise off the **static appearance** of a few frames instead of **tracking the
implement's path over time**. Static appearance is confusable (a rotated horizontal bar + a spare
collar *looks* like loading); a **trajectory is not** (bar on floor → rises as the body stands →
returns to floor = a deadlift load path, unmistakable). So:
1. Use the cheap funnel (contact sheets) to **locate the working window** and mark **the moment
   use starts** (separates staging/loading from the set).
2. Then **track the equipment continuously through the window** — follow the load's path frame to
   frame (readable montage / dense full-res) and name the lift from the **trajectory**, not from any
   one frame. Trajectory beats appearance, especially on rotated, cluttered egocentric footage.

## Method

1. Identify equipment first (narrows the space hard).
2. Identify posture/stance.
3. Trace the motion arc across frames.
4. Match against `exercises/<slug>.md` signatures; if no match, name it from first principles and
   **create a new `exercises/<slug>.md`** capturing the signature for next time.
5. Record alternatives you rejected and why — that reasoning is reusable.

## Barbell clips = LOAD → GRASP → PERFORM. Read only the PERFORM phase (case 002)

A person using a barbell follows a fixed sequence: (1) **load** the bar with plates, (2) **grasp** it
with both hands, (3) **perform** the exercise — the **same movement pattern repeated**, which IS the
exercise. **The exercise is phase 3 only.** Phases 1–2 (loading/assembly) can dominate the clip
(case 002: loading was ~t0–50, ⅔ of a 74s clip) and will mislead you into "not an exercise" or
endless handling reads if you analyse them. So:
1. Find the **load→grasp boundary** (when the bar is fully loaded and gripped with both hands, the
   person rises to lift) and **ignore everything before it**.
2. Read the **movement pattern after the grasp** — its path names the lift (floor→hip = deadlift;
   hip→knee→hip = RDL; thigh→chest = curl; thigh→chin = upright row; on-back down/up = squat).

**VERIFY THE TRAJECTORY DIRECTION — a shared bottom pose is NOT an ID (case 002 reversal).**
"Standing, loaded bar at the thighs, straight arms" is the bottom of a **deadlift AND a curl AND an
upright row AND an RDL** — identical at that instant. They diverge in where the bar goes next:
- bar goes **DOWN to the floor**, arms stay **straight**, legs hinge → **deadlift**.
- bar goes **UP to the chest/chin** while the person **stands still**, **elbows FLEX** → an **arm
  exercise** (curl / upright row), NOT a deadlift.
Case 002: I called it a deadlift for many turns, then a close phase-3 read showed the bar **rising to
the chest off the floor, arm-driven, while standing** → **curl/upright-row family, not a deadlift.**
Never name a barbell lift from the thigh pose alone; confirm the direction the bar travels and whether
the elbows bend.

## Forearm & arm orientation — a primary, cross-cutting cue (case 002)

The **forearm relative to the implement**, plus **whether the elbow flexes**, is one of the most
reliable identifiers — and the fastest way to tell a real lift from merely **handling** the gear.
Read it *before* committing to a movement name.

- **Straight arm, forearm hanging vertical & perpendicular to a horizontal bar/load** (passive grip,
  elbow does NOT bend) → a **hanging hold**: deadlift / row / RDL. The hands are hooks; hips/knees or
  the back move the load, not the arms.
- **Elbow FLEXES, forearm rotates/sweeps up** → a **curl** (the forearm is the moving segment).
- **Straight arm pivoting from the shoulder, forearm fixed** → a **raise/press** (no elbow bend).
- **HANDLING tell (not a rep):** **one** hand, a **forearm angled across/along** the implement, or an
  **actively-flexed/braced** arm holding it → the person is **carrying/positioning/loading**, not
  performing a rep. (Case 002 t56: a one-hand, angled-forearm hold I wrongly called a deadlift
  "lockout" three times — because I reinterpreted the frame to fit my active conclusion.)

**Pronation vs supination — RESOLVE palm-vs-knuckles; do NOT guess from a watch (case 002 MISS).**
Grip drives the whole ID (pronated/overhand → upright row, deadlift, row; supinated/underhand →
biceps curl). The ONLY reliable read is to directly resolve what faces the camera:
- **PRONATED (overhand):** you can **count the row of ~4 KNUCKLES** (bony bumps) on the back of the
  hand; you do NOT see palm creases.
- **SUPINATED (underhand):** you see the **PALM** (creases, smooth heel) and finger-pads; **no
  knuckle row**.
**If you cannot see distinct knuckles, do NOT claim the back of the hand.** Zoom in and verify.
**Anti-pattern (the case-002 failure):** I called it pronated from (a) a **wristwatch** — useless, the
wearing-side is ambiguous and you can't resolve face-vs-strap on blur — and (b) asserting "knuckles
face the camera" when a zoom showed **ZERO knuckles** (a smooth palm). It was supinated → a curl.
**Never assert a grip feature on a frame too blurry/edge/rotated to actually resolve it.** Confirm on
the sharpest frame; grip is constant within a set.

**Discipline:** read grip + forearm orientation FIRST, as physical facts, and let them constrain the
movement name — don't bend the grip reading to match a hypothesis you already hold.

## Head-still arm exercises (curl vs raise) — read the arm, not the implement height

From a headband cam, the dumbbell's *apparent height* does NOT separate curl / press / front raise:
head tilt shifts the apparent endpoint by exactly the amount that distinguishes them. Decide instead
from arm geometry on the top-of-rep frame:
- **Curl:** elbow **flexes**, upper arm pinned, DB ends **close to the body** near the chest/chin,
  forearm **supinating** (palm toward face).
- **Front/lateral raise:** arm stays **straight**, pivots at the shoulder, DB ends at **arm's
  length** at shoulder height, hand **pronated** (palm down/forward).

In the product, the IMU supplies the rep clock + world-vertical and narrows to a binary; vision (and
enrollment templates) makes the call. Full method: `sensor-fusion.md`.

## Known exercises (have signature files)

- `exercises/bulgarian-split-squat.md`
- `exercises/triceps-pushdown.md`
- `exercises/dumbbell-biceps-curl.md`
- `exercises/dumbbell-shoulder-raise.md`
- `exercises/barbell-deadlift.md`
- `exercises/barbell-upright-row.md`
- `exercises/barbell-curl.md`

(Both seeded from the on-device POC, which is egocentric. Expand/correct as we see real clips.)
