import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex justify-center items-center py-12">
      <div class="card bg-base-100 w-full max-w-sm shadow-xl border-t-4 border-primary">
        <div class="card-body">
          <h2 class="card-title text-2xl font-bold text-center justify-center mb-6">Welcome Back</h2>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Email</legend>
              <input 
                type="email" 
                formControlName="email" 
                class="input input-bordered w-full" 
                placeholder="name@example.com" 
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Password</legend>
              <input 
                type="password" 
                formControlName="password" 
                class="input input-bordered w-full" 
                placeholder="••••••••" 
              />
            </fieldset>

            @if (errorMessage()) {
              <div class="alert alert-error text-sm py-2">
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <div class="card-actions mt-6">
              <button 
                type="submit" 
                class="btn btn-primary w-full" 
                [disabled]="loginForm.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <span class="loading loading-spinner"></span>
                }
                Login
              </button>
            </div>
          </form>

          <div class="divider">OR</div>
          
          <div class="text-center text-sm">
            Don't have an account? <a routerLink="/register" class="link link-primary">Request Access</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      const credentials = this.loginForm.value as any;
      
      this.authService.login(credentials).subscribe({
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Invalid email or password.');
        }
      });
    }
  }
}
