# Rep-counting heuristics

A rep = one full cycle of the movement's defining motion. Count cycles, not frames.

## Method

1. Pick the **defining joint/segment** for the exercise (e.g. knee flexion for a squat, elbow
   extension for a pushdown, hip extension for a swing).
2. Find that segment's **turnaround points** across frames — each full extend→flex→extend (or the
   sport-specific full cycle) is one rep.
3. Count completed cycles only. A partial rep at the start/end of the clip is reported as a
   fractional/uncertain rep, not rounded silently.

## Egocentric counting method (headband) — "looming cycles"

There's no body in frame, so count the **implement**: one rep = one *looming* cycle (weight rises
close to the lens at the top, drops out of frame at the bottom). Count looming events.

## Sampling rate: the PERFORM phase needs ≥3 fps (case 002 — 2fps overcounted)
Use 1–2 fps only to find structure/phase boundaries. For the **actual rep count in the PERFORM
phase, sample at ≥3 fps** (denser for fast tempo). 2 fps under-resolves turnarounds and lets a
head-bob blip read as an extra rep. **Case 002: actual = 4 reps; my 2 fps montage gave ~5 (over by
1).** Mandate ≥3 fps, read in small readable chunks, before committing a count.

## Head-tilt confound defeats exact turnaround isolation (case 002 curl)
Going finer (3fps, readable chunks) to isolate every turnaround does NOT yield an exact count: the
implement's **apparent height in frame** is driven by the bar's real motion AND **where the head is
pointing**. If the lifter's gaze drifts/tracks the bar (common on head-still arm work), the head
follows the implement → it stays framed at the chest while actually cycling → individual reps become
invisible. Case 002: t53–55.5 showed one clean top→bottom; t56–68 the framing shifted (head tilted
up) and the bar stayed chest-framed, so reps couldn't be isolated. **Don't promise an exact integer
from egocentric video** — the head-tilt confound is not fixable with more fps; needs the IMU (and for
head-still curls, a WRIST IMU).

## The aliasing-vs-legibility bind (case 001) — counting is hard from video

A fundamental tradeoff when tiling frames to count: dense enough to not alias fast turnarounds
(≥4fps) makes each tile too small to read; sparse enough to read (1–2fps) can miss turnarounds and
undercount. **No single montage is both.** Treat any vision-only egocentric count as low-confidence.

## Simultaneous vs alternating (2× / ÷2 confound)

With two implements (e.g. two-dumbbell curl): **simultaneous** → each looming = 1 rep;
**alternating** → looming events come twice as often and the per-arm count halves (swings the answer
by 2×). In the product it appears as **one vs two interleaved frequency components in the IMU trace**.

**How to classify it from video (case 001 method — don't repeat my mistake):** the determinant is
whether the headband FOV catches *both* implements at the top. A head cam often frames only one
dumbbell at the top even during a simultaneous curl, because the hands are shoulder-width apart and
the head angle varies. So **one-at-a-time frames are NOT proof of alternating.** Instead **hunt for a
single frame with both implements up at the top**: one such frame *proves* simultaneous (alternating
can never show both up at once); its consistent absence across a good *readable* sample suggests
alternating. **CORRECTION (case 001 was ALTERNATING, confirmed by the lifter):** my "both dumbbells up at
t49.3 → simultaneous" was WRONG. In an **alternating** curl there's a **crossover moment** where one
arm rises while the other descends, so both are mid-frame at once. **Both-visible ≠ both-at-top.**
To prove simultaneous you need both at the *top* together, not merely both in frame.

**Per-hand counting method (lifter's approach — preferred):** count one hand's top-of-curl events,
then the other, and use the second count as a cross-check (should match for alternating). It's
stricter than "count every looming peak" — it forces dropping ambiguous/head-bob frames — so it's
more accurate. **But on egocentric footage it's largely defeated:** the head turns to watch the
active arm, so the working dumbbell is always ~centered (position stops encoding handedness);
identical dumbbells + frame rotation remove the other cues. Partial rescue: a **wristwatch** uniquely
tags one hand when the wrist is visible. Real fix: the per-hand split runs cleanly on the **IMU
yaw channel** — alternating glances = alternating head-yaw; yaw-left vs yaw-right counts cross-check.

Lesson retained: **build a readable montage and look before declaring unresolvable** — but also
**don't over-read a single frame** (the t49.3 mistake).

**Bottom line (case 001):** rep counting is the dimension *least* suited to vision-only egocentric
analysis — the mirror of exercise ID. It needs a clean periodic *temporal* signal → the head IMU.
Report a range + low confidence from video; defer the integer to sensors.

## Failure modes seen / to watch

- **Undercount from low fps** — at 2 fps a fast turnaround can fall between frames. If cadence looks
  fast, re-extract at higher fps (see `frame-extraction.md`) before committing a count.
- **Double-count on ballistic lifts** — the eccentric (lowering) can look like a second rep. Anchor
  the count to one unambiguous moment per rep (e.g. top lockout only).
- **Clip truncation** — clips that start mid-set or cut before the last rep finishes. Always note
  whether the first and last reps are fully captured.
- **Tempo/rest pauses** — a long hold isn't a new rep. Distinguish a pause from a turnaround.

## Reporting

Give the count, the rep definition used, and per-rep frame ranges (or the cadence reasoning) so the
count is auditable against the frames.

_(Seed file — add concrete, generalizable rules as clips expose them.)_
