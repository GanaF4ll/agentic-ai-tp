import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SidebarService } from './sidebar.service';
import { LucideAngularModule, User, Briefcase, Calendar, GraduationCap, LayoutDashboard, Settings } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, CommonModule],
  template: `
    <aside 
      class="bg-base-100 h-full border-r border-base-300 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
      [ngClass]="sidebarService.isCollapsed() ? 'w-20' : 'w-80'"
    >
      <div class="p-6 h-20 flex items-center shrink-0">
        <a routerLink="/" class="flex items-center gap-3 text-2xl font-black text-primary tracking-tighter">
          <div class="p-1.5 bg-primary/10 rounded-xl shrink-0">
             <lucide-angular [img]="gradIcon" class="size-6 text-primary"></lucide-angular>
          </div>
          <span class="transition-opacity duration-200 whitespace-nowrap" [ngClass]="sidebarService.isCollapsed() ? 'opacity-0 w-0' : 'opacity-100'">
            AlumniConnect
          </span>
        </a>
      </div>

      <nav class="flex-1 px-4 space-y-1 py-4 overflow-y-auto overflow-x-hidden">
        <div 
          class="text-xs font-semibold text-base-content/40 uppercase tracking-wider px-4 py-2 transition-opacity duration-200 whitespace-nowrap"
          [ngClass]="sidebarService.isCollapsed() ? 'opacity-0' : 'opacity-100'"
        >
          Main
        </div>
        
        <a routerLink="/alumni" routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200 transition-colors group relative" title="Directory">
          <lucide-angular [img]="gradIcon" class="size-5 shrink-0"></lucide-angular>
          <span class="transition-all duration-200 whitespace-nowrap" [ngClass]="sidebarService.isCollapsed() ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'">
            Directory
          </span>
        </a>
        
        <a routerLink="/jobs" routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200 transition-colors group relative" title="Job Board">
          <lucide-angular [img]="jobIcon" class="size-5 shrink-0"></lucide-angular>
          <span class="transition-all duration-200 whitespace-nowrap" [ngClass]="sidebarService.isCollapsed() ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'">
            Job Board
          </span>
        </a>
        
        <a routerLink="/events" routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200 transition-colors group relative" title="Events">
          <lucide-angular [img]="calendarIcon" class="size-5 shrink-0"></lucide-angular>
          <span class="transition-all duration-200 whitespace-nowrap" [ngClass]="sidebarService.isCollapsed() ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'">
            Events
          </span>
        </a>

        @if (authService.isAdmin()) {
          <div class="divider mx-4 opacity-50"></div>
          
          <a routerLink="/admin" routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200 transition-colors group relative" title="Dashboard">
            <lucide-angular [img]="dashboardIcon" class="size-5 shrink-0"></lucide-angular>
            <span class="transition-all duration-200 whitespace-nowrap" [ngClass]="sidebarService.isCollapsed() ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'">
              Dashboard
            </span>
          </a>
        }

        @if (authService.isAuthenticated()) {
          <div class="divider mx-4 opacity-50"></div>
          
          <a routerLink="/profile" routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200 transition-colors group relative" title="My Profile">
            <lucide-angular [img]="userIcon" class="size-5 shrink-0"></lucide-angular>
            <span class="transition-all duration-200 whitespace-nowrap" [ngClass]="sidebarService.isCollapsed() ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'">
              My Profile
            </span>
          </a>
        }
      </nav>

      <div class="p-4 border-t border-base-200 bg-base-200/50 shrink-0">
        <div class="flex items-center gap-3 px-2 py-2">
          <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <lucide-angular [img]="userIcon" class="size-6 text-primary"></lucide-angular>
          </div>
          <div class="flex-1 overflow-hidden transition-all duration-200" [ngClass]="sidebarService.isCollapsed() ? 'opacity-0 w-0' : 'opacity-100'">
             <p class="text-sm font-bold truncate">{{ authService.isAuthenticated() ? 'Connected' : 'Welcome' }}</p>
             <p class="text-xs text-base-content/60 truncate">Alumni Network</p>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  
  readonly userIcon = User;
  readonly jobIcon = Briefcase;
  readonly calendarIcon = Calendar;
  readonly gradIcon = GraduationCap;
  readonly dashboardIcon = LayoutDashboard;
  readonly settingsIcon = Settings;
}
