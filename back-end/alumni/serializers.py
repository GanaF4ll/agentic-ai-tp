from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Promotion

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = ['id', 'label']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    promotion = PromotionSerializer(read_only=True)
    
    # For write operations
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    promotion_id = serializers.PrimaryKeyRelatedField(
        queryset=Promotion.objects.all(), source='promotion', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'user_id', 'bio', 'current_job_title', 
            'current_company', 'location', 'avatar_url', 
            'linkedin_url', 'graduation_year', 'degree', 
            'status', 'promotion', 'promotion_id', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
