import json
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from .inference import get_object_model


def has_anomaly(report: dict[str, Any]) -> bool:
    faces = report.get("faces", {})
    hands = report.get("hands", {})
    objects = report.get("objects", {})
    face_count = faces.get("face_count")
    phone_count = objects.get("cell_phone_count", 0)
    face_anomaly = faces.get("status") == "ok" and face_count != 1
    phone_anomaly = objects.get("status") == "ok" and phone_count > 0
    extra_hand_anomaly = hands.get("status") == "ok" and hands.get("hand_count", 0) > 2
    return face_anomaly or phone_anomaly or extra_hand_anomaly


def annotate_image(image: np.ndarray, output_path: Path) -> None:
    model = get_object_model()
    annotated = model.predict(image, verbose=False)[0].plot() if model is not None else image
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if not cv2.imwrite(str(output_path), annotated):
        raise OSError(f"Could not write annotated image: {output_path}")


def load_reports(results_path: Path) -> list[dict[str, Any]]:
    if not results_path.exists():
        return []
    try:
        content = results_path.read_text(encoding="utf-8").strip()
        return json.loads(content) if content else []
    except (OSError, json.JSONDecodeError):
        return []


def save_anomalous_report(output_dir: Path, report: dict[str, Any], image: np.ndarray, stem: str) -> bool:
    output_dir.mkdir(parents=True, exist_ok=True)
    results_path = output_dir / "results.json"
    reports = load_reports(results_path)
    reports = [item for item in reports if item.get("image") != report.get("image")]

    annotated_path = output_dir / "annotated" / f"{stem}_detected.jpg"
    if has_anomaly(report):
        annotate_image(image, annotated_path)
        report["annotated_image"] = str(annotated_path)
        reports.append(report)
        kept = True
    else:
        annotated_path.unlink(missing_ok=True)
        kept = False

    results_path.write_text(json.dumps(reports, indent=2), encoding="utf-8")
    return kept