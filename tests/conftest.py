from __future__ import annotations

from pathlib import Path
import pytest


@pytest.fixture()
def lot_dir(tmp_path: Path) -> Path:
    d = tmp_path / "input" / "LOT-TEST-001"
    d.mkdir(parents=True)
    return d


@pytest.fixture()
def output_dir(tmp_path: Path) -> Path:
    d = tmp_path / "output"
    d.mkdir()
    return d


@pytest.fixture()
def jpeg_file(lot_dir: Path) -> Path:
    path = lot_dir / "cam_01.jpg"
    # En-tête JPEG valide (SOI + APP0)
    path.write_bytes(bytes([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]) + b"\x00" * 64)
    return path


@pytest.fixture()
def png_file(lot_dir: Path) -> Path:
    path = lot_dir / "cam_02.png"
    path.write_bytes(bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) + b"\x00" * 64)
    return path


@pytest.fixture()
def corrupt_file(lot_dir: Path) -> Path:
    path = lot_dir / "bad.jpg"
    path.write_bytes(b"NOT_AN_IMAGE")
    return path


@pytest.fixture()
def fake_model(tmp_path: Path) -> Path:
    """Fichier .pt factice — contourne ModelNotFoundError sans charger YOLO."""
    path = tmp_path / "models" / "fake_v1.pt"
    path.parent.mkdir()
    path.write_bytes(b"FAKE_WEIGHTS")
    return path
