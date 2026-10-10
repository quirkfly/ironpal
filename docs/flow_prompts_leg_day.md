# Leg-day exercises from a reference Short → Google Flow prompts (third person, `Ava Headband`)

**2026-10-10.** Reference: the YouTube Short "LEG DAY FOR ALL FITNESS LEVELS!" (MDJ FITNESS,
`youtube.com/shorts/vRdH11oMWB0`). **Analysed from the full video**: 1080×1920, 60 fps, 30.4 s,
downloaded with yt-dlp 2026.08.19 using Node as its JS runtime (`--js-runtimes node`; the earlier
403s came from the missing runtime), decoded from AV1, and read at 2 fps with scene cuts detected
(cuts at 3.4, 5.4, 10.3, 11.0, 14.4, 15.5, 17.9, 18.6, 19.1, 20.1, 23.5, 24.3 s). The video is kept
only in the session scratchpad, not in the repo. The Short is used only as a list of exercises: the
prompts below re-stage the same four exercises, setups and camera angles, performed by an
original character wearing the IronPal headband.

## 1. What the Short shows (full-video analysis)

| # | time | exercise | what the frames show | reps seen · tempo | caption |
|---|---|---|---|---|---|
| — | 0.0–3.4 | intro | lifter stands back to camera, adjusting hair | — | "Glute Workout (4 exercises)" |
| 1 | 3.4–10.5 | **barbell back squat** | in a power rack: steps under the bar and unracks it from the J-hooks (3.4–5.0 s), safety arms set at mid-thigh; high-bar position, hands just outside the shoulders; stance a little wider than shoulders, toes turned out; squats to about parallel, knees tracking over toes, torso fairly upright; green bumper plates on the bar, black iron plates stored on the rack's pegs | 2 full reps visible, ~3 s each (≈1.5 s down, ≈1.5 s up) | "5 x 8-10 squats" |
| 2 | 11.0–14.4 | **barbell hip thrust** | seated on the floor, upper back across the long side of a flat bench, padded bar over the hip crease, large red bumper plates; hands hold the bar either side of the pad; feet flat, hip-width, shins vertical at the top; full lockout with a brief pause, chin tucked | 2 reps, ~1.5 s each | "4 x 10 hip thrusts" |
| 3 | 15.5–19.5 | **B-stance hip thrust** | same setup; one foot planted close to the hips doing the work, the other a little forward and lighter; same lockout; at the end (19.0 s) she sits down and rolls the bar off down her thighs | 2–3 reps, ~1.5 s | "4 x 10 b-stance hip thrusts (per leg)" |
| — | 20.1–23.4 | rest | standing, wearing **lifting straps**, the RDL barbell on the floor beside her | — | "*big yawn*" |
| 4 | 23.5–30.4 | **Romanian deadlift** | straps wrapped around the bar; first rep picked up from the floor (23.5–24.3 s), then RDLs from standing: soft knees, hips pushed straight back, flat back, bar dragged down the thighs to just below the knees, then hips drive forward to lockout; red bumper plates | 3 reps, ~1.5–2 s each | "4 x 10 rdl's" |

Four exercises, all glute and hamstring biased, all barbell based. **What changed after reading the
full video:** the squat starts with an unrack, the hip-thrust bench is used side-on, and the RDL is
strapped and its first rep comes off the floor. The prompts below now include these.

## 2. How to use these prompts

- **Third person, not fisheye**: each prompt re-stages the exercise the way the Short films it:
  the same equipment and setup, and the same angle. Squat from the front-left through the rack, the
  two hip thrusts from a low floor-level angle at the front-left, the RDL in left-side profile.
- **One original character, minted once** (`Ava Headband`, §3), referenced by name in every prompt,
  so all four clips show the same woman wearing the same band. She is not modelled on the creator
  in the Short; the creator's likeness is not reproduced.
- **Each prompt is a fresh 8 s clip**: Omni 1.1 Flash, 16:9, `Ava Headband` added via *Add
  ingredients*, the name kept in the pasted text, pasted as plain text.
- **Plates are plain colour, no numbers**: green for the squat, red for the hip thrusts and the RDL,
  as in the Short.
- **2–3 reps in one continuous movement**, at the tempo the Short shows (§1).
- **Judge each take in this order:** the band on her forehead, sharp, with no letters → the reps are
  complete and the technique matches §1 → one shot, no cuts → hands → no text on the plates → she
  never looks at the camera.
- If any of it is published, label it **"Simulated footage"**.

## 3. Mint the character (free, do this once)

In the Flow project: **Characters → New character → describe it**, paste the description below, pick
the variant that matches it best, and **rename it `Ava Headband`**. An unnamed character matches
nothing (runbook §0, trap 3). Check the mint: band on the forehead, lens at the front-centre, stripe
along the lower edge, no letters, forehead clear of hair.

```
Ava Headband: a woman in her late twenties, athletic and strong, an experienced lifter. Warm medium-brown skin, dark brown eyes, a friendly, focused expression. Straight black hair, shoulder-length, tied back in a low, neat ponytail so her forehead is clear. She is wearing a fitted charcoal-grey sports crop top, high-waisted black training leggings, and plain white training shoes with white socks. On her forehead she wears the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side. The band carries NO lettering and NO writing of any kind. No other jewellery, no headphones, no earbuds, no cap. Full-length, standing naturally, front view, neutral studio background.
```

### 3.1 Portrait prompt (attach the headband reference; it creates her face)

**Attach `web/public/assets/headband-hero.jpg`**, the IronPal product shot, as the reference image, so
the band is copied from the real design and not invented. Generate this first, pick the best of the batch, and use it as the reference for everything else.
It is head-and-shoulders on a plain wall, so the face is all the model has to get right.

```
Head-and-shoulders portrait photograph of an original woman, Ava: late twenties, an experienced strength athlete. Warm medium-brown skin with natural texture, a light scatter of freckles across the nose, dark brown eyes, straight dark eyebrows, a fairly broad nose, full lips, a strong, square jaw and a small scar through her left eyebrow. Straight black hair, shoulder-length, pulled back into a low, neat ponytail so her forehead is fully clear. Calm, friendly, focused expression with a slight closed-mouth smile.

On her forehead she wears the IronPal headband from the HEADBAND REFERENCE IMAGE, sitting just above the eyebrows: reproduce that exact band, the same shape, height and matte-black fabric, the same thin electric-teal stripe along its lower edge, the same small flush round camera lens at the front centre with the tiny teal light beside it, and the same small teal ring mark on the right side. Copy the band's design only, not the reference's background, and leave out its printed wordmark: the band on her carries NO lettering and NO writing of any kind.

Framing: head-and-shoulders to mid-chest, squared to camera, eyes open and looking into the lens, the whole band visible and sharp. She wears a fitted charcoal-grey sports top. Plain, evenly lit neutral warm-grey wall behind her, no texture, no objects, no other people, no text or logos anywhere. Soft natural daylight from the front. Natural, healthy, realistic skin tone; real skin texture, NOT airbrushed, NOT a beauty-filter face, NOT a fashion model. Sharp and in focus.
```

### 3.2 Body prompt (attach the accepted portrait AND `headband-hero.jpg`)

```
Full-length photograph, head to toe, of the exact woman in the portrait reference, standing relaxed and facing the camera in a bright, clean strength gym in daylight: grey carpet-tile floor, pale blue-grey walls with high windows and wall mirrors, a steel power rack and dumbbell racks behind her, slightly out of focus.

Two reference images are attached: the PORTRAIT REFERENCE (her face) and the HEADBAND REFERENCE (the band's design). THE FACE MUST MATCH THE PORTRAIT REFERENCE EXACTLY: same face shape and square jaw, same eyes, eyebrows and small scar through the left eyebrow, same nose and lips, same freckles, same skin tone and texture. Do not slim, beautify, sharpen or change her face in any way.

She has a strong, athletic lifter's build: solid shoulders and legs, NOT skinny, NOT a fitness-model physique. She wears a fitted charcoal-grey sports crop top, high-waisted black training leggings, white socks and plain white training shoes. Her black hair is in the same low ponytail, forehead clear.

On her forehead, exactly as in the portrait and matching the HEADBAND REFERENCE IMAGE: the IronPal headband, the same matte-black fabric band, the same thin electric-teal stripe along its lower edge, the same small flush round lens at the front centre with the tiny teal light beside it, and the same small teal ring mark on the right side. Copy the band's design only, without the reference's printed wordmark: NO lettering and NO writing anywhere on the band. No other jewellery, no headphones, no earbuds, no cap.

Arms relaxed at her sides, hands open and natural, five correctly shaped fingers on each. No text or logos anywhere in the picture. Natural daylight, natural skin tone. Sharp and in focus, nobody else in frame.
```

**Then mint:** in Flow, create the character from the **portrait and the body image** (or from the
§3 description if Flow only offers text), and rename it **`Ava Headband`**. The scar, the freckles
and the square jaw give her a distinct, repeatable identity. A generic face drifts between clips.

## 4. Exercise 1 — barbell back squat

*Revision 2, 2026-10-10.* Take 1 (`Woman_trains_in_gym_20261010030402.mp4`) broke the physics:
- **The bar teleported.** She walked in from the side and the bar was simply on her back. Flow
  cannot render an unrack, so the bar now **starts on her back** and the walk-in is gone.
- **Giant plates filled the foreground.** Shooting through the rack's upright put stored plates on
  its pegs right in front of the lens. The camera is now **outside the rack with a clear line of
  sight**, and nothing is stored on the pegs.
- **Quarter-depth squats.** Depth is now stated by landmarks, the hip crease below the top of the
  knee, with the **bar path** stated too: straight down and up over mid-foot, both ends level.
- **Printed numbers and brand names on the plates.** The plates are now *completely smooth, solid
  green, nothing printed*, said twice.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. No captions, no subtitles, no titles, no logos, no UI, and no letters, numbers or brand names anywhere in frame. ONE CONTINUOUS SHOT, NO CUTS. SILENT: nobody speaks.

Ava Headband stands inside a steel power rack in a bright, clean strength gym in daylight: grey carpet-tile floor, pale blue-grey walls with high windows. The rack's two safety arms are set at mid-thigh height on both sides of her. Nothing is stored on the rack's pegs.

FROM THE FIRST FRAME the loaded barbell is ALREADY RESTING ACROSS HER UPPER BACK, below the base of her neck, and she is already standing upright with it, unracked, in the middle of the rack. Both hands grip the bar just outside her shoulders, elbows pointing down. On each end of the bar sits ONE SOLID GREEN bumper plate, both the same size, their faces completely smooth with NOTHING printed on them — no numbers, no letters, no brand. The bar is long and straight and both of its ends, with their plates, are fully inside the frame.

A LOCKED-OFF SHOT ON A 35mm LENS AT HIP HEIGHT, from in front of her and about 25 degrees to her left, about four metres away, OUTSIDE the rack with a clear view of her: nothing between the camera and her body, framing her full length from head to toe with both ends of the bar and both plates inside the frame, the IronPal headband on her forehead clearly visible. The camera does not move.

THE ACTION, ONE continuous movement, real gym physics: feet a little wider than her shoulders, toes turned slightly out, she performs THREE full back squats, about three seconds each. On the way down she bends her knees and pushes her hips back at the same time, knees tracking over her toes, chest up, back flat, until the crease of her hips is BELOW the top of her knees — a full, deep squat, not a partial one; then she drives straight back up to standing tall. The bar stays fixed on her upper back and moves ONLY with her body, straight down and straight up over the middle of her feet, both ends level, both plates moving together. Her hands never leave the bar, her heels stay flat on the floor, the plates never change size and the bar never passes through the rack or her body. Every movement is continuous, never a frozen pose, never a jump.

The headband stays exactly in place throughout: matte black, the thin teal stripe, the small lens and tiny teal light at the front, the small teal ring mark on the right side, NO lettering. Each hand has exactly five correctly shaped fingers. Her eyes look straight ahead, never at the camera. She is ALONE in the gym. Audio: NO MUSIC — quiet gym room sound and her steady breathing.
```

**Judge it in this order:** the bar is on her back from frame 1 and never jumps → three squats
with the hip crease below the knee → both bar ends and plates in frame, level, nothing in front of
the lens → no numbers or text on the plates → the band, sharp, with no letters → hands. The take
came back **9:16, 6 s**; for the 16:9 film, set *aspect 16:9* and *8 s* in Flow before generating.

## 5. Exercise 2 — barbell hip thrust

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. No captions, no subtitles, no titles, no logos, no UI, and no letters or numerals anywhere in frame; the weight plates are plain coloured rubber with no printing. ONE CONTINUOUS SHOT, NO CUTS. SILENT: nobody speaks.

Ava Headband trains alone in a bright, clean strength gym in daylight: grey carpet-tile floor, pale blue-grey walls with high windows and wall mirrors, dumbbell racks along the wall. She sits on the floor with her upper back across the LONG side of a flat padded bench that stands side-on behind her. Across her hip crease lies a loaded Olympic barbell wrapped in a thick black foam pad, a large SOLID RED bumper plate on each end, both the same size; her hands hold the bar either side of the pad. Her feet are flat on the floor, hip-width apart.

A LOCKED-OFF SHOT ON A 24mm LENS LOW, AT FLOOR HEIGHT, from in front of her and about 40 degrees to her left, about two and a half metres away, the near red plate big in the lower left of the frame, her whole body, the bench and the IronPal headband on her forehead in view. The camera does not move.

THE ACTION, ONE continuous movement: she performs TWO barbell hip thrusts, about one and a half seconds each: driving through her heels she lifts her hips until her torso is level with the bench and her shins are vertical, chin tucked, pauses for a beat at the top with her glutes squeezed, then lowers her hips back toward the floor. Her shoulders stay on the bench, her hands stay on the bar, her feet never move. Every movement is real and continuous, never a jump.

The headband stays exactly in place throughout: matte black, the thin teal stripe, the small lens and tiny teal light at the front, the small teal ring mark on the right side, NO lettering. Each hand has exactly five correctly shaped fingers. Her eyes stay on her work, never on the camera. She is ALONE in the gym. Audio: NO MUSIC — quiet gym room sound, her steady breathing and the soft clink of the plates.
```

## 6. Exercise 3 — B-stance hip thrust

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. No captions, no subtitles, no titles, no logos, no UI, and no letters or numerals anywhere in frame; the weight plates are plain coloured rubber with no printing. ONE CONTINUOUS SHOT, NO CUTS. SILENT: nobody speaks.

Ava Headband trains alone in a bright, clean strength gym in daylight: grey carpet-tile floor, pale blue-grey walls with high windows and wall mirrors, dumbbell racks along the wall. She sits on the floor with her upper back across the LONG side of a flat padded bench that stands side-on behind her, a padded Olympic barbell across her hip crease with a large SOLID RED bumper plate on each end, her hands holding the bar either side of the pad. Her feet are deliberately UNEVEN: her RIGHT foot is flat on the floor close to her hips and does the work; her LEFT foot is about a foot further forward, resting lightly on its heel, toes up, as a kickstand.

A LOCKED-OFF SHOT ON A 24mm LENS LOW, AT FLOOR HEIGHT, from in front of her and about 40 degrees to her left, about two and a half metres away, the near red plate big in the lower left of the frame, her whole body, the bench, both feet and the IronPal headband in view. The camera does not move.

THE ACTION, ONE continuous movement: she performs THREE B-stance hip thrusts, about one and a half seconds each, pushing mainly through her RIGHT heel: hips up until her torso is level with the bench, a beat of pause at the top, then down. Her LEFT foot stays on its heel the whole time and does not move. After the third rep she lowers her hips to the floor and rests the bar on her thighs. Every movement is real and continuous, never a jump.

The headband stays exactly in place throughout: matte black, the thin teal stripe, the small lens and tiny teal light at the front, the small teal ring mark on the right side, NO lettering. Each hand has exactly five correctly shaped fingers. Her eyes stay on her work, never on the camera. She is ALONE in the gym. Audio: NO MUSIC — quiet gym room sound, her steady breathing and the soft clink of the plates.
```

## 7. Exercise 4 — Romanian deadlift

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. No captions, no subtitles, no titles, no logos, no UI, and no letters or numerals anywhere in frame; the weight plates are plain coloured rubber with no printing. ONE CONTINUOUS SHOT, NO CUTS. SILENT: nobody speaks.

Ava Headband trains alone in a bright, clean strength gym in daylight: grey carpet-tile floor, pale blue-grey walls with high windows and wall mirrors, dumbbell racks along the wall. She stands holding a loaded Olympic barbell at the front of her thighs, one large SOLID RED bumper plate on each end, both the same size, in an overhand grip just outside her legs, each wrist wrapped in a dark fabric lifting strap that loops once around the bar. A flat bench stands in the background.

A LOCKED-OFF SHOT ON A 35mm LENS AT KNEE HEIGHT, from her LEFT SIDE, in profile, about three metres away, the near red plate large in the lower left of the frame, framing her full length from head to toe so the line of her back and the path of the bar are clear, the IronPal headband visible on her forehead. The camera does not move.

THE ACTION, slow and controlled, ONE continuous movement: she performs THREE Romanian deadlifts, about two seconds each: knees slightly bent and staying there, she pushes her hips straight back and hinges forward with a flat back and a neutral neck, sliding the bar down the front of her thighs to just below her knees, the bar staying close to her legs the whole way; then she drives her hips forward and stands tall, squeezing at the top. Her grip and the straps never change. Every movement is real and continuous, never a jump.

The headband stays exactly in place throughout: matte black, the thin teal stripe, the small lens and tiny teal light at the front, the small teal ring mark on the right side, NO lettering. Each hand has exactly five correctly shaped fingers. Her eyes stay on her work, never on the camera. She is ALONE in the gym. Audio: NO MUSIC — quiet gym room sound, her steady breathing and the soft clink of the plates.
```

*Superseded:* the first version of this doc had first-person fisheye prompts for the same four
exercises. They are in git history (`c7496f0`, `196537c`) if a fisheye set is wanted later.
