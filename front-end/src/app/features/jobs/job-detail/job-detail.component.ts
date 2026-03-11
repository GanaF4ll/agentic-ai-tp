import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { JobOffer } from '../../../core/models/business.model';
import { LucideAngularModule, Briefcase, MapPin, Clock, ArrowLeft, Building, Send, Pencil, Save, X, ExternalLink, Globe, Calendar } from 'lucide-angular';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap, startWith } from 'rxjs';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6 md:gap-6 md:p-8 max-w-4xl mx-auto py-6 md:py-8 px-4">
      <nav>
        <a routerLink="/jobs" class="btn btn-ghost btn-sm gap-2 font-bold text-base-content/60 hover:text-primary transition-colors">
          <lucide-angular [img]="backIcon" class="size-4"></lucide-angular>
          Retour
        </a>
      </nav>

      @if (job(); as j) {
        <div class="flex flex-col gap-6 md:gap-6 md:p-8">
          <!-- Header Card -->
          <header class="bg-base-100 rounded-[var(--radius-card)] border border-base-200 shadow-[var(--shadow-card)] text-base-content overflow-hidden">
            <div class="flex flex-col lg:flex-row">

              <!-- Left: title & meta -->
              <div class="flex-1 min-w-0 p-6 md:p-6 md:p-8 relative flex flex-col justify-between gap-6">
                <div class="absolute right-4 top-1/2 -translate-y-1/3 opacity-[0.04] pointer-events-none">
                  <lucide-angular [img]="jobIcon" class="size-32 md:size-48"></lucide-angular>
                </div>
                <div class="relative z-10 flex flex-col gap-5">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="badge badge-primary font-black px-3 md:px-4 py-3 h-auto">{{ j.type }}</span>
                    <span class="badge bg-primary/10 border-primary/20 text-primary font-bold px-3 py-3 h-auto gap-1.5 text-[10px] md:text-xs">
                      <lucide-angular [img]="clockIcon" class="size-3"></lucide-angular>
                      {{ j.periodicity }}
                    </span>
                    <span class="badge bg-secondary/10 border-secondary/20 text-secondary font-bold px-3 py-3 h-auto gap-1.5 text-[10px] md:text-xs">
                      <lucide-angular [img]="globeIcon" class="size-3"></lucide-angular>
                      {{ j.remote_status }}
                    </span>
                  </div>

                  <h1 class="text-3xl md:text-5xl font-black tracking-tighter leading-tight text-base-content">{{ j.title }}</h1>

                  <div class="flex flex-wrap gap-4 md:gap-5">
                    <div class="flex items-center gap-2 font-bold text-base-content/70 text-sm md:text-base">
                      <lucide-angular [img]="buildingIcon" class="size-4 text-primary shrink-0"></lucide-angular>
                      {{ j.company }}
                    </div>
                    <div class="flex items-center gap-2 font-bold text-base-content/70 text-sm md:text-base">
                      <lucide-angular [img]="locationIcon" class="size-4 text-primary shrink-0"></lucide-angular>
                      {{ j.location }}
                    </div>
                  </div>
                </div>

                <p class="relative z-10 text-base-content/30 font-semibold text-[10px] md:text-xs">Publié le {{ j.posted_at | date:'dd MMMM yyyy' }}</p>
              </div>

              <!-- Divider -->
              <div class="hidden lg:block w-px bg-base-200 my-6"></div>
              <div class="block lg:hidden h-px bg-base-200 mx-6 md:mx-8"></div>

              <!-- Right: dates -->
              <div class="p-6 md:p-6 md:p-8 lg:w-56 shrink-0 flex flex-col justify-center gap-3">
                <div class="bg-base-200/50 rounded-2xl p-4 flex items-center gap-3">
                  <div class="size-8 rounded-xl bg-base-200 flex items-center justify-center text-base-content/40 shrink-0">
                    <lucide-angular [img]="calendarIcon" class="size-4"></lucide-angular>
                  </div>
                  <div>
                    <p class="text-[9px] font-black uppercase tracking-widest text-base-content/35 mb-0.5">Début</p>
                    <p class="text-sm font-bold text-base-content">{{ j.start_date ? (j.start_date | date:'dd/MM/yyyy') : 'À définir' }}</p>
                  </div>
                </div>
                @if (j.type !== 'CDI') {
                  <div class="bg-base-200/50 rounded-2xl p-4 flex items-center gap-3">
                    <div class="size-8 rounded-xl bg-base-200 flex items-center justify-center text-base-content/40 shrink-0">
                      <lucide-angular [img]="calendarIcon" class="size-4"></lucide-angular>
                    </div>
                    <div>
                      <p class="text-[9px] font-black uppercase tracking-widest text-base-content/35 mb-0.5">Fin prévue</p>
                      <p class="text-sm font-bold text-base-content">{{ j.end_date ? (j.end_date | date:'dd/MM/yyyy') : 'Non spécifiée' }}</p>
                    </div>
                  </div>
                }
              </div>

            </div>
          </header>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:p-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-8">
              <div class="bg-base-100 p-6 md:p-8 rounded-[var(--radius-card)] border border-base-200 shadow-sm text-base-content">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-2xl font-black flex items-center gap-3">
                    Description du poste
                  </h2>
                  @if (isAdmin() && !isEditing()) {
                    <button (click)="startEdit(j.description)" class="btn btn-ghost btn-sm gap-2 font-bold text-primary hover:bg-primary/10">
                      <lucide-angular [img]="editIcon" class="size-4"></lucide-angular>
                      Modifier
                    </button>
                  }
                </div>

                @if (isEditing()) {
                  <div class="flex flex-col gap-4">
                    <textarea 
                      [(ngModel)]="editedDescription"
                      rows="12"
                      class="textarea textarea-bordered w-full bg-base-200/50 border-base-200 text-base-content font-medium leading-relaxed focus:border-primary/50"
                      placeholder="Modifier la description..."
                    ></textarea>
                    <div class="flex justify-end gap-2">
                      <button (click)="cancelEdit()" class="btn btn-ghost btn-sm gap-2 font-bold text-base-content/60">
                        <lucide-angular [img]="cancelIcon" class="size-4"></lucide-angular>
                        Annuler
                      </button>
                      <button 
                        (click)="saveEdit()" 
                        [disabled]="isSubmittingUpdate()"
                        class="btn btn-primary btn-sm gap-2 font-bold shadow-lg shadow-primary/20"
                      >
                        @if (isSubmittingUpdate()) {
                          <span class="loading loading-spinner loading-xs"></span>
                        } @else {
                          <lucide-angular [img]="saveIcon" class="size-4"></lucide-angular>
                        }
                        Enregistrer
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="prose max-w-none text-base-content/70 font-medium leading-relaxed whitespace-pre-wrap">
                    {{ j.description }}
                  </div>
                }
              </div>
            </div>

            <!-- CTA Sidebar -->
            <div class="lg:col-span-1">
              <div class="sticky top-24 space-y-6">
                @if (isMember()) {
                  <div class="card bg-base-100 border border-primary/20 shadow-xl shadow-primary/5 rounded-[var(--radius-card)] overflow-hidden">
                    <div class="card-body p-6 md:p-8 items-center text-center">
                      <div class="size-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                        <lucide-angular [img]="sendIcon" class="size-8 text-primary"></lucide-angular>
                      </div>
                      <h3 class="text-xl font-black text-base-content">Intéressé par ce poste ?</h3>
                      <p class="text-base-content/60 text-sm font-medium mt-2 mb-8">Postulez directement via notre plateforme AlumniConnect.</p>
                      
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

                <div class="card bg-base-100 border border-base-200 rounded-[var(--radius-card)] overflow-hidden">
                  <div class="card-body p-6">
                    @if (j.source_url) {
                      <a [href]="j.source_url" target="_blank" class="btn btn-outline btn-block btn-sm gap-2 rounded-xl font-bold mb-6 text-base-content">
                         <lucide-angular [img]="externalIcon" class="size-4"></lucide-angular>
                         Annonce d'origine
                      </a>
                    }
                    <h4 class="text-xs font-black uppercase tracking-widest text-base-content/40 mb-4">Partager</h4>
                    <div class="flex gap-2">
                       <button class="btn btn-ghost btn-sm btn-square rounded-xl text-base-content/60 hover:text-primary hover:bg-base-200 flex-1">LinkedIn</button>
                       <button class="btn btn-ghost btn-sm btn-square rounded-xl text-base-content/60 hover:text-primary hover:bg-base-200 flex-1">Lien</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="flex flex-col gap-6 md:p-8">
          <div class="skeleton h-64 w-full rounded-[var(--radius-card)]"></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:p-8">
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
  readonly editIcon = Pencil;
  readonly saveIcon = Save;
  readonly cancelIcon = X;
  readonly globeIcon = Globe;
  readonly calendarIcon = Calendar;
  readonly externalIcon = ExternalLink;

  isAdmin = this.authService.isAdmin;
  isMember = this.authService.isMember;
  isSubmitting = signal(false);
  isSubmittingUpdate = signal(false);
  isEditing = signal(false);
  editedDescription = '';

  private refreshTrigger = signal(0);
  
  job = toSignal(
    toObservable(this.refreshTrigger).pipe(
      startWith(0),
      switchMap(() => this.route.params.pipe(
        map(params => params['id']),
        switchMap(id => this.jobService.getJobById(+id))
      ))
    )
  );

  startEdit(description: string) {
    this.editedDescription = description;
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  saveEdit() {
    const currentJob = this.job();
    if (!currentJob) return;

    this.isSubmittingUpdate.set(true);
    this.jobService.updateJob(currentJob.id, { description: this.editedDescription }).subscribe({
      next: () => {
        this.toastService.success("Description mise à jour avec succès.");
        this.isEditing.set(false);
        this.isSubmittingUpdate.set(false);
        this.refreshTrigger.update(n => n + 1);
      },
      error: (err) => {
        console.error('Error updating job:', err);
        this.toastService.error("Erreur lors de la mise à jour.");
        this.isSubmittingUpdate.set(false);
      }
    });
  }

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
