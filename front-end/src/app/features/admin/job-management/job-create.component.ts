import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Briefcase, MapPin, FileText, Building, Send, ArrowLeft, Globe, Calendar, Clock, ExternalLink } from 'lucide-angular';
import { JobService } from '../../../core/services/job.service';
import { JobOffer } from '../../../core/models/business.model';

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
        <!-- Basic Info -->
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
            @if (jobForm.controls.title.touched && jobForm.controls.title.invalid) {
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
            @if (jobForm.controls.company.touched && jobForm.controls.company.invalid) {
              <label class="label">
                <span class="label-text-alt text-error font-medium">L'entreprise est requise.</span>
              </label>
            }
          </div>
        </div>

        <!-- Contract & Location -->
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

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-white/70 font-bold uppercase tracking-widest text-xs">Date de prise de poste</span>
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
                <lucide-angular [img]="calendarIcon" class="size-5"></lucide-angular>
              </div>
              <input type="date" formControlName="start_date" 
                class="input w-full bg-white/5 border-white/10 text-white pl-12 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl">
            </div>
          </div>

          @if (showEndDate()) {
            <div class="form-control w-full animate-in fade-in duration-300">
              <label class="label">
                <span class="label-text text-white/70 font-bold uppercase tracking-widest text-xs">Date de fin</span>
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
                  <lucide-angular [img]="calendarIcon" class="size-5"></lucide-angular>
                </div>
                <input type="date" formControlName="end_date" 
                  class="input w-full bg-white/5 border-white/10 text-white pl-12 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl">
              </div>
              @if (jobForm.controls.end_date.touched && jobForm.controls.end_date.invalid) {
                <label class="label">
                  <span class="label-text-alt text-error font-medium">La date de fin est obligatoire pour ce type de contrat.</span>
                </label>
              }
            </div>
          }
        </div>

        <!-- Enums -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-white/70 font-bold uppercase tracking-widest text-xs">Remote Status</span>
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
                <lucide-angular [img]="globeIcon" class="size-5"></lucide-angular>
              </div>
              <select formControlName="remote_status" class="select w-full bg-white/5 border-white/10 text-white pl-12 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl">
                <option value="ON SITE">Sur site</option>
                <option value="HYBRID">Hybride</option>
                <option value="FULL REMOTE">Télétravail complet</option>
              </select>
            </div>
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-white/70 font-bold uppercase tracking-widest text-xs">Périodicité</span>
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
                <lucide-angular [img]="clockIcon" class="size-5"></lucide-angular>
              </div>
              <select formControlName="periodicity" class="select w-full bg-white/5 border-white/10 text-white pl-12 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl">
                <option value="FULL TIME">Temps plein</option>
                <option value="PART TIME">Temps partiel</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Source -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text text-white/70 font-bold uppercase tracking-widest text-xs">Lien de l'annonce (Source)</span>
          </label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
              <lucide-angular [img]="linkIcon" class="size-5"></lucide-angular>
            </div>
            <input type="url" formControlName="source_url" placeholder="https://..." 
              class="input w-full bg-white/5 border-white/10 text-white pl-12 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl">
          </div>
        </div>

        <!-- Description -->
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
          @if (jobForm.controls.description.touched && jobForm.controls.description.invalid) {
            <label class="label">
              <span class="label-text-alt text-error font-medium">La description est requise.</span>
            </label>
          }
        </div>

        <div class="pt-4">
          <button type="submit" [disabled]="jobForm.invalid || isSubmitting()" class="btn btn-primary w-full shadow-lg shadow-primary/20 border-none text-primary-content font-bold h-14 text-lg rounded-2xl">
            @if (isSubmitting()) {
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
  private jobService = inject(JobService);
  private router = inject(Router);

  readonly briefcaseIcon = Briefcase;
  readonly locationIcon = MapPin;
  readonly buildingIcon = Building;
  readonly fileTextIcon = FileText;
  readonly sendIcon = Send;
  readonly backIcon = ArrowLeft;
  readonly globeIcon = Globe;
  readonly calendarIcon = Calendar;
  readonly clockIcon = Clock;
  readonly linkIcon = ExternalLink;

  isSubmitting = signal(false);

  readonly jobForm = new FormGroup({
    title: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    company: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    type: new FormControl<'CDI' | 'CDD' | 'FREELANCE' | 'INTERNSHIP'>('CDI', { validators: [Validators.required], nonNullable: true }),
    location: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    remote_status: new FormControl<'HYBRID' | 'FULL REMOTE' | 'ON SITE'>('ON SITE', { nonNullable: true }),
    periodicity: new FormControl<'FULL TIME' | 'PART TIME'>('FULL TIME', { nonNullable: true }),
    source_url: new FormControl('')
  });

  typeSignal = toSignal(this.jobForm.controls.type.valueChanges, { initialValue: this.jobForm.controls.type.value });

  constructor() {
    effect(() => {
      const type = this.typeSignal();
      const endDateControl = this.jobForm.controls.end_date;
      
      if (type !== 'CDI') {
        endDateControl.setValidators([Validators.required]);
      } else {
        endDateControl.clearValidators();
      }
      endDateControl.updateValueAndValidity();
    });
  }

  showEndDate = computed(() => {
    return this.typeSignal() !== 'CDI';
  });

  onSubmit() {
    if (this.jobForm.valid) {
      this.isSubmitting.set(true);
      const val = this.jobForm.getRawValue();
      
      // Clean up empty values for optional fields and ensure correct types
      const payload: Partial<JobOffer> = {
        ...val,
        start_date: val.start_date || undefined,
        end_date: (val.type !== 'CDI' && val.end_date) ? val.end_date : undefined,
        source_url: val.source_url || undefined
      };

      this.jobService.createJob(payload).subscribe({
        next: () => {
          this.router.navigate(['/jobs']);
        },
        error: (err) => {
          console.error('Error creating job:', err);
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
