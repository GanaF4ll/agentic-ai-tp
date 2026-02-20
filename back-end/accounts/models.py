from django.contrib.auth.models import AbstractUser
from django.db import models

class Role(models.TextChoices):
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Administrateur'
    ADMIN = 'ADMIN', 'Administrateur'
    MEMBER = 'MEMBER', 'Membre (Alumni)'

class User(AbstractUser):
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    linkedin_url = models.URLField(blank=True, null=True)
    graduation_year = models.PositiveIntegerField(blank=True, null=True)
    degree = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_profile_public = models.BooleanField(default=True)

    @property
    def is_super_admin(self):
        return self.role == Role.SUPER_ADMIN

    @property
    def is_admin(self):
        return self.role in (Role.SUPER_ADMIN, Role.ADMIN)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
