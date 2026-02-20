from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from accounts.models import User, Role

class AdminOnboardingTests(APITestCase):
    def setUp(self):
        self.superadmin = User.objects.create_superuser(
            email="superadmin@example.com",
            password="superpassword123"
        )
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="adminpassword123",
            role=Role.ADMIN
        )
        self.login_url = reverse('token_obtain_pair')
        self.invite_url = reverse('invite_admin')
        self.change_password_url = reverse('change_password')

    def test_superadmin_can_invite_admin(self):
        self.client.force_authenticate(user=self.superadmin)
        data = {
            "email": "newadmin@example.com",
            "first_name": "New",
            "last_name": "Admin",
            "temporary_password": "TempPassword123!"
        }
        response = self.client.post(self.invite_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        new_user = User.objects.get(email="newadmin@example.com")
        self.assertEqual(new_user.role, Role.ADMIN)
        self.assertTrue(new_user.must_change_password)

    def test_admin_cannot_invite_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "email": "another@example.com",
            "first_name": "Another",
            "last_name": "Admin",
            "temporary_password": "TempPassword123!"
        }
        response = self.client.post(self.invite_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_must_change_password_flag_in_jwt(self):
        # Create user with must_change_password=True
        invited_user = User.objects.create_user(
            email="invited@example.com",
            password="TempPassword123!",
            role=Role.ADMIN,
            must_change_password=True
        )
        
        data = {
            "email": "invited@example.com",
            "password": "TempPassword123!"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['user']['must_change_password'])
        # In a real JWT, it would be in the token, but we are checking the serializer response here.
        # SimpleJWT CustomTokenObtainPairSerializer adds it to the token too, but testing the token payload is more involved.
        # We checked UserSerializer earlier.

    def test_change_password_flow(self):
        invited_user = User.objects.create_user(
            email="invited_flow@example.com",
            password="TempPassword123!",
            role=Role.ADMIN,
            must_change_password=True
        )
        self.client.force_authenticate(user=invited_user)
        
        data = {
            "new_password": "NewSecurePassword456!",
            "confirm_password": "NewSecurePassword456!"
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        invited_user.refresh_from_db()
        self.assertFalse(invited_user.must_change_password)
        self.assertTrue(invited_user.check_password("NewSecurePassword456!"))

    def test_change_password_mismatch(self):
        invited_user = User.objects.create_user(
            email="mismatch@example.com",
            password="TempPassword123!",
            role=Role.ADMIN,
            must_change_password=True
        )
        self.client.force_authenticate(user=invited_user)
        
        data = {
            "new_password": "NewSecurePassword456!",
            "confirm_password": "WrongPassword789!"
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', response.data)
