import random
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker
from accounts.models import User, Role
from alumni.models import Profile, Promotion, Education, Experience
from jobs.models import Job
from events.models import Event

class Command(BaseCommand):
    help = 'Seeds the database with realistic alumni data and events'

    def handle(self, *args, **options):
        fake = Faker('fr_FR')
        
        self.stdout.write('Seeding data...')

        with transaction.atomic():
            # 1. Create some Promotions
            promotion_labels = ['DEV', 'MARKET', 'UXUI', 'DA']
            promotions = []
            for label in promotion_labels:
                promo, _ = Promotion.objects.get_or_create(
                    label=label
                )
                promotions.append(promo)

            # 2. Create Super Admin
            if not User.objects.filter(email='mds.school@gmail.com').exists():
                self.stdout.write('Creating Super Admin...')
                super_admin = User.objects.create_superuser(
                    email='mds.school@gmail.com',
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
            else:
                super_admin = User.objects.get(email='mds.school@gmail.com')

            # 3. Create Admins
            if User.objects.filter(role=Role.ADMIN).count() < 3:
                self.stdout.write('Creating Admins...')
                for i in range(1, 4):
                    email = f'admin{i}@alumniconnect.com'
                    if not User.objects.filter(email=email).exists():
                        admin_user = User.objects.create_user(
                            email=email,
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
                    email = fake.unique.email()
                    
                    user = User.objects.create_user(
                        email=email,
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
                        linkedin_url=f"https://www.linkedin.com/in/{first_name.lower()}.{last_name.lower()}",
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

            # 7. Create Events
            self.stdout.write('Creating 15 Mock Events...')
            # Clear existing events for a clean seed of events if needed, or just add more.
            # Here we'll just ensure we have at least 15 diverse ones.
            event_templates = [
                ('Soirée de Gala Annuelle', False),
                ('Conférence IA et Futur', True),
                ('Atelier Recherche d\'Emploi', True),
                ('Meetup Développeurs', False),
                ('Networking Marketing', False),
                ('Conférence sur le Freelancing', True),
                ('Hackathon Alumni', False),
                ('Webinaire : Travailler à l\'étranger', True),
                ('Afterwork Promotion DEV', False),
                ('Atelier Design Thinking', False),
                ('Session Coaching CV', True),
                ('Table Ronde : Entrepreneuriat', False),
                ('Petit-déjeuner Networking', False),
                ('Workshop React & Signals', True),
                ('Soirée de Clôture Année', False),
            ]
            
            for i, (title, is_online) in enumerate(event_templates):
                # Mix of past and future dates
                if i < 5:
                    # 5 Past events
                    event_date = timezone.now() - timezone.timedelta(days=random.randint(7, 30))
                else:
                    # 10 Future events
                    event_date = timezone.now() + timezone.timedelta(days=random.randint(1, 60))

                Event.objects.get_or_create(
                    title=title,
                    defaults={
                        'description': fake.paragraph(nb_sentences=3),
                        'location': 'En ligne' if is_online else random.choice([fake.city(), 'Campus Paris', 'Espace Coworking']),
                        'date': event_date,
                        'is_online': is_online,
                        'organizer': random.choice(['BDE', 'Association Alumni', 'School Tech Hub', 'Administration']),
                        'created_by': super_admin
                    }
                )


            # 8. Create Job Offers
            self.stdout.write('Creating 15 Mock Job Offers...')
            job_templates = [
                ("Développeur Fullstack Senior (Angular/Node.js)", "TechNova Solutions", "Paris, France", Job.Type.CDI, "Nous recherchons un expert Fullstack pour rejoindre notre équipe produit. Vous travaillerez sur des architectures micro-services et participerez à la refonte de notre interface client en Angular 18.", Job.RemoteStatus.HYBRID, Job.Periodicity.FULL_TIME, "2026-05-01", None),
                ("Data Scientist - Intelligence Artificielle", "Cognitive AI", "Lyon, France", Job.Type.CDI, "Directement rattaché au CTO, vous concevrez des modèles de Machine Learning pour l'analyse prédictive de données logistiques.", Job.RemoteStatus.FULL_REMOTE, Job.Periodicity.FULL_TIME, "2026-04-15", None),
                ("Développeur Front-end Junior", "Creative Pixels", "Bordeaux, France", Job.Type.INTERNSHIP, "Stage de fin d'études de 6 mois. Vous épaulerez nos développeurs seniors dans la création de sites web vitrines et e-commerce haut de gamme.", Job.RemoteStatus.ON_SITE, Job.Periodicity.FULL_TIME, "2026-04-01", "2026-09-30"),
                ("Ingénieur DevOps Cloud", "SkyCloud Ops", "Nantes, France", Job.Type.CDI, "Automatisation, CI/CD et gestion d'infrastructures AWS/GCP. Nous cherchons quelqu'un capable de faire évoluer nos pipelines de déploiement.", Job.RemoteStatus.HYBRID, Job.Periodicity.FULL_TIME, "2026-06-01", None),
                ("Consultant Cybersécurité Freelance", "SecureGuardian", "Lille, France", Job.Type.FREELANCE, "Mission de 3 mois renouvelable pour un audit de sécurité complet d'une application bancaire.", Job.RemoteStatus.FULL_REMOTE, Job.Periodicity.PART_TIME, "2026-03-25", None),
                ("Chef de Projet Digital", "Global Agency", "Paris, France", Job.Type.CDD, "Remplacement congé maternité (9 mois). Vous piloterez des projets transverses (SEO, SEA, Social Media) pour nos grands comptes luxe.", Job.RemoteStatus.HYBRID, Job.Periodicity.FULL_TIME, "2026-04-01", "2026-12-31"),
                ("Lead Développeur Mobile iOS", "SwiftMotion", "Toulouse, France", Job.Type.CDI, "Prenez la tête du pôle mobile iOS. Vous serez garant de la qualité du code et de l'architecture de notre application phare.", Job.RemoteStatus.HYBRID, Job.Periodicity.FULL_TIME, "2026-05-15", None),
                ("Développeur Python Back-end (Django)", "PyExpert", "Marseille, France", Job.Type.CDI, "Évoluez au sein d'une startup en forte croissance. Vous participerez au développement d'APIs robustes pour des services fintech.", Job.RemoteStatus.FULL_REMOTE, Job.Periodicity.FULL_TIME, "2026-04-20", None),
                ("Product Designer UI/UX", "DesignFirst", "Montpellier, France", Job.Type.CDI, "Créez des expériences utilisateurs exceptionnelles. Vous travaillerez main dans la main avec les Product Managers et les développeurs.", Job.RemoteStatus.HYBRID, Job.Periodicity.FULL_TIME, "2026-05-01", None),
                ("Ingénieur Systèmes Linux", "Infrastructure Pro", "Strasbourg, France", Job.Type.CDI, "Gestion de serveurs critiques, monitoring et optimisation de performances.", Job.RemoteStatus.ON_SITE, Job.Periodicity.FULL_TIME, "2026-04-01", None),
                ("Data Analyst Junior", "DataInsight", "Rennes, France", Job.Type.CDD, "Contrat de 12 mois. Vous aiderez le département marketing à interpréter les données de campagnes.", Job.RemoteStatus.HYBRID, Job.Periodicity.FULL_TIME, "2026-03-15", "2027-03-14"),
                ("Développeur Blockchain (Solidity)", "Web3 Innovate", "Nice, France", Job.Type.FREELANCE, "Développement de Smart Contracts sur Ethereum et Polygon. Audit de sécurité et intégration de protocoles DeFi.", Job.RemoteStatus.FULL_REMOTE, Job.Periodicity.FULL_TIME, "2026-03-10", None),
                ("Business Developer IT", "SalesTech", "Paris, France", Job.Type.CDI, "Chasse de nouveaux comptes et gestion du portefeuille existant pour nos solutions SaaS.", Job.RemoteStatus.HYBRID, Job.Periodicity.FULL_TIME, "2026-04-01", None),
                ("Architecte Cloud Solutions", "Big Cloud Corp", "Lyon, France", Job.Type.CDI, "Conception d'architectures cloud scalables et sécurisées pour des environnements hybrides.", Job.RemoteStatus.HYBRID, Job.Periodicity.FULL_TIME, "2026-06-01", None),
                ("Stagiaire Growth Marketing", "Viral Startup", "Nantes, France", Job.Type.INTERNSHIP, "Apprenez les ficelles du Growth Hacking : A/B testing, automation, content strategy.", Job.RemoteStatus.HYBRID, Job.Periodicity.FULL_TIME, "2026-04-01", "2026-09-30"),
            ]

            for title, company, location, j_type, desc, remote, per, start, end in job_templates:
                Job.objects.get_or_create(
                    title=title,
                    company=company,
                    defaults={
                        'location': location,
                        'job_type': j_type,
                        'description': desc,
                        'remote_status': remote,
                        'periodicity': per,
                        'start_date': start,
                        'end_date': end,
                        'posted_by': super_admin
                    }
                )
        self.stdout.write(self.style.SUCCESS('Database successfully seeded!'))
