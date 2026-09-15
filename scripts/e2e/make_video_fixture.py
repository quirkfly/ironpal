#!/usr/bin/env python3
"""Build the Studio's deterministic video fixture for the Maestro e2e harness (studio design §17).

Frame navigation cannot be asserted on real footage (which frame is "f 373"?), so the fixture
is a synthetic clip with the FRAME NUMBER burned into every frame: 20 s, 640×360, 30 fps,
H.264 with a keyframe every 8 frames (the same GOP the scrub proxy uses), no audio.

The flows never OCR the video; they assert the Studio's own frame HUD (`studio-frame`), which
is computed from the clip's PTS table. The burned-in counter is for a human watching the run.

Usage:
  python3 scripts/e2e/make_video_fixture.py        # writes poc/mobile/e2e/fixtures/studio-clip.mp4
"""
import json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "poc/mobile/e2e/fixtures"
CLIP = OUT / "studio-clip.mp4"
SYNC = OUT / "studio-clip.sync.json"

DURATION_S = 20
FPS = 30
GOP = 8


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    # A slow horizontal gradient sweep plus the counter: enough pixel change per frame that a
    # motion-energy pass (ClipModule.motionEnergy) sees something, tiny file.
    vf = (
        "drawbox=x=0:y=0:w=iw:h=ih:color=0x0B0E12:t=fill,"
        "drawbox=x='mod(t*210\\,640)':y=120:w=40:h=120:color=0x58A6FF:t=fill,"
        "drawtext=text='f %{n}':x=20:y=20:fontsize=48:fontcolor=white,"
        "drawtext=text='IronPal e2e studio-clip':x=20:y=320:fontsize=20:fontcolor=gray"
    )
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "lavfi", "-i", f"color=c=black:s=640x360:r={FPS}:d={DURATION_S}",
        "-vf", vf,
        "-c:v", "libx264", "-profile:v", "baseline", "-pix_fmt", "yuv420p",
        "-g", str(GOP), "-keyint_min", str(GOP), "-sc_threshold", "0",
        "-b:v", "1200k", "-an", "-movflags", "+faststart",
        str(CLIP),
    ]
    subprocess.run(cmd, check=True)
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames,r_frame_rate",
         "-of", "json", str(CLIP)], check=True, capture_output=True, text=True)
    info = json.loads(probe.stdout)["streams"][0]
    frames = int(info["nb_read_frames"])
    SYNC.write_text(json.dumps({
        "note": "PTS 0 of the clip = tStartNs of the set it is attached to; the app sets pts0HostNs itself.",
        "rate": 1.0, "residual_ms": 0, "frames": frames, "fps": FPS, "gop": GOP, "duration_s": DURATION_S,
    }, indent=1) + "\n")
    print(f"wrote {CLIP} ({CLIP.stat().st_size // 1024} KB, {frames} frames) and {SYNC.name}")
    if frames != DURATION_S * FPS:
        print(f"warning: expected {DURATION_S * FPS} frames, got {frames}", file=sys.stderr)


if __name__ == "__main__":
    main()
