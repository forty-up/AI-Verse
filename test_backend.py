"""
Quick test script to verify emotion detection backend is working
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

print("=" * 60)
print("EmotiSense Backend Test")
print("=" * 60)
print()

# Test 1: Check Python version
print("[1/5] Checking Python version...")
import platform
python_version = platform.python_version()
print(f"✓ Python {python_version}")
print()

# Test 2: Check required packages
print("[2/5] Checking required packages...")
try:
    import flask
    print(f"✓ Flask {flask.__version__}")
except ImportError:
    print("✗ Flask not installed")
    sys.exit(1)

try:
    import cv2
    print(f"✓ OpenCV {cv2.__version__}")
except ImportError:
    print("✗ OpenCV not installed")
    sys.exit(1)

try:
    import tensorflow as tf
    print(f"✓ TensorFlow {tf.__version__}")
except ImportError:
    print("✗ TensorFlow not installed")
    sys.exit(1)

try:
    import numpy as np
    print(f"✓ NumPy {np.__version__}")
except ImportError:
    print("✗ NumPy not installed")
    sys.exit(1)

print()

# Test 3: Check model files
print("[3/5] Checking model files...")
model_files = [
    'ResNet50_Final_Model_Complete.keras',
    'Final_Resnet50_Best_model.keras',
    'Custom_CNN_model.keras'
]

found_models = []
for model_file in model_files:
    if os.path.exists(model_file):
        size_mb = os.path.getsize(model_file) / (1024 * 1024)
        print(f"✓ {model_file} ({size_mb:.1f} MB)")
        found_models.append(model_file)
    else:
        print(f"  {model_file} (not found)")

if not found_models:
    print("✗ No model files found!")
    sys.exit(1)

print()

# Test 4: Check Haar Cascade
print("[4/5] Checking Haar Cascade...")
if os.path.exists('haarcascade_frontalface_default.xml'):
    print("✓ haarcascade_frontalface_default.xml found")
else:
    print("✗ haarcascade_frontalface_default.xml not found")
    # Try to use OpenCV's built-in cascade
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    if os.path.exists(cascade_path):
        print(f"✓ Using OpenCV built-in cascade: {cascade_path}")
    else:
        print("✗ Haar Cascade not available")
        sys.exit(1)

print()

# Test 5: Try loading a model
print("[5/5] Testing model loading...")
try:
    from tensorflow.keras.models import load_model

    test_model_file = found_models[0]
    print(f"Loading {test_model_file}...")

    model = load_model(test_model_file)
    print(f"✓ Model loaded successfully!")
    print(f"  Input shape: {model.input_shape}")
    print(f"  Output shape: {model.output_shape}")

    # Test prediction
    print("\nTesting model prediction...")
    test_input = np.random.rand(1, 224, 224, 3).astype('float32')
    prediction = model.predict(test_input, verbose=0)
    print(f"✓ Model prediction works! Output shape: {prediction.shape}")

except Exception as e:
    print(f"✗ Error loading model: {str(e)[:200]}")
    sys.exit(1)

print()
print("=" * 60)
print("✓ All tests passed! Backend is ready to run.")
print()
print("To start the backend server:")
print("  1. Activate virtual environment: venv\\Scripts\\activate")
print("  2. Run: cd backend && python app.py")
print("=" * 60)
