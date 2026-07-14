# IronPal Tier-1 Capture Module — Hardware Spec

**Status:** draft v0.1 · **Owner:** founder (solo) · **Feeds:** `docs/video-analysis-kb/` analysis pipeline + `scripts/kb/score_weights.py` harness.
**Why these choices (rejected options, market survey, selected part):** `ironpal-capture-hardware-decision-log.md`.

## 0. What this is (and isn't)

The **Tier-1 capture module** is the wearable that records a workout from the athlete's viewpoint
and hands frames to the IronPal analysis pipeline (exercise / reps / **weight**). It is **not** a
finished consumer product and **not** a custom 360 stitching camera — it is the smallest buildable
rig that delivers **angle-independent, whole-forward-scene capture** on a **headband**, using
**one** ultra-wide lens.

Locked requirements (decided, not re-opened here):
- **R1 — Angle-independent.** A few degrees of head tilt must NOT reframe the scene out of view.
  (Founder bench test killed the fixed narrow-FOV headband.)
- **R2 — Headband-wearable.** No 80–114 mm off-the-shelf 360 tower. One lens, forehead-mountable.
- **R3 — Reads the weight.** The forward region-of-interest (hands / plates / pin) must retain
  enough pixels after reframe to OCR a denomination or count a pin stack — or cleanly abstain.
- **R4 — Feeds the existing pipeline.** Output is standard video frames the KB skill + harness consume.
- **R5 — Path to <$100 module BOM at volume.**

## 1. Design decision (recap, 1 paragraph)

True dual-lens 360 is rejected for Tier-1: nothing off-the-shelf fits a headband, and a custom
dual-lens stitcher spends half its resolution on the back of the skull (never where the weight is).
A **single ~200° fisheye** captures the entire forward dome — front, down, sides, up — so the weight
is *always* in-frame regardless of head angle (satisfies R1) with **one** lens stack (satisfies R2).
The cost is the R3 tension below, which is the whole validation gate.

## 2. THE central tension — read this before buying anything

Wide FOV and weight-OCR pull in opposite directions:

- A 200° fisheye spreads the sensor's pixels over 200°. The forward ~50° region where the weight
  sits gets only a **fraction** of the sensor's pixels.
- Rough angular resolution, IMX415 4K (≈2192 px across the fisheye image circle on the short axis):
  `200° / 2192 px ≈ 0.091 °/px`. A plate denomination ~3 cm tall at arm's length (~0.6 m) subtends
  `≈2.9°` → **≈32 px tall**. That is **marginal** for embossed cast-iron OCR and **borderline-OK**
  for a big painted pin-stack label.
- Contrast: the same weight through a narrow 50° lens at 4K gets ~10× the pixels — but fails R1.

**Implication:** the fisheye choice trades exactly the pixels the hardest task (weight) needs.
This is not a reason to abandon it — it's the reason the **abstain-first harness exists**. The gate:
build the prototype (§6.1), shoot real lifts, run `score_weights.py`, and measure **committed-read
coverage** on weights. Decide sensor resolution from that number, not from a spec sheet.

Mitigation levers, in order of preference:
1. **Bigger/higher-res sensor** (§3) — more pixels in the ROI without narrowing FOV.
2. **Software ROI super-res / multi-frame stacking** on the reframed crop before OCR.
3. **Accept higher abstention** on cast iron; lean on 1-tap confirm + per-user cache (already in the pipeline).

## 3. Bill of Materials (candidates)

### 3.1 Image sensor (pick by the §2 gate)
| Sensor | Size | Res | Why | Note |
|--------|------|-----|-----|------|
| **Sony IMX415** | 1/2.8" | 8 MP / 4K30 | cheap, proven UVC modules exist (the MCY-6080) | baseline; weakest low-light |
| **Sony IMX678** | 1/1.8" | 8 MP / 4K30 | bigger pixels → better dim-gym low light + fisheye edge falloff | **recommended upgrade** |
| **Sony IMX585** | 1/1.2" | 8 MP / 4K30 | best low light, high dynamic range | costlier, larger |
| (stretch) true-8K single sensor (~33 MP) | 1/1.x" | 8K | 2× ROI pixels for weight OCR | heat + cost + bandwidth; only if §2 gate fails at 4K |

All are 8 MP/4K "4K" class except the stretch option; **4K is the starting point, 8K single-sensor is
the escalation if the harness says the ROI is too soft.**

### 3.2 Lens
- **~200° M12 fisheye**, image circle matched to the chosen sensor (circular-fisheye on the short axis,
  or full-frame fisheye to use more pixels — full-frame preferred to maximise ROI pixels).
- Low f-number (f/2.0 or faster) to feed the dim-gym + edge-falloff budget.
- Height is the wearability constraint: M12 fisheye barrel ≈ 12–16 mm ø × ~15–22 mm tall.
  **Recess into the headband foam** (§5) so <10 mm protrudes.

### 3.3 Interface / compute — two builds
- **1a Prototype:** **UVC over USB** (like the MCY-6080). Appears as a webcam on an Android phone or
  laptop. Zero firmware. This is what you buy first.
- **1b Integrated wearable:** small SoC/ISP (Rockchip RV1106 / Ingenic T-series class) doing
  H.265 encode + Wi-Fi to the paired phone, OR a UVC-to-Wi-Fi bridge. Chosen only after 1a proves R3.

### 3.4 Support
- Power: 1× Li-Po ~500–800 mAh for a 60–90 min session (validate against encode load).
- Storage: microSD (buffer) or stream-only to phone.
- Enclosure + headband: moisture-wicking band, lens recess, ~25° down-tilt mount (§5).

## 4. Optics & coverage

- **Forward dome coverage:** 200° captures everything from straight-up to below the waistline and
  ear-to-ear. A dumbbell at your side, a pin stack you're seated at, a barbell on the floor — all
  fall inside the dome at any realistic head angle → **R1 satisfied**.
- **Dewarp / reframe:** raw fisheye is barrel-distorted; the pipeline dewarps and reframes a virtual
  "pan/tilt" window onto the ROI (the hands/weight) — the same reframe idea as a 360 cam, done in
  software on one lens. The reframed rectilinear crop is what the KB skill reads.
- **ROI auto-locate:** motion + hand detection picks the reframe target (ties to
  `autonomous-frame-selection.md` / `motion_profile.sh`), so no human points at a timestamp.

## 5. Mechanical / mount

- **Position:** forehead, lens above the eyebrow line → obscures neither the wearer's vision nor its
  own FOV (unlike a cap brim, which clips the downward sightline — rejected).
- **Down-tilt:** fixed **~20–30°** so the dome centres on chest-to-waist working height. (With 200°
  the exact angle is far less critical than it was for the narrow lens — that's the point.)
- **Lens recess:** sink the barrel into the band depth; target **<10 mm** external protrusion.
- **Board:** custom PCB ~**18–20 mm square** (the 61 mm on the dev module is throwaway dev-board
  outline + mounting ears, not the sensor footprint).

## 6. Build plan (gated)

### 6.1 Prototype 1a — VALIDATE R3 (do this first, ~1–2 weeks, ~$40–80)
- [ ] Buy a **UVC 4K fisheye module** (IMX415 or IMX678 + ~200° lens).
- [ ] Clamp on a headband rig at ~25° down-tilt (size/ugliness irrelevant on the bench).
- [ ] Record real lifts: dumbbell (cast + painted), pin stack, barbell.
- [ ] Dewarp + reframe the ROI; extract frames per the KB recipe.
- [ ] Run `/weight-lifted-analysis` → write `predictions.json` → `python3 scripts/kb/score_weights.py`.
- [ ] **Gate:** measure committed-read coverage & confident-wrong (must stay 0). If weights read →
      proceed to 1b at 4K. If ROI too soft → escalate sensor (§3.1) or accept higher abstain.

### 6.2 Integrated wearable 1b — only after 1a passes
- [ ] Select SoC/bridge (§3.3), custom ~18 mm board, Li-Po, Wi-Fi to phone.
- [ ] Enclosure + recessed lens + headband, <10 mm protrusion.
- [ ] Field test full sessions; re-run the harness on real device footage.

## 7. Cost — detailed, per single unit

Three cost points matter: **(1a)** what you spend to validate this week, **(1b qty-1)** what ONE
hand-built integrated wearable actually costs, and **(1b @1k)** the per-unit BOM at volume that R5
is judged against. All figures 2026 USD, mid-range; qty-1 carries a sourcing premium (bare Sony
sensors aren't sold singly — you buy a module or a small-tray minimum).

### 7.1 Prototype 1a — buy, don't build (validate R3 first)
| Item | Qty-1 |
|------|-------|
| UVC 4K fisheye USB module (IMX415/IMX678 + ~200° lens, e.g. MCY-6080 class) | $35–65 |
| Headband + printed clamp for the module | $8–15 |
| USB OTG cable to Android phone | $3–6 |
| **1a total (no assembly, works today)** | **≈ $46–86** |

### 7.2 Integrated wearable 1b — ONE hand-built unit (itemised BOM)
| # | Component | Spec | Qty-1 unit cost |
|---|-----------|------|-----------------|
| 1 | Image sensor | IMX415 (base) / IMX678 (rec.) — as module or tray min | $18–40 |
| 2 | Fisheye lens | ~200° M12, f/2.0, full-frame image circle | $8–20 |
| 3 | Lens holder / M12 mount | machined or moulded | $2–5 |
| 4 | SoC / ISP + encoder | Rockchip RV1106-class (H.265 + Wi-Fi) module | $15–35 |
| 5 | Wi-Fi antenna (+ u.FL) | 2.4/5 GHz chip or flex antenna | $1–3 |
| 6 | Li-Po battery | 500–800 mAh, 60–90 min session | $4–9 |
| 7 | PMIC / charger | TP4056-class + regulators | $2–5 |
| 8 | USB-C connector | charge + data/offload | $1–2 |
| 9 | microSD (buffer, optional) | 32 GB | $5–8 |
| 10 | Custom PCB | ~18–20 mm sq, per-unit on a 5-pc JLCPCB order | $5–15 |
| 11 | PCB assembly | qty-1 (JLC turnkey small-run or hand-solder) | $15–45 |
| 12 | Enclosure | 3D-printed (SLA) shell + lens recess | $4–12 |
| 13 | Headband | moisture-wicking fabric band | $5–12 |
| 14 | Passives / connectors / misc | R, C, FPC, screws | $3–8 |
| | **1b qty-1 total (one hand-built unit)** | | **≈ $88–221** |
| | *realistic single-unit working estimate* | | **≈ $130–160** |

> Qty-1 is dominated by **assembly (#11)** and **small-run PCB (#10)** — both collapse at volume.
> The sensor is NOT the expensive part.

### 7.3 Per-unit BOM at volume (~1k units) — the R5 number
| Group | @1k per unit |
|-------|--------------|
| Sensor (IMX415/678) | $8–18 |
| Fisheye lens + holder | $5–12 |
| SoC/ISP + Wi-Fi + antenna | $8–20 |
| Li-Po + PMIC + USB-C | $5–8 |
| PCB + assembly (panelised, reflow) | $4–8 |
| Enclosure + headband | $8–15 |
| Passives/misc | $2–4 |
| **1b BOM @1k** | **≈ $40–85 → R5 (<$100) achievable** |

### 7.4 Escalations (only if the §2 gate demands)
- **8K single sensor** (~33 MP) instead of 4K: **+$30–60/unit**, plus more heat/bandwidth/encode cost.
- microSD populated on every unit vs stream-only: +$5–8/unit.

**Read:** validate for **~$46–86** (1a) before spending. The first integrated unit is **~$130–160**
hand-built; at 1k the wearable lands **~$40–85 BOM**, so <$100 is real — the cost driver is
assembly + wireless integration, never the sensor.

## 8. Risks & open questions

| Risk | Severity | Mitigation |
|------|----------|------------|
| Fisheye ROI too soft to read cast-iron weights | **high** (core R3) | §2 levers; the §6.1 gate decides before custom spend |
| Dim-gym + fisheye edge falloff → noisy ROI | med | IMX678/585 bigger pixels; f/2.0 lens |
| Dewarp adds latency / artefacts in ROI | med | offline post-hoc first (KB is offline); optimise later |
| Heat on continuous 4K H.265 encode (1b) | med | duty-cycle; validate battery/thermals in 1b |
| Solo-founder time sunk in hardware vs the software moat | **high** | 1a is cheap/fast; **do not build 1b until the analysis is proven** |

## 9. The one thing not to forget

The camera is **not** the moat — the analysis is. This spec exists to get *real IronPal-viewpoint 4K
fisheye footage* into the weight-reading harness as fast and cheap as possible (§6.1), so the
**software** question — can we read the weight angle-independently? — gets answered on ~$60 of
hardware before any custom board is designed. Build 1a, run the harness, let the coverage number
drive everything after.
