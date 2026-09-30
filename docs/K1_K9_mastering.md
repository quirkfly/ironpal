# K1_K9 — mastering record

**2026-09-30.** What separated the assembled cut from a professional one, measured; what was done
about each; what is left. Pipeline: `scripts/master/build.py` → `K1_K9_master_flat.mp4` and
`K1_K9_master_eq.mp4` (72.96 s, 1920×1080), plus 720p `_proxy` copies; `build.py --music` adds
stage 9 on top of the cached `_eq` intermediates → **`K1_K9_master_eq_music.mp4`**, the current
deliverable. The assembled cut `K1_K9.mp4` is untouched.

## 1. Diagnosis, before

| | measured | professional |
|---|---|---|
| loudness | −20.5 LUFS integrated, true peak −3.2 | −14 LUFS, −1 dBTP for YouTube/TikTok |
| dialogue per clip | −19.2 … −24.5 (K4 the outlier) | within ±1 LU |
| **noise floor** | **−47…−53 dB on K1–K4, K6; −72…−89 on K5, K7–K9** | one floor |
| voice tone, 3–6 kHz vs mids | 12 dB spread (K6 −13, K7 −26) | one voice |
| exposure, mean Y | **21 (K7) → 71 (K3)** | one look |
| warmth, R−B | +4 (K7) → +29 (K2) | one look |
| dead air | ~12 s in 74, but much of it is walk-ins and holds | trimmed by eye |
| end card, captions, music | none | all three |

**The noise floor was the real problem, not the level.** Five clips hissed at −50 dB and four were
near-silent. Normalising level without unifying the floor turns every cut into hiss switching on
and off — which is precisely what the eight rejected K1→K2 attempts in `audio_issue.md` were
fighting one join at a time. It has to be fixed film-wide and *before* any gain.

## 2. What each stage does

| stage | what | result |
|---|---|---|
| 1 floor | `anlmdn` on the five hissy clips, a fast knee'd gate on all nine, then **one pink-noise bed at −68 dBFS** (level set by measurement) under the whole film | floor −60.6 ± 0.4 dB in every segment |
| 2 dialogue | speech-gated K-weighted gain to −21 dB per clip, 15 ms fades at every cut | speech within 0.8 dB across all nine; click ratio ≤ 0.17 at every cut |
| 3 tone (A/B) | match-EQ toward the **median** voice, ±5 dB, 200 Hz–8 kHz, 70 % — shipped as `_eq` beside `_flat` | brightness spread 11.8 → 5.4 dB |
| 4 master | de-ess, 1.8:1 bus compression, two-pass `loudnorm`, limiter at 0.85 with `level=false` | **−14.0 LUFS, −1.4 dBTP, LRA 4.5** on both |
| 5 grade | per-clip gamma / channel-mix warmth / saturation, solved as a two-iteration fixed point on the whole clip, 70 % toward Y 42 · warmth +22 · sat 0.43 | Y 34–50, warmth +15…+26 |
| 6 trim | K3 → 7.75 (dark tail), K4 from 1.3 (standing still), K5 → 7.875 (blow-out frames), K9 from 1.2 to 9.5 (walk-in kept, hold shortened) | 70.5 s of picture |
| 7 end card | the config's card — line, ironpal.co, logo — rendered from HTML, 2.5 s | |
| 8 captions | the known lines, two chunks each, timed on whisper word boundaries, held to the next chunk, burned via libass | 18 events |
| 9 music | **Dreaming Big** (Mixkit 31, Stock Music Free License, ledger in `input/kickstarter/music/LICENSES.md`), chosen from six measured candidates (`K1_K9_music_candidates.md`). Track from 4 s in so its 74–77 s peak lands on the end card; gain set so its 30–60 s section sits 11 dB under the dialogue's pre-loudnorm loudness (−18.6 dB); duck 2:1 keyed from the dialogue, ≤ ~6 dB; 1 s in, faded out across the card; then the same bus compressor, two-pass `loudnorm` and limiter | **−14.2 LUFS, −1.2 dBTP, LRA 3.7**; dialogue sections within 0.8 LU of the no-music master; bed ≈ −24.5 LUFS shipped; end card −22.8 LUFS |

## 3. Things that went wrong on the way, so they are not rediscovered

- **`afftdn` could not reach the floor.** With `nf` set below the actual noise it left it alone; with
  `nf` at the noise it moved 1–3 dB. `anlmdn` moved 12–22 dB. The gate needed a ~110 ms release —
  at 300 ms it never closed inside K1's pauses and the floor stayed at −50.
- **`alimiter` defaults to `level=true`**, which re-normalises the limited signal to full scale and
  silently undoes the ceiling: the first master came out at 0.0 dBTP and −13 LUFS.
- **The bed came out 20 dB quieter than budgeted** when its level was computed by summing filter
  gains; it is now measured and corrected to the target.
- **ffmpeg `eq=gamma` brightens when > 1.** The first grade darkened the dark clips. And a single
  pass cannot solve exposure, warmth and saturation together — the saturation boost inflates R−B
  and the red mix inflates saturation — hence the two-iteration solver. Probing 3 s instead of the
  whole clip left K3 8 Y too bright.
- **Whisper reports 0.00 for a first word it cannot place**, on six of nine clips. The speech gate
  is used instead there; whisper is trusted when it is not 0.00, because the gate opens late on a
  soft first word (K9's "Give": 1.90 s vs 2.46).
- **`ebur128`'s first frame reads −70 LUFS.** A regex that takes the first `I:` match reports a
  silent master. Take the last.
- **A sidechain duck under wall-to-wall dialogue removes the music.** The first music previews used
  `sidechaincompress` with a −34 dBFS threshold and ratio 4; the founder talks for 70 of 73 s, so the
  bed was held ~22 dB down the whole time and read as "only voice, no music". Under continuous speech
  the duck must be gentle (ratio 2, threshold near −14 dBFS) or absent, and each track must be
  levelled to the same LUFS before comparing — the six candidates differed by 10 dB.

## 4. Still open

- **Music level is a first pass.** The bed ships ~10 dB under the voice, a touch above the −11 dB
  it was set to because `loudnorm`'s offset lands on the mix, not the dialogue. If it reads as too
  present under speech, `MUSIC["rel_db"]` in `build.py` is the one knob; −13 is the next stop.
  `../geggen/runs/*/music.wav` is of unknown provenance and was not used.
- **report.json's `flat`/`eq` rows say −70 LUFS.** That was the first-line `ebur128` trap inside
  `assemble()` itself; fixed in code (`loudness()` takes the last match) but the rows are only
  rewritten by a full build. The masters measure −14.0 / −1.4 when probed directly.
- **Tone A/B.** `_eq` halves the voice-brightness spread; whether it sounds better is the founder's
  ear. The K2 history says do not assume.
- **The insets are graded with their clips.** K3, K7 and K8 carry composited UI, and the grade
  warms the panel's teal slightly. Correct fix: grade the source, then re-composite. Cosmetic.
- **A hand grade in Resolve** would beat the automatic one on K5 (still the flattest) and could
  match the two gym "corners" (K4's white pillar) that a global correction cannot.
- **K4's take** is the quietest source (−26 dB speech) and needed +5 dB; it is the clip most worth
  re-shooting if any is.
