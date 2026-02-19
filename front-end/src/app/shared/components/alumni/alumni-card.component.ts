import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Profile } from '../../../core/models/profile.model';
import { LucideAngularModule, ExternalLink, GraduationCap, MapPin, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-alumni-card',
  standalone: true,
  imports: [LucideAngularModule, RouterLink],
  template: `
    <div class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 transition-all duration-300 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 rounded-[var(--radius-card)] overflow-hidden">
      <div class="card-body p-6">
        <div class="flex items-start justify-between">
          <div class="flex gap-4">
            <div class="avatar placeholder">
              <div class="bg-primary/10 text-primary rounded-2xl size-14 border border-primary/20">
                <span class="text-xl font-black">{{ alumni().first_name[0] }}{{ alumni().last_name[0] }}</span>
              </div>
            </div>
            <div>
              <h2 class="card-title text-xl font-black tracking-tight leading-tight">
                {{ alumni().first_name }} {{ alumni().last_name }}
              </h2>
              <div class="flex items-center gap-1.5 text-xs font-bold text-base-content/40 mt-1 uppercase tracking-wider">
                <lucide-angular [img]="graduationIcon" class="size-3"></lucide-angular>
                <span>{{ alumni().degree }} <span class="mx-1">•</span> Class of {{ alumni().graduation_year }}</span>
              </div>
            </div>
          </div>
          
          @if (alumni().is_verified) {
             <div class="tooltip tooltip-left" data-tip="Verified Profile">
                <div class="bg-success/10 p-1.5 rounded-lg border border-success/20">
                  <lucide-angular [img]="verifiedIcon" class="size-4 text-success"></lucide-angular>
                </div>
             </div>
          }
        </div>

        <p class="mt-5 text-sm font-medium text-base-content/70 line-clamp-2 leading-relaxed italic">
            "Looking for opportunities in software engineering and cloud architecture. 
            Passionate about agentic AI and modern web frameworks."
        </p>
        
        <div class="card-actions justify-between items-center mt-6 pt-5 border-t border-base-100">
          <div class="flex gap-2">
            @if (alumni().linkedin_url) {
              <a [href]="alumni().linkedin_url" target="_blank" class="btn btn-ghost btn-xs size-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20">
                <lucide-angular [img]="externalIcon" class="size-4"></lucide-angular>
              </a>
            }
            <div class="flex gap-1">
               <div class="badge badge-sm bg-base-200 border-none font-bold text-[10px] py-2">AI</div>
               <div class="badge badge-sm bg-base-200 border-none font-bold text-[10px] py-2">Web</div>
            </div>
          </div>
          
          <a [routerLink]="['/alumni', alumni().id]" class="btn btn-primary btn-sm px-5 font-bold shadow-md shadow-primary/10 rounded-xl">
            View Details
          </a>
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
