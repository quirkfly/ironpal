# Synthetic fisheye clip — loading a bench-press bar · Omni Flash prompts

**Written 2026-10-09.** The forehead-fisheye view again: the founder loads a barbell racked over a
flat bench, about to bench press. Plates: **1 × 20 kg yellow, 1 × 15 kg red, 1 × 10 kg green** (revised from 2 × 15 and 2 × 10 at
the founder's call, 2026-10-09). Built on what the barbell-loading still finally needed (rev 4 of
[`fisheye_barbell_loading_prompt.md`](fisheye_barbell_loading_prompt.md)): the plates listed **left
to right**, all faces **parallel**, the held plate at the **sleeve tip**, and one continuous action.

## Decisions

| | decision | why |
|---|---|---|
| balance | **loading in progress**: all three plates go on the near sleeve, yellow 20 + red 15 + the green 10 being slid on; the far sleeve is empty, the next side to load | three single plates cannot balance a bar; a half-loaded bar is the normal state mid-loading and reads as such |
| bar | **racked in the bench's uprights**, horizontal, at about hip height; he stands at the end of the bar | that is a bench-press setup; a forehead camera looking down sees the sleeve below it |
| plate colours | yellow 20, red 15, green 10, as briefed | competition code differs (20 blue, 15 yellow, 25 red; 10 green matches); kept as briefed |
| plates | plain bumpers, **no printing**, all **the same diameter** | Flow garbles numerals; bumper plates of 10–20 kg share a 450 mm diameter |
| loading order | yellow 20 innermost against the collar, then red 15, then the green 10 | heaviest innermost |
| orientation | inverted, as always: his own body (chest, belt line, thighs) at the **top** edge; the bench and floor in the middle; the gym curving around the **bottom** | the ELP forehead mount |

## 1. Image prompt (attach `input/kickstarter/fisheye/ref_curl_86s.jpg` as style/geometry reference)

*Revision 2, 2026-10-09.* The first four stills all put him **behind the bench at the middle of the
bar** (the lifter's spot, not the loader's), held the green plate **flat like a tray** over the
bench, and added plates to the right sleeve. The cause was in my prompt: *"stands at the end of a
bench-press station"* reads as *behind the bench*. This version leads with **where he stands**: the
bar's left end, beside the bench, body at the top-left of the circle. It places the bench under the
**middle** of the bar, says the green plate is held **upright on its edge, never flat**, and leaves
the right sleeve **bare chrome**.

```
A single photograph from a tiny 200-degree fisheye camera worn on a man's forehead, looking straight down while he loads a bench-press bar in a gym. No text, no logos, no numbers anywhere; the plates are plain coloured rubber with no printing.

WHERE HE STANDS: at the LEFT END of the barbell, beside the bench — NOT behind the bench, NOT at its head, NOT in the middle of the bar. So in the picture his body is at the TOP-LEFT of the circle and the bench is to his right.

THE BAR runs straight ACROSS the picture from left to right, horizontal, resting in two steel J-hook uprights. THE BENCH is a flat black padded bench under the MIDDLE of the bar, running from the bar down toward the bottom of the circle; the uprights stand at the bench's top end, one on each side of it.

Reading along the bar from LEFT to RIGHT, exactly this, in this order:
1. at the far left, near his hands, a SOLID GREEN plate held in his two hands, standing UPRIGHT ON ITS EDGE, just beyond the tip of the bar, about to slide on;
2. the bare shiny chrome tip of the left sleeve;
3. a SOLID RED plate already on the sleeve;
4. a SOLID YELLOW plate already on the sleeve, pressed against the collar;
5. the left upright, the bare knurled bar over the bench, the right upright, and the right sleeve, which is BARE CHROME with NO plates on it.

ALL THREE PLATES ARE UPRIGHT AND FACE THE SAME WAY: their flat round faces PARALLEL, each standing on its edge with its face pointing along the bar, like slices of the same loaf. The green plate in his hands is held exactly like the other two — upright, NEVER flat, NEVER horizontal like a tray, NEVER held over the bench.

There are EXACTLY THREE plates in the whole picture: green in his hands, red and yellow on the left sleeve. None on the right side, none on the floor, none on the bench.

HIS HANDS are at the LEFT of the picture, gripping the green plate's rim: one hand at the top of the rim, one at its side, fingers wrapped over the edge, thumbs on the plate's face, elbows bent. Five correctly shaped fingers on each hand, tanned forearms, a black smartwatch on his left wrist.

THE VIEW: one CIRCULAR fisheye image filling the full height of a 16:9 frame, pure black on the left and right, a thin pale bluish glow on the rim. Upside down like all forehead-camera footage: his own body and grey shorts at the TOP edge of the circle, the bench and the black rubber floor in the middle, the gym's walls and bright window curving around the BOTTOM. No ceiling at the top.

Bright daylight, slightly washed-out highlights, mild noise. No other people.
```

## 2. Clip prompt (the accepted still as start frame · Omni Flash · 8 s · 16:9 · silent)

```
Continue exactly from the starting image. ONE CONTINUOUS SHOT, NO CUTS. SILENT. No text, no logos, no numbers anywhere; the plates carry no printing.

Keep EVERYTHING about the picture exactly as in the starting image for the whole clip: the black surround, the single circular fisheye image and its curvature, his own body at the TOP of the circle, the bench, the uprights, the gym curving around the bottom. The frame never straightens out, never becomes a normal shot and never turns the right way up.

THE BAR AND PLATES never change: the barbell rests in the J-hooks, horizontal; on its left sleeve a SOLID YELLOW plate against the collar and a SOLID RED plate next to it; the plate in his hands is SOLID GREEN; the right end of the bar stays empty. Exactly three plates, all the same size, always parallel — the green plate is never turned sideways, and no other plate ever appears.

THE ACTION, slow and clear, ONE continuous movement: holding the green plate by its rim with both hands, he slides it to the RIGHT along the chrome sleeve, keeping it upright and square to the bar, until it presses flat against the red plate. He gives it one firm push with his right palm to seat it, lets go, and rests both hands on the bar beside the plates for the last moment, ready to load the other side. The plate travels ALONG the bar — it never passes through it, never floats, never tilts — and the bar never moves in the hooks.

Five correctly shaped fingers on each hand in every frame; the black smartwatch stays on his left wrist. The camera moves only with his head, small natural sways, never a jump. The gym stays the same gym; nothing appears or disappears. Audio: NO MUSIC — only quiet room sound and a dull rubber clunk as the plate seats.
```

## Judge the take in this order

The circle on black sides → the inversion (his body at the top) → **the bar in the hooks over the
bench** → **exactly three plates: yellow, red, green at the left in that order, nothing else** → all left plates parallel → the plate goes along the sleeve, never through it → five
fingers → no printed numbers.

## Labelling

If it appears anywhere public, it carries **"Simulated footage"** on screen.
