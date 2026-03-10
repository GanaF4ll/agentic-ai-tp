from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from accounts.models import Role
from .models import Profile, Promotion

User = get_user_model()

class ProfileAPITests(APITestCase):
    def setUp(self):
        # Create some promotions
        self.promo2023 = Promotion.objects.create(label="Promotion 2023")
        self.promo2024 = Promotion.objects.create(label="Promotion 2024")

        # Create some users and profiles
        self.user1 = User.objects.create_user(
            email="user1@test.com", 
            password="password",
            first_name="Jean",
            last_name="Dupont"
        )
        self.profile1 = Profile.objects.create(
            user=self.user1,
            graduation_year=2023,
            promotion=self.promo2023,
            status=Profile.Status.VERIFIED
        )

        self.user2 = User.objects.create_user(
            email="user2@test.com", 
            password="password",
            first_name="Marie",
            last_name="Durand"
        )
        self.profile2 = Profile.objects.create(
            user=self.user2,
            graduation_year=2024,
            promotion=self.promo2024,
            status=Profile.Status.VERIFIED
        )

        self.user3 = User.objects.create_user(
            email="user3@test.com", 
            password="password",
            first_name="Jean-Luc",
            last_name="Durand"
        )
        self.profile3 = Profile.objects.create(
            user=self.user3,
            graduation_year=2023,
            promotion=self.promo2023,
            status=Profile.Status.VERIFIED
        )

        self.url = reverse('profile-list')
        self.client.force_authenticate(user=self.user1)

    def test_get_profiles_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_filter_by_nom(self):
        response = self.client.get(self.url, {'nom': 'Durand'})
        self.assertEqual(len(response.data), 2)
        for profile in response.data:
            self.assertIn('Durand', profile['user']['last_name'])

    def test_filter_by_prenom(self):
        response = self.client.get(self.url, {'prenom': 'Jean'})
        self.assertEqual(len(response.data), 2) # Jean Dupont and Jean-Luc Durand

    def test_filter_by_annee(self):
        response = self.client.get(self.url, {'annee': 2023})
        self.assertEqual(len(response.data), 2)

    def test_filter_by_promo(self):
        response = self.client.get(self.url, {'promo': '2024'})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['promotion']['label'], 'Promotion 2024')

    def test_cumulative_filters(self):
        # Nom + Annee
        response = self.client.get(self.url, {'nom': 'Durand', 'annee': 2023})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['user']['last_name'], 'Durand')
        self.assertEqual(response.data[0]['graduation_year'], 2023)

        # Prenom + Promo
        response = self.client.get(self.url, {'prenom': 'Jean', 'promo': '2023'})
        self.assertEqual(len(response.data), 2) # Both Jean and Jean-Luc are in 2023

    def test_create_profile(self):
        new_user = User.objects.create_user(email="newuser@test.com", password="password")
        data = {
            'user_id': new_user.id,
            'graduation_year': 2025,
            'bio': 'New bio'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Profile.objects.count(), 4)

    def test_update_profile(self):
        url = reverse('profile-detail', args=[self.profile1.id])
        data = {'bio': 'Updated bio'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile1.refresh_from_db()
        self.assertEqual(self.profile1.bio, 'Updated bio')

    def test_delete_profile(self):
        url = reverse('profile-detail', args=[self.profile1.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Profile.objects.count(), 2)

class PromotionAPITests(APITestCase):
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
        self.promo = Promotion.objects.create(label="Promotion 2024")
        self.url = reverse('promotion-list')

    def test_list_promotions_authenticated(self):
        self.client.force_authenticate(user=self.member_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_promotion_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {"label": "Promotion 2025"}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Promotion.objects.count(), 2)

    def test_create_promotion_member_denied(self):
        self.client.force_authenticate(user=self.member_user)
        data = {"label": "Promotion 2025"}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_promotion_duplicate_returns_conflict(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {"label": "Promotion 2024"}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_update_promotion_duplicate_returns_conflict(self):
        self.client.force_authenticate(user=self.admin_user)
        other_promo = Promotion.objects.create(label="Promotion 2025")
        url = reverse('promotion-detail', args=[other_promo.id])
        data = {"label": "Promotion 2024"}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_update_promotion_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('promotion-detail', args=[self.promo.id])
        data = {"label": "Updated Label"}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.promo.refresh_from_db()
        self.assertEqual(self.promo.label, "Updated Label")

    def test_delete_promotion_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('promotion-detail', args=[self.promo.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Promotion.objects.count(), 0)
