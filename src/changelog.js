// Changelog data — add new entries at the top.
export const CHANGELOG = [
  {
    version: 'v1.6',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'Connect nudge — after first conversation, a contextual hint appears prompting the user to scan another object and connect it' },
      { type: 'improved', text: 'Camera view text readability — header and UI elements now have backdrop blur and dark background pills so text is legible against any camera feed' },
      { type: 'improved', text: 'Scan history buttons — higher contrast and dark background for readability on camera' },
      { type: 'improved', text: 'Object debate — user interjections now woven into the conversation between objects rather than acknowledged and dismissed' },
      { type: 'fixed', text: 'Share card layout — fixed label and quote overlap on long opening lines; adaptive font sizing added' },
      { type: 'fixed', text: 'Changelog page scrolling on all devices' },
      { type: 'improved', text: 'Theme persists across landing and changelog pages via localStorage' },
    ]
  },
  {
    version: 'v1.5',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'Custom domain — animusai.app' },
      { type: 'new', text: 'Share card — Canvas API generates a branded 1080×1080 image with the object\'s opening line, voice, and branding' },
      { type: 'new', text: 'Web Share API on mobile, image download on desktop, X/Twitter post intent' },
      { type: 'new', text: 'Light/dark theme toggle on landing page, defaulting to light' },
      { type: 'new', text: 'Animated particle network + scan pulse on landing page background' },
      { type: 'new', text: 'Changelog page at /changelog' },
      { type: 'improved', text: 'Responsive layout across mobile, tablet, and desktop for all panels' },
      { type: 'improved', text: 'Ghost audio prevention — terminating chat immediately cancels any in-flight TTS fetch' },
      { type: 'improved', text: 'Architecture refactor — useAnimusState, useAudio, useRecording extracted as shared hooks' },
    ]
  },
  {
    version: 'v1.4',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'WebXR integration — ARCore hit testing for real 3D spatial marker placement on Android Chrome' },
      { type: 'new', text: 'Spatial markers — floating labels anchored at scan positions on the camera view, tap to resume' },
      { type: 'new', text: 'Tap ripple — neon ring expands from tap point on each scan' },
      { type: 'new', text: 'Recognition beat — object name briefly flashes when scan completes' },
      { type: 'new', text: 'Landing page with boot sequence animation and back-button navigation' },
      { type: 'improved', text: 'Gemini paid tier with automatic fallback to Flash Lite on overload' },
    ]
  },
  {
    version: 'v1.3',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'Object connection mode — scan a second object to put two objects in a live conversation with each other' },
      { type: 'new', text: 'User interject — speak or type between debate turns; objects respond to the user input' },
      { type: 'new', text: 'Scan history — terminated conversations saved client-side, resumable without re-scanning' },
      { type: 'improved', text: 'Debate prompt shows dropdown selector when multiple history objects exist' },
    ]
  },
  {
    version: 'v1.2',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'Groq Orpheus TTS — neural voice synthesis with object-matched voice and vocal direction' },
      { type: 'new', text: 'Gemini selects voice and speaking style per object based on personality' },
      { type: 'new', text: 'Opening line auto-plays on chat panel mount' },
      { type: 'improved', text: 'Multilingual TTS — Web Speech API fallback with BCP-47 language tags for non-English responses' },
      { type: 'fixed', text: 'Audio continues playing after chat panel is closed' },
    ]
  },
  {
    version: 'v1.1',
    date: 'May 2026',
    changes: [
      { type: 'new', text: 'Voice pipeline — Groq Whisper STT with automatic language detection' },
      { type: 'new', text: 'Multilingual support — speak in any language, object responds in kind' },
      { type: 'new', text: '3-sentence response format — first two sentences constrained to ≤155 chars for reliable TTS' },
    ]
  },
  {
    version: 'v1.0',
    date: 'April 2026',
    changes: [
      { type: 'new', text: 'Initial launch — camera scan → Gemini Vision identifies object and generates personality' },
      { type: 'new', text: 'In-character conversation — stateless Gemini chat with history passed per request' },
      { type: 'new', text: 'Vercel serverless API routes — /api/gemini, /api/transcribe, /api/speak' },
    ]
  },
];
