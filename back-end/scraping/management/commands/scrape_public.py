"""
Management command : scrape les profils LinkedIn publics (gratuit)
pour remplir avatar_url, current_company, location, current_job_title
et créer les entrées Education.
"""
import logging

from django.core.management.base import BaseCommand
from django.db import transaction

from alumni.models import Profile, Education
from scraping.services.public_scraper import scrape_public_profile

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Scrape les pages publiques LinkedIn pour remplir avatar, headline, company, school, location."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Affiche les données extraites sans modifier la base.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Limiter le nombre de profils à scraper (0 = tous).",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        limit = options["limit"]

        profiles = (
            Profile.objects
            .exclude(linkedin_url__isnull=True)
            .exclude(linkedin_url="")
            .select_related("user")
        )

        if limit:
            profiles = profiles[:limit]

        total = profiles.count() if not limit else min(limit, profiles.count())
        self.stdout.write(f"Scraping public LinkedIn pour {total} profil(s)…\n")

        updated_count = 0
        error_count = 0

        import time
        import random

        for i, profile in enumerate(profiles, 1):
            self.stdout.write(
                f"  [{i}/{total}] {profile.user.first_name} {profile.user.last_name} "
                f"— {profile.linkedin_url}"
            )

            data = scrape_public_profile(profile.linkedin_url)
            if not data:
                self.stdout.write(self.style.ERROR(f"    ❌ Échec"))
                error_count += 1
                continue

            avatar = data.get("avatar_url")
            headline = data.get("headline", "")
            company = data.get("current_company", "")
            school = data.get("school", "")
            location = data.get("location", "")

            self.stdout.write(
                f"    📸 avatar: {'✅' if avatar else '❌'}"
                f"  |  🏢 {company or '—'}"
                f"  |  🎓 {school or '—'}"
                f"  |  📍 {location or '—'}"
            )

            if dry_run:
                continue

            with transaction.atomic():
                changed = False

                if avatar and not profile.avatar_url:
                    profile.avatar_url = avatar
                    changed = True

                if headline and not profile.current_job_title:
                    profile.current_job_title = headline[:255]
                    changed = True

                if company and not profile.current_company:
                    profile.current_company = company[:255]
                    changed = True

                if location and not profile.location:
                    profile.location = location[:255]
                    changed = True

                if changed:
                    profile.save()

                # Ajouter l'école si elle n'existe pas déjà
                if school and not Education.objects.filter(profile=profile, school__icontains=school[:50]).exists():
                    Education.objects.create(
                        profile=profile,
                        school=school[:255],
                        degree="My Digital School",
                    )

                updated_count += 1

            # Rate limiting
            if i < total:
                delay = random.uniform(2.0, 4.0)
                time.sleep(delay)

        if dry_run:
            self.stdout.write(self.style.WARNING("\nMode dry-run — aucune modification."))
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✅ {updated_count} profil(s) mis à jour, {error_count} erreur(s)."
                )
            )
