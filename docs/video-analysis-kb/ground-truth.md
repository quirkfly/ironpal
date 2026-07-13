# Weight-reading ground truth + accuracy harness

**Why this exists.** Weight reads were failing in a specific, expensive way: the system
committed a *confident wrong number* and a human (the founder) had to catch and correct it —
repeatedly. This harness removes the human from the correction loop. Every read is scored
automatically against lifter-confirmed ground truth, and the one metric that matters —
**CONFIDENT-WRONG** (a committed, high-confidence read that is actually wrong) — is gated to
**zero**. When the system isn't sure, it must **abstain** (→ 1-tap end-user confirm), not guess.

## Files

| File | Role |
|------|------|
| `ground_truth.json` | Lifter-confirmed answers. `scorable:true` = the TOTAL working weight is confirmed and graded. |
| `predictions.json` | What the system currently outputs. **Overwrite each run**, then score. |
| `scripts/kb/score_weights.py` | Joins the two, prints accuracy, **exits non-zero on any confident-wrong**. |

## How to use (per analysis run)

1. Analyse the clip/image with `/weight-lifted-analysis`.
2. Write the result into `predictions.json` for that `id`: `predicted_kg`, `unit`, `confidence`,
   `abstained`. **If the self-consistency gate fails, set `abstained:true` and `predicted_kg:null`** —
   never write a confident number you can't corroborate two ways.
3. Run `python3 scripts/kb/score_weights.py`. Green = no confident-wrong. Red = a regression to fix.

## Scoring rule

A committed read is **CORRECT** iff the unit matches and `|predicted − actual| ≤ tolerance_kg`.
Painted pin stacks use `tolerance 0` (exact — the number is right there). Cast plates use one
increment (±2.5 kg). **Abstentions are never "wrong"** — they cost *coverage*, not *accuracy*.
The goal is 100% accuracy on committed reads with confident-wrong = 0; then grow coverage by
resolving abstentions with a second independent method, **not** by guessing.

## Confirmed cases (the current test set)

| id | source | equipment | actual | confirmed | scored? |
|----|--------|-----------|--------|-----------|---------|
| 001 | 20260614_125114.mp4 | spinlock DB (DOMYOS 2.5kg) | **5 kg** | total | ✅ |
| 004 | 20260713_115428.mp4 | spinlock DB (mixed 2kg+1kg/end) | **6 kg** | total | ✅ |
| 005 | 20260713_182249.jpg | pin stack (13kg +8/plate) | **37 kg** | total | ✅ |
| 006 | 20260713_182833.jpg | pin stack (13kg +8/plate) | **53 kg** | total | ✅ |
| 002 | 20260614_202314.mp4 | barbell (2kg plates + bar) | denom 2kg only | denomination | ⚪ not scored (total unconfirmed) |
| 003 | 20260615_122213.mp4 | cable/lever rig (10kg plates) | 10kg plate mass | plate-mass | ⚪ not scored (lever: mass ≠ resistance) |

Add a row here + an entry in `ground_truth.json` whenever a new clip's weight is lifter-confirmed.
The harness gets stronger with every case; accuracy is tracked by the scorer, never by hand.

## Self-consistency gate (the rule that makes this work)

Read each weight **two independent ways** and commit only if they agree:
- **Pin stack:** (a) count empty holes from the top → `first + inc×empty`; (b) OCR the label at the
  pin. Agree → commit. Disagree → **abstain**.
- **Loadable dumbbell:** (a) read each plate's flat face; (b) size-check inner-vs-outer within one end
  for a mix. Consistent → commit. Ambiguous → **abstain**.
- **Plate barbell:** (a) tally plates at presentation; (b) cross-check against any visible face read.

A single stable abstention beats a wavering or confident-wrong number every time. See
`weight-reading.md` and the skill's Step 4d.
