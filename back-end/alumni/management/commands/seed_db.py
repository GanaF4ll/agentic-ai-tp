import random
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
from accounts.models import User, Role
from alumni.models import Profile, Promotion, Education, Experience

class Command(BaseCommand):
    help = 'Seeds the database with realistic alumni data'

    def handle(self, *args, **options):
        fake = Faker('fr_FR')
        
        self.stdout.write('Seeding data...')

        with transaction.atomic():
            # 1. Create some Promotions
            promotions = []
            for year in range(2015, 2026):
                promo, _ = Promotion.objects.get_or_create(
                    label=f"Promotion {year}",
                    defaults={'description': f"Les diplômés de l'année {year}"}
                )
                promotions.append(promo)

            # 2. Create at least 100 Profiles
            profiles_to_create = 100
            
            for i in range(profiles_to_create):
                # Create a User first
                first_name = fake.first_name()
                last_name = fake.last_name()
                username = f"{first_name.lower()}.{last_name.lower()}.{random.randint(100, 999)}"
                
                user = User.objects.create_user(
                    username=username,
                    email=fake.unique.email(),
                    password='password123',
                    first_name=first_name,
                    last_name=last_name,
                    role=Role.MEMBER,
                    degree=fake.job(),
                    graduation_year=random.choice(range(2015, 2026))
                )

                # Create the Profile (OneToOne with User)
                profile = Profile.objects.create(
                    user=user,
                    bio=fake.text(max_nb_chars=200),
                    current_job_title=user.degree,
                    current_company=fake.company(),
                    location=fake.city(),
                    linkedin_url=f"https://www.linkedin.com/in/{username}",
                    graduation_year=user.graduation_year,
                    degree=user.degree,
                    status=random.choice([Profile.Status.DRAFT, Profile.Status.VERIFIED]),
                    promotion=random.choice(promotions)
                )

                # 3. Add some Education history
                for _ in range(random.randint(1, 3)):
                    Education.objects.create(
                        profile=profile,
                        school=fake.company() + " University",
                        degree=fake.catch_phrase(),
                        year=random.randint(2010, 2024)
                    )

                # 4. Add some Experience history
                for _ in range(random.randint(1, 4)):
                    Experience.objects.create(
                        profile=profile,
                        title=fake.job(),
                        company=fake.company(),
                        start_date=fake.date_between(start_date='-10y', end_date='-1y'),
                        description=fake.paragraph(nb_sentences=2)
                    )

                if (i + 1) % 10 == 0:
                    self.stdout.write(f"Created {i + 1} profiles...")

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {profiles_to_create} profiles!'))
