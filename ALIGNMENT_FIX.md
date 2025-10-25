# Bounding Box Alignment Fix

## Problem
The bounding box was appearing in the wrong location, not aligned with the face in the video.

## Root Cause
The backend sends bounding box coordinates based on the **captured image resolution (1280x720)**, but the video is displayed at a **different size** on screen. Without proper scaling, the coordinates were misaligned.

## Solution Implemented

### 1. Coordinate Scaling
```javascript
// Get displayed video size
const displayWidth = video.clientWidth
const displayHeight = video.clientHeight

// Calculate scale factors
const scaleX = displayWidth / 1280  // 1280 is capture width
const scaleY = displayHeight / 720   // 720 is capture height

// Scale all coordinates
const scaledX = bbox.x * scaleX
const scaledY = bbox.y * scaleY
const scaledWidth = bbox.width * scaleX
const scaledHeight = bbox.height * scaleY
```

### 2. Canvas Sizing
- Canvas now matches the **displayed video size**, not the internal video resolution
- This ensures 1:1 pixel mapping between canvas and video

### 3. Removed Object-Fit Distortion
- Removed `objectFit: 'cover'` from canvas styling
- Canvas now overlays video without distortion

## How to Verify It's Working

### Visual Check ✅
When detection is running, you should see:
- ✅ Colored square **perfectly aligned** with your face
- ✅ Emotion label (emoji + name + %) **above your face**
- ✅ Corner markers **at face corners**
- ✅ Box moves with your head movement

### Console Check (F12)
Look for these logs:
```javascript
Canvas scaling: {
  displayWidth: 640,    // Your actual video display size
  displayHeight: 360,
  scaleX: 0.5,         // 640/1280 = 0.5
  scaleY: 0.5          // 360/720 = 0.5
}

Drawing detection: {
  original: { x: 400, y: 200, width: 200, height: 250 },
  scaled: { x: 200, y: 100, width: 100, height: 125 }  // Properly scaled!
}
```

### Debug Info On-Screen
Below the video, you'll see:
```
Video: 640x360 | BBox: 400,200 200x250
```
- First numbers: Displayed video size
- Second numbers: Original bounding box coordinates from backend

## Testing Steps

1. **Start both servers**
   ```bash
   # Terminal 1
   cd backend && python app.py

   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Open http://localhost:3000**

3. **Go to Live Detection**

4. **Click "Start Detection"**

5. **Check alignment:**
   - Move your head left/right → Box should follow
   - Move closer/farther → Box should resize
   - Change expression → Label should update

## What Each Component Does

### Backend (app.py)
- Detects face using Haar Cascade
- Returns coordinates in **original image space (1280x720)**
- Format: `{x: 400, y: 200, width: 200, height: 250}`

### Frontend (EmotionDetector.jsx)
- Captures video frame at 1280x720
- Sends to backend
- Receives coordinates in 1280x720 space
- **Scales coordinates** to match displayed video size
- Draws on canvas overlay

### Canvas Overlay
- Positioned absolutely over video
- Same size as displayed video
- Receives scaled coordinates
- Draws bounding box, label, and corners

## Troubleshooting

### Box still misaligned?

1. **Check browser console (F12)**
   - Look for "Canvas scaling" log
   - Verify scaleX and scaleY are reasonable (between 0.3 and 1.5)

2. **Check debug info below video**
   - Verify video size is shown correctly
   - BBox coordinates should be in range 0-1280 for x, 0-720 for y

3. **Hard refresh browser**
   - Press Ctrl+Shift+R
   - Clears cache and reloads

4. **Check video constraints**
   - Webcam component requests 1280x720
   - Some webcams may send different resolution
   - This is handled by the scaling logic

### Box too small/large?

This is normal! The box size depends on:
- How close you are to the camera
- Your face size
- Camera zoom level

The scaling ensures it's positioned correctly regardless of size.

## Technical Details

### Coordinate System
```
Backend captures at:     1280x720 (capture resolution)
Backend returns:         {x: 400, y: 200, w: 200, h: 250}
Video displays at:       640x360 (example display size)
Scale factors:           scaleX=0.5, scaleY=0.5
Final canvas coords:     {x: 200, y: 100, w: 100, h: 125}
```

### Why This Works
- Backend always captures at consistent resolution (1280x720)
- Frontend video can be any size (responsive design)
- Scaling math converts between the two coordinate spaces
- Canvas matches video size exactly, ensuring perfect overlay

---

**The bounding box should now align perfectly with your face!** 🎯
