# Grilled — Founder video scripts (auto mode)

Decisions resolved on **2026-09-25**, revised **2026-09-27** for the five-clip Flow structure, against [`founder_video_scripts.md`](founder_video_scripts.md),
**without user interaction**: each question was posed and answered by walking the decision tree, one
branch at a time, in order.

Provenance tags:

- **EVIDENCE** — answered from the site source, the POC code, the geggen pipeline, an existing plan
  or a memory note the founder confirmed earlier; the source is cited.
- **ASSUMED** — the answer that would have been recommended in an interactive session; one line of
  rationale and the strongest argument against, so it can be vetoed cheaply.
- **OPEN** — not mine to settle (a public claim, a fact I cannot verify). Recommendation stated; the
  scripts stay conditional on it.

**Tally: 36 questions — 21 EVIDENCE · 13 ASSUMED · 2 OPEN.**

**Worth a veto first:**

1. **Q15 — the site says “Zero taps, ever” and the app asks for one confirming tap after the first
   sets.** The scripts side with the app and never say “zero taps”. The site copy is the founder’s
   call; until it changes, the site and the videos disagree on one word.
2. **Q27 — the band Peter wears in every generated clip carries no logo.** Logos float in generated
   video and text renders as scribble, so the product’s mark appears only in the composited live
   reveal. If the mark must be on his head in a talking clip, that clip has to be filmed.
3. **Q32 — the gym is invented from words.** There is no photograph of Peter in a gym, so nothing
   pins the room across five clips except the scene tokens. The first render will show whether
   Flow holds it; the fix is one live still.
4. **Q33 — geggen rotates personas by design; these need a fixed cast.** A small engine change, or
   six hand-run refpack jobs. Either is a decision.
5. **Q34 — 300 credits, and no account held 50 on the last count.** Render F1 alone first; it
   settles likeness, room and speaking rate before the rest is paid for.

---

## Branch A — Format

### Q1 — Vertical social cuts, or 16:9 Kickstarter hero films?

**EVIDENCE — vertical 9:16 social cuts, rendered in Google Flow.** *Revised 2026-09-27.* The
first draft assumed this from the handlr reference; the revision-2 brief states it outright
(“we will use google flow for producing video”). The Kickstarter hero keeps its own plan
(`video-production-execution-plan.md`, S1–S7).

### Q2 — How many clips, and how long?

**EVIDENCE — five clips of 8 s plus a 2.5 s card.** *Revised 2026-09-27.* The brief says
“5 clips each lasting 8s”; Flow caps one generation at 8 s (`flow_client.py`,
`abra_r2v_8s`), and the handlr redesign settled on 5 × 8 s + card after fourteen renders
(`docs/video_script_redesign_v1.md` §3–§4). The first draft’s six beats are folded into five:
the old progress beat and the close share K5, which drops to Peter full frame for its last 3 s.

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
anonymising framings were rejected as “cheap and crappy”. K1 of every script is Peter full frame,
and K5 drops back to him full frame for its last 3 s.

### Q7 — Wardrobe?

**ASSUMED — a plain black tank top, stated in every clip prompt.** It matches the identity anchor
the character is minted from (`../geggen/products/handlr/reference/peter_01_tanktop_x4.png`), and
the character owns the outfit, so it cannot drift between clips. *Revised 2026-09-27:* the headband
is part of the wardrobe too — see Q27.
*Against:* black band on black top loses the product edge; the S3 shoot hit black-on-black and
switched to a green shirt. Judge it on the first minted body variant, which is free.

### Q8 — Does the product name appear in the first beat?

**ASSUMED — no.** The handlr K1 rule: nobody has heard the name, so it buys nothing in the first
second while the claim buys everything. Every hook here is a sentence about Peter, not about IronPal.
F4 is the one exception in picture, not in words: the band is on his head because the band is the
objection.
*Against:* brand recall on a 42 s social clip; the card and the captions carry it.

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

**ASSUMED — only as unnumbered spans (“this month”), nothing longer.** Nothing in the repo
records how long the founder has worn the band or how many sets the store holds, so no number is
spoken. F6’s hook is the one line that carries a span; it is confirmed by the founder before F6 is
rendered, or re-hooked.
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

### Q21 — Is a branded headband prop needed to render these?

**EVIDENCE — no.** *Revised 2026-09-27.* Peter’s clips are generated, and the band he wears in them
is plain by design (Q27). The branded band is shown only through composited live footage, and that
footage already exists: `web/dist/assets/reveal.mp4`, the campaign reveal on the site. No new prop
and no gym day are on the critical path of any script.

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

---

## Branch F — Revision 2: five Google Flow clips per script (2026-09-27)

### Q25 — Where does the 16-word line budget come from?

**EVIDENCE — measured.** The four rendered beats of `handlr-eve-11` average 2.04 words/s
(`docs/video_script_redesign_v1.md` §3: 47 words / 23.05 s); 8 s × 2.04 = 16.3. The generator
asserts ≤ 16 words per line before the document is written, and every count printed is computed.

### Q26 — Are Peter’s clips generated in Flow, or filmed?

**EVIDENCE — generated, from one minted character.** The brief names Google Flow; the geggen
cast stage mints one character per cast slot from reference photographs and bakes the lip-synced
line into each clip (`pipeline/promo/cast.py`, `refpack.py`). This reverses the founder-led
strategy’s “shoot live” default for these six social cuts only; the Kickstarter hero is unchanged.

### Q27 — What does Peter wear, and is the headband in the generated clips branded?

**ASSUMED — a plain black tank top and a plain matte-black headband with nothing printed on it,
in every clip; the branded band appears only in composited live footage.** Wardrobe belongs to the
character and is stated in every prompt, so it cannot vary between beats (`flow_client.body_prompt`,
the Eve outfit-drift lesson). The memory note on Kling records that logos baked into generated
frames float off the object under motion, and the cast stage bans text in frame because it renders
as scribble.
*Against:* a script that needs the logo on his head cannot be generated; it must be filmed.

### Q28 — Which layout per clip?

**ASSUMED — K1 `full` (or `cutaway` when the hook is a picture), K2 and K3 `pip`, K4 `cutaway`
with 1.8 s head, K5 `pip` with `tail_full_seconds: 3.0`, then `card`.** It mirrors the settled
Eve structure: the screen behind every claim, one J-cut for the honest beat, and the last clip
dropping to the character full frame to rhyme with the hook (`assemble.py` `tail_full_seconds`,
built and verified 2026-09-24).
*Against:* `product_full` for K4 would give the footage the whole 8 s; the 1.8 s of face was kept
so the honest beat is visibly said by a person.

### Q29 — How is the `action` written?

**EVIDENCE — short, declarative, naming the character, no quotation marks, no props, no screens,
no text.** geggen commit `137473c`: a 3,587-character prompt was refused nine times as
“prominent people” while “Eve is doing biceps curl.” rendered immediately; `cast.py build_prompt`
strips quotes because a quoted fragment inside an action was painted into the picture in every
render of that clip. The generator asserts no quotes in any action.

### Q30 — Does Peter hold a phone in the old-way clip?

**ASSUMED — no; `holding: none` for the whole promo.** A held prop is the most common way a clip
is rejected (it appears in the first frame and vanishes by the second, `cast.py`), and `holding`
is set per promo, not per clip. The thumb-typing is carried by the composited log footage instead.
*Against:* geggen supports `holding: phone` for phone products; a phone in Peter’s hand would make
K2 read faster. It would also put a phone in K1, K3, K4 and K5.

### Q31 — Where does the product footage come from?

**EVIDENCE — real POC recordings for the HUD, the debrief and the levels; a new recording of a
generic manual log for the old way; labelled overlays for the trend and the stack.** The pipeline
cuts footage from recordings and “never fabricates UI” (`footage.py`); a segment may carry its own
`source` (commit `8b9c786`); the landing-page decision Q3 requires the concept label on any overlay
that is not shipped UI; the video plan’s legal note forbids the Fitbod look for the old-way app.

### Q32 — What pins the gym, given there is no photograph of Peter in one?

**ASSUMED — the scene tokens, stated in words in every clip prompt, and no scene reference
image.** `flow_client.body_prompt` records that a body variant with the setting merely pointed at
came back in a different invented gym per clip, and that naming the scene in words fixed it. The
tokens here are a single phrase used verbatim in every prompt.
*Against:* Flow may still drift the room across five clips. The fix would be a scene reference
image, which means one live still of Peter in a gym.

### Q33 — geggen rotates personas by design; the cast here is fixed. Does the pipeline support that?

**ASSUMED — not yet; the refpack character must be used for every run, bypassing the persona
pool.** `creative.py` documents PERSONA variation (Q4) as deliberate; the Eve refpack path shows a
real person can be the cast. Making that the *only* cast is a small engine change and is listed in
the handoff as the one thing these scripts need from geggen.
*Against:* running the six scripts by hand through the Eve-style refpack path needs no engine
change at all, only discipline.

### Q34 — Which Flow account pays, and when?

**OPEN.** 5 clips × 10 credits = 50 per script, 300 for all six; refusals are free; minting is
free. The redesign doc records no account holding 50 on 2026-09-24. Whether to wait for resets,
top up, or spread the six across accounts is a money decision. *Recommendation:* render F1 alone
first — it settles the likeness, the room and Peter’s speaking rate before 250 more credits go in.

### Q35 — What is the speaking-rate risk now that the voice is generated?

**ASSUMED — a line that overruns 8 s loses its last clause; nothing is sped up.** The 2.04 w/s was
measured on Eve’s minted voice; Peter’s will differ. Each line is written so its final clause is
the droppable one.
*Against:* a slower voice could cost the CTA clause in K5, which is the one line that must land
whole. If F1’s K5 overruns, K5 is rewritten shorter, not trimmed.

### Q36 — Are the vision gate and the burned-in-text check part of the plan?

**EVIDENCE — yes, before assembly.** `vision_qa.py` samples frames from each clip and re-rolls a
bad one for 10 credits rather than shipping it; the redesign doc §6.7 records burned-in gibberish
captions as intermittent with no identified cause. Every rendered clip is inspected before the
assembler sees it.
