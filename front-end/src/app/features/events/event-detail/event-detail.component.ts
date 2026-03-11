import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Users, ArrowLeft, Edit, Trash, CheckCircle } from 'lucide-angular';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AlumniEvent } from '../../../core/models/business.model';
import { EventCreateComponent } from '../event-list/event-create.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DatePipe, RouterLink, EventCreateComponent],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      <button routerLink="/events" class="btn btn-ghost gap-2 mb-8 font-bold text-base-content/60 hover:text-primary">
        <lucide-angular [img]="backIcon" class="size-4"></lucide-angular>
        Retour aux événements
      </button>

      @if (isLoading()) {
        <div class="skeleton h-96 w-full rounded-[var(--radius-card)]"></div>
      } @else if (event(); as e) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 flex flex-col gap-6">
            <section class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[2.5rem] overflow-hidden">
              <div class="h-48 bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10 flex items-center justify-center border-b border-base-200">
                <lucide-angular [img]="calendarIcon" class="size-20 text-primary/40"></lucide-angular>
              </div>
              <div class="card-body p-10">
                <div class="flex justify-between items-start mb-4">
                  <div class="badge badge-primary font-black px-4 py-3 shadow-sm">{{ e.is_online ? 'EN LIGNE' : 'PRÉSENTIEL' }}</div>
                  @if (isAdmin()) {
                    <div class="flex flex-wrap gap-2">
                      <button (click)="showEditModal.set(true)" class="btn btn-warning btn-sm font-bold gap-2 rounded-xl border-none">
                        <lucide-angular [img]="editIcon" class="size-4"></lucide-angular>
                        Modifier l'événement
                      </button>
                      <button (click)="deleteEvent()" class="btn btn-error btn-sm font-bold gap-2 rounded-xl border-none">
                        <lucide-angular [img]="deleteIcon" class="size-4"></lucide-angular>
                        Annuler l'événement
                      </button>
                    </div>
                  }
                </div>
                <h1 class="text-4xl font-black tracking-tighter text-base-content leading-tight mb-6">{{ e.title }}</h1>
                <p class="text-lg text-base-content/70 leading-relaxed font-medium whitespace-pre-line">{{ e.description }}</p>
                
                <div class="divider opacity-5 my-8"></div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="flex items-start gap-4">
                    <div class="size-12 rounded-2xl bg-base-200 flex items-center justify-center text-primary">
                      <lucide-angular [img]="calendarIcon" class="size-6"></lucide-angular>
                    </div>
                    <div>
                      <p class="text-xs font-black uppercase tracking-widest text-base-content/40 mb-1">Date & Heure</p>
                      <p class="font-bold text-base-content">{{ e.date | date:'fullDate' }}</p>
                      <p class="text-sm font-medium text-base-content/60">{{ e.date | date:'shortTime' }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4">
                    <div class="size-12 rounded-2xl bg-base-200 flex items-center justify-center text-primary">
                      <lucide-angular [img]="locationIcon" class="size-6"></lucide-angular>
                    </div>
                    <div>
                      <p class="text-xs font-black uppercase tracking-widest text-base-content/40 mb-1">Lieu</p>
                      <p class="font-bold text-base-content">{{ e.location }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <div class="flex flex-col gap-6">
            <section class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[2rem]">
              <div class="card-body p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <lucide-angular [img]="usersIcon" class="size-5"></lucide-angular>
                  </div>
                  <div>
                    <h3 class="font-black text-base-content leading-none">Participants</h3>
                    <p class="text-xs font-bold text-base-content/40 mt-1">{{ e.participants_count }} inscrit(s)</p>
                  </div>
                </div>

                <div class="divider opacity-5 my-4"></div>

                @if (isAdmin() && e.participants) {
                  <p class="text-xs font-bold text-base-content/40 mb-4 uppercase tracking-widest">Liste des participants</p>
                  <div class="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    @for (participant of e.participants; track participant.id) {
                      <div class="flex items-center gap-3 p-2 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors">
                        <div class="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {{ participant.first_name?.[0] || '?' }}{{ participant.last_name?.[0] || '' }}
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span class="text-xs font-black text-base-content truncate">{{ participant.full_name }}</span>
                          <span class="text-[10px] font-bold text-base-content/40 truncate">{{ participant.email }}</span>
                        </div>
                      </div>
                    } @empty {
                      <p class="text-xs font-bold italic text-base-content/30 text-center py-4">Aucun participant inscrit.</p>
                    }
                  </div>
                  <div class="divider opacity-5 my-4"></div>
                }

                <p class="text-xs font-bold text-base-content/40 mb-2 uppercase tracking-widest">Organisateur</p>
                <p class="font-black text-base-content mb-8">{{ e.organizer }}</p>

                @if (isMember()) {
                  @if (e.is_registered) {
                    <div class="flex flex-col gap-4">
                      <div class="alert alert-success bg-success/10 border-success/20 text-success text-sm font-bold rounded-2xl">
                        <lucide-angular [img]="checkIcon" class="size-4"></lucide-angular>
                        <span>Vous êtes inscrit !</span>
                      </div>
                      <button (click)="unregister()" class="btn btn-outline btn-error btn-block font-black rounded-2xl h-14">
                        Se désinscrire
                      </button>
                    </div>
                  } @else {
                    @if (isPastEvent()) {
                       <div class="alert alert-warning bg-warning/10 border-warning/20 text-warning text-sm font-bold rounded-2xl">
                        <span>Cet événement est passé.</span>
                      </div>
                    } @else {
                      <button (click)="register()" class="btn btn-primary btn-block font-black shadow-lg shadow-primary/20 border-none text-primary-content rounded-2xl h-14 text-lg">
                        S'inscrire
                      </button>
                    }
                  }
                }
              </div>
            </section>
          </div>
        </div>
      }

      @if (showEditModal()) {
        <app-event-create 
          [event]="event()"
          (close)="showEditModal.set(false)" 
          (created)="onEventUpdated()"
        ></app-event-create>
      }
    </div>
  `
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  readonly calendarIcon = Calendar;
  readonly locationIcon = MapPin;
  readonly usersIcon = Users;
  readonly backIcon = ArrowLeft;
  readonly editIcon = Edit;
  readonly deleteIcon = Trash;
  readonly checkIcon = CheckCircle;

  event = signal<AlumniEvent | null>(null);
  isLoading = signal(true);
  showEditModal = signal(false);

  isAdmin = this.authService.isAdmin;
  isMember = this.authService.isMember;

  ngOnInit() {
    this.loadEvent();
  }

  loadEvent() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEvent(Number(id)).subscribe({
        next: (event) => {
          this.event.set(event);
          this.isLoading.set(false);
        },
        error: () => {
          this.toastService.show("Impossible de charger l'événement.", 'error');
          this.router.navigate(['/events']);
        }
      });
    }
  }

  isPastEvent(): boolean {
    const e = this.event();
    if (!e) return false;
    return new Date(e.date) < new Date();
  }

  register() {
    const e = this.event();
    if (!e) return;
    this.eventService.registerForEvent(e.id).subscribe({
      next: () => {
        this.toastService.show('Inscription réussie !', 'success');
        this.loadEvent();
      },
      error: (err) => {
        this.toastService.show(err.error?.detail || "Erreur d'inscription", 'error');
      }
    });
  }

  unregister() {
    const e = this.event();
    if (!e) return;
    this.eventService.unregisterFromEvent(e.id).subscribe({
      next: () => {
        this.toastService.show('Désinscription réussie.', 'info');
        this.loadEvent();
      },
      error: () => {
        this.toastService.show("Erreur de désinscription", 'error');
      }
    });
  }

  deleteEvent() {
    const e = this.event();
    if (!e) return;
    
    if (confirm('Voulez-vous vraiment annuler cet événement ?')) {
      this.eventService.deleteEvent(e.id).subscribe({
        next: () => {
          this.toastService.show('Événement annulé.', 'success');
          this.router.navigate(['/events']);
        },
        error: (err) => {
          this.toastService.show(err.error?.detail || "Impossible de supprimer l'événement.", 'error');
        }
      });
    }
  }

  onEventUpdated() {
    this.showEditModal.set(false);
    this.toastService.show('Événement mis à jour !', 'success');
    this.loadEvent();
  }
}
