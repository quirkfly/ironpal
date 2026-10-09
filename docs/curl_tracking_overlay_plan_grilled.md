# Curl tracking overlay — grilling ledger (auto mode)

**2026-10-09.** Questions behind [`curl_tracking_overlay_plan.md`](curl_tracking_overlay_plan.md),
answered without the founder. **EVIDENCE** = measured or read from the repo; **ASSUMED** = the
recommended default with its strongest objection; **OPEN** = not mine to settle.

**16 decisions: 10 EVIDENCE · 5 ASSUMED · 1 OPEN.**

**Q1. How many reps, and where are the tops?** Three; tops at #42, #77, #111. **EVIDENCE**: the
frame grid and the skin-area peaks (1.67, 3.2, 4.7 s) agree.

**Q2. What drives the count?** Measured lift progress, with the count on its up-crossing of 0.85.
**EVIDENCE** for the signal (skin area tracks the lift: 31k at rest, peaks 48.6k/36.6k/35.5k);
**ASSUMED** for the 0.85 point: *"the count must increase as the arm moves up"* means it lands as
the top is reached. *Against:* some apps count on the way back down; this brief says up.

**Q3. One normalisation or per rep?** Per rep. **EVIDENCE**: rep 1's excursion is about 3× reps
2–3's, so a global scale would leave reps 2–3 at about 0.3 and never count them.

**Q4. Why not dark-pixel plate area as the signal?** It failed. **EVIDENCE**: motion blur turns the
plate grey at the tops of reps 2–3, and the signal dips where it should peak.

**Q5. How are the plates tracked without a tracker module?** Keyframed geometry (rest + three tops),
interpolated by `p`, anchored to the per-frame fist. **ASSUMED**: the dumbbell has one degree of
freedom here, so `p` predicts its pose. *Against:* between keyframes the rings are a model, not a
detection; the validation step checks them against the frames.

**Q6. Do the kilograms come from the picture?** No: they are given by the founder (2 × 5 + 2 × 3.5 +
1 = 18 kg), drawn on the tracked parts. **EVIDENCE**: claim 8; weight-reading is unvalidated.

**Q7. Animate the weight being read?** No: 18 kg is present from the first frame. **ASSUMED**: same
treatment as K7's static weight. *Against:* a "reading…" beat sells the feature harder, and does it
dishonestly.

**Q8. Per-part tags or only the total?** Both: **5 kg + 3.5 kg** on each plate stack, **BAR 1 kg** on
the handle, **18 kg** in the HUD. **EVIDENCE**: the brief lists the parts.

**Q9. Where does the HUD go?** A free right column on a 1920×1080 canvas, with the clip scaled to
1600×900 beside it. **EVIDENCE**: the first render put the HUD in the "margin" and covered the picture;
measured, the circle spans x ≈ 115–1165, leaving ~115 px margins. *Revised from the plan's first
draft, which assumed 285 px margins.*

**Q10. Style source?** The landing page's squat overlay tokens and the K7 live-set HUD language.
**EVIDENCE**: `FormTracking.astro`, `tokens.css`.

**Q11. Font?** Montserrat from the site's own fontsource package. **ASSUMED**: it is the site's
display face and is already on disk. *Against:* none material.

**Q12. Label it?** "Product interface concept · simulated footage" on every frame. **ASSUMED**: house
rule for app mocks, plus the footage is generated. *Against:* it costs a strip of the margin.

**Q13. Keep the clip's audio?** No. **ASSUMED**: it is generated room tone; music or silence is the
edit's choice. *Against:* a faint gym ambience reads as real.

**Q15. What times the top of rep 3?** The frame-read keyframe (#111), with a 10-frame rise borrowed
from reps 1–2. **EVIDENCE**: the skin-area peak for rep 3 lands at #116 because the plate hides the
forearm; counting on it put REP 3 four frames after the visual top. *Against:* one rep's rise is
modelled, not measured; the frame grid (#101 → #111) agrees with it.

**Q16. How are the plates tracked, after the founder found them inaccurate?** The far plate is
detected per frame (GrabCut + ellipse fit, 180/192 frames); the near plate is measured on 28 frames
and interpolated; both are drawn as bracket boxes. **EVIDENCE**: the founder's review; the near
plate and the floor are indistinguishable by brightness (47 vs 44); an ellipse cannot follow the
stack's D-shaped silhouette. *Supersedes Q5's keyframe-and-interpolate model.* *Against:* the near
plate between measured frames is still interpolated, at a 2–4 frame spacing.

**Q14. Where will it be published?** **OPEN**: site, campaign or film. Wherever it goes, the label
stays and the copy around it says *concept*.
