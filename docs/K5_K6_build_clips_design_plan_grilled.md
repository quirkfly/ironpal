# K5 + K6 build clips — grilling ledger (auto mode)

**2026-10-07.** The design questions behind
[`K5_K6_build_clips_design_plan.md`](K5_K6_build_clips_design_plan.md), resolved without the
founder. Nobody confirmed any of these, so the tag is the provenance:
**EVIDENCE** = read from the repo or measured; **ASSUMED** = the recommended default, with the
strongest objection recorded so it can be vetoed cheaply; **OPEN** = a claim on the record, an edit
to accepted work, or something else not mine to settle.

**28 decisions: 10 EVIDENCE · 15 ASSUMED · 3 OPEN.**

---

## Branch A — structure

**Q1. Where do the two clips go?** Between K4 (*"…started building my own solution"*) and the reveal,
as the brief says. **EVIDENCE** — TASK.md brief. K4's line promises a process without naming it; the
reveal names the product. A build story only reads as story inside that gap.

**Q2. The brief says existing K5 → K7. What happens to K6–K9?** All shift by two (K6→K8 … K9→K11);
nothing is cut. **ASSUMED** — the brief keeps K4 "as is" and adds clips; it does not ask for a cut.
*Against:* the film has already broken its clip cap twice, and a cut could have come with the
insertion.

**Q3. Does the YouTube cut get replaced?** No — the crowdfunding cut is a second deliverable,
`K1_K11_crowdfunding`. **ASSUMED** — the brief says *"extend … to be suitable for crowdfunding"*,
which is a purpose, not a replacement. *Against:* two masters to maintain.

**Q4. Is ≈ 92 s too long?** No. **ASSUMED** — crowdfunding pitch videos commonly run 2–3 min; the
≈ 59 s target came from the YouTube brief (`founder_video_final.md`). *Against:* attention drops
with every second, whatever the platform.

**Q5. Do the existing clips change?** No, except possibly a chip on K7 (Q24). **EVIDENCE** — K1–K9
are rendered and accepted (`IRONPAL_PROMO_VIDEO_SCRIPT_V1.md` §5.18).

## Branch B — what is allowed on screen

**Q6. Can the build be shown with generated imagery?** No. Everything shown as prototype, build or
app is real footage. **EVIDENCE** — no footage of the prototype being built exists on disk (repo
survey, 2026-10-07); the K7 inset and the product still are AI or HTML mocks. Generating a
workbench or a board would fabricate a prototype in exactly the clip whose purpose is proof.
Kickstarter's ban on photorealistic product renderings and Indiegogo's honest-representation terms
point the same way (**ASSUMED** from platform knowledge, not re-read today).

**Q7. Then why generate anything?** The voice must come from Flow, so Peter must be generated to
deliver the line. **EVIDENCE** — the founder ruled "no external audio" (`K7_design_plan.md` §1).

**Q8. How is "this is real" signalled?** Small date chips on every real shot, added in post.
**ASSUMED** — they make the timeline legible and carry the disclosure without a disclaimer card.
*Against:* more text on screen alongside the burned captions.

**Q9. Can planned hardware (8 mm lens, LED, custom PCB) appear?** Only the PCB *layout*, chipped
`DESIGN · NOT YET BUILT`; no renders. **EVIDENCE** — the decision log and the tier-1 spec mark them
planned, not built.

## Branch C — the generated shots

**Q10. Which character?** `Peter Pitch FullBody`, bandless. **ASSUMED** — the band's reveal belongs
to K7; a generated band before it spends the reveal, and a generated *prototype* would breach Q6.
*Against:* two more clips without the product on his head.

**Q11. Where are they set?** The same gym, at the rack (K5) and the bench (K6). **ASSUMED** — a
workbench scene would need screens and electronics, which Flow garbles under the no-writing rule,
and which would be generated prototype. *Against:* a build story told in a gym is a little
abstract; the real B-roll carries the workshop.

**Q12. Framing?** Waist-up, centred, standing, locked-off 35 mm. **EVIDENCE** — the standing
waist-up talk is the old K5's proven shot; left-of-centre has the worst record in the film
(`K7_design_plan.md` §3.1), and no inset means nothing needs it.

**Q13. Clip length and model?** 10 s, Omni 1.1 Flash, fresh generation. **EVIDENCE** — K9 was 10 s on
Omni 1.1 Flash; an Extend comes back at 720p and loses its gesture guards (§5.12). *Cost:* uniform
8 s clips would be simpler to assemble.

**Q14. Word budget?** ≤ 18 words. **EVIDENCE** — 2.04 w/s measured at the pitch register (§5.2);
10 s minus a ~1 s pause.

## Branch D — K5, the hardware clip

**Q15. Which line?** A: *"Prototype one: my phone, strapped to my forehead. Tilt my head, the bar's
gone. So: a fisheye."* **ASSUMED** — true clause by clause, pictures onto real material, and does
not pre-empt K8's spec list. *Against:* C (*"Caps block the view…"*) is funnier.

**Q16. Was the rig that failed on head tilt really the strapped phone?** Inferred, not stated.
**ASSUMED** — the decision log says *"a narrow-FOV headband"* (D3), and the June clips are the A52
strapped on. Fallback line in the plan: *"Tilt my head, the lens loses the bar."* *Against:* if it
was a different camera, line A misattributes the failure.

**Q17. A deliberate pause before the punchline?** Yes, with the dead-ends graphic in it; if Flow
ignores it, the graphic drops. **ASSUMED** — no clip has proven that Flow honours a pause (K9 is
unverified), so the plan does not depend on it.

**Q18. The dead ends: spoken or shown?** Shown, as four struck-through cards. **ASSUMED** — "research"
is in the brief; cards cost no words and make no spoken claim about anyone's product, and none
names a brand. *Against:* 1.4 s is too short to read four cards — they are texture, not text.

**Q19. Prototype 1 was never filmed from outside. Re-stage it?** Yes, chipped `PROTOTYPE 1`, which
dates the rig, not the recording. **ASSUMED** — it is the same real configuration. *Against:*
a strict reader could call any re-staging a re-enactment; the chip wording is the safeguard.

**Q20. The real founder next to generated Peter?** Yes, deliberately. **ASSUMED** — crowdfunding
viewers want proof of a real person, and the founder must be visible (standing preference). Rig, not
face, is the subject of those frames. *Against:* the likeness gap shows.

## Branch E — K6, the software clip

**Q21. Which line?** A: *"Then the software. It counts reps from motion, and you teach it your
exercises, like a game."* **ASSUMED** — says what the model does without repeating K8, and is the
only line in the film about the user training it. *Against:* "like a game" undersells the tech.

**Q22. Is "you teach it" true today?** **OPEN** — the engine and studio are built, but matching has
not been measured (`ironpal-self-training-prd_grilled.md`). Recommended: keep *"you teach it"* as the
product description; the fallback *"I'm teaching it"* is true today with the same picture.

**Q23. Show the recogniser working live?** Yes — a real split squat on LiveHud (shoot S4). If it
fails, use the real app on a recorded replay, chipped `TEST REPLAY`; never fake it.
**EVIDENCE** for the gap (§5.18 item 11: no clip shows recognition) and for the absence of a
documented live session; the fallback rule is **ASSUMED**.

## Branch F — open and downstream

**Q24. A `DESIGN RENDER` chip on K7's AI product inset?** **OPEN** — recommended, because after two
real-prototype clips the render reads as the built thing; it edits an accepted clip.

**Q25. Allowlist entries 20 (prototype history) and 21 (motion rep counting + self-training)?**
**OPEN** — claims on the record. Wording drafted in the plan §3.2 and §4.2.

**Q26. Keep the existing K8 despite the overlap?** Keep; it is the first trim candidate. **ASSUMED** —
after the reveal it reads as the finished product's spec. *Against:* "Tiny camera. Motion sensors."
right after two clips about exactly that is repetition.

**Q27. Real footage audio?** Muted; Flow voice plus the music bed. **ASSUMED** — consistent with
"voice from Flow only". *Against:* real gym sound would add authenticity.

**Q28. Pipeline: update the geggen config or stay in `build.py`?** `build.py` only, with the music
re-fitted because the end card moves from ~75 s to ~90 s. **EVIDENCE** for the music placement
(`K1_K9_mastering.md` stage 9); the scope choice is **ASSUMED** (the config already lags the film by
one clip).

---

**Most worth a veto, riskiest first:** Q16 (did the phone rig really fail on tilt?), Q22/Q25
(the claims), Q23 (whether the live recognition works at all), Q19 (re-staging prototype 1),
Q10 (bandless Peter for two more clips).
