# S3 — Runway Video-to-Video Plan

**Shot:** S3 — Athlete's hand pulls IronPal headband from a gym bag
**Tool:** Runway → **Gen-4** (or **Gen-4 Turbo** for cost) — Video-to-Video mode
**Approach:** Use the in-house kitchen footage as a **real motion plate**; let Runway preserve the motion and transform only the visual style + background.
**Status:** Draft — parallel third-swing AI path alongside the in-house master and the Luma keyframe attempt
**Date:** 2026-05-04

---

## 0. Read this first

Three AI paths have been discussed for S3, in order of fool-proofness:

1. **Pure text-to-video** (Luma, Kling, Veo) — failed multiple times. Models can't invent the product motion reliably.
2. **Image-to-video with start + end keyframes** (Luma Ray 3.14 HDR with Nano Banana Pro keyframes — see `docs/s3-luma-prompt.md`) — better, but Trial-tier currently strips the end frame on Ray.
3. **Video-to-video with the in-house footage as motion plate (this doc)** — the most reliable of the three for this shot, because the AI doesn't have to invent any motion. It only re-skins what was actually filmed.

Why Runway specifically over Luma for this approach: Runway's Gen-4 Video-to-Video tracks motion from the input clip and transforms visuals around it. Luma's video-to-video tries to reimagine motion, which is the failure mode that killed earlier attempts. For hand-object scenes with cinematic continuity requirements, Runway is the right tool.

This path is the **most likely of the three to produce a usable result**. It still might not — current AI video editing isn't magic. But the success rate is materially higher than text-to-video or keyframe interpolation for this specific shot.

The in-house master from `docs/s3-post-production-pipeline.md` v3 remains the **default deliverable**. Runway video-to-video is the second swing — it transforms the same source into something that may read as more cinematic. If it works, A/B against the directly-composited version and pick the better.

---

## 1. Inputs

### 1.1 Source video (the motion plate)

**Primary:** `input/kickstarter/storyboarding/S3/selects/S3_select_1_hero.mp4` — Take 1, apex at t≈8.0 s, ~22 s total duration.
- Specs: 3840×2160, 30 fps, HEVC, ~17.7 Mbps, BT.709 SDR.
- Audio present (will be stripped; Runway ignores audio anyway).

**Backup:** `S3_select_2_backup.mp4` — use if the hero develops an issue mid-iteration.

### 1.2 Reference assets

| File | Role |
|---|---|
| `input/images/product/headband/gpt-image-1_5_A_photorealistic_product_marketing_hero_image_of_a_sleek_modern_fitness_headband-0_a2d0b26d-b304-4514-ae69-2563f94ed95b.jpg` | Product design lock — attach as image reference if Runway exposes the slot. |
| `input/kickstarter/storyboarding/S3/selected.jpg` | Visual style reference for the cinematic gym look. |
| Any S4a generated frame from `input/kickstarter/storyboarding/S4a/` | Gym environment / lighting reference for visual continuity with the rest of the campaign. |

### 1.3 Output target

- Runway output: 1080p MP4 (Gen-4) or up to 4K on higher tiers.
- Final destination: replaces or supplements `S3_master_v<n>.mov` from the post pipeline.
- Conform to 24 fps in post (master timeline runs at 24).

---

## 2. Step 1 — Clip Preparation (don't skip this)

Runway responds to *what's in the frame*. Aggressive trimming and cropping before upload is the single biggest quality lever.

### 2.1 Trim

Open `S3_select_1_hero.mp4` in **CapCut** (fastest), **DaVinci Resolve** (free), or any editor.

Trim to **2.5–4.0 seconds** containing only the action:
- **In point:** ~0.3 s before the hand enters the frame (~t = 5.5 s in source).
- **Out point:** ~0.3 s after the apex hold ends (~t = 9.0–9.5 s in source).
- Result: ~3.5 s of usable footage.

Why short: every frame Runway processes costs credits, and longer clips give the model more chances to drift. 2.5–4 s is the sweet spot.

### 2.2 Crop

Crop **tight** around the action — bag + hand + headband. Push the frame edges in until you can barely see the kitchen wall or counter at the perimeter.

- Aim for ~70–80 % of the original frame area.
- Maintain 16:9 aspect — Runway supports 16:9 cleanly; 9:16 / 1:1 are detours.
- Don't crop into the prop or the bag opening — those are the load-bearing visual elements.

Why crop matters: the kitchen wall is the strongest "wrong context" signal. Less of it in the input = less of it the model has to suppress = stronger transformation. Cropping moves work from the AI to the editor — and the editor (you) is more reliable than the AI.

### 2.3 Export specs

Export the trimmed + cropped clip as:
- **Format:** MP4 (H.264 codec).
- **Resolution:** 1920×1080 (downscale from 4K is fine; Runway caps Gen-4 video-to-video input around 1080p anyway).
- **Frame rate:** 30 fps (keep source rate; conform to 24 in final post).
- **Bitrate:** 15–25 Mbps (high enough to preserve detail; low enough to upload fast).
- **Audio:** strip (Runway ignores it).

Save to: `input/kickstarter/storyboarding/S3/runway-input/S3_runway_input_v01.mp4`.

Create the folder first if it doesn't exist: `mkdir -p input/kickstarter/storyboarding/S3/runway-input/`.

---

## 3. Step 2 — Upload to Runway

1. Sign in at [runwayml.com](https://runwayml.com). Confirm you're on a tier that includes Gen-4 video-to-video (Standard plan and above as of 2026; free tier is text-to-video only).
2. From the dashboard, click **Generate → Video** → choose **Gen-4** (full quality, slower) or **Gen-4 Turbo** (faster, cheaper, ~70 % of full quality). Start with Turbo for the first iteration round; switch to full Gen-4 for final hero generation only if Turbo can't get there.
3. Switch to **Video to Video** mode (the input-clip version, not the text-only or image-only modes).
4. Upload `S3_runway_input_v01.mp4` from §2.3.
5. (If exposed) attach the **product hero reference image** from §1.2 as a visual style reference. Runway's UI varies — look for "Style Reference", "Image Reference", or a paperclip icon next to the prompt input.

---

## 4. Step 3 — Settings

These four settings make or break the result. Set them deliberately, not by feel.

| Setting | Value | Reason |
|---|---|---|
| **Transformation Strength** | **0.6** (initial); range 0.55–0.7 | 0.4 → too close to kitchen; 0.8 → motion breaks. 0.6 is the documented sweet spot for hand-object scenes. |
| **Structure / Motion Preservation** | **High** | Locks the hand trajectory and headband shape from the source. Without this, Runway treats the motion as a suggestion. |
| **Duration** | **Original (don't extend)** | Runway can extend clips with synthesized motion — that's the failure mode. Match the source length exactly. |
| **Seed** | **Random** for the first batch; **lock** to the best seed once a near-miss appears | Iterating on a good seed with a tweaked prompt is much faster than re-rolling cold. |
| **Resolution** | **1080p** (Gen-4 default) | Upscale to 4K in post with Topaz if the editor flags softness. |
| **Output FPS** | **Match source (30 fps)** | Conform to 24 in the master timeline post step. |

---

## 5. Step 4 — Prompt & Negative Prompt

### 5.1 Positive prompt (paste into Runway's prompt field)

```
A premium modern gym environment replaces the background of the input video. A realistic athletic male hand smoothly pulls a sleek matte black IronPal fitness headband out of a black gym bag, following the exact motion from the input video. The headband is thin and modern, with a subtle electric teal accent stripe along its length and a small front-center camera lens module with a soft glowing teal LED. Lighting is warm and cinematic — golden-hour key from camera-left at 45 degrees in a high-end gym, with soft warm highlights and natural deep shadows. The background is a clean professional gym with blurred barbell racks and folded gray towels in soft bokeh, no clutter, no people, no kitchen elements. Photorealistic, stable shapes, premium athletic technology commercial style, Kodak Vision3 250D film stock feel.
```

### 5.2 Negative prompt (paste into Runway's negative field — Runway DOES support negatives, unlike Nano Banana Pro)

```
distorted hands, extra fingers, deformed wrist, warped object, flickering, unstable shapes, plastic look, kitchen, cabinets, kitchen countertop, domestic clutter, fluorescent lighting, cool blue light, harsh shadows, branded sportswear logos other than IronPal, watermark, text overlays, cartoon, illustration, 3D render
```

### 5.3 Why these prompts are shaped this way

| Prompt element | What it controls |
|---|---|
| "following the exact motion from the input video" | Anchors structure preservation. Runway weights this heavily. |
| "stable shapes" | Counters the documented headband-morph failure mode. |
| "no people" | Stops Runway from adding extra athletes in the deep background. |
| "no kitchen elements" | Belt-and-suspenders against any kitchen wall surviving the transformation. |
| "Kodak Vision3 250D film stock feel" | Aligns with the campaign-wide grade (`docs/founder-led-production-strategy.md` §4 + `docs/s3-post-production-pipeline.md` §15) — even if Runway doesn't truly emulate the stock, it nudges the color in the right direction. |

---

## 6. Step 5 — Iteration Logic

Runway is non-deterministic. Plan for **3–4 generations minimum** to find a usable variant. Adjust **one variable at a time** between rolls, not multiple:

| Symptom in the output | Adjustment |
|---|---|
| Kitchen wall / cabinet still visible | Increase Transformation Strength to **0.7**. If still visible at 0.7, re-crop the input tighter (§2.2) and re-upload. |
| Hand looks weird, fingers fuse, wrist breaks | Decrease Strength to **0.55**. If still weird, lock seed and add to prompt: *"anatomically correct hand, five fingers visible, natural wrist angle"*. |
| Headband warps / morphs mid-lift | Add to prompt: *"the headband keeps its original shape and proportions throughout, no warping, no morphing"*. Confirm Structure Preservation is set to High. |
| Background looks fake / cardboard / pasted-on | Add to prompt: *"natural depth of field, realistic lighting integration, soft volumetric atmosphere"*. |
| Result is too close to original (kitchen visible, no transformation) | Increase Strength to **0.7**. If that overshoots, hold at 0.7 but add gym specifics to prompt: *"barbell rack visible in deep background bokeh, polished concrete gym floor, exposed brick wall"*. |
| Logo / wordmark on side panel is garbled | Expected. **Don't fix in Runway.** Composite the wordmark in post per `docs/s3-post-production-pipeline.md` §11. |
| LED isn't visible or wrong color | Expected. **Don't fix in Runway.** Composite the LED in post per `docs/s3-post-production-pipeline.md` §12. |

### 6.1 Hard stop

Cap iteration at **6 generations** (~$30–60 in credits depending on Gen-4 vs Turbo). If nothing usable emerges after 6, the in-house master per `docs/s3-post-production-pipeline.md` v3 is the deliverable. Don't keep rolling — the marginal probability of a 7th roll succeeding when the first 6 didn't is low.

---

## 7. Step 6 — Post-Production Polish

> **Detailed runbook:** `docs/s3-runway-post-production-polish.md` — step-by-step end-to-end post for the on-disk Aleph output, with exact tools, settings, and acceptance checks. Use that doc for execution. The §7.1–§7.4 below remain as a high-level summary of the same workflow.

Once you have a Runway result that passes §8 acceptance, it still needs to be integrated into the campaign cut. This is *additive* to the existing post pipeline, not a replacement.

### 7.1 Conform & color

1. Bring the Runway output into **DaVinci Resolve** (or your NLE of choice).
2. Conform to **24 fps** the same way the in-house source is conformed (§8 of `docs/s3-post-production-pipeline.md` — interpret 30 fps clip as 24 fps).
3. Apply the **campaign-wide Dehancer preset** (`post/assets/Dehancer_campaign_v01.drx` per `docs/s3-post-production-pipeline.md` §15.1). This locks the Runway output to the same color identity as the rest of the campaign.
4. A/B against an S4a reference frame to confirm midtone match within ΔE ≈ 5.

### 7.2 Composite the brand assets

The Runway output handles the gym environment and motion. The post pipeline still adds the brand:

5. **Track the side panel** with Fusion Planar Tracker per `docs/s3-post-production-pipeline.md` §10.
6. **Composite the IronPal lockup** (circle + wordmark) onto the tracked plane per §11. Even if Runway rendered an approximation of the wordmark, the post comp ensures pixel-perfect brand fidelity.
7. **Composite the teal LED** synced to the VO-2 audio peak per §12.

### 7.3 Final polish

8. Slight blur on the deep background (1–2 px Lens Blur on the upper third where the racks are) — emphasizes shallow DOF and hides any AI artifacts in the bokeh.
9. Subtle radial vignette (-0.08 outside, feather 0.5) following the apex hold via planar-tracked Power Window.
10. Optional: **Topaz Video AI** Detail / Iris model at low strength if the Runway output looks soft at 4K timeline scale.

### 7.4 Render

Render per `docs/s3-post-production-pipeline.md` §18 (renumbered; was §17 before v3): ProRes 4444 XQ master + H.264 1080p preview. No audio.

---

## 8. Acceptance Criteria

A Runway generation is "usable" only if all of the following hold:

- [ ] Hand motion matches the input video — same trajectory, same grip, same timing.
- [ ] Headband shape is **continuously visible** and recognizable as a thin flat strip — no morph to rope, loop, or thicker mass.
- [ ] **No kitchen elements visible** anywhere in the frame at any point.
- [ ] Background reads as a modern gym — racks, towel, warm light. Doesn't have to be the same gym as S4a (the §7.2 grade match handles continuity).
- [ ] **No camera motion** added — Runway should preserve the locked-off feel of the source.
- [ ] **Anatomy is correct** — five fingers, natural wrist, no extra digits.
- [ ] **Lighting is warm-amber** and reads as cinematic — not flat, not cool, not fluorescent.
- [ ] **Bag stays anchored** — bottom of bag does not drift or warp.
- [ ] Headband design is plausibly IronPal — matte black, dark with hints of teal. Wordmark and LED can be garbled or absent (post adds them).

Anything failing two or more of those = discard and re-roll per §6.

---

## 9. Cost & Time Estimate

| Item | Cost |
|---|---|
| Clip prep (trim + crop) | $0 (CapCut / Resolve, ~15 min) |
| Runway Gen-4 Turbo, 5 generations × ~$3 | ~$15 |
| Runway Gen-4 (full), 1 final hero generation | ~$8 |
| Iteration buffer | up to ~$60 hard cap |
| Post integration (color match + comp brand assets) | reuses the existing `docs/s3-post-production-pipeline.md` work, +1–2 hr for Runway-specific conform |
| **Time per attempt set** | ~3–4 hours (clip prep + Runway queue + review + post polish) |
| **Hard cap** | $60 in credits, ~6 hours of operator time. After that, ship the in-house S3 master. |

Runway pricing is per-second of generated output, not per-generation. A 3.5 s clip on Gen-4 Turbo is ~$3; on full Gen-4 is ~$8. Confirm current pricing on Runway's billing page before queuing.

---

## 10. Why this works (the summary)

| What | Why |
|---|---|
| **Real footage as input** | Runway has actual hand motion to track — no invention required. The single biggest win over text-to-video and keyframe interpolation. |
| **Tight crop** | Less kitchen for the AI to suppress = stronger transformation = more believable gym. |
| **Strength 0.6 + High Structure** | Documented sweet spot for hand-object scenes. Strong enough to transform style; weak enough to preserve motion. |
| **Negatives included** | Runway respects negatives unlike Gemini-class models. Use this advantage. |
| **Brand assets composited in post** | Runway can't render text reliably. Don't fight it — let Runway do environment + style; let Resolve/Fusion do brand. |
| **Same Dehancer preset as the rest of the campaign** | Visual continuity. The Runway output looks like S4a–S5 because it's graded with the same preset. |

---

## 11. Known Failure Modes (with recovery)

| Failure | Recovery |
|---|---|
| All 6 generations look like a slightly-prettified kitchen | Re-crop tighter (§2.2). The kitchen wall is too dominant in the frame. |
| All 6 generations break the hand mid-lift | Drop to Strength 0.5. If still breaks, the input clip's motion blur is too high for Runway — re-export the input from a different take (S3_select_2_backup.mp4 or S3_select_3_alt-angle.mp4). |
| Runway outputs feel "stylized" / not photoreal | Add to prompt: *"unstylized, documentary photorealism, no painterly effects, no oversaturation"*. Drop strength to 0.55. |
| Hand color tone shifts mid-clip | Lock seed; add to prompt: *"consistent skin tone throughout, no flicker"*. |
| Background equipment changes shape between frames | Lower Strength; ensure Structure Preservation is High. The background is meant to be in bokeh — sharp racks moving = strength too high. |
| Generation costs are escalating | Switch from Gen-4 to Gen-4 Turbo. Quality difference is ~30 %; cost difference is ~60 %. |

---

## 12. Fallback Paths

If Runway video-to-video doesn't produce a usable result after the §6 hard stop:

1. **Ship the in-house master per `docs/s3-post-production-pipeline.md` v3.** This was always the default deliverable. The kitchen → gym BG swap (§13) and the Dehancer polish (§15) handle the cinematic look without AI re-skinning.
2. **Try Kling Motion Control** as a different vendor's video-to-video — Kling sometimes succeeds where Runway fails on hand-object scenes.
3. **Re-shoot S3 at the actual gym** — if a gym day is on the calendar for S4a–S5, ~30 min of re-shooting eliminates both the BG swap and the Runway path entirely. See `docs/s3-post-production-pipeline.md` §14.2 Path 2.

The fallbacks are listed in order of decreasing effort. Path 1 (ship the in-house master) is the lowest-effort, highest-confidence path; the gym re-shoot is the highest-quality but requires scheduling.

---

## 13. References

- `input/kickstarter/storyboarding/S3/selects/S3_select_1_hero.mp4` — the motion plate (input).
- `input/images/product/headband/` — product reference images.
- `docs/s3-shoot-plan.md` — the in-house shoot plan that captured the source.
- `docs/s3-post-production-pipeline.md` v3 — the post pipeline that integrates whatever S3 master is chosen (in-house or Runway-transformed).
- `docs/s3-luma-prompt.md` — the parallel Luma keyframe attempt (different AI path).
- `docs/s3-clip-analysis.md` — analysis of prior failed AI attempts on S3.
- `docs/video-generation-analysis.md` — broader campaign AI gen failure analysis.
- `docs/founder-led-production-strategy.md` — the campaign-wide pivot that scopes AI to cutaways + polish; this Runway path is consistent with that role for the *one* hero shot where in-camera filming alone isn't producing the cinematic feel.

---

**Prepared by:** Producer (solo founder)
**Date:** 2026-05-04
**Status:** Draft — ready to execute. Try Gen-4 Turbo first; escalate to full Gen-4 only for the final hero generation if Turbo gets close.
**Distribution:** CD, AVP, Producer
