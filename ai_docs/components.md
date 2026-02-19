# Composants UI AlumniConnect (Angular 21 + DaisyUI)

## Organisation

```
front-end/src/app/
├── core/                    # Services globaux, guards, interceptors
│   ├── auth/                # AuthService, JWT Interceptor
│   ├── guards/              # AuthGuard, RoleGuard
│   └── services/            # ApiService (HttpClient wrapper)
├── shared/                  # Composants réutilisables, pipes, directives
│   ├── components/          # Boutons, modales, cards, pagination
│   ├── pipes/               # DateFr, Truncate, etc.
│   └── directives/          # RoleDirective (*appHasRole)
├── features/                # Modules par fonctionnalité (lazy-loaded)
│   ├── admin/               # Dashboard Admin / Super Admin
│   ├── alumni/              # Annuaire, fiches profils
│   ├── jobs/                # Job Board
│   └── events/              # Événements, calendrier
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

## Composants DaisyUI utilisés

DaisyUI fournit des composants pré-stylés basés sur Tailwind CSS. On utilise directement les classes CSS DaisyUI dans les templates Angular.

| Composant DaisyUI | Classe CSS        | Usage AlumniConnect                      |
| ----------------- | ----------------- | ---------------------------------------- |
| Navbar            | `navbar`          | Navigation principale                    |
| Drawer            | `drawer`          | Sidebar responsive                       |
| Card              | `card`            | Fiches alumni, cartes événements         |
| Modal             | `modal`           | Formulaires, confirmations               |
| Table             | `table`           | Listes alumni, jobs                      |
| Badge             | `badge`           | Statuts (DRAFT, VERIFIED, ADMIN)         |
| Avatar            | `avatar`          | Photo profil alumni                      |
| Tabs              | `tabs`            | Navigation interne (profil, expériences) |
| Pagination        | `join` + `btn`    | Pagination annuaire                      |
| Dropdown          | `dropdown`        | Menus contextuels                        |
| Toast             | `toast` + `alert` | Notifications feedback                   |
| Stats             | `stats`           | KPIs dashboard admin                     |
| Timeline          | `timeline`        | Parcours professionnel alumni            |

## Exemple — Card Alumni

```html
<div class="card bg-base-100 shadow-xl">
  <figure>
    <div class="avatar placeholder">
      <div class="bg-neutral text-neutral-content w-24 rounded-full">
        <span class="text-3xl">{{ alumni.first_name[0] }}</span>
      </div>
    </div>
  </figure>
  <div class="card-body">
    <h2 class="card-title">
      {{ alumni.full_name }}
      <div class="badge badge-secondary">{{ alumni.graduation_year }}</div>
    </h2>
    <p>{{ alumni.current_job }}</p>
    <div class="card-actions justify-end">
      <div class="badge badge-outline">{{ alumni.degree }}</div>
    </div>
  </div>
</div>
```

## Exemple — Navbar avec rôles

```html
<div class="navbar bg-base-100">
  <div class="flex-1">
    <a class="btn btn-ghost text-xl">AlumniConnect</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      <li><a routerLink="/alumni">Annuaire</a></li>
      <li><a routerLink="/jobs">Jobs</a></li>
      <li><a routerLink="/events">Événements</a></li>
      @if (authService.isAdmin()) {
      <li><a routerLink="/admin">Admin</a></li>
      }
    </ul>
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
        <div class="w-10 rounded-full">
          <img [src]="authService.user()?.avatar_url" alt="avatar" />
        </div>
      </div>
      <ul
        tabindex="0"
        class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow"
      >
        <li><a routerLink="/alumni/me">Mon Profil</a></li>
        <li><a (click)="authService.logout()">Déconnexion</a></li>
      </ul>
    </div>
  </div>
</div>
```

## Conventions Angular 21

1. **Standalone Components** : Tous les composants sont `standalone: true` (défaut Angular 21).
2. **Signals** : Utiliser `signal()`, `computed()` et `effect()` pour la réactivité.
3. **Control Flow** : Utiliser `@if`, `@for`, `@switch` (nouvelle syntaxe Angular 21).
4. **DaisyUI Themes** : Configurer le thème via `data-theme` sur `<html>` dans `index.html`.
5. **Imports** : Importer `RouterLink`, `CommonModule`, `ReactiveFormsModule` dans chaque composant.
6. **Lazy Loading** : Chaque feature est chargée à la demande via `loadChildren` dans `app.routes.ts`.
