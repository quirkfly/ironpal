#!/usr/bin/env python3
"""Generate the K8 squat figure via the Leonardo API — three candidates, choose one by hand.

Follows ../rrr/scripts/leonardo_gen.py (POST /generations, poll, download). The prompt is READ
FROM THE DESIGN PLAN's blockquote so the plan stays the single source of truth: edit the plan,
re-run, and the generation follows.

  python3 scripts/k8/leonardo_gen.py            # 3 images -> input/kickstarter/k8/leonardo/
  python3 scripts/k8/leonardo_gen.py --num 1    # cheaper test
"""
import argparse, json, os, re, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PLAN = os.path.expanduser("~/job_stuff/prj/geggen/products/ironpal/clips/K8_design_plan.md")
KEY = open(os.path.join(ROOT, "credentials/leonardo_api_key")).read().strip()
BASE = "https://cloud.leonardo.ai/api/rest/v1"
OUT = os.path.join(ROOT, "input/kickstarter/k8/leonardo")

MODEL_ID = "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3"   # Phoenix 1.0 (GET /platformModels, 2026-09-30)
NEGATIVE = ("standing upright, straight legs, deadlift, bar at hips, bar at waist, bar in front "
            "of body, facing right, front view, facing camera, text, letters, numbers, watermark, "
            "logo, caption, multiple people, extra limbs, deformed hands, six fingers, blurry, "
            "cropped, cut off, bright studio, white background")

def api(method, path, body=None):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body else None,
                                 method=method)
    req.add_header("authorization", "Bearer " + KEY)
    req.add_header("accept", "application/json")
    if body: req.add_header("content-type", "application/json")
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code in (429, 500, 502, 503) and attempt < 3: time.sleep(5 * (attempt + 1)); continue
            print(f"  HTTP {e.code}: {msg}", file=sys.stderr); return None
        except Exception as e:  # noqa: BLE001
            if attempt < 3: time.sleep(5); continue
            print(f"  ERR {e}", file=sys.stderr); return None

def prompt_from_plan():
    """The prompt is the blockquote under '**Prompt**' in the plan — one paragraph, '> ' lines."""
    txt = open(PLAN, encoding="utf-8").read()
    block = txt.split("**Prompt**", 1)[1]
    lines = []
    for line in block.splitlines()[1:]:
        if line.startswith(">"): lines.append(line.lstrip("> ").rstrip())
        elif lines: break
    return " ".join(lines)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--num", type=int, default=3)
    args = ap.parse_args()
    prompt = prompt_from_plan()
    print(f"prompt ({len(prompt.split())} words): {prompt[:90]}…")
    body = {"modelId": MODEL_ID, "prompt": prompt, "negative_prompt": NEGATIVE,
            "width": 768, "height": 1024, "num_images": args.num,
            "alchemy": True, "contrast": 3.5, "public": False}
    r = api("POST", "/generations", body)
    if not r or "sdGenerationJob" not in r:
        sys.exit(f"generation request failed: {r}")
    job = r["sdGenerationJob"]; gid = job["generationId"]
    print(f"generation {gid}  apiCreditCost={job.get('apiCreditCost')}")
    urls = []
    for _ in range(60):
        time.sleep(4)
        g = api("GET", f"/generations/{gid}") or {}
        gen = g.get("generations_by_pk") or {}
        if gen.get("status") == "COMPLETE":
            urls = [im["url"] for im in gen.get("generated_images", [])]; break
        if gen.get("status") == "FAILED": sys.exit("generation FAILED")
    if not urls: sys.exit("timed out polling")
    os.makedirs(OUT, exist_ok=True)
    ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"
    saved = []
    for i, u in enumerate(urls):
        dest = os.path.join(OUT, f"squat_b2_{i+1}.jpg")
        req = urllib.request.Request(u, headers={"User-Agent": ua, "Accept": "image/*"})
        with urllib.request.urlopen(req, timeout=60) as rr, open(dest, "wb") as f: f.write(rr.read())
        saved.append(dest)
    json.dump({"generationId": gid, "model": MODEL_ID, "apiCreditCost": job.get("apiCreditCost"),
               "prompt": prompt, "negative": NEGATIVE, "files": saved},
              open(os.path.join(OUT, "generation_b2.json"), "w"), indent=1)
    print(f"saved {len(saved)} image(s) to {OUT}")

if __name__ == "__main__":
    main()
