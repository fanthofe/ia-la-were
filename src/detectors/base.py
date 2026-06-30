from __future__ import annotations

import hashlib
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class BoundingBox:
    x1: int
    y1: int
    x2: int
    y2: int
    confidence: float


@dataclass
class DetectionResult:
    result: bool
    confidence: float
    model_version: str
    boxes: list[BoundingBox] = field(default_factory=list)


class ModelNotFoundError(FileNotFoundError):
    pass


class BaseDetector(ABC):
    def __init__(
        self,
        model_path: Path,
        confidence_threshold: float,
        model_version: str,
    ) -> None:
        if not model_path.exists():
            raise ModelNotFoundError(
                f"Modèle introuvable : {model_path}\n"
                "Entraînez le modèle et placez le fichier .pt dans models/"
            )
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.model_version = model_version

    @abstractmethod
    def detect(self, image_path: Path) -> DetectionResult: ...

    def verify_hash(self, expected_sha256: str) -> None:
        """Vérifie l'intégrité du modèle par hash SHA-256."""
        digest = hashlib.sha256(self.model_path.read_bytes()).hexdigest()
        if digest != expected_sha256:
            raise ValueError(
                f"Hash SHA-256 invalide pour {self.model_path.name}\n"
                f"  Attendu : {expected_sha256}\n"
                f"  Obtenu  : {digest}"
            )
