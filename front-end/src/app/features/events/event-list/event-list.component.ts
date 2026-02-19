import { Component, signal } from '@angular/core';
import { LucideAngularModule, Calendar, MapPin, ExternalLink } from 'lucide-angular';
import { AlumniEvent } from '../../../core/models/business.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <header class="col-span-full bg-base-100 p-8 rounded-[var(--radius-card)] border border-base-200 shadow-[var(--shadow-card)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 class="text-4xl font-black text-primary tracking-tighter leading-none">Community <span class="text-base-content/30">Events</span></h1>
          <p class="text-base-content/50 font-medium mt-3">Networking, workshops, and school life.</p>
        </div>
        <div class="flex gap-2">
           <button class="btn btn-ghost font-bold rounded-xl border-base-200">Past Events</button>
           <button class="btn btn-primary px-8 font-bold shadow-lg shadow-primary/20 rounded-xl">Propose Event</button>
        </div>
      </header>

      @for (event of events(); track event.id) {
        <div class="group card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 hover:border-primary/30 transition-all duration-300 rounded-[var(--radius-card)] overflow-hidden">
          <figure class="bg-primary/5 h-48 flex items-center justify-center border-b border-base-100 relative overflow-hidden group-hover:bg-primary/10 transition-colors">
             <lucide-angular [img]="calendarIcon" class="size-20 text-primary opacity-10 group-hover:scale-110 transition-transform duration-500"></lucide-angular>
             <div class="absolute top-4 right-4">
                <div class="badge bg-white/80 backdrop-blur-md border-none text-primary font-black text-[10px] px-3 py-3 shadow-sm">{{ event.is_online ? 'ONLINE' : 'IN-PERSON' }}</div>
             </div>
          </figure>
          
          <div class="card-body p-7">
            <h2 class="card-title text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{{ event.title }}</h2>
            <p class="text-sm font-medium text-base-content/60 mt-3 line-clamp-2 leading-relaxed">{{ event.description }}</p>
            
            <div class="flex flex-col gap-3 mt-6 pt-6 border-t border-base-100">
              <div class="flex items-center gap-3 text-sm font-bold text-base-content/80">
                <div class="size-8 rounded-lg bg-base-200 flex items-center justify-center text-primary/70">
                   <lucide-angular [img]="calendarIcon" class="size-4"></lucide-angular>
                </div>
                {{ event.date }}
              </div>
              <div class="flex items-center gap-3 text-sm font-bold text-base-content/80">
                <div class="size-8 rounded-lg bg-base-200 flex items-center justify-center text-primary/70">
                   <lucide-angular [img]="locationIcon" class="size-4"></lucide-angular>
                </div>
                {{ event.location }}
              </div>
            </div>

            <div class="card-actions mt-8">
              <button class="btn btn-primary btn-block font-black shadow-lg shadow-primary/10 rounded-xl h-12">Register Now</button>
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
      title: 'Annual Gala Night 2026',
      description: 'The most awaited networking event of the year for all alumni cohorts.',
      date: 'June 15, 2026 - 19:00',
      location: 'Grand Palais, Paris',
      is_online: false,
      organizer: 'BDE / Alumni Association'
    },
    {
      id: 2,
      title: 'AI in 2026: Workshop',
      description: 'Hands-on workshop on agentic AI and LLM orchestration.',
      date: 'March 22, 2026 - 14:00',
      location: 'Zoom / Campus Paris',
      is_online: true,
      organizer: 'School Tech Hub'
    }
  ]);
}
