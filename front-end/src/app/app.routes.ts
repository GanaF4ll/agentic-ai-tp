import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'alumni',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
    canActivate: [authGuard],
  },
  {
    path: 'alumni',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/alumni/alumni-list/alumni-list.component').then(
            (m) => m.AlumniListComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/alumni/profile-detail/profile-detail.component').then(
            (m) => m.ProfileDetailComponent,
          ),
      },
    ],
  },
  {
    path: 'jobs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/jobs/job-list/job-list.component').then((m) => m.JobListComponent),
  },
  {
    path: 'events',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/events/event-list/event-list.component').then((m) => m.EventListComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        data: { role: 'ADMIN' },
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/user-management/user-list.component').then((m) => m.UserListComponent),
        data: { role: 'SUPER_ADMIN' },
      },
    ],
  },
];
