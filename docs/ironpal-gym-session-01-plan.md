# Gym session 01 — headband rig, chest / shoulders / triceps

First real-gym capture with the ELP board de-cased and mounted in a GymBeam terry headband alongside
the Nano 33 BLE Rev2. Target date: **2026-08-07**.

Companion docs: [`ironpal-shenyao-capture-procedure.md`](ironpal-shenyao-capture-procedure.md)
(camera/app settings), [`ironpal-two-app-sync-explained.md`](ironpal-two-app-sync-explained.md)
(why the nods matter), [`ironpal-supervised-learning-phase-plan.md`](ironpal-supervised-learning-phase-plan.md)
(what the data is for).

---

## 0. Read this first — three things decide whether tomorrow is worth anything

**1. How is the Nano powered?** ← *unresolved blocker*
Every previous test powered it from the laptop's USB. In the gym there is no laptop, and the phone's
USB-C is occupied by the camera. **Solve this tonight or the IMU half of the session does not
happen.** Options in §1.3.

**2. Storage does not fit a full session.** ~17 GB free ≈ **36 minutes** of 4K at ~62 Mbps. Nine
exercises with rests will exceed that. **Free ~15 GB tonight** (target ≥ 32 GB ⇒ ~68 min) or plan to
record in short blocks and accept losing some.

**3. Without a ground-truth log the clips are not training data.** Video with no record of what
exercise, how many reps, and what weight is *unlabelled footage* — it cannot be used for supervised
learning and cannot be scored by the harness. **The paper log in §6 is not optional bookkeeping; it
is the actual deliverable.** The video is just evidence supporting it.

Everything else in this document is recoverable. These three are not.

---

## 1. Build (do tonight, not in the gym car park)

### 1.1 De-casing the camera

The metal case provides three things you are giving up: **lens protection, a heat path, and
mechanical rigidity**. Plan for their absence.

1. Work on a non-conductive surface. Touch a radiator/tap first to discharge static — the IMX415 and
   the USB bridge are ESD-sensitive.
2. Remove the four case screws. **Keep them** — the same M2 holes at the board corners are your
   mounting points.
3. Lift the board out by its edges. **Do not touch the lens glass or the sensor.** Do not flex the
   PCB.
4. **Do not rotate the lens barrel.** It is focused; turning it costs you sharpness you cannot easily
   restore, and weight-plate OCR is already the weakest link in the pipeline.
5. Leave the HDMI pigtail unplugged/taped back if it is detachable — you are using USB only.

### 1.2 Insulation and heat — the thing most likely to kill the board

A terry headband against a forehead is a **sweat sponge**, and sweat is conductive and corrosive.
A bare PCB inside it is the single biggest hardware risk tomorrow.

- **Mount the board on the OUTSIDE face of the band**, not the inside. The band then sits between the
  electronics and your skin, keeping the sweat source on the far side. Discretion is irrelevant for a
  test session; a dead board is not.
- **Insulate the back of the PCB** with kapton or electrical tape — a continuous layer, no bare
  copper against fabric. Leave the lens, and any visible heatsink area, uncovered.
- **Do not wrap the board in cloth.** 4K encode makes these modules genuinely warm, and the case you
  removed was part of the heat path. Airflow over the back of the board is now the only cooling.
- Cut the lens hole slightly oversize and **heat-seal the terry edge** (quick pass with a lighter) or
  it will fray into the lens.

### 1.3 Nano mounting and power — resolve before bed

**Mounting:** place the Nano at the **side or rear** of the band to balance the camera's weight at
the front. Insulate its back too. **Keep the antenna end clear** — no foil, no metal, no dense
padding over the PCB antenna, or the BLE link degrades exactly when you cannot debug it.

**Power — pick one tonight:**

| Option | Verdict |
|---|---|
| **Powered OTG hub** → camera + Nano + phone charging from one hub | **Best if you own one.** Solves power, storage-time *and* phone battery in one move. |
| **Small USB power bank in pocket** → Micro-USB to the Nano | **The reliable fallback.** Nano draws ~15–20 mA, so any bank lasts the session. Costs a second cable to the pocket. |
| LiPo on VIN | Not for tomorrow — needs a connector and testing you do not have time for. |

**Cable: Micro-USB, and it must be a data-or-power cable that actually carries power.** The Nano 33
BLE Rev2 is Micro-B, *not* USB-C — the same trap documented in `poc/firmware/README.md`.

### 1.4 Strain relief — one tug ends the session

The USB pigtail is soldered to a small PCB pad. A yank rips the connector off the board.

- Loop the camera cable once and tape the loop to the band, so any pull loads the tape, not the pad.
- Route the cable **over one shoulder and down the side**, then clip it to your shirt. Do **not** run
  it down the centre of your back: on flat and incline bench you lie on it.
- Same for the Nano's cable if you are using a pocket power bank. Tape both runs together.

### 1.5 Bench test before you sleep

With everything assembled exactly as you will wear it:

- Plug into the phone → ShenYao sees the camera → live preview.
- IronPal app → Live workout → Start set → confirm BLE connects (logcat `BleImuSource`, or just that
  a session dir appears).
- **Record 60 s while walking around, then check the clip on the phone.** Wearing the band. This is
  where you discover the lens is aimed at the ceiling.
- Leave it running 10 minutes and **feel the board** — if it is hot in still air on a desk, it will
  be hotter under a band.

---

## 2. Aim and rotation — re-verify, do not assume

**The 180° rotation recorded for the old rig no longer applies.** That was a property of the *case
mount*. You have just changed the mount, so the rotation is now unknown until you look.

From the bench-test clip, determine and **write down**:

- **Rotation** — extract a frame and check: is text upright? For the record: on the old rig
  `transpose=2` gave readable mat text and the watch on the **left** wrist. Verify both again.
- **Pitch** — a 200° fisheye at forehead height sees a huge cone, but you want the **implement and
  hands** near the centre where distortion is lowest. Aim **slightly downward**, roughly toward where
  your hands sit at arm's length.
- Note it in the session log. Ingest reads rotation from session metadata and must never hardcode it.

---

## 3. At the gym — shakedown before you commit (≈8 minutes)

**Do not run the whole session and discover a problem afterwards.** This is the first outing for this
hardware configuration; assume something is wrong.

1. Kit up, cables routed and clipped.
2. IronPal app → Start set. Confirm free-space gate passes and BLE is connected.
3. ShenYao → start recording.
4. Wait **~60 s** (frame rate ramps 21.7 → 29.8 fps during warm-up — see §5), then **3 sharp nods**,
   ~1 s apart.
5. Do **one light set of ~8 reps of any chest movement**.
6. Stop recording. **Pull the clip up on the phone and actually look at it:**

   - [ ] Is the implement in frame through the whole rep?
   - [ ] Is it sharp, or did de-casing shift the focus?
   - [ ] Is the rotation what you wrote down?
   - [ ] Any sweat/fog on the lens already?
   - [ ] Does the band stay put, or does the camera droop under weight?

**If any of these fail, fix it before doing the real session.** A 10-minute fix now beats nine
unusable exercises.

---

## 4. Session structure

**Record in three blocks, one per muscle group** — not one continuous file (storage), and not one
file per set (too much fiddling, and each new recording pays the 60 s warm-up again).

Each block: start recording → wait 60 s → 3 nods → train the block → 3 nods → stop.
**Keep the IronPal IMU session running across all three blocks.** One IMU log, three video files,
each aligned independently. That is exactly what `sync_imu_video.py` expects.

### 4.1 The exercise matrix — and why it is well chosen

Your selection spans **all four `rep_signal` classes** in the ontology, which makes this a genuine
test of the fusion design rather than nine samples of the same thing.

| # | Exercise | `rep_signal` | Head | What it tests |
|---|---|---|---|---|
| **Block A — chest** ||||
| A1 | Barbell flat bench press | `vision` | still | Supine: camera looks up, bar crosses frame. Head is still ⇒ **IMU should be near-useless here** — that is the expected result, not a failure. |
| A2 | Incline barbell bench press | `vision` | still | Same, different trunk angle — does the changed camera pitch still frame the bar? |
| A3 | Cable fly | `vision` | still | Hands travel **wide** — tests whether the 200° fisheye holds them, and how badly the edge distorts. |
| **Block B — shoulders** ||||
| B1 | Barbell overhead press | `fusion` | **moving** | The only `fusion` case: head moves *and* the bar is visible. Best case for agreement between both channels. |
| B2 | Dumbbell shoulder press | `vision` | still | Seated, implement passes through centre frame — should be the cleanest vision read of the day. |
| B3 | Dumbbell lateral raise | `vision` | still | Implement lives at the **periphery** the whole set. Hard for vision, invisible to a head IMU. |
| **Block C — triceps** ||||
| C1 | **Dips** | **`imu`** | **moving** | **The IMU test you asked for.** Whole-body vertical translation ⇒ strongest IMU rep signal available. If reps are not clean here, the IMU path has a problem. |
| C2 | Triceps cable pushdown | **`hard`** | still | Known abstention case (case 003): axial, head still, flat motion profile. **Expect the tooling to abstain — a correct abstention is a PASS.** |
| C3 | Overhead cable extension | *(expect `hard`)* | still | **The implement goes behind your head — outside the camera's FOV entirely.** Vision cannot see it and the head barely moves. Predicted double-failure; capture it precisely *because* it should fail. |

**Suggested order:** if storage or battery looks tight, **move C1 (dips) earlier**. It is the one
exercise you specifically want, and it should not be the thing that gets cut.

**3 sets each**, normal working weight. Do not chase PRs — consistent, clean reps make better labels.

---

## 5. Per-set discipline — two habits that do all the work

**Before every set: the staging glance.** Look directly at the plate face / pin / dumbbell head for
**~2 seconds**, still and face-on.

This does two jobs at once:
- gives the weight-OCR path the one frame it can actually read (the KB is explicit that weight needs
  a still, face-on staging frame — never a mid-rep frame), and
- marks an unmistakable **set boundary** in the video.

**After every set: write the log line** (§6). Immediately — not at the end of the block, not from
memory in the car.

**Do not nod at t = 0.** The recorder's frame rate ramps 21.69 → 26.05 → 29.76 fps with jitter
falling 8.0 → 3.8 ms. A nod in the first seconds anchors alignment to the least reliable part of the
whole recording. Start, let it settle ~60 s, then nod.

---

## 6. Ground-truth log — the actual deliverable

Paper and pen in your gym bag. Phone notes work but you will be mid-set with sweaty hands.

```
SESSION 01   date ______  gym ______  rotation ______  band/rig notes ____________

blk  ex#  exercise                 set  reps  weight        notes
 A   A1   BB flat bench             1    __    ___ kg       ______________
 A   A1   BB flat bench             2    __    ___ kg       ______________
 A   A1   BB flat bench             3    __    ___ kg       ______________
 A   A2   BB incline bench          1    __    ___ kg       ______________
 ...
```

**Weight convention — be unambiguous**, this has bitten before:
- barbell: **write total including the bar**, and note the bar's weight separately
- dumbbells: **per dumbbell**, and say so
- cable stack: the number **at the pin**

Also note anything odd: a rep you cut short, a set where the band slipped, a machine someone walked
in front of. Those notes are what let you throw out one set instead of doubting the whole session.

---

## 7. Things that will go wrong, and what to do in the moment

| Symptom | Do this |
|---|---|
| Lens fogs / sweat on glass | Wipe with a microfibre between sets; expect it once you are warm |
| Camera drops out of ShenYao | Stop recording, re-seat OTG, restart the block. Note the break in the log |
| Band slips / camera droops | Tighten or re-tape. Note it — the framing before and after differ |
| Phone hot / throttling | Pause between blocks and let it cool; do not push through |
| Storage warning | End the block cleanly. **A clean short session beats a truncated long one** |
| Board feels hot | Stop. A dead camera ends the programme, not just the session |
| Someone asks what you are filming | See §9 |

**If the IMU drops (BLE gap):** the IronPal app records `seq_gaps` in `meta.json`. A gap > 2 s
invalidates that span for alignment — so **re-nod after any reconnection** to give the correlation a
fresh anchor.

---

## 8. Immediately after — before you leave the building

1. Check each of the three clips exists and has a plausible size.
2. Check `meta.json`: `partial: false`, `seq_gaps: 0`, `mtu ≥ 109`.
3. Photograph your paper log with your phone (paper gets lost/wet).

Then at the laptop:

```sh
adb pull /sdcard/DCIM/USBCamera/            input/kb/clips/session01/
adb pull /sdcard/Android/data/com.ironpal.poc/files/sessions/  input/kb/sessions/

# layer 1 alone — needs no video, tells you immediately if the IMU half is sound
python3 scripts/kb/sync_imu_video.py --session input/kb/sessions/<id> --clock-only

# full alignment, once per block
python3 scripts/kb/sync_imu_video.py --session input/kb/sessions/<id> \
    --video input/kb/clips/session01/IPS_<blockA>.mp4
```

**Expect:** drift around −50 ppm, `seq_gaps: 0`, correlation peak **well above 0.2** with sharpness
ratio **> 1.3**. A peak near 0.1 means the streams did not correlate — the alignment is guessed, not
measured, and the script will reject it.

> This is the **first end-to-end run of `sync_imu_video.py` against a genuinely simultaneous
> capture.** Its algorithm is verified against synthetic offsets and its clock fit is verified on real
> B2 data, but the full chain has never been exercised. If it misbehaves tomorrow, suspect the script
> before suspecting the session.

---

## 9. Filming other people — sort this out first

A 200° fisheye at head height captures most of the room, including strangers. In the EU that is
personal data.

- **Tell the gym staff what you are doing** before you start. A one-line explanation up front avoids
  a confrontation mid-set.
- **Prefer a quiet hour.** Fewer bystanders is better data *and* fewer problems.
- Do not publish or share raw session footage. It is training input, not content.
- If someone objects, stop recording. One exercise is not worth the relationship with your gym.

---

## 10. What success looks like

You do not need all nine exercises to call tomorrow a win.

- ✅ **Minimum:** the rig survives a full session, one block aligns with a sharp correlation peak, and
  the log matches the video.
- ✅ **Good:** all three blocks align; dips give a clean IMU rep signal; pushdown correctly abstains.
- ✅ **Excellent:** the above, plus at least one legible weight-plate staging frame per exercise.

**The most valuable outcome is not clean data — it is knowing exactly which of the nine exercises the
rig cannot handle.** An honest failure on the overhead extension is worth more than nine mediocre
clips, because it tells you where the sensor design has to change.
