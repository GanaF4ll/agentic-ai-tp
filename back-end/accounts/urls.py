from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import LoginView, MeView, TokenRefreshView, AdminCreateView, UserViewSet

router = SimpleRouter()
router.register('users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('admins/', AdminCreateView.as_view(), name='admin-create'),
]
