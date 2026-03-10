import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AlumniService } from '../../../core/services/alumni.service';
import { Profile } from '../../../core/models/profile.model';
import { AlumniCardComponent } from '../../../shared/components/alumni/alumni-card.component';
import { LucideAngularModule, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-angular';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  tap,
  catchError,
  of,
  Observable,
} from 'rxjs';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-alumni-list',
  standalone: true,
  imports: [ReactiveFormsModule, AlumniCardComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <!-- Header Bento Block -->
      <header
        class="col-span-full relative overflow-hidden rounded-[var(--radius-card)] bg-base-100 px-8 py-12 text-base-content shadow-[var(--shadow-card)] border border-base-200"
      >
        <!-- Abstract background pattern -->
        <div
          class="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-50"
        ></div>
        <div
          class="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-secondary/10 blur-3xl opacity-30"
        ></div>

        <div
          class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
        >
          <div class="max-w-2xl">
            <h1 class="text-5xl font-black tracking-tighter leading-none mb-4 text-base-content">
              Annuaire <span class="text-base-content/40">des Alumni</span>
            </h1>
            <p class="text-xl text-base-content/70 font-medium leading-relaxed">
              Explorez le réseau de nos brillants diplômés. Connectez-vous, partagez et grandissez
              ensemble au sein de notre communauté professionnelle.
            </p>
          </div>

          <div
            class="stats bg-base-100 border border-base-200 text-base-content shadow-2xl rounded-2xl bg-base-200/50"
          >
            <div class="stat px-8 py-6">
              <div
                class="stat-title text-base-content/60 uppercase tracking-[0.2em] text-[10px] font-black"
              >
                Force du réseau
              </div>
              <div class="stat-value text-5xl font-black tabular-nums text-primary">
                {{ totalCount() }}
              </div>
              <div class="stat-desc text-base-content/70 mt-2 font-bold flex items-center gap-2">
                <span class="size-2 rounded-full bg-success animate-pulse"></span>
                Membres vérifiés
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Sidebar Filter Block -->
      <aside class="col-span-full lg:col-span-2 flex flex-col gap-6">
        <section
          class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)]"
        >
          <div class="card-body p-6">
            <h2
              class="text-xs font-black uppercase tracking-widest text-base-content/40 mb-4 flex items-center gap-2"
            >
              <lucide-angular [img]="filterIcon" class="size-3"></lucide-angular>
              Recherche & Filtres
            </h2>

            <form [formGroup]="filterForm" class="flex flex-col gap-5">
              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-base-content/80">Mot-clé</legend>
                <div
                  class="input glass border-base-200 flex items-center gap-3 w-full h-12 focus-within:ring-2 ring-primary/50 transition-all bg-base-200/50 text-base-content"
                >
                  <lucide-angular
                    [img]="searchIcon"
                    class="size-4 opacity-40 text-base-content"
                  ></lucide-angular>
                  <input
                    type="text"
                    formControlName="search"
                    class="grow text-sm font-medium placeholder:text-base-content/40 bg-transparent border-none focus:outline-none"
                    placeholder="Nom, compétences, ou poste..."
                  />
                </div>
              </fieldset>

              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-base-content/80">
                  Année de promotion
                </legend>
                <select
                  formControlName="graduation_year"
                  class="select glass border-base-200 w-full h-12 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content"
                >
                  <option [value]="null">Toutes les promos</option>
                  @for (year of years; track year) {
                    <option [value]="year">Promotion {{ year }}</option>
                  }
                </select>
              </fieldset>

              <div class="divider opacity-10 my-0 before:bg-base-content after:bg-base-content"></div>

              <button
                type="button"
                class="btn btn-ghost btn-sm h-10 gap-2 normal-case font-bold text-base-content/60 hover:text-primary hover:bg-base-200"
              >
                Filtres avancés
              </button>

              <button
                type="button"
                (click)="resetFilters()"
                class="btn btn-primary h-12 font-bold shadow-lg shadow-primary/20 border-none text-primary-content"
              >
                Réinitialiser
              </button>
            </form>
          </div>
        </section>

        <!-- Informational Bento Block -->
        <section
          class="card bg-base-100 border border-base-200 rounded-[var(--radius-card)] overflow-hidden "
        >
          <div class="card-body p-6">
            <div
              class="size-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 text-secondary"
            >
              <lucide-angular [img]="filterIcon" class="size-5"></lucide-angular>
            </div>
            <h3 class="font-black text-base-content leading-tight">Rejoignez le programme de mentorat</h3>
            <p class="text-sm text-base-content/70 mt-2">
              Connectez-vous avec des alumni seniors et accélérez votre carrière.
            </p>
            <button
              class="btn btn-secondary btn-sm mt-4 font-bold border-none text-secondary-content"
            >
              En savoir plus
            </button>
          </div>
        </section>
      </aside>

      <!-- Main Results Grid -->
      <main class="col-span-full lg:col-span-4">
        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (i of [1, 2, 3, 4]; track i) {
              <div
                class="flex flex-col gap-4 w-full p-6 bg-base-100 rounded-[var(--radius-card)] border border-base-200 shadow-sm"
              >
                <div class="flex gap-4 items-center">
                  <div class="skeleton bg-base-200 size-16 rounded-2xl shrink-0"></div>
                  <div class="flex flex-col gap-2 grow">
                    <div class="skeleton bg-base-200 h-5 w-32"></div>
                    <div class="skeleton bg-base-200 h-4 w-48"></div>
                  </div>
                </div>
                <div class="skeleton bg-base-200 h-24 w-full rounded-xl mt-2"></div>
                <div class="flex gap-2 justify-end mt-4">
                  <div class="skeleton bg-base-200 h-10 w-24"></div>
                  <div class="skeleton bg-base-200 h-10 w-24"></div>
                </div>
              </div>
            }
          </div>
        } @else if (profiles().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (alumni of paginatedProfiles(); track alumni.id) {
              <app-alumni-card [alumni]="alumni"></app-alumni-card>
            }
          </div>

          @if (totalCount() > 0) {
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-base-100 p-4 rounded-2xl border border-base-200">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Afficher</span>
                <select
                  [value]="limit()"
                  (change)="onLimitChange($event)"
                  class="select select-xs bg-base-200/50 border-base-200 text-base-content rounded-lg"
                >
                  <option value="4">4</option>
                  <option value="8">8</option>
                  <option value="12">12</option>
                  <option value="16">16</option>
                </select>
                <span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">par page</span>
              </div>

              <div class="join">
                <button
                  [disabled]="page() === 1"
                  (click)="onPageChange(page() - 1)"
                  class="join-item btn btn-sm bg-base-200/50 border-base-200 text-base-content hover:bg-base-200/50"
                >
                  <lucide-angular [img]="prevIcon" class="size-4"></lucide-angular>
                </button>
                <button class="join-item btn btn-sm bg-primary/10 border-base-200 text-primary hover:bg-primary/20 font-black">
                  Page {{ page() }} sur {{ totalPages() }}
                </button>
                <button
                  [disabled]="page() >= totalPages()"
                  (click)="onPageChange(page() + 1)"
                  class="join-item btn btn-sm bg-base-200/50 border-base-200 text-base-content hover:bg-base-200/50"
                >
                  <lucide-angular [img]="nextIcon" class="size-4"></lucide-angular>
                </button>
              </div>

              <div class="text-xs font-bold text-base-content/40 uppercase tracking-widest">
                {{ totalCount() }} résultats au total
              </div>
            </div>
          }
        } @else {
          <div
            class="flex flex-col items-center justify-center py-24 bg-base-100 rounded-[var(--radius-card)] border-2 border-dashed border-base-200 shadow-sm"
          >
            <div class="size-20 rounded-full bg-base-200 flex items-center justify-center mb-6">
              <lucide-angular [img]="searchIcon" class="size-8 text-base-content/20"></lucide-angular>
            </div>
            <h3 class="text-2xl font-black tracking-tight text-base-content">Aucun alumni trouvé</h3>
            <p class="text-base-content/50 mt-2 max-w-xs text-center font-medium">
              Nous n'avons trouvé personne correspondant à vos filtres actuels.
            </p>
            <button
              class="btn btn-primary mt-8 px-8 font-bold shadow-lg shadow-primary/20 border-none text-primary-content"
              (click)="resetFilters()"
            >
              Réinitialiser les filtres
            </button>
          </div>
        }
      </main>
    </div>
  `,
})
export class AlumniListComponent {
  private fb = inject(FormBuilder);
  private alumniService = inject(AlumniService);

  isLoading = signal(true);
  readonly searchIcon = Search;
  readonly filterIcon = Filter;
  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;
  private readonly API_URL = environment.apiUrl;
  private http = inject(HttpClient);

  years = Array.from({ length: 11 }, (_, i) => 2026 - i);
  page = signal(1);
  limit = signal(8);

  filterForm = this.fb.group({
    search: [''],
    graduation_year: [null as number | null],
    degree: [''],
  });

  // Convert form value changes to a signal
  private filters = toSignal(
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(this.filterForm.value),
    ),
    { initialValue: this.filterForm.value },
  );

  // Derived signal for profiles based on filters
  profiles = toSignal(
    toObservable(this.filters).pipe(
      tap(() => {
        this.page.set(1);
        this.isLoading.set(true);
      }),
      switchMap((filters) =>
        this.alumniService.getProfiles(filters as any).pipe(
          catchError(() => {
            console.error('API Error, falling back to mock profiles');
            return this.getProfiles();
          }),
        ),
      ),
      tap(() => this.isLoading.set(false)),
    ),
    { initialValue: [] as Profile[] },
  );

  totalCount = computed(() => this.profiles().length);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.limit()) || 1);
  paginatedProfiles = computed(() => {
    const start = (this.page() - 1) * this.limit();
    const end = start + this.limit();
    return this.profiles().slice(start, end);
  });

  resetFilters() {
    this.filterForm.reset();
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onLimitChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.limit.set(value);
    this.page.set(1);
  }

  private getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.API_URL}/api/alumni/profiles/`);
  }
}
