from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from src.detectors.scorie_detector import ScorieDetector


def _make_detector(fake_model: Path) -> ScorieDetector:
    return ScorieDetector(
        model_path=fake_model,
        confidence_threshold=0.60,
        model_version="scorie_detector_v1",
        ollama_url="http://localhost:11434",
        ollama_model="moondream2",
        ollama_fallback_threshold=0.70,
    )


def _mock_yolo(conf: float) -> MagicMock:
    box = MagicMock()
    box.conf = [conf]
    box.xyxy = [[0, 0, 50, 50]]
    r = MagicMock()
    r.boxes = [box]
    return MagicMock(return_value=[r])


def test_scorie_detectee_haute_confiance_yolo(fake_model: Path, jpeg_file: Path) -> None:
    """Confiance YOLO ≥ fallback_threshold → Ollama non consulté."""
    detector = _make_detector(fake_model)
    detector._model = _mock_yolo(0.85)

    result = detector.detect(jpeg_file)

    assert result.result is True
    assert result.confidence == pytest.approx(0.85)
    assert "ollama" not in result.model_version


def test_pas_de_scorie_haute_confiance(fake_model: Path, jpeg_file: Path) -> None:
    detector = _make_detector(fake_model)
    # Aucune box détectée → conf = 0.0
    r = MagicMock()
    r.boxes = []
    detector._model = MagicMock(return_value=[r])

    result = detector.detect(jpeg_file)

    assert result.result is False
    assert result.confidence == pytest.approx(0.0)


def test_fallback_ollama_scorie(fake_model: Path, jpeg_file: Path) -> None:
    """Confiance YOLO < fallback_threshold → Ollama consulté et retourne scorie=True."""
    detector = _make_detector(fake_model)
    detector._model = _mock_yolo(0.55)  # sous le seuil 0.70

    ollama_json = json.dumps({"scorie": True, "confidence": 0.82, "reason": "visible rust"})
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"response": ollama_json}

    with patch("src.detectors.scorie_detector.requests.post", return_value=mock_resp):
        result = detector.detect(jpeg_file)

    assert result.result is True
    assert result.confidence == pytest.approx(0.82)
    assert "ollama" in result.model_version


def test_fallback_ollama_propre(fake_model: Path, jpeg_file: Path) -> None:
    detector = _make_detector(fake_model)
    detector._model = _mock_yolo(0.55)

    ollama_json = json.dumps({"scorie": False, "confidence": 0.91, "reason": "surface clean"})
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"response": ollama_json}

    with patch("src.detectors.scorie_detector.requests.post", return_value=mock_resp):
        result = detector.detect(jpeg_file)

    assert result.result is False


def test_ollama_indisponible_retour_yolo(fake_model: Path, jpeg_file: Path) -> None:
    """Si Ollama est down, on conserve le résultat YOLO sans lever d'exception."""
    detector = _make_detector(fake_model)
    detector._model = _mock_yolo(0.55)  # sous seuil → essaie Ollama

    with patch("src.detectors.scorie_detector.requests.post", side_effect=ConnectionError):
        result = detector.detect(jpeg_file)

    # Doit retourner un résultat YOLO, pas une exception
    assert result is not None
    assert "ollama" not in result.model_version


def test_ollama_json_malformed(fake_model: Path, jpeg_file: Path) -> None:
    """Ollama retourne du texte libre → parsing heuristique."""
    detector = _make_detector(fake_model)
    detector._model = _mock_yolo(0.55)

    mock_resp = MagicMock()
    mock_resp.json.return_value = {"response": "Yes, there is visible scorie on the surface."}

    with patch("src.detectors.scorie_detector.requests.post", return_value=mock_resp):
        result = detector.detect(jpeg_file)

    assert result.result is True  # "scorie" présent dans le texte
