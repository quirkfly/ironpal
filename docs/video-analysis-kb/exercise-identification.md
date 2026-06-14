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

## Camera perspective changes everything

- **Egocentric (headband / first-person)** — the IronPal product perspective. You rarely see the
  athlete's own body; you see their *hands, the implement, and the environment moving*. Cues invert:
  a squat reads as the *floor rising and falling*; a pushdown reads as *forearms and a cable in the
  lower frame with little head motion*. Lean on hands + implement + environment motion.
- **Third-person / fixed tripod** — you see the whole body; posture and motion arc dominate. This is
  the easier case for naming the exercise.
- **State the perspective in the report** — it conditions every cue and our confidence.

## Method

1. Identify equipment first (narrows the space hard).
2. Identify posture/stance.
3. Trace the motion arc across frames.
4. Match against `exercises/<slug>.md` signatures; if no match, name it from first principles and
   **create a new `exercises/<slug>.md`** capturing the signature for next time.
5. Record alternatives you rejected and why — that reasoning is reusable.

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

(Both seeded from the on-device POC, which is egocentric. Expand/correct as we see real clips.)
