import numpy as np
from app.services.inference import get_pose_model

def angle(a, b, c):
    ba, bc = a - b, c - b
    d = np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8
    return float(np.degrees(np.arccos(np.clip(np.dot(ba, bc) / d, -1, 1))))

def analyze(image):
    pose = get_pose_model()
    if pose is None:
        return {"status": "not_loaded", "posture": "unknown"}
    h, w = image.shape[:2]
    result = pose.process(image[:, :, ::-1])
    if not result.pose_landmarks:
        return {"status": "no_pose", "posture": "unclear"}
    lm = result.pose_landmarks.landmark
    def p(i):
        return np.array([lm[i].x * w, lm[i].y * h], dtype=np.float32)
    knee = (angle(p(23), p(25), p(27)) + angle(p(24), p(26), p(28))) / 2
    return {"status": "ok", "posture": "standing" if knee > 150 else "sitting", "knee_angle": knee}
