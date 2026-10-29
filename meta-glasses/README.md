# Glasses Ask

Ask a question from **Meta Ray-Ban Display** glasses and read the answer from the **free version of chatgpt.com** on the in-lens display.

The free ChatGPT has no API. The glasses cannot open chatgpt.com themselves. So this is a small three-part system with no server, no account and no API key:

```
Ray-Ban Display              ntfy.sh (free relay)              Phone or Mac
glasses/index.html  ──ask──▶  <code>-ask topic  ──▶  bridge/index.html opens chatgpt.com/?q=…
600x600 web app     ◀──ans──  <code>-ans topic  ◀──  you paste the reply (or the userscript relays it)
```

| Part | File | Runs on |
| --- | --- | --- |
| Glasses app | `glasses/index.html` | Ray-Ban Display, registered as a web app in the Meta AI app |
| Bridge | `bridge/index.html` | Your phone or computer browser |
| Auto bridge (optional) | `bridge/chatgpt-bridge.user.js` | Tampermonkey in the browser where chatgpt.com is open |

## How a question travels

1. On the glasses, pick a quick question, write one with the Neural Band, or speak it if the glasses runtime exposes the microphone to web apps.
2. The glasses app posts the question to a relay topic named after your pair code.
3. The bridge page on your phone shows the question with an **Open in ChatGPT** button. That link uses the public prefill form `https://chatgpt.com/?q=…` so the free site opens with the question typed in.
4. Copy ChatGPT's reply, paste it under the question, tap **Send to glasses**.
5. The glasses app shows the answer, paged to fit the 600 pixel lens, with ▼ to turn pages. It can also read it aloud if speech synthesis is available on the device.

With the optional userscript, step 3 and 4 happen on their own in an open chatgpt.com tab. That automates the ChatGPT web page in your own browser. It depends on page markup OpenAI can change, and it may conflict with OpenAI's Terms of Use, so it is off by default and the manual flow needs nothing extra.

## Setting up

### Host the folder over HTTPS

Any static host works. For GitHub Pages: repository Settings, Pages, deploy from branch `main`, folder `/ (root)`. The apps are then at:

```
https://<github-user>.github.io/about-pr1ce-berge/meta-glasses/glasses/
https://<github-user>.github.io/about-pr1ce-berge/meta-glasses/bridge/
```

### Put the app on the glasses

1. In the Meta AI app, turn on Developer Mode, following Meta's Ray-Ban Display developer preview instructions.
2. Go to Settings, Web apps, and add the `glasses/` URL (paste or scan a QR code).
3. Open Glasses Ask from the glasses. Choose **Pair with phone** and note the code.

### Pair the bridge

Open the `bridge/` URL on your phone, enter the code, tap **Pair**. Add the bridge to your home screen so it launches like an app. On Android it also appears in the share sheet.

## Navigating on the glasses

The Neural Band and the temple touchpad reach a web app as ordinary keyboard events, so the app uses a simple focus list:

| Gesture | Key the app sees | Does |
| --- | --- | --- |
| Thumb swipe up or down | Arrow up / down | Move between items, or turn pages in an answer |
| Index pinch | Enter | Select, or send the typed question |
| Middle-finger pinch | Escape | Back |
| Handwriting with the band | Text input | Writes in the question field |

The same keys work in a desktop browser at 600x600 for testing. A `?q=your+question` link sends a question immediately on load.

## Design notes for the lens

Black renders as transparent on the additive display, so the page is pure black with near-white text at 18 to 22 px, one idea per screen, nothing that scrolls, and the brand yellow (#ffc300) only on the focused item and the status line. The bridge follows the dealership app standards: dark mode by default with the carbon fiber texture, light toggle, #000814 / #001d3d / #ffc300 / #ff5733 / #e5e5e5.

## Privacy

Messages travel through ntfy.sh under topics named by your pair code. Topics are public to anyone who guesses the name, and messages are cached for about 12 hours. Use the long generated code, change it with **New code** whenever you like, and keep customer personal data out of questions. For a private deployment, run your own ntfy server and change the `RELAY` constant in all three files.

## What was verified and what was not

- Verified in a headless browser: the glasses app's keyboard navigation, paging, pairing and the full ask / answer round trip against a simulated relay. The bridge page's inbox, send and theme toggle.
- Not verified from this environment: live calls to ntfy.sh (outbound network was blocked), the Meta AI app's web app registration flow, whether the glasses runtime exposes the microphone and speech synthesis to web apps, and the current chatgpt.com markup the userscript relies on.
