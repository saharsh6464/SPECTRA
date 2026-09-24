"""Run face and object detection against local image files."""

import argparse
import json
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import cv2
import numpy as np

from app.features import device_detection, face_count, hand_count
from app.services.detection_results import save_anomalous_report


def load_image(image_path: Path) -> np.ndarray:
    image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"Could not decode image: {image_path}")
    return image


def detect_image(image_path: Path) -> dict:
    image = load_image(image_path)
    result = {
        "image": str(image_path),
        "size": {"width": image.shape[1], "height": image.shape[0]},
        "faces": face_count.analyze(image),
        "hands": hand_count.analyze(image),
        "objects": device_detection.analyze(image),
    }

    return result


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Analyze every image in the project resource folder."
    )
    parser.add_argument(
        "--resource",
        type=Path,
        metavar="PATH",
        default=ROOT_DIR / "resource",
        help="Folder containing images (default: resource)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        metavar="PATH",
        default=ROOT_DIR / "data" / "detection_results",
        help="Folder for boxed images and JSON results (default: data/detection_results)",
    )
    args = parser.parse_args()

    image_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    image_paths = sorted(
        path
        for path in args.resource.rglob("*")
        if path.is_file() and path.suffix.lower() in image_extensions
    )
    if not image_paths:
        print(f"No images found in {args.resource.resolve()}")
        print("Add .jpg, .jpeg, .png, .bmp, or .webp files and run this script again.")
        return

    reports = []
    for image_path in image_paths:
        try:
            image = load_image(image_path)
            report = detect_image(image_path)
            if save_anomalous_report(args.output, report, image, image_path.stem):
                reports.append(report)
                print(json.dumps(report, indent=2))
            else:
                print(f"No anomaly found; removed output for {image_path}")
        except (OSError, ValueError) as exc:
            report = {"image": str(image_path), "error": str(exc)}
            reports.append(report)
            print(json.dumps(report, indent=2))

    args.output.mkdir(parents=True, exist_ok=True)
    results_path = args.output / "results.json"
    results_path.write_text(json.dumps(reports, indent=2), encoding="utf-8")
    print(f"Analyzed {len(image_paths)} image(s). Results saved to {results_path}")


if __name__ == "__main__":
    main()