# EmotiSense - Setup and Usage Guide

## Prerequisites

1. **Python 3.10+** - [Download from python.org](https://www.python.org/downloads/)
2. **Node.js 16+** - [Download from nodejs.org](https://nodejs.org/)
3. **Webcam** - Required for emotion detection

## Installation

### First Time Setup

1. **Install Backend Dependencies**
   ```bash
   cd emotion_detection
   python -m venv venv
   venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Test Backend (Optional but Recommended)**
   ```bash
   python test_backend.py
   ```
   This will verify all dependencies and model files are correctly installed.

## Running the Application

### Option 1: Using the Start Script (Recommended)

Simply double-click `start_improved.bat` or run:
```bash
start_improved.bat
```

This will:
- Check Python installation
- Start the backend server (Flask on port 5000)
- Wait for the backend to load the AI model
- Start the frontend server (Vite on port 3000)

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd emotion_detection
venv\Scripts\activate
cd backend
python app.py
```

Wait for the message: `[SUCCESS] Model works with...`

**Terminal 2 - Frontend:**
```bash
cd emotion_detection/frontend
npm run dev
```

## Accessing the Application

1. Wait for both servers to start completely
2. Open your browser to: **http://localhost:3000**
3. Allow camera permissions when prompted
4. Click "Try Now" to start emotion detection

## How It Works

When you click "Start Detection":
1. The system tests backend connectivity
2. Captures frames from your webcam every 500ms
3. Sends each frame to the backend for processing
4. Backend detects faces using Haar Cascade
5. AI model predicts emotions for each detected face
6. **A colored square (bounding box) appears on your face**
7. **Your emotion is displayed above the box in real-time**
8. Results are shown on the right panel with confidence scores

## Troubleshooting

### Issue: "Model not detecting faces" or "No bounding box appears"

**Solution:**
1. **MOST IMPORTANT**: Ensure the backend server is running on port 5000
2. Open browser console (F12) and check for errors
3. Verify your webcam is connected and working
4. Make sure you allow camera permissions in your browser
5. Ensure good lighting on your face
6. Face the camera directly
7. Check backend terminal for error messages

### Issue: "Failed to detect emotions" error

**Solution:**
1. Verify the backend is running: Open http://localhost:5000/api/health
2. You should see: `{"status": "healthy", "model_loaded": true, ...}`
3. If not, restart the backend server

### Issue: "Cannot connect to server"

**Solution:**
1. Make sure the backend is running on port 5000
2. Check if another application is using port 5000
3. Try restarting both servers

### Issue: Backend fails to start

**Solution:**
1. Ensure all dependencies are installed:
   ```bash
   venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```
2. Check if the model files exist in the root directory:
   - `ResNet50_Final_Model_Complete.keras`
   - `Final_Resnet50_Best_model.keras`
   - `Custom_CNN_model.keras`

### Issue: Frontend fails to start

**Solution:**
1. Ensure Node.js is installed: `node --version`
2. Reinstall dependencies:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

## Features

- **Live Emotion Detection**: Real-time facial emotion analysis
- **7 Emotions Detected**: Angry, Disgust, Fear, Happy, Neutral, Sad, Surprise
- **Interactive Games**: Test your emotional expressions
- **Privacy-Focused**: All processing happens locally

## Color Theme

The application uses a **blue and white** color scheme:
- Primary: #4A90E2 (Bright Blue)
- Dark: #1E3A8A (Deep Blue)
- White: #FFFFFF

## Technical Details

- **Backend**: Flask (Python)
- **Frontend**: React + Vite
- **AI Model**: ResNet50 (TensorFlow/Keras)
- **Face Detection**: OpenCV Haar Cascade
- **Styling**: Tailwind CSS + Framer Motion

## Support

If you encounter any issues:
1. Check the console logs in both terminal windows
2. Verify all prerequisites are installed
3. Ensure no other applications are using ports 3000 or 5000
4. Try restarting the application

---

**Enjoy using EmotiSense!** 🎭
