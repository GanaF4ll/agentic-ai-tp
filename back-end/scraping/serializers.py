from rest_framework import serializers
from .models import LinkedInScrapingTask


class LinkedInScrapingTaskSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = LinkedInScrapingTask
        fields = [
            'id', 'user_email', 'user_first_name', 'user_last_name',
            'status', 'status_display', 'error_message',
            'scraped_at', 'created_at', 'updated_at',
        ]
        read_only_fields = fields
