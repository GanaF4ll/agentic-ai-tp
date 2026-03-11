from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from accounts.models import Role
from .models import Profile, Experience

User = get_user_model()

class ProfilePrivacyTests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(
            email="user_a@test.com", 
            password="password",
            first_name="Alice",
            last_name="Alumni"
        )
        self.profile_a = Profile.objects.create(
            user=self.user_a,
            graduation_year=2023,
            is_visible=True,
            linkedin_url="https://linkedin.com/alice"
        )
        Experience.objects.create(
            profile=self.profile_a,
            title="Dev",
            company="TechCorp",
            start_date="2023-01-01"
        )

        self.user_b = User.objects.create_user(
            email="user_b@test.com", 
            password="password",
            first_name="Bob",
            last_name="Member"
        )
        
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="password",
            role=Role.ADMIN,
            is_staff=True
        )

    def test_get_my_profile(self):
        self.client.force_authenticate(user=self.user_a)
        url = reverse('profile-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], self.user_a.email)
        self.assertEqual(len(response.data['experiences']), 1)

    def test_toggle_visibility(self):
        self.client.force_authenticate(user=self.user_a)
        url = reverse('profile-me')
        response = self.client.patch(url, {'is_visible': False})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile_a.refresh_from_db()
        self.assertFalse(self.profile_a.is_visible)

    def test_privacy_masking_for_other_member(self):
        # Alice is invisible
        self.profile_a.is_visible = False
        self.profile_a.save()
        
        # Bob tries to see Alice
        self.client.force_authenticate(user=self.user_b)
        url = reverse('profile-detail', args=[self.profile_a.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], "Privé")
        self.assertIsNone(response.data['linkedin_url'])
        # Experiences should still be visible (not explicitly requested to mask them)
        self.assertEqual(len(response.data['experiences']), 1)

    def test_privacy_not_masked_for_admin(self):
        # Alice is invisible
        self.profile_a.is_visible = False
        self.profile_a.save()
        
        # Admin tries to see Alice
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('profile-detail', args=[self.profile_a.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], self.user_a.email)
        self.assertEqual(response.data['linkedin_url'], self.profile_a.linkedin_url)
