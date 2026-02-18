# LinkedIn Alumni Discovery & Automated Enrichment PRP

> Un PRP est le paquet minimum viable qu'une IA utilise pour livrer du code prêt pour la production dès le premier passage.

## Goal

Automatiser la découverte et la création de profils d'anciens élèves à partir de critères de recherche LinkedIn (École, Diplôme, Années) pour constituer la base de données initiale d'AlumniConnect, avec une étape de sauvegarde intermédiaire sous format fichier.

## Why

**Justification Business :**
- Aucune donnée initiale n'est disponible (démarrage à froid).
- Le scraping automatisé permet de peupler l'annuaire massivement.
- **Audit & Sécurité :** L'enregistrement en fichiers (`.json`/`.csv`) avant l'insertion en base permet de conserver une trace brute des données extraites pour audit, debug ou ré-importation en cas de crash de la base de données.

**Priorité :** Critique (Nécessaire pour le lancement du projet).

## What

### Feature Description
Un moteur automatisé qui prend en entrée des "Search Seeds" et qui, de manière autonome :
1. Effectue des recherches sur LinkedIn.
2. Extrait les profils correspondants.
3. **Persistance Fichier :** Sauvegarde chaque lot de profils trouvés dans un fichier `.json` (pour la structure riche) ou `.csv` (pour la lisibilité rapide) dans un dossier de staging.
4. **Ingestion DB :** Lit ces fichiers pour créer les profils en base avec le statut `DRAFT`.
5. **Inférence :** Déduit les champs manquants (inférence d'année de diplôme).

### Scope
**In Scope :**
- **Discovery Engine :** Pipeline automatisé gérant les recherches.
- **File Staging Layer :** Système de stockage intermédiaire des données brutes en fichiers horodatés.
- **Data Ingestion :** Importateur de fichiers vers la base de données `Profile`.
- **Inférence d'année :** Logique de déduction basée sur les dates d'expériences ou de diplômes.
- **Dashboard :** Interface Angular pour surveiller les fichiers générés et l'avancement de l'ingestion.

**Out of Scope :**
- Nettoyage automatique des fichiers de staging (conservation illimitée pour l'instant).

### User Stories
1. En tant qu'admin, je lance un scan pour "Promo 2024".
2. Je vois apparaître un fichier `discovery_2024_20260218.json` dans le dossier de staging.
3. Le système m'informe que 50 nouveaux profils issus de ce fichier ont été importés en base pour validation.

## Technical Context

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `back-end/alumni/discovery.py` | CREATE | Moteur de recherche + Logique d'écriture de fichiers bruts. |
| `back-end/alumni/ingestor.py` | CREATE | Service de lecture des fichiers JSON/CSV et insertion en base de données. |
| `back-end/alumni/models.py` | CREATE | Modèles `Profile` (Draft) et `DiscoveryLog` (pour suivre les fichiers traités). |
| `back-end/data/staging/` | CREATE | Répertoire de stockage des fichiers `.json` et `.csv`. |

### Workflow de Données
`LinkedIn Search` -> `Raw Extraction` -> `Write to JSON/CSV (Staging)` -> `Read from File` -> `Database (Draft Profiles)`

## Implementation Details

### File Structure (JSON Example)
```json
[
  {
    "full_name": "Jean Dupont",
    "linkedin_url": "https://linkedin.com/in/jdupont",
    "current_job": "Data Engineer chez Google",
    "education": [
      {"school": "School X", "degree": "Master", "year": "2023"}
    ],
    "extracted_at": "2026-02-18T10:00:00Z"
  }
]
```

### Database Schema Extension
```python
class DiscoveryLog(models.Model):
    file_path = models.CharField(max_length=500)
    record_count = models.IntegerField()
    processed_at = models.DateTimeField(null=True)
    status = models.CharField(choices=[('PENDING', 'Pending'), ('PROCESSED', 'Processed')], default='PENDING')
```

## Validation Criteria

### Functional Requirements
- [ ] Chaque session de scan génère au moins un fichier physique (`.json` ou `.csv`).
- [ ] L'insertion en base ne se fait qu'après la clôture et la validation du fichier par le système.
- [ ] Pas de perte de données entre le fichier et la base (vérification du `record_count`).
- [ ] Détection des doublons : si une URL LinkedIn est déjà présente en base ou dans un fichier traité, elle est ignorée.

### Technical Requirements
- [ ] Gestion robuste des erreurs d'écriture disque (permissions, espace).
- [ ] Formatage correct des CSV (échappement des caractères spéciaux dans les noms/jobs).
- [ ] Backend Django compatible avec le traitement asynchrone des fichiers.

### Testing Steps
1. Lancer un scan de découverte.
2. Vérifier manuellement la création du fichier dans `back-end/data/staging/`.
3. Vérifier que le fichier contient des données valides et structurées.
4. Déclencher l'ingestion et vérifier que les profils apparaissent dans l'interface d'admin.

---
**Created :** 18/02/2026
**Status :** Draft (v3 - Staging Files)
