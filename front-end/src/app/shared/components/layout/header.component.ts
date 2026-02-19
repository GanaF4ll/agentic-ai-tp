import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SidebarService } from './sidebar.service';
import { LucideAngularModule, LogOut, User, Menu, Bell, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-angular';

import { ThemeToggleComponent } from './theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, ThemeToggleComponent],
  template: `
    <header class="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-40 border-b border-base-200 px-4 h-16">
      <div class="flex-none lg:hidden">
        <label for="layout-drawer" class="btn btn-ghost btn-circle">
          <lucide-angular [img]="menuIcon" class="size-6"></lucide-angular>
        </label>
      </div>
      
      <!-- Desktop Sidebar Toggle -->
      <div class="hidden lg:flex flex-none">
        <button (click)="sidebarService.toggle()" class="btn btn-ghost btn-circle text-base-content/60 hover:text-primary">
          <lucide-angular [img]="sidebarService.isCollapsed() ? panelOpenIcon : panelCloseIcon" class="size-5"></lucide-angular>
        </button>
      </div>
      
      <div class="flex-1">
        <div class="hidden lg:flex items-center gap-2 px-2">
           <div class="text-sm breadcrumbs">
              <ul>
                <li><a routerLink="/">AlumniConnect</a></li>
                <li class="font-bold text-primary">Platform</li>
              </ul>
            </div>
        </div>
      </div>

      <div class="flex items-center gap-2 min-w-0 shrink">
        <!-- Search bar - Desktop -->
        <div class="hidden md:flex relative group min-w-0 shrink">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
            <lucide-angular [img]="searchIcon" class="size-4"></lucide-angular>
          </div>
          <input type="text" placeholder="Search alumni, jobs..." class="input input-bordered input-sm w-40 lg:w-56 pl-10 bg-base-200/50 focus:bg-base-100 focus:w-56 lg:focus:w-64 transition-all min-w-0" />
        </div>

        <app-theme-toggle></app-theme-toggle>

        <button class="btn btn-ghost btn-circle">
          <div class="indicator">
            <lucide-angular [img]="bellIcon" class="size-5"></lucide-angular>
            <span class="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>

        <div class="divider divider-horizontal mx-0"></div>

        @if (authService.isAuthenticated()) {
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="size-9 rounded-full bg-primary/10 flex items-center justify-center">
                <lucide-angular [img]="userIcon" class="size-5 text-primary"></lucide-angular>
              </div>
            </div>
            <ul tabindex="0" class="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200">
              <li class="px-4 py-2 font-semibold text-xs uppercase text-base-content/50">My Account</li>
              <li><a routerLink="/profile">Profile Settings</a></li>
              <div class="divider my-1"></div>
              <li><a (click)="logout()" class="text-error font-semibold"><lucide-angular [img]="logoutIcon" class="size-4"></lucide-angular> Logout</a></li>
            </ul>
          </div>
        } @else {
          <div class="flex gap-2">
            <a routerLink="/login" class="btn btn-ghost btn-sm">Login</a>
            <a routerLink="/register" class="btn btn-primary btn-sm shadow-md">Join Now</a>
          </div>
        }
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  
  readonly userIcon = User;
  readonly logoutIcon = LogOut;
  readonly menuIcon = Menu;
  readonly bellIcon = Bell;
  readonly searchIcon = Search;
  readonly panelCloseIcon = PanelLeftClose;
  readonly panelOpenIcon = PanelLeftOpen;

  logout() {
    this.authService.logout();
  }
}
