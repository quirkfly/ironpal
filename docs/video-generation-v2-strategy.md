# AI Video Generation V2 — Revised Strategy

**Date:** 2026-04-20  
**Context:** V1 produced 66 clips, ~9-12% usable. See [video-generation-analysis.md](./video-generation-analysis.md) for the post-mortem.  
**Constraint:** 100% AI-produced. No filming. No live footage.  
**Goal:** Produce all 13 shots at Kickstarter-ready quality using a revised approach.

---

## What Went Wrong in V1 and How V2 Fixes It

| V1 Problem | Root Cause | V2 Fix |
|------------|-----------|--------|
| "IronPal" text garbled on headband | AI video models corrupt text during frame generation | **Never render text in AI video.** Generate text-free headband. Composite "IronPal" text + teal LED in After Effects (motion tracking). |
| Headband turned bright teal | Source images had teal text; model amplified the accent color to dominate | **New source images with plain black headband**, no teal elements. Add all teal branding in post-compositing. |
| No exercise motion (slideshow effect) | gen4_turbo produces camera drift, not body motion | **Switch to Seedance 2.0** (best dynamic motion) + **Runway Gen-4.5** (better physics). Use **video-to-video with stock footage** as motion reference. |
| Square aspect ratio from Kling | Source images were 1:1; Kling ignored aspect_ratio param | **Generate all source images in 16:9** (1280x720 or 1920x1080). |
| Character inconsistency across shots | Different faces generated per shot | **Use Wan 2.6 reference-to-video** or **Seedance character reference** to lock face across Group C shots. |
| S6c framed on legs only | AI recomposed during animation, lost upper body | **Use wider/safer compositions** in source images. Include more headroom. Avoid full-body action poses that AI may re-crop. |

---

## Core Strategy Changes

### 1. Text and Branding Are NEVER AI-Generated

This is the single most important rule. All current video diffusion models (Runway, Luma, Kling, Sora, Veo, Seedance) fail at text. This is an architectural limitation of diffusion, not a prompting problem.

**Rule:** Every source image and every prompt describes a **plain matte black headband with a small dark camera module**. No text. No teal accents. No LED glow.

All branding elements are added in post-compositing:
- "IronPal" text — motion-tracked onto headband in After Effects
- Teal LED dot — particle effect composited in After Effects
- Teal accent stripe — masked and color-graded in post

This is the same workflow used by every professional product video. It's software, not filming.

### 2. Video-to-Video with Stock Motion Reference

Instead of asking AI to invent exercise motion from a static image, we **feed it reference motion**:

1. Find a royalty-free stock clip of someone doing a bench press / cable fly / dumbbell curl (e.g., from Pexels, Pixabay, Artgrid)
2. Use that clip as **video-to-video input** on Seedance 2.0 or Runway Gen-4.5
3. The AI transforms the stock athlete into our styled scene while preserving the actual biomechanics

This solves the "slideshow effect" completely — the motion comes from real footage, the look comes from AI.

**Platforms with video-to-video:**
- **Seedance 2.0** — Upload reference video, replicate motion + camera. Best motion physics. `@Video1 for camera motion` syntax.
- **Runway Gen-4.5** — Video-to-video editing with extend and inpainting. Best cinematic polish.
- **Wan 2.6** — Reference-to-video with character preservation. Upload a character video, generate new scenes with that person.

### 3. 16:9 Source Images from the Start

All new source key frames will be generated in **1920x1080 or 1280x720 (16:9)** format. No more square images that get cropped or cause aspect ratio mismatches.

Use GPT Image 1.5 or FLUX 1.1 Pro with explicit resolution parameters.

### 4. Model Upgrades

| V1 Model | V2 Model | Why |
|----------|----------|-----|
| Runway gen4_turbo | **Seedance 2.0** (via Runway API) | Native video-to-video support. Upload reference video, replicate motion. 4-15s duration. Available as `seedance2` model in existing Runway API. |
| Luma Ray-2 | **Luma Ray3 Modify** / **Ray3.14** | Ray3 Modify is a dedicated V2V model — transforms stock footage while preserving original motion, blocking, and performance. Ray3.14 is the latest (native 1080p, 3x lower cost). |
| Kling v1.6 | **Kling 3.0** (`kling-v3` / `kling-v3-pro`) | Night-and-day motion improvement. **Motion Control 3.0** extracts motion paths from reference videos and applies to characters. **Subject Binding** locks character appearance across shots. Multi-shot mode for seamless transitions. |

**New capabilities that directly solve V1 failures:**
- **Kling 3.0 Subject Binding** — Locks face, clothing, body type across multiple shots. This solves Group C character consistency (S4a/S4c/S5) without workarounds.
- **Kling 3.0 Motion Control** — Feed a stock bench press clip, Kling extracts the motion path and applies it to our character image. Real biomechanics, AI-styled output.
- **Ray3 Modify** — Transforms real gym footage into our cinematic style while keeping the original performance intact. The athlete's motion, blocking, and expressions are preserved.
- **Seedance 2.0 via Runway API** — Uses existing Runway API key. Video-to-video with `@Video1 for camera motion` syntax. No new account needed.

---

## Revised Shot-by-Shot Plan

### Act 1: "The Old Way" (S1, S2a, S2b, S2c)

These shots worked reasonably well in V1. The main fixes are aspect ratio and motion.

| Shot | V1 Issue | V2 Approach |
|------|----------|-------------|
| **S1** | Square aspect ratio, but phone UI was good | Re-generate source image in 16:9. Keep on Kling or move to Seedance. Phone screen composited in post (Figma mockup). |
| **S2a** | Some variants lost the phone (head in hands instead) | Stronger prompt: explicitly state "holding phone in both hands, screen visible." Use video-to-video with a stock clip of someone sitting on bench looking at phone. |
| **S2b** | Phone tiny, frustration weak | Video-to-video with stock clip of woman at cable machine checking phone. Transform to our gym aesthetic. |
| **S2c** | Worked well in V1 (static UI) | Re-generate in 16:9. Minimal changes needed. Consider After Effects motion graphics instead of AI video (animated UI mockup with typing cursor). |

**S2c alternative:** Skip AI video entirely. Create the "manual input tedium" shot as a **screen recording animation in After Effects** — cursor clicking through fields, typing weights, tapping steppers. This is more effective than any AI output because it shows exact UI friction. This is software-produced, not filmed.

### Act 2: Transition (S3)

**V1 reassessment:** S3 was initially rated as one of the better V1 shots, but detailed frame-by-frame analysis (see `docs/s3-clip-analysis.md`) reveals that **all 6 clips are unusable**. Every variant suffers from shape morphing (headband becomes a rigid puck/speaker/visor), floating/detached physics, scale instability, object hallucination, and text degradation. The "hand pulling headband from bag" motion is a compound action that no current AI video model can execute — it requires simultaneous object manipulation, shape preservation, and text maintenance.

| Shot | V1 Issue | V2 Approach |
|------|----------|-------------|
| **S3** | Headband morphs into rigid disc/speaker during pull motion across ALL 6 variants. Text degrades or disappears. Objects hallucinated (wristwatch, extra LEDs). Floating physics. Scale instability. | **After Effects motion graphics (primary).** Use the excellent GPT Image 1.5 source frame as a static base. Apply parallax zoom, mask-animate the headband sliding upward, composite "IronPal" text as a tracked text layer, animate teal LED glow. **Fallback:** Kling 3.0 or Seedance 2.0 with **no pulling motion** — reframe as a beauty shot of headband resting on bag with camera-only drift. Composite text in post. |

**Why not AI video for S3:** The "pulling from bag" motion triggers compound object manipulation that causes shape collapse in all tested models. Even with video-to-video approaches, the headband's thin flexible form factor is unstable under animation. Camera-only motion (slow zoom, parallax) is the only motion type that AI video models handle reliably — but that means giving up the "reveal" narrative beat. After Effects motion graphics is the only way to have both the reveal motion and correct product appearance.

### Act 3: "The IronPal Way" (S4a, S4b, S4c, S4d)

These are the critical shots and V1's biggest failures. The complete rethink:

| Shot | V1 Issue | V2 Approach |
|------|----------|-------------|
| **S4a** | No pressing motion, text garbled | **Video-to-video.** Find stock bench press clip. Feed to Seedance 2.0 with style prompt. Plain black headband in prompt. Composite "IronPal" text + teal LED in AE. |
| **S4b** | No cable pull motion, headband turned teal | **Video-to-video.** Stock cable fly clip as reference. Plain black headband. All branding in post. |
| **S4c** | No curl motion, text garbled, different face from S4a | **Video-to-video.** Stock dumbbell curl clip. Ensure 16 KG label is in the stock clip or add in post. Plain black headband. Use Wan 2.6 character reference to match S4a face. |
| **S4d** | Worked well in V1 (square ratio only issue) | Re-generate source in 16:9. Keep approach but use Seedance for better hand motion. |

**Character consistency strategy for Group C (S4a, S4c, S5):**
- Option A: Use **Wan 2.6 reference-to-video** — upload a consistent character reference and generate all three shots with the same person.
- Option B: Use **Seedance 2.0 character reference** — lock face across generations.
- Option C: Accept different faces but unify with: same headband, same lighting/color grade, same wardrobe. Fast montage cuts (2-3s each) minimize noticeable differences.

### Act 4: Payoff (S5)

| Shot | V1 Issue | V2 Approach |
|------|----------|-------------|
| **S5** | Headband turned into bright teal collar, text garbled, different face | **Video-to-video.** Stock clip of man on bench looking at phone, relaxed smile. Transform with Seedance/Gen-4.5. Plain black headband around neck — no teal in source. Phone screen composited in post (Figma IronPal app mockup). "IronPal" text + teal LED composited in post. Match face to S4a via character reference. |

### Act 5: Social Proof (S6a, S6b, S6c)

These are quick 2-3 second montage cuts. V1's S6b (pull-up with cap) actually worked. S6a and S6c need fixing.

| Shot | V1 Issue | V2 Approach |
|------|----------|-------------|
| **S6a** | No kettlebell visible, headband text invisible | **Video-to-video.** Stock kettlebell swing clip. Ensure kettlebell is prominent in frame. Plain black headband. Composite branding in post. |
| **S6b** | Worked in V1 — cap with small logo was passable | Re-generate in 16:9. Keep similar approach. Consider Seedance for better pull-up motion. Composite clean "IronPal" text on cap in post. |
| **S6c** | Framed on legs only, no headband visible | **Video-to-video.** Stock box jump clip shot from **waist-up or 3/4 angle** (not low angle). Ensure headband and upper body are in frame throughout. |

### Act 6: End Card (S7)

| Shot | V1 Issue | V2 Approach |
|------|----------|-------------|
| **S7** | Actually good in V1! Text was crisp, product photography was premium. | Keep Runway Gen-4.5. This is AI video's sweet spot — slow product reveal with controlled lighting. Minor: ensure consistent teal glow intensity. |

---

## Post-Compositing Pipeline (All Software, No Filming)

Every clip goes through a compositing pass in After Effects or DaVinci Resolve Fusion:

### Layer 1: AI-Generated Base Video
The raw clip from Seedance/Runway/Luma — plain black headband, no text.

### Layer 2: "IronPal" Text Overlay
- Motion-track the headband position frame-by-frame (AE Point Tracker or Mocha)
- Apply "IronPal" text in the correct font, teal (#00CED1), with proper perspective distortion
- Match lighting/shadow to the headband surface

### Layer 3: Teal LED Glow
- Composite a small teal dot at the camera module position
- Add subtle glow/bloom effect (AE Optical Glow or similar)
- Animate subtle pulsing if desired

### Layer 4: Phone Screen Composite (S1, S2a, S2b, S5)
- Corner-pin the Figma app mockup onto the phone screen
- Match screen brightness to ambient lighting
- Add subtle screen reflections

### Layer 5: Color Grading
- "Old way" shots (S1-S2c): Cool blue-gray desaturated LUT
- "IronPal way" shots (S3-S7): Warm amber cinematic LUT
- Consistent grading unifies clips from different platforms

### Layer 6: On-Screen Text & Motion Graphics
- VO-3 beat labels: "SEES EXERCISES" / "READS WEIGHTS" / "COUNTS REPS"
- Workout summary stats animation
- End card with logo, CTA, Kickstarter badge

**Estimated compositing time:** 4-6 hours for all 13 shots using AE templates.

---

## Stock Footage Sourcing

For video-to-video reference clips, source from royalty-free libraries:

| Shot | Search Terms | Source |
|------|-------------|--------|
| S2a | "man sitting gym bench phone frustrated" | Pexels, Pixabay |
| S2b | "woman cable machine gym phone" | Pexels, Pixabay |
| S4a | "bench press close-up man gym" | Pexels, Artgrid |
| S4b | "cable fly woman gym" | Pexels, Artgrid |
| S4c | "dumbbell curl close-up man gym" | Pexels, Artgrid |
| S5 | "man sitting bench phone smiling gym" | Pexels, Pixabay |
| S6a | "kettlebell swing woman gym" | Pexels, Pixabay |
| S6b | "pull-up man gym" | Pexels, Pixabay |
| S6c | "box jump woman crossfit" | Pexels, Pixabay |

**Key requirements for stock clips:**
- Athlete wearing a headband or at least a head covering (hair band, sweatband) — makes the AI transformation to our headband more natural
- Well-lit gym environment
- Camera angle matching our storyboard composition
- 3-7 seconds, landscape orientation
- Royalty-free for commercial use

---

## Revised Model & Platform Assignments

| Shot | Platform | Model | Input Type | Duration | Why This Model |
|------|----------|-------|-----------|----------|----------------|
| S1 | Kling 3.0 | kling-v3-pro | Image-to-video | 5s | Good close-up control, V1 Kling S1 was decent |
| S2a | Kling 3.0 | kling-v3 + Motion Control | Video-to-video (stock ref) | 5s | Motion transfer from stock "man on bench with phone" |
| S2b | Kling 3.0 | kling-v3 + Motion Control | Video-to-video (stock ref) | 5s | Motion transfer from stock "woman at cable machine" |
| S2c | After Effects | N/A | Motion graphics (no AI video) | 5s | Screen recording animation — more effective than AI |
| S3 | After Effects | N/A (motion graphics) | Parallax + mask animation | 5s | AI video fails at object-pull motion. AE compositing with source image guarantees correct product shape + text. Fallback: Kling 3.0 beauty shot (no pull motion). |
| S4a | Kling 3.0 | kling-v3-pro + Motion Control + Subject Binding | Video-to-video (stock ref) | 5s | Motion from stock bench press. Subject Binding locks face for Group C. |
| S4b | Kling 3.0 | kling-v3 + Motion Control | Video-to-video (stock ref) | 5s | Motion from stock cable fly clip. |
| S4c | Kling 3.0 | kling-v3-pro + Motion Control + Subject Binding | Video-to-video (stock ref) | 5s | Motion from stock curl. Same Subject Binding as S4a. |
| S4d | Kling 3.0 | kling-v3-pro | Image-to-video | 5s | V1 was good, just needs 16:9 source. |
| S5 | Kling 3.0 | kling-v3-pro + Subject Binding | Video-to-video (stock ref) | 5s | Same Subject Binding as S4a/S4c. Stock "man on bench with phone smiling." |
| S6a | Ray3 Modify | ray-3 modify | Video-to-video (stock ref) | 5s | Transform stock kettlebell swing to our style. Quick montage cut. |
| S6b | Ray3 Modify | ray-3 modify | Video-to-video (stock ref) | 5s | Transform stock pull-up to our style. |
| S6c | Ray3 Modify | ray-3 modify | Video-to-video (stock ref) | 5s | Transform stock box jump. Preserve wide framing. |
| S7 | Runway | gen4.5 | Image-to-video | 5s | V1 S7 was the best output. Slow product reveal. |

**Primary platform shift: Kling 3.0** for hero shots (Motion Control + Subject Binding), **Ray3 Modify** for social proof montage (stock footage transformation), **Luma Ray3.14** for slow reveals.

**Key advantage:** Kling 3.0's Subject Binding solves character consistency across S4a/S4c/S5 natively — no workarounds needed. Upload one character reference, all three shots use the same face.

### Attempt Strategy Change

V1 generated 4-6 variants per shot of the same prompt. This produced 4-6 copies of the same problem.

**V2 approach: Iterate, don't replicate.**
- Generate **1-2 clips** per prompt
- Review immediately
- **Modify the prompt** based on what went wrong
- Generate 1-2 more
- Repeat until satisfied

Target: 3-4 prompt iterations per shot, 1-2 clips each = 4-8 clips per shot, but with progressive improvement.

---

## Revised Pipeline Code Changes

The existing pipeline at `scripts/video-gen/` needs:

1. **New client: `clients/seedance_client.py`** — Seedance 2.0 API wrapper with video-to-video support
2. **Config update** — Switch platform assignments, add `reference_video` field per shot
3. **Stock footage directory** — `input/kickstarter/stock_reference/` with sourced clips
4. **Post-compositing scripts** — Optional: automate AE render queue via ExtendScript

---

## Revised Budget Estimate

| Item | Cost |
|------|------|
| Seedance 2.0 API (10 shots x ~5 iterations x $0.10) | ~$5 |
| Runway Gen-4.5 API (S7 x 4 variants) | ~$2 |
| After Effects compositing (S3 — no API cost) | $0 |
| Stock footage (Pexels/Pixabay = free, or Artgrid ~$25/mo) | $0-25 |
| After Effects (already in tooling stack) | $0 (existing) |
| **Total V2 generation cost** | **~$8-33** |

Compare V1 spend of ~$20 for 66 mostly-unusable clips vs. V2 target of ~$8-33 for 13 properly-produced clips.

---

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Source 9 stock reference clips | 2-3 hours | `input/kickstarter/stock_reference/` |
| 2. Re-generate 16:9 source images (text-free) | 2-3 hours | Updated storyboard images |
| 3. Set up Seedance 2.0 API + client | 1-2 hours | `clients/seedance_client.py` |
| 4. V2 generation (iterative) | 3-4 hours | Raw AI clips |
| 5. Post-compositing (AE) | 4-6 hours | Final composited clips |
| 6. Assembly + VO + music | 3-4 hours | Final video |
| **Total** | **~15-22 hours** | **Kickstarter-ready video** |

---

## Success Criteria

| Criteria | Target |
|----------|--------|
| All 13 shots have usable output | 13/13 |
| "IronPal" text is crisp and readable in every headband/cap shot | 100% (composited, not AI-rendered) |
| Actual exercise motion visible in S4a-S4c, S6a-S6c | Real biomechanics from stock reference |
| Consistent 16:9 aspect ratio | All clips |
| Character consistency across S4a, S4c, S5 | Same or very similar face |
| Headband is matte black (not teal) in all shots | 100% |
| Total cost under $50 | Including stock footage |

---

## Key Insight

The V1 failure wasn't a pipeline failure — the code worked perfectly. It was a **creative strategy failure**: we asked AI video to do things it fundamentally cannot (render text, generate exercise motion, maintain product design fidelity). 

V2 succeeds by **splitting the work into what AI does well and what software does well:**

- **AI video does:** Scene transformation, cinematic lighting, slow product reveals, style transfer from stock footage
- **Post-compositing does:** Text rendering, brand colors, LED effects, phone screen UI, color grading
- **Motion graphics does:** App UI animation (S2c), on-screen labels, end card
- **Stock footage does:** Provide real human motion as reference input

No cameras needed. All software. All AI. Just smarter.

---

**Prepared by:** Video Content Producer  
**Status:** Ready for CD approval before implementation  
**Next step:** Source stock reference clips, set up Seedance 2.0 API access
