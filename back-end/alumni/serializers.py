from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Promotion, Experience

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = ['id', 'label', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_label(self, value):
        queryset = Promotion.objects.filter(label=value)

        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "Une promotion avec ce libellé existe déjà.",
                code="unique",
            )

        return value

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'title', 'company', 'start_date', 'end_date', 'description']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    promotion = PromotionSerializer(read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    
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
            'status', 'promotion', 'promotion_id', 'is_visible',
            'experiences', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def to_representation(self, instance):
        """Mask sensitive data if profile is not visible and requester is not admin or owner."""
        data = super().to_representation(instance)
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            # Should not happen with IsAuthenticated, but safe check
            data['user']['email'] = None
            data['linkedin_url'] = None
            return data

        # Check if masking is needed
        is_owner = request.user == instance.user
        is_admin = getattr(request.user, 'role', None) in ('ADMIN', 'SUPER_ADMIN')

        if not instance.is_visible and not is_owner and not is_admin:
            # Mask sensitive info
            if 'user' in data:
                data['user']['email'] = "Privé"
            data['linkedin_url'] = None

        return data
