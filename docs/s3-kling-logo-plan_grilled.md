# S3 Kling Logo Plan — Grilled Decisions

Interview record resolving open decisions in `docs/s3-kling-logo-plan.md`.
Each entry: the question, the options weighed, the decision, and the rationale.

**Date:** 2026-05-29
**Subject doc:** `docs/s3-kling-logo-plan.md`

---

## Q1 — What is the actual driver for branding S3 inside Kling?

**Context:** The Runway Aleph master already solves S3 (branded via post), and the founder-led strategy deliberately puts text in post. So why fight it in Kling?

**Decision: Pilot for a reusable method.** S3 is the test case; the real goal is a repeatable in-generation branding workflow for **all** future product shots (S4a bench-press headband, S6b cap, S7 end-card beauty shot). Getting the *method* right matters more than this one clip.

**Implications this sets for the rest of the plan:**
- The core assumption (baked-in keyframe logos survive Kling's interpolation) **must be cheaply validated before** investing in a full per-keyframe workflow — because the method, not the clip, is the deliverable.
- The design must generalize, not over-fit to S3's specific (narrow, edge-on) headband geometry.
- Iteration budget is justified higher than a one-clip experiment, but spent on *learning the method*, not brute-forcing one shot.
- Success = a documented, repeatable recipe + a knowledge of where it breaks — not just one branded clip.

---

## Q2 — How do we de-risk the core assumption before building the workflow?

**Context:** The plan rests entirely on Kling *preserving* a logo baked into a keyframe rather than washing it out / hallucinating over it. Image-to-video models often "clean up" fine detail they read as noise. Untested.

**Decision: Cheap validation spike first.** Before building any full per-keyframe workflow: brand ONE keyframe with just an oversized icon (~5-min edit), run 1–2 Kling rolls, and confirm Kling preserves a baked logo *at all*. This is a kill-switch — only build the real per-keyframe workflow (both keyframes, careful matching, wordmark) if the spike survives.

**Implications:**
- A new **Step 0 — Validation Spike** must be inserted at the front of the plan, gating Steps 1–5.
- The spike isolates a single risk: *can Kling carry a baked mark through motion?* It uses the icon (best case for survival), not the wordmark (separate, harder risk).
- Sunk cost before go/no-go drops from ~1.5 hr (full workflow) to ~5 min + 1–2 rolls (~$1.20).

---

## Q3 — What is the spike's pass/fail bar?

**Decision: Icon survives ≥1 of 2 rolls.** PASS = the oversized icon stays recognizable and rigidly attached to the panel across the apex hold in at least one of two rolls. This is the minimal bar that proves Kling *can* carry a baked mark. If even the easy oversized-icon case dissolves in both rolls, the method is dead — stop and ship the Runway Aleph master.

**Implications:**
- The spike tests the *icon*, not the wordmark — wordmark legibility is a separate, later gate (it never gates the go/no-go for the method).
- One survival in two rolls is enough to proceed because seed-locking + tuning can lift repeatability afterward; the spike only needs to prove feasibility, not consistency.

---

## Q4 — Both keyframes are edge-on; where does a brandable (face-on) keyframe come from?

**Finding (verified by inspecting the assets):** `S3_kling_start.png` shows the band barely emerged from the bag (a dark sliver, no panel); `S3_kling_end.png` shows it held **edge-on** at the top of frame (no flat face). The plan's §2 claim that the end keyframe is "front panel flat to camera" is **false** for the actual file. A logo is only legible when the panel faces camera — which, in this footage, happens only briefly and partially in the *interpolated middle* (~t=2.5–3.0 s in the generated clips), where there is no keyframe to bake into.

**Decision: Re-extract a face-on frame from the existing generated clips ($0).** Pull the most face-on panel frame from `output/S3_kling/S3_kling_v{1..5}.mp4` (around t=2.5–3.0 s) as the branded **END** keyframe (the apex), pick an earlier emerging frame as the **START**, and re-bracket the motion. Salvages existing assets; good enough to feed the Step 0 spike.

**Caveat carried forward (method-level):** even the best generated frame is only *roughly* face-on and somewhat angled — not a clean flat presentation. For the durable reusable method (Q1), the better long-term answer is **Option B: deliberately design the END keyframe as a clean, flat, face-on hero hold** so the logo always has a flat target. Note this in the method doc as the upgrade path once the spike proves feasibility.

**Action item:** at spike time, compare the t≈2.5–3.0 s frames across all 5 clips and choose the one with the flattest, most camera-facing panel.

---

## Q5 — What brand element does the method commit to?

**Decision: Icon-primary, wordmark opportunistic.** The method's guaranteed deliverable is the **circular icon** (`post/assets/IronPal_logo_circle_v01.png`) — it survives motion, reads at small size, and carries the brand recognition. The "IronPal" **wordmark** is added only when the panel is large/flat enough to hold it, and is never required for a roll to pass. This mirrors real wearable branding (the swoosh, not the full word).

**Implications:**
- Default asset to bake is the **icon**, not the combined lockup. The lockup (`IronPal_lockup_v01.png`) is used only on opportunistic face-on holds.
- A roll is never rejected for wordmark failure alone — only for icon failure. This unblocks otherwise-good rolls.
- Plan §1/§6 must be reworded: "icon required, wordmark opportunistic" replaces "icon + wordmark."

---

## Q6 — Should the method depend on Kling Multi-Elements (§3)?

**Decision: Don't depend on it.** Design the method around **keyframe-baking alone** (Start + End), which the API provably supports — `scripts/video-gen/clients/kling_client.py` already sends `image` (start) + `image_tail` (end). Multi-Elements is treated as an untested, web-UI-only "nice-to-have" the operator may try manually, not a load-bearing or scripted step.

**Implications:**
- §3 (Multi-Elements) is demoted from a core step to an optional manual experiment.
- The method stays fully **scriptable** via the existing pipeline (config + asset swap), preserving the "reusable, automatable" goal from Q1.
- No dependency on tier-specific features we haven't verified.

---

## Q7 — What is "done" for this pilot, and does Runway still ship S3?

**Decision: Method validated + documented; the Runway Aleph master still ships S3.** Done =
- **Spike passes** → a documented, repeatable recipe + the best branded Kling clip saved on disk for A/B.
- **Spike fails** → a documented dead-end (so we never re-attempt it blindly).

The Runway Aleph master remains the S3 deliverable **unless** a branded Kling roll *clearly beats it*.

**Implications:**
- The campaign timeline is **decoupled** from this experiment — S3 ships on Runway regardless of how Kling-branding turns out.
- Removes pressure to brute-force a result; we can honor the §0 hard limit and the 8-roll cap without jeopardizing the cut.
- The primary artifact is the **method knowledge**, consistent with Q1.

---

## Q8 — How is icon survival / legibility judged?

**Decision: Eyeball the spike, adapt `review-runway` for the method.**
- **Spike:** operator eyeballs the apex frames at 100% + frame-step (fast, solo-founder-appropriate).
- **Method:** adapt the existing `review-runway` skill to score Kling branded outputs on a logo-legibility criterion, so ongoing acceptance is structured and repeatable.

**Implications:**
- No new judging tool needs to exist before the spike — removes a blocker.
- The `review-runway` skill (currently tuned to the Runway/quality-bar) gets a small extension for a logo-legibility check; this becomes the method's acceptance gate and produces a comparable record per roll.

---

## Synthesis — net changes to `docs/s3-kling-logo-plan.md`

The grilling reshapes the plan from "brand both keyframes with the full lockup, lean on Multi-Elements" into a **gated, icon-first, method-pilot**:

1. **Insert Step 0 — Validation Spike (gates everything).** Re-extract the most face-on panel frame from `output/S3_kling/S3_kling_v{1..5}.mp4` (~t=2.5–3.0 s), bake an **oversized icon** onto it, run **1–2 Kling rolls**. PASS (icon survives the apex hold in ≥1 of 2, eyeballed) → proceed. FAIL → stop, document, ship Runway. [Q2, Q3, Q4, Q8]
2. **Fix the false premise in §2.** The existing keyframes are edge-on / barely-emerged, not "panel flat to camera." Keyframes must be re-selected so the **END** keyframe is the (most) face-on apex. [Q4]
3. **Reframe the brand element as icon-primary, wordmark-opportunistic** throughout §1/§6 — the default baked asset is `IronPal_logo_circle_v01.png`; the lockup is used only on clean face-on holds; a roll never fails on wordmark alone. [Q5]
4. **Demote §3 Multi-Elements** from a core step to an optional, manual, web-UI-only experiment. Keep the scripted path = keyframe-baking only. [Q6]
5. **State the definition of done + Runway fallback explicitly** up top: the method/knowledge is the deliverable; Runway Aleph ships S3 unless a Kling roll clearly wins. [Q1, Q7]
6. **Acceptance gate:** eyeball for the spike; extend `review-runway` with a logo-legibility criterion for the method's ongoing acceptance. [Q8]
7. **Durable upgrade path (post-spike):** once feasibility is proven, design the END keyframe as a deliberately **clean, flat, face-on hero hold** rather than salvaging an angled frame — and that becomes the template for branding S4a/S6b/S7. [Q4, Q1]

**Unchanged / still valid from the original plan:** the §0 reasoning (text can't be prompted, must be baked into conditioning), the high-adherence cfg (~0.78) + static camera + seed-lock-after-first-good-roll iteration knobs, the ~$15 / 8-roll cost cap, and the config-swap implementation via `kling_client.py` (`image` + `image_tail`).

---

**Status:** Decisions captured. Ready to fold into `docs/s3-kling-logo-plan.md` on request.

