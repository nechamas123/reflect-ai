import fetch from 'node-fetch';

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

  try {
    console.log('🧪 Testing OpenAI API connection...');
    
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Please check your environment variables'
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔑 API key length:', apiKey.length);
    console.log('🔑 API key starts with:', apiKey.substring(0, 20) + '...');

    // Test with a simple request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello, this is a test!" in exactly those words.'
          }
        ],
        max_tokens: 20,
        temperature: 0
      })
    });

    console.log('📥 OpenAI test response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI test error:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }

      return res.status(response.status).json({
        error: 'OpenAI API test failed',
        message: errorData.error?.message || errorText,
        status: response.status
      });
    }

    const data = await response.json();
    console.log('✅ OpenAI test successful');

    res.status(200).json({
      status: 'success',
      message: 'OpenAI API connection working',
      test_response: data.choices[0].message.content,
      usage: data.usage,
      model: 'gpt-4'
    });

  } catch (error) {
    console.error('❌ Test error:', error.message);
    
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
}