// Vercel serverless function — converts text to speech using Groq TTS.
// Returns audio/mpeg binary stream.

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
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured.' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'No text provided.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'playai-tts',
        input: text,
        voice: 'Celeste-PlayAI', // natural, expressive voice
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq TTS error:', err);
      return res.status(500).json({ error: 'TTS failed.' });
    }

    // Stream audio back to client
    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.status(200).send(Buffer.from(audioBuffer));

  } catch (err) {
    console.error('Speak handler error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
