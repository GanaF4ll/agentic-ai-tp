from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core import mail
from accounts.models import User, Role

class AdminCreationTests(APITestCase):
    def setUp(self):
        # Create a SuperAdmin
        self.super_admin = User.objects.create_superuser(
            email='superadmin@example.com',
            password='password123'
        )
        
        # Create a regular Admin
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            role=Role.ADMIN,
            is_staff=True
        )
        
        # Create a Member
        self.member = User.objects.create_user(
            email='member@example.com',
            password='password123',
            role=Role.MEMBER
        )
        
        self.url = reverse('admin-create')

    def test_superadmin_can_create_admin(self):
        self.client.force_authenticate(user=self.super_admin)
        data = {
            'email': 'newadmin@example.com',
            'first_name': 'New',
            'last_name': 'Admin'
        }
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 4)
        
        new_user = User.objects.get(email='newadmin@example.com')
        self.assertEqual(new_user.role, Role.ADMIN)
        self.assertTrue(new_user.is_staff)
        self.assertTrue(new_user.must_change_password)
        self.assertEqual(new_user.first_name, 'New')
        self.assertEqual(new_user.last_name, 'Admin')
        
        # Verify email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Your Admin Account Credentials', mail.outbox[0].subject)
        self.assertIn('newadmin@example.com', mail.outbox[0].to)

    def test_admin_cannot_create_admin(self):
        self.client.force_authenticate(user=self.admin)
        data = {
            'email': 'unauthorized@example.com',
            'first_name': 'No',
            'last_name': 'Way'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_member_cannot_create_admin(self):
        self.client.force_authenticate(user=self.member)
        data = {
            'email': 'unauthorized@example.com',
            'first_name': 'No',
            'last_name': 'Way'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create_admin(self):
        data = {
            'email': 'unauthorized@example.com'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_returns_must_change_password_flag(self):
        # Create a user with must_change_password=True
        user = User.objects.create_user(
            email='forced@example.com',
            password='temp_password',
            must_change_password=True
        )
        
        login_url = reverse('auth-login')
        response = self.client.post(login_url, {
            'email': 'forced@example.com',
            'password': 'temp_password'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['user']['must_change_password'])
