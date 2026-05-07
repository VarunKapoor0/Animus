// Vercel serverless function — converts text to speech using Groq Orpheus TTS.
// Hard limit: final input (including direction tag) must be under 200 chars.
// Returns audio/wav binary stream.

const VALID_VOICES = ['autumn', 'diana', 'hannah', 'troy', 'austin', 'daniel'];
const VALID_DIRECTIONS = ['cheerful', 'calm', 'dramatic', 'whisper', 'excited', 'serious', 'sad'];
const ORPHEUS_HARD_LIMIT = 199; // stay safely under 200

function sanitizeForTTS(text) {
  return text
    .replace(/\*/g, '')
    .replace(/[\u201c\u201d"]/g, '"')
    .replace(/[\u2018\u2019']/g, "'")
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract first 2 sentences, then hard-cap at maxChars at a word boundary
function extractAndCap(text, maxChars) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let result = sentences.slice(0, 2).join(' ').trim();
  if (result.length > maxChars) {
    result = result.substring(0, maxChars).replace(/\s\S*$/, '').trim();
  }
  return result;
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

  // Direction tag takes up chars — budget accordingly
  const directionPrefix = selectedDirection ? `[${selectedDirection}] ` : '';
  const textBudget = ORPHEUS_HARD_LIMIT - directionPrefix.length;

  text = sanitizeForTTS(text);
  text = extractAndCap(text, textBudget);

  if (!text) return res.status(400).json({ error: 'Text empty after sanitization.' });

  // Final assembled input — guaranteed under 200 chars
  const input = directionPrefix + text;
  console.log(`TTS input (${input.length} chars): ${input}`);

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
