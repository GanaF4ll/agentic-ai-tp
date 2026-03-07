# AlumniConnect Front-end Implementation PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable **Super Admins**, **Admins**, and **Members** to manage profiles, search the alumni directory, post jobs, and coordinate events through a modern, responsive Angular 21 application.

## Why

**Business Justification:**
- **Students/Alumni:** Benefit from a professional network and job opportunities.
- **School Admins:** Gain a central tool to track alumni and manage the school's professional ecosystem.
- **Problem Solved:** Centralizes fragmented alumni data and automates profile enrichment via LinkedIn scraping integration.

**Priority:** High

## What

### Feature Description
A comprehensive SPA (Single Page Application) for the AlumniConnect platform.

### Scope
**In Scope:**
- **Core Infrastructure:** JWT Auth, HTTP Interceptors, Role-based Routing (Angular 21 Signals).
- **Authentication:** Login, Registration, Password reset.
- **Alumni Directory:** Advanced search, filtering by year/degree, profile detail view.
- **Profile Management:** Edit profile (Members), Verify/Validate profiles (Admins).
- **Job Board:** CRUD for job offers (Admins/Verified Members).
- **Events:** Calendar view and registration.
- **Admin Dashboard:** Stats, profile validation queue, scraping logs.

**Out of Scope:**
- Social Login (to be implemented in v2).
- Real-time chat (planned for v3).
- Mobile Native App (Responsive web only).

### User Stories
1. As a **Member**, I want to search for alumni by graduation year so that I can reconnect with my cohort.
2. As an **Admin**, I want to validate "DRAFT" profiles imported from scraping so that the directory stays accurate.
3. As a **Super Admin**, I want to manage user roles and permissions so that I can control platform access.
4. As a **Member**, I want to post a job offer so that I can recruit from my school's network.

## Technical Context

### Files to Reference (Read-Only)
These files provide context and patterns to follow:

| File | Purpose |
|------|---------|
| `ai_docs/architecture.md` | General tech stack and monorepo structure. |
| `ai_docs/components.md` | DaisyUI component patterns and usage. |
| `ai_docs/patterns.md` | Backend API patterns and Angular best practices. |
| `back-end/config/urls.py` | API endpoint structure. |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front-end/src/app/app.routes.ts` | MODIFY | Define lazy-loaded routes for features. |
| `front-end/src/app/core/auth/auth.service.ts` | CREATE | Manage JWT and user signals. |
| `front-end/src/app/core/auth/jwt.interceptor.ts` | CREATE | Inject Bearer token into HTTP requests. |
| `front-end/src/app/features/auth/login/login.component.ts` | CREATE | Login page. |
| `front-end/src/app/features/alumni/alumni-list/alumni-list.component.ts` | CREATE | Directory list view with filters. |
| `front-end/src/app/features/admin/dashboard/dashboard.component.ts` | CREATE | Admin stats and validation queue. |

### Existing Patterns to Follow

**Angular 21 Signal-based Service:**
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  user = this._user.asReadonly();
  
  isAdmin = computed(() => this._user()?.role === 'ADMIN' || this._user()?.role === 'SUPER_ADMIN');
  
  login(credentials: LoginCredentials) {
    // ... http call then this._user.set(data.user)
  }
}
```

**DaisyUI Card Component:**
```html
<div class="card bg-base-100 shadow-xl border border-base-300">
  <div class="card-body">
    <h2 class="card-title text-primary">{{ title }}</h2>
    <p>{{ description }}</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary btn-sm">Action</button>
    </div>
  </div>
</div>
```

### Dependencies
- `tailwindcss` ^4.1.12
- `daisyui` ^5.0.0 (to be added/configured)
- `@angular/common/http`
- `lucide-angular` (for icons)

## Implementation Details

### API Endpoints (from Django Backend)

#### `POST /api/auth/login/`
**Purpose:** Authenticate and get JWT.

#### `GET /api/alumni/profiles/`
**Purpose:** List alumni with search/filter support.
**Params:** `search`, `graduation_year`, `degree`.

#### `POST /api/alumni/profiles/{id}/validate/`
**Purpose:** Transition profile from DRAFT to VERIFIED.
**Auth:** Admin or Super Admin.

### Components

| Component | Location | Props |
|-----------|----------|-------|
| `Navbar` | `shared/components/layout/` | None |
| `AlumniCard` | `shared/components/alumni/` | `alumni: Profile` |
| `ProfileForm` | `shared/components/forms/` | `initialValue: Profile` |

## Validation Criteria

### Functional Requirements
- [ ] Users can login and are redirected to their dashboard.
- [ ] Members can only edit their own profile.
- [ ] Admins see the "Validate" button on Draft profiles, Members don't.
- [ ] Search results update dynamically as filters change (using Signals).
- [ ] Navigation adapts based on the user's role.

### Technical Requirements
- [ ] TypeScript compiles without errors (`npm run build`).
- [ ] No manual `subscribe()` in templates; use `async` pipe or `toSignal`.
- [ ] All components are `standalone: true`.
- [ ] Responsive design works from mobile (375px) to desktop (1440px).
- [ ] Loading states shown during API calls (DaisyUI skeletons).

### Testing Steps
1. **Auth Flow:** Login as Member -> Verify redirection to `/alumni`. Logout -> Verify redirection to `/login`.
2. **Permissions:** Login as Member -> Try to access `/admin` -> Verify 403 or redirect to Home.
3. **Filtering:** Go to `/alumni` -> Type "2024" in year filter -> Verify list updates.
4. **Scraping Validation:** Login as Admin -> Click "Validate" on a Draft profile -> Verify status changes to "Verified".

---

**Created:** 2026-02-19
**Status:** Draft
