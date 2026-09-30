# The K1→K2 audio problem

**Written 2026-09-28.** §1–§6 are diagnosis. §7, added later the same day, is the fix built from it.

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

---

## 7. Attempt 6 — rejected: "K2 is muffled and distorted and sounds quieter"

Built on the diagnosis above plus two faults §2 missed, found by looking at the join at 50 ms
resolution instead of per segment:

- **Footstep thumps.** K1 ends with a low-frequency thump at 7.60 s (−23.6 dB, 99 % of its energy
  below 300 Hz — a footstep, he is walking) and K2 opens with a louder one at 8.15 s (−20.7 dB).
  They are also what made K2 look 8–18 dB light below 160 Hz in §2.4: that deficit was K1's
  thumps, not the voice.
- **A digital hole.** K2's first 0.15 s (8.00–8.12 s) is −57 dB — essentially nothing — where K1's
  room tone was −41. The first word then lands on top of that hole.

Attempt 6 folded both halves to mono, highpassed at 120 Hz, denoised K1, applied the full
1/3-octave match-EQ to K2 (two iterations), matched speech level with K1 +7.9 / K2 −4.2 dB, dipped
the first syllable, and ran a continuous room-tone bed at −36 dB under the whole film.

Every number came out matched — speech −15.8 / −16.1 dB, loudest 50 ms windows −10.6 / −11,
voice-band tone within 2.6 dB — and the verdict was **"K2 is muffled and distorted and sounds
quieter."** So the measurement was not describing what is heard: pulling K2's tone toward K1
made K2 worse, not more similar. **The match-EQ on K2 is the culprit and is withdrawn.** K2 is the
clearer of the two voices and its tone should not be touched.

## 8. Attempt 7 — rejected: it modified K1

The opposite strategy: treat K2's voice as the reference, leave its tone alone, and bring K1 **up**
to meet it (K1 +7.9 dB after denoising, K2 −0.5 dB). Every number matched — speech −15.8 / −15.9 dB.

Rejected on a constraint rather than on the sound: **"do not EVER touch K1 — modify K2 to match its
audio to K1."** That is now a standing rule for this film and everything below obeys it.

## 9. Attempt 8 — K1 untouched, K2 matched to it (current)

K1's samples pass through unchanged; verified by differencing 0–7.9 s of the output against the
source (−39 dB residual, i.e. AAC re-encode noise only). Everything happens after 8.0 s.

The insight that separates this from attempts 4–7: **speech loudness is judged in the presence band,
not broadband.** K2 was 8.4 dB hot across 1–6 kHz. Matching broadband level — which every earlier
attempt did — left K2 dull *and* reading as quieter, because its 3–6 kHz deficit (§2.4) survived the
match. So the correction is a presence lift plus a band-matched level, not a level alone.

| step | what | why |
|---|---|---|
| presence lift | +8 dB peak at 4.5 kHz, one octave wide, K2 only | the band where K2 measured ~6 dB below K1 |
| level | K2 **−9.0 dB** | set so K2's speech energy equals K1's band by band |
| first-syllable dip | −2.5 dB, 8.27–8.92 s | §2.3 |
| room-tone bed | −46 dB, **under K2 only**, donor taken from K1's own quietest 0.4 s | fills the −57 dB hole at 8.00–8.12 s so the floor does not step |
| nothing else | no broadband EQ, no highpass, no mono fold, no denoise, no compressor, no limiter | peaks land at −8.7 dBFS on their own |

Speech-band result, K2 relative to K1: 100–300 Hz −2.0, 300 Hz–1 kHz −1.0, 1–3 kHz +1.4,
3–6 kHz −1.3, 6–12 kHz +1.2 dB. Ear band (1–6 kHz): **+0.8 dB**.

Build: `geggen/products/ironpal/clips/build10.py`, with `bands.py`, `verify.py` and `analyse.py`
beside it: `python3 build10.py OUT.mp4 -9.0 8 0 2.5 -46`. The numbers are specific to this render.

## 10. Does Flow expose any audio control? — investigated 2026-09-28

**Short answer: no. There is no volume, gain, mute, normalisation or audio-track control anywhere in
Flow.** This closes the "fix it at GF level" line of attack for *level*. Level correction happens in
post or not at all.

What Scenebuilder and the editor actually offer, per Google's own help page — this is the complete
list:

- arrange clips in a sequence, and rearrange their order
- **trim** the beginning and end of each clip with handles
- **Extend** — "create more footage and add it to the end of your original clip", Veo-generated
  clips only
- **refinement editing** on a selection of "up to a 10-second segment", by text prompt
  ("Change the lighting to a cinematic sunset")
- agent-based editing of uploaded video by text prompt

No volume slider, no gain field, no audio lane. The composer's settings — model, number of outputs,
aspect ratio, generation length — contain no audio option either.

### But there is one audio control, and it addresses the residual rather than the level

**Voice Ingredients.** Flow lets a specific voice be attached to a generation and referenced in the
prompt as `@Voice: <name>`:

| | |
|---|---|
| presets | ~30, each with a 10-second preview |
| custom voice | pick a preset as the base, name it, describe the delivery under **Voice Performance** ("Make the voice sound slightly raspy with a New York accent"), optional 8-second preview from **Sample Dialogue** |
| Google's stated purpose | "keep your dialogue and characters consistent across every setting, scene, and action" |
| availability | experimental, Ultra-only from 10 April 2026, since rolled out more widely |

This sets no level. But the fault it targets is the one §5 could not rule out and no filter reaches:
**that the two halves are different voices.** A pinned voice removes speaker identity as a variable
at every join.

### Why it cannot be used with Extend

Google's help page states plainly: **"You can add voice references only to video generations that use
ingredients."** Extend is not an ingredients generation — it takes a prompt and the previous clip's
final 24 frames, nothing else. The documented walkthrough also routes voices through Omni Flash
(model selector → Omni Flash → Video → Ingredients → Add → Voices), whereas **Extend runs only on
Veo 3.1 Lite** — Flow lists Extend as unsupported on Veo 3.1 Fast and Quality, and as "coming soon"
on Omni Flash.

So the two capabilities are currently mutually exclusive:

| | continuity of motion | continuity of voice |
|---|---|---|
| **Extend** | seamless, no cut | none — fresh audio render every hop |
| **Ingredients + `@Voice`** | hard cut between clips | pinned, consistent |

That is a platform constraint, not a prompting problem, and it is the decision the film has to make
once (§6) rather than at each of the seven joins.

### One thing to check in the UI, because the documentation conflicts

Open the composer, set the model to **Veo 3.1 Lite**, switch to **Ingredients**, click **Add** — and
see whether **Voices** is offered there, or only under Omni Flash. Flow's model table does list
"Ingredients/References to Video" as supported on Lite. If Voices appear on Lite, every clip can be
generated Ingredients-to-Video with one pinned voice: eight hard cuts, but one voice across the whole
film, which for a 60-second promo is the better trade than seamless motion with eight different
voices. Whether a pinned voice also stabilises *level* is undocumented — worth one 10-credit test.

Also worth reading while signed in: `flow.google.com/changelogs`, which is behind a login and could
not be checked from here.
