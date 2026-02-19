import { Component, signal } from '@angular/core';
import { LucideAngularModule, Calendar, MapPin, ExternalLink } from 'lucide-angular';
import { AlumniEvent } from '../../../core/models/business.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col gap-8">
      <header>
        <h1 class="text-3xl font-bold text-primary">Community Events</h1>
        <p class="text-base-content/60">Networking, workshops, and school life.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (event of events(); track event.id) {
          <div class="card bg-base-100 shadow-xl border border-base-300">
            <figure class="bg-primary/5 h-40 flex items-center justify-center border-b border-base-200">
               <lucide-angular [img]="calendarIcon" class="w-16 h-16 text-primary opacity-20"></lucide-angular>
            </figure>
            <div class="card-body">
              <div class="flex justify-between items-start">
                <h2 class="card-title">{{ event.title }}</h2>
                <div class="badge badge-accent">{{ event.is_online ? 'Online' : 'In-person' }}</div>
              </div>
              <p class="text-sm text-base-content/70 mt-2 line-clamp-3">{{ event.description }}</p>
              
              <div class="flex flex-col gap-2 mt-4 text-sm font-semibold">
                <div class="flex items-center gap-2">
                  <lucide-angular [img]="calendarIcon" class="w-4 h-4 text-primary"></lucide-angular>
                  {{ event.date }}
                </div>
                <div class="flex items-center gap-2">
                  <lucide-angular [img]="locationIcon" class="w-4 h-4 text-primary"></lucide-angular>
                  {{ event.location }}
                </div>
              </div>

              <div class="card-actions justify-end mt-6">
                <button class="btn btn-primary btn-sm btn-block">Register</button>
              </div>
            </div>
          </div>
        }
      </div>
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
