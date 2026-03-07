from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, PromotionViewSet

router = DefaultRouter()
router.register(r'promotions', PromotionViewSet, basename='promotion')
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    
]
