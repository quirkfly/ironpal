# IronPal Campaign — Leonardo Game-Asset Prompts

Parsed by `scripts/game/leonardo_gen.py`: every `id: prompt` line inside a fenced block under a
`## <section>` heading (section = `--section` argument). Raw output lands in
`input/game-assets/leonardo/<id>/` (gitignored, paid); curated files are installed into
`poc/mobile/assets/game/` by `scripts/game/install-assets.py`.

**What these assets are for.** The self-training loop is presented as a first-person campaign
(feature PRD §8; design §17). The *first-person view* is the real headband camera; these assets are
the **HUD chrome, emblems, badges and briefing backdrops** drawn over and around it. They must feel
like a tactical shooter's interface — crosshair, hit marker, round start/end, rank insignia, level
briefings — while being **original**: no names, logos, weapons, characters or level art from any
real game (constraint C6). Targets are always iron: plates, pins, dumbbells.

**Brand palette** (`docs/color-schemes.md`, Stealth Teal): charcoal `#1A1A2E`, gunmetal `#2D2D3A`,
electric teal `#00E5CC`, ice white `#F0F4F8`, neon lime `#BFFF00` (sparingly).

**Shared style suffixes** (kept identical per section so each set reads as one system):

> **Emblem/icon suffix (generated sections):** flat 2D vector game emblem, strictly symmetrical and
> centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid
> pure black background that fills the entire frame, no perspective, no floor, no ground plane, no
> shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges,
> high contrast

> **Backdrop suffix:** dark cinematic tactical interface backdrop, charcoal navy and gunmetal, thin
> electric teal grid lines and holographic edges, subtle vignette, wide composition with a large
> empty centre area kept clear for UI, no text, no letters, no people, no weapons, moody volumetric
> light, high detail

**Negative prompt** lives in the script (text, logos, weapons, people, blood, real-game references).

Generated emblems are composited in the app with **screen/additive blending** over dark UI, so a
residual dark background costs nothing; `install-assets.py` runs `rembg` only for the few that must
sit on light surfaces. HUD glyphs are SVG and tint at runtime.

---

## hud-drawn-locally

> **The HUD glyphs are NOT generated.** `scripts/game/draw-hud.py` draws them as SVG (and PNG
> previews). The first test proved why: SDXL turned a four-slash hit marker into a 3D teal crystal
> on a grey studio floor (`input/game-assets/leonardo/hud_hitmarker/`). A crosshair, a hit marker,
> a bracket pair, an ammo row or a six-segment gauge is geometry with one job — to be exact,
> symmetrical and tintable at runtime — and a diffusion model does none of that reliably. The
> prompts are kept below for the record, **outside a fenced block so the generator never parses
> them; do not spend credits on them.**

Overlay elements on the live first-person view (drawn locally):


- `hud_crosshair_idle`: a thin minimalist shooter crosshair reticle made of four short gunmetal ticks around an open centre with a faint teal outer ring, resting state, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_crosshair_locked`: a thin shooter crosshair reticle with four ticks snapped inward and a bright electric teal ring fully lit, corner brackets closed around the centre, target acquired state, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_hitmarker`: a classic shooter hit marker made of four short diagonal white slashes forming an open X with a soft electric teal glow, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_hitmarker_bonus`: a shooter hit marker made of four diagonal slashes forming an open X in bright neon lime with a strong glow and a thin lime ring, exact-rep bonus state, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_gate_open`: a horizontal teal bracket pair opening outward with a small pulsing dot between them, round start indicator, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_gate_close`: a horizontal gunmetal bracket pair closed together into a solid bar with a dimming teal edge, round end indicator, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_link_lost`: a stylised radio signal arc icon broken by a diagonal gunmetal slash with a dim red-orange warning glow, connection lost indicator, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_target_plate`: a single cast iron weight plate seen face-on with a central bore, rendered as a tactical target silhouette with a thin teal targeting ring around it, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_target_pin`: a vertical stack of flat gunmetal weight plates with a glowing teal selector pin inserted in one slot, rendered as a tactical target silhouette with a thin teal targeting ring, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_target_dumbbell`: a single hex dumbbell seen from the side rendered as a tactical target silhouette with a thin teal targeting ring around its head, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_armor_meter`: a segmented hexagonal armour plate gauge with six segments, four lit in electric teal and two dark, integrity meter, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D
- `hud_magazine`: a row of five vertical rounded gunmetal bars like an ammunition counter, three lit teal and two dark, sets remaining indicator, flat vector game HUD icon, tactical military shooter interface style, matte black and gunmetal metal, electric teal glow accents, sharp geometric shapes with thin bevels, single centred object, plain pure black background, no text, no letters, no numbers, crisp edges, high contrast, 2D

## emblems

Campaign and role emblems. Square 1024, black background.

```
emblem_ground_game: a bold circular military campaign emblem featuring a stylised barbell over a mountain silhouette, gunmetal ring with electric teal inner glow, chevron notches on the ring, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
emblem_arms: a bold shield-shaped military campaign emblem featuring a stylised dumbbell crossed with a cable pulley, gunmetal shield with electric teal edge glow, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
emblem_black_ops: a bold hexagonal covert-operations emblem featuring a stylised eye over a weight stack silhouette, near-black gunmetal with a thin dim teal outline and a single teal glint, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
emblem_scout: a circular reconnaissance emblem featuring a stylised compass rose over a folded map with a small flag pin, gunmetal with electric teal glow, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
emblem_bootcamp: a circular training emblem featuring a stylised headband with a small lens over crossed calibration crosshair lines, gunmetal with electric teal glow, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
```

## glyphs

Equipment-class glyphs used on level cards and the campaign map. Square 1024, black background.

```
glyph_barbell: a stylised olympic barbell with two plates per side seen from the front, thick clean gunmetal silhouette with teal edge highlight, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
glyph_dumbbell: a stylised hex dumbbell seen from the side, thick clean gunmetal silhouette with teal edge highlight, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
glyph_cable: a stylised cable pulley wheel with a short cable and a straight handle bar, thick clean gunmetal silhouette with teal edge highlight, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
glyph_machine: a stylised seated gym machine silhouette with a weight stack column and a lever arm, thick clean gunmetal silhouette with teal edge highlight, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
glyph_bodyweight: a stylised pull-up bar with two hand grips and a downward arrow, thick clean gunmetal silhouette with teal edge highlight, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
```

## ranks

Cosmetic rank insignia, six tiers. Square 1024, black background. Chevron count encodes the tier.

```
rank_1_recruit: a single small gunmetal chevron insignia pointing up with a faint teal underline, lowest rank, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
rank_2_private: two stacked gunmetal chevrons pointing up with a teal underline, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
rank_3_corporal: three stacked gunmetal chevrons pointing up with a teal underline and a small teal dot beneath, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
rank_4_sergeant: three stacked chevrons in electric teal above a single gunmetal rocker arc, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
rank_5_lieutenant: a single vertical electric teal bar insignia with bevelled gunmetal frame and a small star notch, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
rank_6_commander: a winged gunmetal insignia with a central electric teal star and laurel edges, highest rank, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
```

## badges

Level-state badges on the campaign map. Square 1024, black background.

```
badge_locked: a closed gunmetal padlock inside a dim hexagonal frame with no glow, locked level, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
badge_recon: a hexagonal frame containing a small binoculars silhouette with a faint teal outline, reconnaissance state, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
badge_provisional: a hexagonal frame half filled with electric teal containing a hollow shield outline, provisional state, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
badge_certified: a hexagonal frame fully lit in electric teal containing a solid shield with a check mark notch, certified state, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
badge_veteran: a hexagonal frame in electric teal with a laurel wreath around a solid shield and a small star, veteran state, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
```

## territory

Station markers for the gym map (Scout mechanic). Square 1024, black background.

```
flag_uncharted: a small tactical map marker pin with a hollow gunmetal flag and a dotted outline, uncharted station, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
flag_charted: a small tactical map marker pin with a solid electric teal flag and a glowing base ring, charted station, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
flag_contested: a small tactical map marker pin with a flag split half gunmetal half teal and a warning ring, station under review, flat 2D vector game emblem, strictly symmetrical and centred, tactical military shooter interface style, gunmetal grey and electric teal on a solid pure black background that fills the entire frame, no perspective, no floor, no ground plane, no shadow, no 3D, no reflections, single object, no text, no letters, no numbers, crisp clean edges, high contrast
```

## backdrops

Wide 1360×768 scene backdrops for the campaign map, briefings, boot camp, debrief and results.
Each keeps its centre clear for UI.

```
bg_campaign_map: a top-down tactical floor plan of a modern gym drawn as a holographic blueprint, machine outlines and rack outlines as thin teal lines on dark charcoal, faint grid, a few glowing marker points, the centre area kept clear, dark cinematic tactical interface backdrop, charcoal navy and gunmetal, thin electric teal grid lines and holographic edges, subtle vignette, wide composition with a large empty centre area kept clear for UI, no text, no letters, no people, no weapons, moody volumetric light, high detail
bg_briefing_ground: a dark briefing room backdrop with a heavy squat rack and loaded barbell silhouette lit by a single teal edge light on the far left, the centre and right kept as clean dark space, dark cinematic tactical interface backdrop, charcoal navy and gunmetal, thin electric teal grid lines and holographic edges, subtle vignette, wide composition with a large empty centre area kept clear for UI, no text, no letters, no people, no weapons, moody volumetric light, high detail
bg_briefing_arms: a dark briefing room backdrop with a dumbbell rack and a cable tower silhouette lit by teal edge light on the far left, the centre and right kept as clean dark space, dark cinematic tactical interface backdrop, charcoal navy and gunmetal, thin electric teal grid lines and holographic edges, subtle vignette, wide composition with a large empty centre area kept clear for UI, no text, no letters, no people, no weapons, moody volumetric light, high detail
bg_briefing_blackops: a very dark briefing room backdrop with a single seated cable machine silhouette barely lit by a dim teal glint on the far left, deep shadows, the centre and right kept as clean dark space, dark cinematic tactical interface backdrop, charcoal navy and gunmetal, thin electric teal grid lines and holographic edges, subtle vignette, wide composition with a large empty centre area kept clear for UI, no text, no letters, no people, no weapons, moody volumetric light, high detail
bg_bootcamp: a dark calibration bay backdrop with a headband on a stand under a teal scanning light beam, thin measurement rings around it on the left, the centre and right kept as clean dark space, dark cinematic tactical interface backdrop, charcoal navy and gunmetal, thin electric teal grid lines and holographic edges, subtle vignette, wide composition with a large empty centre area kept clear for UI, no text, no letters, no people, no weapons, moody volumetric light, high detail
bg_debrief: a dark after-action backdrop with a faint holographic waveform trace running along the bottom edge in teal and a dim gym floor in the background, the centre kept as clean dark space, dark cinematic tactical interface backdrop, charcoal navy and gunmetal, thin electric teal grid lines and holographic edges, subtle vignette, wide composition with a large empty centre area kept clear for UI, no text, no letters, no people, no weapons, moody volumetric light, high detail
bg_level_cleared: a dark triumphant backdrop with radiating thin teal light rays from the centre and floating small hexagonal particles, subtle neon lime highlights at the edges, the centre kept clear, dark cinematic tactical interface backdrop, charcoal navy and gunmetal, thin electric teal grid lines and holographic edges, subtle vignette, wide composition with a large empty centre area kept clear for UI, no text, no letters, no people, no weapons, moody volumetric light, high detail
bg_mission_failed: a dark backdrop with a faint red-orange warning haze at the edges, a broken holographic ring in the lower left and a dim gym floor, the centre kept clear, dark cinematic tactical interface backdrop, charcoal navy and gunmetal, thin electric teal grid lines and holographic edges, subtle vignette, wide composition with a large empty centre area kept clear for UI, no text, no letters, no people, no weapons, moody volumetric light, high detail
```
