# Case ledger

Every clip analysed, predicted vs. actual. Running accuracy is how we know the KB is improving.

| # | Clip | Perspective | Exercise (pred / actual) | Reps (pred / actual) | Weight (pred / actual) | Case |
|---|------|-------------|--------------------------|----------------------|------------------------|------|
| 001 | 20260614_125114.mp4 | egocentric | two-DB curl (alternating) / **biceps curl ✅** | ~5/arm / **6/arm 🟡 near-miss (−1)** | 7kg read / **5kg 🟡 (plate read ✓, wrongly +handle)** | [001](001-20260614_125114.md) |

| 002 | 20260614_202314.mp4 | egocentric | flip-flopped → final upright row ✗ / **barbell CURL** 🔴 MISS | ~5 (3–6) / **4** 🟡 (range ok, over by 1; need ≥3fps) | 2kg/plate (4.4 LB) ×2 + bar → ~9–10kg / **✅ plate read CONFIRMED ("spot on")** | [002](002-20260614_202314.md) |

| 003 | 20260615_122213.mp4 | egocentric | no-exercise → deadlift (both wrong) / **TRICEPS CABLE PUSHDOWN** 🔴 MISS (cable misread as free-weight) | 0 ("setup") / **5** 🔴 MISS (axial stroke invisible) | DOMYOS plates on a cable PIN (denom unread) | [003](003-20260615_122213.md) |

**Running accuracy:** Exercise **1/3** (✅ case001 biceps curl; 🔴 case002 upright row→was barbell curl,
grip mis-read; 🔴 case003 no-exercise/deadlift→was triceps cable pushdown, cable misread as free-weight)
· Reps **0/3 exact** (case001/002 within ±1 🟡 over by 1; 🔴 case003 counted 0, actual 5 — axial/depth
stroke + gaze-tracking + head-still made the reps invisible to vision → needs cable/IMU rep clock); fix:
≥3fps in PERFORM phase + read defining-joint vs FLOOR · Weight **case002 plate read EXACT ✅** (2kg/4.4LB, lifter-confirmed; bar still estimated); case001 within ±2.5kg 🟡.
Validated weight method: sample the loading window densely for the brief face-on plate glance; convert LB→kg.
Case002 lesson: a grip drives the whole ID (supinated=curl vs pronated=upright row) — resolve
palm-vs-knuckles directly; don't infer from a watch or claim knuckles you can't see.
Case003 lesson (CORRECTED — actual = triceps cable PUSHDOWN, not deadlift, not "no exercise"):
examine the HELD implement FIRST (clutter ≠ exercise count) **and TRACE WHAT IT CONNECTS TO**. A
flexible CABLE/CHAIN from the held bar/handle to a weight stack / loading PIN / pulley ⇒ a
CABLE-MACHINE exercise (pushdown/row/pulldown), NOT a barbell — the cable is the #1 identifier. I saw
the cable 3× and mislabelled it "accommodating-resistance chain" / "draw-wire instrumentation," called
the straight-bar cable attachment a "barbell," and pin-loaded plates a "loaded bar" → wrong deadlift.
A cable straight-bar looks identical to a barbell until you trace the cable. (Banked in
exercise-identification.md + skill Step 3b; supersedes the wrong "draw-wire = instrumented deadlift" note from d1a49f9.)

## Scoring

- **Exercise:** exact match of the conventional name (synonyms count).
- **Reps:** exact for ≤15; within ±1 counts as a near-miss (note it).
- **Weight:** within one plate increment (±2.5 kg / ±5 lb) and correct unit.

Update this row-by-row after each iteration; summarise running accuracy at the bottom as the count
grows.
