# Glasses Ask

A small phone-first web app for asking questions to the **free** version of chatgpt.com, hands-free, with Ray-Ban Meta glasses as the microphone and speaker.

The free ChatGPT has no API, so the app does not call OpenAI directly. It uses the public URL form that chatgpt.com accepts to pre-fill a question:

```
https://chatgpt.com/?q=<url-encoded question>&hints=search&temporary-chat=true
```

`hints` (`search`, `research`) and `temporary-chat` are optional. OpenAI documents none of these parameters officially, so they can change. The app itself keeps working because the link always opens chatgpt.com with the question text.

## What it does

- Dictate a question with the phone's speech recognition (Chrome on Android, Safari on iPhone), or type it.
- Pick Chat, Web search, or Deep research mode and optionally a temporary chat.
- Tap **Open in ChatGPT**. A new tab opens on chatgpt.com with the question already in the box. No account needed.
- Keeps the last 25 questions on the device (localStorage only, nothing leaves the phone until you tap Open).
- Dark mode by default with carbon fiber texture, light mode toggle.
- Installable as a home screen app. On Android, the installed app also appears in the share sheet, so selected text from any app can be shared straight into the question box.
- Deep link: `index.html?q=your+question` pre-fills the box. Useful from an iPhone Shortcut.

## Using it with Ray-Ban Meta glasses

1. Pair the glasses with the phone in the Meta AI app. The glasses play the phone's audio and can act as a Bluetooth microphone.
2. Open the app on the phone and add it to the home screen.
3. Tap **Speak**, ask the question, tap **Open in ChatGPT**.
4. In ChatGPT, tap the voice or headphone icon to hear the reply through the glasses.

The glasses cannot run third-party apps and their wake word stays with Meta AI, so the phone remains in the loop.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app, no build step |
| `manifest.json` | Installable app plus Android share target |
| `sw.js` | Caches the app shell for offline launch |
| `icon.svg` | Home screen icon |

## Hosting

Any static host works. For GitHub Pages, publish this folder and open `https://<user>.github.io/<repo>/meta-glasses/`. Speech recognition and the service worker require HTTPS.
