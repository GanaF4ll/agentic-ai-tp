import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService } from '../../../core/services/promotion.service';
import { ToastService } from '../../../core/services/toast.service';
import { Promotion } from '../../../core/models/promotion.model';
import { LucideAngularModule, GraduationCap, Plus, Pencil, Trash2, X } from 'lucide-angular';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, startWith } from 'rxjs';

@Component({
  selector: 'app-promotion-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-4xl font-black tracking-tighter text-base-content">Gestion des Promotions</h1>
          <p class="text-base-content/60 font-medium mt-1">Gérez les cohortes et les promotions de l'école.</p>
        </div>
        
        <button (click)="openModal()" class="btn btn-primary btn-lg rounded-2xl shadow-lg shadow-primary/20 font-black">
          <lucide-angular [img]="plusIcon" class="size-5 mr-2"></lucide-angular>
          Nouvelle Promotion
        </button>
      </div>

      <div class="card bg-base-100 border border-base-200 shadow-sm rounded-3xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table table-lg">
            <thead>
              <tr class="bg-base-200/50">
                <th class="font-black text-xs uppercase tracking-wider text-base-content/50 pl-8">Libellé</th>
                <th class="font-black text-xs uppercase tracking-wider text-base-content/50">Date de création</th>
                <th class="font-black text-xs uppercase tracking-wider text-base-content/50 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (promo of promotions(); track promo.id) {
                <tr class="hover:bg-base-200/30 transition-colors">
                  <td class="pl-8">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <lucide-angular [img]="gradIcon" class="size-5"></lucide-angular>
                      </div>
                      <div class="font-black text-base">{{ promo.label }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="text-sm font-medium text-base-content/60">
                      {{ promo.created_at | date:'dd/MM/yyyy' }}
                    </div>
                  </td>
                  <td class="text-right pr-8">
                    <div class="flex justify-end gap-2">
                      <button (click)="openModal(promo)" class="btn btn-ghost btn-sm btn-square rounded-xl text-info hover:bg-info/10">
                        <lucide-angular [img]="editIcon" class="size-4"></lucide-angular>
                      </button>
                      <button (click)="deletePromotion(promo)" class="btn btn-ghost btn-sm btn-square rounded-xl text-error hover:bg-error/10">
                        <lucide-angular [img]="deleteIcon" class="size-4"></lucide-angular>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="text-center py-20">
                    <div class="flex flex-col items-center gap-4 opacity-20">
                      <lucide-angular [img]="gradIcon" class="size-16"></lucide-angular>
                      <span class="font-black text-xl">Aucune promotion trouvée</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal for Create/Edit -->
    @if (showModal()) {
      <div class="modal modal-open">
        <div class="modal-box rounded-3xl border border-base-200 shadow-2xl p-0 overflow-hidden max-w-md">
          <div class="bg-primary p-6 text-primary-content flex justify-between items-center">
            <h3 class="font-black text-2xl tracking-tight">
              {{ isEditing() ? 'Modifier la Promotion' : 'Nouvelle Promotion' }}
            </h3>
            <button (click)="closeModal()" class="btn btn-ghost btn-sm btn-circle text-primary-content/80">
              <lucide-angular [img]="closeIcon" class="size-5"></lucide-angular>
            </button>
          </div>
          
          <div class="p-8">
            <div class="form-control w-full">
              <label class="label mb-1">
                <span class="label-text font-bold text-base-content/60 uppercase text-xs tracking-widest">Nom de la promotion</span>
              </label>
              <input 
                type="text" 
                [(ngModel)]="editLabel" 
                placeholder="Ex: Promotion 2024" 
                class="input input-bordered w-full rounded-2xl font-bold bg-base-200/50 border-base-300 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                (keyup.enter)="savePromotion()"
              />
              <p class="mt-4 text-xs font-medium text-base-content/40 italic">
                Ce libellé sera visible par tous les alumni lors de l'édition de leur profil.
              </p>
            </div>

            <div class="modal-action mt-10 gap-3">
              <button (click)="closeModal()" class="btn btn-ghost rounded-2xl font-black px-8">Annuler</button>
              <button 
                (click)="savePromotion()" 
                [disabled]="!editLabel.trim()" 
                class="btn btn-primary rounded-2xl font-black px-8 shadow-lg shadow-primary/20"
              >
                {{ isEditing() ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-backdrop bg-base-300/60 backdrop-blur-sm" (click)="closeModal()"></div>
      </div>
    }
  `
})
export class PromotionListComponent {
  private promotionService = inject(PromotionService);
  private toastService = inject(ToastService);
  
  readonly gradIcon = GraduationCap;
  readonly plusIcon = Plus;
  readonly editIcon = Pencil;
  readonly deleteIcon = Trash2;
  readonly closeIcon = X;

  private refreshTrigger = signal(0);
  promotions = toSignal(
    toObservable(this.refreshTrigger).pipe(
      startWith(0),
      switchMap(() => this.promotionService.getPromotions())
    ),
    { initialValue: [] as Promotion[] }
  );

  showModal = signal(false);
  isEditing = signal(false);
  editId = signal<number | null>(null);
  editLabel = '';

  openModal(promo?: Promotion) {
    if (promo) {
      this.isEditing.set(true);
      this.editId.set(promo.id);
      this.editLabel = promo.label;
    } else {
      this.isEditing.set(false);
      this.editId.set(null);
      this.editLabel = '';
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  savePromotion() {
    if (!this.editLabel.trim()) return;

    const request = this.isEditing() && this.editId() 
      ? this.promotionService.updatePromotion(this.editId()!, this.editLabel)
      : this.promotionService.createPromotion(this.editLabel);

    request.subscribe({
      next: () => {
        this.refreshTrigger.update(n => n + 1);
        this.toastService.success(`Promotion ${this.isEditing() ? 'mise à jour' : 'créée'} avec succès.`);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving promotion', err);
        let message = "Erreur lors de l'enregistrement.";
        
        if (err.status === 409) {
          message = err.error?.detail || "Ce libellé existe déjà.";
        } else if (err.status === 400 && err.error) {
          if (typeof err.error === 'object') {
            const firstError = Object.values(err.error)[0];
            if (Array.isArray(firstError)) {
              message = firstError[0];
            } else if (typeof firstError === 'string') {
              message = firstError;
            }
          }
        }
        
        this.toastService.error(message);
      }
    });
  }

  deletePromotion(promo: Promotion) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la promotion "${promo.label}" ?`)) {
      this.promotionService.deletePromotion(promo.id).subscribe({
        next: () => {
          this.refreshTrigger.update(n => n + 1);
          this.toastService.success('Promotion supprimée.');
        },
        error: (err) => {
          console.error('Error deleting promotion', err);
          this.toastService.error('Erreur lors de la suppression.');
        }
      });
    }
  }
}
