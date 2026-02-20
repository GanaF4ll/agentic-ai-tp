from rest_framework import viewsets
from .models import Profile
from .serializers import ProfileSerializer
from .filters import ProfileFilter

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all().select_related('user', 'promotion')
    serializer_class = ProfileSerializer
    filterset_class = ProfileFilter
