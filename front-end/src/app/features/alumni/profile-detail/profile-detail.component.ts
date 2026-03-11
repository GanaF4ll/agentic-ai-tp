import { Location, DatePipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlumniService } from '../../../core/services/alumni.service';
import { Profile } from '../../../core/models/profile.model';
import { LucideAngularModule, GraduationCap, Mail, Linkedin, Calendar, CheckCircle, ArrowLeft, User, Briefcase } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [LucideAngularModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-8">
      <nav>
        <button type="button" (click)="goBack()" class="btn btn-ghost btn-sm gap-2 font-bold text-base-content/60 hover:text-primary">
          <lucide-angular [img]="backIcon" class="size-4"></lucide-angular>
          Retour
        </button>
      </nav>

      @if (profile(); as p) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <!-- Sidebar / Profile Card -->
          <div class="lg:col-span-1">
            <div class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)] overflow-hidden relative group">
              <!-- Decorative background -->
              <div class="absolute top-0 left-0 w-full h-32 bg-primary/10"></div>
              
              <div class="card-body items-center text-center pt-20 relative z-10">
                <div class="avatar placeholder mb-4">
                  <div class="bg-base-100 text-primary border-4 border-base-100 shadow-xl rounded-[2rem] w-32">
                    <span class="text-4xl font-black">{{ p.user.first_name[0] }}{{ p.user.last_name[0] }}</span>
                  </div>
                </div>
                
                <h1 class="text-3xl font-black tracking-tight leading-none">{{ p.user.first_name }} {{ p.user.last_name }}</h1>
                <p class="text-base-content/50 font-bold uppercase tracking-wider text-xs mt-2">{{ p.current_job_title }} @ {{ p.current_company }}</p>
                
                <div class="flex flex-col gap-3 w-full mt-8">
                  @if (p.user.email && p.user.email !== 'Privé') {
                    <a [href]="'mailto:' + p.user.email" class="btn btn-outline btn-primary btn-sm gap-2 rounded-xl font-bold overflow-hidden text-ellipsis">
                      <lucide-angular [img]="mailIcon" class="size-4"></lucide-angular>
                      {{ p.user.email }}
                    </a>
                  } @else {
                    <div class="btn btn-disabled btn-sm gap-2 rounded-xl font-bold italic opacity-50">
                       <lucide-angular [img]="mailIcon" class="size-4"></lucide-angular>
                       Email Privé
                    </div>
                  }

                  @if (p.linkedin_url && p.linkedin_url !== 'Privé') {
                    <a [href]="p.linkedin_url" target="_blank" class="btn btn-primary btn-sm gap-2 rounded-xl font-bold shadow-lg shadow-primary/20">
                      <lucide-angular [img]="linkedinIcon" class="size-4"></lucide-angular>
                      Profil LinkedIn
                    </a>
                  } @else {
                    <div class="btn btn-disabled btn-sm gap-2 rounded-xl font-bold italic opacity-50">
                       <lucide-angular [img]="linkedinIcon" class="size-4"></lucide-angular>
                       LinkedIn Privé
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-2 flex flex-col gap-6">
            
            <!-- About Section -->
            <div class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)]">
              <div class="card-body p-6 md:p-8">
                <h2 class="text-xl font-black tracking-tight flex items-center gap-3 mb-6">
                   <div class="p-2 bg-secondary/10 text-secondary rounded-lg">
                      <lucide-angular [img]="userIcon" class="size-5"></lucide-angular>
                   </div>
                   À propos
                </h2>
                
                <p class="text-base-content/70 leading-relaxed font-medium text-lg whitespace-pre-line">
                  {{ p.bio || 'Cet alumnus n\\'a pas encore complété sa bio.' }}
                </p>
              </div>
            </div>

            <!-- Experience Section -->
            <div class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)]">
              <div class="card-body p-6 md:p-8">
                <h2 class="text-xl font-black tracking-tight flex items-center gap-3 mb-6">
                   <div class="p-2 bg-info/10 text-info rounded-lg">
                      <lucide-angular [img]="briefcaseIcon" class="size-5"></lucide-angular>
                   </div>
                   Expériences Professionnelles
                </h2>

                <div class="flex flex-col gap-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-base-200">
                  @for (exp of p.experiences; track exp.id) {
                    <div class="flex gap-6 relative">
                       <div class="size-9 rounded-full bg-base-100 border-2 border-primary/20 flex items-center justify-center shrink-0 z-10 shadow-sm group-hover:border-primary transition-colors">
                          <div class="size-2 rounded-full bg-primary animate-pulse"></div>
                       </div>
                       <div class="flex flex-col min-w-0">
                          <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                             <h3 class="font-black text-lg tracking-tight">{{ exp.title }}</h3>
                             <span class="hidden sm:inline text-base-content/20">•</span>
                             <span class="text-primary font-bold">{{ exp.company }}</span>
                          </div>
                          <p class="text-sm font-bold text-base-content/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <lucide-angular [img]="calendarIcon" class="size-3"></lucide-angular>
                             {{ exp.start_date | date:'MMM yyyy' }} — {{ exp.end_date ? (exp.end_date | date:'MMM yyyy') : 'Présent' }}
                          </p>
                          <p class="text-base-content/60 leading-relaxed font-medium">
                             {{ exp.description }}
                          </p>
                       </div>
                    </div>
                  } @empty {
                    <p class="text-base-content/40 font-medium italic pl-10">Aucune expérience renseignée.</p>
                  }
                </div>
              </div>
            </div>

             <!-- Academic Section -->
            <div class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)]">
               <div class="card-body p-6 md:p-8">
                  <h2 class="text-xl font-black tracking-tight flex items-center gap-3 mb-6">
                     <div class="p-2 bg-accent/10 text-accent-content rounded-lg">
                        <lucide-angular [img]="gradIcon" class="size-5"></lucide-angular>
                     </div>
                     Parcours Académique
                  </h2>

                  <div class="flex items-start gap-4">
                     <div class="flex flex-col border-l-2 border-base-200 pl-4 py-1">
                        <h3 class="font-bold text-lg">{{ p.degree }}</h3>
                        <p class="text-base-content/60 font-medium">Promotion {{ p.graduation_year }} {{ p.promotion ? '(' + p.promotion.label + ')' : '' }}</p>
                        <p class="text-sm text-base-content/40 mt-1">École Supérieure du Numérique</p>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Verification Status -->
             @if (p.status === 'VERIFIED') {
               <div class="alert bg-success/10 border-success/20 text-success-content shadow-sm rounded-[var(--radius-card)]">
                 <lucide-angular [img]="verifiedIcon" class="size-6 text-success"></lucide-angular>
                 <div>
                    <h3 class="font-bold">Alumni Vérifié</h3>
                    <div class="text-xs opacity-80">Ce profil a été vérifié par l'administration de l'école.</div>
                 </div>
               </div>
             }
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div class="lg:col-span-1 skeleton h-96 w-full rounded-[var(--radius-card)]"></div>
           <div class="lg:col-span-2 flex flex-col gap-6">
              <div class="skeleton h-64 w-full rounded-[var(--radius-card)]"></div>
              <div class="skeleton h-48 w-full rounded-[var(--radius-card)]"></div>
           </div>
        </div>
      }
    </div>
  `
})
export class ProfileDetailComponent {
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private alumniService = inject(AlumniService);
  
  readonly backIcon = ArrowLeft;
  readonly mailIcon = Mail;
  readonly linkedinIcon = Linkedin;
  readonly gradIcon = GraduationCap;
  readonly verifiedIcon = CheckCircle;
  readonly calendarIcon = Calendar;
  readonly userIcon = User;
  readonly briefcaseIcon = Briefcase;

  profile = toSignal(
    this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.alumniService.getProfiles().pipe(
        map(profiles => profiles.find(p => p.id === +id) || null)
      ))
    )
  );

  goBack() {
    this.location.back();
  }
}
