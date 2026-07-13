# Weight identification — a robust, automatable pipeline (post-mortem of the 20260713 failure)

**Why this doc exists.** On clip `20260713_115428` — a deliberately well-shot, close, in-focus plate-
loading demo — I read every denomination correctly but **failed repeatedly to state the total**, and
worse, I *flip-flopped* (8 → 6–8 → 8 → 6–10 kg). That is a process failure, not a "vision is too weak"
failure. This doc replaces the ad-hoc approach with a pipeline that is **precise by construction and
abstains instead of guessing**, so it scales to large footage without a human in every clip.

## The one root cause: I counted the ASSEMBLED stack instead of TALLYING at presentation
Two different problems were conflated:
- **Reading a denomination** — SOLVED. A plate shown **face-on** (staging glance or held-during-load)
  reads cleanly, even unpainted cast, with a tight crop (`2 KG/4.4 LBS`, `1 KG/2.2 LBS` both read here).
- **Determining the total** — I tried to **count/size the final edge-on stack**. This is *not solvable*
  from an egocentric head-cam: overlapping domed discs of similar diameter (a 2 kg vs a 2.5 kg, or a
  1 kg hidden inside two 2 kg) cannot be separated; hands and head-motion occlude; there is no scale.

**The fix is to never count the assembled stack.** Sum the plates **as each is presented**, then map to
the total. Counting-at-assembly and tally-at-presentation are different algorithms; only the second is
robust.

## The pipeline (precision-first; abstain, don't confabulate)

### Stage 0 — Classify the equipment (decides the whole strategy)
| Class | Weight signal | Automatable? |
|---|---|---|
| **Pin-loaded stack** (cable/machine) | read the number **at the pin** | ✅ high — one OCR |
| **Fixed dumbbell / kettlebell** | cast number on the head | ✅ high — one OCR |
| **Labeled/painted barbell plates** (commercial) | per-plate OCR + colour cross-check + bar | ✅ high |
| **Adjustable spinlock, unpainted cast** (home) | tally each plate at presentation; else **abstain** | ⚠️ conditional |
| **Cable/lever rig** | plate mass ≠ resistance (ratio unknown) | ❌ report plate mass, flag |

The first three are the **confident** cases — this is where automation should focus for scale. The last
two are where a human/sensor is needed; the pipeline's job there is to **say so cleanly**, not guess.

### Stage 1 — Route to the readable moments (reuse the motion router)
`scripts/kb/motion_profile.sh` already finds **STILL windows** (staging glances) and the **loading
window**. Weight lives in those, never mid-lift. Extract there at native 4K, no downscale.

### Stage 2 — TALLY plates at face-on presentation (the core change)
For adjustable/plate-loaded, do **not** wait for the assembled stack. In the loading/staging window:
1. Sample densely (~2–3 fps) and find frames where a plate face is **toward the camera** (a near-
   circular dark blob with a central bore; low motion-blur).
2. **OCR each presented plate** at a tight crop (read the dual `KG`/`LBS` stamp — self-confirming).
3. **Tally with de-duplication** — the hard part. The same physical plate can appear face-on in several
   consecutive frames; count it **once**. Heuristics: collapse same-denomination detections that are
   *temporally adjacent* (< ~1 s apart) into one event; a genuinely new plate is separated by a
   *threading action* (plate disappears onto the sleeve, hand returns empty). When two identical
   denominations are truly loaded, they are separated by a load action, not a continuous hold.
4. **Total = Σ tallied plates × their read denomination** (× 2 sides if symmetric and only one side was
   observed). Spinlock dumbbell → plate sum, **no handle**.

### Stage 3 — Calibrated confidence + ABSTAIN → user-confirm
Emit a total **only** when the tally is internally consistent:
- every plate read a legible denomination, AND
- the load actions match the plate count (N plates ⇒ N threading events), AND
- symmetry held (both ends, or a stated symmetric assumption).
Otherwise output **"weight unverified — N plates seen, denominations {…}, exact loadout needs
confirmation"** and, on the product, a **1-tap user-confirm**. Abstention is a *feature*: it keeps
precision high across large footage instead of emitting confident-but-wrong numbers.

## Honest limits — stated so we stop fighting them
- **Edge-on assembled counting is not a vision task.** Do not attempt it, do not report a total derived
  from it. (This is exactly what burned the 20260713 analysis.)
- **A hidden inner plate of a different denomination is unrecoverable** once the stack is built and
  collared — even a perfect load-order trace can miss it if the head looked away during that thread.
- **Home unpainted adjustable cast = the worst case, by design.** The correct product answer is **not a
  cleverer vision trick** — it is: read what's legible, then **ask the user once** and **remember it
  per-user** (a person's plate set is stable across sessions → confirm once, reuse forever). Or a
  load-cell / cable-tension sensor. See `analysis-pipeline-strategy.md`, `sensor-fusion.md`.

## For SCALE (the user's actual ask: large footage, accurate, timely)
Accuracy at volume comes from **high precision via abstention**, not high recall via guessing:
1. **Auto-route** the confident classes (pin stack, fixed dumbbell, painted plates) to per-frame OCR —
   these are fast and reliable, and are most of a commercial gym's equipment.
2. **Auto-flag** the adjustable-cast / lever cases as **"confirm required"** — do not spend LLM calls
   trying to force a total the pixels don't contain.
3. **Per-user memory:** once a user confirms their home plate set / a machine's stack, cache it; future
   clips of the same equipment skip the ask.
4. **Measure it:** score weight accuracy in `cases/INDEX.md` as **(exact | within-tolerance | abstained
   | wrong)**. Abstain is not a miss; **wrong** is the only real failure. The 20260713 clip should be
   logged as **wrong** (I emitted shifting totals) — the pipeline above would have logged it as
   **abstained (mixed loadout, confirm required)**, which is the correct behaviour.

See also: `weight-reading.md` (per-plate reading heuristics + calibration), `frame-extraction.md`,
`autonomous-frame-selection.md` (the router), `analysis-pipeline-strategy.md` (sensor-first product).
