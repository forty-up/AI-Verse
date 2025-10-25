"""
Download models from Hugging Face on server startup
This runs automatically when backend starts if models are missing
"""

import os
import requests
from pathlib import Path
from tqdm import tqdm

# Configuration - UPDATE THESE with your Hugging Face username
HF_USERNAME = os.getenv("HF_USERNAME", "YOUR_USERNAME")  # Change this!
HF_REPO = "emotion-detection-models"

MODEL_FILES = {
    "Custom_CNN_model.keras": f"https://huggingface.co/{HF_USERNAME}/{HF_REPO}/resolve/main/Custom_CNN_model.keras",
    "Final_Resnet50_Best_model.keras": f"https://huggingface.co/{HF_USERNAME}/{HF_REPO}/resolve/main/Final_Resnet50_Best_model.keras",
    "ResNet50_Final_Model_Complete.keras": f"https://huggingface.co/{HF_USERNAME}/{HF_REPO}/resolve/main/ResNet50_Final_Model_Complete.keras",
}

def download_file(url, filepath):
    """Download file with progress bar"""
    print(f"📥 Downloading {filepath.name}...")

    response = requests.get(url, stream=True)
    response.raise_for_status()

    total_size = int(response.headers.get('content-length', 0))

    with open(filepath, 'wb') as file, tqdm(
        desc=filepath.name,
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as progress_bar:
        for data in response.iter_content(chunk_size=1024):
            size = file.write(data)
            progress_bar.update(size)

    print(f"✅ Downloaded {filepath.name}")

def download_models(base_dir="."):
    """Download all required models if they don't exist"""
    base_path = Path(base_dir)

    for filename, url in MODEL_FILES.items():
        filepath = base_path / filename

        if filepath.exists():
            print(f"✓ {filename} already exists, skipping...")
            continue

        try:
            download_file(url, filepath)
        except Exception as e:
            print(f"❌ Error downloading {filename}: {e}")
            print(f"Please download manually from: {url}")
            return False

    print("\n🎉 All models downloaded successfully!")
    return True

if __name__ == "__main__":
    # Check if running from backend directory
    if os.path.exists("app.py"):
        # We're in backend directory, download to parent
        download_models("..")
    else:
        # We're in project root
        download_models(".")
