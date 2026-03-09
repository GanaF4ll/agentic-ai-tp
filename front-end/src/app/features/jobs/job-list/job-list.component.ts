import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Briefcase, MapPin, Clock, Plus } from 'lucide-angular';
import { JobOffer } from '../../../core/models/business.model';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <header class="col-span-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 glass p-8 rounded-[var(--radius-card)] border border-white/20 shadow-[var(--shadow-card)] text-white">
        <div>
          <h1 class="text-4xl font-black text-white tracking-tighter">Offres d'Emploi</h1>
          <p class="text-white/70 font-medium mt-2">Opportunités exclusives pour notre réseau d'alumni.</p>
        </div>
        
        @if (isAdmin()) {
          <button routerLink="/admin/jobs/create" class="btn btn-primary px-8 font-bold shadow-lg shadow-primary/20 border-none text-primary-content">
            <lucide-angular [img]="plusIcon" class="size-4 mr-2"></lucide-angular>
            Publier une offre
          </button>
        }
      </header>

      <aside class="col-span-full lg:col-span-2 flex flex-col gap-6">
        @if (isMember()) {
          <div class="card glass border border-white/20 rounded-[var(--radius-card)] overflow-hidden bg-white/5">
            <div class="card-body p-6">
               <div class="size-10 rounded-xl bg-accent/20 flex items-center justify-center mb-4 text-accent-content">
                 <lucide-angular [img]="jobIcon" class="size-5 text-accent"></lucide-angular>
               </div>
               <h3 class="font-black text-white leading-tight">Services Carrière</h3>
               <p class="text-sm text-white/70 mt-2">Besoin d'aide pour votre CV ou préparation d'entretien ? Nos experts sont là.</p>
               <button class="btn btn-accent btn-sm mt-4 font-bold border-none text-accent-content">Réserver une session</button>
            </div>
          </div>
        }

        <div class="card glass border border-white/20 shadow-sm rounded-[var(--radius-card)] overflow-hidden bg-white/5">
           <div class="card-body p-6">
              <h4 class="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Filtres Rapides</h4>
              <div class="flex flex-wrap gap-2">
                 <button class="badge badge-lg bg-white/10 border-none font-bold text-xs py-4 px-4 text-white hover:bg-white/20 transition-colors cursor-pointer">Temps plein</button>
                 <button class="badge badge-lg bg-white/10 border-none font-bold text-xs py-4 px-4 text-white hover:bg-white/20 transition-colors cursor-pointer">Télétravail</button>
                 <button class="badge badge-lg bg-white/10 border-none font-bold text-xs py-4 px-4 text-white hover:bg-white/20 transition-colors cursor-pointer">Freelance</button>
              </div>
           </div>
        </div>
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
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                  <button class="btn btn-ghost btn-sm font-bold flex-1 md:flex-none px-6 text-white hover:bg-white/10">Détails</button>
                  @if (isMember()) {
                    <button class="btn btn-primary btn-sm font-bold flex-1 md:flex-none px-6 shadow-md shadow-primary/10 border-none text-primary-content">Postuler</button>
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
        }
      </main>
    </div>
  `
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  private authService = inject(AuthService);

  readonly jobIcon = Briefcase;
  readonly locationIcon = MapPin;
  readonly clockIcon = Clock;
  readonly plusIcon = Plus;

  jobs = signal<JobOffer[]>([]);
  isLoading = signal<boolean>(true);
  isAdmin = this.authService.isAdmin;
  isMember = this.authService.isMember;

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.isLoading.set(true);
    this.jobService.getJobs().subscribe({
      next: (data) => {
        this.jobs.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.isLoading.set(false);
      }
    });
  }
}
