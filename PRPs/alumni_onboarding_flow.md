# Alumni Member Onboarding Flow PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable Superadmins and Admins to securely invite new Alumni Members by creating their accounts with a temporary password and forcing a password change on their first login.

## Why

**Business Justification:**

- Streamline the population of the alumni network by allowing staff to invite members.
- Ensure security by forcing members to set their own secret passwords immediately after invitation.
- Maintain a secure, invite-only community for the school's alumni.

**Priority:** High

## What

### Feature Description

The feature implements a secure "Invite-Only" onboarding flow for Alumni Members:

1. **Creation:** A Superadmin or Admin creates a Member account (email + temporary password).
2. **Notification:** The system sends an automated email to the new Member with login instructions.
3. **Onboarding:** Upon first login, the JWT payload contains `must_change_password: true` — the client must call `POST /api/auth/change-password/` before any other action.
4. **Activation:** Once the password is changed, the flag is cleared and the Member gains access to the networking features.

### Scope

**In Scope:**

- Refactoring `InviteAdminSerializer` → generic `InviteUserSerializer` (DRY, role via context).
- New `InviteMemberView` with `IsAdmin` permission.
- New endpoint `POST /api/auth/members/invite/`.
- Update `send_invitation_email()` to accept a `role` parameter for message adaptation.
- Reusing the existing `must_change_password` flag and `ChangePasswordView`.
- `validate_password` on `temporary_password` field.
- Unit tests for the member invitation flow.

**Out of Scope:**

- Frontend Angular (separate PRP).
- Bulk invitation (import via CSV).
- Advanced email personalization beyond basic fields.
- Public registration (this flow is strictly invite-only).

### User Stories

1. **As an Admin**, I want to invite an alumnus by email so they can join the networking platform.
2. **As a new Alumnus**, I want to receive my credentials by email so I can access the system.
3. **As a new Alumnus**, I want to be forced to change my temporary password on first login to ensure my account is secure.
4. **As a Superadmin**, I want to ensure that only authorized staff can create new Member accounts.

## Technical Context

### Files to Reference (Read-Only)

| File                               | Purpose                                                   |
| ---------------------------------- | --------------------------------------------------------- |
| `back-end/accounts/models.py`      | User model with `must_change_password` and `Role.MEMBER`. |
| `back-end/accounts/permissions.py` | `IsAdmin` and `IsSuperAdmin` permission classes.          |

### Files to Implement/Modify

| File                                         | Action | Description                                                                                                                                                               |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `back-end/accounts/serializers.py`           | MODIFY | Rename `InviteAdminSerializer` → `InviteUserSerializer` with role via context. Add `validate_password` on `temporary_password`.                                           |
| `back-end/accounts/views.py`                 | MODIFY | Refactor `InviteAdminView` to use `InviteUserSerializer`. Create `InviteMemberView` with `IsAdmin` permission. Use `serializer.validated_data` instead of `request.data`. |
| `back-end/accounts/urls.py`                  | MODIFY | Register `members/invite/` endpoint.                                                                                                                                      |
| `back-end/accounts/services.py`              | MODIFY | Add `role` parameter to `send_invitation_email()` for message adaptation.                                                                                                 |
| `back-end/accounts/tests/test_onboarding.py` | MODIFY | Add Member invitation tests. Update existing Admin tests for renamed serializer.                                                                                          |

### Existing Patterns to Follow

- Use `IsAdmin` permission for the member invitation endpoint (allows both Superadmins and Admins).
- Use `User.objects.create_user()` passing the `password` directly to avoid redundant hashing.
- Reuse `must_change_password` flag and `ChangePasswordView` — no duplication.
- Use `factory-boy` fixtures (`SuperAdminFactory`, `AdminFactory`, `UserFactory`) in pytest tests.

## Implementation Details

### ⚠️ DRY Refactoring: One Serializer, Two Views

Instead of duplicating `InviteAdminSerializer`, a single `InviteUserSerializer` receives the role via the view's context:

```python
# back-end/accounts/serializers.py
class InviteUserSerializer(serializers.ModelSerializer):
    temporary_password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'temporary_password')

    def create(self, validated_data):
        role = self.context.get('role', Role.MEMBER)
        return User.objects.create_user(
            password=validated_data.pop('temporary_password'),
            role=role,
            must_change_password=True,
            **validated_data
        )
```

```python
# back-end/accounts/views.py
class InviteAdminView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request):
        serializer = InviteUserSerializer(
            data=request.data, context={'role': Role.ADMIN}
        )
        if serializer.is_valid():
            user = serializer.save()
            send_invitation_email(user, serializer.validated_data.get('temporary_password', ''), role='admin')
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InviteMemberView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = InviteUserSerializer(
            data=request.data, context={'role': Role.MEMBER}
        )
        if serializer.is_valid():
            user = serializer.save()
            send_invitation_email(user, serializer.validated_data.get('temporary_password', ''), role='member')
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

> ⚠️ **Note:** `serializer.validated_data` ne contient plus `temporary_password` après `save()` car il est `.pop()` dans `create()`. Il faut capturer le mot de passe **avant** l'appel à `save()`.

### Corrected View Pattern

```python
def post(self, request):
    serializer = InviteUserSerializer(data=request.data, context={'role': Role.ADMIN})
    if serializer.is_valid():
        temporary_password = serializer.validated_data['temporary_password']
        user = serializer.save()
        send_invitation_email(user, temporary_password, role='admin')
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### Email Service Update

```python
# back-end/accounts/services.py
def send_invitation_email(user, temporary_password, role='member'):
    role_label = 'administrateur' if role == 'admin' else 'membre alumni'
    subject = "Invitation à rejoindre AlumniConnect"
    message = f"""Bonjour {user.first_name},

Vous avez été invité à rejoindre la plateforme AlumniConnect en tant que {role_label}.

Voici vos identifiants de connexion temporaires :
Email : {user.email}
Mot de passe temporaire : {temporary_password}

Veuillez vous connecter à l'adresse suivante : {settings.FRONTEND_URL}/login

Lors de votre première connexion, il vous sera demandé de définir un mot de passe définitif.

L'équipe AlumniConnect
"""
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
```

### API Endpoint

#### `POST /api/auth/members/invite/`

**Purpose:** Create a new Alumni Member account and send an invitation email.
**Auth:** `IsAdmin` (Superadmin or Admin)
**Request Body:**

```json
{
  "email": "alumni@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "temporary_password": "TempP@ss123!"
}
```

**Response:** `201 Created`

## Validation Criteria

### Functional Requirements

- [ ] Only Admins or Superadmins can access `POST /api/auth/members/invite/`.
- [ ] Invited users are assigned `Role.MEMBER`.
- [ ] Invited users have `must_change_password: true` upon creation.
- [ ] Invitation email contains role-adapted message.
- [ ] A `MEMBER` cannot invite other members (403).
- [ ] `temporary_password` is validated against Django password validators.

### Technical Requirements

- [ ] `InviteAdminSerializer` renamed to `InviteUserSerializer` — existing Admin tests still pass.
- [ ] `InviteAdminView` refactored to use `InviteUserSerializer` with `context={'role': Role.ADMIN}`.
- [ ] `send_invitation_email()` accepts `role` parameter.
- [ ] Unit tests pass: `pytest accounts/tests/test_onboarding.py -v`.

### Testing Steps

1. Log in as an **Admin** → `POST /api/auth/members/invite/` → `201 Created`, user role = `MEMBER`.
2. Log in as a **SuperAdmin** → `POST /api/auth/members/invite/` → `201 Created`.
3. Log in as a **Member** → `POST /api/auth/members/invite/` → `403 Forbidden`.
4. Log in as the new Member with temporary password → JWT contains `must_change_password: true`.
5. `POST /api/auth/change-password/` → `200 OK`, flag cleared.
6. Verify `POST /api/auth/admins/invite/` still works (regression test).

---

**Created:** 2026-02-20
**Last Reviewed:** 2026-02-20
**Status:** Corrected (DRY refactoring)
