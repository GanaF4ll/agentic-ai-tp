# Job Posting Feature - Back-end PRP

## Goal
Fournir une API REST complète pour la gestion des offres d'emploi, sécurisée par rôles.

## Why
Permettre aux administrateurs de centraliser les opportunités professionnelles pour le réseau Alumni via une base de données structurée.

## What
- **Modèle de données**: Utilisation du modèle `Job` existant dans `back-end/jobs/models.py`.
- **Permissions**: 
    - `POST`, `PUT`, `PATCH`, `DELETE` : Réservés aux utilisateurs ayant le rôle `ADMIN` ou `SUPER_ADMIN`.
    - `GET` (List & Retrieve) : Ouvert à tous les utilisateurs authentifiés.
- **Automatisation**: Le champ `posted_by` doit être automatiquement rempli avec l'utilisateur connecté lors de la création.

## Technical Context

### Files to Reference
- `back-end/jobs/models.py`: Définition des champs (title, company, job_type, etc.).
- `back-end/accounts/permissions.py`: Utilisation de `IsAdmin` qui regroupe `ADMIN` et `SUPER_ADMIN`.

### Files to Implement
- `back-end/jobs/serializers.py`: 
    - Créer `JobSerializer`.
    - Champs : `id`, `title`, `company`, `job_type`, `location`, `description`, `posted_by`, `created_at`.
    - `posted_by` en `read_only=True`.
- `back-end/jobs/views.py`: 
    - Créer `JobViewSet` héritant de `viewsets.ModelViewSet`.
    - Implémenter `perform_create(self, serializer)` pour injecter `self.request.user`.
    - Configurer `get_permissions()` pour différencier les accès lecture/écriture.
- `back-end/jobs/urls.py`: Enregistrer le ViewSet via un `DefaultRouter`.
- `back-end/config/urls.py`: Inclure `jobs.urls` avec le préfixe `/api/jobs/`.

## Validation Criteria
- [ ] Un simple `MEMBER` reçoit un code 403 Forbidden s'il tente un `POST`.
- [ ] Un `ADMIN` ou `SUPER_ADMIN` peut créer une offre.
- [ ] Le champ `posted_by` est correctement assigné à l'admin créateur.
- [ ] La liste (`GET /api/jobs/`) renvoie les offres triées par date de création (décroissant).
