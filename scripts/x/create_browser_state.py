import re
import json

with open("input/x/create_tweet.curl", "r") as f:
    content = f.read()

cookie_match = re.search(r"-b '([^']+)'", content)
if cookie_match:
    cookie_str = cookie_match.group(1)
    cookies = []
    for chunk in cookie_str.split("; "):
        if "=" in chunk:
            name, value = chunk.split("=", 1)
            cookies.append({
                "name": name,
                "value": value,
                "domain": ".x.com",
                "path": "/",
                "secure": True,
                "httpOnly": True,
                "sameSite": "Lax"
            })
    
    state = {
        "cookies": cookies,
        "origins": []
    }
    with open("input/x/browser_state.json", "w") as out:
        json.dump(state, out, indent=2)
    print("browser_state.json created!")
else:
    print("Could not find cookie string in curl file")
