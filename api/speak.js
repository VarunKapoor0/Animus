// Vercel serverless function — converts text to speech using Groq Orpheus TTS.
// Returns audio/wav binary stream.
// Orpheus has a 200 character input limit — we send first 1-2 sentences only.

function sanitizeForTTS(text) {
  return text
    .replace(/\*/g, '')           // remove markdown bold/italic asterisks
    .replace(/["""]/g, '"')       // normalize smart quotes
    .replace(/[''']/g, "'")       // normalize smart apostrophes
    .replace(/[^\x00-\x7F]/g, '') // strip non-ASCII
    .replace(/\s+/g, ' ')         // collapse whitespace
    .trim();
}

function extractFirstSentences(text, maxChars = 180) {
  // Split on sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let result = '';
  for (const sentence of sentences) {
    if ((result + sentence).length > maxChars) break;
    result += sentence;
  }
  // If even the first sentence is too long, truncate at word boundary
  if (!result) {
    result = text.substring(0, maxChars).replace(/\s\S*$/, '...');
  }
  return result.trim();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY is not set');
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured.' });
  }

  let { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'No text provided.' });
  }

  // Sanitize then extract first complete sentences up to 180 chars
  text = sanitizeForTTS(text);
  text = extractFirstSentences(text, 180);

  if (!text) {
    return res.status(400).json({ error: 'Text empty after sanitization.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'canopylabs/orpheus-v1-english',
        input: text,
        voice: 'diana',
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
