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
      <header class="col-span-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 glass p-8 rounded-[var(--radius-card)] border border-white/20 shadow-[var(--shadow-card)] text-white">
        <div>
          <h1 class="text-4xl font-black text-white tracking-tighter">Offres d'Emploi</h1>
          <p class="text-white/70 font-medium mt-2">Opportunités exclusives pour notre réseau d'alumni.</p>
        </div>
        
        <div class="flex gap-3">
          <button (click)="toggleFilters()" class="btn btn-ghost border-white/20 text-white font-bold rounded-xl lg:hidden">
            <lucide-angular [img]="filterIcon" class="size-4 mr-2"></lucide-angular>
            Filtres
          </button>
          
          @if (isAdmin()) {
            <button routerLink="/admin/jobs/create" class="btn btn-primary px-8 font-bold shadow-lg shadow-primary/20 border-none text-primary-content rounded-xl">
              <lucide-angular [img]="plusIcon" class="size-4 mr-2"></lucide-angular>
              Publier une offre
            </button>
          }
        </div>
      </header>

      <aside class="col-span-full lg:col-span-2 flex flex-col gap-6" [ngClass]="{'hidden lg:flex': !showMobileFilters()}">
        <!-- Filters Card -->
        <div class="card glass border border-white/20 rounded-[var(--radius-card)] overflow-hidden bg-white/5">
          <div class="card-body p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-black text-white uppercase tracking-widest text-xs">Filtres Avancés</h3>
              <button (click)="resetFilters()" class="btn btn-ghost btn-xs text-white/40 hover:text-white">Réinitialiser</button>
            </div>

            <div class="space-y-4">
              <div class="form-control w-full">
                <label class="label py-1"><span class="label-text text-white/60 text-[10px] font-black uppercase">Type de contrat</span></label>
                <select [(ngModel)]="filters().type" (ngModelChange)="onFilterChange()" class="select select-sm bg-white/5 border-white/10 text-white focus:border-primary/50 transition-all rounded-lg">
                  <option value="">Tous les types</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="INTERNSHIP">Stage</option>
                </select>
              </div>

              <div class="form-control w-full">
                <label class="label py-1"><span class="label-text text-white/60 text-[10px] font-black uppercase">Remote Policy</span></label>
                <select [(ngModel)]="filters().remote_status" (ngModelChange)="onFilterChange()" class="select select-sm bg-white/5 border-white/10 text-white focus:border-primary/50 transition-all rounded-lg">
                  <option value="">Peu importe</option>
                  <option value="ON SITE">Sur site</option>
                  <option value="HYBRID">Hybride</option>
                  <option value="FULL REMOTE">Télétravail complet</option>
                </select>
              </div>

              <div class="form-control w-full">
                <label class="label py-1"><span class="label-text text-white/60 text-[10px] font-black uppercase">Périodicité</span></label>
                <select [(ngModel)]="filters().periodicity" (ngModelChange)="onFilterChange()" class="select select-sm bg-white/5 border-white/10 text-white focus:border-primary/50 transition-all rounded-lg">
                  <option value="">Peu importe</option>
                  <option value="FULL TIME">Temps plein</option>
                  <option value="PART TIME">Temps partiel</option>
                </select>
              </div>

              <div class="form-control w-full">
                <label class="label py-1"><span class="label-text text-white/60 text-[10px] font-black uppercase">Disponible à partir de</span></label>
                <input type="date" [(ngModel)]="filters().start_date" (ngModelChange)="onFilterChange()" class="input input-sm bg-white/5 border-white/10 text-white focus:border-primary/50 transition-all rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        @if (isMember()) {
          <div class="card glass border border-white/20 rounded-[var(--radius-card)] overflow-hidden bg-white/5">
            <div class="card-body p-6">
               <div class="size-10 rounded-xl bg-accent/20 flex items-center justify-center mb-4 text-accent-content">
                 <lucide-angular [img]="jobIcon" class="size-5 text-accent"></lucide-angular>
               </div>
               <h3 class="font-black text-white leading-tight">Services Carrière</h3>
               <p class="text-sm text-white/70 mt-2">Besoin d'aide pour votre CV ou préparation d'entretien ? Nos experts sont là.</p>
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
            <div class="group card glass shadow-[var(--shadow-card)] border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 rounded-[var(--radius-card)] overflow-hidden">
              <div class="card-body p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div class="flex gap-5">
                  <div class="bg-white/10 group-hover:bg-white/20 p-4 rounded-2xl h-fit border border-white/10 transition-colors">
                     <lucide-angular [img]="jobIcon" class="size-6 text-white"></lucide-angular>
                  </div>
                  <div>
                    <h3 class="text-xl font-black tracking-tight text-white group-hover:text-primary transition-colors">{{ job.title }}</h3>
                    <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-white/60 mt-2 uppercase tracking-wide">
                      <span class="flex items-center gap-1.5 text-white font-black">
                        {{ job.company }}
                      </span>
                      <span class="flex items-center gap-1.5">
                        <lucide-angular [img]="locationIcon" class="size-3"></lucide-angular>
                        {{ job.location }}
                      </span>
                      <span class="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-md text-white">
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
                       <div class="badge badge-sm bg-primary/20 text-white border border-primary/30 font-black py-3 px-3 shadow-sm">
                          <lucide-angular [img]="clockIcon" class="size-3 mr-1.5"></lucide-angular>
                          {{ job.periodicity }}
                       </div>
                       <div class="badge badge-sm bg-accent/20 text-white border border-accent/30 font-black py-3 px-3 shadow-sm">
                          <lucide-angular [img]="globeIcon" class="size-3 mr-1.5"></lucide-angular>
                          {{ job.remote_status }}
                       </div>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                  <a [routerLink]="['/jobs', job.id]" class="btn btn-ghost btn-sm font-bold flex-1 md:flex-none px-6 text-white hover:bg-white/10 rounded-lg">Détails</a>
                  @if (isMember()) {
                    <button (click)="onApply(job)" class="btn btn-primary btn-sm font-bold flex-1 md:flex-none px-6 shadow-md shadow-primary/10 border-none text-primary-content rounded-lg">Postuler</button>
                  }
                </div>
              </div>
            </div>
          } @empty {
             <div class="flex flex-col items-center justify-center py-20 glass rounded-[var(--radius-card)] border-2 border-dashed border-white/20 shadow-sm">
               <lucide-angular [img]="jobIcon" class="size-12 text-white/20 mb-4"></lucide-angular>
               <p class="text-white/40 font-bold italic">Aucune offre d'emploi disponible pour le moment.</p>
             </div>
          }

          <!-- Pagination Controls -->
          @if (totalCount() > 0) {
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 glass p-4 rounded-2xl border border-white/10">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white/40 uppercase tracking-widest">Afficher</span>
                <select [ngModel]="limit()" (ngModelChange)="onLimitChange($event)" class="select select-xs bg-white/5 border-white/10 text-white rounded-lg">
                  <option [value]="5">5</option>
                  <option [value]="10">10</option>
                  <option [value]="15">15</option>
                  <option [value]="20">20</option>
                </select>
                <span class="text-xs font-bold text-white/40 uppercase tracking-widest">par page</span>
              </div>

              <div class="join">
                <button [disabled]="page() === 1" (click)="onPageChange(page() - 1)" class="join-item btn btn-sm bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <lucide-angular [img]="prevIcon" class="size-4"></lucide-angular>
                </button>
                <button class="join-item btn btn-sm bg-primary/20 border-white/10 text-white hover:bg-primary/30 font-black">
                  Page {{ page() }} sur {{ totalPages() }}
                </button>
                <button [disabled]="page() >= totalPages()" (click)="onPageChange(page() + 1)" class="join-item btn btn-sm bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <lucide-angular [img]="nextIcon" class="size-4"></lucide-angular>
                </button>
              </div>

              <div class="text-xs font-bold text-white/40 uppercase tracking-widest">
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
