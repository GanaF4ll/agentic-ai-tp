from django.db import models
from django.conf import settings

class Job(models.Model):
    class Type(models.TextChoices):
        CDI = 'CDI', 'CDI'
        CDD = 'CDD', 'CDD'
        FREELANCE = 'FREELANCE', 'Freelance'
        INTERNSHIP = 'INTERNSHIP', 'Stage'

    class RemoteStatus(models.TextChoices):
        HYBRID = 'HYBRID', 'Hybride'
        FULL_REMOTE = 'FULL REMOTE', 'Télétravail complet'
        ON_SITE = 'ON SITE', 'Sur site'

    class Periodicity(models.TextChoices):
        FULL_TIME = 'FULL TIME', 'Temps plein'
        PART_TIME = 'PART TIME', 'Temps partiel'

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    job_type = models.CharField(max_length=20, choices=Type.choices, default=Type.CDI)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    remote_status = models.CharField(
        max_length=20, 
        choices=RemoteStatus.choices, 
        default=RemoteStatus.ON_SITE
    )
    periodicity = models.CharField(
        max_length=20, 
        choices=Periodicity.choices, 
        default=Periodicity.FULL_TIME
    )
    source_url = models.URLField(max_length=500, null=True, blank=True)

    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posted_jobs'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} at {self.company}"

class JobApplication(models.Model):
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_applications'
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    cover_letter = models.TextField(blank=True)

    class Meta:
        unique_together = ('job', 'user')

    def __str__(self):
        return f"{self.user.username} applied to {self.job.title}"
