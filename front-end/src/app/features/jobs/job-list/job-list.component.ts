import { Component, signal } from '@angular/core';
import { LucideAngularModule, Briefcase, MapPin, Clock } from 'lucide-angular';
import { JobOffer } from '../../../core/models/business.model';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col gap-8">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-primary">Job Board</h1>
          <p class="text-base-content/60">Exclusive opportunities for our alumni network.</p>
        </div>
        <button class="btn btn-primary btn-sm md:btn-md">Post a Job</button>
      </header>

      <div class="grid grid-cols-1 gap-4">
        @for (job of jobs(); track job.id) {
          <div class="card bg-base-100 shadow-sm border border-base-200 hover:border-primary/30 transition-colors">
            <div class="card-body md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex gap-4">
                <div class="bg-primary/10 p-4 rounded-2xl h-fit">
                   <lucide-angular [img]="jobIcon" class="w-6 h-6 text-primary"></lucide-angular>
                </div>
                <div>
                  <h3 class="text-xl font-bold">{{ job.title }}</h3>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60 mt-1">
                    <span class="flex items-center gap-1 font-semibold text-base-content">
                      {{ job.company }}
                    </span>
                    <span class="flex items-center gap-1">
                      <lucide-angular [img]="locationIcon" class="w-3 h-3"></lucide-angular>
                      {{ job.location }}
                    </span>
                    <span class="flex items-center gap-1">
                      <lucide-angular [img]="clockIcon" class="w-3 h-3"></lucide-angular>
                      {{ job.type }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 w-full md:w-auto">
                <button class="btn btn-ghost btn-sm flex-1 md:flex-none">Details</button>
                <button class="btn btn-primary btn-sm flex-1 md:flex-none">Apply Now</button>
              </div>
            </div>
          </div>
        } @empty {
           <div class="text-center py-20 bg-base-100 rounded-3xl border-2 border-dashed border-base-300">
             <p class="text-base-content/50 italic">No job offers available at the moment.</p>
           </div>
        }
      </div>
    </div>
  `
})
export class JobListComponent {
  readonly jobIcon = Briefcase;
  readonly locationIcon = MapPin;
  readonly clockIcon = Clock;

  jobs = signal<JobOffer[]>([
    {
      id: 1,
      title: 'Senior Frontend Engineer (Angular)',
      company: 'Tech Solutions SAS',
      location: 'Paris, France (Remote)',
      type: 'CDI',
      description: 'Looking for an experienced Angular developer...',
      posted_by_id: 1,
      posted_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Data Scientist Junior',
      company: 'DataViz Startup',
      location: 'Lyon, France',
      type: 'CDI',
      description: 'Join our data team...',
      posted_by_id: 2,
      posted_at: new Date().toISOString()
    }
  ]);
}
