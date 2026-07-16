# IronPal — Social-Media Automation Plan

**Purpose:** Automate the "redacted `task.md` → published X post" pipeline once the channel is validated.
**Status:** Phase 2 blueprint — **gated behind the Q4 validation gate** in the distribution plan (do not build before the manual channel proves out).
**Owner:** Solo founder
**Last updated:** 2026-06-29
**Parents:** [`ironpal-distribution-channel-plan.md`](./ironpal-distribution-channel-plan.md) · decisions log [`ironpal-distribution-channel-plan_grilled.md`](./ironpal-distribution-channel-plan_grilled.md) · current manual batch [`ironpal-twitter-posts.md`](./ironpal-twitter-posts.md)

---

## 0. Read this first — what automation does and does NOT change

The grilling settled that this is **manual-first** (Q3) and only automated **after ~4 weeks / 15–20 posts show real engagement + signups** (Q4). This document is the build spec for *that* phase. It does **not** authorize building now.

**Automation reduces toil, not judgment.** Three things stay human, forever:

1. **The redaction approval gate** (Q12 / fail-closed). A bot may *draft* and *queue*; a human *approves* before anything publishes. Never wire the redactor straight to the publisher.
2. **The honesty guardrails** (§7 of the parent plan): weight-reading = hard problem *being proven*, not shipped; privacy = hybrid (on-device reps/exercise + one deleted cloud frame). Never "no cloud / faces blurred / works today."
3. **Outcomes-only** (Q2): no prompts, KB, or recognition method ever leaves the building.

Everything else — capture, pre-filtering, drafting, scheduling, posting, metrics collection — is fair game to automate.

---

## 1. Design principles

- **Mirror the existing stack.** Build in **Python**, matching `scripts/video-gen/` exactly: a `pipeline.py` orchestrator, a `clients/` abstraction per external service, a `config.yaml`, `requirements.txt`, and a `logs/` dir. A new contributor (or the founder in six months) should find it identical in shape.
- **Fail closed.** Any uncertainty in redaction → quarantine, never publish. A deterministic denylist runs *before* the LLM and can veto on its own.
- **$0 ongoing.** X API Free tier for posting; native X Analytics + Cloudflare Web Analytics (already on Cloudflare for `ironpal.co`) for metrics. Paid tiers are explicitly optional and traction-gated.
- **Human-in-the-loop, low-friction.** The founder's only recurring action is a fast approve/edit/kill pass — ideally from the phone.
- **Idempotent + resumable.** Like the video-gen pipeline: every item has a stable id and a state; re-running never double-posts.

---

## 2. Target architecture

```
 task.md (last block) ┐
                      ├─► [1] capture.py ─► feed/raw/<id>.json   (task + result summary + artifacts)
 /rt result summary   ┘                          │
                                                 ▼
                              [2] redact.py  (denylist pre-filter → LLM rewrite)
                                   emits feed/drafts/<id>.json  {post, thread, image_plan, risk_flags}
                                                 │
                                                 ▼
                              [3] review  (human gate: approve / edit / kill)
                                   approved → feed/scheduled/<id>.json  {…, scheduled_at}
                                                 │
                                                 ▼
              [4] publish_x.py  (runs on schedule; posts items whose scheduled_at is due)
                  └─ uses clients/x_client.py  → feed/published/<id>.json {tweet_id, permalink, posted_at}
                                                 │
                                                 ▼
              [5] metrics.py  (pulls performance, writes feed/metrics/<id>.json + rollup)
```

### Directory layout (extends the existing `feed/`)
```
feed/
  raw/         # captured task+result (git-ignored — may contain secrets pre-redaction)
  drafts/      # redactor output awaiting human gate
  scheduled/   # approved + timestamped, queued to post
  published/   # posted, with tweet_id + permalink (the durable archive source, Q13)
  metrics/     # per-post performance snapshots + rollups
  batch1/      # the existing manual batch (images already here)
scripts/social/
  pipeline.py        # orchestrator (capture→redact, and the publish/metrics jobs)
  capture.py
  redact.py
  publish_x.py
  metrics.py
  card.py            # optional milestone card renderer (reuses ImageMagick like batch1)
  clients/
    x_client.py      # X API v2 wrapper (post, thread, media upload, read metrics)
    openai_client.py # redactor LLM (credentials/openai.key)
  config.yaml        # cadence, slots, model, denylist path, account handle
  denylist.yml       # literal strings + regex (the deterministic pre-filter)
  requirements.txt   # tweepy / httpx, openai, pyyaml, pillow
  logs/
```
> `feed/raw/` and any secret-bearing file must be in `.gitignore`. Only `feed/published/` (already redacted) is safe to commit.

---

## 3. Component detail

### [1] `capture.py`
- Input: the last block of `task.md` (same parse rule as `/rt`) + a result summary.
- The result summary comes from the founder's normal `/rt` close-out (the 1–2 line "what changed" + artifact list) — written to `feed/raw/<id>.json`. Start with this **Option A** (lowest leak surface); a transcript-scrape Option B stays deferred.
- Stamps a stable `id` (e.g. `YYYYMMDD-NN`) and records candidate artifacts (file paths) for later image selection.

### [2] `redact.py` — the safety-critical core
Two passes, **deterministic first**:

1. **Denylist pre-filter (`denylist.yml`).** Literal + regex match over the raw text. Must catch: keys/tokens (`sk-…`, anything under `credentials/`, `.env`, `ssl.*`, `.sudo_passwd`), infra (`45.55.36.33`, `handlr-web`, `/var/www/...`), home paths (`/home/quirkfly`, `/home/peterd`), sibling repos (`../gitnfit`, `../handlr`, `../coolteen`, `../trolless`), personal contact, and moat material (exact prompts, `docs/video-analysis-kb/`). A hit the LLM later fails to also remove → **quarantine** (do not auto-promote to drafts).
2. **LLM rewrite (capable model, NOT nano — per grilling).** Via `clients/openai_client.py` using `credentials/openai.key`. System prompt hard-codes the honesty guardrails (§0) and the outcomes-only rule. **Structured output** (JSON schema) → `{ headline, post, thread[], image_plan[], hashtags[], risk_flags[] }`. `risk_flags` (e.g. `mentions_weight_reading`, `mentions_privacy`, `near_method`, `unverified_image`) force a mandatory human read.

Output never posts. It lands in `feed/drafts/`.

### [3] Review — the human gate (keep it, automate around it)
- v1: file-based — founder reads `feed/drafts/<id>.json`, edits inline, then runs `pipeline.py approve <id> --slot tue` (moves to `feed/scheduled/` with a `scheduled_at`).
- v2 (optional, if friction is real): a tiny phone-friendly web view (single page listing drafts with ✅/✏️/🗑️). Build only if the file flow proves annoying.
- Images: every attached image passes the **scrub checklist** (Q12) here — no paths/IPs/keys/faces/readable plate numbers. The redactor flags `unverified_image`; the human clears it.

### [4] `publish_x.py` + `clients/x_client.py`
- Reads `feed/scheduled/`, posts any item whose `scheduled_at ≤ now`, writes `feed/published/<id>.json` with `tweet_id` + permalink.
- Handles single posts, **threads** (reply-chains), and **media upload** (up to 4 images / 1 video; alt text from `image_plan`).
- **Cadence spacing** enforced here (Q5: 2×/week, fixed slots) — even if several items are approved, they post on schedule, not in a dump.
- Idempotency: an item with a `tweet_id` is never re-posted. Respects rate limits with backoff.

### [5] `metrics.py`
- Pulls per-post performance into `feed/metrics/` and maintains a rollup (see §6). On Free tier this is mostly native-dashboard-assisted (see §6 on API read limits).

### Scheduling the jobs
- **Recommended: GitHub Actions cron** (free) — one workflow posts due items (every ~15 min), one pulls metrics daily. Secrets live in GitHub Actions secrets (mirrors `.env`). No always-on server needed; the `ironpal.co` droplet stays static-only.
- Alternatives: local `cron`, or the Claude Code `schedule` / `loop` skills for a founder-driven cadence.
- The capture→redact step runs on demand (after a `/rt` task), not on a timer.

---

## 4. Creating & linking the X account (step by step)

### 4.1 Create the brand handle
1. Sign up at x.com with a **dedicated brand email** (e.g. `social@ironpal.co` or an alias) — *not* the founder's personal login. This keeps ownership clean and delegation possible.
2. Handle: **@ironpal_co** (fallbacks: `@ironpalhq`, `@getironpal`). Reserve early even if posting starts later.
3. Profile, on-brand (consistent visual style, §5):
   - Display name: `IronPal`
   - Avatar: **`post/assets/IronPal_avatar_x_v01.png`** (teal mark on charcoal `#1A1A2E` with a teal accent ring — built for X's circular crop and dark UI; do NOT use the bare transparent mark, which flattens to an ugly white disc). Banner: the lockup on Stealth-Teal (`#1A1A2E` / `#00E5CC`).
   - Bio (builder + honest framing): *"Building a headband camera that logs your lifts automatically — by directing AI agents. Real build log, wins & faceplants. Not shipping yet."*
   - Link: **https://ironpal.co** ; location/launch as relevant.
4. Turn on 2FATP (authenticator app) and store recovery codes in the password manager.

### 4.2 Developer access + API app (for the automation)
1. Apply for a developer account at **developer.x.com** using the brand account.
2. Create a **Project → App** ("ironpal-social-bot").
3. Set **User authentication** to **OAuth 1.0a, Read and Write** (write scope is required to post; OAuth 1.0a user-context is the simplest path for posting as the account). Generate **API Key/Secret** + **Access Token/Secret** for the @ironpal_co user.
4. Store credentials the repo way — add to `.env` (names only shown):
   ```
   X_API_KEY=…
   X_API_SECRET=…
   X_ACCESS_TOKEN=…
   X_ACCESS_TOKEN_SECRET=…
   X_BEARER_TOKEN=…        # app-only, for read/metrics endpoints
   ```
   Mirror the same keys into **GitHub Actions secrets** for the scheduled jobs. Never commit `.env`.
5. **Know the tier limits (verify current values at the time of build — they change):**
   - **Free:** write-only, ~**1,500 posts/month** at user level, **very limited reads (~100/month)**, 1 app. Enough for 2×/week posting; **not** enough for rich programmatic analytics.
   - **Basic (~$100/mo):** higher write + meaningful reads — only if traction justifies it (post-Q4).
   - Design `metrics.py` to degrade gracefully: full API reads if available, else native-dashboard CSV import (§6).

### 4.3 Link to the automation workflow
- `clients/x_client.py` loads the tokens from env and exposes `post()`, `post_thread()`, `upload_media()`, `get_post_metrics()`.
- A one-time `pipeline.py auth-check` verifies the tokens post to a private test (or to a throwaway draft) before go-live.

### 4.4 Link to the founder's personal account (management + amplification)
Two distinct needs — cover both:

- **Oversight / management access** (so the founder controls the brand account without sharing the raw password):
  - Use **X account delegation** — Settings → *Delegate* / *Manage members* (available via **X Pro**). Add the founder's personal account as a delegate/admin of @ironpal_co. The founder can then post/moderate as the brand from their own login, and revoke access cleanly if needed.
  - If delegation isn't available on the chosen plan, fall back to a shared login in the password manager (1Password/Bitwarden) with 2FA — less clean, still workable solo.
- **Amplification** (the founder *is* the named, visible builder — Q1/Q8):
  - From the personal account, **quote-tweet or reply-boost** each brand post with a first-person aside ("spent all day on this one 👇"). This is the single biggest free reach lever for a small brand account — the human account carries the personality the algorithm and audience reward.
  - Pin the inaugural brand thread on *both* accounts; cross-link bios.
  - Keep the split clear: brand account = the build log; personal account = the founder's voice amplifying it. Don't duplicate content.

---

## 5. Consistent visual style & messaging

Codify the parent plan's rules into `config.yaml` and the redactor prompt so every automated draft is on-brand by default:

- **Palette:** Stealth Teal — `#1A1A2E` background, `#00E5CC` accent, `#F0F4F8` headings (per [`color-schemes.md`](./color-schemes.md)). Used in avatar/banner, milestone cards, any text overlay.
- **Visuals (Q11):** raw artifacts first (real screenshots, montages, sensor plots), light brand touch. Polished cards (`card.py`) reserved for milestone/recap posts only.
- **Voice:** honest, technical, anti-hype, struggle-led, first-person; foreground the *directing-AI* craft. No hype words, no fake urgency. Encoded as explicit do/don't lists in the redactor system prompt.
- **Post templates:** the "🔧 Build log #NN" single + thread formats from `ironpal-twitter-posts.md`, stored as templates the redactor fills.
- **CTA:** soft "follow the build" (Q10); occasional `ironpal.co` link, never a hard sell.
- **Alt text always** (accessibility + reach), generated in `image_plan`.

---

## 6. Monitoring & analytics

### Metrics that matter (mapped to the Q4 gate)
| Metric | Definition | Source | Why |
|---|---|---|---|
| **Engagement rate** | (likes+replies+reposts+bookmarks) ÷ impressions | X Analytics / API | The real signal (Q4 weights replies/saves/reposts over likes) |
| **Reply / save ratio** | replies+bookmarks ÷ impressions | X Analytics | Distinguishes "interesting" from "scrolled past" |
| **Click-through rate (CTR)** | link clicks ÷ impressions | X post analytics + Cloudflare/UTM | Did the soft CTA work |
| **Follower growth** | net new follows / week, and per-post spikes | X Analytics | Audience building |
| **Signups attributed to social** | `ironpal.co` signups tagged `source=social` | Cloudflare Web Analytics + form `utm_source` | The conversion bridge (Q9/Q10) |

### Tooling (free-first)
- **Native X Analytics** (analytics.x.com) — free, gives impressions, engagements, link clicks per post. Primary source on Free API tier. `metrics.py` can ingest the exportable CSV when API reads are capped.
- **Cloudflare Web Analytics** — free, already available for `ironpal.co` (Cloudflare-fronted). Tracks referral traffic + (with UTM) which posts drive signups. No extra cost, privacy-friendly.
- **UTM tagging** — every `ironpal.co` link from social carries `?utm_source=x&utm_medium=social&utm_campaign=buildlog&utm_content=<post_id>` so clicks map back to specific posts.
- **Optional later:** Basic API tier ($100/mo) for programmatic reads, or a lightweight self-hosted dashboard reading `feed/metrics/` — only if the channel is clearly working.

### Rollup
`metrics.py` writes a weekly `feed/metrics/rollup-<week>.json` and a human-readable summary (top/bottom posts, deltas) so the optimization loop (§8) has data.

---

## 7. Challenges & mitigations

| Challenge | Impact | Mitigation |
|---|---|---|
| **Auto-posting a leaked secret** | Severe | Human gate never removed; denylist pre-filter + LLM + per-image scrub; fail-closed quarantine. Rotate any exposed key. |
| **LLM over-redacts or hallucinates a claim** | Medium | Structured output + `risk_flags` force human read; founder edits in the gate; honesty rules in system prompt. |
| **X API Free-tier read limits** block analytics | Medium | Degrade to native X Analytics CSV + Cloudflare; upgrade to Basic only post-traction. |
| **Rate limits / posting errors** | Low–med | Backoff + idempotent `tweet_id` guard; alert (log + optional push) on failure, never silent. |
| **Account suspension / platform risk** | Medium | `feed/published/` is the durable archive (Q13 backfill); email list is the owned asset; don't violate automation/spam rules (no aggressive auto-follow/DM). |
| **X automation-policy compliance** | Medium | Only automate *own-content posting*; no bulk engagement automation; disclose the build is AI-directed (Q8) — transparency is on-brand and policy-safe. |
| **CTR tracking unreliable** (shorteners, app webviews) | Low | UTM + Cloudflare server-side referral; treat CTR as directional, not exact. |
| **Founder bandwidth** | Medium | Automation removes capture/format/post toil; the gate is a 5-min phone pass; 2×/week cadence (Q5). |
| **Premature build** | Medium | This whole plan is gated on Q4; build nothing until the manual channel earns it. |

---

## 8. Ongoing optimization loop

- **Weekly (15 min):** read the `metrics.py` rollup. Note the best/worst post and *why* (topic, format, image type, hook). Feed one concrete lesson back into the redactor prompt or templates.
- **Light A/B:** vary one variable at a time (hook style, thread vs single, raw-artifact vs card, posting time). Let the slot stay fixed (Q5) but rotate the variable.
- **Denylist hardening:** every near-miss in the gate becomes a new `denylist.yml` rule — the filter gets stronger over time.
- **Content scoring:** tag each post's theme (failure / hard-problem / meta / win); track which themes drive engagement + signups and weight future curation toward winners (the failures are expected to over-perform).
- **Monthly:** re-assess the Q9 bet — are builder followers translating to *any* fitness-backer signal? If not, revisit positioning, not just tactics.
- **Expansion trigger:** only after X is humming, extend to YouTube Shorts (Veo) and an `ironpal.co/log` archive (parent plan Phase 3), reusing `feed/published/` as the source.

---

## 9. Implementation roadmap (checkbox-tracked) — *after Q4 go*

### Stage A — Account & access (Week 1)
- [ ] Create @ironpal_co with brand email + 2FA; set avatar/banner/bio/link (§4.1)
- [ ] Developer account + app, OAuth 1.0a Read+Write tokens; store in `.env` + GitHub secrets (§4.2)
- [ ] Delegate the founder's personal account for oversight; cross-link bios (§4.4)
- [ ] `pipeline.py auth-check` passes

### Stage B — Pipeline core (Weeks 1–2)
- [ ] `scripts/social/` scaffold mirroring `scripts/video-gen/` (config.yaml, clients/, requirements.txt, logs/)
- [ ] `capture.py` → `feed/raw/`
- [ ] `redact.py`: `denylist.yml` pre-filter + OpenAI structured rewrite + risk_flags
- [ ] File-based review gate (`approve/edit/kill`) → `feed/scheduled/`
- [ ] `publish_x.py` + `clients/x_client.py`: single, thread, media, alt text, spacing, idempotency
- [ ] `.gitignore` for `feed/raw/` and secrets

### Stage C — Schedule & measure (Weeks 2–3)
- [ ] GitHub Actions: post-due-items (15 min) + daily metrics
- [ ] `metrics.py` + UTM links + Cloudflare Web Analytics on `ironpal.co`
- [ ] Weekly rollup output
- [ ] Migrate the manual `feed/batch1/` history into the pipeline format

### Stage D — Optimize & (later) expand
- [ ] Weekly optimization loop running (§8)
- [ ] Optional phone review UI if file flow is annoying
- [ ] Trigger Phase 3 (YouTube/Veo, `/log` archive) only when X is validated

---

## 10. Tooling & budget

| Need | Choice | Cost |
|---|---|---|
| Language/stack | Python, mirroring `scripts/video-gen/` | $0 |
| Redaction LLM | OpenAI capable model (`credentials/openai.key`) | ~$0 (a few calls/week) |
| Posting | X API Free tier (OAuth 1.0a) | $0 |
| Scheduling | GitHub Actions cron | $0 |
| Post analytics | Native X Analytics (+ CSV import) | $0 |
| Web/conversion analytics | Cloudflare Web Analytics (already on Cloudflare) | $0 |
| Image prep | ImageMagick (`convert`) — same as `feed/batch1/` | $0 |
| Optional upgrades | X API Basic ($100/mo), self-hosted dashboard | traction-gated |

**Total to launch automation: ~$0/month.** Paid tiers are deliberately optional and only justified by demonstrated traction.

---

*Cross-references: [`ironpal-distribution-channel-plan.md`](./ironpal-distribution-channel-plan.md) · [`ironpal-distribution-channel-plan_grilled.md`](./ironpal-distribution-channel-plan_grilled.md) · [`ironpal-twitter-posts.md`](./ironpal-twitter-posts.md) · [`color-schemes.md`](./color-schemes.md)*
