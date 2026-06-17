# Competitive Landscape: Auto Exercise Recognition, Rep Counting & Weight ID via Connected Devices

> Research date: 2026-06-16. Sources are cited inline. This analysis covers shipping products + connected hardware that attempt to **automatically** recognize the exercise, count repetitions, and/or identify the weight lifted — i.e. systems competing with IronPal's core promise (egocentric headband camera + IMU, zero manual input).

## The market reality (the single most important finding)

Across every shipping product, the three capabilities IronPal targets are **unevenly solved**:

| Capability | State of the art |
|---|---|
| **Rep counting** | Common, but *unreliable* — wearables miss leg reps; IMU bar sensors missed ~14% of bench reps at high load. |
| **Exercise recognition** | *Rare* — almost everyone makes you pick the exercise from a list first. One product (GymAware FLEX) auto-detects after learning your pattern. |
| **Weight / load ID** | **Essentially unsolved.** No shipping product reads an arbitrary barbell/plate load. Weight is manually typed, ignored, inferred from body-mass models, or — in one appliance — read only from the vendor's own proprietary marked plates. |

The headline: **automatic free-weight reading is an open gap in the entire market.** It is exactly what IronPal's camera-based weight-reading KB is chasing — and no competitor has it.

---

## Top 5 — detailed analysis

These five span the whole landscape (elite bar sensor → mass-market wearable → passive wearable → camera CV → the one appliance that reads weight), and each teaches IronPal something different.

### 1. GymAware FLEX + GymAware app — *the technical benchmark*
- **Device:** Magnetic clip on the barbell sleeve + reflective floor mat. Uniquely **optical (laser array)**, not IMU — effectively a wireless linear position transducer. ~$495.
- **Recognition:** The standout. **"Exercise Assist" auto-detects the exercise** once it has learned your per-athlete movement pattern — the only mainstream product that does open-ended recognition rather than menu-picking.
- **Reps:** Auto-counts reps and sets reliably (velocity error ~0.03–0.04 m/s; GymAware RS is the lab reference device others are validated against).
- **Weight:** **Manual.** You enter load to build a load–velocity profile. The hardware measures motion, not mass.
- **UX / who it's for:** Elite S&C coaches and athletes. Accurate and trusted, but expensive, bar-only, and built for the platform/rack — not a casual gym-goer's whole session.
- **Lesson for IronPal:** Proves auto exercise-recognition *from a learned movement signature* is viable — precisely IronPal's enrollment-fingerprint approach (IMU + video per exercise). And even this best-in-class system still can't read weight.
- Sources: gymaware.com/product/flex-barbell-tracker/ ; gymaware.zendesk.com/hc/en-us/articles/6947870249743-FLEX-Exercise-Assist ; pmc.ncbi.nlm.nih.gov/articles/PMC12416690/

### 2. Enode (formerly Vmaxpro) — *leading IMU bar sensor*
- **Device:** IMU (accel+gyro) clipped to the barbell. ~€359 bundle; free tier + €39–€160/mo Pro.
- **Recognition:** Manual — user selects the lift; the app then builds velocity profiles per exercise.
- **Reps:** Auto-counts, and among the most accurate IMU devices for mean velocity (CV ~2.7%) — **but missed ~14% of bench reps and ~5% of squat reps during 1RM testing.** Accuracy degrades at heavy load / low velocity.
- **Weight:** Manual.
- **Lesson for IronPal:** Even a dedicated, bar-mounted IMU loses reps at the exact moment that matters most (grindy heavy reps). A head-mounted IMU will see an *even noisier* signal — which is why IronPal's **sensor-fusion (IMU + video)** approach is the right hedge, not IMU alone.
- Sources: enode.ai/ ; enode.ai/pages/pricing ; pmc.ncbi.nlm.nih.gov/articles/PMC10765425/

### 3. Garmin Connect (+ Garmin watches) — *mass-market auto rep counting*
- **Device:** Wrist IMU, already on millions of wrists. No subscription. ~$200–$1,000+.
- **Recognition:** Attempts auto-identification of the move, frequently wrong.
- **Reps:** Auto-counts by detecting the arm returning to start — **but only shows a count after ≥4 reps, often fails to count leg exercises, handles one move per set, and is widely reported to miscount.** TechRadar: strength mode "consistently failed to record the right number of reps."
- **Weight:** **Manual** entry per set.
- **Lesson for IronPal:** This is the bar to clear on *consumer trust*. The largest install base does rep-counting badly, which has trained users to distrust automatic counting. If IronPal counts reliably, that is a concrete, demonstrable wedge.
- Sources: www8.garmin.com/manuals/webhelp (rep count + manual weight) ; techradar.com/features/why-garmins-strength-training-mode-needs-to-be-improved-or-scrapped

### 4. WHOOP — *the passive-wearable trajectory (and a cautionary tale)*
- **Device:** Wrist accel+gyro, screenless, subscription ($199–$359/yr incl. hardware). Notably, **WHOOP acquired and shut down PUSH** (2021), the best-known VBT band — a signal about hardware-band economics.
- **Recognition / Reps:** The 2023 Strength Trainer required **full manual logging** (move, weight, reps, sets). The 2026 "Passive MSK" update estimates musculoskeletal **load with no logging** — but it derives that from wrist motion + **your body-mass profile + a biomechanical model.** It does **not read the weight** and does **not auto-count reps.**
- **Lesson for IronPal:** The market is moving toward *passive, no-logging* tracking — validating IronPal's "don't make the user type anything" thesis. But WHOOP fakes load from a body-mass model because it *can't see the weight.* IronPal's camera can — the differentiator to lean on.
- Sources: whoop.com/us/en/thelocker/2026-whats-new/ ; whoop.com/us/en/press-center/acquires-push-velocity-based-training-solution/

### 5. Tempo — *the only product that auto-reads weight (and why it doesn't count as solving it)*
- **Device:** Appliance with a **3D Time-of-Flight depth sensor** (Studio) or phone camera (Move).
- **Reps:** Auto-counts inside Tempo classes; gives form cues.
- **Weight:** **Auto-detects load via computer vision — uniquely.** BUT only for **Tempo's own proprietary marked plates/dumbbells**, only inside Tempo classes, and not for barbells, kettlebells, non-Tempo plates, or anything over ~10 lb.
- **Lesson for IronPal:** Proves camera-based weight reading is *possible* and valuable — but the only company doing it controlled the equipment (marked, known plates). **IronPal's harder, more valuable bet is reading arbitrary gym weights with no equipment integration** — the "no QR codes, no calibration, off-the-shelf" constraint already baked into the challenges docs.
- Sources: support.tempo.fit/support/solutions/articles/151000154718-weight-recognition-faqs ; support.tempo.fit/support/solutions/articles/151000154714-3d-tempo-vision-form-feedback

**Honorable mentions:** Output Sports & RepOne (B2B bar/wrist IMU, manual weight); Zing Coach & Kemtai (phone-camera pose estimation — guided, count reps, **no weight**); Peloton Guide (camera reps, manual weight); Kabata (AI dumbbells that *set* their own resistance, 5–60 lb — machine-set, not read). Defunct: **PUSH, Atlas Wristband, Onyx** — all acquired and wound down, a reminder this category is a hardware graveyard.

---

## Gaps & opportunities for IronPal

1. **Weight reading is wide open.** No one reads arbitrary free weights. Tempo only reads its own marked plates; everyone else types it or fakes it from body mass. IronPal's strongest, most defensible differentiator — and the hardest to build.
2. **Exercise recognition is barely contested.** Only GymAware FLEX auto-detects, and only for barbell lifts after per-user learning. IronPal's IMU+video fingerprint-per-exercise enrollment directly attacks this, across free weights *and* machines.
3. **Rep counting is a trust problem, not a novelty.** Competitors do it but badly (Garmin) or with heavy-load dropouts (Enode). Reliability — especially via **sensor fusion** rather than IMU-only — is the win, matching the lesson from clip-003 work.
4. **The whole field still demands manual setup.** Pick the exercise, enter the weight, stay inside our class library. IronPal's "passive, zero-input, works on any equipment" framing is genuinely white space — WHOOP's passive pivot shows the market wants it but can't deliver it from the wrist.
5. **First-person camera is uncontested.** Every camera competitor is third-person (phone on a stand, TV camera, depth appliance). IronPal's egocentric headband view is a category nobody occupies — both the opportunity and the hard research problem the video-analysis KB is solving.
6. **Hardware-band economics are brutal** (PUSH/Atlas/Onyx all died). Reinforces the instinct to start phone-on-headband for the POC and keep the dedicated camera lean for MVP.

**Bottom line:** The market has fragmented the three capabilities across separate products and solved none of them together for free weights. IronPal's bet — *one egocentric device that recognizes the exercise, counts reps via sensor fusion, and reads arbitrary weight from video, with zero manual input* — has no direct competitor. The closest, GymAware FLEX, nails recognition but is bar-only, expensive, and still can't read load.

---

## Premise corrections (from research)
- **"RepOne" and "Enode" are unrelated companies** — RepOne (NYC, LPT tether) is not a rename of Enode/Vmaxpro (Germany, IMU).
- **"Flex by Kabata" is not a real product** — it conflated GymAware **FLEX** (laser barbell tracker) with **Kabata** (AI adjustable dumbbells). Two distinct companies.

## Honest gaps in this research
- Explicit "user enters the weight" wording for PUSH, Enode, RepOne, Output, FLEX, GymAware RS is inferred from hardware physics + force-velocity-profile features, not always directly quoted.
- Quote-walled prices: Output Sports, RepOne StrengthOS, Kemtai, Exer provider tier; exact per-model Garmin MSRPs.
- Underlying pose model (MediaPipe/BlazePose vs custom) and exact keypoint counts for Onyx and Zing not confirmed.
- No vendor publishes quantitative camera-app accuracy/error margins.
