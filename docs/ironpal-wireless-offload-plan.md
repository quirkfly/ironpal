# IronPal — Wireless Data Path for the Production Camera (no USB)

**Status:** Draft v1 · 2026-08-04
**Question:** the production camera must not use USB. How do you move ~1 GB in a few minutes over
Wi-Fi or BLE?
**Related:** `ironpal-poc-to-production-transfer.md` (§6 production requirements) ·
`ironpal-imu-camera-sync-plan.md` (BLE IMU link) ·
`ironpal-supervised-learning-phase-plan.md` (§2.1 IMU gating)

---

## 1. The rate budget

"1 GB in a few minutes" is a throughput requirement. Making it explicit:

| Target | Sustained rate needed |
|---|---|
| 1 GB in 2 min | 66.7 Mbps |
| 1 GB in 3 min | **44.4 Mbps** |
| 1 GB in 5 min | **26.7 Mbps** |
| 1 GB in 10 min | 13.3 Mbps |

Against what radios actually deliver (1×1 antenna, realistic application throughput — not PHY
headline numbers):

| Link | Real throughput | 1 GB takes | Verdict |
|---|---|---|---|
| **BLE 5 (2M PHY)** | ~1.4 Mbps | **95 min** | ❌ off by 20–30× |
| 802.11n, 2.4 GHz | ~25 Mbps | 5.3 min | ⚠️ marginal, and 2.4 GHz is congested in a gym |
| 802.11n, 5 GHz | ~70 Mbps | 1.9 min | ✅ meets it |
| **802.11ac, 5 GHz** | ~200 Mbps | **~40 s** | ✅✅ comfortable |
| 802.11ax, 5 GHz | ~300 Mbps | ~27 s | ✅✅ |
| *(reference)* µSD UHS-I + reader | ~90 MB/s | ~11 s | sneakernet still wins on bulk |

### BLE is not a candidate, and that is fine

BLE cannot carry bulk media — it is ~20–30× too slow. **This is not a disappointment, it is a role
split.** BLE is the right transport for the things it is already doing:

- IMU telemetry — 1.2 kB/s (**0.01 Mbps**), utterly trivial for BLE
- Control: pair, wake, start/stop, battery, "begin transfer"

**Use BLE for control + telemetry, Wi-Fi for bulk media.** This is exactly the GoPro/Insta360
architecture, for exactly this reason. Do not try to make one radio do both.

---

## 2. Check the target before engineering to it

**1 GB is not a session.** At the ELP's measured 62.2 Mbps, 1 GB is **2.1 minutes of footage**. A
full hour is **28 GB**.

So if "1 GB in a few minutes" really means "a session in a few minutes," the requirement is 28×
harder — ~750 Mbps sustained — which is 2×2 Wi-Fi 6 territory and **not achievable inside a
headband power and thermal budget.** Engineering toward that number directly is a dead end.

The way out is not a faster radio. It is **sending less**.

---

## 3. Three levers, applied in order

Each multiplies with the others. Payload for a 1-hour session:

| Stage | Payload | How |
|---|---|---|
| Raw, as captured today | **28.0 GB** | ELP H.264 @ 62 Mbps |
| + on-device HEVC encode (~20 Mbps 4K) | **9.0 GB** | hardware encoder in the camera SoC |
| + IMU gating (keep ~30 %) | **2.7 GB** | only record set + staging windows (plan §2.1) |
| + **edge-first selection** (product mode) | **~20–50 MB** | see §4 |

At 2.7 GB and 802.11ac, a whole gated session transfers in **~110 seconds**. That meets "a few
minutes" for the *entire session*, not just 1 GB — and it gets there through architecture, not a
bigger antenna.

> **The transport requirement is a consequence of the architecture, not a fixed constraint.**
> Fix the architecture and the radio problem mostly evaporates.

---

## 4. Edge-first: the product should not move video at all

This is the important one, and it distinguishes two regimes people conflate:

**Data-collection regime (now).** You need full video, because it is training data and you cannot
re-derive what you did not keep. Payload is large by necessity.

**Product regime (shipping).** The user does not need the video — they need *exercise, reps,
weight*. Look at what actually has to leave the camera:

| Signal | Source | Payload |
|---|---|---|
| Reps + set segmentation | IMU, on-device | ~4 MB/h over **BLE** |
| Exercise ID (head-moving, 13 classes) | on-device IMU model (Track B) | inference only — **0 bytes** |
| Exercise ID (head-still classes) | a few frames per set | ~1–3 MB/session |
| **Weight** | **stills at staging glances only** | ~20–50 JPEGs ≈ 5–20 MB/session |

**Total ≈ 20–50 MB per session, not 1 GB.** At that size even 2.4 GHz 802.11n moves a session in
under 20 seconds — and an ESP32-class radio suffices.

The camera's job becomes *choosing what is worth sending*: the IMU gate marks the set, the staging
detector picks the frame where the plate is face-on and still (the exact moment the KB already
identifies as the only readable one — cases 001/007), and only those frames go up. Full video is
buffered to µSD and normally discarded.

---

## 5. Recommended architecture

```
                    ┌──────────────── camera (headband) ────────────────┐
                    │  IMU ──► gating + rep clock ──► on-device model    │
                    │  sensor ──► HEVC encode ──► µSD ring buffer        │
                    │                    │                               │
                    │            staging-frame selector                  │
                    └──────┬──────────────────────────┬─────────────────┘
                           │ BLE (always on)          │ Wi-Fi (on demand)
                           │ control + IMU + results  │ selected frames,
                           ▼ ~0.01 Mbps               ▼ or bulk on request
                        ┌────────────── phone ──────────────┐
```

**Design rules:**

1. **BLE always on** — control, IMU stream, live results. Cheap, low power, works in a pocket.
2. **Wi-Fi off by default, burst on demand.** Wi-Fi TX is the dominant power draw (~0.5–0.9 W on an
   ESP32-class radio); keeping it up for a whole session wrecks the battery and adds heat to a
   device on someone's forehead. Wake it, burst, sleep it.
3. **µSD as the buffer, not the transport.** Record locally; transfer selectively. This is what
   makes lever 2 and 3 possible and gives crash resilience for free.
4. **SoftAP, not gym Wi-Fi.** The camera hosts the AP and the phone joins for the burst. Gym
   networks are congested, captive-portalled and a security liability; requiring one would make the
   product fail in exactly the environment it is sold for.
5. **5 GHz for bulk.** 2.4 GHz in a commercial gym is saturated by phones, wearables and
   equipment consoles. 5 GHz has shorter range, which is *fine* — the phone is ~1 m away.
6. **Full-session bulk transfer stays an explicit user action** ("upload today's session"), done on
   the charger, not something attempted mid-workout.

---

## 6. What this implies for hardware selection

| If the architecture is… | Radio needed | Plausible parts |
|---|---|---|
| **Edge-first** (§4, ~20–50 MB) | 2.4 GHz 802.11n is enough | ESP32-S3 + camera sensor; cheap, huge ecosystem |
| Gated full video (~2.7 GB/session) | **5 GHz 802.11ac** | camera SoC with ac radio — Ambarella / Novatek class, or an SoM with an RTL88xx-family 5 GHz part |
| Raw full video (28 GB/session) | not feasible on a headband | — |

**Recommendation: design for edge-first, but specify 5 GHz 802.11ac anyway.** The radio is a small
part of the BOM, and it buys the option to pull full gated video off the device — which you will
want for *continuing to grow the training set from real users* long after the collection phase ends.
Designing the data path so that is possible, and merely disabled by default, is the cheap
insurance.

**Also required regardless:** on-device **hardware HEVC encode**. Without it, lever 1 is unavailable
and everything downstream is 3× larger. This is a camera-SoC selection criterion, not a firmware
feature — add it to the production requirements in `ironpal-poc-to-production-transfer.md` §6.

---

## 7. For the POC / collection phase: do not solve this yet

You are on USB now (ELP + LG G7) and the collection phase needs *full* video. Wireless will not beat
the wire for that, and building it now costs weeks against a POC that is designed to be thrown away.

**If you want to drop USB during collection, use a µSD card and a card reader** — ~90 MB/s, so 1 GB
in ~11 seconds and a full 28 GB session in ~5 minutes, faster than any wireless option in this
document and with no firmware to write.

This also sidesteps the storage finding from the sync-plan grilling: the capture phone has only
**36 GB free**, roughly one session. A card that never routes through the phone removes that
bottleneck entirely.

---

## 8. Answers in one line each

- **Can BLE do it?** No — 95 minutes for 1 GB. Use BLE for control and IMU only.
- **Can Wi-Fi do it?** Yes: 5 GHz 802.11ac moves 1 GB in ~40 s, 802.11n 5 GHz in ~1.9 min.
- **Should you move 1 GB at all?** No. Edge-first selection makes a session ~20–50 MB.
- **What if you want full video anyway?** On-device HEVC + IMU gating → 2.7 GB/session → ~110 s over
  802.11ac. Make it an explicit, on-charger action.
- **What about right now?** Stay on USB, or use a µSD card. Do not build wireless for a throwaway rig.
