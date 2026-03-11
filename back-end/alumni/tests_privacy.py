from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from accounts.models import Role
from .models import Profile, Experience

User = get_user_model()

class ProfilePrivacyTests(APITestCase):
    def setUp(self):
        # Alice is a MEMBER with a PRIVATE profile
        self.user_a = User.objects.create_user(
            email="alice@test.com", 
            password="password",
            first_name="Alice",
            last_name="Alumni"
        )
        self.profile_a = Profile.objects.create(
            user=self.user_a,
            graduation_year=2023,
            is_visible=False, # PRIVATE
            linkedin_url="https://linkedin.com/alice"
        )

        # Bob is another MEMBER
        self.user_b = User.objects.create_user(
            email="bob@test.com", 
            password="password",
            first_name="Bob",
            last_name="Member"
        )
        
        # Charlie is an ADMIN
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="password",
            role=Role.ADMIN,
            is_staff=True
        )

    def test_member_sees_masked_private_profile(self):
        """A MEMBER should see 'Privé' for email and None for LinkedIn on a private profile."""
        self.client.force_authenticate(user=self.user_b)
        url = reverse('profile-detail', args=[self.profile_a.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], "Privé")
        self.assertIsNone(response.data['linkedin_url'])

    def test_admin_sees_full_private_profile(self):
        """An ADMIN should see the full email and LinkedIn even on a private profile."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('profile-detail', args=[self.profile_a.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], self.user_a.email)
        self.assertEqual(response.data['linkedin_url'], self.profile_a.linkedin_url)

    def test_owner_sees_own_full_private_profile(self):
        """A user should see their own full data even if their profile is private."""
        self.client.force_authenticate(user=self.user_a)
        url = reverse('profile-detail', args=[self.profile_a.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], self.user_a.email)
        self.assertEqual(response.data['linkedin_url'], self.profile_a.linkedin_url)

    def test_member_sees_full_public_profile(self):
        """A MEMBER should see full data on a PUBLIC profile."""
        self.profile_a.is_visible = True
        self.profile_a.save()
        
        self.client.force_authenticate(user=self.user_b)
        url = reverse('profile-detail', args=[self.profile_a.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], self.user_a.email)
        self.assertEqual(response.data['linkedin_url'], self.profile_a.linkedin_url)
