import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer footer-center p-6 bg-base-100 text-base-content border-t border-base-300">
      <aside class="flex flex-col gap-2">
        <p class="font-bold text-lg text-primary">AlumniConnect</p>
        <p>© 2026 AlumniConnect - Propulser le réseau des alumni</p>
        <div class="flex gap-4 mt-2">
          <a class="link link-hover">À propos</a>
          <a class="link link-hover">Politique de confidentialité</a>
          <a class="link link-hover">Contact</a>
        </div>
      </aside>
    </footer>
  `
})
export class FooterComponent {}
