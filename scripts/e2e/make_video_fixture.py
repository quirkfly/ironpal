#!/usr/bin/env python3
"""Derive the Studio's video fixtures from REAL knowledge-base clips (studio design §17).

## Why real footage, and what is added to it

The labeling studio is a video surface, so its e2e harness has to drive real video. The clips in
`input/kb/clips/` are the ones the knowledge base was built from — egocentric headband footage with
**human-confirmed ground truth** (exercise, reps, weight) recorded in `docs/video-analysis-kb/cases/`.
Each fixture below is a trimmed, un-rotated, downscaled copy of one of those clips, and it is paired
with the IMU fixture that `make_imu_fixtures.py` built from the *same* KB case — so a flow can assert
video and headband numbers that the same human confirmed on the same set.

Three things are done to the source, all of them documented per fixture in the sidecar meta:

1. **Un-rotate** so the footage is upright, then VERIFY it with the knowledge base's own orientation
   check (mat text reads forward, floor at the bottom). Note the caveat measured here: these A52
   clips carry a **Display Matrix of −90°** which current ffmpeg auto-applies on decode, so the
   decoded frames are already upright and `frame-extraction.md`'s `transpose=2` would rotate them a
   **second** time. Each fixture therefore declares `rotate` explicitly and the derived frame is
   checked, rather than inheriting a rule that predates autorotate.
2. **Trim** to the case's PERFORM window (from `motion_profile.sh`), because a 4K 68 s master is
   170 MB and the fixture has to live in the repo.
3. **Downscale to 360 px on the short side, re-encode H.264 with a 0.25 s GOP** — the same GOP the
   app's scrub proxy uses, so frame stepping in the flows behaves like frame stepping in the product.
   A small frame-index overlay is burned into the corner: the flows assert the app's own frame HUD,
   never the pixels, but a human watching a run needs to see which frame is on screen.

Source clips are gitignored (2 GB of footage); the derived fixtures are committed, so a checkout
without the clips still runs the suite. With `--synthetic` (or when no source clip is present) a
generated clip is written instead, and the meta says so — a fixture never claims to be real footage
it is not.

Usage:
  python3 scripts/e2e/make_video_fixture.py             # derive from the KB clips when present
  python3 scripts/e2e/make_video_fixture.py --synthetic # force the generated fallback
  python3 scripts/e2e/make_video_fixture.py --force     # re-derive even if the fixture exists
"""
import argparse
import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
CLIPS = ROOT / "input/kb/clips"
OUT = ROOT / "poc/mobile/e2e/fixtures"

FPS = 30
GOP = 8            # 0.25 s at 30 fps — the scrub proxy's keyframe interval (studio design §8.2)
SHORT_SIDE = 360

# One entry per fixture. `trim` is the PERFORM window from scripts/kb/motion_profile.sh; `rotate`
# is the rig's rotation from docs/video-analysis-kb/frame-extraction.md; `truth` is what a human
# confirmed in the case file, and it is what the paired IMU fixture reproduces.
FIXTURES = [
    {
        "name": "studio-clip",
        "source": "20260614_125114.mp4",
        "case": "001",
        "rig": "Galaxy A52 headband",
        # The container's -90 display matrix is auto-applied by ffmpeg, so the decoded frames are
        # already upright — verified with the KB's check (mat text forward, floor at the bottom).
        "rotate": None,
        "rotate_deg_in_source": -90,
        "trim": (30.0, 15.0),              # PERFORM window 30-70 s; 15 s keeps the fixture small
        "imu_fixture": "case001-curl-6reps",
        "truth": {
            "exercise": "dumbbell-biceps-curl",
            "exercise_name": "Dumbbell Biceps Curl",
            "reps": 6,
            "reps_note": "6 per arm, alternating (12 total lifts)",
            "weight_kg": 5.0,
            "weight_note": "2 x DOMYOS 2.5 kg plates per dumbbell; no handle mass",
            "rep_signal": "vision",
        },
    },
    {
        "name": "studio-clip-hard",
        "source": "20260615_122213.mp4",
        "case": "003",
        "rig": "Galaxy A52 headband",
        "rotate": None,
        "rotate_deg_in_source": -90,
        "trim": (20.0, 12.0),
        "imu_fixture": "case003-pushdown-5reps",
        "truth": {
            "exercise": "triceps-cable-pushdown",
            "exercise_name": "Triceps Cable Pushdown",
            "reps": 5,
            "reps_note": "axial stroke, head still — NOT vision-certifiable, and a headband cannot count it",
            "weight_kg": 10.0,
            "weight_note": "4 x 1.25 kg per side; lever rig, so plate mass != working weight",
            "rep_signal": "hard",
        },
    },
]

OVERLAY = (
    "drawbox=x=0:y=0:w=iw:h=42:color=0x0B0E12@0.75:t=fill,"
    "drawtext=text='f %{n}':x=10:y=6:fontsize=26:fontcolor=white"
)


def probe(path: pathlib.Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames",
         "-show_entries", "stream=width,height,nb_read_frames,codec_name",
         "-show_entries", "format=duration", "-of", "json", str(path)],
        check=True, capture_output=True, text=True)
    d = json.loads(out.stdout)
    s = d["streams"][0]
    return {
        "width": int(s["width"]), "height": int(s["height"]),
        "frames": int(s["nb_read_frames"]), "codec": s["codec_name"],
        "duration_s": round(float(d["format"]["duration"]), 3),
    }


def encode(src: pathlib.Path, dst: pathlib.Path, vf: str, start: float | None, dur: float | None) -> None:
    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    if start is not None:
        cmd += ["-ss", str(start)]
    cmd += ["-i", str(src)]
    if dur is not None:
        cmd += ["-t", str(dur)]
    cmd += [
        "-vf", vf, "-r", str(FPS),
        "-c:v", "libx264", "-profile:v", "baseline", "-pix_fmt", "yuv420p",
        "-g", str(GOP), "-keyint_min", str(GOP), "-sc_threshold", "0",
        "-crf", "30", "-an", "-movflags", "+faststart", str(dst),
    ]
    subprocess.run(cmd, check=True)


def derive_real(spec: dict) -> dict:
    src = CLIPS / spec["source"]
    dst = OUT / f"{spec['name']}.mp4"
    src_info = probe(src)
    # Un-rotate FIRST (frame-extraction.md step 0), then scale the short side, then the overlay.
    steps = []
    if spec["rotate"]:
        steps.append(spec["rotate"])
    # Short side to SHORT_SIDE, keeping the aspect: portrait keeps width, landscape keeps height.
    steps.append(f"scale='if(gt(iw,ih),-2,{SHORT_SIDE})':'if(gt(iw,ih),{SHORT_SIDE},-2)'")
    steps.append(OVERLAY)
    vf = ",".join(steps)
    start, dur = spec["trim"]
    encode(src, dst, vf, start, dur)
    info = probe(dst)
    return {
        "kind": "real",
        "source_clip": spec["source"],
        "source_info": src_info,
        "kb_case": spec["case"],
        "case_file": f"docs/video-analysis-kb/cases/{spec['case']}-{spec['source'].replace('.mp4', '')}.md",
        "rig": spec["rig"],
        "rotation_applied": spec["rotate"] or "none (display matrix auto-applied on decode)",
        "rotation_deg_in_source": spec["rotate_deg_in_source"],
        "orientation_check": "mat text reads forward, floor at the bottom (frame-extraction.md)",
        "trim_start_s": start,
        "trim_duration_s": dur,
        "overlay": "frame index burned in at derivation (not present in the source)",
        "imu_fixture": spec["imu_fixture"],
        "ground_truth": spec["truth"],
        **info,
        "fps": FPS,
        "gop": GOP,
    }


def derive_synthetic(spec: dict) -> dict:
    """Fallback when the source clip is absent: a generated clip that never claims to be real."""
    dst = OUT / f"{spec['name']}.mp4"
    dur = spec["trim"][1]
    vf = (
        "drawbox=x=0:y=0:w=iw:h=ih:color=0x0B0E12:t=fill,"
        "drawbox=x='mod(t*210\\,360)':y=200:w=40:h=120:color=0x58A6FF:t=fill,"
        + OVERLAY + ","
        "drawtext=text='SYNTHETIC — KB clip not present':x=10:y=ih-30:fontsize=16:fontcolor=gray"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
         "-i", f"color=c=black:s={SHORT_SIDE}x640:r={FPS}:d={dur}", "-vf", vf,
         "-c:v", "libx264", "-profile:v", "baseline", "-pix_fmt", "yuv420p",
         "-g", str(GOP), "-keyint_min", str(GOP), "-sc_threshold", "0",
         "-crf", "30", "-an", "-movflags", "+faststart", str(dst)],
        check=True)
    info = probe(dst)
    return {
        "kind": "synthetic",
        "why": f"{spec['source']} not found in input/kb/clips/ (gitignored); generated instead",
        "imu_fixture": spec["imu_fixture"],
        "ground_truth": spec["truth"],
        **info, "fps": FPS, "gop": GOP,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--synthetic", action="store_true", help="force the generated fallback")
    ap.add_argument("--force", action="store_true", help="re-derive even when the fixture exists")
    args = ap.parse_args()

    if not shutil.which("ffmpeg"):
        print("ffmpeg not found", file=sys.stderr)
        return 2
    OUT.mkdir(parents=True, exist_ok=True)

    for spec in FIXTURES:
        dst = OUT / f"{spec['name']}.mp4"
        meta_path = OUT / f"{spec['name']}.meta.json"
        if dst.exists() and not args.force:
            print(f"{dst.name}: already present ({dst.stat().st_size // 1024} KB) — use --force to re-derive")
            continue
        src = CLIPS / spec["source"]
        if args.synthetic or not src.exists():
            meta = derive_synthetic(spec)
        else:
            meta = derive_real(spec)
        meta_path.write_text(json.dumps(meta, indent=1, ensure_ascii=False) + "\n")
        print(f"{dst.name}: {meta['kind']} · {meta['frames']} frames · {meta['width']}x{meta['height']} · "
              f"{dst.stat().st_size // 1024} KB · truth {meta['ground_truth']['exercise']} "
              f"{meta['ground_truth']['reps']} reps {meta['ground_truth']['weight_kg']} kg")
    return 0


if __name__ == "__main__":
    sys.exit(main())
