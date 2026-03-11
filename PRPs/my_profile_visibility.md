# My Profile and Privacy Management PRP

## Goal
Implement a "My Profile" feature accessible at `/profiles` that allows users to view and manage their personal information (including experiences), with a new `isVisible` privacy setting to control the visibility of their contact details to other members.

## Why
Users need a centralized place to view and manage their data. Providing privacy controls is essential for an alumni network, allowing members to decide whether their email and LinkedIn profiles should be visible to others.

## What
- **My Profile Page**: A new route `/profiles` displaying the current user's information: Last Name, First Name, Email, Graduation Year, Degree, Promotion, and a list of their Experiences.
- **Experience Management**: Users must be able to see their professional experiences (Title, Company, Start/End Date, Description).
- **Privacy Setting**: A new boolean field `isVisible` on the `Profile` model.
- **Visibility Logic**: 
    - If `isVisible` is false, other `MEMBER` users should not see the user's email and LinkedIn URL in the alumni list or detail views. 
    - Admins and the profile owner (the user themselves) should always see all information.

## Technical Context

### Files to Reference (read-only)
- `back-end/accounts/models.py` - User model definition.
- `back-end/alumni/models.py` - Profile, Promotion, and Experience models.
- `front-end/src/app/core/models/profile.model.ts` - Frontend Profile interface.

### Files to Implement/Modify
- **Backend:**
    - `back-end/alumni/models.py`: Add `is_visible` field to `Profile` model.
    - `back-end/alumni/serializers.py`: 
        - Update `ProfileSerializer` to include `is_visible` and nested `experiences`.
        - Implement privacy masking logic in `to_representation` or similar.
    - `back-end/alumni/views.py`: Add `@action(detail=False)` for `me` to `ProfileViewSet`.
- **Frontend:**
    - `front-end/src/app/core/models/profile.model.ts`: Add `is_visible` and `experiences` to the interface.
    - `front-end/src/app/app.routes.ts`: Add `/profiles` route.
    - `front-end/src/app/features/alumni/my-profile/my-profile.component.ts`: New component for the "My Profile" page.
    - `front-end/src/app/core/services/alumni.service.ts`: Add `getMyProfile()` and `updateMyProfile()` methods.
    - `front-end/src/app/shared/components/alumni/alumni-card.component.ts`: Respect `isVisible`.
    - `front-end/src/app/features/alumni/profile-detail/profile-detail.component.ts`: Respect `isVisible` and show experiences.

### Existing Patterns to Follow
- Use Angular Signals and `toSignal` for reactive data.
- Glassmorphism design system.

## Implementation Details

### API/Endpoints
- `GET /api/alumni/profiles/me/`: Returns authenticated user's profile + experiences.
- `PATCH /api/alumni/profiles/me/`: Update profile/visibility.
- Masked `GET /api/alumni/profiles/` for `MEMBER` roles.

### Database Changes
- Migration for `alumni_profile.is_visible`.

### Components
- `MyProfileComponent`: User dashboard for profile management.

## Validation Criteria

### Functional Requirements
- [ ] User can see their own profile at `/profiles`.
- [ ] Experiences are correctly displayed.
- [ ] Visibility toggle works as intended.
- [ ] Data masking works for other members.

### Technical Requirements
- [ ] Backend migration successful.
- [ ] API security checks (masking) verified.

### Testing Steps
1. Log in as MEMBER A.
2. Set `isVisible=False`.
3. Log in as MEMBER B; verify A's email/linkedin are hidden.
4. Log in as ADMIN; verify A's info is visible.
