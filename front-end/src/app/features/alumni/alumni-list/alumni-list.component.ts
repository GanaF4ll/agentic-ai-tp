import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AlumniService } from '../../../core/services/alumni.service';
import { Profile } from '../../../core/models/profile.model';
import { AlumniCardComponent } from '../../../shared/components/alumni/alumni-card.component';
import { LucideAngularModule, Search, Filter } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, switchMap, startWith, tap, catchError, of } from 'rxjs';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-alumni-list',
  standalone: true,
  imports: [ReactiveFormsModule, AlumniCardComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <!-- Header Bento Block -->
      <header
        class="col-span-full relative overflow-hidden rounded-[var(--radius-card)] glass px-8 py-12 text-white shadow-[var(--shadow-card)] border border-white/20"
      >
        <!-- Abstract background pattern -->
        <div
          class="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/30 blur-3xl opacity-50"
        ></div>
        <div
          class="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl opacity-30"
        ></div>

        <div
          class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
        >
          <div class="max-w-2xl">
            <h1 class="text-5xl font-black tracking-tighter leading-none mb-4 text-white">
              Annuaire <span class="opacity-70">des Alumni</span>
            </h1>
            <p class="text-xl text-white/80 font-medium leading-relaxed">
              Explorez le réseau de nos brillants diplômés. Connectez-vous, partagez et grandissez
              ensemble au sein de notre communauté professionnelle.
            </p>
          </div>

          <div
            class="stats glass-solid border border-white/20 text-white shadow-2xl rounded-2xl bg-white/5"
          >
            <div class="stat px-8 py-6">
              <div
                class="stat-title text-white/60 uppercase tracking-[0.2em] text-[10px] font-black"
              >
                Force du réseau
              </div>
              <div class="stat-value text-5xl font-black tabular-nums text-white">{{ profiles().length }}</div>
              <div class="stat-desc text-white/70 mt-2 font-bold flex items-center gap-2">
                <span class="size-2 rounded-full bg-success animate-pulse"></span>
                Membres vérifiés
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Sidebar Filter Block -->
      <aside class="col-span-full lg:col-span-2 flex flex-col gap-6">
        <section class="card glass shadow-[var(--shadow-card)] border border-white/10 rounded-[var(--radius-card)]">
          <div class="card-body p-6">
            <h2 class="text-xs font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <lucide-angular [img]="filterIcon" class="size-3"></lucide-angular>
              Recherche & Filtres
            </h2>
            
            <form [formGroup]="filterForm" class="flex flex-col gap-5">
              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-white/80">Mot-clé</legend>
                <div class="input glass border-white/10 flex items-center gap-3 w-full h-12 focus-within:ring-2 ring-primary/50 transition-all bg-white/5 text-white">
                  <lucide-angular [img]="searchIcon" class="size-4 opacity-40 text-white"></lucide-angular>
                  <input
                    type="text"
                    formControlName="search"
                    class="grow text-sm font-medium placeholder:text-white/40 bg-transparent border-none focus:outline-none"
                    placeholder="Nom, compétences, ou poste..."
                  />
                </div>
              </fieldset>

              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-white/80">Année de promotion</legend>
                <select formControlName="graduation_year" class="select glass border-white/10 w-full h-12 text-sm font-medium focus:ring-2 ring-primary/50 bg-white/5 text-white option:text-black">
                  <option [value]="null" class="text-black">Toutes les promos</option>
                  @for (year of years; track year) {
                    <option [value]="year" class="text-black">Promotion {{ year }}</option>
                  }
                </select>
              </fieldset>

              <div class="divider opacity-10 my-0 before:bg-white after:bg-white"></div>

              <button type="button" class="btn btn-ghost btn-sm h-10 gap-2 normal-case font-bold text-white/60 hover:text-white hover:bg-white/10">
                Filtres avancés
              </button>
              
              <button type="button" (click)="resetFilters()" class="btn btn-primary h-12 font-bold shadow-lg shadow-primary/20 border-none text-primary-content">
                Appliquer les filtres
              </button>
            </form>
          </div>
        </section>

        <!-- Informational Bento Block -->
        <section class="card glass border border-white/10 rounded-[var(--radius-card)] overflow-hidden bg-white/5">
          <div class="card-body p-6">
             <div class="size-10 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 text-secondary">
               <lucide-angular [img]="filterIcon" class="size-5"></lucide-angular>
             </div>
             <h3 class="font-black text-white leading-tight">Rejoignez le programme de mentorat</h3>
             <p class="text-sm text-white/70 mt-2">Connectez-vous avec des alumni seniors et accélérez votre carrière.</p>
             <button class="btn btn-secondary btn-sm mt-4 font-bold border-none text-secondary-content">En savoir plus</button>
          </div>
        </section>
      </aside>

      <!-- Main Results Grid -->
      <main class="col-span-full lg:col-span-4">
        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="flex flex-col gap-4 w-full p-6 glass rounded-[var(--radius-card)] border border-white/10 shadow-sm">
                <div class="flex gap-4 items-center">
                  <div class="skeleton bg-white/10 size-16 rounded-2xl shrink-0"></div>
                  <div class="flex flex-col gap-2 grow">
                    <div class="skeleton bg-white/10 h-5 w-32"></div>
                    <div class="skeleton bg-white/10 h-4 w-48"></div>
                  </div>
                </div>
                <div class="skeleton bg-white/10 h-24 w-full rounded-xl mt-2"></div>
                <div class="flex gap-2 justify-end mt-4">
                  <div class="skeleton bg-white/10 h-10 w-24"></div>
                  <div class="skeleton bg-white/10 h-10 w-24"></div>
                </div>
              </div>
            }
          </div>
        } @else if (profiles().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (alumni of profiles(); track alumni.id) {
              <app-alumni-card [alumni]="alumni"></app-alumni-card>
            }
          </div>

          <div class="flex justify-center mt-12">
            <div class="join glass p-1 rounded-2xl border border-white/20 shadow-sm bg-white/5">
              <button class="join-item btn btn-ghost btn-sm px-4 text-white hover:bg-white/10">Précédent</button>
              <button class="join-item btn btn-primary btn-sm px-4 rounded-xl border-none text-primary-content">1</button>
              <button class="join-item btn btn-ghost btn-sm px-4 text-white hover:bg-white/10">2</button>
              <button class="join-item btn btn-ghost btn-sm px-4 text-white hover:bg-white/10">Suivant</button>
            </div>
          </div>
        } @else {
          <div
            class="flex flex-col items-center justify-center py-24 glass rounded-[var(--radius-card)] border-2 border-dashed border-white/20 shadow-sm"
          >
            <div class="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <lucide-angular
                [img]="searchIcon"
                class="size-8 text-white/20"
              ></lucide-angular>
            </div>
            <h3 class="text-2xl font-black tracking-tight text-white">Aucun alumni trouvé</h3>
            <p class="text-white/50 mt-2 max-w-xs text-center font-medium">
              Nous n'avons trouvé personne correspondant à vos filtres actuels.
            </p>
            <button class="btn btn-primary mt-8 px-8 font-bold shadow-lg shadow-primary/20 border-none text-primary-content" (click)="resetFilters()">
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

  years = Array.from({ length: 11 }, (_, i) => 2026 - i);

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
      startWith(this.filterForm.value)
    ),
    { initialValue: this.filterForm.value }
  );

  // Derived signal for profiles based on filters
  profiles = toSignal(
    toObservable(this.filters).pipe(
      tap(() => this.isLoading.set(true)),
      switchMap((filters) =>
        this.alumniService.getProfiles(filters as any).pipe(
          catchError(() => {
            console.error('API Error, falling back to mock profiles');
            return of(this.getMockProfiles());
          })
        )
      ),
      tap(() => this.isLoading.set(false))
    ),
    { initialValue: [] as Profile[] }
  );

  resetFilters() {
    this.filterForm.reset();
  }

  private getMockProfiles(): Profile[] {
    return [
      {
        id: 1,
        first_name: 'Alice',
        last_name: 'Durand',
        email: 'alice@example.com',
        degree: 'Mastère en IA',
        graduation_year: 2024,
        status: 'VERIFIED',
        is_verified: true,
        linkedin_url: 'https://linkedin.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        first_name: 'Bob',
        last_name: 'Martin',
        email: 'bob@example.com',
        degree: 'Génie Logiciel',
        graduation_year: 2025,
        status: 'VERIFIED',
        is_verified: true,
        linkedin_url: 'https://linkedin.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        first_name: 'Claire',
        last_name: 'Lefebvre',
        email: 'claire@example.com',
        degree: 'Cybersécurité',
        graduation_year: 2023,
        status: 'DRAFT',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}
