# Admin Onboarding Flow PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable Superadmins to securely invite new Administrators by creating their accounts with a temporary password and forcing a password change on their first login.

## Why

**Business Justification:**

- Decentralize platform management by allowing the Superadmin to delegate tasks to new Admins.
- Ensure security by forcing users to set their own secret passwords immediately after invitation.
- Streamline the onboarding process for school staff and platform moderators.

**Priority:** High

## What

### Feature Description

The feature implements a secure "Invite-Only" onboarding flow for Administrators:

1. **Creation:** A Superadmin creates an Admin account (email + temporary password) via a secure endpoint.
2. **Notification:** The system sends an automated email to the new Admin with login instructions.
3. **Onboarding:** Upon first login, the JWT payload contains `must_change_password: true` — the client must call `POST /api/auth/change-password/` before any other action.
4. **Activation:** Once the password is changed, the flag is cleared and the Admin gains full access.

### Scope

**In Scope:**

- `must_change_password` field on User model + migration.
- `POST /api/auth/admins/invite/` endpoint (SuperAdmin only).
- `POST /api/auth/change-password/` endpoint (authenticated user).
- `CustomTokenObtainPairSerializer` updated to include `must_change_password` in JWT payload.
- Email invitation (Console backend for dev, SMTP config for prod).

**Out of Scope:**

- Frontend Angular (separate PRP).
- Advanced HTML email templating.
- Invitation link expiration / token-based flow (deferred — see `admin_provisioning_invitation.md`).
- Resending invitations.

### User Stories

1.  **As a Superadmin**, I want to invite a colleague by email so they can help manage the platform.
2.  **As a new Admin**, I want to receive my credentials by email so I can access the system.
3.  **As a new Admin**, I want to be forced to change my temporary password on first login to ensure my account is secure.
4.  **As a Superadmin**, I want to ensure that only I can create new Admin accounts.

## Technical Context

### Files to Reference (Read-Only)

| File                               | Purpose                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `back-end/accounts/models.py`      | Existing User model (`CustomUserManager`, `Role`, `USERNAME_FIELD = 'email'`). |
| `back-end/accounts/permissions.py` | `IsSuperAdmin`, `IsAdmin` classes.                                             |
| `back-end/accounts/serializers.py` | `CustomTokenObtainPairSerializer` (to modify).                                 |
| `back-end/accounts/views.py`       | `CustomTokenObtainPairView`, `MeView` (patterns to follow).                    |
| `back-end/accounts/urls.py`        | Existing prefix: `/api/auth/` — new endpoints must follow this prefix.         |
| `ai_docs/architecture.md`          | Tech stack and backend design patterns (Service Layer, Permission Classes).    |

### Files to Implement/Modify

| File                                         | Action | Description                                                                                                                                   |
| -------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `back-end/accounts/models.py`                | MODIFY | Add `must_change_password = models.BooleanField(default=False)`.                                                                              |
| `back-end/accounts/serializers.py`           | MODIFY | Add `InviteAdminSerializer`, `ChangePasswordSerializer`. Update `CustomTokenObtainPairSerializer` to include `must_change_password` in token. |
| `back-end/accounts/views.py`                 | MODIFY | Add `InviteAdminView`, `ChangePasswordView`.                                                                                                  |
| `back-end/accounts/urls.py`                  | MODIFY | Register `admins/invite/` and `change-password/` under the existing `/api/auth/` prefix.                                                      |
| `back-end/config/settings.py`                | MODIFY | Add `EMAIL_BACKEND`, `DEFAULT_FROM_EMAIL`, `FRONTEND_URL`.                                                                                    |
| `back-end/accounts/tests/test_onboarding.py` | CREATE | pytest tests for invitation and password change flows.                                                                                        |

### Existing Patterns to Follow

- Use `IsSuperAdmin` permission for the invitation endpoint (defined in `accounts/permissions.py`).
- Use `CustomUserManager.create_user()` — **never assign password directly, always use `set_password()`**.
- Follow the Service Layer Pattern from `ai_docs/architecture.md` — extract email sending logic into `accounts/services.py`.
- Use `factory-boy` fixtures (`SuperAdminFactory`, `UserFactory`) in pytest tests.

## Implementation Details

### ⚠️ Migration Required

Adding `must_change_password` requires a new migration:

```bash
docker compose exec back-end python manage.py makemigrations accounts
docker compose exec back-end python manage.py migrate
```

### Model Update

```python
# back-end/accounts/models.py
class User(AbstractUser):
    # ... existing fields ...
    must_change_password = models.BooleanField(default=False)
```

### JWT Payload Update

The `CustomTokenObtainPairSerializer` must propagate the flag to the frontend via the token:

```python
# back-end/accounts/serializers.py
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['must_change_password'] = user.must_change_password  # ADD THIS
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
```

### API Endpoints

#### `POST /api/auth/admins/invite/`

**Purpose:** Create a new Admin account and send an invitation email.
**Auth:** `IsSuperAdmin`
**Request Body:**

```json
{
  "email": "admin@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "temporary_password": "TempP@ss123!"
}
```

**Response:** `201 Created`

> ⚠️ **Implementation note:** Use `user.set_password(temporary_password)` — never `user.password = ...`. Set `must_change_password=True` and `role=Role.ADMIN` at creation.

#### `POST /api/auth/change-password/`

**Purpose:** Force a password change and clear the `must_change_password` flag.
**Auth:** `IsAuthenticated`
**Request Body:**

```json
{
  "new_password": "newSecurePassword456!",
  "confirm_password": "newSecurePassword456!"
}
```

**Response:** `200 OK`

### Email (Console backend for dev)

```python
# back-end/config/settings.py
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # dev
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'  # prod
DEFAULT_FROM_EMAIL = 'noreply@alumniconnect.fr'
FRONTEND_URL = 'http://localhost:4200'  # override in prod via env var
```

### Database Changes

- **Table:** `accounts_user`
- **New Field:** `must_change_password` (BOOLEAN, default FALSE)
- **Set to `True`:** in `InviteAdminView` at account creation.
- **Set to `False`:** in `ChangePasswordView` after successful password update.

## Validation Criteria

### Functional Requirements

- [ ] Only Superadmins can access `POST /api/auth/admins/invite/`.
- [ ] An invitation email is logged to console (dev) or sent via SMTP (prod) on account creation.
- [ ] The JWT access token includes `must_change_password: true` for newly invited Admins.
- [ ] `POST /api/auth/change-password/` sets `must_change_password` to `False`.
- [ ] The new password passes Django's default password validators.
- [ ] A Member or Admin cannot access `POST /api/auth/admins/invite/` (403).

### Technical Requirements

- [ ] `makemigrations` and `migrate` run without errors.
- [ ] `CustomTokenObtainPairSerializer` includes `must_change_password` in token claims.
- [ ] `InviteAdminView` uses `set_password()`, not direct assignment.
- [ ] Unit tests pass: `pytest accounts/tests/test_onboarding.py -v`.

### Testing Steps

1. Log in as a Superadmin → get JWT → verify `must_change_password: false` in token.
2. `POST /api/auth/admins/invite/` with a new email → `201 Created` + email logged in console.
3. Log in as the new Admin with the temporary password → verify JWT contains `must_change_password: true`.
4. `POST /api/auth/change-password/` with a new secure password → `200 OK`.
5. Log in again as the Admin → verify JWT now contains `must_change_password: false`.
6. Attempt `POST /api/auth/admins/invite/` as an Admin (not Superadmin) → `403 Forbidden`.

---

**Created:** 2026-02-20
**Last Reviewed:** 2026-02-20
**Status:** Corrected
