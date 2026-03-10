# Admin Creation with Temporary Password PRP

## Goal
Implement a `POST /api/auth/admins/` endpoint for SuperAdmins to create new Admin accounts. The system will generate a temporary password, send it via email, and force the new Admin to change it upon their first login.

## Why
**Business Justification:**
- **Security:** Simplifies the onboarding of new administrators while ensuring they use unique, private credentials from the start.
- **Workflow Efficiency:** Allows SuperAdmins to delegate administrative tasks quickly without manual password sharing.
- **Compliance:** Enforces password rotation immediately after account creation.

## What
### Feature Description
SuperAdmins can create new Admin users by providing their email, first name, and last name. The system handles the rest: setting roles, generating secure temporary passwords, and managing the "must change password" state.

### Scope
**In Scope:**
- Addition of `must_change_password` boolean field to the `User` model.
- Implementation of `POST /api/auth/admins/` endpoint.
- Permission restriction: Only `SUPER_ADMIN` can access this route.
- Automatic role assignment: `role = ADMIN`, `is_staff = True`.
- Secure random password generation.
- Email dispatch with temporary credentials (using Django's `send_mail`).
- Logic to prevent full access (or return a specific flag) if `must_change_password` is `True` during login/me checks.

**Out of Scope:**
- Frontend implementation (separate task).
- Complex password policy enforcement (beyond existing Django validators).
- Multi-factor authentication (MFA).

### User Stories
1. As a **SuperAdmin**, I want to create a new Admin account using their email and name so they can help manage the platform.
2. As a **New Admin**, I want to receive an email with my temporary password so I can log in.
3. As a **New Admin**, I want to be forced to change my password after my first login to ensure my account is secure.

## Technical Context

### Files to Reference (read-only)
- `back-end/accounts/models.py` - User model and Role choices.
- `back-end/accounts/serializers.py` - Existing User serializers.
- `back-end/accounts/permissions.py` - `IsSuperAdmin` definition.
- `back-end/config/settings.py` - Email and JWT configuration.

### Files to Implement/Modify
- `back-end/accounts/models.py` - Add `must_change_password = models.BooleanField(default=False)`.
- `back-end/accounts/serializers.py` - Create `AdminCreationSerializer` and update `UserSerializer` to include the new field.
- `back-end/accounts/views.py` - Create `AdminCreateView` and update `LoginView` (or `MeView`) to handle/report the `must_change_password` status.
- `back-end/accounts/urls.py` - Add `path('admins/', AdminCreateView.as_view(), name='admin-create')`.

### Existing Patterns to Follow
- Use `rest_framework.views.APIView` or `Generics` for the endpoint.
- Use `accounts.permissions.IsSuperAdmin` for access control.
- Follow the `Role.ADMIN` constant for assignment.

## Implementation Details

### Model Update
```python
# back-end/accounts/models.py
class User(AbstractUser):
    # ... existing fields ...
    must_change_password = models.BooleanField(default=False)
```

### Admin Creation Logic
1. Validate `email`, `first_name`, `last_name`.
2. Generate random password: `django.utils.crypto.get_random_string(length=12)`.
3. Create user with `role=ADMIN`, `is_staff=True`, `must_change_password=True`.
4. Send email:
   ```python
   from django.core.mail import send_mail
   send_mail(
       'Your Admin Account Credentials',
       f'Welcome! Your temporary password is: {temp_password}. Please change it upon login.',
       'from@example.com',
       [user.email],
       fail_silently=False,
   )
   ```

### API Endpoint: `POST /api/auth/admins/`
- **Auth:** `IsSuperAdmin`
- **Request Body:**
  ```json
  {
    "email": "newadmin@example.com",
    "first_name": "Jean",
    "last_name": "Dupont"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 12,
    "email": "newadmin@example.com",
    "role": "ADMIN",
    "must_change_password": true
  }
  ```

### Authentication Flow Adjustment
- The `LoginView` should return the `must_change_password` flag in the user payload.
- (Recommended) The `MeView` should also include this flag so the frontend can redirect the user to a "Change Password" page if `true`.

## Validation Criteria

### Functional Requirements
- [ ] Only `SUPER_ADMIN` can create new admins.
- [ ] New admins are created with `is_staff=True` and `role='ADMIN'`.
- [ ] A random password is set and encrypted in the database.
- [ ] An email is "sent" (visible in console for dev).
- [ ] `must_change_password` is `True` for the new user.

### Technical Requirements
- [ ] Migration added for `must_change_password` field.
- [ ] Serializer validates that the email is not already in use.
- [ ] `IsSuperAdmin` permission is applied to the view.
- [ ] No sensitive data (the temporary password) is returned in the API response.

### Testing Steps
1. **As SuperAdmin:** Call `POST /api/auth/admins/` with valid data.
   - Verify 201 response.
   - Check console/logs for the email content and temporary password.
   - Verify in DB: `role='ADMIN'`, `is_staff=True`, `must_change_password=True`.
2. **As Member:** Call the same endpoint.
   - Verify 403 Forbidden.
3. **As New Admin:** Login using the temporary password.
   - Verify `must_change_password: true` in the response.
