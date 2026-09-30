# K7 — IronPal in use · design plan

**Written 2026-09-29. Grilled in auto mode, then revised and re-grilled after the founder settled
the exercise split and the inset source; line chosen 2026-09-29 (§5), prompt written as §5.13 of the
promo doc — ledger:
[`K7_design_plan_grilled.md`](K7_design_plan_grilled.md).** The clip that shows the product working,
after K5 named it and K6 said what is inside it. Companion to [`IRONPAL_PROMO_VIDEO_SCRIPT_V1.md`](IRONPAL_PROMO_VIDEO_SCRIPT_V1.md)
§5.9–5.12; the prompt conventions, guards and inset mechanism all come from there.

---

## 1. What this clip has to do

K5 and K6 are assertion — *here it is, here is what is inside it*. **K7 is the only clip in the film
that shows the thing actually working.** If a viewer believes one clip, it has to be this one, and
belief comes from the picture and the inset agreeing frame for frame: he curls, the counter moves.

**The exercise is a TWO-ARM dumbbell bicep curl — both arms together — driven by THREE REFERENCE
STILLS of the movement's bottom, middle and top**, with the line spoken in the generation.
**Alternation was conceded on 2026-09-29** after seven takes and six constructions; the one time the
movement ever rendered with both arms working, it was this form. The founder's call on 2026-09-29, after
alternation had failed four times on four text constructions (adverb, enumerated beats, see-saw,
speech-pinned) and a goblet squat had been proposed but not rolled.

**Why references beat wording.** Every failed version asked the model to *invent* the alternation.
Three stills do not ask — they show it: right-down/left-up, right-up/left-down, and the halfway
crossing frame. The clip prompt then gives a **path between pictures** (A → C → B → C → A → C → B)
rather than an abstract property of two limbs. The stills also back the full-length, left-of-centre
framing with a picture for the first time, and framing has failed nearly as often as the arms. What the record says: three alternating prompts each returned a clean **one-armed**
curl; a barbell curl and a both-arms-together curl each returned **no movement at all**; the same
two-arm shot **with the line removed rendered correctly on the first attempt**; and a single-arm
shot with the line worked and was then rejected.

**The mux route is closed.** The founder has ruled that the voice must come from Flow and that no
external audio may be used, so `input/kickstarter/k7/k7_voice_take4.wav` and
`scripts/k7/add_voice.sh` are shelved rather than deleted. The finding underneath them still matters
and shapes the prompt: **the lip-synced line is what suppresses the movement.**

**Pose A is a mirror of pose B**, made by `scripts/k7/flip_ref.sh` — the image generator shares the
video model's right-arm bias and returned pose B for both prompts, and the first reference-driven
clip failed because **the reference attached to it was pose B**. The three stills now on disk are
`input/kickstarter/k7/ref_{A_left_up,B_right_up,C_halfway}.jpg`. **The prompts behind them are
generated, not hand-written**: `scripts/k7/make_ref_prompts.py` emits them from one template with a
single substituted clause, and asserts they are otherwise byte-identical — three stills that differ in anything but the arms would hand the clip three
different shots to reconcile. §5.13 of the promo doc has the full grid, the by-hand caveat (an
automated clip gets exactly one reference), and the fallbacks if this fails.

Take 5 also exposed a bug worth remembering: its key instruction, *the two dumbbells are always at the
same height as each other in every frame*, is **satisfied perfectly by a man standing still**. The
rule is now explicit — **never write a motion constraint that stillness satisfies**; a symmetry clause
must be about travel, not relative position. A goblet squat was drafted in between and never rolled;
its reasoning is kept in §5.13 of the promo doc. The **Bulgarian split squat still goes to K8**.
**If both arms are wanted, the route is a silent clip with the line as voiceover** — §5.13 carries
that prompt too. That split matters more than it looks: the split squat is an
enrolled, IMU-led, POC-validated exercise, so **K8 can show a real recognition while K7 cannot**
(§2.2). Two clips, two different standards of proof, and the inset for each has to be built
accordingly.

The curl is the right choice for K7's *shot* for three reasons worth stating because they are not
obvious:

- **The movement is legible from the front.** A squat or a row reads as a blur head-on; a curl is a
  clean vertical arc, and at full length the camera sees the whole range.
- **It gives the rep counter something to do on a visible beat.** Four lifts across an 8 s clip land
  ~1.85 s apart, so the counter moves four times. **A counter that
  increments twice does not read as live** — three or four clears that floor. *This bullet originally
  argued for an alternating curl at ~1.2 s and six events; that margin cost four takes.*
- **The travel is shown, not described.** The clause that froze take 5 — *always at the same height
  as each other* — is satisfied by a man standing still. Three stills at three points along the
  path leave stillness unsupported by anything on screen.
- **Nothing crosses his face and the arms stay narrow** — the dumbbells stay below the chin, so the
  band reads at the top and bottom of every rep, and the right third stays clear. This retires the
  2.2 m bar's geometry problem (§3.1).

---

## 2. The honesty problem, before anything else

This clip makes the strongest functional claim in the film, and three things in the brief go beyond
what the record supports. None of them blocks the shot; all three change what the inset may show.

**2.1 "Real-time" is real for IMU, but it is outside the allowlist.** The POC's `LiveHudScreen`
does update live during a set — its own hint reads *"IMU reps/name update instantly & offline.
Weight and pushdown reps/name fill in from the backend."* So **live reps and a live IMU-led exercise
name are supportable; live weight is not, and neither is the vision-led pushdown** (`isVisionLed`).

> **OPEN — needs the founder.** Claim 10 describes a *different interaction*: *"After a set the app
> proposes the exercise, reps and weight, and one tap confirms it."* Either claim 10 is amended to
> cover live-during-set behaviour, or K7's line avoids the words "real time". Claims going on the
> record are not auto-decidable.
>
> **2026-09-29: the line takes the second branch** (§5) — it makes no timing claim at all. That
> settles the words. It does not settle the inset, which asserts live recognition by incrementing in
> sync with the curls; see §6.1.

**2.2 The bicep curl is the code's designated NEGATIVE class, and K7 features it anyway.**
`poc/mobile/src/controller/labels.ts` defines three labels (`bulgarian_split_squat`,
`triceps_pushdown`, `unknown`) and seeds `unknown` with:

```ts
{label: 'unknown', title: 'UNKNOWN: Off-target (Bicep Curl)', seedHint: 'do a few curls'}
```

`EXERCISE_DISPLAY.unknown` is `'—'`. **Shown a curl today, the real app displays a dash, by design.**

The founder has settled this: the curl stays in K7, the split squat goes to K8. So **K7's inset is a
designed interface concept, not a recording of a working recogniser** — and that makes the
*"Product interface concept"* label load-bearing rather than decorative. It is the single thing
standing between this clip and a claim the code contradicts. **It is not optional, and it is not
movable to the end card.**

The upside of the split: **K8 can be built the honest way.** A Bulgarian split squat is enrolled and
IMU-led, so K8's inset can come from a real POC recording (`hud_live_set`, already a required segment
in the config) rather than a mock. K7 sells the idea; K8 proves it.

**2.3 Weight-reading is the unvalidated headline.** Claim 9: *"Reading arbitrary free weights from a
first-person camera is the hard problem being built, not a finished or guaranteed feature."* A
dumbbell has its number on the end cap, facing away from a head-mounted camera for most of a curl —
and a plain one carries no number at all.
**Showing a live weight would be the least defensible frame in the film.**

**The mitigation the project already uses:** the landing page labels every app mockup *"Product
interface concept"* (`web/src/components/AppModules.astro`). **The K7 inset carries the same label**,
in the inset rather than on an end card, so the disclosure is per-frame. One caveat: **check it is
legible at final inset size** — an unreadable label is decoration, not disclosure, and should move
to the end card if it cannot be read.

---

## 3. The shot

### 3.1 Camera

| | |
|---|---|
| framing | **Full length, head to toe** — settled by the founder after the first take came back waist-up. Trainers just above the bottom edge, a small gap above his head, nothing cropped at any point |
| lens / height | 35 mm at chest height, **locked off**, about **four metres** — the same rig as K1, K4 and K5 at the distance K1's walking take opens on, and the only camera treatment this film uses |
| movement | none. He stands on the spot; the curl is the only motion in frame |
| position | he stands **left of centre**, right third clear for the inset |
| aspect | 16:9 |

**Waist-up was the original spec and it was wrong.** It was chosen because *tighter loses the
dumbbells at the bottom of the rep; wider loses the band* — and the founder has ruled that losing
band size is the acceptable half of that trade, because both arms working head to toe is what makes
the clip read as a real set. Three consequences, none of them optional:

- **The band will be small.** At four metres it is a few dozen pixels of forehead. K5 and K6 already
  carry the product in close-up and the inset carries the lockup, so K7 is the demonstration and not
  the product shot — but the lit-forehead clause in §3.2 matters more now, not less.
- **The wardrobe has to grow a lower half** (§3.3). `Peter`'s character card stops at the tank top.
- **The floor is now in shot**, so it has to be cleared, and his stance has to be planted or he
  wanders.

**Left-of-centre is still the instruction with the worst record in the film.** K5 was asked for an
empty right third and came back centred (§5.10); K7 take 4 came back at **55 %** of frame width,
measured. Dumbbells remove the compounding factor — two of them at the sides are a body's width,
where the 2.2 m barbell was **53.5 %** of a 4.11 m frame at four metres and put the inset at risk on
its own — but the subject still has to sit left or the right third is not clear. Stated as a position
and as a negative.

**Say the framing instruction more than once.** K5 asked for the right third empty and delivered a
centred subject with a 594 px margin instead of 640 (§5.10), and the first K7 was asked for waist-up
and is now being asked for the opposite. K7 states framing as a position, a negative and an explicit
*NOT a waist-up shot and NOT a close-up*.

### 3.2 Lighting

Same dark, moody gym: matte black rubber floor, low warm key, dumbbells behind. **One addition: the
key has to reach his forehead.** The band is the subject and it sits in the most easily shadowed
part of the frame, and a curl brings the head down slightly on each rep. The prompt asks for the
band to stay lit and sharp throughout the movement.

**Exposure is drifting and nobody owns it.** Measured mean luminance across what is shot: **K3
60.6, K4 55.4, K5 46.2, K6 49.7.** K7 is specified to the **mid-50s**, not the dark end — a dark
clip is the one that cannot be graded up without noise.

### 3.3 Props and wardrobe

| | |
|---|---|
| the weight | **a matched pair of plain matte-black dumbbells, one per hand, NO numbers and NO markings anywhere** — the same rule as K3's barbell plates. Numerals breach the no-writing ban and Veo garbles them |
| weight look | a load he can curl strictly, elbows in, without swinging. Nothing that implies a number |
| wardrobe | plain black tank top + the IronPal headband, exactly as `Peter`'s wardrobe in the config, **plus a lower half the card does not carry**: matte-black training shorts with a single thin electric-teal stripe down the outer seam of each leg, and plain black trainers — stated in the prompt, copied verbatim from `Peter Pitch FullBody` in K4, or K7 and K4 are two different men below the waist |
| band mark | **the plain teal ring only, NO lettering** — restated, because K5 grew a smudge beside the ring despite the ban (§5.10) |
| character | **`Peter Headband`** — the band-wearing one, as it is actually named in the Flow project. Not `Peter Pitch`. *The runbook §2.4 says to rename the mint to `Peter` and that never happened, so every prompt in the promo doc has named a character that does not exist. K7 is corrected; §5.13 records the wider question.* |

### 3.4 The action

1. He is **mid-set when the clip opens** — the clip opens on reference A and he is already moving
   out of it. A clip that begins with him picking the dumbbells up spends two of its eight seconds
   on nothing.
2. **Two-arm dumbbell curls, both arms together, driven by three reference stills** — the clip runs
   BOTTOM → MIDDLE → TOP → MIDDLE → BOTTOM, four times, **each dumbbell making four complete
   up-and-down journeys**. The single-arm stills (`ref_A`, `ref_B`) are the WRONG references for
   this and belong to the shelved alternating variant. Eight takes got here;
   §5.13 of the promo doc has the grid, including the self-defeating clauses that caused both
   freezes (*always at the same height as each other*, and a see-saw with no travel — **a man
   standing perfectly still satisfies either one**).
3. **He is square to the camera** — chest, shoulders and face front-on to the lens, not angled, not
   in profile. Stated as a body orientation, which it was not before take 6.
4. **The dumbbells stay below his chin**, so his face and the band read at every point in the
   movement. **One clause, not four** — the barbell version capped the height four separate ways,
   all of them pulling downward against the single instruction asking it to rise.
5. **Both hands visible in every frame** — never behind his back, never out of frame.
6. He **talks to camera while curling** — eyes on the lens, not on his arms. The line is spoken in
   the generation; no external audio.
7. **No glance down at the band, no touching it, no pointing at it.** The inset does that work.

**Note what has never failed**: the band, the plain unmarked weight, the grip and the five-finger
guard came back clean in take 4 while every motion and framing instruction failed. The product-side
guards work; the movement and the framing are the whole problem.

**The hand risk is back to the highest in the film.** Two independent objects, two grips the model
must keep consistent frame to frame, moving through the frame,
close to the face at the top of each rep. K5's hands were fine at rest; K6's broke their guards
entirely while gesturing (§5.12). Expect re-rolls, and **judge a take on the hands before anything
else**.

---

## 4. The inset — a dedicated app screen

The inset is no longer a mock assembled for one shot. It is a **dedicated "Live set" screen for the
IronPal app**, designed to the landing page's existing interface language so the promo and the site
show the same product. `web/src/components/AppModules.astro` is the source of truth for every token
below.

### 4.1 Design tokens, taken from the landing page

| | |
|---|---|
| accent | `#00E5CC` (`--accent`) |
| screen ground | `#101023`, 30 px radius, 1 px `rgba(255,255,255,.05)` border, padding `22px 18px 16px` |
| phone shell | aspect **9 / 18.6**, 40 px radius, 12 px padding, `linear-gradient(160deg,#2a2a3e,#0b0b16)` |
| brand | `IRONPAL`, display 800, letter-spacing `.1em`, 12 px, with the 12 px ring glyph (2.5 px accent border, bottom transparent) |
| live pill | `● live`, 10 px, accent, letter-spacing `.08em` |
| field label | 10 px, uppercase, letter-spacing `.16em`, body colour |
| exercise value | display 700, 16 px |
| big number | display 800, **32 px**, `line-height: 1`; unit `small` at 14 px |
| focus state | border `rgba(0,229,204,.55)`, background `rgba(0,229,204,.08)`, glow `0 0 24px -8px rgba(0,229,204,.5)`, value turns accent |
| log row | 12 px, `rgba(255,255,255,.02)`, 8 px radius; current row accent on `rgba(0,229,204,.07)` |
| concept label | 10 px, uppercase, letter-spacing `.12em`, above the phone |

### 4.2 The "Live set" screen — what K7 shows

Top to bottom, and what each element does across the clip:

| element | state | behaviour during the 8 s |
|---|---|---|
| top bar | `IRONPAL` · `● live` | the live dot pulses, slowly |
| **Exercise** | **focused** (teal border, accent text), reads **"Dumbbell Biceps Curl"** | set before the inset appears; does not change. It tracked the exercise through the goblet-squat detour and is back; `scripts/k7/live_set.html` is the source and the inset is re-rendered whenever it changes |
| **Reps** | big number, **not** focused | **increments on each lift, in sync with the picture** — the one element that has to be frame-accurate |
| **Weight** | reads **`12 kg`**, static | **Settled.** The line names the weight out loud, so a dash would have read as the product failing to do the thing he just said. It is set before the inset appears and **never animates and never resolves on camera** — what §2.3 forbids is dramatising the read, not showing a value. Same treatment as the landing page under the same *"Product interface concept"* label |
| sparkline | teal polyline, 42 px tall | scrolls continuously — it is the IMU trace, and it is what makes the screen feel live |
| log | `Set 1 · 12 reps` / `Set 2 · 12 reps` / **`Set 3 · logging…`** in accent | static; the current row carries the accent treatment |

**Three deliberate departures from the landing page version**, each with a reason:

- ~~**The Weight field shows `—`.**~~ **Reversed** once the line named the weight; see the table
  above. The original reasoning was that a promo clip is watched rather than read, so the concept
  label protects less than it does on the site — true, but the line now makes the claim in audio,
  which is the stronger channel, and refusing it in the picture bought nothing.
- ~~**The log rows show reps only.**~~ Reversed with it: the rows read `12 × 12 kg`.
- **Exercise carries the focus state, not Weight.** On the site the focus moves per module to
  highlight whichever metric that module is about. K7 is about recognition, so the focus sits on
  Exercise for the whole clip.

### 4.3 Building it

**An HTML/CSS screen, rendered and screen-recorded** — not a static still, and not a recording of
the POC.

The markup and every token already exist in `AppModules.astro`, so the screen is a small edit of
something real rather than an invention, and the counter can be animated to a timeline matched to
the cut. **Frame-accurate agreement between the counter and the lifts is the entire persuasive
content of this clip**, and only a built timeline guarantees it.

A real POC recording is ruled out here for the reason in §2.2 — the app would display `—`. **K8 is
where the real recording belongs.**

**Built.** `scripts/k7/live_set.html` is the screen; `scripts/k7/make_inset.sh` renders it to
`input/kickstarter/k7/k7_app_inset.mp4` — **620×960, 7.0 s, 24 fps**.

Two implementation notes that are not obvious:

- **The screen is 620×960, not the site's 9/18.6 shell.** At that aspect the log pins to the bottom
  and leaves a dead middle third, which at inset scale is wasted area and smaller type. The inset is
  the *screen only*, no bezel, sized so every element fills it — the same choice K3's tracker inset
  made, for the same reason (§4.4, Q17).
- **Frames are captured against a frozen page clock**, not recorded in real time. `performance.now`
  and `requestAnimationFrame` are replaced with a hand-stepped clock so each frame lands at an exact
  timestamp. A headless browser does not run rAF at wall-clock rate, and a real-time capture drifts
  the counter off the reps it exists to match.

**The duration is 7.0 s, not 8.0** — that is on-screen time, since the inset enters ~1.0 s into the
clip.

> **The rep timings are a placeholder until K7 is rendered.** `REP_TIMES` in `live_set.html` holds
> six ticks at the measured ~1.2 s alternating cadence, and `START_REP` opens at 6 because he is
> mid-set. **The prompt asks for four lifts, ~1.85 s apart, so expect four events** — both
> numbers are known to be wrong. **Retune both against the actual curls in the take** — frame-accurate agreement is the
> entire persuasive content of this clip, and nothing else in the film depends on a number matching
> a picture.

### 4.4 Placement

Measure the rendered clip before placing anything — the K3 lesson, restated after K5 came back
centred with a 594 px right margin instead of 640 (§5.10).

**The K5 starting numbers no longer apply.** They were derived from a waist-up subject; K7 is now
full length (§3.1), which makes him a **narrower column** in the frame. Two things follow: the empty
right third should be less of a fight than it was in K5, and **the inset can probably run larger
than ≈470 px wide**. Derive the number from the render, not from here.

**Timing:** in at ~1.0 s once the movement reads, out before the tail. **Check the tail direction
first** — K3 darkened over its final two frames, K5 blew out over its.

**Aspect check:** the phone shell is 9:18.6, so a 470 px-wide inset stands **971 px tall** — taller
than a 1080-line frame allows with margins. Either crop the shell to the screen only (no phone
bezel, as K3's tracker inset does) or scale to fit height and accept ~270 px of width. **Decide from
the rendered frame; do not assume the K5 numbers transfer.**

## 5. The line

**FINAL 2026-09-29 — "No buttons. No pausing. I lift, it logs the exercise, the reps and the
weight."** 15 words, ≈ 7.4 s. The full prompt is §5.13 of
[`IRONPAL_PROMO_VIDEO_SCRIPT_V1.md`](IRONPAL_PROMO_VIDEO_SCRIPT_V1.md).

**Two passes to get here.** Option A of the six (*"My hands are busy. That's the point. Nothing to
tap, nothing to type."*) was chosen first and the prompt written to it; the founder then replaced it
with **option B, extended to name the weight** — offered at 13 words as *"…it logs the exercise and
the reps"*, now 15.

**What the change bought.** The line is now near-verbatim `claims_allowlist[0]`: *"IronPal is a
headband that watches your set from your point of view and logs the exercise, your reps and the
weight."* Same three things, same order, in Peter's words. And *"I lift, it logs"* still makes **no
timing claim** — no *while*, no *real time* — so claim 10 stays untouched, which was the reason
option A was picked in the first place. It also still avoids naming the exercise, so §2.2 is clear.

**What it opened.** §4.2 specifies the inset's Weight field as a dash that never resolves, on §2.3
reasoning. **He now says "weight" over a screen showing `—`.** Three ways out are set out under the
prompt in §5.13; the recommendation is a **static weight** in the inset — never animating, never
landing on camera — on the grounds that the line now makes the claim in audio anyway, and the
landing page already shows a filled weight under the same *"Product interface concept"* label.
**Not yet changed; it is a founder call.**

**And it spent the margin.** 15 words at 2.04 w/s is 7.35 s in an 8 s clip, delivered while curling —
joint-longest in the film with K2, which was delivered standing still. If the take runs out of clip,
*"and the weight"* is what comes off, and that also puts the inset back in agreement with the line.

The constraints the line had to satisfy:

- **≤ 16 words**, comfortable at 14 (fresh 8 s generation — see below).
- Sales register, continuing K5 and K6.
- It must not claim live weight-reading, and it must not name an exercise the app cannot identify.
  **Naming the weight as one of the things the product logs is claim 1 and is allowed**; what is
  forbidden is claiming it is read *live*, or showing it resolve on camera.
- **It must not say "real time" unless claim 10 is amended first** (§2.1).
- The obvious shape is *what it is doing right now*, because the inset is proving it as he speaks.

**It is a fresh generation, not an extension of K6.** K6 was an extension and broke its gesture
guards outright — hands at face height, fingers splayed, against two explicit instructions
(§5.12). K7 has the highest hand risk in the film, and extending into a failure mode that has
already happened once is not worth the continuity. The cut is hidden by bringing the inset in across
it, as K2→K3 does. Budget is therefore **≤ 16 words** (8 s at 2.04 w/s), comfortable at 14.

---

## 6. Open, needs a decision

One remains, and **the chosen line no longer blocks on it** — but the clip still does.

1. **§2.1 — is claim 10 amended to cover live-during-set behaviour?** Claim 10 currently describes a
   post-set proposal with one tap to confirm. The live HUD genuinely does update during a set for
   IMU reps, so the capability is real and the allowlist simply describes a different interaction.
   Claims going on the record need founder sign-off.

   **What changed on 2026-09-29:** the line chosen (§5) makes no timing claim, so *the words* are
   clear either way. **The picture is not.** The inset counter increments in sync with the reps —
   that is the entire persuasive content of the clip — so the frame asserts live recognition whatever
   the line says. Picking a careful line dodged the wording, not the frame. Until claim 10 is
   amended, the *"Product interface concept"* label is the only thing carrying that, which is why
   §2.2 calls it load-bearing and non-optional.

Settled by the grilling and by the founder: **alternating curl in K7** and Bulgarian split squat in
K8 (§1, §2.2); inset is a
dedicated app screen built in HTML from the landing page tokens (§4); the *"Product interface
concept"* label is **mandatory and stays in the inset** (§2.2); weight shows `—` and the log shows
reps only (§4.2); fresh generation rather than an extension (§5); **the line, option A of six
(§5)**; exposure to the mid-50s (§3.2);
framing stated twice (§3.1); **the alternating curl driven by three reference stills, and the weights
unmarked (§1, §3.3)**; band lettering ban restated (§3.3).

## 7. What this hands K8

Recorded here because the decision was made here, not in a K8 document that does not exist yet.

- **K8 is the Bulgarian split squat** — enrolled, IMU-led, validated in POC v1.
- **K8's inset should be a real POC recording**, not a mock: `hud_live_set` is already a required
  segment in the config, and the app will genuinely name and count that movement.
- That gives the film a deliberate escalation: **K7 shows the interface, K8 shows the recogniser.**
  If only one of the two can be made truthful, it must be K8.
- A split squat runs ~2.5 s per rep against K7's ~1.85 s, so K8's counter will move about three
  times in eight seconds where K7's moves four. **K8's line needs to be shorter**, to leave the
  picture room to complete two full reps.
- **The reference-still technique transfers**, if it works here. K8 has the same problem in a harder
  form: a Bulgarian split squat is asymmetric by nature and the model has to pick the right leg.
