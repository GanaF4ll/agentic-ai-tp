# Job Posting Feature - Front-end PRP

## Goal
Fournir une interface moderne et intuitive pour la gestion des offres d'emploi, avec un formulaire de création dédié aux administrateurs.

## Why
Permettre aux administrateurs et super-administrateurs de contribuer activement à la valeur du réseau en publiant des offres d'emploi exclusives.

## What
- **Interface de Liste (`JobListComponent`)**: 
    - Récupérer les données réelles via l'API.
    - Afficher/Masquer le bouton "Publier une offre" selon le rôle de l'utilisateur connecté (`ADMIN` ou `SUPER_ADMIN`).
- **Interface de Création (`JobCreateComponent`)**:
    - Nouveau formulaire réactif (ReactiveForm) pour les offres.
    - Champs requis : Titre, Entreprise, Type de contrat (CDI, CDD, etc.), Localisation, Description.
- **Accès**: 
    - Seuls les administrateurs et super-administrateurs peuvent accéder à la route de création.

## Technical Context

### Files to Reference
- `front-end/src/app/core/models/business.model.ts`: `JobOffer` interface.
- `front-end/src/app/core/auth/auth.service.ts`: Pour vérifier le rôle de l'utilisateur.
- `front-end/src/app/features/jobs/job-list/job-list.component.ts`: Point de départ actuel avec données statiques.

### Files to Implement/Modify
- `front-end/src/app/core/services/job.service.ts`: (Nouveau) Service pour `getAll`, `getById`, `create`.
- `front-end/src/app/features/admin/job-management/job-create.component.ts`: (Nouveau) Formulaire de création.
- `front-end/src/app/features/jobs/job-list/job-list.component.ts`: Modifier pour injecter `JobService` et `AuthService`.
- `front-end/src/app/app.routes.ts`: Ajouter la route `/admin/jobs/create` protégée par rôle.

## Implementation Details
- **UI/UX**: Utiliser le design system existant (Glassmorphism, Tailwind, Lucide-Angular).
- **Validation**: Formulaire avec `Validators.required`.
- **Navigation**: Après création, rediriger vers la liste des jobs avec un toast de succès (si disponible).

## Validation Criteria
- [ ] Le bouton "Publier une offre" n'apparaît pas pour les comptes `MEMBER`.
- [ ] Les `ADMIN` et `SUPER_ADMIN` peuvent naviguer vers le formulaire.
- [ ] Le formulaire de création envoie les bonnes données à l'API.
- [ ] La liste se met à jour dynamiquement après une création.
- [ ] Aucune erreur TypeScript dans les composants.
