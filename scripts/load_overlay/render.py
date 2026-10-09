"""Render the plate overlay frame by frame and composite it on the clip (720x1280, the clip's own frame).
python3 scripts/load_overlay/render.py   (run track.py first)"""
import json, os, subprocess, shutil
from playwright.sync_api import sync_playwright
ROOT = os.path.expanduser("~/job_stuff/prj/ironpal"); D = f"{ROOT}/input/kickstarter/fisheye"
OVD = f"{D}/load_overlay_frames"; shutil.rmtree(OVD, ignore_errors=True); os.makedirs(OVD)
tracks = json.load(open(f"{D}/load_tracks.json"))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 720, "height": 1280})
    pg.add_init_script(f"window.TRACKS = {json.dumps(tracks)};")
    pg.goto("file://" + os.path.join(ROOT, "scripts/load_overlay/overlay.html")); pg.wait_for_timeout(800)
    pg.evaluate("document.fonts.ready")
    for i in range(tracks["n"]):
        pg.evaluate(f"render({i})"); pg.screenshot(path=f"{OVD}/{i:04d}.png", omit_background=True)
    b.close()
out = f"{D}/load_tracked.mp4"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{D}/load_src.mp4", "-framerate", "24", "-i", f"{OVD}/%04d.png",
                "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto", "-an", "-c:v", "libx264", "-crf", "16",
                "-preset", "slow", "-pix_fmt", "yuv420p", "-r", "24", out], check=True)
print("->", out)
