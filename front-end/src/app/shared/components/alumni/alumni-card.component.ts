import { ProfileStatus } from './../../../core/models/profile.model';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Profile } from '../../../core/models/profile.model';
import {
  LucideAngularModule,
  ExternalLink,
  GraduationCap,
  MapPin,
  CheckCircle,
} from 'lucide-angular';

@Component({
  selector: 'app-alumni-card',
  standalone: true,
  imports: [LucideAngularModule, RouterLink],
  template: `
    <div
      class="card h-full bg-base-100 border border-base-200 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-2xl hover:bg-base-200/50 hover:-translate-y-1 rounded-[var(--radius-card)] overflow-hidden"
    >
      <div class="card-body h-full p-6 flex flex-col">
        <div class="flex items-start justify-between gap-4">
          <div class="flex gap-4 min-w-0 flex-1">
            <div class="avatar placeholder">
              <div class="bg-primary/10 text-primary rounded-2xl size-14 border border-primary/20">
                <span class="text-xl font-black"
                  >{{ alumni().user.first_name[0] }}{{ alumni().user.last_name[0] }}</span
                >
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="card-title text-xl font-black tracking-tight leading-tight text-base-content break-words">
                {{ alumni().user.first_name }} {{ alumni().user.last_name }}
              </h2>
              <div
                class="mt-1 flex items-start gap-1.5 text-xs font-bold text-base-content/60 uppercase tracking-wider"
              >
                <lucide-angular [img]="graduationIcon" class="size-3 shrink-0"></lucide-angular>
                <span class="break-words"
                  >{{ alumni().degree }} <span class="mx-1 text-base-content/40">•</span> Promotion
                  {{ alumni().graduation_year }}</span
                >
              </div>
            </div>
          </div>

          @if (alumni().status === 'VERIFIED') {
            <div class="tooltip tooltip-left" data-tip="Profil Vérifié">
              <div class="bg-success/20 p-1.5 rounded-lg border border-success/30">
                <lucide-angular
                  [img]="verifiedIcon"
                  class="size-4 text-success"
                ></lucide-angular>
              </div>
            </div>
          }
        </div>

        <p class="mt-5 min-h-[4.5rem] text-sm font-medium text-base-content/70 leading-relaxed italic line-clamp-3">
          "À la recherche d'opportunités en ingénierie logicielle et architecture cloud. Passionné
          par l'IA agentique et les frameworks web modernes."
        </p>

        <div class="card-actions justify-between items-center mt-auto pt-5 border-t border-base-200">
          <div class="flex gap-2">
            @if (alumni().linkedin_url) {
              <a
                [href]="alumni().linkedin_url"
                target="_blank"
                class="btn btn-ghost btn-xs size-8 p-0 rounded-lg text-base-content/70 hover:bg-base-200 hover:text-primary border border-transparent hover:border-base-300"
              >
                <lucide-angular [img]="externalIcon" class="size-4"></lucide-angular>
              </a>
            }
            <div class="flex gap-1">
              <div
                class="badge badge-sm bg-base-200 text-base-content border-base-300 font-bold text-[10px] py-2"
              >
                IA
              </div>
              <div
                class="badge badge-sm bg-base-200 text-base-content border-base-300 font-bold text-[10px] py-2"
              >
                Web
              </div>
            </div>
          </div>

          <a
            [routerLink]="['/alumni', alumni().id]"
            class="btn btn-primary btn-sm px-5 font-bold shadow-md shadow-primary/20 rounded-xl border-none text-primary-content"
          >
            Voir Détails
          </a>
        </div>
      </div>
    </div>
  `,
})
export class AlumniCardComponent {
  alumni = input.required<Profile>();

  readonly graduationIcon = GraduationCap;
  readonly externalIcon = ExternalLink;
  readonly verifiedIcon = CheckCircle;
  readonly mapPinIcon = MapPin;
}
