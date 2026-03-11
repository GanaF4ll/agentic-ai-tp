"""
Management command to migrate all @alumni.local emails to @my-digital-school.org
and reset erroneously-done scraping tasks.
"""
import logging

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from scraping.models import LinkedInScrapingTask

logger = logging.getLogger(__name__)

OLD_DOMAIN = "@alumni.local"
NEW_DOMAIN = "@my-digital-school.org"


class Command(BaseCommand):
    help = (
        "Migre les emails @alumni.local → @my-digital-school.org "
        "et remet en 'pending' les tâches de scraping échouées."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Affiche les modifications sans les appliquer",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        users = User.objects.filter(email__endswith=OLD_DOMAIN)
        self.stdout.write(f"Trouvé {users.count()} utilisateur(s) avec {OLD_DOMAIN}")

        if dry_run:
            for u in users:
                new_email = u.email.replace(OLD_DOMAIN, NEW_DOMAIN)
                self.stdout.write(f"  [DRY-RUN] {u.email} → {new_email}")
            self.stdout.write(self.style.WARNING("Mode dry-run — aucune modification."))
            return

        migrated = 0
        with transaction.atomic():
            for u in users:
                old_email = u.email
                u.email = old_email.replace(OLD_DOMAIN, NEW_DOMAIN)
                u.save(update_fields=["email"])
                migrated += 1
                self.stdout.write(f"  ✅ {old_email} → {u.email}")

        self.stdout.write(
            self.style.SUCCESS(f"\n{migrated} email(s) migrés vers {NEW_DOMAIN}")
        )

        # Reset erroneously-done scraping tasks (those with error in raw_data)
        error_tasks = LinkedInScrapingTask.objects.filter(
            status=LinkedInScrapingTask.Status.DONE,
            raw_data__has_key="error",
        )
        reset_count = error_tasks.update(
            status=LinkedInScrapingTask.Status.PENDING,
            raw_data={},
            error_message="",
        )
        if reset_count:
            self.stdout.write(
                self.style.SUCCESS(
                    f"{reset_count} tâche(s) de scraping réinitialisées (contenaient une erreur)."
                )
            )
