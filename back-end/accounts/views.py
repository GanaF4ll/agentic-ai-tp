from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserSerializer, 
    InviteUserSerializer, 
    ChangePasswordSerializer
)
from .models import Role
from .permissions import IsSuperAdmin, IsAdmin
from .services import send_invitation_email

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class InviteAdminView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request):
        serializer = InviteUserSerializer(
            data=request.data, context={'role': Role.ADMIN}
        )
        if serializer.is_valid():
            temporary_password = serializer.validated_data['temporary_password']
            user = serializer.save()
            send_invitation_email(user, temporary_password, role='admin')
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InviteMemberView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = InviteUserSerializer(
            data=request.data, context={'role': Role.MEMBER}
        )
        if serializer.is_valid():
            temporary_password = serializer.validated_data['temporary_password']
            user = serializer.save()
            send_invitation_email(user, temporary_password, role='member')
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Mot de passe mis à jour avec succès."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
