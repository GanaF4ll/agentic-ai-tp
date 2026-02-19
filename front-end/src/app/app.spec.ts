import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({}) }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title in navbar', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar a')?.textContent).toContain('AlumniConnect');
  });
});
