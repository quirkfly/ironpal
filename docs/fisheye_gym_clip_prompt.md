# Synthetic fisheye gym clip — Omni Flash prompt

**Written 2026-10-09.** A generated stand-in for the real ELP 200° fisheye footage, set in a gym
instead of the living room the real clip was shot in.
**Source studied:** `input/kb/clips/IPS_2026-08-02.15.33.00.0640.mp4`. This is the last fisheye clip on
disk; the A52 was not attached, so a newer one on the phone was not checked.
**Reference frames** (real, from that clip): `input/kickstarter/fisheye/ref_curl_86s.jpg` (the curl),
`ref_hands_62s.jpg` (hands on the dumbbell).

## What the real clip looks like — the traits to reproduce

| trait | in the real clip |
|---|---|
| frame | 16:9, 3840×2160. **One circular fisheye image** fills the frame's height, its top and bottom just clipped, **pure black** left and right; a thin pale bluish-white ring at the circle's rim |
| lens | 200° fisheye: everything bends into a sphere, straight lines curve hard toward the rim, the room wraps around the edges |
| orientation | **mounted on the forehead, pointing down, image inverted**: the wearer's own knees, forearms and hands sit at the **top** edge of the circle; the floor fills the middle; walls and furniture curve around the **bottom** |
| subject | kneels and assembles a black spin-lock dumbbell (plates onto a chrome handle), then stands and curls it; the dumbbell swings up into the top of the circle, **huge because it is centimetres from the lens**, with motion blur |
| wearer | tanned forearms, a **black smartwatch on the left wrist**, white shorts |
| look | consumer action-cam: bright, slightly overexposed, washed highlights, mild noise, slight purple fringing at the rim |

## Production notes

- **Generate a still first, then animate it.** Fisheye geometry and the inverted body position are
  far outside a video model's habits, and the text alone will mostly come back as a normal
  wide shot. Make one frame with an image model from the prompt below, with `ref_curl_86s.jpg` as the
  style and geometry reference. Check it has the circle, the black sides, the hands at the top and a
  gym, not a living room. Then hand that frame to Omni Flash as the **start frame** with the
  prompt. If you skip the still, attach `ref_curl_86s.jpg` as the reference image, but expect the
  living room to leak into the result.
- **8 s, 16:9, silent.** Judge the take in this order: the circle with black sides → the inversion
  (hands at the top) → a gym, with no sofa or rug → the hands, with five fingers on each → the motion.
- **Disclosure.** This is generated footage presented in the style of the device's own camera. If it
  appears in the campaign, the film or the site, label it *simulated* on screen. A viewer will
  otherwise take it for real IronPal footage, and the claim guardrails rule out passing it off as
  that.

## The prompt

```
SIMULATED FIRST-PERSON FISHEYE CAMERA FOOTAGE. NO TEXT, NO CAPTIONS, NO LOGOS, NO NUMBERS ANYWHERE IN FRAME. ONE CONTINUOUS SHOT, NO CUTS. SILENT.

The picture is recorded by a tiny 200-degree fisheye camera worn on a man's forehead, pointing down at the floor in front of him. The whole frame is 16:9 and PURE BLACK on the left and right; in the middle is ONE large CIRCULAR fisheye image that fills the full height of the frame, its top and bottom edges just clipped by the frame. Around the rim of the circle runs a thin pale bluish-white glow. Inside the circle the lens bends everything into a sphere: straight lines curve strongly toward the rim and the room wraps around the edges of the circle.

The image is UPSIDE DOWN relative to normal footage, because of how the camera is mounted: the man's OWN body is at the TOP edge of the circle — his knees, his forearms and his hands come into view from the top — the floor of the gym fills the middle of the circle, and the gym's walls, equipment racks and lights curve around the BOTTOM half of the circle.

The place is a modern strength gym in bright daylight: a black rubber gym floor with faint tile seams, a long rack of black hex dumbbells, a flat black weight bench, a squat rack, a large window letting in strong daylight that slightly overexposes the bright areas. Nothing domestic: no sofa, no rug, no bookshelves, no home furniture.

THE ACTION, slow and clear: the man stands holding ONE black adjustable dumbbell — a chrome bar with round black plates on each end, locked with black collars — in his RIGHT hand, his arm hanging down. He curls it upward in one smooth movement: as it rises it swings up toward his face and therefore toward the camera, so it comes in from the TOP of the circle and grows very large and slightly motion-blurred as it passes close to the lens; he holds it there for a moment, then lowers it slowly back down and out of view at the top edge. He does this three times at a steady pace. His LEFT hand stays visible near the top edge of the circle, relaxed. Both hands are clearly visible whenever they are in the circle: tanned forearms, five correctly shaped fingers on each hand, and a black smartwatch on his LEFT wrist.

The camera moves only with his head: small, natural sways as he lifts, never a jump. The footage looks like a consumer action camera: bright, slightly washed-out highlights, mild sensor noise, a little purple fringing near the rim of the circle. No other people in the picture.
```

## If the take comes back wrong

| comes back as | fix |
|---|---|
| a normal wide shot, no circle | the still-first route above; text alone rarely holds the circle |
| the right way up (the gym floor at the bottom, his hands at the bottom) | re-roll from a start frame that already has his hands at the top |
| the living room again | the reference image is leaking: use the generated gym still as the start frame, never the real frame |
| the dumbbell stays small | add *"so close to the lens that it fills a third of the circle at the top of each curl"* |
