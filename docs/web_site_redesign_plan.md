# ironpal.co redesign — the hero master video, and a page with only Peter in it

**Written 2026-09-30. Grilled in auto mode the same day — ledger:
[`web_site_redesign_plan_grilled.md`](web_site_redesign_plan_grilled.md); 26 decisions, 13 on
evidence, 2 open. IMPLEMENTED the same day — built `dist/` verified by screenshot; measured
results are in §2.1, §2.4 and §2.6.** Three silent clips in `geggen/products/ironpal/clips/web/` become a looping
hero video behind the copy, in the layout `../gitnfit` uses; K7 and K8 carry the same interactive
app screens they carry in the film; every other image on the page becomes a picture of Peter; and a
new section shows form tracking. Companion to the film documents this borrows from:
[`K7_design_plan.md`](K7_design_plan.md), the K8 plan in `geggen/…/clips/K8_design_plan.md`, and
[`IRONPAL_PROMO_VIDEO_SCRIPT_V1.md`](IRONPAL_PROMO_VIDEO_SCRIPT_V1.md) §5.13–5.18.

---

## 1. Inputs, measured

### 1.1 The three web clips are not the film's clips

| clip | what it is | subject columns (of 1920) | free space | mean Y |
|---|---|---|---|---|
| `web/K5.mp4` | the **silent reveal** — Peter at the bench, lifts the band out of the bag, holds it to the lens by 6 s | 676–1216 | 676 L · 704 R | 35.5 |
| `web/K7.mp4` | the **silent two-arm curl**, full length, left of centre | 384–788 | 384 L · **1132 R** | 22.0 |
| `web/K8.mp4` | the **silent barbell back squat**, in profile facing frame-left, right of centre | 928–1204 | **928 L** · 716 R | 25.8 |

All three: 1920×1080, 24 fps, 8.00 s, an AAC track that is effectively silent (peaks −45 to −31
dBFS). **They are different renders from the ones the master composited** — K5 differs from the
film's K5 by 20.7 mean-pixel, K8 by 9.6, where two copies of one render score 0.1. So nothing
derived from a picture transfers: not the inset geometry, not K7's rep timings, not K8's depth
signal. **All of it is re-measured here**, which is the K8 plan's own rule after the Nike re-take.

### 1.2 The reference layout (`../gitnfit`)

`gitnfit-landing-page/src/components/Hero.astro`: a full-bleed `<video autoplay muted loop
playsinline preload="metadata">` positioned behind the hero, `object-fit: cover`, dimmed with
`filter: saturate(.85) brightness(.55)`, a gradient overlay on top, the copy and CTAs in the left
column, a metric strip bottom-right. The video is `public/video/promo.mp4` — **1920×1080, 43.6 s,
3.0 MB**, i.e. about 550 kbps. Poster on top; the whole thing is decoration for the copy.

IronPal's current `Hero.astro` already has the same bones with a still: `hero-bench.jpg` behind a
left-weighted scrim (`linear-gradient(90deg, .96 → .78 at 38% → .25 at 70% → .55)`), copy left, a
floating HUD card right. The redesign swaps the still for the video and keeps the grid.

### 1.3 Not one image on the site is Peter

| file | used by | who is in it |
|---|---|---|
| `hero-bench.jpg` | Hero background | another athlete, bench press |
| `worn-headband-male.jpg` | Gallery | the same athlete |
| `worn-headband.jpg` | Gallery | a woman |
| `wide-athlete.jpg` | Gallery | a third man, phone and towel |
| `cta-bg.jpg` | FinalCTA background | the woman, squatting |
| `pov-weightstack.jpg` | AppModules "weight" tile | a weight stack and a hand (nobody) |
| `headband-hero.jpg` | ProductSpotlight, VideoReveal poster | the product alone |
| `og.jpg` | share card | unverified — treat as not Peter |
| `reveal.mp4` | VideoReveal | hands only, the wrong gym |

The founder's own reference photographs (`geggen/products/ironpal/reference/`) are two outdoor
selfies in a winter hat and a race cap, and a 466 px B&W portrait upscaled ×4. None fits the
page's look. **The source of Peter is the film**: every clip K1–K9 is the minted character, in the
gym, in the wardrobe, and a frame of it is a still. §3 picks them.

### 1.4 What already exists to build with

- `scripts/k7/make_inset.sh` — Chrome renders an HTML screen frame-by-frame against a frozen
  clock; `PAGE=` and `QUERY=` select the screen and its data. Proven on K7 and K8.
- `scripts/k7/live_set.html` — the "Live set" screen (exercise, reps, weight, sparkline, log),
  driven by `?exercise=&weight=&dur=&reps=t1,t2,…&start=&done=&setno=`.
- `scripts/k8/squat_screen.html` + `make_k8_inset.sh` — the form screen: a side-view figure with
  depth / back-angle / knee markers drawn in geometry, driven by a per-frame depth signal.
- `scripts/k7/compose_inset.sh CLIP INSET OUT W X Y IN_AT` — the overlay with fades.
- `input/kickstarter/k8/k8_figure.png` + `k8_anchors.json` — the chosen Leonardo figure and its
  joint anchors. **These do transfer**: the figure is a separate still, not the clip.
- The site builds clean today (`npm run build`, 786 ms).

---

## 2. The hero master video

### 2.1 Structure

**K5 → K7 → K8, 23.0 s, silent, looping, with 0.5 s dissolves.** The film's own escalation — the
product, then the interface counting, then the interface judging form.

**The cuts are dissolved, not hard, because they were measured.** Frame difference at each cut:
K5→K7 **25.6**, K7→K8 **15.8**, K8→K5 **26.4** mean-pixel — against ~1 between consecutive frames
inside a clip, and 33 for the K6 tail-to-mat cut that had to be trimmed out of the film. A
background loop is glanced at, not watched, and jumps that size read as a glitching player. So:
0.5 s dissolves between beats, and **the loop seam is dissolved too** — the file ends with a 0.5 s
dissolve from K8's tail into **K5's frame 0, held for 0.5 s**, so the file ends on exactly the frame
the loop restarts from. Runtime 8 + 8 + 8 − 3 × 0.5 + 0.5 = 23.0 s (built: 23.08 s, 554 frames).

**Measured on the built master:** last frame vs first frame **0.18** mean-pixel (an identical render
scores ~0.1 — the seam is invisible), and the largest frame-to-frame jump anywhere in the file is
**4.8**, at the K5→K7 dissolve, against the 16–26 of the hard cuts it replaced.

No K1–K4, K6 or K9: they are spoken clips, and a man visibly talking with no sound in a muted
background loop reads as broken video. The three silent clips were generated for exactly this.

Duration is under the reference's 43.6 s. That is fine — the gitnfit loop is long because it is
seven promos; this is one product in three beats, and a shorter loop repeats its strongest frame
(the band held to the lens) more often.

### 2.2 K7 composite, re-measured for this render

The film's `K7_composed.mp4` was built from a different take. For `web/K7.mp4`:

| | |
|---|---|
| inset | `live_set.html` → `input/kickstarter/web/k7_web_inset.mp4`, 620×1000 |
| screen data | `exercise=Dumbbell Biceps Curl` · `weight=5` (the film's value, founder-set) · `setno=3` · `done=2` · `dur=8` |
| rep timings | **measured from this take**: curl tops at **0.96 · 2.58 · 4.38 s** by tracking the vertical centroid of the arm region; a fourth is expected near 6.2 s and is confirmed at implementation, where the whole signal is re-run at full resolution |
| placement | subject ends at **788 px**; free right margin 1132. Inset **560 wide at x = 1300, y = 60** — ends at 1860, clear of him by 512 px |
| in / out | in at 0.0 s (he is mid-set on frame one), fade 0.3 s; held to the end |

### 2.3 K8 composite — the inset moves to the RIGHT for the web

The K8 film plan put the inset **left**, because he faces left and the left third is empty. **On the
web page the left is where the copy lives** (§2.5), so a left inset would sit under the scrim, behind
the headline. The measurement gives a way out: free right margin is **716 px**, and a 520-wide
inset at **x = 1340, y = 90** ends at 1860, clear of his back at 1204 by 136 px. Right it goes —
**both insets then occupy the same region of the loop**, which is calmer to watch and keeps the
copy column clean through all three beats.

The depth signal is **re-extracted from this take** by the K8 plan's method — rows 16–22 of a
192×108 grey downscale, normalised 0→1 — to `input/kickstarter/web/k8_web_depth.json`, and the
squat bottoms/tops re-read from it. Figure and anchors are unchanged.

### 2.4 A defect in BOTH silent exercise clips — a mirror-figure in the background

Both renders put **a second, smaller man in the background, back to camera, doing the same
exercise** — the model's reading of a gym mirror. The prompts said *"He is ALONE in the shot"*; it was
ignored twice.

- **K7:** behind Peter's right shoulder at x 780–1000 / y 235–440, beside a camera on a tripod.
  It sits entirely **above** the dumbbell rack, against the dark wall.
- **K8:** a smaller one at x 900–980 / y 225–355, immediately beside the **far end of the barbell**.

**What was done, and what it cost.** K7 is **masked** in the composite with a feathered
wall-coloured patch (sampled at (28, 21, 12) from the wall beside it; a first attempt sampled the lit
floor at (76, 53, 34) and ran the ellipse down over the rack, which painted a brown blob *more* visible
than the ghost — the corrected patch stays off the rack). Checked at full resolution: a faint shadow on
the wall remains where the figure was; at the hero's 70 % brightness it does not read. **K8 is not
masked in the video** — the figure overlaps the bar's far end through the squat and a patch there
would eat the bar. It is painted out of the **gallery still** (`peter-squat.jpg`), where the bar is
static and the patch could be checked by eye, and in the hero it sits at x ≈ 950 under the scrim's
mid-alpha.

**The fix is a re-roll of both silent clips — see §8.** The silent two-arm curl and the side-view
squat are the two prompts in this project that rendered correctly first time, so 20 credits buys two
clean plates; the mask and the paint are stopgaps so the page is not blocked on a render.

### 2.5 Treatment on the page

Adopt the gitnfit hero verbatim in structure: `<video>` full-bleed behind, gradient overlay, copy
left, CTA form, eyebrow. Three departures, each for a reason the reference did not have:

- **Dim less: `brightness(.7)`, not `.55`.** gitnfit's video has nothing to read in it. This one
  carries two app screens with numbers, and at 55 % the inset text goes to mud. 70 % keeps the
  copy legible under the left scrim and the insets readable on the right.
- **Keep the left-weighted scrim, drop the floating HUD card.** The current hero's HUD (a fake
  reps/weight ticker in the right column) would sit exactly where the K7/K8 insets now are, two
  UIs fighting. The video *is* the HUD.
- **Poster = the reveal frame** (`web/K5.mp4` at 6.5 s: band held to the lens), so reduced-motion
  users, slow connections and the first paint all get the product shot.
- **Phones keep the video, and lose the insets.** `object-fit: cover` on a portrait viewport crops
  the sides, and the insets live on the right. gitnfit keeps its video on phones (nothing in its
  CSS hides it), so this does too, with `object-position: 35% 50%` so K7's Peter (left of centre)
  and K5's (centred) stay in frame. **The right-hand insets are cropped out on narrow screens, and
  that is accepted**: the FormTracking section (§4) carries the live screen for those viewers, at
  phone scale and interactive, which is more than a cropped background could give them.

### 2.6 Encoding and delivery

| | |
|---|---|
| master | `geggen/products/ironpal/clips/web/hero_master.mp4` — 1920×1080, H.264 High, CRF 17, the archive |
| web file | `web/public/video/hero.mp4` — 1920×1080, H.264, **CRF 28, preset slow, `-movflags +faststart`, no audio track** — **built: 2.58 MB** for 23.08 s (CRF 26 gave 3.5 MB; the reference is 3 MB for 43 s) |
| first source | `hero.webm` (VP9, CRF 33) — **built: 2.65 MB**; the MP4 is the fallback |
| poster | `web/public/video/hero-poster.jpg`, 1920×1080 — **built: 72 KB** |
| attributes | `autoplay muted loop playsinline preload="metadata"` — the gitnfit set |
| reduced motion | `@media (prefers-reduced-motion: reduce)` hides the video; poster shows |

`dist/` is gitignored; `public/video/` is not, and a 3 MB binary in the repo is acceptable for a
site this size. `reveal.mp4` (4.1 MB) is removed with the section that used it.

---

## 3. The page: only Peter

### 3.1 The stills, from the film

Extracted at native 1920×1080 with ffmpeg, cropped per slot, saved as JPEG q 85 into
`web/public/assets/peter/`. Chosen from a 12-frame candidate sheet:

| still | source | why this frame |
|---|---|---|
| `peter-band-to-lens.jpg` | `web/K5.mp4` @ 6.5 s | band held up, looking into the lens, warm key — the hero poster and the spotlight |
| `peter-band-out.jpg` | `web/K5.mp4` @ 3.0 s | band clearing the bag — the reveal moment |
| `peter-walk-in.jpg` | `K1.mp4` @ 6.5 s | full length, walking in, bandless — the founder as himself |
| `peter-talking.jpg` | `K2.mp4` @ 3.0 s | mid-gesture, animated — the Founder section |
| `peter-typing.jpg` | `K3_composed.mp4` @ 4.0 s | thumbing a log into a phone, tracker inset — the Problem |
| `peter-curl.jpg` | `web/K7.mp4` @ 0.5 s | two-arm curl, full length — gallery (the background figure is cropped out at the right edge, since the crop is a portrait around him) |
| `peter-squat.jpg` | `web/K8.mp4` @ 2.0 s | profile squat, ring visible — form section and gallery |
| `peter-close.jpg` | `K9.mp4` @ 7.0 s | close, smiling, band on — the share card and the final CTA |
| `peter-walk-band.jpg` | `K9.mp4` @ 4.0 s | walking in with the band, gesturing — final CTA background |

`K6_trimmed.mp4` @ 2.0 s (hands splayed at face height) is the K6 defect frame and is not used.

### 3.2 Slot by slot

| component | today | after |
|---|---|---|
| **Hero** | `hero-bench.jpg` + HUD card | the video (§2), poster `peter-band-to-lens.jpg`, HUD card removed |
| **Problem** | text only | + `peter-typing.jpg` as the module image — the old way, shown by him |
| **AppModules** | `pov-weightstack.jpg` behind the weight tile | the same phone mocks, background image removed (it was a stranger's hand) |
| **VideoReveal** | `reveal.mp4`, hands only, wrong gym | **section removed** — the reveal is now the first beat of the hero |
| **ProductSpotlight** | `headband-hero.jpg` (product alone) | **kept as the product alone** (`headband-hero.jpg`) and **moved up to sit directly under Problem** — founder's instruction 2026-09-30: the page must show the headband itself. The one slot on the page that is not Peter, because it is the product |
| **Gallery** | three strangers | `peter-walk-in` · `peter-squat` · `peter-band-out` |
| **Founder** | text only | + `peter-talking.jpg`, a portrait beside the copy |
| **FinalCTA** | `cta-bg.jpg` (the woman) | `peter-walk-band.jpg` |
| **og.jpg** | unverified | `peter-close.jpg` cropped to 1200×630 |

Alt text names him — *"Peter, IronPal's founder, …"* — because the rule is not "a man": it is him.

### 3.3 What this does to the site's honesty

Nothing it did not already do. Every current image is an AI still; every replacement is an AI
render too — of the minted character built from the founder's photographs, the same imagery the
campaign film uses. The captions that said *"campaign footage"* stay true. **Claims are untouched**:
no new capability is asserted by a picture of Peter curling.

---

## 4. The form-tracking section — new

### 4.1 What it says, and what it may not

The K8 line put form analysis on screen — depth, back angle, knees — and the design plan for it
found that **the capability is not in the allowlist, not on the site, not in the POC, and the
headband cannot see the body**. The screen is a *"Product interface concept"*, and that label is
load-bearing.

The section therefore mirrors how the site already handles weight-reading, its other unshipped
headline: a confident module, and an honest hedge in the copy and the FAQ.

- **Kicker:** *Form*
- **Heading:** *It sees the rep. So it can judge the rep.*
- **Body:** *From a first-person view the same camera that counts your reps can watch how they
  look — squat depth, back angle, whether the knee tracks the foot. This is what the interface will
  show. Like reading the weight, it is being built rather than shipped: reps and exercise
  recognition come first.*
- **FAQ line, added:** *Does it correct my form?* — *Not yet. Form tracking is the next capability
  after reps and weight, and the screen you see is the interface concept for it.*

Not said, anywhere: "corrects", "coach", "trainer", a score, a verdict. The K8 clip's promise —
*that used to need a trainer* — is a film line, not site copy, and does not migrate.

### 4.2 What it shows — the actual screen, live

This is the one place the page gets a **genuinely interactive** UI screen rather than a video of
one. `scripts/k8/squat_screen.html` already renders the whole thing from a depth value; it becomes
an Astro component, `FormTracking.astro`, with the screen's markup and CSS inlined and its script
driven by **the real measured depth signal from the web K8** (§2.3) on a 24 fps timeline, looping,
paused when off-screen (`IntersectionObserver`, the same pattern the hero HUD used). **Behind it**,
`peter-squat.jpg` at 34 % opacity — the view the screen is reading. *(The first build put the still
beside the phone; at the media box's real width the sibling collapsed to ~80 px in the screenshot, so
it moved behind the phone, the pattern AppModules uses for its background image.)*

Two adjustments from the inset version:

- **Phone-shell scale.** The inset is 620×1000; on the page it sits in the same `.phone` shell
  AppModules uses (`clamp(238px, 26vw, 290px)`), so the type sizes come from AppModules' `scr__*`
  classes, not the inset's 19–32 px.
- **The figure is served as its own asset** (`web/public/assets/k8-figure.png`, the chosen
  Leonardo still with background removed) and the anchors are constants in the component.

**`prefers-reduced-motion`** stops the loop at the bottom-of-squat frame — the most informative one.

### 4.3 Where it sits

After **AppModules** (recognition · reps · weight) and before Stats — the fourth thing the
interface shows, in the order the film tells it. Section id `#form`; Nav gains no item (three
anchors is already the whole nav, and "The tech" reaches it by scrolling).

---

## 5. The page after

```
Nav
Hero            ← video: K5 → K7(inset) → K8(inset), copy left, poster = band to lens
Problem         ← + peter-typing
ProductSpotlight← the headband itself, "Meet IronPal" — moved here from below Gallery
AppModules      ← unchanged mocks, stranger's hand removed
FormTracking    ← NEW: live squat screen + peter-squat
Stats
CapabilityGrid
Gallery         ← band-out · curl · squat
HowItWorks
Compare
Founder         ← + peter-talking
Privacy
Pricing
FAQ             ← + "Does it correct my form?"
FinalCTA        ← peter-walk-band
Footer
```

`VideoReveal` is deleted. Everything else keeps its copy.

---

## 6. Implementation

Scripts live in `scripts/web/`; intermediates in `input/kickstarter/web/`; the page assets in
`web/public/{video,assets/peter}`.

1. **`scripts/web/measure.py`** — for K7: the curl-top times at full resolution; for K8: the depth
   signal and bottoms/tops; for all three: subject columns. Writes `k7_web_reps.json`,
   `k8_web_depth.json`, `layout.json`. Everything downstream reads these — no hand-typed geometry.
2. **`scripts/web/make_insets.sh`** — `make_inset.sh` twice: K7's screen with the measured reps at
   5 kg, K8's with the measured depth and the existing figure/anchors. Both 8.0 s.
3. **`scripts/web/compose.sh`** — `compose_inset.sh` for K7 (560 @ 1300,60) and K8 (520 @ 1340,90),
   the K7 background mask applied first (§2.4), then K5 · K7c · K8c joined with **0.5 s `xfade`
   dissolves** and a closing dissolve into K5's first 0.5 s for the loop seam (§2.1), audio
   stripped → `hero_master.mp4`; then the web encode and poster (§2.6).
4. **`scripts/web/stills.sh`** — the nine frames of §3.1, cropped and sized, plus `og.jpg`.
5. **Astro:** `Hero.astro` rewritten (video + poster, HUD removed, scrim kept); `FormTracking.astro`
   new; `Problem`, `ProductSpotlight`, `Gallery`, `Founder`, `FinalCTA`, `AppModules`, `FAQ` edited
   for the new images and the FAQ line; `VideoReveal.astro` and its import removed; `index.astro`
   reordered.
6. **`npm run build`**, then a check that `dist/` carries `video/hero.mp4` ≤ 3 MB and no reference
   to a removed asset survives. **Done:** `dist/video/{hero.mp4 2.58 MB, hero.webm 2.65 MB,
   hero-poster.jpg}`, nine stills under `dist/assets/peter/`, `#form` present, no stale reference in
   `dist/` or `src/`. Screenshotted at 1440 and 390 px: hero, form section, Problem, Founder, Gallery,
   Spotlight, CTA.
7. **Deploy** — the plan stops at a built `dist/`. Publishing is the founder's action.

---

## 7. Claims

Untouched, except that §4's copy and FAQ line describe form tracking **as being built**, which is
the same posture the site takes on weight-reading (claim 6/9). No spoken K8 line reaches the page.
If the founder wants the stronger wording, that is allowlist entry 19 (drafted in the promo doc
§5.15) and a decision, not a copy edit.

---

## 8. Open, needs a decision

1. **Re-roll the two silent exercise clips** (§2.4) — both carry a mirror-figure; K7 is masked and
   K8's still is painted, but only a clean render removes them from the video. 20 credits; nothing
   waits on it.
2. **Deploy** (§6.7). Building `dist/` is done here; putting it on the host is not.
