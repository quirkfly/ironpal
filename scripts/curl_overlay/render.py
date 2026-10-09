"""Canvas: the 1280x720 clip scaled to 1600x900 at (0,90) on 1920x1080, leaving a free column on the
right for the HUD (the fisheye circle fills almost the whole clip width). Render the overlay frame by frame (transparent PNGs) and composite it on the clip.
python3 scripts/curl_overlay/render.py   (run track.py first)"""
import json, os, subprocess, shutil
from playwright.sync_api import sync_playwright
ROOT = os.path.expanduser("~/job_stuff/prj/ironpal"); D = f"{ROOT}/input/kickstarter/fisheye"
OVD = f"{D}/curl_overlay_frames"; shutil.rmtree(OVD, ignore_errors=True); os.makedirs(OVD)
tracks = json.load(open(f"{D}/curl_tracks.json"))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.add_init_script(f"window.TRACKS = {json.dumps(tracks)};")
    pg.goto("file://" + os.path.join(ROOT, "scripts/curl_overlay/overlay.html")); pg.wait_for_timeout(800)
    pg.evaluate("document.fonts.ready")
    for i in range(tracks["n"]):
        pg.evaluate(f"render({i})")
        pg.screenshot(path=f"{OVD}/{i:04d}.png", omit_background=True)
    b.close()
out = f"{D}/curl_tracked.mp4"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{D}/curl_src.mp4", "-framerate", "24", "-i", f"{OVD}/%04d.png",
                "-filter_complex", "[0:v]scale=1600:900:flags=lanczos,pad=1920:1080:0:90:black[b];[b][1:v]overlay=0:0:format=auto", "-an", "-c:v", "libx264", "-crf", "16",
                "-preset", "slow", "-pix_fmt", "yuv420p", "-r", "24", out], check=True)
print("->", out)
