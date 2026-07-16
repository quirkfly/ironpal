#!/usr/bin/env python3
"""
Publish an arbitrary post to X (@ironpal_co), with optional image, by replaying
captured session requests.

SOURCES (all under input/x/, gitignored — they hold your live session):
  * input/x/create_tweet.curl  -> CreateTweet creds + headers (Chrome "Copy as cURL")
  * input/x/publish_post_01.har -> clean JSON body template (sanitized HAR)
  * input/x/upload.json         -> media-upload (INIT) creds + endpoint (Chrome "Copy as cURL")

Chrome's HAR is sanitized (no cookies); its "Copy as cURL" keeps them but emits
the BODY as bash ANSI-C ($'...'), so we take the body template from the HAR and
the credentials/headers from the cURLs.

MEDIA: replays X's chunked v1.1 upload (INIT -> APPEND -> FINALIZE [-> STATUS])
using the upload-session creds, sets alt text, then attaches the media_id to the
CreateTweet.

SECURITY: never prints cookie / authorization / csrf values. Treat input/x/ as
secrets. Rotate (re-login) if they leak.

CAVEATS (honest): replays X's PRIVATE endpoints with your session — against X's
automation ToS (sanctioned path = paid API); risk of @ironpal_co suspension. The
captured x-client-transaction-id is single-use-ish (X may 403 a reuse); cookies
rotate — re-capture when they do.

USAGE:
  python scripts/x/publish_to_x.py --text "hi" --dry-run
  python scripts/x/publish_to_x.py --text-file post.txt --image feed/batch2/images/p02_pov_montage.jpg --alt "..."
  python scripts/x/publish_to_x.py --image feed/batch2/images/p02_pov_montage.jpg --upload-only   # safe: uploads, no public post
"""

import argparse
import json
import re
import shlex
import sys
import time
from pathlib import Path

import requests

REPO = Path(__file__).resolve().parents[2]
DEFAULT_CURL = REPO / "input/x/create_tweet.curl"
DEFAULT_HAR = REPO / "input/x/publish_post_01.har"
DEFAULT_UPLOAD_CURL = REPO / "input/x/upload.json"

DROP_GQL = {"content-length", "host", "accept-encoding"}
# media upload posts are form/multipart and don't want a stale per-request txn id
DROP_UPLOAD = {"content-type", "content-length", "host", "accept-encoding", "x-client-transaction-id"}
SECRET_HEADERS = {"cookie", "authorization", "x-csrf-token"}


def parse_curl(curl_path: Path):
    """(url, headers_dict, cookie_str) from a Chrome 'Copy as cURL'.

    Drops everything from --data onward (the ANSI-C body) before tokenizing.
    """
    text = curl_path.read_text()
    head = re.split(r"--data(?:-raw|-binary|-ascii)?\b", text, maxsplit=1)[0]
    head = re.sub(r"\\\n", " ", head).strip().rstrip("\\").strip()
    tokens = shlex.split(head)
    if not tokens or tokens[0] != "curl":
        raise SystemExit(f"Not a curl command: {curl_path}")

    url, headers, cookie = None, {}, None
    i = 1
    while i < len(tokens):
        tok = tokens[i]
        if tok in ("-H", "--header"):
            i += 1
            name, _, value = tokens[i].partition(":")
            headers[name.strip().lower()] = value.strip()
        elif tok in ("-b", "--cookie"):
            i += 1
            cookie = tokens[i]
        elif tok in ("-X", "--request"):
            i += 1  # skip the method value
        elif tok.startswith("-"):
            pass  # valueless flag (e.g. --compressed)
        elif url is None:
            url = tok
        i += 1

    if url is None:
        raise SystemExit(f"No URL found in {curl_path}")
    return url, headers, cookie


def load_body_template(har_path: Path) -> dict:
    har = json.loads(har_path.read_text())
    for entry in har["log"]["entries"]:
        if "/CreateTweet" in entry["request"]["url"]:
            return json.loads(entry["request"]["postData"]["text"])
    raise SystemExit("No CreateTweet entry in HAR")


def auth_headers(headers: dict, cookie: str, drop: set) -> dict:
    h = {k: v for k, v in headers.items() if k not in drop}
    if cookie:
        h["cookie"] = cookie
    return h


def _check(resp, label):
    if resp.status_code not in (200, 201, 202, 204):
        print(f"\n✗ {label} -> HTTP {resp.status_code}\n{resp.text[:600]}", file=sys.stderr)
        raise SystemExit(1)
    return resp


def upload_media(image_path: Path, base_url: str, headers: dict) -> str:
    """INIT -> APPEND -> FINALIZE [-> STATUS]; returns media_id_string."""
    data = image_path.read_bytes()
    total = len(data)
    mtype = "image/png" if image_path.suffix.lower() == ".png" else "image/jpeg"

    r = _check(requests.post(base_url, headers=headers, params={
        "command": "INIT", "total_bytes": total,
        "media_type": mtype, "media_category": "tweet_image"}, timeout=30), "INIT")
    media_id = r.json()["media_id_string"]
    print(f"  INIT  ok  media_id={media_id}  ({total} bytes)")

    _check(requests.post(base_url, headers=headers,
                         data={"command": "APPEND", "media_id": media_id, "segment_index": "0"},
                         files={"media": data}, timeout=120), "APPEND")
    print("  APPEND ok")

    r = _check(requests.post(base_url, headers=headers,
                             params={"command": "FINALIZE", "media_id": media_id}, timeout=30), "FINALIZE")
    info = r.json().get("processing_info")
    while info and info.get("state") in ("pending", "in_progress"):
        wait = info.get("check_after_secs", 1)
        print(f"  processing… {info.get('state')} (waiting {wait}s)")
        time.sleep(wait)
        r = _check(requests.get(base_url, headers=headers,
                                params={"command": "STATUS", "media_id": media_id}, timeout=30), "STATUS")
        info = r.json().get("processing_info")
    if info and info.get("state") == "failed":
        raise SystemExit(f"media processing failed: {info}")
    print("  FINALIZE ok")
    return media_id


def set_alt_text(media_id: str, alt: str, gql_headers: dict):
    url = "https://x.com/i/api/1.1/media/metadata/create.json"
    h = dict(gql_headers); h["content-type"] = "application/json"
    _check(requests.post(url, headers=h,
                         data=json.dumps({"media_id": media_id, "alt_text": {"text": alt}}),
                         timeout=30), "alt-text")
    print("  alt text set")


def main():
    ap = argparse.ArgumentParser(description="Publish a post (optionally with image) to X by replaying a captured session.")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--text")
    src.add_argument("--text-file")
    ap.add_argument("--image", help="image file to attach")
    ap.add_argument("--alt", help="alt text for the image")
    ap.add_argument("--curl", default=str(DEFAULT_CURL))
    ap.add_argument("--har", default=str(DEFAULT_HAR))
    ap.add_argument("--upload-curl", default=str(DEFAULT_UPLOAD_CURL))
    ap.add_argument("--upload-only", action="store_true", help="upload the image and print media_id; do NOT post (safe test)")
    ap.add_argument("--dry-run", action="store_true", help="build & validate; no network")
    args = ap.parse_args()

    text = Path(args.text_file).read_text().rstrip("\n") if args.text_file else args.text
    weighted = sum(2 if ord(c) > 0x1F000 else 1 for c in text)
    if weighted > 280:
        print(f"⚠️  ~{weighted} weighted chars (> 280) — non-Premium will reject it.", file=sys.stderr)

    gql_url, gql_h_raw, gql_cookie = parse_curl(Path(args.curl))
    gql_headers = auth_headers(gql_h_raw, gql_cookie, DROP_GQL)
    gql_headers.setdefault("content-type", "application/json")
    gql_headers["accept-encoding"] = "gzip, deflate"

    # ---- media ----
    media_id = None
    if args.image:
        img = Path(args.image)
        if not img.is_file():
            raise SystemExit(f"image not found: {img}")
        up_url, up_h_raw, up_cookie = parse_curl(Path(args.upload_curl))
        up_base = up_url.split("?")[0]
        up_headers = auth_headers(up_h_raw, up_cookie, DROP_UPLOAD)
        if args.dry_run:
            media_id = "<DRYRUN_MEDIA_ID>"
            print(f"  [dry-run] would upload {img} ({img.stat().st_size} bytes) to {up_base}")
        else:
            print("── media upload ──")
            media_id = upload_media(img, up_base, up_headers)
            if args.alt:
                set_alt_text(media_id, args.alt, gql_headers)

    if args.upload_only:
        print(f"\n✅ upload-only complete. media_id={media_id} (not posted; it expires unused).")
        return

    # ---- build CreateTweet body ----
    body = load_body_template(Path(args.har))
    body["variables"]["tweet_text"] = text
    if media_id:
        body["variables"]["media"] = {
            "media_entities": [{"media_id": media_id, "tagged_users": []}],
            "possibly_sensitive": False,
        }
    else:
        body["variables"].pop("media", None)
    payload = json.dumps(body, ensure_ascii=False)

    has = lambda h: "yes" if gql_headers.get(h) else "NO"
    print("── CreateTweet ──")
    print(f"  POST {gql_url}")
    print(f"  auth: cookie={has('cookie')} authorization={has('authorization')} "
          f"x-csrf-token={has('x-csrf-token')} txn-id={has('x-client-transaction-id')}")
    print(f"  media: {media_id or 'none (text-only)'}")
    print(f"  text ({weighted} wchars):\n    " + text.replace("\n", "\n    "))

    if args.dry_run:
        print("\n[dry-run] not sent.")
        return

    if not (gql_headers.get("cookie") and gql_headers.get("authorization")):
        raise SystemExit("Missing cookie/authorization — re-capture create_tweet.curl.")

    resp = requests.post(gql_url, headers=gql_headers, data=payload.encode("utf-8"), timeout=30)
    print(f"\n── response ── HTTP {resp.status_code}")
    if resp.status_code != 200:
        print(resp.text[:600]); sys.exit(1)
    try:
        rid = resp.json()["data"]["create_tweet"]["tweet_results"]["result"]["rest_id"]
        print(f"✅ posted: https://x.com/ironpal_co/status/{rid}")
    except Exception:
        print("posted (couldn't parse id):\n" + resp.text[:600])


if __name__ == "__main__":
    main()
