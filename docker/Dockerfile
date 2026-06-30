FROM python:3.11-slim

WORKDIR /app

# Dépendances système pour OpenCV headless
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copie du packaging en premier → couche cachée tant que les deps ne changent pas
COPY pyproject.toml .
COPY src/ src/

RUN pip install --no-cache-dir ".[dev]"

COPY config/ config/

# Désactiver toute télémétrie
ENV YOLO_TELEMETRY=False
ENV ANONYMIZED_TELEMETRY=False
ENV PYTHONUNBUFFERED=1

# Volumes persistants — jamais reconstruits par docker compose up
VOLUME ["/app/input", "/app/output", "/app/models"]

ENTRYPOINT ["python", "-m", "src.cli"]
CMD ["--help"]
