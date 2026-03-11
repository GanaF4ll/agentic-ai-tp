import { Component, inject, computed } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SidebarService } from './sidebar.service';
import { LucideAngularModule, LogOut, User, Menu, Bell, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-angular';

import { ThemeToggleComponent } from './theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, ThemeToggleComponent],
  template: `
    <header class="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-40 px-4 h-16 border-b border-base-200 text-base-content">
      <div class="flex-none lg:hidden">
        <label for="layout-drawer" class="btn btn-ghost btn-circle text-base-content">
          <lucide-angular [img]="menuIcon" class="size-6"></lucide-angular>
        </label>
      </div>
      
      <!-- Desktop Sidebar Toggle -->
      <div class="hidden lg:flex flex-none">
        <button (click)="sidebarService.toggle()" class="btn btn-ghost btn-circle text-base-content/80 hover:text-primary">
          <lucide-angular [img]="sidebarService.isCollapsed() ? panelOpenIcon : panelCloseIcon" class="size-5"></lucide-angular>
        </button>
      </div>
      
      <div class="flex-1">
        <div class="hidden lg:flex items-center gap-2 px-2">
           <div class="text-sm breadcrumbs text-base-content/90">
              <ul>
                <li><a routerLink="/" class="hover:text-primary transition-colors">AlumniConnect</a></li>
                <li class="font-bold text-base-content">{{ pageTitle() }}</li>
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
          <input type="text" placeholder="Rechercher alumni, jobs..." class="input bg-base-200/50 input-sm w-40 lg:w-56 pl-10 text-base-content placeholder:text-base-content/40 focus:bg-base-100 focus:w-56 lg:focus:w-64 transition-all min-w-0 border-base-200" />
        </div>

        <app-theme-toggle></app-theme-toggle>

        <button class="btn btn-ghost btn-circle text-base-content">
          <div class="indicator">
            <lucide-angular [img]="bellIcon" class="size-5"></lucide-angular>
            <span class="badge badge-xs badge-primary indicator-item border-none"></span>
          </div>
        </button>

        <div class="divider divider-horizontal mx-0 before:bg-base-content/10 after:bg-base-content/10"></div>

        @if (authService.isAuthenticated()) {
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="size-9 rounded-full bg-base-200 flex items-center justify-center border border-base-200">
                <lucide-angular [img]="userIcon" class="size-5 text-base-content"></lucide-angular>
              </div>
            </div>
            <ul tabindex="0" class="mt-3 z-70 p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 border border-base-200 rounded-box w-52 text-base-content">
              <li class="px-4 py-2 font-semibold text-xs uppercase text-base-content/50">Mon Compte</li>
              <li><a routerLink="/profiles" class="hover:bg-base-200 transition-colors">Mon Profil</a></li>
              <div class="divider my-1 before:bg-base-content/10 after:bg-base-content/10"></div>
              <li><a (click)="logout()" class="text-error font-semibold hover:bg-error/10 transition-colors"><lucide-angular [img]="logoutIcon" class="size-4"></lucide-angular> Déconnexion</a></li>
            </ul>
          </div>
        } @else {
          <div class="flex gap-2">
            <a routerLink="/login" class="btn btn-ghost btn-sm text-base-content hover:bg-base-200">Connexion</a>
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
  private router = inject(Router);
  
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    )
  );

  pageTitle = computed(() => {
    const url = this.currentUrl() || '';
    if (url.includes('/alumni')) return 'Annuaire';
    if (url.includes('/jobs')) return 'Emplois';
    if (url.includes('/events')) return 'Événements';
    if (url.includes('/admin')) return 'Tableau de bord';
    if (url.includes('/profiles')) return 'Mon Profil';
    if (url.includes('/login')) return 'Connexion';
    if (url.includes('/register')) return 'Inscription';
    return 'Plateforme';
  });
  
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
