# Alumni Position Periodic Refresh PRP

## Goal
Automatiser la mise à jour des postes actuels des alumni tous les 6 mois en utilisant les URLs LinkedIn existantes pour maintenir une base de données à jour sans intervention manuelle.

## Why
Les alumni changent régulièrement de poste. Sans mise à jour périodique, les données de networking et le Job Board perdent de leur pertinence. L'automatisation réduit la charge administrative et garantit la fraîcheur des données de carrière.

## What
- Un job périodique (cron) s'exécutant tous les 6 mois.
- Identification des profils dont le dernier scraping date de plus de 180 jours.
- Relance du processus de scraping via l'API Apify en utilisant l'URL LinkedIn déjà stockée.
- Mise à jour atomique du titre de poste, de l'entreprise et de l'historique des expériences.

## Technical Context

### Files to Reference (read-only)
- `back-end/scraping/models.py` - Modèle `LinkedInScrapingTask` pour le suivi des dates de scraping.
- `back-end/scraping/services/apify_scraper.py` - Logique d'appel à l'API de scraping.
- `back-end/alumni/models.py` - Modèles `Profile` et `Experience` à mettre à jour.

### Files to Implement/Modify
- `back-end/scraping/tasks.py` - Ajout de la tâche Celery `refresh_all_alumni_positions`.
- `back-end/config/settings.py` - Configuration du `CELERY_BEAT_SCHEDULE`.

### Existing Patterns to Follow
- Utilisation des `shared_task` de Celery.
- Transactions atomiques pour la mise à jour des expériences (`transaction.atomic()`).
- Pattern de "soft-fail" avec journalisation des erreurs pour ne pas bloquer la file d'attente globale.

## Implementation Details

### Celery Beat Configuration
- Fréquence : `crontab(0, 0, day_of_month='1', month_of_year='*/6')` (Tous les 1er du mois, tous les 6 mois).

### Task Logic
1. Filtrer `LinkedInScrapingTask` où `scraped_at < now - 180 days`.
2. Pour chaque utilisateur trouvé, appeler `scrape_alumni_profile.delay(user_id, force_refresh=True)`.
3. Le flag `force_refresh` contourne la vérification habituelle du statut "DONE".

## Validation Criteria

### Functional Requirements
- [ ] La tâche identifie correctement les profils "vieux" de plus de 6 mois.
- [ ] Le processus de scraping utilise l'URL LinkedIn existante (pas de recherche Google redondante).
- [ ] Les anciennes expériences sont rafraîchies et le poste actuel est mis à jour dans `Profile`.

### Technical Requirements
- [ ] La configuration Celery Beat est valide (pas d'erreurs au démarrage du worker).
- [ ] Utilisation de `django.utils.timezone.now` pour le respect des fuseaux horaires.
- [ ] Pas de régression sur le scraping initial des nouveaux utilisateurs.
