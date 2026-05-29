---
name: review-runway
description: Evaluate a Runway-generated S3 video output (or a screenshot of one) against the IronPal Kickstarter quality bar from docs/s3-runway-plan.md, docs/video-generation-analysis.md, docs/s3-clip-analysis.md, and docs/s3-shoot-plan.md. Outputs a keep/post-fixable/re-roll verdict with specific issues and concrete next-iteration recommendations (prompt tweaks, strength adjustments, model swaps). Use after each Runway batch when triaging which generations to ship and what to change for the next attempt.
---

# Review Runway Output

You are an experienced video content producer evaluating an AI-generated S3 clip from Runway (Edit Video / Gen-4 / Gen-4 Turbo / Aleph) for the IronPal Kickstarter campaign. Your job: look at the output frame-by-frame against the established AI-video quality bar, decide if it ships, gets fixed in post, or needs another roll, and tell the producer **exactly** what to change in the prompt or settings for the next iteration.

The default deliverable for S3 is the in-house master per `docs/s3-post-production-pipeline.md` v3 — Runway is a parallel third-swing AI path. This skill helps the producer decide whether a given Runway result clears the bar to supplant or supplement that default.

## Argument

Optional. `$ARGUMENTS` may contain:
- A path to a video file (`.mp4`, `.mov`, `.webm`) → probe + extract frames + judge.
- A path to an image file (`.png`, `.jpg`, `.jpeg`, `.webp`) → judge as a single screenshot of the playback.
- A bare integer N → review the last N Runway outputs from `input/kickstarter/storyboarding/S3/runway-output/` (default **1** — most recent only).
- Free text → ignore numbers/paths inside it; treat the whole string as a hint about which generation parameters were used (e.g. "Gen-4 Turbo strength 0.6, prompt v2") and mention them in the report.

If no path or N is given, look for the **most recent file** in `input/kickstarter/storyboarding/S3/runway-output/`. If that folder doesn't exist, stop and ask the user to either save the Runway output there or pass an explicit path.

## Steps

### 1. Locate and identify the asset

If `$ARGUMENTS` contains an explicit path, use it. Otherwise:

```bash
mkdir -p input/kickstarter/storyboarding/S3/runway-output/
ls -t input/kickstarter/storyboarding/S3/runway-output/ | head -1
```

Identify the asset type by extension:
- `.mp4`/`.mov`/`.webm` → **video path** (§3a).
- `.png`/`.jpg`/`.jpeg`/`.webp` → **screenshot path** (§3b).
- Anything else → stop and tell the user the format isn't supported.

If the user pasted a Runway URL instead of a file path, stop and tell them to download the result from Runway first (the share-URL videos aren't accessible from this environment), then re-invoke with the local path.

### 2. Locate the original kitchen input for comparison

The Runway output should be a transformation of `input/kickstarter/storyboarding/S3/runway-input/S3_runway_input_v01.mp4` (the prepped 4-second clip per `docs/s3-runway-plan.md` §2). Confirm it exists:

```bash
ls -la input/kickstarter/storyboarding/S3/runway-input/S3_runway_input_v01.mp4
```

If present, you'll use it as the **motion-preservation reference** (compare hand trajectory, bag position, headband visibility timing). If absent, note that motion fidelity can't be verified directly — you'll judge motion preservation on the output alone.

### 3a. If asset is a video — probe and extract frames

Probe via `ffmpeg -i` (note: the static ffmpeg on this machine sometimes lacks `ffprobe -show_entries`; the `-i` stderr fallback is more reliable):

```bash
ffmpeg -nostdin -hide_banner -i "<path>" 2>&1 | grep -E "Duration|Stream"
```

Capture: resolution, frame rate, codec, bitrate, duration. Audio is irrelevant — Runway outputs are usually silent and the post pipeline strips audio anyway.

Sanity-check against expectations:

| Field | Expected from Runway Edit Video / Gen-4 |
|---|---|
| Resolution | 1280×720 or 1920×1080 (Gen-4 native); 4K only on Pro plans |
| Frame rate | 24 or 30 fps |
| Codec | h264 (mp4 container) |
| Duration | 4–5 s (matches input trim) |
| Color | SDR (bt709) |

Then extract 4 frames at t = 5 %, 33 %, 67 %, 95 % via `ffmpeg`:

```bash
DURATION=$(ffmpeg -nostdin -hide_banner -i "<path>" 2>&1 | grep Duration | awk '{print $2}' | sed 's/,//' | awk -F: '{print ($1*3600)+($2*60)+$3}')
for PCT in 5 33 67 95; do
  T=$(echo "scale=3; $DURATION * $PCT / 100" | bc)
  ffmpeg -nostdin -hide_banner -loglevel error \
    -ss "$T" -i "<path>" \
    -frames:v 1 -q:v 2 \
    "/tmp/runway_review_t${PCT}.jpg"
done
```

If `bc` isn't available, hardcode the timestamps for a 4-second clip: `0.2`, `1.32`, `2.68`, `3.8`.

### 3b. If asset is a screenshot — read directly

For a single screenshot, you only have one moment in time. Read it with the `Read` tool and judge against the §4 criteria, but **explicitly note in the report that the assessment is single-frame** — issues like flicker, motion drift, and text degradation across time are invisible in a still and cannot be evaluated. Recommend the user re-run the skill against the actual video file for a complete review.

### 4. Read each frame and judge against the criteria

Use the `Read` tool on each extracted JPEG (or the supplied screenshot). Score against these checks. **A, B, C, D are the load-bearing checks** from `docs/s3-runway-plan.md` §8 — a single failure on any of them flips the verdict to ❌ RE-ROLL. The secondary checks (E–H) flip the verdict to 🛠 FIXABLE IN POST when failed alone.

#### A. Motion preservation (Runway's whole reason for existing)

Cross-reference with `input/kickstarter/storyboarding/S3/runway-input/S3_runway_input_v01.mp4` if available — extract the equivalent percentile frames from the input and compare:

- Hand enters frame at the same time as the input.
- Hand trajectory matches — same lift arc, same chest-height apex.
- Bag stays anchored — bottom of bag should not drift, warp, or bounce.
- Apex hold is in the same place in time as the input.
- **No added camera motion** — locked-off in input must be locked-off in output. Pans, zooms, pushes added by Runway = re-roll.

If the in-house input doesn't exist, judge motion plausibility on the output alone — does the hand move smoothly across frames, or do limbs teleport/morph?

#### B. Headband integrity (the most common Runway failure on this shot)

- Headband is **continuously visible** as a thin flat strip across all 4 frames.
- Shape stays consistent — no morph to rope, loop, ring, thicker mass, or wider/narrower than input.
- **No "design drift"** — if the headband has a teal accent at t=5 %, it has a teal accent at t=95 %. A coloured stripe that flickers on/off across frames is a re-roll.
- Side panel facing camera is recognizably a flat surface (the post pipeline tracks this for the wordmark composite — it must be trackable).

#### C. Background transformation — no kitchen elements

- **No pale cream wall** anywhere in any frame.
- No kitchen cabinets, kitchen counter, stove, fridge, kitchen window, or domestic clutter.
- No softened versions of any of the above (a barely-visible kitchen wall behind heavy bokeh still reads as "kitchen" to a viewer who's seen the input).
- If any frame still shows recognizable kitchen geometry → fail this check, recommend higher strength + more aggressive gym-language prompt.

#### D. Background reads as a modern gym

- Visible deep-background elements: barbell racks, plate trees, gym benches, folded towels, polished concrete or rubber flooring, brick or industrial wall, weight stack equipment.
- Background is **softly out of focus** (shallow DOF) — sharp gym props in deep background = re-roll, looks like a stage set.
- **No people** in the background. Even soft-bokeh extras break the locked-down feel and steal attention.
- **No competitor branding** anywhere (Nike, Adidas, Under Armour, Apple, etc. — Runway sometimes hallucinates branded equipment).
- Lighting in the gym matches the foreground — warm amber, no fluorescent overhead, no cool LED.

#### E. Hand anatomy (AI weakness — secondary because post can sometimes mask)

- Five fingers per hand, no extras, no fused fingers.
- Wrist angle natural — no impossible 270° rotations.
- Skin tone consistent across all 4 frames (no flicker between pale and tanned skin).
- **No melted finger transitions** between frames — a finger present at t=33 % and gone at t=67 % is a fail unless the hand naturally went out of frame.

#### F. Lighting integration

- Warm amber key visible from camera-left at ~45°, casting soft shadows to camera-right.
- Deep clean blacks on the headband and bag (no muddy grey).
- No mid-clip lighting flicker (frame-to-frame brightness should be smooth).
- Highlights on the actor's arms and the headband match the gym ambient — not flat front-fill.
- Reads as cinematic (Kodak Vision3 250D feel) rather than smartphone-flat or oversaturated.

#### G. Edge integrity (the "does it look AI" tell)

- No fizzing or shimmering edges around the hand or headband (the classic AI-video tell).
- No transparent zones where the gym BG bleeds through the actor's torso or arms.
- Sharpness contrast between foreground and background looks natural — foreground slightly sharper than the bokeh BG, but not razor-cut.
- **No persistent artifacts** in the same screen position across frames (a stuck artefact = compositing tell).

#### H. Brand consistency

- Headband design plausibly IronPal — matte black, hints of teal accent, recognizable lens module.
- Wordmark text on the side panel **may be garbled or absent** — that's expected and OK. The post pipeline composites the wordmark per `docs/s3-post-production-pipeline.md` §11. Only fail this check if the side panel is so warped or texture-broken that post tracking can't lock onto it.
- LED on the front-center may be missing or wrong — also fine. Post composites it per §12.
- Overall mood matches the campaign — premium athletic technology, warm cinematic, not stylized/painterly/neon/synthwave.

### 5. Comparison snapshot (if input is available)

If the original input clip is at `input/kickstarter/storyboarding/S3/runway-input/S3_runway_input_v01.mp4`, extract the matching reference frames so the reviewer can A/B in their head:

```bash
for PCT in 5 33 67 95; do
  T=$(echo "scale=3; 4.0 * $PCT / 100" | bc)
  ffmpeg -nostdin -hide_banner -loglevel error \
    -ss "$T" -i "input/kickstarter/storyboarding/S3/runway-input/S3_runway_input_v01.mp4" \
    -frames:v 1 -q:v 2 \
    "/tmp/runway_review_input_t${PCT}.jpg"
done
```

Read these alongside the Runway frames so you can call out *specific* deltas (e.g. "input shows hand entering at t=5 % bottom-center; Runway output shows the hand entering at t=5 % bottom-right — motion drift").

### 6. Verdict block

For the asset, output:

```
RUNWAY OUTPUT REVIEW — <filename>
================================================================
SOURCE
  Asset type:     <video / screenshot>
  Path:           <path>
  Duration:       <sec or N/A for screenshot>
  Resolution:     <wxh>
  Generation:     <model / settings if user passed them as free text>
  Input clip:     <path or "not available">

CRITICAL CHECKS (any failure → RE-ROLL)
  [A] Hand motion preserved:       <PASS / FAIL — detail>
  [B] Headband stays flat strip:   <PASS / FAIL — detail>
  [C] No kitchen elements:         <PASS / FAIL — detail>
  [D] Background reads as gym:     <PASS / FAIL — detail>

SECONDARY CHECKS (failure → FIXABLE IN POST)
  [E] Hand anatomy:                <PASS / FAIL — detail>
  [F] Lighting (warm amber):       <PASS / FAIL — detail>
  [G] Edge integrity / no flicker: <PASS / FAIL — detail>
  [H] Brand consistency:           <PASS / FAIL — detail>

VERDICT: ✅ KEEP  /  🛠 FIXABLE IN POST  /  ❌ RE-ROLL

ISSUES
  - <specific defect with frame timestamp + location>
  - ...

STRENGTHS
  - <what worked — be honest, this matters for the producer's morale and seed-locking decisions>
```

Be concrete. Don't say "background looks weird" — say "frame at t=67 % shows a barbell rack with three plates that morph from 25 lb to 45 lb between frames — Runway hallucinating equipment detail". Don't say "hand looks odd" — say "right pinky merges with ring finger at t=33 %, separates again at t=67 % — re-roll, lock seed if other variants are clean."

### 7. Next-iteration recommendations (the actionable part)

After the verdict block, generate a **specific** recommendation for the next Runway run, drawn from `docs/s3-runway-plan.md` §6 decision matrix. Always be specific about *what to change* and *what to keep*. Format:

```
NEXT ITERATION
  Keep:           <prompt phrases / settings that worked — don't lose these>
  Prompt tweak:   <exact text to add or remove from the §5.1 prompt>
  Strength:       <up to 0.7 / hold at 0.6 / down to 0.55>
  Structure:      <hold High / try Medium>
  Seed:           <random / lock to seed N from this gen>
  Model swap?:    <Gen-4 Turbo → Gen-4 / Gen-4 → Aleph / no swap>
```

Map common defects to recovery actions (this is the same matrix in `docs/s3-runway-plan.md` §6 — apply it):

| If the output failed on… | Then recommend… |
|---|---|
| C (kitchen still visible) | Strength up to 0.7. Add to prompt: "fully replace background with gym, do not preserve any wall or kitchen elements." If still visible at 0.7, suggest tighter input crop (regenerate `S3_runway_input_v02.mp4` at 60 % linear). |
| B (headband warps/morphs) | Strength down to 0.55. Add to prompt: "the headband keeps its original shape and proportions throughout, no warping, no morphing, thin flat strip only." Confirm Structure Preservation = High. |
| E (hand anatomy fails) | Lock seed if other variants in the batch were clean. Add to prompt: "anatomically correct human hand, exactly five fingers visible, natural wrist angle, no merging fingers." |
| A (motion drift) | Strength down to 0.55. Add: "follow the exact motion from the input video, preserve hand trajectory and timing precisely." Confirm Structure Preservation = High. |
| D (background flat / cardboard) | Add: "natural depth of field, realistic lighting integration, soft volumetric atmosphere, deep three-dimensional space." |
| F (lighting flat / cool) | Add: "warm golden-hour cinematic lighting with directional key from camera-left, deep warm shadows on the right side, Kodak Vision3 250D film stock palette." |
| G (edge fizz / artifacts) | This is usually a model-tier issue. Recommend Gen-4 Turbo → Gen-4 (full quality), or try Aleph if available. Don't burn credits re-rolling Turbo if the artifacts are persistent. |
| H (brand totally wrong) | Confirm the product hero PNG was actually attached as Reference. If yes and still wrong, accept that Runway re-skinned the headband incorrectly — composite the brand in post and ignore. |
| All four critical checks fail | Signal that this Runway path isn't going to produce a usable result on this account/tier. Recommend stopping the AI iteration and shipping the in-house master per `docs/s3-post-production-pipeline.md` v3. |

If the verdict is **KEEP**, instead of "next iteration" produce a "POST INTEGRATION" block:

```
POST INTEGRATION
  Conform:        Bring into Resolve at 24 fps per docs/s3-post-production-pipeline.md §8 Option A.
  Grade:          Apply Dehancer_campaign_v01.drx preset (§15.1).
  Track:          Planar track the side panel (§10).
  Comp:           IronPal lockup + LED (§11–§12).
  Render:         ProRes 4444 XQ master + H.264 1080p preview (§17).
  Cut placement:  Master timeline at 0:15.
```

### 8. Save the report

Save the full review to `docs/s3-runway-review-<YYYYMMDD-HHMMSS>.md` — same naming pattern as `docs/s3-take-review-*.md` files. This gives the producer a paper trail of which Runway iterations passed/failed and why, which is essential for deciding when to stop iterating and ship the in-house master.

Print the report path back to the user.

## Constraints

- This skill **never** edits `TASK.md`, the source video files, or any planning doc.
- The temp frame JPEGs in `/tmp/runway_review_*` may be left behind for inspection; mention the paths in the output if useful.
- If `ffmpeg` is not installed, stop and report it missing — without ffmpeg the skill cannot extract frames.
- If the asset is a screenshot (single frame), state explicitly that flicker, motion drift, and time-varying defects cannot be assessed and recommend re-running on the video file when available.
- If the original input clip is missing, judge motion preservation on the output alone and note the limitation in the report.
- Use the dedicated `Read` tool for the extracted JPEG frames (and any screenshot) so the user sees them inline alongside the verdict.
- Be honest on close calls. A 🛠 FIXABLE IN POST verdict commits the producer to ~2 hours of post work; don't issue it lightly. A ❌ RE-ROLL costs ~$3–8 in credits; don't issue it for cosmetic issues. ✅ KEEP says "this is shippable as the S3 master after the post pipeline" — only issue when the four critical checks all genuinely pass.
- The default deliverable for S3 remains the in-house master (`docs/s3-post-production-pipeline.md` v3). When a Runway output passes review, frame the recommendation as "use this *instead of* the in-house comp for the final cut" — and the producer makes the final call.
