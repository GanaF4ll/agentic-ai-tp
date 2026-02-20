import { Component, signal } from '@angular/core';
import { LucideAngularModule, Briefcase, MapPin, Clock } from 'lucide-angular';
import { JobOffer } from '../../../core/models/business.model';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <header class="col-span-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 glass p-8 rounded-[var(--radius-card)] border border-white/20 shadow-[var(--shadow-card)] text-white">
        <div>
          <h1 class="text-4xl font-black text-white tracking-tighter">Job Board</h1>
          <p class="text-white/70 font-medium mt-2">Exclusive opportunities for our alumni network.</p>
        </div>
        <button class="btn btn-primary px-8 font-bold shadow-lg shadow-primary/20 border-none text-primary-content">Post a Job</button>
      </header>

      <aside class="col-span-full lg:col-span-2 flex flex-col gap-6">
        <div class="card glass border border-white/20 rounded-[var(--radius-card)] overflow-hidden bg-white/5">
          <div class="card-body p-6">
             <div class="size-10 rounded-xl bg-accent/20 flex items-center justify-center mb-4 text-accent-content">
               <lucide-angular [img]="jobIcon" class="size-5 text-accent"></lucide-angular>
             </div>
             <h3 class="font-black text-white leading-tight">Career Services</h3>
             <p class="text-sm text-white/70 mt-2">Need help with your resume or interview prep? Our experts are here to help.</p>
             <button class="btn btn-accent btn-sm mt-4 font-bold border-none text-accent-content">Book a session</button>
          </div>
        </div>

        <div class="card glass border border-white/20 shadow-sm rounded-[var(--radius-card)] overflow-hidden bg-white/5">
           <div class="card-body p-6">
              <h4 class="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Quick Filters</h4>
              <div class="flex flex-wrap gap-2">
                 <button class="badge badge-lg bg-white/10 border-none font-bold text-xs py-4 px-4 text-white hover:bg-white/20 transition-colors cursor-pointer">Full-time</button>
                 <button class="badge badge-lg bg-white/10 border-none font-bold text-xs py-4 px-4 text-white hover:bg-white/20 transition-colors cursor-pointer">Remote</button>
                 <button class="badge badge-lg bg-white/10 border-none font-bold text-xs py-4 px-4 text-white hover:bg-white/20 transition-colors cursor-pointer">Freelance</button>
              </div>
           </div>
        </div>
      </aside>

      <main class="col-span-full lg:col-span-4 flex flex-col gap-4">
        @for (job of jobs(); track job.id) {
          <div class="group card glass shadow-[var(--shadow-card)] border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 rounded-[var(--radius-card)] overflow-hidden">
            <div class="card-body p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div class="flex gap-5">
                <div class="bg-white/10 group-hover:bg-white/20 p-4 rounded-2xl h-fit border border-white/10 transition-colors">
                   <lucide-angular [img]="jobIcon" class="size-6 text-white"></lucide-angular>
                </div>
                <div>
                  <h3 class="text-xl font-black tracking-tight text-white group-hover:text-primary transition-colors">{{ job.title }}</h3>
                  <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-white/60 mt-2 uppercase tracking-wide">
                    <span class="flex items-center gap-1.5 text-white font-black">
                      {{ job.company }}
                    </span>
                    <span class="flex items-center gap-1.5">
                      <lucide-angular [img]="locationIcon" class="size-3"></lucide-angular>
                      {{ job.location }}
                    </span>
                    <span class="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-md text-white">
                      <lucide-angular [img]="clockIcon" class="size-3"></lucide-angular>
                      {{ job.type }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                <button class="btn btn-ghost btn-sm font-bold flex-1 md:flex-none px-6 text-white hover:bg-white/10">Details</button>
                <button class="btn btn-primary btn-sm font-bold flex-1 md:flex-none px-6 shadow-md shadow-primary/10 border-none text-primary-content">Apply</button>
              </div>
            </div>
          </div>
        } @empty {
           <div class="flex flex-col items-center justify-center py-20 glass rounded-[var(--radius-card)] border-2 border-dashed border-white/20 shadow-sm">
             <lucide-angular [img]="jobIcon" class="size-12 text-white/20 mb-4"></lucide-angular>
             <p class="text-white/40 font-bold italic">No job offers available at the moment.</p>
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
