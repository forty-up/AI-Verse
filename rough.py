import tensorflow as tf

try:
    print("[INFO] Trying to load model...")
    model = tf.keras.models.load_model("ResNet50_Final_Model_Complete.keras")
    print("[SUCCESS] Model loaded successfully.")
    model.summary()  # Optional
except Exception as e:
    print("[ERROR] Failed to load model:")
    print(e)