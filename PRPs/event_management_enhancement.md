# Event Management & Member Participation PRP

## Goal
Enhance the events feature with detailed event pages, administrative controls for modification/cancellation, advanced filtering, pagination, and a member-specific interface to track event participation.

## Why
Users need to be able to view specific details of an event and manage their participation efficiently. Administrators need tools to keep event information up-to-date and manage the event lifecycle (creation, modification, cancellation). Members need a clear view of their upcoming and past engagements to foster networking and community involvement.

## What
- **Event Detail Page (`/events/{id}`)**: A dedicated page showing full event details, including participants count and registration status.
- **Admin Controls**: Admins and Superadmins can modify or cancel (delete) events that haven't occurred yet.
- **Advanced Filtering**: Filter events by name (title), date, and online/offline status.
- **Pagination**: Implement limit and offset pagination for event lists.
- **Member Event Dashboard**: A dedicated interface for members to see:
  - Events they are currently registered for (upcoming).
  - Events they have already participated in (past).

## Technical Context

### Files to Reference (read-only)
- `back-end/events/models.py` - Existing event models.
- `back-end/events/serializers.py` - Existing serializers.
- `back-end/jobs/views.py` - Reference for pagination and filtering implementation.
- `front-end/src/app/features/jobs/job-list/job-list.component.ts` - Reference for UI filtering and pagination patterns.
- `front-end/src/app/core/services/event.service.ts` - Existing event service.

### Files to Implement/Modify

#### Backend
- `back-end/events/filters.py` (NEW) - Define `EventFilter` class using `django-filter`.
- `back-end/events/views.py` (MODIFY) - Add filter backend, pagination, and custom actions for `my-events`. Add validation logic to protect past events.
- `back-end/events/serializers.py` (MODIFY) - Ensure all necessary fields are present for detail view.

#### Frontend
- `front-end/src/app/core/services/event.service.ts` (MODIFY) - Add `updateEvent`, `deleteEvent`, `getMyEvents`, and update `getEvents` to support parameters.
- `front-end/src/app/app.routes.ts` (MODIFY) - Add routes for `:id` and `my-events`.
- `front-end/src/app/features/events/event-detail/event-detail.component.ts` (NEW) - Implement the detail view with Admin/Member actions.
- `front-end/src/app/features/events/my-events/my-events.component.ts` (NEW) - Implement the user's event dashboard.
- `front-end/src/app/features/events/event-list/event-list.component.ts` (MODIFY) - Add filtering UI and pagination controls.
- `front-end/src/app/features/events/event-list/event-create.component.ts` (REFACTOR) - Make it reusable for editing (e.g., `EventFormComponent`).

### Existing Patterns to Follow
- Use `django_filters.rest_framework.DjangoFilterBackend` for backend filtering.
- Use `rest_framework.pagination.PageNumberPagination` for backend pagination.
- Follow the "Signal-based" state management in Angular components.
- Use Lucide icons consistently.
- Use Tailwind CSS for styling, adhering to the project's design system (cards, buttons, glassmorphism).

## Implementation Details

### API/Endpoints

- `GET /api/events/` - Updated to support filters: `title`, `date`, `is_online`, `limit`, `page`.
- `GET /api/events/{id}/` - Retrieve full details of a single event.
- `PUT/PATCH /api/events/{id}/` - Update an event (Admin only, only if `date > now`).
- `DELETE /api/events/{id}/` - Cancel/Delete an event (Admin only, only if `date > now`).
- `GET /api/events/my-events/` - Return two lists: `registered` (upcoming) and `past` (attended).

### Database Changes
- No schema changes required as `Event` and `EventParticipant` models already exist.

### Components

#### EventListComponent
- Add a sidebar or top bar for filtering.
- Add Lucide-based pagination controls at the bottom.
- Make event cards clickable to navigate to `/events/{id}`.

#### EventDetailComponent
- Hero section with event title and date.
- Description and location details.
- Sidebar with "Register/Unregister" for members.
- "Edit/Cancel" buttons for Admins (conditionally shown).

#### MyEventsComponent
- Tabs or sections for "Mes inscriptions" and "Événements passés".

## Validation Criteria

### Functional Requirements
- [ ] Users can filter events by name, date, and status (online/offline).
- [ ] Users can navigate through pages of events.
- [ ] Admins can edit/delete upcoming events from the detail page.
- [ ] Admins CANNOT edit/delete past events (backend validation + frontend UI state).
- [ ] Members can see their specific events in "My Events".
- [ ] Users can register/unregister from the detail page.

### Technical Requirements
- [ ] Backend prevents unauthorized modifications via `IsAdmin` and date checks.
- [ ] Angular routes are correctly protected by `authGuard`.
- [ ] Responsive design for all new components.
- [ ] Proper error handling for API calls with Toast notifications.

### Testing Steps
1. Log in as Admin. Create an event in the future.
2. Edit the event and verify changes.
3. Log in as Member. Search for the event using filters.
4. Register for the event.
5. Go to "My Events" and verify it appears in "Mes inscriptions".
6. Log in as Admin. Try to delete an event from last year (should fail/be disabled).
7. Verify pagination works by setting a low limit (e.g., 5) and creating multiple events.
