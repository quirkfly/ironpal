# Barbell loading — plate tracking overlay

**Written and built 2026-10-09.** The curl overlay's mechanism
([`curl_tracking_overlay_plan.md`](curl_tracking_overlay_plan.md)) applied to the synthetic fisheye
clip of the founder loading an Olympic barbell
(`Man_sliding_plate_on_barbell_20261009210551.mp4`, prompts in
[`fisheye_barbell_loading_prompt.md`](fisheye_barbell_loading_prompt.md)). **Plates only**: no
exercise is performed, so there is no exercise field, rep count or lift gauge.

**Output:** `input/kickstarter/fisheye/load_tracked.mp4`, 720×1280 (the clip's own portrait frame),
24 fps, 4.0 s. **Build:** `scripts/load_overlay/track.py` → `render.py`.

| | decision | evidence / why |
|---|---|---|
| detection | **colour, every frame**: HSV masks for the yellow (20 kg) and blue (25 kg) plates in the bar's band of the circle | unlike the curl's black plates on a black floor, these are saturated colours on black: the masks are clean |
| the two plates already on the bar | boxed at the **median of the clean early frames** (frames 0–39), measured each frame where clean | they do not move; later the hands cover them and per-frame masks would shrink |
| the plate being loaded | the yellow mask **left of the static yellow plate**, median-5 smoothed; after the two yellows merge, the part left of the static plate's edge | tracked from x 133 to 312 |
| seated | the loaded plate's right edge within 4 px of the static plate's | **frame 49 (2.04 s)**, gap 2 px from then on |
| markers | the curl overlay's corner-bracket boxes in accent `#00E5CC`; tags **20 kg / 25 kg** with a leader line; the loaded plate's tag reads **loading… → seated ✓** with a pulse at the seat | the curl overlay's style |
| HUD | top black band (y 0–272): **Plates on bar 45 → 65 kg** at the seat, with the three plates listed | the brief: plates only. **The bar's own 20 kg is not counted**, as instructed |
| placement | the clip's own 720×1280 frame: the circle spans y 272–1084, leaving black bands above and below | no rescale needed, unlike the curl clip |
| label | *Product interface concept · Simulated footage* in the bottom band | house rule; the footage is generated and the weights are given, not read |

**Checked:** frames 0, 24, 44, 50, 60, 90 at full size. Every box sits on its plate. The count changes
on the seat frame.
