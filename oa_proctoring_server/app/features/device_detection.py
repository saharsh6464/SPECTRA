from app.services.inference import get_object_model

def analyze(image):
    model = get_object_model()
    if model is None:
        return {"status": "not_loaded", "detections": []}
    result = model(image, verbose=False)[0]
    names = model.names if isinstance(model.names, dict) else dict(enumerate(model.names))
    detections = []
    for box in result.boxes:
        cls_id = int(box.cls[0])
        label = names.get(cls_id, str(cls_id))
        detections.append({
            "label": label,
            "confidence": float(box.conf[0]),
            "bbox": [float(x) for x in box.xyxy[0].tolist()],
        })
    return {
        "status": "ok",
        "detections": detections,
        "cell_phone_count": sum(x["label"] == "cell phone" for x in detections),
        "laptop_count": sum(x["label"] == "laptop" for x in detections),
    }
