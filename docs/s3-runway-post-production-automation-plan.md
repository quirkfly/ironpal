# S3 Runway Post-Production — UI Automation Plan

**Goal:** Automate every step of `docs/s3-runway-post-production-polish.md` (Resolve project setup → grade → planar track → lockup composite → LED composite → BG polish → render → QA) so the S3 master can be re-run hands-off, and so the reusable parts (grade + spine) carry the campaign's **visual consistency** across S1–S7.

**Author:** Producer (solo founder)
**Date:** 2026-05-29
**Status:** Plan of record — folds in the decisions from `docs/s3-runway-post-production-automation-plan_grilled.md` (8 decisions + synthesis). Read §1 first.
**Companion to:** `docs/s3-runway-post-production-polish.md` (the manual runbook this automates) and `..._grilled.md` (the decision log + standing dissents)

---

## 1. Decisions of record (from grilling)

The path below is **chosen and locked**. Where I recommended otherwise, the dissent is preserved in §9 and in the grilled doc — not to relitigate, but so the trade-offs stay visible.

| # | Decision | Consequence for this plan |
|---|---|---|
| D1 | **Automate now**, betting on cross-shot scale | Build proceeds despite single-clip ROI risk |
| D2 | **Full S3 pipeline** — including the ~single-use Fusion track/lockup/LED automation | §5.4–5.6 are in scope, not deferred |
| D3 | **Stay on FREE Resolve — pure UI automation, no scripting API** | **L1/L2 (API/Fusion-script) are OUT.** Everything is L3 screen automation |
| D4 | **Record-and-replay macro** for the planar track | Valid only because S3 is one fixed clip; window geometry must be pinned |
| D5 | **HD 1080p + quarter proxy**, GPU feasibility spike FIRST | Timeline 1920×1080; 1080p H.264 delivery; 4K out of scope |
| D6 | **Film Look Creator → PowerGrade still (+ .cube)** as the single consistency engine | No Dehancer (paid/not installed); one still applied to all shots |
| D7 | **Screenshot + image-match checkpoints** for blind-run failure detection | Requires `opencv-python`; doubles as the slow-GPU timing gate |
| D8 | **Phase-0 spike is the bail-out gate** | If the GPU can't run comp+render, or no clean run in ~2 days → finish S3 by hand |

**The one thing that matters most:** everything hinges on **Phase 0 (§8)** — can the 1 GB GTX 460 actually run the full Fusion comp *and* render it? You already hit "GPU memory is full" on a bare import. Do that spike before writing any automation.

---

## 2. Environment audit (verified 2026-05-29)

```
Resolve:        /opt/resolve, v20.3.3.0010, FREE edition (no Studio license)
                ⚠ External scripting API is non-functional in FREE → L1/L2 unavailable (D3)
GPU:            NVIDIA GTX 460, ~1 GB VRAM, legacy 390 driver  (below Resolve's 2 GB min)
                → HD 1080p + quarter proxy mandatory (D5); already OOM'd on import
Source clip:    post/proxies/S3_aleph_4k_v01.mov  (ProRes 422 LT, 4096×2304, 24fps, 4s)
Brand assets:   post/assets/IronPal_{wordmark,lockup,logo_circle}_v01.png  (present)

Automation tooling PRESENT:
  python3 (miniconda) ✓   xdotool ✓   wmctrl ✓   scrot ✓
  import (ImageMagick) ✓  ffmpeg ✓    java ✓ (SikuliX)   pyautogui ✓
MISSING — install in Phase 0:
  ffprobe        → sudo apt install ffmpeg
  opencv-python  → pip install opencv-python   (REQUIRED for image-match checkpoints, D7)
  xnee/cnee or xmacro → optional event record/replay tooling for the macro (D4)
  (X11 confirmed: DISPLAY=:1 → xdotool is the right tool; ydotool not needed)
```

---

## 3. Strategy — pure UI automation (L3 only)

Because of D3, the deterministic API layers are off the table. The whole pipeline is **screen automation against a pinned, predictable Resolve window**, made safe by **record-replay for the fixed clip (D4)** and **image-match checkpoints (D7)**.

| Layer | Status | Tooling |
|---|---|---|
| ~~L1 — Resolve API~~ | **OUT (D3, Studio-only)** | — |
| ~~L2 — Fusion scripting~~ | **OUT (D3, Studio-only)** | — |
| **L3 — UI automation** | **THE path** | `xdotool` (window focus, keys, clicks), `xnee`/`xmacro` or hand-scripted `xdotool` (record-replay macro), `pyautogui`+`opencv`/SikuliX (image-matched checks), `scrot`+`import` (verify), `ffmpeg`/`ffprobe` (pre/post + QA) |

**What makes blind UI automation tolerable here:**
1. **Single fixed clip** → the click sequence is deterministic → record once, replay (D4).
2. **Pinned window** → identical geometry every run via `wmctrl` + a saved Resolve layout preset.
3. **Image-match checkpoints** → after each major step, assert the expected screen before continuing; abort on mismatch instead of producing silent garbage (D7). This also replaces fixed `sleep`s — gate on "expected screen appeared," which absorbs slow-GPU panel-load lag.
4. **Human gates** at the two judgment steps the screen can't evaluate: planar-track quality and final visual QA.

**Consistency engine (the campaign requirement):** build the look **once** as a **Film Look Creator PowerGrade still + `.cube` LUT (D6)**, saved at a **fixed Gallery position**, then re-apply that *same still* to every shot. One still applied identically = no cross-cut drift. The composite (track/lockup/LED) is S3-specific; the **grade + spine are what scale** to S1–S7.

Reusable artifacts to create once (version in `post/assets/`):
- `FilmLook_campaign_v01.drx` (PowerGrade still) + `S3_grade_v01.cube` — the locked grade.
- `post/automation/refs/*.png` — checkpoint reference images (captured during the Phase-1 hand pass).
- `post/automation/macros/S3_*.{xnee,sh}` — the recorded input macros per stage.

---

## 4. One-time setup (make Resolve automation-friendly)

A stable, *predictable* UI is the precondition for any of this working:

1. **Pin the window** — launch, maximize, fix geometry so coordinates/image-matches are stable every run:
   ```bash
   DISPLAY=:1 wmctrl -r "DaVinci Resolve" -b add,maximized_vert,maximized_horz
   DISPLAY=:1 wmctrl -r "DaVinci Resolve" -e 0,0,0,1920,1056   # match this display
   ```
2. **Lock the layout** — set each page's workspace once, Workspace → Layout Presets → Save. Automation assumes panels never move.
3. **HD + Quarter proxy (D5)** — Project Settings → Timeline resolution **1920×1080**; Playback → Timeline Proxy Resolution → **Quarter**. Make this the first thing the setup macro does.
4. **Disable confirmation prompts** where possible to reduce dialog handling.
5. **Build the reference-image library** during the first hand pass — capture every button/field the macro touches (Color page node graph, Add Node menu, Effects search, Film Look Creator sliders, Gallery still, Fusion toolbar, PlanarTracker Track button, Deliver render). Store in `post/automation/refs/`.
6. **Harness primitives:**
   ```bash
   DISPLAY=:1 xdotool search --name "DaVinci Resolve" windowactivate --sync
   DISPLAY=:1 xdotool key --clearmodifiers shift+6     # → Color page (verified)
   DISPLAY=:1 xdotool key alt+s                         # add serial node
   ```
   ```python
   import pyautogui  # opencv enables confidence= matching (D7)
   assert pyautogui.locateCenterOnScreen('post/automation/refs/color_page_loaded.png', confidence=0.9), "checkpoint failed"
   ```

---

## 5. Step-by-step automation map (pure-UI methods)

Each step: the UI-automation method, plus the per-step risk. (API methods removed per D3.)

### 5.0 Pre-process the source (shell, no Resolve) — done
The ProRes 422 LT `.mov` already exists. Keep prep idempotent:
```bash
ffmpeg -y -i "<source>.mp4" -c:v prores_ks -profile:v 1 -pix_fmt yuv422p10le -an post/proxies/S3_aleph_4k_v01.mov
```

### 5.1 Step 1 — Topaz upscale → **SKIP** (no-op). Retired in the runbook.

### 5.2 Step 2 — Project setup + import + timeline
**UI macro:** `File→New Project` → type `S3_post_v01` → Project Settings → set HD 1920×1080 / 24 fps / Rec.709 managed (D5) → Media page import `post/proxies/S3_aleph_4k_v01.mov` → right-click → Create Timeline. Checkpoint after each dialog (D7).
**Risk:** Medium (dialog focus races). **Mitigation:** `windowactivate --sync`, image-match each dialog before typing.

### 5.3 Step 3 — Color grade (consistency anchor, D6)
**Build once by hand:** 6-node tree (Exposure→WB→Contrast→HSL→**Film Look Creator**→Vignette); FLC settings = film stock + Halation 0.3 / Bloom 0.2 / Grain 0.4. A/B against the S4 reference still until the cut is invisible. **Save as a Gallery PowerGrade still at a fixed position + export `S3_grade_v01.cube`.**
**Re-apply (macro):** select clip → middle-click the fixed-position Gallery still (or drop the `.cube` on a node). This is the consistency guarantee — same still, every shot, no per-shot tweaks.
**Risk:** Medium-High (slider precision when building). **Mitigation:** build-once-apply-many removes per-shot risk; capture exact slider geometry in refs.

### 5.4 Step 4 — Planar track  ⚠ record-replay + human gate (D4)
**Method:** during the hand pass, draw the tracking polygon around Aleph's hallucinated module rectangle (high-contrast anchor), set mode = Perspective, press Track — **while recording the input macro**. On re-runs, replay the macro (identical geometry because it's the same clip). **Then PAUSE for a human track-quality check** — replaying clicks doesn't prove the track held ≥90%.
**Risk:** **High** (drift is the doc's #1 risk). **Mitigation:** tighter polygon; Mocha AE fallback (runbook §10.3); never unattend this step.

### 5.5 Step 5 — Lockup composite
**Method:** record the hand-built Fusion graph as a `.setting`; on re-run, load it (`Paste Setting`) and replay the scale/position nudge (lockup ≈40% of panel width). Lighting nodes (Multiply gradient, ColorCorrector Lift+0.03/Sat+5 teal, SoftGlow 2/0.85/0.15, motion blur linked to tracker velocity, opacity ramp) live in the saved setting so they're never forgotten.
**Risk:** Medium. **Mitigation:** template + recorded nudge; lighting nodes are the anti-"sticker" insurance.

### 5.6 Step 6 — Teal LED composite
**Method:** save the hand-built LED node (`#14B8A6` Background → 8px Ellipse → SoftGlow inner 4/1.0 + outer 16/0.4 → opacity 0%→100% over t=3.4–3.8s → 2 Hz ±10% flicker) as a `.setting`; load + re-key on re-run.
**Risk:** Low (self-contained, re-keyable in 5 min). **Mitigation:** keep it a standalone node so VO-timing changes don't touch the rest.

### 5.7 Step 7 — Background polish
**Method:** add Lens Blur (upper-40% Linear window, radius 2px, feather 30px); vignette already in grade N6. Warm-rim (§9.3 of runbook) stays **optional/off by default**.
**Risk:** Low.

### 5.8 Step 8 — Render
**Method:** UI-automate the Deliver page — image-match-load the **1080p H.264 preset (D5)**, Add to Render Queue, Render All.
**GPU reality:** render the **1080p H.264** only; ProRes 4444 XQ 4K master is out of scope on 1 GB VRAM (runbook's 1080p-master fallback is taken).
**Risk:** Medium (render OOM). **Mitigation:** 1080p; monitor `nvidia-smi`; retry at lower decode quality.

### 5.9 Step 9 — QA + handoff
**Automatable (deterministic gate — can only FAIL, never auto-PASS):**
```bash
ffprobe -v error -show_streams post/delivery/S3_master_v01.mov | grep -E "codec_name|width|height|r_frame_rate"
ffmpeg -v error -i post/delivery/S3_master_v01.mov -f null - && echo "decode OK"   # frame-drop/integrity
```
Assert: 1920×1080, 24/1 fps, h264, no audio, duration ≈ 4.0 s.
**Human (required):** lockup doesn't swim, color matches S4, no banding. Optional opencv SSIM vs an approved reference frame *flags* suspect frames for review — never passes them.
**Handoff:** template-generate `S3_handoff_v01.md`; copy preview to `post/delivery/` + review folder.

---

## 6. Orchestration

One idempotent, **resumable** runner (crashes are likely on this GPU):
```
scripts/post-automation/
  00_prep_prores.sh        # §5.0 shell
  10_project_setup.sh      # §5.2 xdotool macro + checkpoints
  20_apply_grade.sh        # §5.3 middle-click fixed Gallery still
  30_track.sh              # §5.4 replay macro → HUMAN track-QA gate
  40_lockup.sh             # §5.5 load .setting + nudge
  50_led.sh                # §5.6 load .setting + re-key
  60_bg_polish.sh          # §5.7
  70_render.sh             # §5.8 Deliver macro (1080p H.264)
  80_qa.sh                 # §5.9 ffprobe/ffmpeg gates → HUMAN visual-QA gate → handoff
  run_all.sh               # ordered, idempotent, --resume-from, image-match checkpoints, logs
```
- **Idempotency:** each stage writes a `.done` sentinel + its artifact; `--resume-from 40` re-enters cleanly.
- **Human gates:** runner pauses at §5.4 track-QA and §5.9 visual-QA, prints the checklist, waits for `y`.
- **Reuse for S1–S7:** point `10/20` (spine + grade still) at the same artifacts; each shot's *composite* (`30–50`) is bespoke and re-recorded.

---

## 7. Challenges & mitigations

| Challenge | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **1 GB GPU can't run comp+render** | High | **Blocking** | **Phase-0 spike gates everything (§8).** HD + quarter proxy; 1080p delivery; if spike fails → manual / GPU upgrade. |
| **Blind macro drifts silently** | High | High | Image-match checkpoints after every major step (D7); abort+alert on mismatch; gate on expected-screen, not `sleep`. |
| **Window/layout shift breaks coords** | Medium | High | Pinned `wmctrl` geometry + saved layout preset; re-record macro if Resolve updates. Note: Resolve was installed via `.run` (not snap/apt) so it won't silently auto-update — coordinate stability is actually in your favor. |
| **Planar track drift / quality** | Medium | High | Record-replay + **human QA gate**; tighter polygon; Mocha fallback; never unattend. |
| **No API safety net (D3)** | Certain | High | Accepted. Standing dissent §9 — Studio free trial validates the API path for $0 if the macro proves too flaky. |
| **FLC slider precision when building grade** | Medium | Medium | Build once by hand, save still + `.cube`, re-apply — removes per-shot risk and *is* the consistency guarantee. |
| **Single-use Fusion automation (D2)** | Certain | Medium | Accepted as iteration/learning investment; the grade + spine are the parts that actually scale. |

---

## 8. Phase 0 — the gate (DO THIS FIRST)

**Nothing else starts until this passes (D5, D8).**
1. `sudo apt install ffmpeg` (ffprobe) + `pip install opencv-python`.
2. Pin the Resolve window geometry + save a layout preset (§4).
3. **By hand:** build the full Fusion comp (planar track + lockup + LED + 2× soft glow + motion blur) and **render a 1080p H.264 of the 4 s clip end-to-end.**
4. **Acceptance:** comp plays without OOM at quarter proxy *and* the render completes.
5. **If it fails → STOP.** Finish S3 manually, or upgrade the GPU (≥4 GB), or run the Studio trial on a stronger machine. Do **not** build automation against a GPU that can't do the work.

**Secondary tripwire (D8):** if Phase 0 passes but you can't get **one clean end-to-end automated run within ~2 days**, abandon automation and finish S3 by hand.

---

## 9. Standing dissents (recorded, not to relitigate)

These are the points where my recommendation differed from the locked decisions. Kept visible so the trade-offs aren't forgotten:

- **D3 (free / pure-UI)** forecloses the only robust automation route. The **DaVinci Resolve Studio free trial** (full features, $0, watermarked exports) would let you validate the deterministic API path before rejecting it. **Revisit at the Phase-0 / Phase-2 gates** if the blind macro proves too flaky.
- **D2 (full Fusion automation)** is ~single-use for S3 — the other ~14 shots need *different* composites (app-UI on phone, product beauty). If Phase 0 is painful, strongly prefer **"spine + grade automated, compositing manual,"** which captures the real consistency win at a fraction of the fragility.

---

## 10. Revised rollout

- **Phase 0 — GPU + tooling gate (§8).** Hard stop if it fails.
- **Phase 1 — hand pass + capture.** Build grade (FLC) → save PowerGrade still + `.cube`; build lockup + LED comp; **record the macros and capture the `refs/*.png` checkpoint library during this pass.**
- **Phase 2 — wire the runner.** Record-replay + image-match checkpoints into one resumable `run_all.sh`; human gates at track-QA + visual-QA. (~2-day clean-run tripwire applies.)
- **Phase 3 — scale (only if it pays).** Reuse spine + grade still on other shots; re-record each bespoke composite.

**Distribution:** CD, AVP, Editor, Producer
**Next action:** Phase 0 — install `ffprobe` + `opencv-python`, pin the Resolve window, then run the by-hand comp+render feasibility spike against `post/proxies/S3_aleph_4k_v01.mov`.
