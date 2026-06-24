# IronPal — Landing Page Plan

**Status:** Draft for team review
**Owner:** Solo founder (design + build + deploy)
**Date:** 2026-06-24
**Related:**
[`kickstarter-launch-execution-plan.md`](./kickstarter-launch-execution-plan.md) (Phase 3.5 — domain, web, deploy) ·
[`color-schemes.md`](./color-schemes.md) ·
[`logo-design-concepts.md`](./logo-design-concepts.md) (Iron Ring is the sole logo) ·
[`competitive-landscape.md`](./competitive-landscape.md) (the white space we sell) ·
[`founder-led-production-strategy.md`](./founder-led-production-strategy.md) (on-camera = founder) ·
[`video-production-execution-plan.md`](./video-production-execution-plan.md) (hero video) ·
[`body-mounted-product-prompts.md`](./body-mounted-product-prompts.md) (product hero stills) ·
[`ironpal-landing-page-plan_grilled.md`](./ironpal-landing-page-plan_grilled.md) (decision log behind this plan)

> **One job for this page:** convert **warm, organic fitness traffic** into **early-bird email signups** before the Kickstarter goes live, and on launch day flip into a "Back us now" funnel. Everything below serves that one job. It is *not* a brochure.

> **Audience:** individual gym-goers / lifters only (D2C). There is no gym-owner / B2B content on this page — a split message converts neither.

---

## 1. Where this fits

This page is the **owned hub** referenced throughout `kickstarter-launch-execution-plan.md` Phase 3.5. It runs on `ironpal.co`, captures emails pre-launch (to build a launch-day spike that Kickstarter's algorithm rewards), and after launch redirects/CTAs into the campaign. It must be **live before Phase 4 audience-building begins**.

**No Kickstarter date is set yet** — so the page ships and lives in its **pre-launch state**, and its sole success metric today is the size and quality of the email list. The "Live" and "Post-campaign" states are designed now but stay dormant until a date exists (no countdown timer, no hard-coded launch date until then).

| State | Window | Primary CTA | Secondary CTA |
|---|---|---|---|
| **Pre-launch** *(current)* | Now → KS launch | "Reserve Early-Bird Access" → email capture | See how it works (scroll) |
| **Live** | Launch → campaign end | "Back IronPal on Kickstarter" → KS page | Share / email reminder |
| **(Post-campaign)** | After | "Join the waitlist" → email | — |

---

## 2. The one big idea (message hierarchy)

The competitive research (`competitive-landscape.md`) gives us a sentence no competitor can honestly say:

> **It reads the weight off the bar. Automatically. On any equipment. You type nothing.**

That is the entire pitch. Garmin miscounts reps; WHOOP *fakes* load from a body-mass model because it can't see the weight; Tempo only reads its *own* marked plates; everyone else makes you pick the exercise from a menu and type the kilos. IronPal **watches your set and logs all three — exercise, reps, weight — with zero manual input.**

**Message ladder (top to bottom of page):**

1. **Hook (hero):** "Stop logging your workouts. Start *doing* them." → IronPal sees what you lifted.
2. **Problem (felt pain):** the friction of manual logging mid-set — the thing every lifter already hates.
3. **Mechanism (the magic):** headband camera + motion sensors + AI → exercise, reps, weight.
4. **Proof it's real:** the demo overlay (exercise / reps / weight reading off a real set — labelled as a product interface concept), plus the "everyone else can't do this" contrast.
5. **Trust (who's behind it):** founder on camera — backers fund people, not stock characters.
6. **Ask:** reserve the early-bird offer (email) / back on Kickstarter.

Do not bury the weight-reading claim — it is the only thing here the market has never seen ship. But frame it as the capability we're building and proving, never as a finished, guaranteed feature (it isn't validated on-device yet). Reps + exercise recognition carry the "this is credible," weight-reading carries the "this is why it matters."

---

## 3. Reference benchmarks — what to steal, what to refuse

The brief is explicit: **no AI slop.** That means we copy *structure and craft* from sites that won on substance, and we hard-ban the visual tells of a generated template.

### 3a. Awwwards fitness references (study these directly)

From the Awwwards fitness collection (awwwards.com/inspiration_search/fitness/):

| Site | What to take |
|---|---|
| **Essor Fitness** (Honorable Mention) | Disciplined type scale + restrained motion; premium without gimmicks |
| **Kinetics** (Honorable Mention) | Interactive product module — showing a system working, not just photos |
| **THE GRIND** | Confident athletic branding; high-contrast dark aesthetic close to our Stealth Teal scheme |
| **La Huella Workout Club** | Dynamic visual storytelling driven by scroll, kept coherent |
| **Phive Clubs** (SOTD + Dev award) | Engineering polish — smoothness, perf, no jank |
| **Native** (SOTD) | Clean wellness execution; whitespace and pacing |
| **Fitbody** | Video + interactive product modules to *demonstrate* capability |
| **The Sculpt Society** | Program/feature module pattern (reusable for our "3 metrics" module) |
| **Taravilla Lab** | "Motion that fits" — micro-animation as polish, not noise |

### 3b. Top 3 hardware product pages (DTC craft benchmark)

- **WHOOP** (whoop.com) — screen-free, "no distractions" narrative; sparse, confident, dark. *Our closest spiritual sibling* (passive, no-screen-on-device ethos). Steal its calm authority.
- **Oura** — premium minimal product photography, generous negative space, restrained palette. Steal its product-as-jewel framing for our headband hero.
- **Eight Sleep** — long-scroll "mechanism" storytelling for an invisible technology, with proof modules and bold benefit claims. Steal its "explain the invisible tech without a spec dump" flow.

### 3c. Top 3 app UX references (for the in-page UI/demo mockups)

- **WHOOP app** — data presented as a single confident number, not a dashboard dump.
- **Strava** — social/segment energy; how to make numbers feel like a story.
- **Oura app** — readable, calm data viz, teal/cool palette adjacency.

### 3d. The anti-AI-slop rulebook (non-negotiable)

These are the **tells we ban** so the page doesn't read as generated:

- ❌ **No generic stock-3D blobs, gradient orbs, or floating glassmorphism cards** with no reason to exist.
- ❌ **No purple-to-blue "SaaS template" gradient.** Our palette is matte black + a single electric-teal accent (§4).
- ❌ **No fake testimonials, fake logos, "as seen in," or invented metrics.** Pre-launch we have none — so we don't fake them. We use *honest scarcity* (early-bird, founder story) instead of fake social proof.
- ❌ **No center-aligned everything + three identical icon-cards** ("Fast / Secure / Easy"). That layout *is* the slop signature.
- ❌ **No hero headline that says "Revolutionize your fitness journey."** Write like a lifter, not a landing-page generator.
- ✅ **Real footage of the real product on a real person (the founder).** Authentic > polished-fake.
- ✅ **One idea per viewport.** Earn each scroll.
- ✅ **Every animation has a job** (reveal data, guide the eye). If it's decorative-only, cut it.

---

## 4. Visual system (locked to existing brand docs)

**Primary scheme: "Stealth Teal" (dark)** from `color-schemes.md` — chosen because the product's identity *is* a teal LED glowing in a dark gym, and dark pages make a single accent color do the selling. (Keep "Arctic Pulse" light scheme as an optional alt for a future B2B/gym-owner page, not this one.)

| Token | Hex | Use |
|---|---|---|
| `--bg` Charcoal Black | `#1A1A2E` | Page + hero background |
| `--panel` Gunmetal | `#2D2D3A` | Cards, dividers |
| `--accent` Electric Teal | `#00E5CC` | **CTAs, LED glow, the one thing that "lights up"** |
| `--heading` Ice White | `#F0F4F8` | Headings |
| `--body` Slate Gray | `#8E8E9A` | Body, captions |
| `--urgency` Neon Lime | `#BFFF00` | *Sparingly* — early-bird scarcity badge only |

**Logo:** "The Iron Ring" only (per `logo-design-concepts.md` final decision — Logos 2 & 3 are eliminated). Teal ring with bottom gap + lens dot + `IRONPAL` wordmark in Ice White. Use the navy/teal asset `input/images/logo/v4/Geometric teal circle on navy.png` for the nav and footer.

**Typography:** geometric sans only. Headings `Satoshi`/`General Sans` or `Montserrat` (matches the logo wordmark spec); body `Inter`. No serifs, no script. Tight tracking on display sizes; large, athletic scale.

**Imagery treatment (from `color-schemes.md`):** gym shots desaturated 60–70% with a cool tint; **the headband + teal LED stay full saturation** so the product pops in every frame. Use the produced hero stills (`body-mounted-product-prompts.md` outputs) and frames from the founder-led hero video.

**Motion:** teal-to-transparent radial glow behind the product; numbers (reps/weight) *count up* on scroll-into-view; subtle parallax on the hero device. Respect `prefers-reduced-motion`. Target 60fps; nothing janky (the Phive Clubs bar).

---

## 5. Page architecture (section-by-section)

A single long-scroll page. Each section = one viewport, one idea, one job.

### § Hero (above the fold)
- **Background / centerpiece:** the **UI-overlay demo loop** — a real first-person clip (from `input/kb/clips/`) with a product-interface-concept overlay resolving exercise → reps → weight — over the dark scheme with a teal LED glow, paired with the product still. (The founder film is *not* the hero; it's added post-launch.)
- **Headline:** `Stop logging. Just lift.`
- **Subhead (1 sentence value prop):** `IronPal is a headband that watches your set and logs the exercise, your reps, and the weight on the bar — automatically. You type nothing.`
- **Primary CTA:** `Reserve Early-Bird Access` (teal button, dark text) → email capture (inline field, not just a modal — lower friction).
- **Scarcity micro-line:** `Up to ~50% off launch price — first 200 spots. Reserve yours.` *(No public `$` figure until BOM/tiers are locked.)*
- **Trust micro-line:** `Built by a solo founder who got tired of typing reps into an app mid-set.`
- Sticky nav appears on scroll: logo left; `How it works · The tech · Pricing · [Reserve]` right.

### § Problem ("the old way")
- Tight, honest copy on the friction of manual logging — phone out, gloves off, typing `3×8 @ 80kg` between sets, losing your tempo. (Mirror the "old way" beat from `video-production-execution-plan.md`.)
- Visual: a **generic, legally-distinct** workout-log UI mock being tapped at (NOT a Fitbod clone — see the copyright note in `video-production-execution-plan.md`). Desaturated, cold.
- One line transition: `There's a better way to remember what you did.`

### § The three metrics (the core module — "Kinetics/Fitbody" style)
Three stacked, scroll-revealed proof blocks (NOT three identical center cards):
1. **What you did** — exercise recognition (IMU fingerprint + camera). Show the name resolving on screen.
2. **How many** — rep counting via **sensor fusion** (the reliability wedge vs. Garmin/Enode dropouts).
3. **How much** — **weight read off the bar** — the headline differentiator. Animate the plate read → `80 kg`.
Each block: short benefit line + a small looping demo/overlay. Numbers count up on reveal.

### § How it works (3 steps, the "invisible tech" explainer — Eight Sleep flow)
`Wear it → Lift → It's logged.` Three concise steps with a connecting visual; explain the mechanism (on-device camera + motion sensors + AI) in plain language. No spec dump.

### § Why nobody else does this (the contrast / honest proof)
A compact comparison drawn straight from `competitive-landscape.md` — the most credible, least sloppy "proof" we have pre-launch:

| | Pick the exercise? | Counts reps? | Reads the weight? |
|---|---|---|---|
| Wrist trackers (Garmin/WHOOP) | auto, often wrong | unreliable / none | ❌ (WHOOP *estimates* from body mass) |
| Bar IMU sensors (Enode/GymAware) | manual / learned | drops heavy reps | ❌ manual entry |
| Camera appliances (Tempo) | in-class only | yes, in class | only *their* marked plates |
| **IronPal** | **automatic** | **sensor-fusion** | **✅ any free weight** |

Caption (honest): *"Automatic free-weight reading is an open gap across the entire market. It's the hard problem we're building."* — confident, not overclaiming a shipped guarantee.

### § Meet the founder (trust)
Founder on camera / photo + 2–3 honest sentences: why this exists, the build-in-public promise. (Per `founder-led-production-strategy.md`: backers fund people.) This *replaces* fake testimonials.

### § Privacy / trust
Address the "a camera on my head" objection head-on, in wording **accurate to the actual hybrid architecture** (`ironpal-poc-v1-design.md`): *"Reps and your exercise are detected right on the band — offline. To read the weight, a single frame is sent securely, processed in seconds, and deleted immediately. We don't store your footage."* Do **not** claim "no cloud" or "faces blurred" — both are untrue today (weight-reading uses `gpt-5-nano` in the cloud; face-blur isn't built). Handled honestly, this turns the top objection into a trust moment.

### § The film *(post-launch)*
**Omitted or a quiet "coming soon" at launch** — the page does **not** wait on the video to go live. Once the founder-led 60–90s film is cut, embed it here (poster frame from the strongest S-shot, lazy-loaded).

### § Pricing / tiers (pre-launch teaser → live)
- Pre-launch: tease the early-bird offer as **"up to ~50% off launch price, first 200 spots"** + 48h early access (headband + premium app months). CTA = email ("reserve your spot"). **No public `$` figure** until BOM/tiers are locked.
- Live: show real KS tiers, CTA = `Back on Kickstarter`.

### § FAQ
Address the real objections, honestly: *Does it actually read any weight? What about machines/cables? Privacy (what's sent / kept)? When does it ship? What's the refund/risk?* The privacy answer must match § Privacy above — spell out exactly what's sent to the cloud (one frame, for weight), why, and that it's deleted immediately.

### § Final CTA + footer
- Repeat the email capture (`kickstarter-launch-execution-plan.md` "Second Email CTA").
- Footer: Iron Ring logo, one-line mission, socials, contact, `© IronPal`. Honest "in development" disclosure.

---

## 6. Technical implementation

**Build it design-first in Framer, with email piped to a free ESP.** A hand-coded React/Express/SQLite stack was considered and rejected: as a solo founder hitting an Awwwards / no-slop bar, Framer delivers far better quality-per-hour, and a free ESP gives us launch-day sending for ~0 build while we still fully own (and can export) the list.

- **Builder:** **Framer** — award-tier motion, responsive, fast; ~$15–30/mo.
- **Email capture:** Framer form → **free ESP** (MailerLite / Buttondown / ConvertKit free tier). Tag `source` (`landing_page` / `social` / `referral`). Full **CSV export** = we own the list. Set up a **welcome email** that restates the locked-in early-bird offer (price lock + 48h head start).
- **Email UX:** inline hero field + modal fallback; success state restates exactly what they reserved (price lock + 48h head start); honest error state. Teal CTA `#00E5CC` on dark text.
- **Domain:** `ironpal.co` registered via **Cloudflare Registrar** (~$10–12/yr); DNS pointed at **Framer hosting** per Framer's instructions (Framer manages SSL). The page does **not** live on the shared handlr-web DigitalOcean droplet.
- **Analytics:** privacy-light (Plausible or Cloudflare Web Analytics — no cookie banner), conversion event on signup; optional Microsoft Clarity for one week of heatmaps.
- **Performance:** Framer handles most of it, but still gate on Lighthouse ≥ 90 mobile, LCP < 2.5s, lazy-load the demo loop with a poster frame. (The Awwwards/Phive bar is real engineering, not just looks.)

---

## 7. Content & asset production checklist

Most assets already exist — this page is largely assembly. The one genuinely new piece is the demo overlay.

**Launch-critical:**
- [ ] **Copy** — write all sections in the lifter's voice (founder owns this; it's the #1 anti-slop lever).
- [ ] **UI-overlay demo loop(s)** *(new — the hero centerpiece)* — take a real clip from `input/kb/clips/`, composite a product-interface-concept overlay (exercise → reps → weight, e.g. triceps pushdown → "5 reps / 10 kg"), labelled as a concept. Built in After Effects / DaVinci or a web/canvas overlay.
- [ ] **Hero product still** — from `body-mounted-product-prompts.md` outputs (headband + teal LED + Iron Ring).
- [ ] **Generic workout-log mock** for the Problem section (legally distinct — see the copyright note in `video-production-execution-plan.md`).
- [ ] **Logo assets** — Iron Ring, `input/images/logo/v4/`.
- [ ] **Comparison table data** — lifted from `competitive-landscape.md`.
- [ ] **Founder photo/clip** — on camera.
- [ ] **Favicon / OG image / social share card** — Iron Ring on `#1A1A2E`, with the value-prop line (so shared links don't look slop either).

**Post-launch (does not gate go-live):**
- [ ] **Hero film** — the founder-led 60–90s video (`video-production-execution-plan.md` / `founder-led-production-strategy.md`); slot into § The film once cut.

---

## 8. Timeline (runs *parallel* to Kickstarter Phase 2 video production, per Phase 3.5)

| Day | Task | Output |
|---|---|---|
| 0 | Produce the **UI-overlay demo loop(s)** (real POV clip + interface-concept overlay) | Hero/demo asset ready |
| 1 | Register `ironpal.co` (Cloudflare); set up Framer + free ESP account | Accounts ready |
| 1–2 | Build Framer design system (tokens, type, components) from §4 | Styled shell |
| 2–4 | Build sections § Hero → § Footer; drop in assets; wire form → ESP + welcome email | Full page + working capture |
| 4–5 | Mobile-responsive + motion + reduced-motion + Lighthouse ≥ 90 | Polished, fast |
| 5 | Point `ironpal.co` DNS at Framer; publish; smoke-test signup end-to-end | **Live at ironpal.co** |
| 6 | Analytics, OG/social card, copy polish, cross-browser QA | Launch-ready |

Total ≈ **5–7 days**, matching the kickstarter plan's Phase 3.5 estimate. **Gate:** live before audience-building (Phase 4) starts.

---

## 9. Testing & continuous optimization

- **Pre-launch A/B (cheap, sequential if traffic is low):** hero headline (`Stop logging. Just lift.` vs. `It reads the weight off the bar.`), and CTA copy (`Reserve Early-Bird Access` vs. `Reserve your spot`).
- **Primary metric:** email-capture conversion rate. Pre-launch traffic is **warm and organic (founder build-in-public on IG/TikTok/X/YouTube + fitness communities, $0 budget)**, so target **~8–15%** of unique visitors; treat < 5% as a hero/message problem, not a traffic problem. (Cold paid would be 2–5% — a different bar if that channel is added later.)
- **Message-match:** the page should feel like the natural next step after a founder build-in-public post, not a cold ad LP. The honest, anti-hype tone is also what keeps the founder welcome in lifting communities (Reddit etc.) rather than flagged as spam.
- **Funnel events:** hero view → scroll depth → demo-loop view → CTA click → email submitted. Find the drop-off, fix that section first.
- **Heatmap/session (optional, privacy-respecting):** Microsoft Clarity or similar for one week to see where people stall.
- **Iterate weekly** until launch: ship the winning variant, re-test the next-biggest drop-off. Post-launch, swap the page to "Live" state and re-point the primary CTA to Kickstarter.

---

## 10. Brand consistency (across *all* marketing materials)

The page is one node in a system — it must match the video, Kickstarter page, social, and email so the brand reads as one company, not a folder of assets:

- **Single palette** (Stealth Teal) and **single logo** (Iron Ring) everywhere — no per-asset drift.
- **Same headline/value-prop sentence** on the page hero, KS page hero, OG card, and video end-card. Repetition = recall.
- **Same imagery treatment** (desaturated gym, full-saturation product + teal LED) on page, social, and video thumbnails.
- **Same voice** — plain, lifter-honest, no hype-template language.
- Maintain a tiny **brand quick-ref** (hex tokens, fonts, logo files, the one value-prop sentence, the do/don't slop list) so every future asset is checked against it.

---

## 11. Risks & mitigations

| Risk | Mitigation |
|---|---|
| **Page reads as AI slop** (kills credibility instantly) | Enforce §3d rulebook; founder-written copy; real product footage; one reviewer signs off against the do/don't list before deploy |
| **Overclaiming weight-reading** as shipped/guaranteed | Frame as "the hard problem we're building," show real reads as evidence not a warranty; keep FAQ honest — protects trust *and* avoids legal exposure |
| **No social proof pre-launch** | Don't fake it — use honest scarcity + founder story; add real numbers (backer count, press) only once true |
| **Low conversion** | Treat as a message problem first (A/B hero/CTA), traffic second; instrument the funnel to find the real drop-off |
| **Solo-founder bandwidth** (build competes with video production) | Framer (not hand-coded) + free ESP; assemble existing assets; 5–7 day box, parallel to Phase 2 |
| **Privacy objection** ("a camera on my head") | Dedicated § Privacy + FAQ with **accurate hybrid wording** (on-band reps/exercise; one frame to cloud for weight, deleted immediately). Never claim "no cloud"/"faces blurred" — turn the concern into a trust moment honestly |
| **Perf jank on mobile** (most KS traffic is mobile) | Lighthouse ≥ 90 gate; lazy media; poster-then-video; test on a mid-range Android |

---

## 12. Resources & budget

- **Domain:** `ironpal.co` ~$10–12/yr (Cloudflare).
- **Builder/hosting:** **Framer** ~$15–30/mo (includes hosting + SSL).
- **Email:** **free ESP** tier (MailerLite / Buttondown / ConvertKit) — $0 until ~500–1,000 contacts.
- **Fonts:** free (Inter, Satoshi/General Sans, Montserrat).
- **Analytics:** Cloudflare Web Analytics (free) or Plausible (~$9/mo).
- **Assets:** mostly $0 — reuse product/logo assets; **one new task:** produce the UI-overlay demo loop(s).
- **Labor:** solo founder, ~5–7 days.

**Bottom line:** low marginal cost (~$15–30/mo + domain), 5–7 days, Framer + a free ESP and the assets already built — its entire value is **converting warm organic traffic into a launch-day email list** with a page that is honest, fast, on-brand, and visibly *not* generated.

---

**Sources for external references:**
[Awwwards — Fitness inspiration](https://www.awwwards.com/inspiration_search/fitness/) ·
[Awwwards — Sites of the Day](https://www.awwwards.com/websites/sites_of_the_day/) ·
[WHOOP](https://www.whoop.com/us/en/) ·
[Oura](https://ouraring.com/) ·
[Eight Sleep](https://www.eightsleep.com/)
