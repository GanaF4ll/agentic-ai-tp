from rest_framework import viewsets, status, pagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event, EventParticipant
from .serializers import EventSerializer
from .filters import EventFilter
from accounts.permissions import IsAdmin

class EventPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit'
    max_page_size = 100

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    pagination_class = EventPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = EventFilter

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'register', 'unregister', 'my_events']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        event = self.get_object()
        if event.date < timezone.now():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Cannot modify a past event.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.date < timezone.now():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Cannot delete a past event.")
        instance.delete()

    @action(detail=False, methods=['get'])
    def my_events(self, request):
        user = request.user
        registrations = EventParticipant.objects.filter(user=user).select_related('event')
        
        now = timezone.now()
        upcoming = [r.event for r in registrations if r.event.date >= now]
        past = [r.event for r in registrations if r.event.date < now]
        
        return Response({
            "upcoming": EventSerializer(upcoming, many=True, context={'request': request}).data,
            "past": EventSerializer(past, many=True, context={'request': request}).data
        })

    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        if event.date < timezone.now():
            return Response(
                {"detail": "Cannot register for a past event."},
                status=status.HTTP_400_BAD_REQUEST
            )

        participant, created = EventParticipant.objects.get_or_create(
            event=event,
            user=user
        )
        
        if not created:
            return Response(
                {"detail": "Already registered for this event."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        return Response(
            {"detail": "Successfully registered for the event."},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def unregister(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        try:
            participant = EventParticipant.objects.get(event=event, user=user)
            participant.delete()
            return Response(
                {"detail": "Successfully unregistered from the event."},
                status=status.HTTP_204_NO_CONTENT
            )
        except EventParticipant.DoesNotExist:
            return Response(
                {"detail": "You are not registered for this event."},
                status=status.HTTP_400_BAD_REQUEST
            )
