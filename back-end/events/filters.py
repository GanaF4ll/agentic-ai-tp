from django_filters import rest_framework as filters
from .models import Event

class EventFilter(filters.FilterSet):
    title = filters.CharFilter(lookup_expr='icontains')
    date_from = filters.DateTimeFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateTimeFilter(field_name='date', lookup_expr='lte')
    is_online = filters.BooleanFilter()

    class Meta:
        model = Event
        fields = ['title', 'is_online']
