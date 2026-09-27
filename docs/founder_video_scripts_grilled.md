# Grilled — Founder video scripts (auto mode)

Decisions resolved on **2026-09-25**, revised **2026-09-27** three times — for the Flow structure (five clips, then eight for the 60 s window), then rewritten to the comedy rubric, then one script selected and rebuilt around the headband — against [`founder_video_scripts.md`](founder_video_scripts.md),
**without user interaction**: each question was posed and answered by walking the decision tree, one
branch at a time, in order.

Provenance tags:

- **EVIDENCE** — answered from the site source, the POC code, the geggen pipeline, an existing plan
  or a memory note the founder confirmed earlier; the source is cited.
- **ASSUMED** — the answer that would have been recommended in an interactive session; one line of
  rationale and the strongest argument against, so it can be vetoed cheaply.
- **OPEN** — not mine to settle (a public claim, a fact I cannot verify). Recommendation stated; the
  scripts stay conditional on it.

**Tally: 54 questions — 31 EVIDENCE · 19 ASSUMED · 4 OPEN.**

**Worth a veto first:**

1. **Q49 — F4 is the one that gets made.** Picked because the band is its subject and the joke is
   the privacy objection; F1 is the more universal joke, F6 the sharper punchline. One line to
   change if you disagree, before any credit is spent.
2. **Q50 / Q51 — the band on Peter in generated clips carries the ring icon only, from a wardrobe
   clause plus `headband-hero.jpg` as a Flow ingredient.** Untested: Flow may hold it, smear it or
   drop it. K1 alone (10 credits) settles it.
3. **Q54 — the reveal clip’s band is unbranded.** Re-shooting it with the branded prop is the
   physical-prop plan, and the brief said no time and no budget; the branded still cut straight
   after it is the compromise.
4. **Q45 — the joke lines that are facts about Peter** (three tripods, a ceiling camera) render
   only with his yes.
5. **Q15 — the site says “Zero taps, ever”** and the script says one question, one tap.

---

## Branch A — Format

### Q1 — Vertical social cuts, or 16:9 Kickstarter hero films?

**EVIDENCE — vertical 9:16 social cuts, rendered in Google Flow.** *Revised 2026-09-27.* The
first draft assumed this from the handlr reference; the revision-2 brief states it outright
(“we will use google flow for producing video”). The Kickstarter hero keeps its own plan
(`video-production-execution-plan.md`, S1–S7).

### Q2 — How many clips, and how long?

**EVIDENCE — eight clips of ≤ 8 s plus a 2.5 s card.** *Revised 2026-09-27, twice.* The first
revision’s brief said “5 clips each lasting 8s”; the second says “stretched to 60s … roughly three
more 8s clips per script”. Five plus three is eight. Flow caps one generation at 8 s
(`flow_client.py`, `abra_r2v_8s`). How eight 8 s slots fit a 60 s window is Q38.

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

**ASSUMED — K1 `full` (or `cutaway` when the hook is a picture), K2 and K3 `pip`, K4–K6 a mix of
`product_full`, `pip` and `cutaway` by what each beat shows, K7 `pip` over the levels screen, K8
`full`, then `card`.** *Revised for eight clips.* It keeps the Eve promo’s grammar — the screen
behind every claim, one J-cut per honest beat — and with a dedicated progress clip the close no
longer needs `tail_full_seconds`; K8 is Peter full frame for its whole length, rhyming with K1.
*Against:* `product_full` puts the voice over the reveal with no face for 8 s; if that reads as a
narrated ad rather than a person talking, swap those beats to `cutaway` with a 1.8 s head.

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

**OPEN.** 8 clips × 10 credits = **80 per script, 480 for all six**; refusals are free; minting is
free. The redesign doc records no account holding 50 on 2026-09-24. Whether to wait for resets, top
up, or spread the six across accounts is a money decision. *Recommendation:* render F1 alone
first — it settles the likeness, the room and Peter’s speaking rate before 400 more credits go in.

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

---

## Branch G — Revision 3: the 60 s window (2026-09-27)

### Q37 — How many more clips, and what are they for?

**EVIDENCE for the count, ASSUMED for the content — three more, spent on the hardware, the first
session and the correction loop.** The brief says three. The five-clip cut had no room for the
site’s Hardware section, for showing the teach-once debrief in every script, or for the studio
where a wrong call is corrected — and the correction loop is the ‘improve’ half of “track and
improve” that the original brief asked for. Each script takes the three that fit its angle; F3
spends one on the rest of the Compare table instead of the studio.
*Against:* three more talking clips is three more chances for Flow to drift the face or the room;
a 40 s cut was safer to render. The brief chose 60 s.

### Q38 — Eight 8 s slots are 64 s. How is that a 60 s window?

**EVIDENCE — shots run at speech length, and the script is capped at 117 words.** `assemble.py`’s
invariant: “a shot’s LENGTH is driven by the speaking clip’s detected speech window … product
footage loops to fill, rather than the voice being trimmed”. The Eve cut proves it: 78 words in
five 8 s slots rendered as 38.2 s of speech, not 40. At 2.04 w/s, 117 words is 57.4 s; with the
2.5 s card, 59.9 s. The generator asserts ≤ 117 words per script. Every script here is 113–117
words.
*Against (the risk, not a counter-argument):* a slower minted voice than Eve’s breaks the window,
and so would padding clips to their full slot. Both are flagged in the document.

### Q39 — Does K8 still drop from the product to Peter, as K5 did?

**ASSUMED — no; K8 is Peter full frame for its whole length.** With K7 carrying the levels screen,
the close no longer has to share a clip with progress, so `tail_full_seconds` is not needed. The
rhyme with K1 is stronger with a full 8 s of the same framing.
*Against:* the Eve pattern’s drop-to-full was a deliberate visual punctuation; K8 loses it. It is a
one-option change per script if the drop is missed.

### Q40 — Do the engine limits allow eight clips?

**EVIDENCE — not today.** `pipeline/promo/primitives.json` sets `max_clips: 4` and `max_beats: 6`,
validated at concept time (“a variant that needs more is rejected at validation”). The Eve config
already exceeds `max_clips` with its K5, so the limit is a number, not a design constraint. The
handoff lists raising both (8 and 9) as a geggen config change, alongside the fixed-cast change
from Q33.

### Q41 — Are the new lines within the claims allowlist?

**EVIDENCE — yes, with two additions to the app section.** The hardware lines resolve to the
site’s Hardware section (8 mm flush camera, single teal LED, no screen, first-person view). The
correction-loop lines (“I fix it right there, and it learns from that”; “when it’s unsure, it says
so”) resolve to `learner.relabel` in the POC, which re-evaluates a corrected set and keeps it as an
example, and to the reject rule in `ironpal-neural-model-design-v2.md` §5.3, where a low-confidence
set is asked about rather than guessed. Both are added to the allowlist in §9 of the document.

---

## Branch H — Revision 4: genuinely funny (2026-09-27)

### Q42 — Which comedy register?

**EVIDENCE — geggen’s `comedic` register: lead with the joke.** `creative.py` `_COMEDY["comedic"]`:
“This is a comedy piece that happens to sell something. If it isn’t funny it has failed. Build ONE
joke across the whole promo … escalating beat to beat, landing on the last line.” The brief says
“genuinely funny”; the `dry` register (“exhale through the nose, not laugh”) is the floor, not the
target.

### Q43 — One joke per script, or a joke per line?

**EVIDENCE — one joke per script.** The rubric in both `_COMEDY` and `jokes.py`: “a joke is a
PREMISE plus a PAYOFF across two beats, not a line”; “Do not write four unrelated quips.” Each
script now states its premise in K1, escalates it through the middle clips and pays it on K8,
which also carries the CTA. The document’s §0.1 table lists premise and punchline per script.

### Q44 — Who is the target?

**EVIDENCE — the situation and Peter himself; never the viewer, a group or a named competitor.**
`jokes.py` `RUBRIC["safety"]` is a hard floor (`GATE_MIN`). The receptionist, the tripods, the
mirrors and the ceiling camera are the gym; the elbow, the squat, the rounded-up reps and the
eight companies are Peter. The Compare lines keep no brand names (Q16 stands).

### Q45 — Lines that are jokes about Peter rather than claims about the product: who approves them?

**OPEN — the founder, before render.** In geggen a joke’s wording is frozen in the brief and
approved by a human at GATE 1; an unapproved joke “widens NOTHING and must pass the plain allowlist
like any other line” (`jokes.py` `approved()`). Seven lines here are facts about Peter or his gym
that the allowlist cannot cover — the receptionist and three years (F2 K8), “I’m bad at it”
(F1 K1), “eight companies” (F5 K8), “nobody asked” (F5 K1), the tripods and ceiling camera (F4 K2,
K8), “some I’d have left out” and “rounded up, generously” (F6 K1, K2). *Recommendation:* approve
the ones that are true of him and strike the rest; a joke that is not true is the one kind the
rubric forbids.

### Q46 — Which premise per script?

**ASSUMED — the six in the §0.1 table.** Each is the angle the script already had, turned into a
claim about Peter that the product answers: logging as a fourth exercise he is bad at; the one
thing at the gym that listened the first time; the worst guesser in a gym full of guessers; the only
camera that deletes; the man who builds a tool for every problem; the complete log that flatters
him less. No two share a premise (`jokes.py` `dedupe`: same premise is one joke used twice).
*Against:* the premises are all self-deprecating. A sixth built on the world alone (the tripod
guy, the gym’s own cameras) would vary the register.

### Q47 — Does every line carry a joke?

**ASSUMED — no; the honesty beats stay straight.** The rubric says each line should do both, but
the weight hedge and the privacy spine are the two places where a joke reads as mocking the hedge
— which is exactly what the claim guardrails exist to prevent. F4 K3, F2 K7, F3 K7 and F5 K7 are
straight so the punchline has room and the hedges stay unmistakable.
*Against:* a straight line is “a wasted line” by the rubric’s own words. Four of forty-eight is
the price of the guardrails.

### Q48 — Do the jokes claim anything the allowlist does not support?

**EVIDENCE — no.** Every product statement inside a joke line resolves to §9: the band counts reps
(F6 K8 uses reps, never a weight, for exactly this reason); one frame is deleted (F4 K8); no screen
(F1 K4, F4 K5); levels are named Recon and Provisional (F4 K7, F6 K7). Where a line is only a
joke, it asserts nothing about the product and is a `claim_refs: []` line under Q45.

---

## Branch I — Revision 5: one script, the headband in every clip (2026-09-27)

### Q49 — Which of the six is the most impactful and funny?

**ASSUMED — F4, “Yes, there’s a camera on my head”.** Its hook is the objection every viewer
already has, so it earns attention with the product in frame one; its joke is about the world
(everyone at the gym is already filming) and the punchline restates the site’s privacy fact; it
says the one claim the campaign cannot get wrong in Peter’s deadpan; and the band motivates a
gesture in every wide shot, so it can be on screen in all eight clips without forcing it. The
follow-up brief — the band must be prominent — is what F4 is built around.
*Against:* F1’s “fourth exercise” is the more universal recognition joke and F6’s “made peace with
six” the sharper punchline. Either is one render away.

### Q50 — What does the band Peter wears in the generated clips carry?

**EVIDENCE — the teal ring icon, the stripe, the lens and the LED; never the wordmark.** The
pipeline’s first instruction bans letters in a generated frame (`cast.py build_prompt`), the Kling
runs showed text on a moving band renders as scribble, and `s3-physical-prop-branding-plan.md` §1
already ranks the icon as the guaranteed deliverable and the wordmark as secondary. The wardrobe
clause is the printed-headband spec from `body-mounted-image-prompts-updated.md` §587/§620 minus
the wordmark; the full lockup is carried by the composited stills (`band_in_hand`,
`headband-hero`, `worn_male`).

### Q51 — Words alone, or a picture of the band as a Flow reference?

**ASSUMED — both: the wardrobe clause in every prompt and `headband-hero.jpg` uploaded as a Flow
ingredient named “IronPal headband”, referred to by name.** Flow’s reference-to-video path holds
image references on an entity (`cast.py` `imageReferences`, a list) and the UI takes more than
one ingredient per prompt; geggen mints one character per cast slot and attaches no object, so this
is a manual step in Flow or a small engine change.
*Against:* an object ingredient may pull the render toward the studio still’s lighting. If K1 shows
that, drop the ingredient and keep the words.

### Q52 — Which repo assets are real, and which are AI?

**EVIDENCE.** `reveal.mp4` is the only footage of the physical band (live-shot, Runway Aleph
background); every branded image — `headband-hero`, `worn-headband-male`, `hero-bench`,
`worn-headband`, `wide-athlete`, S3 `selected.jpg` — is an AI still already published on the
landing page (`web/src/components/Hero|Gallery|ProductSpotlight|VideoReveal.astro`). Using them in
the video introduces no claim the site does not already make.

### Q53 — Two stills show a man who is not Peter. May a founder video use them?

**ASSUMED — yes, only under “you”, never under “I”.** They are the site’s own gallery images and
the founder-led strategy already reserves other athletes for social-proof cutaways (S6). K6 is the
one place they appear, under “You lift with it on”.
*Against:* a second man in a video whose whole premise is “my head” can read as a cheat; `worn_neck`
or the reveal are the swaps.

### Q54 — The reveal clip’s band is unbranded. Re-shoot it with the branded prop?

**OPEN.** Frame-checked at six points across its 4 s: a plain black loop, no ring, no LED. The
branded physical re-shoot is planned in `s3-physical-prop-branding-plan.md` and costs a half-day
and the prop; the brief said neither time nor budget. *Recommendation:* keep the clip — it is the
only real, moving band in the repo — and let `band_in_hand` land the logo in the same beat, as K3
does. Re-shoot only if the render shows the cut from unbranded to branded reads as two products.
