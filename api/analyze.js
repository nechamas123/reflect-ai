import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, maxTokens = 1000, language, model = 'gpt-3.5-turbo' } = req.body;
    console.log('🤖 Analysis request received');
    console.log('📝 Prompt length:', prompt ? prompt.length : 'undefined');
    console.log('🔢 Max tokens:', maxTokens);
    console.log('🧠 Model:', model);

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'OpenAI API key not configured'
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      console.error('❌ Invalid prompt:', typeof prompt);
      return res.status(400).json({ 
        error: 'No prompt provided',
        message: 'Please provide a valid prompt for analysis'
      });
    }

    if (prompt.length > 15000) {
      console.error('❌ Prompt too long:', prompt.length);
      return res.status(400).json({
        error: 'Prompt too long',
        message: 'Please provide a shorter prompt (max 15,000 characters)'
      });
    }

    console.log('🚀 Sending request to OpenAI...');
    
    const openaiPayload = {
      model: model, // Use the model from request (gpt-3.5-turbo or gpt-4)
      messages: [
        {
          role: 'system',
          content: 'You are an expert conversation analyst and behavioral psychologist. Provide insightful, empathetic, and constructive analysis of conversations and behavior patterns. You understand Hebrew and English perfectly. Always respond with clear, natural text without special formatting or structured patterns unless specifically requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: Math.min(maxTokens, model === 'gpt-4' ? 3000 : 2000), // Higher limit for GPT-4
      temperature: 0.7
    };

    console.log('📤 OpenAI payload prepared');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(openaiPayload)
    });

    console.log('📥 OpenAI response status:', response.status);
    console.log('📥 OpenAI response headers:', response.headers.get('content-type'));

    if (!response.ok) {
      let errorText = await response.text();
      console.error('❌ OpenAI API error response:', errorText);
      
      // Try to parse as JSON first
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.log('🔍 Parsed error data:', errorData);
      } catch (parseError) {
        console.log('⚠️ Could not parse error as JSON, treating as plain text');
        errorData = { error: { message: errorText } };
      }
      
      // Extract error message
      let errorMessage = 'OpenAI API request failed';
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      console.error('❌ Final error message:', errorMessage);
      
      return res.status(500).json({
        error: 'OpenAI API failed',
        message: errorMessage,
        service: 'OpenAI GPT-4',
        status: response.status
      });
    }

    const responseText = await response.text();
    console.log('📝 Raw response length:', responseText.length);
    console.log('📝 Raw response preview:', responseText.substring(0, 200) + '...');

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ Successfully parsed OpenAI response');
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError.message);
      console.error('📝 Response text:', responseText);
      
      return res.status(500).json({
        error: 'Invalid response format',
        message: 'OpenAI returned invalid JSON response',
        service: 'OpenAI GPT-4'
      });
    }
    
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const content = data.choices[0].message.content.trim();
      console.log('✅ Analysis completed successfully');
      console.log('📝 Response content length:', content.length);
      
      res.status(200).json({
        response: content,
        usage: data.usage,
        model: model
      });
    } else {
      console.error('❌ Invalid OpenAI response structure:', JSON.stringify(data, null, 2));
      
      return res.status(500).json({
        error: 'Invalid response structure',
        message: 'OpenAI response missing expected content',
        service: 'OpenAI GPT-4'
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error in analysis:', error);
    
    let errorMessage = 'Analysis failed';
    if (error.message.includes('fetch')) {
      errorMessage = 'Network error: Could not connect to OpenAI API';
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.message.includes('API key')) {
      errorMessage = 'OpenAI API key configuration error';
    }
    
    res.status(500).json({
      error: errorMessage,
      message: error.message,
      service: 'OpenAI GPT-4'
    });
  }
}