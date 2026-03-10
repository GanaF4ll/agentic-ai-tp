from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import IntegrityError
from accounts.models import Role
from accounts.permissions import IsAdmin
from .models import Profile, Promotion
from .serializers import ProfileSerializer, PromotionSerializer
from .filters import ProfileFilter

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.filter(user__role=Role.MEMBER).select_related('user', 'promotion')
    serializer_class = ProfileSerializer
    filterset_class = ProfileFilter

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def validate(self, request, pk=None):
        profile = self.get_object()
        if profile.status == Profile.Status.VERIFIED:
            return Response({"detail": "Déjà validé."}, status=status.HTTP_400_BAD_REQUEST)
        if profile.user.role != Role.MEMBER:
            return Response({"detail": "Seuls les membres peuvent être validés."}, status=status.HTTP_400_BAD_REQUEST)
        
        profile.status = Profile.Status.VERIFIED
        profile.save()
        return Response(self.get_serializer(profile).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def count_pending(self, request):
        count = Profile.objects.filter(status=Profile.Status.DRAFT).count()
        return Response({"count": count})

class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all().order_by('label')
    serializer_class = PromotionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    def _conflict_response(self):
        return Response(
            {"detail": "Une promotion avec ce libellé existe déjà (Conflit)."},
            status=status.HTTP_409_CONFLICT
        )

    def _is_duplicate_label_error(self, exc):
        if not isinstance(getattr(exc, "detail", None), dict):
            return False

        label_errors = exc.detail.get("label", [])
        return any(getattr(error, "code", None) == "unique" for error in label_errors)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
        except IntegrityError:
            return self._conflict_response()
        except ValidationError as exc:
            if self._is_duplicate_label_error(exc):
                return self._conflict_response()
            raise

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
        except IntegrityError:
            return self._conflict_response()
        except ValidationError as exc:
            if self._is_duplicate_label_error(exc):
                return self._conflict_response()
            raise

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
 