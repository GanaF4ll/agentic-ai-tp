from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from accounts.models import Role
from accounts.permissions import IsAdmin
from .models import Profile, Promotion
from .serializers import ProfileSerializer, PromotionSerializer
from .filters import ProfileFilter

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.filter(user__role=Role.MEMBER).select_related('user', 'promotion')
    serializer_class = ProfileSerializer
    filterset_class = ProfileFilter

class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all().order_by('label')
    serializer_class = PromotionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]
 