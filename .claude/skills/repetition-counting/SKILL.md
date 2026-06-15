---
name: repetition-counting
description: >
  Count the repetitions in an egocentric (headband / first-person) workout video clip, and report
  the reasoning honestly (range + confidence). Built from the IronPal video-analysis KB
  (docs/video-analysis-kb/rep-counting.md, sensor-fusion.md). Use when asked to count reps / "how
  many reps" in a clip, or via /repetition-counting <clip>.
---

# Repetition counting (egocentric workout clips)

Goal: given a first-person headband clip, count the **completed repetitions** — with an honest
**range and confidence**, plus per-rep frame evidence. Exercise naming is a separate skill
(`exercise-recognition`); weight is another KB section.

**There is no pose tracker / peak-detector / action model in the loop.** The "model" is a multimodal
LLM (Claude) reading extracted JPEG frames + the heuristics in `docs/video-analysis-kb/rep-counting.md`.
Accuracy comes from how frames are sampled and routed, not a recogniser.

## The headline truth (set expectations)
**From egocentric video alone you usually get a RANGE, not a certifiable integer.** Head motion and a
moving field-of-view inject "peaks" that aren't reps, and a head-mounted IMU — not video — is the
reliable rep counter. Report `~N (range a–b), confidence X`, and say the integer is IMU-territory.

## Tooling notes (this rig)
- `ffprobe` is a symlink to static `ffmpeg` → read the header with
  `ffmpeg -i <clip> 2>&1 | grep -E "Duration|Stream.*Video"`.
- Frames come out **rotated 90°** — **un-rotate first**: `-vf "transpose=2"` (NOT mirrored, don't
  hflip; verify: mat text readable + watch on LEFT wrist). No `drawtext` in this build → map tile→time
  by arithmetic.

## Method

### Step 1 — Isolate the working set (count only the PERFORM phase)
Equipment clips = **LOAD → GRASP → PERFORM**; only phase 3 has reps. Loading can eat most of a clip
(case 002: ~⅔ was loading). Find the load→grasp boundary, mark **set start and end** (exclude
pickup/set-down), and count *only* between them. Use cheap 1fps contact sheets to find the boundaries.

### Step 2 — Pick the rep signal: "looming cycles"
There's no body in frame, so count the **implement**, not the athlete. One rep = one cycle of the
defining motion = one **looming event** (implement rises close to the lens at the top → drops out at
the bottom). For squats/deadlifts the *floor* rises/falls instead; count its cycles.

### Step 3 — Sample at the right rate (mind the aliasing-vs-legibility BIND)
Tile frames into montages — counting needs **temporal density, not spatial detail**:
- **PERFORM phase rep count: ≥3 fps MINIMUM** (1–2 fps is only for finding structure/phase
  boundaries; 2 fps under-resolves turnarounds and lets a head-bob blip read as an extra rep —
  case 002: actual 4, a 2 fps montage gave ~5). Read at ≥3 fps in **small readable chunks** (e.g.
  3×3 tiles per ~3 s) so tiles stay legible.
- **fast/ballistic** (swing, clean, fast cable): 4–6 fps.
- **The bind (case 001):** dense enough to not alias (≥4fps tiled) makes tiles too small to read;
  readable (1–2fps) can skip a fast turnaround. **No single montage is both** → treat any vision-only
  egocentric count as low-confidence, and cross-check with a readable per-frame strip at the apexes.

### Step 4 — Count cycles, subtract the confounds
Count looming peaks across the set, then discount:
- **Head-bob false peaks** — the implement enters/leaves frame from *head* motion, not a rep. Peaks
  <~1.5s apart in a controlled lift are suspect.
- **Simultaneous vs alternating (2 implements: 2× / ÷2):** simultaneous → each looming = 1 rep;
  alternating → looming events double, per-arm count halves. **Hunt for ONE frame with both implements
  up at the top** — that proves simultaneous; one-at-a-time frames do NOT prove alternating (FOV may
  just crop the other). Report per-arm AND total-lifts if alternating.
- **Truncation** — note if the first/last rep is cut by the clip or the FOV.

### Step 5 — Report (range, not false precision)
```
Reps: ~N   (range a–b, confidence 0..1)
Rep definition: <what one rep is for this movement>
Evidence: <per-rep frame ranges / cadence reasoning, on the un-rotated working window>
Uncertainty: <head-bob, sim/alt, truncation, aliasing>
```
Log a case in `docs/video-analysis-kb/cases/` (predicted vs actual) and encode generalizable
corrections back into `rep-counting.md`.

## Why video struggles, and what fixes it (the product)
Reps need a clean **periodic temporal** signal; blurry, downsampled, monocular egocentric video
destroys it. The **head IMU** captures it perfectly → peak-count = the integer; simultaneous vs
alternating shows as **one vs two interleaved frequency components**. CAVEAT: the IMU is on the
*head*, so the signal is strong for **head-moving** exercises (squats/deadlifts) and **weak for
head-still arm work** (curls, raises, pushdowns) — for those, lean on the glance/yaw, vision, or a
future wrist IMU. See `docs/video-analysis-kb/sensor-fusion.md`.

## Discipline
This footage invites over-claiming. Don't assert a rep count you can't audit against the frames; don't
let head-bob inflate the tally; prefer a calibrated range with stated alternatives over a false
integer. The blind-test + case ledger is the real accuracy check.
