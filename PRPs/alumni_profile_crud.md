# Alumni Profile CRUD Endpoints PRP

## Goal
Implement a complete set of RESTful CRUD endpoints for managing Alumni Profiles in the JumpBoard platform, with support for cumulative advanced filtering in the list view.

## Why
Administrators and users need to be able to manage alumni profiles. Cumulative filtering is essential for narrowing down searches (e.g., finding a "Dupont" from the "2023" promotion).

## What
- **Resource Name**: Use `profiles` as the primary resource (e.g., `/api/profiles/`).
- **CRUD Operations**: Implement standard Create, Read, Update, and Delete operations for the `Profile` model.
- **Cumulative Filtering**: The list endpoint (`GET /api/profiles/`) must support cumulative filtering (AND logic) using the following query parameters:
  - `nom`: Case-insensitive partial match on `user__last_name`.
  - `prenom`: Case-insensitive partial match on `user__first_name`.
  - `promo`: Filter by `promotion__label` (exact or partial).
  - `annee`: Exact match on `graduation_year`.
- **Nested Data**: Responses should include basic user information (first name, last name, email) and promotion details.

## Technical Context

### Files to Reference (read-only)
- `back-end/alumni/models.py`: Defines `Profile`, `Promotion`, `Education`, and `Experience`.
- `back-end/accounts/models.py`: Defines the custom `User` model.

### Files to Implement/Modify
- `back-end/requirements.txt`: Add `django-filter`.
- `back-end/config/settings.py`: Register `django_filters` and configure DRF defaults.
- `back-end/alumni/serializers.py` (New): Define `ProfileSerializer` with nested `User` and `Promotion` data.
- `back-end/alumni/filters.py` (New): Implement `ProfileFilter` using `django-filter`.
- `back-end/alumni/views.py` (New): Implement `ProfileViewSet` with `filterset_class`.
- `back-end/alumni/urls.py` (New): Register the `profiles` route.
- `back-end/config/urls.py`: Include `alumni.urls` under the `api/` prefix.

## Implementation Details

### API/Endpoints
- `GET /api/profiles/`: Returns a list of profiles. Supports `?nom=...&prenom=...&promo=...&annee=...`.
- `POST /api/profiles/`: Creates a new profile.
- `GET /api/profiles/{id}/`: Returns details of a single profile.
- `PUT/PATCH /api/profiles/{id}/`: Updates an existing profile.
- `DELETE /api/profiles/{id}/`: Deletes a profile.

### Filtering Logic
- Use `django_filters.rest_framework.FilterSet`.
- Ensure filters can be combined: `?nom=Dupont&annee=2023` should only return profiles matching BOTH criteria.

## Validation Criteria

### Functional Requirements
- [ ] `GET /api/profiles/` returns all profiles by default.
- [ ] Filters are cumulative: `?nom=A&annee=B` returns the intersection.
- [ ] Search is case-insensitive for name fields.
- [ ] CRUD operations correctly modify the database.

### Technical Requirements
- [ ] `django-filter` is correctly integrated into the DRF ViewSet.
- [ ] Serializers handle the `OneToOne` relationship with `User` cleanly.
- [ ] TypeScript types (if applicable in frontend) or documentation matches the response schema.

### Testing Steps
1. Seed the database using `python manage.py seed_db`.
2. Test cumulative filtering: `/api/profiles/?nom=martin&annee=2024`.
3. Verify nested JSON: The `user` object should be present inside the profile data.
