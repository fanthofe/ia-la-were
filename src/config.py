from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml


@dataclass(frozen=True)
class OllamaConfig:
    url: str
    model: str
    fallback_threshold: float


@dataclass(frozen=True)
class LabelConfig:
    model: Path
    model_version: str
    confidence_threshold: float


@dataclass(frozen=True)
class ScorieConfig:
    model: Path
    model_version: str
    confidence_threshold: float
    ollama: OllamaConfig


@dataclass(frozen=True)
class Settings:
    input_dir: Path
    output_dir: Path
    models_dir: Path
    label: LabelConfig
    scorie: ScorieConfig
    valid_extensions: frozenset[str]
    max_file_size_bytes: int
    verify_model_hash: bool
    model_hashes: dict[str, str | None]


def load_settings(path: Path = Path("config/settings.yaml")) -> Settings:
    with open(path) as f:
        raw = yaml.safe_load(f)

    p   = raw["paths"]
    det = raw["detectors"]
    proc = raw["processing"]
    sec  = raw["security"]

    return Settings(
        input_dir=Path(p["input"]),
        output_dir=Path(p["output"]),
        models_dir=Path(p["models"]),
        label=LabelConfig(
            model=Path(det["label"]["model"]),
            model_version=det["label"]["model_version"],
            confidence_threshold=float(det["label"]["confidence_threshold"]),
        ),
        scorie=ScorieConfig(
            model=Path(det["scorie"]["model"]),
            model_version=det["scorie"]["model_version"],
            confidence_threshold=float(det["scorie"]["confidence_threshold"]),
            ollama=OllamaConfig(
                url=det["scorie"]["ollama"]["url"],
                model=det["scorie"]["ollama"]["model"],
                fallback_threshold=float(det["scorie"]["ollama"]["fallback_threshold"]),
            ),
        ),
        valid_extensions=frozenset(proc["valid_extensions"]),
        max_file_size_bytes=int(proc["max_file_size_mb"]) * 1024 * 1024,
        verify_model_hash=bool(sec["verify_model_hash"]),
        model_hashes=dict(sec.get("model_hashes", {})),
    )
