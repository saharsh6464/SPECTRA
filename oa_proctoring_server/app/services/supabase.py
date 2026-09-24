from functools import lru_cache
import os
import threading
from typing import Optional
from urllib.parse import unquote, urlparse

import cv2
import numpy as np
from dotenv import dotenv_values
from supabase import Client, create_client

from ..config import get_settings
from .detection_results import has_anomaly
from ..features import device_detection, face_count, hand_count

settings = get_settings()
dotenv = dotenv_values(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
processing_lock = threading.Lock()


def is_configured() -> bool:
    return bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY") or dotenv.get("SUPABASE_SERVICE_ROLE_KEY"))


def setting(name: str) -> str:
    return os.getenv(name) or dotenv.get(name, "")


@lru_cache
def get_client() -> Client:
    service_role_key = setting("SUPABASE_SERVICE_ROLE_KEY")
    if not service_role_key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is not configured")
    supabase_url = setting("SUPABASE_URL")
    if not supabase_url:
        raise RuntimeError("SUPABASE_URL is not configured")
    return create_client(supabase_url, service_role_key)


def get_test_result(result_id: str) -> dict:
    response = (
        get_client()
        .table("test_results")
        .select("id,user_id,test_id,image_url,created_at")
        .eq("id", result_id)
        .limit(1)
        .execute()
    )
    if not response.data:
        raise LookupError(f"Supabase test result not found: {result_id}")
    return response.data[0]


def list_test_results(test_id: Optional[str] = None, limit: int = 100) -> list[dict]:
    query = (
        get_client()
        .table("test_results")
        .select("id,user_id,test_id,image_url,created_at")
        .order("created_at")
        .limit(limit)
    )
    if test_id:
        query = query.eq("test_id", test_id)
    return query.execute().data or []


def process_pending_results(limit: int = 100) -> dict:
    with processing_lock:
        processed = []
        errors = []
        for row in list_test_results(limit=limit):
            try:
                processed.append(process_test_result(row))
            except Exception as exc:
                errors.append({"id": row["id"], "error": str(exc)})
        return {"processed": processed, "errors": errors}


def storage_location(image_url: str) -> tuple[str, str]:
    path = urlparse(image_url).path
    marker = "/storage/v1/object/"
    if marker not in path:
        raise ValueError("image_url is not a Supabase Storage URL")

    object_path = path.split(marker, 1)[1]
    parts = object_path.split("/", 2)
    if len(parts) != 3 or parts[0] not in {"public", "authenticated", "sign"}:
        raise ValueError("Could not determine Supabase Storage bucket and path")
    return unquote(parts[1]), unquote(parts[2])


def delete_test_result(result: dict) -> None:
    bucket, object_path = storage_location(result["image_url"])
    storage_response = get_client().storage.from_(bucket).remove([object_path])
    if not storage_response:
        raise RuntimeError(f"Could not delete Storage object: {bucket}/{object_path}")

    response = get_client().table("test_results").delete().eq("id", result["id"]).execute()
    if not response.data:
        raise RuntimeError(f"Could not delete Supabase test result: {result['id']}")


def annotated_bytes(image: np.ndarray) -> bytes:
    from .inference import get_object_model

    model = get_object_model()
    annotated = model.predict(image, verbose=False)[0].plot() if model is not None else image
    encoded, buffer = cv2.imencode(".jpg", annotated)
    if not encoded:
        raise RuntimeError("Could not encode annotated image")
    return buffer.tobytes()


def save_flagged_result(result: dict, frame: np.ndarray, analysis: dict) -> str:
    object_path = f"{result['id']}.jpg"
    storage = get_client().storage.from_("anomaly_detected")
    storage.upload(
        object_path,
        annotated_bytes(frame),
        {"content-type": "image/jpeg", "upsert": "true"},
    )
    image_url = storage.get_public_url(object_path)
    if not image_url:
        raise RuntimeError("Could not create anomaly image URL")

    response = get_client().table("flagged_results").insert({
        "user_id": result["user_id"],
        "test_id": result["test_id"],
        "image_url": image_url,
    }).execute()
    if not response.data:
        raise RuntimeError("Could not save flagged result")
    return image_url


def save_anomaly_factors(result: dict, analysis: dict) -> dict:
    faces = analysis.get("faces", {})
    objects = analysis.get("objects", {})
    face_count_value = faces.get("face_count")
    phone_count_value = objects.get("cell_phone_count", 0) or 0
    increments = {
        "multiple_faces_count": int(faces.get("status") == "ok" and face_count_value > 1),
        "no_face_count": int(faces.get("status") == "ok" and face_count_value == 0),
        "phone_cell_count": int(objects.get("status") == "ok" and phone_count_value > 0),
    }
    table = get_client().table("anomaly_factors")
    existing_response = (
        table.select("*")
        .eq("user_id", result["user_id"])
        .eq("test_id", result["test_id"])
        .limit(1)
        .execute()
    )
    if existing_response.data:
        existing = existing_response.data[0]
        factors = {
            key: int(existing.get(key, 0) or 0) + value
            for key, value in increments.items()
        }
        response = (
            table.update(factors)
            .eq("id", existing["id"])
            .execute()
        )
    else:
        factors = {
            "user_id": result["user_id"],
            "test_id": result["test_id"],
            **increments,
        }
        response = table.insert(factors).execute()
    if not response.data:
        raise RuntimeError("Could not save anomaly factors")
    return response.data[0]


def download_image(image_url: str) -> np.ndarray:
    import urllib.request

    request = urllib.request.Request(image_url, headers={"User-Agent": "oa-proctoring-server"})
    with urllib.request.urlopen(request, timeout=settings.supabase_request_timeout_seconds) as response:
        raw = response.read(settings.max_image_mb * 1024 * 1024 + 1)
    if len(raw) > settings.max_image_mb * 1024 * 1024:
        raise ValueError("Image too large")
    frame = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Supabase image URL did not contain a valid image")
    return frame


def process_test_result(result: dict) -> dict:
    frame = download_image(result["image_url"])
    analysis = {
        "image": {
            "width": int(frame.shape[1]),
            "height": int(frame.shape[0]),
        },
        "faces": face_count.analyze(frame),
        "hands": hand_count.analyze(frame),
        "objects": device_detection.analyze(frame),
    }
    anomaly_factors = save_anomaly_factors(result, analysis)
    flagged = has_anomaly(analysis)
    flagged_image_url = save_flagged_result(result, frame, analysis) if flagged else None
    delete_test_result(result)
    return {
        "id": result["id"],
        "user_id": result["user_id"],
        "test_id": result["test_id"],
        "analysis": analysis,
        "anomaly_factors": anomaly_factors,
        "anomaly_saved": flagged,
        "flagged_image_url": flagged_image_url,
        "supabase_deleted": True,
    }