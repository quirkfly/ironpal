# K5 + K6 build clips — grilling ledger (auto mode)

**2026-10-07.** The design questions behind
[`K5_K6_build_clips_design_plan.md`](K5_K6_build_clips_design_plan.md), resolved without the
founder. Nobody confirmed any of these, so the tag is the provenance:
**EVIDENCE** = read from the repo or measured; **ASSUMED** = the recommended default, with the
strongest objection recorded so it can be vetoed cheaply; **OPEN** = a claim on the record, an edit
to accepted work, or something else not mine to settle.

**43 decisions: 18 EVIDENCE · 21 ASSUMED · 4 OPEN** (Q29–Q43 and revisions to Q10–Q12 added the
same day, as the founder set the locations, supplied a photo of his lab and asked for the assembly).

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

**Q10. Which character?** `Peter Pitch`, bandless — revised 2026-10-07 from `Peter Pitch FullBody`
once he was seated. **EVIDENCE** — `Peter Pitch` is the waist-up variant K2 and K3 resolved against
(`IRONPAL_PROMO_VIDEO_SCRIPT_V1.md` §4); the band's reveal still belongs to K7, and a generated
band before it would also breach Q6.

**Q11. Where are they set?** **Both in the founder's real lab** — K5 assembling the hardware, K6
coding and testing — one room, from one photo he supplied (`input/kickstarter/k5k6/lab_reference.jpg`; replaced by
his updated shot of the same corner at 18:17 the same day, masks in `scripts/k5k6/blur_lab.py`
re-measured to match).
**EVIDENCE** — the founder's direction, 2026-10-07 (TASK.md, two entries: first lab and office, then
*"use it in both K5 and K6"*). *Superseded twice:* first both in the gym, then a separate lab and
office; Branch G is how the room keeps Q6's protection.

**Q12. Framing?** Seated, waist-up, centred, locked-off 35 mm at seated chest height.
**EVIDENCE** — the waist-up talk is the old K5's proven shot; left-of-centre has the worst record
in the film (`K7_design_plan.md` §3.1), and no inset means nothing needs it.

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

## Branch G — the lab and the office (added 2026-10-07)

**Q29. May a generated lab and office show electronics and screens?** The *room* may be generated;
nothing in it may read as the product. **ASSUMED** — a lab and an office are settings like the gym;
the line Q6 draws is at the prototype and the app. *Against:* a viewer cannot tell a generated
bench from a real one, so any board in shot is a risk — hence Q31–Q32.

**Q30. How does the generated room match the real B-roll?** The founder's photo is Flow's
reference frame for both clips. **EVIDENCE** — supplied 2026-10-07; the real B-roll (H5, S5) is shot
at the same desk, so the cut matches by construction.

**Q31. Does he assemble or type while talking?** No — he turns from the work and talks with his
hands resting. **EVIDENCE** — hands in motion near small objects are the film's worst failure (K7:
eight takes; K6 broke its gesture guards), and working splits the eyeline from the lens.

**Q32. The room has five lit screens. What does Flow see?** A copy with every screen blurred to a
glow (`scripts/k5k6/blur_lab.py` → `lab_reference_flow_16x9.jpg`), and a prompt that keeps them lit,
behind him, out of focus, with nothing legible; a take with pseudo-text on any screen is a re-roll.
**EVIDENCE** — the original shows legible code, a terminal and the landing page; Flow cannot render
text under the no-writing rule and garbles it, and a garbled screen would be a generated app. Turning
the screens off or away would stop it being this room.

**Q33. Wardrobe for the lab and office?** The same black tank top, bare head; shorts and trainers
dropped from the prompt because they are out of shot. **ASSUMED** — continuity of the man across
eleven clips outweighs dressing for the room. *Against:* a tank top in an office reads as costume.

**Q34. Grade them to the gym?** No — one look for both, because they share one room: white walls,
cool daylight, screen glow, pulled toward the film's look at ~40 % instead of 70 %. **ASSUMED** — the
gym's warm Y 42 would turn the photo's room into a different room. *Against:* less unity across the
K4→K5 and K6→K7 cuts.

**Q35. Film the real assembly and coding too?** Yes — H5 (soldering and seating the board in the
real lab) and S5 (over-the-shoulder coding with tests passing in the real office), as spares cut
into K5 shot 5 and K6 shot 2. **ASSUMED** — the real rooms will be lit and set up anyway, and real
hands on the real prototype are the strongest frames a crowdfunding viewer can get. *Against:*
another ~15 min of shooting.

**Q36. How are K5 and K6 told apart in one room?** By where he sits: K5 at the left end of the
desk by the laptop, turning from loose parts; K6 in front of the two middle monitors, swivelling from
the keyboard. **ASSUMED** — the room is fixed, so position is the only lever. *Against:* two
consecutive clips in one room at one size can read as one long clip; the real cutaways between them
carry most of the difference.

**Q37. Does the photo also appear as real footage?** Yes — as K6 shot 1b, a 0.6 s establishing still,
with the wall terminal and the laptop session blurred for privacy (`lab_broll_still.jpg`).
**ASSUMED** — it is the only real image of the founder's workspace, and *"use it in both clips"*
reads as wanting it seen. *Against:* "use it" may have meant only as the reference; the shot is
0.6 s and drops without touching anything else.

## Branch H — the assembly in K5 (added 2026-10-07)

**Q38. How does K5 show parts being assembled when the line already fills 10 s?** A 3.6 s silent
assembly beat after the line, cut to the music; the Flow clip's silent final hold becomes the tail.
K5 grows to ≈ 14 s. **EVIDENCE** for the direction (TASK.md: *"K5 must feature … components being
assembled"*); the silent-beat construction is **ASSUMED** — the voice rule governs the voice's
source, not wall-to-wall speech. *Against:* a 3.6 s gap in a film where the founder talks for 70 of
73 s may read as a stall; the music has to carry it.

**Q39. Are the featured parts real or generated?** Real only — H6 flat-lay and H5a–d assembly at the
real desk; the Flow desk stays generic. **EVIDENCE** — the ELP board, the Nano 33 BLE and the terry
band physically exist (`ironpal-gym-session-01-plan.md`, BLE verified 2026-08-05), and Q6 forbids a
generated prototype. *The direction does not say which*; real is the reading that cannot mislead.

**Q40. What does the assembly show?** The steps the docs record: de-case the board, kapton on its
back, lens through the cut hole, Nano alongside, cables looped and taped. **EVIDENCE** —
`ironpal-gym-session-01-plan.md` §2–§4. **Correction:** the previous draft had the Nano's header
pins being soldered; the Nano 33 BLE is one board and needs none (`ironpal-imu-poc-integration-plan.md`).

**Q41. Must the working prototype be taken apart to film it?** No — the steps are re-done on a spare
band or re-performed for the camera. **ASSUMED** — the same honesty test as Q19: the steps shown are
the steps it was built with. *Against:* a re-performed build is a re-enactment, if anyone asks.

**Q42. How do the microcontrollers the direction names appear?** The Nano (MCU + BLE + IMU on one
board) is assembled for real; the ESP32-C3 + ICM-42688-P board appears only as its PCB layout,
chipped `DESIGNED, NOT YET BUILT`. **EVIDENCE** — schematic and layout exist, the board was never
built. Whether its loose parts are on the desk to film is **OPEN** — only the founder knows.

**Q43. Name the parts on screen?** Yes — tags with real part names on the flat-lay and the Nano step.
**ASSUMED** — the direction asks for the parts to be featured, and an unnamed board is just a board
to a backer. *Against:* part numbers on screen invite spec questions; tags carry names, not specs.

**Most worth a veto, riskiest first:** Q38 (a silent beat in a wall-to-wall-talk film), Q29 (generated lab electronics next to the real prototype), Q32 (Flow may still paint pseudo-text on blurred screens), Q16 (did the phone rig really fail on tilt?), Q22/Q25
(the claims), Q23 (whether the live recognition works at all), Q19 (re-staging prototype 1),
Q10 (bandless Peter for two more clips).
