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
rep/exercise working window. **SAMPLE THE LOADING WINDOW DENSELY** — the face-on glance lasts a
fraction of a second, so once you've bracketed it to a few seconds, re-extract at **fine 0.3s steps**
(`-ss 22.0, 22.3, 22.6 …`), not 1fps (case 20260711: 1fps t24 was motion-blurred → I wrongly quit at
"unreadable"; **t24.3** was tack-sharp and read `1 KG / DOMYOS / 2.2 LBS`). For a barbell/spinlock the
readable moment is the instant the lifter holds a **plate face-on while loading** it (case 002: I
missed t40 sampling t10–48 sparsely). Cheap plates may be **LB-marked** or **dual kg+LB marked**:
4.4 LB = 2 kg, 5.5 LB = 2.5 kg, 11 LB = 5 kg — convert. **A device-GALLERY screenshot (paused = full
sharpness) beats any `ffmpeg -ss` frame** for dark-on-dark embossing — how case 001 was solved.

### Step 1b — Geometry decides readability: dumbbell EASY, barbell HARD (case 002)
A **dumbbell head faces UP** when laid flat → a staging frame reads the number (case 001). A
**barbell's plate faces point SIDEWAYS** during the lift AND floor-loading → the number rarely faces
a head cam (case 002: edge-on/blurred → unreadable). For a barbell, plan to **count plates + add the
bar**, not read a face.

### Step 1c — READ THE FLAT FACE, NOT THE DOMED BACK (case 20260711)
Once a plate is **loaded on the bar**, the camera sees its **smooth domed/convex BACK** — the
embossed denomination is on the **flat INNER face**, hidden against the collar. So a loaded bar-end is
the WRONG place to read; it looks "unreadable" because the number isn't on that side. The denomination
is legible only on the plate's **flat face**, seen when it's **at rest face-up** or **held face-on
during loading**. Don't conclude "unreadable" from a domed-back / loaded-end view — go find the flat
face.

### Step 2 — Find where the number lives, by equipment
- **Dumbbell:** number on the **end head** (catch the frame where a head faces the camera).
- **Pin-loaded stack:** number at the **PIN**, not the top plate.
- **Plate-loaded barbell/machine:** read each plate face; **total = Σ plates + the BAR** (Olympic =
  20kg/45lb). IWF colour cross-check: red25 blue20 yellow15 green10 white5.
- **Loadable / spinlock dumbbell:** **weight = Σ plate denominations — do NOT add the handle**
  (home convention; the handle is light). (Contrast a barbell, where you DO add the bar.)
- **Fixed dumbbell / kettlebell:** read the cast number. **Bodyweight:** "not applicable".

### Step 3 — Read the number; if you can't, COUNT plates
**READ THE LABEL FIRST — do not relapse to diameter.** Reading the embossed denomination beats
inferring from size (case 001: diameter said "~5kg", label said 2.5kg → 2× off; case 20260711: I
"guessed ~1.25kg from ~14cm" but the label said **1 kg**). Diameter is a **last resort**, flagged.
When you crop the flat face, look for a **dual `KG` + `LBS` stamp** — it **self-confirms** the value
(1 KG/2.2 LBS, 2.5 KG/5.5 LBS, 5 KG/11 LBS); if the two agree you can report high confidence even on
a soft frame. Only if unpainted cast AND unreadable even at rest, fall back to **count plates per side
× denomination (diameter: ~14cm≈1.25kg, ~18cm≈2.5kg, ~23–25cm≈5kg) + handle/bar** — bounded estimate.

### Step 4 — Don't mis-judge "loaded"
- **A bare bar/handle CENTRE is NOT empty** — plates sit at the **ENDS** (often off-frame). To judge
  load, find a frame showing a bar END.
- **Equipment state PERSISTS** — if a nearby frame shows it loaded, it's loaded in the in-between
  frames too (don't re-judge per frame).

### Step 4b — TALLY at presentation; NEVER count the assembled stack; ABSTAIN if unsure (case 20260713)
Reading a denomination ≠ knowing the total, and these are **different algorithms**. Full pipeline:
`docs/video-analysis-kb/weight-tally-pipeline.md`.
- **NEVER derive a total by counting the final edge-on stack.** Overlapping domed discs of similar
  diameter can't be counted or sized, and a hidden inner plate of another denomination is unrecoverable
  (a 2kg and a 1.25kg look identical stacked). This is the trap that produced a flip-flopping answer on
  case 20260713 — do not repeat it.
- **Instead, TALLY each plate as it is PRESENTED face-on** (staging glance / held-while-loading): OCR
  each, then **de-duplicate** (the same plate held across adjacent frames = ONE plate; a genuinely new
  plate is separated by a threading action). Total = Σ of the plates you actually read, ×2 sides if
  symmetric.
- **LOADED ≠ INVENTORY** — plates on the mat are stock; only count what goes ON. But equally, don't
  assume "stays on the mat" — case 20260713 had BOTH 2kg and 1kg plates loaded (mixed).
- **ABSTAIN, don't confabulate or waver.** If the tally isn't internally consistent (a plate unread, or
  the loadout/symmetry unresolved), output **"weight unverified — N plates, denominations {…}, loadout
  needs confirmation"** — a single stable abstention, NOT a shifting range across passes. A wrong/
  wavering number is worse than a clean "confirm required." On the product this is the 1-tap user-confirm
  (then cached per-user, since a plate set is stable).

### Step 4c — Are the stacked plates the SAME size? Don't fool yourself (case 004)
When a loadable might be MIXED, resist confirming "uniform." Case 004: I called a **2 kg + 1 kg** stack
"2×2 kg" and reported the wrong total. Guard rails:
- **Never force a trace to your hypothesis.** If you overlay circles/measure diameters, trace the
  ACTUAL rim and let the numbers fall where they are. Drawing two equal ellipses and reading it back as
  "equal" is manufactured evidence, not verification.
- **Compare INNER vs OUTER within ONE end** — never end-vs-end. Two ends whose *outer* plates match
  says nothing about a smaller *inner* plate; that comparison is structurally blind to a mix.
- **Use the OFFSET loading frame, not the flush/assembled stack.** Once plates are pushed together, a
  smaller inner plate hides recessed directly behind the larger outer one (same silhouette). During
  loading the plates are separated and the size gap is measurable (case 004: obvious at the mid-load
  frame, invisible in the assembled shot). A diameter ratio ~0.72 (1kg vs 2kg) / ~0.78 (1.25 vs 2.5)
  ⇒ MIXED.
- **Believe your own reads.** If you READ two different denominations face-on (e.g. a 2 kg AND a 1 kg),
  the loadout is MIXED — do not invent "the small one was shown but not loaded" to save a round number.

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
- **DOMYOS cast spinlock plate (Decathlon):** grey/black cast iron, embossed `DOMYOS` + a **dual
  `KG`/`LBS`** denomination stamp on the **flat face** (readable face-on; domed back is blank). Known
  members:
  - **1 kg** — `1 KG / 2.2 LBS`, ~13cm, small domed. Read face-on during loading (case 20260711).
  - **1.25 kg** — thin ~14cm; number dark-on-dark → **effectively unreadable, COUNT plates** (case 003).
  - **2.5 kg** — `2.5 KG / 5.5 LBS`, ~18cm; typically 1/end → a pair = **5 kg/dumbbell** (case 001).
  Spinlock loadable ⇒ **weight = Σ plate denominations, NO handle added.** Same brand ≠ same
  denomination — always read/confirm which member (001 was 2.5kg, 20260711 was 1kg).

## Honest limits → the product
**Unpainted cast adjustable dumbbells are the worst case** — no legible number at any glance; the POC
"glance-at-the-weight" OCR can't work on them. Mitigations: a plate-counting model, **ask the user to
confirm**, or **target commercial gyms first** (painted pin stacks / fixed dumbbells OCR cleanly).
The product's weight-glance should fire at the **staging moment** (pickup/set-down, eyes on a still
face-on plate), not mid-rep. See `docs/video-analysis-kb/weight-reading.md`.

## Discipline
Never invent a number. Report value + unit + the exact frame + the unit basis + confidence; if no
frame shows it legibly, say "unreadable" and (if loadable) give the plate-count estimate with a range.
**Commit once — don't waver.** If you can't resolve the loadout, emit a SINGLE stable abstention
("weight unverified — needs confirmation"), not a total that shifts across passes. A wavering answer is
the worst outcome: it signals the method is uncalibrated. Tally at presentation, never count the
assembled stack, and abstain cleanly. Full approach: `docs/video-analysis-kb/weight-tally-pipeline.md`.
