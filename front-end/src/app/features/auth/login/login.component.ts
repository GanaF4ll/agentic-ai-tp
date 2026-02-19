import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex justify-center items-center relative overflow-hidden py-12">
      <!-- Abstract Background -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-primary/20 rounded-full blur-[100px] -z-10"></div>
      
      <div class="card bg-base-100 w-full max-w-sm shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)] overflow-hidden">
        <div class="card-body p-8">
          <div class="text-center mb-6">
            <h2 class="text-3xl font-black tracking-tighter text-primary">Welcome Back</h2>
            <p class="text-base-content/60 font-medium mt-2">Sign in to your alumni account</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">Email</legend>
              <input 
                type="email" 
                formControlName="email" 
                class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12" 
                placeholder="name@example.com" 
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend font-bold text-sm">Password</legend>
              <input 
                type="password" 
                formControlName="password" 
                class="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors h-12" 
                placeholder="••••••••" 
              />
              <div class="text-right mt-1">
                 <a routerLink="/forgot-password" class="link link-primary text-xs font-bold no-underline hover:underline">Forgot password?</a>
              </div>
            </fieldset>

            @if (errorMessage()) {
              <div role="alert" class="alert alert-error text-sm py-3 font-bold rounded-xl flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <div class="card-actions mt-4">
              <button 
                type="submit" 
                class="btn btn-primary w-full btn-lg h-12 min-h-12 font-black shadow-lg shadow-primary/20 rounded-xl text-base" 
                [disabled]="loginForm.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                }
                Login
              </button>
            </div>
          </form>

          <div class="divider my-6 text-xs font-bold text-base-content/30">OR</div>
          
          <div class="text-center text-sm font-medium">
            Don't have an account? <a routerLink="/register" class="link link-primary font-bold no-underline hover:underline">Request Access</a>
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
