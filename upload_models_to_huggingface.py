"""
Upload model files to Hugging Face
Run: python upload_models_to_huggingface.py
"""

from huggingface_hub import HfApi, create_repo
import os

# Configuration
HF_USERNAME = input("Enter your Hugging Face username: ")
HF_TOKEN = input("Enter your Hugging Face token (from Settings > Access Tokens): ")
REPO_NAME = "emotion-detection-models"

# Initialize API
api = HfApi(token=HF_TOKEN)

# Create repository
try:
    repo_url = create_repo(
        repo_id=f"{HF_USERNAME}/{REPO_NAME}",
        token=HF_TOKEN,
        repo_type="model",
        exist_ok=True
    )
    print(f"✅ Repository created/exists: {repo_url}")
except Exception as e:
    print(f"⚠️ Repository might already exist: {e}")

# Model files to upload
model_files = [
    "Custom_CNN_model.keras",
    "Final_Resnet50_Best_model.keras",
    "ResNet50_Final_Model_Complete.keras"
]

# Upload each model
for model_file in model_files:
    if os.path.exists(model_file):
        print(f"📤 Uploading {model_file}...")
        try:
            api.upload_file(
                path_or_fileobj=model_file,
                path_in_repo=model_file,
                repo_id=f"{HF_USERNAME}/{REPO_NAME}",
                token=HF_TOKEN,
            )
            print(f"✅ Uploaded {model_file}")
        except Exception as e:
            print(f"❌ Error uploading {model_file}: {e}")
    else:
        print(f"⚠️ File not found: {model_file}")

print("\n🎉 Done! Your models are now hosted on Hugging Face")
print(f"\n📝 Model URLs:")
for model_file in model_files:
    url = f"https://huggingface.co/{HF_USERNAME}/{REPO_NAME}/resolve/main/{model_file}"
    print(f"  - {model_file}: {url}")

print(f"\n🔗 Repository: https://huggingface.co/{HF_USERNAME}/{REPO_NAME}")
