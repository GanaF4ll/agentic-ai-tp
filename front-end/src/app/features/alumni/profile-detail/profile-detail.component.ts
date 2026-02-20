import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlumniService } from '../../../core/services/alumni.service';
import { Profile } from '../../../core/models/profile.model';
import { LucideAngularModule, GraduationCap, Mail, Linkedin, Calendar, CheckCircle, ArrowLeft, User } from 'lucide-angular';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-8">
      <nav>
        <a routerLink="/alumni" class="btn btn-ghost btn-sm gap-2 font-bold text-base-content/60 hover:text-primary">
          <lucide-angular [img]="backIcon" class="size-4"></lucide-angular>
          Retour à l'annuaire
        </a>
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
                    <span class="text-4xl font-black">{{ p.first_name[0] }}{{ p.last_name[0] }}</span>
                  </div>
                </div>
                
                <h1 class="text-3xl font-black tracking-tight leading-none">{{ p.first_name }} {{ p.last_name }}</h1>
                <p class="text-base-content/50 font-bold uppercase tracking-wider text-xs mt-2">{{ p.degree }}</p>
                
                <div class="flex flex-col gap-3 w-full mt-8">
                  <a [href]="'mailto:' + p.email" class="btn btn-outline btn-primary btn-sm gap-2 rounded-xl font-bold">
                    <lucide-angular [img]="mailIcon" class="size-4"></lucide-angular>
                    {{ p.email }}
                  </a>
                  @if (p.linkedin_url) {
                    <a [href]="p.linkedin_url" target="_blank" class="btn btn-primary btn-sm gap-2 rounded-xl font-bold shadow-lg shadow-primary/20">
                      <lucide-angular [img]="linkedinIcon" class="size-4"></lucide-angular>
                      Profil LinkedIn
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-2 flex flex-col gap-6">
            
            <!-- About Section -->
            <div class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)]">
              <div class="card-body p-8">
                <h2 class="text-xl font-black tracking-tight flex items-center gap-3 mb-6">
                   <div class="p-2 bg-secondary/10 text-secondary rounded-lg">
                      <lucide-angular [img]="userIcon" class="size-5"></lucide-angular>
                   </div>
                   À propos
                </h2>
                
                <p class="text-base-content/70 leading-relaxed font-medium text-lg">
                  Alumnus passionné de la promotion <span class="font-bold text-primary">{{ p.graduation_year }}</span>. 
                  Spécialisé en {{ p.degree }}. Toujours intéressé par le networking avec d'autres membres de la communauté et l'exploration de nouvelles opportunités.
                </p>

                <div class="flex gap-3 mt-8">
                   <div class="badge badge-lg bg-base-200 border-none font-bold text-xs py-4 px-4 text-base-content/60">Génie Logiciel</div>
                   <div class="badge badge-lg bg-base-200 border-none font-bold text-xs py-4 px-4 text-base-content/60">React</div>
                   <div class="badge badge-lg bg-base-200 border-none font-bold text-xs py-4 px-4 text-base-content/60">Node.js</div>
                </div>
              </div>
            </div>

             <!-- Academic Section -->
            <div class="card bg-base-100 shadow-[var(--shadow-card)] border border-base-200 rounded-[var(--radius-card)]">
               <div class="card-body p-8">
                  <h2 class="text-xl font-black tracking-tight flex items-center gap-3 mb-6">
                     <div class="p-2 bg-accent/10 text-accent-content rounded-lg">
                        <lucide-angular [img]="gradIcon" class="size-5"></lucide-angular>
                     </div>
                     Parcours Académique
                  </h2>

                  <div class="flex items-start gap-4">
                     <div class="flex flex-col border-l-2 border-base-200 pl-4 py-1">
                        <h3 class="font-bold text-lg">{{ p.degree }}</h3>
                        <p class="text-base-content/60 font-medium">Promotion {{ p.graduation_year }}</p>
                        <p class="text-sm text-base-content/40 mt-1">École Supérieure du Numérique</p>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Verification Status -->
             @if (p.is_verified) {
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
  private route = inject(ActivatedRoute);
  private alumniService = inject(AlumniService);
  
  profile = signal<Profile | null>(null);

  readonly backIcon = ArrowLeft;
  readonly mailIcon = Mail;
  readonly linkedinIcon = Linkedin;
  readonly gradIcon = GraduationCap;
  readonly verifiedIcon = CheckCircle;
  readonly pendingIcon = Calendar;
  readonly userIcon = User;

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
