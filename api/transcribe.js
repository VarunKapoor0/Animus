// Vercel serverless function — receives audio blob as base64,
// sends to Groq Whisper API, returns transcript + detected language.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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

  try {
    const { audio, mimeType } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'No audio data provided.' });
    }

    // Convert base64 back to binary
    const audioBuffer = Buffer.from(audio, 'base64');
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });

    // Build multipart form for Groq Whisper API
    const formData = new FormData();
    formData.append('file', blob, `audio.${(mimeType || 'audio/webm').split('/')[1] || 'webm'}`);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'verbose_json'); // gives us language detection

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq Whisper error:', err);
      return res.status(500).json({ error: 'Transcription failed.' });
    }

    const data = await response.json();

    return res.status(200).json({
      transcript: data.text,
      language: data.language || 'english',
    });

  } catch (err) {
    console.error('Transcribe handler error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
