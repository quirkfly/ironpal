# IronPal — six founder video scripts (Google Flow, 5 × 8 s)

**Status:** Draft v2.0 · 2026-09-27 — restructured to five 8 s clips per script; design review complete (auto mode)  
**On camera:** Peter, 46, the founder — one Flow character minted from his reference photographs, speaking every clip  
**Format:** vertical 9:16, 1080×1920, 30 fps; **five Flow clips of ≤ 8 s + a 2.5 s card ≈ 42 s**  
**Word budget:** ≤ 16 words per clip (8 s × 2.04 words/s, the rate measured across the four rendered beats of `handlr-eve-11`); every count and estimate below is computed, and the 8 s cap is asserted before this file is written  
**Reference:** the handlr Eve onboarding promo, `handlr-eve-11` → `-17` (geggen `docs/video_script_redesign_v1.md`, `pipeline/promo/`) — five 8 s beats, the screen behind every line, one character speaking all of it, the last clip dropping to the character full frame  

> **Decisions from the design review are in [`founder_video_scripts_grilled.md`](founder_video_scripts_grilled.md) (Q1–Q36) and are folded in below.** The review ran **without user interaction**: 21 decisions rest on evidence in the repo, the site or the geggen pipeline, 13 are assumptions tagged for veto, 2 are open (a site claim the scripts contradict, and which Flow account pays the credits). The assumptions most worth a veto are at the top of the ledger.

---

## 0. The shape every script follows — and why it is this shape

The geggen pipeline renders one **8 s** Google Flow clip per speaking beat, with the line **baked in and lip-synced** to a minted character; the product is never in the generated clip but is **composited** from real recordings by layout. The handlr Eve promo, after fourteen renders, settled on five such clips plus a card, and that is the structure here:

| clip | job | layout | the character | what fills the frame |
|---|---|---|---|---|
| **K1** | hook — never names the product | `full` (or `cutaway` when the hook *is* a picture) | Peter, whole gym scene | nothing, or one cutaway |
| **K2** | **the old way** | `pip` | Peter, corner close-up | a generic manual log being thumb-typed |
| **K3** | **the new way** | `pip` | Peter, corner close-up | the POC’s live HUD during a real set |
| **K4** | the honest beat: weight, privacy, or how | `cutaway` | Peter for 1.8 s, then voice only | stack POV, the privacy frame graphic, or the live reveal |
| **K5** | progress, then the close | `pip` + `tail_full_seconds: 3.0` | corner, then **full frame for the last 3 s**, rhyming with K1 | the POC’s levels screen |
| card | CTA | `card` | — | three lines and the URL |

Rules carried over from the handlr runs, each one paid for:

- **≤ 16 words per line.** 8 s at 2.04 words/s is 16.3; the first handlr draft ran 22–28 words a line and could not have rendered. The last clause of each 16-word line is the droppable one.
- **The `action` is a short, declarative stage direction naming the character** — “Peter stands on the gym floor…”. A 3,587-character prompt was refused nine times as “prominent people”; “Eve is doing biceps curl.” rendered immediately. No quotation marks inside an action: a quoted fragment gets painted into the picture as a caption (“5ive steps”, “vetted.”).
- **Nothing held, nothing on screen, nothing written** in a generated clip. A held phone vanishes between frames; a screen renders as scribble; a word becomes a burned-in caption. The old way is therefore carried by the composited log footage, not by Peter holding a phone.
- **One wardrobe, stated in words, in every clip**: the character owns the outfit, so it cannot change between beats. Peter’s includes a **plain matte-black headband with nothing printed on it** — logos in generated video float off the object (the Kling lesson), so the branded band exists only in live footage that is composited in.
- **The setting is named in words in every prompt**, because there is no photograph of Peter in a gym to pin it to; a body variant with an unstated scene came back in a different invented gym per clip.
- **Every claim maps to the allowlist** (§8); the pipeline’s validator fails a run that says anything else, and there is no human review before publishing.
- **Credits:** 10 per clip, refusals free, minting free. **50 credits per script, 300 for all six.**

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

**42.5 s as slotted** (5 × 8 s + card) · **75 words**, speech ≈ 36.8 s at 2.04 w/s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  CARD 0:40.0–0:42.5
```

### K1 · hook · 0:00.0–0:08.0 · 14 words ≈ 6.9 s

> **Peter:** “Every set I do at the gym has a fourth exercise. Typing it in.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor between sets, squared to camera, calm, a slight dry smile.
- **product footage composited:** none — Peter, full frame

**Why:** No product for the first clip, on purpose. Nobody has heard the name, so it buys nothing; the line buys the whole video. The band on his head reads as gym wear, not a product — nothing is printed on it.

### K2 · old way · 0:08.0–0:16.0 · 16 words ≈ 7.8 s

> **Peter:** “Gloves off. Phone out. Three by eight at eighty. Half of it never makes it in.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the flat bench, shoulders down, tired of a routine, and says it flatly.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** The before. The manual log fills the frame and gets typed into while he talks; he is a corner PIP. No phone in his hand — a held prop is the most common way a clip gets rejected, and the footage carries the thumb-typing anyway. ‘Half of it never makes it in’ is the site’s Problem section.

### K3 · new way · 0:16.0–0:24.0 · 14 words ≈ 6.9 s

> **Peter:** “Now a headband watches the set from my eyes. Exercise and reps log themselves.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the dumbbell rack, alert, a little pleased with himself.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The after. The POC’s live HUD fills the frame during a real set. Only the two things the band does today are claimed.

### K4 · the weight · 0:24.0–0:32.0 · 16 words ≈ 7.8 s

> **Peter:** “The weight is the hard part. Nobody reads it off a bar yet. That’s my bet.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, level and honest, no sell in it.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’

**Why:** J-cut: he talks for 1.8 s, then the stack POV takes the frame under the same voice. The site’s FAQ in his mouth — weight-reading is the bet, not the feature; the overlay carries the concept label.

### K5 · progress + close · 0:32.0–0:40.0 · 15 words ≈ 7.4 s

> **Peter:** “I typed nothing, and the log is full. Reserve a spot. It costs nothing today.”

- **layout:** `pip` · options: pip_pos: lower-right, tail_full_seconds: 3.0
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Levels screen for the first ~4 s, then the product drops away and Peter fills the frame for the last 3 s, rhyming with K1. ‘Typed nothing’ is literally true: the first sets are confirmed with a tap. No price is spoken.

### CARD · 0:40.0–0:42.5 · no VO

- Stop logging. Just lift.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 3. F2 — I told it once

**Angle.** The app’s actual mechanism as the story: the band does not come knowing your exercises, you tell it once, and from then on it knows. Honest about the first session.

**42.5 s as slotted** (5 × 8 s + card) · **77 words**, speech ≈ 37.7 s at 2.04 w/s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  CARD 0:40.0–0:42.5
```

### K1 · hook · 0:00.0–0:08.0 · 16 words ≈ 7.8 s

> **Peter:** “My headband didn’t know what a curl was. I told it once. It hasn’t asked since.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, and says it like a plain fact about his week.
- **product footage composited:** none — Peter, full frame

**Why:** Leads with how the model learns, because that is the true answer to ‘how does it know?’. The claim is the self-training loop from the model design: enrol on the first visit, recognise on the next.

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

**Why:** The debrief screen is real: the POC asks after the set, not during, and one tap confirms. Showing it is what makes ‘once’ credible instead of magical.

### K4 · next session · 0:24.0–0:32.0 · 16 words ≈ 7.8 s

> **Peter:** “Next session it just knows. Same rack, same me, exercise and reps, logged while I rest.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter leans on the rack between sets, relaxed, as if it is no longer his job.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The recognise-by-embedding promise, scoped to the regime where it holds: one user, one gym. Only exercise and reps are claimed.

### K5 · progress + close · 0:32.0–0:40.0 · 13 words ≈ 6.4 s

> **Peter:** “A few clean sets and it’s certified. Reserve early-bird. It costs nothing today.”

- **layout:** `pip` · options: pip_pos: lower-right, tail_full_seconds: 3.0
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** The level machine is real and on screen; then he fills the frame for the close.

### CARD · 0:40.0–0:42.5 · no VO

- Teach it once. Then just lift.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 4. F3 — Nobody reads the bar

**Angle.** Leads with the hard problem. The credible half (exercise and reps) carries the trust, the weight carries the why. Every hedge from the site’s FAQ is kept.

**42.5 s as slotted** (5 × 8 s + card) · **75 words**, speech ≈ 36.8 s at 2.04 w/s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  CARD 0:40.0–0:42.5
```

### K1 · hook · 0:00.0–0:08.0 · 16 words ≈ 7.8 s

> **Peter:** “Your watch guesses your weight from your body mass. Mine is trying to read the bar.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, dry, glancing once at his own wrist.
- **product footage composited:** none — Peter, full frame

**Why:** The Compare section’s first row, without naming a brand. ‘Trying’ is the hedge and the hook at once.

### K2 · old way · 0:08.0–0:16.0 · 15 words ≈ 7.4 s

> **Peter:** “Old way, I’d finish a set and type eighty from memory. Sometimes it was seventy-five.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, remembering a number badly, a small shrug.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** The fudged number. The manual log fills the frame and the number gets edited while he says it.

### K3 · the easy half · 0:16.0–0:24.0 · 15 words ≈ 7.4 s

> **Peter:** “The band already does the easy half. Exercise and reps, detected on the band, offline.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, matter-of-fact, this part is not in doubt.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The part that works, with the live HUD behind it. ‘Offline’ is the site’s exact privacy wording for these two.

### K4 · the bet · 0:24.0–0:32.0 · 14 words ≈ 6.9 s

> **Peter:** “The weight is one frame, sent, read, deleted in seconds. Not finished. In progress.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, level and honest, counting the three fragments off with small nods.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves

**Why:** The FAQ’s hedges as fragments. J-cut to the stack POV and the frame graphic, each half of the cutaway; the POV carries the concept label.

### K5 · progress + close · 0:32.0–0:40.0 · 15 words ≈ 7.4 s

> **Peter:** “When it lands, the log I never typed shows the weight moving. Reserve a spot.”

- **layout:** `pip` · options: pip_pos: lower-right, tail_full_seconds: 3.0
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:**
  - `trend_concept` — overlay on a real first-person clip — a weeks-over-weeks trend, labelled ‘product interface concept’

**Why:** Conditional on purpose: ‘when it lands’. The trend overlay is a labelled concept; then Peter fills the frame.

### CARD · 0:40.0–0:42.5 · no VO

- The hard problem. Being built.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 5. F4 — Yes, there’s a camera on my head

**Angle.** Answers the objection first. The privacy architecture, stated exactly as the site states it: two things stay on the band, one frame leaves and is deleted.

**42.5 s as slotted** (5 × 8 s + card) · **72 words**, speech ≈ 35.3 s at 2.04 w/s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  CARD 0:40.0–0:42.5
```

### K1 · hook · 0:00.0–0:08.0 · 15 words ≈ 7.4 s

> **Peter:** “Yes, there’s a camera on my head at the gym. Here’s exactly what it sends.”

- **layout:** `full` · options: —
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, and touches the band on his forehead once.
- **product footage composited:** none — Peter, full frame

**Why:** The one script where the band is the subject from the first frame, because the band is the objection. It is plain black with nothing on it; the branded band appears in the composited reveal footage, never in a generated clip.

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

**Why:** Scoped precisely: ‘that part’ never leaves. A blanket ‘nothing leaves’ would be false and is banned by the claim guardrails.

### K4 · what goes · 0:24.0–0:32.0 · 15 words ≈ 7.4 s

> **Peter:** “Reading the weight sends one frame. Processed in seconds, then deleted. I don’t store footage.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, calm, laying it out plainly.
- **product footage composited:**
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves
  - `reveal` — campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot

**Why:** The Privacy section in spirit: single frame, seconds, deleted, no stored footage. No face-blurring claim, because it is not built. J-cut to the frame graphic, then the live reveal of the real band.

### K5 · progress + close · 0:32.0–0:40.0 · 14 words ≈ 6.9 s

> **Peter:** “No vague promises. One founder, in the open. Reserve a spot. It costs nothing.”

- **layout:** `pip` · options: pip_pos: lower-right, tail_full_seconds: 3.0
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** ‘No vague promises’ is the Privacy section’s last line. Ending a privacy script on the founder’s face is the point.

### CARD · 0:40.0–0:42.5 · no VO

- A camera on your head. Handled honestly.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 6. F5 — I put a trainer in my code editor

**Angle.** Origin story and credibility: Peter already shipped a desk-exercise trainer inside VS Code, and is a hybrid athlete. The gitnfit clip is the only outside footage.

**42.5 s as slotted** (5 × 8 s + card) · **78 words**, speech ≈ 38.2 s at 2.04 w/s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  CARD 0:40.0–0:42.5
```

### K1 · hook · 0:00.0–0:08.0 · 16 words ≈ 7.8 s

> **Peter:** “I put a trainer inside a code editor. Then I got tired of typing between sets.”

- **layout:** `cutaway` · options: head_seconds: 2.4
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, amused at himself.
- **product footage composited:**
  - `gitnfit_desk_lunge` — cutaway — `../gitnfit/gitnfit-vscode/exercises/desk-assisted-lunge.mp4` (1280×720, 14 s), Peter as the desk trainer

**Why:** J-cut: 2.4 s of Peter, then the real gitnfit footage of him as the desk trainer takes the frame under his voice. The first clip is proof, not a claim.

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

**Why:** The after, with the live HUD. The build verb matters in this script: he built the last thing too.

### K4 · how · 0:24.0–0:32.0 · 16 words ≈ 7.8 s

> **Peter:** “Motion and camera together. Free weights and machines, no setup, validated one exercise at a time.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, explaining plainly, one small hand gesture for together.
- **product footage composited:**
  - `reveal` — campaign footage — `web/dist/assets/reveal.mp4`, the branded headband, live-shot

**Why:** Capability grid, hedged with the FAQ’s own words. J-cut to the live reveal footage of the real band; weight is not claimed in this script.

### K5 · progress + close · 0:32.0–0:40.0 · 15 words ≈ 7.4 s

> **Peter:** “The log fills itself. I’m one founder, on camera. Reserve a spot. Costs nothing today.”

- **layout:** `pip` · options: pip_pos: lower-right, tail_full_seconds: 3.0
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** Levels real, then the founder fills the frame — the site’s Founder section: back the person.

### CARD · 0:40.0–0:42.5 · no VO

- Built by the guy wearing it.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 7. F6 — A month I never logged

**Angle.** Opens on the result: a full month of sets, none of them typed. The improvement story leads; the old way is what would be missing.

**42.5 s as slotted** (5 × 8 s + card) · **72 words**, speech ≈ 35.3 s at 2.04 w/s · Peter speaks every clip · music off · kinetic captions · ends on a card

```
K1 0:00.0–0:08.0  K2 0:08.0–0:16.0  K3 0:16.0–0:24.0
K4 0:24.0–0:32.0  K5 0:32.0–0:40.0  CARD 0:40.0–0:42.5
```

### K1 · hook · 0:00.0–0:08.0 · 13 words ≈ 6.4 s

> **Peter:** “This is every set I did this month. I logged none of them.”

- **layout:** `cutaway` · options: head_seconds: 1.2
- **action (the Flow prompt’s stage direction):** Peter stands on the gym floor, squared to camera, quietly satisfied.
- **product footage composited:**
  - `trend_concept` — overlay on a real first-person clip — a weeks-over-weeks trend, labelled ‘product interface concept’

**Why:** 1.2 s of Peter, then the month view takes the frame: the log is the hero. It is a labelled concept over a real POV clip, because the POC stores sets but has no month view.

### K2 · old way · 0:08.0–0:16.0 · 13 words ≈ 6.4 s

> **Peter:** “The old way, half of these wouldn’t exist. Skipped, fudged, forgotten between sets.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter sits on the bench, shaking his head slightly at the memory.
- **product footage composited:**
  - `old_log_typing` — screen recording — a generic manual workout log being filled in: exercise picked from a menu, 3×8, 80 typed

**Why:** Before as absence: what the old log would not contain. The manual log fills the frame with gaps in it.

### K3 · new way · 0:16.0–0:24.0 · 15 words ≈ 7.4 s

> **Peter:** “A headband watched each set. Exercise and reps, detected on the band, while I rested.”

- **layout:** `pip` · options: pip_pos: lower-right
- **action (the Flow prompt’s stage direction):** Peter stands at the rack, relaxed, as if describing the weather.
- **product footage composited:**
  - `hud_live_set` — screen recording — POC `LiveHudScreen` on the A52 during a real set: ● live · Exercise · Reps

**Why:** The after, with the live HUD. ‘While I rested’ places the recognition where the app does it: after the set, during rest.

### K4 · the weight · 0:24.0–0:32.0 · 16 words ≈ 7.8 s

> **Peter:** “The weight it reads from one frame, sent and deleted. That part is still being built.”

- **layout:** `cutaway` · options: head_seconds: 1.8
- **action (the Flow prompt’s stage direction):** Peter leans on the rack, honest, no sell in it.
- **product footage composited:**
  - `stack_pov_concept` — AI cutaway — first-person hand reaching to a weight-stack pin (storyboard S4d), weight overlay labelled ‘product interface concept’
  - `frame_privacy` — motion graphic — one still frame leaves the band, a seconds counter runs, the frame dissolves

**Why:** Weight hedged and the privacy fact in the same sentence. J-cut to the stack POV and the frame graphic.

### K5 · progress + close · 0:32.0–0:40.0 · 15 words ≈ 7.4 s

> **Peter:** “So the numbers are real, and the trend is real. Reserve a spot. Costs nothing.”

- **layout:** `pip` · options: pip_pos: lower-right, tail_full_seconds: 3.0
- **action (the Flow prompt’s stage direction):** Peter back on the gym floor, framed as in the first clip, lands the last line and holds the look.
- **product footage composited:**
  - `levels_progress` — screen recording — POC `CampaignScreen`, per-exercise level progress

**Why:** ‘Real’ is earned by K3 and K4 having said what is and isn’t done. Levels screen, then the founder fills the frame.

### CARD · 0:40.0–0:42.5 · no VO

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
16. **Founder · gitnfit** — Peter built and shipped git & fit, a VS Code extension with 20+ desk exercises, and appears in its exercise videos as the trainer.

**Not on the list, therefore not said:** “no cloud”, “nothing leaves your device”, “faces blurred”, any brand name in the Compare row, any dollar figure, any ship date, any duration Peter has worn the band beyond “this month” and “weeks”.

---

## 10. Pipeline handoff — what geggen needs to run these

1. **`products/ironpal.json`** — `website: https://ironpal.co`, `product_video` = the POC screen recording (HUD → debrief → levels, ≥ 20 s), `brand.accent_color` teal, `brand.presenter` **fixed to the founder** (see below), `holding: none`, `reframe: crop`, `language: en`.
2. **A refpack for Peter** built from `../geggen/products/handlr/reference/` — anchor `peter_01_tanktop_x4.png`, support `peter_face_colour_x4.png`, **no scene image** (the pack’s scene reference stays empty and the scene tokens above are the only setting).
3. **A fixed cast, not a rotating persona.** geggen invents a new on-brand person per promo by design (creative.py, Q4). IronPal’s cast is the founder every time, so the persona pool must be bypassed and the refpack character used for every run. This is the one engine change these scripts need; it is recorded as open in the ledger.
4. **Segments** in §8 cut and frame-verified at both ends before any render; `old_log_typing` is a new recording; `trend_concept` and `stack_pov_concept` are labelled overlays on real POV clips.
5. **One `promo_config.json` per script**, K1–K5 with the layouts and options above, `end_card.seconds: 2.5`. The `action` strings are used verbatim; the pipeline prepends the no-writing clause, appends framing, wardrobe, scene, the to-camera clause and the delivery instruction, and bakes the `vo`.
6. **Inspect every rendered clip** with the vision gate before assembly: burned-in text and vanished props are the two defects that made handlr clips unusable, and both are re-rolls at 10 credits, not edits.

---

## 11. Worth your eye before anything renders

- **The site says “Zero taps, ever”; the app asks for one tap after the first sets.** No script says “zero taps”. F2 tells the truth as the story; the others say “typed nothing”, which holds because confirming is a tap. Softening the site copy is a marketing call, left open.
- **Peter’s clips are generated, not filmed.** That follows the brief (“we will use Google Flow”), and it reverses the founder-led strategy’s “shoot live” default for these six cuts. The reference photographs are low-resolution; the likeness will be checked on the first minted portrait before any clip is paid for.
- **The generated band carries no logo.** Logos float in generated video and text renders as scribble, so the branded product appears only in the composited live reveal. If a script must show the logo on Peter’s head, that clip has to be filmed, not generated.
- **There is no gym photograph of Peter**, so the gym is invented from the scene tokens. The first two clips will show whether Flow holds the same room; if not, the fix is a scene reference image, which means a live still of Peter in a gym.
- **The trend and month views do not exist in the POC.** F3 (K5) and F6 (K1) show them as labelled overlays; the fallback in both is the real levels screen.
- **2.04 words per second was measured on a generated voice for Eve.** Peter’s minted voice will set its own rate; a line that overruns 8 s is cut at its last clause, never sped up.
- **Credits.** 50 per script, 300 for six; refusals cost nothing but time. Which account pays is not decided here.
