import logging
from datetime import datetime, timezone, date, timedelta

from celery import shared_task
from django.db import transaction, models
from django.db.models import Q
from django.utils.timezone import now

from accounts.models import User
from alumni.models import Profile, Education, Experience
from scraping.models import LinkedInScrapingTask
from scraping.services.apify_scraper import scrape_linkedin_profile, parse_profile
from scraping.services.linkedin_url_finder import find_linkedin_url

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def scrape_alumni_profile(self, user_id: int, force_refresh: bool = False):
    """
    Tâche complète pour un alumni :
    1. Cherche l'URL LinkedIn si absente
    2. Scrape le profil via Apify
    3. Met à jour Profile, Education, Experience en base
    """
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.error("[Task] User %d introuvable", user_id)
        return

    profile, _ = Profile.objects.get_or_create(user=user)
    task, _ = LinkedInScrapingTask.objects.get_or_create(user=user)

    # Skip si déjà traité et pas de force_refresh
    if not force_refresh and task.status == LinkedInScrapingTask.Status.DONE:
        logger.info("[Task] %s déjà traité, skip.", user.email)
        return

    try:
        # Étape 1 — Trouver l'URL LinkedIn
        if not profile.linkedin_url:
            task.status = LinkedInScrapingTask.Status.SCRAPING
            task.save(update_fields=['status'])

            url = find_linkedin_url(user.first_name, user.last_name)
            if not url:
                task.status = LinkedInScrapingTask.Status.URL_NOT_FOUND
                task.error_message = "URL LinkedIn introuvable via Google"
                task.save(update_fields=['status', 'error_message'])
                logger.warning("[Task] URL introuvable pour %s", user.email)
                return

            profile.linkedin_url = url
            profile.save(update_fields=['linkedin_url'])

        # Étape 2 — Scraper le profil
        task.status = LinkedInScrapingTask.Status.SCRAPING
        task.save(update_fields=['status'])

        raw_data = scrape_linkedin_profile(profile.linkedin_url)
        parsed = parse_profile(raw_data)

        # Étape 3 — Mise à jour atomique
        with transaction.atomic():
            # Profile
            profile.avatar_url = parsed.get("avatar_url") or profile.avatar_url
            profile.current_job_title = parsed.get("current_job_title") or profile.current_job_title
            profile.current_company = parsed.get("current_company") or profile.current_company
            profile.location = parsed.get("location") or profile.location
            profile.bio = parsed.get("bio") or profile.bio
            profile.save()

            # Refresh Education (delete + re-create)
            Education.objects.filter(profile=profile).delete()
            for edu in parsed.get("education", []):
                Education.objects.create(
                    profile=profile,
                    school=edu.get("school", ""),
                    degree=edu.get("degree", ""),
                    year=edu.get("year"),
                )

            # Refresh Experience (delete + re-create)
            Experience.objects.filter(profile=profile).delete()
            for exp in parsed.get("experiences", []):
                start_date = date(exp["start_year"], 1, 1) if exp.get("start_year") else None
                end_date = date(exp["end_year"], 1, 1) if exp.get("end_year") else None
                Experience.objects.create(
                    profile=profile,
                    title=exp.get("title", ""),
                    company=exp.get("company", ""),
                    start_date=start_date,
                    end_date=end_date,
                    description=exp.get("description", ""),
                )

            # Marquer la tâche comme terminée
            task.raw_data = raw_data
            task.status = LinkedInScrapingTask.Status.DONE
            task.scraped_at = datetime.now(timezone.utc)
            task.error_message = ""
            task.save()

        logger.info("[Task] ✅ Succès pour %s", user.email)

    except Exception as exc:
        logger.error("[Task] ❌ Erreur pour %s : %s", user.email, exc)
        task.status = LinkedInScrapingTask.Status.ERROR
        task.error_message = str(exc)[:1000]
        task.save(update_fields=['status', 'error_message'])
        raise self.retry(exc=exc)


@shared_task
def scrape_all_pending_tasks():
    """
    Lance le scraping pour tous les alumni en attente, en erreur,
    ou sans URL trouvée.
    """
    task_qs = LinkedInScrapingTask.objects.filter(
        status__in=[
            LinkedInScrapingTask.Status.PENDING,
            LinkedInScrapingTask.Status.ERROR,
            LinkedInScrapingTask.Status.URL_NOT_FOUND,
        ]
    )
    ids = list(task_qs.values_list('user_id', flat=True))
    logger.info("[Task] Lancement global pour %d profils", len(ids))

    for uid in ids:
        scrape_alumni_profile.delay(uid)

    return f"{len(ids)} tâches lancées"


@shared_task
def refresh_all_alumni_positions():
    """
    Tâche périodique (tous les 6 mois) pour rafraîchir le poste actuel des alumni.
    Identifie les profils dont le dernier scraping date de plus de 180 jours.
    """
    six_months_ago = now() - timedelta(days=180)
    
    # On prend ceux qui ont fini leur scraping il y a plus de 6 mois
    # OU ceux qui n'ont jamais été scrapés (scraped_at is null) mais qui existent
    task_qs = LinkedInScrapingTask.objects.filter(
        models.Q(scraped_at__lte=six_months_ago) | models.Q(scraped_at__isnull=True)
    )
    
    ids = list(task_qs.values_list('user_id', flat=True))
    logger.info("[Task] Rafraîchissement périodique pour %d profils", len(ids))

    for uid in ids:
        scrape_alumni_profile.delay(uid, force_refresh=True)

    return f"{len(ids)} rafraîchissements lancés"
