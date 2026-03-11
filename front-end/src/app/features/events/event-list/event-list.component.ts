import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { LucideAngularModule, Calendar, MapPin, ExternalLink, CheckCircle, Filter, ChevronLeft, ChevronRight, Search, X } from 'lucide-angular';
import { AlumniEvent } from '../../../core/models/business.model';
import { AuthService } from '../../../core/auth/auth.service';
import { EventService, EventFilters } from '../../../core/services/event.service';
import { DatePipe, CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { EventCreateComponent } from './event-create.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [LucideAngularModule, DatePipe, EventCreateComponent, FormsModule, CommonModule, RouterLink],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-4 md:gap-6">
      <header class="col-span-full bg-base-100 p-4 md:p-8 rounded-[var(--radius-card)] border border-base-200 shadow-[var(--shadow-card)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-base-content relative overflow-hidden">
        <div class="relative z-10 min-w-0">
          <h1 class="text-3xl md:text-4xl font-black text-base-content tracking-tighter leading-none">Événements <span class="text-base-content/40">Communauté</span></h1>
          <p class="text-base-content/60 font-medium mt-3">Networking, ateliers et vie de l'école.</p>
          
          <button 
            (click)="toggleFilters()" 
            class="btn btn-ghost border-base-200 text-base-content font-bold rounded-xl lg:hidden mt-6"
          >
            <lucide-angular [img]="filterIcon" class="size-4 mr-2"></lucide-angular>
            {{ showMobileFilters() ? 'Masquer les filtres' : 'Afficher les filtres' }}
          </button>
        </div>
        <div class="flex w-full md:w-auto flex-col sm:flex-row flex-wrap gap-2 relative z-10">
           @if (isMember()) {
             <button routerLink="/events/my-events" class="btn btn-ghost w-full sm:w-auto font-bold rounded-xl border-base-200 text-base-content hover:bg-base-200/50">Mes inscriptions</button>
           }
           @if (isAdmin()) {
             <button (click)="showCreateModal.set(true)" class="btn btn-primary w-full sm:w-auto px-8 font-bold shadow-lg shadow-primary/20 rounded-xl border-none text-primary-content">Proposer un événement</button>
           }
        </div>
      </header>

      @if (showMobileFilters() && !isLargeScreen()) {
        <div class="fixed inset-0 z-40 bg-base-content/40 backdrop-blur-sm lg:hidden" (click)="toggleFilters()"></div>
        <aside class="fixed inset-x-4 top-20 bottom-4 z-50 overflow-y-auto rounded-[var(--radius-card)] lg:hidden">
          <section class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)]">
            <div class="card-body p-5">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xs font-black uppercase tracking-widest text-base-content/40 flex items-center gap-2">
                  <lucide-angular [img]="filterIcon" class="size-3"></lucide-angular>
                  Recherche & Filtres
                </h2>
                <button (click)="toggleFilters()" class="btn btn-ghost btn-xs">
                  <lucide-angular [img]="closeIcon" class="size-4"></lucide-angular>
                </button>
              </div>

              <div class="flex flex-col gap-5">
                <fieldset class="fieldset p-0">
                  <legend class="fieldset-legend font-bold text-sm text-base-content/80">Nom de l'événement</legend>
                  <div class="relative">
                    <lucide-angular [img]="searchIcon" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40"></lucide-angular>
                    <input type="text" [(ngModel)]="filters().title" (ngModelChange)="onFilterChange()" 
                      placeholder="Rechercher..."
                      class="input glass border-base-200 w-full h-12 pl-10 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content" />
                  </div>
                </fieldset>

                <fieldset class="fieldset p-0">
                  <legend class="fieldset-legend font-bold text-sm text-base-content/80">Format</legend>
                  <select [(ngModel)]="filters().is_online" (ngModelChange)="onFilterChange()" 
                    class="select glass border-base-200 w-full h-12 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content">
                    <option [ngValue]="undefined">Peu importe</option>
                    <option [ngValue]="true">En ligne</option>
                    <option [ngValue]="false">Présentiel</option>
                  </select>
                </fieldset>

                <fieldset class="fieldset p-0">
                  <legend class="fieldset-legend font-bold text-sm text-base-content/80">À partir du</legend>
                  <input type="date" [(ngModel)]="filters().date_from" (ngModelChange)="onFilterChange()" 
                    class="input glass border-base-200 w-full h-12 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content" />
                </fieldset>

                <div class="divider opacity-10 my-0 before:bg-base-content after:bg-base-content"></div>

                <button (click)="resetFilters()" class="btn btn-primary h-12 font-bold shadow-lg shadow-primary/20 border-none text-primary-content">
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </section>
        </aside>
      }

      <aside class="col-span-full hidden lg:col-span-2 lg:flex lg:flex-col lg:gap-6">
        <section class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)]">
          <div class="card-body p-6">
            <div class="flex justify-between items-center mb-4 lg:mb-0">
              <h2 class="text-xs font-black uppercase tracking-widest text-base-content/40 flex items-center gap-2">
                <lucide-angular [img]="filterIcon" class="size-3"></lucide-angular>
                Recherche & Filtres
              </h2>
            </div>

            <div class="flex flex-col gap-5">
              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-base-content/80">Nom de l'événement</legend>
                <div class="relative">
                  <lucide-angular [img]="searchIcon" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40"></lucide-angular>
                  <input type="text" [(ngModel)]="filters().title" (ngModelChange)="onFilterChange()" 
                    placeholder="Rechercher..."
                    class="input glass border-base-200 w-full h-12 pl-10 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content" />
                </div>
              </fieldset>

              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-base-content/80">Format</legend>
                <select [(ngModel)]="filters().is_online" (ngModelChange)="onFilterChange()" 
                  class="select glass border-base-200 w-full h-12 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content">
                  <option [ngValue]="undefined">Peu importe</option>
                  <option [ngValue]="true">En ligne</option>
                  <option [ngValue]="false">Présentiel</option>
                </select>
              </fieldset>

              <fieldset class="fieldset p-0">
                <legend class="fieldset-legend font-bold text-sm text-base-content/80">À partir du</legend>
                <input type="date" [(ngModel)]="filters().date_from" (ngModelChange)="onFilterChange()" 
                  class="input glass border-base-200 w-full h-12 text-sm font-medium focus:ring-2 ring-primary/50 bg-base-200/50 text-base-content" />
              </fieldset>

              <div class="divider opacity-10 my-0 before:bg-base-content after:bg-base-content"></div>

              <button (click)="resetFilters()" class="btn btn-ghost btn-sm font-bold text-base-content/60 hover:text-primary">
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </section>
      </aside>

      <!-- Event List -->
      <main class="col-span-full min-w-0 lg:col-span-4 flex flex-col gap-4 md:gap-6">
        @if (isLoading()) {
          @for (i of [1,2,3]; track i) {
            <div class="skeleton h-48 w-full rounded-[var(--radius-card)] bg-base-100 border border-base-200"></div>
          }
        } @else {
          @for (event of events(); track event.id) {
            <div [routerLink]="['/events', event.id]" class="group card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 hover:border-primary/30 hover:bg-base-200/50 transition-all duration-300 rounded-[var(--radius-card)] overflow-hidden cursor-pointer">
              <div class="card-body p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-6">
                <div class="flex flex-col sm:flex-row gap-4 sm:gap-5 min-w-0">
                  <div class="relative flex size-16 items-center justify-center rounded-2xl border border-base-300 bg-base-200/50 group-hover:bg-primary/10 transition-colors">
                    <lucide-angular [img]="calendarIcon" class="size-8 text-primary/60 group-hover:text-primary"></lucide-angular>
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-xl font-black tracking-tight text-base-content group-hover:text-primary transition-colors">{{ event.title }}</h3>
                    <p class="text-sm font-medium text-base-content/60 mt-1 line-clamp-2 sm:line-clamp-1">{{ event.description }}</p>
                    
                    <div class="flex flex-wrap gap-4 mt-3">
                      <div class="flex items-center gap-2 text-xs font-bold text-base-content/70">
                        <lucide-angular [img]="calendarIcon" class="size-3"></lucide-angular>
                        {{ event.date | date:'medium' }}
                      </div>
                      <div class="flex items-center gap-2 text-xs font-bold text-base-content/70">
                        <lucide-angular [img]="locationIcon" class="size-3"></lucide-angular>
                        {{ event.location }}
                      </div>
                      <div class="badge badge-sm font-black text-[10px] px-2 py-2" [class]="event.is_online ? 'bg-primary/10 text-primary border-primary/20' : 'bg-accent/10 text-accent border-accent/20'">
                        {{ event.is_online ? 'EN LIGNE' : 'PRÉSENTIEL' }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="flex w-full md:w-auto flex-col items-start md:items-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-base-200">
                  @if (isMember()) {
                    @if (event.is_registered) {
                      <div class="flex items-center gap-2 text-success font-black text-xs uppercase tracking-widest">
                        <lucide-angular [img]="checkIcon" class="size-4"></lucide-angular>
                        Inscrit
                      </div>
                    }
                  }
                  <span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">{{ event.participants_count || 0 }} participant(s)</span>
                </div>
              </div>
            </div>
          } @empty {
            <div class="py-12 text-center bg-base-100 rounded-[var(--radius-card)] border border-dashed border-base-200">
               <p class="text-base-content/40 font-bold italic">Aucun événement ne correspond à vos critères.</p>
            </div>
          }

          <!-- Pagination -->
          @if (totalCount() > 0) {
            <div class="flex flex-col items-stretch sm:flex-row sm:items-center justify-between gap-4 mt-6 bg-base-100 p-4 rounded-2xl border border-base-200">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Afficher</span>
                <select [ngModel]="limit()" (ngModelChange)="onLimitChange($event)" class="select select-xs bg-base-200/50 border-base-200 text-base-content rounded-lg">
                  <option [value]="5">5</option>
                  <option [value]="10">10</option>
                  <option [value]="20">20</option>
                </select>
                <span class="text-xs font-bold text-base-content/40 uppercase tracking-widest">par page</span>
              </div>

              <div class="join self-center sm:self-auto">
                <button [disabled]="page() === 1" (click)="onPageChange(page() - 1)" class="join-item btn btn-sm bg-base-200/50 border-base-200 text-base-content">
                  <lucide-angular [img]="prevIcon" class="size-4"></lucide-angular>
                </button>
                <button class="join-item btn btn-sm bg-primary/10 border-base-200 text-primary font-black">
                  Page {{ page() }} sur {{ totalPages() }}
                </button>
                <button [disabled]="page() >= totalPages()" (click)="onPageChange(page() + 1)" class="join-item btn btn-sm bg-base-200/50 border-base-200 text-base-content">
                  <lucide-angular [img]="nextIcon" class="size-4"></lucide-angular>
                </button>
              </div>

              <div class="text-center sm:text-right text-xs font-bold text-base-content/40 uppercase tracking-widest">
                {{ totalCount() }} résultats
              </div>
            </div>
          }
        }
      </main>
    </div>

    @if (showCreateModal()) {
      <app-event-create 
        (close)="showCreateModal.set(false)" 
        (created)="onEventCreated()"
      ></app-event-create>
    }
  `
})
export class EventListComponent implements OnInit {
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private toastService = inject(ToastService);
  
  readonly calendarIcon = Calendar;
  readonly locationIcon = MapPin;
  readonly externalIcon = ExternalLink;
  readonly checkIcon = CheckCircle;
  readonly filterIcon = Filter;
  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;
  readonly searchIcon = Search;
  readonly closeIcon = X;

  isAdmin = this.authService.isAdmin;
  isMember = this.authService.isMember;

  events = signal<AlumniEvent[]>([]);
  isLoading = signal(true);
  showCreateModal = signal(false);
  showMobileFilters = signal(false);
  isLargeScreen = signal(window.innerWidth >= 1024);

  constructor() {
    window.addEventListener('resize', () => {
      this.isLargeScreen.set(window.innerWidth >= 1024);
    });
  }

  toggleFilters() {
    this.showMobileFilters.update(v => !v);
  }

  // Filters & Pagination State
  filters = signal<EventFilters>({
    title: '',
    is_online: undefined,
    date_from: ''
  });
  page = signal(1);
  limit = signal(10);
  totalCount = signal(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.limit()) || 1);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading.set(true);
    const params: EventFilters = {
      ...this.filters(),
      page: this.page(),
      limit: this.limit()
    };

    this.eventService.getEvents(params).subscribe({
      next: (response) => {
        this.events.set(response.results);
        this.totalCount.set(response.count);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.show('Erreur lors du chargement des événements', 'error');
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange() {
    this.page.set(1);
    this.loadEvents();
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.loadEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onLimitChange(newLimit: number) {
    this.limit.set(newLimit);
    this.page.set(1);
    this.loadEvents();
  }

  resetFilters() {
    this.filters.set({
      title: '',
      is_online: undefined,
      date_from: ''
    });
    this.onFilterChange();
  }

  onEventCreated() {
    this.showCreateModal.set(false);
    this.toastService.show('Événement créé avec succès !', 'success');
    this.loadEvents();
  }
}
