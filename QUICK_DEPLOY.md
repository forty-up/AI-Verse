# Quick Deployment Guide - 3 Simple Steps

## Step 1: Upload Models to Hugging Face (5 minutes)

```bash
# Install Hugging Face CLI
pip install huggingface_hub

# Run the upload script
python upload_models_to_huggingface.py
```

When prompted:
- Enter your Hugging Face username
- Enter your token (get from: https://huggingface.co/settings/tokens)

**You'll get URLs like:**
```
https://huggingface.co/YOUR_USERNAME/emotion-detection-models/resolve/main/Custom_CNN_model.keras
```

---

## Step 2: Deploy Backend to Render (5 minutes)

1. **Go to [render.com](https://render.com)** and sign in with GitHub

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repo**

4. **Configure:**
   - Name: `emotion-detection-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`

5. **Add Environment Variables:**
   - `HF_USERNAME`: Your Hugging Face username
   - `GROQ_API_KEY`: Your Groq API key (get from https://console.groq.com)

6. **Click "Create Web Service"**

Wait ~5 minutes for deployment. You'll get a URL like:
```
https://emotion-detection-backend.onrender.com
```

---

## Step 3: Deploy Frontend to Vercel (3 minutes)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Click "Add New" → "Project"**

3. **Import your GitHub repository**

4. **Configure:**
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variable:**
   - Name: `VITE_API_URL`
   - Value: Your Render backend URL (from Step 2)

6. **Click "Deploy"**

Wait ~2 minutes. You'll get a URL like:
```
https://your-app.vercel.app
```

---

## ✅ Done! Your App is Live!

- 🌐 **Frontend**: https://your-app.vercel.app
- 🔧 **Backend**: https://emotion-detection-backend.onrender.com
- 🤖 **Models**: https://huggingface.co/YOUR_USERNAME/emotion-detection-models

---

## Update Backend CORS (Important!)

After deployment, update `backend/app.py`:

```python
CORS(app, origins=[
    "http://localhost:3000",
    "https://your-app.vercel.app",  # Add your Vercel URL
])
```

Commit and push:
```bash
git add backend/app.py
git commit -m "Update CORS for production"
git push
```

Render will auto-redeploy.

---

## Troubleshooting

### Models not downloading?
- Check HF_USERNAME environment variable on Render
- Make sure models are public on Hugging Face
- Check Render logs for download errors

### CORS errors?
- Add your Vercel URL to CORS origins in `backend/app.py`
- Make sure backend URL is correct in Vercel env vars

### Backend timeout on first request?
- Render free tier sleeps after inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast

---

## Free Tier Limits

- **Hugging Face**: Unlimited storage and bandwidth ✅
- **Render**: 750 hours/month, sleeps after 15min inactivity
- **Vercel**: Unlimited deployments, 100GB bandwidth/month

**Cost: $0/month** for personal use!

---

## Next Steps

- [ ] Add custom domain (optional)
- [ ] Set up monitoring
- [ ] Add analytics
- [ ] Enable auto-deployments on push

🎉 **Your AI app is now live and accessible worldwide!**
