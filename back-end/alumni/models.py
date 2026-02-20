from django.db import models
from django.conf import settings

class Promotion(models.Model):
    label = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.label

class Profile(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Brouillon'
        VERIFIED = 'VERIFIED', 'Vérifié'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    bio = models.TextField(blank=True)
    current_job_title = models.CharField(max_length=255, blank=True)
    current_company = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    graduation_year = models.PositiveIntegerField(blank=True, null=True)
    degree = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    promotion = models.ForeignKey(
        Promotion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='profiles'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['graduation_year'], name='idx_profile_grad_year'),
            models.Index(fields=['status'], name='idx_profile_status'),
        ]

    def __str__(self):
        return f"Profile of {self.user.username}"

class Education(models.Model):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='educations'
    )
    school = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    year = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['school'], name='idx_education_school'),
        ]

    def __str__(self):
        return f"{self.degree} at {self.school}"

class Experience(models.Model):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='experiences'
    )
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True, blank=True)  # null = poste actuel
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} at {self.company}"
