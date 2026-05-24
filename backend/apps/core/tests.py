from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from common.choices import UserRole
from core.models import Announcement, ContentSettings

User = get_user_model()

class AdminCoreViewsTestCase(APITestCase):
    def setUp(self):
        # Create users
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='testpassword123',
            role=UserRole.ADMIN
        )
        self.regular_user = User.objects.create_user(
            username='user_test',
            email='user@test.com',
            password='testpassword123',
            role=UserRole.USER
        )

    def test_analytics_permissions(self):
        url = reverse('admin-analytics')
        
        # 1. Anonymous user
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # 2. Regular user
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 3. Admin user
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('stats', response.data['data'])

    def test_announcement_crud(self):
        list_url = reverse('admin-announcements-list')
        
        # 1. Create announcement (restricted to admin)
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post(list_url, {"title": "Test Title", "content": "Test Content"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(list_url, {"title": "Test Title", "content": "Test Content"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        ann_id = response.data['id']
        detail_url = reverse('admin-announcements-detail', kwargs={"pk": ann_id})
        
        # 2. Update announcement (admin)
        response = self.client.patch(detail_url, {"is_active": False})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_active'])

    def test_content_settings(self):
        url = reverse('admin-content-control')
        
        # 1. Get content settings (public)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 2. Post settings (restricted to admin)
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post(url, {"welcome_title": "Hello world"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(url, {"welcome_title": "Hello world"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['welcome_title'], 'Hello world')
