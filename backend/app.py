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

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

# Initialize interview service with explicit API key
from interview_service import InterviewService
interview_service = InterviewService(api_key=api_key)

# Initialize facial analysis service
from facial_analysis_service import FacialAnalysisService
facial_analysis_service = FacialAnalysisService()

# Download models from Hugging Face if not present
print("[INFO] Checking for model files...")
import requests
from pathlib import Path

# Get Hugging Face configuration from environment
HF_USERNAME = os.getenv('HF_USERNAME', 'forty-up')  # Default to your username
HF_REPO = os.getenv('HF_REPO', 'emotion-detection-models')

model_files = [
    'ResNet50_Final_Model_Complete.keras',
    'Final_Resnet50_Best_model.keras',
    'Custom_CNN_model.keras'
]

# Download models if they don't exist
project_root = os.path.join(os.path.dirname(__file__), '..')
for model_file in model_files:
    model_path = os.path.join(project_root, model_file)

    if not os.path.exists(model_path):
        print(f"[INFO] Model {model_file} not found locally, downloading from Hugging Face...")
        try:
            # Hugging Face model URL
            url = f"https://huggingface.co/{HF_USERNAME}/{HF_REPO}/resolve/main/{model_file}"
            print(f"[INFO] Downloading from: {url}")

            # Download with streaming to handle large files
            response = requests.get(url, stream=True, timeout=300)
            response.raise_for_status()

            # Save to file
            total_size = int(response.headers.get('content-length', 0))
            print(f"[INFO] File size: {total_size / (1024*1024):.1f} MB")

            with open(model_path, 'wb') as f:
                downloaded = 0
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0 and downloaded % (10 * 1024 * 1024) == 0:  # Log every 10MB
                            print(f"[INFO] Downloaded {downloaded / (1024*1024):.1f} / {total_size / (1024*1024):.1f} MB")

            print(f"[SUCCESS] Downloaded {model_file}")
        except Exception as e:
            print(f"[WARNING] Failed to download {model_file}: {str(e)}")
            continue
    else:
        print(f"[INFO] Model {model_file} found locally")

# Load the emotion detection model
print("[INFO] Loading emotion detection model...")
# Try loading different models and test them with a dummy prediction

model = None
loaded_model_name = None
for model_file in model_files:
    try:
        MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', model_file)
        print(f"[INFO] Attempting to load {model_file}...")
        test_model = load_model(MODEL_PATH)

        # Test the model with a dummy RGB image (224x224x3)
        print(f"[INFO] Testing {model_file} with RGB input...")
        dummy_rgb = np.random.rand(1, 224, 224, 3).astype('float32')
        use_grayscale = False
        try:
            test_model.predict(dummy_rgb, verbose=0)
            model = test_model
            loaded_model_name = model_file
            use_grayscale = False
            print(f"[SUCCESS] Model works with RGB input: {model_file}")
            break
        except:
            # Try grayscale if RGB fails
            print(f"[INFO] RGB failed, testing {model_file} with grayscale input...")
            dummy_gray = np.random.rand(1, 224, 224, 1).astype('float32')
            try:
                test_model.predict(dummy_gray, verbose=0)
                model = test_model
                loaded_model_name = model_file
                use_grayscale = True
                print(f"[SUCCESS] Model works with grayscale input: {model_file}")
                break
            except:
                print(f"[WARNING] {model_file} failed both RGB and grayscale tests")
                continue
    except Exception as e:
        print(f"[WARNING] Failed to load {model_file}: {str(e)[:200]}")
        continue

if model is None:
    raise Exception("Failed to load any compatible emotion detection model!")

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
        'model_loaded': True,
        'emotions': emotion_labels
    })

@app.route('/api/detect', methods=['POST'])
def detect_emotion():
    """Detect emotions from base64 encoded image"""
    try:
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
        facial_analysis = facial_analysis_service.analyze_frame(frame)

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
            if use_grayscale:
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
            prediction = model.predict(face, verbose=0)[0]
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
        print(f"[ERROR] {str(e)}")
        return jsonify({'error': str(e)}), 500

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
