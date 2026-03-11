from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin
from .models import LinkedInScrapingTask
from .serializers import LinkedInScrapingTaskSerializer
from .tasks import scrape_alumni_profile, scrape_all_pending_tasks


class ScrapingTaskViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour consulter et piloter les tâches de scraping LinkedIn.
    Accessible uniquement aux Admins et SuperAdmins.
    """
    queryset = LinkedInScrapingTask.objects.select_related('user').all()
    serializer_class = LinkedInScrapingTaskSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    @action(detail=True, methods=['post'])
    def scrape(self, request, pk=None):
        """Lance le scraping pour un alumni spécifique."""
        task = self.get_object()
        scrape_alumni_profile.delay(task.user_id)
        return Response(
            {'message': f'Scraping lancé pour {task.user.email}'},
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=False, methods=['post'])
    def scrape_all(self, request):
        """Relance le scraping pour tous les pending/error/url_not_found."""
        result = scrape_all_pending_tasks.delay()
        return Response(
            {'message': 'Scraping global lancé', 'task_id': result.id},
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Retourne les statistiques de scraping par statut."""
        from django.db.models import Count
        stats = LinkedInScrapingTask.objects.values('status').annotate(count=Count('id'))
        total = LinkedInScrapingTask.objects.count()
        return Response({'total': total, 'by_status': list(stats)})
