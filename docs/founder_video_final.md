# IronPal — the founder video (final): “Yes, there’s a camera on my head”

**Status:** Final v1.0 · 2026-09-27 — one script selected from six, rebuilt so the IronPal headband is on screen in every clip; design review complete (auto mode)  
**Selected:** F4 of [`founder_video_scripts.md`](founder_video_scripts.md). The other five stay there as the bench.  
**Format:** vertical 9:16; eight Google Flow clips of ≤ 8 s + a 2.5 s card; each shot runs the length of its line  
**Budget:** 115 words → ≈ 58.9 s with the card; ≤ 16 words a clip, ≤ 117 a script, both asserted  
**Ledger:** decisions Q49–Q54 in [`founder_video_scripts_grilled.md`](founder_video_scripts_grilled.md), Branch I  

---

## 1. Why this one

Asked to pick the most impactful and funny of the six, and then told the band must be prominent, the choice is the script where the band **is** the story rather than decoration:

- **The hook is the objection every viewer already has.** “Yes, there’s a camera on my head.” Nothing else in the six earns attention that fast, and it earns it with the product on screen in frame one.
- **The joke is about the world, and the product is the answer.** Everyone at the gym is already filming — tripods, mirrors, the ceiling camera — and the punchline (“mine’s the only one that deletes”) restates the site’s privacy fact as the last laugh. Recognition, not a gag.
- **It says the true, careful thing about privacy**, which is the one claim the campaign cannot afford to get wrong, and it says it in Peter’s deadpan rather than a trust section’s prose.
- **The band motivates every shot.** He touches it in K1, takes it off and holds it up in K3, taps it in K8; in the five corner close-ups it sits on his forehead in frame. No other script can put the product in all eight clips without forcing it.

What it gives up: F1’s ‘fourth exercise’ is the more universal joke and F6’s ‘made peace with six reps’ the sharper punchline. Both are one render away if this one underperforms; the selection is in the ledger as Q49 and is cheap to veto.

---

## 2. Where the headband comes from — every asset in the repo, and what each can do

| id | file | what it is |
|---|---|---|
| `reveal` | `web/public/assets/reveal.mp4` | 4.0 s · 4096×2304 · the real fabric band lifted from a gym bag on a gym floor (live-shot, Runway Aleph background). The band in it is **unbranded**. |
| `band_in_hand` | `input/kickstarter/storyboarding/S3/selected.jpg` | 1024² still · the branded band held over the open bag: ring + wordmark, LED lit, teal stripe. The logo shot the reveal clip does not have. |
| `hero_still` | `web/public/assets/headband-hero.jpg` | 1024² still · the studio product shot the site uses as the reveal’s poster and the ProductSpotlight image: lens, LED, stripe, full lockup. |
| `worn_male` | `web/public/assets/worn-headband-male.jpg` | 1024² still · an athlete bench-pressing with the band on, lockup legible (site Gallery). Not Peter. |
| `hero_bench` | `web/public/assets/hero-bench.jpg` | 1024² still · the site’s Hero background, same athlete, band on. Not Peter. |
| `worn_neck` | `web/public/assets/wide-athlete.jpg` | 1024² still · athlete resting between sets with the band round his neck, phone in hand (site Gallery). |
| `old_log_typing` | `(new recording)` | a generic manual log being thumb-typed — burgundy on charcoal, never Fitbod. |
| `hud_live_set` | `(POC recording)` | `LiveHudScreen` on the A52 during a real set. |
| `debrief_confirm` | `(POC recording)` | `LabelingScreen` after the set → ‘ALL CORRECT — SAVE’. |
| `levels_progress` | `(POC recording)` | `CampaignScreen`, per-exercise level progress. |
| `frame_privacy` | `(motion graphic)` | one frame leaves the band — drawn from `headband-hero.jpg` — a seconds counter runs, the frame dissolves. |

Two facts decide how these are used:

1. **The reveal clip is the only footage of the real band, and the band in it is unbranded.** Frame-checked at 0.2–3.7 s: a plain black fabric loop coming out of the bag; no ring, no wordmark, no LED. It is still the strongest product shot in the repo because it is physical and it moves. The branded still `band_in_hand` is cut immediately after it in K3 so the logo lands within the same beat.
2. **Every branded image is an AI still already published on the site.** They are the campaign’s product imagery, not new inventions, so using them here changes no claim. Two of them show an athlete who is not Peter; they are used under ‘you’ (K6), never under ‘I’.

---

## 3. The band on Peter in the generated clips

The generated clips are where the band has to be prominent, and it is the hard part. Three rules from the pipeline and the prompt docs settle it:

- **Wardrobe belongs to the character and is stated in every prompt.** So the band is part of Peter’s outfit in all eight clips, described once, identically. The description below is the canonical one from `docs/body-mounted-image-prompts-updated.md` (the printed-headband spec, lines 587 and 620) condensed to a wardrobe clause.
- **No letters in a generated frame.** The pipeline’s first instruction bans writing, and the Kling runs showed why: text on a moving band renders as scribble. So the band Peter wears carries the **teal ring icon only**, never the wordmark. The prop-branding plan already made the same call for the physical band: “a take never fails on the wordmark alone — icon is the priority.” The full lockup appears in the composited stills.
- **Give Flow the picture, not just the words.** The character is minted from Peter’s photographs; the band should be an **ingredient** too: upload `headband-hero.jpg` as a second reference named *IronPal headband* and refer to it by that name in the prompt. Flow’s reference-to-video path takes more than one reference; geggen’s cast stage holds one character per slot and does not attach an object today, so this is either one manual step in Flow or a small engine change (ledger Q51).

**Wardrobe clause, verbatim in every prompt:**

> He is wearing a plain black tank top and the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side — the exact same outfit in every shot.

**Scene tokens, verbatim in every prompt:**

> in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm

**Framing.** Five of the eight clips are corner close-ups (`pip`), whose framing rule is already ‘tight head-and-shoulders, face filling the frame’ — the forehead, and so the band, is in every one of them by construction. The three wider shots each carry a band action: touch (K1), take off and hold up (K3), tap (K8).

**Gate.** The vision QA pass that already inspects clips for extra hands and burned-in text gets one more question per clip: is the band on his forehead, with the lens front and centre and the ring on the right? A clip that fails is re-rolled at 10 credits; a ring that renders as a smear is a re-roll, not a keep.

---

## 4. The script — eight clips, the band in every one

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  K6 0:40.0–0:48.0
K7 0:48.0–0:56.0  K8 0:56.0–1:04.0  CARD 1:04.0–1:06.5
```

**The joke.** Everyone at the gym is already filming; Peter’s camera is the only one that deletes anything. Stated in K1 and K2, paid on K8.

### K1 · hook · 0:00.0–0:08.0 · 15 words ≈ 7.4 s

> **Peter:** “Yes, there’s a camera on my head at the gym. Here’s exactly what it sends.”

- **layout:** `full` · options: —
- **action:** Peter stands on the gym floor between sets, squared to camera, and touches the band on his forehead once.
- **product on screen:** the band on Peter, full frame
- **band in the generated clip:** on his forehead, full body

**Why:** The objection, owned in the first second, and the product on his head from the first frame — that is why this script and not the others. Full body, but he is close enough that the band reads.

<details><summary>Paste-ready Flow prompt (the short form; the pipeline composes the long form from the same parts)</summary>

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter stands on the gym floor between sets, squared to camera, and touches the band on his forehead once in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. Full body, standing back from camera, the whole figure and the band on his forehead clearly visible. He faces the camera and delivers the line straight to camera, eyes on the lens. He is wearing a plain black tank top and the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side — the exact same outfit in every shot. He is alone in the shot. Natural, healthy, photorealistic skin. His clothing is plain, with nothing clipped or attached to it, and nothing worn in or over his ears; no screens, phones or devices anywhere. Audio: one clear man’s voice, lip-synced to him, spoken at a natural conversational pace with genuine expression, one single take: “Yes, there’s a camera on my head at the gym. Here’s exactly what it sends.” Those words are spoken aloud only — they are audio, not a caption; do not write or display them anywhere in the picture. Say the line exactly once and stop.
```

</details>

### K2 · old way · 0:08.0–0:16.0 · 13 words ≈ 6.4 s

> **Peter:** “Before, my thumb kept the log, badly, while three tripods filmed everyone else.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action:** Peter sits on the flat bench, deadpan, three short beats, the band on.
- **product on screen (composited):**
  - `old_log_typing` — (new recording)
- **band in the generated clip:** on his forehead in the close-up

**Why:** The before, and the premise: the gym was already full of cameras. The manual log fills the frame; Peter is a corner close-up, band in shot.

<details><summary>Paste-ready Flow prompt (the short form; the pipeline composes the long form from the same parts)</summary>

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter sits on the flat bench, deadpan, three short beats, the band on in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. Tight head-and-shoulders close-up, face filling the frame, the band on his forehead fully in shot, plain background. He faces the camera and delivers the line straight to camera, eyes on the lens. He is wearing a plain black tank top and the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side — the exact same outfit in every shot. He is alone in the shot. Natural, healthy, photorealistic skin. His clothing is plain, with nothing clipped or attached to it, and nothing worn in or over his ears; no screens, phones or devices anywhere. Audio: one clear man’s voice, lip-synced to him, spoken at a natural conversational pace with genuine expression, one single take: “Before, my thumb kept the log, badly, while three tripods filmed everyone else.” Those words are spoken aloud only — they are audio, not a caption; do not write or display them anywhere in the picture. Say the line exactly once and stop.
```

</details>

### K3 · the device · 0:16.0–0:24.0 · 14 words ≈ 6.9 s

> **Peter:** “It’s a headband. Fabric, a pea-sized lens, one teal light. That’s the whole device.”

- **layout:** `cutaway` · options: head_seconds: 1.2
- **action:** Peter takes the band off, holds it up at chest height for a moment, then puts it back on.
- **product on screen (composited):**
  - `reveal` — web/public/assets/reveal.mp4
  - `band_in_hand` — input/kickstarter/storyboarding/S3/selected.jpg
- **band in the generated clip:** in his hands, then back on

**Why:** 1.2 s of Peter with the band in his hands, then the real reveal footage takes the frame under his voice, then the branded still that carries the logo the footage lacks. The site’s Hardware section: 8 mm lens, one teal LED, no screen. This is the one clip where Peter holds anything — the pipeline’s most common rejection is a held prop that vanishes between frames — so the head is the shortest allowed (1.2 s) and the vision gate checks the band is in his hands for all of it; if it fails twice, the action becomes a touch on the forehead and the footage carries the rest.

<details><summary>Paste-ready Flow prompt (the short form; the pipeline composes the long form from the same parts)</summary>

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter takes the band off, holds it up at chest height for a moment, then puts it back on in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. Medium waist-up shot, upper body and face clearly in frame, the band in his hands and clearly visible before it goes back on his forehead. He faces the camera and delivers the line straight to camera, eyes on the lens. He is wearing a plain black tank top and the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side — the exact same outfit in every shot. He is alone in the shot. Natural, healthy, photorealistic skin. His clothing is plain, with nothing clipped or attached to it, and nothing worn in or over his ears; no screens, phones or devices anywhere. Audio: one clear man’s voice, lip-synced to him, spoken at a natural conversational pace with genuine expression, one single take: “It’s a headband. Fabric, a pea-sized lens, one teal light. That’s the whole device.” Those words are spoken aloud only — they are audio, not a caption; do not write or display them anywhere in the picture. Say the line exactly once and stop.
```

</details>

### K4 · what stays · 0:24.0–0:32.0 · 13 words ≈ 6.4 s

> **Peter:** “Reps and exercise are detected on the band, offline. That part never leaves.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action:** Peter stands at the rack, precise, one hand flat as if to say: this part, here.
- **product on screen (composited):**
  - `hud_live_set` — (POC recording)
- **band in the generated clip:** on his forehead in the close-up

**Why:** Scoped precisely. The live HUD is real; Peter is a corner close-up, band in shot. Straight line — the privacy spine is not joked with.

<details><summary>Paste-ready Flow prompt (the short form; the pipeline composes the long form from the same parts)</summary>

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter stands at the rack, precise, one hand flat as if to say: this part, here in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. Tight head-and-shoulders close-up, face filling the frame, the band on his forehead fully in shot, plain background. He faces the camera and delivers the line straight to camera, eyes on the lens. He is wearing a plain black tank top and the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side — the exact same outfit in every shot. He is alone in the shot. Natural, healthy, photorealistic skin. His clothing is plain, with nothing clipped or attached to it, and nothing worn in or over his ears; no screens, phones or devices anywhere. Audio: one clear man’s voice, lip-synced to him, spoken at a natural conversational pace with genuine expression, one single take: “Reps and exercise are detected on the band, offline. That part never leaves.” Those words are spoken aloud only — they are audio, not a caption; do not write or display them anywhere in the picture. Say the line exactly once and stop.
```

</details>

### K5 · what goes · 0:32.0–0:40.0 · 16 words ≈ 7.8 s

> **Peter:** “Reading the weight sends one frame, processed in seconds, deleted. My form was in it. Good.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action:** Peter leans on the rack, calm, laying it out plainly.
- **product on screen (composited):**
  - `frame_privacy` — (motion graphic)
- **band in the generated clip:** on his forehead in the close-up

**Why:** The Privacy section in spirit, then relief that the evidence of his form is gone. The graphic shows one frame leaving the band drawn from the hero still. No face-blurring claim.

<details><summary>Paste-ready Flow prompt (the short form; the pipeline composes the long form from the same parts)</summary>

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter leans on the rack, calm, laying it out plainly in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. Medium waist-up shot, upper body and face clearly in frame, the band on his forehead clearly visible. He faces the camera and delivers the line straight to camera, eyes on the lens. He is wearing a plain black tank top and the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side — the exact same outfit in every shot. He is alone in the shot. Natural, healthy, photorealistic skin. His clothing is plain, with nothing clipped or attached to it, and nothing worn in or over his ears; no screens, phones or devices anywhere. Audio: one clear man’s voice, lip-synced to him, spoken at a natural conversational pace with genuine expression, one single take: “Reading the weight sends one frame, processed in seconds, deleted. My form was in it. Good.” Those words are spoken aloud only — they are audio, not a caption; do not write or display them anywhere in the picture. Say the line exactly once and stop.
```

</details>

### K6 · worn · 0:40.0–0:48.0 · 13 words ≈ 6.4 s

> **Peter:** “You lift with it on. After the set, one question, one tap. Ideal.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action:** Peter stands at the rack, explaining something simple, one small nod.
- **product on screen (composited):**
  - `worn_male` — web/public/assets/worn-headband-male.jpg
  - `debrief_confirm` — (POC recording)
- **band in the generated clip:** on his forehead in the close-up

**Why:** The band on an athlete mid-press fills the frame for the first half, the real debrief for the second; ‘Ideal’ is the character. The athlete is not Peter — it is the site’s own gallery image, used as product imagery under ‘you’.

<details><summary>Paste-ready Flow prompt (the short form; the pipeline composes the long form from the same parts)</summary>

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter stands at the rack, explaining something simple, one small nod in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. Tight head-and-shoulders close-up, face filling the frame, the band on his forehead fully in shot, plain background. He faces the camera and delivers the line straight to camera, eyes on the lens. He is wearing a plain black tank top and the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side — the exact same outfit in every shot. He is alone in the shot. Natural, healthy, photorealistic skin. His clothing is plain, with nothing clipped or attached to it, and nothing worn in or over his ears; no screens, phones or devices anywhere. Audio: one clear man’s voice, lip-synced to him, spoken at a natural conversational pace with genuine expression, one single take: “You lift with it on. After the set, one question, one tap. Ideal.” Those words are spoken aloud only — they are audio, not a caption; do not write or display them anywhere in the picture. Say the line exactly once and stop.
```

</details>

### K7 · progress · 0:48.0–0:56.0 · 15 words ≈ 7.4 s

> **Peter:** “I train, the set is logged, each exercise earns its level. My deadlift is Provisional.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action:** Peter sits on the bench, unhurried, watching something add up.
- **product on screen (composited):**
  - `levels_progress` — (POC recording)
- **band in the generated clip:** on his forehead in the close-up

**Why:** Levels are real; a real level name as a verdict on himself. Corner close-up, band in shot.

<details><summary>Paste-ready Flow prompt (the short form; the pipeline composes the long form from the same parts)</summary>

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter sits on the bench, unhurried, watching something add up in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. Tight head-and-shoulders close-up, face filling the frame, the band on his forehead fully in shot, plain background. He faces the camera and delivers the line straight to camera, eyes on the lens. He is wearing a plain black tank top and the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side — the exact same outfit in every shot. He is alone in the shot. Natural, healthy, photorealistic skin. His clothing is plain, with nothing clipped or attached to it, and nothing worn in or over his ears; no screens, phones or devices anywhere. Audio: one clear man’s voice, lip-synced to him, spoken at a natural conversational pace with genuine expression, one single take: “I train, the set is logged, each exercise earns its level. My deadlift is Provisional.” Those words are spoken aloud only — they are audio, not a caption; do not write or display them anywhere in the picture. Say the line exactly once and stop.
```

</details>

### K8 · close · 0:56.0–1:04.0 · 16 words ≈ 7.8 s

> **Peter:** “Six mirrors, three tripods, a ceiling camera. Mine’s the only one that deletes. Reserve a spot.”

- **layout:** `full` · options: —
- **action:** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look, then taps the band once.
- **product on screen:** the band on Peter, full frame
- **band in the generated clip:** on his forehead, full body

**Why:** The punchline pays K2 and restates the privacy fact in the same breath. Full frame, rhyming with K1, ending on the band.

<details><summary>Paste-ready Flow prompt (the short form; the pipeline composes the long form from the same parts)</summary>

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no letters or numerals anywhere in frame. Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look, then taps the band once in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm. Full body, standing back from camera, the whole figure and the band on his forehead clearly visible. He faces the camera and delivers the line straight to camera, eyes on the lens. He is wearing a plain black tank top and the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side — the exact same outfit in every shot. He is alone in the shot. Natural, healthy, photorealistic skin. His clothing is plain, with nothing clipped or attached to it, and nothing worn in or over his ears; no screens, phones or devices anywhere. Audio: one clear man’s voice, lip-synced to him, spoken at a natural conversational pace with genuine expression, one single take: “Six mirrors, three tripods, a ceiling camera. Mine’s the only one that deletes. Reserve a spot.” Those words are spoken aloud only — they are audio, not a caption; do not write or display them anywhere in the picture. Say the line exactly once and stop.
```

</details>

### CARD · 1:04.0–1:06.5 · no VO

- A camera on your head. Handled honestly.
- ironpal.co
- Early-bird · first 200 · ~50 % off

The pipeline’s card is text on the brand colour. If the engine gains a background option, `headband-hero.jpg` is the card; until then the product’s last appearance is K8’s tap.

---

## 5. Reconciled with the existing product prompts

| where the product is described | what it says | how this script uses it |
|---|---|---|
| `body-mounted-image-prompts-updated.md` §587, §620 — the printed headband spec | matte black, thin electric-teal stripe on the lower edge, 8 mm flush lens front centre, one teal LED beside it, ring icon + ‘IronPal’ wordmark ~30 mm on the right side, camelCase | the wardrobe clause above, minus the wordmark (no letters in generated frames); the lockup is carried by the stills |
| `body-mounted-product-prompts.md` — the standalone product shot | the same spec on a white-to-grey studio background, logo handling rules, `#00E5CC` | that shot is `headband-hero.jpg`; it is the Flow ingredient and the privacy graphic’s band |
| `s3-physical-prop-branding-plan.md` §1 | icon Ø 12 mm is the guaranteed deliverable; the wordmark is secondary and may not survive | the same priority applied to the generated band: ring first, wordmark never |
| `video-production-execution-plan.md` S3/S4 | the reveal from the bag; lifts with the band on, logo and LED composited in post | S3 is `reveal.mp4` + `band_in_hand`; the S4 idea is `worn_male` under K6 |
| `ironpal-landing-page-plan_grilled.md` Q3 | overlays on real footage are labelled ‘product interface concept’ | no overlay in this script; the HUD, debrief and levels are real recordings |
| `founder_video_scripts.md` §1 — Peter’s wardrobe | a plain matte-black headband with nothing printed on it | **superseded** for the selected script: the band is the IronPal band with the ring mark, per §3 |

---

## 6. Worth your eye before anything renders

- **The generated band will be the test.** Flow may hold the ring mark, smear it, or drop it. Render K1 alone first; it is 10 credits and decides whether the band comes from wardrobe words, from the ingredient, or has to fall back to a plain band with the product carried by the stills.
- **The reveal clip has no logo on the band.** If the logo must be visible on the real, moving band, that is the physical-prop re-shoot from `s3-physical-prop-branding-plan.md`, and the brief said no time and no budget. The branded still directly after it is the compromise; it is recorded as open in the ledger.
- **Two stills show a man who is not Peter** (`worn_male`, `hero_bench`). They appear only under ‘you lift with it on’, the way the site itself uses them. If that reads as a cheat next to the founder, replace K6’s first half with `worn_neck` or with the reveal again.
- **K3 is the only clip where Peter holds the band**, and a held object is the pipeline’s most common rejection. The head is 1.2 s for that reason; two failed rolls and the hold becomes a touch.
- **Eighty credits, and no account held fifty at the last count.** Same as before: which account pays is open.
