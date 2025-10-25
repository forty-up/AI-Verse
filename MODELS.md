# Model Files

## Download Required Models

The emotion detection models are too large for GitHub (>100MB). Download them from one of these sources:

### Option 1: Google Drive
[Download Models from Google Drive](#) *(Add your link here)*

### Option 2: Hugging Face
[Download Models from Hugging Face](#) *(Add your link here)*

### Option 3: Direct Download
[Add your download link here]

## Required Model Files

Place these files in the project root directory:

1. **Custom_CNN_model.keras** (196 MB)
   - Custom CNN model for emotion detection

2. **Final_Resnet50_Best_model.keras** (289 MB)
   - ResNet50-based model for emotion detection

3. **ResNet50_Final_Model_Complete.keras** (289 MB)
   - Complete ResNet50 model

## Setup After Download

1. Download the model files from the link above
2. Place them in the project root directory:
   ```
   emotion_detection/
   ├── Custom_CNN_model.keras
   ├── Final_Resnet50_Best_model.keras
   ├── ResNet50_Final_Model_Complete.keras
   └── ... other files
   ```
3. Run the application as described in README.md

## Model Architecture

- **Base Architecture**: ResNet50 and Custom CNN
- **Input Size**: 48x48 grayscale images
- **Output Classes**: 7 emotions (Happy, Sad, Angry, Neutral, Fear, Surprise, Disgust)
- **Training Dataset**: FER2013 and custom datasets

---

**Note**: These models are excluded from the GitHub repository due to file size limitations.
