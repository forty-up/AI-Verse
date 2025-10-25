# Quick Start Guide - EmotiSense

## 🚀 Start the Application (3 Simple Steps)

### Step 1: Start Backend
Open a terminal and run:
```bash
cd C:\Users\tanma\OneDrive\Desktop\aiverse_model\emotion_detection
venv\Scripts\activate
cd backend
python app.py
```

**Wait for this message:**
```
[SUCCESS] Model works with RGB/grayscale input: [model_name]
[INFO] Starting Flask server...
```

### Step 2: Start Frontend
Open a NEW terminal and run:
```bash
cd C:\Users\tanma\OneDrive\Desktop\aiverse_model\emotion_detection\frontend
npm run dev
```

**Wait for:**
```
  ➜  Local:   http://localhost:3000/
```

### Step 3: Use the Application
1. Open browser to: **http://localhost:3000**
2. Click **"Try Now"** button
3. Click **"Start Detection"**
4. **Allow camera permissions**
5. **Look at the camera!**

---

## ✅ What You Should See

When detection is working:
- ✅ A **colored square (bounding box)** appears around your face
- ✅ Your **emotion name** (Happy, Sad, etc.) shows above the box
- ✅ An **emoji** representing your emotion
- ✅ **Confidence percentage** (e.g., 95%)
- ✅ **Real-time updates** as your expression changes
- ✅ **"LIVE" indicator** in top-right of video
- ✅ **Results panel** on the right showing all detected emotions

---

## 🎨 New Blue Theme

The app now has a beautiful **blue and white** color scheme:
- Primary Blue: #4A90E2
- Dark Blue: #1E3A8A
- Clean white backgrounds

---

## 🔧 Troubleshooting

### No bounding box appearing?

**Check these in order:**

1. **Is backend running?**
   - Look at backend terminal
   - Should say "Starting Flask server..."
   - Should NOT have any errors

2. **Is frontend connected?**
   - Press F12 in browser (opens console)
   - Look for errors
   - Should see: "Testing backend connection..." and "Detection started!"

3. **Camera working?**
   - Make sure you clicked "Allow" for camera permissions
   - Check if you can see yourself in the video feed

4. **Lighting good?**
   - Make sure your face is well-lit
   - Face the camera directly

5. **Still not working?**
   - Restart backend (Ctrl+C, then run again)
   - Refresh browser (Ctrl+Shift+R for hard refresh)
   - Check backend terminal for error messages

---

## 📝 Console Logs (What to Expect)

When you click "Start Detection", check browser console (F12):

**Good signs:**
```
Testing backend connection...
Backend health check: {status: 'healthy', ...}
Detection started!
Webcam initialized successfully
Sending image to backend...
Backend response: {success: true, ...}
Detected 1 face(s)
```

**Bad signs (and how to fix):**
```
Cannot connect to backend
→ Start the backend server!

Failed to access webcam
→ Allow camera permissions!

No faces detected in frame
→ Face the camera directly!
```

---

## 🎮 Features

- **7 Emotions**: Happy, Sad, Angry, Surprise, Fear, Disgust, Neutral
- **Real-time Processing**: ~2 FPS for smooth experience
- **Canvas Overlay**: Professional bounding boxes with corner markers
- **Confidence Scores**: See how confident the AI is
- **Multiple Faces**: Can detect multiple people at once!
- **Privacy**: Everything runs locally on your computer

---

## 💡 Tips for Best Results

1. **Good lighting** - Face a window or lamp
2. **Clear expressions** - Exaggerate your emotions slightly
3. **Face the camera** - Look directly at it
4. **Be patient** - Wait 1-2 seconds for detection to update
5. **Try different emotions** - Smile, frown, act surprised!

---

## 🆘 Need Help?

1. Read `SETUP_GUIDE.md` for detailed instructions
2. Run `python test_backend.py` to verify backend is working
3. Check both terminal windows for error messages
4. Make sure ports 3000 and 5000 are not in use

---

**Enjoy detecting emotions! 😊😢😠😲**
