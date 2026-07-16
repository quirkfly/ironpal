# IronPal Distribution Channel Plan — Grilled Decisions

Resolved decisions from stress-testing [`ironpal-distribution-channel-plan.md`](./ironpal-distribution-channel-plan.md).

**Date:** 2026-06-28

---

## Q1 — Founder identity on the channel

**Decision:** **Named & visible founder.** Post as yourself — real name, face, first person.

**Rationale:** Build-in-public rewards a human face (people follow people, not logos); already consistent with the founder-on-camera commitment in project memory and the Kickstarter strategy. The redactor strips *secrets*, not the founder's identity.

**Implications:**
- Redactor does NOT redact the founder's name/face/voice — only credentials, infra, sibling projects, personal contact details, and unreleased IP.
- The decision is hard to reverse, so it's settled up front.

---

## Q2 — How much technical method to expose

**Decision:** **Outcomes & journey only.** Share what was tried, what broke, how it felt, and results — never verbatim prompts, exact disambiguation logic, or sensor-fusion specifics.

**Rationale:** The recognition method is the moat on the one hard problem competitors haven't solved. The struggle/journey is plenty compelling on its own.

**Implications:**
- Redactor (and the manual writing process) errs aggressive: when unsure whether something reveals method, abstract it to an outcome.
- The KB (`docs/video-analysis-kb/`), exact prompts, and recognition logic are treated as secret IP — never quoted.

---

## Q3 — Build sequencing

**Decision:** **Manual-first, automate later.** Weeks 1–2: hand-write 5–10 redacted posts from existing `task.md` history (with Claude in-session) and post them manually. Only build the capture/redactor/publisher scripts once the feed demonstrably lands.

**Rationale:** Avoids over-engineering a publishing pipeline before knowing anyone cares; keeps focus on POC v1; fastest path to first audience signal. The redactor is also easier to tune after real posting reps.

**Implications:**
- The §10 timeline is re-scoped: Phase 1 becomes "manual posting + validation," and the automation phases (capture/redact/publish/cards/video/archive) move *after* a go/no-go gate.
- This requires a defined validation criterion (see Q4).

---

## Q4 — Validation gate (go/no-go for automation)

**Decision:** **Engagement + signups over ~4 weeks.** After ~4 weeks / ~15–20 manual posts, build the automated pipeline only if there's *real* engagement (replies/saves/reshares, not just likes) AND a handful of email signups attributable to social. If it's crickets, fix content/voice before blaming the lack of automation.

**Rationale:** Tangible, time-boxed, founder-controllable. Avoids both premature automation and indefinite manual grind. Follower count alone is a vanity metric.

**Implications:**
- Track per-post engagement and tag social-sourced signups on `ironpal.co` (the landing strategy already plans a `source` tag).
- A genuinely dead channel after 4 weeks is allowed to be killed/paused, not force-automated.

---

## Q5 — Cadence

**Decision:** **2×/week on fixed days** (e.g. Tue + Fri), batch-written weekly.

**Rationale:** Sustainable solo mid-POC; consistency over months beats a high-volume burst followed by silence. Fixed days build an audience habit.

**Implications:**
- Weekly batching ritual: pick the 2 best tasks of the week, write + redact both in one sitting.
- A heavy POC week still only owes 2 posts — protects the streak.

---

## Q6 — Platform focus

**Decision:** **X (Twitter) only, master it first.** Defer IG/TikTok/Reddit/YouTube until the channel is proven, then expand from banked content.

**Rationale:** X is the natural home for technical build-in-public; threads fit the content; one platform = one voice to learn. Cross-posting prematurely splits thin solo effort across formats that each want something different.

**Implications:**
- YouTube/Veo video phase moves explicitly *after* the X channel is validated (Q4).
- One handle, one voice, one analytics surface to learn from.

---

## Q7 — Content source & curation

**Decision:** **Mine the backlog + curate forward.** Seed the first weeks from the best existing `task.md` stories (especially the failures — floating logo, kitchen shoot, exercise-recognition grilling), then add new tasks as they happen. Not every task ships; raw POC-method tasks become outcome-only posts or get skipped.

**Rationale:** Instant backlog of proven-interesting content + ongoing freshness. The documented failures are some of the strongest material.

**Implications:**
- A first pass over `task.md` to shortlist the 10–15 most postable stories.
- Curation rule: marketing/branding/journey tasks are fair game; ML-method tasks are outcome-only or skipped (per Q2).

---

## Q8 — AI-agentic workflow disclosure

**Decision:** **Make it the hook, fully transparent.** Position as: *"Solo founder building a fitness-hardware startup by directing AI agents — here's the real workflow, wins and faceplants."* The agentic-founder meta-narrative is the channel's distinct angle.

**Rationale:** A timely, differentiated angle that compounds two audiences; transparency pre-empts any "gotcha"; the honest failures prove the founder is steering, not just pressing go. Forfeiting it (or hiding it while publishing redacted versions of that exact workflow) would be both less compelling and a credibility risk.

**Implications:**
- The `task.md → /rt → redactor` workflow itself becomes legitimate content (recursively: AI redacting AI's work to publish it).
- Voice foregrounds the "directing AI" craft, not just product milestones.

---

## Q9 — Primary audience for the X channel

**Decision:** **AI-builders primary; accept the mismatch with the lifter/backer target.** Treat X as top-of-funnel for reach, credibility, and email signups — NOT direct backer acquisition. Lifters/backers are reached later via the lifter-framed landing page, Kickstarter, and fitness communities.

**Rationale:** Build-in-public on X realistically reaches founders/AI-builders; that's who engages and who's reachable at $0. Each channel does what it's good at rather than forcing a fitness audience onto a builder platform.

**Implications:**
- Success metrics weight reach/credibility/list-growth over fitness-backer intent.
- Creates an open question about what a builder audience actually converts *into* (see Q10).

---

## Q10 — Primary call-to-action / conversion goal

**Decision:** **"Follow the build," soft CTA.** Grow an engaged following and credibility now; don't hard-sell. Occasionally point curious viewers to `ironpal.co`, but accept most builders won't join the fitness list. Pre-launch, attention + a body of proof is the asset; backing comes at Kickstarter via warm reach.

**Rationale:** Lowest friction, honest, and fits a builder audience that dislikes being funneled. Hard-pushing a fitness email list to builders would convert poorly and feel off-key.

**Implications:**
- Don't over-optimize the fitness email funnel on X; measure followers + engagement as the leading indicators.
- Revisit a dedicated build-log newsletter only if/after the channel is validated (Q4).

---

## Q11 — Post visual treatment

**Decision:** **Raw artifacts, light brand touch.** Lead with real screenshots — the actual terminal, the broken AI image, the floating logo, the sensor plot, the frame montages. Minimal brand presence (consistent handle/avatar, occasional teal accent); reserve polished cards for milestone/recap posts only.

**Rationale:** Builders trust raw artifacts over polished marketing cards; the real failure screenshots *are* the story; far lower per-post effort, fitting the 2×/week budget.

**Implications:**
- No per-post `card.py` requirement; cards become optional/milestone-only.
- Introduces a screenshot leak vector handled in Q12.

---

## Q12 — Screenshot/visual leak prevention

**Decision:** **Manual scrub + checklist on every image.** Mandatory human review of each screenshot before posting against a fixed checklist (no real paths, IPs, hostnames, keys, env, sibling-revealing filenames, personal info). Prefer purpose-captured clean shots: crop tight, use a scratch dir, blur/box anything sensitive. Optional image-OCR denylist pre-check can be added later.

**Rationale:** The text redactor can't see inside images; raw artifacts (Q11) are the main leak risk. A cheap, reliable human gate fits manual-first; OCR automation is deferred with the rest of the pipeline (Q3).

**Implications:**
- The image checklist lives alongside the text `denylist.yml` and is part of the pre-publish gate.
- Capture clean screenshots into a scratch dir rather than scrubbing messy ones after the fact.

---

## Q13 — Owned archive vs. X-only

**Decision:** **Defer the owned archive until validated.** Rely on X alone during the manual-first window; build `ironpal.co/log` only after the channel proves out (Q4). Keep all originals in `feed/approved/` so an archive can be backfilled later with zero loss.

**Rationale:** A `/log` page now is exactly the premature pipeline work deferred in Q3. The existing landing page is the current owned asset; the archive becomes worth its build cost only once there's proven, SEO-able content volume.

**Implications:**
- Preserve every published post's original + final text in `feed/approved/` from day one (cheap insurance).
- Platform-risk hedge is "keep the source files," not "build the page yet."

---

# Synthesis — Revised Approach (supersedes the original plan's phasing)

The grilling converged the plan from "build a full automated publishing pipeline" to **"validate a manual build-in-public channel first, automate only what earns it."** Net shape:

**Positioning:** A *named, visible solo founder* building a fitness-hardware startup **by directing AI agents** (`task.md → /rt`), shown honestly — wins and faceplants. The agentic-founder angle is the hook; the audience is realistically **AI/indie-builders**, with X as a top-of-funnel for reach and credibility (not direct backer acquisition).

**Content:** Curated from the existing `task.md` backlog (failures first) + new tasks going forward. **Outcomes & journey only** — the ML recognition method stays private. **Raw artifact screenshots**, light brand touch, not polished cards.

**Operations:** **X only**, **2×/week on fixed days**, **manually** for ~4 weeks. **Soft "follow the build" CTA.** Every text post and every image passes a **human redaction gate** (text denylist + per-image scrub checklist). Fail closed.

**Gate (Q4):** After ~4 weeks / ~15–20 posts → build automation (capture → redactor → publisher) **iff** real engagement + social-sourced signups appear. Otherwise fix content/voice or pause. YouTube/Veo video, branded cards, and `ironpal.co/log` are all **post-validation**.

**Unchanged from the original plan:** honesty guardrails (weight-reading = unvalidated/being-proven; privacy = hybrid, never "no cloud"); the redactor's eventual denylist scope (keys, IP `45.55.36.33`, `handlr-web`, home paths, sibling repos `../gitnfit`/`../handlr`/`../trolless`, personal info, competitor IP); the email list as the durable owned asset.

## Immediate next actions (Week 1–2, manual)
- [ ] Reserve X handle (e.g. **@ironpal_co** or closest), bio + `ironpal.co` link, avatar/banner with a light teal touch.
- [ ] First pass over `task.md`: shortlist the 10–15 most postable stories (failures prioritized).
- [ ] Draft the text **denylist** + the **image scrub checklist** (used by the human gate even in manual mode).
- [ ] Write the first 4–5 posts (1–2 weeks of buffer) — outcomes-only, raw artifact screenshots, scrubbed.
- [ ] Post the inaugural "I'm building IronPal by directing AI agents — here's how, including the parts that broke" thread.
- [ ] Reply to every comment; tag any social-sourced `ironpal.co` signups.
- [ ] Keep originals + finals in `feed/approved/` from post #1.

## Open items deliberately deferred (not unresolved — scheduled post-validation)
- Automated pipeline (`capture.py`, `redact.py`, review queue, `publish_x.py`).
- Optional image-OCR denylist pre-check.
- Branded milestone cards.
- Google Flow / Veo YouTube Shorts.
- `ironpal.co/log` owned archive.
- Multi-platform expansion (IG/TikTok/Reddit) and a possible dedicated build-log newsletter.
