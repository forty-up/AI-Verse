import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import img_to_array
import os

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Load the pre-trained emotion detection model
print("[INFO] Loading model...")
model = tf.keras.models.load_model('Final_Resnet50_Best_model.keras')
#model.summary()  # Optional: comment this after first test

# Emotion labels (make sure these match your training labels)
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

# Load Haar cascade for face detection
print("[INFO] Loading face detector...")
face_classifier = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
if face_classifier.empty():
    raise Exception("Failed to load Haar Cascade. Make sure 'haarcascade_frontalface_default.xml' exists.")

# Start webcam
print("[INFO] Starting webcam...")
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise Exception("Webcam not accessible. Check if another app is using it.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("[WARN] Failed to grab frame")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # Use color frame instead of grayscale to match model input (224x224x3)
        face = frame[y:y + h, x:x + w]
        face = cv2.resize(face, (224, 224))
        face = face.astype("float") / 255.0
        face = img_to_array(face)
        face = np.expand_dims(face, axis=0)

        # Predict emotion
        prediction = model.predict(face, verbose=0)[0]
        emotion = emotion_labels[np.argmax(prediction)]
        print(f"[PREDICTION] {emotion} ({prediction})")  # Debug

        # Display prediction
        cv2.putText(frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX,
                    0.9, (36, 255, 12), 2)

    cv2.imshow("Emotion Detector", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("[INFO] Quitting...")
        break

cap.release()
cv2.destroyAllWindows()
