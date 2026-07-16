# X (Twitter) Automated Posting Workflow (Playwright)

**Date:** 2026-06-30
**Method:** Headless Browser Automation (Playwright)
**Objective:** Programmatically publish posts (text + media + ALT text) to the `@ironpal_co` X account using the native web app interface, thereby avoiding Official API per-post costs and successfully bypassing the Error 226 anti-automation block.

---

## 1. Overview

Because X's web app blocks raw HTTP request replays (Error 226) due to dynamic, single-use `x-client-transaction-id` tokens, we use **Playwright** to run a real, headless Chromium browser. This allows X's native JavaScript to generate the necessary anti-bot tokens naturally, exactly as it does for human users.

## 2. Prerequisites & Setup

### Environment Requirements
- Python 3.10+
- Playwright:
  ```bash
  pip install playwright
  playwright install chromium
  ```

### Key Files
| File | Purpose |
|------|---------|
| `input/x/create_tweet.curl` | Raw cURL containing valid session cookies (used to derive auth state). |
| `input/x/browser_state.json` | Generated authenticated session state used by Playwright to bypass login/CAPTCHAs. |
| `scripts/x/create_browser_state.py` | Utility to convert the cURL cookies into the JSON state. |
| `scripts/x/publish_x_playwright.py` | The main execution script that navigates the DOM and creates the post. |

---

## 3. Workflow Steps

### Step 1: Authentication State Generation
Before automation can run, it must have a valid logged-in session.
1. Obtain an authenticated cURL request from your browser containing the `-b` cookie flag (saved to `input/x/create_tweet.curl`).
2. Run the state generator:
   ```bash
   python3 scripts/x/create_browser_state.py
   ```
   *This extracts `auth_token` and `ct0` cookies and outputs `browser_state.json`.*

### Step 2: Running the Automation
Execute the main script, passing in the text, image, and ALT text:
```bash
python3 scripts/x/publish_x_playwright.py
```

### Step 3: Inside the Playwright Execution Flow
The `publish_x_playwright.py` script performs the following DOM-level interactions:
1. **Initialize Engine:** Launches headless Chromium injecting `browser_state.json`.
2. **Navigate:** Goes directly to the composer URL: `https://x.com/compose/tweet` (waiting for `domcontentloaded`).
3. **Upload Media:** Locates `input[data-testid='fileInput']` and attaches the local image file.
4. **Insert ALT Text:**
   - Clicks the `"text=Add description"` button over the image thumbnail.
   - Types the ALT text into the automatically focused modal textarea constraint.
   - Clicks `"text=Save"`.
5. **Draft Tweet:** Locates the main editor `[data-testid='tweetTextarea_0']`, clicks it to focus, and types the tweet text using a synthesized delay (e.g., `delay=10` ms) to mimic human keystrokes.
6. **Publish:** Clicks `[data-testid='tweetButton']`.
7. **Verify:** Pauses to confirm the `[data-testid='toast']` confirmation element appears, then cleans up and closes the browser context.

---

## 4. Constraints & Guardrails

- **Character Limit:** The Playwright approach respects the native 280-character limit. If a text string exceeds this, the `"Post"` button remains disabled and the script will time out. *Make sure all drafted posts fit the limit.*
- **DOM Stability:** The script relies on specific DOM elements (e.g., `data-testid`). If X drastically updates their UI, these selectors in `publish_x_playwright.py` will need to be updated.
- **Timing:** Liberal `time.sleep()` and `wait_for_timeout()` functions are used. Do not remove these, as modern SPAs like X rely heavily on asynchronous event lifecycles. Rushing the inputs will cause dropped states.
- **Rate Limiting:** Run this sequentially (one post at a time). Headless typing takes actual elapsed time. Avoid bursting the script constantly to prevent X from flagging the session.