# IA La Wère — Détection Visuelle Industrielle

Logiciel local d'inspection visuelle automatisée de containers industriels.  
Chaque lot de photos est analysé par un pipeline IA (YOLO + Ollama) et produit un rapport structuré — **aucune donnée ne sort du site**.

---

## Cas d'usage

| Détection | Modèle | Résultat |
|---|---|---|
| Présence d'une étiquette sur le container | YOLOv11 | CONFORME / NON-CONFORME |
| Présence de scorie / saleté dans le container | Ollama + moondream2 | CONFORME / VÉRIFICATION REQUISE |

---

## Stack technique

| Composant | Choix |
|---|---|
| Interface | Vanilla HTML/JS — ES Modules natifs, aucun build tool |
| Style | Tailwind CSS via CDN + design system "Industrial Precision" |
| Détection IA | YOLOv11 (Ultralytics) — local, fine-tunable |
| Vision complexe | Ollama + moondream2 — raisonnement contextuel |
| Packaging | Docker + Docker Compose |

---

## Structure du projet

```
ia-la-were/
├── index.html              # Shell HTML (header, nav, conteneurs d'écrans)
├── styles/
│   └── main.css            # CSS custom (glassmorphism, animations, grille)
├── config/
│   └── tailwind.js         # Configuration Tailwind (couleurs, typographie, espacements)
├── src/
│   ├── app.js              # Point d'entrée — navigate(), init, exports window
│   ├── state.js            # État partagé (lots, rapportLot, compteur)
│   ├── data/
│   │   └── lots.js         # Données seed, images, séquences de logs
│   ├── components/
│   │   ├── header.js       # Mise à jour du header (statut, ID lot)
│   │   └── nav.js          # Gestion de la nav active
│   └── screens/
│       ├── dashboard.js    # Tableau de bord — KPIs, lots récents
│       ├── analyse.js      # Analyse en cours — progression, logs, feed caméra
│       └── rapport.js      # Rapport de lot — galerie, télémétrie, export JSON
├── input/
│   └── {MATRICULE}/        # Photos déposées par l'opérateur (.jpg, .png)
├── output/
│   └── {MATRICULE}/        # Rapport généré (rapport.json + photos annotées)
├── models/
│   ├── label_detector_v1.pt
│   └── scorie_detector_v1.pt
└── CLAUDE.md               # Documentation technique du projet
```

---

## Lancer le projet

L'interface est une SPA en HTML/JS pur — il suffit d'un **serveur HTTP local** (les ES modules ne fonctionnent pas en `file://`).

### Option 1 — Python (aucune installation)

```bash
cd ~/Perso/ia-la-were
python3 -m http.server 8000
```

Ouvrir [http://localhost:8000](http://localhost:8000)

### Option 2 — Node / npx

```bash
cd ~/Perso/ia-la-were
npx serve .
```

L'URL s'affiche directement dans le terminal.

### Option 3 — VS Code Live Server

Installer l'extension **Live Server** (Ritwick Dey), puis clic droit sur `index.html` → *Open with Live Server*.  
Avantage : rechargement automatique à chaque sauvegarde.

> **Connexion internet requise au premier lancement** — Tailwind CSS, Inter et JetBrains Mono sont chargés via CDN. Le navigateur les met ensuite en cache.

---

## Workflow opérateur

```
1. Créer le dossier du lot      →  input/LOT-2026-042/
2. Déposer les photos           →  input/LOT-2026-042/*.jpg
3. Lancer l'analyse             →  Bouton "NOUVEAU LOT" (icône caméra, en bas à droite)
4. Consulter les résultats      →  output/LOT-2026-042/rapport.json
                                   output/LOT-2026-042/*.jpg  (photos annotées)
5. Statut final par photo       →  CONFORME / NON-CONFORME / VÉRIFICATION MANUELLE REQUISE
```

---

## Format du rapport généré

```json
{
  "lot_id": "LOT-2026-042",
  "analyzed_at": "2026-06-30T14:32:00Z",
  "lot_status": "CONFORME",
  "photos_count": 12,
  "etiquettes_presentes": 12,
  "scories_detectees": 0,
  "duree_analyse": "14.2s",
  "confiance_modele": "99.8%",
  "model": "yolo11s_v1"
}
```

---

## Lancer avec Docker

```bash
# Premier démarrage
docker compose up -d

# Analyser un lot en CLI
python -m src.cli analyze --lot LOT-2026-042

# Mise à jour sans perte de données
docker compose pull
docker compose up -d --no-deps --build api
```

---

## Développement

```bash
# Environnement Python (pour le backend IA)
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# Tests
pytest tests/ -v --cov=src

# Lint / format
ruff check src/
black src/
mypy src/
```

### Ajouter un nouveau détecteur

1. Créer `src/detectors/mon_detecteur.py` héritant de `BaseDetector`
2. Ajouter l'entrée dans `config/settings.yaml`
3. Placer le modèle `.pt` dans `models/`

---

## Sécurité

- Aucun appel réseau externe — YOLO et Ollama tournent entièrement en local
- Validation des fichiers entrants : extension **et** magic bytes (pas seulement `.jpg`)
- Hash SHA-256 vérifié au démarrage pour chaque modèle `.pt`
- Noms de fichiers sanitisés (pas de path traversal)
- Télémétrie désactivée : `YOLO_TELEMETRY=False`, `ANONYMIZED_TELEMETRY=False`
