from rest_framework import status, generics, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import django_filters

from .models import User, Role
from .serializers import UserSerializer, AdminCreationSerializer
from .permissions import IsSuperAdmin, IsAdmin


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass


class UserFilter(django_filters.FilterSet):
    role = CharInFilter(field_name='role', lookup_expr='in')

    class Meta:
        model = User
        fields = ['role']


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filterset_class = UserFilter

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'is_active': user.is_active})

    @action(detail=True, methods=['post'])
    def revoke_admin(self, request, pk=None):
        user = self.get_object()
        
        if user == request.user:
            return Response(
                {'detail': 'Vous ne pouvez pas révoquer vos propres accès administrateur.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user.role == 'MEMBER':
            return Response(
                {'detail': 'Cet utilisateur est déjà un membre régulier.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        from .models import Role
        user.role = Role.MEMBER
        user.is_staff = False
        user.save()
        
        return Response(UserSerializer(user).data)

    @action(detail=False, methods=['post'], serializer_class=AdminCreationSerializer)
    def create_admin(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminCreateView(generics.CreateAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = AdminCreationSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'Identifiants invalides.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({'detail': 'Identifiants invalides.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'detail': 'Ce compte est désactivé.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('refresh', '')
        try:
            refresh = RefreshToken(token)
            return Response({'access': str(refresh.access_token)})
        except Exception:
            return Response({'detail': 'Token invalide ou expiré.'}, status=status.HTTP_401_UNAUTHORIZED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
