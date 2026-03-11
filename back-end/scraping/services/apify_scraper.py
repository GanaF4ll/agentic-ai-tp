import httpx
import logging

from django.conf import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://api.apify.com/v2"


def scrape_linkedin_profile(linkedin_url: str) -> dict:
    """
    Lance l'actor Apify dev_fusion/linkedin-profile-scraper sur l'URL donnée.
    Retourne le payload brut (dict) du premier résultat.
    Lève une exception en cas d'erreur.
    """
    token = settings.APIFY_API_TOKEN
    actor_id = settings.APIFY_LINKEDIN_ACTOR_ID

    logger.info("[Apify] Scraping: %s", linkedin_url)

    actor_id_encoded = actor_id.replace("/", "~")
    endpoint = f"{BASE_URL}/acts/{actor_id_encoded}/run-sync-get-dataset-items"

    payload = {
        "profileUrls": [linkedin_url],
        "proxy": {"useApifyProxy": True},
    }

    response = httpx.post(
        endpoint,
        params={"token": token},
        json=payload,
        timeout=120.0,
    )
    if response.status_code >= 400:
        logger.error("[Apify] API Error %s: %s", response.status_code, response.text)
    response.raise_for_status()

    items = response.json()
    if not items:
        raise ValueError(f"Aucun résultat retourné par Apify pour {linkedin_url}")

    first = items[0]

    # Detect Apify error responses (e.g. free plan limitation)
    if isinstance(first, dict) and "error" in first and len(first) == 1:
        raise ValueError(f"Apify error: {first['error']}")

    logger.info("[Apify] Succès pour %s — %d item(s)", linkedin_url, len(items))
    return first


def parse_profile(raw: dict) -> dict:
    """
    Normalise le payload brut de dev_fusion/linkedin-profile-scraper
    vers les champs des modèles alumni.Profile, alumni.Education, alumni.Experience.
    """
    experiences = raw.get("experiences") or raw.get("positions") or []
    current_exp = experiences[0] if experiences else {}
    educations = raw.get("educations") or raw.get("education") or []

    return {
        "avatar_url": raw.get("profilePicture") or raw.get("imgUrl") or raw.get("photo"),
        "current_job_title": (raw.get("headline") or raw.get("title") or "")[:255],
        "current_company": (current_exp.get("companyName") or current_exp.get("company") or "")[:255],
        "location": (raw.get("locationName") or raw.get("location") or "")[:255],
        "bio": raw.get("summary") or raw.get("about") or "",
        "education": [
            {
                "school": (edu.get("schoolName") or edu.get("school") or "")[:255],
                "degree": (edu.get("degreeName") or edu.get("degree") or "")[:255],
                "year": edu.get("timePeriod", {}).get("endDate", {}).get("year"),
            }
            for edu in educations
        ],
        "experiences": [
            {
                "title": (exp.get("title") or "")[:255],
                "company": (exp.get("companyName") or exp.get("company") or "")[:255],
                "start_year": exp.get("timePeriod", {}).get("startDate", {}).get("year"),
                "end_year": exp.get("timePeriod", {}).get("endDate", {}).get("year"),
                "description": exp.get("description") or "",
            }
            for exp in experiences[:5]
        ],
    }
