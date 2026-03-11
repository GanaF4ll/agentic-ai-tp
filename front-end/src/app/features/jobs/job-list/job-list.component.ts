import { Component, signal, inject, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Briefcase, MapPin, Clock, Plus, Globe, ChevronLeft, ChevronRight, Filter, X } from 'lucide-angular';
import { JobOffer } from '../../../core/models/business.model';
import { JobService, JobFilters } from '../../../core/services/job.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink, FormsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <header class="col-span-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-base-100 p-6 md:p-8 rounded-[var(--radius-card)] border border-base-200 shadow-[var(--shadow-card)] text-base-content relative overflow-hidden">
        <div class="relative z-10">
          <h1 class="text-3xl md:text-4xl font-black text-base-content tracking-tighter leading-none">Offres d'Emploi</h1>
          <p class="text-base-content/70 font-medium mt-3">Opportunités exclusives pour notre réseau d'alumni.</p>
          
          <button (click)="toggleFilters()" class="btn btn-ghost border-base-200 text-base-content font-bold rounded-xl lg:hidden mt-6">
            <lucide-angular [img]="filterIcon" class="size-4 mr-2"></lucide-angular>
            {{ showMobileFilters() ? 'Masquer les filtres' : 'Afficher les filtres' }}
          </button>
        </div>
        
        <div class="flex flex-wrap gap-3 relative z-10">
          @if (isAdmin()) {
            <button routerLink="/admin/jobs/create" class="btn btn-primary px-8 font-bold shadow-lg shadow-primary/20 border-none text-primary-content rounded-xl h-12">
              <lucide-angular [img]="plusIcon" class="size-4 mr-2"></lucide-angular>
              Publier une offre
            </button>
          }
        </div>
      </header>

      <aside class="col-span-full lg:col-span-2 flex flex-col gap-6" 
        [class.hidden]="!showMobileFilters() && !isLargeScreen()"
        [class.lg:flex]="true">
        <!-- Filters Card -->
        <section class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)]">
          <div class="card-body p-6">
            <div class="flex justify-between items-center mb-4 lg:mb-0">
              <h2 class="text-xs font-black uppercase tracking-widest text-base-content/40 flex items-center gap-2">
                <lucide-angular [img]="filterIcon" class="size-3"></lucide-angular>
                Recherche & Filtres
              </h2>
              <button (click)="toggleFilters()" class="btn btn-ghost btn-xs lg:hidden">
                <lucide-angular [img]="closeIcon" class="size-4"></lucide-angular>
              </button>
            </div>

            <div class="flex flex-col gap-5">
              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-base-content/80">Type de contrat</legend>
                <select [(ngModel)]="filters().type" (ngModelChange)="onFilterChange()" 
                  class="select glass border-base-200 w-full h-12 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content">
                  <option value="">Tous les types</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="INTERNSHIP">Stage</option>
                </select>
              </fieldset>

              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-base-content/80">Remote Policy</legend>
                <select [(ngModel)]="filters().remote_status" (ngModelChange)="onFilterChange()" 
                  class="select glass border-base-200 w-full h-12 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content">
                  <option value="">Peu importe</option>
                  <option value="ON SITE">Sur site</option>
                  <option value="HYBRID">Hybride</option>
                  <option value="FULL REMOTE">Télétravail complet</option>
                </select>
              </fieldset>

              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-base-content/80">Périodicité</legend>
                <select [(ngModel)]="filters().periodicity" (ngModelChange)="onFilterChange()" 
                  class="select glass border-base-200 w-full h-12 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content">
                  <option value="">Peu importe</option>
                  <option value="FULL TIME">Temps plein</option>
                  <option value="PART TIME">Temps partiel</option>
                </select>
              </fieldset>

              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-base-content/80">Disponible à partir de</legend>
                <input type="date" [(ngModel)]="filters().start_date" (ngModelChange)="onFilterChange()" 
                  class="input glass border-base-200 w-full h-12 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content" />
              </fieldset>

              <div class="divider opacity-10 my-0 before:bg-base-content after:bg-base-content"></div>

              <div class="flex flex-col gap-2">
                <button type="button" (click)="resetFilters()" 
                  class="btn btn-primary h-12 font-bold shadow-lg shadow-primary/20 border-none text-primary-content">
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </section>

        @if (isMember()) {
          <div class="card bg-base-100 border border-base-200 rounded-[var(--radius-card)] overflow-hidden">
            <div class="card-body p-6">
               <div class="size-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                 <lucide-angular [img]="jobIcon" class="size-5"></lucide-angular>
               </div>
               <h3 class="font-black text-base-content leading-tight">Services Carrière</h3>
               <p class="text-sm text-base-content/70 mt-2">Besoin d'aide pour votre CV ou préparation d'entretien ? Nos experts sont là.</p>
               <button class="btn btn-accent btn-sm mt-4 font-bold border-none text-accent-content rounded-lg">Réserver une session</button>
            </div>
          </div>
        }
      </aside>

      <main class="col-span-full lg:col-span-4 flex flex-col gap-4">
        @if (isLoading()) {
          <div class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        } @else {
          @for (job of jobs(); track job.id) {
            <div class="group card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 hover:border-primary/30 hover:bg-base-200/50 transition-all duration-300 rounded-[var(--radius-card)] overflow-hidden">
              <div class="card-body p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div class="flex gap-5">
                  <div class="bg-base-200 group-hover:bg-base-300 p-4 rounded-2xl h-fit border border-base-200 transition-colors">
                     <lucide-angular [img]="jobIcon" class="size-6 text-base-content"></lucide-angular>
                  </div>
                  <div>
                    <h3 class="text-xl font-black tracking-tight text-base-content group-hover:text-primary transition-colors">{{ job.title }}</h3>
                    <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-base-content/60 mt-2 uppercase tracking-wide">
                      <span class="flex items-center gap-1.5 text-base-content font-black">
                        {{ job.company }}
                      </span>
                      <span class="flex items-center gap-1.5">
                        <lucide-angular [img]="locationIcon" class="size-3"></lucide-angular>
                        {{ job.location }}
                      </span>
                      <span class="flex items-center gap-1.5 bg-base-200 px-2 py-0.5 rounded-md text-base-content">
                        <lucide-angular [img]="clockIcon" class="size-3"></lucide-angular>
                        {{ job.type }}
                      </span>
                      <span class="flex items-center gap-1.5 text-primary">
                        <lucide-angular [img]="plusIcon" class="size-3"></lucide-angular>
                        {{ job.applications_count }} candidature(s)
                      </span>
                    </div>
                    <!-- New enriched badges -->
                    <div class="flex flex-wrap gap-2 mt-3">
                       <div class="badge badge-sm bg-primary/10 text-primary border border-primary/20 font-black py-3 px-3 shadow-sm">
                          <lucide-angular [img]="clockIcon" class="size-3 mr-1.5"></lucide-angular>
                          {{ job.periodicity }}
                       </div>
                       <div class="badge badge-sm bg-accent/10 text-accent border border-accent/20 font-black py-3 px-3 shadow-sm">
                          <lucide-angular [img]="globeIcon" class="size-3 mr-1.5"></lucide-angular>
                          {{ job.remote_status }}
                       </div>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-base-200">
                  <a [routerLink]="['/jobs', job.id]" class="btn btn-ghost btn-sm font-bold flex-1 md:flex-none px-6 text-base-content hover:bg-base-200/50 rounded-lg">Détails</a>
                  @if (isMember()) {
                    <button (click)="onApply(job)" class="btn btn-primary btn-sm font-bold flex-1 md:flex-none px-6 shadow-md shadow-primary/10 border-none text-primary-content rounded-lg">Postuler</button>
                  }
                </div>
              </div>
            </div>
          } @empty {
             <div class="flex flex-col items-center justify-center py-20 bg-base-100 rounded-[var(--radius-card)] border-2 border-dashed border-base-200 shadow-sm">
               <lucide-angular [img]="jobIcon" class="size-12 text-base-content/20 mb-4"></lucide-angular>
               <p class="text-base-content/40 font-bold italic">Aucune offre d'emploi disponible pour le moment.</p>
             </div>
          }

          <!-- Pagination Controls -->
          @if (totalCount() > 0) {
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-base-100 p-4 rounded-2xl border border-base-200">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Afficher</span>
                <select [ngModel]="limit()" (ngModelChange)="onLimitChange($event)" class="select select-xs bg-base-200/50 border-base-200 text-base-content rounded-lg">
                  <option [value]="5">5</option>
                  <option [value]="10">10</option>
                  <option [value]="15">15</option>
                  <option [value]="20">20</option>
                </select>
                <span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">par page</span>
              </div>

              <div class="join">
                <button [disabled]="page() === 1" (click)="onPageChange(page() - 1)" class="join-item btn btn-sm bg-base-200/50 border-base-200 text-base-content hover:bg-base-200/50">
                  <lucide-angular [img]="prevIcon" class="size-4"></lucide-angular>
                </button>
                <button class="join-item btn btn-sm bg-primary/10 border-base-200 text-primary hover:bg-primary/20 font-black">
                  Page {{ page() }} sur {{ totalPages() }}
                </button>
                <button [disabled]="page() >= totalPages()" (click)="onPageChange(page() + 1)" class="join-item btn btn-sm bg-base-200/50 border-base-200 text-base-content hover:bg-base-200/50">
                  <lucide-angular [img]="nextIcon" class="size-4"></lucide-angular>
                </button>
              </div>

              <div class="text-xs font-bold text-base-content/40 uppercase tracking-widest">
                {{ totalCount() }} résultats au total
              </div>
            </div>
          }
        }
      </main>
    </div>
  `
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  readonly jobIcon = Briefcase;
  readonly locationIcon = MapPin;
  readonly clockIcon = Clock;
  readonly plusIcon = Plus;
  readonly globeIcon = Globe;
  readonly filterIcon = Filter;
  readonly closeIcon = X;
  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;

  jobs = signal<JobOffer[]>([]);
  isLoading = signal<boolean>(true);
  isAdmin = this.authService.isAdmin;
  isMember = this.authService.isMember;

  // Filters and Pagination State
  filters = signal<JobFilters>({
    type: '',
    remote_status: '',
    periodicity: '',
    start_date: ''
  });
  page = signal(1);
  limit = signal(10);
  totalCount = signal(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.limit()) || 1);
  
  showMobileFilters = signal(false);
  isLargeScreen = signal(window.innerWidth >= 1024);

  constructor() {
    window.addEventListener('resize', () => {
      this.isLargeScreen.set(window.innerWidth >= 1024);
    });
  }

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.isLoading.set(true);
    const params: JobFilters = {
      ...this.filters(),
      page: this.page(),
      limit: this.limit()
    };

    this.jobService.getJobs(params).subscribe({
      next: (response) => {
        this.jobs.set(response.results);
        this.totalCount.set(response.count);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.toastService.error("Impossible de charger les offres.");
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange() {
    this.page.set(1); // Reset to first page when filters change
    this.loadJobs();
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.loadJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onLimitChange(newLimit: number) {
    this.limit.set(newLimit);
    this.page.set(1);
    this.loadJobs();
  }

  resetFilters() {
    this.filters.set({
      type: '',
      remote_status: '',
      periodicity: '',
      start_date: ''
    });
    this.onFilterChange();
  }

  toggleFilters() {
    this.showMobileFilters.update(v => !v);
  }

  onApply(job: JobOffer) {
    this.jobService.applyToJob(job.id).subscribe({
      next: (res) => {
        this.toastService.success(res.detail);
      },
      error: (err) => {
        console.error('Error applying:', err);
        let message = "Erreur lors de la candidature.";
        if (err.error?.detail) {
          message = err.error.detail;
        }
        this.toastService.error(message);
      }
    });
  }
}
