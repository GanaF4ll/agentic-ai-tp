from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, 
    MeView, 
    InviteAdminView, 
    ChangePasswordView
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='user_me'),
    path('admins/invite/', InviteAdminView.as_view(), name='invite_admin'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
