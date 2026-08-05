# IronPal — Keeping POC Data Valid for the Production Rig

**Status:** Draft v1 · 2026-08-04
**Problem:** all three capture components are throwaway — ELP 4K fisheye (camera), ShenYao USB
Camera (app), Arduino Nano 33 BLE Rev2 (IMU). The production device replaces all three. The
8–12 gym sessions of labeled data captured on the POC rig must not become worthless when it does.
**Related:** `ironpal-supervised-learning-phase-plan.md` · `ironpal-imu-camera-sync-plan.md` ·
`ironpal-imu-poc-integration-plan.md`

---

## 0. The framing is backwards, and fixing that is most of the answer

The task says: *ensure the data captured with the POC rig is representative of the data the final
product will capture.* **That cannot be done as stated** — the production rig does not exist, has no
spec, and you would be matching a moving target that hasn't moved yet.

Invert it:

> **The dataset is the expensive asset. The production hardware is cheap and still unbuilt.
> Therefore: measure and freeze the POC rig, and make it the specification the production hardware
> must meet — not the other way round.**

8–12 gym sessions is weeks of your time and cannot be re-shot cheaply. A camera module spec is an
email to a supplier. Constrain the thing that isn't built yet.

This turns a vague worry into three concrete deliverables:

1. **A measured rig spec** (§2) — what the POC rig *is*, in numbers, frozen.
2. **A canonical representation** (§4) — a rig-independent form of the data that survives a hardware
   change, so the dataset does not expire.
3. **A production requirements list** (§6) — what the custom camera/IMU must satisfy for the
   existing dataset to remain valid.

---

## 1. The asymmetry that decides everything

Not all differences are equal. There is one distinction that governs the whole problem:

| Kind of difference | Transfers? | Example |
|---|---|---|
| **Worse in degree** | ✅ Yes — and it is *good* | POC is noisier, jitterier, lower-res, variable frame rate. Train on hard, deploy on easy. |
| **Different in kind** | ❌ No — fatal | Different FOV geometry, different IMU axis convention, an exercise that was `visible` becoming `occluded`. |

**POC data being worse than production is fine and even desirable.** A model trained on 22.86 fps
jittery VFR video with a noisy consumer IMU will cope with a clean 30 fps CFR stream and a better
sensor. The generalisation runs downhill in the right direction.

**POC data being different in kind is unrecoverable**, because the model learns relationships that
no longer hold. Everything below is about pinning the *kind* while letting the *degree* vary freely.

### What is invariant and needs no protection at all

Worth stating, because it is most of the value and it is safe:

- **Human biomechanics.** A Bulgarian split squat is the same movement regardless of what records
  it. This is why the **IMU transfers best of the three** — the signal is a property of the body,
  not the sensor.
- **The ontology, labels, and rep semantics** (`ontology.json`) — rig-independent by construction,
  with one exception flagged in §3.
- **Gym equipment and plate denominations** — a 20 kg plate stays a 20 kg plate.

---

## 2. What the POC rig actually is (measured)

Measurements from `IPS_2026-08-02.15.33.00.0640.mp4`. Anything marked ⚠️ still needs a proper
calibration target and is a bring-up task, not an assumption to carry forward.

### 2.1 Camera — the fisheye wastes a fifth of the sensor

| Property | Measured |
|---|---|
| Nominal resolution | 3840×2160 |
| **Near-black pixels per frame** | **21.1%** — outside the lens image circle |
| Horizontal content span | 3400 px of 3840 (88%) |
| Vertical content span | 2159 px of 2160 (~100%) |
| Radial luminance | collapses past r≈0.7; **r≥0.8 is essentially black** (mean luminance 1) |
| Frame rate | **variable** — 22.86 fps measured vs 25.41 declared, 33.8 ms jitter |
| Mount rotation | **180°** (case 007) |
| Codec | H.264 Baseline, ~62 Mbps |

> **"4K" is misleading and must never appear in the production spec.** A fifth of every frame is
> black, the usable image circle is inscribed vertically, and the corners carry no data at all.
> The number that matters for weight OCR is **pixels-on-target inside the usable circle**, not
> sensor resolution. Specify that, or you will buy a "4K" module that reads plates worse.

⚠️ **Still to measure:** angular FOV (horizontal/vertical/diagonal), distortion coefficients, and
mount pitch relative to gaze. These need a checkerboard/ArUco target (§5) — they are the numbers
the production optics spec actually hangs on.

### 2.2 IMU — nothing measured yet

The unit is bought but not built, so §2 is a bring-up deliverable, not a finding. Record at
minimum: part (BMI270), ODR, **FSR**, noise density, axis orientation relative to the head, and
mounting position on the band.

### 2.3 App

VFR, 1-second-resolution timestamps that disagree by 116 s between filename and container
(see the sync plan §1.1). The production app will be strictly better on all counts — which by §1 is
the harmless direction.

---

## 3. A correction: one ontology field is rig-coupled, not intrinsic

`ontology.json` carries `egocentric_visibility` (`visible` / `partial` / `occluded` /
`floor_reference`) and `rep_signal` (`imu` / `vision` / `fusion` / `hard`), hand-authored across all
37 Tier-1 entries.

**I authored those as properties of the exercise. `egocentric_visibility` is partly a property of
the rig's field of view** — and `rep_signal` inherits the coupling, because a `vision` verdict
assumes the implement is actually in frame.

Concretely: if the production camera has a **narrower** FOV than the ELP fisheye, exercises
currently marked `visible` can become `partial` or `occluded`, and their `rep_signal` can degrade
from `vision` toward `hard`. That would silently invalidate the sensor-assignment logic the whole
Track A/Track B split rests on.

**Mitigations, in order of preference:**

1. **Spec the production FOV to be ≥ the POC usable circle** (§6). Then visibility can only improve,
   and every current verdict remains valid — the cheapest fix by far.
2. **Train on a canonical FOV crop** (§4) sized to the narrowest plausible production camera, so the
   labels are already conservative.
3. If neither, **re-audit the 37 Tier-1 verdicts against the new rig** before trusting them.

This is recorded in the ontology itself so it cannot be forgotten (§7).

---

## 4. Canonicalise at ingest — the move that makes the dataset survive

Store **raw + canonical**. Train on canonical. A future rig then needs only its own calibration into
the same canonical space, and the existing dataset stays usable rather than expiring.

### 4.1 Video canonical form

- **Undistort** using measured intrinsics into a fixed pinhole model.
- **Crop to a canonical FOV** = the intersection of the POC usable circle and the minimum FOV the
  production spec guarantees. Conservative by construction; the discarded black corners cost nothing.
- **Resample to constant frame rate** using true PTS (never frame index — see sync plan §1.2).
- **Normalise rotation** using the per-session `meta.json` field, never a hardcoded 180°.

Keep full-frame raw archived: Claude-based Track A can exploit the wider POC FOV even where the
small model trains on the conservative crop.

### 4.2 IMU canonical form

- **Rotate into a canonical head frame** (e.g. +X forward through the nose, +Z up) via a per-rig
  rotation matrix from the calibration ritual (§5). **This is the single most important step** — a
  production IMU mounted at a different orientation produces signals that look like different
  exercises until this is applied.
- **Resample to a canonical ODR** (100 Hz).
- **Convert to SI units** (m/s², rad/s) using the recorded scale factors, not raw LSB.
- **Record FSR and flag clipping.** A ±2 g range clips on deadlift lockout; if POC data is clipped
  and production is not, those samples are different *in kind*. Set FSR generously (§6) and mark any
  saturated window as suspect rather than training on a flattened peak.

### 4.3 Consequence for the storage layout

Extends `ironpal-supervised-learning-phase-plan.md` §2.3:

```
sessions/<id>/
  meta.json            # + rig_id, rig_spec_version, calibration results
  raw/                 # original video chunks (cold)
  work/                # H.265 working copies
  canonical/           # undistorted + canonical-FOV video, canonical IMU  <-- train on this
  imu/imu.jsonl        # raw, both clocks
  labels/session.json
```

---

## 5. The per-session calibration ritual (~60 seconds)

Every session must **self-document its rig**, so a rig change is detectable from the data rather
than from memory. Without this, a mid-collection hardware swap silently corrupts the dataset and you
find out during training.

| Step | Duration | Yields |
|---|---|---|
| Film a **checkerboard/ArUco target** at a marked distance | ~15 s | camera intrinsics, FOV, distortion; detects lens/mount change |
| Film a **known plate at a marked distance** | ~10 s | weight-OCR legibility benchmark, comparable across rigs |
| **Six static orientation holds** (band on a flat surface, each face down) | ~20 s | IMU bias, scale, and **axis-to-head rotation** — feeds §4.2 |
| **Three sharp head nods** | ~5 s | video↔IMU sync anchor (sync plan §4.2) |

Print the ArUco target and stick it in your gym bag. The plate distance can be a floor mark.

The checkerboard step is what converts "we think the FOV is the same" into a measured fact, and it
is what will let you *prove* transfer later instead of hoping for it.

---

## 6. Production hardware requirements (derived from POC, not invented)

Hand this to whoever specs the custom camera/IMU. Each line exists to keep the existing dataset
valid; the *rationale* column is what stops it being negotiated away.

### Camera

| Requirement | Rationale |
|---|---|
| FOV **≥ POC usable circle** (measure first, §2.1 ⚠️) | Narrower FOV changes `egocentric_visibility` and invalidates `rep_signal` verdicts (§3) |
| **Pixels-on-target at ~0.5 m ≥ POC**, specified inside the usable image circle | Plate OCR depends on angular resolution, not nominal megapixels; POC wastes 21% of frame |
| **Constant frame rate**, ≥ POC's effective ~23 fps | Removes the VFR problem entirely; strictly the easy direction |
| **Per-frame PTS embedded**, or hardware timestamp | Ends reliance on post-hoc cross-correlation |
| Rotation/orientation **documented in metadata**, not assumed | Case 007: a wrong rotation assumption inverted an entire exercise class |
| Rolling-shutter readout **no worse than POC** | Fast head motion under rolling shutter warps geometry; a worse sensor changes it in kind |
| **On-device hardware HEVC encode** | Without it a session is 28 GB instead of 9 GB and no wireless path is viable — an SoC selection criterion, not a firmware feature (`ironpal-wireless-offload-plan.md` §3) |
| **5 GHz 802.11ac radio + BLE**, µSD buffer | BLE carries control/IMU (0.01 Mbps); Wi-Fi carries bulk. 2.4 GHz is saturated in commercial gyms. Keeps the option of pulling full gated video from real users later (§6 of the offload plan) |

### IMU

| Requirement | Rationale |
|---|---|
| ODR **≥ 100 Hz** | Canonical rate; downsampling is safe, upsampling invents data |
| FSR **≥ ±8 g / ±1000 dps** | Prevents clipping on explosive lifts; clipped POC data vs unclipped production is a kind-difference (§4.2) |
| Noise density **≤ BMI270** | Worse-in-degree is tolerable one way only — production must not be noisier |
| **Axis orientation documented**, and mounting within a stated tolerance of POC | The rotation matrix (§4.2) is only correctable if the geometry is known |
| Rigidly co-mounted with the camera | Preserves the shared-motion sync channel *and* the rigid-body assumption |

---

## 7. Bridge validation — measure transfer, never assume it

When the first production rig exists, **before trusting the existing dataset on it**:

1. Capture a **bridge set**: ~20 sets across 6–8 Tier-1 exercises, same gym, same lifter, wearing
   **both rigs in the same session** where physically possible, otherwise back-to-back.
2. Run the existing Track A signatures and Track B model against the production capture.
3. **Report the accuracy delta** per task (exercise / reps / weight) through the same harness that
   already gates the KB — `score_weights.py` plus the exercise/rep scorers.
4. Decision gate:
   - Delta within noise → dataset transfers, proceed.
   - Degradation localised to specific exercises → re-audit their `egocentric_visibility` (§3).
   - Broad degradation → canonicalisation is wrong (likely the IMU rotation matrix); fix §4.2 before
     collecting anything new.

Budget this now: **one gym session plus a day of analysis**. It is far cheaper than discovering
non-transfer after the production run.

---

## 8. What this changes in the existing plans

- **`ironpal-supervised-learning-phase-plan.md`** — §2.3 storage gains a `canonical/` tier (§4.3);
  §1.2 capture protocol gains the calibration ritual (§5); milestones gain the bridge validation
  (§7).
- **`ontology.json`** — carries a note that `egocentric_visibility` and `rep_signal` are
  FOV-coupled, so a future rig change triggers a re-audit rather than silent invalidation (§3).
- **`ironpal-imu-camera-sync-plan.md`** — unaffected in method; the canonical IMU frame (§4.2)
  becomes the output of its B4 alignment step rather than raw device axes.

## 9. The one-line version

**Freeze the POC rig as a measured spec, canonicalise the data into a rig-independent form, make
every session self-document its calibration, and prove transfer on a bridge set before trusting
it.** Do that and the hardware becomes replaceable — which is the actual goal, since all three
components are meant to be thrown away.
