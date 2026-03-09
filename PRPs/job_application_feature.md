# Job Application & Details Feature PRP

## Goal
Allow users to view full details of job offers and enable `MEMBER` users with a "VERIFIED" profile status to apply for them.

## Why
Connecting verified alumni with job opportunities is a core value of the platform. Providing detailed information and a seamless application process improves the user experience and recruitment outcomes.

## What
- **Job Details**: Endpoint and interface to view full details of a single job offer.
- **Job Application Logic**: Users can submit an application for a specific job offer.
- **Role Validation**: Only users with the `MEMBER` role can apply.
- **Verification Validation**: Only users with a `VERIFIED` profile status can apply.
- **Error Handling**: Specific status codes for validation failures (400 for role, 403 for status).
- **Frontend Integration**: 
    - "Détails" button navigates to a dedicated job detail view.
    - "Postuler" button triggers the application process with feedback.

## Technical Context

### Files to Reference (read-only)
- `back-end/jobs/models.py`: `Job` and `JobApplication` models.
- `back-end/alumni/models.py`: `Profile` model and `Status` choices.
- `back-end/accounts/models.py`: `Role` choices.
- `front-end/src/app/core/models/business.model.ts`: `JobOffer` interface.

### Files to Implement/Modify
- **Backend**:
    - `back-end/jobs/serializers.py`: Add `JobApplicationSerializer`.
    - `back-end/jobs/views.py`: Ensure `retrieve` is supported and add `apply` action to `JobViewSet`.
- **Frontend**:
    - `front-end/src/app/core/services/job.service.ts`: Ensure `getJobById(id)` exists and add `applyToJob(jobId)`.
    - `front-end/src/app/features/jobs/job-detail/job-detail.component.ts`: (New) View for single job details.
    - `front-end/src/app/features/jobs/job-list/job-list.component.ts`: Link "Détails" button to the new route and implement `onApply(job: JobOffer)`.
    - `front-end/src/app/app.routes.ts`: Add route for job details (`/jobs/:id`).

### Existing Patterns to Follow
- Use `@action(detail=True, methods=['post'])` in DRF ViewSet for custom actions.
- Use `ToastService` for user feedback in Angular.
- Use `ActivatedRoute` and `paramMap` for detail views in Angular.

## Implementation Details

### API/Endpoints
**Job Details**: `GET /api/jobs/{id}/` (Standard DRF retrieve)
**Job Application**: `POST /api/jobs/{id}/apply/`

**Validation Logic (Backend - Apply)**:
1. Check if user role is `MEMBER`. If not, return `400 Bad Request` with detail "Only members can apply to jobs".
2. Check if user has a `Profile` and if its status is `VERIFIED`. If not, return `403 Forbidden` with detail "Your profile must be verified to apply to job offers".
3. Check if an application already exists for this user and job. If so, return `400 Bad Request` with detail "You have already applied to this job".
4. Create `JobApplication` record.

### Components (Frontend)
- **`JobDetailComponent`**:
    - Route: `/jobs/:id`.
    - Displays all fields: Title, Company, Type, Location, Description, Posted By, Date.
    - Includes a "Postuler" button (visible only to Members, subject to the same status rules).
- **`JobListComponent`**:
    - Update "Détails" button: `[routerLink]="['/jobs', job.id]"`.
    - Implement `onApply(job: JobOffer)` method using `ToastService`.

## Validation Criteria

### Functional Requirements
- [ ] Users can click "Détails" to view full information about a job offer.
- [ ] Users with `ADMIN` or `SUPER_ADMIN` roles cannot apply (return 400).
- [ ] Users with `MEMBER` role but `DRAFT` profile status cannot apply (return 403).
- [ ] Users with `MEMBER` role and `VERIFIED` profile status can apply successfully.
- [ ] A user cannot apply to the same job twice.
- [ ] Frontend displays appropriate success/error toasts for applications.

### Technical Requirements
- [ ] Backend returns correct HTTP status codes (200 for details, 201/400/403 for apply).
- [ ] Detail view handles loading and error states.
- [ ] No regression in job listing or creation.

### Testing Steps
1. Navigate to `/jobs` and click "Détails" on a job offer -> Verify detailed view.
2. Log in as a `MEMBER` with a `DRAFT` profile. Try to apply -> Verify 403 error toast.
3. Log in as an `ADMIN`. Verify "Postuler" button is hidden or try manual POST -> Verify 400 error.
4. Log in as a `MEMBER` with a `VERIFIED` profile. Try to apply -> Verify success toast.
5. Try to apply again to the same job -> Verify "already applied" error toast.
