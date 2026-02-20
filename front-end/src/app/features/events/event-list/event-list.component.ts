import { Component, signal } from '@angular/core';
import { LucideAngularModule, Calendar, MapPin, ExternalLink } from 'lucide-angular';
import { AlumniEvent } from '../../../core/models/business.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <header class="col-span-full glass p-8 rounded-[var(--radius-card)] border border-white/20 shadow-[var(--shadow-card)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-white">
        <div>
          <h1 class="text-4xl font-black text-white tracking-tighter leading-none">Événements <span class="text-white/40">Communauté</span></h1>
          <p class="text-white/60 font-medium mt-3">Networking, ateliers et vie de l'école.</p>
        </div>
        <div class="flex gap-2">
           <button class="btn btn-ghost font-bold rounded-xl border-white/20 text-white hover:bg-white/10">Événements passés</button>
           <button class="btn btn-primary px-8 font-bold shadow-lg shadow-primary/20 rounded-xl border-none text-primary-content">Proposer un événement</button>
        </div>
      </header>

      @for (event of events(); track event.id) {
        <div class="group card glass shadow-[var(--shadow-card)] border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 rounded-[var(--radius-card)] overflow-hidden">
          <figure class="bg-white/5 h-48 flex items-center justify-center border-b border-white/10 relative overflow-hidden group-hover:bg-white/10 transition-colors">
             <lucide-angular [img]="calendarIcon" class="size-20 text-white opacity-10 group-hover:scale-110 transition-transform duration-500"></lucide-angular>
             <div class="absolute top-4 right-4">
                <div class="badge glass-solid border-none text-white font-black text-[10px] px-3 py-3 shadow-sm bg-black/20">{{ event.is_online ? 'EN LIGNE' : 'PRÉSENTIEL' }}</div>
             </div>
          </figure>
          
          <div class="card-body p-7">
            <h2 class="card-title text-2xl font-black tracking-tight leading-tight text-white group-hover:text-primary transition-colors">{{ event.title }}</h2>
            <p class="text-sm font-medium text-white/70 mt-3 line-clamp-2 leading-relaxed">{{ event.description }}</p>
            
            <div class="flex flex-col gap-3 mt-6 pt-6 border-t border-white/10">
              <div class="flex items-center gap-3 text-sm font-bold text-white/80">
                <div class="size-8 rounded-lg bg-white/10 flex items-center justify-center text-white/90">
                   <lucide-angular [img]="calendarIcon" class="size-4"></lucide-angular>
                </div>
                {{ event.date }}
              </div>
              <div class="flex items-center gap-3 text-sm font-bold text-white/80">
                <div class="size-8 rounded-lg bg-white/10 flex items-center justify-center text-white/90">
                   <lucide-angular [img]="locationIcon" class="size-4"></lucide-angular>
                </div>
                {{ event.location }}
              </div>
            </div>

            <div class="card-actions mt-8">
              <button class="btn btn-primary btn-block font-black shadow-lg shadow-primary/10 rounded-xl h-12 border-none text-primary-content">S'inscrire</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class EventListComponent {
  readonly calendarIcon = Calendar;
  readonly locationIcon = MapPin;
  readonly externalIcon = ExternalLink;

  events = signal<AlumniEvent[]>([
    {
      id: 1,
      title: 'Soirée de Gala Annuelle 2026',
      description: 'L\'événement networking le plus attendu de l\'année pour toutes les promotions.',
      date: '15 Juin 2026 - 19:00',
      location: 'Grand Palais, Paris',
      is_online: false,
      organizer: 'BDE / Association des Alumni'
    },
    {
      id: 2,
      title: 'L\'IA en 2026 : Atelier',
      description: 'Atelier pratique sur l\'IA agentique et l\'orchestration de LLM.',
      date: '22 Mars 2026 - 14:00',
      location: 'Zoom / Campus Paris',
      is_online: true,
      organizer: 'School Tech Hub'
    }
  ]);
}
