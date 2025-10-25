"""
Facial Analysis Service using MediaPipe
Provides detailed facial metrics: eye contact, head pose, confidence score, engagement
"""

import cv2
import numpy as np
import mediapipe as mp
from typing import Dict, Tuple, Optional

class FacialAnalysisService:
    """Advanced facial analysis using MediaPipe Face Mesh"""

    def __init__(self):
        """Initialize MediaPipe Face Mesh"""
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,  # Includes iris landmarks
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        # Key landmark indices
        self.LEFT_EYE = [33, 160, 158, 133, 153, 144]
        self.RIGHT_EYE = [362, 385, 387, 263, 373, 380]
        self.LEFT_IRIS = [468, 469, 470, 471, 472]
        self.RIGHT_IRIS = [473, 474, 475, 476, 477]
        self.NOSE_TIP = 1
        self.CHIN = 152
        self.LEFT_EYE_CORNER = 33
        self.RIGHT_EYE_CORNER = 263

        print("[INFO] MediaPipe Face Mesh initialized successfully!")

    def analyze_frame(self, frame: np.ndarray) -> Dict:
        """
        Analyze a single frame for detailed facial metrics

        Args:
            frame: BGR image from OpenCV

        Returns:
            Dictionary with facial analysis metrics
        """
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w = frame.shape[:2]

        # Process with MediaPipe
        results = self.face_mesh.process(rgb_frame)

        if not results.multi_face_landmarks:
            return {
                'face_detected': False,
                'eye_contact': 0.0,
                'head_pose': {'pitch': 0, 'yaw': 0, 'roll': 0},
                'confidence_score': 0.0,
                'engagement_score': 0.0,
                'metrics': {}
            }

        landmarks = results.multi_face_landmarks[0]

        # Calculate all metrics
        eye_contact = self._calculate_eye_contact(landmarks, w, h)
        head_pose = self._calculate_head_pose(landmarks, w, h)
        eye_openness = self._calculate_eye_openness(landmarks, w, h)
        mouth_activity = self._calculate_mouth_activity(landmarks, w, h)
        face_stability = self._calculate_face_stability(landmarks, w, h)

        # Calculate overall scores
        confidence_score = self._calculate_confidence_score(
            eye_contact, head_pose, eye_openness, face_stability
        )

        engagement_score = self._calculate_engagement_score(
            eye_contact, eye_openness, mouth_activity, face_stability
        )

        return {
            'face_detected': True,
            'eye_contact': eye_contact,
            'head_pose': head_pose,
            'confidence_score': confidence_score,
            'engagement_score': engagement_score,
            'metrics': {
                'eye_openness': eye_openness,
                'mouth_activity': mouth_activity,
                'face_stability': face_stability
            }
        }

    def _calculate_eye_contact(self, landmarks, w: int, h: int) -> float:
        """
        Calculate eye contact percentage based on iris position
        Returns: 0.0 (no eye contact) to 1.0 (perfect eye contact)
        """
        try:
            # Get iris centers (more accurate than using first landmark)
            left_iris_landmarks = [self._get_landmark_coords(landmarks, idx, w, h) for idx in self.LEFT_IRIS]
            right_iris_landmarks = [self._get_landmark_coords(landmarks, idx, w, h) for idx in self.RIGHT_IRIS]

            left_iris_x = sum(p[0] for p in left_iris_landmarks) / len(left_iris_landmarks)
            right_iris_x = sum(p[0] for p in right_iris_landmarks) / len(right_iris_landmarks)

            # Get eye boundaries
            left_eye_left = self._get_landmark_coords(landmarks, 33, w, h)
            left_eye_right = self._get_landmark_coords(landmarks, 133, w, h)
            right_eye_left = self._get_landmark_coords(landmarks, 362, w, h)
            right_eye_right = self._get_landmark_coords(landmarks, 263, w, h)

            # Calculate iris position relative to eye corners (0 = left, 1 = right)
            left_eye_width = abs(left_eye_right[0] - left_eye_left[0])
            right_eye_width = abs(right_eye_right[0] - right_eye_left[0])

            if left_eye_width > 0 and right_eye_width > 0:
                left_iris_ratio = (left_iris_x - left_eye_left[0]) / left_eye_width
                right_iris_ratio = (right_iris_x - right_eye_left[0]) / right_eye_width

                # Clamp to valid range
                left_iris_ratio = max(0.0, min(1.0, left_iris_ratio))
                right_iris_ratio = max(0.0, min(1.0, right_iris_ratio))

                # Good eye contact is when iris is centered (0.45-0.55 range)
                # Calculate how close to center
                left_center_distance = abs(left_iris_ratio - 0.5)
                right_center_distance = abs(right_iris_ratio - 0.5)
                avg_center_distance = (left_center_distance + right_center_distance) / 2

                # Convert to score with more forgiving threshold
                # 0.0-0.10 distance = 100% contact
                # 0.10-0.25 distance = 80-100% contact
                # >0.25 distance = <80% contact
                if avg_center_distance <= 0.10:
                    eye_contact_score = 1.0
                elif avg_center_distance <= 0.25:
                    eye_contact_score = 1.0 - ((avg_center_distance - 0.10) / 0.15) * 0.3
                else:
                    eye_contact_score = max(0.3, 0.7 - (avg_center_distance - 0.25) * 2)

                return round(eye_contact_score, 3)
            else:
                return 0.5

        except Exception as e:
            print(f"[WARNING] Eye contact calculation error: {e}")
            return 0.5

    def _calculate_head_pose(self, landmarks, w: int, h: int) -> Dict[str, float]:
        """
        Calculate head pose angles (pitch, yaw, roll)
        Pitch: up/down, Yaw: left/right, Roll: tilt
        """
        try:
            # Key points for head pose
            nose = self._get_landmark_coords(landmarks, 1, w, h)
            chin = self._get_landmark_coords(landmarks, 152, w, h)
            left_eye = self._get_landmark_coords(landmarks, 33, w, h)
            right_eye = self._get_landmark_coords(landmarks, 263, w, h)
            left_mouth = self._get_landmark_coords(landmarks, 61, w, h)
            right_mouth = self._get_landmark_coords(landmarks, 291, w, h)

            # Calculate angles
            # Yaw (left-right rotation)
            eye_center = ((left_eye[0] + right_eye[0]) / 2, (left_eye[1] + right_eye[1]) / 2)
            yaw = (nose[0] - eye_center[0]) / w * 100  # Normalized

            # Pitch (up-down rotation)
            face_height = abs(chin[1] - nose[1])
            pitch = ((nose[1] - eye_center[1]) / face_height * 100) if face_height > 0 else 0

            # Roll (tilt)
            eye_angle = np.arctan2(right_eye[1] - left_eye[1], right_eye[0] - left_eye[0])
            roll = np.degrees(eye_angle)

            return {
                'pitch': round(pitch, 2),  # Positive = looking up
                'yaw': round(yaw, 2),       # Positive = looking right
                'roll': round(roll, 2)      # Positive = tilted right
            }

        except Exception as e:
            print(f"[WARNING] Head pose calculation error: {e}")
            return {'pitch': 0, 'yaw': 0, 'roll': 0}

    def _calculate_eye_openness(self, landmarks, w: int, h: int) -> float:
        """
        Calculate how open the eyes are (0.0 = closed, 1.0 = wide open)
        """
        try:
            # Left eye vertical distance
            left_top = self._get_landmark_coords(landmarks, 159, w, h)
            left_bottom = self._get_landmark_coords(landmarks, 145, w, h)
            left_height = abs(left_top[1] - left_bottom[1])

            # Right eye vertical distance
            right_top = self._get_landmark_coords(landmarks, 386, w, h)
            right_bottom = self._get_landmark_coords(landmarks, 374, w, h)
            right_height = abs(right_top[1] - right_bottom[1])

            # Eye horizontal distance (for normalization)
            left_left = self._get_landmark_coords(landmarks, 33, w, h)
            left_right = self._get_landmark_coords(landmarks, 133, w, h)
            left_width = abs(left_right[0] - left_left[0])

            # Calculate eye aspect ratio
            left_ear = left_height / left_width if left_width > 0 else 0
            right_ear = right_height / left_width if left_width > 0 else 0

            avg_ear = (left_ear + right_ear) / 2

            # Normalize to 0-1 (typical EAR range: 0.15-0.35)
            openness = min(1.0, max(0.0, (avg_ear - 0.1) / 0.25))

            return round(openness, 3)

        except Exception as e:
            print(f"[WARNING] Eye openness calculation error: {e}")
            return 0.7

    def _calculate_mouth_activity(self, landmarks, w: int, h: int) -> float:
        """
        Calculate mouth activity/animation (useful for detecting speaking)
        """
        try:
            # Mouth vertical opening
            upper_lip = self._get_landmark_coords(landmarks, 13, w, h)
            lower_lip = self._get_landmark_coords(landmarks, 14, w, h)
            mouth_height = abs(upper_lip[1] - lower_lip[1])

            # Mouth width
            left_mouth = self._get_landmark_coords(landmarks, 61, w, h)
            right_mouth = self._get_landmark_coords(landmarks, 291, w, h)
            mouth_width = abs(right_mouth[0] - left_mouth[0])

            # Calculate mouth aspect ratio
            mar = mouth_height / mouth_width if mouth_width > 0 else 0

            # Normalize (typical MAR: 0.0-0.8)
            activity = min(1.0, mar / 0.8)

            return round(activity, 3)

        except Exception as e:
            print(f"[WARNING] Mouth activity calculation error: {e}")
            return 0.3

    def _calculate_face_stability(self, landmarks, w: int, h: int) -> float:
        """
        Calculate how stable the face is (less movement = more stable)
        This would ideally track movement over time, but for now we check pose extremes
        """
        try:
            nose = self._get_landmark_coords(landmarks, 1, w, h)

            # Check if face is centered
            center_x = w / 2
            center_y = h / 2

            x_deviation = abs(nose[0] - center_x) / w
            y_deviation = abs(nose[1] - center_y) / h

            # Stability decreases with deviation from center
            stability = 1.0 - min(1.0, (x_deviation + y_deviation) / 2)

            return round(stability, 3)

        except Exception as e:
            print(f"[WARNING] Face stability calculation error: {e}")
            return 0.8

    def _calculate_confidence_score(self, eye_contact: float, head_pose: Dict,
                                   eye_openness: float, face_stability: float) -> float:
        """
        Calculate overall confidence score based on multiple factors
        More forgiving and realistic thresholds
        """
        # Weights for different factors
        weights = {
            'eye_contact': 0.35,      # Important for confidence
            'head_pose': 0.30,        # Good posture matters
            'eye_openness': 0.20,     # Alert and engaged
            'face_stability': 0.15    # Calm and composed
        }

        # Head pose score (more forgiving thresholds)
        head_pose_score = 1.0

        # Yaw (left-right): -20 to +20 is good, beyond that penalize
        yaw_penalty = 0
        if abs(head_pose['yaw']) > 20:
            yaw_penalty = min(0.4, (abs(head_pose['yaw']) - 20) / 80)  # Max 40% penalty

        # Pitch (up-down): -15 to +15 is good
        pitch_penalty = 0
        if abs(head_pose['pitch']) > 15:
            pitch_penalty = min(0.3, (abs(head_pose['pitch']) - 15) / 50)  # Max 30% penalty

        # Roll (tilt): -10 to +10 is good
        roll_penalty = 0
        if abs(head_pose['roll']) > 10:
            roll_penalty = min(0.2, (abs(head_pose['roll']) - 10) / 40)  # Max 20% penalty

        head_pose_score = max(0.2, 1.0 - yaw_penalty - pitch_penalty - roll_penalty)

        # Normalize eye openness (typical range 0.5-0.9, make it more forgiving)
        eye_openness_normalized = min(1.0, max(0.5, eye_openness * 1.2))

        # Calculate weighted score
        confidence = (
            eye_contact * weights['eye_contact'] +
            head_pose_score * weights['head_pose'] +
            eye_openness_normalized * weights['eye_openness'] +
            face_stability * weights['face_stability']
        )

        # Boost overall score slightly to be more realistic
        confidence = min(1.0, confidence * 1.1)

        return round(confidence, 3)

    def _calculate_engagement_score(self, eye_contact: float, eye_openness: float,
                                   mouth_activity: float, face_stability: float) -> float:
        """
        Calculate engagement score - measures animation and enthusiasm
        More realistic and forgiving thresholds
        """
        weights = {
            'eye_contact': 0.30,
            'eye_openness': 0.30,
            'mouth_activity': 0.25,  # Speaking shows engagement
            'expressiveness': 0.15    # Overall animation
        }

        # Normalize eye openness (make it more forgiving)
        eye_openness_normalized = min(1.0, max(0.6, eye_openness * 1.3))

        # Mouth activity normalization
        # Low activity (0-0.2) = listening/thinking = 70% engagement
        # Medium activity (0.2-0.5) = speaking moderately = 85% engagement
        # High activity (0.5+) = speaking animatedly = 100% engagement
        if mouth_activity < 0.2:
            mouth_score = 0.7
        elif mouth_activity < 0.5:
            mouth_score = 0.7 + (mouth_activity - 0.2) / 0.3 * 0.15
        else:
            mouth_score = min(1.0, 0.85 + (mouth_activity - 0.5) * 0.3)

        # Expressiveness combines eye and mouth animation
        expressiveness = (eye_openness_normalized + mouth_score) / 2

        engagement = (
            eye_contact * weights['eye_contact'] +
            eye_openness_normalized * weights['eye_openness'] +
            mouth_score * weights['mouth_activity'] +
            expressiveness * weights['expressiveness']
        )

        # Boost slightly to be more realistic (people are usually engaged in interviews)
        engagement = min(1.0, engagement * 1.15)

        return round(engagement, 3)

    def _get_landmark_coords(self, landmarks, index: int, w: int, h: int) -> Tuple[float, float]:
        """Get x, y coordinates of a landmark"""
        landmark = landmarks.landmark[index]
        return (landmark.x * w, landmark.y * h)

    def __del__(self):
        """Cleanup"""
        if hasattr(self, 'face_mesh'):
            self.face_mesh.close()
