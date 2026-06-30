from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from src.detectors.base import DetectionResult
from src.pipeline.batch_processor import BatchProcessor, _lot_status, _photo_status


# ── Helpers ──────────────────────────────────────────────────────────

def _ok(conf: float = 0.90) -> DetectionResult:
    return DetectionResult(result=True,  confidence=conf, model_version="v1")

def _ko(conf: float = 0.90) -> DetectionResult:
    return DetectionResult(result=False, confidence=conf, model_version="v1")


def _make_processor(tmp_path: Path) -> BatchProcessor:
    """BatchProcessor avec modèles factices et détecteurs mockés."""
    model = tmp_path / "models" / "fake.pt"
    model.parent.mkdir()
    model.write_bytes(b"FAKE")

    from src.config import LabelConfig, OllamaConfig, ScorieConfig, Settings
    settings = Settings(
        input_dir=tmp_path / "input",
        output_dir=tmp_path / "output",
        models_dir=tmp_path / "models",
        label=LabelConfig(model=model, model_version="v1", confidence_threshold=0.75),
        scorie=ScorieConfig(
            model=model, model_version="v1", confidence_threshold=0.60,
            ollama=OllamaConfig(url="http://localhost:11434", model="moondream2", fallback_threshold=0.70),
        ),
        valid_extensions=frozenset({".jpg", ".jpeg", ".png"}),
        max_file_size_bytes=50 * 1024 * 1024,
        verify_model_hash=False,
        model_hashes={},
    )
    processor = BatchProcessor.__new__(BatchProcessor)
    processor.settings = settings
    processor.label_detector  = MagicMock()
    processor.scorie_detector = MagicMock()
    return processor


def _add_jpeg(directory: Path, name: str = "cam_01.jpg") -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    f = directory / name
    f.write_bytes(bytes([0xFF, 0xD8, 0xFF, 0xE0]) + b"\x00" * 64)
    return f


# ── Tests statut ────────────────────────────────────────────────────

def test_photo_status_conforme() -> None:
    assert _photo_status(label_ok=True, scorie_found=False) == "CONFORME"

def test_photo_status_non_conforme_sans_label() -> None:
    assert _photo_status(label_ok=False, scorie_found=False) == "NON-CONFORME"

def test_photo_status_verification_si_scorie() -> None:
    assert _photo_status(label_ok=True, scorie_found=True) == "VÉRIFICATION MANUELLE REQUISE"

def test_lot_status_tous_conformes() -> None:
    photos = [{"status": "CONFORME"}, {"status": "CONFORME"}]
    assert _lot_status(photos) == "CONFORME"

def test_lot_status_un_non_conforme() -> None:
    photos = [{"status": "CONFORME"}, {"status": "NON-CONFORME"}]
    assert _lot_status(photos) == "NON-CONFORME"

def test_lot_status_verification_requise() -> None:
    photos = [{"status": "CONFORME"}, {"status": "VÉRIFICATION MANUELLE REQUISE"}]
    assert _lot_status(photos) == "VÉRIFICATION MANUELLE REQUISE"

def test_lot_status_nc_prioritaire_sur_verification() -> None:
    photos = [{"status": "VÉRIFICATION MANUELLE REQUISE"}, {"status": "NON-CONFORME"}]
    assert _lot_status(photos) == "NON-CONFORME"


# ── Tests pipeline ───────────────────────────────────────────────────

def test_process_lot_conforme(tmp_path: Path) -> None:
    processor = _make_processor(tmp_path)
    lot_path = tmp_path / "input" / "LOT-001"
    _add_jpeg(lot_path)

    processor.label_detector.detect.return_value  = _ok(0.94)
    processor.scorie_detector.detect.return_value = _ko(0.89)

    with patch("src.pipeline.batch_processor._annotate"):
        rapport = processor.process_lot("LOT-001")

    assert rapport["lot_status"] == "CONFORME"
    assert len(rapport["photos"]) == 1
    assert rapport["photos"][0]["status"] == "CONFORME"
    assert rapport["photos"][0]["checks"]["label_present"]["result"] is True
    assert rapport["photos"][0]["checks"]["scorie_detected"]["result"] is False


def test_process_lot_non_conforme_sans_label(tmp_path: Path) -> None:
    processor = _make_processor(tmp_path)
    lot_path = tmp_path / "input" / "LOT-002"
    _add_jpeg(lot_path)

    processor.label_detector.detect.return_value  = _ko(0.30)
    processor.scorie_detector.detect.return_value = _ko(0.85)

    with patch("src.pipeline.batch_processor._annotate"):
        rapport = processor.process_lot("LOT-002")

    assert rapport["lot_status"] == "NON-CONFORME"


def test_process_lot_rapport_json_ecrit(tmp_path: Path) -> None:
    processor = _make_processor(tmp_path)
    lot_path = tmp_path / "input" / "LOT-003"
    _add_jpeg(lot_path)

    processor.label_detector.detect.return_value  = _ok()
    processor.scorie_detector.detect.return_value = _ko()

    with patch("src.pipeline.batch_processor._annotate"):
        processor.process_lot("LOT-003")

    rapport_file = tmp_path / "output" / "LOT-003" / "rapport.json"
    assert rapport_file.exists()
    data = json.loads(rapport_file.read_text())
    assert data["lot_id"] == "LOT-003"


def test_process_lot_introuvable(tmp_path: Path) -> None:
    processor = _make_processor(tmp_path)
    with pytest.raises(FileNotFoundError, match="introuvable"):
        processor.process_lot("LOT-INEXISTANT")


def test_process_lot_vide(tmp_path: Path) -> None:
    processor = _make_processor(tmp_path)
    (tmp_path / "input" / "LOT-VIDE").mkdir(parents=True)
    with pytest.raises(ValueError, match="Aucune image"):
        processor.process_lot("LOT-VIDE")


def test_image_corrompue_marquee_non_conforme(tmp_path: Path) -> None:
    processor = _make_processor(tmp_path)
    lot_path = tmp_path / "input" / "LOT-004"
    lot_path.mkdir(parents=True)
    bad = lot_path / "corrupt.jpg"
    bad.write_bytes(b"NOT_AN_IMAGE")

    processor.label_detector.detect.return_value  = _ok()
    processor.scorie_detector.detect.return_value = _ko()

    with patch("src.pipeline.batch_processor._annotate"):
        rapport = processor.process_lot("LOT-004")

    assert rapport["photos"][0]["status"] == "NON-CONFORME"
    assert "error" in rapport["photos"][0]
