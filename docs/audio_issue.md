# The K1→K2 audio problem

**Written 2026-09-28. Diagnosis only — nothing here is a fix, and no fix is proposed.**

Every measurement below is from the actual files. Where a figure comes from a render that has since
been deleted it is marked, because it was recorded during the session rather than re-measurable now.

---

## 1. The symptom

Joining K1 to K2 produces an audible jump at the cut. The second half sounds **markedly louder**,
and it also sounds like a **different recording** rather than a continuation of the same one.

Four separate attempts to correct it in post all failed, each in a different way. That history is in
§5, because the failures are themselves evidence about what the problem is not.

---

## 2. What is measurably wrong — four distinct faults

These are independent. Fixing one does not touch the others, which is why partial corrections kept
sounding wrong in new ways.

### 2.1 Level

| | Integrated loudness |
|---|---|
| K1 (composer render) | **−22.13 LUFS** |
| K2 (Scene Builder extension) | **−13.77 LUFS** |
| gap | **8.4 LU** |

For scale: 10 LU is roughly "twice as loud" to a listener. This gap is close to that.

### 2.2 Speech level, which is worse than the integrated figure suggests

Integrated loudness averages speech together with silence. K1 has fewer, longer pauses than K2, so
matching *integrated* levels still leaves the actual **speech** mismatched. Measured per speech
segment, K-weighted:

| | Speech segments | Mean | Median |
|---|---|---|---|
| K1 | 4 | **−24.3 dB** | −23.9 |
| K2 | 8 | **−15.6 dB** | −15.4 |
| difference | | **+8.8 dB** | |

**This is the number that matters**, and it is the one I got wrong for three rounds by matching
integrated loudness instead.

### 2.3 K2's loudest moment is its first word after the cut

K2 is not uniformly loud. Its segments span 5.2 dB, and the peak sits at the join:

```
  8.30– 8.86s   -12.6 dB   <-- FIRST segment after the cut, loudest in the whole film
  8.96– 9.56s   -15.1
  9.58–10.22s   -14.9
 10.52–11.44s   -15.8
 11.48–12.58s   -15.8
 12.88–13.26s   -19.2
 13.30–13.70s   -13.4
 13.94–14.68s   -17.6
```

So the very first syllable after the cut lands about **11 dB above K1's speech** and about 3 dB above
K2's own average. The perceived event is a slam at the transition, not a steady level difference —
which is why matching averages never fixed what was being heard.

### 2.4 Tone — the two halves are not the same microphone

Measured on speech only, with each half normalised to its own 300 Hz–3 kHz average so that **level is
removed** and only tonal balance is compared:

| Band | K2 relative to K1 |
|---|---|
| 60–150 Hz, rumble | **−8.0 dB** |
| 150–400 Hz, chest | −2.6 dB |
| 400 Hz–1 kHz, body | +2.3 dB |
| 1–3 kHz, presence | −0.5 dB |
| **3–6 kHz, sibilance and consonants** | **−5.4 dB** |
| 6–10 kHz, air | −0.9 dB |

3–6 kHz is where consonants live and where "close and present" comes from. A 5.4 dB deficit there is
not subtle. K1 is bright and close with weight underneath; K2 is duller and thinner. **No level
adjustment touches this**, because it is not a level problem.

---

## 3. Patterns worth recording

**The direction is always the same.** Across two separate extension attempts, on two different K1
renders (one 9:16, one re-minted 16:9), the composer output measured ≈ −22 LUFS and the Scene Builder
extension measured ≈ −14. The gap was 8.2 LU on the first attempt and 8.4 on the second. This is not
per-render noise; it is systematic between the two generation paths.

**Prompt wording does not control it.** The second extension used a prompt containing an explicit
continuity paragraph — same microphone, same distance, same volume, do not make it louder — plus
K1's delivery clause copied word for word. Result: 8.4 LU gap versus 8.2 without it. **No measurable
effect.** Flow exposes no level control, and the prompt is not one.

**The noise floor is unstable between renders.** First extension: K1 floor −38.4 dB, K2 −43.1, a 5 dB
mismatch. Second extension: K1 −46.5, K2 −46.2, essentially matched. So the noise characteristics
vary render to render even when the level offset does not. A correction tuned to one render's noise
profile is wrong for the next.

**The tone deficit persisted across both attempts** — −7.6 dB at 3–6 kHz on the first, −5.4 dB on the
second. Same direction, similar magnitude.

---

## 4. Why it happens

Confidence is split, and the split matters:

**Measured, certain.** The level, speech-level, spread and tone figures above.

**Inferred from documented behaviour.** Google's documentation says Extend conditions on the **final
second, 24 frames**, and continues the action. Frames are picture. Nothing states that the previous
clip's *audio signal* is passed to the next generation. The extension inherits pose, framing and
motion because those are visible in those frames; it inherits nothing about how the voice sounded,
because that is not in them.

So each clip is an **independent audio render**. Loudness, microphone character and room tone are
emergent properties of that particular sample, not parameters carried between runs. There is no
loudness target, no reference level, and no mastering stage reconciling one clip against the last.

The documented claim about extensions is that audio "extends naturally instead of cutting off
awkwardly" — that ambience is not hard-truncated at the boundary. That is **not** a claim about
matching level or timbre. A search found no documentation of level inconsistency as a known
limitation, so nobody has written this down.

**Not verified.** Why the composer path is consistently quiet and the extension path consistently
loud. The consistency across two attempts suggests something structural about the two paths rather
than sampling variance, but that is an observation, not an explanation.

---

## 5. What was tried in post, and why each failed

Recorded because the failures narrow the problem.

| # | Attempt | Result | What it revealed |
|---|---|---|---|
| 1 | Match both halves to −16 LUFS | "too quiet" | −16 is a broadcast reference level, wrong for a social promo |
| 2 | Match both to −12 LUFS with limiting | "worse" | Lifting K1 by 10 dB raised its noise floor to −30 dB, audible in pauses, then gone at the cut. Traded a loudness jump for a noise jump |
| 3 | Denoise, then one adaptive loudness pass | "does not work" | The denoising was fixing a fault present in the *first* render but absent from the second. Adaptive gain also left 2.6 LU of residual difference |
| 4 | Match integrated loudness + tone EQ | "still wrong" | Integrated ≠ speech. Left 2.1 dB of speech mismatch, and did nothing about §2.3 |
| 5 | Match speech loudness + compress K2 + tone EQ | "worse every time" | Speech matched to 0.0 dB and tone to within 0.7 dB in the voice bands, and it was still rejected |

**The significance of attempt 5.** It achieved 0.0 dB speech-level match, 3.5 dB internal spread down
from 5.2, and voice-band tone agreement within 0.7 dB. If it still sounds wrong, then **the residual
is not level and not broadband tone.** What remained unaddressed in that version:

- K2 still 2.8 dB lighter below 150 Hz
- K2 still 4.2 dB brighter above 6 kHz
- the **voice itself** may simply be a different synthesis — different timbre, different speaker
  characteristics — which no EQ or gain curve can reconcile

That last possibility is the one this document cannot rule out, and it is the most likely remaining
explanation.

---

## 6. The structural consequence

This is not a one-off. **Every extension is a fresh audio render, so every join is a potential voice
change.** A film of eight clips built by chaining extensions has seven of them. The visual continuity
Extend buys does not extend to the soundtrack.

Whatever is decided, it should be decided once for the whole film rather than per join.
