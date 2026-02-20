from django.db import models

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
