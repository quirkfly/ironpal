# One-arm curl — tracking overlay · design plan

**Written 2026-10-09.** Markers and dynamic tracking points on the synthetic fisheye gym clip
`Man_lifting_dumbbell_in_gym_20261009173801.mp4`, made from the prompt in
[`fisheye_gym_clip_prompt.md`](fisheye_gym_clip_prompt.md). The overlay shows the exercise, the rep
count in sync with the arm, and the weight, tracked on the dumbbell, in the landing page's squat
overlay style. Grilled in auto mode; ledger:
[`curl_tracking_overlay_plan_grilled.md`](curl_tracking_overlay_plan_grilled.md).

## 1. The clip, measured

| | |
|---|---|
| file | 1280×720, 24 fps, 8.0 s (192 frames), AAC audio |
| picture | the ELP-style circular fisheye, nearly as wide as the frame (x ≈ 115–1165) and clipped top and bottom — **the side margins are only ~115 px**, too narrow for a HUD (§4) |
| orientation | forehead mount, inverted: the forearms and hands come in from the **top** of the circle |
| subject | the **right** hand (frame-left) grips one plate-loaded dumbbell; the **left** hand (frame-right, black watch) rests near the top edge |
| reps | **three**, top of each curl at **#42 (1.75 s), #77 (3.2 s), #111 (4.6 s)**; at rest from #0 and again from about #125 to the end |
| what the lift looks like | the dumbbell swings **toward the lens**: the near plate grows from ~95×130 px to ~150×235 px and blurs, the far plate rises and grows; the fist barely travels (±30 px) |

## 2. What the overlay has to say, and on what evidence

| requirement | shown as | evidence it is drawn from |
|---|---|---|
| exercise: one-arm biceps curl | the HUD's Exercise field, focused: **One-Arm Biceps Curl** | stated, as the landing page's squat screen states *Barbell Back Squat* |
| reps, synced to the arm | the HUD's **Reps** number, a lift-progress ring on the fist, and a pulse plus a **REP n** tag at the moment of each count | **measured** lift progress `p(t)` (§3); the count rises when `p` crosses **0.85 on the way up**: measured counts at **#40, #75, #109**, each **2 frames before** the visual top (#42, #77, #111), so the number arrives with the arm |
| weight tracked in real time | rings on both plate stacks, a line along the bar through the fist, per-part tags **5 kg + 3.5 kg** on each stack and **BAR 1 kg** on the handle, the HUD's **Weight 18 kg** with the breakdown | the plate rings and hubs **track** the dumbbell frame by frame (§3); **the kilograms are given, not read**: 2 × 5 + 2 × 3.5 + 1 = **18 kg** |

## 3. Tracking — how each point follows the movement

No pose model or contrib tracker is installed, and the clip has two properties that make simple
measurement reliable. The fist is the only skin in the left half of the circle, and the dumbbell's
motion is one degree of freedom: how far up the curl it is.

1. **Fist, per frame, measured.** YCrCb skin mask → largest blob with its centroid in the left
   half → the centroid of its **lowest 35 %** (the fist, not the forearm entering from the top).
   No drift, because it is re-detected every frame.
2. **Lift progress `p(t)` ∈ [0, 1], per frame.** The arm-and-fist skin area grows as the hand comes
   toward the lens: ~32.5k px at rest, 48.6k / 36.6k / 35.5k at the three tops. Each rep's **start and
   end** are measured from it (where it leaves and rejoins rest, at 20 % of the rep's own excursion);
   each rep's **top** is the frame-read keyframe, not the area peak. In rep 3 the near plate hides
   part of the forearm and the area peaks ~5 frames late (#116 against the visual #111), so it is
   not trusted for timing, and it shows no rise before the top. That rep's rise uses the 10-frame
   length reps 1–2 measured, which matches the frame grid (#101 → #111). `p` is a raised cosine
   from start to top and from top to end. Measured windows: **(32, 42, 51), (68, 77, 86),
   (101, 111, 126)**.
3. **Plate geometry, keyframed from the frames, driven by `p`.** Near and far plate centres, ellipse
   radii and the two bar hubs were read off a coordinate grid at rest (#0) and at each rep's top
   (#42, #77, #111). Per frame, each value is `rest + p · (top_rep − rest)`, expressed as an offset
   from the **measured fist**, so the rings move with the hand between keyframes and grow with the
   lift.
4. **Rep events.** Up-crossings of `p = 0.85`, with hysteresis (re-armed below 0.35), so blur
   noise cannot double-count.

**Validation, before compositing:** render the markers over the frames at #0, #42, #77, #111 and the
mid-lift frames, and check the rings sit on the plates; check the count changes within ±2 frames
of each visual top.

## 4. Look — the landing page's squat overlay, ported

From `web/src/components/FormTracking.astro` and `web/src/styles/tokens.css`:

| token | value | used for |
|---|---|---|
| accent | `#00E5CC` | every line, ring, dot and the focused text |
| `m-line` | 3 px solid accent | the bar axis |
| `m-dash` | 2.5 px accent, dash 9/8, 80 % | plate rings |
| `m-arc` | 3 px accent, fill `rgba(0,229,204,.14)` | the lift-progress ring on the fist |
| `m-dot` | solid accent | the fist and the two hubs |
| `m-tag` | Montserrat 600, Ice White `#F0F4F8`, +.06em | weight tags, **REP n** |
| `m-tag small` | Slate Gray `#9aa0b4`, +.14em, uppercase | captions (BAR, HUB) |
| HUD | the K7 *Live set* screen language: `IRONPAL` ring glyph, `● live`, uppercase 10 px field labels, focused field in accent, 800-weight big number | the right-hand panel |

**Placement: a 1920×1080 canvas, not the clip's margins.** The fisheye circle fills almost the whole
clip width, so the clip is scaled to **1600×900 at (0, 90)** on a 1920×1080 canvas — the film's
format — leaving a free **right column (x 1500–1880) for the HUD**, which never covers the picture,
and a left strip for the vertical **lift gauge** that fills with `p`. Labels inside
the circle sit beside the parts they name, not on them, with a short leader line where needed.

## 5. Honesty, built in

The footage is generated and the recognition is a concept. A viewer will read the overlay as the
product working, so:

- **"PRODUCT INTERFACE CONCEPT · SIMULATED FOOTAGE"** sits in the left margin on every frame, as the
  landing page labels every app mock.
- The weights are typed in, not recognised. Claim 8 says weight-reading is the hard problem being
  built, so nothing in the overlay animates a weight *being read*: the 18 kg is present from the
  first frame, like the static weight in K7's inset.

## 6. Build

| step | tool | output |
|---|---|---|
| measure | `scripts/curl_overlay/track.py` (OpenCV) | `tracks.json`: per-frame fist, `p`, plate geometry, rep events |
| draw | `scripts/curl_overlay/overlay.html` (SVG, Montserrat from the site's fontsource files), rendered frame by frame by `render.py` with Playwright on a transparent page | 192 RGBA PNGs |
| composite | ffmpeg: clip scaled to 1600×900, padded to 1920×1080, overlay on top; the clip's audio dropped (it is generated room tone) | **`input/kickstarter/fisheye/curl_tracked.mp4`, 1920×1080, 24 fps, 8.0 s — BUILT 2026-10-09** |
| check | contact sheet at the four keyframes and at each count change | §3 validation |
