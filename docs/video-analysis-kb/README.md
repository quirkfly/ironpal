# IronPal Video-Analysis Knowledge Base

**Goal.** Build up, collaboratively and iteratively, a knowledge base that lets Claude analyse an
**arbitrary workout video clip** and produce a detailed report containing:

1. **Exercise** — the name of the exercise being performed
2. **Reps** — the number of completed repetitions
3. **Weight** — the weight being lifted (if applicable)

**Configuration (set 2026-06-14):**
- **Primary perspective:** egocentric (headband / first-person), matching the IronPal product.
  Third-person clips are handled opportunistically but the KB optimises for first-person.
- **Protocol:** **blind test first, then reveal.** Claude reports with no ground truth, you reveal
  after, and the case records the blind score before any learning. This measures the KB's true
  accuracy, not its hindsight.

This is *not* a trained model. It is a growing body of human-readable knowledge (heuristics,
per-exercise visual signatures, failure cases, a tuned frame-extraction recipe) that Claude reads
before analysing a clip. Every clip we run teaches the KB something; the next clip is analysed
better. The KB is the deliverable — the reports are how we test it.

Relationship to the on-device POC: the POC (`poc/`, `docs/ironpal-poc-v1*.md`) is the *real-time,
on-device, two-exercise, sensor+vision* product. This KB is the *offline, post-hoc, any-exercise,
vision-only* analyser. They share a domain and inform each other, but this KB has no exercise
allow-list — it must handle an arbitrary clip.

---

## The iterative loop

Each iteration analyses one clip and leaves the KB smarter than it found it.

1. **Drop a clip.** Put the clip in `input/kb/clips/` (any name). Do **not** reveal ground truth yet
   (blind protocol). Default perspective is egocentric; flag it if a clip is third-person.
2. **Route, then extract frames.** Claude first sweeps the whole clip with
   `scripts/kb/motion_profile.sh <clip>` to auto-locate the perform/staging windows with **no human
   pointing at timestamps** (`autonomous-frame-selection.md`), then runs
   `scripts/kb/extract_frames.sh <clip>` on those windows using the current sampling recipe (see
   `frame-extraction.md`) and reads the frames.
3. **Report.** Claude produces a report in the standard format (below), citing the specific frame
   evidence behind each of the three answers and a confidence for each.
4. **Confirm / correct.** You give ground truth or corrections.
5. **Learn.** Claude diagnoses each gap, extracts a **generalizable** rule (not a clip-specific
   patch), and updates the relevant KB file — plus appends a one-page case to `cases/`.
6. **Repeat.** Over clips, the KB converges. We track accuracy in `cases/INDEX.md`.

The discipline that makes this work: in step 5 we only write down rules that would help on a *future
unseen* clip. "This clip had 8 reps" is not knowledge; "kettlebell swings are easy to double-count
because the eccentric looks like a second rep — count only the top lockout" is.

---

## Foundational principle: equipment exercises = SET UP → GRASP → PERFORM

Any equipment-based exercise follows a fixed sequence, and **only the last phase is the exercise**:

1. **Set up / load** — fetch the dumbbell, load plates on the bar, set the pin. (Not the exercise.)
2. **Grasp / get into position** — pick up / grip the implement, take the stance. (Not the exercise.)
3. **Perform** — the **same movement pattern repeated**; its path names the exercise and its cycles
   are the reps. **This is the exercise. Analyse only this phase.**

This is the structural fix from case 002, where **loading was ~⅔ of the clip** and analysing it (the
implement being carried, threaded, repositioned) produced wrong reads ("not an exercise", endless
"handling"). **First locate the set-up→grasp→perform boundaries; ignore phases 1–2; read the repeated
movement in phase 3.** The set-up/grasp frames are also where weight is most readable (staging) — see
`weight-reading.md` — but they are *not* where the exercise is named. Barbell specifics:
`exercise-identification.md`.

---

## Standard report format

```
## Clip: <filename>  (<duration>, <fps>, <resolution>)

### 1. Exercise
- Answer: <name>   (confidence: <0..1>)
- Evidence: <which frames, what visual cues — equipment, posture, motion arc>
- Alternatives considered & rejected: <...>

### 2. Reps
- Answer: <n>   (confidence: <0..1>)
- Rep definition used: <what counts as one rep for this movement>
- Per-rep evidence: <frame ranges for each rep, or the cadence reasoning>
- Uncertainty: <partial reps, occlusion, out-of-frame at start/end>

### 3. Weight
- Answer: <value> <unit>   (confidence: <0..1>)  | or "not applicable" | or "unreadable"
- Evidence: <which frame, where the number was read, unit inference>
- Uncertainty: <occlusion, motion blur, ambiguous unit>

### Overall notes
- Camera perspective: <egocentric / third-person / fixed>
- KB gaps this clip exposed: <feeds step 5>
```

---

## KB contents (index)

| File | What it holds |
|------|---------------|
| `frame-extraction.md` | The tuned recipe for turning a clip into legible frames (sampling rate, count, crops, resolution). |
| `exercise-identification.md` | General method + cross-cutting cues for naming an arbitrary exercise. |
| `exercises/<slug>.md` | Per-exercise visual signature, rep definition, weight-reading notes. One file per exercise we've seen. |
| `rep-counting.md` | Accumulated rep-counting heuristics and failure modes (over/undercount). |
| `weight-reading.md` | Accumulated weight-reading heuristics by equipment type and unit inference. |
| `weight-tally-pipeline.md` | Robust weight pipeline: **tally at presentation, never count the assembled stack, abstain→confirm**. Post-mortem of the 20260713 counting failure; the automatable/scalable approach. |
| `sensor-fusion.md` | Product path: IMU + vision division of labor and the fusion pipeline. |
| `analysis-pipeline-strategy.md` | Going-forward strategy: enrollment-based, sensor-first, IMU-gated, abstain-and-ask — scaling beyond manual vision-only analysis. |
| `ground-truth.md` + `ground_truth.json` / `predictions.json` | Weight-reading accuracy harness: lifter-confirmed answers + the current run's predictions. Scored by `scripts/kb/score_weights.py`, which gates **confident-wrong reads to zero** (abstain-first). Takes the human out of the correction loop. |
| `cases/INDEX.md` | Ledger of every clip analysed: predicted vs actual, running accuracy. |
| `cases/<id>.md` | One page per analysed clip: the report, the ground truth, the diagnosis, the rule added. |

Start each analysis by reading this README, `frame-extraction.md`, the two cross-cutting files,
and any `exercises/<slug>.md` that might match.
