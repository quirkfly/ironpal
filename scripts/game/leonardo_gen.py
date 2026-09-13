#!/usr/bin/env python3
"""Generate IronPal Campaign game assets via the Leonardo AI API.

Adapted from ../reddy/scripts/leonardo_gen.py (same account, same proven SDXL config).
  - prompts come from docs/ironpal-game-asset-prompts.md as `id: prompt` lines under `## <section>`
  - raw output: input/game-assets/leonardo/<id>/<id>_<n>.png   (gitignored, paid)
  - resumable: ids that already have a file are skipped
  - CREDIT FLOOR: refuses to start, and stops between images, once the account balance
    would fall below MIN_REMAINING. The account is shared with Reddy; this floor leaves
    Reddy its remaining budget.

Usage:
  python3 scripts/game/leonardo_gen.py --balance
  python3 scripts/game/leonardo_gen.py --only hud_hitmarker
  python3 scripts/game/leonardo_gen.py --section hud
  python3 scripts/game/leonardo_gen.py --section backdrops --wide
  python3 scripts/game/leonardo_gen.py --all            # every section, backdrops wide
"""
import argparse, json, os, re, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KEY = open(os.path.join(ROOT, "credentials/leonardo_api_key")).read().strip()
BASE = "https://cloud.leonardo.ai/api/rest/v1"
OUT = os.path.join(ROOT, "input/game-assets/leonardo")
PROMPTS = os.path.join(ROOT, "docs/ironpal-game-asset-prompts.md")

# SDXL 1.0 — the config proven on Reddy's 118-card deck.
MODEL_ID = "1e60896f-3c26-4296-8ecc-53e2afecc132"
WIDE_SECTIONS = {"backdrops"}

MIN_REMAINING = 2500

NEGATIVE = ("text, letters, words, numbers, typography, watermark, signature, logo of a real game, "
            "Counter-Strike, Wolfenstein, gun, rifle, pistol, knife, weapon, blood, gore, soldier, "
            "person, face, hands, photo, photorealistic, blurry, cropped, cut off, cluttered, "
            "multiple objects, low contrast, washed out, noise, 3d render, perspective, floor, ground plane, "
            "reflection, gradient background, grey background, studio backdrop, crystal, blade, spike, "
            "isometric, depth of field")


def api(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("authorization", "Bearer " + KEY)
    req.add_header("accept", "application/json")
    if data:
        req.add_header("content-type", "application/json")
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(5 * (attempt + 1)); continue
            print("  HTTP %s: %s" % (e.code, msg), file=sys.stderr)
            return None
        except Exception as e:  # noqa: BLE001
            if attempt < 3:
                time.sleep(5); continue
            print("  ERR %s" % e, file=sys.stderr)
            return None


def balance():
    r = api("GET", "/me")
    if not r:
        return None
    return r["user_details"][0].get("apiPaidTokens") or 0


def parse_prompts(section=None):
    txt = open(PROMPTS, encoding="utf-8").read()
    out, cur, in_block = [], None, False
    for line in txt.splitlines():
        if line.startswith("## "):
            cur = line[3:].strip().split()[0].lower()
        if line.startswith("```"):
            in_block = not in_block
            continue
        if in_block and (section is None or cur == section):
            m = re.match(r'^([a-z0-9_]+):\s+(.*\S)\s*$', line)
            if m:
                out.append((cur, m.group(1), m.group(2)))
    return out


def generate(wid, prompt, num=1, size=1024, wide=False):
    w, h = (1360, 768) if wide else (size, size)
    body = {
        "modelId": MODEL_ID, "prompt": prompt, "negative_prompt": NEGATIVE,
        "width": w, "height": h, "num_images": num,
        "presetStyle": "ILLUSTRATION", "alchemy": False,
        "guidance_scale": 7, "public": False,
    }
    r = api("POST", "/generations", body)
    if not r or "sdGenerationJob" not in r:
        print("  %s: request failed: %s" % (wid, r), file=sys.stderr); return []
    gid = r["sdGenerationJob"]["generationId"]
    for _ in range(45):
        time.sleep(4)
        g = api("GET", "/generations/%s" % gid)
        if not g:
            continue
        gen = g.get("generations_by_pk") or {}
        if gen.get("status") == "COMPLETE":
            return [im["url"] for im in gen.get("generated_images", [])]
        if gen.get("status") == "FAILED":
            print("  %s: FAILED" % wid, file=sys.stderr); return []
    print("  %s: timed out" % wid, file=sys.stderr); return []


UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/124.0 Safari/537.36")


def download(wid, urls):
    d = os.path.join(OUT, wid)
    os.makedirs(d, exist_ok=True)
    saved = []
    for i, u in enumerate(urls):
        ext = ".jpg" if ".jpg" in u.split("?")[0] else ".png"
        dest = os.path.join(d, "%s_%d%s" % (wid, i, ext))
        for attempt in range(3):
            try:
                req = urllib.request.Request(u, headers={"User-Agent": UA, "Accept": "image/*"})
                with urllib.request.urlopen(req, timeout=90) as r, open(dest, "wb") as f:
                    f.write(r.read())
                saved.append(dest); break
            except Exception as e:  # noqa: BLE001
                if attempt < 2:
                    time.sleep(3); continue
                print("  %s: download %d failed %s" % (wid, i, e), file=sys.stderr)
    return saved


def has_image(wid):
    d = os.path.join(OUT, wid)
    return os.path.isdir(d) and bool(os.listdir(d))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only"); ap.add_argument("--section")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--num", type=int, default=1)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--size", type=int, default=1024)
    ap.add_argument("--balance", action="store_true")
    ap.add_argument("--wide", action="store_true", help="force 16:9 output")
    ap.add_argument("--floor", type=int, default=MIN_REMAINING)
    args = ap.parse_args()

    bal = balance()
    print("API credits: %s" % bal)
    if args.balance:
        return
    if bal is None:
        print("cannot read balance — refusing to spend", file=sys.stderr); sys.exit(1)

    prompts = parse_prompts(None if args.all else args.section)
    if args.only:
        prompts = [p for p in prompts if p[1] == args.only]
    prompts = [p for p in prompts if not has_image(p[1])]
    if args.limit:
        prompts = prompts[:args.limit]
    if not prompts:
        print("nothing to do (all present?)"); return

    print("%d image(s) to generate, floor %d credits" % (len(prompts), args.floor))
    done, start = 0, bal
    for section, wid, prompt in prompts:
        bal = balance()
        if bal is not None and bal <= args.floor:
            print("BUDGET FLOOR reached (%s <= %s) — stopping." % (bal, args.floor))
            break
        wide = args.wide or section in WIDE_SECTIONS
        urls = generate(wid, prompt, args.num, args.size, wide)
        saved = download(wid, urls) if urls else []
        print("%-24s %d image(s)   [credits before %s]" % (wid, len(saved), bal))
        done += 1
    end = balance()
    print("DONE %d, credits %s -> %s (spent %s)" % (done, start, end, (start or 0) - (end or 0)))


if __name__ == "__main__":
    main()
