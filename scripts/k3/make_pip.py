#!/usr/bin/env python3
"""Cut a K3 take down to the PIP length by keeping the taps and dropping Maestro's latency.

The capture is honest but slow: Maestro takes about five seconds between commands, so a
thirty-second take holds seven seconds of actual interaction and twenty-three of frozen
screen. Speeding the whole thing up 5x looks like a fast-forward. Keeping a short window
around each change and concatenating them reads as someone entering numbers briskly, which
is what the shot is of.

Event detection is ffmpeg's freezedetect: every freeze_end is the instant the screen started
moving again, i.e. a tap landing or a digit appearing.

  scripts/k3/make_pip.py input.mp4 output.mp4 [target_seconds]
"""
import re, subprocess, sys, shutil

def freeze_ends(path, thresh="-55dB", dur=0.7):
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", path, "-vf", f"freezedetect=n={thresh}:d={dur}",
         "-map", "0:v", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    return [float(m) for m in re.findall(r"freeze_end: ([\d.]+)", out)]

def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    src, dst = sys.argv[1], sys.argv[2]
    target = float(sys.argv[3]) if len(sys.argv) > 3 else 6.4
    if not shutil.which("ffmpeg"):
        sys.exit("k3: ffmpeg not found")

    ev = freeze_ends(src)
    if not ev:
        sys.exit("k3: no tap events found — is the take static?")
    # Lead with the untouched log. freezedetect only reports moments of CHANGE, so the very
    # first thing the shot needs — three rows sitting there with an empty weight field, which
    # is what the line is about — is not an event and has to be added by hand.
    ev = [None] + ev
    win = target / len(ev)
    pre = min(0.15, win * 0.25)          # a little lead so the tap ripple is not clipped
    print(f"  1 leader + {len(ev)-1} tap events, {win:.2f}s each -> {target:.1f}s")

    # Normalise to constant frame rate first. A screen capture is variable-rate — the device
    # only emits a frame when something changes — and trim=duration on VFR overshoots, so the
    # segments summed to 8.5s against a 6.4s target until this was added.
    parts, labels = ["[0:v]fps=30[src]"], []
    for i, t in enumerate(ev):
        a = 0.2 if t is None else max(0.0, t - pre)
        parts.append(f"[src]trim=start={a:.3f}:duration={win:.3f},setpts=PTS-STARTPTS[v{i}]")
        labels.append(f"[v{i}]")
    # One source label feeding many trims needs an explicit split.
    parts[0] = f"[0:v]fps=30,split={len(ev)}" + "".join(f"[s{i}]" for i in range(len(ev)))
    parts[1:] = [p.replace("[src]", f"[s{i}]") for i, p in enumerate(parts[1:])]
    fg = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(ev)}:v=1:a=0[out]"

    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-filter_complex", fg,
         "-map", "[out]", "-c:v", "libx264", "-crf", "16", "-preset", "slow",
         "-pix_fmt", "yuv420p", "-an", dst], check=True)
    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", dst], capture_output=True, text=True).stdout.strip()
    print(f"  wrote {dst}  {float(dur):.2f}s")

if __name__ == "__main__":
    main()
