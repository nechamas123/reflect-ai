export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({ 
    status: 'OK', 
    message: 'Reflect AI Backend with Whisper is running',
    timestamp: new Date().toISOString(),
    transcription_service: 'OpenAI Whisper',
    analysis_service: 'OpenAI GPT-4',
    platform: 'Vercel',
    features: [
      'Hebrew speaker recognition', 
      'Multilingual support', 
      'Real-time transcription',
      'AI-powered analysis'
    ]
  });
}