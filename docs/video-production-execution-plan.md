# IronPal Kickstarter Campaign — Video Production Execution Plan

## Overview

This execution plan covers the production of the three selected Kickstarter campaign videos using AI-assisted tooling. The primary focus is **Video #2: "Your Workout, Logged Before You Leave"** (the hero campaign video), with secondary coverage for **Video #3: "What the Camera Sees"** and **Video #6: "The Numbers"**.

**Production philosophy:** Maximize AI-generated and stock content. Minimize live production days. Use AI video generation (Luma AI Dream Machine, Runway Gen-4, Kling AI) for cinematic gym footage, product shots, and stylized sequences. Record voiceover remotely. Composite, grade, and edit in post.

**Target output:**
- Video #2: 75-90 seconds, hero campaign video
- Video #3: 60-75 seconds, "How It Works" section video
- Video #6: 75-90 seconds, "Why Back Us" / paid social ads video

---

## Team Roles

| Role | ID | Responsibilities |
|---|---|---|
| **Creative Director** | CD | Shot list approval, brand consistency, final cut sign-off |
| **AI Video Producer** | AVP | Prompt engineering for AI video tools, generation iterations, shot selection |
| **Motion Graphics Designer** | MGD | App UI mockups, kinetic typography, overlays, teal accent animations |
| **Script / Copy Writer** | SCW | Voiceover scripts, on-screen text, end card copy |
| **Voiceover Artist** | VO | Remote recording of narration tracks |
| **Video Editor** | VE | Assembly, color grading, timing, sound design, final export |
| **Product Designer** | PD | 3D renders of IronPal headband, cap, and camera module for compositing |

> In a small team, CD + AVP + VE may be the same person. MGD and SCW can also overlap. The plan assumes **2-3 people** handling all roles.

---

## AI Tooling Stack

| Tool | Purpose | Tier / Cost |
|---|---|---|
| **Luma AI Dream Machine** | Primary AI video generation — cinematic gym shots, athlete footage, product reveals | Pro plan ~$30/mo |
| **Runway Gen-4** | Secondary/fallback AI video generation — better for consistent character appearance across shots | Standard plan ~$28/mo |
| **Kling AI 1.6** | Alternative for long (10s) clips and slow-motion sequences | Pro plan ~$25/mo |
| **Midjourney v7** or **FLUX 1.1 Pro** | Key frame / reference image generation — product shots, gym environments, app UI mockups | ~$10-30/mo |
| **ElevenLabs** | AI voiceover generation (if not using a human VO artist) | Creator plan ~$22/mo |
| **CapCut Pro** or **DaVinci Resolve** | Video editing, color grading, assembly | Free (Resolve) or ~$10/mo (CapCut) |
| **Adobe After Effects** or **Motion** | Kinetic typography, UI animations, overlays | ~$23/mo (AE) or included w/ macOS (Motion) |
| **Suno AI** or **Udio** | AI-generated background music (royalty-free) | ~$10/mo |

**Estimated monthly tooling cost:** $100-170 for the production period.

---

# PHASE 1: VIDEO #2 — "Your Workout, Logged Before You Leave"

This is the top-ranked video and receives the most detailed breakdown.

## Competitor Reference: Fitbod

The "Old way" section of Video #2 specifically features **Fitbod** ([Google Play](https://play.google.com/store/apps/details?id=com.fitbod.fitbod)) as the representative competitor app that requires manual workout logging. Fitbod is a popular AI-powered workout planner (5M+ downloads, 4.5★) that still requires users to **manually input exercises, weights (lb/kg), and reps for every set**. This manual data entry creates friction during workouts — the exact problem IronPal solves.

**Key Fitbod pain points to emphasize in the "Old way" beat:**
- User must select each exercise from a list (or search for it)
- User must type in reps and weight for each set manually
- User must tap "Add Set" for additional sets
- User must configure equipment availability ahead of time
- App interrupts the workout flow — phone out between every set

**Reference screenshots:** `input/competition/fitbod/`
- `app_screenshot1.png` — Equipment customization screen (demonstrates setup complexity)
- `app_screenshot2.png` — Back Squat manual entry screen showing per-set reps/weight input fields (primary "Old way" reference)

> **Legal note:** Do not show the Fitbod logo, app icon, or brand name directly in the video. Do **NOT** use Fitbod screenshots (`input/competition/fitbod/`) as Leonardo AI reference images — this produces near-identical UI reproductions that constitute copyright infringement. The Fitbod screenshots serve as **internal design reference only** (for the Figma mockup designer). All AI image generation prompts must describe a **generic, visually distinct** competitor app with deliberate design differences (see "Leonardo AI Prompt Guidelines" below).

### Leonardo AI Prompt Guidelines for "Old Way" Competitor App

When generating images of the competitor workout app for shots S1, S2a-S2c, follow these rules:

1. **Do NOT use `input/competition/fitbod/app_screenshot2.png` as a Leonardo AI reference image.** It produces near-copies of Fitbod's UI.
2. **Do NOT mention "Fitbod" in any AI generation prompt.** Use "generic workout tracking app" or "manual workout log app" instead.
3. **Specify a distinct color scheme:** Use a muted burgundy/wine-red accent color on a dark charcoal (#1A1A2E) background — visually distinct from Fitbod's dark purple/navy palette.
4. **Specify a distinct layout:** Use a single-column card-based layout with slider inputs (not Fitbod's table-style numbered rows). Each exercise should appear as a separate card with "Reps" and "Weight" sliders or steppers.
5. **Specify distinct typography:** Use a rounded sans-serif font (not Fitbod's geometric sans-serif). Exercise names in lowercase, not bold italic.
6. **Add distinguishing UI elements:** Include a circular progress ring at the top (workout completion %), a bottom navigation bar with 4 generic icons, and a floating "+" button for adding exercises.
7. **No reference images needed:** Generate purely from text prompts. The AI should invent a plausible but generic workout app — not reproduce any existing one.

---

## Step 1: Scriptwriting & Voiceover Text

**Owner:** SCW  
**Duration:** Days 1-2

### Deliverables

1. **Voiceover script (final):**

   The video is 75-90 seconds. The voiceover is broken into **5 narration blocks** placed throughout, totaling ~35-40 seconds of narration. The remaining ~40-50 seconds are music + visuals + sound design only, giving the video breathing room and letting the imagery speak.

   | Block | Timecode | Duration | Section | Script | Notes |
   |---|---|---|---|---|---|
   | VO-1 | 0:00-0:08 | ~8s | "Old way" opening | *"Every set. Every rep. Every weight. You stop training… to start typing."* | Delivered deadpan/flat over the frustration montage. Short punchy sentences synced with typing SFX. Sets up the problem. |
   | VO-2 | 0:15-0:22 | ~7s | Transition + IronPal intro | *"What if you never had to log another workout? This is IronPal."* | Tone shifts — warmer, confident. Lands on the headband reveal (S3). "This is IronPal" syncs with teal LED activation. |
   | VO-3 | 0:30-0:42 | ~12s | IronPal montage (how it works) | *"A camera you wear. It sees every exercise. Reads every weight. Counts every rep — automatically."* | Narrates over S4a-S4d. Each claim aligns with a visual: exercise recognition → weight label → rep counting. Calm, confident cadence. |
   | VO-4 | 0:48-0:56 | ~8s | App reveal + payoff | *"When you're done, your workout is already logged. Every detail. Zero effort."* | Lands over S5 (athlete looking at phone with completed workout). Emotional payoff moment. |
   | VO-5 | 0:62-0:72 | ~10s | Social proof + CTA | *"Join thousands of athletes who train without typing. Back IronPal on Kickstarter — and never log a workout again."* | Delivered over S6a-c social proof montage into end card. Rising energy, clear call to action. |

   **Total narration:** ~45 seconds across 5 blocks.  
   **Silent/music-only gaps:** 0:08-0:15 (7s, frustration visuals breathe), 0:22-0:30 (8s, IronPal montage builds with music), 0:42-0:48 (6s, weight stack POV + transition to app), 0:56-0:62 (6s, music crescendo before social proof), 0:72-0:80 (8s, end card holds with logo + music).

   > **Pacing principle:** Never more than 12 seconds of continuous narration. Never more than 8 seconds of silence. The VO and music trade off — when VO is present, music dips; when VO is absent, music carries the energy.

2. **On-screen text cards:**
   - *0:00-0:08 (with VO-1):* No on-screen text — VO carries the message. Visuals of app typing are self-explanatory.
   - *0:30-0:42 (with VO-3):* Subtle teal text labels appear as VO names each capability: "SEES EXERCISES" → "READS WEIGHTS" → "COUNTS REPS" — each appearing for ~3 seconds, timed to the VO line.
   - *0:48-0:56 (with VO-4):* App workout log entries populate on the phone screen: "Bench Press / 80 kg / 3×10 ✓", "Cable Fly / 25 kg / 3×12 ✓", "Dumbbell Curl / 16 kg / 3×15 ✓"
   - *0:56-0:62 (music crescendo):* Workout summary stats float up: "Total Volume: 4,260 kg · 3 Exercises · 9 Sets · 38 min"
   - *0:72-0:80 (end card):* "Your workout, logged before you leave." / "Back us on Kickstarter" / IronPal logo

3. **Music brief:**
   - 0:00-0:08 (VO-1 over "old way"): Music low and muted, underscore only — VO is the focus. Lo-fi electronic, muted, drudgery mood.
   - 0:08-0:15 ("old way" visuals, no VO): Music comes up slightly — still muted lo-fi but carrying the energy. Frustration montage builds.
   - 0:15-0:20 (transition, VO-2 starts): Beat drop / silence / tonal shift. Music pulls back for the VO reveal.
   - 0:20-0:30 (IronPal montage, no VO): Music rises — confident, warm electronic beat builds. This is a visual-only energy ramp.
   - 0:30-0:42 (VO-3 over montage): Music dips to bed level, VO narrates how it works.
   - 0:42-0:48 (weight stack POV + transition, no VO): Music swells — building toward the payoff.
   - 0:48-0:56 (VO-4 over app reveal): Music drops to emotional bed — the payoff moment. VO delivers the "zero effort" line.
   - 0:56-0:62 (music crescendo, no VO): Music builds to a peak — transition into social proof.
   - 0:62-0:72 (VO-5 over social proof + CTA): Music sustains energy, VO delivers CTA.
   - 0:72-0:80 (end card): Music resolves to a final hit with the logo. No VO.

### Tasks

| # | Task | Owner | Output |
|---|---|---|---|
| 1.1 | Write voiceover script — 5 narration blocks with timecodes (VO-1 through VO-5) | SCW | Script document |
| 1.2 | Write all on-screen text strings (app UI, end card) | SCW | Text sheet |
| 1.3 | Write music brief for AI music generation or stock search | SCW + CD | Music brief |
| 1.4 | CD reviews and approves all copy | CD | Approved script |

---

## Step 2: Storyboarding & Reference Frame Generation

**Owner:** AVP + CD  
**Duration:** Days 2-4

### Approach

Generate **key frame reference images** using Midjourney or FLUX to establish the visual identity of each shot before generating video. These serve as both the storyboard and the image-to-video input for Luma/Runway.

### Shot-by-Shot Reference Image Plan

| Shot | Description | Image Prompt (Midjourney/FLUX) | Notes |
|---|---|---|---|
| S1 | Phone showing generic workout tracking app manual input screen | "Close-up of a smartphone screen showing a generic dark-mode workout tracking app with a charcoal background and muted burgundy accent color, card-based layout with exercise cards showing slider inputs for reps and weight, a circular progress ring at the top, a male thumb hovering over a weight stepper control, gym bench blurred in background, cool desaturated lighting, photorealistic" | Establish frustration — generic competitor app requires manual logging. **No reference image** — generate from text prompt only to avoid reproducing any existing app. |
| S2a | Athlete pausing bench press to log in workout app | "Photorealistic cinematic wide shot of an athletic male in a sleeveless black training shirt and shorts, seated upright straddling a flat weight bench with a loaded Olympic barbell racked on the uprights directly behind him, leaning slightly forward with elbows on knees, both hands holding a smartphone at chest height, thumb tapping the screen, tired and mildly annoyed expression, light sweat on forehead, commercial gym background with squat racks and dumbbells blurred out of focus, cool blue-gray color grading, 35mm lens, shallow depth of field, natural overhead gym lighting" | "Old way" beat — tedium of manual data entry mid-workout. **Keep the phone screen generic/blank in the AI generation — do NOT describe app UI details in this prompt.** Leonardo produces incoherent images when scene composition and invented app UI are combined in one prompt. The competitor app screen is composited onto the phone in post from the Figma mockup (same pattern as S1 — see row above). |
| S2b | Athlete at cable machine scrolling through exercise list on app | "Photorealistic cinematic medium shot of an athletic female in a black sports bra and leggings, standing beside a dual cable crossover machine with the cable handle hanging unused at her side, holding a smartphone in one hand at waist height, looking down at the screen with a frustrated, impatient expression, free hand resting on hip, commercial gym interior with weight plates and benches blurred out of focus, cool desaturated blue-gray color grading, 50mm lens, shallow depth of field, natural gym lighting" | "Old way" beat — finding and selecting the right exercise is tedious. **Keep the phone screen generic/blank in the AI generation — do NOT describe app UI details in this prompt.** Leonardo produces incoherent images when scene composition and invented app UI are combined. The competitor app screen (long exercise list) is composited onto the phone in post from the Figma mockup (same pattern as S1/S2a). |
| S2c | Generic workout app with multiple manual input fields | "Smartphone screen close-up showing a generic dark-mode workout tracking app on charcoal background with muted burgundy accents, card-based layout with three exercise cards each showing empty stepper fields for reps and weight, a circular progress ring at 40% at the top, rounded sans-serif font, a floating '+' button at bottom right, gym floor blurred behind, cool lighting" | "Old way" beat — visual evidence that every rep, weight, and set must be typed in by hand. **No reference image** — generate from text prompt only. |
| S3 | Athlete picks up IronPal headband from gym bag | "Athlete's hand reaching into a black gym bag pulling out a matte black headband with a tiny camera module and teal 'IronPal' text on the side, warm golden gym lighting, cinematic close-up, shallow DOF" | Transition moment — color shift to warm |
| S4a | Bench press with headband, focused | "Athletic male performing bench press wearing a matte black headband with small camera module, glowing teal LED, and teal 'IronPal' text clearly visible on the side, warm vibrant gym lighting, cinematic, no phone in sight, focused expression, IronPal logo prominently placed on the headband in a clean modern font, consistent teal brand color" | IronPal montage — logo and 'IronPal' text clearly visible on headband to reinforce brand identity |
| S4b | Cable machine, smooth set | "Athletic female performing cable fly in a modern gym, wearing matte black headband with teal LED glowing and teal 'IronPal' text clearly visible on the side, warm cinematic lighting, smooth motion, focused and confident, IronPal logo prominently placed on the headband in a clean modern font, consistent teal brand color" | IronPal montage — logo and 'IronPal' text clearly visible on headband to reinforce brand identity |
| S4c | Dumbbell curls | "Close-up of an athlete performing dumbbell curls, matte black headband with teal LED and teal 'IronPal' text clearly visible on the side, warm vibrant gym lighting, 16 KG label visible on dumbbell, cinematic, IronPal logo prominently placed on the headband in a clean modern font, consistent teal brand color" | IronPal montage — weight label visible, logo and 'IronPal' text clearly visible on headband to reinforce brand identity |
| S4d | Weight stack POV (simulated) | "First-person POV looking at a gym weight stack, a hand reaching to move a yellow pin into the '50' slot, numbers clearly visible on metal plates, warm lighting, slightly eye-level angle" | Simulated camera view |
| S5 | Athlete on bench looking at phone with app | "Athletic male sitting on gym bench, matte black headband around neck, holding smartphone showing a teal-accented workout log app with exercise cards populating, warm amber gym lighting, impressed subtle smile, cinematic" | Payoff moment |
| S6a-c | Social proof — diverse athletes | "Athletic [female/male] wearing matte black [headband/cap] with teal LED glowing, mid-exercise in a [modern/gritty/bright] gym, warm lighting, cinematic, focused" (3 variants) | Quick montage — diversity in body type, gender, gym setting |
| S7 | End card product shot | "IronPal matte black headband and baseball cap with teal accents and teal logo laid on dark slate surface, small camera module between them with glowing teal LED, dramatic side lighting, product photography, dark background" | Final beauty shot |

### Tasks

| # | Task | Owner | Output |
|---|---|---|---|
| 2.1 | Write image prompts for all 12-14 key frames | AVP | Prompt sheet |
| 2.2 | Generate key frames in Midjourney/FLUX (3-5 variants per shot) | AVP | ~50-70 images |
| 2.3 | Select best variant per shot, arrange into storyboard sequence | AVP + CD | Visual storyboard (PDF/slide deck) |
| 2.4 | Identify which shots need character/face consistency (same athlete) | AVP | Consistency plan |
| 2.5 | Generate additional angle/variation images for any rejected shots | AVP | Revised images |
| 2.6 | CD approves final storyboard | CD | Approved storyboard |

---

## Step 3: AI Video Generation

**Owner:** AVP  
**Duration:** Days 4-8

### Approach

Use approved key frame images as **image-to-video** inputs in Luma AI Dream Machine and/or Runway Gen-4. Each shot becomes a 4-10 second AI-generated video clip. Generate multiple variations per shot and select the best take.

### Generation Plan

| Shot | Duration | AI Tool | Generation Method | Expected Attempts |
|---|---|---|---|---|
| S1 — Generic workout app manual input close-up | 4-5s | Runway Gen-4 + composite | Image-to-video (close-up of phone with generic dark workout app UI, thumb tapping weight stepper). **Do NOT use Fitbod screenshots as reference.** Generate from text prompt describing charcoal/burgundy card-based app. Composite the Figma-designed generic competitor app screen onto the phone in post. | 3-5 |
| S2a — Bench press pause to log in app | 3-4s | Luma Dream Machine | Image-to-video (athlete sits up, grabs phone, starts typing reps/weight) | 5-8 |
| S2b — Cable machine exercise search | 3-4s | Luma Dream Machine | Image-to-video (athlete scrolling through exercise list on phone, frustrated) | 5-8 |
| S2c — Manual set-by-set entry screen | 3s | Screen recording + composite | Record the Figma-designed generic competitor app mockup (charcoal/burgundy, card-based, slider/stepper inputs). **Do NOT use Fitbod screenshots as Leonardo AI reference.** The Figma mockup is designed from scratch to be visually distinct. | 1 |
| S3 — Headband from gym bag | 5s | Luma Dream Machine | Image-to-video (hand pulls headband, teal LED lights) | 5-8 |
| S4a — Bench press w/ headband | 5-6s | Luma Dream Machine | Image-to-video (athlete pressing, headband visible) | 5-8 |
| S4b — Cable fly w/ headband | 4-5s | Runway Gen-4 | Image-to-video (smooth cable motion) | 5-8 |
| S4c — Dumbbell curls | 4-5s | Luma Dream Machine | Image-to-video (curl motion, label visible) | 5-8 |
| S4d — Weight stack POV | 4s | Kling AI | Image-to-video (hand moves pin, POV angle) | 3-5 |
| S5 — App reveal on phone | 6-8s | Screen recording + composite | Animated app UI (After Effects) composited onto phone in AI scene | 1 + composite |
| S6a-c — Social proof athletes | 3s each | Luma Dream Machine | Image-to-video (3 separate athletes, different gyms) | 4-6 each |
| S7 — Product beauty shot | 5s | Runway Gen-4 | Image-to-video (slow dramatic lighting sweep) | 3-5 |

**Total estimated generation runs:** 50-80 across all tools.  
**Estimated generation time:** 2-4 days (batching runs, reviewing overnight).

### Key Technical Considerations

- **Character consistency:** Current AI video tools (as of early 2026) struggle with exact face/body consistency across shots. Mitigation:
  - Use Runway Gen-4's character reference feature to lock a face across shots S2a, S4a, S4b, S4c, S5.
  - For the "old way" section (S2a-S2c), different athletes are acceptable (montage of frustration).
  - For the "IronPal way" section (S4a-S5), attempt to use the same face reference and accept minor variation as long as the headband remains visually prominent to anchor identity.

- **Product accuracy:** AI tools will approximate the headband/cap but won't render the IronPal logo or teal LED perfectly. Mitigation:
  - Composite the teal LED glow in post (After Effects — simple radial glow layer).
  - Overlay the "IronPal" text on the headband in post if AI misses it.
  - For the product beauty shot (S7), consider using a 3D render from PD instead of AI generation for pixel-perfect brand accuracy.

- **Motion artifacts:** AI-generated gym footage may have warping on barbells, cables, or hands. Mitigation:
  - Generate more takes per shot (budget 5-8 attempts).
  - Favor slow-motion output — slower movement = fewer artifacts.
  - Use only 2-4 second segments from each generation (trim the best window).

### Tasks

| # | Task | Owner | Output |
|---|---|---|---|
| 3.1 | Set up accounts on Luma AI, Runway Gen-4, Kling AI | AVP | Active accounts |
| 3.2 | Generate all shots (batch 1 — first attempt for all 12 shots) | AVP | ~40 video clips |
| 3.3 | Review batch 1, identify shots needing re-generation | AVP + CD | Selection notes |
| 3.4 | Generate batch 2 (re-runs for weak shots, alternate angles) | AVP | ~20-30 additional clips |
| 3.5 | Final shot selection — best take per shot | AVP + CD | 12-14 approved clips |
| 3.6 | Export all approved clips at max resolution (1080p minimum) | AVP | Final clip library |

---

## Step 4: App UI & Motion Graphics

**Owner:** MGD  
**Duration:** Days 3-7 (parallel with Step 3)

### Deliverables

1. **Competitor App UI Mockup ("Old Way" Screen)** — A generic dark-mode workout tracking UI for the "old way" shots (S1, S2c). Design in Figma using `input/competition/fitbod/app_screenshot2.png` as *internal UX reference only* (understand the manual entry paradigm) but with deliberately distinct visual design:
   - Charcoal (#1A1A2E) background with muted burgundy/wine-red accents (not Fitbod's dark purple/navy)
   - Card-based exercise layout with slider/stepper inputs for reps and weight (not Fitbod's numbered table rows)
   - Rounded sans-serif font, exercise names in lowercase (not Fitbod's bold italic)
   - Circular workout progress ring at top
   - Floating "+" button for adding exercises
   - Bottom navigation bar with 4 generic icons
   - **Must NOT resemble Fitbod's UI when used as Leonardo AI reference image**

2. **IronPal App UI Mockup** — A realistic phone app interface showing:
   - Workout log with exercise cards (teal accents, checkmarks)
   - Live card population animation (cards sliding in one by one)
   - Workout summary screen (total volume, exercise count, duration)
   - Design language: dark mode, teal accent (#00CED1 or similar), clean sans-serif font, card-based layout

2. **App Screen Recording** — A 10-15 second screen recording of the app mockup animating (for composite onto the phone in shot S5). Created in Figma/After Effects as a prototype animation.

3. **Teal LED Glow Effect** — A compositing-ready teal radial glow element (PNG sequence or After Effects preset) for overlaying on the headband in any shot where the LED isn't visible enough.

4. **IronPal Logo Animation** — A simple logo reveal for the end card: the word "IronPal" fading in with a teal LED pulse effect.

5. **End Card Template** — Dark background, centered IronPal logo, tagline text, "Back us on Kickstarter" CTA.

### Tasks

| # | Task | Owner | Output |
|---|---|---|---|
| 4.1 | Design generic competitor app UI mockup in Figma — **must be visually distinct from Fitbod**: use charcoal (#1A1A2E) background with muted burgundy/wine-red accents, card-based exercise layout with slider/stepper inputs (not table rows), rounded sans-serif font, circular progress ring, floating "+" button. Use `input/competition/fitbod/app_screenshot2.png` as *internal reference only* (understand the UX paradigm of manual entry) but deliberately diverge on colors, typography, and layout | MGD | Figma file |
| 4.2 | Design IronPal app UI mockup in Figma (workout log + summary) | MGD | Figma file |
| 4.3 | Animate competitor app UI — thumb typing reps and weight (for S2c composite) | MGD | Screen recording (MP4) |
| 4.4 | Animate IronPal app UI — cards populating, summary appearing | MGD | Screen recording (MP4) |
| 4.5 | Create teal LED glow composite element | MGD | PNG sequence / AE preset |
| 4.6 | Create IronPal logo reveal animation | MGD | AE project / MP4 |
| 4.7 | Create end card template | MGD | AE project / PNG |
| 4.8 | Export all motion graphics assets at 1080p or 4K | MGD | Asset package |

---

## Step 5: Voiceover Production

**Owner:** SCW + VO  
**Duration:** Days 5-7

### Option A: Human Voiceover (Preferred)

- Hire a voice actor via Fiverr, Voices.com, or similar platform.
- Brief: Male or female voice, age 25-35, warm and confident tone, slight conversational feel — not "radio announcer" or "movie trailer." Think: tech product launch narration (Apple keynote energy but slightly more personal).
- Deliver the approved script (5 blocks: VO-1 through VO-5, ~45 seconds total). Request 2-3 takes per block with slight variation in pacing.
- Budget: $100-250 for a 45-second multi-block read.

### Option B: AI Voiceover (Recommended for MVP / Solo Founder)

For a solo founder on a tight budget and timeline, AI voiceover is the practical first choice. Generate all 5 blocks in-house, iterate rapidly, and only hire a human VO artist if the AI output isn't good enough after tuning.

#### Recommended AI Voiceover Tools

| Tool | Tier / Cost | Best For | Key Features |
|---|---|---|---|
| **ElevenLabs** (Primary) | Creator plan ~$22/mo (100K chars/mo) | Primary VO generation — best-in-class naturalness, emotional range, and fine-grained control | Voice cloning, voice design, per-sentence emotion tags, speed/stability/similarity sliders, Projects mode for long-form with per-block settings |
| **PlayHT 2.0** (Alternative) | Creator plan ~$30/mo | Fallback if ElevenLabs voices don't fit the brand tone | Ultra-realistic voices, emotion presets (happy, sad, angry, calm), SSML support for fine pacing control |
| **Speechify Studio** (Alternative) | ~$10-29/mo | Quick drafts and A/B testing of different voice styles | 200+ voices, simple UI, good for rapid prototyping before committing to a voice |

**Primary recommendation: ElevenLabs.** It offers the best combination of voice quality, emotional control, and per-block parameter tuning needed for this project.

#### ElevenLabs Workflow — Step by Step

**1. Voice Selection**

Browse ElevenLabs' Voice Library (community voices) or use Voice Design to create a custom voice. Filters to apply:

| Criterion | Recommended Setting |
|---|---|
| Gender | Male or female — test both. Male tends to register as "tech product," female as "approachable/warm." Either works for IronPal. |
| Age | 25-35 — young adult, energetic but not juvenile |
| Accent | Neutral American English or light British — avoid strong regional accents |
| Use case | "Narration" or "Marketing" |
| Style | Conversational, confident, warm — NOT corporate/announcer/dramatic |

**Recommended starting voices (ElevenLabs library):**
- **"Josh"** — Male, warm, conversational, tech-product narration feel
- **"Rachel"** — Female, clear, confident, slight warmth
- **"Adam"** — Male, deep, authoritative but approachable
- **"Aria"** — Female, modern, energetic, good for CTA delivery

Generate all 5 blocks with 2-3 different voices and compare them against the rough cut before committing.

**2. Per-Block Parameter Settings**

Each VO block has a different emotional register. Adjust ElevenLabs' sliders per block:

| Block | Emotional Register | Stability | Similarity Boost | Style Exaggeration | Speed | Notes |
|---|---|---|---|---|---|---|
| **VO-1** (0:00-0:08) — Frustration opener | Deadpan, flat, slightly weary | 0.70 | 0.80 | 0.20 (low) | 0.90x (slower) | Deliberately understated. Short sentences. Add "..." pauses between phrases in the script: *"Every set... Every rep... Every weight... You stop training… to start typing."* |
| **VO-2** (0:15-0:22) — Warm reveal | Warm, confident, slight wonder | 0.50 | 0.75 | 0.45 (medium) | 1.00x (normal) | Tone shift is critical — must feel like a new chapter. "This is IronPal" should land with quiet conviction, not hype. |
| **VO-3** (0:30-0:42) — How it works | Calm, explanatory, steady confidence | 0.60 | 0.80 | 0.30 (low-medium) | 0.95x (slightly slow) | Measured cadence. Each feature claim gets its own breath: *"It sees every exercise. [pause] Reads every weight. [pause] Counts every rep — automatically."* |
| **VO-4** (0:48-0:56) — Emotional payoff | Warm pride, satisfaction | 0.45 | 0.75 | 0.50 (medium-high) | 0.90x (slower) | The most emotionally resonant block. "Zero effort" should land with emphasis. Allow the voice to soften slightly — this is the "aha" moment. |
| **VO-5** (0:62-0:72) — CTA | Energetic, forward-leaning, direct | 0.55 | 0.80 | 0.55 (medium-high) | 1.05x (slightly fast) | Rising energy. "Back IronPal on Kickstarter" must sound like an invitation, not a sales pitch. "Never log a workout again" is the final hook — let it ring. |

> **Stability slider:** Lower = more expressive/emotional variation. Higher = more consistent/flat. For VO-1 (deadpan), keep higher. For VO-4/5 (emotional), keep lower.
>
> **Style Exaggeration slider:** Controls how much the voice leans into emotional coloring. Keep low for informational blocks (VO-1, VO-3), push higher for emotional/CTA blocks (VO-4, VO-5).

**3. Script Formatting for Natural Delivery**

Format the script with explicit pacing cues before pasting into ElevenLabs:

```
VO-1:
Every set... Every rep... Every weight...
You stop training — to start typing.

VO-2:
What if... you never had to log another workout?
This is IronPal.

VO-3:
A camera you wear.
It sees every exercise.
Reads every weight.
Counts every rep — automatically.

VO-4:
When you're done...
your workout is already logged.
Every detail. Zero effort.

VO-5:
Join thousands of athletes who train without typing.
Back IronPal on Kickstarter —
and never log a workout again.
```

**Tips:**
- Put each sentence on its own line — ElevenLabs treats line breaks as natural pause points.
- Use "..." for longer pauses (0.3-0.5s) and "—" for shorter dramatic pauses.
- Use ElevenLabs' **Projects** mode (not the simple text-to-speech box) — it lets you regenerate individual sentences without re-generating the entire block.
- Generate each block as a **separate project** to apply different voice settings per block.

**4. Quality Checklist**

Before approving an AI-generated VO take, check:

- [ ] No robotic artifacts — no metallic buzz, clipping, or unnatural vowel stretching
- [ ] Pacing feels human — no rushed words, no unnaturally long pauses
- [ ] Emphasis lands on the right words: "IronPal" (VO-2), "automatically" (VO-3), "Zero effort" (VO-4), "never" (VO-5)
- [ ] Tone shifts between blocks are audible but not jarring — VO-1→VO-2 should feel like sunrise, not a jump cut
- [ ] Total narration duration is within target: ~45 seconds (±3s)
- [ ] Each block fits its timecode window when placed against the rough cut
- [ ] No awkward word pronunciations (test: "IronPal" — should be "EYE-run-pal," not "EYE-ron-pal")

**5. Custom Pronunciation**

Add pronunciation overrides in ElevenLabs for brand terms:
- **IronPal** → `<phoneme alphabet="ipa" ph="aɪɹənpæl">IronPal</phoneme>` (or simply spell it as "Iron Pal" with a space if the model mispronounces)
- **Kickstarter** → usually fine, but verify
- **kg** → generate as "kilograms" or "kg" depending on which sounds more natural at speed

**6. Export Settings**

- Export each block as a separate WAV file (48kHz, 24-bit) for maximum editing flexibility
- Naming convention: `vo-1-frustration-v3.wav`, `vo-2-reveal-v2.wav`, etc.
- Keep 0.5s of silence at the head and tail of each file for clean editing in the timeline

#### Cost Estimate (AI Voiceover)

| Item | Cost |
|---|---|
| ElevenLabs Creator plan (1 month) | $22 |
| Estimated character usage: ~45s of narration × ~150 words × 5 chars/word × 5-10 iterations = 18,750-37,500 chars | Well within 100K/mo limit |
| **Total** | **$22** |

> If the AI voiceover quality is acceptable after tuning, this saves $80-230 compared to hiring a human voice actor. If not, the AI generations serve as an excellent reference/temp track for briefing a human VO artist.

### Tasks

| # | Task | Owner | Output |
|---|---|---|---|
| 5.1 | Set up ElevenLabs account (Creator plan), test 3-4 voices with VO-2 script ("This is IronPal") as audition line | SCW | Shortlisted voices |
| 5.2 | Generate all 5 blocks with top 2 voice candidates, adjust per-block parameters per the settings table above | SCW | 10 VO drafts (2 voices × 5 blocks) |
| 5.3 | Place draft VO blocks against rough cut, evaluate sync and tone — select winning voice | SCW + CD | Voice selection |
| 5.4 | Iterate on winning voice: re-generate weak blocks, fine-tune stability/speed/style per block | SCW | Refined VO blocks |
| 5.5 | Run quality checklist on all 5 final blocks (artifacts, pacing, emphasis, pronunciation) | SCW + CD | QC pass |
| 5.6 | If AI VO quality is insufficient: post human voice actor brief on Fiverr/Voices.com using AI drafts as reference/temp track | SCW | Job listing (fallback) |
| 5.7 | Export final VO blocks as separate WAV files (48kHz, 24-bit) | SCW | 5 WAV files |

---

## Step 6: Music Production

**Owner:** VE + CD  
**Duration:** Days 5-7 (parallel with VO)

### Approach

Generate AI music using Suno AI or Udio, guided by the music brief from Step 1.

### Tracks Needed

| Segment | Duration | Mood | Prompt Keywords |
|---|---|---|---|
| Part A — "Old way" | ~15s | Muted, off-beat, slightly awkward, lo-fi electronic | "lo-fi electronic, muted, slightly awkward rhythm, gym frustration, desaturated mood, 85 bpm" |
| Part B — Transition sting | 2-3s | Tonal shift, beat drop, rising energy | "transition sting, beat drop to silence then rising electronic synth, tonal shift" |
| Part C — "IronPal way" + payoff | ~40s | Confident driving electronic, building, no lyrics, tech product | "confident electronic beat, rising energy, tech product launch, cinematic, no lyrics, clean, 120 bpm, building to crescendo" |
| Part D — Social proof + end | ~15s | Sustained confidence, slight fade | Continuation of Part C, gentle fade to final beat |

**Alternative:** License a royalty-free track from Artlist or Epidemic Sound ($15-20/mo) that has a natural energy shift built in.

### Tasks

| # | Task | Owner | Output |
|---|---|---|---|
| 6.1 | Generate 5-10 music candidates using Suno AI/Udio | VE | Raw music tracks |
| 6.2 | Select best candidate or combine segments | VE + CD | Draft music track |
| 6.3 | Edit music to match video timing (cut points, beat sync) | VE | Timed music track |
| 6.4 | CD approves music | CD | Approved track |

---

## Step 7: Assembly & Post-Production

**Owner:** VE  
**Duration:** Days 8-12

### Editing Workflow

**Tool:** DaVinci Resolve (free) or CapCut Pro.

#### 7.1 — Rough Cut (Day 8-9)

1. Import all AI video clips, motion graphics assets, voiceover, and music into the timeline.
2. Assemble shots in sequence order following the shot list:
   - S1 → S2a → S2b → S2c → S3 (transition) → S4a → S4b → S4c → S4d → S5 → S6a-c → S7 → End card
3. Rough-time each shot to the music beats. The transition at [0:15-0:20] must align with the music shift.
4. Place voiceover blocks (VO-1 through VO-5) at planned timecodes. Verify each block syncs with its target visuals:
   - VO-1 (0:00-0:08) over S1/S2a frustration shots
   - VO-2 (0:15-0:22) over S3 headband reveal
   - VO-3 (0:30-0:42) over S4a-S4d IronPal montage
   - VO-4 (0:48-0:56) over S5 app reveal
   - VO-5 (0:62-0:72) over S6a-c social proof into end card
5. Export rough cut for CD review.

#### 7.2 — Color Grading (Day 9-10)

1. **\"Old way\" / manual logging section (0:00-0:15, VO-1 at 0:00-0:08 then music-only 0:08-0:15):** Apply a cool, desaturated LUT. Lower saturation by 20-30%. Add subtle blue tint. The mood should feel dull and frustrating — the tedious cycle of workout-then-type. The phone screen should be the brightest element in frame, pulling attention to the manual input UI.
2. **Transition (0:15-0:22, VO-2 delivers \"This is IronPal\"):** Grade the headband close-up warm — shift color temperature toward golden/amber. The teal LED should pop against the warm background.
3. **\"IronPal way\" section (0:22-0:56, VO-3 at 0:30-0:42, VO-4 at 0:48-0:56):** Warm, vibrant grading. Slightly lifted shadows, rich skin tones, teal accents preserved. The mood should feel alive and exciting.
4. **Social proof montage (0:56-0:72, VO-5 at 0:62-0:72):** Consistent warm grading across the three athlete shots. Teal LED glow normalized.
5. **End card (0:72-0:80, music-only):** Dark, product-photography look. Clean blacks, teal logo crisp.

#### 7.3 — Compositing & Overlay (Day 10-11)

1. Composite the **teal LED glow** onto any headband/cap shots where the AI didn't render it visibly enough. Use a soft radial glow keyed to the lens position.
2. Composite the **"IronPal" text** on the headband/cap if not rendered by AI. Track motion to the headband surface.
3. Composite the **app UI animation** onto the phone screen in shot S5. Use corner-pin tracking to match the phone's angle.
4. Add the **IronPal logo animation** to the end card.
5. Add subtle on-screen text for the workout log entries if the app UI composite isn't readable at small scale.

#### 7.4 — Sound Design (Day 11)

1. Add subtle sound effects:
   - Typing/tapping sounds during the "old way" phone shots (emphasize the repetitive tap-tap-tap of manual data entry into the Fitbod-style app — reps, weight, confirm, reps, weight, confirm)
   - A clean "click" for the headband snap-in (S3)
   - A soft electronic "activation" chime for the teal LED lighting up
   - UI swoosh sounds for the app cards populating
   - Ambient gym sounds (low-level, mixed under the music)
2. Balance voiceover, music, and sound effects. VO sits on top during narration blocks (VO-1 through VO-5); music ducks -6dB under VO. During VO-free gaps (0:08-0:15, 0:22-0:30, 0:42-0:48, 0:56-0:62, 0:72-0:80), music comes to full level. SFX as accents throughout.

#### 7.5 — Final Cut & Export (Day 12)

1. Final timing pass — every cut lands on a beat.
2. Check brand consistency — teal LED visible in every IronPal shot, logo readable in at least 3 shots.
3. Export at 1080p 30fps (Kickstarter standard) and 4K 30fps (future-proofing).
4. Export a 30-second cutdown for social media teasers (best moments from the IronPal section + end card).
5. Export a vertical 9:16 version for Instagram Reels / TikTok.

### Tasks

| # | Task | Owner | Output |
|---|---|---|---|
| 7.1 | Rough cut assembly | VE | v1 rough cut |
| 7.2 | CD reviews rough cut, provides feedback | CD | Feedback notes |
| 7.3 | Color grading (cool→warm shift) | VE | Color-graded timeline |
| 7.4 | Composite teal LED, IronPal logo, app UI onto shots | VE + MGD | Composited timeline |
| 7.5 | Sound design — SFX, ambient, VO/music balance | VE | Sound-designed timeline |
| 7.6 | Final cut — timing polish | VE | v2 final cut |
| 7.7 | CD final review and approval | CD | Approved final |
| 7.8 | Export all formats (1080p, 4K, 30s cutdown, vertical) | VE | Delivery package |

---

# PHASE 2: VIDEO #3 — "What the Camera Sees"

Production runs **Days 10-16** (overlaps with Phase 1 final edit).

## Key Differences from Video #2

| Aspect | Video #2 | Video #3 |
|---|---|---|
| Footage type | All third-person gym shots | **Split-screen: third-person + first-person POV** |
| Biggest challenge | Character consistency | POV footage authenticity |
| App UI | Workout log + summary | Workout log + **real-time detection overlay** |
| Music | Emotional arc (dull→energetic) | Techy, informative, steady rhythm |

## Production Notes

### POV Footage Strategy

The right half of the split screen must show **what the body-mounted camera sees** — a first-person POV of the gym. This is the most production-critical element.

**Option A (Best): Record real POV footage.**
- Strap a smartphone or GoPro to a headband and record actual gym footage at a local gym.
- Capture: approaching a lat pulldown machine, adjusting the weight stack pin, performing exercises.
- This footage is intentionally raw/authentic — slight wobble and imperfect framing increases credibility.
- Cost: $0 (phone camera) + 1-2 hours of gym time.

**Option B (Fallback): AI-generate POV footage.**
- Use Luma AI/Runway with first-person POV prompts: "First-person POV walking toward a gym weight stack, hand reaching for the pin, number 55 visible on the plates, natural head movement."
- Risk: AI POV footage tends to look dreamlike rather than realistic. May undermine credibility.

**Recommendation: Option A.** Real POV footage is a significant authenticity advantage for the "proof" video. The low-fi quality is a feature, not a bug.

### AI Detection Overlay

The POV half needs teal overlays showing the AI "detecting" elements:
- Teal bracket around the weight number on the stack
- Exercise name + weight text appearing in teal
- Rep counter ticking up in the corner

These are all After Effects / Motion composites added in post on top of the POV footage.

### Step Summary

| # | Task | Owner | Days | Output |
|---|---|---|---|---|
| P2.1 | Write VO script for Video #3 | SCW | 10 | Script |
| P2.2 | Record real POV gym footage (phone on headband) | AVP | 10-11 | Raw POV clips |
| P2.3 | Generate third-person gym shots via AI (left half) | AVP | 11-13 | AI video clips |
| P2.4 | Design AI detection overlay graphics (teal brackets, rep counter) | MGD | 11-12 | AE elements |
| P2.5 | Animate app workout log for final full-screen section | MGD | 12-13 | Screen recording |
| P2.6 | Generate/record VO | SCW + VO | 12-13 | VO file |
| P2.7 | Generate music (techy, rhythmic) | VE | 12-13 | Music track |
| P2.8 | Assemble split-screen edit, composite overlays | VE + MGD | 13-15 | Rough cut |
| P2.9 | Color grade, sound design, polish | VE | 15-16 | Final cut |
| P2.10 | CD review and approval | CD | 16 | Approved final |
| P2.11 | Export all formats | VE | 16 | Delivery package |

---

# PHASE 3: VIDEO #6 — "The Numbers"

Production runs **Days 13-18** (overlaps with Phase 2 final edit).

## Key Differences from Video #2

| Aspect | Video #2 | Video #6 |
|---|---|---|
| Footage type | Full AI-generated gym scenes | **~60% kinetic typography + infographics, ~40% product shots + short gym clips** |
| Biggest challenge | Character consistency | Information density — must be clear at speed |
| Post-production weight | Moderate (composites + grading) | **Heavy (motion graphics are the primary content)** |
| Music | Emotional arc | Fast-paced, energetic, data-driven |

## Production Notes

### Kinetic Typography

This video is primarily a **motion graphics piece**. The kinetic typography segments (opening stat, "how it works" labels, cost/tech stats, pricing tiers) constitute ~50% of the video's runtime and are entirely created in After Effects or Motion.

**Style reference:** Y Combinator startup demo day pitch videos, or Kurzgesagt's data visualization style adapted to a dark background with teal accents.

### Reusable Assets

- Product beauty shots (S7) and app UI animation from Video #2 can be reused.
- Social proof athlete shots from Video #2 can be reused in the "social proof / vision" segment.
- Only 2-3 new AI-generated gym clips needed (POV shots for the "three pillars" segment).

### Step Summary

| # | Task | Owner | Days | Output |
|---|---|---|---|---|
| P3.1 | Write VO script for Video #6 | SCW | 13 | Script |
| P3.2 | Design kinetic typography style frames (font, animation style, layout) | MGD | 13-14 | Style guide |
| P3.3 | Animate opening stat sequence | MGD | 14-15 | AE project |
| P3.4 | Animate "three pillars" segment (SEES / READS / COUNTS) | MGD | 15-16 | AE project |
| P3.5 | Animate cost + tech stats infographic | MGD | 15-16 | AE project |
| P3.6 | Animate pricing tier cards | MGD | 16 | AE project |
| P3.7 | Generate 2-3 new POV gym clips for "three pillars" | AVP | 14-15 | AI video clips |
| P3.8 | Generate/record VO | SCW + VO | 15-16 | VO file |
| P3.9 | Generate music (fast-paced, data/tech feel) | VE | 15-16 | Music track |
| P3.10 | Assemble all segments, composite product shots | VE + MGD | 16-17 | Rough cut |
| P3.11 | Sound design, timing polish | VE | 17-18 | Final cut |
| P3.12 | CD review and approval | CD | 18 | Approved final |
| P3.13 | Export all formats (+ standalone 30s social ad cut) | VE | 18 | Delivery package |

---

# Master Timeline

| Day | Phase 1 (Video #2) | Phase 2 (Video #3) | Phase 3 (Video #6) |
|---|---|---|---|
| **1** | Scriptwriting, VO text | — | — |
| **2** | Script approval, start key frame generation | — | — |
| **3** | Key frame generation | — | — |
| **4** | Storyboard approval, start AI video generation | — | — |
| **5** | AI video generation (batch 1) | — | — |
| **6** | AI video generation (review + batch 2) | — | — |
| **7** | AI video generation (finals), VO production, music | — | — |
| **8** | Rough cut assembly | — | — |
| **9** | Rough cut review, color grading | — | — |
| **10** | Compositing, sound design | Script, record POV gym footage | — |
| **11** | Final cut + review | POV footage, AI third-person shots | — |
| **12** | **Export & deliver Video #2 ✓** | AI shots, overlays, VO, music | — |
| **13** | — | Split-screen assembly | Script, kinetic typography design |
| **14** | — | Composite overlays | Typography animation, POV clips |
| **15** | — | Color grade, sound design | Three pillars + stats animation, VO, music |
| **16** | — | **Final cut + deliver Video #3 ✓** | Pricing animation, assembly |
| **17** | — | — | Sound design, timing polish |
| **18** | — | — | **Final cut + deliver Video #6 ✓** |

**Total production time: 18 working days (~3.5 weeks).**

---

# Challenges & Mitigation Strategies

## 1. Character Consistency Across AI-Generated Shots

**Challenge:** Current AI video generators (Luma, Runway, Kling) cannot guarantee the same face and body across multiple generated clips. The "main athlete" in Video #2 may look different from shot to shot.

**Mitigation:**
- Use Runway Gen-4's character reference feature — upload a reference face and lock it across generations.
- Limit the number of shots showing the main athlete's face clearly. Use close-ups of hands, headband, equipment, and phone to avoid face dependency.
- In the "IronPal way" montage, the headband is the visual identity anchor — even if the face varies slightly, the matte black headband with teal LED creates continuity.
- As a last resort, use a single live-action model filmed with a phone for the 3-4 key face-visible shots, and AI-generate the rest.

## 2. Product Accuracy in AI-Generated Footage

**Challenge:** AI tools don't know what the IronPal headband and cap actually look like. Generated headbands may be wrong color, wrong proportions, or missing the camera module and logo.

**Mitigation:**
- Generate detailed product reference images first (Midjourney) and use them as image-to-video inputs. This dramatically improves product accuracy.
- Composite the teal LED glow, "IronPal" logo text, and camera module lens onto any shot where AI didn't render them correctly. These are simple tracked overlays in After Effects.
- For the product beauty shot (end card), use a 3D render instead of AI generation — full control over brand accuracy.

## 3. AI Video Artifacts (Hand/Equipment Warping)

**Challenge:** AI-generated footage often produces warped hands, melting barbells, or physically incorrect exercise movements, especially during complex gym motions.

**Mitigation:**
- Request slow-motion output — slower motion = fewer artifacts and more cinematic feel.
- Generate 5-8 takes per shot and select the cleanest 2-4 second window from each.
- Favor shots where hands and equipment are partially out of frame or in shallow depth of field (bokeh hides imperfections).
- For weight stack and dumbbell close-ups where accuracy matters (weight labels must be readable), use real reference photos as input and generate minimal-motion clips (slow pan over still objects).

## 4. POV Footage Quality (Video #3)

**Challenge:** Real first-person POV footage from a phone strapped to a headband will be shaky and raw. AI-generated POV may look unrealistic.

**Mitigation:**
- Use software stabilization (DaVinci Resolve or CapCut's built-in stabilizer) to smooth the real footage to an acceptable level. Some wobble is fine — it's evidence of authenticity.
- Frame the POV half of the split screen with a thin teal border and slightly rounded corners to visually separate it and signal "this is the camera's view" — imperfection becomes intentional.
- If gym access is not possible, use a public gym or film in the equipment room of any fitness center during off-peak hours with permission.

## 5. Music Licensing / Quality

**Challenge:** AI-generated music may sound generic or inconsistent. Stock music may not match the specific emotional arc needed (dull → energetic shift in Video #2).

**Mitigation:**
- Generate 10+ music candidates in Suno/Udio and pick the best. The volume of attempts is cheap with a subscription.
- As a fallback, use a royalty-free track from Artlist ($15/mo) or Epidemic Sound — their catalogs have cinematic tech product music that can be edited to match.
- Edit the music to the video, not the video to the music — cut, extend, or crossfade music segments to hit the transition beat-for-beat.

## 6. Voiceover Tone Mismatch

**Challenge:** The VO spans 5 blocks with different emotional registers — VO-1 (deadpan/flat frustration), VO-2 (warm reveal), VO-3 (calm/confident explanation), VO-4 (emotional payoff), VO-5 (energetic CTA). The voice actor must modulate tone across blocks while maintaining a cohesive voice. AI voices may struggle with this range.

**Mitigation:**
- For human VO: Request audition clips before hiring. Brief the actor with reference examples (Apple keynote narration style, but warmer and slightly conversational). Provide tone notes per block (deadpan → warm → confident → emotional → energetic). Record each block separately to allow different energy levels.
- For AI VO (ElevenLabs): Generate each block independently with adjusted settings — slower/flatter for VO-1, warmer for VO-2/3, more emphatic for VO-4/5. Adjust speed to 0.9x for a more deliberate cadence. Add manual pauses in the script with \"...\" for natural breathing.
- Record both options (AI and human) and compare in context against the rough cut. Pick the one that fits the edit's energy.
- **Test each block in isolation and in sequence** — a block may sound fine alone but feel jarring in context.

## 7. Timeline Slippage (AI Generation Bottlenecks)

**Challenge:** AI video generation can be slow (5-15 min per clip) and unpredictable (many rejected outputs). The 4-day AI generation window may not be enough.

**Mitigation:**
- Run generation batches overnight — queue all shots before end of day, review results in the morning.
- Use multiple tools in parallel (Luma for some shots, Runway for others) to increase throughput.
- Prioritize shots in order of their narrative importance. If time runs short, the "social proof" montage (S6a-c) can use still images with Ken Burns effect instead of AI video — acceptable for 2-3 second shots.
- Build 2 buffer days into the timeline (Days 8-9 include rough cut + contingency).

## 8. App UI Realism

**Challenge:** Neither the IronPal app nor the competitor "old way" app actually exist. Both UI mockups must look like real, polished apps — fake-looking UI would undermine the video's credibility. The competitor app must resemble Fitbod's manual input paradigm without using Fitbod's brand assets.

**Mitigation:**
- **Competitor app (generic "old way" app):** Use `input/competition/fitbod/app_screenshot2.png` as *internal UX reference only* — understand the paradigm of manual reps/weight entry. **Do NOT reproduce Fitbod's visual design.** The generic competitor app must use a deliberately different design language: charcoal (#1A1A2E) background with muted burgundy/wine-red accents (not Fitbod's dark purple/navy), card-based exercise layout with slider/stepper inputs (not Fitbod's numbered table rows), rounded sans-serif typography (not Fitbod's geometric sans-serif), circular progress ring, and floating "+" button. Avoid teal (reserved for IronPal).
- **IronPal app:** Design the mockup in Figma using established mobile UI patterns (card-based layout, standard iOS/Android navigation, system fonts). Don't over-design — simpler looks more real.
- Animate the prototype in Figma or After Effects with natural easing curves and timing. Show only 2-3 screens (workout log populating, summary view). Less is more.
- Apply a slight screen reflection and off-angle perspective when compositing onto the phone in the video — a perfectly flat, full-brightness screen looks composited.

---

# Final Deliverables Checklist

| # | Deliverable | Format | Delivery Day |
|---|---|---|---|
| 1 | Video #2 — "Your Workout, Logged" (1080p, 75-90s) | MP4, H.264 | Day 12 |
| 2 | Video #2 — 4K version | MP4, H.265 | Day 12 |
| 3 | Video #2 — 30s social media cutdown (16:9) | MP4 | Day 12 |
| 4 | Video #2 — 30s vertical cutdown (9:16) | MP4 | Day 12 |
| 5 | Video #3 — "What the Camera Sees" (1080p, 60-75s) | MP4, H.264 | Day 16 |
| 6 | Video #3 — 15s social teaser (split-screen highlight) | MP4 | Day 16 |
| 7 | Video #6 — "The Numbers" (1080p, 75-90s) | MP4, H.264 | Day 18 |
| 8 | Video #6 — 30s paid social ad cut | MP4 | Day 18 |
| 9 | All project files (AE projects, Figma, raw AI clips) | ZIP archive | Day 18 |
| 10 | Music tracks (licensed/generated, stems if available) | WAV | Day 18 |

---

# Budget Summary

| Category | Estimated Cost |
|---|---|
| AI video tools (Luma + Runway + Kling, 1 month each) | $80-85 |
| Image generation (Midjourney or FLUX, 1 month) | $10-30 |
| AI music (Suno or Udio, 1 month) | $10 |
| Voice actor (human, Fiverr/Voices.com) | $50-150 |
| AI voiceover (ElevenLabs, 1 month — if fallback) | $22 |
| Stock music fallback (Artlist/Epidemic, 1 month) | $15-20 |
| Video editing software | $0 (DaVinci Resolve free) |
| Motion graphics (After Effects, 1 month) | $23 |
| **Total estimated production cost** | **$190-330** |

> This excludes labor costs. For a 2-3 person team working over 3.5 weeks, the primary cost is time. The $190-330 budget covers all tooling and external services.
