from .face_count import analyze as face_count

def analyze(image):
    r = face_count(image)
    return {
        **r,
        "occupant_count": r.get("face_count"),
        "single_occupant": r.get("face_count") == 1,
    }
