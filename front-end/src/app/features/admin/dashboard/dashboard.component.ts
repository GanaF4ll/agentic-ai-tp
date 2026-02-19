import { Component, inject, signal } from '@angular/core';
import { AlumniService } from '../../../core/services/alumni.service';
import { Profile } from '../../../core/models/profile.model';
import { LucideAngularModule, CheckCircle, Clock, Search, ExternalLink } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col gap-8">
      <header>
        <h1 class="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p class="text-base-content/60">Manage alumni profiles and platform stats.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stats shadow bg-base-100 border border-base-200">
          <div class="stat">
            <div class="stat-figure text-primary">
              <lucide-angular [img]="checkIcon" class="w-8 h-8"></lucide-angular>
            </div>
            <div class="stat-title">Verified Alumni</div>
            <div class="stat-value text-primary">842</div>
            <div class="stat-desc">21% more than last month</div>
          </div>
        </div>
        
        <div class="stats shadow bg-base-100 border border-base-200">
          <div class="stat">
            <div class="stat-figure text-warning">
              <lucide-angular [img]="clockIcon" class="w-8 h-8"></lucide-angular>
            </div>
            <div class="stat-title">Pending Validation</div>
            <div class="stat-value text-warning">12</div>
            <div class="stat-desc">Awaiting admin review</div>
          </div>
        </div>
      </div>

      <section class="card bg-base-100 shadow-sm border border-base-200">
        <div class="card-body p-0">
          <div class="p-6 border-b border-base-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 class="card-title">Validation Queue</h2>
            <div class="input input-bordered input-sm flex items-center gap-2">
               <lucide-angular [img]="searchIcon" class="w-4 h-4 opacity-70"></lucide-angular>
               <input type="text" placeholder="Search queue..." />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Graduation</th>
                  <th>Degree</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (profile of pendingProfiles(); track profile.id) {
                  <tr>
                    <td>
                      <div class="font-bold">{{ profile.first_name }} {{ profile.last_name }}</div>
                      <div class="text-xs opacity-50">{{ profile.email }}</div>
                    </td>
                    <td>{{ profile.graduation_year }}</td>
                    <td><span class="badge badge-ghost badge-sm">{{ profile.degree }}</span></td>
                    <td><span class="badge badge-outline badge-info badge-sm">LinkedIn Scraper</span></td>
                    <th class="flex gap-2">
                      <button 
                        class="btn btn-success btn-xs gap-1"
                        (click)="validateProfile(profile.id)"
                      >
                        <lucide-angular [img]="checkIcon" class="w-3 h-3"></lucide-angular>
                        Validate
                      </button>
                      <button class="btn btn-ghost btn-xs">Details</button>
                    </th>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center py-12 text-base-content/40 italic">
                      No profiles pending validation. Good job!
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  `
})
export class DashboardComponent {
  private alumniService = inject(AlumniService);
  
  pendingProfiles = signal<Profile[]>([]);
  
  readonly checkIcon = CheckCircle;
  readonly clockIcon = Clock;
  readonly searchIcon = Search;

  constructor() {
    this.loadPending();
  }

  loadPending() {
    // In a real app, this would be a filtered call to the backend
    this.pendingProfiles.set([
      {
        id: 3,
        first_name: 'Claire',
        last_name: 'Lefebvre',
        email: 'claire@example.com',
        degree: 'Cybersecurity',
        graduation_year: 2023,
        status: 'DRAFT',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        first_name: 'Damien',
        last_name: 'Rousseau',
        email: 'damien@example.com',
        degree: 'Data Science',
        graduation_year: 2024,
        status: 'DRAFT',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  }

  validateProfile(id: number) {
    this.alumniService.validateProfile(id).subscribe({
        next: () => {
            this.pendingProfiles.update(p => p.filter(x => x.id !== id));
        },
        error: () => {
            // Mock success for demo
            this.pendingProfiles.update(p => p.filter(x => x.id !== id));
        }
    });
  }
}
