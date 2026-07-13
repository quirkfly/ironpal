# Weight-reading heuristics

Read the **working weight** lifted, or say it's not applicable / unreadable. Never guess a number.

## Where the number lives, by equipment

- **Dumbbell** — number printed/embossed on the end head. Often only one head faces the camera;
  catch the frame where it does. Fixed dumbbells show the total; the number *is* the weight.
- **Pin-loaded stack (machine/cable)** — the selected weight is the number on the plate the **pin**
  is inserted into, not the top plate. **Do NOT eyeball the pin's column against the label strip** —
  that is what produced four wrong answers in a row on case 005. Read it by **COUNTING EMPTY HOLES
  FROM THE TOP** instead (see the dedicated section below).
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

### Read the FLAT embossed face, not the DOMED back — and don't relapse to diameter (case 20260711)
Same DOMYOS plates as case 001, yet I called them "unreadable." Post-mortem — three self-inflicted misses to avoid:
1. **Wrong face.** Once a plate is **loaded on the bar**, the camera sees its **smooth domed/convex
   BACK**; the embossed `DOMYOS + kg` is on the **flat INNER face**, hidden against the collar. The
   number is legible ONLY on an **at-rest, face-UP** plate (like a dumbbell head laid flat, case 001) —
   NOT on a loaded bar-end. So read the staging/at-rest plate, not the loaded end.
2. **Diameter relapse.** I fell back to "~14cm → ~1.25kg" — the exact size-inference that was **2× off
   in case 001** (size said 5kg, label said 2.5kg). Read the LABEL first; use diameter only as a last
   resort and flag it.
3. **Quit too early.** Case 001 took THREE "unreadable→readable" reversals before the t9 staging read.
   Sweep the whole at-rest window (several timestamps) for the sharpest face-up glance before declaring
   unreadable. **A device-GALLERY screenshot (paused = full sharpness) beats any `ffmpeg -ss`
   extraction** for dark-on-dark embossing — how case 001 was actually solved.
4. **1.25 vs 2.5 kg fork.** DOMYOS 2.5kg ≈18cm (readable, case 001); DOMYOS **1.25kg thin ≈14cm**
   (dark-on-dark, **effectively unreadable → COUNT plates**, case 003). If the plate reads small/thin,
   expect to count, not OCR — that's a correct outcome, not a failure.

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
- **DOMYOS 1.25 kg thin cast plate (case 003, confirmed):** grey cast iron, ~14cm dia, **thin** —
  stacks several to a side. Number is **dark-on-dark embossed → effectively unreadable** on a head cam;
  identify by the thin profile + small dia and **count plates**. Case 003 rig = **4 × 1.25kg/side =
  10 kg** total plate mass. (My count estimate ~5/side was over by 1; denomination 1.25 was in range.)
- **DOMYOS 1 kg cast plate (case 20260711, READ):** black cast iron, small ~13cm dia, domed. Face is
  **dual-marked `1 KG` + `2.2 LBS`** around a central `DOMYOS` wordmark — READABLE when held **face-on
  during loading** (t24.3), NOT on the loaded bar-end (domed back only). The dual kg/lb stamp
  self-confirms the denomination (1 kg = 2.2 lb). Reinforces: **hunt the face-on loading glance** and
  read the flat face; don't judge these off the domed back or by diameter.
- **DOMYOS 2 kg cast plate (case 20260713, READ):** black cast iron, ~18cm dia (clearly larger than
  the 1/1.25kg). Face **dual-marked `2 KG` + `4.4 LBS`** around `DOMYOS`. Read cleanly face-on during
  loading (t12, t31). NB the DOMYOS home set spans **1, 1.25, 2, 2.5 kg** — **same brand, MANY
  denominations**; always read the number, never assume one.

## COUNT/SIZE the LOADOUT from the load ORDER, not the assembled edge-on stack (case 20260713)
Reading a *denomination* is solved (face-on loading glance). The unsolved-by-a-single-frame part is the
**total** — how many plates of which size are on each end. Hard-won rules:
- **An edge-on assembled stack is NOT reliably countable or sizable.** Overlapping domed discs hide how
  many there are and whether an inner plate is smaller — a 2kg and a 1.25kg disc look identical stacked
  behind each other. Do **not** claim "uniform" (or a total) from the final stack. (Case 20260713: I
  wrongly called "2×2kg = 8kg uniform" from the assembled ends.)
- **LOADED ≠ INVENTORY.** Plates lying on the mat/floor are *available stock*, not necessarily *loaded*.
  Case 20260713: the inventory was mixed (2kg **and** 1kg DOMYOS), but tracing the load showed only the
  **2kg** plates were threaded on — the 1kg plates **stayed on the mat**. Reading the mat as "mixed
  loadout" is as wrong as assuming uniform. **Watch what actually goes ON the handle.**
- **Method:** trace the load ORDER on a dense montage (~1.3–2fps, un-rotated, big tiles) from bare
  handle → locked collar. Count each plate as it's **threaded on** and read its face at the moment it's
  presented (they usually show it face-on first). The total = Σ of the plates you watched go on — not a
  guess from the end stack, and not a tally of everything on the floor.
- Still can't resolve count/mix after tracing (head-cam looks away, hands occlude) → report the
  **confirmed denominations + a bounded total** and say the exact per-end count is unverified; 1-tap
  user-confirm on the product.

## CABLE / LEVER rigs: loaded plate mass ≠ resistance at the handle (case 003)
A plate-loaded **cable or lever rig** (home pushdown/row station, DIY lever) **decouples the load from
the working weight**: the resistance felt at the handle = plate mass × the **lever-arm / pulley ratio**,
which is **not determinable from video**. So even a *perfect* plate read (case 003: 10 kg of plates,
later confirmed) does **NOT** give the working weight. Report the **loaded plate mass** if you can read
it, but explicitly flag that the **handle resistance is unknown** (ratio) — don't present plate mass as
the working weight. Compounding problem: plates loaded **edge-on on a lever axle** never face the cam,
so even the denomination usually needs the brief face-on loading glance (or the user). Reliable source
on the product = a **cable-tension / load-cell** reading, not vision. (Contrast: barbell = Σplates+bar;
pin stack = read the pin; loadable dumbbell = Σplates — those map mass→working weight directly; a lever
rig does not.)

## PIN-LOADED STACK: COUNT EMPTY HOLES FROM THE TOP — do not eyeball the pin column (case 005)
A selectorized stack is a **clean painted OCR target** — and yet I gave **four wrong answers**
(45 → 53 → 61 → 69 kg, all too high) on one sharp gallery photo before the lifter told me the method:
**"just zoom the original and count the empty holes from the top."** Actual = **37 kg**. Why I kept
missing, and the rule that fixes it:
- **NEVER read a pin stack by eyeballing which label the knob lines up with.** The selector **knob is a
  wide domed body**, offset and perspective-shifted from the thin plate it actually plugs into; anchoring
  on the knob's bulk lands you several plates too heavy (my 45–69 kg were all knob-body guesses). The
  label strip and the hole row are also at **different heights**, so a photographed-at-an-angle stack
  shears the two apart — a label is never directly above "its" hole.
- **DO count the EMPTY (open, dark) holes from the TOP** (lightest plate) down to the pin. Every plate
  above the selected one is lifted clear, leaving its hole **open**; the pin sits in the first
  **filled** hole. `selected plate index = (empty holes from top) + 1`.
- **Convert index → weight from the printed scale.** This stack: top plate `13 KG`, **+8 kg per plate**
  (13, 21, 29, 37, 45, 53 … 165). So **weight = 13 + 8 × (empty holes from top)**. Case 005: **3** empty
  holes (13, 21, 29 open) → pin in the 4th plate → **37 kg**. Always read the actual first-plate value
  and step off the label ladder; don't assume 13/+8.
- **To count reliably, put labels and holes in ONE aligned crop** and trace each plate's vertical strip
  from its number down to its hole. Counting holes on a hole-only crop risks losing which plate hole #1
  belongs to (is the first open hole the 13 or the 21?). The combined crop anchors the count.
- **The rounded-rectangle border around each number is the STICKER outline, not a selector highlight.**
  Every label has one. I briefly "read" 29 kg because I mistook that box for a selection indicator — it
  is not; it is on all of them.
- **Tooling gotcha (this rig):** `convert -auto-orient` rotated this Samsung JPEG to **portrait**, so
  crop offsets tuned to the landscape view I was actually looking at pointed at the wrong region. Crop
  **without `-auto-orient`** to match the as-displayed orientation (photos, unlike the rotated video,
  render correctly already), or recompute offsets for the rotated frame.

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
