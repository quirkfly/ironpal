# Fixing Post Publishing Issue — Execution Plan

**Goal:** Establish a reliable, automated process for publishing posts to the @ironpal_co X account using the **web app API**, avoiding the Official X API and its associated per-post costs, while successfully navigating the Error 226 anti-automation block.

---

## 1. Executive Summary
Direct HTTP request replays of the Web App API failed due to the `x-client-transaction-id` token, which is generated dynamically via obfuscated client-side JavaScript (resulting in Error 226). Because the Official API constraint dictates avoiding it to save costs, the viable path forward is **Headless Browser Automation (e.g., Playwright or Selenium)**. This approach runs the actual X web app, allowing the browser's native JavaScript engine to generate the required anti-bot tokens and dispatch the web app API POST requests exactly as a real user would, perfectly satisfying the automation check logic.

---

## 2. Step-by-Step Resolution Process

### Step 1: Install Browser Automation Tools
1. Setup a Python environment dedicated to the browser automation task.
2. Install Playwright:
   ```bash
   pip install playwright
   playwright install chromium
   ```

### Step 2: Establish Authenticated Browser Context
1. Create a setup script `scripts/x/login_x_playwright.py` to launch a visible Playwright browser.
2. Manually log in to `@ironpal_co` once to handle any CAPTCHAs, 2FA, or email verification flows.
3. Save the resulting browser state (cookies, local storage) to a local, ignored file (e.g., `input/x/browser_state.json`) so subsequent headless runs can bypass the login screen.

### Step 3: Implement Web App API Automation Script
1. Deprecate `scripts/x/publish_to_x.py` (the HTTP replay approach).
2. Create `scripts/x/publish_x_playwright.py`.
3. In the script, load the authenticated `browser_state.json`.
4. Navigate to `https://x.com/compose/tweet`.
5. **Handle Media Upload:** Automate interaction with the media upload input element (`<input data-testid="fileInput" type="file">`) to attach the image file.
6. **Handle Text Input:** Automate typing the post text into the content-editable drafted area (`[data-testid="tweetTextarea_0"]`). Include artificial human-like delays.
7. **Handle Submission:** Target and click the "Post" button (`[data-testid="tweetButton"]`).

---

## 3. Required Tools & Software
- **Python 3:** The runtime environment.
- **Playwright (or Selenium):** The core automation framework utilized to host a real JS context.
- **`scripts/x/publish_x_playwright.py`:** The primary operational script integrating with the Web App.
- **Local State File (`input/x/browser_state.json`):** Persisted auth tokens for the headless session.

---

## 4. Potential Challenges & Strategies

| Challenge | Impact | Strategy for Overcoming |
| :--- | :--- | :--- |
| **DOM/CSS Selector Changes** | X frequently changes element classes, breaking the automation script. | Use robust, data-testid locators (e.g., `[data-testid="tweetButton"]`) rather than brittle CSS classes. Fall back to semantic interaction locators via ARIA roles. |
| **CAPTCHA / Login Verification** | Headless logins frequently trigger strict verification blocks. | Keep login outside the automated flow. Use a persistent, authenticated browser state (`browser_state.json`) created manually. |
| **Human-Like Behavior Checks** | Instant typing and clicking might trigger subsequent automation bans. | Introduce randomized `page.wait_for_timeout()` intervals and use `page.type(text, delay=X)` to simulate realistic typing cadences. |
| **Account Suspension Risk** | Even with Playwright, heavy automation may eventually trip heuristics. | Limit posting frequency strictly to the actual distribution schedule (e.g., 1-2 times a day), avoiding repetitive "spam" behavior. |

---

## 5. Testing and Validation Plan

A strict testing protocol is essential to ensure the Playwright setup reliably sidesteps Error 226 without blowing up the account.

1. **State Preservation Verification:**
   - Run the login script, close the browser, and independently run an inspection script that checks if `https://x.com/home` correctly loads without challenging for a password.
2. **End-to-End Test Post (Burner Post):**
   - Run the posting script to publish a temporary test tweet (e.g., `"Test Playwright automation - please ignore"`) with the target test image attached.
   - **Success Criteria:** The Playwright script completes without errors, and the tweet successfully appears on the @ironpal_co timeline, confirming the browser successfully handled all `x-client-transaction-id` requirements dynamically.
3. **Rollback & Clean Up:**
   - Delete the test tweet manually or build an automated teardown helper.
4. **Production Deployment (Post 02):**
   - Execute the vetted automation script against the actual "Post 02" text and media file (`feed/batch2/images/p02_pov_montage.jpg`).
   - Visually confirm the post went live, ensuring formatting is correct and the image attachment successfully parsed.
