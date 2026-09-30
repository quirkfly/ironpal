"""Per-track numbers that matter under a 73 s dialogue-led film.

duration, bpm, onset rate (busyness), spectral centroid, speech-band share
(1-4 kHz energy fraction: how much it fights the voice), RMS envelope per 5 s
(dB, relative to track max) so the shape of the first 80 s is visible,
lift = mean RMS 30-60 s minus mean RMS 0-25 s (does it grow across the reveal),
intro = first 5 s vs 10-25 s, tail = last 5 s vs track max (does it end cleanly).
"""
import json, subprocess, sys, glob, numpy as np
SR=22050; HOP=512; NFFT=2048
def load(p):
    raw=subprocess.run(["ffmpeg","-loglevel","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.float32)
def frames(x):
    n=1+(len(x)-NFFT)//HOP
    idx=np.arange(NFFT)[None,:]+HOP*np.arange(n)[:,None]
    return x[idx]*np.hanning(NFFT)
def analyse(p):
    x=load(p); dur=len(x)/SR
    F=frames(x[:int(SR*90)]); S=np.abs(np.fft.rfft(F,axis=1)); freqs=np.fft.rfftfreq(NFFT,1/SR)
    mag=S.sum(1)+1e-9
    centroid=float(((S*freqs).sum(1)/mag).mean())
    band=(freqs>=1000)&(freqs<=4000)
    speech_share=float((S[:,band]**2).sum()/((S**2).sum()+1e-9))
    # onsets: half-wave rectified spectral flux
    flux=np.maximum(0,np.diff(np.log1p(S),axis=0)).sum(1)
    thr=flux.mean()+1.5*flux.std()
    onsets=np.where((flux[1:-1]>thr)&(flux[1:-1]>flux[:-2])&(flux[1:-1]>flux[2:]))[0]
    onset_rate=len(onsets)/(len(flux)*HOP/SR)
    # bpm via autocorrelation of flux
    f=flux-flux.mean(); ac=np.correlate(f,f,"full")[len(f)-1:]
    fps=SR/HOP; lo,hi=int(fps*60/140),int(fps*60/70)
    lag=lo+int(np.argmax(ac[lo:hi])); bpm=60*fps/lag
    # RMS per 5 s over the whole track
    w=SR*5; nwin=len(x)//w
    rms=np.array([np.sqrt(np.mean(x[i*w:(i+1)*w]**2)) for i in range(nwin)])+1e-9
    db=20*np.log10(rms/rms.max())
    env=[round(float(v),1) for v in db]
    def m(a,b): 
        seg=db[a//5:b//5]; return float(seg.mean()) if len(seg) else float("nan")
    lift=m(30,60)-m(0,25); intro=m(0,5)-m(10,25)
    tail=float(db[-1]) if len(db) else 0.0
    peak=float(np.abs(x).max())
    return dict(file=p.split("/")[-1],dur=round(dur,1),bpm=round(bpm),onset_rate=round(onset_rate,2),
                centroid=round(centroid),speech_share=round(speech_share,3),lift=round(lift,1),
                intro=round(intro,1),tail=round(tail,1),env=env[:18])
out=[]
for p in sorted(glob.glob("mp3/*.mp3")):
    try: out.append(analyse(p)); print(out[-1]["file"],out[-1]["dur"],out[-1]["bpm"],file=sys.stderr)
    except Exception as e: print("!",p,e,file=sys.stderr)
json.dump(out,open("analysis.json","w"),indent=1)
