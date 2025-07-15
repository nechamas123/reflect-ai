# Reflect AI - Complete Deployment Guide

## 🚀 Quick Start Summary

**Frontend**: Deploy to Netlify (static hosting)
**Backend**: Deploy to Railway, Render, or Heroku (Node.js hosting)

## 📁 Project Structure

```
reflect-ai/
├── frontend/
│   └── index.html (the complete website)
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── uploads/ (auto-created)
└── README.md
```

## 🔧 Step-by-Step Deployment

### Phase 1: Prepare Your Files

1. **Create the project structure:**
   ```bash
   mkdir reflect-ai
   cd reflect-ai
   mkdir frontend backend
   ```

2. **Save the files:**
   - Save the HTML file as `frontend/index.html`
   - Save the backend server as `backend/server.js`
   - Save the package.json as `backend/package.json`
   - Create `backend/.env` with your API key

### Phase 2: Deploy Backend (Choose One)

#### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your GitHub account and select your repository
5. Set the start command: `cd backend && npm start`
6. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PORT`: 3001
   - `NODE_ENV`: production
7. Deploy and copy the provided URL

#### Option B: Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: production
7. Deploy and copy the provided URL

#### Option C: Heroku
1. Install Heroku CLI
2. Create a new Heroku app:
   ```bash
   cd backend
   heroku create your-app-name
   ```
3. Add environment variables:
   ```bash
   heroku config:set OPENAI_API_KEY=your_key_here
   heroku config:set NODE_ENV=production
   ```
4. Deploy:
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

### Phase 3: Deploy Frontend

#### Netlify Deployment
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Connect your GitHub repository
5. Settings:
   - **Base directory**: `frontend`
   - **Build command**: (leave empty)
   - **Publish directory**: `frontend`
6. **Important**: Update the frontend code with your backend URL:
   - Edit `index.html`
   - Find the line: `const BACKEND_URL = 'https://your-backend-url.com';`
   - Replace with your actual backend URL from Railway/Render/Heroku
7. Deploy the site

### Phase 4: Configure CORS

1. Update your backend `.env` file:
   ```bash
   FRONTEND_URL=https://your-netlify-app.netlify.app
   ```
2. Redeploy your backend

## 🔐 Security Checklist

- ✅ API key stored in environment variables
- ✅ CORS configured for your frontend domain
- ✅ File upload validation
- ✅ Request size limits
- ✅ Error handling without exposing sensitive info

## 🧪 Testing Your Deployment

1. **Test Health Check:**
   ```bash
   curl https://your-backend-url.com/health
   ```

2. **Test Frontend:**
   - Visit your Netlify URL
   - Check if the backend connection indicator shows green
   - Try recording a short audio clip
   - Test file upload with a small audio file

## 📱 Mobile Optimization

The website is already mobile-responsive with:
- Responsive design for all screen sizes
- Touch-friendly buttons
- Mobile-optimized recording interface
- Adaptive layouts for small screens

## 🌍 Language Support

### Hebrew Support Features:
- Hebrew transcription via OpenAI Whisper
- Hebrew analysis via GPT-4
- RTL text support (you may want to add RTL CSS)
- Hebrew speaker identification

### To Add RTL Support (Optional):
Add this CSS to your HTML file:
```css
.rtl {
  direction: rtl;
  text-align: right;
}

.hebrew-text {
  direction: rtl;
  text-align: right;
  font-family: 'Arial', 'Helvetica', sans-serif;
}
```

## 🔧 Advanced Configuration

### Environment Variables Reference:
```bash
# Required
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production

# Optional
PORT=3001
FRONTEND_URL=https://your-netlify-app.netlify.app
MAX_FILE_SIZE=52428800  # 50MB in bytes
MAX_REQUESTS_PER_HOUR=100
```

### Custom Domain Setup:
1. **For Netlify**: Domain settings → Add custom domain
2. **For Backend**: Update CORS configuration with your custom domain

## 🚨 Troubleshooting

### Common Issues:

1. **Backend Connection Failed**
   - Check if backend is running
   - Verify CORS configuration
   - Check environment variables

2. **Transcription Not Working**
   - Verify OpenAI API key
   - Check file size (max 25MB for Whisper)
   - Ensure audio file format is supported

3. **Hebrew Not Transcribing**
   - Set conversation language to Hebrew
   - Ensure clear audio quality
   - Check if Hebrew is detected in logs

4. **Mobile Recording Issues**
   - Ensure HTTPS (required for microphone access)
   - Check browser permissions
   - Test on different mobile browsers

### Debug Steps:
1. Check browser console for errors
2. Check backend logs in Railway/Render dashboard
3. Test API endpoints individually
4. Verify environment variables are set

## 📈 Performance Optimization

### Backend Optimizations:
- File cleanup after 1 hour
- Streaming responses for large files
- Efficient error handling
- Memory management for uploads

### Frontend Optimizations:
- Lazy loading for large components
- Efficient DOM manipulation
- Optimized CSS for mobile
- Progressive enhancement

## 🔄 Updates and Maintenance

### To Update:
1. Push changes to GitHub
2. Netlify will auto-deploy frontend changes
3. Backend will auto-deploy if connected to GitHub
4. Monitor logs for any issues

### Monitoring:
- Check Railway/Render logs regularly
- Monitor API usage in OpenAI dashboard
- Set up alerts for errors (optional)

## 💡 Feature Ideas for Future

- Real-time transcription streaming
- Voice activity detection
- Multiple language support in one conversation
- Conversation history storage
- Export functionality (PDF, text)
- Advanced speaker identification
- Sentiment analysis
- Meeting insights and action items

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review backend logs
3. Test individual components
4. Check OpenAI API status
5. Verify all environment variables

## 🎉 You're Done!

Your Reflect AI website should now be fully functional with:
- ✅ Live conversation recording
- ✅ Hebrew and English transcription
- ✅ AI-powered behavioral analysis
- ✅ Mobile-responsive design
- ✅ Secure API key handling
- ✅ Professional deployment

### Final URLs:
- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://your-backend-url.com`

Enjoy your new conversation analysis tool! 🚀