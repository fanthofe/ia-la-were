from __future__ import annotations

import base64
import json
from pathlib import Path
from typing import Any

import requests

from .base import BaseDetector, BoundingBox, DetectionResult
from ..utils.logger import get_logger

_log = get_logger(__name__)

_PROMPT = (
    "Examine this container interior image carefully. "
    "Is there any visible residue, slag, scorie, rust, or contamination on the surface? "
    'Respond ONLY with a JSON object: {"scorie": true/false, "confidence": 0.0-1.0, "reason": "..."}'
)


class ScorieDetector(BaseDetector):
    """
    Détecte la présence de scorie via YOLOv11.
    Si la confiance YOLO est inférieure à ollama_fallback_threshold,
    interroge Ollama (moondream2) pour vérification contextuelle.
    """

    def __init__(
        self,
        model_path: Path,
        confidence_threshold: float,
        model_version: str,
        ollama_url: str,
        ollama_model: str,
        ollama_fallback_threshold: float,
    ) -> None:
        super().__init__(model_path, confidence_threshold, model_version)
        self.ollama_url = ollama_url.rstrip("/")
        self.ollama_model = ollama_model
        self.ollama_fallback_threshold = ollama_fallback_threshold
        self._model: Any = None

    @property
    def model(self) -> Any:
        if self._model is None:
            from ultralytics import YOLO  # noqa: PLC0415
            self._model = YOLO(str(self.model_path))
        return self._model

    def detect(self, image_path: Path) -> DetectionResult:
        yolo_result = self._yolo_detect(image_path)

        # Confiance suffisante → résultat YOLO direct
        if yolo_result.confidence >= self.ollama_fallback_threshold:
            return yolo_result

        # Zone grise → vérification contextuelle par Ollama
        _log.info(
            "Confiance YOLO faible (%.2f < %.2f) sur %s — recours à Ollama",
            yolo_result.confidence, self.ollama_fallback_threshold, image_path.name,
        )
        try:
            return self._ollama_detect(image_path)
        except Exception as exc:
            _log.warning("Ollama indisponible (%s) — résultat YOLO conservé", exc)
            return yolo_result

    # ── Private ────────────────────────────────────────────────────

    def _yolo_detect(self, image_path: Path) -> DetectionResult:
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

    def _ollama_detect(self, image_path: Path) -> DetectionResult:
        image_b64 = base64.b64encode(image_path.read_bytes()).decode()

        resp = requests.post(
            f"{self.ollama_url}/api/generate",
            json={
                "model":  self.ollama_model,
                "prompt": _PROMPT,
                "images": [image_b64],
                "stream": False,
                "format": "json",
            },
            timeout=30,
        )
        resp.raise_for_status()

        raw = resp.json()["response"]
        try:
            parsed   = json.loads(raw)
            scorie   = bool(parsed.get("scorie", False))
            conf_val = float(parsed.get("confidence", 0.5))
        except (json.JSONDecodeError, TypeError, KeyError):
            # Ollama returned free text instead of JSON — parse heuristically
            raw_lower = raw.lower()
            scorie    = any(kw in raw_lower for kw in ("yes", "scorie", "contamination", "rust", "résidu"))
            conf_val  = 0.65 if scorie else 0.40

        return DetectionResult(
            result=scorie,
            confidence=conf_val,
            model_version=f"{self.model_version}+ollama/{self.ollama_model}",
            boxes=[],
        )
