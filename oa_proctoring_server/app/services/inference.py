from functools import lru_cache
import numpy as np
from app.config import get_settings

settings = get_settings()

@lru_cache
def get_face_model():
    if not settings.enable_face_match:
        return None
    try:
        from insightface.app import FaceAnalysis
        import onnxruntime as ort
        available = set(ort.get_available_providers())
        providers = [provider for provider in settings.onnx_provider_list if provider in available]
        model = FaceAnalysis(name="buffalo_l", providers=providers or ["CPUExecutionProvider"])
        model.prepare(ctx_id=-1, det_size=(640, 640))
        return model
    except Exception as exc:
        print("[WARN] InsightFace unavailable:", exc)
        return None

@lru_cache
def get_object_model():
    if not settings.enable_device_detection:
        return None
    try:
        from ultralytics import YOLO
        return YOLO("yolov8n.pt")
    except Exception as exc:
        print("[WARN] YOLO unavailable:", exc)
        return None

@lru_cache
def get_face_mesh():
    if not (settings.enable_liveness or settings.enable_head_position):
        return None
    try:
        import mediapipe as mp
        return mp.solutions.face_mesh.FaceMesh(
            static_image_mode=True, max_num_faces=5, refine_landmarks=True,
            min_detection_confidence=0.5
        )
    except Exception as exc:
        print("[WARN] MediaPipe FaceMesh unavailable:", exc)
        return None

@lru_cache
def get_pose_model():
    if not (settings.enable_posture or settings.enable_typing_writing):
        return None
    try:
        import mediapipe as mp
        return mp.solutions.pose.Pose(
            static_image_mode=True, model_complexity=2,
            min_detection_confidence=0.5
        )
    except Exception as exc:
        print("[WARN] MediaPipe Pose unavailable:", exc)
        return None

@lru_cache
def get_hands_model():
    try:
        import mediapipe as mp
        return mp.solutions.hands.Hands(
            static_image_mode=True,
            max_num_hands=4,
            min_detection_confidence=0.5,
        )
    except Exception as exc:
        print("[WARN] MediaPipe Hands unavailable:", exc)
        return None

def cosine_similarity(a, b):
    a, b = np.asarray(a, dtype=np.float32), np.asarray(b, dtype=np.float32)
    d = np.linalg.norm(a) * np.linalg.norm(b)
    return float(np.dot(a, b) / d) if d else 0.0
