import { TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { AuthService } from '../../../core/auth/auth.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LUCIDE_ICONS, LucideIconProvider, UserPlus, ShieldCheck, Mail, Calendar, X, Send } from 'lucide-angular';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let authService: AuthService;

  beforeEach(async () => {
    const authServiceMock = {
      getUsers: vi.fn().mockReturnValue(of([])),
      isSuperAdmin: vi.fn().mockReturnValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [UserListComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { 
          provide: LUCIDE_ICONS, 
          multi: true, 
          useValue: new LucideIconProvider({ UserPlus, ShieldCheck, Mail, Calendar, X, Send }) 
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    const mockUsers = [
      { id: 1, first_name: 'Admin', last_name: 'User', email: 'admin@test.com', role: 'ADMIN', status: 'ACTIVE', must_change_password: false }
    ];
    (authService.getUsers as any).mockReturnValue(of(mockUsers));
    
    component.ngOnInit();
    
    expect(authService.getUsers).toHaveBeenCalled();
    expect(component.users()).toEqual(mockUsers);
    expect(component.stats().total).toBe(1);
  });
});
