from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from ..config import Settings
from ..detectors.base import BoundingBox, DetectionResult
from ..detectors.label_detector import LabelDetector
from ..detectors.scorie_detector import ScorieDetector
from ..utils.image_validator import ImageValidationError, validate_image
from ..utils.logger import get_logger

_log = get_logger(__name__)

# Couleurs BGR pour OpenCV
_COLOUR_LABEL:  tuple[int, int, int] = (200, 255, 107)  # teal
_COLOUR_SCORIE: tuple[int, int, int] = (0,   100, 255)  # orange-rouge
_FONT = cv2.FONT_HERSHEY_SIMPLEX


class BatchProcessor:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.label_detector = LabelDetector(
            model_path=settings.label.model,
            confidence_threshold=settings.label.confidence_threshold,
            model_version=settings.label.model_version,
        )
        self.scorie_detector = ScorieDetector(
            model_path=settings.scorie.model,
            confidence_threshold=settings.scorie.confidence_threshold,
            model_version=settings.scorie.model_version,
            ollama_url=settings.scorie.ollama.url,
            ollama_model=settings.scorie.ollama.model,
            ollama_fallback_threshold=settings.scorie.ollama.fallback_threshold,
        )

    def process_lot(self, lot_id: str) -> dict[str, Any]:
        input_dir  = self.settings.input_dir  / lot_id
        output_dir = self.settings.output_dir / lot_id

        if not input_dir.exists():
            raise FileNotFoundError(f"Dossier lot introuvable : {input_dir}")

        output_dir.mkdir(parents=True, exist_ok=True)

        images = sorted(
            p for p in input_dir.iterdir()
            if p.suffix.lower() in self.settings.valid_extensions
        )
        if not images:
            raise ValueError(f"Aucune image valide trouvée dans {input_dir}")

        _log.info("Début analyse — lot %s (%d image(s))", lot_id, len(images))
        photo_results = [self._process_image(img, output_dir) for img in images]

        lot_status = _lot_status(photo_results)
        rapport: dict[str, Any] = {
            "lot_id":      lot_id,
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "photos":      photo_results,
            "lot_status":  lot_status,
        }

        rapport_path = output_dir / "rapport.json"
        rapport_path.write_text(json.dumps(rapport, indent=2, ensure_ascii=False))
        _log.info("Rapport écrit → %s  [%s]", rapport_path, lot_status)

        return rapport

    def _process_image(self, image_path: Path, output_dir: Path) -> dict[str, Any]:
        try:
            validate_image(
                image_path,
                self.settings.valid_extensions,
                self.settings.max_file_size_bytes,
            )
        except ImageValidationError as exc:
            _log.warning("Image ignorée — %s : %s", image_path.name, exc)
            return {"filename": image_path.name, "error": str(exc), "status": "NON-CONFORME"}

        t0 = datetime.now()
        label_r  = self.label_detector.detect(image_path)
        scorie_r = self.scorie_detector.detect(image_path)
        elapsed_ms = (datetime.now() - t0).total_seconds() * 1000

        _log.info(
            "  %s — label:%s(%.2f) scorie:%s(%.2f) — %.0fms",
            image_path.name,
            "✓" if label_r.result else "✗", label_r.confidence,
            "✓" if scorie_r.result else "✗", scorie_r.confidence,
            elapsed_ms,
        )

        annotated_name = image_path.stem + "_annote" + image_path.suffix
        _annotate(image_path, output_dir / annotated_name, label_r, scorie_r)

        return {
            "filename":     image_path.name,
            "annotated":    annotated_name,
            "inference_ms": round(elapsed_ms),
            "checks": {
                "label_present": {
                    "result":        label_r.result,
                    "confidence":    round(label_r.confidence, 4),
                    "model_version": label_r.model_version,
                },
                "scorie_detected": {
                    "result":        scorie_r.result,
                    "confidence":    round(scorie_r.confidence, 4),
                    "model_version": scorie_r.model_version,
                },
            },
            "status": _photo_status(label_r.result, scorie_r.result),
        }


# ── Module-level helpers ────────────────────────────────────────────

def _photo_status(label_ok: bool, scorie_found: bool) -> str:
    if not label_ok:
        return "NON-CONFORME"
    if scorie_found:
        return "VÉRIFICATION MANUELLE REQUISE"
    return "CONFORME"


def _lot_status(photos: list[dict[str, Any]]) -> str:
    statuses = {p["status"] for p in photos}
    if "NON-CONFORME" in statuses:
        return "NON-CONFORME"
    if "VÉRIFICATION MANUELLE REQUISE" in statuses:
        return "VÉRIFICATION MANUELLE REQUISE"
    return "CONFORME"


def _annotate(
    src: Path,
    dst: Path,
    label_r: DetectionResult,
    scorie_r: DetectionResult,
) -> None:
    img = cv2.imread(str(src))
    if img is None:
        return
    for box in label_r.boxes:
        _draw_box(img, box, _COLOUR_LABEL, f"LABEL {box.confidence:.0%}")
    for box in scorie_r.boxes:
        _draw_box(img, box, _COLOUR_SCORIE, f"SCORIE {box.confidence:.0%}")
    cv2.imwrite(str(dst), img)


def _draw_box(
    img: np.ndarray,  # type: ignore[type-arg]
    box: BoundingBox,
    colour: tuple[int, int, int],
    label: str,
) -> None:
    cv2.rectangle(img, (box.x1, box.y1), (box.x2, box.y2), colour, 2)
    (tw, th), _ = cv2.getTextSize(label, _FONT, 0.5, 1)
    # Filled background rectangle for readability
    cv2.rectangle(img, (box.x1, box.y1 - th - 6), (box.x1 + tw + 4, box.y1), colour, -1)
    cv2.putText(img, label, (box.x1 + 2, box.y1 - 4), _FONT, 0.5, (0, 0, 0), 1)
