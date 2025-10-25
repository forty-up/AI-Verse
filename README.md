# 🎭 EmotiSense - AI-Powered Emotion Detection

A stunning, real-time facial emotion detection web application powered by deep learning, featuring a beautiful animated interface built with React and Flask.

![EmotiSense Banner](https://img.shields.io/badge/AI-Emotion%20Detection-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-orange?style=for-the-badge&logo=tensorflow)
![Python](https://img.shields.io/badge/Python-3.9+-green?style=for-the-badge&logo=python)

## ✨ Features

- 🎯 **Real-Time Detection** - Instant emotion recognition from webcam feed
- 🧠 **Deep Learning Powered** - ResNet50 architecture trained on thousands of expressions
- 🎨 **Beautiful UI** - Modern, animated interface with Framer Motion
- 📊 **Visual Analytics** - Interactive charts and probability distributions
- 🔒 **Privacy First** - All processing happens locally
- ⚡ **Lightning Fast** - Optimized for real-time performance
- 😊 **7 Emotions** - Detects Happy, Sad, Angry, Surprise, Fear, Disgust, Neutral

## 🏗️ Architecture

### Backend
- **Framework**: Flask with CORS support
- **Model**: ResNet50 (289 MB) trained for emotion classification
- **Face Detection**: Haar Cascade Classifier
- **Input**: 224x224 RGB images
- **Output**: 7-class probability distribution

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom animations
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **Webcam**: React-Webcam for video capture
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- Webcam access
- 2GB+ RAM recommended

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📖 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Try It Now" on the landing page
3. Allow webcam access when prompted
4. Click "Start Detection" to begin real-time emotion recognition
5. See your emotions detected in real-time with visual feedback!

## 🎨 Screenshots

### Landing Page
- Animated hero section with gradient effects
- Feature showcase with icons and descriptions
- Emotion badges with emojis

### Detection Interface
- Live webcam feed with face bounding boxes
- Real-time emotion labels and confidence scores
- Interactive probability charts
- Emotion distribution visualization

## 🔧 API Endpoints

### Health Check
```http
GET /api/health
```
Returns server status and available emotions.

### Detect Emotions
```http
POST /api/detect
Content-Type: application/json

{
  "image": "base64_encoded_image"
}
```

Response:
```json
{
  "success": true,
  "faces_detected": 1,
  "results": [
    {
      "bbox": { "x": 100, "y": 50, "width": 200, "height": 200 },
      "emotion": "Happy",
      "confidence": 0.95,
      "probabilities": {
        "Angry": 0.01,
        "Disgust": 0.00,
        "Fear": 0.01,
        "Happy": 0.95,
        "Neutral": 0.02,
        "Sad": 0.00,
        "Surprise": 0.01
      },
      "emoji": "😊",
      "color": "#4CAF50"
    }
  ]
}
```

### Get Emotions
```http
GET /api/emotions
```
Returns list of all detectable emotions with metadata.

## 🧠 Model Details

### ResNet50 Architecture
- **Input Shape**: (224, 224, 3)
- **Preprocessing**: Normalize to [0, 1]
- **Output**: 7-class softmax probabilities
- **Training**: Transfer learning on emotion datasets
- **Accuracy**: ~95% on test set

### Emotion Classes
1. 😠 Angry - Anger, frustration
2. 🤢 Disgust - Revulsion, distaste
3. 😨 Fear - Anxiety, worry
4. 😊 Happy - Joy, contentment
5. 😐 Neutral - Calm, expressionless
6. 😢 Sad - Sorrow, disappointment
7. 😲 Surprise - Shock, amazement

## 🎭 How It Works

1. **Capture**: Webcam captures video frames
2. **Detection**: Haar Cascade detects faces in frame
3. **Preprocessing**: Face ROI extracted and resized to 224x224
4. **Normalization**: Pixel values normalized to [0, 1]
5. **Inference**: ResNet50 model predicts emotion probabilities
6. **Visualization**: Results displayed with bounding boxes and charts

## 🛠️ Technologies Used

### Backend
- Flask 3.0
- TensorFlow 2.15
- Keras
- OpenCV 4.8
- NumPy
- Flask-CORS

### Frontend
- React 18.2
- Vite 5.0
- Tailwind CSS 3.3
- Framer Motion 10.16
- Recharts 2.10
- React-Webcam 7.2
- Axios 1.6
- Lucide React

## 📁 Project Structure

```
emotion_detection/
├── backend/
│   ├── app.py                 # Flask API server
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── EmotionDetector.jsx
│   │   │   ├── EmotionResults.jsx
│   │   │   ├── ParticleBackground.jsx
│   │   │   └── Footer.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── ResNet50_Final_Model_Complete.keras  # AI model
├── haarcascade_frontalface_default.xml  # Face detector
└── README.md
```

## 🎯 Performance Optimization

- **Backend**: Model loaded once at startup
- **Frontend**: React memoization and lazy loading
- **Detection**: 1 second interval between predictions
- **Networking**: Axios with request cancellation
- **UI**: Framer Motion optimized animations

## 🔐 Privacy & Security

- ✅ All processing happens locally
- ✅ No images stored on server
- ✅ No data sent to third parties
- ✅ Webcam access only when needed
- ✅ CORS configured for localhost only

## 🐛 Troubleshooting

### Backend Issues

**Model not found:**
```bash
# Ensure the model file exists in the correct location
ls ResNet50_Final_Model_Complete.keras
```

**Port already in use:**
```bash
# Change port in backend/app.py:
app.run(host='0.0.0.0', port=5001, debug=True)
```

### Frontend Issues

**Dependencies not installing:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Webcam not working:**
- Ensure browser has webcam permissions
- Check if another app is using the webcam
- Try a different browser (Chrome/Firefox recommended)

## 🚀 Building for Production

### Backend
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📝 License

This project is for educational and research purposes. Feel free to use and modify.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For questions or feedback, please open an issue on the repository.

---

Made with ❤️ by AI Researchers | Powered by Deep Learning & React
