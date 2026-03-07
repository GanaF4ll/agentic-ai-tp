# Système d'Authentification & Gestion des Accès (v3) PRP

## Goal
Implémenter un système d'authentification robuste incluant un workflow d'invitation par Super-Admin, une gestion fine des rôles (MEMBER, ADMIN, SUPER_ADMIN) et un processus de changement de mot de passe obligatoire lors de la première connexion.

## Why
Pour sécuriser la plateforme AlumniConnect et permettre aux administrateurs de gérer l'onboarding des nouveaux membres de manière contrôlée et sécurisée, tout en respectant les standards de sécurité (mots de passe temporaires expirent après usage).

## What
- **Authentification JWT** : Connexion via email/password.
- **Gestion des Rôles** : Accès restreint selon le rôle (`SUPER_ADMIN` pour la gestion des utilisateurs, `ADMIN` pour le dashboard, `MEMBER` pour l'espace alumni).
- **Workflow d'Invitation** :
    - Le Super-Admin crée un utilisateur avec un email et un rôle.
    - Un mot de passe temporaire est généré (côté serveur).
    - L'utilisateur reçoit une invitation (simulation de mail).
- **Force Password Change** : Si `must_change_password` est à `true`, l'utilisateur est redirigé vers un écran de changement de mot de passe obligatoire.
- **Sécurité** : Interception des accès non autorisés et gestion de l'expiration des tokens.

## Technical Context

### Files to Reference (read-only)
- `src/app/core/auth/auth.service.ts` - Logique d'auth actuelle (à étendre).
- `src/app/core/auth/auth.guard.ts` - Protection des routes actuelle.
- `src/app/core/models/user.model.ts` - Modèle utilisateur actuel (à modifier).
- `src/app/features/auth/login/login.component.ts` - Écran de login existant.
- `src/app/app.routes.ts` - Configuration des routes.

### Files to Implement/Modify
- `src/app/core/models/user.model.ts` - Ajouter `must_change_password: boolean` et `status: 'PENDING' | 'ACTIVE'`.
- `src/app/core/auth/auth.service.ts` - Ajouter la logique de détection `must_change_password` après login.
- `src/app/core/auth/auth.guard.ts` - Ajouter une vérification pour forcer la redirection vers `/reset-password`.
- `src/app/features/auth/reset-password/reset-password.component.ts` - Nouveau composant pour le changement de mot de passe obligatoire.
- `src/app/features/admin/user-management/user-list.component.ts` - Nouveau composant pour la gestion des utilisateurs par le Super-Admin.
- `src/app/features/admin/user-management/user-create.component.ts` - Nouveau composant pour inviter un utilisateur.

### Existing Patterns to Follow
- Utilisation de **Signals** pour l'état de l'utilisateur (`AuthService`).
- **Reactive Forms** pour tous les formulaires.
- **DaisyUI** pour le styling des composants.
- **HTTP Resource** (Angular 20+) pour les appels API si applicable, ou `HttpClient`.

## Implementation Details

### API/Endpoints
- `POST /api/auth/login/` : `{ email, password }` -> `{ access, refresh, user }`.
- `POST /api/auth/reset-password/` : `{ current_password, new_password }`.
- `POST /api/users/create/` : `{ email, role, first_name, last_name }` (Super-Admin uniquement).
- `GET /api/users/` : Liste des utilisateurs (Super-Admin uniquement).

### Database Changes (Simulated via Models)
- `User` model doit inclure :
  ```typescript
  export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN';
    must_change_password: boolean;
    status: 'PENDING' | 'ACTIVE';
  }
  ```

### Components
- **ResetPasswordComponent** : Formulaire avec validation de complexité de mot de passe.
- **UserCreateComponent** : Modal ou page permettant de saisir les infos de base d'un nouvel utilisateur.
- **UserListComponent** : Tableau avec filtres par rôle et statut (Validé / En attente).

## Validation Criteria

### Functional Requirements
- [ ] Le Super-Admin peut créer un nouvel utilisateur.
- [ ] L'utilisateur invité ne peut pas accéder au dashboard sans changer son mot de passe.
- [ ] Une fois le mot de passe changé, `must_change_password` devient `false` et l'accès est libéré.
- [ ] Un simple `ADMIN` ne peut pas accéder à la liste des utilisateurs.
- [ ] Redirection automatique vers `/login` si non authentifié.

### Technical Requirements
- [ ] TypeScript compile sans erreurs.
- [ ] L'état global de l'utilisateur est géré via Signals.
- [ ] Les formulaires affichent des messages d'erreur explicites.
- [ ] Utilisation de `@defer` pour le chargement des composants admin lourds.

### Testing Steps
1. Se connecter avec un compte Super-Admin.
2. Créer un utilisateur "Test Member".
3. Se déconnecter.
4. Se connecter avec les identifiants de "Test Member".
5. Vérifier la redirection forcée vers `/reset-password`.
6. Changer le mot de passe et vérifier l'accès à `/alumni`.
