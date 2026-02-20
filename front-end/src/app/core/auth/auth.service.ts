import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { User, LoginCredentials, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/api/auth`;

  private _user = signal<User | null>(null);
  user = this._user.asReadonly();
  
  isAuthenticated = computed(() => !!this._user());
  isAdmin = computed(() => this._user()?.role === 'ADMIN' || this._user()?.role === 'SUPER_ADMIN');
  isSuperAdmin = computed(() => this._user()?.role === 'SUPER_ADMIN');
  mustChangePassword = computed(() => this._user()?.must_change_password ?? false);

  constructor() {
    this.loadUser();
  }

  login(credentials: LoginCredentials) {
    return this.http.post<AuthResponse>(`${this.API_URL}/login/`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
        this._user.set(response.user);
        
        if (response.user.must_change_password) {
          this.router.navigate(['/reset-password']);
        } else {
          this.router.navigate(['/alumni']);
        }
      })
    );
  }

  resetPassword(currentPassword: string, newPassword: string) {
    return this.http.post(`${this.API_URL}/reset-password/`, { 
      current_password: currentPassword, 
      new_password: newPassword 
    }).pipe(
      tap(() => {
        const currentUser = this._user();
        if (currentUser) {
          const updatedUser = { ...currentUser, must_change_password: false };
          this._user.set(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        this.router.navigate(['/alumni']);
      })
    );
  }

  // User Management (Super-Admin only)
  getUsers() {
    return this.http.get<User[]>(`${environment.apiUrl}/api/users/`);
  }

  createUser(userData: Partial<User>) {
    return this.http.post<User>(`${environment.apiUrl}/api/users/create/`, userData);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private loadUser() {
    const token = localStorage.getItem('access_token');
    if (token) {
      // In a real app, we might want to fetch user profile or decode JWT
      // For now, let's assume we need to verify the token or we have user info in localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this._user.set(JSON.parse(savedUser));
      }
    }
  }
}
