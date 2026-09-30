#!/usr/bin/env python3
"""K1_K9 mastering pipeline — every stage measured, nothing overwrites the cut.

  python3 scripts/master/build.py            # builds both masters + a report
  python3 scripts/master/build.py --music    # stage 9 only -> K1_K9_master_eq_music.mp4

Stages, in the order they must run (docs: the audio saga in docs/audio_issue.md — the lesson is
that LEVEL is the last thing to touch, not the first):
  1  noise floor   — denoise the five hissy clips down to the four quiet ones, then one continuous
                     room-tone bed under everything so no cut changes the floor
  2  dialogue      — speech-gated K-weighted gain to one target; 15 ms fades at every cut
  3  tone (A/B)    — gentle match-EQ toward the MEDIAN voice across all nine, ±5 dB, 200–8 kHz;
                     shipped as a second file because this stage was rejected six times on K2
  4  master        — de-ess, gentle bus compression, loudnorm two-pass to -14 LUFS / -1 dBTP
  5  grade         — per-clip exposure / warmth / saturation moved 70% toward one target
  6  trim          — dead air and the documented tail-hazard frames (decided by eye, see TRIM)
  7  end card      — the config's card, rendered from HTML like the insets
  8  captions      — the known lines, timed from whisper word boundaries, burned in via libass
  9  music         — the chosen track, levelled relative to the dialogue and gently ducked, mixed
                     in ahead of loudnorm; `--music` runs this stage alone on cached intermediates
"""
import json, os, subprocess, sys, wave, math
import numpy as np

ROOT = os.path.expanduser("~/job_stuff/prj/ironpal")
CLIPS = os.path.expanduser("~/job_stuff/prj/geggen/products/ironpal/clips")
T = os.path.join(ROOT, "input/kickstarter/master"); os.makedirs(T, exist_ok=True)
SCRATCH = "/tmp/claude-1000/-home-quirkfly-job-stuff-prj-ironpal/b7d6a278-9980-4d55-818b-50ccac319ae7/scratchpad"

ORDER = ["K1","K2","K3_composed","K4","K5","K6_trimmed","K7_composed","K8_composed","K9"]
LINES = {
 "K1": ["Gyms, a hundred and forty billion a year.", "Fitness trackers, fifty billion more."],
 "K2": ["Billions poured into AI,", "and the smartest thing in this gym is still your thumb."],
 "K3_composed": ["Mine's been doing it for years.", "Exercise, sets, reps, weight. All by hand."],
 "K4": ["Eventually I got tired of typing", "and started building my own solution."],
 "K5": ["IronPal. A headband.", "It watches my set and fills in the log itself."],
 "K6_trimmed": ["Tiny camera. Motion sensors.", "And my own model, running on your phone."],
 "K7_composed": ["No buttons. No pausing.", "I lift, it logs the exercise, the reps and the weight."],
 "K8_composed": ["Depth, back angle, knees. It checks all of it.", "That used to need a trainer."],
 "K9": ["Give your thumb a break.", "Reserve your spot at ironpal.co. It costs nothing today."],
}
# (in, out) seconds within the source clip. Decided from frames, not from silence numbers:
# heads with a walk-in or a reveal are content and stay; K3 loses only its hazard frames. K5 (the
# bag reveal, take 2 of 2026-09-30) holds the band up until 7.1 s and then lowers it into the bag —
# the cut ends on the hold, not the put-away.
TRIM = {"K3_composed": (0.0, 7.75), "K4": (1.3, 8.0), "K5": (0.0, 7.1), "K9": (1.2, 9.5)}
SPEECH_TARGET = -21.0        # dB, K-weighted speech — the measure that matched by ear
FLOOR_TARGET = -68.0         # dB RMS in the quietest 0.3 s
NOISY = {"K1","K2","K3_composed","K4","K6_trimmed"}
GRADE_TARGET = {"Y": 42.0, "warmth": 22.0, "sat": 0.43}; GRADE_PULL = 0.7
ACCENT = "#00E5CC"

def sh(cmd, quiet=True):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode and quiet: sys.exit(f"FAILED: {' '.join(cmd[:6])}…\n{r.stderr[-800:]}")
    return r
def dur(p): return float(sh(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]).stdout.strip())
def load_mono(p):
    w=f"{SCRATCH}/_x.wav"; sh(["ffmpeg","-loglevel","error","-y","-i",p,"-vn","-ac","1","-ar","48000",w])
    f=wave.open(w); return np.frombuffer(f.readframes(f.getnframes()),dtype=np.int16).astype(float)/32768, 48000
def kweight(d,sr):
    F=np.fft.rfft(d); f=np.fft.rfftfreq(len(d),1/sr); g=np.ones_like(f); g[f<60]=0; g[f>2000]*=10**(4/20); return np.fft.irfft(F*g,n=len(d))
def measure(p):
    d,sr=load_mono(p); fw=int(0.02*sr)
    lv=np.array([20*np.log10(np.sqrt((d[i:i+fw]**2).mean())+1e-9) for i in range(0,len(d)-fw,fw)])
    on=lv>np.percentile(lv,85)-12; x=np.concatenate([d[i*fw:(i+1)*fw] for i,v in enumerate(on) if v])
    speech=20*np.log10(np.sqrt((kweight(x,sr)**2).mean())+1e-9)
    win=int(0.3*sr); floor=min(20*np.log10(np.sqrt((d[i:i+win]**2).mean())+1e-9) for i in range(0,len(d)-win,win//3))
    return speech, floor, on

# ---------------------------------------------------------------- 1+2+3  per-clip audio
tone=json.load(open(f"{SCRATCH}/tone.json")); FC=tone["fc"]; MED=np.array(tone["median"])
def eq_entries(k):
    dev=MED-np.array(tone["clips"][k]["spec"])          # what to ADD to reach the median
    ent=[]
    for f,g in zip(FC,dev):
        g = 0.0 if (f<200 or f>8000) else float(np.clip(0.7*g,-5,5))
        ent.append(f"entry({f},{g:.2f})")
    return ";".join(["entry(20,0)"]+ent+["entry(20000,0)"])

def prep_audio(k, with_eq):
    src=f"{CLIPS}/{k}.mp4"; a,b=TRIM.get(k,(0.0,dur(src)))
    out=f"{T}/{k}_{'eq' if with_eq else 'flat'}.wav"
    chain=[f"atrim={a}:{b}","asetpts=PTS-STARTPTS"]
    if k in NOISY: chain.append("anlmdn=s=8:p=0.002:r=0.008")
    if True:
        # Calibrated on K1/K2/K6: afftdn alone moved the floor 1-3 dB; anlmdn (non-local means)
        # takes it 12-22 dB down and a fast, knee'd gate finishes it under the bed. Speech level
        # measured unchanged to 0.2 dB. Release is short on purpose — a 300 ms release never fully
        # closed inside K1's pauses and the floor stayed at -50.
        chain.append("agate=threshold=0.008:ratio=3:attack=10:release=110:knee=3:range=0.06")
    if with_eq: chain.append(f"firequalizer=gain_entry='{eq_entries(k)}'")
    chain.append("deesser=i=0.35:m=0.5:f=0.5")
    sh(["ffmpeg","-loglevel","error","-y","-i",src,"-vn","-af",",".join(chain),"-ac","2","-ar","48000",out])
    speech,floor,_=measure(out); gain=SPEECH_TARGET-speech
    d=dur(out)
    sh(["ffmpeg","-loglevel","error","-y","-i",out,"-af",f"volume={gain:.2f}dB,afade=t=in:d=0.015,afade=t=out:st={d-0.015:.3f}:d=0.015",f"{T}/_t.wav"])
    os.replace(f"{T}/_t.wav",out)
    s2,f2,_=measure(out)
    return out,{"speech_before":round(speech,1),"floor_before":round(floor,1),"gain":round(gain,1),"speech":round(s2,1),"floor":round(f2,1),"dur":round(d,3)}

# ---------------------------------------------------------------- 5  per-clip grade
def colour_stats(p, secs=None):
    cmd=["ffmpeg","-v","error"]+(["-t",str(secs)] if secs else [])+["-i",p,"-vf","fps=2,scale=96:54","-pix_fmt","rgb24","-f","rawvideo","-"]
    raw=subprocess.run(cmd,capture_output=True).stdout
    n=len(raw)//(96*54*3); a=np.frombuffer(raw[:n*96*54*3],dtype=np.uint8).reshape(n,54,96,3).astype(float)
    R,G,B=a[...,0].mean(),a[...,1].mean(),a[...,2].mean(); Y=0.299*R+0.587*G+0.114*B
    mx=a.max(axis=3); mn=a.min(axis=3); lit=mx>40
    sat=((mx-mn)/(mx+1e-6))[lit].mean() if lit.any() else 0.0
    return {"Y":Y,"R":R,"B":B,"warmth":R-B,"sat":sat}
def solve_grade(src):
    """Find eq/mixer/saturation that land the clip at GRADE_PULL of the way to GRADE_TARGET.
    One pass cannot: the saturation boost inflates R-B and the red mixer inflates saturation, so
    a first pass overshot dark clips by ~7 Y and ~11 warmth. Two fixed-point iterations on a 3 s
    sample converge to within ~1 of target."""
    st=colour_stats(src); want={"Y":st["Y"]+GRADE_PULL*(GRADE_TARGET["Y"]-st["Y"]),
                                  "warmth":st["warmth"]+GRADE_PULL*(GRADE_TARGET["warmth"]-st["warmth"]),
                                  "sat":st["sat"]+GRADE_PULL*(GRADE_TARGET["sat"]-st["sat"])}
    gamma=float(np.clip(math.log(max(st["Y"],1)/255)/math.log(want["Y"]/255),0.6,1.8)); mix=0.0; smul=1.0
    for _ in range(2):
        vf=f"eq=gamma={gamma:.3f}:saturation={smul:.3f},colorchannelmixer=rr={1+mix:.3f}:bb={1-mix:.3f}"
        sh(["ffmpeg","-loglevel","error","-y","-i",src,"-an","-vf",vf,"-c:v","libx264","-crf","20","-preset","veryfast",f"{T}/_probe.mp4"])
        got=colour_stats(f"{T}/_probe.mp4")
        gamma=float(np.clip(gamma*math.log(max(got["Y"],1)/255)/math.log(want["Y"]/255),0.6,1.8))
        mix=float(np.clip(mix+(want["warmth"]-got["warmth"])/max(got["R"]+got["B"],1),-0.25,0.25))
        smul=float(np.clip(smul*want["sat"]/max(got["sat"],0.05),0.5,1.8))
    vf=f"eq=gamma={gamma:.3f}:saturation={smul:.3f},colorchannelmixer=rr={1+mix:.3f}:bb={1-mix:.3f}"
    return vf,{"in":{k:round(st[k],2) for k in ("Y","warmth","sat")},"want":{k:round(v,2) for k,v in want.items()},"gamma":round(gamma,3),"mix":round(mix,3),"sat_mul":round(smul,3)}

# ---------------------------------------------------------------- 7  end card
def render_end_card():
    cfg=json.load(open(f"{ROOT}/docs/founder_video_promo_config.json"))["end_card"]
    logo=os.path.abspath(f"{ROOT}/input/images/logo/v4/Geometric teal circle on navy.png")
    html=f"""<!doctype html><meta charset=utf-8><style>
    *{{margin:0;box-sizing:border-box}} body{{width:1920px;height:1080px;background:#0b0b16;display:flex;
    align-items:center;justify-content:center;font-family:'Liberation Sans','DejaVu Sans',sans-serif;color:#F0F4F8}}
    .w{{display:flex;flex-direction:column;align-items:center;gap:44px;opacity:0;animation:in .7s ease-out .25s forwards}}
    @keyframes in{{to{{opacity:1}}}}
    img{{width:220px;height:220px;border-radius:50%}}
    .l{{font-size:56px;font-weight:700;letter-spacing:.01em;text-align:center;max-width:1400px;line-height:1.2}}
    .u{{font-size:44px;font-weight:700;color:{ACCENT};letter-spacing:.06em}}
    .c{{position:absolute;bottom:56px;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:#9aa0b4}}
    </style><div class=w><img src="file://{logo}"><div class=l>{cfg['lines'][0]}</div><div class=u>{cfg['url']}</div></div>
    <div class=c>Product interface concept · pre-launch</div>"""
    page=f"{T}/end_card.html"; open(page,"w").write(html)
    frames=int(round(cfg["seconds"]*24)); work=f"{T}/card"; os.makedirs(work,exist_ok=True)
    code=f"""
import asyncio,pathlib
from playwright.async_api import async_playwright
async def m():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={{'width':1920,'height':1080}})
    await pg.goto(pathlib.Path('{page}').absolute().as_uri()); await pg.wait_for_timeout(100)
    for i in range({frames}):
      await pg.evaluate("t=>document.getAnimations().forEach(a=>{{a.currentTime=t}})", i/24*1000)
      await pg.screenshot(path='{work}/f%04d.png'%i)
    await b.close()
asyncio.run(m())"""
    sh(["python3","-c",code])
    out=f"{T}/end_card.mp4"
    sh(["ffmpeg","-loglevel","error","-y","-framerate","24","-i",f"{work}/f%04d.png","-f","lavfi","-i","anullsrc=r=48000:cl=stereo",
        "-t",str(cfg["seconds"]),"-c:v","libx264","-crf","16","-pix_fmt","yuv420p","-c:a","aac","-shortest",out])
    return out, cfg["seconds"]

# ---------------------------------------------------------------- 8  captions
def build_ass(timeline):
    words=json.load(open(f"{SCRATCH}/words.json")); gate=json.load(open(f"{SCRATCH}/tone.json"))["clips"]
    import re as _re2
    # Brand words in the brand colour, as on the CTA card. ASS colours are BGR: #00E5CC -> CCE500.
    # {\r} resets to the style's default afterwards rather than hard-coding the white.
    def esc(s):
        s=s.replace("{","(").replace("}",")")
        return _re2.sub(r"(ironpal\.co|IronPal)", lambda m: "{\\c&HCCE500&}"+m.group(1)+"{\\r}", s)
    ev=[]
    for k,off,a,b in timeline:                       # off = start of this clip in the master
        ws=[w for w in words[k] if a<=w[1]<=b]; l1,l2=LINES[k]
        if not ws: continue
        # Whisper reports 0.00 for a first word it could not place; otherwise it is more reliable
        # than the level gate, which opens late on a soft first word (K9's "Give": 1.90 vs 2.46).
        first=max(a, ws[0][1] if ws[0][1]>=0.25 else gate[k]["speech_start"])
        last=min(b,ws[-1][2]+1.0)   # hold the closing caption ~1 s past the last word; 0.35 s left K8's at 1.3 s
        import re as _re
        norm=lambda x:_re.sub(r"[^a-z0-9]","",x.lower())
        n1=len(l1.split()); target=norm(l1.split()[-1]); split=None
        for i,(w,s_,e_) in enumerate(ws):
            if i>=max(0,n1-3) and norm(w)==target:
                # Hold the first caption until the NEXT word starts, not until this one ends —
                # a fast line ("Mine's been doing it for years", 1.4 s) is otherwise gone before
                # it can be read. Capped so a long pause does not leave it hanging.
                nxt=ws[i+1][1] if i+1<len(ws) else e_
                split=min(nxt, e_+1.2); break
        if split is None:   # fall back to proportional if whisper tokenised the last word away
            split=first+(last-first)*len(l1)/(len(l1)+len(l2))
        for txt,s,e in ((l1,first,split),(l2,split,last)):
            f=lambda t: f"{int(t//3600)}:{int(t%3600//60):02d}:{t%60:05.2f}"
            ev.append(f"Dialogue: 0,{f(off+s-a)},{f(off+e-a)},Cap,,0,0,0,,{esc(txt)}")
    ass="""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Liberation Sans,54,&H00F8F4F0,&H00CCE500,&H00161010,&H80000000,-1,0,0,0,100,100,0.5,0,1,3,1,2,120,120,64,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""+"\n".join(ev)+"\n"
    p=f"{T}/captions.ass"; open(p,"w").write(ass); return p, len(ev)

# ---------------------------------------------------------------- assemble
def assemble(with_eq, card, card_s, report):
    tag="eq" if with_eq else "flat"
    # audio: per-clip wavs -> concat -> bed -> master chain
    wavs=[f"{T}/{k}_{tag}.wav" for k in ORDER]
    lst=f"{T}/a_{tag}.txt"; open(lst,"w").write("".join(f"file '{w}'\n" for w in wavs))
    sh(["ffmpeg","-loglevel","error","-y","-f","concat","-safe","0","-i",lst,"-c","copy",f"{T}/dialog_{tag}.wav"])
    total=dur(f"{T}/dialog_{tag}.wav")+card_s
    # room-tone bed: pink noise, band-limited, at the floor target, under the whole film incl. card
    sh(["ffmpeg","-loglevel","error","-y","-f","lavfi","-i",f"anoisesrc=c=pink:r=48000:a=0.5:d={total:.3f}",
        "-af","highpass=f=120,lowpass=f=7000","-ac","2",f"{T}/_bed0.wav"])
    import re as _re
    o=sh(["ffmpeg","-hide_banner","-nostats","-i",f"{T}/_bed0.wav","-af","astats=measure_overall=RMS_level:measure_perchannel=none","-f","null","-"],quiet=False).stderr
    rms=float(_re.findall(r"RMS level dB: (-?[\d.]+)",o)[-1])
    sh(["ffmpeg","-loglevel","error","-y","-i",f"{T}/_bed0.wav","-af",f"volume={FLOOR_TARGET-rms:.2f}dB",f"{T}/bed.wav"])
    # first pass loudnorm to read the stats, second pass to apply linearly
    mix=(f"[0:a]apad=whole_dur={total:.3f}[d];[d][1:a]amix=inputs=2:normalize=0[m];"
         f"[m]acompressor=threshold=-18dB:ratio=1.8:attack=15:release=200:makeup=1[c]")
    p1=sh(["ffmpeg","-hide_banner","-nostats","-y","-i",f"{T}/dialog_{tag}.wav","-i",f"{T}/bed.wav","-filter_complex",
           mix+";[c]loudnorm=I=-14:TP=-1:LRA=9:print_format=json[o]","-map","[o]","-f","null","-"],quiet=False).stderr
    js=json.loads(p1[p1.rfind("{"):p1.rfind("}")+1])
    ln=(f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
        f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    sh(["ffmpeg","-loglevel","error","-y","-i",f"{T}/dialog_{tag}.wav","-i",f"{T}/bed.wav","-filter_complex",
        mix+f";[c]{ln},alimiter=limit=0.85:level=false:attack=4:release=60[o]","-map","[o]","-ar","48000",f"{T}/master_{tag}.wav"])
    # video: trim + grade per clip, concat, + card, + captions
    parts=[]; timeline=[]; off=0.0
    for k in ORDER:
        src=f"{CLIPS}/{k}.mp4"; a,b=TRIM.get(k,(0.0,dur(src)))
        out=f"{T}/{k}_v.mp4"
        if not os.path.exists(out):
            vf,g=solve_grade(src); report["grade"][k]=g
            sh(["ffmpeg","-loglevel","error","-y","-ss",str(a),"-to",str(b),"-i",src,"-an","-vf",vf,"-c:v","libx264","-crf","16","-preset","slow","-pix_fmt","yuv420p","-r","24",out])
            report["grade"][k]["out"]={k2:round(v,2) for k2,v in colour_stats(out).items() if k2 in ("Y","warmth","sat")}
        parts.append(out); timeline.append((k,off,a,b)); off+=b-a
    parts.append(card)
    lst=f"{T}/v.txt"; open(lst,"w").write("".join(f"file '{p}'\n" for p in parts))
    sh(["ffmpeg","-loglevel","error","-y","-f","concat","-safe","0","-i",lst,"-c","copy",f"{T}/video_cut.mp4"])
    ass,n=build_ass(timeline); report["captions"]=n
    final=f"{CLIPS}/K1_K9_master_{tag}.mp4"
    sh(["ffmpeg","-loglevel","error","-y","-i",f"{T}/video_cut.mp4","-i",f"{T}/master_{tag}.wav","-vf",f"ass={ass}",
        "-map","0:v","-map","1:a","-c:v","libx264","-crf","17","-preset","slow","-pix_fmt","yuv420p","-c:a","aac","-b:a","256k","-movflags","+faststart","-shortest",final])
    o=sh(["ffmpeg","-hide_banner","-nostats","-i",final,"-af","ebur128=peak=true","-f","null","-"],quiet=False).stderr
    report["master"][tag]={"file":final,"dur":round(dur(final),2),**loudness(o)}
    return final

def loudness(o):
    """ebur128 summary from ffmpeg stderr. The LAST match: the first `I:` line reads -70 (trap §3)."""
    import re
    g=lambda rx: (re.findall(rx,o) or ["?"])[-1]
    return {"I_LUFS":g(r"I:\s+(-?[\d.]+) LUFS"),"TP":g(r"Peak:\s+(-?[\d.]+) dBFS"),"LRA":g(r"LRA:\s+([\d.]+) LU")}

# --- 9  music -------------------------------------------------------------------------------
# The chosen track (docs/K1_K9_music_candidates.md; provenance input/kickstarter/music/LICENSES.md).
# It goes in BEFORE loudnorm so the -14 / -1 target still holds with the bed in, and its level is set
# relative to the dialogue, not absolute: MUSIC_REL dB under the dialogue's integrated loudness,
# measured on the track's 30-60 s section (its loudest sustained stretch under the reveal).
MUSIC = {"file": os.path.join(ROOT,"input/kickstarter/music/mixkit-dreaming-big-31.mp3"),
         "offset": 4.0,      # s into the track at film 0 — puts its 74-77 s peak on the end card
         "rel_db": -11.0,    # bed under dialogue; previews auditioned at -8/-9, ship 2-3 dB lower
         "fade_in": 1.0}
# Duck: gentle or the bed vanishes — the founder talks for 70 of 73 s (mastering doc §3). Threshold
# is set against the PRE-loudnorm dialogue (about -20 LUFS here), ratio 2 => at most ~6 dB.
DUCK = "sidechaincompress=threshold=0.1:ratio=2:attack=80:release=900:makeup=1"

def lufs(p, a=None, b=None):
    af=(f"atrim={a}:{b}," if a is not None else "")+"ebur128"
    return float(loudness(sh(["ffmpeg","-hide_banner","-nostats","-i",p,"-af",af,"-f","null","-"],quiet=False).stderr)["I_LUFS"])

def music_mix(tag, card_s, report):
    """Stage 9: dialogue + room bed + ducked music -> the same bus/loudnorm/limiter -> mux with the
    cached graded cut and captions. Needs assemble()'s intermediates in T."""
    dialog=f"{T}/dialog_{tag}.wav"; total=dur(dialog)+card_s; card_at=dur(dialog)
    mf=MUSIC["file"]; off=MUSIC["offset"]
    d_I=lufs(dialog); m_I=lufs(mf,off+30,off+60); gain=(d_I+MUSIC["rel_db"])-m_I
    mus=(f"[2:a]atrim={off}:{off+total:.3f},asetpts=PTS-STARTPTS,aresample=48000,volume={gain:.2f}dB,"
         f"afade=t=in:d={MUSIC['fade_in']},afade=t=out:st={card_at:.3f}:d={card_s:.3f},aformat=channel_layouts=stereo[mu]")
    # explicit layouts: the dialogue wav carries none and sidechaincompress refuses to guess
    mix=(f"[0:a]apad=whole_dur={total:.3f},aformat=channel_layouts=stereo,asplit=2[d][dk];{mus};[mu][dk]{DUCK}[mud];"
         f"[d][1:a][mud]amix=inputs=3:normalize=0[m];"
         f"[m]acompressor=threshold=-18dB:ratio=1.8:attack=15:release=200:makeup=1[c]")
    ins=["-i",dialog,"-i",f"{T}/bed.wav","-i",mf]
    p1=sh(["ffmpeg","-hide_banner","-nostats","-y",*ins,"-filter_complex",mix+";[c]loudnorm=I=-14:TP=-1:LRA=9:print_format=json[o]","-map","[o]","-f","null","-"],quiet=False).stderr
    js=json.loads(p1[p1.rfind("{"):p1.rfind("}")+1])
    ln=(f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
        f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    wav=f"{T}/master_{tag}_music.wav"
    sh(["ffmpeg","-loglevel","error","-y",*ins,"-filter_complex",mix+f";[c]{ln},alimiter=limit=0.85:level=false:attack=4:release=60[o]","-map","[o]","-ar","48000",wav])
    # the bed as shipped: ducked stem through the same linear gain, for the report
    stem=f"{T}/_music_stem_{tag}.wav"
    sh(["ffmpeg","-loglevel","error","-y",*ins,"-filter_complex",f"[0:a]apad=whole_dur={total:.3f},aformat=channel_layouts=stereo[dk];{mus};[mu][dk]{DUCK}[o]","-map","[o]",stem])
    ass=f"{T}/captions.ass"; final=f"{CLIPS}/K1_K9_master_{tag}_music.mp4"
    sh(["ffmpeg","-loglevel","error","-y","-i",f"{T}/video_cut.mp4","-i",wav,"-vf",f"ass={ass}",
        "-map","0:v","-map","1:a","-c:v","libx264","-crf","17","-preset","slow","-pix_fmt","yuv420p","-c:a","aac","-b:a","256k","-movflags","+faststart","-shortest",final])
    proxy=final.replace(".mp4","_proxy.mp4")
    sh(["ffmpeg","-loglevel","error","-y","-i",final,"-vf","scale=1280:-2","-c:v","libx264","-crf","23","-preset","medium","-c:a","aac","-b:a","128k","-movflags","+faststart",proxy])
    o=sh(["ffmpeg","-hide_banner","-nostats","-i",final,"-af","ebur128=peak=true","-f","null","-"],quiet=False).stderr
    report["master"][f"{tag}_music"]={"file":final,"proxy":proxy,"dur":round(dur(final),2),**loudness(o),
        "track":os.path.basename(mf),"offset_s":off,"gain_db":round(gain,2),"dialog_I_pre":d_I,"music_section_I_pre":m_I,
        "bed_stem_I_ducked_pre":round(lufs(stem),1),"rel_db":MUSIC["rel_db"]}
    return final

if __name__=="__main__":
    if "--music" in sys.argv:            # stage 9 only, on the cached intermediates of the last full build
        report=json.load(open(f"{T}/report.json")); card_s=dur(f"{T}/end_card.mp4")
        tag="flat" if "--flat" in sys.argv else "eq"
        print(f"9    music ({tag})"); f=music_mix(tag,card_s,report); print("     ->",f,report["master"][f"{tag}_music"])
        json.dump(report,open(f"{T}/report.json","w"),indent=1); sys.exit(0)
    report={"audio":{},"grade":{},"master":{}}
    print("1-3  per-clip audio")
    for k in ORDER:
        for eq in (False,True):
            _,m=prep_audio(k,eq); report["audio"][f"{k}/{'eq' if eq else 'flat'}"]=m
        m=report["audio"][f"{k}/flat"]; print(f"   {k:12s} speech {m['speech_before']:6.1f}->{m['speech']:6.1f}  floor {m['floor_before']:6.1f}->{m['floor']:6.1f}  gain {m['gain']:+5.1f}  {m['dur']}s")
    print("7    end card"); card,card_s=render_end_card()
    for eq in (False,True):
        print(f"5-8  assemble ({'eq' if eq else 'flat'})"); f=assemble(eq,card,card_s,report); print("     ->",f, report["master"]['eq' if eq else 'flat'])
    json.dump(report,open(f"{T}/report.json","w"),indent=1); print("report:",f"{T}/report.json")
