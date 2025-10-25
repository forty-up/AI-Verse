# Deployment Guide

## Table of Contents
1. [Host Model Files](#1-host-model-files)
2. [Deploy Backend](#2-deploy-backend)
3. [Deploy Frontend](#3-deploy-frontend)
4. [Full Application Setup](#4-full-application-setup)

---

## 1. Host Model Files

### Option A: Hugging Face (Recommended) 🤗

**Best for ML models - Free, fast, and built for AI**

1. Create account at [huggingface.co](https://huggingface.co)

2. Create a new repository:
   - Click your profile → New Repository
   - Name: `emotion-detection-models`
   - Type: Model
   - License: MIT

3. Install Hugging Face CLI:
   ```bash
   pip install huggingface_hub
   ```

4. Login and upload:
   ```bash
   huggingface-cli login
   # Paste your token from Settings > Access Tokens

   cd C:\Users\tanma\OneDrive\Desktop\aiverse_model\emotion_detection
   huggingface-cli upload YOUR_USERNAME/emotion-detection-models Custom_CNN_model.keras
   huggingface-cli upload YOUR_USERNAME/emotion-detection-models Final_Resnet50_Best_model.keras
   huggingface-cli upload YOUR_USERNAME/emotion-detection-models ResNet50_Final_Model_Complete.keras
   ```

5. Download URL format:
   ```
   https://huggingface.co/YOUR_USERNAME/emotion-detection-models/resolve/main/Custom_CNN_model.keras
   ```

### Option B: Google Drive

1. Upload files to Google Drive
2. Right-click → Share → Get link
3. Change to "Anyone with the link"
4. Copy the file ID from the URL:
   ```
   https://drive.google.com/file/d/FILE_ID_HERE/view
   ```

5. Download URL format:
   ```
   https://drive.google.com/uc?export=download&id=FILE_ID
   ```

### Option C: GitHub Releases (if < 2GB total)

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Upload model files as release assets
4. Direct download URL available after release

---

## 2. Deploy Backend (Python/Flask)

### Option A: Render (Recommended - Free Tier)

1. **Push code to GitHub** (if not done already)

2. **Go to [render.com](https://render.com)** and sign up

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `emotion-detection-backend`
     - **Region**: Choose closest to you
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`

4. **Add Environment Variables:**
   - `PYTHON_VERSION`: `3.9`
   - `MODEL_URL_CNN`: (Hugging Face URL for Custom_CNN_model.keras)
   - `MODEL_URL_RESNET`: (Hugging Face URL for Final_Resnet50_Best_model.keras)

5. **Deploy** - Your backend URL: `https://emotion-detection-backend.onrender.com`

### Option B: Railway

1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Select your repo and `backend` directory
4. Add environment variables
5. Deploy automatically

### Option C: PythonAnywhere

1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Create free account
3. Upload code via Files or Git
4. Configure WSGI file
5. Download models to server

---

## 3. Deploy Frontend (React/Vite)

### Option A: Vercel (Recommended - Best for React)

1. **Go to [vercel.com](https://vercel.com)** and sign up

2. **Import Project:**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Environment Variables:**
   - `VITE_API_URL`: Your backend URL (e.g., `https://emotion-detection-backend.onrender.com`)

4. **Deploy** - Your app URL: `https://your-app.vercel.app`

### Option B: Netlify

1. Go to [netlify.com](https://netlify.com)
2. "Add new site" → "Import from Git"
3. Connect GitHub repo
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variables
6. Deploy

### Option C: GitHub Pages (Static only)

1. Build frontend locally:
   ```bash
   cd frontend
   npm run build
   ```
2. Use `gh-pages` package or Actions to deploy
3. **Note**: You'll need CORS on backend

---

## 4. Full Application Setup

### Update Frontend API URL

Edit `frontend/src` files to use deployed backend URL:

```javascript
// Instead of http://localhost:5000
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com'
```

### Update Backend CORS

In `backend/app.py`:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "https://your-frontend.vercel.app",  # Add your frontend URL
])
```

### Download Models on Backend Startup

Add to `backend/app.py`:

```python
import os
import requests
from pathlib import Path

MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

def download_model(url, filename):
    filepath = MODEL_DIR / filename
    if not filepath.exists():
        print(f"Downloading {filename}...")
        response = requests.get(url, stream=True)
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded {filename}")
    return str(filepath)

# Download models on startup
CNN_MODEL_PATH = download_model(
    os.getenv('MODEL_URL_CNN'),
    'Custom_CNN_model.keras'
)
RESNET_MODEL_PATH = download_model(
    os.getenv('MODEL_URL_RESNET'),
    'Final_Resnet50_Best_model.keras'
)
```

---

## 5. Recommended Setup (Free Tier)

### Best Free Hosting Combination:

1. **Models**: Hugging Face (unlimited storage, fast CDN)
2. **Backend**: Render (750 free hours/month)
3. **Frontend**: Vercel (unlimited bandwidth)

### Steps:

1. Upload models to Hugging Face
2. Deploy backend to Render with Hugging Face model URLs
3. Deploy frontend to Vercel with Render backend URL
4. Test the complete flow

### Total Cost: **$0/month** for moderate usage

---

## 6. Alternative: All-in-One Solutions

### Option A: Hugging Face Spaces

Host everything on Hugging Face:
- Create a Gradio/Streamlit app
- Upload models directly
- Free GPU inference
- URL: `https://huggingface.co/spaces/YOUR_USERNAME/emotion-detection`

### Option B: Railway (Full-stack)

Deploy both frontend and backend on Railway:
- Supports monorepos
- PostgreSQL included
- $5/month credit free

---

## 7. Production Checklist

- [ ] Models uploaded to Hugging Face/Drive
- [ ] Backend deployed and accessible
- [ ] Frontend deployed with correct API URL
- [ ] CORS configured properly
- [ ] Environment variables set
- [ ] Test all features (detection, interview, games)
- [ ] Add custom domain (optional)
- [ ] Set up monitoring (optional)

---

## Need Help?

- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- Hugging Face docs: https://huggingface.co/docs

**Your app will be live at:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com`
- Models: `https://huggingface.co/YOUR_USERNAME/emotion-detection-models`

🚀 **Ready to deploy!**
