---
name: weight-lifted-analysis
description: >
  Read the working WEIGHT lifted in an egocentric (headband / first-person) workout video clip — or
  say "not applicable" / "unreadable" honestly. Built from the IronPal video-analysis KB
  (docs/video-analysis-kb/weight-reading.md). Use when asked how much weight / what load is in a clip,
  or via /weight-lifted-analysis <clip>.
---

# Weight-lifted analysis (egocentric workout clips)

Goal: report the **working weight** (value + unit + confidence + the frame it was read from), or
**"not applicable"** (bodyweight) / **"unreadable"**. Exercise naming and rep counting are separate
skills. **Never guess a number** — an honest "unreadable" beats a fabricated figure.

**No AI model does the reading** — it's a multimodal LLM (Claude) reading JPEG frames + the heuristics
in `docs/video-analysis-kb/weight-reading.md`. (The POC `vision.py` calls GPT-5-nano with a "read the
printed number" prompt — which ASSUMES a legible painted number and fails on unpainted cast plates.)

## Weight is the OPPOSITE of rep counting
Reps need temporal density across many frames; **weight needs maximum SPATIAL detail on ONE still,
face-on frame**. So: find the single best frame, pull it at native 4K, crop+upscale — don't tile.

## Tooling notes (this rig)
- Header: `ffmpeg -i <clip> 2>&1 | grep -E "Duration|Stream.*Video"`.
- **Un-rotate first**: `-vf "transpose=2"` (NOT mirrored; verify mat text readable + watch on LEFT
  wrist). Don't downscale before reading — embossed/printed numbers die under compression (`-q:v 2`).

## Method

### Step 0 — AUTONOMOUS ROUTING (do this first — let motion find the still frames)
Run `scripts/kb/motion_profile.sh <clip>` on the whole clip. Its motion-energy profile auto-lists the
**STILL windows** (below-median troughs) — exactly the staging glances where a plate is face-on and
legible — so you scan those high-res instead of waiting to be told "look at t=9s". This automates the
whole-clip re-scan Step 1 demands. Full protocol:
`docs/video-analysis-kb/autonomous-frame-selection.md`.

### Step 1 — Scan the WHOLE clip for a STAGING frame (don't anchor to the lift)
The number is legible only when the equipment is **still and face-on** — usually a **staging moment**:
pre-pickup (weight at rest on the floor/rack) or post-set-down, and the brief **glance** when the
lifter selects/loads it. NOT during the lift (motion blur, bad angle). Case 001: every moving frame
was unreadable; the **t=9s pre-pickup frame** read cleanly. **Re-scan from t=0** — don't reuse the
rep/exercise working window. **SAMPLE THE LOADING WINDOW DENSELY** (~1fps, not sparse points) — for a
barbell the readable moment is the brief instant the lifter holds a **plate face-on while loading**
it (case 002: I missed t40 — the only face-on glance — sampling t10–48 at sparse points). Cheap
plates may be **LB-marked**: 4.4 LB = 2 kg, 5.5 LB = 2.5 kg, 11 LB = 5 kg — convert.

### Step 1b — Geometry decides readability: dumbbell EASY, barbell HARD (case 002)
A **dumbbell head faces UP** when laid flat → a staging frame reads the number (case 001). A
**barbell's plate faces point SIDEWAYS** during the lift AND floor-loading → the number rarely faces
a head cam (case 002: edge-on/blurred → unreadable). For a barbell, plan to **count plates + add the
bar**, not read a face.

### Step 2 — Find where the number lives, by equipment
- **Dumbbell:** number on the **end head** (catch the frame where a head faces the camera).
- **Pin-loaded stack:** number at the **PIN**, not the top plate.
- **Plate-loaded barbell/machine:** read each plate face; **total = Σ plates + the BAR** (Olympic =
  20kg/45lb). IWF colour cross-check: red25 blue20 yellow15 green10 white5.
- **Loadable / spinlock dumbbell:** **weight = Σ plate denominations — do NOT add the handle**
  (home convention; the handle is light). (Contrast a barbell, where you DO add the bar.)
- **Fixed dumbbell / kettlebell:** read the cast number. **Bodyweight:** "not applicable".

### Step 3 — Read the number; if you can't, COUNT plates
Prefer reading the embossed/printed denomination (reading the label beats inferring from size —
case 001: diameter said "~5kg/plate", the label said 2.5kg → size was 2× off). If unpainted cast and
unreadable even at rest, fall back to **count plates per side × denomination (infer from diameter:
~14cm≈1.25kg, ~18cm≈2.5kg, ~23–25cm≈5kg) + handle/bar** — a bounded estimate, flag it as such.

### Step 4 — Don't mis-judge "loaded"
- **A bare bar/handle CENTRE is NOT empty** — plates sit at the **ENDS** (often off-frame). To judge
  load, find a frame showing a bar END.
- **Equipment state PERSISTS** — if a nearby frame shows it loaded, it's loaded in the in-between
  frames too (don't re-judge per frame).

### Step 5 — Unit inference (kg vs lb)
Read an explicit kg/lb/# mark if present. Else infer from context (EU gym / IWF colours → kg; US
45/35/25 plates, "#" → lb) and **state the inference + lower confidence**.

### Step 6 — Report
```
Weight: <value> <unit>   (confidence 0..1)   | "not applicable" | "unreadable"
Read from: <frame/timestamp> — <number read OR plate count + denomination>
Unit basis: <explicit mark / inferred from ...>
Uncertainty: <occlusion, motion blur, per-side vs total, unit ambiguity>
```
Log a case in `docs/video-analysis-kb/cases/` and add calibrated plate types to `weight-reading.md`.

## Calibrated plate types (read accurately next time)
- **DOMYOS cast spinlock plate (Decathlon):** grey cast iron, embossed `DOMYOS` + denomination
  (`2.5 kg` …); 2.5kg ≈ 18cm dia, typically 1/end → a pair = **5 kg/dumbbell** (NOT 7 — no handle).

## Honest limits → the product
**Unpainted cast adjustable dumbbells are the worst case** — no legible number at any glance; the POC
"glance-at-the-weight" OCR can't work on them. Mitigations: a plate-counting model, **ask the user to
confirm**, or **target commercial gyms first** (painted pin stacks / fixed dumbbells OCR cleanly).
The product's weight-glance should fire at the **staging moment** (pickup/set-down, eyes on a still
face-on plate), not mid-rep. See `docs/video-analysis-kb/weight-reading.md`.

## Discipline
Never invent a number. Report value + unit + the exact frame + the unit basis + confidence; if no
frame shows it legibly, say "unreadable" and (if loadable) give the plate-count estimate with a range.
