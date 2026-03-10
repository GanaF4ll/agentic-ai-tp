# Dashboard Evolution and User Management PRP

## Goal
Enhance the Admin Dashboard with real-time data and alumni validation capabilities, and implement a dedicated User Management system for SuperAdmins to manage internal access.

## Why
**Business Justification:**
- **Operational Efficiency:** Allows admins to validate alumni directly from the dashboard, streamlining the verification process.
- **Data Accuracy:** Replaces mock dashboard statistics with real data for better monitoring.
- **Security & Governance:** Provides SuperAdmins with the tools to manage administrative roles and revoke access, ensuring the platform's integrity.

## What
### Feature Description
The dashboard will now display real pending counts and alumni profiles. Admins can validate these profiles with a single click. SuperAdmins gain a "User Management" page to create Admin users and manage the `is_active` status of all users.

### Scope
**Backend:**
- `ProfileViewSet` update:
    - `{id}/validate` endpoint (POST): Validates a profile. Must check if the requester is an Admin/SuperAdmin, the target is a MEMBER, and not already verified.
    - `count_pending` endpoint (GET): Returns the count of profiles with `status='DRAFT'`.
- `UserViewSet` at `/api/auth/users/`:
    - Accessible only to `IsSuperAdmin`.
    - `list`: Returns all users.
    - `toggle_active` (POST): Toggles the `is_active` field.
    - `create_admin` (POST): Integrated with existing `AdminCreationSerializer`.

**Frontend:**
- **Dashboard:**
    - "Détails" button: Links to `/alumni/:id`.
    - "Valider" button: Calls the new backend validation endpoint and refreshes the list.
    - "En attente de validation" Stat Card: Displays the real count from the API.
- **User Management:**
    - New/Updated page for SuperAdmins.
    - List users with their roles and `is_active` status.
    - Action to revoke/restore access (toggle `is_active`).
    - Integration with user creation modal.

## Technical Context

### Files to Reference (read-only)
- `back-end/accounts/models.py` - User model.
- `back-end/alumni/models.py` - Profile model.
- `back-end/accounts/permissions.py` - Permission classes.
- `front-end/src/app/core/auth/auth.service.ts` - Existing auth logic.

### Files to Implement/Modify
- **Backend:**
    - `back-end/alumni/views.py`: Add `validate` and `count_pending` actions.
    - `back-end/accounts/views.py`: Implement `UserManagementViewSet`.
    - `back-end/accounts/urls.py`: Register the new User management routes.
- **Frontend:**
    - `front-end/src/app/core/services/alumni.service.ts`: Add `getPendingCount`.
    - `front-end/src/app/features/admin/dashboard/dashboard.component.ts`: Wire up real data and actions.
    - `front-end/src/app/features/admin/user-management/user-list.component.ts`: Implement management actions.

## Implementation Details

### Backend Validation Logic (`ProfileViewSet`)
```python
@action(detail=True, methods=['post'], permission_classes=[IsAdmin])
def validate(self, request, pk=None):
    profile = self.get_object()
    if profile.status == Profile.Status.VERIFIED:
        return Response({"detail": "Déjà validé."}, status=400)
    if profile.user.role != Role.MEMBER:
        return Response({"detail": "Seuls les membres peuvent être validés."}, status=400)
    
    profile.status = Profile.Status.VERIFIED
    profile.save()
    return Response(self.get_serializer(profile).data)
```

### User Management Actions (`UserViewSet`)
- **Path:** `/api/auth/users/`
- **Toggle:** `POST /api/auth/users/{id}/toggle_active/`

## Validation Criteria

### Functional Requirements
- [ ] Admin/SuperAdmin can validate a DRAFT profile.
- [ ] Profile validation endpoint prevents re-validation or non-member validation.
- [ ] Dashboard displays the correct count of pending alumni.
- [ ] "Détails" button on dashboard redirects to the correct profile page.
- [ ] SuperAdmin can see all users and their status.
- [ ] SuperAdmin can deactivate/activate a user account.

### Technical Requirements
- [ ] API endpoints enforce strict permissions (`IsAdmin` for validation, `IsSuperAdmin` for user management).
- [ ] Frontend signals/observables refresh after an action (validation or toggle).
- [ ] Migration added if any schema changes occur (none expected if using `is_active`).

### Testing Steps
1. **Validation:** Log in as Admin, go to dashboard, click "Valider" on a row. Verify the row disappears and count decreases.
2. **Access Control:** Try to access `/api/auth/users/` with a regular Member token (should be 403).
3. **User Mgmt:** As SuperAdmin, deactivate a user. Attempt to log in with that user (should be 401 "Account deactivated").
4. **Navigation:** Click "Détails" on a dashboard row and verify it lands on `/alumni/{id}`.
