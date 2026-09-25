# IronPal — six founder video scripts

**Status:** Draft v1.0 · 2026-09-25 — design review complete (auto mode)  
**On camera:** Peter, 46, the founder, in every hero shot, face visible  
**Format:** vertical 9:16, 1080×1920, 30 fps, six beats plus a 2.5 s card, ≈ 48 s each  
**Pace:** 2.04 words per second, the rate measured on the handlr English cut; every timecode below is computed from that, not guessed  
**Reference:** the handlr promo script v2 (`/tmp/h`, geggen `products/handlr/`) — beats with the screen behind every line, a claims allowlist, and flags before anything renders  

> **Decisions from the design review are in [`founder_video_scripts_grilled.md`](founder_video_scripts_grilled.md) (Q1–Q24) and are folded in below.** The review ran **without user interaction**: 13 decisions rest on evidence in the repo, the site or the geggen pipeline, 9 are assumptions tagged for veto, 2 are open (a site claim the scripts contradict, and whether the branded prop is finished). The assumptions most worth a veto are at the top of the ledger.

---

## 0. What every script has to do

Each of the six scripts, independently:

- **Explains what the site says**, in Peter’s voice: a headband that watches the set from your eyes and logs the exercise, the reps and the weight; reps and exercise on the band, offline; weight from a single frame that is deleted; pre-launch, reserve early-bird access, it costs nothing today. Every spoken claim maps to the allowlist in §8.
- **Is set in the gym, naturally.** Peter is on the floor, at a bench or a rack, between sets. No studio, no desk, no talking-head wall. One gym day covers all six.
- **Explains how the app helps track and improve**: the log fills itself, so it is complete; sets accumulate into levels; the trend becomes visible. Where the POC has the screen, the screen is recorded. Where it does not, the overlay is labelled *product interface concept*.
- **Has a before and an after.** K2 is always the old way, filmed live: gloves off, phone out, thumbs on a generic manual log. K3 is always the new way: headband on, same bench, the POC’s live HUD in picture-in-picture.
- **Keeps the claim guardrails.** Weight-reading is “the hard part”, “my bet”, “still being built”, never a shipped feature. Privacy is the hybrid architecture, never “nothing leaves the phone”. No face-blurring claim, because none is built.

What makes them six and not one: the hook. Each opens on a different true sentence, and the rest of the script is the shortest path from that sentence to the card.

| Script | Opens on | The one thing it explains that the others don’t |
|---|---|---|
| F1 · The fourth exercise | “Every set I do at the gym has a fourth exercise. Typing it in.” | Every set has a hidden fourth exercise: typing it in. |
| F2 · I told it once | “My headband didn’t know what a curl was. I told it once. It hasn’t asked since.” | The app’s actual mechanism as the story: the band does not come knowing your exercises, you tell it once, and from then on it knows. |
| F3 · Nobody reads the bar | “Your watch guesses your weight from your body mass. Mine is trying to read the bar.” | Leads with the hard problem. |
| F4 · Yes, there’s a camera on my head | “Yes, there’s a camera on my head at the gym. Here’s exactly what it sends.” | Answers the objection first. |
| F5 · I put a trainer in my code editor | “I put a personal trainer inside a code editor. Then I got tired of typing at the gym.” | Origin story and credibility: Peter already shipped a desk-exercise trainer inside VS Code, and is a hybrid athlete. |
| F6 · A month I never logged | “This is every set I did this month. I logged none of them.” | Opens on the result: a full month of sets, none of them typed. |

---

## 1. F1 — The fourth exercise

**Angle.** Every set has a hidden fourth exercise: typing it in. Peter names it, shows it, then shows the band doing it for him.

**48.6 s total** · **94 words** · 6 beats + card · Peter speaks every beat · music off · kinetic captions on · ends on a card

```
K1 0:00.0–0:06.9  K2 0:06.9–0:14.7  K3 0:14.7–0:22.5
K4 0:22.5–0:30.4  K5 0:30.4–0:38.7  K6 0:38.7–0:46.1  CARD 0:46.1–0:48.6
```

### K1 · hook · 0:00.0–0:06.9 · 14 words

> **Peter:** “Every set I do at the gym has a fourth exercise. Typing it in.”

**On screen:**
- live — Peter, full frame, gym floor, no product in shot

**Why:** No product for the first seven seconds, on purpose. Nobody has heard the name, so it buys nothing; the line buys the whole video. “Fourth exercise” is the frame every later beat pays off.

### K2 · old way · 0:06.9–0:14.7 · 16 words

> **Peter:** “Gloves off. Phone out. Three by eight at eighty. Half of it never makes it in.”

**On screen:**
- live + screen comp — Peter thumbing a generic manual log (burgundy on charcoal; never the Fitbod UI)

**Why:** The before clip. Filmed live: bench, phone, thumbs. The log UI is composited and deliberately generic — the video plan’s legal note forbids the Fitbod look. “Half of it never makes it in” is the site’s Problem section, said out loud.

### K3 · new way · 0:14.7–0:22.5 · 16 words

> **Peter:** “Now a headband watches the set from my eyes. The exercise and the reps log themselves.”

**On screen:**
- live — Peter, headband on (physical branded prop; LED composited in post)
- screen recording — POC LiveHudScreen (● live · Exercise · Reps)

**Why:** The after clip. Same bench, same lift, headband on, and the POC’s live HUD in picture-in-picture as the set runs. Only the two things the band does today are claimed here: exercise and reps.

### K4 · the weight · 0:22.5–0:30.4 · 16 words

> **Peter:** “The weight is the hard part. Nobody reads it off a bar yet. That’s my bet.”

**On screen:**
- AI cutaway — first-person weight-stack POV (storyboard S4d) with the weight overlay labelled 'product interface concept'

**Why:** The site’s FAQ, in Peter’s mouth. Weight-reading is the headline and is not shipped, so it is stated as the bet, not the feature. The overlay carries the ‘interface concept’ label.

### K5 · progress · 0:30.4–0:38.7 · 17 words

> **Peter:** “Weeks in, every set is there. I typed nothing, so now I can actually see the trend.”

**On screen:**
- overlay on a real POV clip — a weeks-over-weeks trend, labelled 'product interface concept' (the POC has no trend view)

**Why:** What the log is for. The trend overlay is labelled a concept because the POC has levels but no history view. “Typed nothing” is literally true: the first sets are confirmed with a tap, not typed.

### K6 · close · 0:38.7–0:46.1 · 15 words

> **Peter:** “I’m one guy building it in the open. Reserve a spot. It costs nothing today.”

**On screen:**
- live — Peter, full frame, gym floor, no product in shot

**Why:** Back to the K1 frame. The site’s Founder section and its Pricing section compressed to two sentences; no price figure is spoken, matching the landing-page decision.

### CARD · 0:46.1–0:48.6 · no VO

- Stop logging. Just lift.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 2. F2 — I told it once

**Angle.** The app’s actual mechanism as the story: the band does not come knowing your exercises, you tell it once, and from then on it knows. Honest about the first session.

**51.0 s total** · **99 words** · 6 beats + card · Peter speaks every beat · music off · kinetic captions on · ends on a card

```
K1 0:00.0–0:07.8  K2 0:07.8–0:15.7  K3 0:15.7–0:24.0
K4 0:24.0–0:31.9  K5 0:31.9–0:40.7  K6 0:40.7–0:48.5  CARD 0:48.5–0:51.0
```

### K1 · hook · 0:00.0–0:07.8 · 16 words

> **Peter:** “My headband didn’t know what a curl was. I told it once. It hasn’t asked since.”

**On screen:**
- live — Peter, full frame, gym floor, no product in shot

**Why:** The only script that leads with how the model learns, because that is the true answer to “how does it know?”. The claim is the self-training loop from the model design: enrol on the first visit, recognise on the next.

### K2 · old way · 0:07.8–0:15.7 · 16 words

> **Peter:** “The old way, I told an app everything. Every set, every rep, thumbs between sets, forever.”

**On screen:**
- live + screen comp — Peter thumbing a generic manual log (burgundy on charcoal; never the Fitbod UI)

**Why:** Before: “forever” is the contrast to “once”. Live thumbing over the generic log comp.

### K3 · first session · 0:15.7–0:24.0 · 17 words

> **Peter:** “First session, I lift, it watches, and asks one question after the set: was that a curl?”

**On screen:**
- live — Peter, headband on (physical branded prop; LED composited in post)
- screen recording — POC LabelingScreen debrief → 'ALL CORRECT — SAVE'

**Why:** The debrief screen is real: the POC asks after the set, not during it, and one tap confirms. Showing this is what makes the “once” credible instead of magical.

### K4 · next session · 0:24.0–0:31.9 · 16 words

> **Peter:** “Next session it just knows. Same rack, same me, exercise and reps, logged while I rest.”

**On screen:**
- screen recording — POC LiveHudScreen (● live · Exercise · Reps)

**Why:** The recognise-by-embedding promise, scoped to the regime where it holds: one user, one gym. Only exercise and reps are claimed.

### K5 · progress · 0:31.9–0:40.7 · 18 words

> **Peter:** “A few clean sets and it’s certified. From then on my log fills in, and the trend shows.”

**On screen:**
- screen recording — POC CampaignScreen, per-exercise level progress

**Why:** The level machine is real and on screen: sets accumulate into Recon, Provisional, Certified. “The trend shows” is the only concept claim in this script and rides on the levels screen, not a mock-up.

### K6 · close · 0:40.7–0:48.5 · 16 words

> **Peter:** “A camera on the band, one founder in the open. Reserve early-bird. It costs nothing today.”

**On screen:**
- live — Peter, full frame, gym floor, no product in shot

**Why:** Names the camera before the card so the privacy question is not dodged; F4 answers it in full.

### CARD · 0:48.5–0:51.0 · no VO

- Teach it once. Then just lift.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 3. F3 — Nobody reads the bar

**Angle.** Leads with the hard problem. The credible half (exercise and reps) carries the trust, the weight carries the why. Every hedge from the site’s FAQ is kept.

**48.6 s total** · **94 words** · 6 beats + card · Peter speaks every beat · music off · kinetic captions on · ends on a card

```
K1 0:00.0–0:07.8  K2 0:07.8–0:15.7  K3 0:15.7–0:23.0
K4 0:23.0–0:30.9  K5 0:30.9–0:38.2  K6 0:38.2–0:46.1  CARD 0:46.1–0:48.6
```

### K1 · hook · 0:00.0–0:07.8 · 16 words

> **Peter:** “Your watch guesses your weight from your body mass. Mine is trying to read the bar.”

**On screen:**
- live — Peter, full frame, gym floor, no product in shot

**Why:** The Compare section’s first row, without naming a brand. “Trying” is the hedge and the hook at once.

### K2 · old way · 0:07.8–0:15.7 · 16 words

> **Peter:** “Old way: I’d finish a set and type eighty kilos from memory. Sometimes it was seventy-five.”

**On screen:**
- live + screen comp — Peter thumbing a generic manual log (burgundy on charcoal; never the Fitbod UI)

**Why:** Before: the fudged number. Live, bench, phone, generic log comp with the number being edited.

### K3 · the easy half · 0:15.7–0:23.0 · 15 words

> **Peter:** “The band already does the easy half. Exercise and reps, detected on the band, offline.”

**On screen:**
- live — Peter, headband on (physical branded prop; LED composited in post)
- screen recording — POC LiveHudScreen (● live · Exercise · Reps)

**Why:** After: the part that works, with the live HUD behind it. “Offline” is the site’s exact privacy wording for these two.

### K4 · the bet · 0:23.0–0:30.9 · 16 words

> **Peter:** “The weight is one frame, sent, read, deleted in seconds. Not finished. Not guaranteed. In progress.”

**On screen:**
- AI cutaway — first-person weight-stack POV (storyboard S4d) with the weight overlay labelled 'product interface concept'
- graphic — one frame leaving the band, a timer, then the frame dissolving (privacy beat)

**Why:** Three fragments are the FAQ’s three hedges. The frame graphic shows the single upload and its deletion; the stack POV carries the concept label.

### K5 · progress · 0:30.9–0:38.2 · 15 words

> **Peter:** “When it lands, the log I never typed shows the weight moving, week after week.”

**On screen:**
- overlay on a real POV clip — a weeks-over-weeks trend, labelled 'product interface concept' (the POC has no trend view)

**Why:** Conditional on purpose: “when it lands”. The trend overlay is a labelled concept.

### K6 · close · 0:38.2–0:46.1 · 16 words

> **Peter:** “I’m building it on camera. Reserve early-bird access, pay nothing today, and watch me get there.”

**On screen:**
- live — Peter, full frame, gym floor, no product in shot

**Why:** “Watch me get there” is the build-in-public promise from the Founder section, and it is the honest CTA for a feature that is a bet.

### CARD · 0:46.1–0:48.6 · no VO

- The hard problem. Being built.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 4. F4 — Yes, there’s a camera on my head

**Angle.** Answers the objection first. The privacy architecture, stated exactly as the site states it: two things stay on the band, one frame leaves and is deleted.

**46.1 s total** · **89 words** · 6 beats + card · Peter speaks every beat · music off · kinetic captions on · ends on a card

```
K1 0:00.0–0:07.4  K2 0:07.4–0:13.7  K3 0:13.7–0:21.1
K4 0:21.1–0:28.4  K5 0:28.4–0:36.3  K6 0:36.3–0:43.6  CARD 0:43.6–0:46.1
```

### K1 · hook · 0:00.0–0:07.4 · 15 words

> **Peter:** “Yes, there’s a camera on my head at the gym. Here’s exactly what it sends.”

**On screen:**
- live — Peter, headband on (physical branded prop; LED composited in post)

**Why:** The one script where the product is in shot from the first frame, because the product is the objection. “Exactly” is the promise the rest keeps.

### K2 · old way · 0:07.4–0:13.7 · 13 words

> **Peter:** “Before, the only thing recording my workout was my thumb. Between sets. Badly.”

**On screen:**
- live + screen comp — Peter thumbing a generic manual log (burgundy on charcoal; never the Fitbod UI)

**Why:** Before, in one beat, so the privacy beats get the time.

### K3 · what stays · 0:13.7–0:21.1 · 15 words

> **Peter:** “Reps and the exercise are detected on the band itself, offline. That part never leaves.”

**On screen:**
- screen recording — POC LiveHudScreen (● live · Exercise · Reps)

**Why:** Scoped precisely: “that part” never leaves. A blanket “nothing leaves” would be false and is banned by the claim guardrails.

### K4 · what goes · 0:21.1–0:28.4 · 15 words

> **Peter:** “Reading the weight sends one frame. Processed in seconds, then deleted. I don’t store footage.”

**On screen:**
- graphic — one frame leaving the band, a timer, then the frame dissolving (privacy beat)

**Why:** The Privacy section verbatim in spirit: single frame, seconds, deleted, no stored footage. No face-blurring claim, because it is not built.

### K5 · progress · 0:28.4–0:36.3 · 16 words

> **Peter:** “So I train, the set is logged, and I can see what changed since last month.”

**On screen:**
- screen recording — POC CampaignScreen, per-exercise level progress
- overlay on a real POV clip — a weeks-over-weeks trend, labelled 'product interface concept' (the POC has no trend view)

**Why:** The payoff of trusting the band: the log exists. Levels screen is real; the month-over-month is a labelled concept.

### K6 · close · 0:36.3–0:43.6 · 15 words

> **Peter:** “No vague promises. One founder, building this in the open. Reserve a spot. Costs nothing.”

**On screen:**
- live — Peter, full frame, gym floor, no product in shot

**Why:** “No vague promises” is the Privacy section’s last line. Ending a privacy script on the founder’s face is the point.

### CARD · 0:43.6–0:46.1 · no VO

- A camera on your head. Handled honestly.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 5. F5 — I put a trainer in my code editor

**Angle.** Origin story and credibility: Peter already shipped a desk-exercise trainer inside VS Code, and is a hybrid athlete. Uses the gitnfit exercise clips as the only outside visuals.

**50.5 s total** · **98 words** · 6 beats + card · Peter speaks every beat · music off · kinetic captions on · ends on a card

```
K1 0:00.0–0:08.8  K2 0:08.8–0:16.2  K3 0:16.2–0:24.5
K4 0:24.5–0:32.4  K5 0:32.4–0:41.2  K6 0:41.2–0:48.0  CARD 0:48.0–0:50.5
```

### K1 · hook · 0:00.0–0:08.8 · 18 words

> **Peter:** “I put a personal trainer inside a code editor. Then I got tired of typing at the gym.”

**On screen:**
- cutaway — ../gitnfit/gitnfit-vscode/exercises/desk-assisted-lunge.mp4 (1280×720, 14 s; Peter as the desk trainer) + output/screenshots/03-routine-video-playing.png

**Why:** The gitnfit clip is real footage of Peter as the trainer, so the first beat is proof, not a claim. It is 16:9; crop to the standing figure for 9:16.

### K2 · old way · 0:08.8–0:16.2 · 15 words

> **Peter:** “Every set: phone, gloves, thumbs, three by eight at eighty. The rhythm breaks every time.”

**On screen:**
- live + screen comp — Peter thumbing a generic manual log (burgundy on charcoal; never the Fitbod UI)

**Why:** Before. “The rhythm breaks” is the site’s Problem copy.

### K3 · new way · 0:16.2–0:24.5 · 17 words

> **Peter:** “So I built a headband that watches from my eyes. Exercise and reps, logged while I lift.”

**On screen:**
- live — Peter, headband on (physical branded prop; LED composited in post)
- screen recording — POC LiveHudScreen (● live · Exercise · Reps)

**Why:** After, with the live HUD. The build verb matters in this script: he built the last thing too.

### K4 · how · 0:24.5–0:32.4 · 16 words

> **Peter:** “Motion and camera together. Free weights and machines, no setup, validated one exercise at a time.”

**On screen:**
- AI cutaway — first-person weight-stack POV (storyboard S4d) with the weight overlay labelled 'product interface concept'

**Why:** Capability grid, hedged with the FAQ’s own words: “validating exercise by exercise”. The stack POV carries the concept label; weight is not claimed in this script.

### K5 · progress · 0:32.4–0:41.2 · 18 words

> **Peter:** “The log fills itself. So the only thing I think about is the next set, and the trend.”

**On screen:**
- screen recording — POC CampaignScreen, per-exercise level progress
- overlay on a real POV clip — a weeks-over-weeks trend, labelled 'product interface concept' (the POC has no trend view)

**Why:** Improvement as attention: the numbers stop being his job. Levels real, trend labelled.

### K6 · close · 0:41.2–0:48.0 · 14 words

> **Peter:** “I’m one founder, on camera, in public. Reserve early-bird access. It costs nothing today.”

**On screen:**
- live — Peter, full frame, gym floor, no product in shot

**Why:** Same close as the site’s Founder section: back the person.

### CARD · 0:48.0–0:50.5 · no VO

- Built by the guy wearing it.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 6. F6 — A month I never logged

**Angle.** Opens on the result: a full month of sets, none of them typed. The improvement story leads; the old way is what would be missing.

**44.2 s total** · **85 words** · 6 beats + card · Peter speaks every beat · music off · kinetic captions on · ends on a card

```
K1 0:00.0–0:06.4  K2 0:06.4–0:12.7  K3 0:12.7–0:20.1
K4 0:20.1–0:27.9  K5 0:27.9–0:35.3  K6 0:35.3–0:41.7  CARD 0:41.7–0:44.2
```

### K1 · hook · 0:00.0–0:06.4 · 13 words

> **Peter:** “This is every set I did this month. I logged none of them.”

**On screen:**
- overlay on a real POV clip — a weeks-over-weeks trend, labelled 'product interface concept' (the POC has no trend view)

**Why:** Opens on the screen, not the face: the log is the hero. The month view is a labelled concept over a real POV clip, because the POC stores sets but has no month view.

### K2 · old way · 0:06.4–0:12.7 · 13 words

> **Peter:** “The old way, half of these wouldn’t exist. Skipped, fudged, forgotten between sets.”

**On screen:**
- live + screen comp — Peter thumbing a generic manual log (burgundy on charcoal; never the Fitbod UI)

**Why:** Before as absence: what the old log would not contain.

### K3 · new way · 0:12.7–0:20.1 · 15 words

> **Peter:** “A headband watched each set. Exercise and reps, detected on the band, while I rested.”

**On screen:**
- live — Peter, headband on (physical branded prop; LED composited in post)
- screen recording — POC LiveHudScreen (● live · Exercise · Reps)

**Why:** After, with the live HUD. “While I rested” places the recognition where the app does it: after the set, during rest.

### K4 · the weight · 0:20.1–0:27.9 · 16 words

> **Peter:** “The weight it reads from one frame, sent and deleted. That part is still being built.”

**On screen:**
- AI cutaway — first-person weight-stack POV (storyboard S4d) with the weight overlay labelled 'product interface concept'
- graphic — one frame leaving the band, a timer, then the frame dissolving (privacy beat)

**Why:** Weight is hedged and the privacy fact rides along in the same sentence.

### K5 · progress · 0:27.9–0:35.3 · 15 words

> **Peter:** “So the numbers are real, and the trend is real. That’s what I train against.”

**On screen:**
- screen recording — POC CampaignScreen, per-exercise level progress

**Why:** “Real” is earned by K3 and K4 having said what is and isn’t done. Levels screen is the real progress artefact.

### K6 · close · 0:35.3–0:41.7 · 13 words

> **Peter:** “One founder. In the open. Reserve your early-bird spot. It costs nothing today.”

**On screen:**
- live — Peter, full frame, gym floor, no product in shot

**Why:** Shortest close of the six; the month view already made the argument.

### CARD · 0:41.7–0:44.2 · no VO

- Every set. None of them typed.
- ironpal.co
- Early-bird · first 200 · ~50 % off

---

## 7. Shot inventory — one gym day plus the POC on the A52

| Shot | Used by | How it is made |
|---|---|---|
| live — Peter, full frame, gym floor, no product in shot | K1/K6 of F1, F2, F3, F5, F6; K6 of F4 | A52 on a tripod, eye level, Peter square to camera, one take per script. Same framing for K1 and K6 so the close rhymes with the hook. |
| live + screen comp — Peter thumbing a generic manual log (burgundy on charcoal; never the Fitbod UI) | K2 of all six | Film Peter’s hand and phone live at the bench; composite the generic log UI in post. Burgundy accent on charcoal, distinct type, different layout, per the video plan’s legal note. Never a Fitbod screenshot, never the Fitbod name. |
| live — Peter, headband on (physical branded prop; LED composited in post) | K3 of all six; K1 of F4 | Peter lifting with the physical branded headband. The teal LED is composited in post, as the founder-led strategy already plans for S4a–S4c. |
| screen recording — POC LiveHudScreen (● live · Exercise · Reps) | K3 of F1, F3, F5, F6; K4 of F2; K3 of F4 | Screen-record the POC on the A52 during a real set. Exercise and reps are what it shows; that is all these beats claim. |
| screen recording — POC LabelingScreen debrief → 'ALL CORRECT — SAVE' | K3 of F2 | Real recording of the debrief that follows a set, ending on the save button. |
| screen recording — POC CampaignScreen, per-exercise level progress | K5 of F2, F4, F5, F6 | Real recording of the campaign screen’s per-exercise level progress. |
| overlay on a real POV clip — a weeks-over-weeks trend, labelled 'product interface concept' (the POC has no trend view) | K5 of F1, F3, F4, F5; K1 of F6 | An overlay on a real first-person clip. The POC stores sets but has no trend or month view, so the label is mandatory, exactly as the landing page’s overlay demo is labelled. |
| AI cutaway — first-person weight-stack POV (storyboard S4d) with the weight overlay labelled 'product interface concept' | K4 of F1, F3, F5, F6; K4 of F4 via the frame graphic | AI cutaway, first-person hand reaching to a stack pin (storyboard S4d). Weight overlay labelled *product interface concept*. |
| graphic — one frame leaving the band, a timer, then the frame dissolving (privacy beat) | K4 of F3, F4, F6 | A motion graphic: one still frame leaves the band, a seconds counter, the frame dissolves. Shows the privacy architecture instead of asserting it. |
| cutaway — ../gitnfit/gitnfit-vscode/exercises/desk-assisted-lunge.mp4 (1280×720, 14 s; Peter as the desk trainer) + output/screenshots/03-routine-video-playing.png | K1 of F5 | Existing 1280×720 footage of Peter as the desk trainer. Crop to the standing figure for 9:16; the routine-panel screenshot can sit as a brief inset. |

**Continuity.** Plain black tank top in every live shot, matching the founder reference stills the geggen pipeline already uses (`../geggen/products/handlr/reference/peter_01_tanktop_x4.png`). One gym, one lighting setup, one day. Captions are kinetic and carry the exact VO text; music stays off so the delivery is the only sound, as in the handlr cut.

---

## 8. Claims allowlist — every spoken sentence resolves to one of these

Taken from the live site (`web/src/components/*.astro`, `https://ironpal.co`) and, for the app mechanics, from the model design and the POC code. A line that cannot be traced here does not go in a script.

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

**Not on the list, therefore not said:** “no cloud”, “nothing leaves your device”, “faces blurred”, any brand name in the Compare row, any dollar figure, any ship date, any duration Peter has worn the band.

---

## 9. Worth your eye before anything renders

- **The site says “Zero taps, ever”; the app asks for one tap after the first sets.** The scripts never say “zero taps”. F2 tells the truth as the story (“I told it once”), and the others say “typed nothing”, which is literally true because confirming is a tap. Whether the site’s copy softens to “nothing to type” is a marketing call recorded as open in the ledger.
- **The trend and month views do not exist in the POC.** F1, F3, F4, F5 (K5) and F6 (K1) show them as labelled overlays. If the label reads as weak on screen, the fallback in every case is the real levels screen.
- **2.04 words per second was measured on a generated voice, not on Peter.** Record F1 first, measure, and rescale every timecode before locking any edit. Slovak versions, if wanted, need their own measurement; Slovak runs longer.
- **The physical headband prop must be the branded one.** The scripts assume the DTF-transferred band from the prop-branding plan is finished. If it is not, K3 of every script is blocked, not workable-around: the logo is the product.
- **F5 crops 16:9 footage into 9:16.** The desk-lunge clip is wide; a centre crop on the standing figure loses the laptop. Check one frame before committing to it as the hook.
- **Everything is one gym day.** Six scripts share the same K2 and K3 setups, so the shot list is short, but every live line is a separate take. Budget the day for takes, not setups.
