# 🚀 Hosting Checklist

## Before You Start

- [ ] GitHub account
- [ ] Hugging Face account (https://huggingface.co/join)
- [ ] Render account (https://render.com/register)
- [ ] Vercel account (https://vercel.com/signup)
- [ ] Groq API key (https://console.groq.com)

---

## Deployment Steps

### 1️⃣ Models (Hugging Face)

```bash
pip install huggingface_hub
python upload_models_to_huggingface.py
```

- [ ] Models uploaded successfully
- [ ] Model URLs copied
- [ ] Repository is public

**Model URLs:**
```
https://huggingface.co/YOUR_USERNAME/emotion-detection-models
```

---

### 2️⃣ Backend (Render)

**Platform:** https://render.com

- [ ] New Web Service created
- [ ] Connected GitHub repo
- [ ] Root directory: `backend`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `gunicorn app:app --bind 0.0.0.0:$PORT`
- [ ] Environment variables added:
  - `HF_USERNAME`: _______________
  - `GROQ_API_KEY`: _______________
- [ ] Deploy successful
- [ ] Health check passing: `/api/health`

**Backend URL:** `https://________________________.onrender.com`

---

### 3️⃣ Frontend (Vercel)

**Platform:** https://vercel.com

- [ ] New Project created
- [ ] Connected GitHub repo
- [ ] Root directory: `frontend`
- [ ] Framework: Vite
- [ ] Environment variable added:
  - `VITE_API_URL`: (Your Render backend URL)
- [ ] Deploy successful
- [ ] Site loads correctly

**Frontend URL:** `https://________________________.vercel.app`

---

### 4️⃣ Final Configuration

- [ ] Update CORS in `backend/app.py` with your Vercel URL
- [ ] Commit and push changes
- [ ] Test live emotion detection
- [ ] Test interview feature
- [ ] Test all features end-to-end

---

## Testing Your Deployed App

Visit your Vercel URL and test:

- [ ] ✅ Home page loads
- [ ] ✅ Live Detection works
- [ ] ✅ Webcam permission works
- [ ] ✅ Emotion detection displays
- [ ] ✅ Mock Interview works
- [ ] ✅ Speech-to-text works
- [ ] ✅ Results page shows feedback
- [ ] ✅ No CORS errors in console

---

## Quick Links

| Service | URL | Purpose |
|---------|-----|---------|
| **GitHub** | https://github.com/YOUR_USERNAME/YOUR_REPO | Source code |
| **Hugging Face** | https://huggingface.co/YOUR_USERNAME/emotion-detection-models | Model files |
| **Render** | https://dashboard.render.com | Backend hosting |
| **Vercel** | https://vercel.com/dashboard | Frontend hosting |
| **Your Live App** | https://your-app.vercel.app | Production site |

---

## Common Issues & Fixes

### ❌ "Cannot connect to backend"
**Fix:** Check backend URL in Vercel environment variables

### ❌ "CORS error"
**Fix:** Add Vercel URL to CORS origins in `backend/app.py`

### ❌ "Backend timeout"
**Fix:** Render free tier sleeps. First request takes 30-60s

### ❌ "Model not found"
**Fix:** Check HF_USERNAME env var on Render

---

## Costs

| Service | Free Tier | Limit |
|---------|-----------|-------|
| Hugging Face | ✅ Free | Unlimited |
| Render | ✅ Free | 750 hrs/month |
| Vercel | ✅ Free | 100GB bandwidth |

**Total: $0/month** 🎉

---

## Post-Deployment

- [ ] Share your app URL!
- [ ] Add README badges
- [ ] Set up custom domain (optional)
- [ ] Add monitoring (optional)
- [ ] Enable auto-deploy on push

---

## 📞 Need Help?

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Hugging Face Docs](https://huggingface.co/docs)

---

## ✨ Success!

Your AI-powered emotion detection system is now:
- ✅ Hosted on professional cloud platforms
- ✅ Accessible worldwide
- ✅ Free to use
- ✅ Auto-deploys on git push

**Share your creation with the world! 🌍**
