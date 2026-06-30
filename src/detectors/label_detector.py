from __future__ import annotations

from pathlib import Path
from typing import Any

from .base import BaseDetector, BoundingBox, DetectionResult


class LabelDetector(BaseDetector):
    """Détecte la présence d'une étiquette sur un container via YOLOv11."""

    def __init__(
        self,
        model_path: Path,
        confidence_threshold: float,
        model_version: str,
    ) -> None:
        super().__init__(model_path, confidence_threshold, model_version)
        self._model: Any = None  # lazy — YOLO init prend ~1s

    @property
    def model(self) -> Any:
        if self._model is None:
            from ultralytics import YOLO  # noqa: PLC0415
            self._model = YOLO(str(self.model_path))
        return self._model

    def detect(self, image_path: Path) -> DetectionResult:
        raw_results = self.model(str(image_path), verbose=False)

        best_conf = 0.0
        boxes: list[BoundingBox] = []

        for r in raw_results:
            for box in r.boxes:
                conf = float(box.conf[0])
                x1, y1, x2, y2 = (int(v) for v in box.xyxy[0])
                boxes.append(BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2, confidence=conf))
                if conf > best_conf:
                    best_conf = conf

        return DetectionResult(
            result=best_conf >= self.confidence_threshold,
            confidence=best_conf,
            model_version=self.model_version,
            boxes=boxes,
        )
