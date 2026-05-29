# S3 — Luma Studio Prompt Package

**Shot:** S3 — Athlete's hand pulls IronPal headband from a gym bag
**Tool:** Luma Studio (Dream Machine) — **Ray 3.14 HDR** (primary). Veo 3.1 acceptable if its keyframe slots are exposed in your Luma board; Kling 3.0 as last-resort fallback.
**Approach:** Image-to-video with **start frame + end frame** keyframe interpolation, where **both keyframes are themselves generated in Luma's image generator using the canonical IronPal product hero as a reference image**. This locks the headband design at every step.
**Use:** Backup / parallel option to the in-house shoot. AI for S3 has failed multiple times before — this prompt package is the most-controlled way to give it one more honest attempt.
**Cost:** ~$1.50–$3 per video generation × 6 variants ≈ ~$15 per attempt set; +~$2 for the keyframe images.
**Status:** Draft v2 — adopts Ray 3.14 HDR + reference-image workflow

---

## 0. Read this first

Pure text-to-video on this scene has been tried and failed across multiple models (`docs/video-generation-analysis.md`, `docs/s3-clip-analysis.md`). The known failure modes are stable: the headband morphs, the hand grip breaks, the brand text degrades, the physical interaction goes uncanny.

The reason text-only fails is that the model is asked to **invent** a specific physical object in a specific physical state across 120+ frames *and* keep the design consistent. It can't.

The fix is layered:

1. **Stop asking the model to invent the product.** Use the canonical IronPal product hero photo as a **reference image** every time you generate a still in Luma. The headband design (matte black, teal stripe, lens, LED, wordmark area) gets locked into the keyframe stills.
2. **Stop asking the video model to invent the keyframes.** Pre-generate two stills (Image A: bag with headband peeking; Image B: hand at apex) and pass them to the video model as **start frame + end frame**. The video model only has to interpolate motion between them.
3. **Stop asking the video model to invent the design.** Because both stills already share the locked design (step 1), the design stays consistent across the interpolation. Each link in the chain has only one job.

This is genuinely the most fool-proof approach available in Luma Studio today. It still might not produce a usable hero. Treat the result as **bonus material** — not a substitute for the in-house shoot.

---

## 1. Reference Assets Already in the Repo

You don't need to source a headband reference — three are already in the project. Use them in this order of priority:

| Priority | File | Why |
|---|---|---|
| **PRIMARY product reference** | `input/images/product/headband/gpt-image-1_5_A_photorealistic_product_marketing_hero_image_of_a_sleek_modern_fitness_headband-0_a2d0b26d-b304-4514-ae69-2563f94ed95b.jpg` | Clean product hero shot — matte black band, electric teal stripe, IronPal wordmark, lens module + LED on front center, premium studio lighting. This is the canonical "what an IronPal headband looks like" image. **Use this as the reference for every Image A and Image B generation.** |
| Alternate hero variants | `input/images/product/headband/gpt-image-1_5_A_photorealistic_product_marketing_hero_image_of_a_sleek_modern_fitness_headband-{1,2,3}*.jpg` | Same shoot, different angles. Use as backup if the primary doesn't direct the generator cleanly. |
| Scene composition reference | `input/kickstarter/storyboarding/S3/selected.jpg` | Already shows the hand-into-bag composition for S3. Useful if you need to nudge composition in Image B specifically. |
| Logo asset (post only) | `input/images/logo/v4/Geometric teal circle on navy.png` | The approved IronPal logo. **Do not pass this to Luma** — composite it onto the side panel in post per `docs/s3-post-production-pipeline.md` §11. |

**Drag the PRIMARY product reference onto the Luma board first.** It uploads as a card and stays available as a reference for both image and video generation throughout your session.

---

## 2. Generate Keyframe Images IN LUMA (with reference images attached)

Both keyframes are generated inside Luma's image generator (the **image icon** in the bottom toolbar — second from the left) using **Nano Banana Pro** as the image model. Nano Banana Pro is Google's Gemini-class image model and behaves differently from Stable Diffusion / Leonardo / Midjourney in two important ways:

- **No separate negative-prompt field.** Forbidden things are appended to the main Instruction text as natural-language exclusion paragraphs. The exclusions in §2.1 and §2.2 below are pre-written in this style — paste them as part of the Instruction, not into a non-existent negative box.
- **Strong adherence to reference images.** Nano Banana Pro respects 2 reference images cleanly. Using **two** references where appropriate (one for product design, one for scene continuity) is the single biggest control lever for this workflow. Do not exceed 2 references per generation — three or more confuses the model and produces averaged, muddy results.

For each keyframe, the workflow is the same:
- Click the image icon in the bottom toolbar → pick **Nano Banana Pro**.
- Attach reference images per the instructions in the subsection below (the slots accept drag-from-board cards or file uploads).
- Set aspect ratio: **16:9**.
- Set quality: **4K**.
- Paste the **Instruction** (which includes the inline exclusions at the end).
- Click **Create**. Generate **6–8 variants per keyframe**.

> **If you switch image models** (e.g. Luma Photon, Leonardo, or any Stable Diffusion-based tool) the exclusion paragraph at the end of each Instruction also works as a verbatim **Negative prompt** input — the wording is compatible with both styles.

---

### 2.1 Image A — START frame

**References (attach one):**
1. **Slot 1:** `input/images/product/headband/gpt-image-1_5_A_photorealistic_product_marketing_hero_image_of_a_sleek_modern_fitness_headband-0_a2d0b26d-b304-4514-ae69-2563f94ed95b.jpg` — the canonical product hero. Locks the headband design.

Slot 2 stays empty for Image A — there's no prior keyframe to anchor scene continuity to yet. You're inventing the scene.

Save the picked variant as `s3_keyframe_A_bag_open.png` to `input/kickstarter/storyboarding/S3/luma-keyframes/`.

**Instruction (paste into Nano Banana Pro with the product hero attached as Reference 1):**

> The headband design must match the attached reference image exactly — matte black exterior, thin electric teal accent stripe, small front-center camera lens module with a tiny pinhole teal LED. Photorealistic cinematic medium close-up of a partially-open matte black athletic gym bag sitting on a dark walnut workbench in a modern minimalist gym. Inside the bag, the IronPal headband is visible above the rim — the front-center camera lens module and the small teal LED can be naturally visible if the framing reveals them; pinch-end facing up; design exactly as the reference. Warm late-afternoon golden-hour lighting from camera-left at 45 degrees, soft warm shadows, controlled deep blacks, 50mm lens, f/2.0, shallow depth of field with gym equipment softly out of focus in the background — barbell rack and folded gray towel as bokeh shapes. Frame composition: bag fills the lower 60 % of frame, dead-air upper 40 % so the headband can rise into clear space in the next shot. Style: cinematic product photography, warm amber color grade, Kodak Vision3 250D film stock feel, 8K detail, premium athletic brand aesthetic.
>
> Do not include: cartoons, illustrations, 3D renders, hands, fingers, arms, people of any kind, cool blue or daylight lighting, fluorescent overhead lights, kitchen environments, domestic clutter, branded sportswear logos other than IronPal, watermarks, text overlays, or cluttered backgrounds. The image must be photorealistic only.

Acceptance for Image A:
- [ ] Bag clearly readable as an athletic gym duffle, not a shopping bag.
- [ ] Headband visible above the rim with design matching the reference. The lens module and LED can be visible — that's fine, often better.
- [ ] Warm gym light wrapping the bag, deep clean blacks.
- [ ] Clean composition with room above the bag for the lift.
- [ ] No hands, no people, no kitchen.

---

### 2.2 Image B — END frame

**References (attach two — order matters):**
1. **Slot 1 (Reference 1): your saved Image A** — the bag-in-gym shot you just generated. **This is the most important reference for Image B**, because Ray 3.14 HDR (the §3 video step) can only smoothly interpolate between two keyframes that share the same scene. Drag the `S3_keyframe_A_bag_open` card from your Luma board directly into the first reference slot.
2. **Slot 2 (Reference 2):** the same product hero PNG you used for Image A (`input/images/product/headband/gpt-image-1_5_A_photorealistic_product_marketing_hero_image_of_a_sleek_modern_fitness_headband-0_a2d0b26d-b304-4514-ae69-2563f94ed95b.jpg`). Locks the headband design so Image B's headband matches Image A's.

Save the picked variant as `s3_keyframe_B_apex.png` to `input/kickstarter/storyboarding/S3/luma-keyframes/`.

**Instruction (paste into Nano Banana Pro with both references attached, in the order above):**

> The gym environment, walnut workbench, lighting direction, camera angle, and gym bag in this image must match Reference 1 (the gym-bag scene) exactly. The headband design must match Reference 2 (the product hero) exactly. Photorealistic cinematic medium close-up of an athletic male right hand and forearm holding the IronPal headband by its left end, pinched between thumb and forefinger, the headband draping straight down as a thin flat vertical strip with its matte black exterior facing camera. The headband shows the matte black exterior, thin electric teal accent stripe along its length, small flush-mounted camera lens module 8 mm diameter on the front center panel with a tiny pinhole teal LED glowing softly, and a clean rectangular brand-mark area on the right side panel where the IronPal wordmark sits. Below the headband, the same partially-open matte black athletic gym bag from Reference 1 sits on the same dark walnut workbench, the bag interior visible. The hand has just lifted the headband fully clear of the bag, holding it steady at chest height. Same modern minimalist gym setting as Reference 1 — barbell rack and folded gray towel as soft bokeh shapes, same wall, same window light. Warm late-afternoon golden-hour lighting from camera-left at 45 degrees (matching Reference 1), soft warm shadows wrapping the hand and headband, 50mm lens, f/2.0, shallow depth of field. The hand: anatomically correct five fingers, calm relaxed grip, natural wrist angle, athletic male skin tone. Style: cinematic product photography, warm amber color grade, Kodak Vision3 250D film stock feel, 8K detail, premium athletic brand aesthetic.
>
> Do not include: cartoons, illustrations, 3D renders, multiple people, female hands, child hands, cool blue or daylight lighting, fluorescent overhead lights, kitchen environments, domestic clutter, branded sportswear logos other than IronPal, watermarks, distracting text overlays, deformed hands, extra fingers, awkward wrist angles, jewelry, watches, tattoos, the headband as a coiled loop or ring shape, headbands thicker than 2 cm, or visible inner lining of the headband. The image must be photorealistic only, with anatomically correct five-fingered hands, and the gym environment must match Reference 1.

Acceptance for Image B:
- [ ] Headband held flat, vertical strip, **not** as a coiled loop or ring.
- [ ] Matte black exterior facing camera; no pale lining visible.
- [ ] IronPal wordmark area + LED + teal stripe present (wordmark text may be garbled — that's fine, see post note below).
- [ ] Hand grip clean, anatomically correct, no jewelry, no watch.
- [ ] **Gym environment, lighting, workbench, and bag visibly match Image A** — same room, same wall, same towel, same warm key from camera-left.
- [ ] Bag still in the lower portion of the frame, in roughly the same position as Image A.

If the wordmark text is garbled (very likely with current models), **do not retry to perfect it**. Generate the still with a clean side panel area and **composite the wordmark in post per `docs/s3-post-production-pipeline.md` §11**. The keyframe only needs to define a clean side panel surface; post adds the brand.

---

## 3. Generate the Video — Ray 3.14 HDR with both keyframes

Both keyframes are now on your Luma board. Time to make the video.

1. Click the **video icon** in the bottom toolbar (third icon from the left).
2. From the **CREATE VIDEO** menu pick **Ray 3.14 HDR**. (Avoid Veo 3.1 unless you can confirm it exposes end-frame keyframe slots in your board's UI — Veo's text-to-video mode is excellent but the keyframe interpolation pattern this prompt is engineered around lives in Ray. Kling 3.0 is the last-resort fallback if Ray gives nothing usable.)
3. Set **Image A** (`s3_keyframe_A_bag_open.png`) as the **start frame** — drag it into the start slot, or click the start-frame "+" and pick from board.
4. Set **Image B** (`s3_keyframe_B_apex.png`) as the **end frame** — same procedure for the end slot.
5. Settings:
   - **Duration:** 5 seconds.
   - **Aspect ratio:** 16:9.
   - **Camera motion:** Static / None (no push, no pan, no zoom — the action is the hand, not the camera).
   - **Loop:** Off.
   - **Resolution:** Highest available (Ray 3.14 HDR delivers 1080p natively; if a 4K toggle is exposed in your tier, use it).
6. Paste this prompt into the text field:

```
A right hand smoothly enters from the bottom of the frame, reaches calmly into the open matte black athletic gym bag, grips the matte black headband by its left end with thumb on top and forefinger underneath, and lifts it in a single continuous deliberate arc upward to chest height over approximately 1.5 seconds, where the hand holds the headband steady with the matte black exterior facing the camera. Throughout the lift, the headband stays as a thin flat vertical strip — never coiled, never ringed, never thickened. The thin teal accent stripe and IronPal branding remain perfectly stable on the side panel; the small front-center LED stays in place. The hand grip remains stable throughout — no fumbling, no re-gripping, no rotation beyond a gentle 10-degree tilt to present the side panel to the camera. The fingers stay anatomically correct: five fingers, no extra digits, natural wrist angle, no jewelry, no watch. The bag and the workbench remain perfectly still — only the hand and the headband move. The warm golden-hour lighting stays consistent: warm key from camera-left at 45 degrees, soft warm shadows on the hand and headband, deep clean blacks. The background gym equipment stays softly out of focus throughout — no shifts in depth of field, no rack movement, no people walking through. Style: cinematic product reveal, photorealistic, warm amber Kodak Vision3 film color, premium athletic brand aesthetic. The motion is calm, confident, and deliberate, like a high-end product unboxing.
```

7. Hit **Generate** — and queue **6 generations back-to-back** with the same setup (Ray 3.14 HDR is non-deterministic; the value is in the batch, not the single roll).

---

## 4. Why this prompt is shaped this way

Six engineering choices, each driven by a specific failure mode:

| Choice | What it prevents |
|---|---|
| **Product reference attached to every keyframe generation (§2)** | Design drift across the keyframes — the headband looks identical in Image A and Image B because both are conditioned on the same product photo. |
| **Image-to-video with start + end keyframes (§3)** | Product invention drift across video frames. Both endpoints are pre-fixed; Ray only interpolates motion. |
| **"thin flat vertical strip — never coiled, never ringed, never thickened"** | The shape-morph failure where the headband becomes a thick rope or a closed loop mid-lift. |
| **"single continuous deliberate arc upward to chest height over approximately 1.5 seconds"** | Hesitation, re-gripping, hand fumbling. Specifying duration + path keeps the action coherent. |
| **"hand grip remains stable throughout — no fumbling, no re-gripping"** | The known mid-shot grip break failure. |
| **"only the hand and the headband move"** | Background drift and parallax glitches. Locks the rest of the frame. |

The video prompt deliberately does **not** describe the headband's design (color, stripe, LED, wordmark) — that information is carried by the start + end frames, which themselves were locked by the product reference image in §2. Each link in the chain has one job.

---

## 5. Iteration Protocol

Ray is non-deterministic. Don't expect the first generation to be the keeper.

1. **First batch:** generate **6 variants** with the same keyframes + prompt (queue 6 jobs back-to-back). ~$10–15 in credits.
2. **Review at 4× speed scrub.** Discard any that show: shape morph, grip break, text degradation, camera motion, background drift, anatomy issues.
3. If 1–2 variants survive, you have a hero candidate. Pick the cleanest, run it through `docs/s3-post-production-pipeline.md`.
4. If 0 variants survive, **adjust one variable at a time and re-batch:**
   - First: regenerate **Image B** with a cleaner hand pose (re-attach the product reference, regenerate, repick); re-batch the video.
   - Then: try without end-frame (image-to-video from Image A only); re-batch.
   - Then: use Luma's **chat panel** ("What do you want to do?") on the best near-miss to fix the specific defect — e.g. "regenerate this clip but keep the hand grip stable through the entire lift".
5. **Hard stop after 3 batches** (~18 variants, ~$45). If nothing works, accept that AI is not the path for this shot and ship the in-house S3 master per `docs/s3-post-production-pipeline.md`.

---

## 6. Acceptance Criteria for the Generated Video

A generation is "usable" only if all of the following hold:

- [ ] Headband shape is **continuously visible** as a thin flat strip — no morph to rope, loop, or thicker mass.
- [ ] Headband design matches the §1 product reference (matte black, teal stripe, lens, LED present at the right places).
- [ ] Hand grip is **stable across the full lift** — no fumbling, no re-grip.
- [ ] Side panel of the headband is **facing camera at the apex** for ≥0.5 s of usable hold.
- [ ] **No camera motion** — locked-off from start to end.
- [ ] **Background stays still** — no rack drift, no person walks through, no DOF hunt.
- [ ] **Anatomy is correct** — five fingers, natural wrist, no extra digits.
- [ ] **Lighting stays consistent** — warm key from camera-left, no shifts.
- [ ] **No glaring text artifacts** — if wordmark is present and garbled, that's OK *only if* the side panel area is otherwise clean enough for post compositing per `docs/s3-post-production-pipeline.md` §11.
- [ ] **Bag stays anchored** — bottom of bag does not move in frame.

Anything failing two or more = discard and re-batch.

---

## 7. Brand & Visual Consistency Notes

For the generation to read as part of the IronPal campaign:

- **Product design lock:** every Image A and Image B generation uses the §1 PRIMARY product reference image as a Luma reference. Skipping this step is the single most common cause of design drift between the two keyframes.
- **Color grade target:** warm amber, Kodak Vision3 250D film stock feel — matches the Dehancer preset planned for the rest of the campaign (`docs/founder-led-production-strategy.md` §4 + `docs/s3-post-production-pipeline.md` §15).
- **Lighting direction:** warm key from camera-left at 45° — matches every other founder shot (S2c, S4a–S5).
- **Background:** modern minimalist gym, softly out of focus, deep bokeh — matches the planned environment of S4a–S5.
- **Wardrobe (if forearm shows skin):** matches whatever shirt is locked for S1–S5 (matte black or campaign teal). The reference images intentionally show only the hand and forearm — if a sleeve is visible, regenerate Image B with the locked color noted in the prompt.
- **Wordmark + LED:** **always composite in post**, never trust AI to render them perfectly. The reference and the keyframes include them only as a guide to where the side panel should be clean. Post per `docs/s3-post-production-pipeline.md` §11–§12.

---

## 8. Camera & Motion Settings (Luma controls)

| Control | Setting | Reason |
|---|---|---|
| Model | **Ray 3.14 HDR** | Strongest Luma model that exposes start + end frame keyframes. HDR gives wider dynamic range — important for the warm key + deep blacks. |
| Camera motion | **Static** | The action is the hand. Any added camera motion fights the post composite and the planar track. |
| Resolution | **1080p** native, or 4K if exposed | If 1080p, upscale to 4K with Topaz Video AI before integration so the spatial resolution matches the in-house source. |
| Duration | **5 seconds** | Matches the in-cut window. 3 s is too tight for the lift + hold; 9 s wastes credits and risks more drift. |
| Loop | **Off** | Single linear shot. |
| Aspect ratio | **16:9** | Matches the master timeline. |
| Seed | **Random** for the first batch; **lock the best seed** if a variant nearly works and re-roll with same seed + tweaked prompt. |

---

## 9. Cost & Time Estimate

| Item | Cost |
|---|---|
| Image A — Luma image gen with reference (6–8 variants) | ~$1 |
| Image B — Luma image gen with reference (6–8 variants) | ~$1 |
| Ray 3.14 HDR — 6 video generations × ~$2 | ~$12–15 |
| Iteration buffer (3 batches max) | up to ~$45 |
| **Time per attempt set** | ~2–3 hours (image generation + Luma queue + review) |
| **Hard cap** | $45 in credits, ~6 hours of operator time. After that, ship the in-house S3. |

Confirm credit balance before queuing — Ray 3.14 HDR's pricing in your account may be higher than Ray 2 was. The "Upgrade" button in the top-right suggests you may be on free tier; expect to top up before the batch will run.

---

## 10. Known Failure Modes and Recovery

| Failure | Recovery |
|---|---|
| Headband becomes a coiled loop mid-lift | Add to prompt: *"the headband never curls into a ring at any point in the motion."* Regenerate Image B with a flatter pose. |
| Hand grows extra finger or fuses fingers | Regenerate Image B until the keyframe hand is anatomically clean. Ray respects the keyframes — bad hand in keyframe = bad hand in video. |
| Background drifts / parallaxes | Confirm camera motion is **Static**. Re-emphasize *"the background stays perfectly still"* in the prompt. |
| Wordmark text is garbled across the lift | Expected. Strip the wordmark from Image B (clean side panel only) and composite in post. |
| Lift is too fast / too slow | Adjust the *"approximately 1.5 seconds"* phrase to *"approximately 2 seconds"* (slower) or *"approximately 1 second"* (faster). |
| The generation looks too static (no motion at all) | Reduce the keyframe similarity — if Image A and Image B are too similar (e.g. both show the headband above the bag), Ray may collapse the motion. Push Image A to be the bag-only state; push Image B to be the full apex state. |
| Bag opening shape morphs | Add: *"the bag opening keeps its exact shape and position throughout."* |
| LED appears mid-shot when it shouldn't | Strip the LED from Image B (clean front panel) and composite in post per `docs/s3-post-production-pipeline.md` §12. |
| Headband design between Image A and Image B doesn't match | The most common cause is forgetting to attach the §1 product reference to one of the keyframe generations. Re-do the keyframe with the reference attached. |
| Ray exposes only a start-frame slot, not end-frame | Use start-frame only with Image B (the apex pose), and let Ray interpolate **outward from** the apex — accept it will be different motion than the bag-pull design. Or switch to Kling 3.0 which historically has clearer keyframe controls. |

---

## 11. The Honest Caveat

Even with the locked reference, start + end keyframes, and a tight prompt, current AI video generation is **not reliable** for hero product reveals involving small precise objects and physical interaction. This prompt is the best-engineered attempt available; it is **not** a guarantee.

Treat any usable result as a **bonus** that supplements the in-house S3 master:
- If Ray 3.14 HDR produces a usable hero, you can A/B test it against the in-house version and pick the better of the two for the cut.
- If Ray produces nothing usable, you've spent ~$45 and 6 hours and confirmed the in-house path is the right one. That's a reasonable insurance cost.

The in-house S3 selects (`input/kickstarter/storyboarding/S3/selects/`) and the post pipeline (`docs/s3-post-production-pipeline.md`) remain the **default deliverable**. This prompt is the optional second swing.

---

## 12. References

- `input/images/product/headband/` — canonical product reference images (PRIMARY hero is the file noted in §1).
- `input/kickstarter/storyboarding/S3/selected.jpg` — S3 scene composition reference.
- `docs/s3-shoot-plan.md` — the in-house shoot plan that captured the existing selects.
- `docs/s3-post-production-pipeline.md` v3 — the post pipeline that turns the in-house source into the master cut.
- `docs/s3-clip-analysis.md` — analysis of prior failed AI attempts at S3.
- `docs/video-generation-analysis.md` — broader analysis of AI video gen failure modes across the campaign.
- `docs/founder-led-production-strategy.md` — the campaign-wide pivot that puts AI in a cutaway/polish role; this prompt is consistent with that role (S3 lift sits on the boundary between hero and product-reveal, and this is the one place AI gets a second swing).

---

**Prepared by:** Producer (solo founder)
**Date:** 2026-05-04
**Status:** Draft v2 — adopts Ray 3.14 HDR + reference-image workflow (v1 used Ray 2 + externally-generated keyframes in Leonardo/MJ)
**Distribution:** CD, AVP, Producer
