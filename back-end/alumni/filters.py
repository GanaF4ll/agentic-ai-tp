from django_filters import rest_framework as filters
from django.db.models import Q
from .models import Profile

class ProfileFilter(filters.FilterSet):
    nom = filters.CharFilter(field_name='user__last_name', lookup_expr='icontains')
    prenom = filters.CharFilter(field_name='user__first_name', lookup_expr='icontains')
    promo = filters.CharFilter(field_name='promotion__label', lookup_expr='icontains')
    annee = filters.NumberFilter(field_name='graduation_year')
    
    # Frontend aliases/new filters
    search = filters.CharFilter(method='filter_search')
    graduation_year = filters.NumberFilter(field_name='graduation_year')
    degree = filters.CharFilter(field_name='degree', lookup_expr='icontains')

    class Meta:
        model = Profile
        fields = ['nom', 'prenom', 'promo', 'annee', 'search', 'graduation_year', 'degree']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(user__first_name__icontains=value) |
            Q(user__last_name__icontains=value) |
            Q(current_job_title__icontains=value) |
            Q(current_company__icontains=value) |
            Q(bio__icontains=value) |
            Q(degree__icontains=value)
        )
