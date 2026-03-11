"""
Service de scraping LinkedIn public (gratuit, sans API).
Extrait avatar, headline, entreprise, formation et localisation
depuis les pages publiques LinkedIn via des requêtes HTTP.
"""
import html as html_module
import logging
import re
import time
import random

import httpx

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
}


def _extract_meta(html: str, prop: str) -> str | None:
    """Extrait le contenu d'une balise <meta property='...' content='...'> par regex."""
    # property avant content
    m = re.search(
        rf'<meta\s+[^>]*property=["\']?{re.escape(prop)}["\']?[^>]*content=["\']([^"\']+)["\']',
        html,
    )
    if not m:
        # content avant property
        m = re.search(
            rf'<meta\s+[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']?{re.escape(prop)}["\']?',
            html,
        )
    if not m:
        # name= au lieu de property=
        m = re.search(
            rf'<meta\s+[^>]*name=["\']?{re.escape(prop)}["\']?[^>]*content=["\']([^"\']+)["\']',
            html,
        )
    return html_module.unescape(m.group(1)) if m else None


def _parse_og_description(desc: str) -> dict:
    """
    Parse le og:description LinkedIn, format typique :
    'Headline… · Expérience : Company · Formation : School · Lieu : Location · 500+ relations…'
    """
    result = {
        "headline": "",
        "current_company": "",
        "school": "",
        "location": "",
    }

    parts = [p.strip() for p in desc.split("·")]

    for part in parts:
        part_lower = part.lower()
        if part_lower.startswith("expérience :") or part_lower.startswith("experience :"):
            result["current_company"] = part.split(":", 1)[1].strip()
        elif part_lower.startswith("formation :") or part_lower.startswith("education :"):
            result["school"] = part.split(":", 1)[1].strip()
        elif part_lower.startswith("lieu :") or part_lower.startswith("location :"):
            result["location"] = part.split(":", 1)[1].strip()

    # Le premier segment est généralement le headline
    if parts:
        first = parts[0]
        if not any(first.lower().startswith(p) for p in ("expérience", "experience", "formation", "education", "lieu", "location")):
            result["headline"] = first
            # Supprimer le "…" de troncature
            if result["headline"].endswith("…"):
                result["headline"] = result["headline"][:-1].rstrip()

    return result


def scrape_public_profile(linkedin_url: str) -> dict:
    """
    Scrape une page publique LinkedIn pour extraire les données accessibles.
    Retourne un dict avec: avatar_url, headline, current_company, school, location.
    """
    try:
        resp = httpx.get(
            linkedin_url,
            headers=HEADERS,
            follow_redirects=True,
            timeout=15.0,
        )
        resp.raise_for_status()
    except httpx.HTTPError as e:
        logger.error("[PublicScraper] HTTP error for %s: %s", linkedin_url, e)
        return {}

    page = resp.text

    # === Avatar (og:image) ===
    avatar_url = _extract_meta(page, "og:image")
    # Nettoyer les &amp; en &
    if avatar_url:
        avatar_url = avatar_url.replace("&amp;", "&")
        # Exclure le logo LinkedIn par défaut
        if "licdn.com/dms/image" not in avatar_url:
            avatar_url = None

    # === Title (og:title) — format "Prénom Nom - Company | LinkedIn" ===
    og_title = _extract_meta(page, "og:title")
    current_job_from_title = ""
    if og_title and " - " in og_title:
        # "Gana Fall - Scalian | LinkedIn" → "Scalian"
        after_name = og_title.split(" - ", 1)[1]
        current_job_from_title = after_name.replace(" | LinkedIn", "").strip()

    # === Description (og:description) ===
    desc = _extract_meta(page, "og:description") or _extract_meta(page, "description") or ""
    parsed = _parse_og_description(desc) if desc else {}

    result = {
        "avatar_url": avatar_url,
        "headline": parsed.get("headline", ""),
        "current_company": parsed.get("current_company") or current_job_from_title,
        "school": parsed.get("school", ""),
        "location": parsed.get("location", ""),
    }

    logger.info(
        "[PublicScraper] %s → avatar=%s, company=%s, school=%s",
        linkedin_url,
        bool(result["avatar_url"]),
        result["current_company"],
        result["school"],
    )

    return result


def scrape_all_profiles(profiles_qs) -> list[dict]:
    """
    Scrape plusieurs profils publics avec rate limiting.
    profiles_qs: QuerySet de Profile avec linkedin_url non vide.
    """
    results = []
    total = profiles_qs.count()

    for i, profile in enumerate(profiles_qs, 1):
        logger.info("[PublicScraper] %d/%d — %s", i, total, profile.linkedin_url)
        data = scrape_public_profile(profile.linkedin_url)
        data["profile_id"] = profile.id
        results.append(data)

        # Rate limiting: 2-4 secondes entre chaque requête
        if i < total:
            delay = random.uniform(2.0, 4.0)
            time.sleep(delay)

    return results
