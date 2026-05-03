# S3 In-House Shoot Plan — "Gym Bag Reveal"

**Shot:** S3 — Athlete's hand pulls IronPal headband from a gym bag
**Approach:** Option C from `docs/s3-clip-analysis.md` — capture real reference footage in-house with a smartphone, then drive video-to-video AI and/or composite logo/LED in post
**Producer:** Solo founder (single-operator shoot)
**Target runtime in cut:** 3–5s (capture 8–10s usable per take to allow trimming)
**Budget:** ~$0 (use existing prop, smartphone, household lighting)
**Status:** Draft for team review

---

## 1. Purpose & Success Criteria

S3 is the pivot from "the old way" to "the IronPal way" — the viewer's first clear look at the physical product. Every prior AI-only attempt failed (shape morphing, floating physics, text degradation; see `docs/s3-clip-analysis.md`). The in-house shoot replaces the unstable AI motion with a real hand pulling a real fabric object from a real bag. Logo, wordmark, and teal LED are added in post, so the prop does **not** need to be a finished IronPal device — it only needs to read as a thin, matte black athletic headband.

A take is "good" if all of the following are true:

- [ ] Headband shape is **continuously visible** (no full occlusion of the side panel for more than ~10 frames).
- [ ] Hand grip is **stable** — no fumbling, no drops, no re-grips mid-take.
- [ ] The right-side panel of the headband (where the IronPal wordmark will be tracked) is **facing camera at the apex of the lift** for at least 0.5s.
- [ ] Bag opening is **clearly framed**, not cut off — viewer reads "object emerging from bag."
- [ ] Lighting matches the warm-amber, shallow-DOF look used across S2c → S4 (see consistency section).
- [ ] No watches, rings, bracelets, or distracting wrist hardware on the acting hand.
- [ ] The frame contains room (headroom + side margin) for post-tracked logo and LED glow.

---

## 2. Equipment

### Required (already available)

| Item | Spec / Notes |
|---|---|
| Smartphone | **Samsung Galaxy A52 (SM-A525F)**. Pro Video mode at **4K / 30fps** for hero takes (max detail for compositing) and **1080p / 60fps** for the slow-mo apex pass. HDR10+ ON, manual ISO / shutter / WB / focus locked, OIS ON, Super Steady OFF. Full settings in §5. |
| Tripod or stable mount | Phone tripod, gorillapod, or any rigid mount. **Locked-off shots only** for the hero — handheld is reserved for B-roll variants. |
| Bluetooth shutter remote (or 3s self-timer + lock) | So the operator can also be the hand-actor without touching the phone between takes. |
| Black gym bag | Matte/textured nylon preferred. **Avoid glossy, branded, or logo-heavy bags** — they fight the IronPal brand and create reflections. If the only bag has a visible competitor logo, turn that side away from camera or cover with gaffer tape. |
| Headband prop | The object shown in the user's reference screenshot. Acceptable as long as it's: thin, dark/black, and roughly headband-shaped. Color-correctable in post. The teal accent stripe and LED will be added in post — the prop doesn't need them. |
| Dark towel or matte cloth | To dress the inside of the bag so it reads as deep, soft, premium (not cluttered with junk). |

### Lighting (use what's on hand)

| Source | Role | Notes |
|---|---|---|
| Window light (golden hour, ~17:00–18:30 in early May) | **Key** | Warmest, free, premium. Position bag so the window is camera-left at ~45°. This is the preferred option — schedule the shoot for this window. |
| Desk lamp with warm bulb (2700–3000K) | **Backup key** | Used if shooting indoors mid-day. Diffuse with a sheet of baking paper / white t-shirt. |
| White posterboard / white t-shirt on a chair | **Bounce / fill** | Camera-right, ~1m from subject, to lift shadows on the hand. |
| Phone flashlight (warm filter optional) | **Practical / rim** | Optional — placed behind the bag to rim-light the headband as it emerges. Tape an orange/amber gel or a torn piece of warm-toned material if available. |

### Optional (nice to have, not required)

- Cleaning cloth + isopropyl wipe for the headband prop (lint and dust read sharply at 4K close-up).
- Gaffer tape — to mark the headband's side-panel orientation, the bag's front edge, and the operator's start/end hand positions on the table.
- Color reference card (or just a known-white object in frame for one take) — gives the colorist an anchor for matching S3 to neighboring shots.

---

## 3. Location & Set Dressing

**Location:** Indoors, near a window with warm afternoon light, against a clean dark wall. A workbench, kitchen counter, or weight bench works fine. The bag must sit at a height where the operator can reach into it naturally without raising the elbow above the shoulder (keeps the motion calm).

**Background:** Out-of-focus, dark, uncluttered. A gym bench with a folded towel is ideal. If shooting in a non-gym room, throw a dumbbell, a folded towel, and a water bottle into the **deep background** (well outside the focal plane) to suggest gym context — these will read as soft bokeh shapes only.

**What to remove from frame:**
- Any visible competitor branding (Nike, Adidas, Under Armour, Fitbit, Garmin, Apple Watch) — this kills the premium positioning.
- Power outlets, light switches, domestic clutter, branded packaging.
- Anything reflective near the lens axis (mirrors, glossy phone screens, laminated surfaces) — they create distracting glints during the lift.

**Set the bag's "hero side":** Decide which side of the headband will face the camera at the apex of the lift, and orient the bag so the prop sits in the bag with that side already facing up. Mark the orientation with a small piece of tape on the bag's interior so it can be reset between takes.

---

## 4. Shot List

The cut only needs ~3–5 seconds of S3. Capture the hero shot in multiple takes, then add coverage so the editor and post-VFX have options.

### Hero — Shot A: Locked-off medium close-up (the cut version)

| Field | Value |
|---|---|
| Frame | Medium close-up. Bag opening fills bottom half of frame; empty headroom above for the headband to rise into. 50mm-equivalent feel achieved by **physically positioning the phone ~40–60 cm from the bag** with the main wide lens (the A52 has no telephoto — digital zoom degrades quality, so move the phone, not the focal length). 4K capture gives ample crop headroom in post. |
| Camera | Locked off on tripod. **No camera motion** — all motion is the hand. This is the single most important rule for compositing the logo and LED later. |
| Lens setting | **Main wide lens (1×)** on the A52. Manual focus locked on the bag opening (peaking on). Manual exposure locked. HDR10+ ON. Pro Video mode. Tracking AF OFF. |
| Frame rate | **3840×2160 @ 30 fps** for the primary hero takes (max detail for compositing). On a second pass, capture **1920×1080 @ 60 fps** of the same blocking — these become the cinematic slow-mo apex inserts (60 → 24 = 2.5× slow-mo, clean). |
| Action | Hand enters from bottom of frame → grips headband inside bag → lifts in a smooth, deliberate ~1.5–2s motion → headband fully clears the bag → hand holds at apex with right-side panel facing camera for ~1s → optional gentle tilt to "show" the band → exit. |
| Takes | **8–10 takes minimum.** Most will fail on micro-fumbles or grip changes. |

### Hero — Shot B: Slight push-in alternative (B-track)

Same framing as Shot A, but on the second pass shoot 3–4 takes where the operator (or a tripod with a slider / books to slowly slide the phone forward) introduces a **very slow** push-in during the lift. Useful only if the locked-off version reads as too static in the edit. Locked-off is still the priority — push-in is an editor's option.

### Coverage — Shot C: Tight insert on the bag opening

| Frame | Extreme close-up on the bag opening only. Hand enters from bottom, fingers wrap headband, pulls partially out, frame ends with band half-emerged. |
| Use | Cuts from Shot C → Shot A apex, used if the editor wants a faster, two-cut reveal instead of a single sustained lift. |
| Takes | 3–4. |

### Coverage — Shot D: Side-angle profile

| Frame | 90° to Shot A. Camera sees the hand pulling the headband out from the side. Good for a brief 0.5s flash cut between Shot C and Shot A. |
| Use | Optional. Skip if running short on time. |
| Takes | 2–3. |

### Coverage — Shot E: Static beauty rest (insurance)

The headband resting on the closed bag's surface, no hand, locked-off, 6–8s. **This is the fallback if every motion take fails.** It also gives the team Option B from `s3-clip-analysis.md` (camera-only motion via AI image-to-video on a single frame).

---

## 5. Camera & Phone Settings Checklist

**Device for this shoot:** **Samsung Galaxy A52 (SM-A525F)**, Android 14. Replaced the originally-planned Redmi 9C NFC because the A52 offers 4K capture, true 1080p/60fps slow-mo, OIS, an f/1.8 64MP main sensor (1/1.73"), HDR10+ video, and a native Pro Video mode with manual ISO / shutter / WB / focus / mic during recording — every one of which materially improves the S3 hero shot.

**Camera app:** **Samsung Camera → Pro Video** mode. No third-party app needed. (Open Camera also runs fine on the A52 if a fallback is needed, but Pro Video gives access to focus peaking, zebras, and HDR10+ which Open Camera does not.)

**Hardware notes for the A52:**
- Lens: main wide f/1.8 (preferred), ultra-wide f/2.2, 5 MP macro, 5 MP depth. **Use only the main wide.** No telephoto exists — to "tighten" the frame, move the phone closer.
- Stabilization: hardware OIS + gyro EIS. Keep **OIS ON** always; turn **"Super Steady" OFF** (Super Steady switches to ultra-wide and crops aggressively).
- Aperture is fixed at f/1.8 — DOF is controlled by subject distance and physical lens, but the larger sensor + brighter aperture mean real bokeh is achievable on the bag-background.

**Pre-shoot setup (A52 → Camera → Settings, then Pro Video):**

- [ ] Pro Video → Resolution: **3840×2160 (4K)** for hero takes; switch to **1920×1080 / 60fps** for the slow-mo pass.
- [ ] Pro Video → Codec: **HEVC (H.265)** — smaller files, same quality.
- [ ] Camera Settings → **HDR10+ video: ON** (4K only).
- [ ] Camera Settings → **Tracking auto-focus: OFF**.
- [ ] Camera Settings → **Picture/video format: Standard** (do not save in DNG/raw — irrelevant for video).
- [ ] Camera Settings → **Scene optimizer: OFF**.
- [ ] Camera Settings → **Smart selfie / beauty / AI: all OFF**.
- [ ] Camera Settings → **Watermark / location tag: OFF**.
- [ ] Storage check: **at least 10 GB free** (4K/30 HEVC ≈ 350 MB/min, 1080p/60 HEVC ≈ 200 MB/min).

Before rolling **every** take (in Pro Video):

- [ ] Mode: **Pro Video** (icon shows "MORE → PRO VIDEO" if not already pinned).
- [ ] Lens: **1× main wide** (not ultra-wide, not macro).
- [ ] Resolution / fps: **4K / 30 fps** for hero takes; **1080p / 60 fps** for slow-mo pass.
- [ ] **Focus: MF**, focus-peaking ON, distance ring set so the bag opening edge shows red/yellow peaking. Do not let it slip back to AF.
- [ ] **Exposure: manual.** Set ISO and shutter explicitly (do not leave EV in auto). Watch the zebras — set shutter so brightest fabric highlight just falls below the zebra threshold.
- [ ] **ISO: 50** (base) for window-lit shoot; only push to 100 if scene is too dark. Anything above 200 introduces noise that survives compression.
- [ ] **Shutter: 1/60 s** at 30fps; **1/120 s** at 60fps (180° shutter angle for natural motion blur).
- [ ] **White balance: manual, 3000 K** (use the WB slider, not a preset). Do not leave on AWB — it will swing cool the moment the headband's white interior shows.
- [ ] **Mic: muted / level 0**. VO is recorded separately, no need to capture audio.
- [ ] **OIS: ON**. **Super Steady: OFF**.
- [ ] Airplane mode ON — kills notifications mid-take.
- [ ] Rear lens cleaned with a microfiber cloth.
- [ ] Phone clamp tightened — no drift; phone in **landscape** orientation.
- [ ] Grid lines ON (rule of thirds).
- [ ] **First take filmed against a known-white reference** (paper / t-shirt) for ~2s to give the colorist an anchor and a WB sanity check.

**Why Samsung Pro Video over the stock auto mode:** auto-mode rebalances exposure, white-balance, and focus the moment the headband enters the frame — which guarantees a mid-take brightness pop and color shift, both unfixable in post and devastating to the wordmark composite track. Pro Video locks all three. The A52 is the first device in this project that exposes those locks natively — no third-party install needed.

---

## 6. Action Direction (the hand performance)

The hand is the actor. Most failed takes fail here, not in the camera. Coach the action:

1. **Start position:** Fingers loosely curled, hovering 5–10 cm above the bag opening, frame-bottom.
2. **Reach:** Smooth descent into the bag — no hesitation, no searching. The hand should *know* where the headband is. Pre-place the prop so the grip point is consistent every take.
3. **Grip:** Pinch the headband **by one end** between thumb (on the matte black exterior) and forefinger (on the inner lining), so when lifted the band hangs as a flat vertical strip with the matte black exterior facing camera. **Do NOT hold it as a coiled loop** — see § 6.1 for full grip diagrams and the reason. Fingers must not cover the area where the IronPal wordmark will be composited.
4. **Lift:** Single continuous arc, ~1.5–2s, ending with the headband fully clear of the bag at chest/face height. No re-grips, no rotations beyond a gentle ~10° tilt to present the side panel.
5. **Hold:** ~1s static at the apex with the side panel facing camera. This is the frame post will track the logo onto.
6. **Exit:** Slow drift out of the top or right of frame. Don't snap out — the editor wants smooth tail handles.

Practice the move 3–4 times without rolling. Then start filming. Reset the headband's orientation in the bag between every take.

---

## 6.1 Prop Preparation & Grip (the fix from the 2026-05-03 session)

The first in-house session (review at `docs/s3-take-review-20260503-112515.md`) captured a clean lift in every take, but the prop was held as a **closed oval loop** rather than a flat strip. This breaks the post pipeline because the wordmark composite (§ 9, step 5) needs a flat rectangular surface to track onto. Fix this **before** the next session.

### What post needs at the apex

- A **flat surface** of the matte black exterior facing camera, **square to the lens** (no curve, no bend).
- That surface must be **at least ~30 mm wide × ~50 mm tall** in the prop frame.
- Stable for **≥15 frames in a row** (~0.5 s at 30 fps) so After Effects' planar tracker can lock onto it without warping.
- The **inner lining must not be visible** anywhere in frame at the apex — the real product is uniformly matte black on the outside; visible lining reads as "wrong product".

### What went wrong on 2026-05-03

The actor lifted the prop out as a closed ring, with the lining visible inside the loop:

```
   Actor's hand pinches HERE
            │
            ▼
       ╭─────────╮      ◄── outside of loop = matte black exterior
       │         │
       │  white  │      ◄── inside of loop = pale fabric lining
       │  inner  │           (wrong colour for composite)
       │ visible │
       │         │
       ╰─────────╯
```

Two failures with this orientation:
1. The "side panel" surface curves *away* from the camera at every point on the loop — no flat rectangle anywhere.
2. The pale inner lining is visible inside the ring — would have to be rotoscoped frame-by-frame.

### How to hold it instead

#### Option A — Single-hand pinch + vertical drape (RECOMMENDED)

```
        Hand pinches the LEFT END of the band
        (thumb on top, forefinger underneath,
        ~15 mm from the edge)
            │
            ▼
        ┌──┐
        │██│←── matte black exterior facing camera
        │██│   (the entire visible face is the
        │██│    "wordmark side panel")
        │██│
        │██│
        │██│   gravity stretches the band straight down
        │██│
        │██│
        └──┘
```

- Pinch the band between thumb and forefinger of the right hand near one end.
- Let the rest of the band hang **straight down** under its own weight.
- Rotate your wrist so the **matte black exterior faces the camera** (the lining faces the actor).
- Lift to chest height. Hold steady ~2 s.

The band reads as a thin vertical strip, ~30 mm wide × ~150 mm tall. The whole visible face is wordmark territory — the editor picks any clean section. Easiest grip to hold steady, cleanest to track. **Use this unless you have a specific reason not to.**

#### Option B — Two-hand horizontal stretch

```
   Left hand          Right hand
      │                   │
      ▼                   ▼
     ┌──────────────────────┐
     │██████████████████████│  ◄── matte black exterior facing camera
     └──────────────────────┘
                 ▲
        wordmark composite goes here
        (right ~30 mm of the band)
```

- Grip both ends, one hand each.
- Stretch the band horizontally at chest height, gentle tension only (don't pull taut — flatten naturally).
- Matte black exterior facing camera. Hold ~2 s.

More cinematic — reads as "presenting the product" — but harder to keep both hands steady, and the cut needs both hands to enter and exit. Use only if Option A reads as too static after the first session is reviewed.

#### Option C — One-hand mid-grip drape (AVOID)

Same as Option A but holding the band higher up (mid-band rather than at one end), letting both halves drape down in a "U". Looks fine in stills but:
- The band can swing/twist on the lift.
- The grip point itself sits in the middle of the would-be wordmark surface.

### Pre-shoot prop prep (do this once at the start of the session)

1. **Identify the band's two faces.** Lay the band flat on a table. The matte black side is the *exterior* (this faces camera). The lighter / textured side is the *lining* (this faces the actor).
2. **Pre-fold the band into a "fan-fold" packet** — like an accordion fold:
   - Fold it in half once (lining-to-lining, exterior facing out on both sides).
   - Then fold it again accordion-style into an ~80 mm packet.
   - Place the packet in the bag with the **exterior side up** and the pinch end (the end the right hand will grip) on top.
3. **Mark the inside of the bag** with a small piece of gaffer tape on the lining where the packet sits, so between takes the prop resets to the same place and orientation in 2 seconds.
4. **Rehearse the lift 3 times** before rolling: reach in → pinch the top edge of the packet → lift in a smooth arc → as the band clears the rim, **let gravity unfold it into the vertical strip** → hold at chest height ~2 s with the matte black face square to camera → return to bag.

The pre-fold matters because the band comes out of the bag *already oriented correctly* — the actor doesn't have to fiddle mid-lift, and the lining never gets exposed to camera.

### Acceptance check (at the apex frame)

- [ ] No part of the band is curved into a ring or loop in the visible frame.
- [ ] No pale / lining surface is visible anywhere on the band.
- [ ] The wordmark surface (whichever option) is **square to the lens** within ±15°.
- [ ] At least ~30 × 50 mm of clean flat exterior surface is visible.
- [ ] Hand grip occupies less than 25 % of the visible band area.
- [ ] Band is held stable (no swing, no rotation) for the full ~1 s hold.

If any of these fails on review, reset and re-shoot before tearing down the set.

---

## 7. Lighting Setup

```
                  [ window — warm afternoon sun, key, camera-left ~45° ]
                                    \
                                     \
                                      \
        [ white bounce / t-shirt ] --- [ bag + headband ] --- [ camera on tripod ]
                                      /
                                     /
              [ optional warm phone-flashlight rim, behind/below the bag ]
```

Targets:
- **Warm color temperature:** 2700–3200K. Avoid mixed daylight + tungsten — close other-room doors, turn off cool overhead LEDs.
- **Shallow effective DOF:** use the phone's longer lens (2×/3×) and pull the bag at least 1m off the background wall. Some phones offer a "Cinematic" mode — acceptable but turn off any auto-rack-focus behavior since it will hunt during the lift.
- **One clear key direction:** shadows on the hand should fall to camera-right. This matches the hero shot direction in S2c / S4a.
- **No mixed-temperature reflections** in the bag's nylon — rotate the bag until reflections are soft and warm, not blue/cool.

Run a 10-second test clip and review on a second screen (laptop) before committing. Phone screens lie about color and exposure.

### 7.1 Leonardo AI Prompt — Lighting Setup Illustration (with Actor)

Use this prompt to generate a photorealistic visual reference of the lighting setup **and the actor mid-action** before shoot day. The illustration should read as a behind-the-scenes / set-diagram photograph that also previews the hero gesture, not a stylized concept render. Including the actor lets the producer pre-visualize the framing, the actor's blocking, the lighting wrap on his arm and torso, and the natural physical interaction between hand, headband, and bag.

**Recommended Leonardo settings:** Phoenix or Lucid Realism model, photorealism preset, 16:9, guidance scale 7, 1 reference image optional (any "behind the scenes film set" photo for layout). No prompt magic, no alchemy upscaling on first pass.

**Prompt:**

> Photorealistic behind-the-scenes three-quarter view from slightly above bench height of a small indie film lighting setup for a smartphone product shoot, taken inside a modern minimalist apartment near a tall west-facing window during golden hour. Centered on a dark walnut workbench: a matte black athletic nylon gym bag, partially open, with a sleek thin matte black fitness headband mid-emergence from the bag — the headband has a thin electric teal accent stripe along its length and a small flush-mounted camera lens module on the front center panel with a tiny pinhole teal LED. **Standing behind the bench, slightly camera-right and angled three-quarters toward the camera, an athletic male actor in his late twenties to early thirties: lean and muscular build, around 180 cm tall, short cropped dark brown hair, light stubble, calm focused expression looking down at his hands, no jewelry, no wristwatch. He wears a fitted matte black short-sleeve athletic crew-neck performance shirt, charcoal grey jogger pants, and is barefoot or in plain black athletic socks. He leans forward gently from the hips, his right shoulder rolled slightly inward over the bag. His right arm extends down into the open bag at roughly a 60-degree angle from his torso; his right hand is mid-lift, fingers gripping the side panel of the headband (thumb on the outer face, index and middle fingers on the inner face), pinching it cleanly without bunching the fabric, the headband already cleared the bag opening by about 10 centimeters and is rising in a smooth deliberate motion. His left hand rests lightly on the front edge of the gym bag, steadying it. The interaction reads as natural and physically plausible — relaxed grip, even tension on the fabric, no awkward wrist angles, no fumbling, the headband held flat with its branded side panel facing the camera lens.** Camera-left of the bag at a 45-degree angle, warm late-afternoon sunlight (around 2900 Kelvin) streams through sheer linen curtains, acting as a soft key light wrapping across the actor's left cheek, left forearm, and the top of the headband, casting long warm shadows across the bench surface. Camera-right of the bag, a white foam-board bounce panel approximately 60 by 90 centimeters leans on a wooden chair, lifting fill light into the shadow side of the actor's right arm and the headband. Behind and slightly below the bag, a small smartphone laid screen-up emits a soft warm rim glow (an orange gel taped over its flashlight) edge-lighting the headband from behind. Directly facing the bag at bench height, in the foreground of the frame, a black smartphone tripod with a modern smartphone clamped vertically in landscape orientation, the phone's rear camera array clearly visible, recording the scene; a small Bluetooth shutter remote rests on the bench beside it. Background is a clean dark charcoal wall, softly out of focus, with a folded gray towel and a single dumbbell visible as deep-background bokeh shapes suggesting a gym context. Lighting mood is warm amber and cinematic, with controlled deep shadows, no harsh highlights, no overhead office lights. Shot on a full-frame mirrorless camera at 35mm, f/4, ISO 400, natural color, photorealistic, ultra-detailed, technical-yet-elegant set photography style with the documentary feel of an on-set behind-the-scenes still, suitable as a production reference. The actor is not posing for camera — he is genuinely in the act of pulling the headband out of the bag. No text, no logos other than the implied IronPal headband detail.

**Notes for the prompt operator:**
- If Leonardo struggles to keep the actor's right hand grip clean, regenerate or add the modifier *"close-up clean hand grip, anatomically correct fingers, five fingers visible, no extra digits"* near the action description.
- If the actor's face dominates the frame, push the camera position slightly higher and add *"actor's face partially in shadow, focus on the hands and headband"* — the hero of the shot is the headband, not the face.
- If the headband morphs into a thicker shape (a known failure mode — see `docs/s3-clip-analysis.md`), add *"thin flat fabric strip, no rigid structure, moisture-wicking athletic textile"* in the headband description.

**Negative prompt:** cartoon, illustration, 3D render, low resolution, harsh blue daylight, fluorescent overhead lighting, multiple cool light sources, cluttered background, brand logos other than IronPal, watermark, text overlays, extra fingers, deformed hands, awkward wrist, floating headband, headband thicker than 2 cm, multiple people, female actor, child, jewelry, wristwatch, tattoo sleeves, athletic gloves, tank top, shirtless, casual streetwear, jeans, slogans on clothing, branded sportswear logos.

**Output use:** print to A5 and bring on shoot day as a layout + blocking reference; pin in the production folder under `input/kickstarter/storyboarding/S3/setup-reference/`. Use it to pre-rehearse the actor's grip and posture before rolling.

---

## 8. Brand & Visual Consistency

S3 must edit cleanly between S2c (the "old way" frustration close-up) and S4a (athlete bench-pressing with headband). Match these visual anchors:

| Element | Target |
|---|---|
| Color temperature | Warm amber / golden-hour (matches S4a–S5). S2c is intentionally cooler and more desaturated — S3 is the **transition** where warmth returns. |
| Lighting style | Single soft warm key from one side, deep shadow on the opposite side. No flat top-down lighting. |
| Brand color anchor | Teal LED + teal accent stripe — added in post. Reserve a clean ~30 mm strip on the headband's side panel for the wordmark composite. |
| Logo asset | `input/images/logo/v4/Geometric teal circle on navy.png` (icon) + "IronPal" wordmark in teal. Composite onto the side panel during the apex hold. |
| Negative space | Leave the right third of the frame relatively empty at the apex — gives room for any motion-graphics text or the VO-2 caption ("This is IronPal") if the editor wants it. |
| Audio | None captured intentionally. The shot lives under VO-2 + score. Phone mic audio can be discarded. |

References:
- `docs/video-production-execution-plan.md` — S3 prompt and the surrounding S2c → S3 → S4a continuity.
- `docs/body-mounted-product-prompts.md` — canonical product look (matte black, teal stripe, teal LED).
- `docs/color-schemes.md` — campaign palette.

---

## 9. Post-Production Pipeline

Once footage is captured, the path to a finished S3 clip:

1. **Select takes:** Review all hero takes on a laptop. Pick **2 selects** from Shot A (one primary, one backup), **1 select** from Shot C, **1 select** from Shot E (insurance beauty rest).
2. **Stabilize (only if needed):** Locked-off takes shouldn't need stabilization. If the tripod drifted, use Resolve / Premiere optical-flow stabilization at low strength.
3. **Color:** Match to the warm-amber S4a look. Lift shadows slightly, push midtones warm, leave the prop's blacks crushed enough that the post-comped teal LED will pop.
4. **Track the side panel:** Use After Effects Mocha or Resolve Fusion planar tracker on the headband's right-side panel. Track for the entire hold + the last ~0.5s of the lift.
5. **Composite the IronPal wordmark + circle logo:** Place onto the tracked plane. Match scale to the panel (~30 mm equivalent), lighting (warm overlay on the teal), and slight motion blur during the lift.
6. **Composite the teal LED:** Soft radial glow keyed to a fixed point on the front-center of the headband. Begin at ~30% opacity during the lift, ramp to 100% at the apex synced to the VO-2 line "This is IronPal."
7. **Conform to 24p:** Slow the 60p source by 40% for a cinematic feel during the apex if needed; keep the lift portion at 100% so the motion stays believable.
8. **Hand off to editor:** Drop into the master timeline at the 0:15–0:22 mark per `docs/video-production-execution-plan.md`.

**Optional — video-to-video AI pass (Option C from s3-clip-analysis):** If, after compositing, the prop still reads as "amateur" (lint, wrong proportions, household context bleeding through), feed the locked-off Shot A select into Kling Motion Control or Runway Gen-3 video-to-video using the IronPal storyboard frame as the visual reference. The real footage provides the motion plate; the AI replaces texture/material. This is a fallback, not the default — start by trying to ship the directly-composited version.

---

## 10. Schedule (single half-day session, ~3 hours)

| Block | Duration | Activity |
|---|---|---|
| Pre-production | 30 min | Confirm lighting timing (golden hour), clean prop, dress set, remove competitor logos, charge phone, clear storage. |
| Setup | 30 min | Mount tripod, lock framing for Shot A, set bounce, shoot 2-min lighting test, review on laptop, adjust. |
| Hero (Shot A + B) | 60 min | 8–10 takes Shot A locked-off; 3–4 takes Shot B with subtle push-in. Review every 3 takes. |
| Coverage (C, D, E) | 45 min | 3–4 takes Shot C; 2–3 takes Shot D; 1–2 takes Shot E (beauty rest). |
| Wrap & review | 15 min | Quick on-set review, identify any obvious reshoots before tearing down. Back up footage to disk. |

If a single block fails (e.g., the prop reads as too cheap), break and reshoot the next golden hour rather than burning time mid-session.

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Prop doesn't read as a premium fitness headband | High | High | Color-correct in post. Composite teal stripe + wordmark + LED to elevate. If still too cheap, run the take through video-to-video AI as the final fallback. |
| Hand fumbles / inconsistent grip across takes | High | Medium | Rehearse 3–4 dry runs. Mark grip point inside the bag with tape. Shoot 8–10 takes. |
| Smartphone DOF too deep — background not blurry enough | Low | Medium | A52's f/1.8 + 1/1.73" sensor gives real bokeh at close range. Push the background ≥1m back; rely on the main wide lens. Post-blur a fallback only if needed. |
| Color temperature mismatches S4a | Medium | Medium | Shoot under warm window light at golden hour; include a known-white frame for the colorist; test-grade against an S4a reference frame on set. |
| Reflections / glints on the bag fabric | Medium | Low | Rotate bag, kill any cool secondary light sources, dress the bag interior with a matte dark towel. |
| Operator-as-actor problem (solo shoot, can't be behind camera and in frame at once) | High | Low | Use a Bluetooth shutter remote or the 3s self-timer. Frame and lock focus first, then step into frame. |
| Logo composite drifts during the lift | Low | High | Use Mocha planar tracking, not point tracking. Track the entire side panel as a flat plane. Hold the apex for a full 1s so post has stable frames to land on. |
| Footage backup loss | Low | High | Copy to laptop and one cloud backup before tearing down the set. |

---

## 12. Deliverables

After the shoot, the producer hands the post pipeline:

- [ ] All raw clips, organized as `input/kickstarter/storyboarding/S3/raw/<shot>_<take>.mov`
- [ ] A select reel — 2 hero takes, 1 insert, 1 beauty rest, named `S3_select_<n>.mov`
- [ ] A short notes file (`S3_shoot_notes.md`) flagging the chosen take, any continuity issues, and the recommended composite plan
- [ ] One reference still exported from the chosen take — the apex frame — for AVP / CD sign-off before post begins

---

## 13. Approval & Handoff

| Step | Owner | Output |
|---|---|---|
| Plan review | CD + AVP | Approved shoot plan (this document) |
| Shoot | Producer (solo) | Raw selects + notes |
| Take selection | AVP + CD | Final hero take chosen |
| Composite | MGD / VFX | S3 master clip with logo + LED |
| Cut placement | Editor | S3 placed in master timeline at 0:15 |
| Final approval | CD | Locked S3 clip |

---

**Prepared by:** Producer (solo founder)
**Date:** 2026-05-01
**Distribution:** CD, AVP, MGD/VFX, Production Team
**Status:** Draft — for team review and feedback before shoot day
