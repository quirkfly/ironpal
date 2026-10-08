# Renders the BackerKit pre-launch graphics (banner, section headers, film card, app-concept panel) into docs/crowdfunding/media/backerkit/ with headless Chrome. Re-run after editing copy.
import os,subprocess
R="/home/quirkfly/job_stuff/prj/ironpal"; S="/tmp/claude-1000/-home-quirkfly-job-stuff-prj-ironpal/94c8a55b-f5c8-4901-a849-a9ef3e77f3db/scratchpad/gfx"; O="/home/quirkfly/job_stuff/prj/ironpal/docs/crowdfunding/media/backerkit"
F=f"""@font-face{{font-family:M;src:url(file://{R}/web/node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2)}}
@font-face{{font-family:I;src:url(file://{R}/web/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2)}}
html,body{{margin:0;overflow:hidden;background:#0e0e18}}"""
MARK='<svg viewBox="0 0 24 24" class="mk"><path fill="#00E5CC" d="M 8.629 20.345 A 9.0 9.0 0 1 1 15.371 20.345 L 14.360 17.841 A 6.3 6.3 0 1 0 9.640 17.841 Z"/><circle cx="12" cy="7.65" r="1.725" fill="#00E5CC"/></svg>'
A=f"{R}/docs/pitch_deck/assets"
def render(name,w,h,body,css=""):
    p=f"{S}/{name}.html"; open(p,"w").write(f"<!doctype html><meta charset=utf-8><style>{F} html,body{{{{width:{w}px;height:{h}px}}}} .wrap{{{{position:relative;width:{w}px;height:{h}px;overflow:hidden}}}} {css}</style><div class=wrap>{body}</div>")
    subprocess.run(["google-chrome","--headless=new","--disable-gpu","--hide-scrollbars","--allow-file-access-from-files",f"--window-size={w},{h+200}",f"--screenshot={S}/{name}_raw.png",f"file://{p}"],stderr=subprocess.DEVNULL,stdout=subprocess.DEVNULL)
    subprocess.run(["convert",f"{S}/{name}_raw.png","-crop",f"{w}x{h}+0+0","+repage",f"{O}/{name}.png"])
# banner
render("banner",1920,1080,f"""<div class=bg></div><div class=sh></div><div class=c>{MARK}<div class=w>IronPal</div><h1>Your lifts, logged hands-free.</h1><p>A headband camera that sees each set the way you do.</p></div>""",
 f""".bg{{position:absolute;inset:0;background:url(file://{A}/close.jpg) center/cover}}.sh{{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(14,14,24,.55) 0,rgba(14,14,24,.88) 60%)}}
 .c{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#F0F4F8}}
 .mk{{width:120px;height:120px}}.w{{font:800 64px M;color:#00E5CC;margin:10px 0 26px;letter-spacing:1px}}h1{{font:800 92px/1.05 M;margin:0 0 22px}}p{{font:500 38px I;color:#cfd6e0;margin:0}}""")
# section headers
secs=[("hdr_problem","THE PROBLEM","Every set is three numbers. You type them by thumb.","typing.jpg"),
("hdr_meet","MEET IRONPAL","A headband camera + motion sensors, from your own point of view.","bandout.jpg"),
("hdr_today","WHAT WORKS TODAY","Exercise recognition and rep counting, on the device.","squat.jpg"),
("hdr_building","WHAT WE'RE BUILDING","Reading the weight off the bar. The hard part, in development.","cover.jpg"),
("hdr_privacy","PRIVACY","Reps on your phone, offline. One frame for weight, then deleted.","walk.jpg"),
("hdr_founder","WHO'S BEHIND IT","Peter Dermek · software developer and hybrid athlete · Bratislava","../../../web/public/assets/peter/peter-talking.jpg")]
for n,t,s,img in secs:
    render(n,1440,440,f"""<div class=ph></div><div class=g></div><div class=c><div class=k>{MARK}<span>IRONPAL</span></div><h2>{t}</h2><p>{s}</p></div><div class=bar></div>""",
     f""".ph{{position:absolute;right:0;top:0;width:62%;height:100%;background:url(file://{A}/{img}) center 30%/cover}}
     .g{{position:absolute;inset:0;background:linear-gradient(90deg,#0e0e18 0,#0e0e18 38%,rgba(14,14,24,.7) 52%,rgba(14,14,24,.05) 78%)}}
     .c{{position:absolute;left:80px;top:50%;transform:translateY(-50%);max-width:820px}}.k{{display:flex;align-items:center;gap:12px;font:700 22px M;color:#9aa0b4;letter-spacing:3px;margin-bottom:18px}}.mk{{width:30px;height:30px}}
     h2{{font:800 72px/1 M;color:#F0F4F8;margin:0 0 18px;letter-spacing:-1px}}p{{font:500 26px/1.35 I;color:#00E5CC;margin:0}}.bar{{position:absolute;left:0;bottom:0;height:8px;width:100%;background:linear-gradient(90deg,#00E5CC,#0fb6a6 40%,transparent)}}""")
# film card
render("film_card",1440,810,f"""<div class=bg></div><div class=sh></div><div class=pl><div class=tri></div></div><div class=t>WATCH THE FILM</div><div class=s>1:28 · youtube.com</div>""",
 f""".bg{{position:absolute;inset:0;background:url(file://{R}/web/public/video/hero-poster.jpg) center/cover}}.sh{{position:absolute;inset:0;background:rgba(14,14,24,.45)}}
 .pl{{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:170px;height:170px;border-radius:50%;background:#00E5CC;box-shadow:0 10px 40px rgba(0,0,0,.5)}}
 .tri{{position:absolute;left:64px;top:46px;border-left:62px solid #0e0e18;border-top:39px solid transparent;border-bottom:39px solid transparent}}
 .t{{position:absolute;left:0;right:0;top:64%;text-align:center;font:800 56px M;color:#F0F4F8;letter-spacing:2px}}.s{{position:absolute;left:0;right:0;top:74%;text-align:center;font:500 24px I;color:#cfd6e0}}""")
# app concept panel
render("app_concept",1440,980,f"""<div class=row><img src="file://{A}/screen_live.png"><img src="file://{A}/screen_form.png"></div><div class=cap>PRODUCT INTERFACE CONCEPT · live rep counting and squat-depth form tracking · weight reading is in development</div>""",
 """body{background:linear-gradient(180deg,#141428,#0e0e18)}.row{display:flex;gap:70px;justify-content:center;padding-top:50px}img{height:780px;border-radius:28px;box-shadow:0 20px 60px rgba(0,0,0,.6);border:2px solid #2D2D3A}
 .cap{margin-top:56px;text-align:center;font:600 22px I;color:#9aa0b4;letter-spacing:1px}""")
