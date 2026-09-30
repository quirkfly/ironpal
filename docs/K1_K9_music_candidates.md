# K1_K9 — six music candidates

**Chosen 2026-09-30: #6, Dreaming Big.** Mixed into the master as stage 9 of `scripts/master/build.py`
(`--music`) → `K1_K9_master_eq_music.mp4`; levels and the licence row are in `K1_K9_mastering.md`
§2 and `input/kickstarter/music/LICENSES.md`. The five others stay in the folder, licensed, in case
the ear changes its mind.

**2026-09-30.** Found the way flaireel finds music: Mixkit's free catalogue crawled by tag, every
track pulled with its source page and licence into a ledger, then measured rather than guessed
(flaireel: `platform/tools/fetch_music.py`, `music/LICENSES.md`, `beat_grid.py`). The ledger for
these six is [`input/kickstarter/music/LICENSES.md`](../input/kickstarter/music/LICENSES.md); the
measurement script is `scripts/master/analyse_music.py`; the numbers for all 48 candidates are in
`input/kickstarter/music/analysis_48_candidates.json`.

Nothing here was auditioned by ear. The shortlist is by measurement and tag, and each track comes
with a preview mixed under the finished dialogue so the ear can do the last step.

## 1. What the film needs from music

This is not the film the old music brief in `video-production-execution-plan.md` §3 was written
for. That brief planned 40 s of narration with music-only gaps; K1_K9 is the founder talking for
70 of its 73 s. So the music is a **bed under continuous speech**, not a driver, and the brief's
three moves survive as level changes rather than solo passages:

| time | what is on screen | what the bed should do |
|---|---|---|
| 0.0–24 s | K1–K3, the problem, thumb-typing | muted, sparse, drudgery register |
| 24–30 s | K4, "tired of typing… my own solution" | tension, the lift is coming |
| **30.5 s** | **K5, "IronPal. A headband."** | **the lift lands here** |
| 30–62 s | K6–K8, camera, model, live set, form | warm, confident, steady under the voice |
| 62–70 s | K9, "Give your thumb a break… ironpal.co" | sustain, no new build |
| 70.4–73 s | end card | resolve and fade |

The filter that mattered most: **busyness in the speech band**. A track with many onsets per second
or with its energy between 1 and 4 kHz fights a voice at bed level. Both were measured and
everything above 2.1 onsets/s or 8 % speech-band energy was dropped, which is what removed the
"workout" and "sports" tags wholesale.

## 2. The six

Level envelope is dB relative to the track's own loudest 5 s, in 5 s steps from 0 s; read it as the
shape of the first 90 s. `lift` is mean level at 30–60 s minus mean at 0–25 s: positive means the
track grows across the reveal on its own.

| # | track | bpm | onsets/s | speech band | lift | length | why it is on the list |
|---|---|---|---|---|---|---|---|
| 1 | **Slow Rain** (122) | 103 | 2.1 | 1 % | +5.8 dB | 2:09 | Sits at −8 dB for 25 s, climbs to full between 25 and 35 s. The lift lands on "IronPal. A headband." with no editing. Industry/technology tag. **First pick.** |
| 2 | **Autofahren** (770) | 117 | 1.3 | 1 % | +7.7 dB | 4:44 | Very sparse, one long ramp from −12 dB to full over the first minute. Reads as tech/cinematic. Needs a fade at the end card, it never resolves on its own. |
| 3 | **Sweet September** (282) | 103 | 1.3 | 1 % | +4.7 dB | 1:39 | The only usable track under Mixkit's lo-fi tag, which is the register the brief asked for at the opening. Quiet for 10 s, then up. Warmer and more melodic than 1 and 2; may pull attention if the melody is strong. |
| 4 | **New Bass 01** (720) | 123 | 1.9 | 4 % | +13 dB | 1:36 | Biggest build in the pool: −21 dB opening, full by 25 s, and a natural taper in its last 10 s. Start it 22 s in and its own ending falls on the end card. Most "product launch" of the six. |
| 5 | **Discover** (587) | 86 | 1.6 | 6 % | +13 dB | 2:24 | Two-stage shape: rises to 15 s, drops back at 20–30 s, then rises for good at 30 s. That dip sits exactly under K4's "tired of typing", the second rise under the reveal. Documentary/intro tag; the slowest tempo here. |
| 6 | **Dreaming Big** (31) | 89 | 1.3 | 9 % | +2.4 dB | 1:50 | Warm motivational bed with a gentle, even climb. Safest emotionally, least dynamic; the one to pick if the reveal lift should come from the edit, not the track. Speech-band share is at the limit. |

Runners-up that lost on one number, in case all six miss by ear: **Opalescent** (593, ambient,
1.0 onsets/s, a 90 s ramp: beautiful shape but too slow to reach the reveal), **Moon Walk** (609,
flat calm bed, no lift), **Hazy After Hours** (132, lifts at 15 s, too early), **Driving Ambition**
(32, 10 % speech band).

## 3. Preview mixes

`~/job_stuff/prj/geggen/products/ironpal/clips/K1_K9_music_<n>_<track>.mp4`, one per track, built
on the 720p proxy of `K1_K9_master_eq`. Mix: track from 0 s, gain set per track so its 30–60 s
section sits at −22 LUFS (the six differ by 10 dB in their own loudness, so a fixed gain would not
compare them), a gentle sidechain duck keyed from the dialogue (ratio 2, threshold −14 dBFS, at
most ~6 dB of reduction), 1 s fade in, 2.5 s fade out from 70.4 s into the end card.

Measured, all six: ducked bed −23 to −24 LUFS integrated, dialogue −14.1 LUFS, mix −14.5 to −14.9
LUFS, peaks −0.5 to −1.0 dBFS. The bed is 9–10 dB under the voice: clearly audible for choosing,
2–4 dB hotter than a shipped bed under continuous speech would normally sit.

The first build of these previews was wrong and inaudible: a sidechain compressor with a −34 dBFS
threshold and ratio 4 pulled the music down about 22 dB whenever the founder speaks, which is the
whole film, so the bed sat around −43 dB RMS. Trap recorded in `K1_K9_mastering.md` §traps: under
wall-to-wall dialogue, ducking must be gentle or absent, and beds must be levelled per track before
comparing.

Previews are for choosing, not for shipping: track 4 should start at 22 s so its ending lands, and
the final mix belongs in `scripts/master/build.py` behind the master's loudness pass, not on the
proxy.

## 4. Licence

Every track is under the Mixkit Stock Music Free License (<https://mixkit.co/license/#musicFree>),
the same licence flaireel records for its whole pool: royalty-free, commercial use, no attribution,
no subscription. The licence text is served inside a JavaScript modal on that page, so confirm it
in a browser once before the campaign goes live and keep the ledger row with the file.

## 5. Open

- Dreaming Big is in; the shipped bed sits ~10 dB under the voice (see mastering doc §4 for the
  one knob). The other five are auditioned by the same previews if a swap is wanted: change
  `MUSIC["file"]` and re-run `build.py --music`.
- The brief's "transition sting" at the reveal is not in any track; if wanted it is a separate
  Mixkit sound effect under the Sound Effects Free License, recorded in the same ledger.
