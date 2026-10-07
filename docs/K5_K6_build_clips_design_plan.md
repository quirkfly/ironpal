# K5 + K6 — how IronPal was built · design plan

**Written 2026-10-07. Grilled in auto mode the same day, then revised the same day when the founder
set the locations — K5 assembling the MVP hardware in the lab, K6 coding and testing the software —
and supplied one photo of his real lab for both (§2.1). Ledger:
[`K5_K6_build_clips_design_plan_grilled.md`](K5_K6_build_clips_design_plan_grilled.md).** Two new
clips that turn the K1–K9 YouTube promo into a crowdfunding film: the MVP **hardware** build (new K5)
and the MVP **software** build (new K6), inserted between the turn and the reveal. Companion to
[`IRONPAL_PROMO_VIDEO_SCRIPT_V1.md`](IRONPAL_PROMO_VIDEO_SCRIPT_V1.md) (prompt conventions, guards,
inset mechanism) and [`K1_K9_mastering.md`](K1_K9_mastering.md) (the assembly and master pipeline).

---

## 1. What changes in the film

| new | was | line (unchanged unless new) | source |
|---|---|---|---|
| K1–K3 | K1–K3 | money, catch, old way | as is |
| **K4** | K4 | *"Eventually I got tired of typing and started building my own solution."* | **as is** — the setup both new clips pay off |
| **K5** | — | **hardware build** — §3 | **new** |
| **K6** | — | **software build** — §4 | **new** |
| K7 | K5 | *"IronPal. A headband. It watches my set and fills in the log itself."* | renumbered |
| K8 | K6 | *"Tiny camera. Motion sensors. And my own model, running on your phone."* | renumbered; still the Extend of K7 |
| K9 | K7 | the two-arm curl demonstration | renumbered |
| K10 | K8 | the form beat | renumbered |
| K11 | K9 | the outro / CTA | renumbered |

The brief named only *existing K5 → K7*; the rest shift by two because nothing is cut.
**Runtime:** the K1–K9 master is 72.96 s; K5 at ≈ 14 s (its silent assembly beat, §3.4) and K6 at ~9.5 s make it **≈ 96 s**.
That is short for a crowdfunding page, where two to three minutes is normal, so length is no longer
an argument against these clips. The ≈ 59 s target in `founder_video_final.md` was a YouTube target.
**The YouTube cut stays as it is**; this is a second deliverable, `K1_K11_crowdfunding`.

**Why the clips go here and nowhere else.** K4 ends on *"started building my own solution"*, which
promises a process and does not say what it is. The reveal (K7) then names the product. Two clips
of *how* between the promise and the name are the only place a build story reads as story and not
as appendix. Put after the reveal, they would read as a technical footnote to a product already sold.

---

## 2. The rule these two clips exist to keep

**Everything shown as the prototype, the build or the app must be real footage.** Crowdfunding
backers judge a hardware project on whether the thing exists. Both platforms' rules point the same
way: Kickstarter bans photorealistic renderings presented as a product; Indiegogo requires an honest
representation of the project's current state. The rest of the film is generated, and that is
acceptable because it is a founder talking. **A generated circuit board or a generated app screen in
a "how I built it" clip would be a fabricated prototype.** A generated *room* is not: the lab is a setting,
like the gym. So:

- **Google Flow generates Peter and the room, never the product.** He delivers the line, so the
  voice comes from the generation, as the founder has ruled for every clip (`K7_design_plan.md` §1).
  He is on screen for the head and the tail of each clip, in the founder's lab, matched to a photo of the real one.
- **The middle of each clip is real material, full frame**, cut over his voice: footage shot through
  the prototypes, photographs and video of the actual rig, real screen recordings of the real app
  and repo, and real sensor data.
- **Every real shot carries a small date chip** (`PROTOTYPE 1 · JUN 2026`). It is added in post,
  outside the generation, where the no-writing ban does not apply. The chips make the timeline
  legible and say "this is real" without a disclaimer.
- **What does not exist yet is not shown as existing.** The 8 mm flush lens, the teal LED, the
  enclosure and the custom PCB are planned, not built (`ironpal-capture-hardware-decision-log.md`,
  `ironpal-tier1-capture-module-spec.md`). The PCB *layout* may appear, chipped `DESIGN · NOT YET
  BUILT`. A rendered board may not.

### 2.1 The founder's lab — one real room for both clips

The founder set the locations on 2026-10-07 — **K5: assembling the MVP hardware in the lab; K6:
coding and testing the software** — and then supplied the room: **one photo of his real workspace,
used for both clips** (`input/kickstarter/k5k6/lab_reference.jpg`, the A52, 2026-10-07 18:07). It is
a white-walled corner with a white desk under **five lit screens** — two Samsung monitors side by
side, one above them on an arm, a fourth on the wall to the right, and a laptop with a green-backlit
keyboard on the left — a desk lamp, a black keyboard and mouse mat, a phone, cables, and cool daylight
from a window on the left. **The lab and the office are the same room**, which is the truth of a solo
founder's build and makes the cut between the generated shot and the real B-roll a match by
construction.

That puts generated screens in frame in both clips, and generated electronics in K5 — the two things
§2 forbids being *presented as the product*. Five rules keep it honest:

1. **Flow gets a blurred copy of the photo, never the original.** The real screens are full of
   legible text: code, a terminal, and the IronPal landing page with its *Live set* concept panel.
   Handed that, Flow either reproduces it as garbled pseudo-text or paints a fake app. The reference
   is `input/kickstarter/k5k6/lab_reference_flow_16x9.jpg`: every screen is blurred to a glow with
   nothing legible, and the frame is cropped to 16:9 at 1920×1080. `scripts/k5k6/blur_lab.py` builds
   it from the original and is re-runnable.
2. **The screens stay lit, behind him and out of focus.** Turning them away is impossible in this
   room, and switching them off would make it not this room. He sits in front of the desk, turned to
   camera, with the glowing screens soft behind him. **A take where any screen carries legible or
   pseudo-legible text is a re-roll**, the same gate as burned-in captions.
3. **In K5, the work on the desk is generic and soft.** A small cleared patch at the left end of the
   desk, by the laptop, with a few loose components, tweezers and a small anonymous board. **No
   headband, no camera module, nothing teal.** The first real cutaway — the actual prototype — follows
   within 1.5 s, so the real thing is what the viewer reads as the prototype.
4. **The two clips are told apart by where he sits, not by the room.** K5: at the left end of the
   desk by the laptop, three-quarter to camera, turning from the parts. K6: in front of the two
   middle monitors, the keyboard behind him, turning from it. Same room, two positions.
5. **He stops working to talk.** He turns from the work and talks to camera with his hands resting
   on his knees or the desk edge. Talking while soldering or typing puts both hands in motion near
   small objects — the highest hand risk in this film (`K7_design_plan.md` §3.4) — and splits the
   eyeline between the work and the lens.

**The photo is also real footage**, and it belongs in K6 as an establishing still (§4.4, shot 1b):
the founder's actual desk, the actual code. For that use the **original** goes in, with one change:
the right-hand wall monitor's terminal shows local paths and another project's logs, so it is blurred
for privacy, and so is the laptop's session. That file is `input/kickstarter/k5k6/lab_broll_still.jpg`,
built by the same script. The two code monitors and the landing-page monitor, which carries its
*Product interface concept* label, stay as they are.

**The consequence for K7.** The reveal's inset is the AI product still (`S3/selected.jpg`), and it
now follows two clips of real prototype. **It needs a `DESIGN RENDER` chip** or the cut implies the
render is what K5 built. **OPEN** (§7): this edits a clip already accepted.

---

## 3. K5 — the hardware build

### 3.1 What it has to do

Show that the founder went through real dead ends and arrived at a working camera-plus-motion rig,
and get a laugh doing it. The true story, from `ironpal-capture-hardware-decision-log.md`:

- **June 2026: prototype 1 was the Samsung A52 strapped to a headband**, which was the camera, the
  motion sensor and the computer in one. The clips in `input/kb/clips/202606*` were shot this way.
- **It failed on head angle (D3):** a few degrees of head tilt and the narrow lens lost the scene.
  The log calls the tested rig *"a narrow-FOV headband"*. That it was the strapped A52 is inferred
  from the June clips, not stated, so **the founder should confirm it**. If it was a different
  narrow camera, the middle sentence becomes *"Tilt my head, the lens loses the bar."* (17 words).
- **The dead ends:** a baseball cap (the brim blocks the downward view, D2); 360 cameras (every one
  is 80–114 mm tall); "8K 360 mini" cameras (fake listings, §3.1); an 88° IMX577 board (rejected).
- **August 2026: prototype 2** is an ELP IMX415 board with a **200° fisheye**, taken out of its case,
  plus an **Arduino Nano 33 BLE** motion board, in a terry headband, with the camera cabled to the
  phone in a pocket. First fisheye clip: `IPS_2026-08-02.15.33.00.0640.mp4`. BLE link verified
  2026-08-05: 60 Hz, 0 lost packets.
- **How prototype 2 is assembled** (`ironpal-gym-session-01-plan.md` §2–§4), which is what K5 now
  shows step by step: the ELP board comes **out of its case**; its back is **insulated with kapton or
  electrical tape** against sweat; a **lens hole is cut** in the terry band and its edge
  **heat-sealed**; the board goes in behind the hole; the **Nano 33 BLE** rides alongside it; both
  cables are **looped once and taped** to the band so a pull loads the tape, not the solder pad; the
  camera cable runs over the shoulder to the A52, the Nano's to a pocket power bank. **The Nano needs
  no soldering** — MCU, BLE and the BMI270/BMM150 motion sensors are one 45×18 mm board.
- **The next board is a drawing:** an ESP32-C3 microcontroller with an ICM-42688-P motion sensor and
  TP4056 charging, schematic and PCB layout in `docs/assets/imu-poc-{schematic,pcb-layout}.svg`.
  Designed, not built.

### 3.2 The line

The register is **wry**: K1–K3 are salesmanship and K4 is the turn, and a dead-ends story is
naturally funny. **Budget: a 10 s clip at the 2.04 w/s pitch rate, minus ~1 s of deliberate pause =
≤ 18 words.**

| | line | words | note |
|---|---|---|---|
| A | *"Prototype one: my phone, strapped to my forehead. Tilt my head, the bar's gone. So: a fisheye."* | 17 | **chosen** — every clause true, every clause picturable, a joke in the middle |
| B | *"Version one was my phone on my head. Version two: a fisheye camera, a motion board, cables everywhere."* | 18 | lists parts K8 already lists |
| C | *"Caps block the view. 360 cameras are bricks. The cheap ones are fake. So I built my own."* | 18 | funniest; claims about other products, and no prototype in it |

**A is chosen.** It pictures directly onto real material shot for shot (§3.4). It sets up K8's
*"Tiny camera. Motion sensors."* without saying it first. And its middle sentence is the actual
engineering reason (D3) told as a gag. C's dead ends survive as the graphic in shot 4, where they
cost no words and make no spoken claim about anyone's product.

**Claims.** *"My phone, strapped to my forehead"* and *"a fisheye"* are true and are prototype
history, not product claims, but `validate_claims` traces every line to the allowlist. Proposed
entry **20** (entry 19 is K10's pending form claim):

> *"IronPal's first prototype was a phone strapped to a headband; the current prototype is a 200°
> fisheye camera board and an Arduino Nano 33 BLE motion-sensor board on a headband, wired to the
> phone. A custom board (ESP32-C3, ICM-42688-P) is designed but not built."*

The part names on the chips (§3.4 shots 5, 6d, 8) are covered by the same entry.

**OPEN** — allowlist entries are claims on the record and need the founder's yes.

### 3.3 The generated shot (Peter)

| | |
|---|---|
| character | **`Peter Pitch`**, bandless — the waist-up variant K2 and K3 resolved against, because he is seated. The band is revealed in K7; the prototype is shown in real footage, never generated |
| framing | medium, **waist up, centred**, locked-off 35 mm at seated chest height. No inset, so no reserved third |
| place | **the founder's lab** (§2.1): the white desk under five glowing, out-of-focus screens, white walls, a desk lamp, cool window light from the left; **reference frame `lab_reference_flow_16x9.jpg`** |
| position | at the **left end of the desk, by the laptop**, three-quarter to camera; a small cleared patch with generic loose parts beside him |
| wardrobe | the same plain black tank top and nothing on his head: the film's continuity outweighs dressing for the room |
| action | seated, he sets a pair of tweezers down, turns from the parts to camera and talks with his hands resting; **one rueful half-smile** on *"the bar's gone"* |
| pause | **a deliberate beat of silence before *"So: a fisheye."*** — the dead-ends graphic plays in it |
| model | **Omni 1.1 Flash, 10 s, 16:9, 1080p**, a fresh generation — the K9/K10 precedent; an Extend comes back at 720p (§5.12) |

**K4 → K5 is now a change of room**, from the dark gym to the bright lab: the gym walk-in ends on *"started building my own solution"*
and the next frame is the lab. That cut is the story; it needs no transition.

Only the first ~1.5 s and the last ~1.5 s of Peter are on screen. **The take is still judged on the
whole lip-sync**, because the voice runs under the cutaways and a slip in the middle is audible.

### 3.4 Shot list — ≈ 14 s

**The founder's direction, 2026-10-07: K5 must show the prefabricated parts being assembled into
the MVP, and the parts the docs name — the Arduino IMU module, the sensors, the microcontrollers.**
Ten seconds of line cannot also carry an assembly, so **K5 grows a 3.6 s silent assembly beat after
the line**, cut to the music with no voice. The voice rule is about where the voice comes from, not
about every second having one. The Flow clip supplies the head, and its **silent final hold** —
he finishes the line and holds the look — supplies the tail, placed after the assembly. The parts
are real and are shown by real footage only (§2): the generated desk stays generic.

| # | time | picture | source | chip | under it |
|---|---|---|---|---|---|
| 1 | 0.0–1.5 | Peter at the left end of the desk, turning from the parts | **Flow**, 0.0–1.5 | — | *"Prototype one:"* |
| 2 | 1.5–3.5 | **the founder wearing the A52 strapped to a headband**, side-on | **H1** | `PROTOTYPE 1 · JUN 2026` | *"my phone, strapped to my forehead."* |
| 3 | 3.5–5.0 | **the POV from that phone**: the bar in frame; the head tilts and it slides out | **H2**; fallback `input/kb/clips/20260614_*` | `PROTOTYPE 1` | *"Tilt my head, the bar's gone."* |
| 4 | 5.0–6.4 | **dead-ends cards**, dealt and struck through | HTML graphic | — | the pause |
| 5 | 6.4–8.0 | **the parts, flat-lay**: top-down on the real desk — the ELP board still in its case, the Arduino Nano 33 BLE, the terry headband, a roll of kapton tape, the cables, the power bank. Each part gets a name tag as it is touched by a finger | **H6** | per part: `ELP IMX415 · 200° FISHEYE` · `ARDUINO NANO 33 BLE · IMU` · `TERRY HEADBAND` | *"So: a fisheye."* |
| 6a | 8.0–8.8 | **de-casing**: the camera board lifted out of its housing | **H5a** | `ASSEMBLY · AUG 2026` | music |
| 6b | 8.8–9.5 | **kapton tape** smoothed over the back of the board | **H5b** | — | music |
| 6c | 9.5–10.2 | **the lens pushed through the cut hole** in the band from behind | **H5c** | — | music |
| 6d | 10.2–10.9 | **the Nano** set alongside it; **cables looped and taped** to the band | **H5d** | `MCU + BLE + MOTION SENSORS · ONE BOARD` | music |
| 6e | 10.9–11.6 | **the band goes on**, the cable over the shoulder to the A52 in the pocket | **H4** | `PROTOTYPE 2` | music |
| 7 | 11.6–12.4 | **the first fisheye clip**: the 200° view from 2 Aug at the curl | **real**, `IPS_2026-08-02.15.33.00.0640.mp4` | `FIRST TEST · 2 AUG` | music |
| 8 | 12.4–13.0 | **the next board**: the ESP32-C3 + ICM-42688-P PCB layout drawn on in teal, line by line | `docs/assets/imu-poc-pcb-layout.svg`, animated | `NEXT BOARD · DESIGNED, NOT YET BUILT` | music |
| 9 | 13.0–14.2 | Peter at the desk, holding the look | **Flow**, its final 1.2 s | — | — |

**The assembly beat is cut on the music, not the words** — 0.7 s a step on the bar, five steps in
one phrase. Each step is one action with a clear start and end, filmed so it reads in 0.7 s:
macro, top-down or over the shoulder, hands entering and leaving frame.

**Shot 8 is the only place the microcontroller design appears**, and it is chipped as a design.
**If the founder owns the loose next-board parts** (a XIAO ESP32-C3, an ICM-42688-P breakout, a
TP4056 module), a real 0.6 s flat-lay of them replaces the drawing — chipped `NEXT BOARD · PARTS`,
not as something assembled. **OPEN:** whether they are on the desk is something only he knows.

**Cut on the words, not the seconds.** The times above assume ~2 w/s. Re-time every cut to the
whisper word boundaries of the actual take, the way the master's captions already are (`K1_K9_mastering.md`
stage 8). Shot 4 sits in the pause, so if the take has no pause, shot 4 drops and shot 3 holds. Shots 6a–8 are
silent by design, so their length is set by the music, not the take; **the Flow clip's last 1.2 s
must be silent, mouth closed**, which the prompt already asks for, or shot 9 has nothing to show.

### 3.5 The new real shoot — hardware (≈ 1 h 15 min: the gym for H1/H2, the lab desk for the rest)

All on a second phone, **16:9, 4K, 24 fps**, landscape, and graded afterwards with the film.

| id | what | how | length |
|---|---|---|---|
| **H1** | the founder wearing the A52 strapped to a headband, as in June | second phone on a tripod, side-on or into the mirror; he does a slow curl and tilts his head once | 6 s |
| **H2** | the A52's own recording during H1 | the strapped phone records at the same time; landscape, the 90° rotation fixed in post as in POC v1 | same take |
| **H6** | **the parts flat-lay** on the left end of the real desk: the ELP board in its case, the Nano 33 BLE, the terry band, kapton tape, the USB cables, the power bank — laid out square, a finger touching each in turn | phone on a top-down arm or held level above; daylight from the window, no harsh lamp; 4K so each part can be cropped for its name tag | 8 s |
| **H5a–d** | **the assembly, step by step**, at the same spot: (a) the board out of its case; (b) kapton over its back; (c) the lens through the hole in the band; (d) the Nano alongside, cables looped and taped | **one step per take**, 3–4 s each, so each can be cut to 0.7 s; macro or top-down, hands entering and leaving frame. **Use a spare band or re-do it for the camera** — the working prototype does not need to be taken apart for this, as long as the steps shown are the steps it was built with | 4 × 4 s |
| **H3** | ~~prototype 2 on a bench, push-in~~ | **folded into H6 and H5** | — |
| **R1** | ~~a wide still of the real lab~~ **DONE** — `input/kickstarter/k5k6/lab_reference.jpg`, supplied by the founder 2026-10-07; the Flow copy has its screens blurred (§2.1) | — | — |
| **H4** | prototype 2 worn: the band goes on, cable over the shoulder to the A52 in the pocket | tripod, waist up, he turns once to show the cable | 5 s — **shot 6e**, no longer spare |

**The real founder is on screen in H1 and H4, next to a generated Peter minted from his photos.**
That is deliberate. A crowdfunding viewer is asking whether there is a real person behind this, and
these are the first frames in the film that answer it. The likeness gap between the two is the
cost. Keep H1 side-on and H4 waist-up so the rig, not the face, is the subject of the frame, but
do not hide him.

**H1/H2 are a re-staging of a real configuration**, not period footage: the June rig was never
filmed from outside. That is honest as long as the chip says `PROTOTYPE 1`, which describes the
rig, and not `JUNE 2026 FOOTAGE`, which would describe the recording. The chip dates the prototype.

---

## 4. K6 — the software build

### 4.1 What it has to do

Show that the software is real and built, not a promise, and **show the recogniser working on a
real set** — the film's biggest gap. Shooting K10 as the form beat left
*"no clip in the film shows the recogniser working"* (`IRONPAL_PROMO_VIDEO_SCRIPT_V1.md` §5.18, item 11).
K6 is where that gets fixed, because a build clip is the one place a real screen recording on a raw
phone is the right picture and not a downgrade.

The true story (`ironpal-poc-v1.md`, `ironpal-self-training-prd_grilled.md`, `poc/`):

- **May 2026: POC v1** — a React Native app, Kotlin modules for IMU rep counting, a FastAPI backend.
- **June–July: a video-analysis knowledge base** of real first-person gym clips, built case by case.
- **September: the self-training pivot** — each user teaches their own on-device model through a
  game-like tagging loop. The engine runs at 4.4 ms a tick on the A52; the labeling studio is built.
- **What is not yet true:** matching accuracy is unmeasured, MoViNet is design only, and
  weight-reading is the hard problem being built (claim 8).

### 4.2 The line

The register is **conviction**, lifting out of K5's joke into the reveal. Same budget: **≤ 18 words**.

| | line | words | note |
|---|---|---|---|
| A | *"Then the software. It counts reps from motion, and you teach it your exercises, like a game."* | 17 | **chosen** |
| B | *"Then the code. Every set I filmed, I tagged, until the app counted my reps on its own."* | 18 | implies tagging trained the rep counter; the counter is algorithmic, so that is false |
| C | *"Five months of code. A rep counter, a training game, and a few thousand of my own reps."* | 18 | the numbers need a source nobody has measured |

**A is chosen.** *"It counts reps from motion"* is the POC's IMU rep counter and is what shot 5 shows
happening. *"You teach it your exercises, like a game"* is the self-training loop, which is the
product's real direction and the studio is built. It is also new information: no other line in the
film says the user trains it. It does not repeat K8 (*"my own model, running on your phone"*); it says
what the model *does*.

**Claims.** Two clauses need allowlist entries — proposed entry **21**:

> *"IronPal counts reps from the band's motion sensor, and each user teaches it their own exercises
> by tagging sets in a game-like loop in the app."*

**OPEN** — the founder's yes, as for entry 20. **The tense is also OPEN:** *"you teach it"* states the
design. The engine and studio exist, but matching has not been measured. If the founder wants the
line to describe only what is validated, the fallback is *"…and I'm teaching it my exercises, like a
game."* — 17 words, the same picture, true today.

### 4.3 The generated shot (Peter)

The same as K5 (§3.3) — `Peter Pitch`, seated, waist up, centred, locked off — with three
differences:

- **The same room, a different seat** (§2.1, rule 4): in front of the two middle monitors, the
  keyboard and mouse behind him, the glowing screens soft over his shoulders. The same reference
  frame as K5.
- **The action:** he turns his chair from the keyboard to the camera, hands resting, and talks.
  The "testing" half of the brief is carried by the real footage (S2, S4), where it is true.
- **The read** lifts from wry to **conviction**, landing *"like a game"* with a small grin. **No pause.**

### 4.4 Shot list — 10.0 s

| # | time | picture | source | chip | under the line |
|---|---|---|---|---|---|
| 1 | 0.0–1.4 | Peter in front of the middle monitors, swivelling from the keyboard to camera | **Flow** | — | *"Then the software."* |
| 1b | 1.4–2.0 | **the real desk**: the founder's photo, slow push-in toward the code monitors | **real**, `input/kickstarter/k5k6/lab_broll_still.jpg` (§2.1) | `THE LAB · OCT 2026` | *"It counts…"* |
| 2 | 2.0–2.8 | **the repo**: a fast scroll through `git log`, 130+ commits since April, landing on the rep-counter Kotlin module | **new screen recording S1** of the real repo | `POC · MAY 2026` | *"It counts reps…"* |
| 3 | 2.8–4.6 | **the motion trace**: a real Nano IMU recording of a set, the trace drawn left to right, each rep peak lighting teal as it is counted | **new capture S2** → `/plot-sensors`, animated | `REAL SENSOR DATA` | *"…from motion,"* |
| 4 | 4.6–6.6 | **the labeling studio**: a real clip in the studio, the founder tags it and the tag lands | **new screen recording S3** of the app on the A52 | `TRAINING GAME · SEP 2026` | *"and you teach it your exercises,"* |
| 5 | 6.6–8.6 | **the recogniser, live**: the LiveHud on the A52 naming *Bulgarian split squat* and counting real reps, with the founder doing them, picture-in-picture | **new shoot S4** — the A52 screen recorded during a real set, plus a tripod shot of the set | `LIVE · REAL SET` | *"like a game."* |
| 6 | 8.6–10.0 | Peter at the desk, landing the grin | **Flow** | — | — |

**Shot 5 is the most valuable four seconds in the crowdfunding cut**: the only real recognition in
the film. The pairing is the point: the founder's leg goes down on the tripod shot, the counter on
the phone moves. The same rule as K9's inset applies, but this time nothing needs retiming, because
**both halves are the same real moment**.

### 4.5 The new real shoot — software (≈ 1 h, gym and desk)

| id | what | how | length |
|---|---|---|---|
| **S1** | the repo: `git log --oneline` scrolling, then the rep-counter source | screen capture at 1080p, dark terminal theme, font ≥ 20 px so it survives at film scale; **no secrets, tokens or `.env` on screen** | 6 s |
| **S2** | a real set with the Nano on: 6–8 Bulgarian split squats | record the BLE session to `input/kb/sessions/`, run `/plot-sensors`, then animate the trace with the rep marks; the only real IMU log on disk today is stationary | one set |
| **S3** | the studio on the A52: open a real KB clip, tag it, confirm | Android screen recording at native resolution | 8 s |
| **S5** | **the founder coding at the real desk**: over the shoulder, the real repo on the real screen, then a run of the tests passing | tripod behind the chair; the screen is real here, so it may show; **no secrets on screen**, as S1 | 6 s — **spare**, intercut with S1 if the scroll alone is thin |
| **S4** | **the live split squat**: the A52 screen recording LiveHud while the founder does 4–6 reps wearing the rig, plus a tripod side shot of the same set | the screen recording and the tripod clip synced on a clap | one set, 3 takes |

**S4 is a test, not just a shot.** No gym session documenting a correct live recognition exists on
disk (the session-01 plan was never written up). **If LiveHud names and counts the set correctly,
shot 5 is real and is used as recorded. If it does not, it is not faked.** The fallback is
`input/kickstarter/k7/k7_hud_real.mp4` (the real app driven by a recorded replay), chipped
`TEST REPLAY`, and the line is unaffected.

---

## 5. Visual language shared by both clips

| element | spec |
|---|---|
| aspect | 1920×1080, 24 fps — the master's format |
| Flow head/tail | graded by `scripts/master/build.py` stage 5, but **not pulled all the way to the gym look**: the lab is white walls, cool daylight and screen glow, and graded into the gym's warm Y 42 it would stop being the room in the photo. The solver's 70 % pull toward Y 42 / warmth +22 is reduced to ~40 % for both clips, which share one look because they share one room |
| real footage | **lighter grade than the Flow clips**: the same warmth target, contrast left alone, no fake film look. Raw phone footage should look like phone footage |
| fisheye | shown **uncorrected** in shot 6 of K5. The distortion is the point |
| screen recordings | full frame, no phone bezel, slow 1.00→1.04 push-in so a static UI still moves |
| date chips | lower left, 64 px in from the edges; `IRONPAL` display face, 800, 22 px, letter-spacing .1em; accent `#00E5CC` dot + white text on `rgba(16,16,35,.72)`, 8 px radius; in 0.2 s after the cut, out with it. Rendered from HTML like the end card |
| part name tags | K5 shots 5, 6d: the date-chip style, placed beside the part with a 1 px teal leader line to it; in as the finger touches the part, out on the cut. Real part names only — no specs beyond what the docs record |
| transitions | hard cuts on word boundaries; in K5's silent assembly beat, on the music's beat instead. No whip pans, no glitches — the material is the energy |
| dead-ends cards | four `#101023` cards, 30 px radius, dealt left to right in 0.25 s each, then struck through by a single teal line together; card text is the only on-screen text over 3 words in the clip |
| captions | the master's burned captions continue through both clips (stage 8), held clear of the date chips, which sit lower left while captions are bottom centre |
| audio | **voice from Flow only**. Real footage is muted; the music bed continues; no sync sound from the shoots |

---

## 6. The two Flow prompts, ready to paste

Both keep the accepted K4 prompt's guards (`IRONPAL_PROMO_VIDEO_SCRIPT_V1.md` §5.7) — the no-writing
opening, the hand rules, the bandless head, the one-speaker audio block — and replace the gym walk-in
with a seated medium shot in the founder's lab. The rules of §2.1 are written into each.
Paste as **plain text**: markup reaches Flow as prompt text (§5.12). Add the **`Peter Pitch`**
character via *Add ingredients* and keep the name in the pasted text, then add
**`input/kickstarter/k5k6/lab_reference_flow_16x9.jpg`** — the founder's lab with its screens
blurred — as the frame reference for **both** clips. After a refusal, **retry before
rewording** — policy refusals are free and often clear on a retry (runbook §0).

The wardrobe clause drops the shorts and trainers: he is seated and framed from the waist up, so
they are out of shot, and describing what is out of frame invites the model to bring it into frame.

### 6.1 K5 — the lab, at the parts

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no logos, no labels, no UI, and no letters or numerals anywhere in frame. Peter Pitch sits on an office chair at the left end of a white desk in a small, white-walled home lab, at first turned toward the work beside him — the same room as the reference image: five computer screens glowing softly behind and beside him, two side by side on the desk, one above them on an arm, one on the wall to the right and an open laptop with a green-backlit keyboard at his left, a small chrome desk lamp, a black keyboard and mouse, cables trailing off the back of the desk, cool daylight from a window on the left. Every screen is OUT OF FOCUS, a soft glow with NOTHING legible on it — no text, no code, no letters, no images, no interface. On the cleared corner of the desk beside him lie a few small loose electronic components, a pair of tweezers and a small plain circuit board, in soft focus. At the very start he sets the tweezers down and turns from the parts to the camera, then talks straight to camera for the rest of the shot, his forearms and hands RESTING STILL on his knees or the desk edge, relaxed, with at most a small lift of one open hand on the punchline. He does NOT pick anything up again, does NOT solder, does NOT hold any device, and there is no headband, no camera and nothing coloured teal anywhere on the desk. His face is alive: eyebrows active, eyes bright, with a dry, self-mocking humour and a rueful half-smile on the middle sentence. He is wearing a plain matte-black tank top, with nothing on his head: no headband, no hat, no cap, no strap, no magnifier visor, no glasses pushed up, nothing across his forehead and nothing around his neck. His clothing is plain, with nothing clipped, pinned or attached to it, and nothing worn in or over his ears. He is ALONE in the room — no other people in frame. Each hand has exactly five correctly shaped fingers in every frame. He never raises a hand to his head or face, never counts on his fingers, never points at the camera and never splays or fans his fingers. A LOCKED-OFF MEDIUM SHOT ON A 35mm LENS AT SEATED CHEST HEIGHT, framed from the waist up, with him CENTRED in the frame and facing the camera. The camera does not move and the room behind him never changes or cuts to a different place. Audio: one clear man's voice, lip-synced to him, warm and confident with a dry, self-deprecating wit — the voice of a man telling a story against himself, the pitch rising and falling. He says the first two sentences briskly, then STOPS for one full second of silence with his mouth closed and the half-smile held, then lands the last three words as the punchline. Upbeat and engaged, NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless. ONE single take: "Prototype one: my phone, strapped to my forehead. Tilt my head, the bar's gone. So: a fisheye.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture — not over the shot, not along the bottom, not on his clothing, not on any surface in the room. Say that line EXACTLY ONCE, word for word, start to finish — all 17 words, in that order, and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence, and do NOT ad-lib, pad or add filler words that are not written above. ONE single speaker for the WHOLE line: the same man's voice from the first word to the last, not changing speaker, gender, age or timbre part way through, and no second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed, holding the look. No other dialogue, no ambient sound, no music.
```

### 6.2 K6 — the lab, at the keyboard

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. Nothing in this shot is written on: no captions, no subtitles, no titles, no logos, no labels, no UI, and no letters or numerals anywhere in frame. Peter Pitch sits on an office chair in front of a white desk in a small, white-walled home lab — the same room as the reference image — with two computer monitors side by side on the desk directly behind him, a third above them on an arm, a fourth on the wall to the right and an open laptop with a green-backlit keyboard at the far left, a black keyboard and mouse on the desk behind him, a small chrome desk lamp, cool daylight from a window on the left. Every screen is OUT OF FOCUS, a soft glow with NOTHING legible on it — no text, no code, no letters, no images, no interface. At the very start he lifts his hands off the keyboard behind him and swivels his chair round to face the camera, then talks straight to camera for the rest of the shot, his forearms and hands RESTING STILL on his knees, relaxed, with at most a small lift of one open hand as the line builds. He does NOT type, does NOT pick anything up, and never mimes typing. His face is alive: eyebrows active, eyes bright, conviction building across the line, finishing on a small, pleased grin. He is wearing a plain matte-black tank top, with nothing on his head: no headband, no hat, no cap, no strap, no magnifier visor, no glasses pushed up, nothing across his forehead and nothing around his neck. His clothing is plain, with nothing clipped, pinned or attached to it, and nothing worn in or over his ears. He is ALONE in the room — no other people in frame. Each hand has exactly five correctly shaped fingers in every frame. He never raises a hand to his head or face, never counts on his fingers, never points at the camera and never splays or fans his fingers. A LOCKED-OFF MEDIUM SHOT ON A 35mm LENS AT SEATED CHEST HEIGHT, framed from the waist up, with him CENTRED in the frame and facing the camera. The camera does not move and the room behind him never changes or cuts to a different place. Audio: one clear man's voice, lip-synced to him, spoken with ENERGY and CONVICTION — confident, warm and persuasive, the pitch rising and falling, each of the two things landed in turn and the last three words delivered with a grin. Upbeat and engaged, NOT flat, NOT monotone, NOT read aloud, NOT shouted, NOT breathless. ONE single take: "Then the software. It counts reps from motion, and you teach it your exercises, like a game.". Those words are SPOKEN ALOUD ONLY — they are audio, not a caption. Do NOT write, display, superimpose or print them, or any word or fragment of them, anywhere in the picture — not over the shot, not along the bottom, not on his clothing, not on any surface in the room. Say that line EXACTLY ONCE, word for word, start to finish — all 17 words, in that order, and then STOP. Do NOT repeat, echo, stammer or re-start any word, phrase or sentence, and do NOT ad-lib, pad or add filler words that are not written above. ONE single speaker for the WHOLE line: the same man's voice from the first word to the last, not changing speaker, gender, age or timbre part way through, and no second voice says any part of it. Nobody else speaks, on or off camera. After the final word he stops speaking and stays silent, mouth closed, holding the grin. No other dialogue, no ambient sound, no music.
```

**Judge each take in this order:** the line said once and complete → hands → bandless → no burned
text → **no screen shows legible or pseudo-legible text** → **nothing on the desk reads as a headband
or camera (K5)** → the room matches the photo → centred waist-up → the pause (K5 only). A take that fails the pause is still usable: shot 4
drops (§3.4). If the line overruns 10 s, cut *"So:"* in K5, or *"Then"* in K6.

---

## 7. Production order, and what is open

**Order.** Each step is cheap before the next costs anything.

1. **The real shoots first** (H1–H5, S1–S5). They are free, **S4
   decides what K6's shot 5 is**, and the lab reference is already built
   (`scripts/k5k6/blur_lab.py`), so Flow can be opened as soon as the shoots are done.
2. **The two Flow clips** — 2 renders, plus re-rolls.
3. **Graphics:** the chips, the dead-ends cards, the animated IMU trace — HTML renders, like the end card.
4. **Assembly:** `scripts/master/build.py` gains K5/K6 as **composed** segments (Flow audio,
   picture cut from Flow + real material), the renumbered clips, and a `K1_K11` output name. The
   per-clip floor/dialogue/EQ stages already handle a new clip; the music needs re-fitting, because
   the track was placed so its peak lands on the end card at 74–77 s, and the end card moves to
   ≈ 94 s.
5. **The config**, if the scripted pipeline is ever used again: 11 clips, two 10 s durations, and
   `primitives.json` caps raised a third time — or the crowdfunding cut stays a `build.py`-only
   artefact, which is the recommendation.

**Open — the founder's call:**

0. **Whether the loose next-board parts are on hand** (XIAO ESP32-C3, ICM-42688-P breakout, TP4056) —
   if yes, a real flat-lay replaces the PCB drawing in K5 shot 8 (§3.4).

1. **Allowlist entries 20 and 21** (§3.2, §4.2) — prototype history and the self-training claim.
2. **The tense of K6's line** — *"you teach it"* (design) or *"I'm teaching it"* (true today) (§4.2).
3. **A `DESIGN RENDER` chip on K7's inset** (§2) — it edits an accepted clip, and without it the
   reveal reads as the thing K5 just built.

**Decided, cheap to reverse:** the existing K8 (*"Tiny camera. Motion sensors. And my own model,
running on your phone."*) **stays**. It now follows two clips that showed both things, but after the
reveal it works as the spec read-out for the finished product. If the crowdfunding cut is ever
trimmed, it is the first candidate.
