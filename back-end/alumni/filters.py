from django_filters import rest_framework as filters
from .models import Profile

class ProfileFilter(filters.FilterSet):
    nom = filters.CharFilter(field_name='user__last_name', lookup_expr='icontains')
    prenom = filters.CharFilter(field_name='user__first_name', lookup_expr='icontains')
    promo = filters.CharFilter(field_name='promotion__label', lookup_expr='icontains')
    annee = filters.NumberFilter(field_name='graduation_year')

    class Meta:
        model = Profile
        fields = ['nom', 'prenom', 'promo', 'annee']
