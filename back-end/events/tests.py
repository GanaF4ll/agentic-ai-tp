from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from accounts.models import Role
from .models import Event, EventParticipant

User = get_user_model()

class EventAPITests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="password",
            role=Role.ADMIN,
            is_staff=True
        )
        self.member_user = User.objects.create_user(
            email="member@test.com",
            password="password",
            role=Role.MEMBER
        )
        self.upcoming_event = Event.objects.create(
            title="Upcoming Online",
            description="Future event",
            location="Zoom",
            date=timezone.now() + timedelta(days=7),
            organizer="Tech Club",
            is_online=True,
            created_by=self.admin_user
        )
        self.past_event = Event.objects.create(
            title="Past Event",
            description="Old event",
            location="Paris",
            date=timezone.now() - timedelta(days=7),
            organizer="Alumni Association",
            is_online=False,
            created_by=self.admin_user
        )
        self.url = reverse('event-list')

    def test_create_event_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "title": "New Event",
            "description": "Desc",
            "location": "Loc",
            "date": (timezone.now() + timedelta(days=1)).isoformat(),
            "organizer": "Org",
            "is_online": False
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_events_pagination(self):
        self.client.force_authenticate(user=self.member_user)
        response = self.client.get(self.url, {'limit': 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['count'], 2)

    def test_filter_events_by_title(self):
        self.client.force_authenticate(user=self.member_user)
        response = self.client.get(self.url, {'title': 'Upcoming'})
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], "Upcoming Online")

    def test_filter_events_by_online_status(self):
        self.client.force_authenticate(user=self.member_user)
        response = self.client.get(self.url, {'is_online': 'true'})
        self.assertEqual(len(response.data['results']), 1)
        self.assertTrue(response.data['results'][0]['is_online'])

    def test_cannot_modify_past_event(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('event-detail', args=[self.past_event.id])
        response = self.client.patch(url, {"title": "Updated Title"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cannot modify a past event.", str(response.data))

    def test_cannot_delete_past_event(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('event-detail', args=[self.past_event.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cannot delete a past event.", str(response.data))

    def test_my_events_endpoint(self):
        # Register member to both events
        EventParticipant.objects.create(event=self.upcoming_event, user=self.member_user)
        EventParticipant.objects.create(event=self.past_event, user=self.member_user)
        
        self.client.force_authenticate(user=self.member_user)
        url = reverse('event-my-events')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['upcoming']), 1)
        self.assertEqual(len(response.data['past']), 1)
        self.assertEqual(response.data['upcoming'][0]['id'], self.upcoming_event.id)
        self.assertEqual(response.data['past'][0]['id'], self.past_event.id)

    def test_register_past_event_denied(self):
        self.client.force_authenticate(user=self.member_user)
        url = reverse('event-register', args=[self.past_event.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cannot register for a past event.", response.data['detail'])

    def test_participants_visibility(self):
        # Register member to upcoming event
        EventParticipant.objects.create(event=self.upcoming_event, user=self.member_user)
        
        # Admin should see participants
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('event-detail', args=[self.upcoming_event.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('participants', response.data)
        self.assertEqual(len(response.data['participants']), 1)
        self.assertEqual(response.data['participants'][0]['email'], self.member_user.email)

        # Member should NOT see participants
        self.client.force_authenticate(user=self.member_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['participants'])
