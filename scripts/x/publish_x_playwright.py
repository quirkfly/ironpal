import sys
import time
from playwright.sync_api import sync_playwright

def publish_post(text_content, image_path, alt_text):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(storage_state="input/x/browser_state.json")
        page = context.new_page()

        print("Navigating to X composer...")
        page.goto("https://x.com/compose/tweet", wait_until="domcontentloaded")
        page.wait_for_timeout(3000)

        print("Waiting for media input...")
        try:
            page.wait_for_selector("input[data-testid='fileInput']", state="attached", timeout=15000)
            page.set_input_files("input[data-testid='fileInput']", image_path)
            print("Image attached.")
            time.sleep(3)
        except Exception as e:
            print(f"File input fail: {e}")
            sys.exit(1)
            
        print("Adding ALT text...")
        try:
            page.locator("text=Add description").first.click()
            time.sleep(1)
            # The input area is auto-focused
            page.keyboard.type(alt_text, delay=10)
            time.sleep(1)
            page.locator("text=Save").click()
            time.sleep(2)
            print("ALT text saved.")
        except Exception as e:
            print(f"ALT text fail: {e}")
            sys.exit(1)

        print("Waiting for text area...")
        try:
            editor = page.locator("[data-testid='tweetTextarea_0']").first
            editor.wait_for(state="visible", timeout=10000)
            editor.click()
            time.sleep(1)
            # Use keyboard typing
            page.keyboard.type(text_content, delay=10)
            print("Text typed.")
            time.sleep(2)
        except Exception as e:
            print(f"Text input fail: {e}")
            sys.exit(1)

        print("Clicking post button...")
        try:
            btn = page.locator("[data-testid='tweetButton']").first
            btn.wait_for(state="visible", timeout=10000)
            btn.click()
            print("Post button clicked.")
        except Exception as e:
            print(f"Post button fail: {e}")
            sys.exit(1)

        try:
            page.wait_for_selector("[data-testid='toast']", timeout=10000)
            print("Post toast appeared!")
        except Exception:
            print("Toast didn't appear or timed out.")
            
        time.sleep(3) 

        browser.close()
        print("Automation complete.")

if __name__ == "__main__":
    post_text = """#2 — Here's the problem.

This is what the headband sees: your own hands, some equipment, the floor, motion blur. No tidy side-on gym-cam angle. No labels.

Exercise, reps, weight — all of it has to come from this messy first-person view.

Could you tell what exercise this is?"""
    image_file = "feed/batch2/images/p02_pov_montage.jpg"
    alt_text = "A grid of egocentric (head-mounted) frames looking down at hands and gym equipment — the raw input IronPal works from."
    publish_post(post_text, image_file, alt_text)
