from app.services.inference import get_face_model

def analyze(image):
    model = get_face_model()
    if model is None:
        return {"status": "not_loaded", "face_count": None}
    faces = model.get(image)
    return {"status": "ok", "face_count": len(faces), "single_face": len(faces) == 1}
