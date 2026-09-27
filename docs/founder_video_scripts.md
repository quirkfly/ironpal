# IronPal — six founder video scripts (Google Flow, 8 × 8 s)

**Status:** Draft v4.0 · 2026-09-27 — rewritten to the pipeline’s comedy rubric: one joke per script, escalating to the last line; eight 8 s clips; design review complete (auto mode)  
**On camera:** Peter, 46, the founder — one Flow character minted from his reference photographs, speaking every clip  
**Format:** vertical 9:16, 1080×1920, 30 fps; **eight Flow clips of ≤ 8 s + a 2.5 s card**. Each shot runs the length of its spoken line, not the full slot, so a script of ≤ 117 words lands at ≈ 60 s; 66.5 s is the ceiling if every clip ran its full 8 s  
**Word budget:** ≤ 16 words per clip (8 s × 2.04 words/s, the rate measured across the four rendered beats of `handlr-eve-11`) and **≤ 117 words per script** (57.4 s of speech + the card = 59.9 s); every count and estimate below is computed, and both caps are asserted before this file is written  
**Reference:** the handlr Eve onboarding promo, `handlr-eve-11` → `-17` (geggen `docs/video_script_redesign_v1.md`, `pipeline/promo/`) — 8 s beats, the screen behind every line, one character speaking all of it, the close rhyming with the hook  

> **Decisions from the design review are in [`founder_video_scripts_grilled.md`](founder_video_scripts_grilled.md) (Q1–Q48) and are folded in below.** The review ran **without user interaction**: 29 decisions rest on evidence in the repo, the site or the geggen pipeline, 16 are assumptions tagged for veto, 3 are open (a site claim the scripts contradict, whether the branded prop is finished, and which Flow account pays the credits). The assumptions most worth a veto are at the top of the ledger.

---

## 0. The shape every script follows — and why it is this shape

The geggen pipeline renders one **8 s** Google Flow clip per speaking beat, with the line **baked in and lip-synced** to a minted character; the product is never in the generated clip but is **composited** from real recordings by layout. The handlr Eve promo settled on five such clips plus a card; the brief for IronPal asks for a 60 s window, which is three more clips. The three are spent on what the five could not fit: the hardware, the first session, and the correction loop — the ‘improve’ half of tracking:

| clip | job | layout | the character | what fills the frame |
|---|---|---|---|---|
| **K1** | hook — never names the product | `full` (or `cutaway` when the hook *is* a picture) | Peter, whole gym scene | nothing, or one cutaway |
| **K2** | **the old way** | `pip` | Peter, corner close-up | a generic manual log being thumb-typed |
| **K3** | **the new way** | `pip` | Peter, corner close-up | the POC’s live HUD during a real set |
| **K4–K6** | three of: the hardware · the first session · the correction loop · the weight bet · what leaves the band · the field | `product_full`, `pip`, `cutaway` | off-screen, corner, or 1.8 s of face | the live reveal, the debrief, the studio, the stack POV, the privacy graphic |
| **K7** | progress | `pip` | Peter, corner close-up | the POC’s levels screen |
| **K8** | the close | `full` | Peter, full frame, rhyming with K1 | nothing |
| card | CTA | `card` | — | three lines and the URL |

Rules carried over from the handlr runs, each one paid for:

- **≤ 16 words per line, ≤ 117 per script.** 8 s at 2.04 words/s is 16.3; the first handlr draft ran 22–28 words a line and could not have rendered. A shot’s length is its detected speech window (`assemble.py`), so eight clips of ~15 words run ≈ 57 s, not 64; the 117-word cap is what keeps the card inside 60 s. The last clause of each 16-word line is the droppable one.
- **The `action` is a short, declarative stage direction naming the character** — “Peter stands on the gym floor…”. A 3,587-character prompt was refused nine times as “prominent people”; “Eve is doing biceps curl.” rendered immediately. No quotation marks inside an action: a quoted fragment gets painted into the picture as a caption (“5ive steps”, “vetted.”).
- **Nothing held, nothing on screen, nothing written** in a generated clip. A held phone vanishes between frames; a screen renders as scribble; a word becomes a burned-in caption. The old way is therefore carried by the composited log footage, not by Peter holding a phone.
- **One wardrobe, stated in words, in every clip**: the character owns the outfit, so it cannot change between beats. Peter’s includes a **plain matte-black headband with nothing printed on it** — logos in generated video float off the object (the Kling lesson), so the branded band exists only in live footage that is composited in.
- **The setting is named in words in every prompt**, because there is no photograph of Peter in a gym to pin it to; a body variant with an unstated scene came back in a different invented gym per clip.
- **Every claim maps to the allowlist** (§8); the pipeline’s validator fails a run that says anything else, and there is no human review before publishing.
- **Credits:** 10 per clip, refusals free, minting free. **80 credits per script, 480 for all six.**
- **Engine limits:** `primitives.json` caps a promo at `max_clips: 4` and `max_beats: 6`; the Eve config already runs five. Eight clips and nine beats need those two numbers raised — a config change in geggen, listed in §10.

### 0.1 The comedy rules — geggen’s own, applied

The pipeline that renders these carries a comedy rubric (`creative.py` `_COMEDY["comedic"]`, `jokes.py` `RUBRIC`) written after fourteen handlr promos that were competent and not funny. Every line below was written to it:

- **One joke per script.** A premise you can state in a sentence, escalating clip to clip, landing on K8. Not eight unrelated quips. The premise and the punchline of each script are in the table below.
- **Character-driven, played straight.** Peter is a man doing something slightly unreasonable with total conviction. He does not know he is funny and never winks.
- **Specific beats clever.** The number, the exact wording, the small humiliating detail: ‘whatever the thumb decided’, ‘my deadlift is Provisional’, ‘typing like it’s 2011’. No puns, no wordplay, no exclamation marks, no jokes about AI.
- **The target is the situation, or Peter.** Never the viewer, never a named competitor, never a group. The receptionist, the tripods and the mirrors are the gym, not people.
- **About the world, so the product is the answer.** The jokes are about gym logging culture — fudged numbers, phones as a social shield, logs that remember nothing — and the cut to the product lands as the reply. Jokes about the product itself were the failure mode the rubric was written against.
- **Each line does both.** Informative and funny. Where a joke would read as mocking a hedge — the privacy spine of F4, the ‘still being built’ lines — the line stays straight and the joke sits either side of it.
- **Recognition, not laughter.** The test the rubric names: someone in the audience exhales through their nose because it happened to them.

Lines that make no product claim (‘three years, the receptionist still asks my name’, ‘eight companies’) are `claim_refs: []` joke lines. In geggen a joke’s wording is approved by a human at GATE 1 before it can widen anything (`jokes.py`); the ledger lists them for the founder to approve or strike.

| Script | The joke, in one sentence | Lands on K8 as |
|---|---|---|
| F1 · The fourth exercise | Logging is a fourth exercise, and it is the only one Peter has ever been bad at. | The only exercise he ever quit was typing. |
| F2 · I told it once | The band is the only thing in Peter’s gym that needed telling once. | After three years the receptionist still asks his name. |
| F3 · Nobody reads the bar | Everything in the gym guesses Peter’s numbers, and he is the worst guesser of all. | The bar is the one witness that knows, and he is making it talk. |
| F4 · Yes, there’s a camera on my head | Everyone at the gym is already filming; Peter’s camera is the only one that deletes anything. | Six mirrors, three tripods, a ceiling camera. His is the only one that deletes. |
| F5 · I put a trainer in my code editor | Peter builds a tool for every problem he has, with total conviction, and he has a lot of problems. | Eight companies, one headband, zero typing. |
| F6 · A month I never logged | The log is finally complete, and the truth is less flattering than the fudged version. | The old log said eight reps; the band counted six; he has made peace with six. |

---

## 1. The cast — one character, minted once

| field | value |
|---|---|
| slot / name | `founder` / **Peter**, 46, man |
| persona (the portrait prompt is built around this) | a lean, athletic 46-year-old White man with a closely shaved head, light stubble with a moustache and a short greying chin beard, fair skin, defined shoulders and arms; calm, a slight dry smile |
| wardrobe (stated in every clip prompt) | a plain black tank top and a plain matte-black fabric headband with nothing printed on it |
| identity anchor | `../geggen/products/handlr/reference/peter_01_tanktop_x4.png` — the B&W tank-top portrait, the clearest facial structure available |
| identity support | `../geggen/products/handlr/reference/peter_face_colour_x4.png` — the only colour information (skin tone, facial hair), un-mirrored |
| scene tokens (in every clip prompt) | in a dark, moody weights gym: matte black rubber floor, a black flat bench, a rack of dumbbells behind, lit low and warm |
| holding | none — no phone in any clip |

The reference photographs are third-generation (a compressed dating-app upload, screen-recorded at 124 kb/s, 466 px a side). The refpack README in geggen says the upscales add no detail; the likeness prompt exists to keep the face and the age, not to invent either. **There is no photograph of Peter in a gym**, so the scene has no reference image and lives entirely in the scene tokens — see the ledger, and §9.

---

## 2. F1 — The fourth exercise

**Angle.** Every set has a hidden fourth exercise: typing it in. Peter names it, shows it, then shows the band doing it for him.

**The joke.** Logging is a fourth exercise, and it is the only one Peter has ever been bad at. It lands on K8: The only exercise he ever quit was typing.

**≈ 59.9 s** at speech length (**117 words** at 2.04 w/s + 2.5 s card) · 66.5 s ceiling if every clip ran its full 8 s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  K6 0:40.0–0:48.0
K7 0:48.0–0:56.0  K8 0:56.0–1:04.0  CARD 1:04.0–1:06.5
```

### K1 · hook · 0:00.0–0:08.0 · 15 words ≈ 7.4 s

> **Peter:** “Every set has a fourth exercise: typing it into my phone. I’m bad at it.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor between sets, squared to camera, calm, a slight dry smile.
- **product footage composited:** none — Peter, full frame

**Why:** The premise, stated as a fact about himself. No product, no name. ‘I’m bad at it’ is the confession the whole script escalates.

### K2 · old way · 0:08.0–0:16.0 · 13 words ≈ 6.4 s

> **Peter:** “Three by eight at eighty. Or seventy-five. Whatever the thumb decided that night.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the flat bench, shoulders down, and reports it without expression.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** The before, and the first escalation: the thumb decides. Everyone who has ever logged a set from memory exhales through the nose here. The log on screen gets the number edited.

### K3 · new way · 0:16.0–0:24.0 · 15 words ≈ 7.4 s

> **Peter:** “Now a headband watches the set. Exercise and reps log themselves. My thumb is retired.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the dumbbell rack, alert, a little pleased with himself.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The after, and the product lands as the answer to the joke. The HUD is on screen; only exercise and reps are claimed.

### K4 · the hardware · 0:24.0–0:32.0 · 14 words ≈ 6.9 s

> **Peter:** “Eight millimetre camera, no screen. So between sets I have to look at people.”

- **layout:** `product_full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, relaxed, saying it as if it hardly matters.
- **product footage composited:**
  - `reveal` — campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot

**Why:** Hardware fact plus the small social horror of a gym without a phone to stare at. Voice over the live reveal, the only place the branded band appears.

### K5 · first session · 0:32.0–0:40.0 · 16 words ≈ 7.8 s

> **Peter:** “First time, it asks after the set: was that a curl. Yes. Longest conversation we’ve had.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining something simple, one small nod.
- **product footage composited:**
  - `debrief_confirm` — screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’

**Why:** The teach-once mechanism on the real debrief screen, and the character: a man who prefers a device that asks one question.

### K6 · the weight · 0:40.0–0:48.0 · 14 words ≈ 6.9 s

> **Peter:** “The weight I’m still building. Nobody reads it off a bar yet. Including me.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, level and honest, no sell in it.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’

**Why:** The hedge, kept whole, and the callback to K2: he cannot read the bar either. J-cut to the stack POV with the concept label.

### K7 · progress · 0:48.0–0:56.0 · 14 words ≈ 6.9 s

> **Peter:** “Clean sets stack up, each exercise earns its level. Typing never got past beginner.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench between sets, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Levels are real and on screen. The escalation: everything progressed except the fourth exercise.

### K8 · close · 0:56.0–1:04.0 · 16 words ≈ 7.8 s

> **Peter:** “Years of lifting. The only exercise I ever quit was typing. Reserve a spot. Costs nothing.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** The punchline pays K1 and carries the CTA. Full frame, rhyming with the hook. No price is spoken.

### CARD · 1:04.0–1:06.5 · no VO

- Stop logging. Just lift.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 3. F2 — I told it once

**Angle.** The app’s actual mechanism as the story: the band does not come knowing your exercises, you tell it once, and from then on it knows. Honest about the first session.

**The joke.** The band is the only thing in Peter’s gym that needed telling once. It lands on K8: After three years the receptionist still asks his name.

**≈ 59.9 s** at speech length (**117 words** at 2.04 w/s + 2.5 s card) · 66.5 s ceiling if every clip ran its full 8 s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  K6 0:40.0–0:48.0
K7 0:48.0–0:56.0  K8 0:56.0–1:04.0  CARD 1:04.0–1:06.5
```

### K1 · hook · 0:00.0–0:08.0 · 16 words ≈ 7.8 s

> **Peter:** “My headband didn’t know what a curl was. I told it once. It hasn’t asked since.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, and says it like a plain fact about his week.
- **product footage composited:** none — Peter, full frame

**Why:** The premise: told once. Everything after it is a thing that needed telling more than once.

### K2 · old way · 0:08.0–0:16.0 · 13 words ≈ 6.4 s

> **Peter:** “The old app I told everything, every set, for years. It never remembered.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, patient and a little weary, counting it off on nothing.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** The before: a log that remembers nothing is the oldest gym truth there is. The manual log fills the frame.

### K3 · first session · 0:16.0–0:24.0 · 14 words ≈ 6.9 s

> **Peter:** “First session, it watches, then asks one question: was that a curl. One tap.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining something simple, one small nod.
- **product footage composited:**
  - `debrief_confirm` — screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’

**Why:** The debrief screen is real: one question after the set, one tap. It is what makes ‘once’ credible.

### K4 · next session · 0:24.0–0:32.0 · 15 words ≈ 7.4 s

> **Peter:** “Second session it knows. Same rack, same me, logged while I stare at the wall.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter leans on the rack between sets, relaxed, as if it is no longer his job.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** Recognise-by-embedding, scoped to one user at one gym, and the small true detail of rest periods.

### K5 · corrections · 0:32.0–0:40.0 · 13 words ≈ 6.4 s

> **Peter:** “When it’s wrong, I fix it, and it learns. Unlike my left elbow.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, matter-of-fact, a small shrug at a mistake.
- **product footage composited:**
  - `studio_fix` — screen recording — POC `StudioScreen`: scrub to the set, correct the exercise, save

**Why:** The studio is real; a corrected set is kept as an example. The target of the joke is his own elbow.

### K6 · what leaves · 0:40.0–0:48.0 · 16 words ≈ 7.8 s

> **Peter:** “Reps and exercise stay on the band. The weight, one frame, deleted. The mirror keeps everything.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, calm, laying it out plainly.
- **product footage composited:**
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves

**Why:** The hybrid privacy architecture in one sentence, then the gym mirror as the one device that never forgets. J-cut to the frame graphic.

### K7 · progress · 0:48.0–0:56.0 · 14 words ≈ 6.9 s

> **Peter:** “A few clean sets and it’s certified. From then on the log fills itself.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Levels on screen; ‘certified’ is the level’s real name. Straight line so K8 has room.

### K8 · close · 0:56.0–1:04.0 · 16 words ≈ 7.8 s

> **Peter:** “Told it once. Three years, the receptionist still asks my name. Reserve a spot. Costs nothing.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** The punchline: the one thing at the gym that listened the first time was the band. The receptionist is the situation, not a person.

### CARD · 1:04.0–1:06.5 · no VO

- Teach it once. Then just lift.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 4. F3 — Nobody reads the bar

**Angle.** Leads with the hard problem. The credible half (exercise and reps) carries the trust, the weight carries the why. Every hedge from the site’s FAQ is kept.

**The joke.** Everything in the gym guesses Peter’s numbers, and he is the worst guesser of all. It lands on K8: The bar is the one witness that knows, and he is making it talk.

**≈ 59.9 s** at speech length (**117 words** at 2.04 w/s + 2.5 s card) · 66.5 s ceiling if every clip ran its full 8 s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  K6 0:40.0–0:48.0
K7 0:48.0–0:56.0  K8 0:56.0–1:04.0  CARD 1:04.0–1:06.5
```

### K1 · hook · 0:00.0–0:08.0 · 16 words ≈ 7.8 s

> **Peter:** “Your watch guesses your weight from your body mass. Mine is trying to read the bar.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, dry, glancing once at his own wrist.
- **product footage composited:** none — Peter, full frame

**Why:** The Compare row without a brand name, and the premise: guessing. ‘Trying’ is the hedge and the hook.

### K2 · old way · 0:08.0–0:16.0 · 13 words ≈ 6.4 s

> **Peter:** “Old way: I typed eighty from memory. Memory formed after a heavy set.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, remembering a number badly, a small shrug.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** The before, and why the number was wrong: post-set brain. The log on screen gets edited.

### K3 · the easy half · 0:16.0–0:24.0 · 15 words ≈ 7.4 s

> **Peter:** “It does the easy half already: exercise and reps, offline. The half I got wrong.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, matter-of-fact, this part is not in doubt.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The part that works, with the live HUD behind it, and the confession that even the easy half beat him.

### K4 · first person · 0:24.0–0:32.0 · 16 words ≈ 7.8 s

> **Peter:** “It sees what I see. Nothing bolted to the bar or machine. Gym owners can relax.”

- **layout:** `product_full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, plain, pointing at nothing.
- **product footage composited:**
  - `reveal` — campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot

**Why:** First-person view, no equipment instrumentation, and the one party in this story who is relieved. Voice over the live reveal.

### K5 · the bet · 0:32.0–0:40.0 · 14 words ≈ 6.9 s

> **Peter:** “The weight is one frame, sent, read, deleted. Unfinished. In progress. Like my squat.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, level and honest, counting the fragments off with small nods.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves

**Why:** The FAQ’s hedges as fragments, then the same words turned on himself. J-cut to the stack POV and the frame graphic.

### K6 · the field · 0:40.0–0:48.0 · 15 words ≈ 7.4 s

> **Peter:** “Bar sensors make you type it. Camera machines read only their own plates. Everyone guesses.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unimpressed, listing what the others do.
- **product footage composited:** none — Peter, full frame

**Why:** The rest of the Compare table, no brand names, and the premise restated as the state of the world.

### K7 · progress · 0:48.0–0:56.0 · 14 words ≈ 6.9 s

> **Peter:** “Exercise and reps earn their level, set by set. The weight, when it’s proven.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Levels are real; the weight stays conditional even here. Straight line so K8 has room.

### K8 · close · 0:56.0–1:04.0 · 14 words ≈ 6.9 s

> **Peter:** “The bar’s the one witness that knows. I’m making it talk. Reserve a spot.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** The punchline: an interrogation, played straight. It pays K1 without claiming the weight is read.

### CARD · 1:04.0–1:06.5 · no VO

- The hard problem. Being built.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 5. F4 — Yes, there’s a camera on my head

**Angle.** Answers the objection first. The privacy architecture, stated exactly as the site states it: two things stay on the band, one frame leaves and is deleted.

**The joke.** Everyone at the gym is already filming; Peter’s camera is the only one that deletes anything. It lands on K8: Six mirrors, three tripods, a ceiling camera. His is the only one that deletes.

**≈ 59.9 s** at speech length (**117 words** at 2.04 w/s + 2.5 s card) · 66.5 s ceiling if every clip ran its full 8 s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  K6 0:40.0–0:48.0
K7 0:48.0–0:56.0  K8 0:56.0–1:04.0  CARD 1:04.0–1:06.5
```

### K1 · hook · 0:00.0–0:08.0 · 15 words ≈ 7.4 s

> **Peter:** “Yes, there’s a camera on my head at the gym. Here’s exactly what it sends.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, and touches the band on his forehead once.
- **product footage composited:** none — Peter, full frame

**Why:** The objection, owned in the first second. The band is plain black; the branded band appears only in the composited reveal.

### K2 · old way · 0:08.0–0:16.0 · 13 words ≈ 6.4 s

> **Peter:** “Before, my thumb kept the log, badly, while three tripods filmed everyone else.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, deadpan, three short beats.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** The before, and the premise: the gym was already full of cameras. The manual log fills the frame.

### K3 · what stays · 0:16.0–0:24.0 · 13 words ≈ 6.4 s

> **Peter:** “Reps and exercise are detected on the band, offline. That part never leaves.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, precise, one hand flat as if to say: this part, here.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** Scoped precisely: ‘that part’ never leaves. Straight line — the privacy spine is not joked with.

### K4 · what goes · 0:24.0–0:32.0 · 16 words ≈ 7.8 s

> **Peter:** “Reading the weight sends one frame, processed in seconds, deleted. My form was in it. Good.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, calm, laying it out plainly.
- **product footage composited:**
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves

**Why:** The Privacy section in spirit, then relief that the evidence of his form is gone. J-cut to the frame graphic. No face-blurring claim.

### K5 · the hardware · 0:32.0–0:40.0 · 13 words ≈ 6.4 s

> **Peter:** “No screen. One camera, one light, pointed where I look. Mostly the floor.”

- **layout:** `product_full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, relaxed, saying it as if it hardly matters.
- **product footage composited:**
  - `reveal` — campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot

**Why:** Hardware and first-person view, and the truth about where a lifter looks on a heavy set. Voice over the live reveal.

### K6 · the chore · 0:40.0–0:48.0 · 16 words ≈ 7.8 s

> **Peter:** “After a set it asks one question. One tap answers it. That’s the whole conversation. Ideal.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining something simple, one small nod.
- **product footage composited:**
  - `debrief_confirm` — screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’

**Why:** The debrief is real. ‘Ideal’ is the character: a man who wants exactly one question per set.

### K7 · progress · 0:48.0–0:56.0 · 15 words ≈ 7.4 s

> **Peter:** “I train, the set is logged, each exercise earns its level. My deadlift is Provisional.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Levels on screen, and a real level name used as a verdict on himself.

### K8 · close · 0:56.0–1:04.0 · 16 words ≈ 7.8 s

> **Peter:** “Six mirrors, three tripods, a ceiling camera. Mine’s the only one that deletes. Reserve a spot.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** The punchline pays K2 and restates the privacy fact in the same breath. The situation is the target.

### CARD · 1:04.0–1:06.5 · no VO

- A camera on your head. Handled honestly.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 6. F5 — I put a trainer in my code editor

**Angle.** Origin story and credibility: Peter already shipped a desk-exercise trainer inside VS Code, and is a hybrid athlete. The gitnfit clip is the only outside footage.

**The joke.** Peter builds a tool for every problem he has, with total conviction, and he has a lot of problems. It lands on K8: Eight companies, one headband, zero typing.

**≈ 59.9 s** at speech length (**117 words** at 2.04 w/s + 2.5 s card) · 66.5 s ceiling if every clip ran its full 8 s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  K6 0:40.0–0:48.0
K7 0:48.0–0:56.0  K8 0:56.0–1:04.0  CARD 1:04.0–1:06.5
```

### K1 · hook · 0:00.0–0:08.0 · 16 words ≈ 7.8 s

> **Peter:** “I put a trainer in my code editor. Makes me lunge at my desk. Nobody asked.”

- **layout:** `cutaway` · options: head_seconds: 2.4
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, amused at himself.
- **product footage composited:**
  - `gitnfit_desk_lunge` — cutaway — `../gitnfit/gitnfit-vscode/exercises/desk-assisted-lunge.mp4` (1280×720, 14 s), Peter as the desk trainer

**Why:** J-cut to the real gitnfit footage of him lunging at the desk: proof, and the premise — he builds things nobody asked for.

### K2 · old way · 0:08.0–0:16.0 · 14 words ≈ 6.9 s

> **Peter:** “Then the gym: phone, gloves, thumbs. Typing sets into a phone like it’s 2011.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, listing it off with a flat rhythm, the last word heavier.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** The before, dated on purpose. The manual log fills the frame.

### K3 · new way · 0:16.0–0:24.0 · 15 words ≈ 7.4 s

> **Peter:** “So, obviously, I built a headband. It watches from my eyes, logs exercise and reps.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, quietly proud, a builder showing a thing that works.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** ‘Obviously’ is the whole character: total conviction, played straight. The HUD is on screen.

### K4 · how · 0:24.0–0:32.0 · 15 words ≈ 7.4 s

> **Peter:** “Motion and camera. Free weights and machines, validated one exercise at a time. Currently, curls.”

- **layout:** `product_full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining plainly, one small hand gesture for together.
- **product footage composited:**
  - `reveal` — campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot

**Why:** Capability grid, hedged with the FAQ’s own words, then the honest scale of ‘currently’. Voice over the live reveal.

### K5 · first session · 0:32.0–0:40.0 · 14 words ≈ 6.9 s

> **Peter:** “It asks once, after the first sets, then knows my exercises. Apparently I’m predictable.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining something simple, one small nod.
- **product footage composited:**
  - `debrief_confirm` — screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’

**Why:** Teach-once on the real debrief, and the machine’s verdict on him.

### K6 · the weight · 0:40.0–0:48.0 · 16 words ≈ 7.8 s

> **Peter:** “The weight I’m still building. Nobody reads it off a bar yet. Give me a minute.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, honest, no sell in it.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’

**Why:** The hedge kept whole; ‘give me a minute’ is the builder’s conviction. J-cut to the stack POV with the concept label.

### K7 · progress · 0:48.0–0:56.0 · 15 words ≈ 7.4 s

> **Peter:** “The log fills itself. Each exercise earns its level. I go do the next set.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Levels on screen. Straight line so the punchline has room.

### K8 · close · 0:56.0–1:04.0 · 12 words ≈ 5.9 s

> **Peter:** “Eight companies, one headband, zero typing. Reserve a spot. It costs nothing.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** The punchline pays K1: the man who builds a tool for everything. ‘Eight companies’ is a fact about the founder, not the product — it is in the joke pool for his approval.

### CARD · 1:04.0–1:06.5 · no VO

- Built by the guy wearing it.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 7. F6 — A month I never logged

**Angle.** Opens on the result: a full month of sets, none of them typed. The improvement story leads; the old way is what would be missing.

**The joke.** The log is finally complete, and the truth is less flattering than the fudged version. It lands on K8: The old log said eight reps; the band counted six; he has made peace with six.

**≈ 59.9 s** at speech length (**117 words** at 2.04 w/s + 2.5 s card) · 66.5 s ceiling if every clip ran its full 8 s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  K6 0:40.0–0:48.0
K7 0:48.0–0:56.0  K8 0:56.0–1:04.0  CARD 1:04.0–1:06.5
```

### K1 · hook · 0:00.0–0:08.0 · 14 words ≈ 6.9 s

> **Peter:** “Every set I did this month. I logged none. Some I’d have left out.”

- **layout:** `cutaway` · options: head_seconds: 1.2
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, quietly satisfied.
- **product footage composited:**
  - `trend_concept` — overlay on a real first-person clip — a weeks-over-weeks trend, labelled ‘product interface concept’

**Why:** 1.2 s of Peter, then the month view (a labelled concept). The premise: the complete log contains things he would not have written down.

### K2 · old way · 0:08.0–0:16.0 · 14 words ≈ 6.9 s

> **Peter:** “The old way, half of these wouldn’t exist. The rest were rounded up. Generously.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, shaking his head slightly at the memory.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** The before as absence, and the confession every lifter recognises. The manual log fills the frame.

### K3 · new way · 0:16.0–0:24.0 · 15 words ≈ 7.4 s

> **Peter:** “A headband watched each set, exercise and reps, while I rested. Even the short ones.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, relaxed, as if describing the weather.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The after, with the live HUD. ‘Even the short ones’: the sets a manual log quietly loses.

### K4 · first week · 0:24.0–0:32.0 · 15 words ≈ 7.4 s

> **Peter:** “First week it asked after each set. One tap. Then it stopped. I miss it.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining something simple, one small nod.
- **product footage composited:**
  - `debrief_confirm` — screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’

**Why:** Teach-once on the real debrief, and the loneliness of a device that no longer needs you.

### K5 · the weight · 0:32.0–0:40.0 · 15 words ≈ 7.4 s

> **Peter:** “Weight comes from one frame, then deleted. Still being built. Until then I round down.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, honest, no sell in it.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves

**Why:** Weight hedged, privacy fact kept, and the escalation of K2: now that the band is honest, he rounds the other way.

### K6 · when unsure · 0:40.0–0:48.0 · 15 words ≈ 7.4 s

> **Peter:** “When it’s unsure it says so, and I fix it. Honest beats confident. Tried both.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, matter-of-fact, a small shrug at a mistake.
- **product footage composited:**
  - `studio_fix` — screen recording — POC `StudioScreen`: scrub to the set, correct the exercise, save

**Why:** The reject rule and the studio. ‘Tried both’ is the man admitting which one he used to be.

### K7 · progress · 0:48.0–0:56.0 · 13 words ≈ 6.4 s

> **Peter:** “Each exercise earns its level, set by set. Curl certified. Squat still Recon.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Levels on screen, with the real level names as a report card.

### K8 · close · 0:56.0–1:04.0 · 16 words ≈ 7.8 s

> **Peter:** “Old log said eight reps. Band counted six. I’ve made peace with six. Reserve a spot.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** The punchline pays K2 with a rep count, which the band does claim, never a weight, which it does not.

### CARD · 1:04.0–1:06.5 · no VO

- Every set. None of them typed.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 8. Product footage — every segment, its source, and whether it is real

The pipeline cuts product footage from recordings and refuses a segment that was never cut; it never fabricates UI. A segment may carry its own `source` file (geggen commit `8b9c786`), so these do not have to come from one recording.

| segment id | what the viewer sees | source and status |
|---|---|---|
| `old_log_typing` | screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed | NEW asset. Build a throwaway mock (burgundy accent on charcoal, its own layout) and screen-record it. Never a Fitbod screenshot, never the name — the video plan’s legal note. |
| `hud_live_set` | screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps | Real. Record on the phone while a set runs; the HUD shows exercise and reps, which is all any line over it claims. |
| `debrief_confirm` | screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’ | Real. The one question after the set, and the one tap. |
| `studio_fix` | screen recording — POC `StudioScreen`: scrub to the set, correct the exercise, save | Real. The after-action studio; a corrected set is re-evaluated and becomes an example. |
| `levels_progress` | screen recording — POC `CampaignScreen`, per-exercise level progress | Real. Sets accumulating into Recon → Provisional → Certified. |
| `trend_concept` | overlay on a real first-person clip — a weeks-over-weeks trend, labelled ‘product interface concept’ | Concept. The POC stores sets but has no trend or month view, so the label is mandatory (landing-page decision Q3). |
| `stack_pov_concept` | AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’ | Concept. The founder-led strategy keeps S4d AI-generated; the overlay is not shipped UI. |
| `frame_privacy` | motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves | Graphic. Shows the hybrid privacy architecture instead of asserting it. |
| `reveal` | campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot | Real. The only place the logo appears on the band: it was filmed, not generated. |
| `gitnfit_desk_lunge` | cutaway — `../gitnfit/gitnfit-vscode/exercises/desk-assisted-lunge.mp4` (1280×720, 14 s), Peter as the desk trainer | Real footage of Peter. 16:9 → crop to the standing figure for 9:16. |

Each joined beat plays only the **head** of each cut segment, so every recording must carry its money frame in its first ~2.5 s. Record the HUD from the moment the gate opens; start the levels recording on the exercise that is furthest along.

---

## 9. Claims allowlist — every spoken sentence resolves to one of these

Taken from the live site (`web/src/components/*.astro`, `https://ironpal.co`) and, for the app mechanics, from the model design and the POC code. The pipeline’s `validate_claims` fails a run whose line cannot be traced here.

1. **Site · Hero** — A headband watches your set and logs the exercise, your reps and the weight on the bar; you type nothing.
2. **Site · Problem** — Phone out, gloves off, thumb-typing 3×8 @ 80 kg between sets; the rhythm breaks, numbers get fudged, half never make it in.
3. **Site · How it works** — Wear it, lift, it’s logged. IronPal watches the set from your point of view; no buttons, no pauses.
4. **Site · Capabilities** — Auto exercise ID from motion + camera. Sensor-fusion reps. Free weights and machines, no per-machine calibration, no equipment instrumentation.
5. **Site · Privacy** — Reps and exercise are detected right on the band, offline. To read the weight, a single frame is sent, processed in seconds, and deleted immediately. Footage is not stored.
6. **Site · FAQ** — Reading arbitrary free weights from a first-person camera is the hard problem being built; no shipping product does it today; it is the core bet, not a finished, guaranteed feature. Reps and exercise recognition are further along. Free weights and machines is the goal, validated exercise by exercise.
7. **Site · Compare** — Wrist trackers estimate weight from body mass; bar sensors need manual entry; camera appliances read only their own plates. Automatic free-weight reading is an open gap across the market.
8. **Site · Founder** — Solo founder, not a brand. Started because he was sick of breaking every set to thumb numbers into an app. Building it on camera, in public. Back the person, watch the progress.
9. **Site · Pricing** — Pre-launch. Reserve early-bird access: up to ~50 % off the launch price, first 200 spots, a 48-hour head start. Reserving costs nothing today; it locks your place and your price.
10. **Site · Hardware** — Moisture-wicking fabric, an 8 mm flush camera, a single teal LED, no screen. First-person view.
11. **Site · URL** — ironpal.co
12. **App · model design v2 §0, §6** — On the first visit the user records and confirms the exercise after the set; on later visits the band recognises it without re-labelling, within one user’s own gym.
13. **App · `LabelingScreen.tsx`** — After a set the debrief proposes exercise, reps and weight; one tap saves (‘ALL CORRECT — SAVE’).
14. **App · `levels.ts`, `CampaignScreen.tsx`** — Sets accumulate per exercise into Recon, Provisional and Certified; the campaign screen shows per-exercise level progress.
15. **App · `LiveHudScreen.tsx`** — A live HUD shows the recognised exercise and the rep count during a set.
16. **App · `learner.relabel`, `StudioScreen`** — A wrong call is corrected in the studio; the corrected set is re-evaluated and kept as an example, so the band improves from the correction.
17. **App · model design v2 §5.3** — When confidence is low the band asks instead of guessing; a confident wrong call is the failure the KB scorer penalises.
18. **Founder · gitnfit** — Peter built and shipped git & fit, a VS Code extension with 20+ desk exercises, and appears in its exercise videos as the trainer.

**Not on the list, therefore not said:** “no cloud”, “nothing leaves your device”, “faces blurred”, any brand name in the Compare row, any dollar figure, any ship date, any duration Peter has worn the band beyond “this month” and “weeks”.

---

## 10. Pipeline handoff — what geggen needs to run these

1. **`products/ironpal.json`** — `website: https://ironpal.co`, `product_video` = the POC screen recording (HUD → debrief → levels, ≥ 20 s), `brand.accent_color` teal, `brand.presenter` **fixed to the founder** (see below), `holding: none`, `reframe: crop`, `language: en`.
2. **A refpack for Peter** built from `../geggen/products/handlr/reference/` — anchor `peter_01_tanktop_x4.png`, support `peter_face_colour_x4.png`, **no scene image** (the pack’s scene reference stays empty and the scene tokens above are the only setting).
3. **A fixed cast, not a rotating persona.** geggen invents a new on-brand person per promo by design (creative.py, Q4). IronPal’s cast is the founder every time, so the persona pool must be bypassed and the refpack character used for every run. This is the one engine change these scripts need; it is recorded as open in the ledger.
4. **Segments** in §8 cut and frame-verified at both ends before any render; `old_log_typing` is a new recording; `trend_concept` and `stack_pov_concept` are labelled overlays on real POV clips.
5. **Raise the engine limits** in `pipeline/promo/primitives.json`: `max_clips` 4 → 8, `max_beats` 6 → 9. Both are validated at concept time; a nine-beat variant is rejected today.
6. **One `promo_config.json` per script**, K1–K8 with the layouts and options above, `end_card.seconds: 2.5`. The `action` strings are used verbatim; the pipeline prepends the no-writing clause, appends framing, wardrobe, scene, the to-camera clause and the delivery instruction, and bakes the `vo`.
7. **Inspect every rendered clip** with the vision gate before assembly: burned-in text and vanished props are the two defects that made handlr clips unusable, and both are re-rolls at 10 credits, not edits.

---

## 11. Worth your eye before anything renders

- **Seven lines are jokes about Peter or his gym, not about the product**, and need his yes before they render: the receptionist and three years (F2 K8), ‘I’m bad at it’ (F1 K1), ‘eight companies’ (F5 K8), ‘nobody asked’ (F5 K1), the tripods and ceiling camera (F4 K2, K8), ‘some I’d have left out’ and ‘rounded up, generously’ (F6 K1, K2). Each is true or it is cut; a joke that is not true about him is the one kind the rubric forbids.
- **The site says “Zero taps, ever”; the app asks for one tap after the first sets.** No script says “zero taps”. F2 tells the truth as the story; the others say “typed nothing”, which holds because confirming is a tap. Softening the site copy is a marketing call, left open.
- **Peter’s clips are generated, not filmed.** That follows the brief (“we will use Google Flow”), and it reverses the founder-led strategy’s “shoot live” default for these six cuts. The reference photographs are low-resolution; the likeness will be checked on the first minted portrait before any clip is paid for.
- **The generated band carries no logo.** Logos float in generated video and text renders as scribble, so the branded product appears only in the composited live reveal. If a script must show the logo on Peter’s head, that clip has to be filmed, not generated.
- **There is no gym photograph of Peter**, so the gym is invented from the scene tokens. The first two clips will show whether Flow holds the same room; if not, the fix is a scene reference image, which means a live still of Peter in a gym.
- **The trend and month views do not exist in the POC.** F6 (K1) shows one as a labelled overlay; the fallback is the real levels screen.
- **2.04 words per second was measured on a generated voice for Eve.** Peter’s minted voice will set its own rate; a line that overruns 8 s is cut at its last clause, never sped up, and a slower voice pushes the whole script past 60 s.
- **Credits.** 80 per script, 480 for six; refusals cost nothing but time. Which account pays is not decided here. Render F1 alone first.
- **The 60 s window depends on speech-length shots.** If the assembler is ever set to pad each clip to its full 8 s, every script becomes 66.5 s. The budget assumes the documented behaviour: a shot ends when the line does.
