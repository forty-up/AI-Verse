# 🎯 Mock Interview Platform - Setup Guide

## Overview

Your emotion detection app has been transformed into a comprehensive **AI-Powered Mock Interview Platform** that combines:
- **LLM-Generated Questions** (Groq + Llama-3.3-70b)
- **Real-time Emotion Detection** (ResNet50)
- **Speech-to-Text** (Web Speech API)
- **AI Performance Scoring** (Groq)
- **Detailed Feedback & Analytics**

---

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r ../requirements.txt
```

New packages added:
- `groq==0.11.0` - LLM API for question generation and scoring
- `SpeechRecognition==3.10.0` - For audio processing (optional)
- `pydub==0.25.1` - Audio utilities (optional)

### 2. Get Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key

**Free Tier Limits:**
- 30 requests/minute
- 14,400 requests/day
- Perfect for testing and moderate usage

### 3. Set Environment Variable

**Windows (PowerShell):**
```powershell
$env:GROQ_API_KEY="your-api-key-here"
```

**Windows (Command Prompt):**
```cmd
set GROQ_API_KEY=your-api-key-here
```

**Linux/Mac:**
```bash
export GROQ_API_KEY="your-api-key-here"
```

**Permanent Setup (Recommended):**

Create a `.env` file in the project root:
```
GROQ_API_KEY=your-api-key-here
```

Then install python-dotenv and update backend/app.py:
```bash
pip install python-dotenv
```

Add to top of `backend/app.py`:
```python
from dotenv import load_dotenv
load_dotenv()
```

### 4. Start Backend

```bash
cd backend
python app.py
```

Backend will run on: `http://localhost:5000`

### 5. Start Frontend

```bash
cd frontend
npm install  # if not already done
npm run dev
```

Frontend will run on: `http://localhost:3000` (or the port shown in terminal)

---

## 🎨 Features Overview

### 1. **Pre-Interview Setup**
- Enter job role/title
- Paste job description
- Select experience level (entry/mid/senior)
- Choose number of questions (3/5/7/10)

### 2. **Interview Interface**
- **AI-Generated Questions**: Role-specific questions from Groq LLM
- **Live Webcam**: Real-time emotion detection during answers
- **Speech-to-Text**: Speak your answers (Chrome/Edge only)
- **Manual Typing**: Type answers if preferred
- **Emotion Tracking**: Tracks emotions throughout interview

### 3. **Results Dashboard**
- **Overall Score**: AI-calculated performance score
- **Question-by-Question Breakdown**: Detailed feedback for each answer
- **Emotion Analysis**: Charts showing dominant emotions
- **AI Feedback**: Strengths, improvements, and recommendations
- **Performance Metrics**: Time spent, confidence levels, etc.

---

## 🏗️ Architecture

### Backend (Flask)
```
backend/
├── app.py                    # Main Flask app with endpoints
├── interview_service.py      # Groq LLM integration
└── requirements.txt          # Python dependencies
```

**API Endpoints:**
- `POST /api/interview/generate-questions` - Generate interview questions
- `POST /api/interview/score-answer` - Score individual answers
- `POST /api/interview/overall-feedback` - Get comprehensive feedback
- `POST /api/detect` - Emotion detection (existing)

### Frontend (React + Vite)
```
frontend/src/components/
├── InterviewSetup.jsx        # Pre-interview form
├── InterviewInterface.jsx    # Main interview UI
├── InterviewResults.jsx      # Results dashboard
├── EmotionDetector.jsx       # Original emotion detector
├── Hero.jsx                  # Updated landing page
├── Navbar.jsx                # Updated navigation
└── ...other components
```

---

## 🔧 How It Works

### Question Generation Flow

1. User enters role + job description
2. Frontend sends request to `/api/interview/generate-questions`
3. Backend calls Groq API with Llama-3.3-70b model
4. LLM generates role-specific questions (technical, behavioral, scenario-based)
5. Questions returned as JSON array

### Interview Flow

1. Display question one at a time
2. Start webcam for emotion detection (every 2 seconds)
3. User can speak (speech-to-text) or type answer
4. Timer tracks time per question
5. On "Next", answer is sent to `/api/interview/score-answer`
6. Groq LLM evaluates answer and provides feedback
7. Emotion data collected throughout

### Results Generation

1. All answers + emotions aggregated
2. Sent to `/api/interview/overall-feedback`
3. LLM analyzes overall performance
4. Returns comprehensive feedback with:
   - Overall score
   - Technical performance
   - Communication skills
   - Emotional intelligence insights
   - Recommendations

---

## 💡 LLM Prompt Engineering

### Question Generation Prompt
```
Generate {num} interview questions for:
Role: {role}
Experience: {level}
JD: {description}

Mix of: Technical, Behavioral, Scenario, Problem-solving
Return JSON with: type, question, difficulty
```

### Answer Scoring Prompt
```
Evaluate answer for:
Question: {question}
Type: {type}
Answer: {answer}
Role: {role}

Return JSON with: score (0-100), feedback, strengths, improvements
```

### Overall Feedback Prompt
```
Analyze interview performance:
Questions: {all_questions_with_scores}
Emotions: {emotion_stats}

Return: overall_score, summary, strengths, improvements, recommendations
```

---

## 🎯 Speech-to-Text

**Browser Support:**
- ✅ Chrome/Chromium
- ✅ Edge
- ❌ Firefox (not supported)
- ❌ Safari (limited support)

**How it works:**
- Uses Web Speech API (built into browser)
- No server-side processing needed
- Real-time transcription
- Continuous listening mode

**Fallback:**
- Users can always type their answers
- Speech-to-text is optional enhancement

---

## 📊 Emotion Detection Integration

**During Interview:**
- Captures emotion every 2 seconds
- Stores: emotion, confidence, timestamp, question index
- Non-blocking (doesn't interrupt user)

**In Results:**
- Dominant emotions (top 3)
- Average confidence level
- Nervous moments count
- Emotion distribution chart

**LLM Integration:**
- Emotion data sent to LLM for analysis
- LLM provides insights like:
  - "Candidate showed consistent confidence"
  - "Nervousness detected during technical questions"
  - "Emotional intelligence demonstrates good self-awareness"

---

## 🔐 Privacy & Security

- ✅ All processing happens locally
- ✅ No video/audio stored on server
- ✅ Answers not saved to database (session only)
- ✅ Groq API: answers sent for scoring but not stored long-term
- ✅ Emotion detection runs client-side
- ✅ No third-party tracking

---

## 🐛 Troubleshooting

### "GROQ_API_KEY not set" Error
**Problem:** Environment variable not configured

**Solutions:**
1. Set environment variable before running backend:
   ```bash
   export GROQ_API_KEY="your-key"  # Linux/Mac
   set GROQ_API_KEY=your-key       # Windows CMD
   $env:GROQ_API_KEY="your-key"    # Windows PowerShell
   ```

2. Or use `.env` file (recommended for development)

### Speech-to-Text Not Working
**Problem:** Browser doesn't support Web Speech API

**Solutions:**
1. Use Chrome or Edge browser
2. Grant microphone permissions
3. Use HTTPS (required for microphone access)
4. Fallback: Type answers manually

### Emotion Detection Not Working
**Problem:** Webcam not accessible

**Solutions:**
1. Grant camera permissions in browser
2. Close other apps using webcam
3. Check if camera is working in other apps
4. Use different browser

### Groq API Rate Limit
**Problem:** "Too many requests" error

**Solutions:**
1. Free tier: 30 req/min, 14,400/day
2. Wait a minute and try again
3. Reduce number of questions
4. Consider upgrading Groq plan for production

### JSON Parsing Errors
**Problem:** LLM returns invalid JSON

**Solutions:**
1. Our code handles markdown code blocks (```json)
2. Fallback questions available if API fails
3. Check Groq API status: https://status.groq.com

---

## 🚀 Production Deployment

### Backend

1. **Use Gunicorn:**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
```

2. **Environment Variables:**
- Set `GROQ_API_KEY` via hosting platform
- Use secrets management (AWS Secrets Manager, etc.)

3. **CORS Configuration:**
Update `CORS(app)` in `app.py` for production domain

### Frontend

1. **Build:**
```bash
cd frontend
npm run build
```

2. **Deploy:**
- Vercel, Netlify, or any static host
- Update API URL in components (use env variables)

### Recommended Stack
- **Backend**: Railway, Render, or Fly.io
- **Frontend**: Vercel or Netlify
- **Database** (optional): PostgreSQL for storing interview history

---

## 📈 Future Enhancements

Suggested features to add:

1. **Video Recording**: Save interview videos for review
2. **Answer Database**: Store past interviews for progress tracking
3. **Multi-language**: Support interviews in different languages
4. **Company-Specific**: Train on specific company interview styles
5. **Live Feedback**: Real-time suggestions during answers
6. **Mock Interviewers**: AI avatars asking questions
7. **Peer Review**: Share results with mentors/coaches
8. **Practice Mode**: No scoring, just practice
9. **Industry Templates**: Pre-made JDs for common roles
10. **Analytics Dashboard**: Track improvement over time

---

## 📚 API Reference

### Generate Questions
```http
POST /api/interview/generate-questions
Content-Type: application/json

{
  "role": "Senior Software Engineer",
  "job_description": "Build scalable web apps...",
  "experience_level": "senior",
  "num_questions": 5
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "type": "technical",
      "question": "Explain the concept of...",
      "difficulty": "hard"
    }
  ],
  "role": "Senior Software Engineer",
  "num_questions": 5
}
```

### Score Answer
```http
POST /api/interview/score-answer
Content-Type: application/json

{
  "question": "What is your experience with...",
  "answer": "I have worked extensively on...",
  "question_type": "technical",
  "role": "Software Engineer"
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "score": 85,
    "feedback": "Strong answer demonstrating...",
    "strengths": ["Clear communication", "Technical depth"],
    "improvements": ["Could add specific metrics"],
    "key_points_covered": ["Experience", "Results"],
    "missing_points": ["Team collaboration"]
  }
}
```

### Overall Feedback
```http
POST /api/interview/overall-feedback
Content-Type: application/json

{
  "role": "Software Engineer",
  "questions_and_scores": [
    {
      "question": "...",
      "type": "technical",
      "answer": "...",
      "score": 85
    }
  ],
  "emotion_data": {
    "dominant_emotions": ["Happy", "Neutral"],
    "avg_confidence": 0.87,
    "nervous_moments": 2
  }
}
```

---

## 🤝 Support

For issues or questions:
1. Check this guide first
2. Review error messages in browser console (F12)
3. Check backend terminal for errors
4. Verify GROQ_API_KEY is set correctly
5. Test with simple role first (e.g., "Software Developer")

---

## 📝 License

Educational and personal use. For commercial deployment, review:
- Groq Terms of Service
- OpenCV License
- TensorFlow License

---

**Built with:**
- Groq (Llama-3.3-70b) for AI
- Flask for backend
- React for frontend
- TensorFlow for emotion detection
- Web Speech API for voice

**Happy Interviewing! 🎯**
