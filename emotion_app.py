import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

# Load the model - trying different models for TensorFlow 2.20 compatibility
model_files = [
    "Custom_CNN_model.keras",
    "Final_Resnet50_Best_model.keras",
    "ResNet50_Final_Model_Complete.keras"
]

model = None
for model_file in model_files:
    try:
        print(f"[INFO] Attempting to load {model_file}...")
        model = load_model(model_file)
        print(f"[INFO] Model loaded successfully: {model_file}")
        break
    except Exception as e:
        print(f"[WARNING] Failed to load {model_file}: {str(e)[:100]}")
        continue

if model is None:
    raise Exception("Failed to load any emotion detection model!")

# Emotion labels (adjust if needed)
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

# Start video capture1
cap = cv2.VideoCapture(0)

# Load the face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

while True:
    ret, frame = cap.read()
    if not ret:
        break

    grayscale = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(grayscale, scaleFactor=1.3, minNeighbors=5)

    for (x, y, w, h) in faces:
        # Draw bounding box
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # ✅ Crop from COLOR frame
        face = frame[y:y + h, x:x + w]
        face = cv2.resize(face, (224, 224))
        face = face.astype("float32") / 255.0
        face = img_to_array(face)
        face = np.expand_dims(face, axis=0)

        # Predict
        prediction = model.predict(face, verbose=0)[0]
        emotion = emotion_labels[np.argmax(prediction)]
        print(f"[PREDICTION] {emotion}")

        # Put label
        cv2.putText(frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX,
                    0.9, (36, 255, 12), 2)

    # Show the frame
    cv2.imshow('Emotion Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()
