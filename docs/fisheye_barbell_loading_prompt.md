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

*Revised 2026-10-09 after the first still: arms hung straight from the top, pressing on top of a
plate standing a metre from the bar; the room was the right way up (window at the top); a fourth
plate appeared on the far sleeve. The orientation rule now leads, the grip is described as lifters
hold a plate (rim at ten and two, thumbs on the face, elbows bent by the knees, plate at the sleeve
end), and the far sleeve is stated empty.*

```
A single photograph from a tiny 200-degree fisheye camera worn on a man's forehead, looking STRAIGHT DOWN at the floor between his feet while he squats low beside a barbell. No text, no logos, no numbers anywhere — the weight plates carry no printing.

The frame is 16:9 and PURE BLACK on the left and right; in the middle is ONE large CIRCULAR fisheye image filling the full height of the frame, its top and bottom edges just clipped. A thin pale bluish-white glow runs around the rim of the circle. Inside the circle everything bends into a sphere and the room wraps around the edges.

ORIENTATION — the most important rule: the camera hangs face-down from his forehead, so the picture is UPSIDE DOWN compared with a normal photo. The man's OWN body is at the TOP of the circle: his two knees in grey shorts appear along the very top edge, close to the lens, because he is squatting, and his forearms come down into the circle from between and beside his knees. The black rubber floor fills the MIDDLE of the circle. The gym's walls, plate racks and the bright window appear ONLY around the BOTTOM half of the circle, upside down and curving along the rim. There is NO ceiling, NO window and NO horizon at the top of the circle.

On the floor in the middle of the circle lies an OLYMPIC BARBELL, almost straight, its near end — a thick, shiny chrome sleeve — pointing toward his feet, slightly to the left of centre. The far end of the bar runs out toward the bottom of the circle and its far sleeve is EMPTY, with no plates on it. On the near sleeve, pushed against the collar, sit TWO plain rubber bumper plates of the same large diameter: innermost a SOLID BLUE plate, next to it a SOLID YELLOW plate. These are the ONLY plates on the bar.

HIS HANDS — natural, the way lifters actually hold a bumper plate to load it: he holds a third SOLID YELLOW plate, the same size, UPRIGHT and right at the end of the near sleeve, a few centimetres off the floor, its centre hole lined up with the sleeve, about to slide on. His forearms come in from the top of the circle and angle INWARD toward the plate, elbows bent and close to his knees. His LEFT hand grips the plate's rim at about the ten o'clock position and his RIGHT hand at about the two o'clock position: fingers curled around the rim's edge, thumbs resting flat on the plate's face. His wrists are firm and straight, the grip relaxed and practised — he is not pressing down on the top of the plate and his arms are not straight. Both hands are clearly visible and sharp: tanned forearms, five correctly shaped fingers on each hand, a black smartwatch on his LEFT wrist.

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
