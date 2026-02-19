import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Check if it's an admin-only route
    if (route.data?.['role'] === 'ADMIN' && !authService.isAdmin()) {
      router.navigate(['/alumni']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};
