# Samsung Galaxy A52 — Camera Setup Guide for the S3 Shoot

**Device:** Samsung Galaxy A52 (SM-A525F), Android 14 / One UI 6
**Use case:** S3 hero shot — hand pulling IronPal headband from a gym bag (see `docs/s3-shoot-plan.md`)
**Target output:** 4K @ 30fps for the hero takes, 1080p @ 60fps for the apex slow-mo pass, both with manual exposure / focus / white balance locked
**Audience:** the producer (solo founder), reading this on a laptop next to the phone

This guide walks every tap. Read it through once, then keep it open on shoot day as a reference. Section numbers (§) reference the parent shoot plan.

---

## 1. Pre-Flight Checks (Day Before)

Do these the **evening before** the shoot — not on shoot morning. Anything you discover broken at 18:00 the night before is fixable; anything you discover broken during golden hour is not.

### 1.1 Free up storage

1. **Settings → Battery and device care → Storage**.
2. Confirm at least **15 GB free**. 4K HEVC at 30fps writes ≈ 200 MB/min; 1080p / 60fps HEVC writes ≈ 130 MB/min. Allow headroom for re-takes and a same-day laptop transfer.
3. If short on space: tap **Smart cleanup** → free trash, large files, duplicate images.

### 1.2 Update the camera app and One UI

1. **Galaxy Store → Menu → Updates → Update all** (if any updates pending for "Camera").
2. **Settings → Software update → Download and install**. Do not start a One UI update on shoot day — they reboot the phone and reset some settings.

### 1.3 Charge to ≥ 90 %

The A52 will throttle 4K recording if the phone gets hot or the battery falls below ~20 %. Plug it in overnight; pull it off charge ~30 min before rolling so it's not warm to the touch.

### 1.4 Disable interruptions

1. **Settings → Notifications → Do not disturb → On**.
2. Or use the quick-toggle drop-down: pull down twice from the top, tap **Airplane mode** (kills cell + Wi-Fi + Bluetooth in one shot).
3. **Settings → Sounds and vibration → System sound / vibration → all OFF** (camera shutter and focus beep).

### 1.5 Clean the lens

The main rear lens picks up fingerprints fast. Wipe with a microfiber cloth in a circular motion. Hold the phone up to a lamp afterwards — any smudge is visible as a soft halo.

### 1.6 Mount, frame, and rehearse

**Phone orientation.** Mount the A52 in the tripod clamp in **landscape orientation, with the rear (main) camera facing the gym bag**. The screen will end up on the *opposite* side from the bag — it faces away from the scene, away from you. That is correct. The rear camera is the one that records; it must point at the action.

**Solo-shoot consequence.** Because you are also the actor, you cannot see the live preview from your acting position behind the bench. Plan accordingly:

1. **Frame everything with a stand-in first.** Place a folded towel or a water bottle where the headband will be. Walk around to the screen side and frame the shot so the bag opening sits on the lower third and there is headroom for the headband to rise into. Lock focus / exposure / WB (§ 3) while you can still see the screen.
2. **Verify framing once with your own arm in position.** Have a second hand (or a long stick / selfie stick) extend into the frame at the apex height to confirm the headband will land in clean composition. Adjust tripod position before rolling.
3. **Start recording, then step into actor position.** Use one of these triggers so you are not jolting the tripod each take:
   - **Bluetooth shutter remote** (recommended) — pair under *Settings → Connections → Bluetooth*, place on the bench, press once to start / once to stop. Most generic AB Shutter clones map to a record toggle in the Samsung Camera app.
   - **Voice control** — *Camera Settings → Voice commands → ON*, then say *"Record video"* / *"Stop recording"*. Tape the mic noise out in post (you're already muting audio).
   - **Self-timer** — Pro Video also exposes a 2-, 5-, or 10-second timer next to the record button. Useful for solo takes.
4. **Mirror the screen to your laptop** *(optional, ideal)*. With the laptop placed on the bench within your eyeline, you can monitor the live preview while in actor position:
   - Easiest: **scrcpy** on the laptop (`scrcpy -s R58T13ECWNL --max-fps 30`) over USB cable — near-zero latency, no extra apps. The cable can dangle off the back of the phone without affecting the rear camera.
   - Alternative: **Samsung Smart View / Wireless DeX** to a TV or laptop running a Miracast receiver. Higher latency (~200–500 ms) — usable for framing checks, not for catching focus drift in real time.

**Rehearse before rolling.** Practice the lift action 3–4 times without recording. Reset the headband orientation in the bag between every rehearsal (and between every take). Most failed takes fail in the hand performance, not the phone.

---

## 2. One-Time Camera App Configuration

Do this once, then leave alone. Settings persist across launches as long as "Settings to keep" (§ 2.4) is correct.

> **Heads-up for this device.** The A52 (One UI 6.1, Camera v14.1) ships with a noticeably shorter Settings menu than the Galaxy flagships (S22+/Note 20 Ultra/etc.). Several toggles documented in older Samsung tutorials simply **do not exist on this hardware**:
> - **HDR10+ video** — not available on the A52. Recording is SDR Rec.709 only. The shoot plan compensates by leaning on the warm window key + bounce panel rather than relying on shadow recovery in post.
> - **Auto FPS** toggle — does not exist (so we don't have to disable it).
> - **Tracking auto-focus** toggle — does not exist as a global switch; AF behaviour is controlled inside Pro Video by selecting MF.
> - **"Advanced video options"** sub-menu — does not exist; the video toggles you do have are surfaced directly under *Settings → Videos*.
>
> If you scrolled the Settings list and thought "where are all these settings?" — that is why. The list below reflects what is actually on the device.

### 2.1 Open the Camera app

From the home screen or app drawer → **Camera**. The app opens in **Photo** mode by default. The visible mode strip across the bottom is, left to right:

`FUN · SINGLE TAKE · PHOTO · PRO · VIDEO · MORE`

`PRO` here is **Pro stills** (manual photo) — it is **not** what we want for video. We want **Pro Video**, which lives under `MORE`.

### 2.2 Pin Pro Video to the bottom mode strip (replace `PRO`)

By default the bottom strip is `FUN · SINGLE TAKE · PHOTO · PRO · VIDEO · MORE`. We want **Pro Video** there instead of `PRO` (which is photo-only and irrelevant for this shoot). The A52 supports rearranging the strip via the MORE panel's Edit button:

1. Tap **MORE** at the right end of the bottom mode strip.
2. In the top-right of the MORE panel tap the small **pencil / Edit** icon (content-desc "Edit").
3. The screen header now reads *"Drag and drop modes to or from the bottom of the screen."* The 9 hidden modes show in a grid; the bottom strip shows the currently-pinned modes.
4. **Long-press** *Pro Video* in the grid → **drag down** into an empty slot in the bottom strip → release. Pro Video is now pinned.
5. **Long-press** `PRO` in the bottom strip → **drag up** into the grid area → release. `PRO` is unpinned.
6. Tap **Save** at the bottom.

Result: the mode strip becomes `… PHOTO · PRO VIDEO · VIDEO · MORE`. From now on, one tap takes you straight to Pro Video — no `MORE → Pro Video` round-trip needed.

> **Combine with `Settings to keep → Camera mode = ON` (§ 2.4)** so the app *also* reopens in Pro Video by default — saves the tap entirely on app re-launch.

### 2.3 Configure global Camera settings

Tap the **⚙ (gear)** icon in the top-left of the viewfinder. The full list on this build (top to bottom):

**Intelligent features (most are greyed out — leave them)**
- Scene optimiser — *greyed out for video; ignore*
- Scan documents and text — *greyed out; ignore*
- Scan QR codes — *greyed out; ignore*
- Shot suggestions — *greyed out; ignore*

**Pictures** (these apply to stills only, but set sensibly in case you accidentally take a still)
- [ ] **Swipe Shutter button to**: *Take burst shot* (default — leave)
- [ ] **Watermark**: **OFF**
- [ ] **High efficiency pictures**: greyed out; leave

**Selfies** *(skip — front camera is not used)*

- [ ] **Swipe up/down to switch cameras**: ON (default — leave)

**Videos** (the only two video-specific settings on this build)
- [ ] **High efficiency videos** *(HEVC / H.265)*: **ON** — smaller files, same quality. *Required* if you want the Gallery to mark clips as HEVC.
- [ ] **Video stabilisation**: **OFF** for tripod hero takes (turn ON only for handheld B-roll variants).

**General**
- [ ] **Auto HDR**: greyed out for video on this device; leave.
- [ ] **Grid lines**: **ON** (rule of thirds — helps keep the bag opening on the lower third).
- [ ] **Location tags**: **OFF**.
- [ ] **Shooting methods** *(sub-menu — open it)*:
  - **Press Volume key to**: *Take pictures or record video* (default — convenient hardware trigger).
  - **Voice commands**: **OFF** (a "Record video" voice trigger jolts nothing but adds room noise; we use a Bluetooth shutter instead — see § 1.6).
  - **Floating Shutter button**: **OFF**.
  - **Show palm**: **OFF**.
- [ ] **Settings to keep** *(sub-menu — open it)*:
  - **Camera mode**: **ON** *(critical — so the app reopens in Pro Video instead of Photo)*.
  - **Filters**: ON.
  - **Selfie angle**: irrelevant.
- [ ] **Show Snapchat Lenses in Fun mode**: ON or OFF, doesn't matter.

**Privacy**
- [ ] **Permissions**: leave as-is.

**Reset settings / About Camera** — do not touch unless reverting after the shoot.

Back out of Settings. There is no "Storage location" toggle on this device — all video saves to internal storage by default.

### 2.4 Quick-test with a 5-second clip

1. Mode strip → **MORE → Pro Video**.
2. Confirm the resolution chip at the top shows **`UHD 30`** (4K) or **`FHD 30/60`** as needed (see § 3 for which to pick when).
3. Hit record. Hold for 5 seconds. Stop.
4. Open the clip in **Gallery**. Confirm:
   - It plays back smoothly.
   - File extension `.mp4`, codec HEVC (Gallery → ⓘ shows codec).
   - **No HDR10+ badge** — that is expected on the A52, do not waste time looking for it.
5. If the clip hitches or the codec shows H.264 instead of HEVC, recheck *Settings → Videos → High efficiency videos*.

---

## 3. Per-Take Setup (Pro Video, Step-by-Step)

This is the sequence to run before **every hero take**. ~30 seconds once memorized.

### 3.1 Switch to Pro Video mode

If you've pinned Pro Video to the bottom strip per § 2.2, just tap **PRO VIDEO** in the strip. If for any reason it isn't pinned, tap **MORE → Pro Video** — *not* `PRO`, which is the photo-only manual mode. The viewfinder UI changes — manual control sliders appear along the bottom: ISO, SPEED, EV, FOCUS, WB. The label `< PRO VIDEO` appears just above the record button.

### 3.2 Choose lens and resolution

1. **Lens selector** — in Pro Video on the A52, the lens selector is a **stack of two small circle icons in the centre of the viewfinder** (not the strip-style `0.5×/1×/2×` chooser used in regular Photo or Video mode):
   - Top circle (half-moon / wide-angle glyph) = **0.5× ultra-wide** lens.
   - Bottom circle labelled **`W`** = **main 1× wide** lens.
   - **Tap `W`.** Always use the main wide for hero takes; the ultra-wide distorts faces and edges.
   - There is no `2×` option in Pro Video — Samsung disables digital zoom in this mode. If you need the frame tighter, move the phone closer.
2. **Resolution / aspect chip** (top-centre, e.g. `FHD 30` or `UHD 30`):
   - For **hero takes (Shot A locked-off):** tap until it shows **`UHD 30`** (3840×2160 @ 30fps).
   - For the **slow-mo apex pass:** tap until it shows **`FHD 60`** (1920×1080 @ 60fps).
   - Do not pick `21:9` or `UHD 60` — UHD/60 is unavailable on this hardware; 21:9 is a crop.

### 3.3 Set the exposure manually

In Pro Video the bottom strip shows icon buttons. Tap each in turn:

1. **ISO** → drag the slider to **50**. (If the live preview is too dark even with the window light at full, raise to **100**, never above **200**.)
2. **SPEED** (shutter) → set to:
   - **1/60 s** for 30fps takes (180° shutter angle = natural motion blur).
   - **1/120 s** for 60fps takes.
   - Drag the slider until the bottom-right counter reads exactly that value.
3. **EV** → leave at **0.0**. We're driving exposure with ISO + shutter, not EV compensation.

### 3.4 Lock the white balance

1. Tap **WB**. The slider changes from "AWB" (Auto) to a Kelvin scale.
2. Drag to **3000 K** (warm tungsten range).
3. Verify in preview: the bag should look warm-amber, not neutral or cool.
4. **Do not leave WB on AWB.** AWB will swing 600–1000K cooler the moment the headband's white interior shows during the lift.

### 3.5 Lock the focus

1. Tap **MF** (manual focus) — replaces the AF auto button.
2. A horizontal **focus distance slider** appears (∞ on one end, close-focus on the other). The A52's Pro Video does not show focus peaking — confirm focus visually with a quick pinch-to-zoom on the live preview.
3. Drag the focus slider slowly until **the bag opening edge** is sharp at zoom. Pinch back out before rolling.
4. The hand and headband at the apex will fall within depth of field at f/1.8 because they're roughly the same distance from the lens. If the actor's face is further back, that's fine — face will be soft, headband will be sharp, that's the look.
5. **Do not tap-to-focus** between takes — tapping resets to AF and you'll have to re-rack manually.

### 3.6 Mute the microphone

1. Tap the **microphone icon** (bottom toolbar in Pro Video).
2. Pull the level all the way down to **0**, or tap the mic to mute (it shows a slash).
3. Audio is recorded separately for VO; phone audio of the room is unusable.

### 3.7 Final pre-roll check

Before tapping record, verify the following are visible/correct on screen:
- **`UHD 30`** (or **`FHD 60`** for slow-mo pass)
- **ISO 50** (or 100)
- **1/60** (or **1/120**)
- **WB 3000K**
- **MF** with focus distance set
- *(no HDR10+ badge — A52 doesn't record HDR10+; expected)*
- **Mic muted**

Hit the **red record button**. Count "1, 2, 3" silently. Begin the lift.

### 3.8 After each take

1. Tap **stop**.
2. Tap the **gallery thumbnail** (bottom-left).
3. Scrub through the clip on the phone. Look for:
   - Brightness pop mid-take (means AE drifted — re-check ISO/shutter).
   - Color swing (means WB drifted — re-check 3000K lock).
   - Focus hunting (means AF re-engaged — re-check MF).
   - Visible reflection or glare on the bag fabric.
4. Reset the headband in the bag in its taped orientation. Roll the next take.

---

## 4. Lighting Tips for Consistency

The A52 sensor handles warm window light well; cool / mixed-temperature light is what destroys the shot. Aim for a **single warm key direction**.

### 4.1 Match the planned setup

See `docs/s3-shoot-plan.md` § 7 for the lighting diagram. Single warm key (window or 3000K lamp) at camera-left 45°, white bounce camera-right, optional warm rim behind the bag.

### 4.2 Hold the color temperature throughout the session

- Close other-room doors, draw blinds in unrelated windows, turn off cool overhead LEDs.
- Mix only daylight with daylight, or only tungsten with tungsten — never both.
- If clouds drift across the window during golden hour, **stop and wait**. Don't compensate by raising ISO mid-session — different takes will grade differently.

### 4.3 Re-check WB if you change rooms or time of day

Window light at 17:00 is ~3000K; at 19:00 it drifts toward 2400K. If you reshoot after a long break, the manual WB needs re-checking. A physical white reference (paper) shot for ~2s at the start of each session anchors the colorist.

### 4.4 Keep highlights off the bag fabric

Watch the live preview for hot spots / specular highlights on the bag's nylon. SDR Rec.709 (the A52's only video colour space) clips highlights aggressively. Rotate the bag 5–15° until reflections soften, or move the bounce panel back 30 cm.

---

## 5. Movement and Focus Stability Tips

The A52 has OIS, but OIS doesn't fix the things that actually break this shot. Most movement issues come from the tripod, the floor, or the operator — not the phone.

### 5.1 Tripod and clamp

- Tighten the phone clamp until the screen does not rotate when you press the record button. Tap the screen lightly and watch for any drift.
- Center the phone in the clamp side-to-side — off-center mounts wobble.
- If the tripod has a rubber-tipped center column, extend it last and minimally. Most flex lives there.

### 5.2 Floor and footing

- Hardwood / laminate floors transmit footsteps to the tripod. Stand still during the take or move to a softer surface (rug, exercise mat).
- Don't lean on the bench the bag is sitting on. Any pressure on the bench transfers to the bag, which transfers to the bag opening — and the focus point shifts.

### 5.3 Focus stability

- Manual focus only (§ 3.5). Tracking AF is OFF (§ 2.3).
- The bag opening should be the **front** edge of the bag from camera POV. Focus on that edge.
- The headband's apex position will be in front of (closer to camera than) the actor's torso. With f/1.8 + ~50 cm subject distance, depth of field is ~5–10 cm. The headband will be sharp; the actor's face will be soft. **That is correct** — the hero is the headband.

### 5.4 OIS — when on, when off

- **Hero locked-off takes (§ 4 Shot A):** OIS **ON**, Super Steady **OFF**. OIS quietly cancels micro-vibration from your finger pressing record without crop.
- **Handheld B-roll (Shot B push-in or any handheld variant):** OIS **ON**, Super Steady **OFF**. Super Steady switches the lens to ultra-wide and crops aggressively — never use it for hero footage.
- **Slow-mo at 1080p / 60fps:** OIS **ON**.

### 5.5 Bluetooth shutter remote (recommended)

When you're the actor *and* the operator, do not touch the phone's record button — your finger will jolt the tripod by ~2 mm and you'll lose the first 0.5s of every take.

1. Pair a generic Bluetooth shutter (any `AB Shutter 3` clone works) under **Settings → Connections → Bluetooth**.
2. The Samsung Camera app responds to its volume-key emulation as a record toggle.
3. Set it next to you on the bench. Press once to start, once to stop.

---

## 6. Common Issues and Fixes

| Symptom | Cause | Fix |
|---|---|---|
| Brightness pops mid-take | AE re-engaged (you tapped the screen) or ISO/shutter slipped to Auto | Re-set ISO and shutter explicitly. Do not tap the live viewfinder area between takes. |
| Color shifts cool when headband emerges | WB went back to AWB | Tap WB → drag back to 3000K → confirm "K" reading in the slider. |
| Headband goes soft at apex | Focus drifted (you tapped to focus, or MF slider was bumped) | Re-rack MF on the bag opening; use pinch-to-zoom on the live preview to verify sharpness. Don't tap the screen during prep. |
| Take looks grainy in shadow areas of the bag | ISO too high (>200) | Add light, drop ISO to 50. If you can't add light, accept some grain — denoise in post. |
| Take cuts to ultra-wide / image looks cropped | Video stabilisation auto-engaged | Disable: *Settings → Videos → Video stabilisation → OFF*. |
| Phone gets warm, recording stutters | Thermal throttling on extended UHD recording | Stop, let it cool 10 min. Drop to FHD 60 if persistent. |
| Reflection/glare on the bag | Too direct a key light | Diffuse the window with sheer linen / baking paper. Rotate the bag 10°. |
| Apex looks fast in the cut | 30fps doesn't slow well in post | Capture the slow-mo pass at FHD 60 — conform to 24p in editor for ~2.5× slow motion. |

---

## 7. End-of-Session Checklist

Before tearing down the set:

- [ ] Review at least one full take of each shot on the laptop — phone screen lies about exposure.
- [ ] Confirm the chosen hero takes have stable focus, exposure, and color across the whole clip.
- [ ] Back up footage: copy the entire `DCIM/Camera/` folder to laptop AND a cloud backup before powering off the phone.
- [ ] Note the chosen hero take filenames in `S3_shoot_notes.md` (per § 12 of the shoot plan).
- [ ] Reset the phone: turn off Airplane mode, return WB / focus / Pro Video to your normal preferences if you use the phone for personal photos.

---

## 8. Quick-Reference Card (print this part)

```
PRO VIDEO — HERO TAKES
  Lens:          1× main wide
  Resolution:    UHD 30   (4K @ 30fps, SDR — A52 does not record HDR10+)
  ISO:           50  (raise to 100 only if dark)
  Shutter:       1/60 s
  EV:            0.0
  WB:            3000 K   (manual, NOT auto)
  Focus:         MF       (locked on bag opening edge)
  Mic:           muted (level 0)
  Stabilisation: OFF (Settings → Videos → Video stabilisation)

PRO VIDEO — SLOW-MO APEX PASS
  Lens:          1× main wide
  Resolution:    FHD 60   (1080p @ 60fps, SDR)
  ISO:           50
  Shutter:       1/120 s
  WB:            3000 K
  Focus:         MF (same as above)
  Mic:           muted
  Stabilisation: OFF

DO NOT:
  - tap the live viewfinder during/between takes (re-engages AF/AE)
  - use 0.5× ultra-wide or 2× digital
  - leave WB on AWB
  - turn Video Stabilisation ON for hero takes (it crops)
```

---

**Reference docs:**
- Shoot plan: `docs/s3-shoot-plan.md`
- Failure modes the in-house shoot is designed to avoid: `docs/s3-clip-analysis.md`
- Brand visual targets: `docs/body-mounted-product-prompts.md`, `docs/color-schemes.md`

**Prepared by:** Producer (solo founder)
**Date:** 2026-05-01
**Status:** Draft — for shoot-day use, revise after first session if any settings prove wrong
