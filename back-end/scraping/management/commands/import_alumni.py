import csv
import logging
import re

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

from accounts.models import Role
from alumni.models import Profile
from scraping.models import LinkedInScrapingTask

User = get_user_model()
logger = logging.getLogger(__name__)

# RTF escape sequences for accented characters
RTF_CHAR_MAP = {
    r"\'e9": "é",
    r"\'e8": "è",
    r"\'ea": "ê",
    r"\'eb": "ë",
    r"\'e0": "à",
    r"\'e2": "â",
    r"\'e4": "ä",
    r"\'f4": "ô",
    r"\'f9": "ù",
    r"\'fb": "û",
    r"\'fc": "ü",
    r"\'ee": "î",
    r"\'ef": "ï",
    r"\'e7": "ç",
    r"\'c9": "É",
    r"\'c8": "È",
    r"\'cf": "Ï",
}


def strip_rtf(text: str) -> str:
    """
    Convertit un fichier RTF simple en texte brut CSV.
    Gère les séquences d'échappement RTF pour les accents.
    """
    # Remplacer les séquences d'échappement RTF par les caractères réels
    for rtf_seq, char in RTF_CHAR_MAP.items():
        text = text.replace(rtf_seq, char)

    # Supprimer l'en-tête RTF (tout jusqu'à la première ligne de données)
    # Le header RTF finit avant la ligne Prénom,NOM
    lines = text.split('\n')
    data_lines = []
    found_header = False
    for line in lines:
        # Nettoyer les commandes RTF restantes
        cleaned = re.sub(r'\\[a-z]+\d*\s?', '', line)
        cleaned = re.sub(r'\{[^}]*\}', '', cleaned)
        cleaned = cleaned.replace('\\', '').strip()

        # Chercher la ligne d'en-tête CSV
        if not found_header:
            if 'nom' in cleaned.lower() and ('prenom' in cleaned.lower() or 'prénom' in cleaned.lower()):
                found_header = True
                data_lines.append(cleaned)
        else:
            if cleaned:
                # Remove trailing brace from the very last line of RTF
                if cleaned.endswith('}'):
                    cleaned = cleaned[:-1]
                data_lines.append(cleaned)

    return '\n'.join(data_lines)


class Command(BaseCommand):
    help = "Importe des Alumni depuis un fichier CSV (colonnes: Prénom, NOM). Supporte les fichiers RTF."

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Chemin vers le fichier CSV ou RTF')
        parser.add_argument(
            '--launch-scraping',
            action='store_true',
            help='Lance automatiquement le scraping après import',
        )

    def handle(self, *args, **options):
        csv_path = options['csv_file']
        created_count = 0
        skipped_count = 0

        try:
            with open(csv_path, 'r', encoding='utf-8-sig') as f:
                raw_content = f.read()
        except FileNotFoundError:
            raise CommandError(f"Fichier introuvable : {csv_path}")

        # Détection automatique RTF vs CSV pur
        if raw_content.strip().startswith('{\\rtf'):
            self.stdout.write(self.style.WARNING("Fichier RTF détecté — conversion automatique en CSV"))
            csv_content = strip_rtf(raw_content)
        else:
            csv_content = raw_content

        reader = csv.DictReader(csv_content.splitlines())

        # Normaliser les noms de colonnes
        if reader.fieldnames:
            reader.fieldnames = [
                name.strip().lower()
                    .replace('é', 'e')
                    .replace('è', 'e')
                for name in reader.fieldnames
            ]

        for row in reader:
            first_name = row.get('prenom', '').strip().title()
            last_name = row.get('nom', '').strip().upper()

            if not first_name or not last_name:
                self.stdout.write(self.style.WARNING(f"Ligne ignorée (données manquantes) : {row}"))
                skipped_count += 1
                continue

            # Générer un email par défaut si absent
            email = row.get('email', '').strip()
            if not email:
                clean_first = first_name.lower().replace(' ', '-')
                clean_last = last_name.lower().replace(' ', '-')
                email = f"{clean_first}.{clean_last}@my-digital-school.org"

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': Role.MEMBER,
                },
            )
            Profile.objects.get_or_create(user=user)
            LinkedInScrapingTask.objects.get_or_create(user=user)

            if created:
                created_count += 1
                self.stdout.write(f"  ✅ {first_name} {last_name} ({email})")
            else:
                skipped_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nImport terminé — {created_count} créés, {skipped_count} existants/ignorés"
        ))

        if options['launch_scraping']:
            from scraping.tasks import scrape_all_pending_tasks
            scrape_all_pending_tasks.delay()
            self.stdout.write(self.style.SUCCESS("🚀 Scraping lancé en arrière-plan"))
