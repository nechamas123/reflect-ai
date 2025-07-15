import formidable from 'formidable';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Enhanced speaker identification with better prompts
async function identifySpeakers(transcriptText, language = 'en') {
  try {
    console.log('🤖 Identifying speakers with AI...');
    
    const isHebrew = language === 'he';
    const languageInstruction = isHebrew ? 
      'אנא השב בעברית בלבד. ' : 
      'Please respond in English only. ';
    
    const prompt = `${languageInstruction}You are an expert at analyzing conversations and identifying different speakers based on dialogue patterns, conversation flow, and natural speech transitions.

Analyze this conversation transcript and identify different speakers. Look for:
- Natural conversation turns and responses
- Different speaking styles or topics
- Clear dialogue patterns
- Context clues that indicate speaker changes

Format the output with "Speaker A:", "Speaker B:", etc. for each different person speaking.

Important guidelines:
- Only separate speakers when you're confident there's a genuine speaker change
- If unsure, it's better to keep text together under one speaker
- Look for natural conversation flow and responses
- Consider context and dialogue patterns

Original transcript:
${transcriptText}

Please format as:
Speaker A: [their part]
Speaker B: [their part]
etc.

Return ONLY the formatted transcript with speaker labels, nothing else.`;

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
            content: 'You are an expert at analyzing conversations and identifying different speakers based on context, dialogue flow, and natural conversation patterns. You understand Hebrew and English perfectly.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.log('⚠️ Speaker identification failed, using single speaker');
      return `Speaker A: ${transcriptText}`;
    }

    const data = await response.json();
    const speakerFormattedText = data.choices[0].message.content;
    
    console.log('✅ Speaker identification completed');
    return speakerFormattedText;
    
  } catch (error) {
    console.error('❌ Speaker identification error:', error.message);
    console.log('⚠️ Falling back to single speaker');
    return `Speaker A: ${transcriptText}`;
  }
}

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
    console.log('📥 Transcription request received');

    // Parse form data
    const form = formidable({
      maxFileSize: 25 * 1024 * 1024, // 25MB limit for Whisper
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const audioFile = files.audio?.[0];
    const language = fields.language?.[0] || 'auto';

    if (!audioFile) {
      return res.status(400).json({ 
        error: 'No audio file provided',
        message: 'Please upload an audio file'
      });
    }

    console.log(`🎙️ Processing: ${audioFile.originalFilename} (${audioFile.size} bytes) in ${language}`);

    // Validate file type
    if (!audioFile.mimetype?.startsWith('audio/')) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Please upload an audio file (mp3, wav, m4a, etc.)'
      });
    }

    // Create form data for Whisper API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFile.filepath), {
      filename: audioFile.originalFilename || 'audio.wav',
      contentType: audioFile.mimetype || 'audio/wav'
    });
    formData.append('model', 'whisper-1');
    
    // Set language if specified
    if (language && language !== 'auto') {
      const whisperLanguage = language === 'he' ? 'he' : 'en';
      formData.append('language', whisperLanguage);
      console.log('🗣️ Whisper language set to:', whisperLanguage);
    }
    
    formData.append('response_format', 'verbose_json');
    
    console.log('📤 Sending to Whisper API...');
    
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('📥 Whisper response status:', whisperResponse.status);

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('❌ Whisper API error:', errorText);
      throw new Error(`Whisper API failed: ${whisperResponse.status} - ${errorText}`);
    }

    const whisperData = await whisperResponse.json();
    console.log('✅ Whisper transcription completed');
    console.log('📝 Transcribed text length:', whisperData.text ? whisperData.text.length : 0);
    
    // Only identify speakers if transcript is substantial
    let finalTranscript = whisperData.text;
    if (whisperData.text.length > 50) {
      finalTranscript = await identifySpeakers(whisperData.text, language);
    } else {
      finalTranscript = `Speaker A: ${whisperData.text}`;
    }
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(audioFile.filepath);
    } catch (cleanupError) {
      console.log('⚠️ Could not clean up file:', cleanupError.message);
    }
    
    // Return immediate result
    res.status(200).json({
      status: 'completed',
      transcript: finalTranscript,
      confidence: 0.9,
      audio_duration: whisperData.duration || 0,
      language: whisperData.language || language,
      transcription_service: 'OpenAI Whisper',
      speaker_identification: 'AI-powered',
      segments_count: whisperData.segments ? whisperData.segments.length : 0
    });

  } catch (error) {
    console.error('❌ Transcription error:', error.message);
    
    // Return appropriate error message
    let errorMessage = 'Transcription failed';
    if (error.message.includes('File too large')) {
      errorMessage = 'File too large. Please upload a file smaller than 25MB';
    } else if (error.message.includes('Whisper API failed')) {
      errorMessage = 'Transcription service temporarily unavailable. Please try again.';
    }
    
    res.status(500).json({
      error: errorMessage,
      message: error.message,
      service: 'OpenAI Whisper'
    });
  }
}