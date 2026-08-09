# Capturing all 37 Tier-1 exercises in three gym visits

Plan for collecting labelled clips of the **37 Tier-1 exercises** in
[`docs/video-analysis-kb/ontology.json`](video-analysis-kb/ontology.json), using the headband rig
(de-cased ELP fisheye + Nano 33 BLE Rev2), in **exactly three visits**.

Companion docs: [`ironpal-gym-session-01-plan.md`](ironpal-gym-session-01-plan.md) (rig build and
shakedown — do that first), [`ironpal-shenyao-capture-procedure.md`](ironpal-shenyao-capture-procedure.md)
(camera/app settings), [`ironpal-two-app-sync-explained.md`](ironpal-two-app-sync-explained.md) (why
the nods matter).

---

## 0. Preconditions — do not start this programme until both are true

**1. The rig has survived one real session.** Session 01 was the shakedown. Nothing in this plan is
worth attempting until the de-cased board has proven it survives sweat and a full session, and until
the **new mount rotation is measured and written down** (the old 180° belonged to the case mount,
which no longer exists).

**2. Storage is freed.** At ~62 Mbps ≈ **465 MB/min**, the ~17 GB currently free is **~36 minutes**.
Each visit below needs 25–35 minutes of *recorded* video. **Free to ≥ 32 GB (~68 min)** and every
visit has comfortable headroom. This is the single cheapest thing that de-risks the programme.

> If session 01 revealed problems, fix them before spending three gym trips. Three visits is the
> entire budget — there is no fourth to absorb a rig failure.

---

## 1. The three groups

Split by **rep-signal class first** (the user's requirement: IMU-dependent work last), then by
**equipment station** so a visit is not spent walking laps of the gym.

### Group 1 — Free weights, head still (12) · *Visit 1*

Weight lives on **plate faces and cast numbers** — the known-hard OCR case.

| # | Exercise | Equip | `rep_signal` | Weight read |
|---|---|---|---|---|
| 1 | Barbell Bench Press | barbell | vision | plate faces + bar |
| 2 | Incline Barbell Bench Press | barbell | vision | plate faces + bar |
| 3 | Barbell Bent-Over Row | barbell | vision | plate faces + bar |
| 4 | Barbell Curl | barbell | vision | plate faces + bar |
| 5 | Dumbbell Bench Press | dumbbell | vision | cast number |
| 6 | Dumbbell Fly | dumbbell | vision | cast number |
| 7 | Dumbbell Pullover | dumbbell | vision | cast number |
| 8 | Dumbbell Shoulder Press | dumbbell | vision | cast number |
| 9 | Dumbbell Lateral Raise | dumbbell | vision | cast number |
| 10 | Dumbbell Front Raise | dumbbell | vision | cast number |
| 11 | Dumbbell Biceps Curl | dumbbell | vision | cast number |
| 12 | Single-Arm Dumbbell Row | dumbbell | vision | cast number |

### Group 2 — Stations, head still (10) · *Visit 2*

Weight lives on **pin stacks** — painted, printed, the OCR case most likely to work.

| # | Exercise | Equip | `rep_signal` | Weight read |
|---|---|---|---|---|
| 13 | Lat Pulldown | cable | vision | pin stack |
| 14 | Seated Cable Row | cable | vision | pin stack |
| 15 | Cable Biceps Curl | cable | vision | pin stack |
| 16 | Cable Lateral Raise | cable | vision | pin stack |
| 17 | **Triceps Cable Pushdown** | cable | **`hard`** | pin stack |
| 18 | Chest Press (Machine) | machine | vision | pin stack / plate |
| 19 | Shoulder Press (Machine) | machine | vision | pin stack / plate |
| 20 | Leg Press | machine | vision | pin stack / plate |
| 21 | Leg Extension | machine | vision | pin stack / plate |
| 22 | **Seated Leg Curl** | machine | **`hard`** | pin stack / plate |

### Group 3 — Requires the Nano IMU (15) · *Visit 3*

Every `imu` and `fusion` exercise. **This is the visit the Nano exists for.**

| # | Exercise | Equip | `rep_signal` | Weight read |
|---|---|---|---|---|
| 23 | Barbell Back Squat | barbell | imu | plate faces + bar |
| 24 | Barbell Front Squat | barbell | imu | plate faces + bar |
| 25 | Barbell Deadlift | barbell | imu | plate faces + bar |
| 26 | Romanian Deadlift | barbell | imu | plate faces + bar |
| 27 | Barbell Overhead Press | barbell | **fusion** | plate faces + bar |
| 28 | Barbell Hip Thrust | barbell | **fusion** | plate faces + bar |
| 29 | Pull-Up | bodyweight | imu | n/a |
| 30 | Chin-Up | bodyweight | imu | n/a |
| 31 | Dip | bodyweight | imu | n/a |
| 32 | Push-Up | bodyweight | imu | n/a |
| 33 | Goblet Squat | dumbbell | imu | cast number |
| 34 | Bulgarian Split Squat | dumbbell | imu | cast number |
| 35 | Walking Lunge | dumbbell | imu | cast number |
| 36 | Hack Squat (Machine) | machine | imu | pin stack / plate |
| 37 | Standing Calf Raise (Machine) | machine | imu | pin stack / plate |

**12 + 10 + 15 = 37.** ✅

### 1.1 Why this split is more than logistics

Each visit answers a **different question**, which means a bad visit invalidates one question rather
than the whole dataset:

| Visit | Question it answers |
|---|---|
| **1** | Can vision count reps *and* can OCR read **cast/plate** weights? *(expect many weight abstentions — that is the honest baseline, not a failure)* |
| **2** | Same rep question, but the **easy** weight case. If OCR does not work on painted pin stacks, it will not work anywhere. |
| **3** | Does the **IMU rep path** actually work on the exercises it was chosen for? |

Visits 1 and 2 also bracket the weight-reading problem from both ends, which is exactly the open
question in [`ironpal-capture-hardware-decision-log.md`](ironpal-capture-hardware-decision-log.md) §6.

### 1.2 ⚠️ Visit 3 is not a workout — read this before loading a bar

Group 3 contains **9 leg-dominant exercises**: back squat, front squat, deadlift, RDL, hip thrust,
goblet squat, Bulgarian split squat, walking lunge, hack squat, plus calf raise. **Nobody trains all
of that in one session.** Attempting it produces fatigue-degraded form, which means *bad labels* — and
a real injury risk under a loaded bar.

**Treat every visit as a capture session, not a workout.** Use **~50–60 % of working load**, 6–8 clean
reps. The data needs a *correct rep pattern and a readable weight*, not a training stimulus. A crisp
set at 60 kg is worth more than a grinding set at 100 kg.

If Visit 3 still feels too long, **split it across the squat pattern and the pull/push pattern within
the same visit** with a long break — but do not add a fourth visit; drop sets instead.

---

## 2. Capture protocol

### 2.1 Recording discipline — record blocks, not the whole visit

Two competing costs:

- **Continuous recording** wastes storage on rest periods (465 MB/min of nothing).
- **Per-exercise recording** pays the **60 s warm-up settle** every time (§2.3), which at 15 exercises
  burns ~7 GB doing nothing.

**So: one recording per equipment station / block**, typically **4–6 blocks per visit**. Start the
recorder when you arrive at the station, stop when you leave it.

**Keep ONE IronPal IMU session running for the entire visit.** One `imu.jsonl`, several video files,
each aligned independently — exactly what `sync_imu_video.py` expects.

### 2.2 Per-block sequence

1. Arrive at station. **Start ShenYao recording.**
2. **Wait ~60 s**, then **3 sharp nods**, ~1 s apart.
3. Run every exercise for that station (§2.4).
4. **3 nods** again.
5. **Stop recording.** Walk to next station.

### 2.3 Why the 60 s settle

The recorder's frame rate ramps **21.69 → 26.05 → 29.76 fps** with jitter falling **8.0 → 3.8 ms**. A
nod placed at t=0 anchors alignment to the least reliable part of the recording, where jitter alone
eats a fifth of the 40 ms budget. Fill the 60 s usefully — set up the station, adjust the seat, load
the bar.

### 2.4 Per-exercise protocol

For each exercise, in this order:

1. **Staging glance — ~2 s, still, face-on** at the plate face / pin / dumbbell head.
   This is the *only* frame weight-OCR can use (never mid-rep), **and** it marks an unmistakable set
   boundary in the video. It is the highest-value two seconds of the whole protocol.
2. **Set 1** — 6–8 clean reps at moderate load, controlled tempo.
3. **Write the log line** (§5) — immediately, not from memory.
4. **Change the weight**, staging glance again.
5. **Set 2** — 6–8 reps at a *different* weight.
6. **Write the log line.**

**Two sets at two different weights, deliberately.** One weight per exercise teaches the model the
exercise's *typical* load; two proves weight reading is actually reading rather than recalling. This
matters more than a third set.

---

## 3. Rig setup — per visit

### 3.1 Before leaving home

- [ ] Storage ≥ 32 GB free
- [ ] Phone at 100 %; power bank packed
- [ ] **Nano powered** — powered OTG hub, or pocket power bank on **Micro-USB** (the Rev2 is Micro-B)
- [ ] Board insulated, mounted on the **outside** face of the band; lens clear
- [ ] Cable strain-relieved and routed **over the shoulder**, not down the spine
- [ ] Paper log + pen
- [ ] Microfibre cloth (sweat on the lens is guaranteed by exercise 6)

### 3.2 Camera settings (set once, never change mid-programme)

| Setting | Value | Why |
|---|---|---|
| Resolution | 3840×2160 | 21 % of the frame is already black outside the image circle; do not cut further |
| Frame rate | highest stable (~25–30) | Rep boundaries are temporal |
| Focus | **fixed — AF off** | Fixed-focus lens; hunting ruins staging frames |
| Exposure / WB | locked if the app allows | Hunting corrupts the motion-energy profile the routing tools use |
| Audio | **off** | Unused, costs storage, and a privacy surface in a shared gym |
| Overlays / timestamps | **off** | Burned-in pixels corrupt the frames the KB reads |

**Changing any of these between visits makes the three visits non-comparable.** Set them once, write
them in the log, leave them alone.

### 3.3 IMU settings

Nothing to configure — the firmware is fixed at **60 Hz, ±8 g / ±1000 dps**, and advertises its
scales in the config characteristic. Verify only:

- BLE connected, **MTU ≥ 109** (negotiates 247 on this phone)
- `seq_gaps: 0` in `meta.json` at the end
- Free-space gate passed at session start

### 3.4 First 8 minutes of every visit — mini shakedown

Even on visits 2 and 3. Record one light set, **look at the clip on the phone**, confirm: implement
in frame, sharp, rotation as expected, band not drooping. Ten minutes here beats a wasted visit.

---

## 4. Accuracy and consistency

Consistency across visits is what makes the three sets of clips one dataset instead of three.

- **Same rig geometry every time.** Mark the band position; re-measure and record rotation each visit.
- **Same settings** (§3.2), unchanged for the whole programme.
- **Same staging-glance habit** on every single set.
- **Two different weights per exercise** (§2.4).
- **Log immediately**, in a fixed weight convention:
  - barbell → **total including the bar**, note the bar weight separately
  - dumbbell → **per dumbbell**, say so
  - stack → **the number at the pin**
- **Note anomalies** — a cut-short rep, a slipped band, someone crossing frame. That is what lets you
  discard one set rather than doubt the visit.

---

## 5. Ground-truth log — the actual deliverable

**Video without labels is not training data.** It cannot be scored by
[`score_weights.py`](../scripts/kb/score_weights.py) and cannot train anything.

```
VISIT __  date ______  group ____  rotation ______  settings-unchanged? Y/N

blk  ex#  exercise                    set  reps  weight        notes
 1   13   Lat Pulldown                 1    __   ___ (pin)     ______________
 1   13   Lat Pulldown                 2    __   ___ (pin)     ______________
 1   14   Seated Cable Row             1    __   ___ (pin)     ______________
```

Photograph the sheet before leaving the gym — paper gets lost and wet.

**File naming**, applied at ingest so 37 exercises stay distinguishable:

```
V<visit>_G<group>_<ex##>_<exercise-slug>_set<n>.mp4
e.g.  V2_G2_13_lat-pulldown_set1.mp4
```

---

## 6. What will go wrong

| Challenge | Mitigation |
|---|---|
| **Storage runs out mid-visit** | Free to ≥32 GB beforehand; record blocks not continuously; end a block cleanly rather than truncating |
| **A busy gym blocks a station** | Groups are station-clustered but **order within a block is free** — take whatever is open, log the actual order |
| **Fatigue degrades form** (esp. Visit 3) | 50–60 % loads, 6–8 reps. Capture session, not workout |
| **Sweat on lens / in electronics** | Microfibre between exercises; board outside the band; insulated back |
| **Phone thermal throttling** | Blocks give natural cooling gaps; do not push through a hot phone |
| **BLE gap mid-block** | `seq_gaps` records it; **re-nod after any reconnect** to give correlation a fresh anchor |
| **Cable snags** (rows, pulldowns, lunges) | Route over the shoulder, clip to shirt; check after each station |
| **Bystanders in frame** | Tell staff first; prefer quiet hours; a 200° fisheye captures most of the room. Stop if asked |
| **Bar occludes the plate faces** | Take the staging glance while the bar is **on the rack/floor**, plates face-on — not once you are under it |
| **Bench press / hip thrust framing** | Supine, camera looks up — verify in the mini shakedown that the bar is actually in frame |

---

## 7. Post-processing

Per visit, at the laptop:

```sh
# 1. Pull
adb pull /sdcard/DCIM/USBCamera/  input/kb/clips/visit<N>/
adb pull /sdcard/Android/data/com.ironpal.poc/files/sessions/  input/kb/sessions/

# 2. Clock health — needs no video, tells you instantly if the IMU half is sound
python3 scripts/kb/sync_imu_video.py --session input/kb/sessions/<id> --clock-only

# 3. Align each block
python3 scripts/kb/sync_imu_video.py --session input/kb/sessions/<id> \
    --video input/kb/clips/visit<N>/IPS_<block>.mp4
```

Expect drift ≈ **−50 ppm**, `seq_gaps: 0`, correlation peak **> 0.2** with sharpness ratio **> 1.3**.
A peak near 0.1 means the streams did not correlate — the script rejects rather than guessing.

Then:

4. **Segment** each block into per-exercise, per-set clips using the staging glances and
   `motion_profile.sh` as boundary markers; rename per §5.
5. **Enter ground truth** from the paper log into
   [`docs/video-analysis-kb/ground-truth.md`](video-analysis-kb/ground-truth.md).
6. **Run the analysis skills blind** (`/exercise-recognition`, `/repetition-counting`,
   `/weight-lifted-analysis`) on a sample, write `predictions.json`, then:
   ```sh
   python3 scripts/kb/score_weights.py
   ```
7. **Log cases** in `docs/video-analysis-kb/cases/` for anything that surprised you, and fold
   generalisable corrections back into the KB.

**Do not batch all three visits before scoring.** Score after **Visit 1** — if rep counting or weight
reading fails systematically, Visits 2 and 3 should change before they are spent.

---

## 8. Success criteria

Judged per visit, not per exercise:

- ✅ **Minimum** — every exercise in the group has ≥ 1 usable set with a matching log line, and at
  least one block aligns with a sharp correlation peak.
- ✅ **Good** — 2 sets at 2 weights for every exercise; all blocks align; `seq_gaps: 0` throughout.
- ✅ **Excellent** — the above, plus a legible staging frame for every exercise that has a weight.

**`confident-wrong` must stay 0.** An honest abstention is a pass; a confident wrong reading is the
only truly bad outcome. Expect Visit 1 (cast plates) to abstain often — that is the baseline being
measured, not a failure of the visit.

**The most valuable single output is knowing which of the 37 the rig cannot handle.** Two of them
(`Triceps Cable Pushdown`, `Seated Leg Curl`) are already classed `hard` and *should* abstain on
reps. If they do, the taxonomy is working.
