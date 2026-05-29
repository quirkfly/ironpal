# S3 — Kling AI Plan (Match the Runway Aleph Output)

**Shot:** S3 — Athlete's hand pulls IronPal headband from a gym bag
**Tool:** Kling AI — primary path Kling **2.1 Pro Image-to-Video** with start + end keyframes; fallbacks via Motion Brush and Multi-Elements
**Approach:** Use the prepped kitchen footage as the motion source where Kling supports it; use the Runway Aleph output as the visual quality target and as the source of style/keyframe references.
**Status:** Draft — exploratory third-vendor comparison alongside the on-disk Runway Aleph deliverable
**Date:** 2026-05-29

---

## 0. Read this first

The Runway path already produced a usable S3 deliverable: `input/kickstarter/storyboarding/S3/runway-output/Gen-4 Aleph - clean - 4K.mp4` (4096×2304, 24 fps, ~4.0 s, H.264 ~8.3 Mbps). That clip is the **visual target** for this plan — Kling needs to land in the same neighborhood or better, otherwise the Runway output ships.

Why try Kling at all when Runway already works:

1. **Vendor diversification** — if a future S-shot has a failure mode that Runway can't crack, knowing Kling's strengths and limits ahead of time saves a day of trial-and-error.
2. **Per-second cost** — Kling Pro 1080p runs ~$0.07–$0.14 per generated second vs Runway Gen-4 ~$2/s; if Kling can match quality, the campaign's remaining AI shots get materially cheaper.
3. **Different failure surface** — Kling's image-to-video with keyframes can succeed on shots where Runway's video-to-video drifts, and vice versa. Worth confirming for the rest of the storyboard.

What Kling does **not** have that Runway Aleph does: a true single-pass video-to-video transformer that consumes a reference clip and re-skins its motion. Kling's closest equivalents (in order of fidelity to the source motion):

| Kling capability | Maps to Runway Aleph how? | Source-motion fidelity |
|---|---|---|
| **2.1 Pro Image-to-Video with start + end keyframes** | Two stills bracket the action; Kling synthesizes the in-between motion. | Medium-high — anchored at the endpoints, interpolated in the middle. |
| **2.1 Multi-Elements** | Annotate the hand / headband / bag as separately tracked objects with motion paths. | Medium — best for object identity preservation; weaker on hand anatomy. |
| **1.6 / 2.0 Motion Brush** | Paint motion vectors directly on a still. | Low-medium — works for simple linear paths; the lift + reveal is more nuanced. |
| **3.0 Reference Video (where available)** | Closest to Runway Aleph — but availability and quality on hand-object scenes is unverified at the time of writing. | Unknown — pilot first, don't bet the deliverable on it. |

**Primary path (this doc):** start + end keyframes on Kling 2.1 Pro. Cheapest to run, most predictable for a 4-second shot, and the keyframes can be lifted directly from the Runway Aleph output so the look is already locked in.

**This plan is exploratory.** The default deliverable for S3 remains the Runway Aleph output that has already passed `docs/s3-runway-review-20260504-160259.md`. Kling either matches it (then A/B in post and pick) or it doesn't (then we know, and the Runway output ships).

---

## 1. Inputs

### 1.1 Visual quality target

| File | Role |
|---|---|
| `input/kickstarter/storyboarding/S3/runway-output/Gen-4 Aleph - clean - 4K.mp4` | **Reference of record.** 4096×2304, 24 fps, ~4.0 s, H.264 ~8.3 Mbps. Every Kling generation is judged against this. |

### 1.2 Keyframe & motion-plate source

| File | Role |
|---|---|
| `input/kickstarter/storyboarding/S3/runway-input/S3_runway_input_v01.mp4` | Trimmed + cropped kitchen footage (1920×1080, 30 fps, 4.0 s). Source of motion-brush guides and Multi-Elements bounding boxes. |
| `input/kickstarter/storyboarding/S3/selects/S3_select_1_hero.mp4` | Original 4K take. Backup keyframe source if Aleph frames aren't usable. |

### 1.3 Style / product references

| File | Role |
|---|---|
| `input/images/product/headband/gpt-image-1_5_A_photorealistic_product_marketing_hero_image_of_a_sleek_modern_fitness_headband-0_a2d0b26d-b304-4514-ae69-2563f94ed95b.jpg` | Product design lock — used as Multi-Elements headband reference if that path is taken. |
| `input/kickstarter/storyboarding/S3/selected.jpg` | Storyboard frame — secondary style guide. |
| Any S4a generated frame from `input/kickstarter/storyboarding/S4a/` | Gym environment / lighting reference for visual continuity. |

### 1.4 Output target

- Kling output: 1080p MP4 (Pro mode) or 720p (Standard).
- Final destination: A/B candidate vs the Runway Aleph master. If selected, conforms into the same post pipeline (`docs/s3-runway-post-production-polish.md`).
- Master timeline runs at 24 fps. Kling 2.1 Pro outputs 30 fps natively — conform in post.

---

## 2. Step 1 — Extract Keyframes from the Reference

The cheapest and highest-fidelity way to get Kling to land near the Runway Aleph look is to bracket the generation with stills *from that same Aleph clip*. Kling then has the gym BG, the wardrobe, the bag color, and the lighting already locked at both endpoints — it only has to interpolate the middle.

### 2.1 Pick the keyframes

Open `Gen-4 Aleph - clean - 4K.mp4` in any frame-stepping player (Resolve, DaVinci, VLC with frame-step).

- **Start keyframe** — the latest frame **before** the hand grips the headband. Hand is in the bag, headband not yet visible above the rim. Typically frame 12–18 (~0.5–0.7 s in).
- **End keyframe** — the apex hold. Headband is fully out, side panel flat to camera, hand still in contact. Typically frame 78–86 (~3.2–3.5 s in).

The closer those two stills are in time, the more constrained Kling's interpolation; the further apart, the more invention. ~2.5–3 s of motion between keyframes is the sweet spot.

### 2.2 Export the stills

Export both frames as **PNG** (lossless — JPEG compression around the LED and the wordmark will fight the AI):

- Resolution: native 4096×2304 → downscale to **1920×1080** (Kling's max input is 1080p).
- Color space: BT.709, sRGB on disk.
- Save to: `input/kickstarter/storyboarding/S3/kling-input/S3_kling_start.png` and `S3_kling_end.png`.

Create the folder first: `mkdir -p input/kickstarter/storyboarding/S3/kling-input/`.

One-liner with ffmpeg if frame-stepping by hand is painful (timestamps below are starting points — adjust after eyeballing):

```bash
ffmpeg -y -ss 0.55 -i "input/kickstarter/storyboarding/S3/runway-output/Gen-4 Aleph - clean - 4K.mp4" \
  -vf "scale=1920:1080:flags=lanczos" -frames:v 1 \
  "input/kickstarter/storyboarding/S3/kling-input/S3_kling_start.png"

ffmpeg -y -ss 3.30 -i "input/kickstarter/storyboarding/S3/runway-output/Gen-4 Aleph - clean - 4K.mp4" \
  -vf "scale=1920:1080:flags=lanczos" -frames:v 1 \
  "input/kickstarter/storyboarding/S3/kling-input/S3_kling_end.png"
```

### 2.3 Acceptance checks before upload

Before sending to Kling, both stills must satisfy:

- [ ] Hand is anatomically clean — five visible fingers, natural wrist.
- [ ] Headband shape is recognizable (flat strip, not warped).
- [ ] No motion blur on either still — Kling treats blurry inputs as instructions to be blurry.
- [ ] Background gym BG is identical between the two stills (same racks, same towel, same lighting). Mismatch = Kling will invent a transition.

If any check fails, frame-step a few frames in either direction and re-export.

---

## 3. Step 2 — Sign In & Pick the Model

1. Sign in at [klingai.com](https://klingai.com/) (or via [fal.ai](https://fal.ai) for the API path — see §10).
2. Confirm credit balance. Pro mode burns ~10 credits per 5 s; budget for 5–6 iterations = ~60 credits.
3. From the dashboard: **AI Videos → Image to Video**.
4. Model selector: **Kling 2.1 (Pro)**. Reasons:
   - 2.1 Pro is the first version with reliable **start-frame + end-frame** keyframing and stable physical-plausibility constraints on hand-object scenes.
   - 1080p output is included in Pro (Standard caps at 720p).
   - 2.0 Master is higher quality on facial micro-expression but no advantage on hand-object scenes, at ~2× the cost.
   - 3.0 is newer; the Reference Video feature is interesting but unverified on this shot type — fold it in as a **§7 fallback**, not as the primary path.
5. Mode: **Image to Video — Start + End Frame**. (UI labels: "Start Frame" + "End Frame" or "First Frame" + "Last Frame" depending on locale.)

---

## 4. Step 3 — Settings

| Setting | Value | Reason |
|---|---|---|
| **Model** | Kling 2.1 Pro | See §3 — best fit for keyframed hand-object generation at 1080p. |
| **Mode** | Image to Video, Start + End | Anchors both ends of the motion. Single-frame I2V invents the end pose; that's the failure mode. |
| **Duration** | **5 s** | Kling's shortest Pro duration. The on-disk Aleph reference is ~4.0 s; trim Kling's extra 1 s in post. (10 s would multiply cost without improving the apex hold.) |
| **Aspect ratio** | **16:9** | Match the reference and the campaign master. |
| **Resolution** | **1080p** | Pro default. Upscale to 4K in Topaz in post if it's selected over the Runway output. |
| **Creativity / Adherence** | **Adherence-leaning** (~0.4 / "low creativity" if exposed) | Low adherence = Kling drifts from the keyframes mid-clip. The whole point of supplying both frames is to constrain the drift. |
| **Negative prompt** | See §5.2 | Kling supports negatives in Pro mode — use them. |
| **Camera control** | **Static / fixed** | The source is a locked-off shot. Any pan/zoom/dolly breaks continuity with the Aleph reference. |
| **Motion Brush** | **Off** for the primary keyframed run | Brushes fight the keyframes. Reserve Motion Brush for the §7.2 fallback. |
| **Seed** | Random for the first batch; **lock the best seed** before iterating on prompt wording | Same as Runway — iterating on prompt against a locked seed beats re-rolling. |

---

## 5. Step 4 — Prompt & Negative Prompt

### 5.1 Positive prompt (paste into Kling's prompt field)

```
A realistic athletic male hand smoothly lifts a sleek matte black IronPal fitness headband out of a black gym bag, following a continuous upward motion from the bag to chest height. The headband is a thin flat strip with a subtle electric teal accent stripe along its length and a small front-center camera lens module beside a soft glowing teal LED. The background is a premium modern gym with blurred barbell racks and folded gray towels in soft bokeh, warm golden-hour key light from camera-left at 45 degrees, natural deep shadows, no people in frame, no kitchen elements. The headband keeps its original shape and proportions throughout the lift, no warping. Photorealistic, stable shapes, premium athletic technology commercial style, Kodak Vision3 250D film stock feel, 24 fps cinematic motion cadence.
```

### 5.2 Negative prompt (paste into Kling's negative field — Pro mode)

```
distorted hands, extra fingers, missing fingers, deformed wrist, warped headband, morphing object, flickering, unstable shapes, plastic look, kitchen, cabinets, kitchen countertop, domestic clutter, fluorescent lighting, cool blue light, harsh shadows, branded sportswear logos other than IronPal, watermark, text overlays, cartoon, illustration, 3D render, slow-motion ramp, camera shake, dolly zoom, additional people in background
```

### 5.3 Why these prompts are shaped this way

| Prompt element | What it controls |
|---|---|
| "continuous upward motion from the bag to chest height" | Tells Kling the in-between trajectory between the two keyframes. Without this, it may bounce or stutter. |
| "keeps its original shape and proportions throughout" | Counters the documented Kling headband-warp failure mode on thin objects. |
| "24 fps cinematic motion cadence" | Kling otherwise outputs at 30 fps with smoother-than-cinematic motion; this nudges toward the film look that matches the campaign. (Doesn't change the actual output fps — conform in post.) |
| "no people in frame" | Kling occasionally hallucinates a second athlete in the deep background of gym scenes. |
| "no kitchen elements" | Belt-and-suspenders against the gym BG breaking down mid-clip. The keyframes already lock the BG at both ends; the negative reinforces it across the middle. |
| "no slow-motion ramp / camera shake / dolly zoom" | Kling adds these by default on premium-looking prompts; we want a locked-off, real-time clip. |
| "Kodak Vision3 250D film stock feel" | Same campaign-wide grade anchor as the Runway prompt. Keeps any selected Kling output color-compatible with S4a–S5. |

---

## 6. Step 5 — Iteration Logic

Plan for **4–5 generations** to find a usable variant. Cost per generation at Pro 1080p × 5 s is ~$0.50–$0.70, so the iteration budget is small compared to Runway — but Kling's per-generation latency is **higher** (3–8 minutes per job depending on queue). Don't fire off 10 in parallel; iterate one variable at a time.

| Symptom in the output | Adjustment |
|---|---|
| Headband warps / morphs between keyframes | Move the end keyframe earlier so the interpolation distance shrinks (§2.1). Re-export keyframes per §2.2. If still warps, drop to 1.6 Pro — 2.1's adherence to the keyframes is sometimes weaker on thin objects than 1.6's was. |
| Hand fingers fuse or wrist breaks | Add to prompt: *"anatomically correct hand, five fingers visible, natural wrist angle, continuous wrist tracking"*. If still broken, switch model to **2.0 Master** — slower and more expensive but stronger on anatomy. |
| Background flickers / racks change shape | Lower Creativity / raise Adherence. Confirm both keyframes have *identical* BG (§2.3 check). Re-export keyframes with tighter BG match if not. |
| Hand motion ramps / slow-mo creeps in | Add to prompt: *"real-time motion, no slow motion, no time ramp, constant velocity through the lift"*. Confirm negative prompt includes "slow-motion ramp". |
| Camera drifts / micro-pans | Confirm Camera Control is set to **Static**. If still drifts, add to prompt: *"locked-off camera, tripod-mounted, no camera movement"*. |
| Logo / wordmark on side panel is garbled | **Expected.** Don't fix in Kling. Composite the wordmark in post per `docs/s3-runway-post-production-polish.md` §6 (logo composite step). |
| LED isn't visible or wrong color | **Expected.** Don't fix in Kling. Composite the LED in post per `docs/s3-runway-post-production-polish.md` §7. |
| Result feels like a stop-motion two-frame interpolation, not continuous motion | Either Kling 2.1 isn't holding the in-between motion, or the keyframes are too far apart in time. Shift to §7 Multi-Elements path. |

### 6.1 Hard stop

Cap iteration at **8 generations** (~$5 in Pro credits — far cheaper than the Runway iteration budget). If nothing matches or beats the Runway Aleph reference after 8, the Runway clip ships per `docs/s3-runway-post-production-polish.md`. Do not keep rolling — the marginal probability of a 9th Kling roll succeeding when the first 8 didn't is low, and the time cost (each roll is multi-minute) is non-trivial.

---

## 7. Fallback Paths Within Kling

If the §5 + §6 Image-to-Video keyframed path doesn't land after 8 rolls, try one of the following before declaring Kling out:

### 7.1 Kling 2.1 Multi-Elements

Use Multi-Elements (in **Image to Video → Multi-Elements** mode, where supported on your tier) to specify the three load-bearing objects as separate references:

| Element | Reference image | Motion path |
|---|---|---|
| **Hand** | A clean frame of the actor's hand from `S3_runway_input_v01.mp4` | Bag → up to chest height |
| **Headband** | `input/images/product/headband/...headband-0_a2d0b26d-...jpg` (product hero) | Inside bag → emerging → fully out → apex hold |
| **Bag** | A frame of the bag from `S3_select_1_hero.mp4` (static) | None — anchored |

Why this can rescue the shot: when keyframes don't constrain the object identity strongly enough, naming each object with a reference image forces Kling to preserve their shapes individually. Especially effective on the headband warp failure mode.

Cost: roughly the same as the primary path — Multi-Elements is metered the same as Image to Video on Kling Pro.

### 7.2 Kling 1.6 Pro Motion Brush

Single-image generation from the **start keyframe only**, with Motion Brush strokes painting:

- An **upward arc** on the hand (curve from bag mouth to chest height).
- A **linear pull** on the headband (matching the hand arc but slightly delayed).
- **Static** brush on the bag.

Why this exists in the toolkit: when keyframe interpolation overspecifies and constrains too hard, Motion Brush lets Kling generate the motion natively while still respecting the painted vectors. Useful when 2.1 keyframes produce stop-motion-feeling results.

Cost: similar per-generation to the primary path. Quality typically lower than the keyframed path — use this only if §7.1 also fails.

### 7.3 Kling 3.0 Reference Video (if available on your tier)

If Kling 3.0 with the Reference Video feature is available, the closest-to-Aleph path is:

1. Upload `S3_runway_input_v01.mp4` as the reference video.
2. Use a 2-frame keyframe from the Aleph reference for visual style anchoring.
3. Prompt as in §5.1.

This is the most experimental option — there are no documented success rates on hand-object reveals yet. Allow 2 generations max here before abandoning; if it works, it could become the preferred path for future shots.

---

## 8. Acceptance Criteria

A Kling generation is "usable" against the Runway Aleph reference only if all of the following hold:

- [ ] Hand motion is continuous and matches the trajectory implied by the keyframes — no stop-motion feel, no slow-motion ramp.
- [ ] Headband shape stays a thin flat strip with the teal stripe visible throughout — no rope, no loop, no thickening.
- [ ] **No kitchen elements** visible anywhere in any frame.
- [ ] Background reads as the same modern gym as the Aleph reference — racks, towel, warm light. ΔE ≤ 5 against the reference mid-frame after Dehancer grade.
- [ ] **No camera motion** introduced — locked-off feel preserved.
- [ ] **Anatomy is correct** — five fingers, natural wrist, no extra digits, no flicker mid-clip.
- [ ] Bag stays anchored — no drift or warp at the bottom of frame.
- [ ] Wardrobe and skin tone are continuous between keyframes (Kling occasionally re-colors mid-interpolation).
- [ ] Headband design is plausibly IronPal — matte black, hints of teal. Wordmark and LED can be garbled or absent (post adds them, same as Runway).

Anything failing two or more = discard and either re-roll per §6 or jump to §7 fallback.

A Kling generation "wins over the Runway reference" only if all the above pass **and** at least one of:

- The interpolated motion reads as smoother / more natural than the Aleph version.
- The lighting integration on the headband is more believable than the Aleph version.
- A blind A/B in `post/proxies/` consistently favors the Kling cut over multiple viewings.

If only the §8 baseline passes (no clear win), Kling has **matched** Runway — not beaten it. The Runway Aleph clip already has the post pipeline built around it (`docs/s3-runway-post-production-polish.md`); a tie defaults to Runway to avoid redoing the post integration work.

---

## 9. Cost & Time Estimate

| Item | Cost |
|---|---|
| Keyframe extraction (§2) | $0 (ffmpeg, ~15 min) |
| Kling 2.1 Pro Image-to-Video, 5 generations × ~$0.60 | ~$3 |
| Multi-Elements / Motion Brush fallback iterations | up to ~$5 |
| Buffer | up to **~$15 hard cap** |
| Post integration (only if Kling wins §8) | reuses `docs/s3-runway-post-production-polish.md` workflow, +1–2 hr for Kling-specific conform (30 fps → 24 fps, 1080p → 4K upscale via Topaz) |
| **Time per attempt set** | ~3–4 hours (keyframe prep + Kling queue + review). Kling jobs run 3–8 min each — plan for a couple of hours of multi-minute waits. |
| **Hard cap** | $15 in credits, ~6 hours of operator time. After that, ship the Runway Aleph master. |

Kling pricing is per generation (not per-second within the generation), so a 5 s Pro clip and a 5 s Standard clip cost different fixed amounts. Confirm current pricing on Kling's billing page or the fal.ai model page before queuing — the $0.07–$0.14/s figure in `docs/ai-video-generation-options.md` §3 is the right ballpark but not authoritative for any given week.

---

## 10. Optional — API Path via fal.ai

If you want to script the iteration loop instead of clicking through the web UI (useful when iterating across 4–5 prompt variants), fal.ai exposes Kling 2.1 Pro Image-to-Video as a hosted endpoint:

- Endpoint: `fal-ai/kling-video/v2.1/pro/image-to-video` (verify slug on fal's model page — versioning shifts).
- Input: start frame URL, end frame URL, prompt, negative prompt, duration, aspect ratio, seed.
- Output: signed MP4 URL, polled via the standard fal async pattern.
- Pricing: fal passes through Kling's per-call cost plus a small surcharge; for our iteration budget it's not materially different from the web UI.

A minimal client lives at `scripts/video-gen/kling_client.py` per `docs/ai-video-generation-options.md` §6 — extend the existing Image-to-Video method to accept an end-frame parameter (2.1 Pro Start+End is a separate sub-endpoint at fal as of writing).

Environment: `KLING_API_KEY` (official) or `FAL_KEY` (recommended for this path). Both live in `.env` per `docs/ai-video-generation-execution-plan.md`.

This path is **optional**. The web UI is fine for an 8-roll iteration cap. Use the API only if Kling becomes a regular part of the workflow on later shots.

---

## 11. Why this works (the summary)

| What | Why |
|---|---|
| **Keyframes lifted from the Runway Aleph output** | Kling doesn't have to invent the gym look or the wardrobe — the endpoints already match the target. It only interpolates the middle. |
| **Image to Video Start + End (not single-frame)** | Two-frame anchoring is the difference between "interpolated" and "hallucinated". The Aleph reference gives us both anchors for free. |
| **Pro mode + 1080p + Static camera** | The minimum quality tier that supports negatives and stable physical plausibility on Kling. Standard mode is too creative for a deterministic-feeling cinematic shot. |
| **Adherence-leaning Creativity slider** | The whole point of supplying both frames is constraint. Crank Creativity and you waste the keyframes. |
| **Brand assets composited in post, same as Runway** | Kling can't render text reliably (no AI generator can). Run the same `docs/s3-runway-post-production-polish.md` logo + LED composite on the Kling cut if selected. |
| **Aleph reference as the quality target** | We're not asking Kling to invent S3 — we're asking it to match a known-good cut. That framing keeps the §8 acceptance criteria honest. |

---

## 12. Known Failure Modes (with recovery)

| Failure | Recovery |
|---|---|
| All 5 generations look like stop-motion two-frame morph | Keyframes are too far apart in time. Move the end keyframe ~0.5 s earlier and re-export per §2. If still bad, switch to §7.1 Multi-Elements. |
| Headband consistently warps between keyframes | Kling 2.1 has weaker thin-object preservation than 1.6 on some prompts. Drop to **1.6 Pro Image-to-Video** for the next batch — slower but tighter object identity. |
| Background flickers / racks change shape | Keyframes are not BG-identical (§2.3 check failed). Re-export from frames closer together in the source where the BG is visually stable. |
| Wardrobe / skin tone shifts mid-clip | Add to prompt: *"consistent wardrobe and skin tone throughout, no color flicker"*. If persists, the seed is bad — lock seed and re-prompt. |
| Kling adds a slow-motion ramp despite the negative | Known Kling 2.1 issue. Drop to 2.0 Master for one roll — slower but more obedient to motion-pacing instructions. |
| Queue times spike (>15 min/job) | Use the fal.ai API path (§10) — different queue, often shorter waits during Kling's peak hours. |
| Output costs are escalating past §9 cap | Stop. Ship the Runway Aleph master. This entire plan is exploratory — protecting the deliverable is more important than running the experiment to completion. |

---

## 13. References

- `input/kickstarter/storyboarding/S3/runway-output/Gen-4 Aleph - clean - 4K.mp4` — the visual quality target and keyframe source.
- `input/kickstarter/storyboarding/S3/runway-input/S3_runway_input_v01.mp4` — prepped kitchen motion plate (optional Kling input).
- `input/kickstarter/storyboarding/S3/selects/S3_select_1_hero.mp4` — original 4K take, backup keyframe source.
- `docs/s3-runway-plan.md` — sibling Runway plan; this Kling plan parallels its structure.
- `docs/s3-runway-post-production-polish.md` — the post pipeline that integrates whichever S3 master is selected (Runway or Kling).
- `docs/s3-runway-review-20260504-160259.md` — the review confirming the Runway Aleph clip passes acceptance (i.e. the baseline Kling must match).
- `docs/ai-video-generation-options.md` §3 — Kling capability matrix and pricing reference.
- `docs/ai-video-generation-execution-plan.md` — broader pipeline framework, including the existing `kling_client.py` location and `.env` key conventions.
- `docs/s3-clip-analysis.md` — prior failed AI attempts on S3 (avoids re-running them).
- `docs/founder-led-production-strategy.md` — campaign-wide AI scope (cutaways + polish).

---

**Prepared by:** Producer (solo founder)
**Date:** 2026-05-29
**Status:** Draft — ready to execute. Run §2 keyframe extraction first; if both stills pass §2.3, queue §5 prompt on Kling 2.1 Pro per §3–§4 and iterate per §6. Hard cap $15 / 8 rolls; default to the Runway Aleph master if Kling doesn't clearly win §8.
**Distribution:** CD, AVP, Producer
