import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from '../../../core/services/toast.service';
import { LucideAngularModule, Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (toastService.activeToasts().length > 0) {
      <div class="toast toast-end toast-top p-6 z-[9999] pointer-events-none">
        @for (toast of toastService.activeToasts(); track toast.id) {
          <div 
            class="alert shadow-2xl border-none flex items-start gap-4 pr-12 relative animate-in slide-in-from-right duration-300 rounded-2xl min-w-[320px] max-w-md pointer-events-auto"
            [ngClass]="getAlertClass(toast.type)"
          >
            <lucide-angular [img]="getIcon(toast.type)" class="size-6 shrink-0"></lucide-angular>
            <div class="flex flex-col gap-1">
              <span class="font-black tracking-tight text-lg">{{ getTitle(toast.type) }}</span>
              <span class="font-medium opacity-90 leading-tight">{{ toast.message }}</span>
            </div>
            <button 
              (click)="toastService.remove(toast.id)" 
              class="btn btn-ghost btn-sm btn-circle absolute top-4 right-4 opacity-50 hover:opacity-100"
            >
              <lucide-angular [img]="closeIcon" class="size-4"></lucide-angular>
            </button>
          </div>
        }
      </div>
    }
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
  
  readonly infoIcon = Info;
  readonly successIcon = CheckCircle;
  readonly warningIcon = AlertTriangle;
  readonly errorIcon = AlertCircle;
  readonly closeIcon = X;

  getAlertClass(type: ToastType): string {
    switch (type) {
      case 'success': return 'alert-success text-success-content';
      case 'error': return 'alert-error text-error-content';
      case 'warning': return 'alert-warning text-warning-content';
      default: return 'alert-info text-info-content';
    }
  }

  getTitle(type: ToastType): string {
    switch (type) {
      case 'success': return 'Succès';
      case 'error': return 'Erreur';
      case 'warning': return 'Attention';
      default: return 'Information';
    }
  }

  getIcon(type: ToastType) {
    switch (type) {
      case 'success': return this.successIcon;
      case 'error': return this.errorIcon;
      case 'warning': return this.warningIcon;
      default: return this.infoIcon;
    }
  }
}
