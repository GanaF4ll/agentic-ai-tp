from django.db import models
from django.conf import settings


class DiscoveryLog(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        PROCESSED = 'PROCESSED', 'Traité'
        ERROR = 'ERROR', 'Erreur'

    file_path = models.CharField(max_length=500)
    record_count = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    error_message = models.TextField(blank=True)

    def __str__(self):
        return f"{self.file_path} ({self.status})"


class LinkedInScrapingTask(models.Model):

    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        URL_NOT_FOUND = 'url_not_found', 'URL introuvable'
        SCRAPING = 'scraping', 'En cours de scraping'
        DONE = 'done', 'Terminé'
        ERROR = 'error', 'Erreur'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='scraping_task',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    raw_data = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    scraped_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'LinkedIn Scraping Task'
        verbose_name_plural = 'LinkedIn Scraping Tasks'

    def __str__(self):
        return f"ScrapingTask — {self.user.email} [{self.get_status_display()}]"
