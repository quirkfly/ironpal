# Frame-extraction recipe

How we turn a clip into frames that are actually legible enough to answer the three questions.
Tuned by experience — update the defaults below whenever a clip teaches us a better setting.

## Current defaults

- **Sampling rate:** 2 fps for normal-tempo lifts (squats, presses, pushdowns). This gives ~2–4
  frames per rep, enough to see the eccentric→concentric turnaround that defines a rep.
- **Fast/ballistic lifts** (kettlebell swing, snatch, clean, fast cable work): 4–6 fps — at 2 fps
  the turnaround is aliased away and reps get miscounted.
- **Weight reading:** the number is usually legible for only a brief window (a glance, or rack
  pickup). If 2 fps misses it, re-extract at higher fps **around that timestamp only** rather than
  flooding the whole clip.
- **Quality:** `-q:v 2` JPEG (near-lossless). Do not downscale before reading — embossed plate
  numbers and dumbbell labels die under compression.

## Procedure

1. `scripts/kb/extract_frames.sh <clip>` → prints the header (duration/fps/resolution) and writes
   frames to `input/kb/frames/<stem>/`.
2. Read the frames in order. Form the exercise hypothesis from the *motion across* frames, not any
   single frame.
3. For weight, hunt for the single clearest frame where the number faces the camera; if none, say
   so and report "unreadable" rather than guessing.

## Re-scan the full timeline when the QUESTION changes (case 001 lesson)

Each sub-question wants different frames — don't inherit the previous question's working window:
- **Exercise:** motion across frames (low spatial res OK).
- **Reps:** temporal density at the turnarounds.
- **Weight:** a single **still, face-on, unblurred** frame — usually a **staging moment** (equipment
  at rest pre-pickup or post-set-down), NOT during the lift. Prioritise stillness over proximity.

Failure to do this cost case 001: I anchored the weight search to the lift/pickup (t22+) and missed
the readable plate label at the **staging frame t=9s**, producing a false "unreadable" + a 2×-too-high
estimate. Fix: when the question changes, **re-scan from t=0**, and annotate the first structure pass
for all three questions at once so a weight-readable frame isn't discarded while doing exercise ID.

**Product note:** weight-OCR should trigger at the **staging glance** (user picks up / sets down the
weight, eyes + headband on a still face-on plate), not mid-rep — relocates the POC "guaranteed
glance frame" to where it's actually legible.

## Open questions (resolve as we learn)

- Best default fps vs. legibility/token-cost tradeoff for the common case.
- Whether to auto-crop to a region (e.g. lower-frame for egocentric pushdowns) — depends on
  perspective, see `exercise-identification.md`.
