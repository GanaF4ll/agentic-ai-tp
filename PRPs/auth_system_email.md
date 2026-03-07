# Auth System Email Migration PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Migrate the default authentication system to use **EMAIL** as the unique identifier (instead of username) and implement JWT-based authentication for SuperAdmins and Administrators.

## Why

**Business Justification:**

- **Security & UX:** Email is a more standard and reliable unique identifier for professional platforms.
- **Admin Control:** Ensures that only verified administrative emails can access sensitive backoffice areas.
- **Modern Standards:** Aligns the backend with modern SPA (Angular) authentication flows using stateless JWT.

**Priority:** High

## What

### Feature Description

The project currently uses Django's default `username` for authentication. This feature will switch the `USERNAME_FIELD` to `email` in the custom `User` model, configure Django REST Framework to use SimpleJWT, and implement custom permissions for administrative roles.

### Scope

**In Scope:**

- Modification of `accounts.User` model (email as `USERNAME_FIELD`, `unique=True`).
- Addition of a `CustomUserManager` to override `create_user` and `create_superuser` (mandatory when `USERNAME_FIELD = 'email'`).
- Configuration of `djangorestframework-simplejwt` in `settings.py` and `INSTALLED_APPS`.
- Implementation of `LoginSerializer` and `TokenObtainPairView` customization.
- Creation of custom permission classes (`IsSuperAdmin`, `IsAdmin`).
- URL routing for `/api/auth/login/` and `/api/auth/token/refresh/`.
- Data migration note: existing users seeded with `username` must be updated (see Migration Warning below).

**Out of Scope:**

- Frontend Angular implementation (handled in a separate PRP).
- Social login integration (Google/LinkedIn) at this stage.
- Password reset email flow (deferred).

### User Stories

1. As an Administrator, I want to log in using my email and password so that I can access the management dashboard.
2. As a SuperAdmin, I want my access to be restricted to an email-based JWT token to ensure secure communication with the API.
3. As the system, I want to reject any login attempt that doesn't provide a valid, registered administrative email.

## Technical Context

### Files to Reference (Read-Only)

These files provide context and patterns to follow:

| File                          | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `back-end/accounts/models.py` | Current User model implementation. |
| `ai_docs/architecture.md`     | Tech stack and auth flow overview. |
| `back-end/config/settings.py` | Current Django configuration.      |

### Files to Implement/Modify

| File                               | Action | Description                                                                                      |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| `back-end/accounts/models.py`      | MODIFY | Set `email` as `USERNAME_FIELD`, add `CustomUserManager`, update `__str__`.                      |
| `back-end/accounts/serializers.py` | CREATE | JWT and User serializers.                                                                        |
| `back-end/accounts/views.py`       | CREATE | Auth views (Login, Me).                                                                          |
| `back-end/accounts/permissions.py` | CREATE | `IsSuperAdmin`, `IsAdmin` classes.                                                               |
| `back-end/accounts/urls.py`        | CREATE | Auth endpoints.                                                                                  |
| `back-end/config/urls.py`          | MODIFY | Add `include()` import and include `accounts.urls` under `api/auth/`.                            |
| `back-end/config/settings.py`      | MODIFY | Add `rest_framework_simplejwt` to `INSTALLED_APPS`, configure `REST_FRAMEWORK` and `SIMPLE_JWT`. |
| `back-end/requirements.txt`        | MODIFY | Add `djangorestframework-simplejwt>=5.3,<5.4`.                                                   |

### Existing Patterns to Follow

The project uses `Role` TextChoices in `accounts.models`:

```python
class Role(models.TextChoices):
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Administrateur'
    ADMIN = 'ADMIN', 'Administrateur'
    MEMBER = 'MEMBER', 'Membre (Alumni)'
```

## Implementation Details

### ⚠️ Critical: CustomUserManager (MISSING from original PRP)

When overriding `USERNAME_FIELD`, Django requires a custom manager. Without it, `createsuperuser` and `create_user` will break.

```python
# back-end/accounts/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', Role.SUPER_ADMIN)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None  # Remove username field
    email = models.EmailField(unique=True)  # unified field name (was 'mail' in database.md — use 'email')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    phone = models.CharField(max_length=20, blank=True)
    is_profile_public = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # email is already USERNAME_FIELD

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"  # Fixed: was using self.username
```

> **Note on field name:** `database.md` uses `mail` but the actual `models.py` and standard Django convention use `email`. This PRP enforces `email` as the canonical name.

### settings.py additions

```python
INSTALLED_APPS = [
    # ... existing apps ...
    'rest_framework',
    'rest_framework_simplejwt',  # ADD THIS — was missing
    'corsheaders',
    # ...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### config/urls.py fix

```python
# BEFORE (missing include):
from django.urls import path

# AFTER (corrected):
from django.urls import path, include  # ADD include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),  # ADD THIS
]
```

### API Endpoints

#### `POST /api/auth/login/`

**Purpose:** Authenticate user and return JWT tokens.

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

**Auth:** None (Public)

#### `POST /api/auth/token/refresh/`

**Purpose:** Refresh the access token using the refresh token.
**Auth:** None (Public)

#### `GET /api/auth/me/`

**Purpose:** Get current authenticated user details.
**Auth:** `IsAuthenticated`

### Database Schema

**Modifications to `accounts_user` table:**

- `username`: **REMOVED** (set to `None` in model)
- `email`: `VARCHAR(254) UNIQUE NOT NULL` — becomes the login identifier
- `USERNAME_FIELD` set to `email`
- `REQUIRED_FIELDS` set to `[]`

> **⚠️ Migration Warning:** If the database already contains seeded users (via `seed_db.py`), you must run `flush` before migrating, or write a data migration to backfill `email` values from existing users. The `makemigrations` step will generate a migration that removes the `username` column.

```bash
# Recommended reset flow before migrating:
docker compose exec back-end python manage.py flush --noinput
docker compose exec back-end python manage.py makemigrations accounts
docker compose exec back-end python manage.py migrate
docker compose exec back-end python manage.py createsuperuser
```

## Validation Criteria

### Functional Requirements

- [ ] Users can no longer log in with a `username`.
- [ ] Only `email` + `password` works for authentication.
- [ ] `IsSuperAdmin` permission correctly blocks non-superadmins from specific views.
- [ ] JWT tokens are valid and can be refreshed via `/api/auth/token/refresh/`.

### Technical Requirements

- [ ] `makemigrations` and `migrate` run without errors.
- [ ] `rest_framework_simplejwt` present in `INSTALLED_APPS` and `requirements.txt`.
- [ ] `include()` correctly imported in `config/urls.py`.
- [ ] `CustomUserManager` is set as `objects` on the `User` model.
- [ ] `accounts.User.__str__` returns the email, not the username.

### Security Checklist

- [ ] Emails are stored as unique and normalized via `BaseUserManager.normalize_email()`.
- [ ] JWT `SECRET_KEY` uses Django's `SECRET_KEY`.
- [ ] No sensitive data (passwords) returned in User serializers.

### Testing Steps

1. Attempt login with `username` field: should fail with 400.
2. Login with `email` + `password`: should return `access` and `refresh` tokens.
3. Access `/api/auth/me/` with a valid `Bearer` token: should return user info.
4. Access a SuperAdmin-only endpoint with a Member token: should return `403 Forbidden`.
5. Run `python manage.py createsuperuser`: should prompt for email only (not username).

---

**Created:** 2026-02-20
**Last Reviewed:** 2026-02-20
**Status:** Ready (Corrected)
