---
name: plot-sensors
description: Plot the IMU sensor data captured for a specific IronPal exercise session as a polished, on-brand figure (per-axis accelerometer + gyroscope traces, dominant-axis rep detection with cadence, and a summary). Use when the user wants to visualize, plot, chart, or "see" the sensor/IMU/accelerometer data for a workout session or enrollment take, or invokes `/plot-sensors`.
---

Render the accelerometer (+ optional gyroscope) stream for **one** IronPal exercise session into a single, visually appealing PNG, then show it to the user.

This is for the IronPal POC (`poc/`), whose head-mounted device records IMU during a set (design `docs/ironpal-poc-v1-design.md` §5). Bulgarian split squat is IMU-led (clear vertical oscillation); triceps cable pushdown is vision-led (head IMU stays ~flat) — the plot makes that contrast obvious.

## Tool
`python3 .claude/skills/plot-sensors/plot_sensors.py <input> [--out PATH] [--sample-rate HZ]`
(uses system `python3` + matplotlib/numpy — no extra install).

## Steps

1. **Find the session's sensor data.** Accepts (auto-detected):
   - **JSON object**: `{"exercise":"bulgarian_split_squat","session_id":"…","sample_rate_hz":50,"has_gyro":true,"samples":[{"t":0.02,"ax":…,"ay":…,"az":…,"gx":…,"gy":…,"gz":…}, …]}`
   - **JSON rows**: `[[t,ax,ay,az(,gx,gy,gz)], …]` or `[[ax,ay,az], …]` (pass `--sample-rate`)
   - **JSON `number[][]`** — the backend template `imu_series` shape (pass `--sample-rate`)
   - **CSV** with a header containing `t/ax/ay/az(/gx/gy/gz)` (order-independent; also accepts `time,x,y,z,…`)

   Where to get it for a real session:
   - **Backend template** (`poc/backend`): a founder enrollment take's resampled window —
     `GET /api/v1/templates/sync` returns `imu_series` per take; save one take's array to a `.json` and pass it (with `--sample-rate`).
   - **Founder debug capture** (decision D3): `debug_captures.imu_raw` in Postgres for a founder session.
   - **A device/app export** of the raw window for the set.

   If the user hasn't pointed you at a file, ask which session — or use `--demo` to show the format/output.

2. **Run the plotter**, e.g.:
   - Real file: `python3 .claude/skills/plot-sensors/plot_sensors.py /path/session.json --out /tmp/ironpal_session.png`
   - Backend `number[][]`: add `--sample-rate 50`
   - Demo (no data yet): `python3 .claude/skills/plot-sensors/plot_sensors.py --demo bulgarian_split_squat --out /tmp/ironpal_demo.png` (or `--demo triceps_pushdown`)

3. **Show the PNG** to the user (Read the output path so it renders) and summarize the printed JSON: estimated reps, cadence (Hz / per-min), duration, sample count, gyro presence. Note whether the IMU was conclusive (clear cadence) or flat (→ vision-led, expected for isolation moves like the pushdown).

## What the figure shows
- **Accelerometer — per axis** (ax/ay/az).
- **Rep detection — dominant signed axis**: gravity-removed dominant axis with detected rep peaks numbered + cadence; or a "head IMU ~flat → vision-led" note when there's no clear cycle. (Counts on the dominant *signed* axis, not vector magnitude, to avoid `|sin|` frequency-doubling — design §5.)
- **Gyroscope — per axis** (only when gyro is present — decision D5).
- Styled in the IronPal "Stealth Teal" palette (`docs/color-schemes.md`).

## Notes
- One session per call. For comparisons, run it per session and present the PNGs side by side.
- If `--sample-rate` is unknown and absent from the data, it defaults to 50 Hz (the POC's canonical rate).
