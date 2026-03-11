from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScrapingTaskViewSet

router = DefaultRouter()
router.register(r'tasks', ScrapingTaskViewSet, basename='scraping-task')

urlpatterns = [
    path('', include(router.urls)),
]
