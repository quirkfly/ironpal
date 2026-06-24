# IronPal — Landing Page Plan: Grilling / Decision Log

> Decisions resolved by grilling the founder on [`ironpal-landing-page-plan.md`](./ironpal-landing-page-plan.md).
> Each entry: the question, the options considered, the decision, and the rationale. Update the main plan to reflect these.

**Date:** 2026-06-24
**Owner:** Solo founder

---

## Q1 — Kickstarter timing → what is the page's primary job right now?

**Decision:** **No KS date yet — primary job is email capture.**

The page launches in **pre-launch state**: primary CTA = "Get Early-Bird Access" (email), goal = build a launch-day spike list, KS date = TBD. The "live" and "post-campaign" states stay designed-but-dormant in the codebase, toggled later when a date is set.

**Implication:** No countdown timer yet (no date to count to). Avoid hard-coding a launch date anywhere. The email list *is* the deliverable this page is measured on.

---

## Q2 — How hard do we lean on the (unvalidated) weight-reading claim?

**Decision:** **Lead with it — honestly framed.**

Automatic weight-reading stays the **headline differentiator** (it's the genuine market white space per [`competitive-landscape.md`](./competitive-landscape.md)). But it is framed as **the hard problem we're building / a vision we're proving**, never as a shipped, guaranteed feature. The FAQ states dev status plainly.

**Guardrails (must hold across ALL copy):**
- No phrasing that implies it already works flawlessly on any bar today ("knows exactly," "guaranteed," "every rep" → banned without a hedge).
- Frame as capability/mission + evidence, not warranty. Protects both trust and legal exposure.
- Reps + exercise recognition (closer to working) carry the "proof it's credible" weight; weight-reading carries the "this is why it matters" weight.

---

## Q3 — What do we show as PROOF, given no polished demo asset exists?

**Codebase finding:** We have raw egocentric clips (`input/kb/clips/*.mp4`), internal analysis montages (contact sheets, no UI overlay — e.g. `out/rec_20260615_122213/phase3/*.jpg`), and AI product hero stills (`input/images/product/headband/gpt-image-1.5_*headband*.jpg`). **No** recorded POC live-UI footage and **no** polished "3 metrics resolving" asset exist yet.

**Decision:** **Build a designed UI overlay composited on a real POV clip.**

Take a real clip from `input/kb/clips/`, composite a motion-graphic IronPal app overlay (exercise name → rep counter → weight) in brand teal, and **label it as a product interface concept**. Looks premium, is honest (it's the real lifting footage + a UI concept), and is buildable solo (After Effects / DaVinci, or a web-canvas overlay).

**Implication / new asset task:** produce 1–2 short overlay loops (e.g. triceps cable pushdown → "5 reps / 10 kg"). The label "product interface concept" is mandatory so the overlay is never mistaken for shipped UI (ties to Q2 guardrails). Keep the real KB analysis available as deeper credibility if needed later.

---

## Q4 — Build tool: hand-coded React vs design-first no-code?

**Decision:** **Framer (design-first), with email going to our own API.**

Supersedes the plan's "React 18 + Vite + Express + SQLite hand-build." Rationale: solo founder + an Awwwards-grade / no-slop bar → Framer delivers award-tier motion, responsiveness, and performance at far better quality-per-hour than hand-coding. We still **own the email list** by posting the form to our own endpoint (handlr-web-style `/api/collect-email` on the existing droplet) rather than letting it live only in a third party.

**Implications (revise plan §6 Technical):**
- Page hosted on Framer; `ironpal.co` pointed at Framer hosting (Framer manages SSL). Domain still registered via **Cloudflare Registrar**; DNS per Framer's instructions (the plan's `A → 45.55.36.33` droplet record is replaced by Framer's records). *Decide later if the email API sits on the droplet behind a subdomain (e.g. `api.ironpal.co`) with CORS allowing the Framer origin.*
- Keep a tiny Express + SQLite email service (reuse handlr-web's `collect-email` + `dump-emails`) — the only hand-coded piece.
- Cost: ~$15–30/mo Framer. Acceptable.

---

## Q5 — Does the page launch gate on the founder hero video?

**Decision:** **No — ship now with the overlay-demo hero.** The founder film slots in later.

The page launches with the **designed UI-overlay loop (Q3)** as the hero centerpiece (paired with the product still). The dedicated "§ The film" section is omitted or a quiet "coming soon" at launch, and is populated once the founder-led video is cut. Rationale: email list-building must start ASAP and must not be blocked by video production.

**Implication:** revise plan §5 (Hero = overlay demo, not the embedded film) and §7 (the film becomes a *post-launch* enhancement, not a launch blocker).

---

## Q6 — What does the visitor get for their email (the offer)?

**Decision:** **A locked early-bird price + first access (48h head start).**

The incentive is concrete and scarcity-driven: signing up **reserves the launch-day early-bird price and a 24–48h early-access window** before the public. No deliverable to build. This means the page **must publish a credible discount and a cap** (see Q7).

**Implication:** hero/scarcity copy shifts from vague "be first" to "Reserve your early-bird price — first 48h, limited spots." Email success state should restate exactly what they've locked in.

---

## Q7 — What price/scarcity do we publish?

**Decision:** **Publish a discount framing + a cap; defer the absolute dollar figure.**

The page states something like **"Early backers: up to ~50% off launch price — first 200 spots only."** No hard `$49` anchor goes public until the hardware BOM and KS tiers are locked. This keeps the offer credible and scarce (real % + real cap) without committing to a price we may not be able to hit.

**Implication:** the plan's §5 pricing section and the KS plan's `$49` tier stay internal for now; the page shows percentage + cap. Revisit once BOM is known — then optionally add the absolute number.

---

## Q8 — Privacy: how do we handle "a camera on my head"?

**Decision:** **Dedicated trust section + FAQ — worded to the ACTUAL hybrid architecture.**

**Codebase finding (critical):** per [`ironpal-poc-v1-design.md`](./ironpal-poc-v1-design.md), the architecture is **hybrid**, so a blanket "on-device / no cloud" claim would be **false**:
- **On-device & offline:** rep counting + exercise recognition (IMU) — never leaves the band.
- **Cloud:** weight reading (+ pushdown vision) **uploads a single frame** to the backend → OpenAI `gpt-5-nano`.
- **True mitigations:** the uploaded frame is **deleted immediately after inference**; **testers' frames are never stored**; the OpenAI key lives **server-side only**. Face-blurring is *noted but not built* (out of POC scope) — so we do **not** claim it.

**Decision on wording:** **accurate hybrid framing.** On-page copy, roughly:
> "Reps and your exercise are detected right on the band — offline. To read the weight, a single frame is sent securely, processed in seconds, and deleted immediately. We don't store your footage."

**Guardrail:** do **not** say "no cloud," "nothing leaves your device," or "faces are blurred/never captured." Those are untrue today. The FAQ spells out exactly what's sent, why, and that it's deleted. This turns privacy into a *defensible* selling point rather than an overclaim.

---

## Q9 — Email pipeline: where does the list live / how do we send to it?

**Decision:** **Framer form → a free ESP (MailerLite / Buttondown / ConvertKit free tier), with full CSV export.**

This **supersedes** the plan's custom `/api/collect-email` + Express + SQLite service (and softens Q4's "custom email API" — we don't hand-build an endpoint after all). Rationale: a pre-launch list is worthless unless we can *email* it on launch day; piping straight into a free ESP gives sending + automation for ~0 build, while CSV export preserves full data ownership.

**Implications (revise plan §6):**
- Drop the Express/SQLite email service and `dump-emails.js` from scope.
- Framer form → ESP via native integration/webhook; tag source (`landing_page` / `social` / `referral`).
- Pick the ESP on free-tier limits (most cover the first ~500–1,000 contacts free — fine for pre-launch).
- Set up a **welcome/confirmation email** restating the locked-in offer (Q6) immediately on signup.

---

## Q10 — Audience focus

**Decision:** **100% D2C lifters — single focus, no B2B content.**

The page speaks only to the individual gym-goer who hates manual logging. The original B2B-SaaS-to-gyms concept is **not** on this page; no gym-owner sections, no dual messaging (avoids the "converts neither" failure). One audience, one CTA path.

**Implication:** voice, imagery, FAQ, and the offer are all lifter-framed. (If inbound B2B interest appears later, a tiny footer link can be added — but not at launch.)

---

## Q11 — Primary pre-launch traffic source

**Decision:** **Organic social / build-in-public** (founder content on IG/TikTok/X/YouTube + fitness communities), $0 budget.

This is warm, high-intent, on-message traffic — which sets a **realistic conversion target of ~8–15%** email capture (vs. 2–5% for cold paid). Slower ramp, but fits solo + no-date.

**Implications (revise plan §9):**
- Build for **message-match to founder content** (the page should feel like the next step after a build-in-public post, not a cold ad LP).
- The honest, anti-hype tone (Q2/Q8) is also what keeps the founder welcome in lifting communities (Reddit etc.) instead of getting flagged as spam.
- SEO is secondary (traffic is referral/social), but keep clean meta + a strong OG share card since social shares are the main spread mechanism.

---

## Decisions summary (one-liners)

| # | Branch | Decision |
|---|---|---|
| Q1 | KS timing | No date yet → **page = email-capture, pre-launch state** |
| Q2 | Weight claim | **Lead with weight-reading, honestly framed** (vision/in-dev, never "shipped") |
| Q3 | Proof asset | **Designed UI overlay on a real POV clip**, labeled "interface concept" |
| Q4 | Build tool | **Framer** (design-first), not hand-coded React |
| Q5 | Video gate | **Ship now**; overlay-demo hero; founder film added later |
| Q6 | Offer | **Locked early-bird price + 48h early access** for the email |
| Q7 | Price/cap | **Discount % + cap ("~50% off, first 200")**, defer absolute $ |
| Q8 | Privacy | **Dedicated section + FAQ, accurate hybrid framing** (no "no-cloud" overclaim) |
| Q9 | Email pipeline | **Framer → free ESP** (export anytime); drop custom SQLite API |
| Q10 | Audience | **100% D2C lifters**, single focus |
| Q11 | Traffic | **Organic social / build-in-public**; target ~8–15% CVR |

### Net changes to the main plan
- **§6 Technical** rewritten: Framer + free ESP, not React/Vite/Express/SQLite on the droplet; domain points to Framer hosting (still registered at Cloudflare).
- **§5 Hero** = overlay-demo + product still (not the embedded founder film).
- **§5 Pricing / scarcity** = discount % + cap, no public $ figure.
- **§5 Privacy section** added with accurate hybrid wording; **FAQ** privacy answer corrected.
- **§2 / claims** keep weight-reading as headline but with the honest-framing guardrails.
- **§7 Assets**: add "produce 1–2 UI-overlay demo loops"; founder film becomes post-launch.
- **§9 Optimization**: target ~8–15% CVR for warm organic traffic; build for message-match to founder content.
- **Audience**: lock to D2C lifters only.

