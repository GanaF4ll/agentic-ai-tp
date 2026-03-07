# Refactor Subscribe to Signals and Async Pipe PRP

## Goal
Refactor existing manual `.subscribe()` calls in Angular components to use modern reactive patterns: either the `async` pipe in templates or the `toSignal()` function for component state.

## Why
- **Memory Safety:** `async` pipe and `toSignal()` handle unsubscription automatically, preventing memory leaks.
- **Performance:** Aligns with `ChangeDetectionStrategy.OnPush` and Angular's new signal-based reactivity.
- **Readability:** Reduces boilerplate code (no manual `Subscription` management or `ngOnDestroy` cleanup).
- **Consistency:** Follows the project's "Angular 20" best practices as defined in `ai_docs/angular.md`.

## What
Refactor the following components to eliminate manual `.subscribe()` where appropriate:
- `AlumniListComponent`: Refactor profile fetching and filtering.
- `ProfileDetailComponent`: Refactor profile fetching based on route parameters.
- `UserListComponent`: Refactor user list fetching.

### Scope Boundaries
- **Included:** State-based subscriptions (fetching data for display).
- **Excluded:** Action-based subscriptions (Login, Form Submit, Delete, etc.) that perform side effects like navigation or toast notifications. These should remain as `.subscribe()` in the component methods.

## Technical Context

### Files to Reference (read-only)
- `ai_docs/angular.md` - Core Angular conventions.
- `front-end/.agents/skills/angular-best-practices-v20/rules/rxjs-async-pipe.md` - Guidelines for `async` pipe.
- `front-end/.agents/skills/angular-best-practices-v20/rules/change-signals.md` - Guidelines for Signals.

### Files to Implement/Modify
- `front-end/src/app/features/alumni/alumni-list/alumni-list.component.ts`
- `front-end/src/app/features/alumni/profile-detail/profile-detail.component.ts`
- `front-end/src/app/features/admin/user-management/user-list.component.ts`

### Existing Patterns to Follow
- Use `inject()` for dependency injection.
- Use `toSignal()` from `@angular/core/rxjs-interop` to convert Observables to Signals.
- Use `toObservable()` if you need to react to signal changes within an RxJS chain.
- Use the `async` pipe in templates if the data is not needed in the component's TypeScript logic.

## Implementation Details

### `AlumniListComponent` Refactoring
1. Convert `filterForm.valueChanges` to a signal using `toSignal`.
2. Use `toObservable` on the filter signal and `switchMap` to call `alumniService.getProfiles(filters)`.
3. Wrap the result in `toSignal` to create the `profiles` signal.
4. Ensure `isLoading` is correctly handled (perhaps by checking the observable state or using a separate signal).

### `ProfileDetailComponent` Refactoring
1. Use `inject(ActivatedRoute).params` as an observable.
2. Use `switchMap` to fetch the profile based on the ID from params.
3. Convert the resulting observable to a signal using `toSignal`.

### `UserListComponent` Refactoring
1. Replace the manual subscription in `ngOnInit` (or constructor) with a `toSignal` call on `authService.getUsers()`.

## Validation Criteria

### Functional Requirements
- [ ] Alumni list filters correctly and reactively without manual `loadProfiles()` calls.
- [ ] Profile detail page loads correctly when navigating between different profiles.
- [ ] User management list displays all users on load.
- [ ] Error states (e.g., API failure) are handled gracefully (e.g., using `catchError` to return mock data or empty array).

### Technical Requirements
- [ ] No `Subscription` or `unsubscribe()` calls for the refactored data streams.
- [ ] Component uses `toSignal()` from `@angular/core/rxjs-interop`.
- [ ] `ChangeDetectionStrategy.OnPush` is used and working correctly.
- [ ] TypeScript compiles without errors.

### Testing Steps
1. Navigate to `/alumni` and verify the list loads and filtering works.
2. Click on a profile to verify detail view works.
3. Navigate to `/admin/users` to verify user list works.
4. Check browser console for any RxJS or Signal related errors.
