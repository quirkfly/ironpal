# IronPal — SASK 2026 pitch deck, design plan

**Written 2026-09-30, the submission deadline.** This is the plan for the one attachment the Startup
Awards Slovakia form calls *Pitch deck — shareable link only*: a PDF of at most 15 slides and 30 MB,
in English, shared as a Google Drive link set to "anyone with the link", filename
`IronPal_PitchDeck_2026.pdf`. The form recommends the YC seed-deck template. Grilled in auto mode the
same day; the decision ledger is [`ironpal_pitch_deck_plan_grilled.md`](ironpal_pitch_deck_plan_grilled.md).

Companion: [`SASK_2026_SUBMISSION.md`](SASK_2026_SUBMISSION.md) (what the form asks, category
**Lifestyle**), and the film recommended for the other attachment slot,
`K1_K9_master_eq_music.mp4` (72.2 s, English, rebuilt today with the new K5).

---

## 1. What this deck has to do

A judging panel, reading on a laptop, probably without the founder in the room, in a few minutes.
The form's own headings are the rubric: **problem, solution, market, traction, team, fundraising.**
The deck must answer each of those on one slide a reader can take in from across a room, and it must
be honest to the letter, because the film, the landing page and this deck will be read side by side
and any claim that drifts between them is a credibility hole.

Two constraints shape everything:

- **Truth boundary.** Every product claim comes from the campaign's approved list
  (`founder_video_promo_config.json` → `claims_allowlist`) and the marketing guardrails: weight
  reading is *the hard problem being built*, never a shipped feature; privacy is the hybrid framing
  (reps and exercise on the band, one frame to the cloud for the weight, deleted); form analysis is
  an interface concept, labelled as such. The competitive table is the researched one in
  `competitive-landscape.md`.
- **Fifteen slides, not sixteen.** The plan uses **14**, leaving one in reserve, and never lets a
  slide carry two ideas to stay under the cap.

## 2. Principles (YC's, applied)

1. **One idea per slide, stated in the title.** The title is the takeaway; if a reader sees only
   titles, they get the pitch. Body text is support, never a second point.
2. **Legible from the back of the room.** Titles 72–96 px on a 1920×1080 canvas, body never under
   28 px, at most ~35 words of body per slide. No paragraph slides.
3. **Immersive, not decorated.** The film gives us the founder in a dark gym holding the thing he
   built. Slides are full-bleed stills from that footage with a left-anchored scrim and copy — the
   landing page's hero pattern, so the three artefacts look like one company. No stock photos, no
   clip art, no icon soup.
4. **Numbers as objects.** Where there is a number it is oversized and alone (the landing page's
   stat band): $140B, 0 taps, 4.4 ms.
5. **Say what is real, and mark what is not.** The traction slide splits *validated* from
   *being built*. App screens carry the "Product interface concept" label in-frame, exactly as the
   film and site do.

## 3. The slides

Order follows YC's seed template (title → problem → solution → product → traction → market →
model → why now → team → ask), with the competitive gap pulled forward to slide 3 because for this
product the *absence* of a solution is the argument.

| # | Slide | The one idea (title) | Visual |
|---|---|---|---|
| 1 | Cover | **IronPal — Stop logging. Just lift.** | full-bleed: founder holding the band up to the lens (`hero-poster.jpg`) |
| 2 | Problem | **The smartest thing in the gym is still your thumb.** | founder thumb-typing a set (`peter-typing.jpg`) |
| 3 | The gap | **The whole market makes you type the weight.** | comparison table, IronPal row highlighted |
| 4 | Solution | **Wear it. Lift. It's logged.** | band lifted out of the bag (`peter-band-out.jpg`), three steps |
| 5 | Product | **One band. Nothing to tap.** | band close-up crop from the hero frame; four spec lines |
| 6 | How it works | **It sees what you see — and learns from your own sets.** | diagram: band → phone → log, with the on-device / one-frame split drawn honestly |
| 7 | In the app | **Three numbers, logged for you.** | two phone mocks: live set (curl) + form screen (squat), labelled *Product interface concept*, over dimmed footage |
| 8 | Where we are | **A working proof of concept — on a phone, in a real gym.** | left: validated (measured); right: being built |
| 9 | Market | **$140B of gyms. $50B of trackers. Zero that read the bar.** | three oversized numerals |
| 10 | Business model | **Hardware people pre-order, software they keep paying for.** | three tiles: band bundle · premium app · gym pack |
| 11 | Why now | **The parts finally exist.** | three tiles: on-device ML · frame-reading models · passive-wearable trend |
| 12 | Roadmap | **From phone-on-a-headband to the band.** | four-step timeline |
| 13 | Team | **One founder, building it in the open.** | founder portrait (`peter-close.jpg`) |
| 14 | The ask | **What the next twelve months need.** | ask + use of funds + contact, ironpal.co |

Slide-by-slide, with every fact's source:

### 1 · Cover
- IRONPAL wordmark with the ring mark; *Stop logging. Just lift.*; one-liner: *A headband that
  watches your set and logs the exercise, your reps and the weight — automatically.* (allowlist
  claim 1). Footer: Peter Dermek · Startup Awards Slovakia 2026 · ironpal.co · category Lifestyle.
- Small "Campaign footage" tag on the image, as the site has.

### 2 · Problem
- *Phone out. Gloves off. Thumb-typing 3×8 @ 80 kg between sets.* Every rep logged by hand is a rep
  you stopped to remember; the rhythm breaks, the numbers get fudged, half never make it in
  (landing page `Problem.astro`, allowlist claim 3).
- One line of scale to set up slide 9: *Billions poured into AI — and every tracker still asks you
  to type the set* (allowlist last claim).

### 3 · The gap
- Table from `competitive-landscape.md` and `Compare.astro`: wrist trackers (Garmin/WHOOP) · bar
  IMU sensors (Enode/GymAware) · camera appliances (Tempo) · IronPal, across *picks the exercise /
  counts reps / reads the weight*. Footnote: *Automatic free-weight reading is an open gap across
  the entire market — the hard problem we're building.* Tempo reads only its own marked plates.

### 4 · Solution
- Three steps verbatim from `HowItWorks.astro`: Wear it · Lift · It's logged. Sub-line: *You type
  nothing.* No mechanism yet; that is slide 6.

### 5 · Product
- Moisture-wicking fabric band, 8 mm flush camera, motion sensors, a single teal LED, no screen
  (allowlist claim 7, `ProductSpotlight.astro`). Works on free weights and machines, no equipment
  instrumentation, no per-machine setup. First-person view.
- The image is the campaign's product render worn/held by the founder, never a CAD promise.

### 6 · How it works
- Three beats: **first-person view** (the one camera position nobody in the market occupies) ·
  **sensor fusion** (motion + camera; heavy grindy reps that wrist trackers drop) · **learns from
  you** (an on-device instance model that improves from your own confirmed sets — the self-training
  design). After a set the app proposes exercise, reps, weight; one tap confirms (allowlist claim 10).
- The privacy line, drawn into the diagram: reps and exercise on the band, offline; the weight
  reads from **a single frame sent off-device, processed in seconds and deleted**; no footage
  stored (allowlist claims 4–6). Never "no cloud".

### 7 · In the app
- The two designed screens the film and site already use: live set with the rep counter and the
  weight, and the squat form screen (depth, back angle, knees). Both labelled *Product interface
  concept* in-frame; form tracking captioned *being built, after reps and weight* (FAQ wording).
- Rendered from `scripts/k7/live_set.html` and `scripts/k8/squat_screen.html` at phone scale, so
  they match the film pixel for pixel.

### 8 · Where we are (traction)
Two columns, and the split is the honesty device.

**Working, measured** (every line traceable to `poc/README.md` or a dated commit):
- Proof-of-concept app running on a phone mounted on the headband since May 2026; on-device rep
  engine ticks in **4.4 ms** against a 15 ms budget (Galaxy A52, release build, 2026-09-13).
  Template matching is *not yet* verified on device — the benchmark ran against an empty index —
  and the slide does not claim it is.
- Sensor link verified on hardware (2026-08-05: MTU 247, zero sequence gaps).
- Self-training model P0 shipped: JVM 8/8, Jest 23, pytest 13; end-to-end Maestro suite 6/6
  (2026-09-14).
- 131 commits since April 2026, built in the open by one person.
- Landing page live at ironpal.co; a 73-second campaign film finished and attached to this
  application.
- No reservation count on the slide: the production database held **0** signups when read on
  2026-09-30 (ledger Q7), so the line is dropped rather than rounded.

**Being built:**
- Weight reading from the first-person frame — the core bet, not a shipped feature.
- Form analysis (depth, back angle, knees) — interface concept only.
- The band itself: today the POC is a phone on a headband; the integrated band with its own camera
  and IMU is the next hardware step (slide 12).

### 9 · Market
- **$140B** global health and fitness club market per year · **$50B** fitness tracker market per
  year, separate (allowlist claims 16–17, rounded on purpose) · **nearly 200M** gym members
  worldwide, footnoted *industry association estimate* — the script doc gives 195M without a
  citation, so this numeral is the first to delete if the founder has no source to hand (ledger Q8).
- Wedge, stated as a wedge: the people who already log strength sets by hand — every user of a
  logging app or a bar sensor is a person who has proven they want the number. No invented SOM
  arithmetic; the panel can do its own.

### 10 · Business model
- **Band + premium app bundle**, sold direct: Kickstarter launch, early-bird up to ~50 % off the
  launch price for the first 200 (allowlist claim 13). No public price on the slide — none is
  locked (`ironpal-landing-page-plan.md`: no `$` figure until BOM and tiers are locked).
- **Subscription** for the premium app after the bundled months.
- **Gym pack** (B2B, later): the first lifter at a gym maps its stations; every later member starts
  from that pack; a gym can sponsor it (self-training PRD §6.5 — partnership terms OPEN there too).
- Unit economics line: integrated band BOM **≈ $40–85 per unit at 1k** (`tier1-capture-module-spec`
  §7.3), so a sub-$100 build target is achievable.

### 11 · Why now
- On-device ML is cheap enough that a rep engine ticks in milliseconds on a mid-range phone
  (measured, slide 8).
- Multimodal models read numbers off a photo of a plate or a stack — the one thing that makes
  weight reading attackable without instrumenting the gym (POC uses one).
- The market is moving to passive, no-logging tracking (WHOOP 2026 passive load) — but derives load
  from body-mass models because it cannot see the bar. Validation of the thesis, and the gap.

### 12 · Roadmap
Four steps, dates stated as targets, not promises: **POC** phone-on-headband, two exercises
(done, 2026) → **Capture module** integrated band with own camera + IMU (tier-1 spec, hand-built
units ≈ $130–160) → **Kickstarter** with the first 200 early-bird backers → **Ship + gym packs**.
No calendar quarters on the slide unless the founder sets them (see ledger).

### 13 · Team
- **Peter Dermek** — solo technical founder. Hybrid athlete (strength + endurance) who got tired of
  typing reps mid-set. Designs, builds, shoots and ships everything himself, directing AI agents
  for what would otherwise need a team; the whole build is public.
- What is deliberately *not* on the slide: the other startups. A jury reads "eight at once" as
  divided attention; the build-in-public channel is the credible version of the same fact.
- Advisors / hires wanted: one line, *first hire: hardware/manufacturing* (the gap a solo software
  founder has), if the ask slide is funded.

### 14 · The ask
- *Fundraising* is a form heading, so the slide exists. The number is **OPEN** — no document in the
  repo sets a raise (ledger Q12). The slide therefore ships as *"Pre-seed conversations open — what
  the next twelve months need"* with three uses — 200 integrated units, weight reading validated on
  the top-20 exercises, first backers shipped — and no figure. If the founder sets an amount, the
  title becomes *"Raising a €[ask] pre-seed"*; the build script refuses to export while `[ask]` is
  still literal in the text.
- What SASK itself offers (bootcamp, Silicon Valley trip) is the reason to apply, so the slide also
  says what a mentor could unlock: hardware manufacturing and go-to-market.
- Contact: ironpal.co and the founder's e-mail. No X handle — the one in the playbook is planned,
  not verified to exist (ledger Q15).

## 4. Visual system

Taken from the site so the artefacts match (`web/src` tokens):

| | |
|---|---|
| canvas | 1920×1080 (16:9), one slide per PDF page |
| background | `#1A1A2E` navy; panels `#16162a`; lines `rgba(255,255,255,.08)` |
| accent | `#00E5CC` electric teal — numerals, the highlighted row, the ring mark, nothing else |
| heading | `#F0F4F8`; body `#c3c8d6` |
| display type | Montserrat 800 (titles, numerals); body Inter 400/500 |
| imagery | full-bleed campaign stills, `saturate(.85) brightness(.7)`, left scrim `rgba(16,16,30,.96→.22)` |
| marks | the Iron Ring (teal ring with bottom gap + lens dot) beside IRONPAL, as `Brand.astro` |
| labels | small caps, letter-spaced, for "Campaign footage" / "Product interface concept" |
| footer | slide number · IRONPAL · SASK 2026, 14 px, low contrast |

Photo slides put copy on the left 55 % and keep the subject right of centre by cropping
(`object-position`), never by mirroring — the band's ring mark sits on one side and a flipped still
would contradict the product slide (ledger Q16). Table and tile slides are flat navy with a faint
teal radial glow at the top, the site's panel treatment.

## 5. Build

Same pipeline as the film's insets and captions: HTML → headless Chrome → PDF, deterministic and
diffable.

| file | role |
|---|---|
| `scripts/deck/deck.html` | the 14 slides as `<section class="slide">`, one per page, CSS `@page` 1920×1080 |
| `scripts/deck/build.py` | copies/crops the stills, renders the two app screens via the existing `make_inset.sh` pages at phone scale, inlines everything, prints the PDF with Playwright, then **checks**: page count ≤ 15, size ≤ 30 MB, every image present, no `[N]`/`[ask]` placeholder left in the text unless `--allow-placeholders` |
| `docs/pitch_deck/IronPal_PitchDeck_2026.pdf` | the deliverable |
| `docs/pitch_deck/preview.png` | a contact sheet of all pages for a one-glance QA |

Fonts come from Google Fonts at render time with system fallbacks; if the render machine is
offline the fallback is Liberation Sans (already used for the captions) and the script says so.
Images are embedded as JPEG at 1920 px wide, quality 82, which keeps 14 pages under ~12 MB.

## 6. Submission

1. Founder sets the ask amount, or leaves the fallback wording (the default).
2. `python3 scripts/deck/build.py` → PDF + preview; read the preview.
3. Upload to Google Drive, set sharing to *anyone with the link*, paste the link into the Tally
   form's Attachments section. **Publishing is the founder's action, not the script's.**
4. Video slot: `K1_K9_master_eq_music.mp4` (English, 73 s) — already built.

## 7. Open, by design

- **The ask amount and use-of-funds split** (§3 slide 14) — no source; founder decides.
- **Roadmap dates** (§3 slide 12) — none; the Kickstarter plan's launch date is TBD, so the slide
  is a sequence with only the POC step marked done.
- **The reservation form path** — 0 rows on the server is either no demand or a broken wire; not a
  deck question, but it needs an answer before the next public push.
- **Gym-pack partnership terms** are OPEN in the self-training PRD and stay described as "later".

## 8. Sources

`SASK_2026_SUBMISSION.md` · `founder_video_promo_config.json` (`claims_allowlist`) ·
`competitive-landscape.md` · `web/src/components/*.astro` (site copy and tokens) · `poc/README.md`
(POC verification, A52 benchmark) · `ironpal-tier1-capture-module-spec.md` §7 (BOM) ·
`ironpal-self-training-prd.md` (gym pack) · `ironpal-landing-page-plan.md` (no public price) ·
`IRONPAL_PROMO_VIDEO_SCRIPT_V1.md` (195M members) · memory: marketing claim guardrails.
