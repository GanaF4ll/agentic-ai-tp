from rest_framework import serializers
from .models import Event, EventParticipant
from django.contrib.auth import get_user_model

User = get_user_model()

class ParticipantSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email

class EventSerializer(serializers.ModelSerializer):
    participants_count = serializers.IntegerField(source='participants.count', read_only=True)
    is_registered = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location', 'date', 
            'is_online', 'organizer', 'created_by', 'participants_count', 
            'is_registered', 'participants', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return EventParticipant.objects.filter(event=obj, user=request.user).exists()
        return False

    def get_participants(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role in ['ADMIN', 'SUPER_ADMIN']:
            participants = User.objects.filter(event_registrations__event=obj)
            return ParticipantSerializer(participants, many=True).data
        return None
