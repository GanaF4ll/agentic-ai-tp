# Member Job Applications Tracking PRP

## Goal
Enable members to track their job applications and see the popularity (application count) of job offers.

## Why
Providing feedback on application status and showing the number of applicants increases user engagement and helps alumni manage their professional search more effectively.

## What
- **Application Count**: Show the total number of applications for each job in the list and detail views.
- **My Applications View**: A dedicated page for members to see all the job offers they have applied to.
- **API Updates**: Enhance job endpoints to include application stats and filter applications by the current user.

## Technical Context

### Files to Reference (read-only)
- `back-end/jobs/models.py`: `Job` and `JobApplication` models.
- `front-end/src/app/features/jobs/job-list/job-list.component.ts`: Reference for job list UI.
- `front-end/src/app/features/jobs/job-detail/job-detail.component.ts`: Reference for job detail UI.

### Files to Implement/Modify
- **Backend**:
    - `back-end/jobs/serializers.py`: Add `applications_count` to `JobSerializer`.
    - `back-end/jobs/views.py`: Add `my_applications` action to `JobViewSet`.
- **Frontend**:
    - `front-end/src/app/core/models/business.model.ts`: Update `JobOffer` interface.
    - `front-end/src/app/core/services/job.service.ts`: Add `getMyApplications()`.
    - `front-end/src/app/features/jobs/job-list/job-list.component.ts`: Update template to show count.
    - `front-end/src/app/features/jobs/job-detail/job-detail.component.ts`: Update template to show count.
    - `front-end/src/app/features/jobs/my-applications/my-applications.component.ts`: (New) Component for user's applications.
    - `front-end/src/app/app.routes.ts`: Register `/jobs/my-applications`.

### Existing Patterns to Follow
- Use `serializers.IntegerField(source='applications.count', read_only=True)` for the count.
- Use `@action(detail=False, methods=['get'])` for `my_applications`.
- Follow the existing standalone component pattern in Angular.

## Implementation Details

### Backend Implementation
- **Serializer**: 
  ```python
  applications_count = serializers.IntegerField(source='applications.count', read_only=True)
  ```
- **View Action**:
  ```python
  @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
  def my_applications(self, request):
      applied_jobs = Job.objects.filter(applications__user=request.user)
      serializer = self.get_serializer(applied_jobs, many=True)
      return Response(serializer.data)
  ```

### Frontend Implementation
- **MyApplicationsComponent**:
  - Should look similar to `JobListComponent` but filtered for the user's applications.
  - Can display a "Candidature envoyée" badge.
- **UI Addition**:
  - Add a small badge or text: `{{ job.applications_count }} candidatures` near the job type or location.

## Validation Criteria

### Functional Requirements
- [ ] Job list shows the correct number of applications for each job.
- [ ] Job detail shows the correct number of applications.
- [ ] Users can navigate to "Mes Candidatures" and see only jobs they applied to.
- [ ] If no applications, show an empty state message.

### Technical Requirements
- [ ] Efficient database queries (count should be pre-fetched or aggregated if possible, but for v1 `source='applications.count'` is acceptable).
- [ ] TypeScript interfaces match the updated API response.
- [ ] Clean UI integration using existing Glassmorphism style.

### Testing Steps
1. Apply to a job as a member.
2. Verify the application count for that job increases by 1 in the list and detail.
3. Go to `/jobs/my-applications` and verify the job appears there.
4. Log in as a different user and verify they don't see your applications in their "My Applications" view.
