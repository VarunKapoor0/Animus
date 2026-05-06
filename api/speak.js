// Vercel serverless function — converts text to speech using Groq Orpheus TTS.
// Returns audio/wav binary stream.
// Note: Orpheus has a 200 character input limit — we truncate accordingly.

function sanitizeForTTS(text) {
  return text
    .replace(/\*/g, '')           // remove markdown bold/italic asterisks
    .replace(/["""]/g, '"')       // normalize smart quotes to straight quotes
    .replace(/[''']/g, "'")       // normalize smart apostrophes
    .replace(/[^\x00-\x7F]/g, '') // strip non-ASCII characters
    .replace(/\s+/g, ' ')         // collapse whitespace
    .trim();
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

  // Sanitize — remove special chars that can cause Groq 500s
  text = sanitizeForTTS(text);

  // Orpheus hard limit is 200 characters — truncate at word boundary
  if (text.length > 190) {
    text = text.substring(0, 190).replace(/\s\S*$/, '...');
  }

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
