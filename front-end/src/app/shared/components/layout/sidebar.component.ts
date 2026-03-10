import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SidebarService } from './sidebar.service';
import { LucideAngularModule, User, Briefcase, Calendar, GraduationCap, LayoutDashboard, Settings, ClipboardList } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, CommonModule],
  template: `
    <aside
      class="bg-base-100 sidebar-shell h-full border-r flex flex-col transition-all duration-300 ease-in-out text-base-content"
      [ngClass]="sidebarService.isCollapsed() ? 'w-20 border-base-200' : 'w-80 border-base-200'"
    >
      <!-- Logo -->
      <div class="h-20 flex items-center shrink-0 px-4">
        <a
          routerLink="/"
          aria-label="Accueil"
          class="flex items-center rounded-xl transition-colors hover:bg-base-200"
          [ngClass]="sidebarService.isCollapsed() ? 'justify-center w-full p-2' : 'gap-3 px-3 py-2'"
        >
          <div class="p-1.5 bg-primary/10 rounded-xl shrink-0 border border-primary/20">
            <lucide-angular [img]="gradIcon" class="size-6 text-primary block"></lucide-angular>
          </div>
          <span
            class="overflow-hidden whitespace-nowrap text-2xl font-black tracking-tighter transition-all duration-300 text-base-content"
            [ngClass]="sidebarService.isCollapsed() ? 'max-w-0 opacity-0' : 'max-w-48 opacity-100'"
          >
            Alumni<span class="text-primary">Connect</span>
          </span>
        </a>
      </div>

      <!-- Nav -->
      <nav class="flex-1 space-y-1 py-4 overflow-y-auto">

        <!-- Section label -->
        <div
          class="overflow-hidden whitespace-nowrap text-xs font-semibold text-base-content/40 uppercase tracking-wider transition-all duration-200"
          [ngClass]="sidebarService.isCollapsed() ? 'max-h-0 opacity-0 px-4 py-0' : 'max-h-10 opacity-100 px-8 py-2'"
        >
          Menu
        </div>

        <!-- Annuaire -->
        <div [ngClass]="sidebarService.isCollapsed() ? 'px-2' : 'px-4'">
          <a
            routerLink="/alumni"
            routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/10"
            title="Annuaire"
            aria-label="Annuaire"
            class="flex items-center py-3 rounded-xl hover:bg-base-200 transition-colors text-base-content/80"
            [ngClass]="sidebarService.isCollapsed() ? 'justify-center px-3 gap-0' : 'gap-3 px-4'"
          >
            <lucide-angular [img]="gradIcon" class="size-5 shrink-0 block"></lucide-angular>
            <span
              class="overflow-hidden whitespace-nowrap transition-all duration-200"
              [ngClass]="sidebarService.isCollapsed() ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'"
            >Annuaire</span>
          </a>
        </div>

        <!-- Emplois -->
        <div [ngClass]="sidebarService.isCollapsed() ? 'px-2' : 'px-4'">
          <a
            routerLink="/jobs"
            routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/10"
            title="Emplois"
            aria-label="Emplois"
            class="flex items-center py-3 rounded-xl hover:bg-base-200 transition-colors text-base-content/80"
            [ngClass]="sidebarService.isCollapsed() ? 'justify-center px-3 gap-0' : 'gap-3 px-4'"
          >
            <lucide-angular [img]="jobIcon" class="size-5 shrink-0 block"></lucide-angular>
            <span
              class="overflow-hidden whitespace-nowrap transition-all duration-200"
              [ngClass]="sidebarService.isCollapsed() ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'"
            >Emplois</span>
          </a>
        </div>

        <!-- Mes Candidatures (Member Only) -->
        @if (authService.isMember()) {
          <div [ngClass]="sidebarService.isCollapsed() ? 'px-2' : 'px-4'">
            <a
              routerLink="/jobs/my-applications"
              routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/10"
              title="Mes Candidatures"
              aria-label="Mes Candidatures"
              class="flex items-center py-3 rounded-xl hover:bg-base-200 transition-colors text-base-content/80"
              [ngClass]="sidebarService.isCollapsed() ? 'justify-center px-3 gap-0' : 'gap-3 px-4'"
            >
              <lucide-angular [img]="clipboardIcon" class="size-5 shrink-0 block"></lucide-angular>
              <span
                class="overflow-hidden whitespace-nowrap transition-all duration-200"
                [ngClass]="sidebarService.isCollapsed() ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'"
              >Mes Candidatures</span>
            </a>
          </div>
        }

        <!-- Événements -->
        <div [ngClass]="sidebarService.isCollapsed() ? 'px-2' : 'px-4'">
          <a
            routerLink="/events"
            routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/10"
            title="Événements"
            aria-label="Événements"
            class="flex items-center py-3 rounded-xl hover:bg-base-200 transition-colors text-base-content/80"
            [ngClass]="sidebarService.isCollapsed() ? 'justify-center px-3 gap-0' : 'gap-3 px-4'"
          >
            <lucide-angular [img]="calendarIcon" class="size-5 shrink-0 block"></lucide-angular>
            <span
              class="overflow-hidden whitespace-nowrap transition-all duration-200"
              [ngClass]="sidebarService.isCollapsed() ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'"
            >Événements</span>
          </a>
        </div>

        @if (authService.isAdmin()) {
          <div class="divider mx-4 opacity-30 before:bg-base-content after:bg-base-content"></div>

          <!-- Admin -->
          <div [ngClass]="sidebarService.isCollapsed() ? 'px-2' : 'px-4'">
            <a
              routerLink="/admin"
              routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/10"
              title="Tableau de bord"
              aria-label="Tableau de bord"
              class="flex items-center py-3 rounded-xl hover:bg-base-200 transition-colors text-base-content/80"
              [ngClass]="sidebarService.isCollapsed() ? 'justify-center px-3 gap-0' : 'gap-3 px-4'"
            >
              <lucide-angular [img]="dashboardIcon" class="size-5 shrink-0 block"></lucide-angular>
              <span
                class="overflow-hidden whitespace-nowrap transition-all duration-200"
                [ngClass]="sidebarService.isCollapsed() ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'"
              >Tableau de bord</span>
            </a>
          </div>
        }

        @if (authService.isAuthenticated()) {
          <div class="divider mx-4 opacity-30 before:bg-base-content after:bg-base-content"></div>

          <!-- Profil nav -->
          <div [ngClass]="sidebarService.isCollapsed() ? 'px-2' : 'px-4'">
            <a
              routerLink="/profile"
              routerLinkActive="bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/10"
              title="Mon Profil"
              aria-label="Mon Profil"
              class="flex items-center py-3 rounded-xl hover:bg-base-200 transition-colors text-base-content/80"
              [ngClass]="sidebarService.isCollapsed() ? 'justify-center px-3 gap-0' : 'gap-3 px-4'"
            >
              <lucide-angular [img]="userIcon" class="size-5 shrink-0 block"></lucide-angular>
              <span
                class="overflow-hidden whitespace-nowrap transition-all duration-200"
                [ngClass]="sidebarService.isCollapsed() ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'"
              >Mon Profil</span>
            </a>
          </div>
        }
      </nav>

      <!-- Footer utilisateur -->
      <div class="shrink-0 border-t border-base-200 bg-base-200/30">
        <a
          [routerLink]="authService.isAuthenticated() ? '/profile' : '/login'"
          [attr.aria-label]="authService.isAuthenticated() ? 'Mon Profil' : 'Connexion'"
          [attr.title]="authService.isAuthenticated() ? 'Mon Profil' : 'Connexion'"
          class="flex items-center transition-colors hover:bg-base-200"
          [ngClass]="sidebarService.isCollapsed() ? 'justify-center p-4 gap-0' : 'gap-3 px-6 py-4'"
        >
          <div class="size-9 rounded-full bg-base-200 flex items-center justify-center shrink-0 border border-base-200">
            <lucide-angular [img]="userIcon" class="size-5 text-base-content block"></lucide-angular>
          </div>
          <div
            class="overflow-hidden transition-all duration-300"
            [ngClass]="sidebarService.isCollapsed() ? 'max-w-0 opacity-0' : 'max-w-48 opacity-100'"
          >
            <p class="text-sm font-bold truncate text-base-content">
              {{ authService.isAuthenticated() ? 'Connecté' : 'Bienvenue' }}
            </p>
            <p class="text-xs text-base-content/60 truncate">Réseau Alumni</p>
          </div>
        </a>
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
  readonly clipboardIcon = ClipboardList;
}
