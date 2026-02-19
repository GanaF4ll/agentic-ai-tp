# Patterns de Code AlumniConnect

## 1. ViewSet Pattern (DRF)

Toutes les vues API utilisent des `ModelViewSet` avec le `DefaultRouter`.

```python
# alumni/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response

class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.select_related('user').prefetch_related('educations', 'experiences')
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filterset_class = ProfileFilter

    def get_queryset(self):
        """Scoping : membres voient les profils publics, admins voient tout."""
        if self.request.user.is_admin:
            return self.queryset.all()
        return self.queryset.filter(user__is_profile_public=True)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """GET /api/alumni/profiles/me/"""
        serializer = self.get_serializer(request.user.profile)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsSuperAdmin])
    def validate(self, request, pk=None):
        """POST /api/alumni/profiles/{id}/validate/ — Valide un profil DRAFT."""
        profile = self.get_object()
        profile.status = 'VERIFIED'
        profile.save()
        return Response({'status': 'verified'})
```

### Router Registration

```python
# alumni/urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'educations', EducationViewSet, basename='education')
urlpatterns = router.urls
```

### URL Configuration

```python
# config/urls.py
from django.urls import path, include

urlpatterns = [
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/alumni/', include('alumni.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/events/', include('events.urls')),
    path('api/networking/', include('networking.urls')),
]
```

## 2. Permission Classes Pattern

Permissions composables par rôle, appliquées sur chaque ViewSet.

```python
# accounts/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('SUPER_ADMIN', 'ADMIN')

class IsOwnerOrAdmin(BasePermission):
    """Lecture pour tous les authentifiés, écriture pour le propriétaire ou un admin."""
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_admin:
            return True
        return obj.user == request.user

class IsOwnerOrReadOnly(BasePermission):
    """Le propriétaire peut modifier, les autres ne font que lire."""
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.user == request.user
```

## 3. Serializer Pattern

Serializers imbriqués avec validation métier.

```python
# alumni/serializers.py
from rest_framework import serializers

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'school', 'degree', 'year']

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'title', 'company', 'start_date', 'end_date', 'description']

class ProfileSerializer(serializers.ModelSerializer):
    educations = EducationSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'full_name', 'bio', 'current_job_title', 'current_company',
            'location', 'avatar_url', 'status', 'educations', 'experiences',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
```

## 4. Service Layer Pattern

Isoler la logique métier dans des services pour la testabilité.

```python
# alumni/services.py
class AlumniService:
    @staticmethod
    def infer_graduation_year(profile_data: dict) -> int | None:
        """Déduit l'année de diplôme depuis les données LinkedIn."""
        education = profile_data.get('education', [])
        for edu in education:
            if edu.get('year'):
                return int(edu['year'])
        return None

    @staticmethod
    def create_profile_from_csv_row(row: dict, created_by: 'User') -> Profile:
        """Crée un profil DRAFT à partir d'une ligne CSV scrappée."""
        user = User.objects.create_user(
            username=row['linkedin_url'].split('/')[-1],
            first_name=row.get('first_name', ''),
            last_name=row.get('last_name', ''),
            email=row.get('email', ''),
        )
        profile = Profile.objects.create(user=user, status='DRAFT')
        if row.get('school'):
            Education.objects.create(
                profile=profile,
                school=row['school'],
                degree=row.get('degree', ''),
                year=row.get('year'),
            )
        return profile
```

## 5. Filter Pattern (django-filter)

Filtrage avancé pour les listes avec support query params.

```python
# alumni/filters.py
import django_filters
from alumni.models import Profile

class ProfileFilter(django_filters.FilterSet):
    year_min = django_filters.NumberFilter(field_name='user__graduation_year', lookup_expr='gte')
    year_max = django_filters.NumberFilter(field_name='user__graduation_year', lookup_expr='lte')
    degree = django_filters.CharFilter(field_name='user__degree', lookup_expr='icontains')
    search = django_filters.CharFilter(method='search_filter')
    status = django_filters.ChoiceFilter(choices=[('DRAFT', 'Draft'), ('VERIFIED', 'Verified')])

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            models.Q(user__first_name__icontains=value) |
            models.Q(user__last_name__icontains=value) |
            models.Q(current_company__icontains=value)
        )

    class Meta:
        model = Profile
        fields = ['status']
```

Usage : `GET /api/alumni/profiles/?year_min=2020&degree=master&search=dupont`

## 6. Angular — Standalone Component Pattern

```typescript
// features/alumni/alumni-list/alumni-list.component.ts
import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AlumniService } from "./alumni.service";

@Component({
  selector: "app-alumni-list",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @for (alumni of alumniList(); track alumni.id) {
      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <h2 class="card-title">{{ alumni.full_name }}</h2>
          <p>{{ alumni.current_job_title }} — {{ alumni.current_company }}</p>
          <div class="card-actions justify-end">
            <a
              [routerLink]="['/alumni', alumni.id]"
              class="btn btn-primary btn-sm"
              >Voir</a
            >
          </div>
        </div>
      </div>
    }
  `,
})
export class AlumniListComponent implements OnInit {
  private alumniService = inject(AlumniService);
  alumniList = signal<Profile[]>([]);

  ngOnInit() {
    this.alumniService
      .getAll()
      .subscribe((data) => this.alumniList.set(data.results));
  }
}
```

## 7. Angular — HTTP Interceptor (JWT)

```typescript
// core/auth/jwt.interceptor.ts
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};
```

## 8. Angular — Role Guard

```typescript
// core/guards/role.guard.ts
import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../auth/auth.service";

export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }
    return router.createUrlTree(["/unauthorized"]);
  };
}
```

## 9. Test Pattern (pytest + factory-boy)

```python
# alumni/tests/test_views.py
import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestProfileViewSet:
    def test_list_profiles_authenticated(self, auth_client):
        response = auth_client.get('/api/alumni/profiles/')
        assert response.status_code == 200

    def test_list_profiles_unauthenticated(self):
        client = APIClient()
        response = client.get('/api/alumni/profiles/')
        assert response.status_code == 401

    def test_admin_sees_all_profiles(self, admin, api_client):
        api_client.force_authenticate(user=admin)
        response = api_client.get('/api/alumni/profiles/')
        assert response.status_code == 200

    def test_validate_profile_requires_superadmin(self, auth_client, profile):
        response = auth_client.post(f'/api/alumni/profiles/{profile.id}/validate/')
        assert response.status_code == 403
```
