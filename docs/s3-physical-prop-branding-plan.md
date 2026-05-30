# S3 — Physical Prop Branding (Option A: Brand the Real Headband, Skip the Composite)

**Goal:** Apply the IronPal **icon** and **"IronPal" wordmark** *physically* to the real headband prop used in the S3 shoot, so the brand is captured in-camera — correctly lit, wrapped to the fabric, moving with the band — and the doomed planar-track / corner-pin composite (`docs/s3-runway-post-production-polish.md` §4–§6) is **deleted entirely**.
**Why this path:** The composite approach bets the whole brand moment on planar-tracking a small, matte, curved, fast-moving panel anchored to AI-hallucinated geometry — high risk, sticker-look failure mode. A real logo on a real prop tracks itself, lights itself, and wraps the curve for free. This is the gold standard for product hero shots.
**Scope:** Logo branding only (icon + wordmark). The teal accent stripe is an optional same-pass add (§7); the LED is the one element that may still be cheapest in post or as a practical (§7.3).
**Prop reality (verified):** Thin **matte-black athletic fabric headband**, ~30 mm wide visible face, moisture-wicking textile, pale lining on the inside. Held as a vertical draped strip at apex (`docs/s3-shoot-plan.md` §6.1, Option A grip). It is a stand-in — no module, no LED, no stripe.
**Implication:** Branding the prop means a **re-shoot** (or a fresh branded insert) — the existing S3 takes were shot unbranded. The set, lighting, grip and framing are already fully documented in `docs/s3-shoot-plan.md`; re-running it is a ~3-hour half-day at ~$0 set cost (§8 below).
**Date:** 2026-05-30
**Owner:** Producer (solo founder)
**Refs:** `docs/s3-shoot-plan.md` (the re-shoot runbook), `docs/s3-runway-post-production-polish.md` (the composite this replaces; brand placement geometry §6.2/§7.2), `docs/color-schemes.md` (palette), `post/assets/IronPal_logo_circle_v01.png` + `IronPal_wordmark_v01.png` (vector-clean source marks).

---

## 0. Read this first — the one hard truth about the prop

It is a **synthetic moisture-wicking textile band**, not cotton and not a hard housing. That single fact drives every decision below:

- **Heat is the enemy.** Performance poly/elastane can scorch, glaze, or shrink under a heat press. Every heat-based method (HTV, DTF, silicone patch) **must be tested on a scrap or a second identical band first** — never on the hero prop cold.
- **It flexes and drapes.** Whatever goes on must bend with the band without cracking or lifting at the edges. Rules out brittle thick prints; favours thin flexible films, silicone, or thread.
- **It's matte black.** The mark must be **opaque teal that survives over black** — no sublimation (needs a light substrate), no translucent transfers.
- **You have (probably) one.** Treat the hero band as irreplaceable. **Buy a second identical band as a test mule** before touching the hero — cheapest insurance in this whole plan.

---

## 1. What goes on the band — the brand spec

| Element | Source asset | Physical size on the ~30 mm face | Notes |
|---|---|---|---|
| **Circle icon** (primary) | `post/assets/IronPal_logo_circle_v01.png` (→ get/redraw as vector SVG/EPS for cutting & printing) | **Ø ~12 mm** (= 40 % of the 30 mm face width, matching the polish-doc placement spec) | Bold open ring + dot, single color, thick uniform stroke — reproduces cleanly down to this size in *every* method below. This is the guaranteed deliverable. |
| **"IronPal" wordmark** (secondary) | `post/assets/IronPal_wordmark_v01.png` (→ vector) | **~24 mm wide × ~4–5 mm tall**, stacked directly under the icon with a ~2 mm gap | Small text — only the crisp-edge methods (DTF, silicone, fine HTV) render it legibly. Fabric-paint/embroidery may smear it. **A take never fails on the wordmark alone** — icon is the priority. |

**Get a vector first.** The PNGs are raster. Before any cutting or printing, convert the icon and wordmark to clean **SVG/EPS/PDF vector** (trace in Illustrator/Inkscape, or redraw — the icon is simple geometry). Every method below wants vector for crisp edges at 12 mm.

### 1.1 Color — match the product's electric teal

The product identity is **matte black + electric teal** (`docs/color-schemes.md`). For the *physical product mark*, use the **electric teal `#00E5CC`** (the same hue as the on-camera LED/accent — Scheme 1 "Stealth Teal"). The more muted campaign teal `#14B8A6` appears in marketing layouts; **pick one and stay consistent** — recommend `#00E5CC` so the band matches the LED and the "teal lights up in the dark" product look.

- **Nearest Pantone for ordering** (vinyl / thread / ink / silicone): bright turquoise-teal in the **PMS ~3252 C / 3265 C / 333 C** family. **Do not order on hex alone** — screen teal ≠ fabric teal. Get a physical swatch/chip and eyeball it against the logo on a calibrated screen before committing a run.
- On camera, slightly *brighter/cooler* reads better than slightly muddy — when in doubt pick the punchier teal.

---

## 2. The method options (ranked, with the trade-offs)

All five put opaque teal on matte-black flexible textile. Ranked by best balance of *reads-as-real-product* × *speed* × *cost* × *risk* for a solo-founder, n=1 hero prop.

| # | Method | Looks like… | Cost (n=1) | Lead time | Wordmark legible? | Key risk | Verdict |
|---|---|---|---|---|---|---|---|
| **1** | **DTF transfer** (direct-to-film, heat-pressed) | A crisp printed-on product graphic | ~$5–15 (single sheet, both marks) + press access | 1–3 days (mail) or same-day at a local shop | **Yes** — fine text holds | Heat on poly; edge lift if under-pressed | **★ Recommended default** — crisp icon *and* wordmark, durable, affordable, flexes fine |
| **2** | **Silicone / TPU heat-press patch** (raised rubberized logo) | A genuine premium athletic product (Nike/UA/Lululemon look) | ~$30–80 | 3–10 days; **MOQ risk** (some shops 25–50 pcs) | Yes (if panel allows) | MOQ, lead time, heat | **★ Best "real product" look** if you have a few days + small budget |
| **3** | **Matte heat-transfer vinyl (HTV)** | A clean printed mark (matte avoids plasticky gloss) | ~$5–10 (Cricut + matte teal HTV) | **Same day, DIY** | Icon yes; wordmark *only* if cut precisely + weeded carefully | Edge lift / crack on stretch; weeding fine text | **★ Best same-day DIY** — fast, controllable, good enough at hero framing |
| 4 | **Embroidery** (teal thread on black) | Premium merch / apparel branding | ~$20–40 digitize + small run | 3–7 days | Marginal at 24 mm — risk of fill smear | Puckers/stiffens a thin stretch band; stitch density | Premium textile feel, but reads "apparel" more than "device"; stiffening risk on a thin band |
| 5 | **Fabric paint + vinyl/freezer-paper stencil** | A printed-into-the-fabric matte mark | ~$0–10 (have-it-at-home) | Same day | Icon yes; wordmark risky (bleed) | Edge bleed on fine text; even coverage | **Zero-budget fallback** — no heat, full control, matte camera-friendly finish; sweat the stencil edges |

**Reading the table:** if you want it *today* with what you can buy locally → **HTV (3)**. If you can wait a few days and want it to read as a true product on 4K → **DTF (1)** as the safe crisp default, or **silicone patch (2)** for the premium raised-logo look. Embroidery (4) only if you specifically want a textile/apparel feel and accept stiffening. Paint-stencil (5) is the break-glass option if budget is truly $0.

---

## 3. Recommended path

**Primary: DTF transfer (Method 1).** Order a single custom DTF sheet (or "gang sheet") containing the **icon + wordmark sized exactly per §1**, plus 2–3 spare copies on the same sheet for test pulls and a backup band. Heat-press onto the hero band after a scrap test. Rationale: crisp on both icon *and* the small wordmark, opaque over black, flexes with the drape, durable, ~$10, and most local print/DTF shops turn it same- or next-day.

**If you have 3–10 days and want the premium look: add Silicone patch (Method 2)** for the icon (raised rubberized teal) and keep the DTF wordmark — this is the most "expensive real product" combination.

**If you need it today: Matte HTV (Method 3)**, accepting that the wordmark is the part to weed carefully (or drop it to icon-only and let the wordmark live in a lower-third caption / end card instead).

The rest of this doc details the **DTF** path step-by-step; §6 gives the HTV and stencil variants since those are the same-day options.

---

## 4. Placement geometry (the apex frame is what matters)

At the apex the band hangs as a vertical strip, pinched at the top end (`s3-shoot-plan.md` §6.1 Option A). The brand block must sit **clear of the fingers** and **square to the lens**.

```
        ▼ pinch grip (thumb + forefinger, ~15 mm from top edge)
       ┌────┐
       │ ▓▓ │   ← top ~25–30 mm: KEEP CLEAR (fingers live here)
       │    │
       │ (O)│   ← ICON  Ø~12 mm, horizontally centered
       │IrnP│   ← WORDMARK ~24 mm wide, ~2 mm under the icon
       │    │
       │    │   ← rest of the strip drapes empty
       │    │
       └────┘
   30 mm wide visible matte-black face
```

- **Horizontal:** dead-center on the 30 mm face.
- **Vertical:** brand block in the **upper third of the draped face but ≥25–30 mm below the pinch**, so fingers never cover it (mirrors the `s3-shoot-plan.md` rule "fingers must not cover the wordmark area" and the polish-doc "upper-center" spec).
- **Squareness:** the face is held within ±15° of square to camera at apex — apply the mark **flat and centered** so it presents head-on.
- **One face only:** brand the **matte-black exterior** (the face that points at camera). The lining never shows at apex, so it stays blank.

**Make a placement jig (5 min, saves the prop):** print §1 at 1:1 on paper, cut a window template, lay it on the band, mark the icon center and wordmark top with two tiny tailor's-chalk dots. Position the transfer to the dots — one clean shot, no eyeballing on the hero.

---

## 5. DTF application — step by step (the recommended path)

### 5.1 Prep the artwork & order
1. Convert icon + wordmark to **vector** (§1). Lay them out at the exact §1 sizes, teal `#00E5CC` (flag PMS ~3252 C to the shop), on a transparent canvas.
2. Order a **DTF gang sheet** with **4–6 copies** of the icon+wordmark block (hero + scrap tests + backup band). Most DTF shops take a PNG/PDF at 300 dpi; send vector if accepted.
3. While waiting, **buy a second identical band** as the test mule.

### 5.2 Test on the mule (DO NOT skip)
1. Read the band's fiber content if labeled. Set the press/iron **low-and-slow first**: start ~120–130 °C, light pressure, short dwell; step up only if the film won't bond.
2. Press one spare DTF block onto the mule. Peel per the film's hot/cold spec.
3. Check: opaque teal, crisp wordmark edges, no scorch/glaze/shrink on the fabric, no edge lift after a flex test (bend the band 180° a few times).
4. If it scorches: lower temp, add a thin cover sheet (parchment/Teflon), shorten dwell. If it won't bond: raise pressure before temp. Lock the exact settings.

### 5.3 Apply to the hero
1. Lint-roll + isopropyl-wipe the hero face (lint reads sharply at 4K — `s3-shoot-plan.md` §2).
2. Mark placement dots from the §4 jig.
3. Pre-press the band 2–3 s to drive out moisture, lay the transfer to the dots, press at the locked mule settings.
4. Peel per spec. **Post-press 5–10 s through parchment** to set durability and knock back any film gloss (matte finish reads more "product," less "sticker").
5. Flex-test gently. Inspect at 100 % on a phone macro — edges crisp, teal even, no halo.

### 5.4 Acceptance (shoot-ready)
- [ ] Icon Ø ~12 mm, centered, opaque teal, crisp ring + dot.
- [ ] Wordmark legible, edges sharp, baseline straight, ~2 mm under the icon.
- [ ] No scorch/glaze/shrink/discoloration on the surrounding fabric.
- [ ] No edge lift after flexing; mark moves *with* the fabric, not on top of it.
- [ ] At 100 % phone-macro it reads **printed onto the band**, not stuck on.
- [ ] Teal matches the intended LED/accent teal under warm light (eyeball against the logo).

---

## 6. Same-day variants

### 6.1 Matte HTV (DIY, today)
1. Vector → Cricut/Silhouette. **Mirror** the design. Cut from **matte teal HTV**.
2. **Weed** carefully — the wordmark counters (inside the "P", "a") are the hard part; a fine weeding pick + magnifier helps. If the wordmark won't weed clean at 24 mm, **go icon-only** and put "IronPal" in a caption/end card.
3. Test on the mule first (heat caution as §0/§5.2). Press icon and wordmark (layer separately if different weeding).
4. Apply to hero per §4 placement. Cover-sheet press, cool peel, re-press for durability.
5. Same acceptance as §5.4. Watch specifically for edge lift on the flexible band — re-press edges if they raise.

### 6.2 Fabric paint + stencil (zero-budget fallback)
1. Vector → cut a **stencil** from adhesive vinyl or freezer paper (icon + wordmark as negative).
2. Burnish the stencil down hard on the hero face (prevents bleed — the #1 failure on fine text).
3. **Matte teal fabric/screen paint**, thin coats, dabbed (not brushed) with a sponge/stencil brush — 2–3 light coats beat 1 thick coat for crisp edges.
4. Lift stencil while wet; let cure; **heat-set per paint instructions** (iron through cloth, test temp on mule).
5. Accept only if wordmark edges are clean — if they bled, you still have the icon (paint it solo) and caption the wordmark.

---

## 7. Optional same-pass extras

### 7.1 Teal accent stripe
The real product has a teal accent stripe down the band (`s3-shoot-plan.md` §8). If you want it physical too: a **thin (~2–3 mm) teal HTV or DTF stripe** down the band length, or a sewn teal ribbon/piping. Same heat-test caution. Optional — the logo is the priority; the stripe can stay in post.

### 7.2 Keep it consistent for future shots
Whatever method + exact teal + sizing you lock here becomes the **repeatable recipe** for S4a, the cap (S6b), and S7 product shots. Save the vector artboard, the press settings, and a reference photo to `post/assets/` so every future prop matches.

### 7.3 The LED
The teal LED is the one element that's often still cheapest in post (a tracked soft radial glow synced to VO-2, per `s3-shoot-plan.md` §9 step 6) — a single glowing dot is trivial to composite and doesn't carry the sticker/track-drift risk the logo did. A real practical (a tiny 3 mm teal SMD LED + coin cell) is possible if you want it fully in-camera, but it's fiddly for a fabric band — post is the pragmatic call for the LED only.

---

## 8. Re-shoot integration (this is cheap)

Branding the prop means re-capturing S3 with the now-branded band. **The shoot is already fully specified** — just re-run `docs/s3-shoot-plan.md` with the branded band:

- Same locked-off 4K hero (Shot A), same warm golden-hour key, same Option-A vertical-drape grip (§6.1), same 8–10 takes.
- **One change:** the apex now needs the **branded face** square to camera (it already did, for the composite) — so nothing new in blocking; the logo is just *real* now.
- Post collapses to **color grade + optional LED glow only** — no planar track, no corner-pin, no mesh-warp. Hours saved, risk gone.
- Cheapest option of all: if a full re-shoot isn't wanted, shoot a **single branded apex insert** (locked-off, the branded band at the hold) and cut it into the existing motion — but a full re-run is only ~3 hours at ~$0 and gives a continuous real branded lift.

---

## 9. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Heat press scorches/shrinks the poly band | Medium | High | **Test on a second identical band first** (§5.2); low-and-slow temp; cover sheet. Never test cold on the hero. |
| Only one band; ruin it | Low–Med | High | Buy a 2nd identical band as mule + backup before touching the hero. |
| Wordmark illegible at 24 mm | Medium | Low | DTF/silicone render it; if HTV/paint smears it → **icon-only + caption the wordmark**. A take never fails on the wordmark alone. |
| Teal doesn't match the LED/accent on camera | Medium | Medium | Order to PMS swatch, not hex; eyeball physical chip vs logo under warm light before committing. |
| Edge lift / cracking on the flexible band | Medium | Medium | Post-press for durability; flex-test before shoot; matte finish + good adhesion; re-press edges. |
| Mark reads as a sticker, not printed | Low | Medium | Matte finish (knock back gloss with a parchment post-press); DTF/paint sit *in* the weave better than glossy HTV. |
| Re-shoot continuity drift vs S2c/S4a | Low | Low | Re-use the exact `s3-shoot-plan.md` lighting + grip; include the known-white reference frame for the colorist. |

---

## 10. Deliverables

- [ ] Vector artwork (icon + wordmark) at §1 sizes, teal-spec'd → `post/assets/IronPal_mark_vector_v01.svg`
- [ ] The **branded hero band** (+ a branded backup band)
- [ ] Locked recipe note (method, exact teal/PMS, press temp/time/pressure, placement dims) → `post/assets/prop-branding-recipe_v01.md` for re-use on S4a/S6b/S7
- [ ] One macro reference photo of the branded face for CD sign-off **before** the re-shoot
- [ ] Re-shot S3 selects per `docs/s3-shoot-plan.md` §12, now with real branding (post = grade + optional LED only)

---

## 11. References

- `docs/s3-shoot-plan.md` — the re-shoot runbook (set, lighting, Option-A grip, framing); this plan feeds the branded band into it
- `docs/s3-runway-post-production-polish.md` — the composite this **replaces**; §6.2/§7.2 placement geometry reused here
- `docs/color-schemes.md` — palette; electric teal `#00E5CC` is the product/LED accent
- `post/assets/IronPal_logo_circle_v01.png`, `IronPal_wordmark_v01.png` — source marks (convert to vector before applying)
- `input/images/logo/v4/Geometric teal circle on navy.png` — canonical logo / design source of truth

---

**Prepared by:** Producer (solo founder)
**Date:** 2026-05-30
**Status:** Ready to execute. Decision gate: pick method by timeline — DTF (safe crisp default, few days) / silicone patch (premium, few days + small budget) / matte HTV (today, DIY). Buy a test-mule band first.
