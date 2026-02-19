import { Component, inject, signal } from '@angular/core';
import { AlumniService } from '../../../core/services/alumni.service';
import { Profile } from '../../../core/models/profile.model';
import { LucideAngularModule, CheckCircle, Clock, Search, ExternalLink } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <header class="col-span-full bg-base-100 p-8 rounded-[var(--radius-card)] border border-base-200 shadow-[var(--shadow-card)] flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden">
        <div class="relative z-10">
          <h1 class="text-4xl font-black text-primary tracking-tighter leading-none">Admin <span class="text-base-content/30">Dashboard</span></h1>
          <p class="text-base-content/50 font-medium mt-3">Manage alumni profiles, validate new members, and monitor platform activity.</p>
        </div>
        
        <!-- Abstract background pattern -->
        <div class="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-secondary/5 blur-3xl"></div>
      </header>

      <!-- Stat Card 1 -->
      <div class="stats shadow-[var(--shadow-card)] bg-base-100 border border-base-200 rounded-[var(--radius-card)] overflow-hidden">
        <div class="stat p-6">
          <div class="stat-figure text-primary bg-primary/10 p-3 rounded-xl">
            <lucide-angular [img]="checkIcon" class="size-6"></lucide-angular>
          </div>
          <div class="stat-title text-base-content/60 font-bold text-xs uppercase tracking-wider">Verified Alumni</div>
          <div class="stat-value text-primary font-black text-4xl mt-1">842</div>
          <div class="stat-desc font-medium text-success mt-2 flex items-center gap-1">
             <span class="inline-block size-1.5 rounded-full bg-success"></span>
             21% more than last month
          </div>
        </div>
      </div>
      
      <!-- Stat Card 2 -->
      <div class="stats shadow-[var(--shadow-card)] bg-base-100 border border-base-200 rounded-[var(--radius-card)] overflow-hidden">
        <div class="stat p-6">
          <div class="stat-figure text-warning bg-warning/10 p-3 rounded-xl">
            <lucide-angular [img]="clockIcon" class="size-6"></lucide-angular>
          </div>
          <div class="stat-title text-base-content/60 font-bold text-xs uppercase tracking-wider">Pending Validation</div>
          <div class="stat-value text-warning font-black text-4xl mt-1">12</div>
          <div class="stat-desc font-medium text-warning mt-2">Awaiting review</div>
        </div>
      </div>

       <!-- Action Card -->
      <div class="col-span-1 md:col-span-2 card bg-secondary/10 border border-secondary/20 rounded-[var(--radius-card)] overflow-hidden relative">
         <div class="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <lucide-angular [img]="checkIcon" class="size-32 -mb-8 -mr-8 rotate-12"></lucide-angular>
         </div>
         <div class="card-body p-6">
            <h3 class="font-black text-secondary-content text-lg">Quick Actions</h3>
            <div class="flex flex-wrap gap-2 mt-2">
               <button class="btn btn-sm btn-secondary font-bold shadow-sm">Export Data (CSV)</button>
               <button class="btn btn-sm btn-ghost bg-white/50 hover:bg-white/80 font-bold">Invite User</button>
            </div>
         </div>
      </div>

      <!-- Validation Queue Table -->
      <section class="col-span-full card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)] overflow-hidden">
        <div class="card-body p-0">
          <div class="p-6 border-b border-base-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-100/50">
            <div class="flex items-center gap-3">
               <div class="p-2 bg-primary/10 rounded-lg text-primary">
                  <lucide-angular [img]="clockIcon" class="size-5"></lucide-angular>
               </div>
               <h2 class="card-title font-black tracking-tight">Validation Queue</h2>
            </div>
            
            <div class="input input-bordered input-sm flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 focus-within:w-64 transition-all duration-300">
               <lucide-angular [img]="searchIcon" class="size-4 opacity-40"></lucide-angular>
               <input type="text" placeholder="Search pending profiles..." class="grow font-medium placeholder:text-base-content/30" />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr class="bg-base-200/30 text-xs uppercase text-base-content/50 font-bold tracking-wider">
                  <th class="py-4 pl-6">Candidate</th>
                  <th>Graduation</th>
                  <th>Degree</th>
                  <th>Source</th>
                  <th class="pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (profile of pendingProfiles(); track profile.id) {
                  <tr class="group hover:bg-base-200/50 transition-colors">
                    <td class="pl-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="avatar placeholder">
                          <div class="bg-neutral text-neutral-content rounded-xl w-10">
                            <span class="text-xs font-black">{{ profile.first_name[0] }}{{ profile.last_name[0] }}</span>
                          </div>
                        </div>
                        <div>
                          <div class="font-bold text-base-content group-hover:text-primary transition-colors">{{ profile.first_name }} {{ profile.last_name }}</div>
                          <div class="text-xs text-base-content/50 font-medium">{{ profile.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="font-bold text-base-content/70">{{ profile.graduation_year }}</td>
                    <td><span class="badge badge-ghost badge-sm font-bold bg-base-200 border-base-300 text-base-content/70">{{ profile.degree }}</span></td>
                    <td><span class="badge badge-outline badge-info badge-sm font-bold gap-1 pl-1 pr-2"><div class="size-1.5 rounded-full bg-info"></div>LinkedIn</span></td>
                    <th class="pr-6 text-right">
                      <div class="flex gap-2 justify-end">
                        <button class="btn btn-ghost btn-xs font-bold hover:bg-base-200">Details</button>
                        <button 
                          class="btn btn-success btn-xs gap-1 font-bold shadow-sm shadow-success/20"
                          (click)="validateProfile(profile.id)"
                        >
                          <lucide-angular [img]="checkIcon" class="size-3"></lucide-angular>
                          Validate
                        </button>
                      </div>
                    </th>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center py-20">
                      <div class="flex flex-col items-center justify-center gap-4">
                        <div class="size-16 rounded-full bg-success/10 flex items-center justify-center text-success">
                           <lucide-angular [img]="checkIcon" class="size-8"></lucide-angular>
                        </div>
                        <div>
                          <p class="font-black text-lg text-base-content/80">All caught up!</p>
                          <p class="text-sm text-base-content/50 font-medium">No profiles pending validation.</p>
                        </div>
                      </div>
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
