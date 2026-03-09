from django_filters import rest_framework as filters
from .models import Job

class JobFilter(filters.FilterSet):
    type = filters.ChoiceFilter(field_name='job_type', choices=Job.Type.choices)
    remote_status = filters.ChoiceFilter(choices=Job.RemoteStatus.choices)
    periodicity = filters.ChoiceFilter(choices=Job.Periodicity.choices)
    start_date = filters.DateFilter(field_name='start_date', lookup_expr='gte')

    class Meta:
        model = Job
        fields = ['type', 'remote_status', 'periodicity', 'start_date']
