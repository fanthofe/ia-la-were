from __future__ import annotations

import hashlib
import time
from pathlib import Path
from typing import Annotated

import typer

from .config import Settings, load_settings

app = typer.Typer(
    name="ia-la-were",
    help="Détection visuelle industrielle — analyse de lots de containers.",
    add_completion=False,
)


@app.command()
def analyze(
    lot: Annotated[str, typer.Option("--lot", "-l", help="Matricule du lot (ex: LOT-2026-042)")],
    config: Annotated[Path, typer.Option(help="Chemin vers settings.yaml")] = Path("config/settings.yaml"),
) -> None:
    """Analyse toutes les images d'un lot et génère le rapport JSON + photos annotées."""
    from .pipeline.batch_processor import BatchProcessor

    settings = load_settings(config)

    if settings.verify_model_hash:
        _check_model_hashes(settings)

    typer.echo(f"📂  Lot     : {lot}")
    typer.echo(f"📥  Input   : {settings.input_dir / lot}")
    typer.echo(f"📤  Output  : {settings.output_dir / lot}")
    typer.echo("")

    processor = BatchProcessor(settings)

    t0 = time.perf_counter()
    try:
        rapport = processor.process_lot(lot)
    except FileNotFoundError as exc:
        typer.secho(f"❌  {exc}", fg=typer.colors.RED, err=True)
        raise typer.Exit(1)
    except ValueError as exc:
        typer.secho(f"⚠️   {exc}", fg=typer.colors.YELLOW, err=True)
        raise typer.Exit(1)

    elapsed = time.perf_counter() - t0
    nb = len(rapport["photos"])
    status = rapport["lot_status"]

    colour = (
        typer.colors.GREEN if status == "CONFORME"
        else typer.colors.YELLOW if status == "VÉRIFICATION MANUELLE REQUISE"
        else typer.colors.RED
    )
    typer.echo("")
    typer.secho(
        f"{'✅' if status == 'CONFORME' else '⚠️ ' if 'VÉRIF' in status else '❌'}  "
        f"{nb} photos — {elapsed:.1f}s — {status}",
        fg=colour, bold=True,
    )
    typer.echo(f"📄  Rapport : {settings.output_dir / lot / 'rapport.json'}")


def _check_model_hashes(settings: Settings) -> None:
    for filename, expected in settings.model_hashes.items():
        if expected is None:
            continue
        path = settings.models_dir / filename
        if not path.exists():
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != expected:
            typer.secho(
                f"❌  Hash SHA-256 invalide pour {filename}\n"
                f"   Attendu : {expected}\n"
                f"   Obtenu  : {digest}",
                fg=typer.colors.RED, err=True,
            )
            raise typer.Exit(2)


if __name__ == "__main__":
    app()
