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
    <header class="navbar glass sticky top-0 z-40 px-4 h-16 border-none text-white">
      <div class="flex-none lg:hidden">
        <label for="layout-drawer" class="btn btn-ghost btn-circle text-white">
          <lucide-angular [img]="menuIcon" class="size-6"></lucide-angular>
        </label>
      </div>
      
      <!-- Desktop Sidebar Toggle -->
      <div class="hidden lg:flex flex-none">
        <button (click)="sidebarService.toggle()" class="btn btn-ghost btn-circle text-white/80 hover:text-white">
          <lucide-angular [img]="sidebarService.isCollapsed() ? panelOpenIcon : panelCloseIcon" class="size-5"></lucide-angular>
        </button>
      </div>
      
      <div class="flex-1">
        <div class="hidden lg:flex items-center gap-2 px-2">
           <div class="text-sm breadcrumbs text-white/90">
              <ul>
                <li><a routerLink="/" class="hover:text-white">AlumniConnect</a></li>
                <li class="font-bold text-white">Plateforme</li>
              </ul>
            </div>
        </div>
      </div>

      <div class="flex items-center gap-2 min-w-0 shrink">
        <!-- Search bar - Desktop -->
        <div class="hidden md:flex relative group min-w-0 shrink">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-white transition-colors">
            <lucide-angular [img]="searchIcon" class="size-4"></lucide-angular>
          </div>
          <input type="text" placeholder="Rechercher alumni, jobs..." class="input glass input-sm w-40 lg:w-56 pl-10 text-white placeholder:text-white/60 focus:bg-white/10 focus:w-56 lg:focus:w-64 transition-all min-w-0 border-white/20" />
        </div>

        <app-theme-toggle></app-theme-toggle>

        <button class="btn btn-ghost btn-circle text-white">
          <div class="indicator">
            <lucide-angular [img]="bellIcon" class="size-5"></lucide-angular>
            <span class="badge badge-xs badge-primary indicator-item border-none"></span>
          </div>
        </button>

        <div class="divider divider-horizontal mx-0 before:bg-white/20 after:bg-white/20"></div>

        @if (authService.isAuthenticated()) {
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="size-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <lucide-angular [img]="userIcon" class="size-5 text-white"></lucide-angular>
              </div>
            </div>
            <ul tabindex="0" class="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content glass-solid rounded-box w-52 text-white">
              <li class="px-4 py-2 font-semibold text-xs uppercase text-white/50">Mon Compte</li>
              <li><a routerLink="/profile" class="hover:bg-white/10">Paramètres du profil</a></li>
              <div class="divider my-1 before:bg-white/10 after:bg-white/10"></div>
              <li><a (click)="logout()" class="text-error font-semibold hover:bg-white/10"><lucide-angular [img]="logoutIcon" class="size-4"></lucide-angular> Déconnexion</a></li>
            </ul>
          </div>
        } @else {
          <div class="flex gap-2">
            <a routerLink="/login" class="btn btn-ghost btn-sm text-white hover:bg-white/10">Connexion</a>
            <a routerLink="/register" class="btn btn-primary btn-sm shadow-md border-none text-primary-content">Rejoindre</a>
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
