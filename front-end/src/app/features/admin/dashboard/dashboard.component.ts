import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AlumniService } from '../../../core/services/alumni.service';
import { PromotionService } from '../../../core/services/promotion.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Profile } from '../../../core/models/profile.model';
import { LucideAngularModule, CheckCircle, Clock, Search, GraduationCap, ChevronLeft, ChevronRight, Users, UserPlus } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <header
        class="col-span-full bg-base-100 p-8 rounded-[var(--radius-card)] border border-base-200 shadow-[var(--shadow-card)] flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden"
      >
        <div class="relative z-10">
          <h1 class="text-4xl font-black text-primary tracking-tighter leading-none">
            Tableau de bord <span class="text-base-content/30">Admin</span>
          </h1>
          <p class="text-base-content/50 font-medium mt-3">
            Administration des alumnis, des promotions et des utilisateurs.
          </p>
        </div>

        <!-- Abstract background pattern -->
        <div
          class="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
        ></div>
        <div
          class="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-secondary/5 blur-3xl"
        ></div>
      </header>

      <!-- Stat Card 1 -->
      <div
        class="stats shadow-[var(--shadow-card)] bg-base-100 border border-base-200 rounded-[var(--radius-card)] overflow-hidden"
      >
        <div class="stat p-6">
          <div class="stat-figure text-primary bg-primary/10 p-3 rounded-xl">
            <lucide-angular [img]="checkIcon" class="size-6"></lucide-angular>
          </div>
          <div class="stat-title text-base-content/60 font-bold text-xs uppercase tracking-wider">
            Alumni Vérifiés
          </div>
          <div class="stat-value text-primary font-black text-4xl mt-1">842</div>
          <div class="stat-desc font-medium text-success mt-2 flex items-center gap-1">
            <span class="inline-block size-1.5 rounded-full bg-success"></span>
            21% de plus que le mois dernier
          </div>
        </div>
      </div>

      <!-- Stat Card 2 -->
      <div
        class="stats shadow-[var(--shadow-card)] bg-base-100 border border-base-200 rounded-[var(--radius-card)] overflow-hidden"
      >
        <div class="stat p-6">
          <div class="stat-figure text-warning bg-warning/10 p-3 rounded-xl">
            <lucide-angular [img]="clockIcon" class="size-6"></lucide-angular>
          </div>
          <div class="stat-title text-base-content/60 font-bold text-xs uppercase tracking-wider">
            En attente de validation
          </div>
          <div class="stat-value text-warning font-black text-4xl mt-1">{{ pendingCount() }}</div>
          <div class="stat-desc font-medium text-warning mt-2">En attente d'examen</div>
        </div>
      </div>

      <!-- Stat Card 3: Promotions -->
      <div
        class="stats shadow-[var(--shadow-card)] bg-base-100 border border-base-200 rounded-[var(--radius-card)] overflow-hidden"
      >
        <div class="stat p-6">
          <div class="stat-figure text-secondary bg-secondary/10 p-3 rounded-xl">
            <lucide-angular [img]="gradIcon" class="size-6"></lucide-angular>
          </div>
          <div class="stat-title text-base-content/60 font-bold text-xs uppercase tracking-wider">
            Promotions
          </div>
          <div class="stat-value text-secondary font-black text-4xl mt-1">{{ totalPromotions() }}</div>
          <div class="stat-desc font-medium text-secondary mt-2">Cohortes actives</div>
        </div>
      </div>

      <!-- Action Card -->
      <div
        class="col-span-1 card bg-secondary/10 border border-secondary/20 rounded-[var(--radius-card)] overflow-hidden relative"
      >
        <div class="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <lucide-angular [img]="checkIcon" class="size-32 -mb-8 -mr-8 rotate-12"></lucide-angular>
        </div>
        <div class="card-body p-6">
          <h3 class="font-black text-secondary-content text-lg">Actions Rapides</h3>
          <div class="flex flex-wrap gap-2 mt-2">
            <button (click)="navigateToPromotions()" class="btn btn-sm btn-secondary font-bold shadow-sm">
              Gérer les Promotions
            </button>
            @if (authService.isSuperAdmin()) {
              <button (click)="navigateToUsers()" class="btn btn-sm btn-outline font-bold">
                <lucide-angular [img]="usersIcon" class="size-4 mr-2"></lucide-angular>
                Gestion des Accès
              </button>
              <button (click)="navigateToInviteAdmin()" class="btn btn-sm btn-primary font-bold shadow-sm">
                <lucide-angular [img]="userPlusIcon" class="size-4 mr-2"></lucide-angular>
                Inviter un Admin
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Validation Queue Table -->
      <section
        class="col-span-full card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)] overflow-hidden"
      >
        <div class="card-body p-0">
          <div
            class="p-6 border-b border-base-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-100/50"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary/10 rounded-lg text-primary">
                <lucide-angular [img]="clockIcon" class="size-5"></lucide-angular>
              </div>
              <h2 class="card-title font-black tracking-tight">File d'attente de validation</h2>
            </div>

            <div
              class="input input-bordered input-sm flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 focus-within:w-64 transition-all duration-300"
            >
              <lucide-angular [img]="searchIcon" class="size-4 opacity-40"></lucide-angular>
              <input
                type="text"
                placeholder="Rechercher des profils en attente..."
                class="grow font-medium placeholder:text-base-content/30"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr
                  class="bg-base-200/30 text-xs uppercase text-base-content/50 font-bold tracking-wider"
                >
                  <th class="py-4 pl-6">Candidat</th>
                  <th>Promotion</th>
                  <th>Diplôme</th>
                  <th>Source</th>
                  <th class="pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (profile of paginatedPendingProfiles(); track profile.id) {
                  <tr class="group hover:bg-base-200/50 transition-colors">
                    <td class="pl-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="avatar placeholder">
                          <div class="bg-neutral text-neutral-content rounded-xl w-10">
                            <span class="text-xs font-black"
                              >{{ profile.user.first_name[0] }}{{ profile.user.last_name[0] }}</span
                            >
                          </div>
                        </div>
                        <div>
                          <div
                            class="font-bold text-base-content group-hover:text-primary transition-colors"
                          >
                            {{ profile.user.first_name }} {{ profile.user.last_name }}
                          </div>
                          <div class="text-xs text-base-content/50 font-medium">
                            {{ profile.user.email }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="font-bold text-base-content/70">{{ profile.graduation_year }}</td>
                    <td>
                      <span
                        class="badge badge-ghost badge-sm font-bold bg-base-200 border-base-300 text-base-content/70"
                        >{{ profile.degree }}</span
                      >
                    </td>
                    <td>
                      <span
                        class="badge badge-outline badge-info badge-sm font-bold gap-1 pl-1 pr-2"
                        ><div class="size-1.5 rounded-full bg-info"></div>
                        LinkedIn</span
                      >
                    </td>
                    <th class="pr-6 text-right">
                      <div class="flex gap-2 justify-end">
                        <button (click)="viewDetails(profile.id)" class="btn btn-ghost btn-xs font-bold hover:bg-base-200">
                          Détails
                        </button>
                        <button
                          class="btn btn-success btn-xs gap-1 font-bold shadow-sm shadow-success/20"
                          (click)="validateProfile(profile.id)"
                        >
                          <lucide-angular [img]="checkIcon" class="size-3"></lucide-angular>
                          Valider
                        </button>
                      </div>
                    </th>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center py-20">
                      <div class="flex flex-col items-center justify-center gap-4">
                        <div
                          class="size-16 rounded-full bg-success/10 flex items-center justify-center text-success"
                        >
                          <lucide-angular [img]="checkIcon" class="size-8"></lucide-angular>
                        </div>
                        <div>
                          <p class="font-black text-lg text-base-content/80">Tout est à jour !</p>
                          <p class="text-sm text-base-content/50 font-medium">
                            Aucun profil en attente de validation.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (pendingProfiles().length > 0) {
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-base-200 bg-base-100">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Afficher</span>
                <select
                  [value]="limit()"
                  (change)="onLimitChange($event)"
                  class="select select-xs bg-base-200/50 border-base-200 text-base-content rounded-lg"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </select>
                <span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">par page</span>
              </div>

              <div class="join">
                <button
                  [disabled]="page() === 1"
                  (click)="onPageChange(page() - 1)"
                  class="join-item btn btn-sm bg-base-200/50 border-base-200 text-base-content hover:bg-base-200/50"
                >
                  <lucide-angular [img]="prevIcon" class="size-4"></lucide-angular>
                </button>
                <button class="join-item btn btn-sm bg-primary/10 border-base-200 text-primary hover:bg-primary/20 font-black">
                  Page {{ page() }} sur {{ totalPages() }}
                </button>
                <button
                  [disabled]="page() >= totalPages()"
                  (click)="onPageChange(page() + 1)"
                  class="join-item btn btn-sm bg-base-200/50 border-base-200 text-base-content hover:bg-base-200/50"
                >
                  <lucide-angular [img]="nextIcon" class="size-4"></lucide-angular>
                </button>
              </div>

              <div class="text-xs font-bold text-base-content/40 uppercase tracking-widest">
                {{ pendingCount() }} résultats au total
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class DashboardComponent {
  private alumniService = inject(AlumniService);
  private promotionService = inject(PromotionService);
  private router = inject(Router);
  public authService = inject(AuthService);

  pendingProfiles = signal<Profile[]>([]);
  pendingCount = signal(0);
  page = signal(1);
  limit = signal(10);
  
  promotions = toSignal(this.promotionService.getPromotions(), { initialValue: [] });
  totalPromotions = computed(() => this.promotions().length);
  totalPages = computed(() => Math.ceil(this.pendingProfiles().length / this.limit()) || 1);
  paginatedPendingProfiles = computed(() => {
    const start = (this.page() - 1) * this.limit();
    const end = start + this.limit();
    return this.pendingProfiles().slice(start, end);
  });

  readonly checkIcon = CheckCircle;
  readonly clockIcon = Clock;
  readonly searchIcon = Search;
  readonly gradIcon = GraduationCap;
  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;
  readonly usersIcon = Users;
  readonly userPlusIcon = UserPlus;

  constructor() {
    this.loadData();
  }

  navigateToPromotions() {
    this.router.navigate(['/admin/promotions']);
  }

  navigateToUsers() {
    this.router.navigate(['/admin/users']);
  }

  navigateToInviteAdmin() {
    this.router.navigate(['/admin/users'], { queryParams: { invite: 'true' } });
  }

  viewDetails(id: number) {
    this.router.navigate(['/alumni', id]);
  }

  loadData() {
    this.alumniService.getPendingProfiles().subscribe(profiles => {
      this.pendingProfiles.set(profiles);
      this.page.set(1);
    });
    this.alumniService.getPendingCount().subscribe(res => {
      this.pendingCount.set(res.count);
    });
  }

  validateProfile(id: number) {
    this.alumniService.validateProfile(id).subscribe({
      next: () => {
        this.pendingProfiles.update((p) => p.filter((x) => x.id !== id));
        this.pendingCount.update(c => c - 1);
        if (this.page() > this.totalPages()) {
          this.page.set(this.totalPages());
        }
      },
      error: () => {
        // Handle error
      },
    });
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
  }

  onLimitChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.limit.set(value);
    this.page.set(1);
  }
}
