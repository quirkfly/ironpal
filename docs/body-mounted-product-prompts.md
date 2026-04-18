# IronPal — Standalone Product Illustration Prompts (Leonardo AI)

These two prompts produce clean photorealistic product-only illustrations for marketing materials (landing page hero, investor pitch deck, Kickstarter gallery). Each shows the product on a studio background with the IronPal logo — no gym scene, no model, no action.

---

## Leonardo AI Configuration

| Setting | Value |
|---|---|
| **Model** | Phoenix |
| **PhotoReal** | ON — Cinematic |
| **Alchemy** | ON |
| **Aspect Ratio** | 3:2 (versatile) or 16:9 (banner) |
| **Guidance Scale** | 8 |
| **Image Guidance** | **Style Reference**: upload `input/images/logo/v4/Geometric teal circle on navy.png` at strength 0.25 — carries the Iron Ring icon geometry and teal/navy brand palette into the generation without forcing layout |
| **Generation count** | 4–8 per prompt — select best execution |

### Negative Prompt (apply to both)

```
cartoon, illustration, painting, drawing, anime, 3d render, CGI, watermark, text overlay, blurry, low quality, distorted, deformed, oversaturated, artificial looking, plastic, stock photo watermark, border, frame, collage, multiple views, split frame
```

### Logo Handling

The IronPal logo lockup on the product is: the **Iron Ring icon** (an open electric teal circular ring with a clean gap at the bottom and a solid teal dot at the top, matching the shape in `Geometric teal circle on navy.png`) followed immediately by the **wordmark "IronPal"** in clean modern sans-serif lettering in electric teal — written in camelCase exactly as IronPal, never in all capitals. The icon and wordmark together form the logo lockup, approximately 30mm wide on the headband or 25mm wide on the cap.

Leonardo renders this logo reliably when described in premium product-marketing prose (as below). If a generation misfires on the wordmark, use Leonardo **Inpainting** on just the logo patch — do not rewrite the prompt.

---

## Prompt #1 — Headband Camera (Standalone Product)

**Prompt:**

```
A photorealistic product marketing hero image of a sleek, modern fitness headband with a tiny embedded camera module. The headband is matte black with a thin accent stripe in electric teal running along the lower edge, made from moisture-wicking athletic fabric. The camera module is barely visible — a small, flush-mounted lens, roughly 8mm diameter, centered on the front panel of the headband, with no protruding parts. A micro LED next to the lens glows soft teal. On the right side of the headband, the IronPal logo is printed in electric teal: a small open circular ring with a clean gap at the bottom and a solid teal dot at the top, followed by the wordmark "IronPal" in clean modern sans-serif lettering in teal — written in camelCase exactly as IronPal, never in all capitals — subtle but clearly legible, like premium Apple or Garmin athletic branding. The headband is displayed on a clean white-to-light-gray gradient studio background, shot from a slight three-quarter angle to show both the front lens area and the side branding. Style: Photorealistic product photography with studio lighting on the headband. Clean, minimal, premium feel. Suitable for a product landing page or investor pitch deck. No text overlays.
```

**Post-Production Steps:**
1. If the Iron Ring icon or "IronPal" wordmark renders poorly, use Leonardo **Inpainting** on just the headband side panel to regenerate.
2. Color-correct all teal elements to match the brand electric teal `#00E5CC` exactly.
3. Optional: composite the precise Iron Ring icon from `Geometric teal circle on navy.png` onto the headband side in Photoshop if the AI-generated ring shape is imprecise — use a subtle print-on-fabric texture overlay for realism.

---

## Prompt #2 — Baseball Cap Camera (Standalone Product)

**Prompt:**

```
A photorealistic product marketing hero image of a modern, minimalist structured matte black baseball cap with a tiny embedded camera module. The cap has a curved brim with a thin accent stripe in electric teal along its edge, made from moisture-wicking athletic fabric with an athletic-fit silhouette. The camera module is barely visible — a small, flush-mounted lens, roughly 8mm diameter, centered on the front panel of the cap just above the brim, with no protruding parts. A micro LED next to the lens glows soft teal. On the left side panel of the cap, the IronPal logo is embroidered in electric teal thread: a small open circular ring with a clean gap at the bottom and a solid teal dot at the top, followed by the wordmark "IronPal" in clean modern sans-serif lettering in teal — written in camelCase exactly as IronPal, never in all capitals — clean precise thread work, subtle but clearly legible, like premium Apple or Garmin athletic branding. The cap is displayed on a clean white-to-light-gray gradient studio background, shot from a slight three-quarter angle to show both the front lens area and the side panel branding. Style: Photorealistic product photography with studio lighting on the cap. Clean, minimal, premium feel. Suitable for a product landing page or investor pitch deck. No text overlays.
```

**Post-Production Steps:**
1. If the Iron Ring icon or "IronPal" wordmark renders poorly, use Leonardo **Inpainting** on just the cap side panel to regenerate.
2. Color-correct all teal elements to match brand electric teal `#00E5CC` exactly.
3. Optional: composite the precise Iron Ring icon from `Geometric teal circle on navy.png` onto the cap side panel in Photoshop if the AI-generated ring shape is imprecise — use a subtle embroidery/thread texture overlay for realism.

---

## Tips

- **Generate 4+ variants per prompt** and select the best composition, lighting, and logo clarity.
- **Use the Style Reference** (`Geometric teal circle on navy.png` at strength 0.25) to anchor the teal color and ring geometry across both prompts — this produces much more consistent brand colors than relying on the hex code alone.
- **If one generation nails the headband/cap but misses the logo**, save it and use Inpainting on just the logo patch rather than regenerating the whole image.
- **For an approved headband generation**, save as `_canonical/headband_reference.jpg` — this reference is also used by the video key-frame prompts in `docs/body-mounted-image-prompts-updated.md` for cross-shot product consistency (Image-to-Image at strength 0.35).
- Both prompts total ~900 characters each — well within Leonardo Phoenix's prompt length limit.
