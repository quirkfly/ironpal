# IronPal — Kickstarter Campaign Launch Execution Plan

**Owner:** Solo Founder (all tasks)
**Product:** IronPal — Body-mounted AI camera that automatically logs gym workouts
**Campaign Goal:** Launch a 30-day Kickstarter campaign with a funding target of $25,000-$50,000
**Target Launch Date:** TBD (fill in once timeline starts — plan assumes ~8 weeks from start to launch day)

> **How to use this document:** Check off each task as you complete it. Tasks are ordered by dependency — work top to bottom within each phase. Some tasks within a phase can be done in parallel (noted where applicable). Estimated durations assume solo founder working full-time on campaign prep.

---

## Overview & Timeline

| Phase | Duration | Calendar Weeks | Status |
|---|---|---|---|
| Phase 0: Logo Finalization | 2-3 days | Week 1 | Not started |
| Phase 1: Marketing Asset Generation | 5-7 days | Week 1-2 | Not started |
| Phase 2: Video Production | 18 days | Week 2-5 | Not started |
| Phase 3: Kickstarter Page Build | 5-7 days | Week 5-6 | Not started |
| Phase 3.5: Domain, Website & Deployment | 5-7 days | Week 3-5 (overlaps Phase 2) | Not started |
| Phase 4: Pre-Launch & Audience Building | 10-14 days | Week 4-7 (overlaps Phase 2-3) | Not started |
| Phase 5: Launch Week | 7 days | Week 8 | Not started |
| Phase 6: Campaign Management | 30 days | Week 8-12 | Not started |
| Phase 7: Post-Campaign & Fulfillment Planning | Ongoing | Week 12+ | Not started |

**Total pre-launch effort:** ~7-8 weeks of focused work, then 4-5 weeks of active campaign management.

---

## Existing Assets Inventory

Before starting, confirm you have these completed deliverables ready to use:

- [ ] **Iron Ring logo (v4 generated)** — `input/images/logo/v4/` (3 variants: icon only, horizontal lockup, stacked lockup)
- [ ] **Color scheme specification** — `docs/color-schemes.md` (Stealth Teal, Iron & Ember, Arctic Pulse)
- [ ] **Logo design specification** — `docs/logo-design-concepts.md` (Iron Ring full spec, usage guidelines, color application table)
- [ ] **Marketing image prompts (Leonardo AI)** — `docs/body-mounted-image-prompts-updated.md` (14 prompts with per-prompt Leonardo AI settings)
- [ ] **Video concept scripts** — `docs/body-mounted-video-prompts.md` (3 selected: #2 Hero, #3 Proof, #6 Data)
- [ ] **Video production execution plan** — `docs/video-production-execution-plan.md` (18-day timeline, shot lists, tool stack)
- [ ] **Technical documentation** — `docs/Challenges_and_Solutions_BodyMounted.md` (exercise recognition, weight detection, hardware options)

---

## Phase 0: Logo Finalization (Days 1-3)

> **Goal:** Produce production-ready vector logo files from the v4 AI-generated references.

### Vector Production

- [ ] Open Figma or Adobe Illustrator and create a new file: `IronPal Brand Assets`
- [ ] **Trace the Iron Ring icon** from `input/images/logo/v4/Geometric teal circle on navy.png`:
  - [ ] Bold circular ring, stroke weight ~15% of diameter
  - [ ] Clean gap at 6 o'clock position (~60° arc)
  - [ ] Solid filled circle at 12 o'clock (lens dot, ~12% of ring diameter)
  - [ ] Set color to exactly `#00E5CC` (Electric Teal)
- [ ] **Build the wordmark** "IRONPAL" in Montserrat Bold (or Archivo Black), all caps, +50 tracking, Ice White `#F0F4F8`
- [ ] **Create all lockup arrangements:**
  - [ ] Horizontal lockup (icon left + wordmark right) — reference: `Minimalist IRONPAL logo design.png`
  - [ ] Stacked lockup (icon above + wordmark below) — reference: `Minimalist iron-inspired logo design.png`
  - [ ] Icon only (ring mark alone) — reference: `Geometric teal circle on navy.png`
- [ ] **Create color variants** per `docs/logo-design-concepts.md` Color Application table:
  - [ ] Stealth Teal: teal icon + white wordmark on `#1A1A2E`
  - [ ] Iron & Ember: teal icon + warm white `#FAF0E6` wordmark on `#121212`
  - [ ] Arctic Pulse: deep teal `#0A9C8E` icon + near black `#1A1A2E` wordmark on `#F7F8FC`
  - [ ] Monochrome white (for engraving/single-color)
  - [ ] Monochrome black (for light surface print)
- [ ] **Export all variants:**
  - [ ] SVG (vector, primary format)
  - [ ] PNG at 1x, 2x, 4x with transparent background
  - [ ] PNG at 1x, 2x, 4x on each color scheme background
  - [ ] Favicon ICO at 16px, 32px, 180px (icon only)
- [ ] Save exports to `output/brand-assets/logo/`

### Quality Check

- [ ] Verify teal is exactly `#00E5CC` across all files (not drifted to cyan/mint)
- [ ] Test icon-only mark at 16px — confirm it's recognizable
- [ ] Test horizontal lockup at 400px+ — confirm it reads cleanly
- [ ] Compare vector output against v4 AI references for compositional accuracy

**Estimated time:** 2-3 days
**Tools needed:** Figma (free) or Adobe Illustrator ($23/mo)
**Output:** Production-ready logo files in all formats and color schemes

---

## Phase 1: Marketing Asset Generation (Days 3-10)

> **Goal:** Generate all 14 marketing illustrations using Leonardo AI, then post-produce them with correct logo compositing and brand colors.

### Leonardo AI Setup

- [ ] Create/upgrade Leonardo AI account (Pro plan recommended for batch generation — ~$12/mo)
- [ ] Upload `input/images/logo/v4/Minimalist IRONPAL logo design.png` as a saved **Style Reference** asset
- [ ] Upload `input/images/logo/v4/Geometric teal circle on navy.png` as a saved Style Reference (for Prompt 13)
- [ ] Configure default settings: Phoenix model, PhotoReal ON (Cinematic), Alchemy ON
- [ ] Save the standard negative prompt from `docs/body-mounted-image-prompts-updated.md` for reuse

### Image Generation — Product Showcase (Prompts 1-3)

> Follow the per-prompt instructions in `docs/body-mounted-image-prompts-updated.md` for exact Leonardo AI settings, reference image usage, and aspect ratios.

- [ ] **Prompt 1 — Headband Hero Shot:** Generate 4+ variants, select best
  - [ ] Style Reference: horizontal lockup at 0.2 strength
  - [ ] Aspect ratio: 16:9 or 3:2
- [ ] **Prompt 2 — Cap Hero Shot:** Generate 4+ variants, select best
  - [ ] Style Reference: horizontal lockup at 0.2 strength
  - [ ] Aspect ratio: 16:9 or 3:2
- [ ] **Prompt 3 — Side by Side Comparison:** Generate 4+ variants, select best
  - [ ] Style Reference: horizontal lockup at 0.25 strength
  - [ ] Aspect ratio: 16:9

### Image Generation — In-Action Exercises (Prompts 4-9)

> **Important:** Generate main scene and POV panel as **two separate images** per prompt, then composite in post.

- [ ] **Prompt 4 — Squats:** Generate Image A (main scene) + Image B (POV panel), 4+ variants each
- [ ] **Prompt 5 — Deadlift:** Generate Image A + Image B, 4+ variants each
- [ ] **Prompt 6 — Lat Pulldown:** Generate Image A + Image B, 4+ variants each
  - [ ] May need Inpainting on weight stack for legible numbers
- [ ] **Prompt 7 — Hack Squat:** Generate Image A + Image B, 4+ variants each
  - [ ] Consider uploading a hack squat machine reference photo if Phoenix doesn't render accurately
- [ ] **Prompt 8 — Dumbbell Curls:** Generate Image A + Image B, 4+ variants each
- [ ] **Prompt 9 — Calf Raise:** Generate Image A + Image B, 4+ variants each
  - [ ] Consider machine reference photo if needed

### Image Generation — Lifestyle & Concept (Prompts 10-14)

- [ ] **Prompt 10 — Phone Pairing:** Generate main scene, 4+ variants
  - [ ] Design app screen UI separately in Figma
- [ ] **Prompt 11 — Before/After:** Generate "before" half + "after" half separately, 4+ variants each
- [ ] **Prompt 12 — Gym Floor Wide Shot:** Generate wide scene, 4+ variants
- [ ] **Prompt 13 — Camera Module Close-Up:** Generate macro shot, 4+ variants
  - [ ] Style Reference: icon-only mark at 0.2 strength
  - [ ] Guidance scale: 9 (high precision)
- [ ] **Prompt 14 — User Journey Triptych:** Generate Panel 1 + Panel 2 + Panel 3 separately, 4+ variants each
  - [ ] Use Image-to-Image from Panel 1 output for Panels 2-3 to maintain model consistency

### App UI Design (for phone screen compositing)

- [ ] Design the IronPal app workout summary screen in Figma:
  - [ ] Iron Ring icon as app logo (top-left)
  - [ ] Workout list: exercise name + icon, weight, reps, teal confidence indicator
  - [ ] Stealth Teal color scheme (`#1A1A2E` background, `#00E5CC` accents, `#F0F4F8` text)
  - [ ] Export at 1080x2340px (standard phone resolution)
- [ ] Design the "before" cluttered spreadsheet app screen (for Prompt 11 left half)

### Post-Production Pass (ALL images)

> This is the critical step that ties everything together. Budget 2-3 days for this.

- [ ] **Logo compositing:** Add Iron Ring logo to every product placement across all images
  - [ ] Headband images: printed logo (flat, on fabric texture)
  - [ ] Cap images: embroidered logo (add thread texture overlay for realism)
  - [ ] Camera module (Prompt 13): laser-engraved effect
  - [ ] App screens: Iron Ring icon in top-left corner
- [ ] **POV overlay compositing** (Prompts 4-9):
  - [ ] Create the rounded-rectangle frame template with thin teal `#00E5CC` border
  - [ ] Add semi-transparent Iron Ring icon watermark in corner of each POV panel
  - [ ] Add "LIVE" indicator dots where specified
  - [ ] Composite POV panels onto main scenes (floating overlays or side-by-side splits)
- [ ] **Split-frame compositing** (Prompts 4, 11):
  - [ ] Add thin teal divider lines between halves
  - [ ] Ensure lighting contrast in Prompt 11 (cool left, warm right)
- [ ] **Triptych compositing** (Prompt 14):
  - [ ] Arrange three panels with consistent spacing
  - [ ] Color-grade all panels to match
- [ ] **Phone screen compositing** (Prompts 3, 10, 11, 14):
  - [ ] Perspective-transform Figma app UI onto phone screens
  - [ ] Add subtle screen glow/reflection for realism
- [ ] **Global color correction:**
  - [ ] Verify all teal accents match `#00E5CC` (adjust in Photoshop/Figma if AI drifted)
  - [ ] Ensure consistent warm gym lighting across the exercise set (Prompts 4-9)
  - [ ] Ensure consistent brand palette across the full set
- [ ] **Text overlays where needed** (weight labels on dumbbells, weight stack numbers) — AI rarely renders these correctly, add in post
- [ ] **Upscale final selections** using Leonardo Alchemy upscaler for print-quality resolution
- [ ] Save all final images to `output/marketing-images/`

### Selection & Organization

- [ ] Select the **best 1-2 versions** of each prompt for campaign use
- [ ] Organize into folders:
  - [ ] `output/marketing-images/product-showcase/` (Prompts 1-3)
  - [ ] `output/marketing-images/in-action/` (Prompts 4-9)
  - [ ] `output/marketing-images/lifestyle/` (Prompts 10-14)
  - [ ] `output/marketing-images/social-media/` (cropped/reformatted versions)
- [ ] Create social-media-ready crops:
  - [ ] 1:1 square (Instagram feed)
  - [ ] 9:16 vertical (Instagram/TikTok stories)
  - [ ] 16:9 horizontal (Twitter/Facebook, YouTube thumbnails)

**Estimated time:** 5-7 days (generation: 2 days, post-production: 3-4 days, selection/organization: 1 day)
**Tools needed:** Leonardo AI Pro (~$12/mo), Figma (free), Photoshop or Affinity Photo ($70 one-time)
**Output:** 14+ production-ready marketing illustrations in multiple formats

---

## Phase 2: Video Production (Days 8-28)

> **Goal:** Produce 3 campaign videos following the existing execution plan in `docs/video-production-execution-plan.md`. This phase overlaps with late Phase 1.

### Pre-Production (Days 8-10)

- [ ] **Subscribe to AI video tools** (total ~$190-330/mo):
  - [ ] Luma AI Dream Machine — $30/mo (primary AI video)
  - [ ] Runway Gen-4 — $28/mo (secondary AI video)
  - [ ] Kling AI 1.6 — $25/mo (longer clips)
  - [ ] ElevenLabs — $22/mo (AI voiceover)
  - [ ] Suno AI or Udio — $10/mo (background music)
  - [ ] DaVinci Resolve (free) or CapCut Pro ($10/mo) for editing
  - [ ] Adobe After Effects — $23/mo (motion graphics) — optional if comfortable with DaVinci Fusion
- [ ] **Write final scripts** for all 3 videos per `docs/body-mounted-video-prompts.md`:
  - [ ] Video #2: "Your Workout, Logged Before You Leave" (75-90s hero)
  - [ ] Video #3: "What the Camera Sees" (60-75s proof)
  - [ ] Video #6: "The Numbers" (75-90s data pitch)
- [ ] **Record or generate voiceover:**
  - [ ] Write VO script for each video
  - [ ] Option A: Record yourself (authentic founder voice)
  - [ ] Option B: Generate via ElevenLabs (professional, consistent)
  - [ ] Generate 3-5 VO takes per video, select best

### Storyboarding & Key Frames (Days 10-12)

- [ ] Create storyboard for Video #2 (12-14 key frames)
  - [ ] Use select marketing images from Phase 1 as reference frames where applicable
  - [ ] Identify which frames need AI video generation vs. static image with motion (Ken Burns, parallax)
- [ ] Create storyboard for Video #3 (10-12 key frames)
  - [ ] Plan the split-screen POV sequences — may need real phone-on-headband POV footage
- [ ] Create storyboard for Video #6 (10-12 key frames)
  - [ ] Plan kinetic typography/infographic sequences (60% of video)
  - [ ] Plan product shot sequences (40% of video)

### AI Video Generation (Days 12-20)

> Follow the detailed shot-by-shot generation workflow in `docs/video-production-execution-plan.md`.

- [ ] **Video #2 — Hero Campaign Video:**
  - [ ] Generate gym scene clips via Luma AI (batch overnight, 50-80 runs expected)
  - [ ] Generate product close-up clips
  - [ ] Generate app UI animation clips
  - [ ] Capture or generate real POV footage (phone strapped to headband in gym)
  - [ ] Select best takes for each shot (target: 3-5 usable clips per shot)
- [ ] **Video #3 — Proof/Credibility Video:**
  - [ ] Generate third-person athlete clips
  - [ ] Generate/capture first-person POV clips (real footage preferred for authenticity)
  - [ ] Generate split-screen transition effects
- [ ] **Video #6 — Data-Driven Pitch:**
  - [ ] Create kinetic typography sequences in After Effects or DaVinci Fusion
  - [ ] Generate product shot clips
  - [ ] Create animated infographics (cost per workout, accuracy stats, pricing tiers)

### Assembly & Post-Production (Days 18-28)

- [ ] **Video #2 assembly:**
  - [ ] Rough cut assembly in DaVinci Resolve
  - [ ] Composite Iron Ring logo on all product appearances
  - [ ] Add end card with Iron Ring horizontal lockup logo
  - [ ] Color grade to Stealth Teal palette (dark, cinematic, teal accents)
  - [ ] Sound design: background music + VO + SFX
  - [ ] Add subtitles/captions
  - [ ] Export: 1080p and 4K, plus 30s social cutdown, plus 9:16 vertical cutdown
- [ ] **Video #3 assembly:**
  - [ ] Rough cut, split-screen compositing
  - [ ] Logo compositing, color grading, sound design
  - [ ] Export: 1080p/4K + social cutdowns
- [ ] **Video #6 assembly:**
  - [ ] Rough cut, kinetic typography integration
  - [ ] Logo compositing, color grading, sound design
  - [ ] Export: 1080p/4K + social cutdowns
- [ ] **Quality review all 3 videos:**
  - [ ] Watch each on phone (mobile-first — most Kickstarter traffic is mobile)
  - [ ] Watch each with sound off (many viewers watch muted — subtitles essential)
  - [ ] Verify Iron Ring logo is visible and consistent across all videos
  - [ ] Verify teal `#00E5CC` is accurate in all color-graded footage
  - [ ] Get 2-3 trusted friends/advisors to watch and give feedback
- [ ] Save final videos to `output/videos/`

**Estimated time:** 18-20 working days (per existing video execution plan, with buffer)
**Tools needed:** See tool stack above (~$190-330/mo total)
**Output:** 3 campaign videos in multiple formats + social media cutdowns

---

## Phase 3: Kickstarter Page Build (Days 26-33)

> **Goal:** Build a compelling, conversion-optimized Kickstarter campaign page using all generated assets. This phase overlaps with late Phase 2.

### Reward Tier Structure

- [ ] **Finalize reward tiers** (validate against production costs and market):

| Tier | Name | Price | Includes | Est. COGS | Margin |
|---|---|---|---|---|---|
| 1 | Early Bird | $49 | Headband camera + 6 months premium app | TBD | TBD |
| 2 | Backer Special | $69 | Cap camera + 12 months premium app | TBD | TBD |
| 3 | Complete Kit | $99 | Headband + Cap + Lifetime premium app | TBD | TBD |
| 4 | Gym Owner Pack | $399 | 5x Complete Kits + gym partnership | TBD | TBD |
| 5 | Founding Supporter | $15 | Thank-you + early app access (digital only) | ~$0 | ~100% |

- [ ] Research production cost estimates for hardware (camera module, headband, cap, packaging)
- [ ] Estimate shipping costs (domestic + international)
- [ ] Set estimated delivery date (be conservative — add 3-6 months buffer)
- [ ] Define tier limits (e.g., Early Bird limited to 200 backers for urgency)

### Stretch Goals

- [ ] **Plan stretch goals** (unlocked at funding milestones):

| Funding Level | Stretch Goal | Description |
|---|---|---|
| $50,000 | Smart Watch Integration | Apple Watch & Garmin companion app |
| $75,000 | Social Features | Share workouts, compare with friends |
| $100,000 | Gym Owner Dashboard | Multi-user analytics for gym operators |
| $150,000 | Additional Form Factors | Clip-on module, glasses attachment |

### Campaign Page Content

> Use the **Stealth Teal** color scheme as the primary campaign page aesthetic, with **Iron & Ember** for CTAs and pricing sections, per `docs/color-schemes.md`.

- [ ] **Hero Section:**
  - [ ] Campaign video (Video #2) as the hero
  - [ ] Headline: "Your Workout, Logged Automatically."
  - [ ] Subheadline: 1-sentence value prop
  - [ ] Iron Ring horizontal lockup logo
  - [ ] Use Prompt 1 or 2 hero shot as the project thumbnail image
- [ ] **Problem Section:**
  - [ ] "Manual logging is broken" — use left half of Prompt 11 (before/after)
  - [ ] 2-3 pain points with supporting stats
- [ ] **Solution Section:**
  - [ ] "Meet IronPal" — use Prompt 3 (both products side by side)
  - [ ] Video #3 (What the Camera Sees) embedded here
  - [ ] 3 key benefits with icons
- [ ] **How It Works Section:**
  - [ ] Use Prompt 14 (triptych: clip-on → work out → review)
  - [ ] 3-step visual flow with brief descriptions
- [ ] **In-Action Section:**
  - [ ] Gallery/carousel of exercise shots (Prompts 4-9)
  - [ ] Demonstrate variety: free weights, machines, different exercises
  - [ ] POV overlays show the AI detection in context
- [ ] **Technology Section:**
  - [ ] Use Prompt 13 (camera module close-up)
  - [ ] Hardware specs: camera resolution, battery life, weight, dimensions
  - [ ] AI capabilities: exercise recognition, weight detection, rep counting
  - [ ] Reference accuracy targets from `docs/Challenges_and_Solutions_BodyMounted.md`:
    - Exercise recognition: 85-90%
    - Weight detection: 85-95% (machines), 60-75% (barbells), 80-90% (dumbbells)
    - Rep counting: 95-98% (IMU + vision fusion)
- [ ] **App Preview Section:**
  - [ ] Use Prompt 10 (phone pairing & workout summary)
  - [ ] App UI mockups (from Figma designs created in Phase 1)
  - [ ] Feature highlights: auto-logging, workout history, progress tracking
- [ ] **The Numbers Section:**
  - [ ] Video #6 embedded
  - [ ] Key stats in large typography: cost per workout, accuracy %, time saved
- [ ] **Reward Tiers Section:**
  - [ ] Clear tier cards with images of each product config
  - [ ] Use Iron & Ember color scheme for pricing/CTA elements
  - [ ] "Limited Early Bird" urgency messaging
- [ ] **Vision / Why This Matters Section:**
  - [ ] Use Prompt 12 (gym floor wide shot — multiple users)
  - [ ] Founder story paragraph (authentic, personal)
  - [ ] Future roadmap / stretch goals preview
- [ ] **Team / About Section:**
  - [ ] Your bio and photo
  - [ ] Relevant experience and credibility signals
  - [ ] Links to technical documentation or blog posts (optional)
- [ ] **Risks & Challenges Section** (Kickstarter requires this):
  - [ ] Hardware manufacturing timeline risks → mitigation: established supplier relationships, conservative delivery estimate
  - [ ] AI accuracy in diverse gym environments → mitigation: extensive testing across gym types, user feedback loop
  - [ ] Battery life optimization → mitigation: post-session processing reduces real-time power needs
  - [ ] Privacy concerns → mitigation: on-device processing, no cloud upload of raw video, user-controlled recording
- [ ] **FAQ Section:**
  - [ ] "Does it work at any gym?" — Yes, no gym integration needed
  - [ ] "Is it comfortable?" — Weighs <50g, feels like a normal headband/cap
  - [ ] "What about privacy?" — Records only your workout, on-device processing, auto-deletes raw video
  - [ ] "When will I receive it?" — Estimated delivery date
  - [ ] "Does it work with my existing fitness app?" — Export to CSV, Apple Health, Google Fit integration planned

### Campaign Settings

- [ ] Set funding goal ($25,000-$50,000 — lower is easier to hit, builds momentum)
- [ ] Set campaign duration (30 days recommended)
- [ ] Set project category (Technology > Wearables or Health & Fitness)
- [ ] Set project location
- [ ] Configure shipping options and costs per region
- [ ] Write the short project blurb (135 characters max for the project card)
- [ ] Select the campaign thumbnail image (best hero shot)
- [ ] Preview the full page on desktop and mobile — check spacing, image loading, readability

**Estimated time:** 5-7 days
**Tools needed:** Kickstarter Creator account (free to create, 5% fee on funds raised), Figma for page layout mockups
**Output:** Complete Kickstarter campaign page ready for review

---

## Phase 3.5: Domain, Website & Deployment (Days 15-22)

> **Goal:** Register the ironpal.co domain, build a campaign landing page with early-bird email capture, and deploy it to the same DigitalOcean infrastructure as handlr-web. Start this phase during Phase 2 (video production) — it runs in parallel. The website must be live before Phase 4 audience building begins.

### Domain Registration

- [ ] **Register `ironpal.co` via Cloudflare Registrar:**
  - [ ] Log into Cloudflare dashboard → Registrar → Register Domain
  - [ ] Search for `ironpal.co` and purchase (~$10-12/yr)
  - [ ] DNS is automatically managed by Cloudflare — no external nameserver setup needed
- [ ] **Configure DNS records:**
  - [ ] `A @` → `45.55.36.33` (same DigitalOcean droplet as handlr-web) — Proxied (orange cloud)
  - [ ] `A www` → `45.55.36.33` — Proxied (orange cloud)
  - [ ] CNAME `www` → `ironpal.co` (alternative to A record for www)
- [ ] **Configure Cloudflare SSL/TLS:**
  - [ ] Set SSL/TLS mode to **Full (strict)**
  - [ ] Enable "Always Use HTTPS"
  - [ ] Enable "Automatic HTTPS Rewrites"
  - [ ] Generate a Cloudflare Origin Certificate (15-year RSA) for `ironpal.co` and `*.ironpal.co`
  - [ ] Save cert to server: `/etc/ssl/certs/ironpal-origin.pem`
  - [ ] Save key to server: `/etc/ssl/private/ironpal-origin.key`

### Website Development

> **Tech stack:** React 18 + Vite + Express + SQLite — same as `../handlr/handlr-web`. Reference that project for architecture patterns, email capture implementation, and deployment scripts.

#### Project Setup

- [ ] **Initialize the project:**
  - [ ] Create project directory (e.g., `ironpal-web/` or within the ironpal repo)
  - [ ] `npm create vite@latest` — select React template
  - [ ] Install dependencies:
    ```
    npm install react react-dom lucide-react
    npm install express better-sqlite3
    npm install -D concurrently @vitejs/plugin-react
    ```
  - [ ] Configure `vite.config.js` with API proxy to `localhost:3002` (use different port than handlr-web's 3001 since they share the same server)
  - [ ] Set up `package.json` scripts:
    ```json
    "dev": "vite",
    "build": "vite build",
    "server": "node server/index.js",
    "dev:full": "concurrently \"npm run server\" \"npm run dev\"",
    "dump-emails": "node server/dump-emails.js"
    ```

#### Backend — Email Capture API

- [ ] **Create `server/index.js`** — Express API server (reference: `../handlr/handlr-web/server/index.js`):
  - [ ] `POST /api/collect-email` — collect email signups
    - [ ] Request body: `{ email: string, source: "landing_page" | "social" | "referral" }`
    - [ ] Validate email format server-side (regex)
    - [ ] Store in SQLite with deduplication (UNIQUE constraint on email)
    - [ ] Return `{ message: "...", duplicate?: boolean }`
  - [ ] `GET /api/emails` — list all collected emails (add basic auth or API key protection)
  - [ ] `GET /api/health` — health check endpoint
  - [ ] `GET /api/stats` — return total signups count (for displaying social proof on the page)
- [ ] **Create `server/db.js`** — SQLite database setup:
  ```sql
  CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      source TEXT DEFAULT 'landing_page',
      referrer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  ```
- [ ] **Create `server/dump-emails.js`** — CLI tool to export emails (reference: handlr-web's `dump-emails.js`)
  - [ ] Formatted table output: ID | Email | Source | Date
  - [ ] CSV export option for importing into email marketing tools later

#### Frontend — Landing Page

> **Design:** Stealth Teal color scheme as primary (`#1A1A2E` background, `#00E5CC` teal accents, `#F0F4F8` text). Reference `docs/color-schemes.md` for the full palette.

- [ ] **Hero Section:**
  - [ ] Iron Ring logo (horizontal lockup) — use vector SVG from Phase 0
  - [ ] Headline: "Your Workout, Logged Automatically."
  - [ ] Subheadline: "IronPal is a body-mounted AI camera that tracks your exercises, weights, and reps — so you never have to log manually again."
  - [ ] **Email capture form** — prominent, above the fold:
    - [ ] Input field: "Enter your email"
    - [ ] CTA button: "Get Early Bird Access" (Electric Teal `#00E5CC` background, dark text)
    - [ ] Subtitle under form: "Be first to know when we launch on Kickstarter. Early supporters get exclusive pricing."
  - [ ] Hero image: best product shot from Phase 1 (Prompt 1 or 2 hero shot)
  - [ ] Optional: embedded teaser video clip (30s social cutdown from Video #2, once available)
- [ ] **Email Capture Modal** (reference: `../handlr/handlr-web/src/components/EmailModal.jsx`):
  - [ ] Triggered by hero CTA button click (or inline form — choose one)
  - [ ] Client-side email validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - [ ] States: idle → submitting (spinner) → success ("You're on the list!") → error (retry)
  - [ ] On success: show confirmation message + social share buttons ("Share with a gym buddy")
  - [ ] POST to `/api/collect-email` with `{ email, source: "landing_page" }`
- [ ] **Problem Section:**
  - [ ] "Manual workout logging is broken" — 2-3 pain points with icons
  - [ ] Optional: left half of Prompt 11 (before/after) image
- [ ] **Solution / Product Section:**
  - [ ] "Meet IronPal" — Prompt 3 (both products side by side)
  - [ ] 3 key benefits: "Wear it. Work out. Done." — with supporting icons
- [ ] **How It Works Section:**
  - [ ] 3-step visual: Prompt 14 triptych or simplified icon steps
  - [ ] Step 1: Clip on the camera → Step 2: Work out normally → Step 3: Review your auto-logged workout
- [ ] **In-Action Preview Section:**
  - [ ] 2-3 exercise shots from Phase 1 (Prompts 4-5 or 6)
  - [ ] Brief caption per image showing AI detection capability
- [ ] **Social Proof / Counter Section (optional):**
  - [ ] "Join X early supporters" — fetch count from `GET /api/stats`
  - [ ] Display dynamically to create FOMO as signups grow
- [ ] **Second Email CTA:**
  - [ ] Repeat the email capture form at the bottom of the page
  - [ ] "Don't miss Early Bird pricing — join the waitlist."
- [ ] **Footer:**
  - [ ] Iron Ring logo (icon only, small)
  - [ ] Links: Kickstarter pre-launch page (once active), social media profiles
  - [ ] "IronPal &copy; 2026" — minimal legal text
  - [ ] Privacy note: "We'll only email you about the IronPal launch. No spam."

#### Responsive Design

- [ ] Mobile-first design (most traffic will be mobile from social media)
- [ ] Test at 375px (iPhone), 768px (tablet), 1440px (desktop)
- [ ] Email form must be easy to tap and fill on mobile
- [ ] Images lazy-loaded for fast mobile performance
- [ ] Target: Lighthouse score > 90 for performance

#### SEO & Meta Tags

- [ ] Page title: "IronPal — AI Body Camera That Logs Your Gym Workouts Automatically"
- [ ] Meta description: "Stop manually logging every rep. IronPal is a tiny camera you wear that uses AI to track exercises, weights, and reps. Join the early bird waitlist."
- [ ] Open Graph tags (for social sharing):
  - [ ] `og:title`, `og:description`, `og:image` (hero product shot)
  - [ ] `og:url`: `https://ironpal.co`
  - [ ] `twitter:card`: `summary_large_image`
- [ ] Favicon: Iron Ring icon-only mark (from Phase 0 exports)
- [ ] `robots.txt` — allow all
- [ ] `sitemap.xml` — single page, simple

### Website Deployment

> **Target server:** Same DigitalOcean droplet as handlr-web (`45.55.36.33`). Reference `../handlr/handlr-web/deployment/DEPLOYMENT_PRODUCTION_DIGITAL_OCEAN_PLAN.md` for the full deployment guide pattern.

#### Server Configuration

- [ ] **SSH into the droplet:** `ssh root@45.55.36.33`
- [ ] **Create directory structure on server:**
  ```
  /var/www/ironpal.co/         # Frontend static files (Vite dist/)
  /opt/ironpal-api/            # Backend Express app + SQLite DB
  ```
- [ ] **Install/verify Node.js** on server (should already be present from handlr-web deployment)
- [ ] **Create nginx virtual host** for `ironpal.co`:
  - [ ] Create `/etc/nginx/sites-available/ironpal.co`:
    ```nginx
    server {
        listen 443 ssl http2;
        server_name ironpal.co www.ironpal.co;

        ssl_certificate /etc/ssl/certs/ironpal-origin.pem;
        ssl_certificate_key /etc/ssl/private/ironpal-origin.key;

        root /var/www/ironpal.co;
        index index.html;

        # API proxy
        location /api/ {
            proxy_pass http://127.0.0.1:3002;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static assets — long cache
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Gzip
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    }

    server {
        listen 80;
        server_name ironpal.co www.ironpal.co;
        return 301 https://$server_name$request_uri;
    }
    ```
  - [ ] Symlink to sites-enabled: `ln -s /etc/nginx/sites-available/ironpal.co /etc/nginx/sites-enabled/`
  - [ ] Test nginx config: `nginx -t`
  - [ ] Reload nginx: `systemctl reload nginx`
- [ ] **Create systemd service** for the IronPal API (`/etc/systemd/system/ironpal-api.service`):
  ```ini
  [Unit]
  Description=IronPal Email Collection API
  After=network.target

  [Service]
  Type=simple
  User=www-data
  WorkingDirectory=/opt/ironpal-api
  ExecStart=/usr/bin/node server/index.js
  Restart=on-failure
  Environment=PORT=3002
  Environment=NODE_ENV=production

  [Install]
  WantedBy=multi-user.target
  ```
  - [ ] `systemctl daemon-reload`
  - [ ] `systemctl enable ironpal-api`
  - [ ] `systemctl start ironpal-api`

#### Deploy Script

- [ ] **Create `deployment/deploy.sh`** (reference: `../handlr/handlr-web/deployment/deploy.sh`):
  ```bash
  #!/bin/bash
  set -e

  SERVER="root@45.55.36.33"
  FRONTEND_DEST="/var/www/ironpal.co"
  BACKEND_DEST="/opt/ironpal-api"

  echo "Building frontend..."
  npm run build

  echo "Syncing frontend to server..."
  rsync -avz --delete dist/ $SERVER:$FRONTEND_DEST/

  echo "Syncing backend to server..."
  rsync -avz --delete server/ $SERVER:$BACKEND_DEST/server/
  rsync -avz package.json package-lock.json $SERVER:$BACKEND_DEST/

  echo "Installing backend dependencies on server..."
  ssh $SERVER "cd $BACKEND_DEST && npm install --omit=dev"

  echo "Restarting API service..."
  ssh $SERVER "systemctl restart ironpal-api"

  echo "Running health checks..."
  sleep 2
  curl -sf https://ironpal.co/api/health && echo " ✓ Health check passed"
  curl -sf https://ironpal.co && echo " ✓ Frontend loaded"

  echo "Deploy complete!"
  ```
  - [ ] `chmod +x deployment/deploy.sh`

#### Deployment Execution

- [ ] Run `npm run build` locally — verify the `dist/` folder looks correct
- [ ] Run `./deployment/deploy.sh` to deploy
- [ ] **Verify deployment:**
  - [ ] `https://ironpal.co` loads correctly (HTTPS, no cert warnings)
  - [ ] `https://www.ironpal.co` redirects to `https://ironpal.co` (or vice versa)
  - [ ] `https://ironpal.co/api/health` returns OK
  - [ ] Submit a test email via the form — verify it appears in SQLite:
    ```bash
    ssh root@45.55.36.33 "cd /opt/ironpal-api && node server/dump-emails.js"
    ```
  - [ ] Test on mobile (real phone) — form works, images load, no horizontal scroll
  - [ ] Check Lighthouse score (target > 90 performance)
  - [ ] Verify Open Graph tags work: paste `https://ironpal.co` into Twitter/Facebook/LinkedIn share preview tools

#### Ongoing Maintenance

- [ ] **Set up basic monitoring:**
  - [ ] Cloudflare Analytics — check traffic weekly
  - [ ] Optionally add a simple uptime check (e.g., UptimeRobot free tier — pings `/api/health` every 5 min)
- [ ] **Email export workflow:**
  - [ ] Periodically export emails: `ssh root@45.55.36.33 "cd /opt/ironpal-api && node server/dump-emails.js"`
  - [ ] Before launch day: export full list for the launch announcement email (can import to Mailchimp free tier for the 3-email sequence, or send manually)
- [ ] **Post-Kickstarter-launch update:**
  - [ ] Add a "We're live on Kickstarter!" banner to the top of the page with a direct link to the campaign
  - [ ] Keep the email form active for visitors who don't back immediately — capture for follow-up

**Estimated time:** 5-7 days (domain setup: 1 day, frontend dev: 3-4 days, backend + deployment: 1-2 days)
**Tools needed:** Cloudflare account (free + ~$10-12/yr domain), existing DigitalOcean droplet ($6/mo — shared with handlr-web, no additional cost), Node.js
**Output:** Live landing page at `https://ironpal.co` with email capture, branded with Iron Ring logo and Stealth Teal design

---

## Phase 4: Pre-Launch & Audience Building (Days 15-40)

> **Goal:** Build an email list and community before launch to have Day 1 backers ready. Start this phase during Phase 2 (video production) — it runs in parallel.

### Landing Page & Email Collection

> **The ironpal.co landing page (Phase 3.5) must be live before starting audience building.** All social media, ads, and outreach will drive traffic to `https://ironpal.co` for email capture.

- [ ] **Verify ironpal.co is live and functional:**
  - [ ] Email capture form works (submit a test email, verify in DB)
  - [ ] All marketing images are loaded and optimized
  - [ ] Page loads fast on mobile (Lighthouse > 90)
  - [ ] Open Graph preview looks good when sharing the URL
- [ ] **Share the ironpal.co URL** as the primary link across all channels (social bios, outreach emails, Reddit posts, etc.)
- [ ] **Monitor email signups daily:**
  - [ ] Run `ssh root@45.55.36.33 "cd /opt/ironpal-api && node server/dump-emails.js"` to check progress
  - [ ] Track daily signup rate to measure which channels drive the most signups
- [ ] **Plan 3-email launch sequence** (export emails from SQLite → import to Mailchimp free tier for sending):
  - [ ] Email 1: Welcome + problem story (manual send to current list at campaign midpoint or 1 week before launch)
  - [ ] Email 2: Behind the scenes — show camera module close-up (Prompt 13) + tech story (3-5 days before launch)
  - [ ] Email 3: Launch announcement — "We're live! Back us in the first 48 hours for Early Bird pricing" (Launch Day)
- [ ] **Post-launch: update ironpal.co** with a "We're live on Kickstarter!" banner linking directly to the campaign page

### Social Media Presence

- [ ] **Create/optimize social accounts:**
  - [ ] Instagram: @ironpal or @ironpal_fit — set up with Iron Ring logo as profile pic
  - [ ] TikTok: @ironpal — same branding
  - [ ] Twitter/X: @ironpal — same branding
  - [ ] Reddit: create u/ironpal for r/fitness, r/homegym, r/kickstarter engagement
- [ ] **Content calendar — pre-launch (2-3 posts/week for 3-4 weeks):**
  - [ ] Week 1: Teaser — close-up of camera module (Prompt 13), "Something's coming" theme
  - [ ] Week 2: Problem content — "Anyone else spend more time logging than lifting?" + Prompt 11 before/after
  - [ ] Week 3: Solution reveal — product hero shots (Prompts 1-2), "Meet IronPal"
  - [ ] Week 4: Proof — exercise in-action shots (Prompts 4-5), POV camera demos, Video #3 teaser clip
  - [ ] Week 5 (launch week): Countdown posts, "Link in bio", Video #2 social cutdowns
- [ ] **Create a bank of social media assets:**
  - [ ] 10-15 Instagram/TikTok posts from marketing images (1:1 and 9:16 crops)
  - [ ] 5-8 short video clips from Video cutdowns (15s and 30s)
  - [ ] 3-5 carousel posts (exercise detection examples, How It Works triptych)

### Community & Influencer Outreach

- [ ] **Identify 20-30 fitness content creators** (micro-influencers, 10K-100K followers) who:
  - [ ] Post about gym tech, workout tracking, fitness gadgets
  - [ ] Have engaged audiences (comment ratio > 2%)
  - [ ] Are likely Kickstarter-friendly (tech-curious audience)
- [ ] **Draft outreach template:**
  - [ ] Personalized message referencing their content
  - [ ] Brief IronPal pitch (2-3 sentences)
  - [ ] Offer: "Would you be interested in testing an early unit? / Would you share our launch with your audience?"
  - [ ] Attach 1-2 best marketing images
- [ ] **Send outreach to 20-30 creators** (expect 5-10% response rate = 1-3 interested)
- [ ] **Identify and join relevant online communities:**
  - [ ] Reddit: r/fitness (10M+), r/homegym (700K+), r/GymMotivation, r/kickstarter
  - [ ] Facebook Groups: fitness tech groups, gym equipment groups
  - [ ] Discord: fitness communities, Kickstarter backer communities
- [ ] **Engage authentically** — contribute value (workout tips, tech insights) before promoting
  - [ ] Post 3-5 valuable comments/posts per community before any IronPal promotion
  - [ ] When promoting: frame as "I'm building this, would love your feedback" not "buy my product"

### Press & Media Outreach

- [ ] **Write a press release / media kit:**
  - [ ] 1-page press release: who, what, why, when, founder quote
  - [ ] Media kit folder: high-res hero images, logo files, product specs, founder photo
  - [ ] Upload to a shareable link (Google Drive or Dropbox)
- [ ] **Compile media list** (20-30 targets):
  - [ ] Tech blogs: TechCrunch, The Verge, Engadget, Wearable Tech
  - [ ] Fitness tech: BarBend, Breaking Muscle, GymBroScience, Garage Gym Reviews
  - [ ] Kickstarter-focused: Kickstarter newsletters, BackerKit blog, crowdfunding review sites
- [ ] **Send personalized pitches** to top 10 media contacts (1-2 weeks before launch)

### Kickstarter Pre-Launch Page

- [ ] **Activate Kickstarter's "Notify Me" pre-launch page:**
  - [ ] Upload project thumbnail (best hero shot)
  - [ ] Write compelling project blurb (135 characters)
  - [ ] Set category
  - [ ] Share the pre-launch page link everywhere to collect followers
- [ ] **Goal: 200+ Kickstarter followers before launch** (each follower gets notified on launch day)

**Estimated time:** 10-14 days of active work, spread across 3-4 weeks (parallel with Phase 2)
**Tools needed:** ironpal.co (live from Phase 3.5), Mailchimp free tier (for launch email sequence only), Canva (free, for quick social crops), social media accounts
**Output:** Email list via ironpal.co (target: 200-500 signups), social media presence, press kit, 200+ Kickstarter followers

---

## Phase 5: Launch Week (Days 40-47)

> **Goal:** Maximize Day 1 funding momentum. Kickstarter campaigns that hit 30%+ of their goal in the first 48 hours are 90% more likely to fully fund.

### Launch Day (Day 40)

- [ ] **Final pre-launch checks (morning):**
  - [ ] Preview campaign page one last time on desktop and mobile
  - [ ] Verify all videos play correctly
  - [ ] Verify all images load at full resolution
  - [ ] Verify all reward tiers are correct (prices, descriptions, limits, delivery dates)
  - [ ] Verify shipping costs are configured for all target regions
- [ ] **Launch the campaign** (recommended: Tuesday or Wednesday, 8-10am EST)
- [ ] **Immediately after launch:**
  - [ ] Export emails from ironpal.co SQLite DB → import to Mailchimp → send launch announcement to entire list
  - [ ] Update ironpal.co with "We're live on Kickstarter!" banner + direct campaign link
  - [ ] Post on all social media accounts with direct campaign link
  - [ ] Post on Reddit: r/kickstarter (project launch thread), r/fitness, r/homegym
  - [ ] Post in Facebook groups
  - [ ] Message all engaged influencer contacts with live campaign link
  - [ ] Send press release to media list with "Now Live" update
  - [ ] Share personally with friends, family, professional network (LinkedIn)
  - [ ] Back your own project (shows commitment)
- [ ] **Monitor and respond:**
  - [ ] Check Kickstarter messages every 2 hours on Day 1
  - [ ] Respond to every comment and question within 1 hour
  - [ ] Thank every backer publicly in the comments

### Days 2-3: Sustain Momentum

- [ ] Post social media updates: "X% funded in 48 hours!" with best marketing image
- [ ] Share any press coverage immediately
- [ ] Send thank-you messages to backers who left comments
- [ ] If approaching Early Bird tier limit, post urgency update: "Only X Early Bird spots left!"

### Days 4-7: First Week Wrap

- [ ] Post first Kickstarter project update:
  - [ ] Thank backers, share first milestone ("We hit X% in Y days!")
  - [ ] Share 1-2 behind-the-scenes images or a short clip
  - [ ] Tease what's coming (stretch goals, more details, community input)
- [ ] Analyze first-week data:
  - [ ] Total backers and funding amount
  - [ ] Conversion rate (page visits → backers)
  - [ ] Top referral sources (where are backers coming from?)
  - [ ] Most popular reward tier
- [ ] Adjust strategy based on data:
  - [ ] If low traffic: increase social media posting, try Reddit ads, boost influencer outreach
  - [ ] If high traffic but low conversion: revisit page copy, video thumbnail, tier pricing
  - [ ] If on track: maintain pace, start teasing stretch goals

**Estimated time:** Full-time attention for 7 days
**Output:** Funded campaign with momentum

---

## Phase 6: Campaign Management (Days 47-77, the remaining ~23 days)

> **Goal:** Maintain funding momentum through the mid-campaign slump and finish strong with a final-week push.

### Weekly Cadence

Repeat this weekly cycle for weeks 2-4 of the campaign:

- [ ] **Post 1 Kickstarter update per week** (backers get email notifications):
  - [ ] Week 2: Technical deep-dive (how the AI works, camera specs, app preview)
  - [ ] Week 3: Stretch goal announcement + community milestone
  - [ ] Week 4: Final push — "Last chance" messaging, any unlocked stretch goals, delivery timeline
- [ ] **Post 3-5 social media posts per week:**
  - [ ] Mix content types: product images, video clips, backer testimonials, milestones, polls
  - [ ] Use different images from the marketing set to keep content fresh
  - [ ] Share backer comments/testimonials (with permission)
- [ ] **Engage community daily:**
  - [ ] Respond to all Kickstarter comments within 24 hours
  - [ ] Respond to all social media DMs and comments
  - [ ] Participate in Reddit/Facebook community discussions (continue value-first approach)
- [ ] **Track metrics weekly:**
  - [ ] Funding progress vs. goal
  - [ ] New backers per day (watch for the "mid-campaign slump" — days 8-25 typically slow)
  - [ ] Referral sources — double down on what's working

### Mid-Campaign Slump Strategies (Days 55-70)

- [ ] **Unlock and announce stretch goals** to reignite interest
- [ ] **Cross-promote:** Find other active Kickstarter campaigns in fitness/tech and propose mutual shoutouts
- [ ] **Run a social media giveaway:** "Share this post + tag 2 gym friends = enter to win a Complete Kit"
- [ ] **Publish a longer-form blog post or video:** "The story behind IronPal" — founder journey, why you're building this
- [ ] **Try paid promotion (if budget allows):**
  - [ ] Facebook/Instagram ads targeting fitness + tech interests ($5-20/day)
  - [ ] Reddit promoted posts in r/fitness ($5-10/day)
  - [ ] Kickstarter's "Project We Love" — nothing you can do to guarantee this, but a clean page + strong early traction increases odds

### Final 48 Hours Push (Days 76-77)

- [ ] Post "48 hours left!" urgency update on Kickstarter
- [ ] Send email to list: "Last chance to back IronPal at Kickstarter pricing"
- [ ] Post on all social channels: countdown content, final CTA
- [ ] Message any fence-sitting contacts personally
- [ ] If close to a stretch goal: "We're $X away from unlocking [stretch goal]!"

**Estimated time:** 2-3 hours/day ongoing, with spikes around updates and final push
**Output:** Successfully funded campaign

---

## Phase 7: Post-Campaign & Fulfillment Planning (Day 77+)

> **Goal:** Transition from campaign to delivery. Start planning immediately after campaign ends.

### Immediate Post-Campaign (Week 1 after close)

- [ ] Post final Kickstarter update: Thank all backers, share final numbers, outline next steps and timeline
- [ ] Send email to full list: campaign results, "If you missed it, you can still pre-order at [BackerKit/Indiegogo InDemand]"
- [ ] Collect backer surveys via Kickstarter or BackerKit:
  - [ ] Product selection (headband vs. cap vs. both)
  - [ ] Shipping address
  - [ ] Size preferences (if applicable)
  - [ ] Color preference (if offering variants)

### Fulfillment Planning

- [ ] **Hardware sourcing:**
  - [ ] Finalize camera module supplier (reference: `docs/Challenges_and_Solutions_BodyMounted.md` — generic mini camera $30-60 for MVP)
  - [ ] Source headband and cap manufacturing (athletic fabric, structure)
  - [ ] Source packaging (boxes, inserts, branding)
  - [ ] Get quotes for batch production at backer volume
- [ ] **App development timeline:**
  - [ ] MVP app scope: video upload → exercise detection → workout log display
  - [ ] Platform priority: iOS first or both iOS + Android?
  - [ ] Backend: LLM integration for exercise/weight/rep detection
- [ ] **Fulfillment logistics:**
  - [ ] Choose fulfillment partner or self-fulfill
  - [ ] Calculate per-unit shipping costs by region
  - [ ] Set realistic delivery timeline (communicate clearly with backers)

### Ongoing Backer Communication

- [ ] Post monthly Kickstarter updates through delivery:
  - [ ] Progress on hardware, app development, manufacturing
  - [ ] Photos/videos of prototypes, factory samples
  - [ ] Honest updates on any delays (transparency builds trust)

**Estimated time:** Ongoing
**Output:** Transition to product delivery phase

---

## Potential Challenges & Mitigation Strategies

| Challenge | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|
| **AI-generated images look artificial** | Medium | High — undermines product credibility | Invest extra time in post-production (Phase 1). Use Inpainting for problem areas. Composite real product mockups where possible. |
| **Video production takes longer than 18 days** | High | Medium — delays launch | Start video production early. Prioritize Video #2 (hero) — launch with 1 video if needed, add others during campaign. |
| **Low pre-launch email signups (<100)** | Medium | High — weak Day 1 momentum | Start audience building earlier. Try paid social ads for email collection. Leverage personal network aggressively. Lower goal to $15K-25K so fewer backers needed to fund. |
| **Mid-campaign funding slump** | Very High | Medium — normal for Kickstarter | Plan stretch goals in advance. Save best content/updates for mid-campaign. Budget for small paid promotion boost. |
| **Backers question product feasibility** | High | High — affects trust and conversion | Prepare detailed technical FAQ. Reference accuracy stats from `docs/Challenges_and_Solutions_BodyMounted.md`. Show real POV footage (Video #3). Offer realistic timeline with buffer. |
| **Logo/branding doesn't render well in AI images** | Medium | Low — fixable in post | Always plan for post-production logo compositing (documented in Phase 1). Never rely on AI to generate accurate text/logos. |
| **Pricing too high or too low** | Medium | High — affects funding and margins | Research comparable Kickstarter campaigns (GoPro accessories, fitness wearables). Survey email list before launch. Start with conservative pricing, can always add higher tiers. |
| **Press/media don't cover the launch** | High | Medium — limits reach | Don't depend on press. Focus on community-driven growth (Reddit, fitness forums, influencers). Press is a bonus, not the plan. |
| **Shipping costs higher than estimated** | Medium | High — eats into margins | Research shipping early. Use flat-rate estimates with regional pricing. Build shipping buffer into reward pricing. |
| **Solo founder burnout** | High | Very High — everything stops | Batch work (dedicate full days to one task type). Automate where possible (email sequences, social scheduling). Take at least 1 day off per week. Front-load campaign page content so campaign management is lighter. |

---

## Budget Summary

### Pre-Launch Costs (one-time and monthly)

| Item | Cost | Duration |
|---|---|---|
| Leonardo AI Pro | ~$12/mo | 1-2 months |
| Luma AI Dream Machine | $30/mo | 1-2 months |
| Runway Gen-4 | $28/mo | 1-2 months |
| Kling AI 1.6 | $25/mo | 1 month |
| ElevenLabs (VO) | $22/mo | 1 month |
| Suno AI (music) | $10/mo | 1 month |
| Adobe After Effects | $23/mo | 1-2 months |
| Figma | Free | — |
| DaVinci Resolve | Free | — |
| ironpal.co domain (Cloudflare Registrar) | ~$10-12/yr | 1 year |
| DigitalOcean droplet (shared with handlr-web) | $0 additional | Already running |
| Mailchimp (for launch email sequence) | Free (up to 500) | Launch week only |
| **Total pre-launch tools** | **~$200-350** | |

### Campaign Costs

| Item | Cost | Notes |
|---|---|---|
| Kickstarter fee | 5% of funds raised | Taken from pledges |
| Payment processing | 3-5% of funds raised | Stripe/PayPal via Kickstarter |
| Paid social ads (optional) | $100-500 total | Facebook, Instagram, Reddit |
| **Total campaign costs** | **8-10% of funds + $100-500 ads** | |

### Post-Campaign Costs

| Item | Cost | Notes |
|---|---|---|
| BackerKit (survey/fulfillment tool) | ~$0.20-0.50/backer | Optional but recommended |
| Hardware manufacturing | TBD | Depends on volume and supplier |
| Packaging | TBD | Design + print |
| Shipping | TBD | Regional pricing |

**Total estimated out-of-pocket before launch: $300-850** (ironpal.co hosting uses existing DigitalOcean droplet — no additional server cost)

---

## Key Dates Checklist

Fill in actual dates as you begin execution:

| Milestone | Target Date | Actual Date | Status |
|---|---|---|---|
| Phase 0 start (logo vectorization) | _______ | _______ | Not started |
| Logo files complete | _______ | _______ | Not started |
| Leonardo AI image generation complete | _______ | _______ | Not started |
| Image post-production complete | _______ | _______ | Not started |
| Video #2 (hero) rough cut | _______ | _______ | Not started |
| Video #2 final | _______ | _______ | Not started |
| Video #3 final | _______ | _______ | Not started |
| Video #6 final | _______ | _______ | Not started |
| ironpal.co domain registered | _______ | _______ | Not started |
| ironpal.co website deployed & live | _______ | _______ | Not started |
| Email capture form verified working | _______ | _______ | Not started |
| Email list hits 200 signups | _______ | _______ | Not started |
| Kickstarter pre-launch page active | _______ | _______ | Not started |
| Kickstarter page content complete | _______ | _______ | Not started |
| Press kit sent to media | _______ | _______ | Not started |
| Kickstarter followers hit 200 | _______ | _______ | Not started |
| **LAUNCH DAY** | _______ | _______ | Not started |
| First 48 hours — hit 30% funding | _______ | _______ | Not started |
| First week — hit 50% funding | _______ | _______ | Not started |
| First stretch goal unlocked | _______ | _______ | Not started |
| Campaign fully funded (100%) | _______ | _______ | Not started |
| Campaign ends | _______ | _______ | Not started |
| Backer surveys sent | _______ | _______ | Not started |

---

## Document References

| Document | Role in this plan |
|---|---|
| `docs/logo-design-concepts.md` | Logo specification — Phase 0 vectorization source |
| `docs/logo-review-feedback.md` | Logo QA criteria — Phase 0 quality checks |
| `docs/color-schemes.md` | Brand colors — all phases, especially campaign page design |
| `docs/body-mounted-image-prompts-updated.md` | Leonardo AI generation instructions — Phase 1 |
| `docs/body-mounted-video-prompts.md` | Video scripts and concepts — Phase 2 |
| `docs/video-production-execution-plan.md` | Detailed 18-day video production workflow — Phase 2 |
| `docs/Challenges_and_Solutions_BodyMounted.md` | Technical specs for campaign page — Phase 3, FAQ, feasibility questions |
| `input/images/logo/v4/` | Logo reference images for Leonardo AI Style Reference and post-production compositing |
| `../handlr/handlr-web/` | Reference implementation for website tech stack (React + Vite + Express + SQLite), email capture API, and deployment scripts |
| `../handlr/handlr-web/deployment/DEPLOYMENT_PRODUCTION_DIGITAL_OCEAN_PLAN.md` | Deployment guide pattern — adapt for ironpal.co on the same DigitalOcean droplet |
| `../handlr/handlr-web/server/index.js` | Reference for email capture Express API implementation |
| `../handlr/handlr-web/src/components/EmailModal.jsx` | Reference for email capture form UI component |
| `../handlr/handlr-web/deployment/deploy.sh` | Reference for automated deployment script |
