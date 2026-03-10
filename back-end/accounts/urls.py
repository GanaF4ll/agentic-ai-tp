from django.urls import path

from .views import LoginView, MeView, TokenRefreshView, AdminCreateView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('admins/', AdminCreateView.as_view(), name='admin-create'),
]
