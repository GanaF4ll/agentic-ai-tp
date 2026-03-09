import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Briefcase, MapPin, Clock, ArrowLeft, CheckCircle } from 'lucide-angular';
import { JobOffer } from '../../../core/models/business.model';
import { JobService } from '../../../core/services/job.service';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  template: `
    <div class="flex flex-col gap-8 max-w-5xl mx-auto py-8 px-4">
      <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 glass p-8 rounded-[var(--radius-card)] border border-white/20 shadow-[var(--shadow-card)] text-white">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <a routerLink="/jobs" class="text-white/40 hover:text-white transition-colors">
              <lucide-angular [img]="backIcon" class="size-4"></lucide-angular>
            </a>
            <span class="text-xs font-black uppercase tracking-widest text-white/40">Espace Candidat</span>
          </div>
          <h1 class="text-4xl font-black text-white tracking-tighter">Mes Candidatures</h1>
          <p class="text-white/70 font-medium mt-2">Suivez l'état de vos postulations aux offres du réseau.</p>
        </div>
      </header>

      <main class="flex flex-col gap-4">
        @if (isLoading()) {
          <div class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        } @else {
          @for (job of applications(); track job.id) {
            <div class="group card glass shadow-[var(--shadow-card)] border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 rounded-[var(--radius-card)] overflow-hidden">
              <div class="card-body p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div class="flex gap-5">
                  <div class="bg-white/10 group-hover:bg-white/20 p-4 rounded-2xl h-fit border border-white/10 transition-colors text-success">
                     <lucide-angular [img]="checkIcon" class="size-6"></lucide-angular>
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
                      <span class="flex items-center gap-1.5 bg-success/20 px-2 py-0.5 rounded-md text-success border border-success/30">
                        Candidature envoyée
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                  <a [routerLink]="['/jobs', job.id]" class="btn btn-ghost btn-sm font-bold flex-1 md:flex-none px-6 text-white hover:bg-white/10">Voir l'offre</a>
                </div>
              </div>
            </div>
          } @empty {
             <div class="flex flex-col items-center justify-center py-32 glass rounded-[var(--radius-card)] border-2 border-dashed border-white/20 shadow-sm text-center px-6">
               <div class="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                 <lucide-angular [img]="jobIcon" class="size-10 text-white/20"></lucide-angular>
               </div>
               <h3 class="text-2xl font-black text-white tracking-tight">Aucune candidature pour le moment</h3>
               <p class="text-white/40 font-medium mt-2 max-w-xs mx-auto">Explorez les offres d'emploi disponibles et postulez pour les retrouver ici.</p>
               <a routerLink="/jobs" class="btn btn-primary mt-8 px-8 font-black rounded-xl border-none text-primary-content">Explorer les offres</a>
             </div>
          }
        }
      </main>
    </div>
  `
})
export class MyApplicationsComponent implements OnInit {
  private jobService = inject(JobService);

  readonly jobIcon = Briefcase;
  readonly locationIcon = MapPin;
  readonly clockIcon = Clock;
  readonly backIcon = ArrowLeft;
  readonly checkIcon = CheckCircle;

  applications = signal<JobOffer[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.isLoading.set(true);
    this.jobService.getMyApplications().subscribe({
      next: (data) => {
        this.applications.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading applications:', err);
        this.isLoading.set(false);
      }
    });
  }
}
