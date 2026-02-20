import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, Lock, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="min-h-[80vh] flex justify-center items-center relative overflow-hidden py-12">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-primary/20 rounded-full blur-[100px] -z-10"></div>
      
      <div class="card bg-base-100 w-full max-w-md shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)] overflow-hidden">
        <div class="card-body p-8">
          <div class="text-center mb-6">
            <h2 class="text-3xl font-black tracking-tighter text-primary">Nouveau mot de passe</h2>
            <p class="text-base-content/60 font-medium mt-2">Pour votre sécurité, vous devez changer votre mot de passe temporaire.</p>
          </div>
          
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">Mot de passe actuel</legend>
              <div class="relative">
                <input 
                  [type]="showCurrent() ? 'text' : 'password'" 
                  formControlName="currentPassword" 
                  class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12" 
                  placeholder="••••••••" 
                />
                <button type="button" (click)="showCurrent.set(!showCurrent())" class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors">
                  @if (showCurrent()) { <lucide-icon [name]="eyeOffIcon" size="20"></lucide-icon> } 
                  @else { <lucide-icon [name]="eyeIcon" size="20"></lucide-icon> }
                </button>
              </div>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">Nouveau mot de passe</legend>
              <div class="relative">
                <input 
                  [type]="showNew() ? 'text' : 'password'" 
                  formControlName="newPassword" 
                  class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12" 
                  placeholder="••••••••" 
                />
                <button type="button" (click)="showNew.set(!showNew())" class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors">
                  @if (showNew()) { <lucide-icon [name]="eyeOffIcon" size="20"></lucide-icon> } 
                  @else { <lucide-icon [name]="eyeIcon" size="20"></lucide-icon> }
                </button>
              </div>
              <div class="text-xs text-base-content/50 mt-1">Minimum 8 caractères, une majuscule et un chiffre.</div>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">Confirmer le nouveau mot de passe</legend>
              <input 
                type="password" 
                formControlName="confirmPassword" 
                class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12" 
                placeholder="••••••••" 
              />
            </fieldset>

            @if (errorMessage()) {
              <div role="alert" class="alert alert-error text-sm py-3 font-bold rounded-xl flex items-center gap-2">
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <div class="card-actions mt-4">
              <button 
                type="submit" 
                class="btn btn-primary w-full btn-lg h-12 min-h-12 font-black shadow-lg shadow-primary/20 rounded-xl text-base" 
                [disabled]="resetForm.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                }
                Mettre à jour le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showCurrent = signal(false);
  showNew = signal(false);

  eyeIcon = 'eye';
  eyeOffIcon = 'eye-off';

  resetForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(g: any) {
    return g.get('newPassword').value === g.get('confirmPassword').value
       ? null : {'mismatch': true};
  }

  onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      const { currentPassword, newPassword } = this.resetForm.value as any;
      
      this.authService.resetPassword(currentPassword, newPassword).subscribe({
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Erreur lors du changement de mot de passe. Vérifiez vos informations.');
        }
      });
    }
  }
}
