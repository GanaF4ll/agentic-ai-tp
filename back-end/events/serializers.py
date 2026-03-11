from rest_framework import serializers
from .models import Event, EventParticipant

class EventSerializer(serializers.ModelSerializer):
    participants_count = serializers.IntegerField(source='participants.count', read_only=True)
    is_registered = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location', 'date', 
            'is_online', 'organizer', 'created_by', 'participants_count', 
            'is_registered', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return EventParticipant.objects.filter(event=obj, user=request.user).exists()
        return False
