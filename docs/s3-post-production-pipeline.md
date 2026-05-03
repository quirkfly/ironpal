# S3 Post-Production Pipeline — "Gym Bag Reveal"

**Shot:** S3 — Athlete's hand pulls IronPal headband from a gym bag
**Source plan:** `docs/s3-shoot-plan.md` (§9 expanded into this standalone document)
**Master cut placement:** 0:15–0:22 of the Kickstarter hero video (`docs/video-production-execution-plan.md`)
**Target runtime in master cut:** 3–5 s
**Inputs:** Saved selects in `input/kickstarter/storyboarding/S3/selects/`
**Output:** `S3_master_v<n>.mov` — graded, composited, conformed, ready for the master timeline
**Owner:** MGD / VFX (composite) → Editor (cut placement) → CD (final approval)
**Status:** Draft v3 — adopts the founder-led production pivot (`docs/founder-led-production-strategy.md`); the founder is the on-camera actor across the campaign, so the S3 in-house shoot ships with the founder visible. Subject anonymization / swap is retired. Background replacement (kitchen → gym) and AI-enhanced polish remain in scope.

---

## 1. Purpose & Success Criteria

S3 is the visual handshake between the cool, desaturated "old way" footage (S1–S2c) and the warm IronPal montage (S4a–S5). The cut lands precisely on the VO-2 line *"What if you never had to log another workout? This is IronPal."* — and the teal LED ignites on the word *"IronPal"*. Post must deliver:

- A **continuously visible headband** for the full clip (no morphing, no occlusion, no jump cuts mid-lift).
- A **clean, tracked composite** of the IronPal circle logo + wordmark on the headband side panel — locked, not floating.
- A **teal LED activation moment** synchronized to the audio cue.
- A **warm-amber, film-emulated color grade** that matches the rest of the campaign (S4a–S5) within ΔE ≈ 5 on a midtone reference (see §9 + §15 polish).
- A **gym-setting background** in the final delivered clip — the kitchen plate from the in-house shoot must be replaced (see §13).
- The **founder visible as the on-camera actor**, with wardrobe matching the rest of the gym shoot day (see §14 + `docs/founder-led-production-strategy.md`).
- A **24 fps deliverable** that conforms cleanly to the master timeline.
- **No captured audio** in the delivered clip — VO and score are mixed by the editor.

Acceptance is binary against the QA checklist in §18 (Render & Deliver).

> **Important context:** the in-house S3 shoot was conducted in the founder's kitchen with the founder as the campaign actor (see `docs/s3-shoot-plan.md` and `docs/s3-take-review-20260503-131227.md`). Per the founder-led production pivot (`docs/founder-led-production-strategy.md`), the founder is the on-camera campaign actor across S1–S7 — there is no synthetic athlete, no character swap, no anonymization. The kitchen *location* still needs to be replaced with a gym setting (§13), but the *person* on screen ships as-is. If a wardrobe / lighting decision changes the rest of the campaign, S3 may be re-shot at the gym day at zero post cost — see §14.

---

## 2. Inputs

The shoot delivered three selects from the 2026-05-03 13:12 session (`docs/s3-take-review-20260503-131227.md`):

| File | Role | Notes |
|---|---|---|
| `input/kickstarter/storyboarding/S3/selects/S3_select_1_hero.mp4` | **Hero** (Take 1) | Apex at t≈8.0 s; ~5 s sustained hold; flat exterior face square to camera; teal-shirt contrast at apex. **Use this for the master.** |
| `input/kickstarter/storyboarding/S3/selects/S3_select_2_backup.mp4` | Backup (Take 2) | Continuity-matched alternate. Use only if hero develops an unfixable defect (e.g. lint on prop visible at 100% zoom). |
| `input/kickstarter/storyboarding/S3/selects/S3_select_3_alt-angle.mp4` | Insert / B-track (Take 8) | Alternate angle / variation. Reserve for editor as optional flash insert if the locked-off cut reads as too static. |

**Source spec (verified):** 3840×2160, 30 fps, HEVC (H.265), ~17.7 Mbps, BT.709 SDR, audio present at ~256 kb/s.

**Source caveats — read before starting post:**
- **Location:** filmed in the founder's kitchen against a pale cream wall corner. The visible background is *not* the campaign setting and must be replaced (§13).
- **Subject:** the founder as on-camera campaign actor, wearing a heather teal Mizuno tee. Head is cropped (per the take review). The visible person is hand + forearm + torso/teal-shirt. **Per the founder-led pivot, the founder is the campaign actor** — the visible person ships as-is. The only continuity question is wardrobe/lighting consistency with the rest of the gym shoot day (see §14).
- **Lighting:** flat ambient daylight from a kitchen window — no warm key, no rim. The §9 grade lifts and warms it; the §15 film-emulation polish completes the cinematic look; gym-plate integration in §13 then anchors it in a believable gym light.

**Brand assets:**
- Logo icon: `input/images/logo/v4/Geometric teal circle on navy.png` (extract circle on transparent BG before compositing — see §11.1).
- Wordmark: "IronPal" in the campaign teal (`docs/color-schemes.md`), clean modern sans-serif.

**Reference frames for color matching and gym plate integration:**
- S2c — outgoing cool/desaturated frame (the cut *out of* into S3).
- S4a — incoming warm-amber frame (the cut *into* from S3). Pull a 16-bit TIFF of one mid-lift frame from each as the colorist's anchor.
- One **S4a wide gym frame** (or any S4* frame showing the actual gym environment) — used as the visual reference for the §13 gym-plate sourcing and as the integration anchor.

---

## 3. Software Stack

The pipeline is designed to run on **free / one-time-purchase** tools so the solo founder is not blocked by subscription cost.

### Recommended (free, primary)

| Tool | Role | Why |
|---|---|---|
| **DaVinci Resolve 19 (free tier)** | NLE + color + Fusion (compositing/tracking) | Single tool covers cut, grade, planar track, comp, and delivery. Handles HEVC 4K natively. The free tier exports up to UHD with no watermark. |
| **Fusion (inside Resolve)** | Planar tracking, logo composite, LED glow, BG keying/comp | The Planar Tracker, Delta Keyer, Edge-Detect/Erode-Dilate, Light Wrap and Glow nodes cover both the brand composite and the gym-plate integration. |
| **DaVinci Magic Mask (Color page, free tier)** | Subject roto/matte for §13 background swap | AI-driven matte for "person", "object" or hand-drawn strokes. Free tier of Resolve includes a usable version; the Studio tier ($295 one-off) is sharper at the edges and worth it once for any production with a swap shot. |
| **Dehancer Pro** (Resolve plugin) | Film emulation grade | $79 perpetual. The single biggest perceived-quality upgrade for phone-shot footage — picks a real film stock (Kodak Vision3, Fuji), applies grain/halation/curve. Used in §15 for the campaign-wide cinematic look. |
| **Runway Motion Brush** | Adds parallax / subtle camera motion to the locked-off plate | ~$0.50–$1 per clip. Eliminates the "static tripod" giveaway on a 5 s shot. Used in §15 if the editor wants S3 to feel less locked. Optional. |
| **Audacity** | Audio mute / verification | Only used to confirm the silent track delivery. Optional. |
| **HandBrake** | Optional re-encode for editor preview | Only if the final ProRes is too heavy to ship. |

### Acceptable (paid, alternate)

| Tool | Role | Notes |
|---|---|---|
| **Adobe Premiere Pro** | NLE | Use if the editor's master timeline is already in Premiere — avoids round-trip headaches. |
| **After Effects + Mocha Pro / Mocha AE** | Planar tracking + composite + roto | Mocha's planar tracker is the industry standard; Mocha's spline-based roto is the fallback for §13 if Magic Mask edges are too soft. **Mocha AE is bundled free with AE.** |
| **Adobe Photoshop / Affinity Photo** | Logo asset prep (extract circle, build clean wordmark layer) | One-shot prep step; could also be done in GIMP for free. |
| **Topaz Video AI / Resolve Super Scale** | Optional plate cleanup | If the gym plate sourced for §13 is 1080p stock, upscale to 4K before integration. Only if the editor objects to the visible BG softness. |

### Decision rule

Default to **Resolve + Fusion**. Switch to **AE + Mocha AE** only if the §10 planar track or the §13.4 matte fails its acceptance check. Do not introduce a third tool — every additional round-trip costs a half-day in render and color-pipeline reconciliation.

---

## 4. Project Setup

### 4.1 Folder structure

```
input/kickstarter/storyboarding/S3/
├── selects/                 # the three saved takes (frozen — do not edit in place)
├── frames/                  # extracted reference stills (existing)
└── post/                    # NEW — created in this step
    ├── project/             # Resolve project file(s)
    ├── proxies/             # 1080p ProRes Proxy (optional, for laptop edit)
    ├── tracks/              # exported Mocha / Fusion track data (.txt, .nk, .json)
    ├── assets/              # prepped logo/wordmark PNGs with alpha
    ├── reference/           # S2c and S4a reference frames + apex still
    ├── renders/             # all render outputs, versioned
    └── delivery/            # final master(s) handed to editor
```

**Rule:** never modify the contents of `selects/`. All edits happen on copies imported into the Resolve project. Source files stay pristine for re-conform.

### 4.2 Resolve project settings

| Setting | Value | Reason |
|---|---|---|
| Timeline resolution | **3840×2160** | Match source; downscale only at delivery if asked. |
| Timeline frame rate | **24 fps** | The master timeline runs at 24 (cinematic). Source is 30 — see §6 for the conform decision. |
| Playback frame rate | 24 fps | Same. |
| Color science | **DaVinci YRGB Color Managed** | Lets you tag the source as Rec.709 and the timeline as Rec.709 Gamma 2.4. Avoids gamma shifts when round-tripping through Fusion. |
| Input color space | Rec.709 (Scene) | A52 Pro Video records BT.709 SDR. |
| Timeline color space | Rec.709 Gamma 2.4 | Standard delivery for web video. |
| Output color space | Rec.709 Gamma 2.4 | Same. |
| Use mark-in/out for HDR mastering | OFF | SDR delivery. |

Save the project as `S3_post_v01.drp` in `post/project/`. Bump the version on every grade-affecting change (`v02`, `v03`, …).

### 4.3 Naming convention

`S3_<role>_<version>.<ext>` — e.g. `S3_master_v03.mov`, `S3_track_planar_v01.json`, `S3_grade_v02.drx`. Never overwrite a versioned render — the editor may need to A/B revisions during the cut.

---

## 5. Step 1 — Ingest & Organize

1. Copy the three selects into a Resolve **media bin** named `S3_selects`. Do not re-encode — Resolve handles HEVC natively; transcoding strips bit depth.
2. Generate **proxies** if editing on a laptop without a discrete GPU: Resolve → Master Settings → Optimized Media Format = **ProRes 422 Proxy at 1080p**. Toggle Optimized Media for the three clips.
3. Add metadata:
   - `Scene = S3`
   - `Take = 1 / 2 / 8`
   - `Role = hero / backup / insert`
   - `Apex frame = 08:00:00` (hero), `…` (backup, insert) — note the apex timecode for each.
4. Build a **reference still** bin and import:
   - The hero apex frame as a TIFF (use the Resolve "Grab Still" command, then export as TIFF).
   - One S2c outgoing frame and one S4a incoming frame from `input/kickstarter/storyboarding/`.
5. Verify integrity: each clip plays through end-to-end with no dropped frames at 100% scrub. If any clip stutters, re-copy from the source SD card / device.

---

## 6. Step 2 — Take Selection (already done — record the rationale)

Selection is already locked from `docs/s3-take-review-20260503-131227.md`:

- **Hero:** `S3_select_1_hero.mp4` — Take 1. Apex t≈8.0 s. Longest sustained flat-face hold; cleanest grip; best teal-shirt silhouette contrast. Cut window: ~6.5 s → ~10.5 s (4 s usable).
- **Backup:** `S3_select_2_backup.mp4` — Take 2. Continuity match.
- **Insert:** `S3_select_3_alt-angle.mp4` — Take 8. Optional flash cut.

Record the chosen apex timecode for each in the Resolve markers panel: green marker = apex, yellow marker = lift start, red marker = exit start. The colorist and the comp artist work from those markers, not from feel.

If, during compositing, the hero develops an unfixable defect, fall back to the backup take and re-do steps 7–9 from scratch. **Never composite onto two different takes and try to cut between them mid-shot** — the lighting and grip differ enough that the join will read as a continuity error.

---

## 7. Step 3 — Stabilize (only if needed)

The shoot was locked-off on a tripod, so stabilization should not be necessary. Verify:

1. Drop the hero clip on a Fusion timeline.
2. Pick a static feature in the background (corner of the bag, edge of the bench). Add a tracker. Track the full duration.
3. If the tracker delta exceeds **±2 px** over 5 seconds, apply Resolve **Stabilization → Mode: Translation, Smooth: 0.25, Strength: 50%**. Anything more aggressive crops into the framing reserved for the post-tracked logo and will cause the planar track in §8 to drift.
4. If the drift is under ±2 px, do nothing. Stabilization always softens the image slightly; skip it when you can.

---

## 8. Step 4 — Conform & Trim to 24p

The source is 30 fps; the master timeline is 24 fps. Two acceptable conform strategies — pick **one** per clip and document the choice.

### Option A — True slow-mo (recommended for hero)

Interpret the 30p clip as 24p in Resolve (Clip Attributes → Video Frame Rate = 24). The lift now plays at 80% of recorded speed (24/30 = 0.8). This adds a subtle ~1.25× cinematic feel to the lift, which works *with* the VO timing (the lift fills the full 7-second VO-2 window naturally). The motion stays believable because the slowdown is mild and uniform; no optical-flow interpolation artifacts.

### Option B — Optical-flow retime (use only for the slow-mo apex insert)

If the editor wants a beat where the apex *holds longer* than the natural take, apply Resolve **Retime → Optical Flow → Speed Warp** to the apex 1-second window only, slowing to 50%. Speed Warp interpolates clean intermediate frames at 4K. Test on a render — Speed Warp can fail on rapidly-moving fingers and produce melted frames.

### Trim window

For the hero on the master timeline at 0:15–0:22:

- **In point:** 0.5 s before the hand enters the frame (gives editor handles).
- **Out point:** 0.5 s after the apex hold ends.
- **Useful runtime after trim:** ~5 s (longer than the 3–5 s in-cut window; editor decides where to land cuts).

Mark in/out, but **do not delete trimmed media** — keep handles for editor flexibility.

---

## 9. Step 5 — Color Grading

The grade is the second-most-important post step (after the logo composite). It does three jobs:

1. **Match the warm-amber look** of S4a so the cut from S3 → S4a is invisible.
2. **Fix the known dim exposure** (the take review flagged EV ≈ −2; the prop currently reads as dark grey, not rich black).
3. **Bridge S2c → S3 → S4a** as a controlled warmth-and-saturation ramp — S3 is the *transition*, not a flat amber stamp.

### 9.1 Node tree (Resolve Color page)

Build the grade as a **node tree**, not a single LUT. Order matters:

```
Source → Node 1: Exposure  → Node 2: WB/Tint → Node 3: Contrast → Node 4: HSL Qualifiers → Node 5: Warm Look → Node 6: Vignette → Output
```

| Node | Job | Settings to start from |
|---|---|---|
| 1 — Exposure | Lift the underexposed source. | Master Wheel Gain +0.10 to +0.15. Watch the waveform — no clipping above 95 IRE. |
| 2 — WB / Tint | Neutralize the slightly cool wall. | Color Wheel: pull Mids ~5–8 toward orange (warm), Tint slight push to magenta (+2). Reference: S4a midtones sit around 3000–3200 K, +2 magenta. |
| 3 — Contrast | Restore depth lost by the dim source. | Lift -0.02, Gamma -0.05, Gain +0.03. Crush the prop blacks just enough that the post-comped LED will pop (Lift around 5 IRE on the headband). |
| 4 — HSL Qualifiers | Selective protection. | Qualifier #1: skin-tone protect (sample the actor's hand, soften saturation only). Qualifier #2: teal-shirt isolate — keep its hue stable so it doesn't read as cyan after the warmth pass. |
| 5 — Warm Look | The S4a match. | Use the Resolve Color Warper or a custom ColorWheel: shadows slightly cooler (cyan/teal), midtones warm orange, highlights warm cream. Saturation +5 globally, then -10 on cyan band. |
| 6 — Vignette | Focus attention on the lift. | Subtle radial Power Window centered on the apex frame. -0.08 outside, feather 0.5. Track the window with the planar data exported in §10 so it follows the headband. |

### 9.2 Reference-driven grading

1. Load the S4a reference TIFF in the **Gallery** as a still.
2. Use Resolve's **Split-Screen → Stills** to A/B the S3 grade against the S4a reference.
3. Compare in three places: skin tone (RGB Parade — should sit identical at the highlight rolloff), wall/background tone (should sit within 5 IRE), prop blacks (S3 prop blacks should sit ~3 IRE *below* the S4a deepest gym shadow — the prop is *meant* to be the darkest object in frame).
4. Iterate until the editor's eye can't catch the cut.

### 9.3 The S2c → S3 → S4a transition arc

S2c is graded cool/desaturated. S3 is the warmth re-entry. S4a is fully warm. The S3 grade itself is uniform — the *cut from S2c into S3* is what carries the temperature shift, and the *audio drop in/out* sells it. **Do not animate the grade inside S3** (no grade ramp from cool to warm within the clip) — it always reads as a fade-out-fade-in mistake. One uniform warm grade. Trust the cut.

### 9.4 Save

Export the grade as a **DRX still + LUT** to `post/assets/`:
- `S3_grade_v01.drx` (Resolve native — preserves nodes for further tweaks).
- `S3_grade_v01.cube` (33×33×33 LUT — for editor reference if they want to apply a flat-look version elsewhere).

---

## 10. Step 6 — Track the Side Panel (Planar Tracker)

This is the load-bearing technical step. If the track drifts, the logo wobbles, and the shot reads as obviously fake. Spend the time.

### 10.1 Set up the track in Fusion

1. In the Resolve **Color** page, right-click the hero clip → **Open in Fusion Page**.
2. Add a **Planar Tracker** node (`PlanarTracker`).
3. Scrub to the apex frame (use the green marker from §6).
4. Draw the tracking polygon **inside** the headband side panel — leave a 5–10 px margin from the panel edges. The panel must be:
   - At least ~30 × 50 px on screen (it is — the take review confirmed ~30 mm × 150 mm in real space).
   - Square to the lens within ±15° (verified at apex).
   - Not occluded by fingers (the hold position keeps the grip on one end).
5. Set tracker mode = **Translation, Rotation, Scale, Perspective** (full 4-point planar).
6. Track **forward** to the end of the hold, then **backward** from the apex to the moment the side panel becomes visible above the bag rim (≈ t=6.5 s in the hero).
7. Ignore frames before the panel is visible — those will get the logo at zero opacity.

### 10.2 Acceptance check for the track

- [ ] Track quality bar ≥ 90% across the entire hold window.
- [ ] No keyframes deleted by the tracker (auto-rejection means the tracker lost lock).
- [ ] Visual sanity check: enable the corner-pin overlay and scrub the hold — the four corners must hug the same panel features for every frame.
- [ ] If the track drifts, mask out the offending area (motion blur on the prop edges, hair, hand shadow) using the **Planar Tracker → Set Pattern** workflow, then re-track.

### 10.3 Fallback to Mocha AE

If the Fusion planar tracker fails its check after two passes:

1. Export a 16-bit ProRes 4444 of the hero clip (Color page → Quick Export).
2. Open in After Effects → Layer → Mocha AE.
3. Track the side panel as a planar surface in Mocha. Mocha's tracker is more robust to motion blur and partial occlusion.
4. Export the track data as **After Effects Corner Pin keyframes** and apply to a corner-pinned solid in AE — composite the logo there.
5. Render the comp as ProRes 4444 with alpha and bring it back into Resolve as a separate layer, conformed over the graded source.

The fallback adds one round-trip but produces a ship-quality track every time. Don't burn more than two hours fighting the Fusion tracker before switching.

### 10.4 Export

Save the planar data:
- `post/tracks/S3_track_planar_v01.json` (Fusion node export).
- `post/tracks/S3_track_planar_v01.txt` (After Effects Corner Pin format — for backup / editor reference).

---

## 11. Step 7 — Composite the IronPal Logo + Wordmark

### 11.1 Asset prep (one-time)

The source logo is `input/images/logo/v4/Geometric teal circle on navy.png` — a circle icon on a navy background. Strip the navy in Photoshop / Affinity / GIMP:

1. Open the PNG.
2. Color-range select the navy (tolerance ~30, anti-alias on).
3. Delete to alpha. Refine the edge if any blue halo remains.
4. Export as **`post/assets/IronPal_logo_circle_v01.png`** at 2048×2048 with transparent background.

Build the wordmark as a separate layer (the source PNG is the icon only; the "IronPal" text needs to be type-set fresh):

1. In a new 2048×512 doc with transparent background, set the type **"IronPal"** in the campaign sans-serif (per `docs/logo-design-prompts-updated.md` and `docs/color-schemes.md` — typically Inter, Geist, or the chosen brand sans).
2. Color: campaign teal (e.g. `#14B8A6` or whatever `docs/color-schemes.md` specifies as the primary teal — confirm with the CD before committing).
3. Letter-spacing: -10 to -20 (tight, premium feel).
4. Export as **`post/assets/IronPal_wordmark_v01.png`** with transparent background.

Combine into a **single composited layer** that mirrors the hero image layout — circle on the left, "IronPal" wordmark to its right, with ~20% wordmark-height of clear space between:

```
┌─────────────────────────────────────┐
│  ◯  IronPal                         │
└─────────────────────────────────────┘
```

Export the combined layer as `post/assets/IronPal_lockup_v01.png` (this is what gets corner-pinned onto the side panel).

### 11.2 Composite onto the tracked panel

1. In Fusion, add a **Loader** node for `IronPal_lockup_v01.png`.
2. Connect Loader → **Background** input of the Planar Tracker (corner-pin output mode).
3. The lockup is now corner-pinned to the side panel for the full track range.
4. Scale the lockup so the whole lockup occupies ~30 mm equivalent of the panel width — at apex, that's roughly **40% of the panel's screen width**. Sanity check: if the wordmark covers the full panel, scale down; if it's lost, scale up. Reference image: `input/kickstarter/storyboarding/S3/selected.jpg`.
5. Position the lockup on the **upper-center** of the panel (the take review noted the lower edge tends to wobble slightly with hand pressure — keep the logo in the stable zone).

### 11.3 Lighting integration

Without lighting integration the lockup looks like a sticker. Add:

| Layer | Purpose | Settings |
|---|---|---|
| **Multiply node** with a sampled key-light gradient | Match the warm key direction (camera-left, 45°). | Gradient from warm white (key side) to deep amber (shadow side) at 30% opacity over the lockup. |
| **ColorCorrector** node | Pull the lockup's blacks up slightly so the teal sits on the matte fabric, not on pure void. | Lift +0.03, Saturation +5 on the lockup teal. |
| **Soft Glow** node | Tiny halo around the lockup edges. | Glow size 2 px, threshold 0.85, intensity 0.15. Premium feel without "1990s lens flare". |
| **Motion Blur** node | Match the natural motion blur of the lift. | Linked to the planar tracker's velocity output — auto-blurs when the panel moves, sharpens when it holds. |
| **Opacity ramp** | Logo fades in as the panel emerges. | 0% at lift start (t=6.5 s) → 100% at apex (t=8.0 s) → 100% through hold → 0% at exit. |

### 11.4 Acceptance

- [ ] Lockup corners hug the panel through the full hold (no float, no swim).
- [ ] Lockup picks up the warm key wash on its left edge.
- [ ] Motion blur on the lockup matches the prop's motion blur exactly during the lift.
- [ ] At 100% playback speed the lockup reads as **printed onto the headband**, not stuck on top of it.
- [ ] At pause, zoom 200% — no edge fringing, no halo, no obvious mask.

If any of those fail, fix them before moving to the LED. The logo is the brand moment — it cannot wobble.

---

## 12. Step 8 — Composite the Teal LED + Accent Stripe

### 12.1 LED

The LED is a single soft teal point on the headband's front-center, igniting on the VO-2 word *"IronPal"*.

1. Add a **Background** node — solid color, hex matching the campaign teal (`#14B8A6` start point — colorist may push hue ±5 toward green for screen pop).
2. Mask with an **Ellipse** node — diameter ~6–10 px on screen (matches an 8 mm flush-mounted LED at the shot's working distance).
3. Track the ellipse to a fixed point on the front-center of the headband. Re-use the planar tracker's corner data, offset to a single point on the front face. The LED is on the *front* of the headband (not the side panel), so build a **second** planar track on the front face if §10's track was on the side panel only — or animate a manual position keyframe at apex if the front face is too small to track.
4. Add a **Soft Glow** node:
   - Inner glow: Glow size 4 px, intensity 1.0.
   - Outer halo: Glow size 16 px, intensity 0.4 — gives the screen-bleed that sells the "real LED" look.
5. **Animate the activation:**
   - 0% opacity from clip start through t = (master 0:18.0).
   - Ramp to 100% opacity over 0.4 s, peaking on the audio waveform peak of the word *"IronPal"*. Ask the editor for the precise frame — this is a sound-driven cue, not a feel cue.
   - Hold 100% through the rest of the clip.
6. Add a subtle **flicker animation** at 2 Hz, ±10% opacity, *only* during the held-on state. Real LEDs aren't perfectly stable; the flicker is what the eye reads as "real".

### 12.2 Teal accent stripe (optional, polish)

The product spec calls for a thin teal accent stripe along the band's length (`docs/body-mounted-product-prompts.md`). The prop has no stripe. Adding it is optional polish:

1. Build a thin (~3 px on screen) teal solid in Fusion.
2. Track to the band's length using a **Spline** node animated frame-by-frame, OR use the planar track's corner data extended along the band's vertical axis with an offset.
3. Match the LED's teal hue exactly.
4. Opacity 70% — should read as a fabric weave, not paint.

Skip the stripe in v01. Add it in v02 if the CD asks for it after the first review. The logo + LED carry the brand on their own.

### 12.3 Acceptance

- [ ] LED ignition lands on the audio peak of *"IronPal"* (within ±2 frames at 24 fps).
- [ ] LED has visible halo at 100% playback — not a flat dot.
- [ ] LED flicker is subtle — viewer doesn't notice the flicker, only the "aliveness".
- [ ] Stripe (if added) follows the band's curve through the hold, no popping at handoffs.

---

## 13. Step 9 — Background Replacement (Kitchen → Gym)

The shoot was filmed in the founder's kitchen against a pale cream wall corner — *not* the on-screen environment. The deliverable must place the action in a gym setting that reads as continuous with S4a–S6c. **This is feasible** because the source was filmed locked-off on a tripod (no camera motion to match) and the foreground action (hand + bag + headband) sits cleanly against a flat, bright background that keys easily.

This step replaces "Path A — keep the kitchen wall" that was tentatively chosen during the shoot. Path A is *retired*. The kitchen background never reaches the master cut.

### 13.1 Plate sourcing — three options

| Option | Cost | Quality ceiling | Recommended? |
|---|---|---|---|
| **A. Shoot a custom locked-off plate at the actual gym** | $0 (one trip, ~30 min on the same A52) | Highest — matches the campaign location, lighting, and lens character exactly. Full creative control. | **YES — default.** This is the same gym used for S4a–S6c, so continuity is built in. |
| **B. Free stock 4K gym plate** | $0 (Pexels, Pixabay, Coverr, Mixkit — verify CC0 / commercial license) | Medium — never quite matches; lighting, focal length, and color rarely line up; people-in-frame plates are unusable here. | Fallback if the gym is not accessible before the cut deadline. |
| **C. AI-generated still + image-to-video subtle motion** | ~$5 of Leonardo + Runway/Luma credits | Medium — risks AI weirdness at 4K; subtle ambient motion (extras walking far in the BG) is hard to get right. | Fallback if both A and B are blocked. Use as a *static* plate with no synthesized motion if possible — a high-quality still is more reliable than AI-driven motion. |

**Default: Option A.** The athlete will be filmed at the same gym for S4a–S6c — combine the trips, shoot the S3 plate during the same session.

### 13.2 Custom plate spec (Option A)

When shooting the plate at the gym:

- **Camera:** Same Samsung Galaxy A52, Pro Video mode, locked manual settings (per `docs/s3-shoot-plan.md` §5).
- **Resolution / fps:** **3840×2160 @ 30 fps**, HEVC, BT.709 SDR — match the foreground source exactly.
- **Lens:** Main wide 1×, manual focus, manual exposure, **WB 3000 K**.
- **Mount:** Locked-off tripod at bench height. **Do not pan, tilt, or push in.** A perfectly still plate.
- **Framing:** Fill the lower third with a gym bench surface (this is where the bag will sit in the comp). Mid-third is dead air at the bench's far edge. Upper third is gym equipment racks softly out of focus. Leave the right-third quieter to mirror the foreground composition.
- **Depth of field:** Shoot at the same working distance as the foreground (~40–60 cm for the bench surface to focus → racks defocused in the deep background). The A52's f/1.8 + 1/1.73" sensor delivers usable bokeh on the racks.
- **Lighting:** Warm gym practicals, golden-hour spill if available. Match the §9 grade target (warm amber). If the gym lighting is cool LED, the colorist will warm it in the grade — do not re-light.
- **Motion:** Plate must be *visually still* — no athletes in frame. If a person walks deep in the background, that's fine *only* if their motion is the same direction across the entire usable plate window (no entries/exits during the S3 cut window).
- **Duration:** Capture **30–60 seconds** of clean plate. The cut needs ~5 s — 30 s gives the editor freedom to time-shift. If a stray person enters the deep BG, keep rolling and use a different segment.

Save as `input/kickstarter/storyboarding/S3/plates/S3_gym_plate_v01.mov`.

### 13.3 Plate prep

1. Ingest into the Resolve project, separate bin: `S3_plates`.
2. Conform to **24 fps** the same way the hero is conformed (§8 Option A — interpret as 24p; the still plate is unaffected by the speed change because it has no motion).
3. **Pre-grade the plate** independently of the foreground:
   - Match warm amber temperature to the §9 hero grade.
   - Push exposure ~0.2 stops below the foreground subject — the BG should be subtly darker than the prop area so the eye stays on the headband.
   - Add a wide, soft radial **darken** vignette to the plate (Power Window, very soft feather, -0.15) to push focus to the center where the action lives.
4. Apply a controlled **defocus** to the plate to deepen the bokeh: Resolve **Effects → Blur → Lens Blur** at radius 6–12 px on the upper-third equipment, less or none on the lower-third bench surface. The bench *needs* a touch of focus so the bag has a believable resting plane; the racks get a stronger blur.
5. Save the prepped plate as `S3_gym_plate_prepped_v01.mov` in `post/proxies/`.

### 13.4 Build the matte (subject isolation)

Use **DaVinci Magic Mask** (Color page) for the bulk of the matte. Workflow:

1. On the graded hero clip, add a node and switch its mask to **Magic Mask → Object** mode.
2. Stroke across the visible subject elements that must stay in the foreground:
   - The bag (lower third).
   - The actor's hand and forearm.
   - The headband at every visible frame (be aggressive — strokes on the prop at apex *and* mid-lift).
   - The actor's torso/shirt (will be neutralized in §14, but the matte must include it for the BG swap regardless).
3. Track the matte forward and backward across the full clip. Resolve generates a per-frame alpha.
4. Acceptance:
   - Matte coverage ≥ 95 % across the action range.
   - No matte holes inside the bag, hand, or headband.
   - Edges may be slightly soft — the next step refines them.

If Magic Mask edges are too soft on the headband (the highest-fidelity element), supplement with a **manual rotoscope** in Fusion using a polygon mask — track only the headband shape across the lift + hold (~30 frames). Combine: `Magic Mask matte ⊕ headband poly matte` via a **Matte Control** node.

### 13.5 Edge refinement

The edges sell or break the comp. Apply this node chain inside Fusion to the matte:

```
MagicMaskMatte → ErodeDilate (-1 px) → SoftEdges (1 px feather)
                                    → EdgeDetect → spill cleanup
```

- **ErodeDilate -1 px:** pulls the matte inward by 1 pixel, killing the bright kitchen wall halo that always survives a chroma-style key.
- **SoftEdges 1 px:** restores natural anti-aliasing, prevents the foreground from looking razor-cut.
- **EdgeDetect:** isolates the matte border into a 2 px ring. Used as a mask for the §13.6 light wrap.

### 13.6 Light wrap

This is the single non-negotiable step that makes the comp believable. Without light wrap, the foreground floats on top of the BG like a sticker.

1. In Fusion, add a **Light Wrap** macro (built-in `Comp_LightWrap` node) or build manually:
   - Sample the gym plate's average highlight color (warm amber).
   - Use the EdgeDetect ring from §13.5 as the wrap mask.
   - Wrap width: 3–5 px.
   - Wrap intensity: 0.4 (subtle — overdone wrap reads as glow).
2. The result: warm amber gym light "spills" onto the foreground subject's edges. The teal shirt picks up a faint amber rim on the side facing the gym key direction (camera-left, matching the gym plate's key).
3. Verify by toggling the light wrap on/off — without it, the foreground reads as cut-out; with it, the foreground reads as *in* the gym.

### 13.7 Contact shadow

The bag must "sit on" the gym bench. The kitchen plate had its own shadow under the bag — that shadow is now gone with the BG swap. Add a synthetic contact shadow:

1. Build an ellipse, ~1.2× the bag's footprint, in a Fusion node.
2. Color: deep warm shadow (e.g. `#1A0F08`).
3. Position: directly under the bag's base on the gym bench in the BG plate.
4. Soft blur: 12 px feather.
5. Opacity: 60 %.
6. Composite *under* the foreground matte, *over* the BG plate.
7. The shadow is static (the bag doesn't move) — no animation needed.

### 13.8 Spill suppression

The kitchen had cool ambient daylight. The §9 grade warmed the foreground, but trace cool tints survive on the teal shirt's bright highlight side. Against a warm gym BG, those cool tints read as obvious comp giveaways.

1. In Fusion, add a **Color Suppress** or **Hue Curves** node before the Light Wrap.
2. Suppress the cyan/blue band on the matte's highlight edge by ~30 %.
3. Watch the teal shirt — the brand teal is close to cyan; do not over-suppress or the shirt loses its character.
4. Side-by-side check: foreground edge color samples should sit within 10 hue degrees of the BG plate's nearest highlight color.

### 13.9 Defocus matching

The foreground is sharp; the BG plate has its own focus characteristics. If they mismatch, the comp screams "fake".

1. Sample a high-contrast edge in the BG plate at a comparable depth (the bench's far edge).
2. Sample the foreground subject's edge sharpness.
3. If the BG is sharper than the foreground, blur the BG to match (rare).
4. If the foreground is sharper than the BG (typical because the kitchen had near-uniform focus distance), apply a **micro-blur** (0.5–1 px) to the foreground to close the gap.
5. Aim for the foreground subject to be subtly *sharper* than the BG by ~10 % — keeps focus on the product without screaming "I was shot separately."

### 13.10 Acceptance check (BG swap)

- [ ] No kitchen wall corner, kitchen floor, or kitchen lighting visible in any frame.
- [ ] The bag appears to rest on the gym bench (contact shadow lands the prop).
- [ ] Teal shirt picks up warm gym amber on the key-side edge — no cool-blue spill survives.
- [ ] Matte does not breath (i.e. expand/contract frame-to-frame) on the headband, hand, or bag.
- [ ] At pause, zoom 200 %, scrub one second of the lift — the matte edge tracks the subject without halo, fringe, or chunk-out.
- [ ] BG plate motion (if any — far-background extras) does not enter or exit during the S3 cut window.
- [ ] Foreground / BG color, contrast, and focus are unified — A/B against any S4a frame should make the cut feel like the same room.

If the BG swap fails on any of those, fix before §14. The BG swap is upstream of the subject-continuity decision — re-doing it later is expensive.

### 13.11 Save

- `post/renders/S3_with_gym_bg_v01.mov` — graded foreground composited over gym plate, ProRes 4444, full 4K, no audio.
- `post/tracks/S3_matte_v01.exr` (optional) — bake the matte for re-use if a v2v pass (§16) is later requested.

---

## 14. Step 10 — Subject Continuity (Founder On-Camera — No Swap)

Per `docs/founder-led-production-strategy.md`, the founder is the on-camera campaign actor across S1–S7. There is no synthetic athlete, no character replacement, and no anonymization. The visible person in the source footage (right hand + forearm + torso in heather teal Mizuno tee, head already cropped by the framing) ships as-is.

The job of this step is reduced to **wardrobe and lighting consistency** with the rest of the gym shoot day, plus an explicit **decision gate** on whether to keep the kitchen-shot S3 or re-shoot at the gym day.

### 14.1 Wardrobe + lighting check against the campaign

Compare the S3 source frame at apex against the planned wardrobe and lighting for the S4a–S5 gym shoot day:

- [ ] **Shirt:** the founder is wearing the same shirt (or same shirt color/style) that the campaign uses across S1–S5. If the campaign locks in matte black, swap the heather teal tee for a matte black tee and re-shoot S3. If the campaign locks in campaign teal, the heather teal tee is close enough to grade-match.
- [ ] **Skin tone:** the §9 grade brings the source warmth into the campaign target — verify the founder's hand/forearm tone in S3 matches the same forearm in any S4a frame after the same grade is applied.
- [ ] **Hair / jewelry / watch / tattoos visible at the source:** none in the S3 source per the take review — keep that discipline on the gym day so continuity holds across shots.

If any of those fail, the cleanest fix is a re-shoot at the gym day (§14.2), not a post fix.

### 14.2 Decision gate — keep the kitchen S3 or re-shoot at the gym day?

Two paths, decided once before post begins:

| Path | What it means | When to choose |
|---|---|---|
| **Path 1 — Keep the kitchen S3** | Run the full pipeline (§5 → §18) including the §13 kitchen → gym BG replacement and the §15 polish. Lower production cost, more post effort, slight risk on the BG comp. | Gym day is far off; you want a v01 cut to assemble the full video for review now. |
| **Path 2 — Re-shoot S3 at the gym day** | When you go to the gym for S4a–S5, re-do S3 using `docs/s3-shoot-plan.md` as-is — at the actual gym, in the same wardrobe, with the same lighting. §13 BG replacement collapses to a no-op (you're already at the gym). The §15 polish still applies. | Gym day is scheduled, and the marginal cost of capturing S3 at the gym (~30 min of bench time) is lower than the BG-comp post effort. **This is the lower-risk path** if the gym day is booked. |

Default: **Path 2 if the gym day is on the calendar; Path 1 otherwise.** Document the chosen path in the handoff note (§18.3).

### 14.3 Acceptance check (subject continuity)

- [ ] Founder is visible in the frame and wardrobe matches the rest of the campaign (or has been graded to read as continuous).
- [ ] Skin tone, hand size, build, and forearm appearance read as continuous with any other founder-on-camera shot (S1, S2, S4–S5).
- [ ] No accidental identifiers (jewelry, watch, distinctive markings, out-of-character clothing) appear in the frame.
- [ ] If Path 2 was chosen, the in-camera gym lighting and wardrobe match the rest of the gym day takes — verify with a side-by-side reference frame.

---

## 15. Step 11 — AI-Enhanced Polish (Color, Motion, Detail)

Once §13 (BG swap) and §14 (subject continuity) are settled, this step applies the campaign-wide polish stack to the S3 master. These are **the same polish steps** applied to every founder-led shot (S1–S5) so the cut feels uniform across the video. Doing them per shot is fine; doing them as a project-wide adjustment layer is better.

### 15.1 Film emulation grade (Dehancer Pro)

Apply on top of the §9 grade as the *final* color step before composites:

1. Add a **Dehancer Pro** node after the §9 node tree.
2. Pick a stock that matches the campaign mood — **Kodak Vision3 250D** is the safe default for warm-amber gym scenes; **Kodak Vision3 500T** if the shot is intentionally lower-light.
3. Settings: Print Film **Kodak 2383**, Halation **0.3**, Bloom **0.2**, Grain **0.4** (16 mm preset for a touch of organic texture without overdoing it).
4. Save the Dehancer settings as a **DRX preset** to `post/assets/Dehancer_campaign_v01.drx` and re-use across S1–S5.

This single step is the biggest perceived-quality lift for phone-shot footage. Doing it consistently across the campaign locks the visual identity.

### 15.2 Motion enhancement (Runway Motion Brush — optional)

The S3 source is locked-off on a tripod. The §13 BG plate is also locked-off. Together they read as *very* static — sometimes deliberately, sometimes too still. If the editor wants subtle "alive" motion (without the kitchen-handheld feel):

1. Export the post-§14 frame as a still (any clean frame from the apex hold).
2. In Runway Motion Brush, paint a soft mask on the headband + hand area; apply a slow upward motion (matching the lift) at very low strength.
3. Generate a 4–5 s clip; this becomes a *cinematic camera-style push* layered into the cut.
4. **Skip if the cut works at 100% locked-off** — Motion Brush is polish, not a fix. Try the cut without it first.

Cost: ~$0.50–$1 in Runway credits for one S3 clip.

### 15.3 Optional detail recovery (Topaz Video AI — only if needed)

If, after grade + Dehancer, the master looks soft (the in-house shoot had EV ≈ −2 in some takes), run a **Topaz Detail / Iris** model at low strength to recover micro-detail in the prop fabric and skin texture. **Use only if the editor flags softness** — Topaz can over-sharpen and create plastic skin if cranked.

### 15.4 Acceptance check (polish)

- [ ] Dehancer grade is applied; the same DRX preset is used across S1–S5.
- [ ] At 200 % zoom, fabric of the headband shows organic film grain, not digital noise.
- [ ] If Motion Brush was applied, the motion is below the threshold of conscious notice — viewer reads "cinematic", not "added in post".
- [ ] Master matches a graded S4a or S5 reference frame within ΔE ≈ 5 on midtone gray (the same campaign-wide target as §9.2).

---

## 16. Step 12 — Optional Video-to-Video AI Pass (Fallback)

This is **Option C from `docs/s3-clip-analysis.md`** — only triggered if, after §11 and §12, the prop still reads as amateur (visible household texture, lint, wrong proportions).

1. Render the composited shot as **`S3_for_v2v_v01.mov`** at 1080p ProRes 422 HQ (most v2v APIs cap at 1080p).
2. Send to **Kling Motion Control** or **Runway Gen-3 Video-to-Video** via the existing `scripts/video-gen/` pipeline.
3. Use the IronPal storyboard reference frame (`input/kickstarter/storyboarding/S3/selected.jpg`) as the visual reference image.
4. Set strength to **0.3–0.4** — low enough that the motion plate and composited logo survive, high enough that the texture/material gets the AI premium pass.
5. Bring the v2v output back into the Resolve project as a new clip. Re-grade if needed (the v2v pass usually shifts color slightly).

**Cost gate:** the v2v pass costs API credits. Do not run it unless the CD reviews the directly-composited version and explicitly requests it. The directly-composited version is the default deliverable — the v2v pass is insurance.

---

## 17. Step 13 — Audio

The shoot captured ambient audio (~256 kb/s) on every take because the A52 stock Camera cannot mute the mic. The deliverable is **silent**.

1. In Resolve, on the timeline, **disable** (not delete) the audio track on the master clip.
2. On render: Deliver page → Audio tab → **Audio: Off**, or set Codec to **None**. Confirm by inspecting the rendered file with `ffprobe`:
   ```
   ffprobe -v error -show_streams renders/S3_master_v01.mov | grep codec_type
   # should show only one stream: video
   ```
3. The editor mixes VO-2 + score + the SFX cue (the soft "activation chime" called out in `docs/video-production-execution-plan.md` §7.4) into the master timeline. Post does not deliver audio.

---

## 18. Step 14 — Render & Deliver

### 18.1 Render settings

Two deliverables — one master, one editor preview.

| Deliverable | File | Spec | Use |
|---|---|---|---|
| **Master (lossless)** | `delivery/S3_master_v<n>.mov` | ProRes 4444 XQ, 3840×2160, 24 fps, no audio, Rec.709 Gamma 2.4 | Editor's master timeline. Survives subsequent grading and re-export. |
| **Editor preview (light)** | `delivery/S3_preview_v<n>.mp4` | H.264, 1920×1080, 24 fps, 20 Mbps, no audio | For Slack / Drive review. Quick to ship, looks correct on a laptop. |

Render both. Use the Resolve Deliver page presets:
- ProRes 4444 XQ preset → adjust resolution to 3840×2160, audio off.
- H.264 Master preset → 1080p, 20 Mbps, audio off.

### 18.2 QA pass before handoff

Watch the master at 100% on the largest available screen. Check:

- [ ] No frame drops at any point.
- [ ] Logo lockup stays locked at full speed and at 4× slow scrub.
- [ ] LED ignition lands on the audio cue (apply VO-2 dialog as a temp track during QA only).
- [ ] Color grade matches the S4a reference still side-by-side.
- [ ] No alpha edge artifacts on the logo.
- [ ] No banding in the warm-graded sky/wall area (if banding appears, render at 10-bit minimum — ProRes 4444 XQ is 12-bit, so this should not happen, but verify).
- [ ] File plays in QuickTime, VLC, and the editor's NLE without re-encode warnings.

### 18.3 Handoff

Push to:
- `input/kickstarter/storyboarding/S3/post/delivery/` (canonical project location).
- The team's shared review folder (Drive / Frame.io / wherever `docs/video-production-execution-plan.md` §6 records the working folder).

Include a short **handoff note** (`S3_handoff_v<n>.md`) listing:
- Which take is the hero, with apex timecode.
- Which Resolve project file produced this version.
- Any known issues (e.g. "slight grain at apex, acceptable per CD review on 2026-MM-DD").
- The version of `IronPal_lockup_v<n>.png` used.
- Whether the v2v pass was applied.

---

## 19. Visual Style Consistency Checklist

These are the cross-shot anchors the cut depends on. Verify before signing off the master.

| Anchor | S3 must… | Reference |
|---|---|---|
| Color temperature | Warm amber, S4a-matched within ΔE ≈ 5 on midtone gray. | S4a reference TIFF. |
| Black levels | Prop reads as the deepest black in the frame (~3 IRE), not as dark grey. | Hero apex frame on the waveform. |
| Logo color | Exact campaign teal (per `docs/color-schemes.md`). | `IronPal_lockup_v<n>.png`. |
| Logo placement | Upper-center of the side panel, ~40% panel width. | `input/kickstarter/storyboarding/S3/selected.jpg`. |
| LED color | Same teal hue as the logo, ±5 hue degrees acceptable for screen pop. | LED design spec in `docs/body-mounted-product-prompts.md`. |
| LED ignition cue | Lands within ±2 frames of the audio peak of *"IronPal"*. | VO-2 audio file. |
| Motion | Single continuous lift, no cuts mid-lift, no camera motion. | Hero source. |
| Frame composition | Right third stays relatively empty (room for VO-2 caption if editor adds). | `docs/s3-shoot-plan.md` §8. |
| Sound | Delivered silent. | `ffprobe` check from §17. |
| **Background environment** | Reads as the campaign gym (matches S4a–S5 environment). No kitchen, no domestic clues. | `S3_gym_plate_prepped_v01.mov` (own shoot) or §13.1 fallback plate. (No-op if §14 Path 2 was chosen.) |
| **On-camera actor** | Founder visible per `docs/founder-led-production-strategy.md`; appearance and wardrobe match the rest of the campaign. | §14 — chosen path (1 / 2) recorded in handoff note (§18.3). |
| **Wardrobe** | Founder wears the same shirt color/style across S1–S5 (matte black or campaign teal — locked on the gym day). | S1, S2, S4a wardrobe reference frames; `docs/color-schemes.md` for brand teal hue. |
| **Film emulation** | Dehancer (or campaign-equivalent) grade applied with the project-wide DRX preset (§15.1). Same stock and grain across S1–S5. | `post/assets/Dehancer_campaign_v01.drx`. |
| **Edge integrity** | At 200 % zoom on the matte edge: no halo, no fringe, no breath, no chunk-out across any 1-second window. | Manual zoom inspection during §18.2 QA. |

---

## 20. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Planar tracker drifts on the side panel due to motion blur | Medium | High | Re-track with a tighter polygon, or fall back to Mocha AE per §10.3. |
| Logo lockup reads as a sticker | Medium | High | Verify §11.3 lighting integration nodes are applied — multiply gradient + motion blur + tiny soft glow. |
| Color grade looks correct on the operator's monitor but wrong on the editor's | Medium | Medium | Always grade on a calibrated display in a darkened room. Send a calibration test pattern (Resolve has built-in) to the editor; cross-check. |
| Prop's dim exposure can't be fully recovered without noise | Medium | Medium | Add a touch of **NeatVideo** or Resolve's built-in **Spatial NR (Temporal NR off)** at low strength after the grade lift. Don't overdo — over-NR creates plastic skin. |
| LED ignition timing drifts when editor changes VO-2 placement | Medium | Low | Deliver the LED as a separable Fusion node, not baked in. Or deliver two versions: v01-A with LED on, v01-B with LED off, and let the editor crossfade. |
| Render on the master ProRes file is too large to ship | Low | Low | Use HandBrake to make a watch-only H.264 (already in §18.1 as the editor preview). Master stays as ProRes for the timeline. |
| Backup take pulled into the cut by mistake (continuity break) | Low | Medium | Name files strictly per §4.3. Editor sees `S3_master_v<n>.mov` only — backup take never reaches the editor's bin. |
| **BG matte breathes** (expands/contracts frame-to-frame on the headband, hand, or bag) | Medium | High | Combine Magic Mask with a manual headband poly roto (§13.4). Track the poly with the same planar data used in §10. If still breathing, fall back to a Mocha spline roto on the headband only. |
| **Foreground / BG color or DOF mismatch** (kitchen-shot subject reads as cut-out on the gym plate) | Medium | High | Apply §13.6 light wrap and §13.8 spill suppression *before* QA. Verify with a 200 % zoom edge inspection on three sample frames (lift start, apex, exit). |
| **Gym plate has a stray person walk through during the S3 cut window** | Medium | Medium | Capture 30–60 s of plate (§13.2) — long enough to extract a clean 5 s segment. Time-shift the plate within the cut window if needed. |
| **Wardrobe in S3 source doesn't match the rest of the gym shoot day** (e.g. campaign settles on matte black, S3 was shot in heather teal) | Medium | High | Re-shoot S3 at the gym day (§14.2 Path 2) — ~30 min on the bench. Cheaper than trying to color-shift fabric in post. |
| **Founder's appearance reads inconsistent across S1–S5** (skin tone, hand size, watch on/off, etc.) | Low | Medium | Lock these on the gym day: same wardrobe, no jewelry, no watch, same shoes. The §9 + §15 grade chain handles tonal alignment as long as the source is consistent. |
| **Dehancer grade looks great on S3 but inconsistent across the campaign** | Medium | Medium | Save the Dehancer settings as a project-wide DRX preset (§15.1) and apply across S1–S5. Never tweak per-shot without copying back to the preset. |

---

## 21. Schedule

The schedule depends on the §14 path (keep the kitchen S3 with BG swap, or re-shoot at the gym day). Two scenarios:

### 21.1 Path 1 — Keep the kitchen S3, do the BG swap in post (~9–11 hours over 2 sessions)

| Session | Block | Duration | Activity |
|---|---|---|---|
| Plate trip | Gym plate shoot | 60 min | One-trip A52 plate capture at the campaign gym (§13.2). Combine with the gym shoot day if possible. |
| Post day | Setup | 30 min | Project setup, ingest, proxies, reference stills (incl. S4a wide), marker pass. |
| Post day | Stabilize check + conform | 30 min | §7 + §8. |
| Post day | Color grade | 90 min | Build node tree, A/B against S4a reference, polish, export DRX. |
| Post day | Logo asset prep | 30 min | Strip navy, build wordmark, build lockup PNG. |
| Post day | Planar track | 60 min | Track + acceptance check; double if Mocha fallback is needed. |
| Post day | Logo composite | 90 min | Corner-pin, lighting integration, motion blur, opacity ramp, acceptance check. |
| Post day | LED composite | 60 min | Track point, glow, animation, flicker. |
| Post day | BG plate prep | 30 min | Conform, pre-grade, defocus pass on the gym plate (§13.3). |
| Post day | Build matte | 60 min | Magic Mask + headband poly roto + edge refinement (§13.4–13.5). |
| Post day | BG comp + integration | 90 min | Light wrap, contact shadow, spill suppression, defocus matching, acceptance check (§13.6–13.10). |
| Post day | **Polish (Dehancer + optional Motion Brush)** | 30 min | §15.1 + optional §15.2. |
| Post day | Render + QA | 45 min | Master + preview render, QA pass, handoff note. |
| Post day | Buffer | 60 min | Reserved for the inevitable single thing that needs a redo. |

### 21.2 Path 2 — Re-shoot S3 at the gym day (~6–7 hours, single post session)

§13 (BG swap) collapses to a no-op — the gym is in the source. Post pipeline runs §5–§12 + §15 + §17–§18. Total post time ~5–6 hours, plus ~30 min of bench time at the gym day for the actual re-shoot.

| Block | Duration | Activity |
|---|---|---|
| Gym day add-on | 30 min | Re-shoot S3 per `docs/s3-shoot-plan.md` — same prop, same blocking, founder in the day's wardrobe. |
| Post day | 5–6 hr | Pipeline §5–§12 + §15 + §17–§18 on the new selects. No §13, no §14 swap. |

If Path 2 is on the table, **don't invest in the §13 BG swap on the kitchen source** — the work would be thrown away.

If the planar track requires the Mocha fallback, add ~90 minutes. If the v2v pass (§16) is requested by CD, add ~2 hours (mostly waiting on the API).

---

## 22. Approval & Handoff

| Step | Owner | Output |
|---|---|---|
| Pipeline review | CD + AVP | Approved post pipeline (this document) + alignment with `docs/founder-led-production-strategy.md` |
| **§14 path decision** (1: keep kitchen + BG swap; 2: re-shoot at gym day) | CD + Producer | Documented decision before post begins; gates whether §13 work is undertaken |
| **§13 gym plate sourcing** (own shoot vs stock vs AI) — Path 1 only | Producer | Plate file + license note in `post/assets/` |
| Ingest, grade, comp, polish, render | Producer (post) | `S3_master_v01.mov` + preview + handoff note |
| **BG comp acceptance** (Path 1 only) | CD | Side-by-side review against S4a reference frame; sign-off or re-do |
| First review | CD | Notes (LED timing, logo size, color match, BG integration, polish) |
| Revisions | Producer (post) | `S3_master_v02.mov` |
| Cut placement | Editor | S3 placed in master timeline at 0:15 |
| Final approval | CD | Locked S3 master clip |

The handoff note (`S3_handoff_v<n>.md`, per §18.3) must additionally record:
- Which §14 path was used (1 or 2) and the rationale.
- The gym plate source and license (own shoot / stock + URL + CC-license / AI tool + prompt) — Path 1 only.
- Whether §15.2 Motion Brush polish was applied.
- Whether the v2v pass (§16) was applied.
- Confirmation that the campaign-wide `Dehancer_campaign_v01.drx` preset was used.

---

**Prepared by:** Producer (solo founder)
**Date:** 2026-05-04 (v3 — adopts founder-led production pivot; §14 simplified, §15 polish step added)
**Supersedes:** v2 (2026-05-04, earlier this session) — three-option subject-continuity matrix; v1 (2026-05-03) — original draft assuming kitchen + founder ship as-is
**Distribution:** CD, AVP, Editor, Producer
**Status:** Draft v3 — for team review and feedback before post begins
