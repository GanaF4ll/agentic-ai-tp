# Responsive UI Optimization PRP

## Goal
Ensure a seamless and fully responsive user experience across all interfaces of the AlumniConnect app for small (mobile), medium (tablet), and large (desktop) screens.

## Why
A significant portion of alumni and students will access the platform via mobile devices for networking, job searching, and event registration. The current UI has some "desktop-first" patterns (like fixed tables and always-visible filters) that degrade the experience on smaller screens.

## What
- **Responsive Layouts**: Optimize the application shell and main content areas.
- **Mobile Filter Toggles**: Implement consistent drawer/modal-based filters for mobile in Alumni and Event lists.
- **Responsive Tables**: Transform admin tables into scrollable or card-based views on mobile.
- **Grid Optimization**: Refine grid breakpoints for cards and stats.
- **Form Refinement**: Ensure forms (Login, Register, Create forms) are optimized for touch and narrow screens.

## Technical Context

### Files to Reference (read-only)
- `src/app/app.html` - Root layout with DaisyUI drawer.
- `src/app/shared/components/layout/header.component.ts` - Contains mobile drawer toggle.
- `src/app/features/jobs/job-list/job-list.component.ts` - Example of good mobile filter implementation.

### Files to Implement/Modify
- `src/app/features/alumni/alumni-list/alumni-list.component.ts` - Add mobile filter toggle.
- `src/app/features/events/event-list/event-list.component.ts` - Add mobile filter toggle.
- `src/app/features/admin/dashboard/dashboard.component.ts` - Improve table responsiveness.
- `src/app/features/admin/user-management/user-list.component.ts` - Improve table responsiveness.
- `src/app/features/auth/register/register.component.ts` - Fix name fields grid on mobile.
- `src/app/shared/components/alumni/alumni-card.component.ts` - (If exists) Optimize card layout.
- `src/styles.css` - Add global responsive utilities if needed.

### Existing Patterns to Follow
- Use **Tailwind CSS breakpoints** (`sm:`, `md:`, `lg:`, `xl:`).
- Use **DaisyUI components** (`drawer`, `modal`, `collapse`).
- Follow the **Bento-style design** already established in the codebase.

## Implementation Details

### Components
1. **Filter Toggles**: For `AlumniListComponent` and `EventListComponent`, add a "Filtres" button visible only on mobile (`lg:hidden`) that toggles the visibility of the filter sidebar (using a signal).
2. **Responsive Tables**: 
   - Wrap tables in `overflow-x-auto`.
   - Add a visual indicator (like a soft shadow or "Scroll" hint) if the table is overflowing.
   - Alternatively, use `@if` with breakpoints to switch to a card-based view on small screens for the Validation Queue and User List.
3. **Registration Form**: Change `grid-cols-2` to `grid-cols-1 md:grid-cols-2` for the first name/last name fields.
4. **Stats Cards**: Ensure stats grids in the Dashboard and User List use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
5. **Header**: Ensure the search bar and breadcrumbs don't collide on medium screens; perhaps collapse search into an icon on smaller screens.

## Validation Criteria

### Functional Requirements
- [ ] Sidebar/Drawer works correctly on mobile (toggleable).
- [ ] Filters in Alumni and Event lists can be toggled on mobile.
- [ ] Admin tables are fully readable on mobile without breaking the layout.
- [ ] Registration form name fields stack on mobile and are side-by-side on desktop.
- [ ] No horizontal scroll on the `body` or `main` container on any device.

### Technical Requirements
- [ ] Tailwind CSS v4 classes used correctly.
- [ ] Angular Signals used for UI state (e.g., `showMobileFilters`).
- [ ] DaisyUI theme consistency maintained.

### Testing Steps
1. Open Chrome DevTools and use Device Mode.
2. Test at `375px` (iPhone SE), `768px` (iPad), and `1440px` (Desktop).
3. Verify that all buttons are clickable and text is legible at all sizes.
4. Check that the "Alumni List" filters don't push content awkwardly on mobile.
5. Verify that the "User Management" table doesn't break the container width on mobile.
