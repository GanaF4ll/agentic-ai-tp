import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AlumniService } from '../../../core/services/alumni.service';
import { Profile } from '../../../core/models/profile.model';
import { AlumniCardComponent } from '../../../shared/components/alumni/alumni-card.component';
import { LucideAngularModule, Search, Filter } from 'lucide-angular';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-alumni-list',
  standalone: true,
  imports: [ReactiveFormsModule, AlumniCardComponent, LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <!-- Header Bento Block -->
      <header
        class="col-span-full relative overflow-hidden rounded-[var(--radius-card)] bg-primary px-8 py-12 text-primary-content shadow-[var(--shadow-card)] border border-primary/20"
      >
        <!-- Abstract background pattern -->
        <div
          class="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/20 blur-3xl opacity-50"
        ></div>
        <div
          class="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-black/5 blur-3xl opacity-30"
        ></div>

        <div
          class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
        >
          <div class="max-w-2xl">
            <h1 class="text-5xl font-black tracking-tighter leading-none mb-4">
              Alumni <span class="opacity-70">Directory</span>
            </h1>
            <p class="text-xl text-primary-content/80 font-medium leading-relaxed">
              Explore the network of our brilliant graduates. Connect, share, and grow together in
              our professional community.
            </p>
          </div>

          <div
            class="stats bg-white/20 backdrop-blur-xl border border-white/30 text-primary-content shadow-2xl rounded-2xl"
          >
            <div class="stat px-8 py-6">
              <div
                class="stat-title text-primary-content/60 uppercase tracking-[0.2em] text-[10px] font-black"
              >
                Network Strength
              </div>
              <div class="stat-value text-5xl font-black tabular-nums">{{ profiles().length }}</div>
              <div class="stat-desc text-primary-content/70 mt-2 font-bold flex items-center gap-2">
                <span class="size-2 rounded-full bg-success animate-pulse"></span>
                Verified Members
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Sidebar Filter Block -->
      <aside class="col-span-full lg:col-span-2 flex flex-col gap-6">
        <section class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)]">
          <div class="card-body p-6">
            <h2 class="text-xs font-black uppercase tracking-widest text-base-content/40 mb-4 flex items-center gap-2">
              <lucide-angular [img]="filterIcon" class="size-3"></lucide-angular>
              Search & Filters
            </h2>
            
            <form [formGroup]="filterForm" class="flex flex-col gap-5">
              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm">Keyword</legend>
                <div class="input input-bordered bg-base-200/50 border-none flex items-center gap-3 w-full h-12 focus-within:ring-2 ring-primary/20 transition-all">
                  <lucide-angular [img]="searchIcon" class="size-4 opacity-40"></lucide-angular>
                  <input
                    type="text"
                    formControlName="search"
                    class="grow text-sm font-medium"
                    placeholder="Name, skills, or role..."
                  />
                </div>
              </fieldset>

              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm">Promotion Year</legend>
                <select formControlName="graduation_year" class="select select-bordered bg-base-200/50 border-none w-full h-12 text-sm font-medium focus:ring-2 ring-primary/20">
                  <option [value]="null">All Classes</option>
                  @for (year of years; track year) {
                    <option [value]="year">Class of {{ year }}</option>
                  }
                </select>
              </fieldset>

              <div class="divider opacity-5 my-0"></div>

              <button type="button" class="btn btn-ghost btn-sm h-10 gap-2 normal-case font-bold text-base-content/60 hover:text-primary">
                Advanced filters
              </button>
              
              <button type="button" (click)="resetFilters()" class="btn btn-primary h-12 font-bold shadow-lg shadow-primary/20">
                Apply Filters
              </button>
            </form>
          </div>
        </section>

        <!-- Informational Bento Block -->
        <section class="card bg-secondary/10 border border-secondary/20 rounded-[var(--radius-card)] overflow-hidden">
          <div class="card-body p-6">
             <div class="size-10 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 text-secondary">
               <lucide-angular [img]="filterIcon" class="size-5"></lucide-angular>
             </div>
             <h3 class="font-black text-secondary-content leading-tight">Join the Mentorship Program</h3>
             <p class="text-sm text-secondary-content/70 mt-2">Connect with senior alumni and accelerate your career growth.</p>
             <button class="btn btn-secondary btn-sm mt-4 font-bold">Learn More</button>
          </div>
        </section>
      </aside>

      <!-- Main Results Grid -->
      <main class="col-span-full lg:col-span-4">
        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="flex flex-col gap-4 w-full p-6 bg-base-100 rounded-[var(--radius-card)] border border-base-200 shadow-sm">
                <div class="flex gap-4 items-center">
                  <div class="skeleton size-16 rounded-2xl shrink-0"></div>
                  <div class="flex flex-col gap-2 grow">
                    <div class="skeleton h-5 w-32"></div>
                    <div class="skeleton h-4 w-48"></div>
                  </div>
                </div>
                <div class="skeleton h-24 w-full rounded-xl mt-2"></div>
                <div class="flex gap-2 justify-end mt-4">
                  <div class="skeleton h-10 w-24"></div>
                  <div class="skeleton h-10 w-24"></div>
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
            <div class="join bg-base-100 p-1 rounded-2xl border border-base-200 shadow-sm">
              <button class="join-item btn btn-ghost btn-sm px-4">Previous</button>
              <button class="join-item btn btn-primary btn-sm px-4 rounded-xl">1</button>
              <button class="join-item btn btn-ghost btn-sm px-4">2</button>
              <button class="join-item btn btn-ghost btn-sm px-4">Next</button>
            </div>
          </div>
        } @else {
          <div
            class="flex flex-col items-center justify-center py-24 bg-base-100 rounded-[var(--radius-card)] border-2 border-dashed border-base-300 shadow-sm"
          >
            <div class="size-20 rounded-full bg-base-200 flex items-center justify-center mb-6">
              <lucide-angular
                [img]="searchIcon"
                class="size-8 text-base-content/20"
              ></lucide-angular>
            </div>
            <h3 class="text-2xl font-black tracking-tight">No alumni found</h3>
            <p class="text-base-content/50 mt-2 max-w-xs text-center font-medium">
              We couldn't find anyone matching your current filters.
            </p>
            <button class="btn btn-primary mt-8 px-8 font-bold shadow-lg shadow-primary/20" (click)="resetFilters()">
              Clear all filters
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

  profiles = signal<Profile[]>([]);
  isLoading = signal(true);

  readonly searchIcon = Search;
  readonly filterIcon = Filter;

  years = Array.from({ length: 11 }, (_, i) => 2026 - i);

  filterForm = this.fb.group({
    search: [''],
    graduation_year: [null as number | null],
    degree: [''],
  });

  constructor() {
    this.loadProfiles();

    // Setup reactive filtering
    this.filterForm.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.loadProfiles();
    });
  }

  loadProfiles() {
    this.isLoading.set(true);
    const filters = this.filterForm.value as any;

    this.alumniService.getProfiles(filters).subscribe({
      next: (data) => {
        this.profiles.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback for demo if API is not available
        this.isLoading.set(false);
        this.profiles.set(this.getMockProfiles());
      },
    });
  }

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
        degree: 'Masters in AI',
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
        degree: 'Software Engineering',
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
        degree: 'Cybersecurity',
        graduation_year: 2023,
        status: 'DRAFT',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}
