from pathlib import Path

# Magic bytes (file signatures) for accepted formats
_MAGIC: dict[str, bytes] = {
    ".jpg":  bytes([0xFF, 0xD8, 0xFF]),
    ".jpeg": bytes([0xFF, 0xD8, 0xFF]),
    ".png":  bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    ".tiff": bytes([0x49, 0x49, 0x2A, 0x00]),  # little-endian
    ".tif":  bytes([0x49, 0x49, 0x2A, 0x00]),
}
_TIFF_BE = bytes([0x4D, 0x4D, 0x00, 0x2A])     # TIFF big-endian


class ImageValidationError(ValueError):
    pass


def validate_image(
    path: Path,
    valid_extensions: frozenset[str],
    max_file_size_bytes: int,
) -> None:
    """Raise ImageValidationError if the file is not a safe, readable image."""

    # Reject path traversal
    if ".." in path.parts:
        raise ImageValidationError(f"Chemin invalide (path traversal) : {path}")

    suffix = path.suffix.lower()
    if suffix not in valid_extensions:
        raise ImageValidationError(
            f"Extension non autorisée : '{suffix}'. Acceptées : {sorted(valid_extensions)}"
        )

    if not path.exists():
        raise ImageValidationError(f"Fichier introuvable : {path}")

    size = path.stat().st_size
    if size > max_file_size_bytes:
        raise ImageValidationError(
            f"Fichier trop volumineux : {size / 1_048_576:.1f} MB "
            f"(limite : {max_file_size_bytes / 1_048_576:.0f} MB)"
        )

    expected = _MAGIC.get(suffix)
    if expected is None:
        raise ImageValidationError(f"Pas de signature connue pour '{suffix}'")

    header = path.read_bytes()[:8]
    if not header.startswith(expected):
        # Accept TIFF big-endian as fallback for .tiff/.tif
        if suffix in (".tiff", ".tif") and header.startswith(_TIFF_BE):
            return
        raise ImageValidationError(
            f"Signature de fichier invalide pour '{path.name}' "
            f"(attendu {expected.hex()}, obtenu {header[:len(expected)].hex()})"
        )
