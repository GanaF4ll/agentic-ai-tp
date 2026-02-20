import { Component, inject, signal, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, X, Send } from 'lucide-angular';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 bg-base-300/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="card bg-base-100 w-full max-w-lg shadow-2xl border border-base-200 rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div class="card-body p-8">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-3xl font-black tracking-tighter text-primary">Nouvelle Invitation</h2>
            <button (click)="close.emit()" class="btn btn-ghost btn-circle btn-sm">
              <lucide-icon name="x" size="24"></lucide-icon>
            </button>
          </div>
          
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
            <div class="grid grid-cols-2 gap-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend font-bold text-sm">Prénom</legend>
                <input 
                  type="text" 
                  formControlName="first_name" 
                  class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12" 
                  placeholder="Jean" 
                />
              </fieldset>
              
              <fieldset class="fieldset">
                <legend class="fieldset-legend font-bold text-sm">Nom</legend>
                <input 
                  type="text" 
                  formControlName="last_name" 
                  class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12" 
                  placeholder="Dupont" 
                />
              </fieldset>
            </div>

            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">E-mail Professionnel</legend>
              <input 
                type="email" 
                formControlName="email" 
                class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12" 
                placeholder="jean.dupont@ecole.fr" 
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">Rôle & Permissions</legend>
              <select 
                formControlName="role" 
                class="select select-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12"
              >
                <option value="MEMBER">Membre (Alumni)</option>
                <option value="ADMIN">Administrateur</option>
                <option value="SUPER_ADMIN">Super Administrateur</option>
              </select>
            </fieldset>

            <div class="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div class="flex gap-3">
                <div class="text-primary mt-0.5">
                  <lucide-icon name="send" size="18"></lucide-icon>
                </div>
                <p class="text-xs font-bold text-primary/80 leading-relaxed">
                  L'utilisateur recevra un e-mail contenant son mot de passe temporaire et un lien pour activer son compte.
                </p>
              </div>
            </div>

            @if (errorMessage()) {
              <div role="alert" class="alert alert-error text-sm py-3 font-bold rounded-xl">
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <div class="card-actions mt-4 flex gap-3">
              <button 
                type="button"
                (click)="close.emit()"
                class="btn btn-ghost flex-1 h-12 min-h-12 font-black rounded-2xl"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary flex-[2] h-12 min-h-12 font-black shadow-lg shadow-primary/20 rounded-2xl text-base" 
                [disabled]="userForm.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                }
                Envoyer l'invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class UserCreateComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  close = output<void>();
  created = output<void>();
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  userForm = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: ['MEMBER', [Validators.required]]
  });

  onSubmit() {
    if (this.userForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      const userData = this.userForm.value as any;
      
      this.authService.createUser(userData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.created.emit();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set("Erreur lors de la création de l'utilisateur. L'email est peut-être déjà utilisé.");
        }
      });
    }
  }
}
