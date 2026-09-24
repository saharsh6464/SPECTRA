from app.services.inference import get_face_mesh

def analyze(image):
    mesh = get_face_mesh()
    if mesh is None:
        return {"status": "not_loaded", "live": None}
    result = mesh.process(image[:, :, ::-1])
    count = len(result.multi_face_landmarks or [])
    if count != 1:
        return {"status": "invalid_face_count", "face_count": count, "live": False}
    return {
        "status": "landmarks_ok",
        "face_count": 1,
        "live": None,
        "note": "Challenge state must confirm blink/head-turn across multiple frames.",
    }

def challenge_result(blink_confirmed, head_turn_confirmed):
    return {
        "status": "ok",
        "live": bool(blink_confirmed and head_turn_confirmed),
        "blink_confirmed": bool(blink_confirmed),
        "head_turn_confirmed": bool(head_turn_confirmed),
    }
