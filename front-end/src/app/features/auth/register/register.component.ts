import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex justify-center items-center relative overflow-hidden py-12">
      <!-- Abstract Background -->
       <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-secondary/10 rounded-full blur-[100px] -z-10"></div>

      <div class="card bg-base-100 w-full max-w-md shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)] overflow-hidden">
        <div class="card-body p-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-black tracking-tighter text-primary">Rejoindre AlumniConnect</h2>
            <p class="text-base-content/60 font-medium mt-2">Connectez-vous avec vos pairs et développez votre réseau</p>
          </div>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend font-bold text-sm">Prénom</legend>
                <input type="text" formControlName="first_name" class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-11" placeholder="Jean" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend font-bold text-sm">Nom</legend>
                <input type="text" formControlName="last_name" class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-11" placeholder="Dupont" />
              </fieldset>
            </div>

            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">E-mail</legend>
              <input type="email" formControlName="email" class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-11" placeholder="jean.dupont@ecole.fr" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">Mot de passe</legend>
              <input type="password" formControlName="password" class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-11" placeholder="••••••••" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">Année de diplôme</legend>
              <input type="number" formControlName="graduation_year" class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-11" placeholder="2024" />
            </fieldset>

            @if (errorMessage()) {
              <div role="alert" class="alert alert-error text-sm py-3 font-bold rounded-xl flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <div class="card-actions mt-6">
              <button type="submit" class="btn btn-primary w-full btn-lg h-12 min-h-12 font-black shadow-lg shadow-primary/20 rounded-xl text-base" [disabled]="registerForm.invalid || isLoading()">
                @if (isLoading()) { <span class="loading loading-spinner loading-sm"></span> }
                Demander l'accès
              </button>
            </div>
          </form>

          <div class="text-center text-sm mt-6 font-medium">
            Vous avez déjà un compte ? <a routerLink="/login" class="link link-primary font-bold no-underline hover:underline">Se connecter</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    graduation_year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      // Logic for registration/request access
      setTimeout(() => this.isLoading.set(false), 1000);
    }
  }
}
