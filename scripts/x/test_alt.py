import sys
import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(storage_state="input/x/browser_state.json")
    page = context.new_page()

    page.goto("https://x.com/compose/tweet", wait_until="domcontentloaded")
    page.wait_for_timeout(3000)

    page.set_input_files("input[data-testid='fileInput']", "feed/batch2/images/p02_pov_montage.jpg")
    page.wait_for_timeout(3000)

    # Click Add description
    page.locator("text=Add description").first.click()
    page.wait_for_timeout(2000)
    
    # Try typing using page.keyboard (it might already have focus on the textarea)
    page.keyboard.type("This is the alt text")
    page.wait_for_timeout(1000)
    
    page.locator("text=Save").click()
    page.wait_for_timeout(2000)
    print("Clicked save")

    page.screenshot(path="after_save.png")

    browser.close()
