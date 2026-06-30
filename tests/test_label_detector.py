from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from src.detectors.base import ModelNotFoundError
from src.detectors.label_detector import LabelDetector


def _make_detector(fake_model: Path) -> LabelDetector:
    return LabelDetector(
        model_path=fake_model,
        confidence_threshold=0.75,
        model_version="label_detector_v1",
    )


def _mock_yolo_box(conf: float, xyxy: list[int]) -> MagicMock:
    box = MagicMock()
    box.conf  = [conf]
    box.xyxy  = [xyxy]
    return box


def test_model_not_found(tmp_path: Path) -> None:
    with pytest.raises(ModelNotFoundError):
        LabelDetector(tmp_path / "absent.pt", 0.75, "v1")


def test_label_detecte(fake_model: Path, jpeg_file: Path) -> None:
    detector = _make_detector(fake_model)
    mock_result = MagicMock()
    mock_result.boxes = [_mock_yolo_box(0.92, [10, 20, 100, 80])]
    detector._model = MagicMock(return_value=[mock_result])

    result = detector.detect(jpeg_file)

    assert result.result is True
    assert result.confidence == pytest.approx(0.92)
    assert result.model_version == "label_detector_v1"
    assert len(result.boxes) == 1


def test_label_absent_sous_seuil(fake_model: Path, jpeg_file: Path) -> None:
    detector = _make_detector(fake_model)
    mock_result = MagicMock()
    mock_result.boxes = [_mock_yolo_box(0.45, [0, 0, 50, 50])]
    detector._model = MagicMock(return_value=[mock_result])

    result = detector.detect(jpeg_file)

    assert result.result is False
    assert result.confidence == pytest.approx(0.45)


def test_aucune_detection(fake_model: Path, jpeg_file: Path) -> None:
    detector = _make_detector(fake_model)
    mock_result = MagicMock()
    mock_result.boxes = []
    detector._model = MagicMock(return_value=[mock_result])

    result = detector.detect(jpeg_file)

    assert result.result is False
    assert result.confidence == pytest.approx(0.0)
    assert result.boxes == []


def test_plusieurs_boxes_retient_meilleure_conf(fake_model: Path, jpeg_file: Path) -> None:
    detector = _make_detector(fake_model)
    mock_result = MagicMock()
    mock_result.boxes = [
        _mock_yolo_box(0.55, [0, 0, 40, 40]),
        _mock_yolo_box(0.88, [50, 50, 120, 120]),
    ]
    detector._model = MagicMock(return_value=[mock_result])

    result = detector.detect(jpeg_file)

    assert result.result is True
    assert result.confidence == pytest.approx(0.88)
    assert len(result.boxes) == 2
