# IronPal — six founder video scripts (Google Flow, 8 × 8 s)

**Status:** Draft v3.0 · 2026-09-27 — stretched to a 60 s window: eight 8 s clips per script; design review complete (auto mode)  
**On camera:** Peter, 46, the founder — one Flow character minted from his reference photographs, speaking every clip  
**Format:** vertical 9:16, 1080×1920, 30 fps; **eight Flow clips of ≤ 8 s + a 2.5 s card**. Each shot runs the length of its spoken line, not the full slot, so a script of ≤ 117 words lands at ≈ 60 s; 66.5 s is the ceiling if every clip ran its full 8 s  
**Word budget:** ≤ 16 words per clip (8 s × 2.04 words/s, the rate measured across the four rendered beats of `handlr-eve-11`) and **≤ 117 words per script** (57.4 s of speech + the card = 59.9 s); every count and estimate below is computed, and both caps are asserted before this file is written  
**Reference:** the handlr Eve onboarding promo, `handlr-eve-11` → `-17` (geggen `docs/video_script_redesign_v1.md`, `pipeline/promo/`) — 8 s beats, the screen behind every line, one character speaking all of it, the close rhyming with the hook  

> **Decisions from the design review are in [`founder_video_scripts_grilled.md`](founder_video_scripts_grilled.md) (Q1–Q41) and are folded in below.** The review ran **without user interaction**: 25 decisions rest on evidence in the repo, the site or the geggen pipeline, 14 are assumptions tagged for veto, 2 are open (a site claim the scripts contradict, whether the branded prop is finished, and which Flow account pays the credits). The assumptions most worth a veto are at the top of the ledger.

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

What makes them six and not one: the hook. Each opens on a different true sentence about Peter, and the rest is the shortest path from that sentence to the card.

| Script | Opens on | The one thing it explains that the others don’t |
|---|---|---|
| F1 · The fourth exercise | “Every set I do at the gym has a fourth exercise. Typing it in.” | Every set has a hidden fourth exercise: typing it in. |
| F2 · I told it once | “My headband didn’t know what a curl was. I told it once. It hasn’t asked since.” | The app’s actual mechanism as the story: the band does not come knowing your exercises, you tell it once, and from then on it knows. |
| F3 · Nobody reads the bar | “Your watch guesses your weight from your body mass. Mine is trying to read the bar.” | Leads with the hard problem. |
| F4 · Yes, there’s a camera on my head | “Yes, there’s a camera on my head at the gym. Here’s exactly what it sends.” | Answers the objection first. |
| F5 · I put a trainer in my code editor | “I put a trainer inside a code editor. Then I got tired of typing between sets.” | Origin story and credibility: Peter already shipped a desk-exercise trainer inside VS Code, and is a hybrid athlete. |
| F6 · A month I never logged | “This is every set I did this month. I logged none of them.” | Opens on the result: a full month of sets, none of them typed. |

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

**≈ 58.9 s** at speech length (**115 words** at 2.04 w/s + 2.5 s card) · 66.5 s ceiling if every clip ran its full 8 s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  K6 0:40.0–0:48.0
K7 0:48.0–0:56.0  K8 0:56.0–1:04.0  CARD 1:04.0–1:06.5
```

### K1 · hook · 0:00.0–0:08.0 · 14 words ≈ 6.9 s

> **Peter:** “Every set I do at the gym has a fourth exercise. Typing it in.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor between sets, squared to camera, calm, a slight dry smile.
- **product footage composited:** none — Peter, full frame

**Why:** No product for the first clip, on purpose. Nobody has heard the name, so it buys nothing; the line buys the whole video. The band on his head reads as gym wear — nothing is printed on it.

### K2 · old way · 0:08.0–0:16.0 · 16 words ≈ 7.8 s

> **Peter:** “Gloves off. Phone out. Three by eight at eighty. Half of it never makes it in.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the flat bench, shoulders down, tired of a routine, and says it flatly.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** The before. The manual log fills the frame and gets typed into while he talks. No phone in his hand — a held prop is the most common way a clip gets rejected; the footage carries the thumb-typing.

### K3 · new way · 0:16.0–0:24.0 · 14 words ≈ 6.9 s

> **Peter:** “Now a headband watches the set from my eyes. Exercise and reps log themselves.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the dumbbell rack, alert, a little pleased with himself.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The after. The POC’s live HUD fills the frame during a real set. Only the two things the band does today are claimed.

### K4 · the hardware · 0:24.0–0:32.0 · 12 words ≈ 5.9 s

> **Peter:** “Eight millimetre camera, one small light, no screen. You forget it’s there.”

- **layout:** `product_full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, relaxed, saying it as if it hardly matters.
- **product footage composited:**
  - `reveal` — campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot

**Why:** Voice over the live reveal footage, Peter off-screen: the only place the branded band appears. The site’s ProductSpotlight, and the one clip where the product is the picture.

### K5 · first session · 0:32.0–0:40.0 · 14 words ≈ 6.9 s

> **Peter:** “The first time, it asks after the set: was that a curl? One tap.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining something simple, one small nod.
- **product footage composited:**
  - `debrief_confirm` — screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’

**Why:** The teach-once mechanism, shown on the real debrief screen. It is what makes ‘log themselves’ honest.

### K6 · the weight · 0:40.0–0:48.0 · 16 words ≈ 7.8 s

> **Peter:** “The weight is the hard part. Nobody reads it off a bar yet. That’s my bet.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, level and honest, no sell in it.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’

**Why:** J-cut to the stack POV under the same voice. The site’s FAQ in his mouth — the bet, not the feature; the overlay carries the concept label.

### K7 · progress · 0:48.0–0:56.0 · 14 words ≈ 6.9 s

> **Peter:** “Clean sets stack up. Each exercise earns its level, until the band is sure.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench between sets, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** The level machine is real and on screen: sets accumulate into Recon, Provisional, Certified.

### K8 · close · 0:56.0–1:04.0 · 15 words ≈ 7.4 s

> **Peter:** “I typed nothing, and the log is full. Reserve a spot. It costs nothing today.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** Full frame, rhyming with K1. ‘Typed nothing’ is literally true: the first sets are confirmed with a tap. No price is spoken.

### CARD · 1:04.0–1:06.5 · no VO

- Stop logging. Just lift.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 3. F2 — I told it once

**Angle.** The app’s actual mechanism as the story: the band does not come knowing your exercises, you tell it once, and from then on it knows. Honest about the first session.

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

**Why:** Leads with how the model learns, because that is the true answer to ‘how does it know?’: enrol on the first visit, recognise on the next.

### K2 · old way · 0:08.0–0:16.0 · 16 words ≈ 7.8 s

> **Peter:** “The old way, I told an app everything. Every set, every rep, thumbs between sets, forever.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, patient and a little weary, counting it off on nothing.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** ‘Forever’ is the contrast to ‘once’. The manual log fills the frame.

### K3 · first session · 0:16.0–0:24.0 · 16 words ≈ 7.8 s

> **Peter:** “First session, I lift, it watches, then asks one question: was that a curl? One tap.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining something simple, one small nod.
- **product footage composited:**
  - `debrief_confirm` — screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’

**Why:** The debrief screen is real: the POC asks after the set, not during, and one tap confirms.

### K4 · next session · 0:24.0–0:32.0 · 13 words ≈ 6.4 s

> **Peter:** “Next session it just knows. Same rack, same me, logged while I rest.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter leans on the rack between sets, relaxed, as if it is no longer his job.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The recognise-by-embedding promise, scoped to where it holds: one user, one gym.

### K5 · corrections · 0:32.0–0:40.0 · 15 words ≈ 7.4 s

> **Peter:** “If it gets one wrong, I fix it right there, and it learns from that.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, matter-of-fact, a small shrug at a mistake.
- **product footage composited:**
  - `studio_fix` — screen recording — POC `StudioScreen`: scrub to the set, correct the exercise, save

**Why:** The studio is real: a corrected set is re-evaluated and becomes an example. This is the ‘improve’ half of tracking — the band gets better because the user corrected it.

### K6 · what leaves · 0:40.0–0:48.0 · 15 words ≈ 7.4 s

> **Peter:** “Reps and exercise stay on the band, offline. The weight is one frame, then deleted.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, calm, laying it out plainly.
- **product footage composited:**
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves

**Why:** The hybrid privacy architecture in one sentence; J-cut to the frame graphic.

### K7 · progress · 0:48.0–0:56.0 · 14 words ≈ 6.9 s

> **Peter:** “A few clean sets and it’s certified. From then on my log fills itself.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** The level machine on screen. ‘Certified’ is the level’s real name.

### K8 · close · 0:56.0–1:04.0 · 12 words ≈ 5.9 s

> **Peter:** “Teach it once. Then just lift. Reserve early-bird. It costs nothing today.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** Full frame, the card’s first line said out loud before the card shows it.

### CARD · 1:04.0–1:06.5 · no VO

- Teach it once. Then just lift.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 4. F3 — Nobody reads the bar

**Angle.** Leads with the hard problem. The credible half (exercise and reps) carries the trust, the weight carries the why. Every hedge from the site’s FAQ is kept.

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

**Why:** The Compare section’s first row, without naming a brand. ‘Trying’ is the hedge and the hook at once.

### K2 · old way · 0:08.0–0:16.0 · 13 words ≈ 6.4 s

> **Peter:** “Old way, I’d finish a set and type eighty from memory. Sometimes seventy-five.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, remembering a number badly, a small shrug.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** The fudged number, edited on screen while he says it.

### K3 · the easy half · 0:16.0–0:24.0 · 15 words ≈ 7.4 s

> **Peter:** “The band already does the easy half. Exercise and reps, detected on the band, offline.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, matter-of-fact, this part is not in doubt.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The part that works, with the live HUD behind it. ‘Offline’ is the site’s exact wording.

### K4 · first person · 0:24.0–0:32.0 · 15 words ≈ 7.4 s

> **Peter:** “It sees what I see. No sensors on the bar, nothing bolted to the machine.”

- **layout:** `product_full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, plain, pointing at nothing.
- **product footage composited:**
  - `reveal` — campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot

**Why:** Voice over the live reveal: first-person view, no equipment instrumentation. The site’s Hardware and Capabilities sections.

### K5 · the bet · 0:32.0–0:40.0 · 14 words ≈ 6.9 s

> **Peter:** “The weight is one frame, sent, read, deleted in seconds. Not finished. In progress.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, level and honest, counting the three fragments off with small nods.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves

**Why:** The FAQ’s hedges as fragments; J-cut to the stack POV and the frame graphic.

### K6 · the field · 0:40.0–0:48.0 · 14 words ≈ 6.9 s

> **Peter:** “Bar sensors need you to type it. Camera machines read only their own plates.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unimpressed, listing what the others do.
- **product footage composited:** none — Peter, full frame

**Why:** The Compare table’s other two rows, no brand names. No screen: this is about the world, not the product.

### K7 · progress · 0:48.0–0:56.0 · 15 words ≈ 7.4 s

> **Peter:** “Exercise and reps earn their level set by set. The weight comes when it’s proven.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Levels are real; ‘when it’s proven’ keeps the weight conditional even here.

### K8 · close · 0:56.0–1:04.0 · 15 words ≈ 7.4 s

> **Peter:** “When it lands, the log I never typed shows the weight moving. Reserve a spot.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** Conditional on purpose. Full frame, rhyming with K1.

### CARD · 1:04.0–1:06.5 · no VO

- The hard problem. Being built.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 5. F4 — Yes, there’s a camera on my head

**Angle.** Answers the objection first. The privacy architecture, stated exactly as the site states it: two things stay on the band, one frame leaves and is deleted.

**≈ 59.4 s** at speech length (**116 words** at 2.04 w/s + 2.5 s card) · 66.5 s ceiling if every clip ran its full 8 s · Peter speaks every clip · music off · kinetic captions · ends on a card

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

**Why:** The band is the subject from the first frame, because the band is the objection. Plain black, nothing on it; the branded band appears only in the composited reveal.

### K2 · old way · 0:08.0–0:16.0 · 13 words ≈ 6.4 s

> **Peter:** “Before, the only thing recording my workout was my thumb. Between sets. Badly.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, deadpan, three short beats.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** Before, in one clip, so the privacy clips get the time.

### K3 · what stays · 0:16.0–0:24.0 · 15 words ≈ 7.4 s

> **Peter:** “Reps and the exercise are detected on the band itself, offline. That part never leaves.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, precise, one hand flat as if to say: this part, here.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** Scoped precisely: ‘that part’ never leaves. A blanket ‘nothing leaves’ would be false.

### K4 · what goes · 0:24.0–0:32.0 · 15 words ≈ 7.4 s

> **Peter:** “Reading the weight sends one frame. Processed in seconds, then deleted. I don’t store footage.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, calm, laying it out plainly.
- **product footage composited:**
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves

**Why:** The Privacy section in spirit. No face-blurring claim, because it is not built. J-cut to the frame graphic.

### K5 · the hardware · 0:32.0–0:40.0 · 13 words ≈ 6.4 s

> **Peter:** “No screen. One camera, one small light, and it points where I look.”

- **layout:** `product_full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, relaxed, saying it as if it hardly matters.
- **product footage composited:**
  - `reveal` — campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot

**Why:** Voice over the live reveal, the real band on screen: the site’s Hardware section, first-person view.

### K6 · the chore · 0:40.0–0:48.0 · 16 words ≈ 7.8 s

> **Peter:** “After a set it asks one question, and one tap answers it. That’s the whole chore.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining something simple, one small nod.
- **product footage composited:**
  - `debrief_confirm` — screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’

**Why:** The debrief is real. ‘The whole chore’ is the honest replacement for ‘zero taps’.

### K7 · progress · 0:48.0–0:56.0 · 15 words ≈ 7.4 s

> **Peter:** “So I train, the set is logged, and each exercise earns its level over time.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** The payoff of trusting the band: the log exists and the levels climb.

### K8 · close · 0:56.0–1:04.0 · 14 words ≈ 6.9 s

> **Peter:** “No vague promises. One founder, in the open. Reserve a spot. It costs nothing.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** ‘No vague promises’ is the Privacy section’s last line. Ending a privacy script on the founder’s face is the point.

### CARD · 1:04.0–1:06.5 · no VO

- A camera on your head. Handled honestly.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 6. F5 — I put a trainer in my code editor

**Angle.** Origin story and credibility: Peter already shipped a desk-exercise trainer inside VS Code, and is a hybrid athlete. The gitnfit clip is the only outside footage.

**≈ 59.9 s** at speech length (**117 words** at 2.04 w/s + 2.5 s card) · 66.5 s ceiling if every clip ran its full 8 s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  K6 0:40.0–0:48.0
K7 0:48.0–0:56.0  K8 0:56.0–1:04.0  CARD 1:04.0–1:06.5
```

### K1 · hook · 0:00.0–0:08.0 · 16 words ≈ 7.8 s

> **Peter:** “I put a trainer inside a code editor. Then I got tired of typing between sets.”

- **layout:** `cutaway` · options: head_seconds: 2.4
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, amused at himself.
- **product footage composited:**
  - `gitnfit_desk_lunge` — cutaway — `../gitnfit/gitnfit-vscode/exercises/desk-assisted-lunge.mp4` (1280×720, 14 s), Peter as the desk trainer

**Why:** J-cut: 2.4 s of Peter, then the real gitnfit footage of him as the desk trainer under his voice. Proof, not a claim.

### K2 · old way · 0:08.0–0:16.0 · 15 words ≈ 7.4 s

> **Peter:** “Every set: phone, gloves, thumbs, three by eight at eighty. The rhythm breaks every time.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, listing it off with a flat rhythm, the last word heavier.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** ‘The rhythm breaks’ is the site’s Problem copy. The manual log fills the frame.

### K3 · new way · 0:16.0–0:24.0 · 16 words ≈ 7.8 s

> **Peter:** “I built a headband that watches from my eyes. Exercise and reps, logged while I lift.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, quietly proud, a builder showing a thing that works.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The after, with the live HUD. The build verb matters in this script.

### K4 · how · 0:24.0–0:32.0 · 14 words ≈ 6.9 s

> **Peter:** “Motion and camera together. Free weights and machines, validated one exercise at a time.”

- **layout:** `product_full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining plainly, one small hand gesture for together.
- **product footage composited:**
  - `reveal` — campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot

**Why:** Capability grid, hedged with the FAQ’s own words; voice over the live reveal.

### K5 · first session · 0:32.0–0:40.0 · 13 words ≈ 6.4 s

> **Peter:** “It asks me once, after the first sets. Then it knows my exercises.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining something simple, one small nod.
- **product footage composited:**
  - `debrief_confirm` — screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’

**Why:** The teach-once mechanism on the real debrief screen.

### K6 · the weight · 0:40.0–0:48.0 · 15 words ≈ 7.4 s

> **Peter:** “The weight is the part I’m still building. Nobody reads it off a bar yet.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, honest, no sell in it.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’

**Why:** Weight hedged; J-cut to the stack POV with the concept label.

### K7 · progress · 0:48.0–0:56.0 · 14 words ≈ 6.9 s

> **Peter:** “The log fills itself, each exercise earns its level. I do the next set.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Improvement as attention: the numbers stop being his job. Levels are real.

### K8 · close · 0:56.0–1:04.0 · 14 words ≈ 6.9 s

> **Peter:** “I’m one founder, on camera, in public. Reserve a spot. It costs nothing today.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** Full frame: the site’s Founder section, back the person.

### CARD · 1:04.0–1:06.5 · no VO

- Built by the guy wearing it.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 7. F6 — A month I never logged

**Angle.** Opens on the result: a full month of sets, none of them typed. The improvement story leads; the old way is what would be missing.

**≈ 57.9 s** at speech length (**113 words** at 2.04 w/s + 2.5 s card) · 66.5 s ceiling if every clip ran its full 8 s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  K6 0:40.0–0:48.0
K7 0:48.0–0:56.0  K8 0:56.0–1:04.0  CARD 1:04.0–1:06.5
```

### K1 · hook · 0:00.0–0:08.0 · 13 words ≈ 6.4 s

> **Peter:** “This is every set I did this month. I logged none of them.”

- **layout:** `cutaway` · options: head_seconds: 1.2
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, quietly satisfied.
- **product footage composited:**
  - `trend_concept` — overlay on a real first-person clip — a weeks-over-weeks trend, labelled ‘product interface concept’

**Why:** 1.2 s of Peter, then the month view: a labelled concept over a real POV clip, because the POC has no month view.

### K2 · old way · 0:08.0–0:16.0 · 13 words ≈ 6.4 s

> **Peter:** “The old way, half of these wouldn’t exist. Skipped, fudged, forgotten between sets.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, shaking his head slightly at the memory.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** Before as absence: what the old log would not contain.

### K3 · new way · 0:16.0–0:24.0 · 15 words ≈ 7.4 s

> **Peter:** “A headband watched each set. Exercise and reps, detected on the band, while I rested.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, relaxed, as if describing the weather.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The after, with the live HUD. ‘While I rested’ places the recognition where the app does it.

### K4 · first week · 0:24.0–0:32.0 · 14 words ≈ 6.9 s

> **Peter:** “The first week it asked after each set. One tap. Then it stopped asking.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, explaining something simple, one small nod.
- **product footage composited:**
  - `debrief_confirm` — screen recording — POC `LabelingScreen` after the set, ending on ‘ALL CORRECT — SAVE’

**Why:** The teach-once mechanism on the real debrief. ‘First week’ is a span the founder confirms, like ‘this month’.

### K5 · the weight · 0:32.0–0:40.0 · 16 words ≈ 7.8 s

> **Peter:** “The weight it reads from one frame, sent and deleted. That part is still being built.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, honest, no sell in it.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves

**Why:** Weight hedged and the privacy fact in one sentence; J-cut to the stack POV and the frame graphic.

### K6 · when unsure · 0:40.0–0:48.0 · 14 words ≈ 6.9 s

> **Peter:** “When it’s unsure, it says so, and I fix it there. Honest beats confident.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, matter-of-fact, a small shrug at a mistake.
- **product footage composited:**
  - `studio_fix` — screen recording — POC `StudioScreen`: scrub to the set, correct the exercise, save

**Why:** The reject rule and the studio: a low-confidence set is asked about, not guessed. ‘Honest beats confident’ is the KB scorer’s own rule — a confident-wrong call fails.

### K7 · progress · 0:48.0–0:56.0 · 13 words ≈ 6.4 s

> **Peter:** “Every exercise earns its level, set by set. That’s what tracking actually means.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, unhurried, watching something add up.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Levels are real. The word ‘tracking’ from the brief, cashed out as the level machine.

### K8 · close · 0:56.0–1:04.0 · 15 words ≈ 7.4 s

> **Peter:** “So the numbers are real, and the trend is real. Reserve a spot. Costs nothing.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:** none — Peter, full frame

**Why:** ‘Real’ is earned by K5 and K6 having said what is and isn’t done. Full frame, rhyming with K1.

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

- **The site says “Zero taps, ever”; the app asks for one tap after the first sets.** No script says “zero taps”. F2 tells the truth as the story; the others say “typed nothing”, which holds because confirming is a tap. Softening the site copy is a marketing call, left open.
- **Peter’s clips are generated, not filmed.** That follows the brief (“we will use Google Flow”), and it reverses the founder-led strategy’s “shoot live” default for these six cuts. The reference photographs are low-resolution; the likeness will be checked on the first minted portrait before any clip is paid for.
- **The generated band carries no logo.** Logos float in generated video and text renders as scribble, so the branded product appears only in the composited live reveal. If a script must show the logo on Peter’s head, that clip has to be filmed, not generated.
- **There is no gym photograph of Peter**, so the gym is invented from the scene tokens. The first two clips will show whether Flow holds the same room; if not, the fix is a scene reference image, which means a live still of Peter in a gym.
- **The trend and month views do not exist in the POC.** F6 (K1) shows one as a labelled overlay; the fallback is the real levels screen.
- **2.04 words per second was measured on a generated voice for Eve.** Peter’s minted voice will set its own rate; a line that overruns 8 s is cut at its last clause, never sped up, and a slower voice pushes the whole script past 60 s.
- **Credits.** 80 per script, 480 for six; refusals cost nothing but time. Which account pays is not decided here. Render F1 alone first.
- **The 60 s window depends on speech-length shots.** If the assembler is ever set to pad each clip to its full 8 s, every script becomes 66.5 s. The budget assumes the documented behaviour: a shot ends when the line does.
