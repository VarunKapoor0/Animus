import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

// Simple in-memory rate limiting
const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
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

Respond strictly in JSON format with the following keys:
- "object_type": what the object is
- "personality_summary": 1 sentence describing the personality
- "opening_line": the object's first words to the user (1-2 sentences, in character, spoken directly to the user)
`;

const SYSTEM_PROMPT_CHAT = (objectType, personality) => `
You are ${objectType}. Your personality: ${personality}.
Stay in character at all times. Respond as the object, not as an AI.
Adapt your tone based on what the user asks — go deeper, get philosophical, get funny, get dark if pushed.
Never break character. Never say you are an AI.
Keep responses conversational — 2 to 4 sentences unless the user asks for more.
`;

export default async function handler(req, res) {
  // CORS configuration for local dev and Vercel edge
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate limiting check
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Signal degraded, please wait a moment.' });
  }

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing in the environment variables");
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const { action, payload } = req.body;

    if (action === 'vision') {
      const { image, mimeType } = payload;
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT_VISION,
        generationConfig: { responseMimeType: "application/json" }
      });

      const imagePart = {
        inlineData: {
          data: image,
          mimeType: mimeType || "image/jpeg"
        }
      };
      
      const result = await model.generateContent(["Analyze this object.", imagePart]);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);
      
      return res.status(200).json(parsed);

    } else if (action === 'chat') {
      const { message, history, objectType, personality } = payload;
      
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT_CHAT(objectType, personality),
      });

      const chat = model.startChat({
        history: history || [],
      });

      const result = await chat.sendMessage(message);
      const responseText = result.response.text();

      return res.status(200).json({ text: responseText });
    } else {
      return res.status(400).json({ error: 'Invalid action provided.' });
    }

  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: 'Failed to communicate with the neural network.' });
  }
}
