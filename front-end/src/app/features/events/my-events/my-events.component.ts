import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, CheckCircle, Clock } from 'lucide-angular';
import { EventService } from '../../../core/services/event.service';
import { AlumniEvent } from '../../../core/models/business.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DatePipe, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <header class="mb-12">
        <h1 class="text-4xl font-black text-base-content tracking-tighter">Mes <span class="text-primary">Participations</span></h1>
        <p class="text-base-content/60 font-medium mt-3">Retrouvez tous les événements auxquels vous êtes inscrit ou avez participé.</p>
      </header>

      <div class="grid grid-cols-1 gap-12">
        <!-- Upcoming Events -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div class="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <lucide-angular [img]="checkIcon" class="size-5"></lucide-angular>
            </div>
            <h2 class="text-2xl font-black tracking-tight text-base-content">Inscriptions à venir</h2>
          </div>

          @if (isLoading()) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (i of [1,2,3]; track i) {
                <div class="skeleton h-48 w-full rounded-[2rem]"></div>
              }
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (event of upcoming(); track event.id) {
                <div [routerLink]="['/events', event.id]" class="group card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 hover:border-primary/30 hover:bg-base-200/50 transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer">
                  <div class="card-body p-6">
                    <h3 class="text-xl font-black tracking-tight text-base-content group-hover:text-primary transition-colors">{{ event.title }}</h3>
                    <div class="flex flex-col gap-3 mt-4">
                      <div class="flex items-center gap-3 text-xs font-bold text-base-content/60">
                        <lucide-angular [img]="calendarIcon" class="size-4"></lucide-angular>
                        {{ event.date | date:'medium' }}
                      </div>
                      <div class="flex items-center gap-3 text-xs font-bold text-base-content/60">
                        <lucide-angular [img]="locationIcon" class="size-4"></lucide-angular>
                        {{ event.location }}
                      </div>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-12 text-center bg-base-200/50 rounded-[2rem] border border-dashed border-base-300">
                  <p class="text-base-content/40 font-bold italic">Aucune inscription en cours.</p>
                  <button routerLink="/events" class="btn btn-primary btn-sm mt-4 font-bold rounded-xl px-6">Découvrir les événements</button>
                </div>
              }
            </div>
          }
        </section>

        <!-- Past Events -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div class="size-10 rounded-xl bg-base-300 flex items-center justify-center text-base-content/60">
              <lucide-angular [img]="clockIcon" class="size-5"></lucide-angular>
            </div>
            <h2 class="text-2xl font-black tracking-tight text-base-content">Historique des événements</h2>
          </div>

          @if (!isLoading()) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
              @for (event of past(); track event.id) {
                <div [routerLink]="['/events', event.id]" class="card bg-base-200/50 border border-base-300 rounded-[2rem] overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <div class="card-body p-6">
                    <h3 class="text-xl font-bold tracking-tight text-base-content/60">{{ event.title }}</h3>
                    <div class="flex flex-col gap-2 mt-4">
                      <div class="flex items-center gap-2 text-xs font-medium text-base-content/40">
                        <lucide-angular [img]="calendarIcon" class="size-3"></lucide-angular>
                        {{ event.date | date:'medium' }}
                      </div>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-12 text-center bg-base-100 rounded-[2rem] border border-dashed border-base-200">
                  <p class="text-base-content/40 font-bold italic">Aucun événement passé.</p>
                </div>
              }
            </div>
          }
        </section>
      </div>
    </div>
  `
})
export class MyEventsComponent implements OnInit {
  private eventService = inject(EventService);
  private toastService = inject(ToastService);

  readonly calendarIcon = Calendar;
  readonly locationIcon = MapPin;
  readonly checkIcon = CheckCircle;
  readonly clockIcon = Clock;

  upcoming = signal<AlumniEvent[]>([]);
  past = signal<AlumniEvent[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadMyEvents();
  }

  loadMyEvents() {
    this.eventService.getMyEvents().subscribe({
      next: (data) => {
        this.upcoming.set(data.upcoming);
        this.past.set(data.past);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.show("Erreur lors du chargement de vos événements.", "error");
        this.isLoading.set(false);
      }
    });
  }
}
