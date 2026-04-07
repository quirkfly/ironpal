# IronPal — Body-Mounted Camera Image Prompts (Leonardo AI)

This document provides Leonardo AI-optimized prompts for generating marketing imagery for the IronPal body-mounted camera Kickstarter campaign. Each prompt includes Leonardo-specific generation settings, reference image guidance, and post-processing instructions.

> **Source:** Adapted from `docs/body-mounted-image-prompts.md` (generic prompts). Tailored for Leonardo AI platform.

---

## General Setup & Brand Guidelines

### Leonardo AI Configuration Defaults

| Setting | Value |
|---|---|
| **Model** | Phoenix (default for all prompts) |
| **PhotoReal** | ON — Cinematic preset |
| **Alchemy** | ON (enhanced detail & upscaling) |
| **Guidance Scale** | 7-9 (higher for product shots, lower for lifestyle) |
| **Generation count** | 4 per prompt — select best execution |

### Negative Prompt (apply to ALL prompts)

```
cartoon, illustration, painting, drawing, anime, 3d render, CGI, watermark, text overlay, blurry, low quality, distorted, deformed, extra limbs, oversaturated, artificial looking, plastic skin, stock photo watermark, border, frame around image, collage artifacts
```

### Logo Handling — Critical Note

**Leonardo AI cannot reliably generate readable text or precise logo marks.** Do not expect the Iron Ring logo or "IRONPAL" wordmark to render correctly in AI output. Instead:

1. **Generate the scene without worrying about logo accuracy** — let the AI place a teal accent/shape where the logo should be
2. **Composite the real logo in post-production** (Photoshop, Figma, or Canva) using the source files from `input/images/logo/v4/`
3. Where prompts mention the Iron Ring logo, they describe the *intended placement and size* — use this as your compositing guide

### Reference Images Available

| File | Use as reference for |
|---|---|
| `input/images/logo/v4/Minimalist IRONPAL logo design.png` | **Style Reference** — horizontal lockup, brand color palette, overall teal-on-navy aesthetic. Upload as Style Reference (strength 0.2-0.3) to maintain brand color consistency across all generations. |
| `input/images/logo/v4/Geometric teal circle on navy.png` | Icon-only mark — use when compositing the standalone ring icon onto product close-ups or app UI mockups in post. |
| `input/images/logo/v4/Minimalist iron-inspired logo design.png` | Stacked lockup — use for compositing onto vertical-format placements (app splash screens, stacked layouts). |

### Brand Color Reference

| Color | Hex | Use |
|---|---|---|
| Electric Teal | `#00E5CC` | Logo, LED glow, accents, app UI highlights |
| Charcoal Navy | `#1A1A2E` | Dark backgrounds, app UI backgrounds |
| Ice White | `#F0F4F8` | Wordmark on dark, text, highlights |
| Slate Gray | `#8E8E9A` | Secondary text, subtle elements |

---

## Product Showcase Prompts

---

### Prompt 1 — Hero Shot: Headband Camera Product Reveal

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | 16:9 (web banner) or 3:2 (versatile) |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 8 |
| Image Guidance | **Style Reference**: upload `input/images/logo/v4/Minimalist IRONPAL logo design.png` at strength 0.2 for brand color consistency |

**Reference Image Needed:** Yes — use the horizontal lockup logo (`Minimalist IRONPAL logo design.png`) as a **Style Reference** (NOT Image-to-Image). This ensures the teal/navy color palette carries through without forcing the composition.

**Prompt:**

```
Professional product photography of a sleek matte black athletic fitness headband with a tiny embedded camera module, displayed on a clean white-to-light-gray gradient studio background. The headband has a thin electric teal accent stripe, made from moisture-wicking athletic fabric. A small flush-mounted camera lens centered on the forehead area, roughly 8mm diameter, with a soft teal LED glow beside it. A teal brand marking on the right side of the headband, subtle and precise like premium athletic branding.

Shot from a slight three-quarter angle showing both the front lens area and the side branding. Next to it, the same headband worn by an athletic male model with short hair, mid-laugh, in a modern well-lit gym — showing the headband is comfortable and natural. He wears a fitted black tank top.

Include a floating zoomed-in inset panel with soft drop shadow showing the camera module close-up — the tiny lens, the teal LED, and the side branding detail. Premium product detail shot style.

Studio lighting on the standalone headband, warm ambient gym lighting on the model. Clean, minimal, premium. Shot on 85mm lens, shallow depth of field, f/2.8. 8K, ultra-detailed, commercial product photography.
```

**Post-Production Steps:**
1. Composite the Iron Ring horizontal lockup logo onto the headband side using `Minimalist IRONPAL logo design.png` as source — scale to ~3cm width, match the teal accent color
2. Add the Iron Ring logo into the floating inset detail panel
3. Adjust teal accents to match `#00E5CC` if the AI drifted toward cyan/mint
4. Optional: use Leonardo's **Inpainting** tool on the headband side area if the AI-generated teal accent doesn't leave clean space for logo compositing

---

### Prompt 2 — Hero Shot: Baseball Cap Camera Product Reveal

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | 16:9 or 3:2 |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 8 |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.2 |

**Reference Image Needed:** Style Reference only (same as Prompt 1). No structural reference needed — Phoenix handles cap product shots well with descriptive prompting.

**Prompt:**

```
Professional product photography of a modern minimalist structured matte black baseball cap with a tiny camera module embedded in the front panel just above the brim. Athletic-fit style with curved brim, similar to a Nike Dri-FIT running cap. A small flush camera lens circle roughly 8mm centered on the front panel, blending into the fabric. A pinhole-sized teal LED beside the lens. A teal brand embroidery on the left side panel — clean, precise thread work resembling premium athletic cap branding.

Displayed on a clean studio background, white to warm gray gradient, shot from a three-quarter front angle showing the lens placement and athletic silhouette. Beside it, the same cap worn by a fit female athlete in a modern gym, hair pulled through the back opening, walking toward the dumbbell rack. She looks confident and focused, the cap looks like a normal workout cap.

Two floating close-up inset panels with soft shadows: one showing the embedded camera lens detail and flush-mount design, the other showing the side panel embroidered teal branding. Premium industrial design callouts.

Studio-quality lighting, warm and aspirational. Shot on 70mm lens, f/2.8, shallow depth of field. 8K, ultra-detailed, commercial product photography.
```

**Post-Production Steps:**
1. Composite the Iron Ring horizontal lockup logo onto the cap's side panel embroidery area using `Minimalist IRONPAL logo design.png` — apply a thread/embroidery texture overlay for realism
2. Add the Iron Ring logo into the floating side panel inset
3. Use Leonardo's **Inpainting** on the side panel area if the generated teal embroidery shape conflicts with logo placement
4. Color-correct all teal elements to `#00E5CC`

---

### Prompt 3 — Both Products Side by Side

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | 16:9 (comparison layout) |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 7 |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.25 |

**Reference Image Needed:** Style Reference for brand palette. Consider also generating the smartphone app screen separately and compositing it in.

**Prompt:**

```
Photorealistic product comparison shot of a matte black athletic headband and a matte black structured baseball cap placed side by side on a clean light wood surface, like a gym bench. Both products have coordinating teal accent details. The headband is laid flat in a natural curve, the cap placed upright with brim facing slightly left. Both have tiny flush-mounted camera lenses visible, discreet and minimal. Teal brand markings visible on both products — on the headband side and the cap side panel — tying them together as a cohesive product family.

Behind the products, slightly out of focus, a gym environment with weight racks, mirrors, warm overhead lighting. A modern smartphone with edge-to-edge display leans against the cap, showing a clean fitness app interface with teal accent colors displaying a workout summary — exercise name, weight, reps, with a circular teal confidence indicator.

Flat-lay meets lifestyle hybrid composition. Premium, modern, fitness-forward mood. Warm tones, shallow depth of field on background. Shot on 50mm lens, f/4. 8K, ultra-detailed, commercial lifestyle product photography.
```

**Post-Production Steps:**
1. Composite the Iron Ring logo onto both products — printed on headband side, embroidered texture on cap side panel
2. Design and composite the app screen UI separately (Figma recommended) with the Iron Ring icon as the app logo in the top-left corner — then paste onto the phone screen with perspective transform
3. Ensure both logo placements are the same size/style to reinforce brand family cohesion
4. Color-correct teal accents across the full image to `#00E5CC`

---

## In-Action Exercise Prompts

> **Composition note for Prompts 4-9:** These all use a split or overlay composition — the main scene plus a floating POV panel. Leonardo AI can sometimes struggle with split-frame compositions. **Recommended workflow:** Generate the main scene and the POV view as **two separate images**, then composite them together in post-production. This gives you much better control over both elements.

---

### Prompt 4 — Squats: First-Person Perspective Overlay

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | **Main scene**: 3:2 (landscape). **POV panel**: 4:3 or 3:2 |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 7 |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.15 (subtle — this is a gym scene, not a product shot) |

**Reference Image Needed:** Style Reference at low strength for color consistency only. No structural reference.

**Generate TWO images:**

**Image A — Main Scene (external view):**

```
Photorealistic marketing photo of a fit male athlete performing a barbell back squat at a power rack in a well-lit modern gym. He wears a matte black athletic headband with a tiny camera lens on the forehead and a teal brand accent on the side. At the bottom of the squat, thighs parallel, barbell across upper back, face focused forward. A tiny teal LED glows softly on the headband camera. Warm gym lighting, cinematic composition, three-quarter side angle. Shot on 35mm lens, f/2.8. 8K, ultra-detailed, professional sports photography.
```

**Image B — POV Panel (first-person camera view):**

```
First-person egocentric POV photograph from a person performing a barbell back squat, looking straight ahead from forehead-level. The barbell extends left and right in the upper frame, loaded weight plates visible at the ends — red 20 kg plates and a smaller blue plate. Squat rack uprights and safety bars frame the view. The gym floor is visible below. Natural perspective distortion from a wide-angle body-mounted camera. Warm gym lighting. Realistic, slightly wide-angle, 8K, ultra-detailed.
```

**Post-Production Steps:**
1. Create the split-frame composition: main scene on the left, POV on the right
2. Add a thin teal (#00E5CC) vertical divider or soft gradient blend between the two halves
3. Give the POV panel a subtle rounded-rectangle border with a thin teal outline (camera viewfinder style)
4. Composite the Iron Ring logo onto the headband in Image A
5. Add a small semi-transparent Iron Ring icon watermark in the top-left corner of the POV panel
6. Color-grade both images to match — warm, cinematic, consistent teal accents

---

### Prompt 5 — Deadlift: Cap Camera in Action

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | **Main**: 3:2. **POV panel**: 4:3 |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 7 |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.15 |

**Reference Image Needed:** Style Reference only at low strength.

**Generate TWO images:**

**Image A — Main Scene:**

```
Photorealistic marketing photo of a strong female athlete performing a conventional deadlift on a deadlift platform in a modern gym. She wears a structured matte black baseball cap with a teal brand accent embroidered on the side panel. Shot from a low three-quarter front angle, camera at about knee height, 2 meters away. Mid-pull — bar just past the knees, back flat, hips driving forward. A tiny flush camera lens visible on the cap's front panel with a soft teal LED glow. Modern gym with rubber flooring, other athletes in soft-focus background. Dramatic but approachable lighting, slightly lower key. Shot on 24mm lens, f/2.8, low angle. 8K, ultra-detailed, professional sports photography.
```

**Image B — POV Panel:**

```
First-person egocentric POV photograph looking down and forward from head height during a deadlift. The barbell is below in the frame with clearly labeled weight plates, numbers like 20 visible on the plate faces. Hands gripping the bar in the lower frame. The gym floor is visible. Realistic body-mounted camera perspective with natural distortion. Well-lit gym environment. 8K, ultra-detailed, realistic wide-angle POV.
```

**Post-Production Steps:**
1. Create the overlay composition: POV panel as a floating rounded-rectangle overlay on the main scene (or side-by-side split)
2. Add thin teal border to the POV panel, a small "LIVE" indicator dot, and the Iron Ring icon beside it
3. Composite the Iron Ring embroidered logo onto the cap's side panel in Image A
4. Ensure dramatic but approachable lighting across both — slightly lower key than Prompt 4
5. Color-correct teal accents to `#00E5CC`

---

### Prompt 6 — Lat Pulldown Machine: Weight Stack Close-Up

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | **Main**: 4:3. **POV panel**: 4:3 |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 8 (higher — need clear weight stack numbers) |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.15 |

**Reference Image Needed:** Style Reference only. For the weight stack numbers to be legible, you may need to **Inpaint** the weight stack area in the POV panel and increase guidance scale.

**Generate TWO images:**

**Image A — Main Scene:**

```
Photorealistic marketing photo of a muscular male athlete seated at a lat pulldown machine in a modern gym, pulling the wide bar down to chest level. He wears a matte black athletic headband with a tiny camera lens and teal brand accent on the side. Shot from a side-front angle showing the athlete, the machine structure, and the weight stack in the background. Warm gym lighting, professional composition. Shot on 50mm lens, f/2.8. 8K, ultra-detailed, commercial fitness photography.
```

**Image B — POV Panel (weight stack focus):**

```
First-person egocentric POV from someone seated at a lat pulldown machine, looking straight ahead at the pulldown bar and cable at eye level. In the background of the view, a weight stack is clearly visible — numbered metal plates labeled 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, with a pin inserted at the 50 position. The pin position and number 50 are crisp and legible. Realistic body-mounted camera perspective. Well-lit modern gym. 8K, ultra-detailed, sharp focus on the weight stack.
```

**Post-Production Steps:**
1. Composite the POV as a floating overlay panel (rounded rectangle, thin teal border, soft shadow)
2. If the weight stack numbers aren't legible in the AI output, use Leonardo's **Inpainting** to regenerate just the weight stack area with higher guidance, or paint/overlay clean number labels in post
3. Add subtle teal annotation markers (small dots or brackets) near the pin position in the POV to hint at AI detection
4. Composite the Iron Ring logo onto the headband side in Image A
5. Add a small semi-transparent Iron Ring icon in the POV overlay corner

---

### Prompt 7 — Hack Squat Machine: Full Exercise Capture

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | **Main**: 16:9 (wide to show full machine). **POV panel**: 4:3 |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 7 |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.15 |

**Reference Image Needed:** Style Reference only. If Phoenix doesn't render a hack squat machine accurately, consider uploading a reference photo of a hack squat machine as **Image-to-Image** at low strength (0.15-0.25) to guide the machine's shape.

**Generate TWO images:**

**Image A — Main Scene:**

```
Photorealistic marketing photo of a female athlete using a hack squat machine with angled sled and shoulder pads in a well-equipped modern gym. She wears a structured matte black baseball cap with teal brand embroidery on the side panel. Mid-rep, knees bent deeply, sled at the lowest point on the rails. Wide side angle showing the full machine, the athlete, and weight plates loaded on the sled plate pegs. Bright, energetic gym lighting. Modern, clean environment with other gym members in soft-focus background. Shot on 24mm lens, f/4. 8K, ultra-detailed, wide-angle professional fitness photography.
```

**Image B — POV Panel:**

```
First-person egocentric POV from someone using a hack squat machine, looking forward and slightly down from head height. Machine shoulder pads visible in the upper frame, foot platform ahead with feet planted, plate-loaded pegs visible at the sides of the sled. Weight plates with readable labels showing 20 and 10 on the near-side peg. Realistic body-mounted wide-angle camera perspective. Bright gym lighting. 8K, ultra-detailed.
```

**Post-Production Steps:**
1. Composite the POV as a floating overlay (rounded corners, teal border)
2. Add Iron Ring icon watermark in the POV overlay corner
3. Composite the Iron Ring embroidered logo onto the cap's side panel in Image A
4. Ensure the background gym members look natural and undisturbed — emphasizing non-intrusive camera use
5. Color-correct teal to `#00E5CC`

---

### Prompt 8 — Dumbbell Curls: Highlighting Weight Detection

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | **Main**: 3:4 (portrait, tight upper-body crop). **POV panel**: 4:3 |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 8 (need readable dumbbell label) |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.15 |

**Reference Image Needed:** Style Reference only. The dumbbell label ("16 KG") will likely need post-production enhancement — AI generators rarely produce clean readable text on objects.

**Generate TWO images:**

**Image A — Main Scene:**

```
Photorealistic marketing photo of a fit male athlete performing standing dumbbell bicep curls in front of a dumbbell rack in a modern gym. He wears a matte black athletic headband with a teal brand accent on the side, looking like a normal athletic sweatband. Mid-curl, right arm at peak contraction, dumbbell at shoulder height. Tight composition focused on upper body and dumbbell. Warm, vibrant gym lighting. Shot on 85mm lens, f/2.0, shallow depth of field. 8K, ultra-detailed, professional fitness photography.
```

**Image B — POV Panel:**

```
First-person egocentric POV looking slightly down and forward during a dumbbell bicep curl. A dumbbell in the right hand is prominently visible in the lower frame, held close at shoulder height. The dumbbell end-cap label area is clearly visible from the natural close range of the user's own hand. The dumbbell rack is visible further ahead with rows of dumbbells arranged by weight. Realistic body-mounted camera perspective. Warm gym lighting. 8K, ultra-detailed, sharp focus on the dumbbell.
```

**Post-Production Steps:**
1. Composite "16 KG" text onto the dumbbell end-cap in the POV image (AI won't render this cleanly) — use embossed/debossed text style matching real dumbbell labels
2. Add subtle teal highlight dots on the POV overlay around the dumbbell label area, hinting at AI weight recognition
3. Create the floating POV overlay (teal border, rounded corners) and position it beside or overlapping the main scene
4. Add Iron Ring icon watermark in the POV corner
5. Composite the Iron Ring logo onto the headband in Image A
6. Color-correct teal accents to `#00E5CC`

---

### Prompt 9 — Calf Raise Machine: Demonstrating Small-Movement Tracking

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | **Main**: 3:2. **POV panel**: 4:3 |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 8 |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.15 |

**Reference Image Needed:** Style Reference only. Like Prompt 7, if Phoenix doesn't accurately render a standing calf raise machine, consider a reference photo as Image-to-Image at low strength (0.15-0.25).

**Generate TWO images:**

**Image A — Main Scene:**

```
Photorealistic marketing photo of a female athlete performing standing calf raises on a dedicated calf raise machine in a clean modern gym. She wears a structured matte black baseball cap with teal brand embroidery on the side. Machine has shoulder pads pressing down, she is up on her toes at the peak of the rep, calves fully contracted. Shot from a side angle. Clean, bright gym lighting. Calm, precise atmosphere. Shot on 50mm lens, f/3.5. 8K, ultra-detailed, professional fitness photography.
```

**Image B — POV Panel:**

```
First-person egocentric POV from someone standing at a calf raise machine, looking forward and down from head height. The machine structure is visible, a weight stack to the side with numbered metal plates and a pin clearly inserted at the 70 position. The foot platform is visible below. Minimal body movement captured — the scene is static and precise. Bright, clean gym lighting. 8K, ultra-detailed, sharp focus on weight stack.
```

**Post-Production Steps:**
1. Composite the POV as a floating overlay with teal border
2. If the weight stack number "70" isn't legible, overlay it in post or use Leonardo's Inpainting on the weight stack area
3. Add Iron Ring icon watermark in the POV corner
4. Composite the Iron Ring embroidered logo onto the cap side panel in Image A
5. The overall mood should feel precise and quietly intelligent — adjust color grading if the AI output is too vibrant

---

## Lifestyle & Concept Prompts

---

### Prompt 10 — Seamless Phone Pairing & Workout Summary

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | 3:2 or 4:3 (lifestyle framing) |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 7 |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.2 |

**Reference Image Needed:** Style Reference for warm brand palette. The phone app screen should be **designed separately in Figma** and composited onto the phone — AI will not generate a clean, realistic app interface.

**Prompt:**

```
Photorealistic lifestyle marketing photo of a post-workout moment in a gym locker room or rest area. A fit female athlete sits on a wooden bench, towel around her neck, holding a modern smartphone and looking at the screen with a relaxed, accomplished smile. She wears a matte black athletic headband with a teal brand accent on the side — the teal LED on the camera is off, suggesting recording is complete. Her gym bag is open in the soft-focus background with a water bottle.

A subtle decorative arc of small teal glowing dots floats between the headband and the phone, suggesting wireless data transfer without being technical.

Warm, intimate locker room lighting with soft overhead glow. Candid, relaxed mood. Shot on 50mm lens, f/2.0, shallow depth of field. 8K, ultra-detailed, lifestyle photography, warm color palette.
```

**Post-Production Steps:**
1. **Design the app screen UI in Figma or Photoshop:** workout summary showing exercise list with icons, detected weights, rep counts, teal confidence indicators, and the Iron Ring icon as the app logo in the top-left corner. Use the brand color palette (teal accents on charcoal navy background).
2. Composite the app screen onto the phone with perspective transform and screen glow
3. Composite the Iron Ring logo onto the headband side
4. Fine-tune the teal data-transfer arc if the AI rendered it too literally or not at all — recreate it as a subtle graphic element in post
5. Color-correct all teal to `#00E5CC`

---

### Prompt 11 — Investor Pitch: Before/After Manual vs. Automatic Logging

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | 16:9 (pitch deck slide format) |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 7 |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.15 |

**Reference Image Needed:** Style Reference at low strength. **Recommended approach:** Generate the "before" (left) and "after" (right) halves as **two separate images** for maximum control over the lighting contrast, then composite them together.

**Generate TWO images:**

**Image A — "Before" (left half):**

```
Photorealistic marketing photo of a frustrated gym-goer at a bench press station, paused mid-workout, awkwardly typing into a phone balanced on their knee. The phone shows a cluttered spreadsheet-style fitness app. The athlete's expression is mildly annoyed and distracted. Cool, slightly desaturated gym lighting — less inviting atmosphere. The gym is modern but the mood is frustrating. Shot on 35mm lens, f/2.8. 8K, ultra-detailed, slightly cool color grading, editorial fitness photography.
```

**Image B — "After" (right half):**

```
Photorealistic marketing photo of a confident athlete mid-rep on a bench press in a modern gym, wearing a structured matte black baseball cap with teal brand embroidery on the side panel. Fully focused on the lift, no phone in hand. The athlete's expression is focused and empowered. Warm, vibrant gym lighting — inviting, energetic atmosphere. A subtle semi-transparent holographic-style teal overlay floats near the cap suggesting real-time tracking data. Shot on 35mm lens, f/2.8. 8K, ultra-detailed, warm color grading, editorial fitness photography.
```

**Post-Production Steps:**
1. Composite the two halves side by side with a thin vertical teal divider line
2. Ensure deliberate lighting contrast: cool/desaturated left vs. warm/vibrant right
3. On the right side, refine or recreate the holographic overlay in post: semi-transparent panel showing "Bench Press / 80 kg / Rep 6" in teal-accented typography, with the Iron Ring icon in the corner
4. Composite the Iron Ring embroidered logo onto the cap side panel on the right
5. Add the cluttered app UI to the phone on the left in post (design in Figma)
6. Overall: the contrast should tell the story instantly — distracted vs. seamless

---

### Prompt 12 — Gym Floor Wide Shot: Multiple Users Wearing IronPal

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | 16:9 (wide establishing shot) |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 6 (lower — allow natural scene variation) |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.15 |

**Reference Image Needed:** Style Reference only at low strength. This is a wide shot — logo details will be small, so precision is less critical during generation. Logos will be composited in post.

**Prompt:**

```
Photorealistic wide establishing shot of a busy modern commercial gym floor during peak hours. Five or six gym-goers working out at different stations — some on machines, one at a squat rack, one doing cable exercises, one at the dumbbell rack. Two of them wear matte black athletic headbands with small teal accents, and one wears a matte black structured baseball cap with teal embroidery on the side. The teal accents on the three IronPal-wearing users are subtle but visible — small teal glows from their camera LEDs, just enough to notice on close inspection.

The non-IronPal users look exactly the same — emphasizing the camera is non-disruptive. The gym is bright, clean, and modern — polished concrete floors, good overhead lighting, mirrors on one wall, equipment in clear zones. Alive and energetic but not chaotic.

Warm editorial-style gym photography, wide-angle composition with depth. Shot on 16mm lens, f/5.6, deep depth of field. 8K, ultra-detailed, commercial editorial photography, warm color tones.
```

**Post-Production Steps:**
1. Identify the three IronPal-wearing users and composite the Iron Ring logo at small scale onto their headbands and cap — printed on headbands, embroidered on cap. At this distance, the icon-only version (ring with dot) may be more appropriate than the full lockup
2. Add subtle teal LED glow points to each IronPal user's camera area using a soft teal brush
3. Ensure the IronPal users blend naturally — they should not stand out dramatically from other gym-goers
4. Color-grade for warm, editorial feel with consistent teal (`#00E5CC`) accents

---

### Prompt 13 — Close-Up Detail: Camera Module Industrial Design

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | 1:1 (product hero) or 4:3 |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 9 (high — precise product detail) |
| Image Guidance | **Style Reference**: `Geometric teal circle on navy.png` at strength 0.2 — use the icon-only logo for color and brand reference here, as this is a close-up product shot with the icon engraved on the module |

**Reference Image Needed:** Yes — use `input/images/logo/v4/Geometric teal circle on navy.png` (icon-only) as **Style Reference** at strength 0.2 for this prompt specifically. The teal ring icon will be laser-engraved on the module's top face.

**Prompt:**

```
Extreme close-up photorealistic macro product shot of a tiny electronic camera module placed on a dark matte slate surface. The module is a small rounded rectangular unit, approximately thumbnail-sized, 20mm x 15mm x 8mm, with matte black anodized aluminum housing. A circular glass camera lens is flush-mounted on the front face. A pinhole-sized teal LED beside the lens. A tiny USB-C port on the bottom edge. On the top face of the aluminum housing, a small teal brand mark is laser-engraved — a precise circular ring shape.

Dramatic macro photography lighting — single directional light creating highlights on the aluminum edges and glass lens surface. Extremely shallow depth of field, only the lens and front face in sharp focus. Visible precision: machined aluminum edges, smooth glass, micro-texture of the matte finish, crisp laser engraving.

Dark, dramatic mood. Shot on 100mm macro lens, f/2.8. 8K, ultra-detailed, premium product photography, similar to Apple hardware teardown shots.
```

**Post-Production Steps:**
1. Composite the full Iron Ring horizontal lockup logo (from `Minimalist IRONPAL logo design.png`) as a laser-engraving on the module's top face — apply a subtle engraving effect (slight depth/shadow, matching the aluminum surface texture)
2. Alternatively, use the icon-only mark (from `Geometric teal circle on navy.png`) if the full lockup is too large for the module surface at this scale
3. Ensure the teal LED and laser engraving match `#00E5CC`
4. Fine-tune the macro lighting and shallow DOF if needed — this shot should feel like a premium electronics design award submission

---

### Prompt 14 — User Journey: Clip-On, Work Out, Review

**Leonardo AI Settings:**

| Setting | Value |
|---|---|
| Model | Phoenix |
| Aspect Ratio | **Each panel**: 3:4 (portrait). Final composite: ~3:1 (ultra-wide triptych) |
| PhotoReal | ON — Cinematic |
| Guidance Scale | 7 |
| Image Guidance | **Style Reference**: `Minimalist IRONPAL logo design.png` at strength 0.2 |

**Reference Image Needed:** Style Reference for consistent brand palette across all three panels. **Generate each panel as a separate image** — this is essential for maintaining consistent model appearance and lighting across the triptych.

**Important:** Use Leonardo's **Image-to-Image** feature at low strength (0.2-0.3) for Panels 2 and 3, using Panel 1's output as the reference. This helps maintain the same model/person across panels. Alternatively, if Phoenix generates a consistent-looking model, accept minor variations — perfect consistency across separate generations is difficult.

**Generate THREE images:**

**Panel 1 — Setup (left):**

```
Photorealistic close-up of a female athlete in a bright, clean gym locker room, facing a mirror, clipping a tiny matte black electronic camera module into the front pocket of a matte black athletic headband. Her fingers hold the tiny module, about to snap it into place. The headband is already on her head with a teal brand accent visible on the side. Close-up on her hands and the headband. Bright, clean locker room lighting with mirror reflection. Shot on 50mm lens, f/2.0, shallow depth of field. 8K, ultra-detailed, lifestyle photography.
```

**Panel 2 — Workout (center):**

```
Photorealistic marketing photo of an athletic woman performing a seated cable row in a modern gym. She is focused, mid-pull, wearing a matte black athletic headband with a tiny camera module and teal brand accent on the side. A soft teal LED glows on the camera. The gym is active around her. Three-quarter side angle showing her full upper body and the cable machine. Energetic, focused mood. Warm gym lighting. Shot on 35mm lens, f/2.8. 8K, ultra-detailed, professional fitness photography.
```

**Panel 3 — Results (right):**

```
Photorealistic lifestyle photo of an athletic woman sitting on a gym bench after a workout, smiling at her smartphone. She wears a matte black athletic headband pushed up on her forehead casually, with a teal brand accent visible on the side. The phone screen shows a clean app interface with teal accent colors. The mood is relaxed, warm, and accomplished. Warm, soft lighting. Shot on 50mm lens, f/2.0, shallow depth of field. 8K, ultra-detailed, candid lifestyle photography.
```

**Post-Production Steps:**
1. Arrange all three panels left-to-right as a horizontal triptych with thin separating gaps or soft blending between panels
2. Composite the Iron Ring logo onto the headband in all three panels — ensure consistent size and placement
3. In Panel 1, add the Iron Ring logo visible on the camera module in her fingers (laser-engraved effect) and in the mirror reflection on the headband side
4. In Panel 3, design and composite the app screen UI showing the workout log with exercise names, weights, reps, and the Iron Ring icon as app logo in the top-left corner
5. Color-grade all three panels to match — warm, consistent lighting, same teal `#00E5CC` across the triptych
6. If the model looks too different across panels, consider face-swapping or using Leonardo's Image-to-Image more aggressively to maintain consistency

---

## Generation Workflow Summary

### Step-by-step process for the full set:

1. **Set up Leonardo AI defaults:** Phoenix model, PhotoReal ON (Cinematic), Alchemy ON, negative prompt loaded
2. **Upload Style Reference:** `input/images/logo/v4/Minimalist IRONPAL logo design.png` — keep this loaded as the Style Reference for all generations at the strengths noted per prompt
3. **Generate Product Showcase images first** (Prompts 1-3) — these are simpler single-scene compositions
4. **Generate In-Action scenes** (Prompts 4-9) — remember to generate main scene + POV as separate images per the two-image workflow
5. **Generate Lifestyle scenes** (Prompts 10-14) — generate split-frame and triptych elements separately
6. **Post-production pass for ALL images:**
   - Composite Iron Ring logos from `input/images/logo/v4/` source files onto all product placements
   - Design app screen UIs in Figma and composite onto phone screens
   - Create POV overlay frames (teal borders, rounded corners, Iron Ring watermarks)
   - Color-correct all teal accents to `#00E5CC`
   - Apply Alchemy upscaling in Leonardo for any images that need higher resolution
7. **Quality check:** Compare all images against brand colors (see table above) and ensure the Iron Ring logo is consistently placed, sized, and colored across the full set

### Tips for best results:

- **Generate 4+ variants per prompt** and select the best composition, lighting, and model quality
- **Don't fight the AI on text/logos** — plan for post-production compositing from the start
- **Use Inpainting** to fix specific areas (face expressions, product details, background elements) rather than regenerating the entire image
- **Batch your generations** by type: all main scenes first, then all POV panels, then lifestyle shots — this helps maintain a consistent look within each category
- **Save your best generations as references** — use them as Image-to-Image inputs at low strength for subsequent prompts to maintain visual consistency across the campaign
