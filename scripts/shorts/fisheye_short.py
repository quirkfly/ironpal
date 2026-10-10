"""YT Short: the two tracked fisheye clips (barbell loading, then the one-arm curl) at 1080x1920,
with New Bass 01 (Mixkit, Stock Music Free License) as the bed. 2026-10-10.
python3 scripts/shorts/fisheye_short.py"""
import os, subprocess
R = os.path.expanduser("~/job_stuff/prj/ironpal"); F = f"{R}/input/kickstarter/fisheye"
OUT = f"{R}/input/kickstarter/shorts/ironpal_fisheye_short.mp4"
MUSIC, M_START = f"{R}/input/kickstarter/music/mixkit-new-bass-01-720.mp3", 60.0   # its steady, loudest stretch
def sh(*a): subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *a], check=True)
# 1. loading clip: already 9:16 (720x1280) -> 1080x1920
sh("-i", f"{F}/load_tracked.mp4", "-an", "-vf", "scale=1080:1920:flags=lanczos,setsar=1", "-r", "24",
   "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", f"{F}/_short_a.mp4")
# 2. curl clip (1920x1080, picture + HUD column) restacked vertically: picture on top, HUD below,
#    the lift gauge beside the HUD, the concept label at the foot.
vf = ("[0:v]split=4[p][h][g][l];"
      "[p]crop=1320:900:140:90,scale=1080:-2[pic];"
      "[h]crop=390:620:1498:118,scale=-2:930[hud];"
      "[g]crop=70:470:35:290,scale=-2:705[gau];"
      "[l]crop=230:45:1475:972,scale=-2:68[lab];"
      "color=black:s=1080x1920:r=24:d=6[bg];"
      "[bg][pic]overlay=0:80[a];[a][hud]overlay=(W-w)/2+40:850[b];[b][gau]overlay=115:960[c];[c][lab]overlay=(W-w)/2:1810,setsar=1[v]")
sh("-t", "6", "-i", f"{F}/ironpal-curl-tracked-6s.mp4", "-filter_complex", vf, "-map", "[v]", "-an", "-r", "24",
   "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", f"{F}/_short_b.mp4")
# 3. join + music: fade in 0.3 s, out over the last 1.0 s, loudness to -14 LUFS / -1 dBTP
open(f"{F}/_short.txt", "w").write(f"file '{F}/_short_a.mp4'\nfile '{F}/_short_b.mp4'\n")
sh("-f", "concat", "-safe", "0", "-i", f"{F}/_short.txt", "-c", "copy", f"{F}/_short_v.mp4")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
sh("-i", f"{F}/_short_v.mp4", "-ss", str(M_START), "-t", "10", "-i", MUSIC,
   "-filter_complex", "[1:a]afade=t=in:d=0.3,afade=t=out:st=9.0:d=1.0,volume=0dB,loudnorm=I=-14:TP=-1.5:LRA=7:linear=false,aresample=48000,alimiter=limit=0.70:level=false:attack=2:release=50,aresample=48000[a]",
   "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT)
for f in ("_short_a.mp4", "_short_b.mp4", "_short_v.mp4", "_short.txt"): os.remove(f"{F}/{f}")
print("->", OUT)
