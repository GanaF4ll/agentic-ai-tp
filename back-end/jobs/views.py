from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from accounts.permissions import IsAdmin
from accounts.models import Role
from alumni.models import Profile
from .models import Job, JobApplication
from .serializers import JobSerializer
from .filters import JobFilter

class JobPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit'
    max_page_size = 20

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-created_at').select_related('posted_by')
    serializer_class = JobSerializer
    filterset_class = JobFilter
    pagination_class = JobPagination

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve', 'apply']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Automatically set the posted_by field to the current user.
        """
        serializer.save(posted_by=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_applications(self, request):
        """
        Return the list of job offers the user has applied to.
        """
        applied_jobs = Job.objects.filter(applications__user=request.user).order_by('-applications__applied_at')
        serializer = self.get_serializer(applied_jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def apply(self, request, pk=None):
        job = self.get_object()
        user = request.user
        
        # 1. Role check
        if user.role != Role.MEMBER:
            return Response(
                {"detail": "Seuls les membres peuvent postuler aux offres d'emploi."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 2. Profile Status check
        try:
            profile = user.profile
            if profile.status != Profile.Status.VERIFIED:
                return Response(
                    {"detail": "Votre profil doit être vérifié pour postuler aux offres d'emploi."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        except Profile.DoesNotExist:
             return Response(
                 {"detail": "Vous devez avoir un profil pour postuler."}, 
                 status=status.HTTP_403_FORBIDDEN
             )

        # 3. Double application check
        if JobApplication.objects.filter(job=job, user=user).exists():
            return Response(
                {"detail": "Vous avez déjà postulé à cette offre."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 4. Create application
        JobApplication.objects.create(job=job, user=user)
        return Response(
            {"detail": "Candidature envoyée avec succès !"}, 
            status=status.HTTP_201_CREATED
        )
