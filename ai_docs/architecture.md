# Architecture AlumniConnect

## Stack Technique

| Layer           | Technology                                   | Version                        |
| --------------- | -------------------------------------------- | ------------------------------ |
| Frontend        | Angular (Standalone Components)              | ^21.0.0                        |
| Styling         | Tailwind CSS + DaisyUI                       | ^4.1.12 / ^5.x                 |
| Testing Backend | pytest + pytest-django + factory-boy + faker | >=8.0 / >=4.7 / >=3.3 / >=22.0 |
| Backend         | Django + Django REST Framework               | 5.1 / 3.15                     |
| Auth            | dj-rest-auth + django-allauth + SimpleJWT    | 7.0.1 / 65.13.0 / 5.5.1        |
| Database        | PostgreSQL                                   | 16 (Alpine)                    |
| Driver DB       | psycopg2-binary                              | ^2.9                           |
| CORS            | django-cors-headers                          | ^4.6                           |
| WSGI Server     | Gunicorn                                     | ^23.0                          |
| Orchestration   | Docker Compose                               | -                              |

## Structure Monorepo

```
agentic-ai-tp/
├── back-end/                         # API Django REST Framework
│   ├── config/                       # Settings Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── accounts/                     # App: Auth, Users, Roles
│   │   ├── models.py                 # User custom, Role enum
│   │   ├── serializers.py
│   │   ├── views.py                  # ViewSets
│   │   ├── permissions.py            # IsSuperAdmin, IsAdmin, IsMember
│   │   └── urls.py
│   ├── alumni/                       # App: Profils Alumni
│   │   ├── models.py                 # Profile, Education, Experience
│   │   ├── serializers.py
│   │   ├── views.py                  # ProfileViewSet, EducationViewSet
│   │   ├── filters.py               # Filtres par diplôme, année, etc.
│   │   └── urls.py
│   ├── scraping/                     # App: Scraping LinkedIn
│   │   ├── management/commands/      # Commandes CLI Django
│   │   ├── scraper.py                # Logique de scraping
│   │   └── exporters.py              # Export CSV/JSON
│   ├── networking/                   # App: Mise en relation
│   ├── jobs/                         # App: Job Board
│   ├── events/                       # App: Événements
│   ├── data/staging/                 # Fichiers CSV/JSON scraping
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── front-end/                        # SPA Angular 21
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                 # Guards, Interceptors, Services globaux
│   │   │   │   ├── auth/             # AuthService, JWT Interceptor
│   │   │   │   ├── guards/           # RoleGuard, AuthGuard
│   │   │   │   └── services/         # ApiService (HttpClient wrapper)
│   │   │   ├── shared/               # Composants réutilisables, pipes, directives
│   │   │   ├── features/             # Modules par fonctionnalité
│   │   │   │   ├── admin/            # Dashboard Admin
│   │   │   │   ├── alumni/           # Annuaire, profils
│   │   │   │   ├── jobs/             # Job Board
│   │   │   │   └── events/           # Événements
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── main.ts
│   │   ├── styles.css
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   └── Dockerfile
│
├── ai_docs/                          # Documentation pour IA (ce dossier)
├── PRPs/                             # Product Requirement Prompts
├── concept_library/                  # Templates PRP
├── docker-compose.yml
├── Makefile
└── GEMINI.md
```

## Rôles & Permissions

| Rôle            | Code          | Portée                     | Exemples d'actions                                                        |
| --------------- | ------------- | -------------------------- | ------------------------------------------------------------------------- |
| Super Admin     | `SUPER_ADMIN` | Toute la plateforme        | CRUD users, valider profils DRAFT, gérer rôles, accéder aux logs scraping |
| Admin           | `ADMIN`       | Gestion courante           | Modérer profils, gérer événements et jobs, voir statistiques              |
| Membre (Alumni) | `MEMBER`      | Son propre profil + réseau | Éditer son profil, postuler aux jobs, contacter d'autres alumni           |

### Modèle User Custom

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class Role(models.TextChoices):
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Administrateur'
    ADMIN = 'ADMIN', 'Administrateur'
    MEMBER = 'MEMBER', 'Membre (Alumni)'

class User(AbstractUser):
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    linkedin_url = models.URLField(blank=True, null=True)
    graduation_year = models.PositiveIntegerField(blank=True, null=True)
    degree = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_profile_public = models.BooleanField(default=True)

    @property
    def is_super_admin(self):
        return self.role == Role.SUPER_ADMIN

    @property
    def is_admin(self):
        return self.role in (Role.SUPER_ADMIN, Role.ADMIN)
```

## Authentification (JWT Flow)

```
┌──────────┐     POST /api/auth/login/      ┌──────────────┐
│  Angular  │ ──────────────────────────────▶│  dj-rest-auth │
│  Client   │◀────────────────────────────── │  + SimpleJWT  │
│           │   { access, refresh, user }    └──────┬───────┘
│           │                                       │
│  Bearer   │     GET /api/alumni/profiles/         │ django-allauth
│  access   │ ──────────────────────────────▶│      │ (registration,
│  token    │                                │  DRF │  social login,
│           │     POST /api/auth/token/      │      │  email verify)
│           │          refresh/              │      │
│           │ ──────────────────────────────▶│      │
└──────────┘                                └──────┘
```

### Config packages auth

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'dj_rest_auth',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'dj_rest_auth.registration',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

## Design Patterns

### 1. ViewSet + Router (DRF)

Tous les endpoints CRUD utilisent `ModelViewSet` avec enregistrement automatique via `DefaultRouter`.

```python
# alumni/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action

class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.select_related('user').all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filterset_class = ProfileFilter

    def get_queryset(self):
        """Scoping: membres voient les profils publics, admins voient tout."""
        if self.request.user.is_admin:
            return self.queryset
        return self.queryset.filter(is_public=True)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """GET /api/alumni/profiles/me/ — profil de l'utilisateur connecté."""
        serializer = self.get_serializer(request.user.profile)
        return Response(serializer.data)
```

```python
# alumni/urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)
urlpatterns = router.urls
```

### 2. Service Layer Pattern

Séparer la logique métier des views pour la testabilité.

```python
# alumni/services.py
class AlumniService:
    @staticmethod
    def infer_graduation_year(profile_data: dict) -> int | None:
        """Déduit l'année de diplôme depuis les expériences LinkedIn."""
        education = profile_data.get('education', [])
        for edu in education:
            if edu.get('year'):
                return int(edu['year'])
        # Fallback : première expérience pro - 5 ans
        experience = profile_data.get('experience', [])
        if experience:
            first_year = extract_year(experience[-1].get('duration', ''))
            if first_year:
                return first_year - 5
        return None
```

### 3. Permission Classes Pattern

Permissions granulaires par rôle, composables sur chaque ViewSet.

```python
# accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('SUPER_ADMIN', 'ADMIN')

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        return obj.user == request.user
```

### 4. Serializer Nesting + Validation

Serializers imbriqués pour les données relationnelles, avec validation RGPD.

```python
# alumni/serializers.py
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['school', 'degree', 'year']

class ProfileSerializer(serializers.ModelSerializer):
    education = EducationSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'full_name', 'linkedin_url', 'email',
                  'graduation_year', 'degree', 'education', 'is_public']
        read_only_fields = ['id']
```

### 5. Filter + Search Pattern (django-filter)

Filtrage avancé pour l'annuaire alumni.

```python
# alumni/filters.py
import django_filters

class ProfileFilter(django_filters.FilterSet):
    year_min = django_filters.NumberFilter(field_name='graduation_year', lookup_expr='gte')
    year_max = django_filters.NumberFilter(field_name='graduation_year', lookup_expr='lte')
    degree = django_filters.CharFilter(field_name='degree', lookup_expr='icontains')

    class Meta:
        model = Profile
        fields = ['graduation_year', 'degree']
```

### 6. Strategy Pattern (Scraping Exports)

Interchangeabilité des formats d'export (CSV, JSON) sans modifier le moteur.

```python
# scraping/exporters.py
from abc import ABC, abstractmethod

class BaseExporter(ABC):
    @abstractmethod
    def export(self, data: list[dict], filepath: str) -> str: ...

class CSVExporter(BaseExporter):
    def export(self, data, filepath):
        # Écriture CSV avec le module natif
        ...

class JSONExporter(BaseExporter):
    def export(self, data, filepath):
        # Écriture JSON
        ...
```

### 7. Angular — Feature-based Lazy Loading

Chaque feature est lazy-loaded pour optimiser le bundle initial.

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: "admin",
    loadChildren: () => import("./features/admin/admin.routes"),
    canActivate: [authGuard, roleGuard("ADMIN")],
  },
  {
    path: "alumni",
    loadChildren: () => import("./features/alumni/alumni.routes"),
    canActivate: [authGuard],
  },
  { path: "jobs", loadChildren: () => import("./features/jobs/jobs.routes") },
];
```

### 8. Angular — HTTP Interceptor (JWT)

Injection automatique du token Bearer dans chaque requête API.

```typescript
// core/auth/jwt.interceptor.ts
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getAccessToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
```

## Testing (Backend uniquement)

> **Pas de tests frontend.** Les tests sont exclusivement côté back-end.

### Stack de test

```txt
pytest>=8.0
pytest-django>=4.7
pytest-cov>=4.1
factory-boy>=3.3
faker>=22.0
pytest-mock>=3.12
markdown>=3.0
```

### Organisation des tests

```
back-end/
├── conftest.py                       # Fixtures globales (db, client, users)
├── accounts/
│   └── tests/
│       ├── test_models.py
│       ├── test_views.py
│       └── test_permissions.py
├── alumni/
│   └── tests/
│       ├── test_models.py
│       ├── test_views.py
│       ├── test_services.py
│       └── test_filters.py
└── scraping/
    └── tests/
        ├── test_scraper.py
        └── test_exporters.py
```

### Factory Pattern (factory-boy + faker)

```python
# conftest.py
import factory
from faker import Faker

fake = Faker('fr_FR')

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = 'accounts.User'

    username = factory.LazyFunction(lambda: fake.user_name())
    email = factory.LazyFunction(lambda: fake.email())
    first_name = factory.LazyFunction(lambda: fake.first_name())
    last_name = factory.LazyFunction(lambda: fake.last_name())
    role = 'MEMBER'

class AdminFactory(UserFactory):
    role = 'ADMIN'

class SuperAdminFactory(UserFactory):
    role = 'SUPER_ADMIN'

@pytest.fixture
def member(db):
    return UserFactory()

@pytest.fixture
def admin(db):
    return AdminFactory()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def auth_client(api_client, member):
    api_client.force_authenticate(user=member)
    return api_client
```

### Commandes

```bash
# Lancer les tests
pytest
# Avec couverture
pytest --cov=. --cov-report=html
# Un module spécifique
pytest alumni/tests/test_views.py -v
```

## Infrastructure Docker

```yaml
# docker-compose.yml — 3 services
db: postgres:16-alpine  → port 5432
back-end: Django/Gunicorn     → port 8000
front-end: Angular/Nginx       → port 4200 (→ 80 interne)
```

Commandes utiles :

```bash
docker compose up -d          # Lancer tous les services
docker compose exec back-end python manage.py migrate
docker compose exec back-end python manage.py createsuperuser
```
