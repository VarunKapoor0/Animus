# Animus
### Talk to the world around you.

Point your camera at any object. Animus identifies it, gives it a personality, and lets you have a full voice conversation with it.

Your mug has opinions. Your microphone has stories. Your desk lamp has feelings about being ignored. And now they can all speak.

**[Live Demo →](https://animus-jade.vercel.app)**

---

## What it does

1. **Point** — open the app, point your camera at any object
2. **Scan** — tap anywhere or press Scan to capture the frame
3. **Link** — Gemini Vision identifies the object and generates its personality
4. **Listen** — the object speaks its opening line out loud in its own voice
5. **Talk** — speak back or type to have a full conversation with the object as itself

The microphone knows what it does for a living. The coffee mug has thoughts about your caffeine dependency. Speak to any object in any language — it responds in the same language, in its own voice.

---

## Screenshots

| Object detected | Conversation active |
|---|---|
| ![Object card floating over microphone](screenshot_card.PNG) | ![Chat with studio microphone](screenshot_chat.PNG) |

---

## Tech stack

- **React + Vite** — frontend
- **Tailwind CSS** — styling with custom cyberpunk theme (neon cyan/magenta, scanlines, glitch text)
- **Gemini Vision API** — object identification and personality generation
- **Gemini Chat API** — stateless conversation with conversation history passed per request, language-aware responses
- **Groq Whisper** (`whisper-large-v3-turbo`) — speech-to-text with automatic language detection
- **Groq Orpheus TTS** (`canopylabs/orpheus-v1-english`) — natural-sounding voice synthesis
- **Vercel** — deployment with serverless API routes

---

## Architecture

```
Camera feed (browser MediaDevices API)
    ↓ tap / scan button
Frame capture → base64 JPEG
    ↓
/api/gemini (Vercel serverless)
    action: 'vision' → Gemini identifies object, generates personality summary
    action: 'chat'   → Gemini responds in character, language-aware, history passed per request
    ↓
ObjectCard — shows object type + opening personality line
    ↓ [INITIATE LINK]
ChatPanel — object speaks opening line automatically via TTS
    ↓
Voice input: hold mic → MediaRecorder → /api/transcribe (Groq Whisper) → transcript + detected language
    ↓
/api/gemini chat → response in detected language
    ↓
/api/speak (Groq Orpheus TTS) → object speaks back
    fallback: Web Speech API if Groq TTS unavailable
```

The backend is stateless — conversation history and detected language are maintained on the client and sent with each message.

---

## Voice feature

- **Hold the mic button** to speak, release to send
- Whisper auto-detects the language — speak in any language and the object responds in kind
- The object's opening line plays automatically when you initiate a link — voice is on by default
- TTS uses Groq Orpheus for natural, expressive speech with automatic fallback to Web Speech API

Note: Orpheus has a 200 character input limit per request — the first 1-2 sentences of each response are spoken.

---

## Run locally

```bash
git clone https://github.com/VarunKapoor0/Animus
cd Animus
npm install
```

Add your API keys:
```bash
# .env
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
```

```bash
npm run dev
```

Requires a browser with camera and microphone access. Works best on desktop with a physical webcam pointing at objects.

Get a free Groq API key at [console.groq.com](https://console.groq.com) — accept Orpheus model terms at the playground before first use.

---

## Why

What if the objects around you could speak? Not as assistants, not as tools — as themselves, with personality and perspective. It's a small experiment in what happens when AI understands the physical world well enough to give it a voice.

Built in a weekend. Deployed and live.

---

*Built by [Varun Kapoor](https://varkapoor.com)*
