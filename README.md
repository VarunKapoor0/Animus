# Animus
### Talk to the world around you.

Point your camera at any object. Animus identifies it, gives it a personality, and lets you have a conversation with it.

Your mug has opinions. Your microphone has stories. Your desk lamp has feelings about being ignored.

**[Live Demo →](https://animus-jade.vercel.app)**

---

## What it does

1. **Point** — open the app, point your camera at any object
2. **Scan** — tap anywhere or press Scan to capture the frame
3. **Link** — Gemini Vision identifies the object and generates its personality
4. **Talk** — have a full conversation with the object as itself

The microphone knows what it does for a living. The coffee mug has thoughts about your caffeine dependency. Any object, any conversation.

---

## Screenshots

| Object detected | Conversation active |
|---|---|
| ![Object card floating over microphone](screenshot_card.png) | ![Chat with studio microphone](screenshot_chat.png) |

---

## Tech stack

- **React + Vite** — frontend
- **Tailwind CSS** — styling with custom cyberpunk theme (neon cyan/magenta, scanlines, glitch text)
- **Gemini Vision API** — object identification and personality generation
- **Gemini Chat API** — stateless conversation with conversation history passed per request
- **Vercel** — deployment with serverless API routes handling Gemini calls

---

## Architecture

```
Camera feed (browser MediaDevices API)
    ↓ tap / scan button
Frame capture → base64 JPEG
    ↓
/api/gemini (Vercel serverless)
    action: 'vision' → Gemini identifies object, generates personality summary
    action: 'chat'   → Gemini responds in character, history passed per request
    ↓
ObjectCard — shows object type + opening personality line
    ↓ [INITIATE LINK]
ChatPanel — full conversation, stateless backend, history managed client-side
```

The backend is stateless — conversation history is maintained on the client and sent with each message, keeping the serverless function simple and cost-efficient.

---

## Run locally

```bash
git clone https://github.com/VarunKapoor0/Animus
cd Animus
npm install
```

Add your Gemini API key:
```bash
# .env.local
GEMINI_API_KEY=your_key_here
```

```bash
npm run dev
```

Requires a browser with camera access. Works best on desktop with a physical webcam pointing at objects.

---

## Why

The idea is simple: what if the objects around you could speak? Not as assistants, not as tools — as themselves, with personality and perspective. It's a small experiment in what happens when AI understands the physical world well enough to give it a voice.

Built in a weekend. Deployed and live.

---

*Built by [Varun Kapoor](https://varkapoor.com)*
