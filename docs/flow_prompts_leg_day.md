# Leg-day exercises from a reference Short → Google Flow prompts (fisheye, first person)

**2026-10-10.** Reference: the YouTube Short "LEG DAY FOR ALL FITNESS LEVELS!" (MDJ FITNESS,
`youtube.com/shorts/vRdH11oMWB0`, 30 s, 360×640). YouTube refused the video stream (HTTP 403 on
every format), so the analysis is from its **storyboard frames** (35 frames, about one a second,
101×180 each). That is enough to identify each exercise, its setup and its set scheme. It is not
enough for fine technique. The Short is used only as a list of exercises: the prompts below are
original, and use the founder's IronPal camera view, not the creator's footage.

## 1. What the Short shows

| # | time | exercise | equipment / setup | on-screen scheme |
|---|---|---|---|---|
| — | 0–4 s | intro: lifter stands facing away from camera, hands behind head | — | caption (pink, unreadable at storyboard size) |
| 1 | 4–12 s | **barbell back squat** | squat rack with J-hooks and safety arms; bar on upper back, green bumper plates; feet shoulder-width, full squat to below parallel | **5 × 8–10** |
| 2 | 12–16 s | **barbell hip thrust** | upper back on a flat bench, seated on the floor; bar across the hips (padded), large red/black bumper plates; feet flat, knees at 90° at the top | **4 × 10** |
| 3 | 16–20 s | **B-stance hip thrust** | same setup; one foot flat and working, the other on its heel slightly forward as a kickstand | **4 × 10 per leg** |
| — | 20–22 s | between sets (reaction shot) | — | caption |
| 4 | 22–30 s | **Romanian deadlift (RDL)** | barbell with red bumper plates from standing; soft knees, hips hinge back, bar slides down the thighs to mid-shin, flat back | **4 × 10** |

Four exercises, all glute and hamstring biased, all barbell based.

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

THE ACTION, slow and steady, TWO full squats: he bends his knees and sits his hips down until his thighs are below parallel, then stands back up, twice. Because the camera is on his forehead, the floor and his shoes come closer and grow in the circle as he goes down, and recede as he stands; his knees come into view at the top of the circle at the bottom of each squat, tracking over his toes. The rack and plates stay fixed. Every movement is continuous, never a jump. Audio: NO MUSIC — quiet gym room sound and his steady breathing.
```

## 4. Barbell hip thrust

**Image prompt**
```
A single photograph from a tiny 200-degree fisheye camera worn on a man's forehead, looking down along his own body while he sits on the gym floor with his upper back against a flat bench, ready to hip thrust. No text, no logos, no numbers anywhere; the plates are plain coloured rubber with no printing.

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

Just below the top of the circle, an OLYMPIC BARBELL runs straight across the picture from left to right, held against the front of his thighs by his two hands in an overhand grip just outside his legs: tanned forearms, five correctly shaped fingers on each hand, a black smartwatch on his left wrist. On each end of the bar, at the left and right edges of the circle, one large SOLID RED bumper plate, the same size. Below the bar, the black rubber floor and the toes of his two training shoes, hip-width apart. Bright daylight, slightly washed-out highlights, mild noise. No other people.
```
**Clip prompt**
```
Continue exactly from the starting image. ONE CONTINUOUS SHOT, NO CUTS. No text, no numbers anywhere. Keep the circular fisheye image on black, upside down, his body at the top, the barbell with one red plate on each end held in both hands, exactly as in the starting image.

THE ACTION, slow and controlled, TWO Romanian deadlifts: with soft knees and a flat back he pushes his hips back and hinges forward, sliding the bar down the front of his thighs to just below his knees, the bar staying close to his legs the whole way; then he drives his hips forward and stands back up, twice. From the camera's view, as he hinges the floor and his shoes come closer and the bar travels down toward the middle of the circle, then rises back as he stands. His grip never changes and the plates never change. Every movement is continuous, never a jump. Audio: NO MUSIC — quiet gym room sound and his breathing.
```
