# IronPal Capture Hardware — Decision Log

**Purpose.** Record how the wearable-camera decision was reached, what was rejected and *why*, so
the choices aren't relitigated. Companion to the forward build plan in
`ironpal-tier1-capture-module-spec.md`. Dated 2026-07-14.

---

## 1. Locked decisions (the outcome)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Egocentric wearable, mounted on a HEADBAND** | Matches the product; captures what the athlete sees. |
| D2 | **NOT a baseball cap** | A brim extends *into* the downward sightline → clips the bottom of the frame exactly where plates/pin sit. A forehead headband sits above the eyes and obscures nothing. |
| D3 | **Angle-independent, whole-forward-dome capture is mandatory** | Founder bench test: a few degrees of head tilt reframed a narrow-FOV lens out of the scene. Fixed narrow FOV is unusable. |
| D4 | **Implement D3 with a SINGLE ultra-wide FISHEYE (≥180°, ~200° ideal), not a true dual-lens 360** | A 200° fisheye captures the entire forward dome (front/down/sides/up) with ONE lens → headband-wearable. True dual-lens 360 is an 80–114 mm tower off-the-shelf, or a custom stitcher that wastes half its resolution on the back of the skull. |
| D5 | **Sensor: Sony IMX415 4K (8MP/30fps), UVC USB** | Cheap, proven, plug-and-play to an Android phone. "Starlight"/STARVIS variant preferred for dim gyms. |
| D6 | **Fixed-focus, not autofocus** | AF hunts/breathes and loses the plate at the instant sharpness is needed; a fixed fisheye has deep DoF, sharp edge-to-edge. |
| D7 | **Validate the SOFTWARE before building any custom hardware** | The open question — can a 4K fisheye actually read the weight after reframe? — is answered with a ~$97 off-the-shelf module + `score_weights.py`, not a PCB project. |

---

## 2. Requirement evolution (how we got here)

1. Started at "off-the-shelf 360 camera for a headband."
2. **No tiny/cheap/8K 360 exists** (§3) → looked at single-lens.
3. Founder tested a narrow-FOV headband → **head-angle sensitivity killed it** (D3).
4. Concluded true 360 is wanted, but off-the-shelf 360 won't fit a headband → **custom build implied**.
5. Resolved the tension: **single ultra-wide fisheye = angle-independence at headband size** (D4).
6. Sourced an IMX415 fisheye UVC module; first candidate was only 140° (rejected) → found ELP ≥180° (§5).

---

## 3. Market reality (surveyed 2026-07-14)

### 3.1 A tiny (A9-size) 8K 360 camera does not exist — and can't
- True 360 needs **two opposing lenses + two sizeable sensors** back-to-back + a stitching/encoding SoC
  + battery. DJI's 8K comes from two 1/1.1" sensors — each ~the size of an entire A9 puck. You cannot
  fold that into a 30 mm cube. **Every true 8K-360 body is 80–114 mm tall** (DJI Osmo 360 81 mm,
  Insta360 X5 114 mm, GoPro Max 2 ~100 mm).
- **Under $100 alone rules out all 8K 360:** cheapest *any-res* true 360 is GoPro Max ~$350 (5.6K);
  8K 360 starts ~$500 (DJI Osmo 360, Insta360 X5).
- ⚠️ **Scam warning:** "8K 360 Mini WiFi Camera, $18–90" listings (A9 "2020 Mini Camera" style) are
  **fakes** — a single 1080p (often 720p) lens with photoshopped "8K/360" badges. Do not buy.

### 3.2 Off-the-shelf full-size 360 (for reference / chest-mount only)
| Camera | 360 res | Height | Batt (cont.) | Price |
|--------|---------|--------|--------------|-------|
| DJI Osmo 360 | 8K30 | **81 mm** | ~100 min | ~$549 |
| Insta360 X5 | 8K30 | 114 mm | ~88 min | ~$550 |
| GoPro Max 2 | 8K30 | ~100 mm | n/a | $500 |
| Kandao QooCam 3 Ultra | 8K30 | (heavy, 336 g) | ~50 min | ~$599 |
| Ricoh Theta X | 5.7K30 | tall slab | ~30 min | ~$800+ |

All too tall for a headband → **chest/shoulder mount only.** Rejected for the headband product (D4).

### 3.3 The weight-OCR resolution tension (the reason the software gate exists)
Wide FOV spreads pixels over the whole angle, so the forward ROI (where the weight is) gets few pixels:
- 8K 360 reframed to a ~50° forward crop ≈ **1067 px**; 5.6–5.7K ≈ **800 px**.
- A **single 4K fisheye at 200°** ≈ 0.09°/px → a 3 cm plate number at arm's length ≈ **~32 px tall**
  — *marginal* for embossed cast iron, *borderline-OK* for a big painted pin-stack label.
- A narrow single-lens 4K would give ~10× the ROI pixels **but fails D3**.
- **This is the whole point of the abstain-first harness:** the fisheye choice trades exactly the
  pixels the hardest task needs, so weight-reading must be *measured*, not assumed. See §6.

---

## 4. Rejected options (and why)

| Option | Verdict | Why |
|--------|---------|-----|
| A9-style mini "8K 360" spy cam | ❌ scam | single-lens 1080p; "8K/360" is fake marketing |
| Any off-the-shelf true 360 on a headband | ❌ | 80–114 mm tower; won't wear |
| Baseball cap mount | ❌ | brim clips the downward sightline (D2) |
| Fixed narrow-FOV single lens | ❌ | head-angle sensitivity (D3) |
| Alibaba "IMX415 4K Autofocus Fisheye" (HD/Haozhou) | ❌ | FOV only **95°–140°** (not a true fisheye) → fails D3; also autofocus (D6). *Right sensor + UVC + Starlight, wrong lens.* |
| True custom dual-lens 360 wearable | ⏸ deferred | buildable but thick/complex/costly and wastes rear-hemisphere resolution; only if a fisheye proves insufficient |
| 8K single sensor (~33 MP) | ⏸ escalation | +$30–60 BOM, more heat/bandwidth; only if the §6 gate fails at 4K |

---

## 5. Selected part (validation module, "1a") — ORDERED VIA AMAZON

**ELP 4K HDMI USB Camera — Sony IMX415, `200degree fisheye lens` variant**
- **Amazon ASIN `B0CTGTMMKM`** — `https://www.amazon.com/ELP-4K-HDMI-USB-Simultaneously/dp/B0CTGTMMKM`
- **MUST select the `200degree fisheye lens` Style** (€96.66). The default "120degree no distortion"
  and "110degree" variants FAIL the ≥180° bar — same board, different lens.
- **200° fisheye** — exceeds the ≥180° requirement (full forward dome). ✅ D3/D4.
- **Sony IMX415** 1/2.8" CMOS, 4K 3840×2160@30fps, 0.2 lux. ✅ D5.
- **UVC plug-and-play** — listing explicitly states Android device / Raspberry Pi, no drivers. ✅
- Fixed-focus fisheye (deep DoF). ✅ D6.
- **In stock, ships from Amazon, delivers to Slovakia**, FREE international returns. ~€96.66 +
  ~€13.44 shipping ≈ **€110 delivered**. Sold by ELP USB CAMERA.
- Sanity check before paying: after selecting the 200° style, confirm title/spec still says
  **IMX415** and **200°** (sensor is common across all three lens variants — only the lens changes).

**Why this over the alternatives:** better than the ELP L185/SL185 (200° vs ~185°) AND a normal
Amazon checkout with EU returns — no maintenance-mode inquiry form, no email/PayPal dance.

### Rejected sourcing routes (for the record)
- **ELP L185 / SL185** (`webcamerausb.com` p-475 / `elpcctv.com` p-395/p-598): correct part
  (IMX415, ~180–194°, fixed-focus, ~$96.80) but ELP's site is in **maintenance mode → inquiry/email
  order only** (`sales@elpcctv.com`). Viable backup if the Amazon variant goes out of stock.
- **odkarla.sk** (Slovak retailer, easy local checkout): searched — stocks **NO** IMX415 and nothing
  ≥180°. Entire ELP/Svpro stock is IMX317/IMX577, 80–100° (or a 170° Svpro fisheye at best). The
  USB4KHDR01-V100 there is IMX317/100° — the wrong model. Dead end.
- **Alibaba HD/Haozhou "IMX415 fisheye"**: FOV only 95–140° (not a fisheye) + autofocus → rejected.

**Market note:** a ≥180° fisheye **on IMX415 over USB** is a genuine niche — **ELP is essentially the
only off-the-shelf vendor.** Arducam's IMX415 fisheye is MIPI (not USB); Waveshare is 95–98°; e-con's
IMX415 USB is a standard lens; generic Amazon/SVPRO IMX415 boards are 100–110°. The Amazon ELP 200°
fisheye variant is the single best off-the-shelf match found.

---

## 6. The open question + validation gate (do this next)

**Unanswered, and the only thing worth money right now:** *can the analysis pipeline read the working
weight from a 4K fisheye after reframe — or does it abstain too often?*

Gate (≈$97 + an afternoon, from `ironpal-tier1-capture-module-spec.md` §6.1):
1. Order the ELP L185. **Ignore its size** (see §7).
2. Clamp on a crude headband at ~25° down-tilt; plug USB into an Android phone.
3. Shoot real lifts: cast dumbbell, painted pin stack, barbell.
4. Dewarp/reframe the ROI → extract frames → `/weight-lifted-analysis` → write `predictions.json` →
   `python3 scripts/kb/score_weights.py`.
5. **Decide from the coverage number:** reads weights → proceed to custom board (1b). Too soft →
   escalate sensor (8K) or accept higher abstain + 1-tap confirm. **Confident-wrong must stay 0.**

---

## 7. Recurring lesson: dev-board dimensions ≠ product dimensions

Stalled on module size three times (61 mm generic board, 38 × 38 × 52 mm ELP board) — each time it was
the **dev-board outline**, not the product:
- The **board** (38 × 38 mm here) is a generic module with mounting ears + an HDMI connector you don't
  need → **respins to ~18–20 mm** in a custom build.
- The **fisheye lens barrel does NOT shrink** — a 180–200° lens needs a large front element to gather
  the cone. **That bulk is the physics price of the angle-independence demanded in D3/D4.** There is no
  tiny 4K 180° lens. The wearable = small hidden board + fisheye lens **recessed into the headband foam**.
- **The validation module is not the wearable.** Its size is irrelevant to its only job (answer §6).
  Judging bench hardware by its millimeters optimizes the one thing that doesn't matter yet. Prove the
  software first; industrial design (shrink board, recess lens) is a later, solvable problem — and only
  worth solving if §6 passes.

---

## 8. Cross-references
- Build plan + BOM + per-unit costs: `ironpal-tier1-capture-module-spec.md`
- Weight-reading method + abstain-first gate: `.claude/skills/weight-lifted-analysis/SKILL.md`,
  `docs/video-analysis-kb/weight-reading.md`
- Accuracy harness: `docs/video-analysis-kb/ground-truth.md`, `scripts/kb/score_weights.py`
