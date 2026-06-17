# Analysis pipeline strategy — scaling exercise / rep / weight recognition

How we go from the **manual, supervised, vision-only** analysis used to build this KB (cases 001–003)
to a **structured, automated, sensor-first** pipeline. Companion to `sensor-fusion.md` (fusion
mechanics) and `ironpal-poc-v1-design.md` (enrollment fingerprints). This doc is the *why and the
shape*; `sensor-fusion.md` is the *how* of the fusion step.

## Diagnosis: why the manual approach was slow AND wrong
Cases 001–003 scored **Exercise 1/3, Reps 0/3 exact, Weight never cleanly read**. The bottleneck was
**not** a shortage of reference examples — it was doing recognition with **egocentric vision alone, by
eye, frame-by-frame**. Every miss hit a limit more reference clips can't fix:
- **Case 002** — grip ambiguity (supinated curl vs pronated upright row).
- **Case 003** — cable-vs-free-weight mis-class; **axial-stroke reps invisible to a head-cam**;
  lever-rig weight undecodable from video.

Conclusion: the fix is **change the sensor mix and automate the frame routing**, not "feed the eyeballs
more footage."

## Evaluating the "ingest clips from world-leading apps" idea
**Verdict: don't use their clips for recognition; mine them only for taxonomy.**
- ✗ **Perspective mismatch (fatal):** Fitbod/Freeletics/etc. are **third-person** full-body views.
  IronPal is **egocentric, head-down**, where cues invert (you see hands/implement/floor, not the
  body). Third-person references don't transfer and would mislead — the exact gap that made these
  cases hard.
- ✗ **No IMU stream, no per-frame ground truth** — they lack the channel the product depends on.
- ✗ **IP/legal exposure** — scraping copyrighted app content (Fitbod copyright was already flagged in
  this project's video work).
- ✓ **What they're good for:** the **exercise taxonomy + canonical mechanics** (names, variants,
  expected joint/trajectory per lift) → feeds our `exercises/*.md` signature/expected-trajectory
  tables. Cheap, legal, high value. And UX benchmarking.

## The target pipeline — enrollment-based, sensor-first, vision-arbitrates
Aligned with the POC's per-user "fingerprint" design and everything cases 001–003 taught.

1. **Own egocentric + IMU reference set via ENROLLMENT** (not borrowed clips). Case 003 was already
   this: an instrumented capture (EMG + a cable/draw-wire ground-truth rig). Each enrolled rep stores
   **egocentric video + IMU traces (accel/gyro/mag) + labels (exercise, reps, weight)** — the only
   data with the right perspective *and* the sensor channel.
2. **Sensor-first decisioning, vision as arbiter** (see `sensor-fusion.md` for the fusion pipeline):
   - **Reps → IMU periodicity is the rep clock, never vision.** For head-still / **axial-stroke**
     exercises (pushdown, case 003) the headband IMU is weak too → **wrist IMU or cable-tension**.
   - **Exercise ID → IMU motion-signature match to enrolled templates**, with **vision arbitrating**
     what IMU can't split: head-still arm pairs (curl vs raise) and **equipment class** (cable vs
     free weight — the trace that broke case 003).
   - **Weight → vision OCR at the staging glance** for legible plates / pin stacks; **load-cell /
     cable-tension** for rigs; **user-confirm** for unpainted cast (unreadable is the norm). NB a
     **cable/lever rig decouples plate mass from working weight** (case 003) — vision can't recover it.
3. **Automate the funnel we ran by hand.** Manual steps were: un-rotate → find the perform window →
   pull the few decisive frames at the right fps → route (staging frame for weight, perform frames for
   grip/ID). **The IMU automates the hardest part**: it segments load/perform/rest and gives
   world-vertical, so the system auto-extracts only the decisive frames and **calls the costly
   multimodal LLM only when the IMU flags ambiguity** — turning ~30 manual extractions into a handful
   of gated calls.
4. **Calibrated confidence + ABSTENTION.** The hardest-won discipline: **abstain rather than
   confabulate** ("unreadable"/"uncertain" beats a fabricated number). Low confidence → 1-tap user
   confirmation, which becomes new enrollment data (active learning).
5. **Keep the case-ledger / blind-test loop as the eval harness.** `cases/INDEX.md` (predicted vs
   actual, running accuracy) *is* the systematic measurement. Scale it: more clips, automated scoring,
   per-exercise accuracy.

## Challenges & mitigations
| Challenge | Mitigation |
|---|---|
| Egocentric data scarcity (can't borrow app clips) | Self-collect via enrollment; per-user templates |
| Per-user variation (mount angle, body, gear) | Per-user enrollment + a quick calibration capture |
| Head-still / axial exercises blind to head-cam vision | Wrist IMU + cable/load-cell; vision only for equipment/grip |
| Unpainted cast / lever-rig weights unreadable | Staging-glance OCR where legible; else load-cell or user-confirm |
| On-device cost (POC GPT-5-nano per frame) | **IMU-gate** the LLM: call only at staging / on ambiguity; batch frames |
| Unenrolled exercises | Graceful "unknown" + prompt to enroll — never a confident wrong guess |

## Bottom line
- **Don't** build around scraped third-person app clips (wrong perspective, no IMU, legal risk). **Do**
  mine those apps for the exercise *taxonomy/mechanics* only.
- **Do** make it **enrollment-based and sensor-first**: IMU/load-sensor carry reps and weight, vision
  arbitrates equipment/grip, the multimodal LLM is **IMU-gated**, and the system **abstains + asks**
  when unsure — more accurate *and* far cheaper/faster than the manual vision-only loop.

See also: `sensor-fusion.md` (division of labor + fusion pipeline), `exercise-identification.md`
(held-implement-first + cable-vs-free-weight trace), `rep-counting.md` (axial-stroke invisibility),
`weight-reading.md` (lever-rig mass≠resistance), `cases/INDEX.md` (the eval ledger).
