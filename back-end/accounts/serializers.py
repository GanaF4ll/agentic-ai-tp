from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from .models import User, Role

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'graduation_year', 'degree', 'is_profile_public', 'must_change_password', 'is_active')
        read_only_fields = ('id', 'email', 'role', 'must_change_password', 'is_active')

class AdminCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'role')

    def create(self, validated_data):
        temp_password = get_random_string(length=12)
        role = validated_data.get('role', Role.ADMIN)
        is_staff = role in (Role.ADMIN, Role.SUPER_ADMIN)
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=temp_password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=role,
            is_staff=is_staff,
            must_change_password=True
        )

        # Send email with temporary password
        send_mail(
            subject='Your Admin Account Credentials',
            message=f'Welcome! Your temporary password is: {temp_password}\n\nPlease change it upon login.',
            from_email=None,  # Uses DEFAULT_FROM_EMAIL
            recipient_list=[user.email],
            fail_silently=False,
        )

        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
