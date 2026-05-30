# S3 — Branding the Headband *In-Generation* with Kling AI

**Goal:** Make the IronPal **icon** (and, opportunistically, the "IronPal" wordmark) appear on the headband as part of the Kling generation itself — integrated into the scene, lit and moving with the product — **not** painted on in post.
**Tool:** Kling AI 2.1 Pro Image-to-Video (Start + End keyframes). Keyframe-baking only — no reliance on tier-specific features.
**Framing:** This is a **method pilot**. S3 is the test case; the real deliverable is a *repeatable in-generation branding recipe* for all future product shots (S4a, S6b cap, S7). The method matters more than this one clip.
**Status:** ❌ **APPROACH FAILED ON MOTION REVIEW 2026-05-29 (§5.2).** Steps 0–2 ran, but judging on *static apex frames* (§3.1, §5.1) was misleading — **viewed in motion, the baked icon floats in mid-air beside the band instead of being locked to its surface.** Kling does not bind a conditioning-baked mark to the 3D product surface. In-Kling surface-locked branding is **not viable** with this method. See §5.2 for the corrected verdict and real options.
**Date:** 2026-05-29
**Owner:** Producer (solo founder)
**Refs:** `docs/s3-kling-plan.md` (base generation plan), `docs/s3-kling-logo-plan_grilled.md` (the decisions this doc encodes), `docs/s3-runway-post-production-polish.md` (brand asset specs + placement geometry).

---

## 0. Read this first — premise, limit, and definition of done

### 0.1 The one hard constraint, and the way around it

**No video generator renders legible logos or text from a text prompt.** Documented across our own work (`docs/s3-clip-analysis.md`; `docs/s3-runway-post-production-polish.md` §6: *"Kling can't render text reliably (no AI generator can)"*). Prompting *"a headband with the IronPal logo"* yields a smeared squiggle that mutates every frame.

The way around it — and the entire basis of this plan:

> **Bake the brand into Kling's *conditioning images* (the keyframes), then let Kling propagate it through the motion.**

Kling 2.1 Pro Image-to-Video is anchored by a **start frame** and an **end frame** (`scripts/video-gen/clients/kling_client.py` already sends both — `image` + `image_tail`). Kling reproduces those endpoints and interpolates between them. So if the logo is **already on the headband in the keyframe(s)**, the output shows it natively — no compositing step ever touches the video. The logo is placed **once, on a still image**, where it's reliable; that is fundamentally different from rendering text on moving video, which is not.

### 0.2 This premise is UNVALIDATED — Step 0 gates everything

We have never confirmed that Kling *preserves* a baked-in logo rather than washing it out or hallucinating over it (img2video models often "clean up" detail they read as noise). Because the deliverable is a *method*, we disprove this cheaply **before** any real investment. **Step 0 (§3) is a kill-switch.** Steps 1–2 run only if it passes.

### 0.3 Icon-primary, wordmark-opportunistic

The method's **guaranteed** deliverable is the **circular icon** — it survives motion, reads at small size, and carries brand recognition (the swoosh, not the full word). The **wordmark** is added only when the panel is big and flat enough to hold it, and **a roll never fails on the wordmark alone**.

### 0.4 Definition of done, and the Runway safety net

This is a pilot, so "done" is *knowledge*, not necessarily a shipped clip:

- **Spike passes** → a documented, repeatable recipe + the best branded Kling clip saved for A/B.
- **Spike fails** → a documented dead-end, so we never blindly re-attempt it.

**The Runway Aleph master (`Gen-4 Aleph - clean - 4K.mp4`) remains the S3 deliverable unless a branded Kling roll *clearly beats it*.** The campaign timeline is decoupled from this experiment — S3 ships on Runway regardless.

---

## 1. Brand assets (already prepared)

From `docs/s3-runway-post-production-polish.md` §1 — reuse, do not recreate:

| Asset | Path | Use here |
|---|---|---|
| **Circle icon** (default mark) | `post/assets/IronPal_logo_circle_v01.png` (2048×2048, RGBA) | **Primary** — what gets baked onto the keyframe in the spike and most rolls |
| Combined lockup (icon + wordmark) | `post/assets/IronPal_lockup_v01.png` (2456×512, RGBA) | Opportunistic only — clean, face-on holds where the wordmark can fit legibly |
| Wordmark only | `post/assets/IronPal_wordmark_v01.png` (2048×512, RGBA) | Optional pairing |
| Canonical logo | `input/images/logo/v4/Geometric teal circle on navy.png` | Design source of truth |

**Placement spec** (from `s3-runway-post-production-polish.md` §6.2): mark width ≈ **40% of the visible front-panel width**, **upper-center**, teal on matte-black fabric, reads as *printed*, not a sticker.

---

## 2. The keyframe reality (premise correction)

The base plan's keyframes are **not** brandable as-is. Verified by inspection:

| File | What it actually shows | Brandable? |
|---|---|---|
| `input/kickstarter/storyboarding/S3/kling-input/S3_kling_start.png` | Band barely emerged from the bag — a dark sliver, no panel face | No |
| `input/kickstarter/storyboarding/S3/kling-input/S3_kling_end.png` | Band held **edge-on** at top of frame — no flat face toward camera | No |

A logo is only legible when the panel **faces the camera**. In this footage that happens only briefly and partially in the *interpolated middle* (~t=2.5–3.0 s in the generated clips) — exactly where there is no keyframe to bake into. (This corrects the original plan's false claim that the end keyframe was "front panel flat to camera.")

**Resolution:** re-select keyframes so the **END** keyframe is the (most) face-on apex. The five already-generated clips (`scripts/video-gen/output/S3_kling/S3_kling_v{1..5}.mp4`) contain such frames — pull the flattest, most camera-facing panel (~t=2.5–3.0 s) as the branded END keyframe, and an earlier emerging frame as START.

---

## 3. Step 0 — Validation Spike *(GATE — run this first, nothing else until it resolves)*

Prove Kling can carry a baked mark through motion **before** building the full workflow.

1. **Pick the canvas.** Frame-step the 5 generated clips at ~t=2.5–3.0 s; choose the single frame with the flattest, most camera-facing headband panel. Export it as a still.
2. **Bake an oversized icon.** Composite `IronPal_logo_circle_v01.png` onto that panel — deliberately **larger than spec** (best case for survival), Multiply blend ~85–90% so fabric shows through. ~5-minute edit. Save as `S3_kling_spike_end.png`. (An earlier emerging frame = `S3_kling_spike_start.png`, unbranded is fine for the spike.)
3. **Run 1–2 Kling rolls** (2.1 Pro, Start+End, high adherence — see §5 settings), ~$0.60–1.20 total.
4. **Judge by eye.** Frame-step the apex hold at 100%.

**Pass/fail bar:**
- ✅ **PASS** = the icon stays recognizable and rigidly attached to the panel across the apex hold in **≥1 of 2 rolls** → proceed to Step 1.
- ❌ **FAIL** = the icon dissolves/morphs/detaches in **both** rolls → **stop.** Document the dead-end here, ship the Runway Aleph master. Do not proceed to Steps 1–2.

The spike isolates a single risk — *can Kling carry a baked mark at all?* — using the icon (not the wordmark). Wordmark legibility is never part of the go/no-go.

### 3.1 Result — RUN 2026-05-29: ✅ PASS (2/2 rolls)

**Executed.** Canvas = `S3_kling_v4` @ t≈2.5 s (the only clip holding the front panel face-on). Oversized `IronPal_logo_circle_v01.png` baked onto **both** keyframes (stronger preservation test than the plan's minimum) — `S3/kling-input/S3_kling_spike_{start,end}.png`. Two Kling 2.1 Pro Start+End rolls, cfg 0.78, static camera (jobs `889376047883100215`, `889376401768452184`).

| Roll | Apex hold (t≈4.0–4.8 s) | Mid-lift (t≈3.0 s) | Verdict |
|---|---|---|---|
| `output/S3_kling_spike/spike_v1.mp4` | Icon coherent, recognizable, rigidly on panel | Icon holds, crisp | ✅ survived |
| `output/S3_kling_spike/spike_v2.mp4` | Icon coherent, recognizable, rigidly on panel | Icon holds, slightly softer center | ✅ survived |

**Finding (⚠️ later corrected — see §5.2):** judged on *static apex frames*, the icon looked preserved and attached. **This judgment was incomplete** — it did not check the icon's behaviour *in motion*. The §5.2 motion review shows the icon actually **floats off the band surface** during the lift. The spike validated icon *presence*, not *surface-lock*; treat this "PASS" as superseded.

Caveats observed: (1) the panel is only briefly face-on in this footage — §11's designed face-on hold remains the durable upgrade; (2) icon was oversized for the spike — Step 1 places it at ~40% panel-width spec; (3) wordmark untested by design.

---

## 4. Step 1 — Brand the keyframe(s) *(only if Step 0 passed)*

Now do the placement properly, at spec, on the re-selected face-on keyframes (§2).

**4a. Place the icon (default).** On the face-on END keyframe, composite `IronPal_logo_circle_v01.png` at **~40% panel width, upper-center** (§1 spec). Method — pick by what's installed:

| Method | How | When |
|---|---|---|
| **Manual warp** | Photoshop/GIMP/Affinity: place, perspective-warp flat onto the panel, **Multiply** ~85–90%, faint inner shadow → reads as printed | Default |
| **Inpaint w/ reference** | Leonardo/gpt-image-1: mask the panel, prompt *"print this circular teal logo flat onto the headband panel, matte fabric, subtle"* with the icon as reference | If you'd rather not hand-warp |

**4b. Wordmark — opportunistic only.** If (and only if) the panel is large and flat enough to carry the "IronPal" wordmark legibly, swap the icon for `IronPal_lockup_v01.png`. Otherwise stay icon-only — this is expected and acceptable.

**4c. Match across keyframes.** If branding both keyframes, the mark must be the **same size/color/relative position** in both (allowing for perspective). Mismatch → Kling morphs the mark mid-lift. Place on the face-on END first, match START to it.

**4d. Acceptance before generating:**
- [ ] Icon recognizable at 100% on the keyframe(s).
- [ ] On-brand teal, ~40% panel width, upper-center, reads as printed (not a sticker).
- [ ] No bleed onto hand / bag / background.

Save to `input/kickstarter/storyboarding/S3/kling-input/S3_kling_start_branded.png` / `..._end_branded.png`.

### 4.1 Result — DONE 2026-05-29

Both production keyframes created from v4 (END = t≈2.5 s face-on apex; START = t≈1.3 s emerging), icon placed **below the module on the flat front face**, matched between the two, ~65% panel width (see note below), Multiply-shaded so it reads as printed. Acceptance §4d met on both: recognizable, on-brand teal, no bleed.

**Documented deviation from §6.2's "40%":** that figure is a *lockup* (icon+wordmark) spec. For an icon-only mark on this small wearable panel, ~65% panel width reads better and — per the Step 0 spike — survives motion more reliably. Wordmark omitted (panel too small/curved; icon-primary per §0.3).

---

## 5. Step 2 — Primary generation: Kling 2.1 Pro, Start + End, branded keyframe(s)

Deltas from `docs/s3-kling-plan.md` §4 (everything else unchanged):

| Setting | Value | Reason |
|---|---|---|
| Model | **Kling 2.1 Pro** | Best keyframe adherence at 1080p |
| Mode | **Image to Video, Start + End** | Endpoints anchor the baked mark; Kling interpolates |
| Start / End frame | branded stills from Step 1 | The mark is in the conditioning |
| **Creativity / cfg_scale** | **High adherence (~0.78)** | The point is to *preserve* the branded panel, not reinvent it |
| Camera | **Static** | Logo legibility dies under camera motion |
| Duration | 5 s | Trim in edit |
| Seed | random first; **lock the best seed** before iterating wording | Iterating prompt against a locked seed beats re-rolling |

**Positive prompt addendum** (append to §5.1 of `docs/s3-kling-plan.md`):

```
The headband front panel carries a small circular teal IronPal logo printed flat
on the matte fabric. The logo stays sharp, fixed and undistorted on the panel
throughout the lift, moving rigidly with the headband as a printed brand mark,
not floating or morphing.
```

**Negative prompt addendum** (append to §5.2):

```
warping logo, morphing mark, smeared logo, illegible logo, changing logo,
flickering brand mark, logo sliding off the panel, duplicate logos, distorted text
```

---

### 5.1 Result — DONE 2026-05-29: branded batch, 4/4 rolls preserved the icon

4 rolls run (jobs `889378854233186328`, `…214586806329`, `…530036224002`, `…841949171717`), 1920×1080 / 24 fps / 5 s, → `scripts/video-gen/output/S3_kling_branded/S3_branded_v{1..4}.mp4`. Kept separate from the unbranded baseline (`output/S3_kling/`) for A/B.

Judged across the full hold window (t≈3.0–4.9 s), not just the apex:

| Roll | Icon behaviour across the hold | Verdict |
|---|---|---|
| **v4 — SELECT** | Coherent ring + center dot held **consistently from t3.0 → t4.9** (band stays face-on); clean at apex; no pop-in | ✅ **best — most consistent** |
| v1 | Crispest *peak* icon (t4.3–4.9) but weak/forming early (t3.0–3.7, band turns edge-on) → pop-in risk | ✅ alternate (apex-only cuts) |
| v2 | Icon present across the whole window; ring slightly irregular | ✅ usable |
| v3 | Consistent but thinnest/weakest ring | ✅ usable |

**All 4 preserved the icon** — §9 required criteria pass on every roll (icon present, rigid, no morph/flicker/duplicate, on-brand, no bleed); full-frame quality (hands, motion) comparable across rolls with no notable artifacts. **Pick decided on consistency through motion, not peak sharpness:** a mark that holds steady reads better than one that resolves late. **Select = `output/S3_kling_branded/S3_branded_SELECT_v4.mp4`** (copy of v4); v1 is the alternate for an apex-only trim.

**Still open (human/CD call per §0.4):** the blind A/B *vs the Runway Aleph master*. ~~Until a branded Kling roll clearly wins that A/B, the Runway master ships S3.~~ ⚠️ **Superseded by §5.2.**

> ⚠️ **The §5.1 verdict was wrong — it judged static frames.** See §5.2.

---

## 5.2 Motion review — ❌ FAILED (corrected verdict, 2026-05-29)

When the rolls are watched as **video** (not sampled frames), the branded icon **floats in mid-air** — it does not move rigidly with the headband. Through the lift (t≈1.5–3.0 s) the teal mark drifts beside or below the band, untethered to the fabric; it only happens to overlap the band at a few apex frames, which is what the §3.1/§5.1 static sampling caught. **All 4 rolls fail this way** (verified v1, v2, v4). Result: pathetic / grotesque / unusable, as flagged.

**Root cause.** Kling Start+End I2V gets the icon *into* the keyframes but has no notion that the teal shape is a **texture locked to the band's 3D surface**. It carries the mark as a loosely-tracked free element, so under the band's motion and rotation the icon drifts and floats. This is the expected failure mode of generative video for surface-locked fine detail — and it is exactly **why the founder-led strategy and `docs/s3-runway-post-production-polish.md` put branding in post**, where a *planar tracker corner-pins* the logo to the tracked surface so it cannot float.

**Honest conclusion.** **In-Kling surface-locked branding is not achievable with this method.** Keyframe-baking proves the mark can *appear*, but not that it stays *on the surface* under motion. The §0.2 premise ("Kling preserves a baked-in icon through the lift") holds only for *presence*, not for *surface-lock* — and surface-lock is the whole point.

**Real options (operator decision):**
1. **Ship the Runway Aleph master for S3** — it already has post-tracked branding that does not float. Drop the in-Kling branding experiment. *(Lowest risk; matches §0.4 fallback.)*
2. **Brand the unbranded Kling clip in post** — planar-track the band (anchored on the module rectangle, per `s3-runway-post-production-polish.md` §5) and corner-pin the icon. Reliable surface-lock, but it is *post-production* (which this plan's brief explicitly excluded).
3. **Re-scope to a near-static, face-on product hold** (§11) — minimal motion ⇒ minimal float. Only viable for a beauty-shot framing (e.g. S7 end-card), **not** for S3's bag-pull motion.

Option 3 is the only remaining *in-generation* lever, and it changes the shot. There is no known way to make Kling surface-lock a logo through S3's motion.

**Artifacts retained for reference:** `output/S3_kling_branded/S3_branded_v{1..4}.mp4` (floating-icon failures), branded keyframes in `input/.../kling-input/S3_kling_{start,end}_branded.png`.

---

## 6. Optional reinforcement — Multi-Elements *(manual, not load-bearing)*

Kling Multi-Elements (declare the branded headband as a tracked element with a branded reference image) *can* strengthen identity persistence, per `docs/s3-kling-plan.md` §7.1. **But it is not part of the scripted method**: it's web-UI only (not in `kling_client.py`) and its availability on our tier is unverified. Treat it as an **optional manual experiment** the operator may try if §5's keyframe-baking alone leaves the mark drifting — never as a required step. The validated, scriptable path is keyframe-baking (§4–§5).

---

## 7. Iteration logic (one variable per roll)

| Symptom | Fix |
|---|---|
| Icon morphs/resizes between START and apex | Keyframes mismatched (§4c) — re-match scale/position, or move END keyframe earlier (shorter interpolation) |
| Icon slides off the panel / floats | Raise adherence (cfg → 0.8); confirm START and END marks are identical; lock seed and re-prompt rather than re-roll |
| Icon flickers on/off | Lower Creativity; identical mark on both keyframes; seed-lock |
| Icon duplicates (ghost mark) | Negative "duplicate logos"; reduce the word "logo" in the positive prompt (over-prompting spawns extras) |
| Everything warps, not just the mark | Drop to **Kling 1.6 Pro** — tighter thin-object identity than 2.1 on some prompts (`docs/s3-kling-plan.md` §12) |
| Wordmark (if attempted) turns to mush | Drop the wordmark — go icon-only (§0.3). Do not burn rolls chasing legible text |
| Motion too fast for the mark to hold | Shorten the lift / prompt "slow deliberate lift" — more frames where the mark is readable |

**Hard cap:** 8 generations total (per `docs/s3-kling-plan.md` §6.1), spike rolls included. Log icon legibility per roll.

---

## 8. Implementation via existing scripting

Pure config + asset swap — no code change (`kling_client.py` already passes `image` + `image_tail`). In `scripts/video-gen/config.yaml`, point `S3_kling` at the branded keyframes and raise adherence:

```yaml
  S3_kling:
    platform: kling
    model: "kling-v2-1"
    mode: "pro"
    source_image: "S3/kling-input/S3_kling_start_branded.png"      # branded start
    source_image_tail: "S3/kling-input/S3_kling_end_branded.png"   # branded (face-on) end
    cfg_scale: 0.78        # raised from 0.7 — adherence-leaning to preserve the mark
    prompt: >
      ...existing §5.1 prompt... <append §5 positive addendum>
    negative_prompt: >
      ...existing §5.2 negatives... <append §5 negative addendum>
    duration: 5
    attempts: 5
```

Run per the verified procedure (tunnel + generate; see `docs/ai-video-generation-execution-plan.md`):

```bash
cd input/kickstarter/storyboarding && python3 -m http.server <free-port> &
cloudflared tunnel --url http://localhost:<free-port> &   # put URL in .env IMAGE_BASE_URL
cd scripts/video-gen && python3 generate.py --dry-run && python3 generate.py --shots S3_kling
```

Branded outputs land in `output/S3_kling/`. Keep the existing unbranded `S3_kling_v{1..5}.mp4` as the baseline for A/B until a branded roll passes §9.

---

## 9. Acceptance gate

**Spike (Step 0):** operator eyeball — icon survives the apex hold in ≥1 of 2 rolls (§3).

**Method (ongoing):** extend the `review-runway` skill with a **logo-legibility criterion** and run it on each Kling branded output, so acceptance is structured and produces a comparable per-roll record. A branded roll is usable only if, in addition to the base §8 criteria in `docs/s3-kling-plan.md`:

- [ ] **Icon** present, recognizable, correctly placed (upper-center front panel) across the apex hold. *(required)*
- [ ] Icon moves rigidly with the headband — no float, swim, or independent drift. *(required)*
- [ ] Icon does not morph, resize, flicker, or duplicate through the lift. *(required)*
- [ ] On-brand teal; reads as printed on matte fabric. *(required)*
- [ ] No bleed onto hand / bag / background. *(required)*
- [ ] Wordmark legible during the hold — *opportunistic, never required* (§0.3).

Two or more **required** failures → re-roll per §7 or stop.

A branded Kling roll **wins over the Runway master** only if all required criteria pass *and* a blind A/B in `post/proxies/` consistently favors it. A tie defaults to Runway (§0.4).

---

## 10. Realistic expectations & fallbacks

**Most likely outcome:** the **icon holds**; a wordmark, if attempted, is legible only at the apex and soft during the fastest part of the lift. For a 5 s cut landing on the apex hold, the icon doing the brand-recognition work is **good enough** — and is the method's committed deliverable.

**If the spike fails outright** (icon dissolves in both rolls): in-generation branding is not viable on this footage with keyframe-baking. Document it, ship Runway, and revisit only with the §11 face-on-hero approach or post-composite (which the founder-led strategy already endorses for text).

**This tension is real and stated:** `docs/founder-led-production-strategy.md` deliberately leaves *text* to post because of §0.1. This plan pushes against that to test the in-generation route — likely a win for the **icon**, a coin-flip for the **wordmark**. The Runway safety net (§0.4) protects the deliverable either way.

---

## 11. Durable upgrade path (post-spike, for the reusable method)

Once the spike proves feasibility, the robust template for S3 **and every future product shot** (S4a, S6b cap, S7) is:

> **Design the END keyframe as a deliberately clean, flat, face-on hero hold of the product**, rather than salvaging an angled mid-lift frame.

A flat, camera-facing panel at the hold gives the baked mark its best chance of surviving legibly and gives the wordmark a real shot. Salvaging from existing clips (§2) is the cheap path to *prove the method*; designing the face-on hold is the path to *productionize it across the campaign*.

---

## 12. Cost & time

| Item | Cost |
|---|---|
| Step 0 spike (1 still edit + 1–2 rolls) | ~$1.20, ~30 min |
| Step 1 keyframe branding (if spike passes) | $0, ~30–45 min |
| Step 2 generation, ~5 rolls × ~$0.60 | ~$3 |
| 1.6 Pro fallback rolls | up to ~$5 |
| **Hard cap** | **~$15 credits, 8 rolls total, ~4 hr operator time** (per `docs/s3-kling-plan.md` §9) |

After the cap: ship the best icon-holding roll for A/B, default to Runway if no clear win (§0.4).

---

## 13. References

- `docs/s3-kling-logo-plan_grilled.md` — the eight decisions this plan encodes (driver, spike gate, geometry fix, icon-first, Multi-Elements demotion, definition of done, judging).
- `docs/s3-kling-plan.md` — base S3 Kling generation plan (this layers branding onto it).
- `docs/s3-runway-post-production-polish.md` — brand asset paths + placement geometry (§6.2).
- `docs/s3-clip-analysis.md` — prior failed S3 AI attempts.
- `docs/founder-led-production-strategy.md` — campaign AI scope; the text-rendering limitation this plan works around.
- `docs/ai-video-generation-execution-plan.md` — tunnel + `generate.py` run procedure.
- Assets: `post/assets/IronPal_logo_circle_v01.png` (default), `IronPal_lockup_v01.png`, `IronPal_wordmark_v01.png`; `input/images/logo/v4/Geometric teal circle on navy.png`.
- Keyframes: `input/kickstarter/storyboarding/S3/kling-input/S3_kling_{start,end}.png` (edge-on — re-select face-on frames per §2).

---

**Prepared by:** Producer (solo founder)
**Date:** 2026-05-29
**Status:** ❌ **In-Kling branding FAILED on motion review (§5.2)** — the baked icon floats off the band surface during the lift; not viable with this method. Static-frame judgments in §3.1/§5.1 were superseded. Real path for S3: ship the Runway Aleph master (already post-branded, no float), or brand the Kling clip in post. In-generation surface-lock is not achievable through S3's motion.
**Distribution:** CD, AVP, Producer
