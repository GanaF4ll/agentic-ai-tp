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
    <div class="flex flex-col gap-8">
      <header
        class="relative overflow-hidden rounded-3xl bg-primary px-8 py-12 text-primary-content shadow-lg"
      >
        <!-- Abstract background pattern -->
        <div
          class="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        ></div>
        <div
          class="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-black/5 blur-3xl"
        ></div>

        <div
          class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div class="max-w-xl">
            <h1 class="text-4xl font-black tracking-tight">Alumni Directory</h1>
            <p class="mt-4 text-lg text-primary-content/90 font-medium">
              Explore the network of our brilliant graduates. Connect, share, and grow together in
              our professional community.
            </p>
          </div>

          <div
            class="stats bg-white/10 backdrop-blur-md border border-white/20 text-primary-content shadow-xl"
          >
            <div class="stat px-6 py-4">
              <div
                class="stat-title text-primary-content/70 uppercase tracking-widest text-xs font-bold"
              >
                Network Strength
              </div>
              <div class="stat-value text-4xl font-black">{{ profiles().length }} Members</div>
              <div class="stat-desc text-primary-content/80 mt-1">Verified Professionals</div>
            </div>
          </div>
        </div>
      </header>

      <section class="card bg-base-100 shadow-sm border border-base-200">
        <div class="card-body p-4 md:p-6">
          <form
            [formGroup]="filterForm"
            class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end"
          >
            <fieldset class="fieldset col-span-1 md:col-span-2">
              <legend class="fieldset-legend">Search Alumni</legend>
              <div class="input input-bordered flex items-center gap-2 w-full">
                <lucide-angular [img]="searchIcon" class="w-4 h-4 opacity-70"></lucide-angular>
                <input
                  type="text"
                  formControlName="search"
                  class="grow"
                  placeholder="Name, skills, or role..."
                />
              </div>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Graduation Year</legend>
              <select formControlName="graduation_year" class="select select-bordered w-full">
                <option [value]="null">All Years</option>
                @for (year of years; track year) {
                  <option [value]="year">{{ year }}</option>
                }
              </select>
            </fieldset>

            <button type="button" class="btn btn-ghost gap-2 btn-sm md:btn-md">
              <lucide-angular [img]="filterIcon" class="w-4 h-4"></lucide-angular>
              More Filters
            </button>
          </form>
        </div>
      </section>

      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="flex flex-col gap-4 w-full">
              <div class="skeleton h-48 w-full rounded-xl"></div>
              <div class="skeleton h-4 w-28"></div>
              <div class="skeleton h-4 w-full"></div>
            </div>
          }
        </div>
      } @else if (profiles().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (alumni of profiles(); track alumni.id) {
            <app-alumni-card [alumni]="alumni"></app-alumni-card>
          }
        </div>

        <div class="join justify-center mt-8">
          <button class="join-item btn btn-outline btn-sm">Previous</button>
          <button class="join-item btn btn-outline btn-active btn-sm">1</button>
          <button class="join-item btn btn-outline btn-sm">2</button>
          <button class="join-item btn btn-outline btn-sm">Next</button>
        </div>
      } @else {
        <div
          class="text-center py-24 bg-base-100 rounded-3xl border-2 border-dashed border-base-300"
        >
          <lucide-angular
            [img]="searchIcon"
            class="w-16 h-16 mx-auto mb-4 text-base-content/20"
          ></lucide-angular>
          <h3 class="text-xl font-semibold">No alumni found</h3>
          <p class="text-base-content/60 mt-2">
            Try adjusting your filters to find who you're looking for.
          </p>
          <button class="btn btn-primary mt-6 btn-sm" (click)="resetFilters()">
            Clear all filters
          </button>
        </div>
      }
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
