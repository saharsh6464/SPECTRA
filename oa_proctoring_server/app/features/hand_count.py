from app.services.inference import get_hands_model


def analyze(image):
    model = get_hands_model()
    if model is None:
        return {"status": "not_loaded", "hand_count": None, "extra_hand_detected": False}

    result = model.process(image[:, :, ::-1])
    hand_count = len(result.multi_hand_landmarks or [])
    return {
        "status": "ok",
        "hand_count": hand_count,
        "extra_hand_detected": hand_count > 2,
    }