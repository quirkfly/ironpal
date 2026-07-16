# Troubleshooting — Automated Post Publishing to X (@ironpal_co)

**Date:** 2026-06-30
**Status:** ❌ Blocked on the chosen approach (web-app request replay). ✅ A working alternative exists (official API) but is not yet enabled.
**Goal:** Publish IronPal build-log posts (text + image) to **@ironpal_co** programmatically, **without** the official developer API (to avoid per-post cost), by replaying the browser's own web-app requests.

---

## 1. Issue summary

We tried to automate posting by **replaying the X web app's own network requests** (captured from Chrome DevTools) from a Python script. Media upload works, but the final "create tweet" call is **actively blocked by X's anti-automation system (error 226)**. This block is **not fixable by re-capturing** and the only known bypass is **forging X's anti-bot request signature**, which is detection-evasion against X's abuse-prevention controls and reliably leads to **account suspension**. The approach is therefore a dead end.

---

## 2. Environment & artifacts

| Item | Path | Notes |
|---|---|---|
| Replay script | `scripts/x/publish_to_x.py` | Built; works up to the blocked step |
| Official-API script | `scripts/x/publish_x_api.py` | Built; ready once tokens are added (the working path) |
| Sanitized HAR | `input/x/publish_post_01.har` | From Chrome "Copy all as HAR (sanitized)" — **no credentials** |
| CreateTweet cURL | `input/x/create_tweet.curl` | Chrome "Copy as cURL" — **has** cookie + auth |
| Media INIT cURL | `input/x/upload.json` | Chrome "Copy as cURL" of the upload INIT |
| Target image | `feed/batch2/images/p02_pov_montage.jpg` | 307,568 bytes |

> 🔒 All of `input/x/` is gitignored — those files contain the live session (`auth_token`, `ct0`, bearer). They must never be committed or pasted publicly.

Account context: **@ironpal_co** is brand new (0 followers, 1 post). The X developer account exists but is on **pay-per-use with a $0.00 balance**.

---

## 3. What was attempted (chronological)

### Step 1 — HAR-only replay → blocked (no credentials)
Chrome's HAR export ("Copy all as HAR (**sanitized**)") strips sensitive headers. Inspection confirmed **zero cookies, no `authorization`, no `auth_token`/`ct0`** anywhere in the HAR. A replay built only from the HAR cannot authenticate (would 401/403).
- **Finding:** modern Chrome only offers *sanitized* HAR export; you cannot get a credentialed HAR from Chrome.

### Step 2 — Use cURL for creds + HAR for body
- `create_tweet.curl` ("Copy as cURL") **does** include credentials (cookie via `-b`, bearer via `-H authorization`).
- But Chrome emits the request **body** in bash ANSI-C quoting (`--data-raw $'...'`), which fails to JSON-parse directly.
- **Resolution:** split sources — take **credentials + headers from the cURL**, take the **clean JSON body template from the sanitized HAR** (`request.postData.text` parses fine). Implemented in `publish_to_x.py`.
- **Dry-run result:** request constructed correctly — URL, all auth bits present (`cookie`, `authorization`, `x-csrf-token`, `x-client-transaction-id`), body with `tweet_text` swapped.

### Step 3 — Add media (image) support
- `input/x/upload.json` is the cURL of the upload **INIT** (`https://upload.x.com/i/media/upload.json`, `command=INIT`, `media_category=tweet_image`).
- Implemented the full chunked flow myself (INIT → APPEND → FINALIZE [→ STATUS]) reusing the upload-session creds; added alt-text via `media/metadata/create.json`.
- **Bug fixed:** X's upload returns **HTTP 202 Accepted** (the status check initially only accepted 200/201/204).
- **Real test (`--upload-only`, no public post):**
  ```
  ── media upload ──
    INIT  ok  media_id=2071936415840002048  (307568 bytes)
    APPEND ok
    FINALIZE ok
  ✅ upload-only complete. (not posted; media expires unused.)
  ```
- **Finding:** ✅ **Media upload works.** Uploads are not anti-automation-gated.

### Step 4 — Full publish attempt → BLOCKED by error 226
Ran the complete flow (upload + alt + CreateTweet) for Post 02. Media uploaded; the tweet-creation call returned:

```
── response ── HTTP 200
{"data":{},"errors":[{"code":226,
  "message":"Authorization: This request looks like it might be automated. To protect
   our users from spam and other malicious activity, we can't complete this action right
   now. Please try again later. (226)",
  "name":"AuthorizationError","kind":"Permissions","path":["create_tweet"]}]}
```

- **HTTP 200, but a GraphQL-level error 226** — X accepted the request and then *refused the action* as automated. **Nothing was posted.**

---

## 4. Root-cause analysis

**Error 226 is X's anti-automation / anti-spam defense.** The create-tweet action is detected as bot-originated and refused.

The decisive signal is the **`x-client-transaction-id`** header:
- X generates it client-side per request via obfuscated JavaScript (reading an on-page verification animation + the `ondemand.s` script).
- It is **single-use**: the browser consumes it on the real post that produced it.
- Therefore **any value taken from a capture is already "spent"** → replaying it is a stale/invalid token → a strong automation signal → **226 every time.**

**This is why re-capturing cannot fix it:** a freshly captured cURL's transaction-id was already burned by the genuine browser post that generated the capture. There is no capture that yields a reusable, valid token for a replayed request. This is a structural property, not a transient glitch.

**The only way past 226** is to *generate a fresh, valid `x-client-transaction-id` per request* — i.e., replicate X's anti-bot signing algorithm.

---

## 5. Why we are not pursuing the bypass

Building a transaction-id generator to defeat error 226 is rejected on two independent grounds:

1. **It is detection-evasion against a platform's abuse-prevention control.** Error 226 exists explicitly to stop automated/spam activity; forging the signature to slip past it is circumventing that security control. We will not build that.
2. **It reliably gets accounts suspended.** Repeatedly tripping/bypassing 226 is precisely what leads X to **lock or ban** an account. It would endanger **@ironpal_co** — the exact asset this effort is meant to build. "Make the replay work" and "keep the account" are mutually exclusive.

Additionally: **retrying the blocked request is itself harmful** — hammering a 226 escalates toward an account lock. We stopped after the first confirmed 226 rather than retrying.

---

## 6. Current state

| Component | State |
|---|---|
| Request construction (URL, headers, body, auth forwarding) | ✅ Works |
| Media upload (INIT/APPEND/FINALIZE + alt text) | ✅ Works |
| **Create tweet via web-app replay** | ❌ **Blocked by error 226 (unfixable without evasion)** |
| Post 02 | **Not published** (the 226 blocked it; nothing went live) |
| Official-API script (`publish_x_api.py`) | ✅ Built, dry-run-validated; needs one-time tokens + credits |

---

## 7. Next steps / recommendations

### ✅ Recommended — Official X API (OAuth 1.0a)  *(sanctioned automation; no 226)*
Posting your own content via the API is the intended, supported path and **does not trip 226**. Script already written: `scripts/x/publish_x_api.py`.
**One-time setup (≈5 min, then permanent):**
1. developer.x.com → App → **User authentication settings = Read and Write** (do this *before* generating tokens).
2. App → **Keys and tokens** → copy **API Key/Secret** + **Access Token/Secret** (Read+Write).
3. `cp input/x/api.env.example input/x/api.env` and fill in the 4 values.
4. **Billing:** top up a small balance (~$5; pay-per-use is ~$0.015/text post). A $0.00 balance returns a payments 403.
5. Run:
   ```bash
   python3 scripts/x/publish_x_api.py --text-file /tmp/post02.txt \
     --image feed/batch2/images/p02_pov_montage.jpg --alt "…"
   ```
**Trade-off:** small per-post cost; one-time token setup that only the account owner can do (credentials live behind the logged-in dev portal).

### ✅ Fallback — Manual posting via the web app  *(free, zero risk, today)*
Paste the (≤280-char) text, attach the image, hit Post — ~60 seconds. This *is* the web app, no API, no cost, no ban risk. Optional: a legitimate **"stage next post" helper** (drops post text on the clipboard + opens the image file) to make manual posting paste-and-drag fast — no API, no evasion.

### ❌ Not recommended — Bypass error 226
Forging `x-client-transaction-id` to defeat anti-automation: detection-evasion + reliable account suspension + fragile arms race (X changes the algorithm). Out of scope.

---

## 8. Resources / support needed

- **For the API path:** access to the X developer portal (App permissions + token generation) and a small prepaid credit balance. Both are one-time and only the account owner can do them.
- **For the manual path:** nothing — works now. (Optionally request the staging helper.)
- **Reference:** `docs/ironpal-social-media-automation-plan.md` §4 (API setup), `docs/ironpal-twitter-posts.md` (the post copy + images), this document for the rationale.

---

## 9. Key takeaways

1. The web-app replay approach is **fundamentally blocked** by X's anti-automation (error 226), proven empirically — not a fixable bug.
2. **Re-capturing HARs/cURLs cannot help** — the gating token is single-use.
3. The **only** bypass is anti-bot evasion, which is out of scope and account-suicidal.
4. **Working paths:** the official API (cheap, sanctioned, set-once) or manual web posting (free). Both avoid 226 entirely.
