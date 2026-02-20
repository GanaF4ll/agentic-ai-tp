import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // 1. Force password change if required
    if (authService.mustChangePassword() && state.url !== '/reset-password') {
      router.navigate(['/reset-password']);
      return false;
    }

    // 2. Role-based access control
    const requiredRole = route.data?.['role'];
    
    if (requiredRole === 'SUPER_ADMIN' && !authService.isSuperAdmin()) {
      router.navigate(['/alumni']);
      return false;
    }

    if (requiredRole === 'ADMIN' && !authService.isAdmin()) {
      router.navigate(['/alumni']);
      return false;
    }

    return true;
  }

  router.navigate(['/login']);
  return false;
};
