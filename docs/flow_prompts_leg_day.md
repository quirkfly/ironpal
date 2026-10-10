# Leg-day exercises from a reference Short → Google Flow prompts (fisheye, first person)

**2026-10-10.** Reference: the YouTube Short "LEG DAY FOR ALL FITNESS LEVELS!" (MDJ FITNESS,
`youtube.com/shorts/vRdH11oMWB0`). **Analysed from the full video**: 1080×1920, 60 fps, 30.4 s,
downloaded with yt-dlp 2026.08.19 using Node as its JS runtime (`--js-runtimes node`; the earlier
403s came from the missing runtime), decoded from AV1, and read at 2 fps with scene cuts detected
(cuts at 3.4, 5.4, 10.3, 11.0, 14.4, 15.5, 17.9, 18.6, 19.1, 20.1, 23.5, 24.3 s). The video is kept
only in the session scratchpad, not in the repo. The Short is used only as a list of exercises: the
prompts below are original, and use the founder's IronPal camera view, not the creator's footage.

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

## 2. Production notes for the prompts

- **The view is the IronPal camera's**: the 200° fisheye on the forehead, inverted, with the circle on
  black. This is the same construction as the curl and plate-loading clips, which took several
  revisions to get right ([`fisheye_barbell_loading_prompt.md`](fisheye_barbell_loading_prompt.md)).
  What the camera sees differs per exercise: in a squat it sees the floor and its own knees, in a
  hip thrust it sees the bar over the hips, in an RDL it sees the bar travelling down the shins.
- **Still first, then the clip**, every time: generate the still with the image prompt and the
  reference frame `input/kickstarter/fisheye/ref_curl_86s.jpg`, accept it, then animate it with the
  clip prompt.
- **Plates are plain colour, no numbers**: Flow garbles numerals. The colours here (green squat
  plates, red hip-thrust and RDL plates) are only for continuity between stills and clips.
- **One continuous movement per clip, 2–3 reps, slow**: the K5b and curl lessons.
- **Label it "Simulated footage"** if any of it is published.

---

## 3. Barbell back squat

**Image prompt**
```
A single photograph from a tiny 200-degree fisheye camera worn on a man's forehead, looking straight down while he stands in a squat rack with a loaded barbell across his upper back. No text, no logos, no numbers anywhere; the plates are plain coloured rubber with no printing.

THE VIEW: one CIRCULAR fisheye image filling the full height of a 16:9 frame, pure black on the left and right, a thin pale bluish glow on the rim. Upside down like all forehead-camera footage: his own chest, shorts and the tops of his thighs at the TOP edge of the circle, the floor in the middle, the gym curving around the BOTTOM of the circle. No ceiling at the top.

He stands upright, ready to squat: below him the black rubber floor and the toes of his two training shoes, feet shoulder-width apart and turned slightly out. On both sides of the circle, curving in, the steel uprights of the squat rack with their safety arms, and at the left and right edges the ends of the barbell sleeves loaded with SOLID GREEN bumper plates, all the same size. His hands are out of view, up on the bar behind his head. Bright daylight, slightly washed-out highlights, mild noise. No other people.
```
**Clip prompt** (start frame = the accepted still · 8 s · 16:9 · silent)
```
Continue exactly from the starting image. ONE CONTINUOUS SHOT, NO CUTS. No text, no numbers anywhere. Keep the circular fisheye image on black, upside down, his body at the top, the squat rack and the green plates at the edges, exactly as in the starting image.

THE ACTION, slow and steady, TWO full squats, about three seconds each: he bends his knees and sits his hips down until his thighs reach parallel, then stands back up, twice. Because the camera is on his forehead, the floor and his shoes come closer and grow in the circle as he goes down, and recede as he stands; his knees come into view at the top of the circle at the bottom of each squat, tracking over his toes. The rack and plates stay fixed. Every movement is continuous, never a jump. Audio: NO MUSIC — quiet gym room sound and his steady breathing.
```

## 4. Barbell hip thrust

**Image prompt**
```
A single photograph from a tiny 200-degree fisheye camera worn on a man's forehead, looking down along his own body while he sits on the gym floor with his upper back against a flat bench, ready to hip thrust, the bench lying side-on behind his shoulders. No text, no logos, no numbers anywhere; the plates are plain coloured rubber with no printing.

THE VIEW: one CIRCULAR fisheye image filling the full height of a 16:9 frame, pure black on the left and right, a thin pale bluish glow on the rim. The fisheye bends everything into a sphere.

In the middle of the circle, across his hips, lies a loaded OLYMPIC BARBELL with a thick black foam pad around its centre, held in place by his two hands gripping the bar either side of the pad: tanned forearms, five correctly shaped fingers on each hand, a black smartwatch on his left wrist. At the left and right edges of the circle, the bar's ends carry large SOLID RED bumper plates, one on each side, the same size. Beyond the bar, his bent knees and his two training shoes flat on the black rubber floor, hip-width apart. The gym curves around the rim of the circle. Bright daylight, slightly washed-out highlights, mild noise. No other people.
```
**Clip prompt**
```
Continue exactly from the starting image. ONE CONTINUOUS SHOT, NO CUTS. No text, no numbers anywhere. Keep the circular fisheye image on black, the barbell with its pad and red plates across his hips, his hands on the bar, exactly as in the starting image.

THE ACTION, slow and steady, THREE hip thrusts: driving through his heels, he lifts his hips until his torso is level and his shins vertical, pauses for a moment at the top, then lowers his hips back toward the floor, three times. From the camera's view the bar and his hands rise toward the lens and the plates grow at the edges of the circle at the top of each rep, then sink back. His feet never move and his hands never leave the bar. Every movement is continuous, never a jump. Audio: NO MUSIC — quiet gym room sound and his breathing.
```

## 5. B-stance hip thrust

**Image prompt**
```
A single photograph from a tiny 200-degree fisheye camera worn on a man's forehead, looking down along his own body while he sits on the gym floor with his upper back against a flat bench, ready to do a single-leg-biased (B-stance) hip thrust. No text, no logos, no numbers anywhere; the plates are plain coloured rubber with no printing.

THE VIEW: one CIRCULAR fisheye image filling the full height of a 16:9 frame, pure black on the left and right, a thin pale bluish glow on the rim.

Across his hips lies a loaded OLYMPIC BARBELL with a thick black foam pad, his two hands gripping the bar either side of it (five correctly shaped fingers on each hand, a black smartwatch on his left wrist); SOLID RED bumper plates on both ends at the edges of the circle. Beyond the bar, his feet are deliberately UNEVEN: his RIGHT foot is flat on the floor close to his hips, knee bent, doing the work; his LEFT foot rests only on its heel about a foot further forward, toes pointing up, as a light kickstand. The gym curves around the rim. Bright daylight, slightly washed-out highlights, mild noise. No other people.
```
**Clip prompt**
```
Continue exactly from the starting image. ONE CONTINUOUS SHOT, NO CUTS. No text, no numbers anywhere. Keep the circular fisheye image on black, the padded barbell with red plates across his hips, his hands on the bar, and his feet exactly as placed: right foot flat, left foot on its heel further forward.

THE ACTION, slow and steady, THREE reps: pushing mainly through his RIGHT heel, he lifts his hips until his torso is level, pauses at the top, and lowers back down, three times. His LEFT foot stays on its heel and does not move; his right foot stays flat. The bar and hands rise toward the lens at the top of each rep and sink back. Every movement is continuous, never a jump. Audio: NO MUSIC — quiet gym room sound and his breathing.
```

## 6. Romanian deadlift

**Image prompt**
```
A single photograph from a tiny 200-degree fisheye camera worn on a man's forehead, looking straight down while he stands holding a loaded barbell at hip height, about to perform a Romanian deadlift. No text, no logos, no numbers anywhere; the plates are plain coloured rubber with no printing.

THE VIEW: one CIRCULAR fisheye image filling the full height of a 16:9 frame, pure black on the left and right, a thin pale bluish glow on the rim. Upside down like all forehead-camera footage: his own body at the TOP of the circle, the floor in the middle, the gym curving around the BOTTOM. No ceiling at the top.

Just below the top of the circle, an OLYMPIC BARBELL runs straight across the picture from left to right, held against the front of his thighs by his two hands in an overhand grip just outside his legs, each wrist wrapped in a dark fabric lifting strap that loops once around the bar: tanned forearms, five correctly shaped fingers on each hand, a black smartwatch on his left wrist. On each end of the bar, at the left and right edges of the circle, one large SOLID RED bumper plate, the same size. Below the bar, the black rubber floor and the toes of his two training shoes, hip-width apart. Bright daylight, slightly washed-out highlights, mild noise. No other people.
```
**Clip prompt**
```
Continue exactly from the starting image. ONE CONTINUOUS SHOT, NO CUTS. No text, no numbers anywhere. Keep the circular fisheye image on black, upside down, his body at the top, the barbell with one red plate on each end held in both hands, exactly as in the starting image.

THE ACTION, slow and controlled, TWO Romanian deadlifts: with soft knees and a flat back he pushes his hips back and hinges forward, sliding the bar down the front of his thighs to just below his knees, the bar staying close to his legs the whole way; then he drives his hips forward and stands back up, twice. From the camera's view, as he hinges the floor and his shoes come closer and the bar travels down toward the middle of the circle, then rises back as he stands. His grip and the lifting straps never change and the plates never change. Every movement is continuous, never a jump. Audio: NO MUSIC — quiet gym room sound and his breathing.
```

---

## 7. Third-person series with an original character, `Ava Headband`

**2026-10-10.** The founder asked for these exercises performed by the woman in the reference Short,
wearing the IronPal headband. **That is not done here.** She is a real, identifiable creator, and
generating her likeness wearing our product would put an endorsement in her mouth that she never
gave. The series uses an **original character** instead: invented, not modelled on her face, hair
or outfit. The prompts take only the exercises and their setup from the Short.

### 7.1 Mint the character in Flow (free, do this once)

In the Flow project: **Characters → New character → describe it**, paste the description below,
generate, pick the variant that matches it best, and **rename it `Ava Headband`**. An unnamed
character matches nothing (runbook §0, trap 3), so the name in later prompts must match it exactly.

```
Ava Headband: a woman in her late twenties, athletic and strong, an experienced lifter. Warm medium-brown skin, dark brown eyes, a friendly, focused expression. Straight black hair, shoulder-length, tied back in a low, neat ponytail so her forehead is clear. She is wearing a fitted charcoal-grey sports crop top, high-waisted black training leggings, and plain white training shoes with white socks. On her forehead she wears the IronPal headband: a matte-black fabric band with a thin electric-teal stripe along its lower edge, a small flush lens at the front centre with a tiny teal light beside it, and a small teal ring mark on the right side. The band carries NO lettering and NO writing of any kind. No other jewellery, no headphones, no earbuds, no cap. Full-length, standing naturally, front view, neutral studio background.
```

**Check the mint before using it.** The band is on her forehead with the lens front-centre, the
stripe is along the lower edge, there are no letters on the band, and her forehead is clear of hair.
If the band is missing or garbled, re-generate; minting is free.

### 7.2 Exercise 1 — barbell back squat (still not needed; a fresh 8 s clip)

Add **`Ava Headband`** via *Add ingredients*, keep the name in the pasted text, 16:9, 8 s, Omni 1.1
Flash. Paste as plain text.

```
LIVE-ACTION FOOTAGE WITH NO WRITING IN IT. No captions, no subtitles, no titles, no logos, no UI, and no letters or numerals anywhere in frame; the weight plates are plain coloured rubber with no printing. ONE CONTINUOUS SHOT, NO CUTS. SILENT: nobody speaks.

Ava Headband trains alone in a bright, clean strength gym in daylight: grey carpet-tile floor, pale walls with high windows, a steel power rack with its safety arms set at mid-thigh height. A loaded Olympic barbell rests in the rack's J-hooks at shoulder height, with one SOLID GREEN bumper plate on each end, both the same size.

A LOCKED-OFF SHOT ON A 35mm LENS AT HIP HEIGHT, from the front and about 30 degrees to her left, about three metres away, framing her full length from head to toe inside the rack, with the IronPal headband on her forehead clearly visible and sharp in every frame. The camera does not move.

THE ACTION, slow and controlled, ONE continuous movement: she steps under the bar, sets it across her upper back with her hands just outside her shoulders, stands up to lift it out of the hooks, and takes two small steps back. With her feet a little wider than her shoulders and her toes turned slightly out, she performs TWO full back squats, about three seconds each: she sits her hips down and back until her thighs are parallel to the floor, knees tracking over her toes, chest up and back flat, then drives up to standing. Every movement is real and continuous, never a frozen pose, never a jump. Her eyes look forward, never at the camera.

The headband stays exactly in place throughout: matte black, the thin teal stripe, the small lens and tiny teal light at the front, the small teal ring mark on the right side, NO lettering. Each hand has exactly five correctly shaped fingers. She is ALONE in the gym. Audio: NO MUSIC — quiet gym room sound, her steady breathing and the soft clink of the plates.
```

**Judge it in this order:** the band on her forehead, sharp and with no letters → the unrack, then
two complete squats to parallel → a continuous shot with no cuts → hands → no text on the plates →
she never looks at the camera.

**For the next exercises**, reuse the same opening (no-writing line, `Ava Headband`, the same gym),
the band clause and the audio line, and swap only the setup and THE ACTION paragraph, taken from
§1's analysis.
