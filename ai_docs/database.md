# Base de Données AlumniConnect (PostgreSQL 16)

## Entités Principales

### Hiérarchie

```
User (accounts)
  ├── Profile (alumni)           # Données publiques du profil
  │     ├── Education            # Formations (école, diplôme, année)
  │     └── Experience           # Expériences professionnelles
  ├── Job (jobs)                 # Offres d'emploi postées
  ├── Event (events)             # Événements créés/participés
  └── ContactRequest (networking) # Demandes de mise en relation
```

## Tables & Modèles Django

| Table (Model)      | App          | Description                                                  |
| ------------------ | ------------ | ------------------------------------------------------------ |
| `User`             | `accounts`   | Utilisateur custom (AbstractUser + role)                     |
| `Profile`          | `alumni`     | Profil public d'un alumni (lié à User 1:1)                   |
| `Education`        | `alumni`     | Formations (école, diplôme, année) — FK vers Profile         |
| `Experience`       | `alumni`     | Expériences pro (titre, entreprise, durée) — FK vers Profile |
| `DiscoveryLog`     | `scraping`   | Log des fichiers de scraping traités                         |
| `Job`              | `jobs`       | Offres d'emploi (CDI, CDD, Freelance)                        |
| `JobApplication`   | `jobs`       | Candidatures alumni sur les offres                           |
| `Event`            | `events`     | Événements (conférences, afterworks, BDE)                    |
| `EventParticipant` | `events`     | Inscriptions aux événements (M2M)                            |
| `ContactRequest`   | `networking` | Demandes de mise en relation entre alumni                    |

## Modèles Détaillés

### accounts.User

```python
class User(AbstractUser):
    role = models.CharField(max_length=20, choices=Role.choices, default='MEMBER')
    mail = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    is_profile_public = models.BooleanField(default=True)
```

### alumni.Profile

```python
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    current_job_title = models.CharField(max_length=255, blank=True)
    current_company = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    graduation_year = models.PositiveIntegerField(blank=True, null=True)
    degree = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        choices=[('DRAFT', 'Brouillon'), ('VERIFIED', 'Vérifié')],
        default='DRAFT'
    )
    promotion = models.ForeignKey(Promotion, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### alumni.Education

```python
class Education(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='educations')
    school = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    year = models.PositiveIntegerField(null=True, blank=True)
```

### alumni.Promotion

```python
class Promotion(models.Model):
    label = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### alumni.Experience

```python
class Experience(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='experiences')
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True, blank=True)  # null = poste actuel
    description = models.TextField(blank=True)
```

### scraping.DiscoveryLog

```python
class DiscoveryLog(models.Model):
    file_path = models.CharField(max_length=500)
    record_count = models.IntegerField(default=0)
    status = models.CharField(
        choices=[('PENDING', 'En attente'), ('PROCESSED', 'Traité'), ('ERROR', 'Erreur')],
        default='PENDING'
    )
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    error_message = models.TextField(blank=True)
```

## Rôles Utilisateurs

```python
class Role(models.TextChoices):
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Administrateur'
    ADMIN = 'ADMIN', 'Administrateur'
    MEMBER = 'MEMBER', 'Membre (Alumni)'
```

- **SUPER_ADMIN** : CRUD complet, validation profils DRAFT, gestion rôles, accès scraping
- **ADMIN** : Modération profils, gestion événements/jobs, statistiques
- **MEMBER** : Édition de son profil, candidatures, networking

## Pattern de Migration Django

```bash
# Créer une migration
python manage.py makemigrations app_name

# Appliquer les migrations
python manage.py migrate

# Voir le SQL généré
python manage.py sqlmigrate app_name 0001
```

## Index Recommandés

```python
class Meta:
    indexes = [
        models.Index(fields=['graduation_year'], name='idx_user_graduation_year'),
        models.Index(fields=['role'], name='idx_user_role'),
        models.Index(fields=['status'], name='idx_profile_status'),
        models.Index(fields=['school'], name='idx_education_school'),
    ]
```

## Conventions de Nommage

- Tables : Django crée `app_model` automatiquement (`accounts_user`, `alumni_profile`)
- Colonnes : `snake_case` (`graduation_year`, `created_at`)
- Related names : `snake_case` pluriel (`educations`, `experiences`)
- Index : `idx_table_column` (`idx_user_role`, `idx_profile_status`)
