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
| bar position | **lying on the gym floor** in front of him, near sleeve toward the lower-left of the circle | a downward forehead camera sees a floor bar whole; a racked bar sits above the camera's view |
| route | **still first, then animate** — the same as the curl clip | text alone rarely holds the fisheye circle and the inverted mount |

## 1. Image prompt (attach `input/kickstarter/fisheye/ref_curl_86s.jpg` as style/geometry reference)

```
A single photograph from a tiny 200-degree fisheye camera worn on a man's forehead, pointing down at the floor in front of him. No text, no logos, no numbers anywhere — the weight plates carry no printing.

The frame is 16:9 and PURE BLACK on the left and right; in the middle is ONE large CIRCULAR fisheye image filling the full height of the frame, its top and bottom edges just clipped. A thin pale bluish-white glow runs around the rim of the circle. Inside the circle everything bends into a sphere: straight lines curve strongly toward the rim and the room wraps around the edges.

The image is UPSIDE DOWN relative to a normal photo: the man's OWN body is at the TOP edge of the circle — his forearms and both hands come into view from the top — the gym floor fills the middle, and the gym's walls, racks and lights curve around the BOTTOM half of the circle.

A modern strength gym in bright daylight: black rubber floor with faint tile seams, a squat rack and a rack of plates curving around the rim, a large bright window slightly overexposing the highlights. Nothing domestic.

On the black rubber floor in front of him lies an OLYMPIC BARBELL: a long chrome bar with knurled grip, running across the lower half of the circle, its near end — a thick, shiny chrome sleeve — toward the lower left. On that near sleeve, pushed against the collar, sit TWO plain rubber bumper plates, all the same large diameter: first, innermost, a SOLID BLUE plate; next to it, a SOLID YELLOW plate. A third plate, also SOLID YELLOW and the same size, stands upright on the floor beside the sleeve, his two hands gripping its rim from above, lifting it. Both hands are clearly visible: tanned forearms, five correctly shaped fingers on each hand, a black smartwatch on his LEFT wrist.

Consumer action-camera look: bright, slightly washed-out highlights, mild noise, slight purple fringing at the rim of the circle. No other people.
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
