# Services AlumniConnect

## Services Backend (Django)

| Service           | Path                     | Description                                   |
| ----------------- | ------------------------ | --------------------------------------------- |
| AlumniService     | `alumni/services.py`     | Logique métier profils, inférence, import CSV |
| ScraperService    | `scraping/scraper.py`    | Scraping LinkedIn via Chrome relay            |
| ExporterService   | `scraping/exporters.py`  | Export CSV/JSON des données scrappées         |
| IngestorService   | `scraping/ingestor.py`   | Import fichiers staging → base de données     |
| NetworkingService | `networking/services.py` | Mise en relation, demandes de contact         |
| JobService        | `jobs/services.py`       | Publication et gestion des offres             |
| EventService      | `events/services.py`     | Création et gestion des événements            |

## Services Frontend (Angular)

| Service       | Path                                | Description                              |
| ------------- | ----------------------------------- | ---------------------------------------- |
| AuthService   | `core/auth/auth.service.ts`         | Login, logout, refresh token, user state |
| ApiService    | `core/services/api.service.ts`      | Wrapper HttpClient avec base URL         |
| AlumniService | `features/alumni/alumni.service.ts` | CRUD profils alumni                      |
| JobService    | `features/jobs/job.service.ts`      | CRUD offres d'emploi                     |
| EventService  | `features/events/event.service.ts`  | CRUD événements                          |

---

## AuthService (Angular)

```typescript
// core/auth/auth.service.ts
@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>("/api/auth/login/", { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem("access", res.access);
          localStorage.setItem("refresh", res.refresh);
          this.currentUser.set(res.user);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    this.currentUser.set(null);
    this.router.navigate(["/login"]);
  }

  getAccessToken(): string | null {
    return localStorage.getItem("access");
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = localStorage.getItem("refresh");
    return this.http
      .post<{ access: string }>("/api/auth/token/refresh/", { refresh })
      .pipe(tap((res) => localStorage.setItem("access", res.access)));
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return !!user && ["SUPER_ADMIN", "ADMIN"].includes(user.role);
  }

  isSuperAdmin(): boolean {
    return this.currentUser()?.role === "SUPER_ADMIN";
  }
}
```

## AlumniService (Angular)

```typescript
// features/alumni/alumni.service.ts
@Injectable({ providedIn: "root" })
export class AlumniService {
  private http = inject(HttpClient);
  private baseUrl = "/api/alumni/profiles";

  getAll(params?: HttpParams): Observable<PaginatedResponse<Profile>> {
    return this.http.get<PaginatedResponse<Profile>>(this.baseUrl + "/", {
      params,
    });
  }

  getById(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/${id}/`);
  }

  getMe(): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/me/`);
  }

  update(id: number, data: Partial<Profile>): Observable<Profile> {
    return this.http.patch<Profile>(`${this.baseUrl}/${id}/`, data);
  }

  validate(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/validate/`, {});
  }
}
```

## ScraperService (Django Backend)

```python
# scraping/scraper.py
import csv
import os
from datetime import datetime

class ScraperService:
    STAGING_DIR = 'data/staging'

    def __init__(self, school: str, year_min: int = None, year_max: int = None):
        self.school = school
        self.year_min = year_min
        self.year_max = year_max
        self.results = []

    def build_search_url(self) -> str:
        """Construit l'URL de recherche LinkedIn."""
        base = 'https://www.linkedin.com/search/results/people/'
        params = f'?keywords={self.school}'
        if self.year_min:
            params += f'&schoolFilter=...'
        return base + params

    def scrape(self) -> list[dict]:
        """Exécute le scraping (appelé via management command)."""
        # Utilise le skill linkedin-scraper (Chrome relay)
        # Respecte les rate limits (3-8s entre requêtes, max 80/session)
        ...
        return self.results

    def export_to_csv(self, data: list[dict]) -> str:
        """Exporte les résultats dans un CSV horodaté."""
        os.makedirs(self.STAGING_DIR, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filepath = os.path.join(self.STAGING_DIR, f'scrape_{timestamp}.csv')

        fieldnames = [
            'full_name', 'first_name', 'last_name', 'email',
            'linkedin_url', 'current_job', 'school', 'degree',
            'graduation_year', 'extracted_at'
        ]
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)

        return filepath
```

## Management Commands

```python
# scraping/management/commands/scrape_linkedin.py
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Scrape LinkedIn profiles for alumni discovery'

    def add_arguments(self, parser):
        parser.add_argument('--school', type=str, required=True)
        parser.add_argument('--year-min', type=int, default=None)
        parser.add_argument('--year-max', type=int, default=None)
        parser.add_argument('--test-mode', action='store_true')

    def handle(self, *args, **options):
        scraper = ScraperService(
            school=options['school'],
            year_min=options.get('year_min'),
            year_max=options.get('year_max'),
        )
        data = scraper.scrape()
        filepath = scraper.export_to_csv(data)
        self.stdout.write(self.style.SUCCESS(f'Exported {len(data)} profiles to {filepath}'))
```

## Variables d'Environnement

```env
# Database
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_NAME=app_db
DATABASE_USER=app_user
DATABASE_PASSWORD=app_password

# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# JWT
ACCESS_TOKEN_LIFETIME_MINUTES=30
REFRESH_TOKEN_LIFETIME_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

## Interfaces TypeScript

```typescript
// Types partagés côté Angular
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
  linkedin_url?: string;
  graduation_year?: number;
  degree?: string;
}

interface Profile {
  id: number;
  full_name: string;
  bio: string;
  current_job_title: string;
  current_company: string;
  location: string;
  avatar_url?: string;
  status: "DRAFT" | "VERIFIED";
  educations: Education[];
  experiences: Experience[];
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
```
