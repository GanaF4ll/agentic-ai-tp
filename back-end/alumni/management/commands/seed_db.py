import random
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker
from accounts.models import User, Role
from alumni.models import Profile, Promotion, Education, Experience
from jobs.models import Job
from events.models import Event

ALUMNI_DATA = {
    "users": [
        {"fields": {"first_name": "Alexis", "last_name": "HADJIAN", "email": "alexis.hadjian@my-digital-school.org"}, "pk": 133},
        {"fields": {"first_name": "Mathis", "last_name": "LAVERSIN", "email": "mathis.laversin@my-digital-school.org"}, "pk": 134},
        {"fields": {"first_name": "Jérémy", "last_name": "BOUREUX", "email": "jérémy.boureux@my-digital-school.org"}, "pk": 135},
        {"fields": {"first_name": "Rémi", "last_name": "MOUL", "email": "rémi.moul@my-digital-school.org"}, "pk": 136},
        {"fields": {"first_name": "Samuel", "last_name": "ZENTOU", "email": "samuel.zentou@my-digital-school.org"}, "pk": 137},
        {"fields": {"first_name": "Athénaïs", "last_name": "GRAVIL", "email": "athénaïs.gravil@my-digital-school.org"}, "pk": 138},
        {"fields": {"first_name": "Gana", "last_name": "FALL", "email": "gana.fall@my-digital-school.org"}, "pk": 139},
        {"fields": {"first_name": "Hichem", "last_name": "MEBERBECHE", "email": "hichem.meberbeche@my-digital-school.org"}, "pk": 140},
        {"fields": {"first_name": "Peter", "last_name": "BINATE", "email": "peter.binate@my-digital-school.org"}, "pk": 141},
        {"fields": {"first_name": "Amine", "last_name": "LAIHEM", "email": "amine.laihem@my-digital-school.org"}, "pk": 142},
        {"fields": {"first_name": "Loïc", "last_name": "TCHUENKAM TCHUENCHE", "email": "loïc.tchuenkam-tchuenche@my-digital-school.org"}, "pk": 143},
        {"fields": {"first_name": "Mamy Marcos", "last_name": "AMBININTSOA", "email": "mamy-marcos.ambinintsoa@my-digital-school.org"}, "pk": 144},
        {"fields": {"first_name": "Océane", "last_name": "GLANEUX", "email": "océane.glaneux@my-digital-school.org"}, "pk": 145},
        {"fields": {"first_name": "Carole", "last_name": "BOUCHE", "email": "carole.bouche@my-digital-school.org"}, "pk": 146},
        {"fields": {"first_name": "Amir Tahar", "last_name": "AMIOUR", "email": "amir-tahar.amiour@my-digital-school.org"}, "pk": 147},
        {"fields": {"first_name": "Rayan", "last_name": "KICHOU", "email": "rayan.kichou@my-digital-school.org"}, "pk": 148},
        {"fields": {"first_name": "Tim", "last_name": "HRDY", "email": "tim.hrdy@my-digital-school.org"}, "pk": 149},
        {"fields": {"first_name": "Guillaume", "last_name": "LAFAY", "email": "guillaume.lafay@my-digital-school.org"}, "pk": 150},
        {"fields": {"first_name": "Max", "last_name": "RICHET", "email": "max.richet@my-digital-school.org"}, "pk": 151},
        {"fields": {"first_name": "Paul", "last_name": "OHL", "email": "paul.ohl@my-digital-school.org"}, "pk": 152},
        {"fields": {"first_name": "Johanna", "last_name": "STOICANESCU", "email": "johanna.stoicanescu@my-digital-school.org"}, "pk": 153},
        {"fields": {"first_name": "Romain", "last_name": "MARCELLI", "email": "romain.marcelli@my-digital-school.org"}, "pk": 154},
        {"fields": {"first_name": "Mahylan", "last_name": "VECLIN", "email": "mahylan.veclin@my-digital-school.org"}, "pk": 155},
        {"fields": {"first_name": "Amrou", "last_name": "BEN ABDESSALEM", "email": "amrou.ben-abdessalem@my-digital-school.org"}, "pk": 156},
        {"fields": {"first_name": "Sarah", "last_name": "OTMANE", "email": "sarah.otmane@my-digital-school.org"}, "pk": 157},
        {"fields": {"first_name": "Mohamed Lamine", "last_name": "REMINI", "email": "mohamed-lamine.remini@my-digital-school.org"}, "pk": 158},
        {"fields": {"first_name": "Mattéo", "last_name": "HOUILLON", "email": "mattéo.houillon@my-digital-school.org"}, "pk": 160}
    ],
    "profiles": [
        {"fields": {"user": 133, "bio": "Développeur Web chez AKQA", "current_job_title": "Développeur Web", "current_company": "AKQA", "location": "Paris, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/alexis-hadjian"}, "pk": 106},
        {"fields": {"user": 134, "bio": "Software engineer | Next.js | React Native | Docker | Kubernetes", "current_job_title": "Software engineer", "current_company": "Bouygues Telecom", "location": "Chatou, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/mathis-laversin"}, "pk": 107},
        {"fields": {"user": 135, "bio": "Tech Lead at Verdikt, a Future 40 start-up at Station F", "current_job_title": "Tech Lead", "current_company": "Verdikt", "location": "Paris, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/jérémy-boureux-19283b222"}, "pk": 108},
        {"fields": {"user": 136, "bio": "Développeur Fullstack (React Native)", "current_job_title": "Développeur Fullstack", "current_company": "", "location": "Paris, France", "linkedin_url": "https://www.linkedin.com/in/remimoul/"}, "pk": 109},
        {"fields": {"user": 137, "bio": "Concepteur Développeur d'Applications Web & Mobile", "current_job_title": "Concepteur Développeur d'Applications", "current_company": "La Capsule", "location": "Louvres, Île-de-France, France", "linkedin_url": "https://www.linkedin.com/in/zentou-samuel-2710122a4/"}, "pk": 110},
        {"fields": {"user": 138, "bio": "Étudiante à MyDigitalSchool", "current_job_title": "Apprentie", "current_company": "", "location": "Maincy, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/athénaïs-gravil-27a2892b3"}, "pk": 111},
        {"fields": {"user": 139, "bio": "Développeur Full-stack (Angular Springboot NestJS) chez Scalian", "current_job_title": "Développeur Full Stack", "current_company": "Scalian", "location": "Paris Area, France", "linkedin_url": "https://www.linkedin.com/in/ganafall/"}, "pk": 112},
        {"fields": {"user": 140, "bio": "Développeur Full Stack Junior | Étudiant à MyDigitalSchool | en alternance", "current_job_title": "Développeur Full Stack Junior", "current_company": "Cegedim Santé", "location": "Paris, Île-de-France, France", "linkedin_url": "https://www.linkedin.com/in/amir-meberbeche/", "promotion": 12}, "pk": 113},
        {"fields": {"user": 141, "bio": "Développeur web full-stack @ TimeLapse Go'", "current_job_title": "Développeur web full-stack", "current_company": "TimeLapse Go'", "location": "Paris, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/peter-binate-08776a171"}, "pk": 114},
        {"fields": {"user": 142, "bio": "Développeur Full Stack en alternance", "current_job_title": "Développeur Full Stack en alternance", "current_company": "Assystem", "location": "Paris, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/laihem-amine"}, "pk": 115},
        {"fields": {"user": 143, "bio": "Développeur FullStack", "current_job_title": "Développeur FullStack", "current_company": "DECOTEC", "location": "Paris, Île-de-France, France", "linkedin_url": "https://www.linkedin.com/in/loic-arthur-tchuenkam-a268a7256/"}, "pk": 116},
        {"fields": {"user": 144, "bio": "Étudiant(e) à antsiranana", "current_job_title": "Étudiant", "current_company": "", "location": "Antananarivo", "linkedin_url": "https://mg.linkedin.com/in/mamy-ambinintsoa-154b63256"}, "pk": 117},
        {"fields": {"user": 145, "bio": "Les Fermes Debout (ex-NeoFarm)", "current_job_title": "Développeur / Profil Technique", "current_company": "Les Fermes Debout (ex-NeoFarm)", "location": "Paris et périphérie", "linkedin_url": "https://fr.linkedin.com/in/glaneux"}, "pk": 118},
        {"fields": {"user": 146, "bio": "Community Manager | Événementiel", "current_job_title": "Community Manager", "current_company": "Com'une Bouche", "location": "Saint-Nectaire, Auvergne-Rhône-Alpes, France", "linkedin_url": "https://www.linkedin.com/in/carole-b-it/"}, "pk": 119},
        {"fields": {"user": 147, "bio": "Hager Group", "current_job_title": "Alternant / Développeur", "current_company": "Hager Group", "location": "Paris", "linkedin_url": "https://fr.linkedin.com/in/amir-tahar-amiour-79b64a292"}, "pk": 120},
        {"fields": {"user": 148, "bio": "Enedis", "current_job_title": "Développeur / Alternant", "current_company": "Enedis", "location": "Courbevoie, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/rayan-kichou-189936205"}, "pk": 121},
        {"fields": {"user": 149, "bio": "Ingénieur Full Stack | Mobile & IA", "current_job_title": "Ingénieur Full Stack", "current_company": "Freelance / Malt", "location": "Paris", "linkedin_url": "https://fr.linkedin.com/in/tim-hrdy"}, "pk": 122},
        {"fields": {"user": 150, "bio": "Actemium Saint-Etienne Process Solutions", "current_job_title": "Développeur / Ingénieur", "current_company": "Actemium Saint-Etienne Process Solutions", "location": "Lyon et périphérie", "linkedin_url": "https://fr.linkedin.com/in/guillaume-lafay"}, "pk": 123},
        {"fields": {"user": 151, "bio": "Max Richet - Screwfix", "current_job_title": "Employé", "current_company": "Screwfix", "location": "Yeovil, England, United Kingdom", "linkedin_url": "https://uk.linkedin.com/in/max-richet-71a4a329a"}, "pk": 124},
        {"fields": {"user": 152, "bio": "Rust backend web developer", "current_job_title": "Rust backend web developer", "current_company": "IOmentum", "location": "Montrouge, Île-de-France, France", "linkedin_url": "https://www.linkedin.com/in/paul-ohl/"}, "pk": 125},
        {"fields": {"user": 153, "bio": "Johanna Stoicanescu - Lucky cart", "current_job_title": "Alternante", "current_company": "Lucky cart", "location": "Paris, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/johanna-stoicanescu-752801252"}, "pk": 126},
        {"fields": {"user": 154, "bio": "Étudiant / Alternant chez MyDigitalSchool", "current_job_title": "Développeur web", "current_company": "SYSTELECOMS", "location": "Lille et périphérie", "linkedin_url": "https://fr.linkedin.com/in/romain-marcelli"}, "pk": 127},
        {"fields": {"user": 155, "bio": "Mahylan Veclin - Wangarden", "current_job_title": "Alternant", "current_company": "Wangarden", "location": "Paris, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/mahylan-veclin-59aa40242"}, "pk": 128},
        {"fields": {"user": 156, "bio": "Étudiant en MBA développeur full-stack en alternance chez AXA", "current_job_title": "Développeur Full Stack", "current_company": "AXA en France", "location": "Paris, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/amrou-ben-abdessalem-8b4324294"}, "pk": 129},
        {"fields": {"user": 157, "bio": "Sarah OTMANE - Crédit Agricole Assurances", "current_job_title": "Développeuse Full Stack", "current_company": "Crédit Agricole Assurances", "location": "Paris, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/sarah-otmane-b03212251"}, "pk": 130},
        {"fields": {"user": 158, "bio": "", "current_job_title": "", "current_company": "", "location": "", "linkedin_url": null}, "pk": 131},
        {"fields": {"user": 160, "bio": "Mattéo HOUILLON - EVERTRUST", "current_job_title": "Alternant", "current_company": "EVERTRUST", "location": "Vaires-sur-Marne, Île-de-France, France", "linkedin_url": "https://fr.linkedin.com/in/mattéo-houillon"}, "pk": 133}
    ],
    "education": [
        {"fields": {"profile": 106, "school": "MyDigitalSchool", "degree": "Concepteur développeur d'applications", "year": 2024}, "pk": 212},
        {"fields": {"profile": 107, "school": "MyDigitalSchool", "degree": "", "year": None}, "pk": 213},
        {"fields": {"profile": 108, "school": "MyDigitalSchool", "degree": "", "year": None}, "pk": 214},
        {"fields": {"profile": 109, "school": "MyDigitalSchool", "degree": "", "year": None}, "pk": 215},
        {"fields": {"profile": 110, "school": "La Capsule", "degree": "Concepteur Développeur d'Applications Web & Mobile – Niveau 6", "year": 2024}, "pk": 216},
        {"fields": {"profile": 111, "school": "MyDigitalSchool", "degree": "Bachelor", "year": None}, "pk": 217},
        {"fields": {"profile": 112, "school": "MyDigitalSchool", "degree": "Bachelor", "year": None}, "pk": 218},
        {"fields": {"profile": 113, "school": "MyDigitalSchool", "degree": "Bachelor", "year": None}, "pk": 219},
        {"fields": {"profile": 114, "school": "MyDigitalSchool", "degree": "Bachelor", "year": None}, "pk": 220},
        {"fields": {"profile": 115, "school": "Université Paris 13", "degree": "", "year": None}, "pk": 221},
        {"fields": {"profile": 116, "school": "MyDigitalSchool", "degree": "", "year": None}, "pk": 222},
        {"fields": {"profile": 117, "school": "antsiranana", "degree": "", "year": None}, "pk": 223},
        {"fields": {"profile": 118, "school": "MyDigitalSchool", "degree": "", "year": None}, "pk": 224},
        {"fields": {"profile": 119, "school": "CCI Clermont-Ferrand", "degree": "", "year": None}, "pk": 225},
        {"fields": {"profile": 120, "school": "MyDigitalSchool", "degree": "", "year": None}, "pk": 226},
        {"fields": {"profile": 121, "school": "Université des Sciences et de la Technologie Houari Boumediène", "degree": "", "year": None}, "pk": 227},
        {"fields": {"profile": 122, "school": "Université Paris-Saclay", "degree": "Master 2 (M2) MIAGE", "year": None}, "pk": 228},
        {"fields": {"profile": 122, "school": "MyDigitalSchool", "degree": "MBA spécialisé Développeur Full-Stack", "year": None}, "pk": 229},
        {"fields": {"profile": 123, "school": "Ecole nationale d'Ingénieurs de Saint-Etienne", "degree": "", "year": None}, "pk": 230},
        {"fields": {"profile": 124, "school": "Swansea University", "degree": "", "year": None}, "pk": 231},
        {"fields": {"profile": 125, "school": "42", "degree": "", "year": None}, "pk": 232},
        {"fields": {"profile": 125, "school": "OpenClassrooms", "degree": "", "year": None}, "pk": 233},
        {"fields": {"profile": 126, "school": "MyDigitalSchool", "degree": "Bac +5", "year": 2024}, "pk": 234},
        {"fields": {"profile": 127, "school": "MyDigitalSchool", "degree": "", "year": None}, "pk": 235},
        {"fields": {"profile": 127, "school": "Webforce3", "degree": "", "year": None}, "pk": 236},
        {"fields": {"profile": 128, "school": "MyDigitalSchool", "degree": "", "year": None}, "pk": 237},
        {"fields": {"profile": 129, "school": "MyDigitalSchool", "degree": "MBA développeur full-stack", "year": None}, "pk": 238},
        {"fields": {"profile": 130, "school": "MyDigitalSchool", "degree": "", "year": None}, "pk": 239},
        {"fields": {"profile": 133, "school": "MyDigitalSchool", "degree": "", "year": None}, "pk": 240}
    ],
    "experience": [
        {"fields": {"profile": 106, "title": "Développeur Web", "company": "AKQA", "description": ""}, "pk": 238},
        {"fields": {"profile": 107, "title": "Software engineer", "company": "Bouygues Telecom", "description": ""}, "pk": 239},
        {"fields": {"profile": 108, "title": "Tech Lead", "company": "Verdikt", "description": ""}, "pk": 240},
        {"fields": {"profile": 112, "title": "Développeur Full Stack", "company": "Scalian", "description": ""}, "pk": 241},
        {"fields": {"profile": 113, "title": "Développeur Full Stack", "company": "Cegedim Santé", "description": ""}, "pk": 242},
        {"fields": {"profile": 114, "title": "Développeur web full-stack", "company": "TimeLapse Go'", "description": ""}, "pk": 243},
        {"fields": {"profile": 115, "title": "Développeur Full Stack en alternance", "company": "Assystem", "description": ""}, "pk": 244},
        {"fields": {"profile": 116, "title": "Développeur FullStack", "company": "DECOTEC", "description": ""}, "pk": 245},
        {"fields": {"profile": 118, "title": "Profil Technique", "company": "Les Fermes Debout (ex-NeoFarm)", "description": ""}, "pk": 246},
        {"fields": {"profile": 119, "title": "Community Manager", "company": "Com'une Bouche", "description": ""}, "pk": 247},
        {"fields": {"profile": 120, "title": "Alternant", "company": "Hager Group", "description": ""}, "pk": 248},
        {"fields": {"profile": 121, "title": "Alternant", "company": "Enedis", "description": ""}, "pk": 249},
        {"fields": {"profile": 122, "title": "Ingénieur Full Stack | Mobile & IA", "company": "Malt / Freelance", "description": ""}, "pk": 250},
        {"fields": {"profile": 123, "title": "Ingénieur", "company": "Actemium Saint-Etienne Process Solutions", "description": ""}, "pk": 251},
        {"fields": {"profile": 124, "title": "Employé", "company": "Screwfix", "description": ""}, "pk": 252},
        {"fields": {"profile": 125, "title": "Founder/Developer", "company": "IOmentum", "description": ""}, "pk": 253},
        {"fields": {"profile": 125, "title": "Developer", "company": "Mirametrix", "description": ""}, "pk": 254},
        {"fields": {"profile": 126, "title": "Alternante", "company": "Lucky cart", "description": ""}, "pk": 255},
        {"fields": {"profile": 127, "title": "Développeur web", "company": "SYSTELECOMS", "description": ""}, "pk": 256},
        {"fields": {"profile": 128, "title": "Alternant", "company": "Wangarden", "description": ""}, "pk": 257},
        {"fields": {"profile": 129, "title": "Développeur Full Stack", "company": "AXA en France", "description": ""}, "pk": 258},
        {"fields": {"profile": 130, "title": "Développeuse Full Stack", "company": "Crédit Agricole Assurances", "description": ""}, "pk": 259},
        {"fields": {"profile": 133, "title": "Alternant", "company": "EVERTRUST", "description": ""}, "pk": 260},
        {"fields": {"profile": 133, "title": "Alternant", "company": "Ville de Paris", "description": ""}, "pk": 261}
    ]
}

class Command(BaseCommand):
    help = 'Seeds the database with realistic alumni data and events'

    def handle(self, *args, **options):
        fake = Faker('fr_FR')
        
        self.stdout.write('Seeding data...')

        with transaction.atomic():
            # 1. Create some Promotions
            promotion_labels = ['DEV', 'MARKET', 'UXUI', 'DA']
            promotions = {}
            for label in promotion_labels:
                promo, _ = Promotion.objects.get_or_create(
                    label=label
                )
                promotions[label] = promo

            # Map for old PKs to new objects
            user_map = {}
            profile_map = {}

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

            # 4. Create Real Alumni from JSON export
            self.stdout.write('Creating Real Alumni Profiles...')
            for u_data in ALUMNI_DATA['users']:
                fields = u_data['fields']
                user, created = User.objects.get_or_create(
                    email=fields['email'],
                    defaults={
                        'first_name': fields['first_name'],
                        'last_name': fields['last_name'],
                        'role': Role.MEMBER,
                    }
                )
                if created:
                    user.set_password('password123')
                    user.save()
                user_map[u_data['pk']] = user

            for p_data in ALUMNI_DATA['profiles']:
                fields = p_data['fields']
                user = user_map.get(fields['user'])
                if not user:
                    continue
                
                promo = None
                if fields.get('promotion') == 12: # DEV in the export
                    promo = promotions.get('DEV')

                profile, _ = Profile.objects.get_or_create(
                    user=user,
                    defaults={
                        'bio': fields['bio'],
                        'current_job_title': fields['current_job_title'],
                        'current_company': fields['current_company'],
                        'location': fields['location'],
                        'linkedin_url': fields['linkedin_url'],
                        'promotion': promo,
                        'status': Profile.Status.DRAFT
                    }
                )
                profile_map[p_data['pk']] = profile

            for e_data in ALUMNI_DATA['education']:
                fields = e_data['fields']
                profile = profile_map.get(fields['profile'])
                if not profile:
                    continue
                
                Education.objects.get_or_create(
                    profile=profile,
                    school=fields['school'],
                    degree=fields['degree'],
                    year=fields['year']
                )

            for ex_data in ALUMNI_DATA['experience']:
                fields = ex_data['fields']
                profile = profile_map.get(fields['profile'])
                if not profile:
                    continue
                
                Experience.objects.get_or_create(
                    profile=profile,
                    title=fields['title'],
                    company=fields['company'],
                    defaults={'description': fields['description']}
                )

            # 7. Create Events
            self.stdout.write('Creating 15 Mock Events...')
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
                if i < 5:
                    event_date = timezone.now() - timezone.timedelta(days=random.randint(7, 30))
                else:
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
