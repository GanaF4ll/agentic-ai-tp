import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex justify-center items-center py-12">
      <div class="card bg-base-100 w-full max-w-md shadow-xl border-t-4 border-primary">
        <div class="card-body">
          <h2 class="card-title text-2xl font-bold text-center justify-center mb-6">Join AlumniConnect</h2>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">First Name</legend>
                <input type="text" formControlName="first_name" class="input input-bordered w-full" placeholder="John" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Last Name</legend>
                <input type="text" formControlName="last_name" class="input input-bordered w-full" placeholder="Doe" />
              </fieldset>
            </div>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Email</legend>
              <input type="email" formControlName="email" class="input input-bordered w-full" placeholder="john.doe@ecole.fr" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Password</legend>
              <input type="password" formControlName="password" class="input input-bordered w-full" placeholder="••••••••" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Graduation Year</legend>
              <input type="number" formControlName="graduation_year" class="input input-bordered w-full" placeholder="2024" />
            </fieldset>

            @if (errorMessage()) {
              <div class="alert alert-error text-sm py-2">
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <div class="card-actions mt-6">
              <button type="submit" class="btn btn-primary w-full" [disabled]="registerForm.invalid || isLoading()">
                @if (isLoading()) { <span class="loading loading-spinner"></span> }
                Request Access
              </button>
            </div>
          </form>

          <div class="text-center text-sm mt-4">
            Already have an account? <a routerLink="/login" class="link link-primary">Login</a>
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
