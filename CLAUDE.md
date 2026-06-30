# IA La Wère — Détection Visuelle Industrielle

## Contexte Projet

Logiciel local de détection d'éléments visuels sur des photos industrielles (containers).
Chaque lot de photos est associé à un **matricule unique** (dossier identifié).

Cas d'usage actuels :
- Détecter la **présence d'une étiquette** sur un container
- Détecter la **présence de scorie / saleté** dans un container

Contrainte principale : **tout doit tourner en local**, aucune donnée ne sort du site.

---

## Recommandation Technique

### Stack retenue

| Composant | Choix | Justification |
|---|---|---|
| Langage | Python 3.11+ | Écosystème ML dominant, maintenance facile |
| Détection IA | **YOLOv11 (Ultralytics)** | Rapide, fine-tunable, 100% local |
| Vision complexe | **Ollama + LLaVA / Llama 3.2 Vision** | Pour cas ambigus (scorie), raisonnement naturel |
| Interface | **Streamlit** ou CLI (`typer`) | Déployable sans frontend complexe |
| Packaging | **Docker + Docker Compose** | Isolation, reproducibilité, mise à jour propre |

### Pourquoi YOLOv11 + Ollama et non une seule solution ?

- **YOLO** = détection d'objets précis et répétables (étiquette présente / absente) → rapide, entraînable sur vos propres photos annotées
- **Ollama/LLaVA** = compréhension contextuelle (« y a-t-il de la scorie ? ») → utile quand la définition de "propre" est subjective ou variable
- Les deux peuvent coexister : YOLO en premier filtre, Ollama pour la vérification fine

---

## Architecture

```
ia-la-were/
├── input/
│   └── {MATRICULE}/              # Dossier par lot déposé par l'opérateur (ex: LOT-2024-001)
│       └── *.jpg / *.png         # Photos brutes à analyser
├── output/
│   └── {MATRICULE}/              # Généré automatiquement après analyse
│       ├── rapport.json          # Résultats bruts structurés
│       └── *.jpg                 # Photos annotées avec bounding boxes
├── models/
│   ├── label_detector_v1.pt      # Modèle YOLO fine-tuné "étiquette"
│   └── scorie_detector_v1.pt     # Modèle YOLO fine-tuné "scorie"
├── src/
│   ├── detectors/                # Logique de détection
│   │   ├── base.py
│   │   ├── label_detector.py
│   │   └── scorie_detector.py
│   ├── pipeline/                 # Orchestration : lit input/, écrit output/
│   │   └── batch_processor.py
│   └── utils/
│       ├── image_validator.py    # Validation des fichiers entrants
│       └── logger.py
├── ui/                           # Interface Streamlit (optionnel)
├── tests/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── config/
│   └── settings.yaml             # Config centralisée (seuils, chemins, modèles)
├── CLAUDE.md
└── pyproject.toml
```

---

## Sécurité

### Principes fondamentaux (pour un contexte professionnel industriel)

**1. Isolation réseau**
- Aucun appel externe : YOLO et Ollama tournent entièrement en local
- Docker réseau isolé (`--network none` en production si possible)
- Désactiver toute télémétrie : `YOLO_TELEMETRY=False`, `ANONYMIZED_TELEMETRY=False`

**2. Validation des entrées**
- Vérifier l'extension ET le magic bytes (header) du fichier image (pas juste `.jpg`)
- Rejeter tout fichier > taille limite configurable
- Noms de fichiers sanitisés (pas de path traversal)
- Seuls les formats `JPEG`, `PNG`, `TIFF` acceptés

**3. Gestion des modèles IA**
- Hash SHA-256 vérifié au démarrage pour chaque fichier modèle (`.pt`)
- Modèles versionnés avec numéro explicite (ex: `label_detector_v2.pt`)
- Séparation claire : `models/` est indépendant de `input/` et `output/`

**4. Configuration**
- Aucun secret en dur dans le code
- `.gitignore` strict : exclure `input/`, `output/`, `models/`

---

## Maintenance Technique

### Gestion des modèles IA

```
# Cycle de vie d'un modèle
1. Collecte de nouvelles photos → annotation (Roboflow ou Label Studio en local)
2. Ré-entraînement YOLO sur dataset augmenté
3. Validation sur jeu de test (matrice de confusion, précision, rappel)
4. Déploiement : renommer l'ancien modèle en _archived, pointer config vers le nouveau
5. Test de régression sur les lots historiques
```

**Seuils de confiance** configurables dans `config/settings.yaml` :
```yaml
detectors:
  label:
    model: models/label_detector_v1.pt
    confidence_threshold: 0.75   # Au-dessus = étiquette détectée
  scorie:
    model: models/scorie_detector_v1.pt
    confidence_threshold: 0.60   # Plus permissif car sécurité > faux négatifs
```

### Mise à jour

```bash
# Mise à jour propre sans perte de données
docker compose pull
docker compose up -d --no-deps --build api
# Les volumes data/ et models/ sont persistants, non touchés
```

### Monitoring

- Logs console pendant l'analyse (temps d'inférence, confiance par photo)
- Interface Streamlit affiche un résumé en direct pendant le traitement
- Pas de persistance : les logs ne sont pas conservés entre les sessions

---

## Workflow Utilisateur

```
1. L'opérateur crée un dossier : input/LOT-2026-042/
2. Il y dépose les photos du lot (.jpg, .png)
3. Il lance l'analyse via :
   - Interface Streamlit → sélectionne LOT-2026-042 → bouton "Analyser"
   - OU commande CLI : python -m src.cli analyze --lot LOT-2026-042
4. Résultats générés dans output/LOT-2026-042/
   - rapport.json          (résultats structurés)
   - container_01_annote.jpg  (photo avec bounding boxes)
   - ...
5. Statut final par photo : CONFORME / NON-CONFORME / VÉRIFICATION MANUELLE REQUISE
6. Aucune donnée sauvegardée ailleurs — output/ contient tout, input/ reste intact
```

---

## Données et format de résultat

```json
{
  "lot_id": "LOT-2026-042",
  "analyzed_at": "2026-06-30T14:32:00Z",
  "photos": [
    {
      "filename": "container_01.jpg",
      "checks": {
        "label_present": {
          "result": true,
          "confidence": 0.94,
          "model_version": "label_detector_v1"
        },
        "scorie_detected": {
          "result": false,
          "confidence": 0.87,
          "model_version": "scorie_detector_v1"
        }
      },
      "status": "CONFORME"
    }
  ],
  "lot_status": "CONFORME"
}
```

---

## Conventions de développement

- Python : `ruff` pour le lint, `black` pour le format, `mypy` pour les types
- Tests : `pytest` + `pytest-cov`, couverture minimum 80%
- Commits : Conventional Commits (`feat:`, `fix:`, `model:`, `data:`)
- Branching : `main` (stable) → `dev` → `feature/*`
- Chaque nouveau détecteur = nouveau fichier dans `src/detectors/` héritant de `BaseDetector`

---

## Démarrage rapide (à compléter au fil du développement)

```bash
# Installer
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# Lancer avec Docker
docker compose up -d

# Analyser un lot en CLI
python -m src.cli analyze --lot LOT-2026-042
# → lit  : input/LOT-2026-042/*.jpg
# → écrit : output/LOT-2026-042/rapport.json + photos annotées

# Lancer les tests
pytest tests/ -v --cov=src
```

---

## Choix rejetés et pourquoi

| Alternative | Rejetée car |
|---|---|
| API cloud (AWS Rekognition, Google Vision) | Données industrielles sensibles sortant du site |
| GPT-4o Vision via API | Idem + coût + dépendance internet |
| Solution tout-OpenCV classique | Fragile aux variations d'éclairage, maintenance élevée |
| Electron + modèle embarqué | Plus complexe à maintenir que Docker |
| Base de données | Inutile : les fichiers output/ sont la seule persistance nécessaire |
| Authentification | Inutile : outil local, utilisé directement sur la machine |
