# Weight-reading heuristics

Read the **working weight** lifted, or say it's not applicable / unreadable. Never guess a number.

## Where the number lives, by equipment

- **Dumbbell** — number printed/embossed on the end head. Often only one head faces the camera;
  catch the frame where it does. Fixed dumbbells show the total; the number *is* the weight.
- **Pin-loaded stack (machine/cable)** — read the number on the plate where the **pin** is inserted.
  The selected weight is the printed number at the pin, not the top plate.
- **Plate-loaded (barbell / machine)** — sum the visible plates per side × 2, **plus the bar**
  (Olympic bar = 20 kg / 45 lb unless clearly otherwise). Read the number on each plate face;
  colour-coded plates (IWF) are a cross-check: red 25, blue 20, yellow 15, green 10, white 5.
- **Fixed/other** — fixed barbells, kettlebells, weighted machines: read the cast number.
- **Bodyweight** — weight = "not applicable". Note added load if any (vest, belt + plate).

## Unit inference (kg vs lb)

- Read an explicit "kg"/"lb"/"#" mark if present.
- Otherwise infer from context: European gym / IWF colour plates → kg; US commercial gym, 45/35/25
  plates, "#" → lb. **State the inference and lower confidence** when there's no explicit unit.

## Failure modes

- **Occlusion / motion blur** — the number is only legible in a still glance. If no frame is clear,
  report "unreadable", don't interpolate.
- **Per-side vs total** — for plate-loaded, be explicit whether you're reporting one side or the
  loaded total (always report the **total including bar**).
- **Selectorized confusion** — adjustable dumbbells/stacks: read the current selection, not the max.

## Adjustable / spinlock cast dumbbells — worst case (case 001)

Bare cast-iron plates have **unpainted, embossed** markings → near-zero contrast, illegible under
any motion, and often **decorative/brand text, not a denomination**. Number-reading FAILS. Fall back
to **plate-counting**:
1. Find an edge-on, close, slow frame (the **pickup** is best — slower & nearer than mid-rep).
2. Count plates per side (×2 for total plates).
3. Infer denomination from **plate diameter** vs a hand (~9cm): ~14cm→1.25kg, ~18cm→2.5kg,
   ~23–25cm→5kg.
4. Total = Σ plates + **handle** (spinlock bar ≈1.5–2kg).
Gives a bounded estimate. BUT first try to actually READ the label (below) — it beats diameter
inference. Case 001: diameter guess said ~5kg/plate; the **label said 2.5kg** — size inference was
2× off. Read > estimate.

## BARBELL plates are harder to read than a DUMBBELL (case 002)
Equipment geometry decides readability from a head cam:
- **Dumbbell:** the **head faces UP** when the dumbbell lies flat → a staging frame reads the number
  cleanly (case 001: DOMYOS 2.5kg read at t=9s).
- **Barbell:** the **plate faces point SIDEWAYS** during both the lift (bar horizontal across the
  body) and floor-loading (bar lying flat) → the number rarely faces the camera. Case 002: edge-on at
  loading, motion-blurred at set-down → denomination **unreadable** → fell back to plate-count + bar.
So for a barbell, expect to **count plates + add the bar**, not read a face. And remember the
arithmetic split: **barbell total = Σ plates + BAR; loadable DUMBBELL = Σ plates, NO handle.**
BUT — the lifter often holds a plate **face-on while loading it**; that brief glance is readable.
Case 002: t40 showed the plate face-on → embossing read **"4.4 LB" = 2 kg**. **SAMPLE THE LOADING
WINDOW DENSELY** (not sparse points) — the face-on moment is brief and easy to skip (I missed t40
sampling t10–48). Also: cheap plates may be **LB-marked** (4.4 LB = 2 kg, 5.5 LB = 2.5 kg, 11 LB =
5 kg) — convert.

## FIRST scan for a STAGING frame (the lesson that keeps repeating)

Before concluding "unreadable", scan the **whole clip** for a moment the equipment is **at rest and
face-on** — typically **before the pickup or after the set-down**, not during the lift. Case 001: the
number was illegible in every moving frame (t22+), but a **still staging frame at t=9s** (dumbbells
lying face-up on the floor, pre-pickup) read cleanly: **DOMYOS, 2.5 kg** embossed. So:
- Unpainted cast embossing = unreadable **in motion**, but **readable at rest, face-on, tight crop**.
- Don't anchor the weight search to the lift; the best weight frame is usually the staging moment.
Case 001 final (ground-truth corrected): 2× DOMYOS 2.5kg plates/dumbbell = **5 kg/dumbbell.**

## Loadable dumbbell weight = PLATE SUM. Do NOT add a handle estimate (case 001 correction)

Case 001 plate read was CORRECT (DOMYOS 2.5kg ×2 = 5kg); my error was **adding a ~1.5–2kg handle**
→ reported 7kg vs actual **5kg**. Rule for adjustable/spinlock dumbbells:
- **weight = Σ plate denominations** (e.g. 2 × 2.5kg = 5kg). Report this number.
- **Do NOT add the handle/bar** weight. Home spinlock convention (and how lifters report it) counts
  the plate load only; the handle is light and excluded. (Contrast a *barbell*, where you DO add the
  20kg bar — that rule is barbell-specific, do not carry it over to dumbbells.)

### Calibrated plate types (read accurately next time)
- **DOMYOS cast spinlock plate (Decathlon):** grey cast iron, embossed `DOMYOS` + denomination
  (`2.5 kg` etc.). 2.5kg plate ≈ 18cm dia. Typical loading **1 per end = 2/dumbbell**. So a pair of
  2.5kg plates ⇒ **5 kg/dumbbell** (NOT 7 — no handle added).

**Product implication:** the POC "glance-at-the-weight" OCR UX assumes a *printed/painted* number
(`vision.py` WEIGHT_SYSTEM) and **cannot work on unpainted cast plates**. Mitigations: plate-counting
model, ask the user to confirm, or target commercial gyms first (painted pin stacks / fixed
dumbbells OCR cleanly). Home cast dumbbells ≈ the hardest weight case the product will hit.

## Judging whether a bar is loaded (two rules — case 002 errors)

**Rule 1 — A bare bar CENTER is NOT an empty bar.** Plates sit at the bar **ENDS**, never the center
(the center is the grip). "No plates in the visible middle" is exactly what a *loaded* bar looks like
too → it is **zero evidence of an empty bar**, especially in egocentric close-ups where the ends fall
off-frame. To assess load, find a frame that actually shows a **bar END**; don't infer "empty" from a
bare middle.

**Rule 2 — Equipment state PERSISTS across frames; don't re-judge load per frame.** If nearby frames
show the bar loaded (case 002: plates clearly on at t18/t30/t70), it is loaded in the in-between
frames too, even when the plates aren't in view — barring an actual plate-removal you can see. Carry
the loaded-state forward from the staging/load frame rather than resetting the judgment each frame.

## Reporting

Give value + unit + the frame you read it from + the unit-inference basis + confidence. For
unpainted cast plates, report the **plate-count estimate + range**, and say the number was not read.

_(Seed file — add concrete, generalizable rules as clips expose them.)_
