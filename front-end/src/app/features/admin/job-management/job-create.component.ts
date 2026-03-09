import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Briefcase, MapPin, FileText, Building, Send, ArrowLeft } from 'lucide-angular';
import { JobService } from '../../../core/services/job.service';

@Component({
  selector: 'app-job-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <header class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tighter">Publier une Offre</h1>
          <p class="text-white/60 font-medium mt-1">Créez une nouvelle opportunité pour notre réseau.</p>
        </div>
        <button routerLink="/jobs" class="btn btn-ghost btn-sm text-white/70 hover:text-white">
          <lucide-angular [img]="backIcon" class="size-4 mr-2"></lucide-angular>
          Retour
        </button>
      </header>

      <form [formGroup]="jobForm" (ngSubmit)="onSubmit()" class="glass p-8 rounded-[var(--radius-card)] border border-white/20 shadow-[var(--shadow-card)] space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-white/70 font-bold uppercase tracking-widest text-xs">Titre du poste</span>
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
                <lucide-angular [img]="briefcaseIcon" class="size-5"></lucide-angular>
              </div>
              <input type="text" formControlName="title" placeholder="Ex: Développeur Angular Senior" 
                class="input w-full bg-white/5 border-white/10 text-white pl-12 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl">
            </div>
            @if (jobForm.get('title')?.touched && jobForm.get('title')?.invalid) {
              <label class="label">
                <span class="label-text-alt text-error font-medium">Le titre est requis.</span>
              </label>
            }
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-white/70 font-bold uppercase tracking-widest text-xs">Entreprise</span>
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
                <lucide-angular [img]="buildingIcon" class="size-5"></lucide-angular>
              </div>
              <input type="text" formControlName="company" placeholder="Nom de l'entreprise" 
                class="input w-full bg-white/5 border-white/10 text-white pl-12 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl">
            </div>
            @if (jobForm.get('company')?.touched && jobForm.get('company')?.invalid) {
              <label class="label">
                <span class="label-text-alt text-error font-medium">L'entreprise est requise.</span>
              </label>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-white/70 font-bold uppercase tracking-widest text-xs">Type de contrat</span>
            </label>
            <select formControlName="type" class="select w-full bg-white/5 border-white/10 text-white focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl">
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="FREELANCE">Freelance</option>
              <option value="INTERNSHIP">Stage</option>
            </select>
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-white/70 font-bold uppercase tracking-widest text-xs">Localisation</span>
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
                <lucide-angular [img]="locationIcon" class="size-5"></lucide-angular>
              </div>
              <input type="text" formControlName="location" placeholder="Ex: Paris, France (Remote)" 
                class="input w-full bg-white/5 border-white/10 text-white pl-12 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl">
            </div>
          </div>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text text-white/70 font-bold uppercase tracking-widest text-xs">Description du poste</span>
          </label>
          <div class="relative group">
            <div class="absolute top-4 left-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
              <lucide-angular [img]="fileTextIcon" class="size-5"></lucide-angular>
            </div>
            <textarea formControlName="description" rows="6" placeholder="Décrivez les missions, le profil recherché..." 
              class="textarea w-full bg-white/5 border-white/10 text-white pl-12 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl"></textarea>
          </div>
          @if (jobForm.get('description')?.touched && jobForm.get('description')?.invalid) {
            <label class="label">
              <span class="label-text-alt text-error font-medium">La description est requise.</span>
            </label>
          }
        </div>

        <div class="pt-4">
          <button type="submit" [disabled]="jobForm.invalid || isSubmitting" class="btn btn-primary w-full shadow-lg shadow-primary/20 border-none text-primary-content font-bold h-14 text-lg rounded-2xl">
            @if (isSubmitting) {
              <span class="loading loading-spinner"></span>
            } @else {
              <lucide-angular [img]="sendIcon" class="size-5 mr-2"></lucide-angular>
              Publier l'offre
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class JobCreateComponent {
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private router = inject(Router);

  readonly briefcaseIcon = Briefcase;
  readonly locationIcon = MapPin;
  readonly buildingIcon = Building;
  readonly fileTextIcon = FileText;
  readonly sendIcon = Send;
  readonly backIcon = ArrowLeft;

  isSubmitting = false;

  jobForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    company: ['', [Validators.required]],
    type: ['CDI', [Validators.required]],
    location: [''],
    description: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.jobForm.valid) {
      this.isSubmitting = true;
      this.jobService.createJob(this.jobForm.value).subscribe({
        next: () => {
          this.router.navigate(['/jobs']);
        },
        error: (err) => {
          console.error('Error creating job:', err);
          this.isSubmitting = false;
        }
      });
    }
  }
}
