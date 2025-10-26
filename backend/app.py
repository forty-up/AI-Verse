import os
import cv2
import numpy as np
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv()

# Verify API key is loaded (show only first/last 4 chars for security)
api_key = os.environ.get("GROQ_API_KEY")
print(f"[DEBUG] API key value: {api_key is not None}")
print(f"[DEBUG] API key length: {len(api_key) if api_key else 0}")
if api_key:
    masked_key = f"{api_key[:4]}...{api_key[-4:]}"
    print(f"[INFO] Groq API Key loaded: {masked_key}")
else:
    print("[WARNING] Groq API Key not found!")
    print("[INFO] Make sure backend/.env file exists with GROQ_API_KEY")
    # Check if .env file exists
    import os.path
    env_exists = os.path.isfile('.env')
    print(f"[DEBUG] .env file exists in backend/: {env_exists}")
    if env_exists:
        print("[DEBUG] .env file found but GROQ_API_KEY not loaded")
        with open('.env', 'r') as f:
            content = f.read()
            print(f"[DEBUG] .env content preview: {content[:50]}...")

# Suppress TensorFlow warnings and optimize memory
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'

# Configure TensorFlow for memory efficiency
import tensorflow as tf
tf.config.set_soft_device_placement(True)
# Limit TensorFlow memory usage
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(f"[INFO] GPU memory config: {e}")

app = Flask(__name__)
CORS(app)

# Initialize interview service with explicit API key
from interview_service import InterviewService
interview_service = InterviewService(api_key=api_key)

# Initialize facial analysis service
from facial_analysis_service import FacialAnalysisService
facial_analysis_service = FacialAnalysisService()

# MEMORY OPTIMIZATION: Use lazy loading for model
# Model will be loaded on first request instead of at startup
print("[INFO] Model will be loaded on first request (lazy loading for memory optimization)")
import requests
from pathlib import Path

# Get ResNet model URL from environment variables (using only ResNet for better accuracy)
MODEL_URL_RESNET = os.getenv('MODEL_URL_RESNET')
MODEL_FILE = 'Final_Resnet50_Best_model.keras'

# Global variables for lazy loading
model = None
use_grayscale = False
model_lock = False

def download_model_if_needed():
    """Download model from Hugging Face if not present"""
    project_root = os.path.join(os.path.dirname(__file__), '..')
    model_path = os.path.join(project_root, MODEL_FILE)

    if os.path.exists(model_path):
        print(f"[INFO] Model {MODEL_FILE} found locally")
        return model_path

    if not MODEL_URL_RESNET:
        raise Exception("MODEL_URL_RESNET environment variable not set!")

    print(f"[INFO] Model {MODEL_FILE} not found locally, downloading from Hugging Face...")

    # Convert blob URLs to resolve URLs for direct download
    download_url = MODEL_URL_RESNET
    if '/blob/' in download_url:
        download_url = download_url.replace('/blob/', '/resolve/')
        print(f"[INFO] Converted blob URL to resolve URL")

    print(f"[INFO] Downloading from: {download_url[:80]}...")

    try:
        # Download with streaming to handle large files
        response = requests.get(download_url, stream=True, timeout=600)
        response.raise_for_status()

        # Check content type
        content_type = response.headers.get('content-type', '')
        if 'text/html' in content_type:
            raise Exception(f"Received HTML instead of file. Check URL format (use /resolve/ not /blob/)")

        # Save to file
        total_size = int(response.headers.get('content-length', 0))
        print(f"[INFO] File size: {total_size / (1024*1024):.1f} MB")

        if total_size == 0:
            raise Exception("File size is 0 bytes. URL may not be a direct download link.")

        with open(model_path, 'wb') as f:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    # Log progress every 50MB
                    if total_size > 0 and downloaded % (50 * 1024 * 1024) < 8192:
                        progress = (downloaded / total_size) * 100
                        print(f"[INFO] Progress: {progress:.1f}%")

        file_size = os.path.getsize(model_path)
        if file_size == 0:
            os.remove(model_path)
            raise Exception("Downloaded file is empty")

        print(f"[SUCCESS] Downloaded {MODEL_FILE} ({file_size / (1024*1024):.1f} MB)")
        return model_path

    except Exception as e:
        if os.path.exists(model_path):
            os.remove(model_path)
        raise Exception(f"Failed to download model: {str(e)}")

def load_emotion_model():
    """Lazy load the emotion detection model on first use"""
    global model, use_grayscale, model_lock

    if model is not None:
        return model, use_grayscale

    if model_lock:
        # Another request is already loading the model
        import time
        for _ in range(60):  # Wait up to 60 seconds
            time.sleep(1)
            if model is not None:
                return model, use_grayscale
        raise Exception("Timeout waiting for model to load")

    model_lock = True

    try:
        print("[INFO] Loading emotion detection model (ResNet50)...")

        # Download model if needed
        model_path = download_model_if_needed()

        # Load the model
        print(f"[INFO] Loading {MODEL_FILE}...")
        loaded_model = load_model(model_path)

        # Test with RGB input (ResNet50 typically uses RGB)
        print(f"[INFO] Testing model with RGB input...")
        dummy_rgb = np.random.rand(1, 224, 224, 3).astype('float32')
        try:
            loaded_model.predict(dummy_rgb, verbose=0)
            model = loaded_model
            use_grayscale = False
            print(f"[SUCCESS] Model loaded and tested with RGB input")
        except Exception as rgb_error:
            # Try grayscale if RGB fails
            print(f"[INFO] RGB failed, testing with grayscale input...")
            dummy_gray = np.random.rand(1, 224, 224, 1).astype('float32')
            loaded_model.predict(dummy_gray, verbose=0)
            model = loaded_model
            use_grayscale = True
            print(f"[SUCCESS] Model loaded and tested with grayscale input")

        model_lock = False
        return model, use_grayscale

    except Exception as e:
        model_lock = False
        raise Exception(f"Failed to load model: {str(e)}")

# Load face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Emotion labels
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

# Emotion emoji mapping
emotion_emojis = {
    'Angry': '😠',
    'Disgust': '🤢',
    'Fear': '😨',
    'Happy': '😊',
    'Neutral': '😐',
    'Sad': '😢',
    'Surprise': '😲'
}

# Emotion colors for visualization
emotion_colors = {
    'Angry': '#FF4444',
    'Disgust': '#9C27B0',
    'Fear': '#FF9800',
    'Happy': '#4CAF50',
    'Neutral': '#607D8B',
    'Sad': '#2196F3',
    'Surprise': '#FFEB3B'
}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_lazy_loading': True,
        'emotions': emotion_labels
    })

@app.route('/api/detect', methods=['POST'])
def detect_emotion():
    """Detect emotions from base64 encoded image"""
    try:
        # Lazy load model on first request
        print("[INFO] Loading emotion model...")
        emotion_model, is_grayscale = load_emotion_model()
        print("[INFO] Model loaded successfully")

        data = request.get_json()

        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        # Decode base64 image
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({'error': 'Invalid image data'}), 400

        # Convert to grayscale for face detection
        grayscale = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Perform facial analysis with MediaPipe
        print("[INFO] Running facial analysis...")
        try:
            facial_analysis = facial_analysis_service.analyze_frame(frame)
            print("[INFO] Facial analysis completed")
        except Exception as fa_error:
            print(f"[WARNING] Facial analysis failed: {str(fa_error)}")
            # Continue without facial analysis
            facial_analysis = {
                'eye_contact': 0,
                'confidence_score': 0,
                'engagement_score': 0,
                'head_pose': {'pitch': 0, 'yaw': 0, 'roll': 0}
            }

        # Detect faces
        faces = face_cascade.detectMultiScale(
            grayscale,
            scaleFactor=1.3,
            minNeighbors=5,
            minSize=(30, 30)
        )

        results = []

        for (x, y, w, h) in faces:
            # Extract face ROI
            face_roi = frame[y:y+h, x:x+w]

            # Prepare input based on model requirements
            if is_grayscale:
                # Grayscale input (1 channel)
                face_gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
                face = cv2.resize(face_gray, (224, 224))
                face = face.astype("float32") / 255.0
                face = np.expand_dims(face, axis=-1)  # Add channel dimension
                face = np.expand_dims(face, axis=0)   # Add batch dimension
            else:
                # RGB input (3 channels)
                face = cv2.resize(face_roi, (224, 224))
                face = face.astype("float32") / 255.0
                face = img_to_array(face)
                face = np.expand_dims(face, axis=0)

            # Predict emotion
            prediction = emotion_model.predict(face, verbose=0)[0]
            emotion_idx = np.argmax(prediction)
            emotion = emotion_labels[emotion_idx]
            confidence = float(prediction[emotion_idx])

            # Create probability distribution
            probabilities = {
                emotion_labels[i]: float(prediction[i])
                for i in range(len(emotion_labels))
            }

            results.append({
                'bbox': {
                    'x': int(x),
                    'y': int(y),
                    'width': int(w),
                    'height': int(h)
                },
                'emotion': emotion,
                'confidence': confidence,
                'probabilities': probabilities,
                'emoji': emotion_emojis[emotion],
                'color': emotion_colors[emotion],
                # Add facial analysis data
                'facial_analysis': facial_analysis
            })

        return jsonify({
            'success': True,
            'faces_detected': len(results),
            'results': results,
            'facial_analysis': facial_analysis  # Also include at root level
        })

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"[ERROR] Error in /api/detect endpoint:")
        print(f"[ERROR] {str(e)}")
        print(f"[ERROR] Traceback:\n{error_details}")
        return jsonify({'error': str(e), 'details': 'Check server logs for more information'}), 500

@app.route('/api/emotions', methods=['GET'])
def get_emotions():
    """Get all available emotions with metadata"""
    emotions_data = [
        {
            'name': emotion,
            'emoji': emotion_emojis[emotion],
            'color': emotion_colors[emotion]
        }
        for emotion in emotion_labels
    ]
    return jsonify(emotions_data)

# ==================== INTERVIEW ENDPOINTS ====================

@app.route('/api/interview/generate-questions', methods=['POST'])
def generate_questions():
    """Generate interview questions based on role and job description"""
    try:
        data = request.get_json()

        role = data.get('role')
        job_description = data.get('job_description')
        experience_level = data.get('experience_level', 'mid')
        num_questions = data.get('num_questions', 5)

        if not role:
            return jsonify({'error': 'Role is required'}), 400

        if not job_description:
            return jsonify({'error': 'Job description is required'}), 400

        questions = interview_service.generate_interview_questions(
            role=role,
            job_description=job_description,
            experience_level=experience_level,
            num_questions=num_questions
        )

        return jsonify({
            'success': True,
            'questions': questions,
            'role': role,
            'num_questions': len(questions)
        })

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/score-answer', methods=['POST'])
def score_answer():
    """Score an interview answer"""
    try:
        data = request.get_json()

        question = data.get('question')
        answer = data.get('answer')
        question_type = data.get('question_type', 'general')
        role = data.get('role')

        if not question or not answer:
            return jsonify({'error': 'Question and answer are required'}), 400

        evaluation = interview_service.score_answer(
            question=question,
            answer=answer,
            question_type=question_type,
            role=role
        )

        return jsonify({
            'success': True,
            'evaluation': evaluation
        })

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/overall-feedback', methods=['POST'])
def overall_feedback():
    """Generate overall interview feedback"""
    try:
        data = request.get_json()

        role = data.get('role')
        questions_and_scores = data.get('questions_and_scores', [])
        emotion_data = data.get('emotion_data', {})

        if not role or not questions_and_scores:
            return jsonify({'error': 'Role and questions_and_scores are required'}), 400

        feedback = interview_service.generate_overall_feedback(
            role=role,
            questions_and_scores=questions_and_scores,
            emotion_data=emotion_data
        )

        return jsonify({
            'success': True,
            'feedback': feedback
        })

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("[INFO] Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
