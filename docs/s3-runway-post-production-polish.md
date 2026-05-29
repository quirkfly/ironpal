# S3 — Runway Post-Production Polish (Aleph Output → Master Cut)

**Source:** `post/proxies/S3_aleph_4k_v01.mov` — clean 4K Runway export (paid-tier, no watermark), transcoded to ProRes 422 LT for editing
**Reviewed:** PASS, all 4 critical + 4 secondary checks on the original Aleph generation (`docs/s3-runway-review-20260504-160259.md`)
**Target:** `delivery/S3_master_v01.mov` — graded, brand composited, ready for the master timeline at 0:15
**Tool stack:** DaVinci Resolve (Color page + Fusion) — no other tools required since Runway delivered 4K natively
**Estimated time:** ~2.5–3 hours
**Date:** 2026-05-05
**Owner:** Producer (solo founder)
**Status:** v2 — watermark removal step retired (Runway upgraded to paid tier, exports are now clean 4K natively)

---

## 0. Read this first

This document expands `docs/s3-runway-plan.md` §7 ("Step 6 — Post-Production Polish") into a step-by-step runbook for the specific Aleph output already on disk. It supersedes the high-level §7 of the runway plan and supersedes `docs/s3-post-production-pipeline.md` v3 §13 (background replacement) — both of those are no-ops now that Aleph delivered the gym BG natively.

The other steps in `docs/s3-post-production-pipeline.md` v3 still apply and are referenced inline:
- §9 color grade structure (the node tree)
- §10 planar tracker workflow
- §11 logo asset prep + composite
- §12 LED composite + audio sync
- §15 Dehancer film-emulation polish
- §17.1 render specs
- §18 QA pass
- §18.3 handoff note

This doc is the **Runway-specific runbook**. It tells you which steps in the pipeline still apply, which collapse to no-ops, and what's specific to the Aleph source (e.g. Aleph's un-prompted wardrobe and bag color shifts, which are on-brand and preserved).

> **What v2 dropped from v1:**
> - Step "Crop the Runway watermark" — retired. Runway was upgraded to a paid plan; new exports are clean (no watermark). The cropped/zoomed workaround is no longer needed.
> - Step "Topaz upscale 720p → 1080p" — retired. The upgraded Runway plan delivers native 4K (4096×2304); Topaz is not needed in the pipeline. The step survives below as a *fallback* in case a future shot is captured on free tier and needs upscaling.

---

## 1. Inputs Confirmed Ready

Verify before starting:

```
Source file (clean 4K, paid-tier Runway export, transcoded to edit-friendly ProRes):
  post/proxies/S3_aleph_4k_v01.mov

Specs (verified):
  Resolution:     4096×2304 (DCI 4K, native from upgraded Runway plan)
  Frame rate:     24 fps (already conformed to master timeline target)
  Codec:          ProRes 422 LT (apcs), yuv422p10le (10-bit)
  Duration:       4.00 s
  Bitrate:        ~280 Mbps (intraframe — fast scrubbing, no GOP overhead)
  Audio:          none
  Watermark:      none (paid Runway plan removes it from output and re-export)

Original Runway export (kept for reference):
  input/kickstarter/storyboarding/S3/runway-output/Gen-4 Aleph - clean - 4K.mp4
```

Brand assets needed (from `docs/s3-post-production-pipeline.md` §11.1):
- `post/assets/IronPal_logo_circle_v01.png` — circle icon, transparent BG, 2048×2048
- `post/assets/IronPal_wordmark_v01.png` — wordmark, transparent BG, 2048×512
- `post/assets/IronPal_lockup_v01.png` — combined logo+wordmark layout

If these PNGs don't exist yet, prepare them now per `docs/s3-post-production-pipeline.md` §11.1 — that's a one-time prep that gets re-used across the campaign, not just for S3.

Reference frames for grade matching:
- Pull a 16-bit TIFF of one S4a frame (warm-amber gym, athlete with headband) once it's generated. If S4a isn't filmed yet, use any S4-series storyboard frame from `input/kickstarter/storyboarding/S4*/` as a temporary anchor.

---

## 2. Step 1 — Topaz Upscale *(SKIPPED — fallback only)*

> **Skipped under v2.** Runway paid-tier delivers native 4K (4096×2304); upscaling is unnecessary. Source already has more pixel headroom than the 3840×2160 timeline.
>
> **When this step *would* apply** (kept here as documentation for any future shot captured on free Runway tier):
>
> - Free-tier Runway exports are 1280×720 (24 fps). Anything you intend to put on a 4K timeline needs an upscale.
> - Use **Topaz Video AI**, model **Iris MQ** for hand/skin shots or **Proteus v4** for plate shots.
> - Target **1920×1080** from a 720p source (2× linear). Going straight to 4K from 720p is a 3× linear jump — produces plastic skin and ringing edges. Two-pass (720p → 1080p → 4K) is also viable if 4K is genuinely needed.
> - Output as **ProRes 422 HQ** (the Topaz default), then convert to ProRes 422 LT for editing.
> - Acceptance: at 100 % zoom, no plastic skin, no fizzing on the headband, soft gym bokeh preserved, no flicker.

For this S3 polish run with the 4K paid-tier source, **skip directly to §3**.

---

## 3. Step 2 — Resolve Project Setup

1. Open **DaVinci Resolve 19** (Studio tier, $295 perpetual — already required per `docs/founder-led-production-strategy.md`).
2. **New Project:** name `S3_post_v01`. Save to `post/project/`.
3. Project settings (File → Project Settings):

| Setting | Value | Reason |
|---|---|---|
| Timeline resolution | **3840×2160** | Project-wide 4K timeline. The 4096×2304 source is slightly wider than UHD; Resolve's timeline scaler scales it down to fit cleanly (no quality loss; the timeline scaler is high-quality). |
| Timeline frame rate | **24 fps** | Runway/Aleph delivered 24 fps natively — no conform needed. |
| Playback frame rate | 24 fps | Match. |
| Color science | **DaVinci YRGB Color Managed** | Tag source as Rec.709, timeline as Rec.709 Gamma 2.4. |
| Input color space | Rec.709 (Scene) | Aleph output is BT.709 SDR. |
| Timeline color space | Rec.709 Gamma 2.4 | Standard delivery for web video. |
| Output color space | Rec.709 Gamma 2.4 | Same. |

4. Import `post/proxies/S3_aleph_4k_v01.mov` (the ProRes 422 LT clean source) into a media bin called `S3_aleph_master`.
5. Right-click the imported clip → **Create New Timeline Using Selected Clips**. Name the timeline `S3_master_v01`.
6. **Verify the timeline is 3840×2160 / 24 fps** in the bin info. If it created at 1920×1080 (Resolve's default), right-click the timeline → **Timelines → Timeline Settings**, uncheck *Use project settings*, set Timeline resolution to **3840×2160 Ultra HD**, click OK.

---

## 4. Step 3 — Color Grade with Dehancer

Aleph already gave us a warm-amber base. The Dehancer pass refines it and locks it to the campaign-wide film stock so S3 cuts cleanly into S4a–S5.

### 5.1 Build the node tree (Color page)

Per `docs/s3-post-production-pipeline.md` §9.1, the node order is:

```
Source → N1: Exposure → N2: WB/Tint → N3: Contrast → N4: HSL Qualifiers → N5: Dehancer → N6: Vignette → Output
```

Aleph's output needs **less** correction than the in-house source would have. Start from these settings and tune to taste against an S4 reference:

| Node | Job | Aleph-specific settings |
|---|---|---|
| **N1 — Exposure** | Verify, don't push | Master Wheel Gain **0.00** (Aleph's exposure is already on-target). Only push +0.05 if the waveform shows shadows below 5 IRE in the gym BG. |
| **N2 — WB/Tint** | Slight warm refinement | Mids toward orange **+3** (subtle — Aleph already pushed warm). Tint **0** (no magenta needed). |
| **N3 — Contrast** | Refine, don't crush | Lift **0.00**, Gamma **−0.02**, Gain **+0.01**. The matte black headband and bag should sit at ~2–3 IRE on the waveform — verify. |
| **N4 — HSL Qualifiers** | Skin protect | Qualifier #1: skin-tone protect (sample the actor's hand, soften saturation by −5 only). Qualifier #2: teal-cuff isolate — hold the cuff's hue stable so Dehancer doesn't drift it toward green. |
| **N5 — Dehancer** | Film emulation lock | See §4.2 below. |
| **N6 — Vignette** | Focus pull | Subtle radial Power Window centered on the apex frame (sample at t=2.0 s). Outside −0.06, feather 0.6. Track the window with the §5 planar tracker output so it follows the headband. |

### 5.2 Dehancer settings (the load-bearing step)

This locks S3 to the campaign-wide film identity. Per `docs/s3-post-production-pipeline.md` §15.1:

1. Add a **Dehancer Pro** node after N4 (or import the `Dehancer_campaign_v01.drx` preset if it exists from prior work on S1/S2):
   - **Film stock:** Kodak Vision3 **250D**
   - **Print Film:** Kodak **2383**
   - **Halation:** **0.3**
   - **Bloom:** **0.2**
   - **Grain:** **0.4** (16 mm preset)
2. **Save the Dehancer settings as a project preset** (`Dehancer_campaign_v01.drx`) to `post/assets/`. Re-use across S1–S5. Do not tweak per-shot — campaign continuity depends on uniformity.
3. If the project preset already exists from earlier work, import it instead of building fresh.

### 5.3 Reference-driven validation

1. Load the chosen S4 reference TIFF in Resolve's **Gallery** as a still.
2. **Split-Screen → Stills** → A/B the S3 grade against the S4 reference.
3. Compare on the RGB Parade scope:
   - Skin tone highlight rolloff should sit identical
   - Gym BG midtones should sit within 5 IRE
   - S3 prop blacks should sit ~3 IRE *below* S4's deepest gym shadow (the prop is meant to be the darkest in frame)
4. Iterate until the cut between S3 and S4 is invisible to your eye.

### 5.4 Export the grade

- `post/assets/S3_grade_v01.drx` (Resolve project file — preserves nodes for future tweaks)
- `post/assets/S3_grade_v01.cube` (33×33×33 LUT — for editor reference)

---

## 5. Step 4 — Planar Track the Side Panel

This is the load-bearing technical step for the brand composite. If the track drifts, the IronPal lockup wobbles, and the shot reads as obviously composited. Spend the time.

### 6.1 Find the apex marker

Per the runway review (`docs/s3-runway-review-20260504-160259.md`), the apex hold runs from t≈2.5 s to t≈4.0 s in the Aleph output. Mark this range in Resolve with a green marker at t=2.5 s ("apex start") and a red marker at t=4.0 s ("hold end"). The planar tracker will lock onto the side panel during this window.

### 6.2 Set up the track in Fusion

1. Right-click the timeline clip → **Open in Fusion Page**.
2. Add a **Planar Tracker** node.
3. Scrub to the **apex frame at t=3.0 s** (mid-hold).
4. **Useful detail:** Aleph hallucinated a small rectangular module on the front-center of the headband at t=33–95 % (per the review, §B). That rectangular module is the **best feature reference** for the planar tracker — it's a high-contrast quadrilateral that sits flat on the side panel surface. Draw the tracking polygon to enclose this rectangle plus a ~10 px margin into the matte black surface around it.
5. Tracker mode: **Translation, Rotation, Scale, Perspective** (full 4-point planar).
6. Track **forward** to t=4.0 s (end of hold). Then track **backward** from t=3.0 s to the moment the side panel becomes visible above the bag rim (~t=1.5 s in the Aleph clip).
7. Frames before t=1.5 s won't have a trackable side panel — they get the lockup at zero opacity (faded in via the §6.3 opacity ramp).

### 6.3 Acceptance check

- [ ] Track quality bar **≥ 90 %** across the entire hold window.
- [ ] No frames auto-rejected by the tracker (auto-rejection means lock was lost).
- [ ] Visual sanity: enable corner-pin overlay, scrub the hold — the four corners hug the same panel features every frame.
- [ ] Tracker polygon doesn't drift onto the actor's hand or off the panel edges.

If the track fails (drift, lost lock at any point in the apex hold):
1. Re-track with a tighter polygon (just the rectangular module, no surrounding fabric).
2. Or fall back to **Mocha AE** per `docs/s3-post-production-pipeline.md` §10.3 (export to AE, track in Mocha, bring back the Corner Pin keyframes as a separate corner-pinned solid).

### 6.4 Save the track

- `post/tracks/S3_track_planar_v01.json` (Fusion node export)
- Backup as After Effects Corner Pin keyframes if Mocha was used.

---

## 6. Step 5 — Composite the IronPal Lockup

Per `docs/s3-post-production-pipeline.md` §11.

### 7.1 Drop the lockup in

1. In Fusion, add a **Loader** node for `post/assets/IronPal_lockup_v01.png`.
2. Connect Loader → Background input of the Planar Tracker (corner-pin output mode).
3. The lockup is now corner-pinned to the tracked rectangle for the full track range.

### 7.2 Scale and position

1. Scale: lockup width should occupy ~**40 %** of the visible side panel width. The Aleph rectangle is roughly 80 px tall on screen at 1080p — the lockup should sit at ~120 px wide, ~30 px tall.
2. Position: **upper-center** of the panel (the lower edge of any tracked plane tends to wobble slightly with the actor's grip).
3. Visual reference: `input/kickstarter/storyboarding/S3/selected.jpg` shows where on the headband the wordmark sits in the storyboard hero.

### 7.3 Lighting integration

The lockup must look **printed onto** the headband, not a sticker. Per `docs/s3-post-production-pipeline.md` §11.3:

| Layer | Settings |
|---|---|
| **Multiply node** with sampled key gradient | Gradient from warm white (camera-left) to deep amber (camera-right) at 30 % opacity over the lockup. Match Aleph's warm key direction. |
| **ColorCorrector** node | Lift +0.03 (so the lockup teal sits on the matte fabric, not pure void). Saturation +5 on lockup teal. |
| **Soft Glow** node | Glow size 2 px, threshold 0.85, intensity 0.15. Premium subtle halo. |
| **Motion Blur** node | Linked to planar tracker velocity output — auto-blurs during lift, sharpens on hold. |
| **Opacity ramp** | 0 % at clip start (t=0) → 0 % until panel emerges (t=1.5 s) → ramp to 100 % over 0.5 s → hold at 100 % through end of clip. |

### 7.4 Acceptance

- [ ] Lockup corners hug the panel through the full hold (no float, no swim).
- [ ] Lockup picks up the warm key wash on its left edge.
- [ ] At 100 % playback the lockup reads as printed, not stuck on top.
- [ ] At pause, zoom 200 % — no edge fringing, no halo, no obvious mask.

---

## 7. Step 6 — Composite the Teal LED

Per `docs/s3-post-production-pipeline.md` §12.

### 8.1 LED build

1. **Background** node — solid color, hex `#14B8A6` (campaign teal).
2. Mask with an **Ellipse** node — diameter ~**8 px** on screen at 1080p (matches an 8 mm flush-mounted LED at the working distance).
3. Track the ellipse to a fixed point on the front-center of the headband. Aleph's hallucinated lens module is right next to where the LED sits — sample that position at the apex frame and offset ~12 px to the right to match the §1 product reference layout.
4. **Soft Glow** node:
   - Inner glow: size 4 px, intensity 1.0
   - Outer halo: size 16 px, intensity 0.4 (the screen-bleed that sells the "real LED" look)

### 8.2 Activation timing — sync to VO-2

The LED must ignite on the audio peak of the word *"IronPal"* in VO-2.

1. From `docs/video-production-execution-plan.md` (§ VO blocks), VO-2 runs 0:15–0:22 of the master timeline. The line is *"What if you never had to log another workout? This is IronPal."* Approximate timing: "IronPal" lands at ~0:21.0 in the master.
2. S3 sits at master 0:15. So in the S3 clip's local timeline, "IronPal" lands at ~6.0 s into the cut — but S3 is only 4 s long. The LED ignites in the **last 0.4 s** of the S3 clip and continues into the early frames of S4a.
3. **Animate:**
   - 0 % opacity from clip start through t=3.4 s
   - Ramp to 100 % over **0.4 s** (t=3.4 → 3.8 s)
   - Hold 100 % to clip end
4. **Flicker:** subtle 2 Hz sine, ±10 % opacity, only during the held-on state. Sells "real LED".

### 8.3 Acceptance

- [ ] LED ignition timed to land on VO-2 audio peak (verify by importing the temp VO scratch into the S3 timeline).
- [ ] LED visible halo at 100 % playback, not a flat dot.
- [ ] LED flicker subtle — viewer doesn't see flicker, only "aliveness".

---

## 8. Step 7 — Background Polish (Depth + Vignette)

Aleph delivered a strong gym background. Two small refinements push it to "premium ad" feel:

### 9.1 Slight depth blur

Aleph's deep BG (the barbell rack and plate trees at camera-left) is already soft, but a touch more selective blur on the *upper third* makes the foreground product pop without changing the lower third (where the bag sits).

1. Add a **Lens Blur** effect in Resolve:
   - Mask: Linear Power Window, top-aligned, covering the upper 40 % of the frame.
   - Blur radius: **2 px** (very subtle).
   - Feather: 30 px (blends into the unblurred middle).
2. Verify the bag bottom and the workbench surface stay sharp — those are anchors.

### 9.2 Vignette refinement

The §4 grade already added a vignette (N6 in the node tree). If after the §6 lockup composite the vignette feels too heavy or too light, adjust:
- Outside −0.06 → tweak ±0.02 to taste
- Feather 0.6 → tweak ±0.1
- Track the vignette window with the §5 planar tracker output so it follows the headband through the lift

### 9.3 Optional: subtle warm rim

If Aleph's warm key wrap on the right side of the actor's arms looks too soft after the Dehancer grade, add a tiny warm rim:
1. Roto-mask the actor's right arm silhouette (Magic Mask works for this — strokes on the arm).
2. Add a Warm Wrap layer (warm orange `#E8B07C`, 15 % opacity, 3 px feathered edge).
3. Composite on the right edge of the matte only.

This step is **optional**. Skip it on the first pass; only add if the editor flags the rim as too subtle in the v01 review.

---

## 9. Step 8 — Render Master + Preview

Per `docs/s3-post-production-pipeline.md` §17.1, two deliverables:

### 10.1 Master (lossless)

| Field | Value |
|---|---|
| Codec | ProRes 4444 XQ |
| Resolution | **3840×2160** (timeline scaler upscales the 1080p source to 4K at render time — clean operation since Resolve's spatial scaler is high-quality) |
| Frame rate | 24 fps |
| Audio | None |
| Color | Rec.709 Gamma 2.4 |
| Output path | `post/delivery/S3_master_v01.mov` |

If a 1080p master is acceptable to the editor (saves ~4× file size), skip the 4K timeline scaler and render at 1920×1080. Confirm with editor before deciding.

### 10.2 Preview (light)

| Field | Value |
|---|---|
| Codec | H.264 |
| Resolution | 1920×1080 |
| Frame rate | 24 fps |
| Bitrate | 20 Mbps |
| Audio | None |
| Output path | `post/delivery/S3_preview_v01.mp4` |

For Slack / Drive review only. The editor cuts against the ProRes master; the preview is for CD sign-off.

### 10.3 Verify rendered output

```bash
ffprobe -v error -show_streams post/delivery/S3_master_v01.mov | grep -E "codec_name|width|height|r_frame_rate"
```

Expected: video stream only, h264 (preview) or prores (master), correct dimensions, 24/1 frame rate.

---

## 10. Step 9 — QA and Handoff

### 11.1 QA pass

Watch the master at 100 % on the largest available screen. Check:
- [ ] No frame drops at any point during 4-second playback.
- [ ] Lockup stays locked at full speed and at 4× slow scrub.
- [ ] LED ignition lands on the audio cue (apply VO-2 dialog as a temp track during QA only — strip before final handoff).
- [ ] Color grade matches an S4 reference still side-by-side.
- [ ] No alpha edge artifacts on the lockup.
- [ ] No banding in the warm-graded gym BG.
- [ ] No watermark visible at any frame edge (the upgraded Runway plan removes it natively — verify in case any old export was used by mistake).
- [ ] File plays in QuickTime, VLC, and the editor's NLE without re-encode warnings.

### 11.2 Handoff

Push to:
- `post/delivery/` (canonical location)
- Shared review folder (Drive / Frame.io per `docs/video-production-execution-plan.md` §6)

Include `S3_handoff_v01.md` with:

```
S3 Master — Handoff Note v01
============================
Source path: input/kickstarter/storyboarding/S3/runway-output/Gen-4 Aleph - ...mp4
Source model: Runway Gen-4 Aleph (Edit Video app), prompt v1
Source spec: 1280×720, 24 fps, h264, 4 s
Review verdict: PASS — docs/s3-runway-review-20260504-160259.md

Post pipeline applied (this doc — docs/s3-runway-post-production-polish.md):
  Topaz upscale:    SKIPPED (paid-tier Runway delivered native 4K)
  Watermark crop:   SKIPPED (paid-tier Runway export has no watermark)
  Resolve grade:    docs/s3-runway-post-production-polish.md §4
  Dehancer:         Dehancer_campaign_v01.drx preset
  Planar track:     post/tracks/S3_track_planar_v01.json
  Lockup composite: post/assets/IronPal_lockup_v01.png on tracked side panel
  LED composite:    teal pinhole, ignition synced to VO-2 "IronPal" peak
  BG polish:        upper-third Lens Blur 2 px, radial vignette
  Render:           ProRes 4444 XQ master + H.264 1080p preview

Known notes for editor:
  - Aleph shifted wardrobe (input teal → output black with teal cuffs) and bag
    (input gray → output matte black) un-prompted. These shifts are on-brand
    (campaign palette per docs/color-schemes.md) but differ from the in-house
    source. Cross-check S2c outgoing wardrobe and S4a incoming wardrobe for cut
    continuity — may need brief Dehancer tweak on neighboring shots.
  - In-house master fallback at delivery/S3_master_in-house_v01.mov is also
    rendered through the same pipeline, available for A/B if the editor or CD
    rejects Aleph's wardrobe shift during cut review.
  - LED ignition timing assumes VO-2 lands "IronPal" at master 0:21.0. If the
    final VO timing shifts, the LED node in the Fusion comp can be re-keyed
    in ~5 minutes.
```

### 11.3 Cut placement

Editor drops the master at master timeline **0:15** and trims handles per `docs/video-production-execution-plan.md` §7.

---

## 11. Total Time Estimate

| Block | Duration |
|---|---|
| Resolve project setup + import | 10 min |
| Color grade build + Dehancer + reference A/B | 60 min |
| Planar track + acceptance check | 45 min |
| Lockup composite + lighting integration | 60 min |
| LED composite + flicker + audio sync | 30 min |
| BG polish (depth blur, vignette) | 20 min |
| Render master + preview | 15 min |
| QA pass + handoff note | 30 min |
| Buffer | 30 min |
| **Total** | **~3.5 hours** |

This is a single-session post day. If the planar track requires the Mocha fallback, add ~90 min. If the editor requests a v02 with rev notes after first review, add another ~2 hours. The v1 schedule was ~5 hours; v2 dropped Topaz upscale (~15 min) and watermark crop (~10 min) plus eliminated the iteration risk those steps carried.

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Planar tracker drifts on the side panel | Medium | High | Re-track with tighter polygon focused on Aleph's hallucinated module rectangle (best feature anchor). Mocha AE fallback per `docs/s3-post-production-pipeline.md` §10.3 if Fusion can't lock. |
| Lockup reads as a sticker | Medium | High | Verify §6.3 lighting integration nodes are applied — multiply gradient + motion blur + soft glow. |
| LED ignition drifts when editor changes VO-2 placement | Medium | Low | Deliver LED as a separable Fusion node; editor can re-key in 5 min. |
| Dehancer grade shifts S3 too far from S4a | Low | Medium | A/B against S4 reference at every node. Lock the campaign-wide DRX preset and don't tweak per-shot. |
| Editor / CD rejects Aleph wardrobe shift | Low | High | In-house master fallback (rendered through the same post pipeline) sits at `delivery/S3_master_in-house_v01.mov`. A/B in cut review and let CD pick. |

---

## 13. References

- `docs/s3-runway-plan.md` — original Runway plan (this doc supersedes §7)
- `docs/s3-runway-review-20260504-160259.md` — review of the Aleph output (PASS verdict)
- `docs/s3-post-production-pipeline.md` v3 — campaign-wide post pipeline; §9 grade structure, §10 planar tracker, §11 logo composite, §12 LED, §15 polish, §17 render, §18 QA all referenced inline
- `docs/founder-led-production-strategy.md` — campaign-wide production strategy that scopes AI to cutaways + polish; this S3 success is the validation that AI works for environment swaps when text rendering is left to post
- `docs/video-production-execution-plan.md` — master cut structure, VO timing, S3 timeline placement
- `docs/color-schemes.md` — campaign palette (validates Aleph's wardrobe + bag color shifts as on-brand)
- Source: `input/kickstarter/storyboarding/S3/runway-output/Gen-4 Aleph - Reshoot this scene in a premium modern gym instead of the existing background_ Replace.mp4`
- Brand assets: `input/images/logo/v4/Geometric teal circle on navy.png` (canonical logo)

---

**Prepared by:** Producer (solo founder)
**Date:** 2026-05-05
**Status:** Ready to execute. Single-session post day; ~3.5 hours from project setup to handoff (down from v1's ~5 hr by retiring Topaz upscale and watermark crop steps).
**Distribution:** CD, AVP, Editor, Producer
