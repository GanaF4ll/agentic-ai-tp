import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlumniService } from '../../../core/services/alumni.service';
import { Profile } from '../../../core/models/profile.model';
import { LucideAngularModule, GraduationCap, Mail, Linkedin, Calendar, CheckCircle, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-6">
      <nav>
        <a routerLink="/alumni" class="btn btn-ghost btn-sm gap-2">
          <lucide-angular [img]="backIcon" class="w-4 h-4"></lucide-angular>
          Back to Directory
        </a>
      </nav>

      @if (profile(); as p) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 flex flex-col gap-6">
            <div class="card bg-base-100 shadow-xl border-t-4 border-primary border-x border-b border-base-300">
              <div class="card-body items-center text-center">
                <div class="avatar placeholder mb-4">
                  <div class="bg-neutral text-neutral-content rounded-2xl w-32">
                    <span class="text-4xl">{{ p.first_name[0] }}{{ p.last_name[0] }}</span>
                  </div>
                </div>
                <h2 class="card-title text-2xl font-bold">{{ p.first_name }} {{ p.last_name }}</h2>
                <div class="badge badge-primary">{{ p.degree }}</div>
                
                <div class="flex flex-col gap-3 w-full mt-6">
                  <a [href]="'mailto:' + p.email" class="btn btn-outline btn-sm gap-2">
                    <lucide-angular [img]="mailIcon" class="w-4 h-4"></lucide-angular>
                    {{ p.email }}
                  </a>
                  @if (p.linkedin_url) {
                    <a [href]="p.linkedin_url" target="_blank" class="btn btn-outline btn-sm gap-2">
                      <lucide-angular [img]="linkedinIcon" class="w-4 h-4"></lucide-angular>
                      LinkedIn Profile
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 flex flex-col gap-6">
            <div class="card bg-base-100 shadow-xl border-t-4 border-primary border-x border-b border-base-300">
              <div class="card-body">
                <h3 class="text-xl font-bold border-b pb-2 mb-4">Academic Background</h3>
                <div class="flex items-center gap-4 py-2">
                   <div class="bg-primary/10 p-3 rounded-xl">
                      <lucide-angular [img]="gradIcon" class="w-6 h-6 text-primary"></lucide-angular>
                   </div>
                   <div>
                      <p class="font-semibold">{{ p.degree }}</p>
                      <p class="text-sm text-base-content/60">Class of {{ p.graduation_year }}</p>
                   </div>
                </div>

                <h3 class="text-xl font-bold border-b pb-2 mb-4 mt-8">About</h3>
                <p class="text-base-content/80 leading-relaxed">
                  Passionate alumnus from the class of {{ p.graduation_year }}. Specialized in {{ p.degree }}.
                  Always interested in networking with other members of the community and exploring new opportunities.
                </p>

                <div class="flex gap-2 mt-8">
                  @if (p.is_verified) {
                    <div class="alert alert-success py-2 px-4 w-fit">
                      <lucide-angular [img]="verifiedIcon" class="w-5 h-5"></lucide-angular>
                      <span class="text-sm">Verified Alumni</span>
                    </div>
                  } @else {
                    <div class="alert alert-warning py-2 px-4 w-fit">
                      <lucide-angular [img]="pendingIcon" class="w-5 h-5"></lucide-angular>
                      <span class="text-sm">Verification Pending</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="flex flex-col gap-4">
          <div class="skeleton h-64 w-full"></div>
          <div class="skeleton h-10 w-48"></div>
        </div>
      }
    </div>
  `
})
export class ProfileDetailComponent {
  private route = inject(ActivatedRoute);
  private alumniService = inject(AlumniService);
  
  profile = signal<Profile | null>(null);

  readonly backIcon = ArrowLeft;
  readonly mailIcon = Mail;
  readonly linkedinIcon = Linkedin;
  readonly gradIcon = GraduationCap;
  readonly verifiedIcon = CheckCircle;
  readonly pendingIcon = Calendar;

  constructor() {
    const id = this.route.snapshot.params['id'];
    this.loadProfile(id);
  }

  loadProfile(id: string) {
    // For demo, find in mock or fetch
    this.alumniService.getProfiles().subscribe(profiles => {
      const found = profiles.find(p => p.id === +id);
      if (found) this.profile.set(found);
    });
  }
}
