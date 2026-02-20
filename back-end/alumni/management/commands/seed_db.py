import random
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
from accounts.models import User, Role
from alumni.models import Profile, Promotion, Education, Experience

class Command(BaseCommand):
    help = 'Seeds the database with realistic alumni data, including Super Admin and Admins'

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

            # 2. Create Super Admin
            if not User.objects.filter(role=Role.SUPER_ADMIN).exists():
                self.stdout.write('Creating Super Admin...')
                super_admin = User.objects.create_superuser(
                    username='superadmin',
                    email='superadmin@alumniconnect.com',
                    password='password123',
                    role=Role.SUPER_ADMIN,
                    first_name='Super',
                    last_name='Admin'
                )
                Profile.objects.create(
                    user=super_admin,
                    bio="Super Administrateur de la plateforme.",
                    status=Profile.Status.VERIFIED
                )

            # 3. Create Admins
            if User.objects.filter(role=Role.ADMIN).count() < 3:
                self.stdout.write('Creating Admins...')
                for i in range(1, 4):
                    username = f'admin{i}'
                    if not User.objects.filter(username=username).exists():
                        admin_user = User.objects.create_user(
                            username=username,
                            email=f'admin{i}@alumniconnect.com',
                            password='password123',
                            role=Role.ADMIN,
                            is_staff=True,
                            first_name='Staff',
                            last_name=str(i)
                        )
                        Profile.objects.create(
                            user=admin_user,
                            bio=f"Administrateur n°{i} chargé de la modération.",
                            status=Profile.Status.VERIFIED
                        )

            # 4. Create at least 100 MEMBER Profiles
            current_member_count = User.objects.filter(role=Role.MEMBER).count()
            profiles_to_create = max(0, 100 - current_member_count)
            
            if profiles_to_create > 0:
                self.stdout.write(f'Creating {profiles_to_create} Member profiles...')
                for i in range(profiles_to_create):
                    # Create a User first
                    first_name = fake.first_name()
                    last_name = fake.last_name()
                    username = f"{first_name.lower()}.{last_name.lower()}.{random.randint(100, 9999)}"
                    
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

                    # 5. Add some Education history
                    for _ in range(random.randint(1, 3)):
                        Education.objects.create(
                            profile=profile,
                            school=fake.company() + " University",
                            degree=fake.catch_phrase(),
                            year=random.randint(2010, 2024)
                        )

                    # 6. Add some Experience history
                    for _ in range(random.randint(1, 4)):
                        Experience.objects.create(
                            profile=profile,
                            title=fake.job(),
                            company=fake.company(),
                            start_date=fake.date_between(start_date='-10y', end_date='-1y'),
                            description=fake.paragraph(nb_sentences=2)
                        )

                    if (i + 1) % 20 == 0:
                        self.stdout.write(f"Created {i + 1} profiles...")

        self.stdout.write(self.style.SUCCESS('Database successfully seeded with Admins and Members!'))
