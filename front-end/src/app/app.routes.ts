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
    path: 'alumni',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/alumni/alumni-list/alumni-list.component').then(
            (m) => m.AlumniListComponent,
          ),
        // canActivate: [authGuard]
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/alumni/profile-detail/profile-detail.component').then(
            (m) => m.ProfileDetailComponent,
          ),
        // canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./features/jobs/job-list/job-list.component').then((m) => m.JobListComponent),
    // canActivate: [authGuard],
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./features/events/event-list/event-list.component').then((m) => m.EventListComponent),
    // canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    // canActivate: [authGuard],
    data: { role: 'ADMIN' },
  },
];
