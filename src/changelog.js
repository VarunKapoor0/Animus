// Changelog data — add new entries at the top.
export const CHANGELOG = [
  {
    version: 'v1.5',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'Custom domain — animusai.app' },
      { type: 'new', text: 'Share card — Canvas API generates a branded 1080×1080 image with the object\'s opening line' },
      { type: 'new', text: 'Web Share API on mobile, image download on desktop, X/Twitter post intent' },
      { type: 'new', text: 'Light/dark theme toggle on landing page' },
      { type: 'new', text: 'Animated particle network + scan pulse background on landing page' },
      { type: 'new', text: 'Built by credit linking to portfolio' },
      { type: 'new', text: 'Changelog page' },
      { type: 'improved', text: 'Full responsive layout across mobile, tablet, desktop for all panels' },
      { type: 'improved', text: 'Ghost audio prevention — terminating chat stops any in-flight TTS immediately' },
      { type: 'improved', text: 'Major architecture refactor — useAnimusState, useAudio, useRecording hooks extracted' },
    ]
  },
  {
    version: 'v1.4',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'WebXR integration — ARCore hit testing for real 3D spatial marker placement on Android Chrome' },
      { type: 'new', text: 'Spatial markers — floating neon dots anchored at scan positions, tap to resume' },
      { type: 'new', text: 'Tap ripple — neon ring expands from tap point on scan' },
      { type: 'new', text: 'Recognition beat — object name flashes when scan completes' },
      { type: 'new', text: 'Landing page with animated boot sequence and back button navigation' },
      { type: 'improved', text: 'Gemini paid tier — eliminated 503 overload errors, automatic fallback to Flash Lite' },
    ]
  },
  {
    version: 'v1.3',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'Object connection mode — scan a second object to put two objects in conversation' },
      { type: 'new', text: 'User interject — speak or type between debate turns, objects respond to you' },
      { type: 'new', text: 'Scan history — every terminated conversation saved, resumable without re-scanning' },
      { type: 'new', text: 'Scan history strip at bottom of camera view' },
      { type: 'improved', text: 'Debate prompt with dropdown when multiple history objects exist' },
    ]
  },
  {
    version: 'v1.2',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'Groq Orpheus TTS — natural neural voice synthesis replacing Web Speech API' },
      { type: 'new', text: 'Voice gender + speaking style — Gemini picks voice and vocal direction per object' },
      { type: 'new', text: 'Auto-play opening line on chat panel mount' },
      { type: 'new', text: 'HOLD TO SPEAK bar — full-width prominent mic button' },
      { type: 'improved', text: 'Multilingual TTS — Web Speech API fallback with correct BCP-47 language tags for non-English' },
      { type: 'improved', text: 'Hindi/Urdu normalization — Whisper detection corrected' },
      { type: 'fixed', text: 'Audio keeps playing after closing chat panel' },
    ]
  },
  {
    version: 'v1.1',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'Voice pipeline — Groq Whisper STT with automatic language detection' },
      { type: 'new', text: 'Multilingual — speak in any language, object responds in kind' },
      { type: 'new', text: 'Hold to speak mic button with visual recording state' },
      { type: 'new', text: '3-sentence response format — first two sentences always speakable (≤155 chars)' },
    ]
  },
  {
    version: 'v1.0',
    date: 'April 2026',
    changes: [
      { type: 'new', text: 'Initial launch — camera scan → Gemini Vision identifies object' },
      { type: 'new', text: 'AI personality generation — unique voice and character per object' },
      { type: 'new', text: 'In-character chat — stateless Gemini conversation with history passed per request' },
      { type: 'new', text: 'Cyberpunk AR aesthetic — scanlines, glitch text, neon cyan/magenta, chromatic aberration' },
      { type: 'new', text: 'Vercel serverless API routes — /api/gemini, /api/transcribe, /api/speak' },
    ]
  },
];
