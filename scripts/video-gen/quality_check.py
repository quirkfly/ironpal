#!/usr/bin/env python3
"""Post-generation quality validation for generated video clips.

Usage:
    python quality_check.py
    python quality_check.py --input output/
    python quality_check.py --input output/S4a/
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path


def get_video_info(path: Path) -> dict | None:
    """Get video metadata using ffprobe."""
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "quiet",
                "-print_format", "json",
                "-show_format", "-show_streams",
                str(path),
            ],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode != 0:
            return None
        return json.loads(result.stdout)
    except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
        return None


def check_video(path: Path) -> dict:
    """Run quality checks on a single video file."""
    issues = []
    info = {}

    # Check file size
    size = path.stat().st_size
    info["file_size_bytes"] = size
    info["file_size_kb"] = round(size / 1024)
    if size < 100_000:  # < 100KB
        issues.append(f"File too small ({size / 1024:.0f} KB) — possibly corrupt")

    # Get video metadata via ffprobe
    probe = get_video_info(path)
    if probe is None:
        # If ffprobe isn't available, do basic file-type check
        try:
            with open(path, "rb") as f:
                header = f.read(12)
            if b"ftyp" in header:
                info["format"] = "MP4 (header ok)"
                return {"path": str(path), "info": info, "issues": issues, "ok": True}
        except Exception:
            pass
        issues.append("ffprobe failed — file may be corrupt or ffprobe not installed")
        return {"path": str(path), "info": info, "issues": issues, "ok": False}

    # Extract video stream info
    video_streams = [
        s for s in probe.get("streams", [])
        if s.get("codec_type") == "video"
    ]
    if not video_streams:
        issues.append("No video stream found")
        return {"path": str(path), "info": info, "issues": issues, "ok": False}

    vs = video_streams[0]
    width = vs.get("width", 0)
    height = vs.get("height", 0)
    codec = vs.get("codec_name", "unknown")
    info["resolution"] = f"{width}x{height}"
    info["codec"] = codec

    # Check resolution
    if width < 1280 or height < 720:
        issues.append(f"Resolution {width}x{height} below 720p minimum")

    # Check codec
    if codec not in ("h264", "h265", "hevc", "vp9", "av1"):
        issues.append(f"Unexpected codec: {codec}")

    # Check duration
    duration_str = probe.get("format", {}).get("duration")
    if duration_str:
        duration = float(duration_str)
        info["duration_seconds"] = round(duration, 1)
        if duration < 2.0:
            issues.append(f"Duration {duration:.1f}s is very short")
    else:
        issues.append("Could not determine duration")

    return {
        "path": str(path),
        "info": info,
        "issues": issues,
        "ok": len(issues) == 0,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Quality check generated video clips"
    )
    parser.add_argument(
        "--input", default="output/",
        help="Directory containing generated clips (default: output/)"
    )
    args = parser.parse_args()

    input_dir = Path(args.input)
    if not input_dir.exists():
        print(f"Directory not found: {input_dir}")
        sys.exit(1)

    videos = sorted(input_dir.rglob("*.mp4"))
    if not videos:
        print(f"No .mp4 files found in {input_dir}")
        sys.exit(1)

    print(f"Checking {len(videos)} video files in {input_dir}\n")

    results = []
    ok_count = 0
    issue_count = 0

    for video_path in videos:
        result = check_video(video_path)
        results.append(result)

        rel_path = video_path.relative_to(input_dir)
        info = result["info"]
        resolution = info.get("resolution", "???")
        duration = info.get("duration_seconds", "?")
        size_kb = info.get("file_size_kb", 0)

        if result["ok"]:
            print(f"  OK   {rel_path}  ({resolution}, {duration}s, {size_kb} KB)")
            ok_count += 1
        else:
            print(f"  FAIL {rel_path}  ({resolution}, {duration}s, {size_kb} KB)")
            for issue in result["issues"]:
                print(f"       - {issue}")
            issue_count += 1

    print(f"\n{'='*60}")
    print(f"Results: {ok_count} OK, {issue_count} issues out of {len(videos)} files")

    if issue_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
