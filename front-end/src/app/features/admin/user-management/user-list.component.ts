import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { LucideAngularModule, UserPlus, ShieldCheck, Mail, Calendar } from 'lucide-angular';
import { UserCreateComponent } from './user-create.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [LucideAngularModule, UserCreateComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-4xl font-black tracking-tighter text-base-content">Gestion des Accès</h1>
          <p class="text-base-content/60 font-medium mt-1">Gérez les invitations et les rôles des collaborateurs.</p>
        </div>
        
        <button (click)="showCreateModal.set(true)" class="btn btn-primary btn-lg rounded-2xl shadow-lg shadow-primary/20 font-black">
          <lucide-icon name="user-plus" size="20" class="mr-2"></lucide-icon>
          Inviter un collaborateur
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card bg-base-100 border border-base-200 shadow-sm p-6 rounded-3xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <lucide-icon name="shield-check" size="24"></lucide-icon>
            </div>
            <div>
              <div class="text-2xl font-black">{{ stats().admins }}</div>
              <div class="text-xs font-bold text-base-content/50 uppercase tracking-wider">Administrateurs</div>
            </div>
          </div>
        </div>
        
        <div class="card bg-base-100 border border-base-200 shadow-sm p-6 rounded-3xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <lucide-icon name="mail" size="24"></lucide-icon>
            </div>
            <div>
              <div class="text-2xl font-black">{{ stats().pending }}</div>
              <div class="text-xs font-bold text-base-content/50 uppercase tracking-wider">Invitations en attente</div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 border border-base-200 shadow-sm p-6 rounded-3xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <lucide-icon name="calendar" size="24"></lucide-icon>
            </div>
            <div>
              <div class="text-2xl font-black">{{ stats().total }}</div>
              <div class="text-xs font-bold text-base-content/50 uppercase tracking-wider">Total Utilisateurs</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-200 shadow-sm rounded-3xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table table-lg">
            <thead>
              <tr class="bg-base-200/50">
                <th class="font-black text-xs uppercase tracking-wider text-base-content/50">Utilisateur</th>
                <th class="font-black text-xs uppercase tracking-wider text-base-content/50">Rôle</th>
                <th class="font-black text-xs uppercase tracking-wider text-base-content/50">Statut</th>
                <th class="font-black text-xs uppercase tracking-wider text-base-content/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
                <tr class="hover:bg-base-200/30 transition-colors">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="avatar placeholder">
                        <div class="bg-primary text-primary-content rounded-xl w-10 h-10 font-black">
                          {{ user.first_name[0] }}{{ user.last_name[0] }}
                        </div>
                      </div>
                      <div>
                        <div class="font-black text-base">{{ user.first_name }} {{ user.last_name }}</div>
                        <div class="text-xs font-bold text-base-content/40">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="badge badge-ghost font-bold text-xs uppercase tracking-widest px-3 py-3 rounded-lg" 
                         [class.badge-primary]="user.role === 'SUPER_ADMIN'"
                         [class.badge-secondary]="user.role === 'ADMIN'">
                      {{ user.role }}
                    </div>
                  </td>
                  <td>
                    @if (user.status === 'ACTIVE') {
                      <div class="flex items-center gap-2 text-success font-black text-xs uppercase">
                        <span class="w-2 h-2 rounded-full bg-success"></span>
                        Actif
                      </div>
                    } @else {
                      <div class="flex items-center gap-2 text-warning font-black text-xs uppercase">
                        <span class="w-2 h-2 rounded-full bg-warning"></span>
                        En attente
                      </div>
                    }
                  </td>
                  <td>
                    <button class="btn btn-ghost btn-sm btn-square rounded-xl">
                      <lucide-icon name="shield-check" size="16"></lucide-icon>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="text-center py-12">
                    <div class="flex flex-col items-center gap-2 opacity-20">
                      <lucide-icon name="calendar" size="48"></lucide-icon>
                      <span class="font-black">Aucun utilisateur trouvé</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    @if (showCreateModal()) {
      @defer (on idle) {
        <app-user-create (close)="showCreateModal.set(false)" (created)="onUserCreated()"></app-user-create>
      }
    }
  `
})
export class UserListComponent implements OnInit {
  private authService = inject(AuthService);
  
  users = signal<User[]>([]);
  showCreateModal = signal(false);
  
  stats = signal({
    admins: 0,
    pending: 0,
    total: 0
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getUsers().subscribe(users => {
      this.users.set(users);
      this.updateStats(users);
    });
  }

  updateStats(users: User[]) {
    this.stats.set({
      admins: users.filter(u => u.role !== 'MEMBER').length,
      pending: users.filter(u => u.status === 'PENDING').length,
      total: users.length
    });
  }

  onUserCreated() {
    this.showCreateModal.set(false);
    this.loadUsers();
  }
}
