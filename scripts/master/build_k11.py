"""K1_K11 crowdfunding master — the K1_K9 master with the two build clips inserted after K4.

  python3 scripts/master/build_k11.py

New order (docs/K5_K6_build_clips_design_plan.md §1):
  K1 K2 K3 K4 | K5 build (soldering) | K6 build (coding) | old K5..K9 as K7..K11 | end card

Reuses the K1_K9 pipeline's cached, graded clips and per-clip audio in input/kickstarter/master
(scripts/master/build.py) and writes everything new to input/kickstarter/master_k11, so the K1_K9
master and its intermediates are never touched. The two build clips are silent — K5's music was
stripped when it was selected and K6's typing sound is dropped here — so the music carries them.
Captions are the K1_K9 master's own captions.ass with every event after K4 shifted by the insert.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import build as B
# ~/.local/bin/ffprobe on this machine is an ffmpeg binary under the wrong name and rejects
# -show_entries; use the system ffprobe explicitly.
B.dur = lambda p: float(B.sh(["/usr/bin/ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).stdout.strip())

ROOT = B.ROOT
SRC_T = B.T                                             # K1_K9 caches (read only)
T = os.path.join(ROOT, "input/kickstarter/master_k11"); os.makedirs(T, exist_ok=True)
OUT = os.path.join(B.CLIPS, "K1_K11_crowdfunding_master.mp4")

OLD = ["K1", "K2", "K3_composed", "K4", "K5", "K6_trimmed", "K7_composed", "K8_composed", "K9"]
NEW = {   # name -> (source, in, out). Both 8 s silent generations, the founder's accepted takes.
    "K5_build": (os.path.join(ROOT, "input/kickstarter/k5k6/K5b_take8_nomusic.mp4"), 0.0, 8.0),
    "K6_build": (os.path.join(ROOT, "input/kickstarter/k5k6/K6_take1.mp4"), 0.0, 8.0),
}
ORDER = OLD[:4] + list(NEW) + OLD[4:]
BUILD_PULL = 0.4   # the lab is white walls and daylight; graded all the way to the gym it stops being the lab (§5)

def grade_new(k):
    src, a, b = NEW[k]; out = f"{T}/{k}_v.mp4"
    if os.path.exists(out): return out
    B.GRADE_PULL, keep = BUILD_PULL, B.GRADE_PULL
    vf, g = B.solve_grade(src); B.GRADE_PULL = keep
    B.sh(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(a), "-to", str(b), "-i", src, "-an",
          "-vf", f"scale=1920:1080:flags=lanczos,{vf}", "-c:v", "libx264", "-crf", "16", "-preset", "slow",
          "-pix_fmt", "yuv420p", "-r", "24", out])
    print(f"   {k}: grade {g}")
    return out

def silent_wav(k, secs):
    out = f"{T}/{k}_eq.wav"
    B.sh(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
          "-t", f"{secs:.3f}", "-c:a", "pcm_s16le", out])
    return out

def shift_captions(at, by):
    ass = open(f"{SRC_T}/captions.ass").read()
    def t2s(t): h, m, s = t.split(":"); return int(h) * 3600 + int(m) * 60 + float(s)
    def s2t(x): return f"{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}"
    def fix(m):
        s, e = t2s(m.group(1)), t2s(m.group(2))
        if s >= at: s, e = s + by, e + by
        return f"Dialogue: 0,{s2t(s)},{s2t(e)},"
    out = re.sub(r"Dialogue: 0,([\d:.]+),([\d:.]+),", fix, ass)
    p = f"{T}/captions.ass"; open(p, "w").write(out); return p

if __name__ == "__main__":
    report = {}
    # video
    parts, wavs = [], []
    for k in ORDER:
        if k in NEW:
            v = grade_new(k); parts.append(v); wavs.append(silent_wav(k, B.dur(v)))
        else:
            parts.append(f"{SRC_T}/{k}_v.mp4"); wavs.append(f"{SRC_T}/{k}_eq.wav")
    card = f"{SRC_T}/end_card.mp4"; card_s = B.dur(card)
    k4_end = sum(B.dur(f"{SRC_T}/{k}_v.mp4") for k in OLD[:4])
    insert = sum(B.dur(f"{T}/{k}_v.mp4") for k in NEW)
    lst = f"{T}/v.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in parts + [card]))
    B.sh(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-map", "0:v", "-c", "copy", f"{T}/video_cut.mp4"])
    ass = shift_captions(k4_end - 0.01, insert)
    # dialogue + room bed, the K1_K9 recipe (build.assemble)
    alst = f"{T}/a.txt"; open(alst, "w").write("".join(f"file '{w}'\n" for w in wavs))
    dialog = f"{T}/dialog_eq.wav"
    B.sh(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", alst, "-c", "copy", dialog])
    total = B.dur(dialog) + card_s
    B.sh(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", f"anoisesrc=c=pink:r=48000:a=0.5:d={total:.3f}",
          "-af", "highpass=f=120,lowpass=f=7000", "-ac", "2", f"{T}/_bed0.wav"])
    o = B.sh(["ffmpeg", "-hide_banner", "-nostats", "-i", f"{T}/_bed0.wav", "-af", "astats=measure_overall=RMS_level:measure_perchannel=none", "-f", "null", "-"], quiet=False).stderr
    rms = float(re.findall(r"RMS level dB: (-?[\d.]+)", o)[-1])
    B.sh(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{T}/_bed0.wav", "-af", f"volume={B.FLOOR_TARGET - rms:.2f}dB", f"{T}/bed.wav"])
    # music: the K1_K9 stage 9 chain (build.music_mix), on the longer timeline
    card_at = B.dur(dialog); mf = B.MUSIC["file"]; off = B.MUSIC["offset"]
    d_I = B.lufs(f"{SRC_T}/dialog_eq.wav")   # the speech-only dialogue: the silent inserts would lower it
    m_I = B.lufs(mf, off + 30, off + 60); gain = (d_I + B.MUSIC["rel_db"]) - m_I
    mus = (f"[2:a]atrim={off}:{off + total:.3f},asetpts=PTS-STARTPTS,aresample=48000,volume={gain:.2f}dB,"
           f"afade=t=in:d={B.MUSIC['fade_in']},afade=t=out:st={card_at:.3f}:d={card_s:.3f},aformat=channel_layouts=stereo[mu]")
    mix = (f"[0:a]apad=whole_dur={total:.3f},aformat=channel_layouts=stereo,asplit=2[d][dk];{mus};[mu][dk]{B.DUCK}[mud];"
           f"[d][1:a][mud]amix=inputs=3:normalize=0[m];"
           f"[m]acompressor=threshold=-18dB:ratio=1.8:attack=15:release=200:makeup=1[c]")
    ins = ["-i", dialog, "-i", f"{T}/bed.wav", "-i", mf]
    p1 = B.sh(["ffmpeg", "-hide_banner", "-nostats", "-y", *ins, "-filter_complex", mix + ";[c]loudnorm=I=-14:TP=-1:LRA=9:print_format=json[o]", "-map", "[o]", "-f", "null", "-"], quiet=False).stderr
    js = json.loads(p1[p1.rfind("{"):p1.rfind("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
          f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    wav = f"{T}/master_eq_music.wav"
    B.sh(["ffmpeg", "-loglevel", "error", "-y", *ins, "-filter_complex", mix + f";[c]{ln},alimiter=limit=0.85:level=false:attack=4:release=60[o]", "-map", "[o]", "-ar", "48000", wav])
    B.sh(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{T}/video_cut.mp4", "-i", wav, "-vf", f"ass={ass}",
          "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p",
          "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "-shortest", OUT])
    proxy = OUT.replace(".mp4", "_proxy.mp4")
    B.sh(["ffmpeg", "-loglevel", "error", "-y", "-i", OUT, "-vf", "scale=1280:-2", "-c:v", "libx264", "-crf", "23", "-preset", "medium",
          "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", proxy])
    o = B.sh(["ffmpeg", "-hide_banner", "-nostats", "-i", OUT, "-af", "ebur128=peak=true", "-f", "null", "-"], quiet=False).stderr
    report = {"file": OUT, "proxy": proxy, "dur": round(B.dur(OUT), 2), **B.loudness(o), "order": ORDER,
              "k4_end": round(k4_end, 3), "insert_s": round(insert, 3), "card_at": round(card_at, 3),
              "music_gain_db": round(gain, 2), "music_offset_s": off}
    json.dump(report, open(f"{T}/report.json", "w"), indent=1)
    print(json.dumps(report, indent=1))
