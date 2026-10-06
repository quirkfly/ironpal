# IronPal — shared campaign core

The copy, rewards and numbers every platform draft is built from. Platform
packages in this folder reference this file instead of repeating it, and say
only what that platform changes (field limits, currency, category names).

**Status:** draft for review · nothing here is live · owner Peter Dermek

## Identity

| Field | Value |
|---|---|
| Project name | IronPal |
| Creator | Peter Dermek |
| Legal entity | 20deka, s.r.o., IČO 47 843 411, Bratislava, Slovakia |
| Contact email | p3t3r.d3rm3k@gmail.com |
| Website | https://ironpal.co |
| Film | https://www.youtube.com/watch?v=5Hs_VxRIlGM |
| Funding goal | **$50,000** (or the platform-currency equivalent; see each package) |
| Launch date | **2026-10-20** (14 days after the task was set on 2026-10-06) — set as the planned date only; nobody presses Launch |
| Duration | 30 days |

## Title and short description

- **Title (≤60):** `IronPal: the headband camera that logs your lifts`
- **Subtitle (≤135):** `A first-person camera and motion sensors in a headband. It recognises your exercise and counts your reps, so you stop typing between sets.`
- **One-liner (≤100):** `Your lifts, logged hands-free.`

## Story (long description)

> Written to the claim guardrails: weight-reading is framed as the hard problem
> being built, not a working feature; privacy is described as hybrid.

**The problem.** People who train with weights already log their sets — by
thumb, between sets, in an app. Every set is three numbers: what you did, how
many, and how heavy. Wrist wearables guess the reps from your arm and miss leg
work. Bar sensors need you to pick the lift by hand. Nobody reads the weight.

**IronPal.** A headband with a small camera and motion sensors. It sees the set
the way you do — from your own head. It recognises the exercise and counts the
reps, and the log fills itself while you train.

**What works today.** A working prototype band and Android app. Exercise
recognition and rep counting run on the device, and the model learns from your
own confirmed sets — the more you train, the better it knows your movements.

**What we're building with your help.** Reading the weight off the bar or the
stack, from the lifter's own view. It is the hardest part and the reason
IronPal exists: no shipping product does it for ordinary gym equipment today.
We're honest about it — it is in development, and the campaign funds it.

**Privacy.** Rep and exercise detection run on the band and phone, offline.
Weight-reading sends a single frame to a cloud model, and that frame is deleted
right after it is read. We do not store your training footage.

**Who's behind it.** Peter Dermek, a software developer and hybrid athlete in
Bratislava, who built the prototype, the app and the model himself.

**Where the money goes** (of $50,000):

| Item | Share | Amount |
|---|---|---|
| First production run (tooling, components, assembly) | 50 % | $25,000 |
| Weight-reading R&D and on-device model work | 20 % | $10,000 |
| Certification (CE / FCC, battery transport) | 12 % | $6,000 |
| Platform and payment fees (≈8–10 %) | 10 % | $5,000 |
| Fulfilment buffer (packaging, shipping overrun) | 8 % | $4,000 |

**Risks.** Hardware is hard. The main risks are manufacturing delays,
certification time, and weight-reading accuracy. Rep and exercise tracking ship
first; weight-reading ships when it is accurate enough, as a software update.

## Rewards

From `docs/kickstarter-launch-execution-plan.md` §Reward Tier Structure, with
the cap camera removed — the current product is the headband only. **Prices are
an OPEN decision** (no BOM yet); drafts carry these as editable placeholders.

| # | Name | Price | Contents | Limit |
|---|---|---|---|---|
| 1 | Founding Supporter | $15 | Thank-you, name on the founders page, early app access (digital only) | — |
| 2 | Super Early Bird | $49 | IronPal headband + 6 months premium app | 200 |
| 3 | Early Bird | $69 | IronPal headband + 12 months premium app | 500 |
| 4 | Complete Kit | $99 | IronPal headband + spare band + lifetime premium app | — |
| 5 | Gym Owner Pack | $399 | 5 × Complete Kit + gym partnership onboarding | 50 |

- **Estimated delivery:** September 2027 (OPEN — conservative, with 3–6 months buffer)
- **Shipping:** worldwide, charged at checkout; EU / US / rest-of-world rates OPEN

## Media

| Asset | File |
|---|---|
| Campaign film | `~/job_stuff/prj/geggen/products/ironpal/clips/K1_K9_master_eq_music.mp4` / YouTube link above |
| Hero loop (silent) | `web/public/video/hero.mp4` |
| Cover image 16:9 | `post/assets/IronPal_banner_linkedin_v01.jpg` |
| Logo | `input/images/logo/v4/Geometric teal circle on navy.png` |
| Founder stills | `web/public/assets/peter/*.jpg` |
| Pitch deck | `docs/pitch_deck/IronPal_PitchDeck_2026.pdf` (equity platforms) |
