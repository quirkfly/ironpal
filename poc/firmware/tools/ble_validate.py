#!/usr/bin/env python3
"""B1 validation — connect to the IronPal headband IMU and audit the stream.

Milestone B1's exit criterion (docs/ironpal-imu-camera-sync-plan.md §9): packets
received with **no `seq` gaps over 10 minutes**. This tool is what decides that,
and it doubles as the reference implementation of the wire format for the Kotlin
`ImuModule` backend in poc/mobile -- if the two disagree, this one is right.

What it checks, and why each matters:
  * `seq` continuity      -- a gap is dropped data. The firmware never drops
                             silently (it ring-buffers), so a gap here means the
                             BLE link lost notifications and the session's
                             alignment is suspect.
  * `dt_us` distribution  -- the firmware measures its own inter-sample spacing
                             rather than assuming 1/ODR, because the BMI270 runs
                             at 99.84 Hz not 100. Drift or spread here is the
                             signal that the BLE stack is stealing sampling time.
  * uint32 wrap           -- `device_ts_us` is micros(), which rolls over every
                             71.6 min and counts from board power-on, not from
                             connect. A backwards jump is a wrap, not reordering.
  * saturation            -- clipped samples are a difference *in kind* from
                             unclipped (poc-to-production-transfer §4.2), so they
                             must be counted, never quietly trained on.

Usage:
    python3 poc/firmware/tools/ble_validate.py --seconds 60      # smoke test
    python3 poc/firmware/tools/ble_validate.py --seconds 600     # B1 exit criterion
"""
import argparse
import asyncio
import statistics
import struct
import sys
import time

from bleak import BleakClient, BleakScanner

DEVICE_NAME = "IronPal-IMU"
CHR_IMU    = "6e40a001-b5a3-f393-e0a9-e50e24dcca9e"
CHR_CONFIG = "6e40a003-b5a3-f393-e0a9-e50e24dcca9e"

HEADER_BYTES = 10
AXES = 6
INT16_MIN, INT16_MAX = -32768, 32767


class StreamAudit:
    def __init__(self):
        self.packets = 0
        self.samples = 0
        self.seq_gaps = []          # (expected, got)
        self.wraps = 0
        self.saturated = 0
        self.dt_us = []
        self.prev_seq = None
        self.prev_ts = None
        self.first_wall = None
        self.last_wall = None

    def feed(self, data: bytes):
        now = time.monotonic()
        if self.first_wall is None:
            self.first_wall = now
        self.last_wall = now

        if len(data) < HEADER_BYTES:
            return
        seq, ts_us, n, odr_hz, dt = struct.unpack_from("<HIBBH", data, 0)

        # --- seq continuity (uint16, wraps at 65536) ---
        if self.prev_seq is not None:
            expected = (self.prev_seq + 1) & 0xFFFF
            if seq != expected:
                self.seq_gaps.append((expected, seq))
        self.prev_seq = seq

        # --- device_ts_us wrap detection ---
        # A backwards jump is unambiguously a uint32 rollover: seq is monotonic
        # and packets arrive in order, so it cannot be reordering.
        if self.prev_ts is not None and ts_us < self.prev_ts:
            self.wraps += 1
        self.prev_ts = ts_us

        if dt:
            self.dt_us.append(dt)

        # --- payload ---
        want = HEADER_BYTES + n * AXES * 2
        if len(data) < want:
            return
        vals = struct.unpack_from("<%dh" % (n * AXES), data, HEADER_BYTES)
        self.saturated += sum(1 for v in vals if v == INT16_MAX or v == INT16_MIN)
        self.samples += n
        self.packets += 1

    def report(self, cfg):
        dur = (self.last_wall - self.first_wall) if self.first_wall else 0.0
        print("\n" + "=" * 66)
        print(f"  duration          : {dur:8.1f} s")
        print(f"  packets           : {self.packets:8d}   ({self.packets/dur:.2f}/s)" if dur else "")
        print(f"  samples           : {self.samples:8d}   ({self.samples/dur:.2f}/s effective ODR)" if dur else "")
        if self.dt_us:
            print(f"  dt_us  mean/sd    : {statistics.mean(self.dt_us):8.1f} / "
                  f"{statistics.pstdev(self.dt_us):.1f} us "
                  f"-> {1e6/statistics.mean(self.dt_us):.2f} Hz")
            print(f"  dt_us  min/max    : {min(self.dt_us):8d} / {max(self.dt_us)} us")
        print(f"  uint32 ts wraps   : {self.wraps:8d}")
        print(f"  saturated values  : {self.saturated:8d}")
        print(f"  SEQ GAPS          : {len(self.seq_gaps):8d}   <-- B1 exit criterion: must be 0")
        for exp, got in self.seq_gaps[:5]:
            lost = (got - exp) & 0xFFFF
            print(f"      expected {exp}, got {got}  (~{lost} packet(s) lost)")
        if len(self.seq_gaps) > 5:
            print(f"      ... and {len(self.seq_gaps)-5} more")
        print("=" * 66)

        ok = not self.seq_gaps and self.packets > 0
        print("  B1 VERDICT: " + ("PASS" if ok else "FAIL"))
        return 0 if ok else 1


def decode_config(raw: bytes):
    if len(raw) < 10:
        return None
    odr, n, a_scale, g_scale, a_fsr, g_fsr100, major, minor = struct.unpack_from(
        "<BBHHBBBB", raw, 0)
    return {
        "odr_hz": odr, "samples_per_pkt": n,
        "accel_scale_g_per_lsb": a_scale / 1e6,
        "gyro_scale_dps_per_lsb": g_scale / 1e4,
        "accel_fsr_g": a_fsr, "gyro_fsr_dps": g_fsr100 * 100,
        "firmware": f"{major}.{minor}",
    }


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seconds", type=float, default=60.0)
    ap.add_argument("--name", default=DEVICE_NAME)
    args = ap.parse_args()

    print(f"scanning for {args.name} ...")
    dev = await BleakScanner.find_device_by_name(args.name, timeout=20.0)
    if dev is None:
        sys.exit(f"not found: {args.name}. Is the board powered and advertising?")
    print(f"found {dev.address}")

    audit = StreamAudit()
    async with BleakClient(dev) as client:
        print(f"connected (mtu={getattr(client, 'mtu_size', '?')})")

        cfg = None
        try:
            cfg = decode_config(await client.read_gatt_char(CHR_CONFIG))
            print("config:", cfg)
        except Exception as e:
            print("config read failed:", e)

        await client.start_notify(CHR_IMU, lambda _h, d: audit.feed(d))
        print(f"streaming for {args.seconds:.0f}s ...")
        await asyncio.sleep(args.seconds)
        await client.stop_notify(CHR_IMU)

    return audit.report(cfg)


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
