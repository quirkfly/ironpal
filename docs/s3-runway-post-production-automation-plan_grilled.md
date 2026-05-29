# S3 Runway Post-Production Automation Plan — Grilled

A decision-by-decision interrogation of `docs/s3-runway-post-production-automation-plan.md`. Each entry: the question, my recommendation, the decision made, and the rationale.

**Started:** 2026-05-29

---

## Q1 — Premise / ROI: automate now or finish S3 by hand first?

**Question:** The plan automates a full pipeline for one 4-second clip (S3) — the only shot through Runway so far — while basic Resolve operations are still being learned manually. The harness is days of build. Why automate now vs. hand-finish S3 and revisit automation only if S1–S7 are greenlit?

**My recommendation:** Finish S3 manually first; defer the harness.

**Decision:** **Automate now — it scales.** Confidence that S1–S7 are coming and that per-shot savings + consistency repay the build cost.

**Rationale / caveat on record:** Accepted, but the ROI is entirely contingent on S1–S7 actually flowing through the *same* Runway→Resolve pipeline (tested next in Q2). If they don't, the build cost is amortized over far fewer than 7 shots and the premise weakens.

---

## Q2 — Automation scope: does S3's composite actually scale?

**Codebase finding:** The campaign is ~15 shots (S1, S2a–c, S3, S4a–d, S5, S6a–c, S7), each from a different tool (Luma/Runway/Kling/screen-rec) with different post needs. **S3's planar-track → lockup → LED chain is unique to S3.** S1/S2/S5 need an app-UI-on-phone composite; S7 is a product beauty shot. What reuses across all shots is the **deterministic spine** (setup/import/render/QA) and the **locked grade** (DRX/LUT). The fragile Fusion/UI automation does **not** amortize.

**My recommendation:** Spine + grade only; keep all compositing manual.

**Decision:** **Build the full S3 pipeline anyway** — including the single-use Fusion track/lockup/LED automation — to get a fully hands-off S3 run and a template to adapt later.

**Rationale / caveat on record:** Accepted with eyes open: the §5.4–5.6 Fusion/UI automation is the highest-effort, highest-fragility part of the plan and is ~single-use for S3. It's justified only if (a) you expect to re-run S3 many times during iteration, or (b) the "template to adapt" genuinely shortcuts the *different* composites on other shots. Treat it as a learning/iteration investment, not a reuse investment.

---

## Q3 — Studio vs Free (the #1 technical blocker)

**Question:** Installed Resolve is FREE; the external scripting API (L1 + L2, the foundation of the chosen "full pipeline") is Studio-only. How to resolve?

**My recommendation:** Buy Studio ($295, already budgeted) — or at minimum prototype on the free trial first.

**Decision:** **Stay free — pure UI automation only.** No API; everything via xdotool/SikuliX/pyautogui screen automation.

**Rationale / caveat on record:** This is the highest-risk choice and it compounds with Q1/Q2: the plan is now *full S3 pipeline, including Fusion compositing, driven entirely by screen-clicking, on free Resolve, on a 1 GB GPU.* Consequences accepted: no deterministic API layer, 3–5× build effort, coordinate/image-match fragility on every Resolve update, and (critically) the planar track and grade must be driven blind through the UI. The plan's L1/L2 sections are now inapplicable; only L3 remains. **Strong on-record dissent: the free trial (full features, watermarked exports) would let you validate the API path for $0 before rejecting it — rejecting Studio outright forecloses the only robust route.**

---

## Q4 — Planar track under pure UI automation

**Question:** Screen automation is blind — it can't locate the moving headband panel or judge track quality. S3 is one fixed clip, so the click sequence is deterministic. How to handle the track?

**My recommendation:** Record-and-replay macro (given the single-fixed-clip constraint) — the one scenario where blind UI automation is valid.

**Decision:** **Record-and-replay macro.** Do the polygon-draw + Track press once by hand while recording; replay on re-runs.

**Rationale / caveat on record:** Sound for *this exact clip* because geometry is identical every run. Hard dependencies: (1) the Resolve window must be pixel-identical position/size every run (enforce via `wmctrl` fixed geometry + saved layout preset); (2) any Resolve update or layout change invalidates the recorded coordinates; (3) tool choice — on X11 use an event record/replay tool (`xnee`/`cnee`, `xmacro`) or hand-scripted absolute `xdotool` clicks with verify-screenshots between actions. The macro must still pause for a **human track-quality check** — replaying the clicks doesn't guarantee the track held.

---

## Q5 — GPU / delivery de-risking

**Question:** The 1 GB GTX 460 is below Resolve's 2 GB minimum and already OOM'd on import. The full pipeline adds a GPU-heavy Fusion comp + render. How to de-risk?

**My recommendation:** Commit to HD 1080p + quarter proxy and validate the full comp + render on this GPU before building automation.

**Decision:** **HD 1080p, validate the comp early.** 1920×1080 timeline + quarter proxy + 1080p H.264 delivery; run a full-comp + render feasibility spike first.

**Rationale / caveat on record:** Correct order of operations — this becomes a **hard Phase-0 gate**: if the Fusion comp (planar track + 2× soft glow + motion blur) plus a render can't complete on the GTX 460, the entire "full S3 pipeline" decision (Q2) is moot and the fallback is GPU upgrade or Studio-trial-on-better-machine. Build *zero* automation until this spike passes. Acceptance for the spike: comp plays without OOM at quarter proxy, and a 1080p H.264 render of the 4 s clip completes end-to-end.

---

## Q6 — Consistency engine

**Question:** Consistency mechanism under free Resolve (no API, no Dehancer)?

**My recommendation:** Film Look Creator 6-node grade → save as Gallery PowerGrade still + export .cube → re-apply the single still to every shot.

**Decision:** **Film Look Creator + PowerGrade still.** Build once, save still + LUT, middle-click-apply to each shot.

**Rationale / caveat on record:** This is the consistency guarantee the brief demands — one still applied identically = no drift. Implementation notes for the blind-UI constraint: the saved still must live at a **fixed Gallery position** so the replay macro can middle-click it reliably; keep the `.cube` as a backup re-apply path and as the editor's reference. Do **not** tweak the grade per shot (the Q-series brief and the runbook both forbid it).

---

## Q7 — Failure detection in a blind macro

**Question:** A blind record-replay macro drifts silently if one click misses or a panel loads slowly. How to detect failure mid-run?

**My recommendation:** Screenshot checkpoints with image-match assertions between steps; abort + alert on mismatch.

**Decision:** **Screenshot checkpoints + image match.** `scrot` after each major step, assert expected reference image present before continuing.

**Rationale / caveat on record:** Best available safety net for blind automation, and it doubles as the **timing solution** — gate each step on "wait until expected screen appears" instead of fixed `sleep`s, which directly handles the slow-GPU panel-load lag. Prerequisites: **`pip install opencv-python`** (currently missing) for confidence matching; build the `post/automation/refs/*.png` reference library during the first hand-recorded pass. Checkpoint granularity: at minimum after page switches, node adds, the grade-still apply, the track, and before render.

---

## Q8 — Bail-out tripwire

**Question:** Given the stacked risk, what's the explicit point to abandon automation and finish S3 by hand?

**My recommendation:** Phase-0 spike is the gate — fail the GPU spike or no clean end-to-end run within ~2 days → go manual.

**Decision:** **Phase-0 spike is the gate.**

**Rationale / caveat on record:** Gives a falsifiable, time-boxed tripwire and prevents the open-ended sink the stacked choices risk. Concretely: (1) GPU feasibility spike (Q5) must pass first; (2) if it fails → finish S3 manually (or upgrade GPU / use Studio trial elsewhere). The ~2-day "one clean automated run" sub-box from the recommendation is adopted as the secondary tripwire.

---

## Synthesis — shared understanding & plan of record

**What we agreed (decisions):**
1. **Automate now**, betting on cross-shot scale — accepted despite my ROI dissent.
2. **Full S3 pipeline**, including the ~single-use Fusion track/lockup/LED automation.
3. **Stay on free Resolve, pure UI automation** — no scripting API. *(My strongest dissent; see below.)*
4. **Record-and-replay macro** for the planar track (valid only because S3 is one fixed clip).
5. **HD 1080p + quarter proxy**, with a **GPU feasibility spike first**.
6. **Film Look Creator → PowerGrade still (+ .cube)** as the single consistency engine.
7. **Screenshot + image-match checkpoints** for blind-run failure detection (needs opencv).
8. **Phase-0 spike + ~2-day clean-run box** as the bail-out tripwire.

**Revised execution order (supersedes the plan's phased rollout for this Free path):**
- **Phase 0 (gate, do first):** `apt install ffmpeg` (ffprobe) + `pip install opencv-python`; fix Resolve window geometry + saved layout preset; **run the full Fusion comp + 1080p render by hand once** to prove the GTX 460 can do it. *If this fails, STOP → finish S3 manually.*
- **Phase 1:** hand-build the grade (Film Look Creator) → save PowerGrade still + .cube; build the lockup + LED comp by hand; **this hand pass is also when you record the macro and capture the `refs/*.png` checkpoint library.**
- **Phase 2:** wire the record-replay macro + image-match checkpoints into one resumable runner; keep human gates at track-QA and final visual QA.
- **Phase 3 (only if it scales):** adapt the spine + grade-still to other shots; accept that each shot's *composite* is bespoke.

**Standing dissents (for the record, not to relitigate):**
- The **free-edition / pure-UI** choice forecloses the only robust automation route. The **Studio free trial** (full features, $0, watermarked exports) would let you validate the API path before rejecting it — revisit if the macro proves too flaky at the Phase-0/Phase-2 gates.
- The **Fusion compositing automation is ~single-use**; if the Phase-0 spike is painful, strongly prefer "spine + grade automated, compositing manual" — that captures the real consistency win at a fraction of the fragility.

**Biggest open risk:** the GPU. Everything else is moot if the GTX 460 can't run the comp + render. That spike is the first thing to do.

**Grilling completed:** 2026-05-29
