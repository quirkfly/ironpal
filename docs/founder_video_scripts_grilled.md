# Grilled — Founder video scripts (auto mode)

Decisions resolved on **2026-09-25** against [`founder_video_scripts.md`](founder_video_scripts.md),
**without user interaction**: each question was posed and answered by walking the decision tree, one
branch at a time, in order.

Provenance tags:

- **EVIDENCE** — answered from the site source, the POC code, the geggen pipeline, an existing plan
  or a memory note the founder confirmed earlier; the source is cited.
- **ASSUMED** — the answer that would have been recommended in an interactive session; one line of
  rationale and the strongest argument against, so it can be vetoed cheaply.
- **OPEN** — not mine to settle (a public claim, a fact I cannot verify). Recommendation stated; the
  scripts stay conditional on it.

**Tally: 24 questions — 13 EVIDENCE · 9 ASSUMED · 2 OPEN.**

**Worth a veto first:**

1. **Q15 — the site says “Zero taps, ever” and the app asks for one confirming tap after the first
   sets.** The scripts side with the app and never say “zero taps”. The site copy is the founder’s
   call; until it changes, the site and the videos disagree on one word.
2. **Q17 — “weeks in” and “this month” are claims about Peter’s own use of the band.** They are the
   only spoken facts nobody in the repo can verify. Cut them to “every set is there” if they are not
   true on the shoot day.
3. **Q1 — vertical 48-second cuts, not the Kickstarter hero.** These six are the social, founder-led
   format the handlr reference uses. If the ask was six hero films, the structure is wrong, not the
   lines.
4. **Q24 — which six angles.** The hooks are the product; swapping one is cheap now and expensive
   after a shoot day.
5. **Q3 — 2.04 words per second was measured on a generated voice.** Peter’s live delivery will set
   its own rate; every timecode is provisional until F1 is recorded.

---

## Branch A — Format

### Q1 — Vertical social cuts, or 16:9 Kickstarter hero films?

**ASSUMED — vertical 9:16, ≈ 48 s, one founder, six beats plus a card.** The reference the brief
points at (`/tmp/h`, the handlr script v2) is exactly that format, and the Kickstarter hero already
has its own plan (`video-production-execution-plan.md`, S1–S7, founder-led per
`founder-led-production-strategy.md`).
*Against:* “six video scripts” could mean six hero-length films. If so, each script here is the
spine of one and needs the S1–S7 shot grammar around it.

### Q2 — Five beats like handlr, or six?

**ASSUMED — six.** The brief adds two mandatory beats the handlr cut did not have: a before and an
after. Five beats would force the before and the after into one, and the after is where the site is
explained.
*Against:* every extra beat is eight seconds; the handlr cut’s 40.7 s was itself flagged as a fifth
of the video with nothing to sell.

### Q3 — What pace are the timecodes computed from?

**EVIDENCE — 2.04 words per second.** Measured on the English handlr cut and printed in its facts
line (“2,04 w/s measured”). Every timecode in the scripts is `words / 2.04`, generated, not typed.
The rate was measured on a generated voice; its application to Peter is the first thing the shoot
day tests (flag §9).

### Q4 — English or Slovak?

**EVIDENCE — English.** The site is English (`web/src/components/*.astro`), the campaign is
Kickstarter, and the handlr reference carries its Slovak timing as unmeasured. A Slovak cut is
deferred and needs its own measurement.

### Q5 — Music, captions, ending?

**ASSUMED — music off, kinetic captions carrying the exact VO, end on a card.** That is the handlr
V1 structure signature (`caps:kinetic | music:off | end:card`) and it keeps Peter’s delivery the
only sound.
*Against:* a bed under the gym ambience would hide take-to-take room tone differences.

## Branch B — Cast

### Q6 — Is the founder on camera, face visible, in every hero shot?

**EVIDENCE — yes.** The brief says “featuring me as the founder”; the founder-led production
strategy makes the founder the campaign actor across S1–S7; the memory note records that
anonymising framings were rejected as “cheap and crappy”. K1 and K6 of every script are Peter, full
frame.

### Q7 — Wardrobe?

**ASSUMED — a plain black tank top in every live shot.** It matches the founder reference stills
the geggen pipeline already uses for Peter (`../geggen/products/handlr/reference/peter_01_tanktop_x4.png`)
and the strategy’s “matte black or campaign-teal performance shirt”.
*Against:* black band on black top loses the product edge; the S3 shoot hit black-on-black and
switched to a green shirt. Test one frame with the band on before the day.

### Q8 — Does the product name appear in the first beat?

**ASSUMED — no.** The handlr K1 rule: nobody has heard the name, so it buys nothing in the first
second while the claim buys everything. Every hook here is a sentence about Peter, not about IronPal.
F4 is the one exception in picture, not in words: the band is on his head because the band is the
objection.
*Against:* brand recall on a 48 s social clip; the card and the captions carry it.

## Branch C — Before and after

### Q9 — What is the old-way app on screen?

**EVIDENCE — a generic manual log, composited, never Fitbod.** `video-production-execution-plan.md`
lines 68–76: no Fitbod logo, name or screenshots; a generic app with a burgundy accent on charcoal
and a deliberately different layout. The scripts’ K2 chip says exactly that.

### Q10 — Is the new-way screen a mock-up or a recording?

**EVIDENCE — a screen recording of the POC.** The POC has a live HUD (`LiveHudScreen.tsx`) that
shows the recognised exercise and the rep count, and the handlr reference’s rule is “lifted from the
recording itself, not a mock-up, not a redraw”. K3 of every script is the HUD in picture-in-picture
over the live set.

### Q11 — Are the debrief and the levels screens real?

**EVIDENCE — yes.** `LabelingScreen.tsx` renders the post-set debrief with ‘ALL CORRECT — SAVE’;
`CampaignScreen.tsx` loads and shows per-exercise `LevelProgress`. F2 K3 and the K5 beats that cite
levels are recordings.

### Q12 — Is there a trend or month view to record?

**EVIDENCE — no, so it is a labelled overlay.** A search of the POC screens finds no history, trend
or month view; the store keeps sets, the campaign screen shows levels. The landing-page decision Q3
already requires the label *product interface concept* on any overlay that is not shipped UI. F1,
F3, F4, F5 (K5) and F6 (K1) carry it; the fallback is the real levels screen.

## Branch D — Claims

### Q13 — How is weight-reading spoken?

**EVIDENCE — as the bet, never the feature.** The marketing-claim guardrails memory, landing-page
decision Q2 and the site’s own FAQ (“the hard problem we’re building … not a finished, guaranteed
feature”). Every script says “the hard part”, “my bet”, “still being built” or “when it lands”, and
no script claims a weight was read.

### Q14 — How is privacy spoken?

**EVIDENCE — the hybrid architecture, in the site’s words.** Landing-page decision Q8 and the
Privacy component: reps and exercise on the band, offline; one frame sent, processed in seconds,
deleted; no stored footage. F4 K3 scopes “never leaves” to “that part”. No face-blurring claim,
because none is built.

### Q15 — The site says “Zero taps, ever”; the app asks one question after the first sets. Which do the videos follow?

**OPEN.** The scripts follow the app: F2 tells the enrolment truthfully, the others say “typed
nothing”, which holds because confirming is a tap. Whether the site’s Stats band softens “0 taps per
set” to “nothing to type” is a public-copy decision. *Recommendation:* soften it; the Hero already
says “You type nothing”, which is the defensible line.

### Q16 — Does F3 name the wrist-tracker brands the Compare table names?

**ASSUMED — no.** The claim (“estimates from body mass”) is the site’s; the brand names are not
needed for the sentence to land and add a legal surface to a social clip.
*Against:* specificity sells; “your Garmin” is punchier than “your watch”.

### Q17 — May Peter state how long he has used the band or how many sets it holds?

**ASSUMED — only as unnumbered spans (“weeks in”, “this month”), nothing longer.** Nothing in the
repo records how long the founder has worn the band or how many sets the store holds, so no number
is spoken. The two spans are a shoot-day check: true, or cut to “every set is there”.
*Against:* even “this month” is a claim about a log that exists; if the POC store is empty on the
day, F6’s hook is fiction and must be re-hooked.

### Q18 — What is the call to action?

**EVIDENCE — reserve early-bird access; it costs nothing today; no dollar figure.** The site’s
Pricing and FinalCTA components and landing-page decisions Q6 and Q7 (discount and cap, no absolute
price). The card reads “first 200 · ~50 % off”; nobody says a price.

### Q19 — What URL goes on the card?

**EVIDENCE — `ironpal.co`.** `web/astro.config.mjs` sets `site: 'https://ironpal.co'`.

### Q20 — Where does “I told it once” come from, and is it true of the app?

**EVIDENCE — the model design and the POC.** `ironpal-neural-model-design-v2.md` §0 states the
end-user goal verbatim (record and label on the first visit, recognise on later visits without
re-labelling); the debrief in `LabelingScreen.tsx` is the one question after the set. F2 and F4 K5
are scoped to one user at one gym, which is the regime the design claims.

## Branch E — Assets

### Q21 — Is the branded headband prop ready to film?

**OPEN.** The scripts assume the physical band with the DTF-transferred mark from the prop-branding
plan (`post/assets/IronPal_band_face_preview_v01.png`, ordered per the task log) and the LED
composited in post as the founder-led strategy already plans. Whether the transfer arrived and
survives a set is a fact only the founder has. *Recommendation:* confirm before booking the gym
day; K3 of all six depends on it.

### Q22 — How is the weight-stack POV made?

**EVIDENCE — an AI cutaway, storyboard S4d.** The founder-led strategy lists it as one of the five
shots that cannot be self-filmed and keeps it AI-generated. It carries the concept label because
the overlay on it is not shipped UI.

### Q23 — Where do the gitnfit visuals go?

**ASSUMED — only F5 K1, cropped from 16:9 to the standing figure.** The exercise clips
(`../gitnfit/gitnfit-vscode/exercises/*.mp4`, 1280×720, ~14 s) are real footage of Peter as the
desk trainer, so they are proof for the hook, not decoration. In the other five scripts they would
break the gym setting the brief asks for.
*Against:* one more script could use them as the “I train anyway” credibility beat.

### Q24 — Which six angles?

**ASSUMED — fourth exercise · told it once · nobody reads the bar · camera on my head · trainer in
my editor · a month I never logged.** Each is a different true sentence about the founder that the
site backs, and together they cover the site’s sections: Problem, How it works, Compare and FAQ,
Privacy, Founder, Capabilities. No two open on the same section.
*Against:* none opens on the hardware (“8 mm flush camera, no screen”); a beauty-led seventh would
cover the ProductSpotlight section.
