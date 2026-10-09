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

*Revision 4, 2026-10-09.* Still 3 got the hands holding a plate and the view right. Two faults were
left: **the held plate stood across the middle of the bar, turned 90°**, and **blue sat outside
yellow**. Image models do poorly with *inner / outer* and *lined up with the sleeve*, and better with
an explicit left-to-right order and *parallel*. This version lists the bar from left to right, says
all three plates face the same way ("slices of the same loaf"), and puts the hands and the held
plate at the bar's left tip.

**If two more rolls miss the geometry, stop prompting and edit.** Still 3's hands are good. Keep
that still and fix only the held plate's angle and the plate order with the image model's
inpainting/edit tool: select the held plate, ask for *"the same yellow plate turned 90 degrees so its
face is parallel to the plates on the bar, held just beyond the left tip of the bar"*. Changing one
region rarely breaks the rest; regenerating the whole frame usually does.

```
A single photograph from a tiny 200-degree fisheye camera worn on a man's forehead, looking straight down while he squats in a gym. No text, no logos, no numbers anywhere; the plates are plain coloured rubber with no printing.

THE BARBELL lies on the black rubber floor in front of his feet, running straight ACROSS the picture from left to right. Reading along the bar from LEFT to RIGHT, there is exactly this, in this order:
1. at the far left, a SOLID YELLOW plate held in his two hands, standing upright just beyond the tip of the bar, a few centimetres from it;
2. the bare shiny chrome tip of the left sleeve;
3. a SOLID YELLOW plate already on the sleeve;
4. a SOLID BLUE plate already on the sleeve, pressed against the collar;
5. the collar, then the long bare knurled middle of the bar running to the right edge, with NO plates on the right side at all.

ALL THREE PLATES FACE THE SAME WAY: their flat round faces are PARALLEL to each other, each standing upright with its face pointing along the bar, like slices of the same loaf, so all three look the same shape from the camera. The plate in his hands is simply the next slice, waiting to slide onto the left end of the bar. It is NOT turned sideways and NOT standing across the bar.

HIS HANDS are at the LEFT of the picture, gripping the held yellow plate by its rim: one hand at the top of the rim, one at the side, fingers wrapped over the edge, thumbs on the plate's face, elbows bent. Five correctly shaped fingers on each hand, tanned forearms, a black smartwatch on his left wrist.

THE VIEW: one CIRCULAR fisheye image filling the full height of a 16:9 frame, pure black on the left and right, a thin pale bluish glow on the rim. It is upside down like all forehead-camera footage: his knees in grey shorts are at the very TOP edge of the circle, the floor fills the middle, and the gym's walls, plate racks and bright window curve around the BOTTOM of the circle. No ceiling at the top.

Bright daylight, slightly washed-out highlights, mild noise. No other people.
```

## 2. Clip prompt (the accepted still as start frame · Omni Flash · 8 s · 16:9 · silent)

*Written against still 4 (accepted 2026-10-09): the hands at the bar's left tip gripping a yellow
plate, a yellow plate and a blue plate on the bar to its right, the right end bare, knees at the top,
dumbbell racks around the left rim, the window along the bottom. The prompt describes that frame
exactly, so the model continues it and does not reinvent it. The action is the shortest believable
loading move: slide the plate home against the yellow one, seat it, let go.*

```
Continue exactly from the starting image. ONE CONTINUOUS SHOT, NO CUTS. SILENT. No text, no logos, no numbers anywhere; the plates carry no printing.

Keep EVERYTHING about the picture exactly as in the starting image for the whole clip: the black surround, the single circular fisheye image and its curvature, the man squatting with his knees at the TOP of the circle, the black rubber floor, the dumbbell racks around the left rim and the bright window along the bottom. The frame never straightens out, never becomes a normal shot and never turns the right way up.

THE BAR AND PLATES never change: the barbell lies straight across the floor from left to right; on it, a SOLID YELLOW plate and, to its right, a SOLID BLUE plate; the right end of the bar is bare. The plate in his hands is the third one, SOLID YELLOW. Exactly three plates, all the same size, all three faces always parallel to each other — the plate in his hands is never turned sideways.

THE ACTION, slow and clear, ONE continuous movement: holding the yellow plate by its rim with both hands, he slides it to the RIGHT along the chrome sleeve, keeping it upright and square to the bar, until it presses flat against the yellow plate already on the bar. He gives it one firm push with his right palm to seat it, then lets go and rests both hands on top of the seated plates for the last moment. The plate travels ALONG the bar — it never passes through the bar, never floats free, never tilts. Every movement is real and continuous, never a frozen pose, never a jump.

Five correctly shaped fingers on each hand in every frame; the black smartwatch stays on his left wrist. His knees and feet stay where they are; the camera moves only with his head, small natural sways, never a jump. The gym stays the same gym; nothing appears or disappears. Audio: NO MUSIC — only quiet room sound and a dull rubber clunk as the plate seats.
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
