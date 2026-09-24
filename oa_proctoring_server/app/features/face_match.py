import numpy as np
from app.config import get_settings
from app.services.inference import get_face_model, cosine_similarity

settings = get_settings()

def extract_embedding(image):
    model = get_face_model()
    if model is None:
        return None, {"status": "not_loaded"}
    faces = model.get(image)
    if len(faces) != 1:
        return None, {"status": "invalid_face_count", "face_count": len(faces)}
    return faces[0].embedding, {"status": "ok"}

def verify(image, reference_embedding):
    embedding, info = extract_embedding(image)
    if embedding is None or reference_embedding is None:
        return {**info, "matched": False, "similarity": None}
    similarity = cosine_similarity(embedding, reference_embedding)
    return {
        "status": "ok",
        "matched": similarity >= settings.face_match_threshold,
        "similarity": similarity,
        "threshold": settings.face_match_threshold,
    }
