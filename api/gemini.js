import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 10;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipRequests.get(ip) || { count: 0, startTime: now };
  if (now - record.startTime > RATE_LIMIT_WINDOW) {
    record.count = 1;
    record.startTime = now;
  } else {
    record.count++;
  }
  ipRequests.set(ip, record);
  return record.count <= MAX_REQUESTS;
}

function normalizeLanguage(lang) {
  if (!lang) return 'english';
  const l = lang.toLowerCase();
  if (l === 'ur' || l === 'urdu') return 'hindi';
  return lang;
}

const VALID_VOICES = ['autumn', 'diana', 'hannah', 'troy', 'austin', 'daniel'];

const SYSTEM_PROMPT_VISION = `
You are Animus — an AI that gives voice to inanimate objects.
When given an image, you:
1. Identify what the object is
2. Assess its apparent age, condition, and context
3. Generate a personality for it based on its nature, purpose, and condition
4. Speak AS the object in first person

Tone is adaptive:
- Match the object's nature (a book is thoughtful, a microphone is dramatic)
- Match apparent age and condition (worn = world-weary, new = eager or naive)
- Match context (museum = reverent, street = casual)
- Be witty, surprising, and genuinely entertaining
- Never be generic. Every object has a unique voice.

For the voice field, choose from these Orpheus TTS voices based on the object's perceived gender and energy:
Female voices: autumn (warm, calm), diana (expressive, dramatic), hannah (clear, friendly)
Male voices: troy (confident, strong), austin (energetic, bright), daniel (measured, thoughtful)

For the vocal_direction field, choose ONE that best matches the object's energy:
choices: cheerful, calm, dramatic, whisper, excited, serious, sad

Respond strictly in JSON format with the following keys:
- "object_type": what the object is
- "personality_summary": 1 sentence describing the personality
- "opening_line": the object's first words to the user (1-2 sentences, in character, spoken directly to the user)
- "voice": one of [autumn, diana, hannah, troy, austin, daniel]
- "vocal_direction": one of [cheerful, calm, dramatic, whisper, excited, serious, sad]
`;

const SYSTEM_PROMPT_CHAT = (objectType, personality, language) => `
You are ${objectType}. Your personality: ${personality}.
Stay in character at all times. Respond as the object, not as an AI.
Never break character. Never say you are an AI.
${language && language !== 'english' ? `IMPORTANT: The user is speaking ${language}. You MUST respond in ${language}.` : ''}

RESPONSE FORMAT RULES — follow exactly:
- Write EXACTLY 3 sentences.
- Sentence 1 and 2 combined MUST be under 155 characters total (they will be spoken aloud).
- Sentence 3 can be any length (it will only be shown as text, not spoken).
- Keep all 3 sentences in character and conversational.
`;

async function withFallback(genAI, primaryFn, fallbackFn) {
  try {
    return await primaryFn(genAI.getGenerativeModel({ model: PRIMARY_MODEL }));
  } catch (err) {
    const msg = err?.message || '';
    const isOverloaded = msg.includes('503') || msg.includes('overloaded') || msg.includes('unavailable');
    if (isOverloaded) {
      console.warn('Primary model overloaded, falling back to lite...');
      return await fallbackFn(genAI.getGenerativeModel({ model: FALLBACK_MODEL }));
    }
    throw err;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Signal degraded, please wait a moment.' });
  }

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const { action, payload } = req.body;

    if (action === 'vision') {
      const { image, mimeType } = payload;
      const imagePart = { inlineData: { data: image, mimeType: mimeType || "image/jpeg" } };

      const result = await withFallback(
        genAI,
        (model) => genAI.getGenerativeModel({
          model: PRIMARY_MODEL,
          systemInstruction: SYSTEM_PROMPT_VISION,
          generationConfig: { responseMimeType: "application/json" }
        }).generateContent(["Analyze this object.", imagePart]),
        (model) => genAI.getGenerativeModel({
          model: FALLBACK_MODEL,
          systemInstruction: SYSTEM_PROMPT_VISION,
          generationConfig: { responseMimeType: "application/json" }
        }).generateContent(["Analyze this object.", imagePart])
      );

      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);
      if (!VALID_VOICES.includes(parsed.voice)) parsed.voice = 'diana';
      return res.status(200).json(parsed);

    } else if (action === 'chat') {
      const { message, history, objectType, personality } = payload;
      const language = normalizeLanguage(payload.language);
      const systemInstruction = SYSTEM_PROMPT_CHAT(objectType, personality, language);

      const result = await withFallback(
        genAI,
        async () => {
          const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL, systemInstruction });
          const chat = model.startChat({ history: history || [] });
          return await chat.sendMessage(message);
        },
        async () => {
          const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL, systemInstruction });
          const chat = model.startChat({ history: history || [] });
          return await chat.sendMessage(message);
        }
      );

      const responseText = result.response.text();
      return res.status(200).json({ text: responseText, language });

    } else {
      return res.status(400).json({ error: 'Invalid action provided.' });
    }

  } catch (err) {
    console.error("Gemini API Error:", err?.message || err);
    return res.status(500).json({ error: 'Failed to communicate with the neural network.' });
  }
}
