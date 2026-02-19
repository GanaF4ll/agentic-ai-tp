import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/layout/header.component';
import { SidebarComponent } from './shared/components/layout/sidebar.component';
import { FooterComponent } from './shared/components/layout/footer.component';
import { SidebarService } from './shared/components/layout/sidebar.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly sidebarService = inject(SidebarService);
  protected readonly title = signal('AlumniConnect');
}
