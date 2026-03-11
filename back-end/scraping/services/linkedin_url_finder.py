import httpx
import logging
from typing import Optional

from django.conf import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://api.apify.com/v2"


def find_linkedin_url(first_name: str, last_name: str) -> Optional[str]:
    """
    Recherche l'URL du profil LinkedIn d'une personne via Google (Apify).
    Utilise l'actor défini par APIFY_GOOGLE_ACTOR_ID (epctex/google-search-scraper).
    Retourne la première URL linkedin.com/in/... trouvée, ou None.
    """
    token = settings.APIFY_API_TOKEN
    actor_id = settings.APIFY_GOOGLE_ACTOR_ID

    query = f'site:linkedin.com/in "{first_name} {last_name}"'
    logger.info("[URLFinder] Google Search : %s %s", first_name, last_name)

    actor_id_encoded = actor_id.replace("/", "~")
    endpoint = f"{BASE_URL}/acts/{actor_id_encoded}/run-sync-get-dataset-items"

    payload = {
        "queries": query,
        "maxPagesPerQuery": 1,
        "resultsPerPage": 3,
        "languageCode": "fr",
    }

    try:
        response = httpx.post(
            endpoint,
            params={"token": token},
            json=payload,
            timeout=60.0,
        )
        response.raise_for_status()

        results = response.json()
        for result_page in results:
            organic_results = result_page.get("organicResults") or result_page.get("organic_results") or []
            for organic in organic_results:
                url = organic.get("url", "")
                if "linkedin.com/in/" in url:
                    logger.info("[URLFinder] Trouvé : %s", url)
                    return url

        logger.warning("[URLFinder] Aucun profil trouvé pour %s %s", first_name, last_name)
        return None

    except Exception as e:
        logger.error("[URLFinder] Erreur %s %s: %s", first_name, last_name, e)
        return None
