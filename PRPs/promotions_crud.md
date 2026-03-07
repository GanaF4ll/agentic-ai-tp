# Promotions CRUD Endpoints PRP

## Goal
Implement a complete REST API for Managing Promotions (years/classes) and provide the corresponding frontend service to interact with it.

## Why
Administrators need to be able to create, update, and delete Promotion records to correctly categorize Alumni profiles. Members need to be able to view the list of promotions to filter or update their own profile.

## What
- **CRUD Endpoints**: Full CRUD for `Promotion` model.
- **Access Control**: 
    - `SUPER_ADMIN` and `ADMIN`: Full access (Create, Read, Update, Delete).
    - `MEMBER` and other authenticated users: Read-only access (List, Retrieve).
- **Frontend Integration**: Angular model and service to consume the API.

## Technical Context

### Files to Reference (read-only)
- `back-end/alumni/models.py`: Current `Promotion` model definition.
- `back-end/accounts/permissions.py`: Existing `IsAdmin` permission class.
- `front-end/src/app/core/models/profile.model.ts`: Current `Promotion` interface.

### Files to Implement/Modify
- `back-end/alumni/serializers.py`: Expand `PromotionSerializer`.
- `back-end/alumni/views.py`: Create `PromotionViewSet`.
- `back-end/alumni/urls.py`: Register `promotions` route.
- `front-end/src/app/core/models/promotion.model.ts`: Create/Update the Promotion interface.
- `front-end/src/app/core/services/promotion.service.ts`: Create a service for API calls.

### Existing Patterns to Follow
- Use DRF `ModelViewSet` as seen in `ProfileViewSet`.
- Use the `IsAdmin` permission for write operations.
- Follow the existing project structure for Angular services and models.

## Implementation Details

### API/Endpoints
**Base URL**: `/api/alumni/promotions/`

- `GET /`: List all promotions (Authenticated).
- `GET /{id}/`: Retrieve a single promotion (Authenticated).
- `POST /`: Create a promotion (Admin/SuperAdmin only).
- `PUT/PATCH /{id}/`: Update a promotion (Admin/SuperAdmin only).
- `DELETE /{id}/`: Delete a promotion (Admin/SuperAdmin only).

**Response Format**:
```json
{
  "id": 1,
  "label": "Promotion 2024",
  "description": "Classe de l'année 2024",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Database Changes
No schema changes required; the `Promotion` model is already defined.

### Frontend Components
- Create `PromotionService` in `front-end/src/app/core/services/promotion.service.ts`.
- It should include methods for `getAll()`, `getById()`, `create()`, `update()`, and `delete()`.

## Validation Criteria

### Functional Requirements
- [ ] Admins can create a new Promotion via POST.
- [ ] Admins can update a Promotion via PATCH.
- [ ] Admins can delete a Promotion via DELETE.
- [ ] Members receive a 403 Forbidden when attempting POST/PUT/PATCH/DELETE.
- [ ] All authenticated users can list promotions via GET.

### Technical Requirements
- [ ] DRF ViewSet uses `PermissionContextMixin` or standard `get_permissions()` to handle split access.
- [ ] Serializer includes `description`, `created_at`, and `updated_at`.
- [ ] Frontend service is provided in `root`.
- [ ] TypeScript types match the API response.

### Testing Steps
1. Log in as an Admin and create a promotion: `curl -X POST ...`
2. Log in as a Member and try to delete that promotion: expect 403.
3. Verify the list endpoint returns the new promotion: `curl -X GET ...`
4. Run Angular build to ensure type safety.
