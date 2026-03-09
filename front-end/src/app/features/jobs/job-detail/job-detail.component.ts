import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { JobOffer } from '../../../core/models/business.model';
import { LucideAngularModule, Briefcase, MapPin, Clock, ArrowLeft, Building, Send } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-8 max-w-4xl mx-auto py-8 px-4">
      <nav>
        <a routerLink="/jobs" class="btn btn-ghost btn-sm gap-2 font-bold text-white/60 hover:text-white transition-colors">
          <lucide-angular [img]="backIcon" class="size-4"></lucide-angular>
          Retour aux offres
        </a>
      </nav>

      @if (job(); as j) {
        <div class="flex flex-col gap-8">
          <!-- Header Card -->
          <header class="glass p-8 rounded-[var(--radius-card)] border border-white/20 shadow-[var(--shadow-card)] text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 p-8 opacity-5">
               <lucide-angular [img]="jobIcon" class="size-32"></lucide-angular>
            </div>
            
            <div class="relative z-10">
              <div class="flex flex-wrap items-center gap-3 mb-4">
                <span class="badge badge-primary font-black px-4 py-3 h-auto">{{ j.type }}</span>
                <span class="text-white/40 font-bold uppercase tracking-widest text-xs">Publié le {{ j.posted_at | date:'dd MMMM yyyy' }}</span>
              </div>
              
              <h1 class="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-2">{{ j.title }}</h1>
              
              <div class="flex flex-wrap gap-6 mt-6">
                <div class="flex items-center gap-2 text-lg font-bold text-white/80">
                  <lucide-angular [img]="buildingIcon" class="size-5 text-primary"></lucide-angular>
                  {{ j.company }}
                </div>
                <div class="flex items-center gap-2 text-lg font-bold text-white/80">
                  <lucide-angular [img]="locationIcon" class="size-5 text-primary"></lucide-angular>
                  {{ j.location }}
                </div>
              </div>
            </div>
          </header>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-8">
              <div class="glass p-8 rounded-[var(--radius-card)] border border-white/10 shadow-sm text-white">
                <h2 class="text-2xl font-black mb-6 flex items-center gap-3">
                  Description du poste
                </h2>
                <div class="prose prose-invert max-w-none text-white/70 font-medium leading-relaxed whitespace-pre-wrap">
                  {{ j.description }}
                </div>
              </div>
            </div>

            <!-- CTA Sidebar -->
            <div class="lg:col-span-1">
              <div class="sticky top-24 space-y-6">
                @if (isMember()) {
                  <div class="card glass border border-primary/20 shadow-xl shadow-primary/5 rounded-[var(--radius-card)] overflow-hidden">
                    <div class="card-body p-8 items-center text-center">
                      <div class="size-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                        <lucide-angular [img]="sendIcon" class="size-8 text-primary"></lucide-angular>
                      </div>
                      <h3 class="text-xl font-black text-white">Intéressé par ce poste ?</h3>
                      <p class="text-white/60 text-sm font-medium mt-2 mb-8">Postulez directement via notre plateforme AlumniConnect.</p>
                      
                      <button 
                        (click)="apply()" 
                        [disabled]="isSubmitting()"
                        class="btn btn-primary btn-block font-black shadow-lg shadow-primary/20 h-14 rounded-2xl border-none text-primary-content"
                      >
                        @if (isSubmitting()) {
                          <span class="loading loading-spinner"></span>
                        } @else {
                          Postuler maintenant
                        }
                      </button>
                    </div>
                  </div>
                }

                <div class="card glass border border-white/10 rounded-[var(--radius-card)] overflow-hidden">
                  <div class="card-body p-6">
                    <h4 class="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Partager</h4>
                    <div class="flex gap-2">
                       <button class="btn btn-ghost btn-sm btn-square rounded-xl text-white/60 hover:text-white hover:bg-white/10 flex-1">LinkedIn</button>
                       <button class="btn btn-ghost btn-sm btn-square rounded-xl text-white/60 hover:text-white hover:bg-white/10 flex-1">Copier le lien</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="flex flex-col gap-8">
          <div class="skeleton h-64 w-full rounded-[var(--radius-card)]"></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 skeleton h-96 rounded-[var(--radius-card)]"></div>
            <div class="lg:col-span-1 skeleton h-64 rounded-[var(--radius-card)]"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class JobDetailComponent {
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  readonly backIcon = ArrowLeft;
  readonly jobIcon = Briefcase;
  readonly locationIcon = MapPin;
  readonly clockIcon = Clock;
  readonly buildingIcon = Building;
  readonly sendIcon = Send;

  isMember = this.authService.isMember;
  isSubmitting = signal(false);

  job = toSignal(
    this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.jobService.getJobById(+id))
    )
  );

  apply() {
    const currentJob = this.job();
    if (!currentJob) return;

    this.isSubmitting.set(true);
    this.jobService.applyToJob(currentJob.id).subscribe({
      next: (res) => {
        this.toastService.success(res.detail);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error applying:', err);
        let message = "Erreur lors de la candidature.";
        if (err.error?.detail) {
          message = err.error.detail;
        }
        this.toastService.error(message);
        this.isSubmitting.set(false);
      }
    });
  }
}
