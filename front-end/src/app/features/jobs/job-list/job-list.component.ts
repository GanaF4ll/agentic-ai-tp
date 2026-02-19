import { Component, signal } from '@angular/core';
import { LucideAngularModule, Briefcase, MapPin, Clock } from 'lucide-angular';
import { JobOffer } from '../../../core/models/business.model';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <header class="col-span-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-base-100 p-8 rounded-[var(--radius-card)] border border-base-200 shadow-[var(--shadow-card)]">
        <div>
          <h1 class="text-4xl font-black text-primary tracking-tighter">Job Board</h1>
          <p class="text-base-content/50 font-medium mt-2">Exclusive opportunities for our alumni network.</p>
        </div>
        <button class="btn btn-primary px-8 font-bold shadow-lg shadow-primary/20">Post a Job</button>
      </header>

      <aside class="col-span-full lg:col-span-2 flex flex-col gap-6">
        <div class="card bg-accent/10 border border-accent/20 rounded-[var(--radius-card)] overflow-hidden">
          <div class="card-body p-6">
             <div class="size-10 rounded-xl bg-accent/20 flex items-center justify-center mb-4 text-accent-content">
               <lucide-angular [img]="jobIcon" class="size-5"></lucide-angular>
             </div>
             <h3 class="font-black text-accent-content leading-tight">Career Services</h3>
             <p class="text-sm text-accent-content/70 mt-2">Need help with your resume or interview prep? Our experts are here to help.</p>
             <button class="btn btn-accent btn-sm mt-4 font-bold">Book a session</button>
          </div>
        </div>

        <div class="card bg-base-100 border border-base-200 shadow-sm rounded-[var(--radius-card)] overflow-hidden">
           <div class="card-body p-6">
              <h4 class="text-xs font-black uppercase tracking-widest text-base-content/40 mb-4">Quick Filters</h4>
              <div class="flex flex-wrap gap-2">
                 <button class="badge badge-lg bg-base-200 border-none font-bold text-xs py-4 px-4 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">Full-time</button>
                 <button class="badge badge-lg bg-base-200 border-none font-bold text-xs py-4 px-4 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">Remote</button>
                 <button class="badge badge-lg bg-base-200 border-none font-bold text-xs py-4 px-4 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">Freelance</button>
              </div>
           </div>
        </div>
      </aside>

      <main class="col-span-full lg:col-span-4 flex flex-col gap-4">
        @for (job of jobs(); track job.id) {
          <div class="group card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 hover:border-primary/30 transition-all duration-300 rounded-[var(--radius-card)] overflow-hidden">
            <div class="card-body p-6 md:flex-row items-start md:items-center justify-between gap-6">
              <div class="flex gap-5">
                <div class="bg-primary/5 group-hover:bg-primary/10 p-4 rounded-2xl h-fit border border-primary/10 transition-colors">
                   <lucide-angular [img]="jobIcon" class="size-6 text-primary"></lucide-angular>
                </div>
                <div>
                  <h3 class="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{{ job.title }}</h3>
                  <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-base-content/40 mt-2 uppercase tracking-wide">
                    <span class="flex items-center gap-1.5 text-base-content font-black">
                      {{ job.company }}
                    </span>
                    <span class="flex items-center gap-1.5">
                      <lucide-angular [img]="locationIcon" class="size-3"></lucide-angular>
                      {{ job.location }}
                    </span>
                    <span class="flex items-center gap-1.5 bg-base-200/50 px-2 py-0.5 rounded-md">
                      <lucide-angular [img]="clockIcon" class="size-3"></lucide-angular>
                      {{ job.type }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-base-100">
                <button class="btn btn-ghost btn-sm font-bold flex-1 md:flex-none px-6">Details</button>
                <button class="btn btn-primary btn-sm font-bold flex-1 md:flex-none px-6 shadow-md shadow-primary/10">Apply</button>
              </div>
            </div>
          </div>
        } @empty {
           <div class="flex flex-col items-center justify-center py-20 bg-base-100 rounded-[var(--radius-card)] border-2 border-dashed border-base-300 shadow-sm">
             <lucide-angular [img]="jobIcon" class="size-12 text-base-content/10 mb-4"></lucide-angular>
             <p class="text-base-content/40 font-bold italic">No job offers available at the moment.</p>
           </div>
        }
      </main>
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
