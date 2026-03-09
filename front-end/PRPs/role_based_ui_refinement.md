# Role-Based UI Refinement PRP

## Goal
Refine the front-end user experience by implementing granular role-based access control (RBAC) across the Sidebar, Job List, and Event List components using the `AuthService`.

## Why
To ensure that users only see actions and content relevant to their roles (MEMBER vs ADMIN/SUPER_ADMIN), improving clarity and security of the user interface.

## What
- **Sidebar**:
    - "Tableau de bord" visible ONLY to `ADMIN` and `SUPER_ADMIN`.
    - "Emplois", "Événements", "Annuaire", "Mon profil" always visible for authenticated users.
- **Job List (`JobListComponent`)**:
    - "Publier une offre" button visible ONLY to `ADMIN` and `SUPER_ADMIN`.
    - "Postuler" button visible ONLY to `MEMBER`.
    - "Services Carrière" sidebar section visible ONLY to `MEMBER`.
- **Event List (`EventListComponent`)**:
    - "Proposer un événement" button visible ONLY to `ADMIN` and `SUPER_ADMIN`.
    - "S'inscrire" button visible ONLY to `MEMBER`.

## Technical Context

### Files to Reference (read-only)
- `front-end/src/app/core/models/user.model.ts`: `UserRole` and `User` definitions.
- `front-end/src/app/core/auth/auth.service.ts`: Existing `isAdmin` and `isAuthenticated` signals.

### Files to Implement/Modify
- `front-end/src/app/core/auth/auth.service.ts`: Add `isMember` signal/computed.
- `front-end/src/app/shared/components/layout/sidebar.component.ts`: Refine conditional rendering for "Tableau de bord".
- `front-end/src/app/features/jobs/job-list/job-list.component.ts`: Add `isMember` check and wrap UI elements in `@if` blocks.
- `front-end/src/app/features/events/event-list/event-list.component.ts`: Inject `AuthService`, add role signals, and wrap UI elements in `@if` blocks.

### Existing Patterns to Follow
- Use Angular's `@if` control flow for conditional rendering.
- Inject `AuthService` and use its computed signals (`isAdmin`, `isMember`).
- Maintain the existing Glassmorphism / Tailwind styling.

## Implementation Details

### AuthService Update
Add a new computed signal:
```typescript
isMember = computed(() => this._user()?.role === 'MEMBER');
```

### Component Logic Updates
- Ensure `AuthService` is injected in `JobListComponent`, `EventListComponent`, and `SidebarComponent`.
- Expose the necessary role signals to the template.

## Validation Criteria

### Functional Requirements
- [ ] Logged as **MEMBER**:
    - [ ] "Tableau de bord" is NOT visible in sidebar.
    - [ ] "Publier une offre" is NOT visible in Jobs.
    - [ ] "Postuler" IS visible in Jobs.
    - [ ] "Services Carrière" IS visible in Jobs sidebar.
    - [ ] "Proposer un événement" is NOT visible in Events.
    - [ ] "S'inscrire" IS visible in Events.
- [ ] Logged as **ADMIN/SUPER_ADMIN**:
    - [ ] "Tableau de bord" IS visible in sidebar.
    - [ ] "Publier une offre" IS visible in Jobs.
    - [ ] "Postuler" is NOT visible in Jobs.
    - [ ] "Services Carrière" is NOT visible in Jobs sidebar.
    - [ ] "Proposer un événement" IS visible in Events.
    - [ ] "S'inscrire" is NOT visible in Events.

### Technical Requirements
- [ ] No TypeScript errors.
- [ ] No linting warnings.
- [ ] Application builds successfully via Docker.

### Testing Steps
1. Log in as a Member and verify all visibility rules.
2. Log out and log in as an Admin.
3. Verify all visibility rules for Admin.
4. Verify the Sidebar layout remains consistent in both collapsed and expanded states.
