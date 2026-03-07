import { Component, Injectable, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'ac-theme';
  private _theme = signal<'light' | 'dark'>(this.getSavedTheme());

  theme = this._theme.asReadonly();
  isDark = computed(() => this._theme() === 'dark');

  constructor() {
    effect(() => {
      document.documentElement.setAttribute('data-theme', this._theme());
      localStorage.setItem(this.STORAGE_KEY, this._theme());
    });
  }

  toggle(): void {
    this._theme.update(current => (current === 'light' ? 'dark' : 'light'));
  }

  private getSavedTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button 
      class="btn btn-ghost btn-circle text-base-content/60 hover:text-primary transition-colors" 
      (click)="themeService.toggle()"
      [title]="themeService.isDark() ? 'Passer au mode clair' : 'Passer au mode sombre'"
    >
      @if (themeService.isDark()) {
        <lucide-angular [img]="sunIcon" class="size-5"></lucide-angular>
      } @else {
        <lucide-angular [img]="moonIcon" class="size-5"></lucide-angular>
      }
    </button>
  `
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  readonly sunIcon = Sun;
  readonly moonIcon = Moon;
}
