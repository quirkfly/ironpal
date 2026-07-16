# IronPal — Build-in-Public Distribution Channel Plan

**Owner:** Solo founder (named, visible)
**Status:** Approved direction — manual-first, validate before automating
**Last updated:** 2026-06-28
**Decisions log:** [`ironpal-distribution-channel-plan_grilled.md`](./ironpal-distribution-channel-plan_grilled.md)

---

## 1. The Idea in One Sentence

A **named solo founder building a fitness-hardware startup by directing AI agents** (`task.md` → `/rt`), shown honestly — wins and faceplants. Each meaningful task and its result is redacted of anything sensitive and published as a short build-log post on X.

This is **build-in-public as a distribution channel**, not a separate marketing effort. The work *is* the content, and the *way* the work happens — an agentic `task.md → /rt → redactor` loop — is the differentiated hook. For a solo founder with no budget and no time for a content team, the cheapest defensible top-of-funnel is showing the real, honest reality of building IronPal, consistent with the anti-hype tone the landing page strategy already commits to ([`ironpal-landing-page-plan.md`](./ironpal-landing-page-plan.md), Q11: *organic social / build-in-public*).

### Why this works for IronPal specifically

- **The journey is genuinely interesting.** The `task.md` history is a story of an honest, hard problem solved by directing AI: reading weight off a first-person camera with no calibration, no QR codes, off-the-shelf models only. The failures (exercise-recognition grilling, "the headband is floating in the air," the kitchen-shoot disappointment) are *more* compelling than a polished pitch.
- **The agentic angle compounds two audiences.** "Watch a solo founder build a startup by directing AI agents" lands with the AI/indie-builder crowd *and* documents the product for later fitness reach.
- **It builds credibility before launch.** A steady, honest public feed earns reach and trust at $0 — the warm audience that later converts at Kickstarter.
- **Near-zero marginal cost.** The content already exists in `task.md`; it just needs redaction and packaging.

---

## 2. Settled Direction (from grilling)

These are decided. Full rationale in the [decisions log](./ironpal-distribution-channel-plan_grilled.md).

| # | Decision | Choice |
|---|---|---|
| Q1 | Founder identity | **Named & visible** — redactor strips secrets, never the founder |
| Q2 | Technical-method exposure | **Outcomes & journey only** — recognition method stays private (the moat) |
| Q3 | Build sequencing | **Manual-first**, automate only what earns it |
| Q4 | Validation gate | **~4 weeks / 15–20 posts** → engagement + social-sourced signups |
| Q5 | Cadence | **2×/week on fixed days**, batch-written |
| Q6 | Platform | **X (Twitter) only** first; expand post-validation |
| Q7 | Content source | **Mine the `task.md` backlog + curate forward** (failures first) |
| Q8 | AI-workflow disclosure | **Make the agentic workflow the hook**, fully transparent |
| Q9 | Primary audience | **AI/indie-builders** — X is reach/credibility, not direct backers |
| Q10 | Call-to-action | **Soft "follow the build"** — no hard funnel |
| Q11 | Post visuals | **Raw artifacts, light brand touch** — not polished cards |
| Q12 | Screenshot safety | **Manual scrub + checklist on every image** |
| Q13 | Owned archive | **Defer** `ironpal.co/log` until validated; keep originals |

---

## 3. Goals & Non-Goals

### Goals (first ~90 days)
1. Validate that an honest, agentic build-log earns real engagement on X.
2. Grow an engaged following + credibility as a top-of-funnel for the eventual Kickstarter.
3. Establish IronPal's voice: honest, technical, anti-hype, slightly self-deprecating.
4. Build a content backlog (and preserved originals) that later become automation fuel, YouTube videos, and an owned archive.

### Non-Goals (for the validation phase)
- Not every task ships. The founder curates; sensitive POC-method tasks are outcomes-only or skipped.
- No automated pipeline yet — manual until the channel proves out (Q3).
- No cross-posting, no branded-card factory, no video, no `/log` page yet — all post-validation.
- No hard sell. X is reach, not a backer-acquisition funnel (Q9/Q10).

### Success metrics (validation window)
| Metric | Target |
|---|---|
| Posts published | ~2/week (15–20 over 4 weeks) |
| Engagement | Replies / saves / reshares (not just likes) trending up |
| X followers | Growing engaged core (quality > vanity count) |
| Social-sourced email signups | A handful, tagged `source=social` on `ironpal.co` |
| Redaction misses (any secret reaching a published post) | **0** — hard gate |
| Median task → published lag | < 1 week (batched) |

The **Q4 gate**: after ~4 weeks, automate the pipeline *only if* engagement + signups are real. If it's crickets, fix content/voice (or pause) — don't automate a dead channel.

---

## 4. Positioning, Audience & Voice

- **Positioning:** *"Solo founder building a fitness-hardware startup by directing AI agents — here's the real workflow, wins and faceplants."* The agentic-founder meta-narrative is the hook (Q8); the `task.md → /rt → redactor` loop is itself legitimate content (recursively: AI redacting AI's work to publish it).
- **Primary audience:** AI/indie-builders (Q9). They engage with build-in-public and are reachable at $0. Treat X as reach + credibility, not direct backer acquisition. Lifters/backers are reached later via the lifter-framed landing page, Kickstarter, and fitness communities.
- **CTA:** soft "follow the build" (Q10). Occasionally point curious viewers to `ironpal.co`; accept most builders won't join the fitness list.
- **Voice rules:**
  - Honest over impressive. Lead with the struggle, not the win.
  - Specific over vague. Real numbers, real dead-ends, real artifacts.
  - Foreground the *directing-AI* craft, not just product milestones.
  - No hype words, no fake urgency.
  - **Honesty guardrails (non-negotiable, see §7).**

**Load-bearing assumption to watch:** measured success is reach/engagement, but the business goal is fitness backers. The bet is that pre-launch attention converts warm at Kickstarter. If after 4 weeks there are builder followers but zero fitness-backer signal, the Q4 gate triggers a real rethink — not "automate anyway."

---

## 5. Operating Model (Validation Phase — manual)

A lightweight weekly ritual, no pipeline:

1. **Curate (weekly).** From the week's `/rt` tasks + the `task.md` backlog, pick the 2 best stories (failures prioritized). Marketing/branding/journey tasks are fair game; raw ML-method tasks become outcomes-only or get skipped (Q2/Q7).
2. **Write.** Draft the post(s) — outcomes & journey only, first-person, struggle-led. Single post or short thread.
3. **Capture artifacts.** Prefer purpose-captured *clean* screenshots into a scratch dir (crop tight to the artifact). Raw terminal/error/montage shots are the point — but clean ones (Q11).
4. **Redact — human gate (fail closed).** Run every post and every image through the pre-publish checklist (§6). If anything is uncertain, abstract or cut. Nothing publishes that isn't clean.
5. **Post** on the fixed days (e.g. Tue + Fri). Space multiple approved posts apart.
6. **Engage.** Reply to every comment for the validation window. Tag any social-sourced `ironpal.co` signups.
7. **Preserve.** Save original + final text (and image references) to `feed/approved/` from post #1 — cheap insurance for a future archive/automation (Q13).

**Content format:**
> 🔧 Build log #NN
>
> [The struggle, in one honest line.]
>
> [What I had the AI try / what broke.]
>
> [What actually worked + one concrete detail or artifact.]
>
> Building IronPal — a headband camera that logs your lifts — by directing AI agents. Following along 👇

Threads for meatier tasks: hook → 2–4 detail tweets (with artifacts) → soft CTA.

---

## 6. Redaction Gate (manual now, automatable later)

Redaction is the safety-critical core. In the validation phase it is a **human gate**; the automated version (below) is built only post-validation.

### Text checklist — `denylist` (maintain as `denylist.yml` for the future script)
Strip or mask any of:

| Category | Examples in this repo |
|---|---|
| Credentials & keys | `credentials/`, `openai.key`, `.env`, `ssl.cert`, `ssl.key`, `.sudo_passwd`, any `sk-…` token |
| Infrastructure | server IP `45.55.36.33`, hostname `handlr-web`, SSH users, `/var/www/...` paths |
| Personal / private | founder's home username/paths (`/home/quirkfly`, `/home/peterd`), personal email, `~/Pictures` screenshots |
| Sibling projects | `../gitnfit`, `../handlr`, `../coolteen`, `../trolless` — never expose unrelated repos |
| Unreleased IP (the moat) | exact recognition prompts, KB excerpts (`docs/video-analysis-kb/`), sensor-fusion specifics, supplier/DFT-vendor details |
| Third-party IP risk | competitor screenshots (Fitbod), copyrighted reference media |

### Image checklist (Q12)
Every screenshot, before posting: no real paths, IPs, hostnames, keys, env vars, sibling-revealing filenames, or personal info visible. Prefer clean purpose-captured shots; blur/box anything sensitive; capture into a scratch dir rather than scrubbing messy shots after the fact.

**Fail closed:** anything uncertain is abstracted or cut. Rotate any key that ever appears.

---

## 7. Honesty Guardrails (enforced at the gate)

Per project memory and [`ironpal-landing-page-plan.md`](./ironpal-landing-page-plan.md), every post must respect:

1. **Weight-reading is the headline differentiator but is NOT validated/shipped.** Frame it as the hard problem being built / a vision being proven. Reps + exercise recognition (closer to working) carry the credibility; weight-reading carries the "why it matters."
2. **Privacy = accurate hybrid framing only.** Reps & exercise recognition run on-device (IMU, offline); **weight-reading uploads one frame to the cloud (OpenAI), then deletes it.** NEVER post "no cloud", "nothing leaves your device", or "faces blurred/never captured" — all untrue today.

These go verbatim into the eventual redactor system prompt and are on the human-gate checklist now.

---

## 8. Community & Engagement

- **Reply > broadcast.** The founder personally replies to every comment during validation. Early audiences reward presence.
- **Ask questions.** End some posts with a genuine one ("How would *you* read plate weight off a chest cam with no QR code?").
- **Document, don't sell.** The Kickstarter ask comes later; for now the job is trust + audience.
- **Owned asset bridge.** Every soft CTA points to `ironpal.co`; the email list remains the durable owned asset even though most X engagement is builders.

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Secret/credential leak** (incl. via screenshot) | Severe | Human gate: text denylist **+** per-image scrub checklist (§6). Fail closed. Rotate exposed keys. #1 priority. |
| **Revealing the moat** (recognition method) | High | Outcomes-only (Q2); abstract any method detail; KB/prompts never quoted. |
| **Over-claiming / dishonest hype** | High | Honesty guardrails (§7) on the gate checklist. |
| **Audience/goal mismatch** (builders vs. backers) | Medium | Accepted bet (Q9); Q4 gate forces a rethink if fitness signal is absent, not blind automation. |
| **Sibling-project / personal leakage** | Medium | Denylist on `../*` repos, home paths, personal contact. |
| **Third-party IP** (competitor imagery) | Medium | No competitor imagery; flag brand references. |
| **Solo-founder burnout / silence** | Medium | 2×/week fixed cadence, weekly batching, skip-don't-fabricate. |
| **Premature engineering** | Medium | Manual-first; pipeline/cards/video/archive all deferred behind Q4. |
| **Platform risk** (X rules/suspension) | Medium | Preserve originals in `feed/approved/`; email list is the durable owned asset; archive backfillable later. |

---

## 10. Timeline (checkbox-tracked)

### Phase 1 — Manual validation (Weeks 1–4)
- [ ] Reserve X handle (e.g. **@ironpal_co** or closest), bio + `ironpal.co` link, avatar/banner with a light teal touch
- [ ] First pass over `task.md`: shortlist the 10–15 most postable stories (failures prioritized)
- [ ] Draft the text **denylist** + the **image scrub checklist**
- [ ] Create `feed/approved/` to preserve originals + finals from post #1
- [ ] Write the first 4–5 posts (1–2 weeks of buffer) — outcomes-only, raw artifacts, scrubbed
- [ ] Post the inaugural thread: *"I'm building IronPal by directing AI agents — here's how, including the parts that broke"*
- [ ] Post 2×/week on fixed days; reply to every comment; tag social-sourced signups
- [ ] **Week 4: Q4 go/no-go** — engagement + signups real? → proceed to Phase 2. Else fix voice/content or pause.

### Phase 2 — Automate the proven parts (post-validation)
- [ ] `capture.py` — write a clean task + result-summary record per `/rt` run
- [ ] `redact.py` — regex/denylist pre-filter **+** capable-model rewrite (NOT the nano tier); emits drafts with `risk_flags`; never auto-posts
- [ ] Review queue (`feed/drafts/` → `feed/approved/`) with the human gate retained
- [ ] `publish_x.py` — post + cadence spacing + store permalink
- [ ] Optional: image-OCR denylist pre-check for screenshots
- [ ] Optional: branded **milestone/recap** cards (Stealth Teal — `#1A1A2E` / `#00E5CC` / `#F0F4F8`, reusing the site OG-card template)

### Phase 3 — Expand surface & owned assets (later)
- [ ] First Google Flow / Veo Short from a top story → YouTube Shorts (+ cross-post), per [`ai-video-generation-options.md`](./ai-video-generation-options.md) and [`founder-led-production-strategy.md`](./founder-led-production-strategy.md)
- [ ] `ironpal.co/log` owned archive (Astro route, existing deploy pipeline, droplet `45.55.36.33` / Cloudflare SSL) — backfilled from `feed/approved/`
- [ ] Multi-platform (IG/TikTok/Reddit); possible dedicated build-log newsletter

---

## 11. Tooling & Budget

| Need | Validation phase | Post-validation |
|---|---|---|
| Writing/redaction | Founder + Claude in-session; manual checklist | OpenAI capable model (key at `credentials/openai.key`) for `redact.py` |
| Pre-filter | The denylist as a checklist | Python regex + `denylist.yml` |
| Posting | Manual on X | X API v2 (`tweepy`/HTTP), free tier |
| Visuals | Clean screenshots, light teal touch | Optional Pillow/SVG milestone cards |
| Video | — | Google Flow (Veo) + CapCut/DaVinci |
| Archive | — | Astro `/log` route, existing deploy pipeline |
| Storage | `feed/approved/` (git-ignore anything raw with secrets) | `feed/{raw,drafts,approved,video-queue}/` |

**Budget:** ~$0 ongoing (LLM calls negligible; X basic free; Veo on existing AI credits). No new SaaS for Phase 1.

---

## 12. First Concrete Step

Reserve the X handle, shortlist the 10–15 best `task.md` stories, draft the denylist + image checklist, then write and gate the inaugural agentic-founder thread. The distribution-channel plan itself (this doc) is a fittingly meta first build-log once it passes the gate.

---

*Cross-references: [`ironpal-distribution-channel-plan_grilled.md`](./ironpal-distribution-channel-plan_grilled.md) · [`color-schemes.md`](./color-schemes.md) · [`ironpal-landing-page-plan.md`](./ironpal-landing-page-plan.md) · [`ai-video-generation-options.md`](./ai-video-generation-options.md) · [`founder-led-production-strategy.md`](./founder-led-production-strategy.md) · [`competitive-landscape.md`](./competitive-landscape.md)*
