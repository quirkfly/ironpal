# Case ledger

Every clip analysed, predicted vs. actual. Running accuracy is how we know the KB is improving.

| # | Clip | Perspective | Exercise (pred / actual) | Reps (pred / actual) | Weight (pred / actual) | Case |
|---|------|-------------|--------------------------|----------------------|------------------------|------|
| 001 | 20260614_125114.mp4 | egocentric | two-DB curl (alternating) / **biceps curl ✅** | ~5/arm / **6/arm 🟡 near-miss (−1)** | 7kg read / **5kg 🟡 (plate read ✓, wrongly +handle)** | [001](001-20260614_125114.md) |

**Running accuracy:** Exercise 1/1 ✅ · Reps 0/1 exact, 1/1 within ±1 🟡 · Weight 0/1 exact, 1/1 within ±2.5kg 🟡 (plate denomination read correct; error was adding handle).

## Scoring

- **Exercise:** exact match of the conventional name (synonyms count).
- **Reps:** exact for ≤15; within ±1 counts as a near-miss (note it).
- **Weight:** within one plate increment (±2.5 kg / ±5 lb) and correct unit.

Update this row-by-row after each iteration; summarise running accuracy at the bottom as the count
grows.
