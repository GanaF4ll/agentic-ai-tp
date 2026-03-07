import { TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LUCIDE_ICONS, LucideIconProvider, Lock, Eye, EyeOff } from 'lucide-angular';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let authService: AuthService;

  beforeEach(async () => {
    const authServiceMock = {
      resetPassword: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { 
          provide: LUCIDE_ICONS, 
          multi: true, 
          useValue: new LucideIconProvider({ Lock, Eye, EyeOff }) 
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate password match', () => {
    component.resetForm.patchValue({
      currentPassword: 'oldPassword',
      newPassword: 'NewPassword123',
      confirmPassword: 'NewPassword123'
    });
    expect(component.resetForm.valid).toBe(true);

    component.resetForm.patchValue({
      confirmPassword: 'DifferentPassword123'
    });
    expect(component.resetForm.hasError('mismatch')).toBe(true);
  });

  it('should call authService.resetPassword on submit', () => {
    component.resetForm.patchValue({
      currentPassword: 'oldPassword',
      newPassword: 'NewPassword123',
      confirmPassword: 'NewPassword123'
    });
    
    (authService.resetPassword as any).mockReturnValue(of({}));
    
    component.onSubmit();
    
    expect(authService.resetPassword).toHaveBeenCalledWith('oldPassword', 'NewPassword123');
  });
});
