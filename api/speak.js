// Vercel serverless function — converts text to speech using Groq Orpheus TTS.
// Speaks only the first 2 sentences of the response (guaranteed under 160 chars by Gemini prompt).
// Returns audio/wav binary stream.

const VALID_VOICES = ['autumn', 'diana', 'hannah', 'troy', 'austin', 'daniel'];
const VALID_DIRECTIONS = ['cheerful', 'calm', 'dramatic', 'whisper', 'excited', 'serious', 'sad'];

function sanitizeForTTS(text) {
  return text
    .replace(/\*/g, '')
    .replace(/[\u201c\u201d"]/g, '"')
    .replace(/[\u2018\u2019']/g, "'")
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract exactly the first 2 sentences for TTS
function extractFirstTwoSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const firstTwo = sentences.slice(0, 2).join(' ').trim();
  // Hard safety cap at 170 chars in case Gemini doesn't follow the format rule
  if (firstTwo.length > 170) {
    return firstTwo.substring(0, 170).replace(/\s\S*$/, '...');
  }
  return firstTwo;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY is not configured.' });

  let { text, voice, vocal_direction } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided.' });

  const selectedVoice = VALID_VOICES.includes(voice) ? voice : 'diana';
  const selectedDirection = VALID_DIRECTIONS.includes(vocal_direction) ? vocal_direction : null;

  text = sanitizeForTTS(text);
  text = extractFirstTwoSentences(text);

  if (!text) return res.status(400).json({ error: 'Text empty after sanitization.' });

  const input = selectedDirection ? `[${selectedDirection}] ${text}` : text;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'canopylabs/orpheus-v1-english',
        input,
        voice: selectedVoice,
        response_format: 'wav',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq TTS error:', err);
      return res.status(503).json({ error: 'TTS unavailable.', detail: err });
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.status(200).send(Buffer.from(audioBuffer));

  } catch (err) {
    console.error('Speak handler error:', err);
    return res.status(503).json({ error: 'TTS unavailable.' });
  }
}
