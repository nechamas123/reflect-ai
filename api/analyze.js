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
    const { prompt, maxTokens = 1000, language } = req.body;
    console.log('🤖 Analysis request received');

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'No prompt provided',
        message: 'Please provide a valid prompt for analysis'
      });
    }

    if (prompt.length > 15000) {
      return res.status(400).json({
        error: 'Prompt too long',
        message: 'Please provide a shorter prompt (max 15,000 characters)'
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
        max_tokens: Math.min(maxTokens, 3000),
        temperature: 0.7
      })
    });

    console.log('📥 OpenAI response status:', response.status);

    if (!response.ok) {
      let errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      
      // Try to parse as JSON first
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // If not JSON, wrap in error object
        errorData = { error: { message: errorText } };
      }
      
      // Extract error message
      let errorMessage = 'OpenAI API request failed';
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      throw new Error(`OpenAI API failed: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      console.log('✅ Analysis completed');
      res.status(200).json({
        response: data.choices[0].message.content.trim(),
        usage: data.usage,
        model: 'gpt-4'
      });
    } else {
      console.error('❌ Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI - no content found');
    }

  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    
    let errorMessage = 'Analysis failed';
    if (error.message.includes('OpenAI API failed')) {
      errorMessage = 'AI analysis service temporarily unavailable. Please try again.';
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    }
    
    res.status(500).json({
      error: errorMessage,
      message: error.message,
      service: 'OpenAI GPT-4'
    });
  }
}