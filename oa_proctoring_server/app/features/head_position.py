import numpy as np
from app.config import get_settings
from app.services.inference import get_face_mesh

settings = get_settings()

def analyze(image):
    mesh = get_face_mesh()
    if mesh is None:
        return {"status": "not_loaded", "yaw": None, "pitch": None}
    h, w = image.shape[:2]
    result = mesh.process(image[:, :, ::-1])
    faces = result.multi_face_landmarks or []
    if len(faces) != 1:
        return {"status": "invalid_face_count", "yaw": None, "pitch": None}

    lm = faces[0].landmark
    def p(i):
        return np.array([lm[i].x * w, lm[i].y * h], dtype=np.float32)

    left, right, nose = p(33), p(263), p(1)
    mid = (left + right) / 2
    width = np.linalg.norm(right - left) + 1e-6
    yaw = float((nose[0] - mid[0]) / width * 90)
    pitch = float((nose[1] - mid[1]) / width * 45)

    return {
        "status": "ok",
        "yaw": yaw,
        "pitch": pitch,
        "looking_away": abs(yaw) > settings.head_yaw_threshold or abs(pitch) > settings.head_pitch_threshold,
    }
