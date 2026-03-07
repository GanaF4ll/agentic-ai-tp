# Promotion Management PRP

## Goal
Implement a comprehensive administration page for managing school Promotions (cohorts), accessible exclusively by Super Admins and Admins.

## Why
Admins need a central place to create, update, and delete Promotion labels (e.g., "Promotion 2024 - Fullstack") to maintain data consistency across the platform and ensure alumni can be correctly categorized.

## What
- A new CRUD interface in the Admin section for Promotions.
- Restricted access: Only users with `ADMIN` or `SUPER_ADMIN` roles can access this page.
- List view of all promotions with sorting by label or creation date.
- Modal/Dialog or inline form for adding/editing a Promotion label.
- Deletion capability with a confirmation prompt.

## Technical Context

### Files to Reference (read-only)
- `back-end/alumni/models.py` - `Promotion` model definition.
- `back-end/alumni/serializers.py` - `PromotionSerializer` for data mapping.
- `back-end/alumni/views.py` - `PromotionViewSet` handling CRUD logic and permissions.
- `front-end/src/app/core/auth/auth.guard.ts` - For understanding role-based routing.
- `front-end/src/app/features/admin/dashboard/dashboard.component.ts` - Example of admin UI patterns.

### Files to Implement/Modify
- `front-end/src/app/core/services/promotion.service.ts` - **New** service for Promotion CRUD operations.
- `front-end/src/app/features/admin/promotion-management/promotion-list.component.ts` - **New** component for the management UI.
- `front-end/src/app/app.routes.ts` - Add the new admin route.
- `front-end/src/app/features/admin/dashboard/dashboard.component.ts` - Add a link to the Promotion management page.

### Existing Patterns to Follow
- Use Angular Signals for state management (see `AuthService` or `DashboardComponent`).
- Use Tailwind CSS and DaisyUI for styling, following the "glass" and "card" aesthetics used in the project.
- Use `lucide-angular` for icons.

## Implementation Details

### API/Endpoints
- `GET /api/promotions/` - List promotions.
- `POST /api/promotions/` - Create a promotion.
- `PATCH/PUT /api/promotions/{id}/` - Update a promotion.
- `DELETE /api/promotions/{id}/` - Delete a promotion.

### Database Changes
No database changes required as the `Promotion` model is already defined.

### Components
- **PromotionListComponent**: 
  - Table of promotions.
  - "Add Promotion" button.
  - Action buttons (Edit, Delete) for each row.
  - Simple form for label input.

## Validation Criteria

### Functional Requirements
- [ ] Only Admins and Super Admins can see the "Promotions" link and access the route.
- [ ] Users can create a new promotion with a label.
- [ ] Users can edit an existing promotion label.
- [ ] Users can delete a promotion after confirmation.
- [ ] The list updates automatically after CRUD operations.

### Technical Requirements
- [ ] TypeScript compiles without errors.
- [ ] API calls are handled via the `HttpClient` through a dedicated service.
- [ ] UI is responsive and follows the project's design system (DaisyUI).
- [ ] Proper error handling for API failures (e.g., duplicate labels).
