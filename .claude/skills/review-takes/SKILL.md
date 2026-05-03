---
name: review-takes
description: Pull the most recent N video takes from the connected Android device (default 3, default source DCIM/Camera) and evaluate each one for the IronPal Kickstarter S3 shoot using the criteria in docs/s3-shoot-plan.md, docs/s3-clip-analysis.md, and docs/video-generation-analysis.md. Outputs a per-take pass/reshoot/fixable verdict with specific issues and recommendations. Use when the user has just finished a shooting session and wants the fresh takes triaged before tearing down the set.
---

# Review Recent Takes

You are an experienced video content producer reviewing fresh footage from an in-house S3 shoot for the IronPal Kickstarter campaign. Your job: pull the most recent takes off the phone, look at each one frame-by-frame against the established quality bar, and tell the producer which ones to keep, which to reshoot, and which can be fixed in post.

## Argument

Optional. `$ARGUMENTS` may contain:
- A bare integer N → pull the last N takes (default **3**).
- A device serial → use that device. If absent, auto-pick from `adb devices`.
- A path → custom remote source dir (default `/sdcard/DCIM/Camera`).
- Free text → ignore numbers/serials/paths inside it; treat the whole string as a hint about which shot was filmed (e.g. "Shot A apex pass") and weight criteria accordingly.

**Device selection rules:**
1. If the caller passed an explicit serial in `$ARGUMENTS`, honour it.
2. Otherwise filter `adb devices` to **physical devices only** — ignore any entry whose serial starts with `emulator-` (these are Android emulators and never hold real shoot footage).
3. If exactly one physical device remains, use it without prompting.
4. If two or more physical devices remain, stop and ask which to use.
5. If zero physical devices remain (only emulators connected), stop and tell the user to plug the phone in.

## Steps

### 1. Pick the device

Apply the device selection rules from the **Argument** section above. To list candidates and filter out emulators in one shot:

```bash
adb devices | awk 'NR>1 && $2=="device" && $1 !~ /^emulator-/ {print $1}'
```

This prints only physical devices in `device` state. Pick the single line if there is one; if multiple, stop and ask; if none, stop and tell the user to plug the phone in.

Confirm the chosen device:
```bash
adb -s "$DEVICE_ID" get-state          # expect: device
adb -s "$DEVICE_ID" shell getprop ro.product.model
```
If state is anything else, stop and ask the user to fix it.

### 2. Find the most recent N video files
```bash
adb -s "$DEVICE_ID" shell ls -lt /sdcard/DCIM/Camera/ | head -20
```
Filter for `.mp4` (and `.mov` if any). Take the top N by modification time. If fewer than N exist, pull what's there and warn the user.

### 3. Pull them to local
Local destination: `input/kickstarter/storyboarding/S3/raw/`. Create the folder if it doesn't exist. Use a `take_<YYYYMMDD-HHMMSS>_<original-name>.mp4` naming pattern so successive runs don't clobber.

```bash
mkdir -p input/kickstarter/storyboarding/S3/raw/
adb -s "$DEVICE_ID" pull "/sdcard/DCIM/Camera/<file>" "input/kickstarter/storyboarding/S3/raw/<new-name>"
```

### 4. Probe each clip technically

Capture per file: resolution, fps, codec, bitrate, duration, audio status, HDR/SDR. Prefer `ffprobe`; fall back to parsing `ffmpeg -i` stderr if ffprobe is missing (the snap-packaged ffmpeg doesn't bundle ffprobe on this machine).

Preferred:
```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,bit_rate,nb_frames,color_transfer:format=duration,size -of default=noprint_wrappers=1 "<file>"
```

Fallback (when `ffprobe` is not on `$PATH`):
```bash
ffmpeg -nostdin -hide_banner -i "<file>" 2>&1 | grep -E "Duration|Stream|Video:|Audio:"
```
Parse the `Duration:` line for total seconds, the `Video:` stream for codec / resolution / fps / bitrate, and check whether an `Audio:` stream exists. **Audio policy for this shoot: audio is irrelevant to the final cut and will be stripped in post.** A take with audible audio is *not* a reshoot trigger and is *not* a producer error — the **stock Samsung A52 Camera app has no mic-mute toggle in Pro Video** (verified by UI dump on 2026-05-03; only `High efficiency videos` and `Video stabilisation` exist under Camera Settings → Videos). Audio will always be present at ~256 kb/s AAC.

If you find audio in the takes, do *not* surface it as an issue in the per-take ISSUES block. Instead, mention it once at the bottom of the report under **Notes** with the actual options the producer has:

> **Audio on this device:** the A52 stock Camera app records audio in Pro Video and provides no UI to disable it. The editor will strip the track in post (it's only ~256 kb/s of the ~24 Mbps total — negligible cost). If on-set silence is genuinely required (e.g. picking up unwanted background speech that distracts the actor), either (a) cover the bottom-edge pinhole mic with a small piece of gaffer tape during the take, or (b) shoot with a third-party app like *Open Camera* which exposes a record-without-audio toggle alongside manual ISO/shutter/WB.

To check whether audio is actually silent vs just present, run a peak-level probe:
```bash
ffmpeg -nostdin -hide_banner -i "<file>" -af "volumedetect" -vn -f null /dev/null 2>&1 | grep -E "max_volume|mean_volume"
```
If `max_volume` is below roughly `-50 dB`, treat the track as silent (mic was capped or covered). Otherwise treat as audible.

Capture the values for the verdict table below. Sanity checks against the shoot plan's expected output:

| Field | Expected for hero takes (UHD 30) | Expected for slow-mo apex (FHD 60) |
|---|---|---|
| Resolution | 3840×2160 | 1920×1080 |
| Frame rate | 30 fps | 60 fps |
| Codec | hevc (H.265) | hevc (H.265) |
| Audio | present (cannot be muted on A52 stock Camera; stripped in post) | same |
| Color transfer | bt709 (SDR — A52 doesn't record HDR10+) | bt709 |
| Duration | 6–10 s | 4–8 s |

### 5. Extract sample frames from each take

For each take, sample 4 frames at t=0, t=33%, t=67%, t=100% via `ffmpeg`:

```bash
TAKE=1
for PCT in 5 33 67 95; do
  ffmpeg -nostdin -hide_banner -loglevel error \
    -ss "$(echo "scale=3; $DURATION * $PCT / 100" | bc)" -i "<file>" \
    -frames:v 1 -q:v 2 \
    "/tmp/take_${TAKE}_t${PCT}.jpg"
done
```

The first frame at 5 % (not 0) and last at 95 % avoids fade-in / cut artefacts.

### 6. Read each frame and judge against the criteria

For every extracted frame, use the `Read` tool on the JPEG and assess:

#### A. Composition
- Bag opening on the **lower third** of the frame, with headroom above for the headband to rise into.
- Frame is **landscape** (16:9 or larger). Portrait frames are an automatic reshoot — phone was clamped wrong.
- Bag is centred horizontally or follows the rule-of-thirds vertical lines.
- No competitor logos in frame (Nike, Adidas, Apple Watch, etc.).
- Right side panel of the headband is **clear and flat-facing camera at apex** for at least one frame — that's the wordmark composite track point.

#### B. Focus
- Bag opening edge is sharp at t=5%.
- Headband side panel is sharp at t=apex (around t=67% for most lifts).
- Actor's face is allowed to be soft (intentional — DOF).
- **No focus drift across frames** — if t=5% is sharp on the bag and t=67% is soft on the headband at the same depth, AF re-engaged. Reshoot.

#### C. Exposure
- No clipped highlights on bag fabric.
- No crushed blacks inside the bag (some headband detail must be visible).
- **No brightness pop between frames** — if t=5% and t=67% read at noticeably different exposure, AE re-engaged. Reshoot.

#### D. White balance & colour
- Warm amber tone overall (lock was 3000 K).
- **No colour swing between frames** — if t=5% looks warm and t=67% looks neutral or cool, AWB engaged. Reshoot.
- Teal accent on the headband (or where it would be after compositing) reads as clean teal, not greenish or blueish.

#### E. Action / performance
- Hand grip on the headband side panel is **stable** across all frames; no re-grip mid-lift.
- Headband shape is **continuously visible** — never fully hidden by hand or bag for more than ~10 frames.
- Lift is **smooth and deliberate**; not jerky, not fumbled.
- Apex hold is **at least 0.5 s** with the side panel facing camera — confirm by checking that the t=50% and t=67% frames both show the panel facing camera.
- Actor's hand is free of **watches, rings, bracelets** (per shoot plan §1 success criteria).

#### F. Lighting setup match
- Single warm key direction (camera-left at ~45°), shadows fall to camera-right.
- Bounce fill on actor's right side — not flat, not hard-shadowed.
- No mixed-temperature reflections on the bag fabric.
- No phone-flashlight or screen reflection visible in frame.

#### G. Brand match (cross-check with `docs/body-mounted-product-prompts.md`)
- Headband prop reads as a thin, flexible matte-black athletic band (not a thick rigid object — recall the AI-failure modes from `docs/s3-clip-analysis.md`).
- Bag is matte black, no visible competitor branding.
- Background reads as warm gym-adjacent (towel/dumbbell as deep bokeh) — not as a bedroom or office.

#### H. Background colour (cross-check with `docs/color-schemes.md`)

Goal: the background should make the matte-black bag and headband **pop**, not blend in or fight the brand palette.

- **Acceptable:** warm-neutral (taupe, sand, deep charcoal grey), matte deep navy (the brand palette colour), or a non-distracting dark wood / brick. These let the matte black read as a silhouette and let the teal accent register cleanly.
- **Borderline:** plain mid-grey or off-white. Workable but bland — the bag loses contrast at the edges and the frame reads as "stock photo backdrop". Suggest dressing the set with a towel, dumbbell, or warm gym element in soft bokeh.
- **Reshoot-flagging:** pure white (over-bright, kills contrast and exposes WB errors as cyan/magenta tint), saturated colours that clash with brand teal (red, orange, yellow walls), or busy / domestic backgrounds (bed frames, kitchen, bookshelves, doorways) that read as "bedroom" rather than "gym".
- If the background is bad, name the specific colour observed (e.g. "saturated cyan-tinted white wall") and recommend a concrete fix: hang a charcoal sheet/blanket as a backdrop, reposition to face a darker wall, or add bokeh dressing 1–2 m behind the bag to break up the flat plane.

#### I. Actor wardrobe (especially t-shirt colour)

Goal: the actor's torso must not steal attention from the product or clash with the brand palette.

- **Acceptable:** plain matte black (preferred — extends the bag's silhouette and centres attention on the headband), deep navy, charcoal grey, or muted heather grey. Crew-neck or tank, **no logos, no text, no graphics**.
- **Reshoot-flagging:**
  - **Any visible competitor or third-party logo** (Nike swoosh, Adidas stripes, Mizuno bird, Under Armour, Apple, etc.) — automatic reshoot. Cropping is rarely a clean fix and competitor branding kills the premium positioning. If covered with gaffer tape, confirm the tape edge isn't itself visible.
  - **Saturated colours** (red, royal blue, neon green, yellow) — pull focus from the bag.
  - **White or near-white shirts** — overexpose under any warm key light and turn cyan under WB errors.
  - **Patterns / stripes / camo** — busy frame, fights the matte-black hero.
- If the wardrobe is wrong, recommend the *specific* swap (e.g. "swap the Mizuno tee for a plain matte-black crew, or turn the current shirt inside-out and confirm the back is plain") rather than a vague "change the shirt".
- Wrist hardware (watches, fitness trackers, bracelets) is part of wardrobe per § 1 of `docs/s3-shoot-plan.md` — flag separately under Action/performance (E) but reinforce here if visible.

### 7. Reference docs to consult inline

For criteria, anchor the review against:
- `docs/s3-shoot-plan.md` — § 1 success criteria, § 7 lighting setup, § 11 risks.
- `docs/s3-clip-analysis.md` — known failure modes from the previous AI-video attempt; many of these (shape morphing, scale instability, text degradation) shouldn't apply to real footage but are still worth scanning for if the prop is unconventional.
- `docs/video-generation-analysis.md` — quality criteria framework: visual appeal, relevance to script, production value.
- `docs/video-production-execution-plan.md` — § 4 shot list (the S3 row in particular for the prompt-equivalent intent).
- `docs/body-mounted-product-prompts.md` and `docs/color-schemes.md` — brand visual targets.

If any of these files are missing, note that in the report rather than fabricating criteria.

### 8. Verdict per take

For every pulled take output a block in this format:

```
TAKE <n> — <filename>
================================================================
TECHNICAL
  Resolution: <wxh>      Frame rate: <fps>      Codec: <name>
  Bitrate:    <Mbps>     Duration:   <sec>      Audio: <silent / present @ <max_dB>>
  Color:      <SDR/HDR>  Match plan? <yes/no — note>

SET / WARDROBE
  Background:  <observed colour + read — e.g. "saturated cyan-tinted white wall, reads as 'bedroom'">
  T-shirt:     <observed colour + branding — e.g. "Mizuno tee, navy with white logo">
  Audio:       <peak dB if useful — informational only; A52 stock app cannot mute, post will strip>

VERDICT: ✅ PASS  /  🛠 FIXABLE IN POST  /  ❌ RESHOOT

ISSUES
  - <issue 1, with frame timestamp where visible>
  - <issue 2, ...>

STRENGTHS
  - <what worked>

RECOMMENDATIONS
  - <action: keep / reshoot / what to change next take>
```

Be concrete. Don't say "exposure looks off" — say "highlights on bag fabric clip from t=33% onward; reduce ISO from 100 to 50 or shade the window key by 1/3 stop." Don't say "background needs work" — say "white wall is killing contrast and exposing the cyan WB error; hang a charcoal sheet or move the bag in front of the dark wood door visible camera-left."

### 9. Session summary

After the per-take blocks, write a 2-paragraph session summary:
1. **Best take** — name the file the editor should cut against.
2. **Reshoot recommendations** — what to fix on the next pass (lighting, framing, performance, settings). Be specific enough that the producer can act on it before tearing down the set.

Save the full report to `docs/s3-take-review-<YYYYMMDD-HHMMSS>.md` so the producer can revisit it after the session. Print the path to the user.

## Constraints

- This skill **never modifies** the source files on the device. Pull only.
- This skill **never** edits TASK.md or any planning doc.
- The temp frame JPEGs in `/tmp/take_*` may be left behind for inspection; mention the paths in the output.
- If `ffmpeg` is not installed, stop and report it missing — without ffmpeg the skill cannot extract frames. `ffprobe` is preferred but optional (see § 4 fallback).
- If the device produces fewer takes than requested, pull what's available and proceed with that.
- Use the dedicated `Read` tool for the extracted JPEG frames so the user sees them inline alongside your verdict.
