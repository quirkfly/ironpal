# Synthetic fisheye clip — loading an Olympic barbell · Omni Flash prompts

**Written 2026-10-09.** The same forehead-fisheye view as the curl clip
([`fisheye_gym_clip_prompt.md`](fisheye_gym_clip_prompt.md)): a man's hands loading an Olympic
barbell in a gym with **2 × 20 kg and 1 × 25 kg** plates. **Yellow = 20 kg, blue = 25 kg**, as
specified.

## Decisions

| | decision | why |
|---|---|---|
| plate colours | **yellow 20 kg, blue 25 kg**, as briefed | note: competition colour code is 20 kg **blue**, 25 kg **red** — a lifter will notice; the brief's scheme is kept |
| numbers on plates | **none** — plain coloured bumper plates | Flow garbles printed numerals (no-writing rule); the colour carries the weight, and the tracking overlay can label it, as in the curl clip |
| plate size | all three the **same 450 mm diameter**, as bumper plates are | different sizes would read as different plate types, not weights |
| the action | **one** continuous action: the blue 25 kg and one yellow 20 kg are **already on the near sleeve**; he lifts the **second yellow 20 kg** from the floor and slides it on | K5b took eight takes to learn that one continuous action renders and several steps do not; all three plates are still on screen, and the clip shows loading |
| loading order | heaviest innermost: blue 25 against the collar, then yellow, then yellow | how lifters load; it also puts the blue plate deepest, framed by the two yellows |
| bar position | **lying on the gym floor** between his feet as he squats, near sleeve pointing at his feet, far sleeve empty and toward the bottom of the circle | a downward forehead camera sees a floor bar whole; a racked bar sits above the camera's view |
| route | **still first, then animate** — the same as the curl clip | text alone rarely holds the fisheye circle and the inverted mount |

## 1. Image prompt (attach `input/kickstarter/fisheye/ref_curl_86s.jpg` as style/geometry reference)

*Revision 3, 2026-10-09.* Still 1 hung straight arms onto a distant plate and was the right way up.
Still 2 fixed the orientation, but the hands rested empty on the floor, the bar ran out from between
the knees, and the plate order was reversed. **This version is shorter and leads with the held
plate as the subject.** A long prompt lets the image model keep some details and drop others, and
it kept the scene and dropped the hands. The bar now lies **across** the picture in front of his
feet, and the plate order is described as the camera sees it: blue against the collar, yellow
outside it.

```
A single photograph from a tiny 200-degree fisheye camera worn on a man's forehead, looking straight down while he squats in a gym. No text, no logos, no numbers anywhere; the plates are plain coloured rubber with no printing.

THE SUBJECT, in the centre of the picture: BOTH of his hands holding ONE SOLID YELLOW rubber bumper plate upright in front of him, a little above the floor. His left hand grips the left side of the plate's rim, his right hand grips the right side of the rim, fingers wrapped over the edge, thumbs on the face of the plate, elbows bent. The yellow plate is clearly IN HIS HANDS, lifted, not lying on the floor. Five correctly shaped fingers on each hand, tanned forearms, a black smartwatch on his left wrist.

THE BARBELL lies on the black rubber floor just below his hands, running ACROSS the picture from left to right, in front of his feet — it does NOT pass between his knees. Its LEFT end is a thick shiny chrome sleeve, and the yellow plate in his hands is lined up with the end of that sleeve, about to slide on. Already on that left sleeve, near the middle of the bar, sit two plates: a SOLID BLUE plate pushed against the collar, and outside it, toward the sleeve end, a SOLID YELLOW plate. The right end of the bar is EMPTY. Exactly three plates in the whole picture: blue and yellow on the bar, yellow in his hands. All three the same large size.

THE VIEW: one CIRCULAR fisheye image filling the full height of a 16:9 frame, pure black on the left and right, a thin pale bluish glow on the rim. It is upside down like all forehead-camera footage: his knees in grey shorts are at the very TOP edge of the circle, the floor fills the middle, and the gym's walls, plate racks and bright window curve around the BOTTOM of the circle. No ceiling at the top.

Bright daylight, slightly washed-out highlights, mild noise. No other people.
```

## 2. Clip prompt (the still as start frame · Omni Flash · 8 s · 16:9 · silent)

```
Continue exactly from the starting image. ONE CONTINUOUS SHOT, NO CUTS. SILENT. No text, no logos, no numbers anywhere; the plates carry no printing.

Keep EVERYTHING about the picture exactly as in the starting image for the whole clip: the black left and right sides, the single circular fisheye image, the strong fisheye curvature, the man's hands and forearms at the TOP of the circle, the gym curving around the bottom, the barbell lying on the floor. The frame never straightens out, never becomes a normal wide shot, and never turns the right way up.

THE PLATES never change colour, size or number: on the near sleeve, a SOLID BLUE plate against the collar and a SOLID YELLOW plate next to it; the third plate, SOLID YELLOW, is the one in his hands. Exactly three plates in total, all the same diameter.

THE ACTION, slow and clear, ONE continuous movement: with both hands on its rim he lifts the yellow plate a little off the floor, lines its centre hole up with the end of the chrome sleeve, and slides it on along the sleeve until it presses flat against the other yellow plate; then he gives it one firm push with both palms to seat it, and lets go, his hands resting on the bar's sleeve for the last moment. Every movement is real and continuous, never a frozen pose, never a jump; the plate travels along the sleeve and never passes through it.

Five correctly shaped fingers on each hand whenever they are in view; the black smartwatch stays on his LEFT wrist. The camera moves only with his head: small, natural sways, never a jump. The gym stays the same gym; nothing appears or disappears. Audio: NO MUSIC — only quiet room sound and a dull clunk as the plate seats.
```

## Judge the take in this order

The circle on black sides → the inversion (hands at the top) → **exactly three plates, blue
innermost, then yellow, yellow** → the plate goes **onto** the sleeve, never through it → hands with
five fingers → no printed numbers → one continuous action.

## If it comes back wrong

| comes back as | fix |
|---|---|
| plates change colour or a fourth plate appears | re-roll from the still; if it repeats, add *"the blue plate never turns yellow, and the yellow plates never turn blue"* |
| the plate passes through the bar or floats | shorten the action: end on the plate touching the sleeve end, drop the seating push |
| numbers or *KG* printed on plates | re-roll; for the still, add *"completely smooth, unmarked rubber faces"* |

## Labelling

As for the curl clip: if it appears anywhere public, it carries **"Simulated footage"** on screen.
