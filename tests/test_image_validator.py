from __future__ import annotations

from pathlib import Path
import pytest

from src.utils.image_validator import ImageValidationError, validate_image

_EXT   = frozenset({".jpg", ".jpeg", ".png", ".tiff", ".tif"})
_MAX   = 50 * 1024 * 1024


def test_jpeg_valide(jpeg_file: Path) -> None:
    validate_image(jpeg_file, _EXT, _MAX)  # ne doit pas lever


def test_png_valide(png_file: Path) -> None:
    validate_image(png_file, _EXT, _MAX)


def test_extension_non_autorisee(tmp_path: Path) -> None:
    f = tmp_path / "image.bmp"
    f.write_bytes(bytes([0xFF, 0xD8, 0xFF, 0xE0]) + b"\x00" * 10)
    with pytest.raises(ImageValidationError, match="Extension non autorisée"):
        validate_image(f, _EXT, _MAX)


def test_signature_invalide(corrupt_file: Path) -> None:
    with pytest.raises(ImageValidationError, match="Signature de fichier invalide"):
        validate_image(corrupt_file, _EXT, _MAX)


def test_fichier_trop_volumineux(tmp_path: Path) -> None:
    f = tmp_path / "big.jpg"
    f.write_bytes(bytes([0xFF, 0xD8, 0xFF, 0xE0]) + b"\x00" * (51 * 1024 * 1024))
    with pytest.raises(ImageValidationError, match="trop volumineux"):
        validate_image(f, _EXT, 50 * 1024 * 1024)


def test_fichier_introuvable(tmp_path: Path) -> None:
    with pytest.raises(ImageValidationError, match="introuvable"):
        validate_image(tmp_path / "ghost.jpg", _EXT, _MAX)


def test_path_traversal() -> None:
    with pytest.raises(ImageValidationError, match="path traversal"):
        validate_image(Path("../secret.jpg"), _EXT, _MAX)


def test_tiff_big_endian(tmp_path: Path) -> None:
    f = tmp_path / "scan.tiff"
    f.write_bytes(bytes([0x4D, 0x4D, 0x00, 0x2A]) + b"\x00" * 10)
    validate_image(f, _EXT, _MAX)  # doit accepter le TIFF big-endian
