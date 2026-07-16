#!/usr/bin/env python3
"""
Publish a post to X via the OFFICIAL X API (OAuth 1.0a) — with optional image.

This is the sanctioned path. Unlike replaying the web endpoints, it does NOT trip
X's anti-automation block (error 226): posting your own content programmatically
is exactly what the API is for. Stable, no transaction-id forging, no recapturing.

CREDENTIALS  (input/x/api.env — gitignored; from your X developer App, OAuth 1.0a Read+Write):
    X_API_KEY=...            # App API Key (consumer key)
    X_API_SECRET=...         # App API Secret (consumer secret)
    X_ACCESS_TOKEN=...       # @ironpal_co Access Token
    X_ACCESS_SECRET=...      # @ironpal_co Access Token Secret

COST: pay-per-use (~$0.015 / text post, $0.20 if it contains a link). Needs a
small prepaid credit balance — a $0.00 balance will 403 with a payments error.

USAGE:
    python scripts/x/publish_x_api.py --text "hi" --dry-run
    python scripts/x/publish_x_api.py --text-file post.txt \
        --image feed/batch2/images/p02_pov_montage.jpg --alt "..."
"""

import argparse
import sys
from pathlib import Path

import requests
from requests_oauthlib import OAuth1

REPO = Path(__file__).resolve().parents[2]
ENV = REPO / "input/x/api.env"

UPLOAD_URL = "https://upload.x.com/1.1/media/upload.json"
ALT_URL = "https://api.x.com/1.1/media/metadata/create.json"
TWEET_URL = "https://api.x.com/2/tweets"


def load_env(path: Path) -> dict:
    if not path.is_file():
        raise SystemExit(
            f"Missing {path}\n"
            "Create it with X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_SECRET\n"
            "from your X developer App (OAuth 1.0a, Read+Write)."
        )
    env = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def make_auth(env: dict) -> OAuth1:
    need = ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"]
    missing = [k for k in need if not env.get(k)]
    if missing:
        raise SystemExit(f"input/x/api.env missing: {', '.join(missing)}")
    return OAuth1(env["X_API_KEY"], env["X_API_SECRET"],
                  env["X_ACCESS_TOKEN"], env["X_ACCESS_SECRET"])


def _ok(resp, label):
    if resp.status_code not in (200, 201):
        print(f"\n✗ {label} -> HTTP {resp.status_code}\n{resp.text[:700]}", file=sys.stderr)
        if resp.status_code in (402, 403) and ("payment" in resp.text.lower() or "credit" in resp.text.lower()):
            print("\n→ Looks like a credits/payment issue: top up a small balance in the X developer console.", file=sys.stderr)
        sys.exit(1)
    return resp


def upload_media(path: Path, auth) -> str:
    with path.open("rb") as f:
        r = _ok(requests.post(UPLOAD_URL, auth=auth, files={"media": f}, timeout=120), "media upload")
    mid = r.json()["media_id_string"]
    print(f"  uploaded {path.name} -> media_id={mid}")
    return mid


def set_alt(media_id: str, alt: str, auth):
    _ok(requests.post(ALT_URL, auth=auth,
                      json={"media_id": media_id, "alt_text": {"text": alt}}, timeout=30), "alt text")
    print("  alt text set")


def main():
    ap = argparse.ArgumentParser(description="Publish to X via the official API.")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--text")
    src.add_argument("--text-file")
    ap.add_argument("--image")
    ap.add_argument("--alt")
    ap.add_argument("--env", default=str(ENV))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    text = Path(args.text_file).read_text().rstrip("\n") if args.text_file else args.text
    weighted = sum(2 if ord(c) > 0x1F000 else 1 for c in text)
    if weighted > 280:
        print(f"⚠️  ~{weighted} weighted chars (> 280) — non-Premium will reject it.", file=sys.stderr)

    print("── post ──")
    print(f"  text ({weighted} wchars):\n    " + text.replace("\n", "\n    "))
    if args.image:
        img = Path(args.image)
        if not img.is_file():
            raise SystemExit(f"image not found: {img}")
        print(f"  image: {img} ({img.stat().st_size} bytes)" + (f"  alt: {bool(args.alt)}"))

    if args.dry_run:
        load_env(Path(args.env)) if Path(args.env).is_file() else print("  (no api.env yet — dry-run only)")
        print("\n[dry-run] not sent.")
        return

    auth = make_auth(load_env(Path(args.env)))

    payload = {"text": text}
    if args.image:
        print("── media ──")
        mid = upload_media(Path(args.image), auth)
        if args.alt:
            set_alt(mid, args.alt, auth)
        payload["media"] = {"media_ids": [mid]}

    print("── create tweet ──")
    r = _ok(requests.post(TWEET_URL, auth=auth, json=payload, timeout=30), "create tweet")
    tid = r.json()["data"]["id"]
    print(f"✅ posted: https://x.com/ironpal_co/status/{tid}")


if __name__ == "__main__":
    main()
