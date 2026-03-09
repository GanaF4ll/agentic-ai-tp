# Job Offer Enrichment PRP

## Goal
Enrich the Job Offer feature with detailed professional information: start/end dates, remote status, work periodicity, and source links.

## Why
Providing more granular details about job opportunities helps alumni make better-informed career decisions and ensures the platform matches the standards of modern professional job boards.

## What
- **New Fields for Job Offers**:
    - `start_date`: The intended start date for the position.
    - `end_date`: Required ONLY if the contract type is not CDI (e.g., CDD, Internship).
    - `remote_status`: Enum with values `HYBRID`, `FULL REMOTE`, `ON SITE`.
    - `periodicity`: Enum with values `FULL TIME`, `PART TIME`.
    - `source_url`: External link to the original job advertisement.
- **Form Logic**: Conditional display/validation of `end_date` in the job creation form.
- **UI Display**: Enhanced list and detail views to showcase these new attributes.

## Technical Context

### Files to Reference (read-only)
- `back-end/jobs/models.py`: Existing `Job` model.
- `front-end/src/app/core/models/business.model.ts`: `JobOffer` interface.
- `front-end/src/app/features/admin/job-management/job-create.component.ts`: Reference for current form implementation.

### Files to Implement/Modify
- **Backend**:
    - `back-end/jobs/models.py`: Add the new fields and choices.
    - `back-end/jobs/serializers.py`: Include new fields in `JobSerializer`.
- **Frontend**:
    - `front-end/src/app/core/models/business.model.ts`: Update `JobOffer` interface.
    - `front-end/src/app/features/admin/job-management/job-create.component.ts`: Update form and template.
    - `front-end/src/app/features/jobs/job-list/job-list.component.ts`: Update list view.
    - `front-end/src/app/features/jobs/job-detail/job-detail.component.ts`: Update detail view.

### Existing Patterns to Follow
- Use Django `TextChoices` for enums.
- Use Angular Reactive Forms with Signals.
- Maintain DaisyUI / Glassmorphism styling.

## Implementation Details

### Database Changes (Backend)
Update `Job` model:
- `start_date`: `DateField(null=True, blank=True)`
- `end_date`: `DateField(null=True, blank=True)`
- `remote_status`: `CharField` with choices (`HYBRID`, `FULL REMOTE`, `ON SITE`)
- `periodicity`: `CharField` with choices (`FULL TIME`, `PART TIME`)
- `source_url`: `URLField(max_length=500, null=True, blank=True)`

### Component Logic (Frontend)
- **`JobCreateComponent`**:
    - Add new controls to `jobForm`.
    - Use `computed` or `effect` to handle `end_date` validation: if `type` != 'CDI', `end_date` should ideally be provided (add warning or validator).
- **Icons**:
    - `HYBRID`: `MapPin` or `Globe`
    - `FULL TIME`: `Clock`
    - `SOURCE`: `ExternalLink`

## Validation Criteria

### Functional Requirements
- [ ] Admin can specify a start date and an end date.
- [ ] Admin can select remote status and periodicity from dropdowns.
- [ ] `source_url` is optional and properly links to external sites if provided.
- [ ] Job list displays icons/badges for Remote Status and Periodicity.
- [ ] Job detail displays all new fields in a structured way.

### Technical Requirements
- [ ] Django migration is generated and applied.
- [ ] Serializer handles all new fields.
- [ ] Frontend form has proper validation.
- [ ] No TypeScript errors.

### Testing Steps
1. Create a job offer as an admin.
2. Select 'CDD' and verify you can set an end date.
3. Select 'Full Remote' and 'Part Time'.
4. Fill in a valid source URL.
5. Save and verify the job appears in the list with correct badges.
6. Verify the detail page shows all new info.
