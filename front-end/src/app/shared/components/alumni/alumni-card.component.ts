import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Profile } from '../../../core/models/profile.model';
import { LucideAngularModule, ExternalLink, GraduationCap, MapPin, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-alumni-card',
  standalone: true,
  imports: [LucideAngularModule, RouterLink],
  template: `
    <div class="card bg-base-100 shadow-xl border border-base-300 transition-all hover:shadow-2xl hover:border-primary/20">
      <div class="card-body">
        <div class="flex items-start justify-between">
          <div class="flex gap-4">
            <div class="avatar placeholder">
              <div class="bg-neutral text-neutral-content rounded-xl w-16">
                <span class="text-xl">{{ alumni().first_name[0] }}{{ alumni().last_name[0] }}</span>
              </div>
            </div>
            <div>
              <h2 class="card-title text-primary">{{ alumni().first_name }} {{ alumni().last_name }}</h2>
              <div class="flex items-center gap-1 text-sm text-base-content/60 mt-1">
                <lucide-angular [img]="graduationIcon" class="w-4 h-4"></lucide-angular>
                <span>{{ alumni().degree }} @ {{ alumni().graduation_year }}</span>
              </div>
            </div>
          </div>
          
          @if (alumni().is_verified) {
             <div class="tooltip" data-tip="Verified Profile">
                <lucide-angular [img]="verifiedIcon" class="w-5 h-5 text-success"></lucide-angular>
             </div>
          }
        </div>

        <p class="mt-4 text-base-content/80 line-clamp-2">
            Looking for opportunities in software engineering and cloud architecture. 
            Passionate about agentic AI and modern web frameworks.
        </p>
        
        <div class="card-actions justify-end mt-6 pt-4 border-t border-base-200">
          @if (alumni().linkedin_url) {
            <a [href]="alumni().linkedin_url" target="_blank" class="btn btn-ghost btn-sm gap-2">
              <lucide-angular [img]="externalIcon" class="w-4 h-4"></lucide-angular>
              LinkedIn
            </a>
          }
          <a [routerLink]="['/alumni', alumni().id]" class="btn btn-primary btn-sm">View Profile</a>
        </div>
      </div>
    </div>
  `
})
export class AlumniCardComponent {
  alumni = input.required<Profile>();
  
  readonly graduationIcon = GraduationCap;
  readonly externalIcon = ExternalLink;
  readonly verifiedIcon = CheckCircle;
  readonly mapPinIcon = MapPin;
}
