# IronPal headband IMU firmware

Arduino Nano 33 BLE **Rev2** (nRF52840 + BMI270 + BMM150). Streams 6-axis IMU over BLE to the
companion app in [`poc/mobile`](../mobile), which logs it alongside the ELP camera's video for
post-hoc alignment.

**Spec:** [`docs/ironpal-imu-camera-sync-plan.md`](../../docs/ironpal-imu-camera-sync-plan.md) §2 ·
**Decisions:** [`..._grilled.md`](../../docs/ironpal-imu-camera-sync-plan_grilled.md) Q1, Q3, Q7

## Status

| Milestone | State |
|---|---|
| B0 board bring-up | ✅ **done 2026-08-05** — flashed and running; IMU initialises; **measured 99.84 Hz** accel + gyro (36 % flash, 27 % RAM) |
| B1 BLE streaming | ✅ **done 2026-08-05** — 10-min exit run PASS: 4502 packets / 36016 samples, **0 seq gaps**, 60.04 Hz, dt jitter sd 250 µs |
| B2 Android backend | ✅ **done 2026-08-05** — end-to-end on a Galaxy A52: **MTU 247**, 0 seq gaps, 59.9 Hz, `imu.jsonl` + `meta.json` written, session stops cleanly |

### B2 — what exists

Implemented in [`poc/mobile`](../mobile): `BleImuSource.kt` (scan → connect → MTU → config →
notify → parse), `ImuSessionLogger.kt` (`imu.jsonl` + `meta.json`, both clocks), and
`ImuForegroundService.kt` (survives screen-off). Selected by the rig flag `IRONPAL_IMU_SOURCE=BLE`;
unset means `PHONE`, so POC v1 is unchanged.

The BLE samples are pushed into the *same* ring buffer the phone IMU fills, which is why no DSP
changed: `ImuPipeline.snapshot()` already resamples by **measured** rate to the 50 Hz canonical rate,
so 60 → 50 needs no code that knows about 60.

Two conversions happen at ingest, and they are not cosmetic — the phone path supplies
`TYPE_LINEAR_ACCELERATION` (m/s², **gravity removed**) while the BMI270 reports total acceleration in
g. So `BleImuSource` converts g → m/s² and dps → rad/s, and subtracts a slow-EMA gravity estimate
(fc ≈ 0.1 Hz, an octave below the 0.2 Hz rep band). Feeding raw values would be a *semantic* mismatch,
not just a scale error, and would surface only as quietly mistuned thresholds much later.

**Measured on a Galaxy A52 (SM-A525F, Android 14), headband streaming live:**

| Check | Result |
|---|---|
| **ATT MTU** | **247 B** — comfortably over the 109 B floor, so no truncation |
| `seq` gaps | **0** over 408 packets / 3264 samples |
| Effective rate | 59.86 Hz from `dt_us` (sd 282 µs), 60.18 samples/s wall-clock |
| Saturated values | 0 |
| `|accel|` at rest | **0.985 g** — confirms the g→m/s² scaling and gravity handling |
| Session stop | `imu.jsonl` stops growing, `meta.json` flips to `partial: false` |

This also settled the **FSR question** left open below: the config characteristic reports
**±8 g / ±1000 dps**, matching grill Q3's target, so the Bosch library defaults are correct as-is.

### ⚠️ The two clocks drift ~53 ppm — a single offset is NOT enough

Regressing `device_ts_us` against `host_ns` over a 44 s capture:

- slope 0.999947 → **−52.8 ppm**, i.e. **≈ −206 ms over a 65 min session**
- residual sd **15.9 ms** (min −26 ms, max +67 ms) — this is BLE notification jitter, not clock error

−206 ms is **5× the < 40 ms alignment budget**, so ingest must fit a *linear* `device → host` model
per session rather than applying one constant offset. Nothing is broken — this is exactly the failure
that logging both clocks exists to catch, and it is correctable precisely because both are recorded.
`scripts/kb/sync_imu_video.py` (B4) must do this fit; the naive endpoint difference is not usable
because endpoint jitter alone (±67 ms) swamps it.

### Two bugs this run caught, both fixed

- **Double `connectGatt`.** `stopScan` is asynchronous, so a second advertisement landed in
  `onScanResult` before it took effect and a second GATT client was opened. Now claimed once under a
  lock.
- **Session kept streaming after "End set".** Teardown awaited several stops in sequence, so one
  throwing left BLE connected and `imu.jsonl` growing after the set had visibly ended. Each step is
  now independently guarded.

**Still unverified:** screen-off survival across a full 65 min session (the foreground service is in
place but has only been exercised over minutes).

## Build

`arduino-cli` installs to `~/.local/bin`; add it to `PATH` if it isn't already.

```sh
export PATH="$HOME/.local/bin:$PATH"

# one-time
arduino-cli core install arduino:mbed_nano
arduino-cli lib install ArduinoBLE Arduino_BMI270_BMM150

arduino-cli compile -b arduino:mbed_nano:nano33ble poc/firmware/ironpal_imu

# Find the port -- do NOT hardcode ttyACM0. Numbering depends on plug order, and
# an attached Android phone also claims a ttyACM slot (it took ACM0 here, leaving
# the Nano on ACM1).
PORT=$(arduino-cli board list | awk '/nano33ble/{print $1; exit}')
arduino-cli upload -b arduino:mbed_nano:nano33ble -p "$PORT" poc/firmware/ironpal_imu
```

### Before the first upload

- **Cable: USB-A (or USB-C) to Micro-USB / Micro-B — and it must be a DATA cable.**
  The Nano 33 BLE Rev2 has a **Micro-B** socket, not USB-C (only the newer Nano ESP32 is USB-C).
  The USB-C in `ironpal-imu-poc-integration-plan.md` is the *future custom PCB's* connector.
  **Charge-only Micro-USB cables are extremely common** (the ones bundled with power banks and
  cheap chargers usually omit the data lines). Symptom: the board's power LED lights but no
  `/dev/ttyACM*` appears and `lsusb` shows no `2341:` device. If that happens, suspect the cable
  before the board.
- **Plug the Nano in.** `/dev/ttyACM0` is currently the *Samsung phone* (MTP), not the board —
  check `udevadm info -q property -n /dev/ttyACM0 | grep ID_VENDOR` before assuming a port is the
  Arduino.
- **Add yourself to `dialout`**, or uploads fail on permissions:
  `sudo usermod -aG dialout $USER` — then **log out and back in** (group membership is applied at
  login, so it does not affect the current shell).
  For an immediate, single-session fix without logging out: `sudo chmod a+rw /dev/ttyACM<n>` —
  note this is lost when the board is replugged.

  Symptom when this is missing: `arduino-cli board list` **does** identify the board, but upload
  fails with `No device found on ttyACM<n>`. That is misleading — the uploader performs a 1200 bps
  "touch" to reset the board into its bootloader, and the touch itself needs write access. The
  board is fine; the permission is not.

## Wire format

Notification payload, 104 B, little-endian throughout (plan §2.1):

Notification payload is **106 B**:

| Offset | Size | Field |
|---|---|---|
| 0 | 2 | `seq` — uint16, wraps; gaps reveal dropped notifications |
| 2 | 4 | `device_ts_us` — `micros()` of the **first** sample in the packet |
| 6 | 1 | `n` — samples in packet (8) |
| 7 | 1 | `odr_hz` — nominal (100). **Sanity-check only — do not place samples with it.** |
| 8 | 2 | `dt_us` — **measured** mean spacing in this packet. Use this. |
| 10 | 96 | 8 × `{ax ay az gx gy gz}` as int16 |

Sample *i* sits at `device_ts_us + i × dt_us`.

### Sample rate is 60 Hz, not 100 — measured, and it overrides the plan

Benchmarked on hardware with BLE idle, isolating sensor cost from BLE cost:

| Read path | samples/s | Implies |
|---|---|---|
| `available()` + read accel + read gyro | 58 | — |
| read accel + read gyro | ~66 | `available()` ≈ 2 ms |
| read accel only | ~130 | **each read ≈ 7.7 ms** |

Two conclusions. **The sensor is not the bottleneck** — it reports 99.84 Hz and every poll found
data already waiting (`got == polls`). The bottleneck is **I2C transaction cost through
`Arduino_BMI270_BMM150`**, at ~7.7 ms per read. And the `available()` check was pure overhead, so
it is gone: we now sample well below the sensor's rate, making every read fresh by construction.

**60 Hz** was chosen for ~10 % headroom over the ~66 Hz ceiling while still clearing the 50 Hz
canonical rate the DSP consumes. This supersedes grill Q3's "100 Hz logged"; the decision's intent
(log above canonical, resample down) survives — only the number changed.

**Route to 100 Hz if it is ever needed:** the BMI270's **FIFO**, which returns many samples per bus
transaction instead of one. `Arduino_BMI270_BMM150` does not expose it, so that means dropping to
the Bosch driver directly. Not worth it unless form analysis later demands the resolution.

### Why `dt_us` exists — measured, not theoretical

**The BMI270 runs at 99.84 Hz, not 100.** Bring-up confirmed this on hardware. The first version of
this firmware polled on a 100 Hz `micros()` schedule and, when the sensor had no new data (which
happens roughly every 6 s at that rate mismatch), skipped the read **but still advanced the
schedule** — silently losing a sample while the packet continued to claim *n* evenly-spaced ones.
That is a slow, invisible timing error, exactly the kind the < 40 ms alignment budget cannot absorb.

Fixed two ways: the schedule now only advances when a sample was actually taken, and each packet
carries its **own measured spacing** rather than an assumed `1/odr_hz`.

**Scales are fixed by this firmware and advertised in the config characteristic**, rather than
forwarding raw sensor LSB whose meaning depends on a library-internal range setting:

- accel `0.001 g/LSB` → int16 spans ±32.7 g
- gyro `0.0625 dps/LSB` → int16 spans ±2047 dps

### ⚠️ `device_ts_us` wraps every 71.6 minutes — the host parser must handle it

`micros()` is uint32, so it rolls over at 2³² µs = **71.6 min**, and it counts from **board power-on,
not from connect**. A 65-minute session capped by phone storage fits inside one wrap window *only if
the board was powered on recently*. Leave the unit on between two sessions and a wrap will land
mid-capture.

The host-side parser must therefore be wrap-aware: `seq` is monotonic and `odr_hz` is known, so a
backwards jump in `device_ts_us` is unambiguously a wrap and not a reordering. Do not assume
monotonic timestamps.

## BLE service

Local name `IronPal-IMU`. UUIDs must stay in sync with the Kotlin backend in `poc/mobile`.

| Characteristic | UUID suffix | Props | Purpose |
|---|---|---|---|
| IMU data | `…a001` | notify | the packet above |
| Control | `…a002` | write | non-zero = stream, zero = pause |
| Config | `…a003` | read | ODR, samples/packet, scales, FSR, firmware version |

Connection interval is requested at **7.5–15 ms**: longer intervals batch notifications and add
latency jitter, which widens alignment uncertainty directly.

## Design notes worth not re-litigating

- **`micros()`, never `millis()`.** 1 ms resolution would be a quarter of the whole 40 ms alignment
  budget.
- **Ring buffer, never silent drops.** On BLE backpressure samples are buffered; genuine loss is
  surfaced through `seq` so the host can invalidate rather than interpolate. A silent gap becomes an
  invisible time shift downstream.
- **Clipping is counted.** Saturated samples are tallied and reported on disconnect — clipped data is
  a difference *in kind* from unclipped
  ([`ironpal-poc-to-production-transfer.md`](../../docs/ironpal-poc-to-production-transfer.md) §4.2),
  so it must be visible rather than trained on.
- **Schedule resynchronises if it falls behind.** If the BLE stack steals enough time to put sampling
  more than 4 periods late, the schedule resets rather than emitting a catch-up burst of
  wrongly-timed samples.
- **Wrong library is the classic Rev2 failure.** `Arduino_BMI270_BMM150`, not `Arduino_LSM9DS1`.

## Not yet verified on hardware

Everything below needs the board in hand — flagged rather than assumed:

- ~~Whether the Bosch library's default accel/gyro **FSR** matches the ±8 g / ±1000 dps target from
  grill Q3~~ — **verified in B2: the config characteristic reports ±8 g / ±1000 dps.** Original note
  kept for context:  The library exposes floats in g/dps and does not surface range configuration directly;
  if the defaults differ, subclass `BoschSensorClass` and override `configure_sensor()`. The
  quantisation scales above are independent of this, but the **clipping behaviour is not**.
- ~~Actual achieved ODR~~ — **verified: 99.84 Hz** accel and gyro.
- ~~Sustained throughput over 10 minutes~~ — **PASS**: 599.8 s, 0 seq gaps, 60.04 Hz, sd 250 µs
  (identical to the 60 s run, so the link is stable over time rather than degrading).
- ~~**MTU negotiation reaching ≥ 106 B on the *phone*.**~~ — **verified: Android negotiated 247 B**
  on a Galaxy A52, full packets parsed, 0 seq gaps.
- ~~Whether `dt_us` stays stable~~ — **sd 252 µs** at 60 Hz (min 16017, max 17386). It was sd
  2086 µs before the availability-check fix, so this is the metric that showed the fix worked.
