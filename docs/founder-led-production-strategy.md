# IronPal Kickstarter Video — Founder-Led Production Strategy

**Status:** Approved pivot — supersedes the synthetic-athlete approach
**Date:** 2026-05-04
**Owner:** Solo founder (you)
**Supersedes (in part):** `docs/video-production-execution-plan.md` (casting + AI usage sections); `docs/s3-shoot-plan.md` (actor); `docs/s3-post-production-pipeline.md` v1–v2 (subject-continuity strategy)

---

## 1. The Decision

> The IronPal Kickstarter hero video is **founder-led**: the founder is the on-camera campaign actor across S1–S7. AI is used only for **cutaways that cannot be filmed live** and for **post-production polish**. The synthetic-athlete approach (Leonardo/MJ-generated character across all hero shots) is retired.

---

## 2. Why

The previous strategy assumed a consistent synthetic athlete across all storyboard shots. Two failure modes killed it:

1. **Generating the synthetic athlete moving believably** — every full-AI attempt at S3 (the hero product reveal) failed (`docs/video-generation-analysis.md`, `docs/s3-clip-analysis.md`). Even with newer models the failure modes (shape morphing, floating physics, broken text) persist on physical-interaction shots.
2. **Swapping the founder onto a fixed synthetic character in post** — face-swap and body-swap tools (FaceFusion, DeepFaceLab, Wonder Dynamics) work passably on simple shots but produce mid-quality results on cinematic hero footage, with significant per-shot setup cost. Not feasible on solo-founder budget.

The fundable-Kickstarter-video bar is **not** "deepfake-perfect synthetic actors". It's **honest, well-shot footage with clean grade and confident editing**. Many funded hardware Kickstarters (Pebble, Nothing's early launches, Whoop, plenty of fitness brands) ship with the founder visibly on camera. Backers fund people; they do not fund stock characters.

---

## 3. What This Means In Practice

### 3.1 Casting
- **On-camera actor across S1–S7:** the founder.
- Same wardrobe palette across all shots (e.g. matte black or campaign-teal performance shirt) — locks visual continuity without needing a swap.
- No second actor needed for hero shots. Multi-athlete social proof (S6a–c) uses AI-generated cutaways of *different* anonymous athletes, not the founder — that variety is the point of S6.

### 3.2 AI's actual job
AI is reclassified from "primary content generator" to **two specific roles**:

- **Cutaways for impossible angles:** shots that cannot be self-filmed solo — top-down POVs, drone-style angles, multi-athlete diversity shots, environmental establishing shots, time-lapses.
- **Polish on live footage:** color grading via film-emulation, parallax/motion enhancement on locked-off shots, optional upscale, audio enhancement.

### 3.3 Storyboard reclassification (S1–S7)

| Shot | What it is | New approach |
|---|---|---|
| S1 | Athlete frustrated typing into workout app | **Live (founder)** — bench, phone, founder typing. |
| S2a | Close-up phone screen showing manual input | **Live + screen comp** — film founder's hand on phone; composite app UI in post (already planned). |
| S2b | Founder mid-set, distracted by phone | **Live (founder)** — gym bench, dumbbell, phone. |
| S2c | Frustration close-up | **Live (founder)** — face/eyes close-up, cool-grade. |
| S3 | Headband from gym bag (hero product reveal) | **Live (founder)** — already shot in-house; ships with founder visible per `docs/s3-post-production-pipeline.md` v3, with kitchen → gym BG replacement still required. |
| S4a | Bench press wearing headband | **Live (founder)** — at the gym, founder doing the lift, headband on, logo + LED composited in post. |
| S4b | Cable machine | **Live (founder)** — same recipe. |
| S4c | Dumbbell curls | **Live (founder)** — same recipe. |
| S4d | Weight stack POV | **AI cutaway** — first-person hand reaching to stack pin. Hand is anonymous (unbranded glove or just the founder's hand). Easier for AI than full body shots. |
| S5 | Athlete on bench checking phone | **Live (founder)** — at the gym, post-workout, phone in hand. App UI composited. |
| S6a–c | Social proof — diverse athletes | **AI cutaways** — three different AI-generated athletes (kettlebells / pull-ups / box jumps). Variety is intentional; founder is not in these. |
| S7 | Product beauty shot | **AI or stylized comp** — pure product, no human; either AI-generated or in-camera with controlled lighting + post comp. |

**Live shoots needed:** S1, S2a, S2b, S2c, S4a, S4b, S4c, S5 (and S3 already done). One gym day captures all of these.

**AI-generated:** S4d, S6a, S6b, S6c, S7. Five clips total — manageable cost.

### 3.4 What gets thrown away

- All previously-generated synthetic-athlete renders for S4a–S6c: throw away.
- The "consistent character" prompt scaffolding: throw away.
- Plans to AI-replace founder onto a fixed character: throw away.

### 3.5 What gets kept

- The S3 in-house shoot and selects (`input/kickstarter/storyboarding/S3/selects/`): **keep — ships as-is with founder visible**.
- The AI-generated cutaways that don't depend on character continuity (weight stack POV, beauty shot): **keep**.
- All logo / wordmark / LED composite work: **keep**.
- All color schemes, brand assets, storyboard frames, prompt sheets for non-character elements: **keep**.
- Storyboard structure, VO script, cut timing, audio plan: **keep** — none of this depends on who the actor is.

---

## 4. AI Toolkit — Mapped to Roles

| Role | Tool | Cost | Note |
|---|---|---|---|
| **Color grade — film emulation** | **Dehancer Pro** for Resolve | $79 perpetual / $5 monthly trial | Single biggest visual upgrade. Picks a real film stock (Kodak Vision3, Fuji, etc.) and applies grain/halation/curve. Two clicks. |
| (alternate) | **FilmConvert Nitrate** for Resolve | $179 perpetual | Comparable; Dehancer's grain model is generally preferred. |
| (free baseline) | **DaVinci Resolve Studio's built-in film LUTs** | $295 one-off (Studio) | Adequate without Dehancer/FilmConvert; both add ~10–15% perceived premium. |
| **Auto color match across shots** | **Resolve Neural Engine** (Studio) | included with Studio | "Match this clip to this reference" — eliminates the manual midtone-by-midtone match. |
| **Motion / parallax on locked-off shots** | **Runway Motion Brush** | ~$0.50–$1 per clip in credits | Adds subtle camera-style movement (slow push, parallax depth) to locked-off shots — eliminates the "static tripod" look. |
| **Stabilization** | **DaVinci Stabilizer** (free tier) or **Topaz Steadify** | free / $200 one-off | Free tier is adequate for tripod jitter; Topaz only if handheld B-roll. |
| **AI cutaway video generation** | **Kling 2.0** or **Luma Ray 2** (image-to-video) | ~$2–$5 per clip | For S4d, S6a–c, S7 — five clips, ~$15–25 total. |
| **Optional upscale** | **Topaz Video AI** | $300 one-off | Only if the footage looks soft after grade — usually unnecessary at 4K. |
| **Voiceover** | **ElevenLabs** | ~$5/mo for hobby tier | Already planned. |
| **Music score** | **Suno** or **Udio** | $10–24/mo | Royalty-free, sounds good. |
| **Dialog / audio cleanup** | **Adobe Podcast Enhance** (free) or Resolve Voice Isolation | free / Studio | Strips ambient gym noise from any captured dialog. |
| **AI relight (optional)** | **Beeble Switchlight** | ~$25/mo trial | Only if a shot's lighting is wrong and can't be re-shot. Mid-quality but improving. |

---

## 5. Production Discipline (the parts AI can't fix)

The polish stack above only works on footage that's already shot well. Five rules — non-negotiable:

1. **Light it.** One $50 LED panel + one bounce surface (white sheet/foam-board). Or shoot at golden hour in a window-lit gym. Never shoot under flat overhead fluorescents.
2. **Lock the camera.** Tripod for everything except deliberate handheld B-roll. Add motion in post via Motion Brush — much better than handheld jitter.
3. **Manual everything on the A52 Pro Video.** ISO 50–100, shutter 1/60 at 30fps, WB locked at 3000K, focus locked. No auto.
4. **Wardrobe + set.** Same wardrobe palette across all founder shots. Clean set — no domestic clutter, no competitor logos, no random gym junk in shot.
5. **Shoot 5–8 takes per shot.** 80% of polish comes from picking the best take, not from grading the only take.

---

## 6. Cost & Time Estimate

### 6.1 Dollar cost
| Item | Cost |
|---|---|
| Dehancer Pro (recommended) | $79 |
| Resolve Studio (recommended) | $295 |
| AI cutaways (5 clips × $5) | ~$25 |
| ElevenLabs hobby | $5 |
| Suno hobby | $10 |
| Cheap LED panel | ~$50 |
| **Total** | **~$465** |

Optional add-ons (Topaz, FilmConvert, Switchlight) push it to ~$800. Everything else (Resolve Free, Adobe Podcast, AI BG matte) is free.

### 6.2 Time
| Block | Time |
|---|---|
| Gym shoot day (S1, S2a–c, S4a–c, S5) | ~6 hours one day |
| AI cutaways (S4d, S6a–c, S7) — generation + selection | ~1 day |
| Per-shot post (grade, comp, polish) — 8 hero shots × ~2 hours each | ~16 hours over 3 days |
| Final assembly + audio mix + revisions | ~1–2 days |
| **Total** | **~7–10 working days** |

This compares to the synthetic-athlete pipeline's effectively-open-ended timeline of repeatedly re-generating and discarding failed AI shots.

---

## 7. Action Items (next 7 days)

- [ ] Buy Dehancer Pro and (recommended) Resolve Studio. ~$375.
- [ ] Buy a cheap LED panel + bounce board. ~$50.
- [ ] Confirm gym access — same gym used for all live shots so the location reads consistent.
- [ ] Build a shot list for the gym day from S1, S2a–c, S4a–c, S5 — include framing, focal length, action, takes target.
- [ ] Wardrobe — pick one matte black or campaign-teal performance shirt; same shirt every shot.
- [ ] Generate the 5 AI cutaways (S4d, S6a–c, S7) using current best models (Kling 2.0 / Luma Ray 2).
- [ ] Update `docs/s3-post-production-pipeline.md` to v3 (reflecting founder-visible delivery) — done in this same change.
- [ ] Decide whether to keep the kitchen-shot S3 hero (with kitchen → gym BG replacement) or re-shoot S3 at the gym day for free, in-camera.

---

## 8. What This Supersedes

This document overrides the *casting* and *AI-usage* assumptions in:

- `docs/video-production-execution-plan.md` — Section 3 ("Cast and crew") and Section 4 ("AI generation"). Treat the synthetic-athlete prompts and Wonder-Dynamics-style swap discussions as historical context.
- `docs/s3-shoot-plan.md` — references to "the actor" now mean the founder.
- `docs/s3-post-production-pipeline.md` v1–v2 — `§14 Subject Continuity` (any text about anonymizing or swapping the founder) is retired in v3.
- `docs/Challenges_and_Solutions_BodyMounted.md` — visual marketing assumptions about a synthetic athlete.
- All image / video prompt sheets that describe a generic synthetic athlete: re-prompt as needed for AI cutaways only; ignore for live shots.

The structural elements of those documents — storyboard order, VO script, cut timing, music plan, audio mix — are unaffected.
