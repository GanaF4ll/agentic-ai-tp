# Initial Database & Data Seeding PRP

## Goal

Implement the core Django models for authentication and alumni profiles, and create a management command to populate the database with realistic test data for development.

## Why

To establish the foundational data structure of AlumniConnect and provide developers with a populated environment to build and test features without manually entering data.

## What

- **Scope**: Includes `accounts` and `alumni` apps. Excludes `scraping`, `jobs`, `events`, and `networking` for this phase.
- **User Stories**:
  - As a developer, I want a custom user model with roles (MEMBER, ADMIN, SUPER_ADMIN).
  - As a developer, I want to manage alumni profiles with education and experience details.
  - As a developer, I want a single command to generate 100+ realistic fake profiles.

## Technical Context

### Files to Reference (read-only)

- `ai_docs/database.md` - Definition of the database schema and models.
- `GEMINI.md` - Project guidelines (French context for docs, English for code).

### Files to Implement/Modify

- [NEW] `back-end/accounts/models.py` - Custom User model (role, email, phone).
- [NEW] `back-end/alumni/models.py` - Profile, Education, Experience, Promotion models.
- [NEW] `back-end/alumni/management/commands/seed_db.py` - Seeding script using Faker.
- [MODIFY] `back-end/requirements.txt` - Add `faker`.
- [MODIFY] `back-end/settings.py` - Register new apps and configure `AUTH_USER_MODEL`.

### Existing Patterns to Follow

- Django 5.1 conventions for apps and models.
- Use of `TextChoices` for roles.

## Implementation Details

### Database Changes

- Custom User inheriting from `AbstractUser`.
- One-to-One relationship between `User` and `Profile`.
- ForeignKeys for `Education`, `Experience` (to `Profile`), and `Promotion` (to `Profile`).

### Seeding Script (`seed_db`)

- Use `Faker` (French locale recommended where appropriate).
- Generate `User` objects and corresponding `Profile`, `Education`, and `Experience` entries.
- Create at least 100 profiles.

## Validation Criteria

### Functional Requirements

- [ ] `accounts` and `alumni` apps are registered.
- [ ] `python manage.py makemigrations` and `migrate` run without errors.
- [ ] `python manage.py seed_db` populates the database with 100+ profiles.
- [ ] Users can be assigned roles (Super Admin, Admin, Member).

### Technical Requirements

- [ ] French documentation/comments where applicable (as per `GEMINI.md`).
- [ ] `faker` is listed in `requirements.txt`.
- [ ] `AUTH_USER_MODEL` is correctly set to `accounts.User`.

### Testing Steps

1. Run `pip install -r requirements.txt`.
2. Run `python manage.py makemigrations`.
3. Run `python manage.py migrate`.
4. Run `python manage.py seed_db`.
5. Verify data in the Django admin or via `python manage.py shell`.
