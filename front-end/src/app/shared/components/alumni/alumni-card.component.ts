import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Profile } from '../../../core/models/profile.model';
import { LucideAngularModule, ExternalLink, GraduationCap, MapPin, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-alumni-card',
  standalone: true,
  imports: [LucideAngularModule, RouterLink],
  template: `
    <div class="card glass transition-all duration-300 hover:shadow-2xl hover:bg-white/20 hover:-translate-y-1 rounded-[var(--radius-card)] overflow-hidden">
      <div class="card-body p-6">
        <div class="flex items-start justify-between">
          <div class="flex gap-4">
            <div class="avatar placeholder">
              <div class="bg-white/10 text-white rounded-2xl size-14 border border-white/20">
                <span class="text-xl font-black">{{ alumni().first_name[0] }}{{ alumni().last_name[0] }}</span>
              </div>
            </div>
            <div>
              <h2 class="card-title text-xl font-black tracking-tight leading-tight text-white">
                {{ alumni().first_name }} {{ alumni().last_name }}
              </h2>
              <div class="flex items-center gap-1.5 text-xs font-bold text-white/60 mt-1 uppercase tracking-wider">
                <lucide-angular [img]="graduationIcon" class="size-3"></lucide-angular>
                <span>{{ alumni().degree }} <span class="mx-1 text-white/40">•</span> Promotion {{ alumni().graduation_year }}</span>
              </div>
            </div>
          </div>
          
          @if (alumni().is_verified) {
             <div class="tooltip tooltip-left" data-tip="Profil Vérifié">
                <div class="bg-success/20 p-1.5 rounded-lg border border-success/30">
                  <lucide-angular [img]="verifiedIcon" class="size-4 text-success-content"></lucide-angular>
                </div>
             </div>
          }
        </div>

        <p class="mt-5 text-sm font-medium text-white/80 line-clamp-2 leading-relaxed italic">
            "À la recherche d'opportunités en ingénierie logicielle et architecture cloud. 
            Passionné par l'IA agentique et les frameworks web modernes."
        </p>
        
        <div class="card-actions justify-between items-center mt-6 pt-5 border-t border-white/10">
          <div class="flex gap-2">
            @if (alumni().linkedin_url) {
              <a [href]="alumni().linkedin_url" target="_blank" class="btn btn-ghost btn-xs size-8 p-0 rounded-lg text-white/70 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20">
                <lucide-angular [img]="externalIcon" class="size-4"></lucide-angular>
              </a>
            }
            <div class="flex gap-1">
               <div class="badge badge-sm bg-white/10 text-white border-white/10 font-bold text-[10px] py-2">IA</div>
               <div class="badge badge-sm bg-white/10 text-white border-white/10 font-bold text-[10px] py-2">Web</div>
            </div>
          </div>
          
          <a [routerLink]="['/alumni', alumni().id]" class="btn btn-primary btn-sm px-5 font-bold shadow-md shadow-primary/20 rounded-xl border-none text-primary-content">
            Voir Détails
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
