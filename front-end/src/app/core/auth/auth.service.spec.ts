import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and set user signal', () => {
    const mockResponse = {
      access: 'token',
      refresh: 'refresh',
      user: { id: 1, email: 'test@example.com', role: 'ADMIN', first_name: 'Test', last_name: 'User' }
    };

    service.login({ email: 'test@example.com', password: 'password' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login/');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.user()).toEqual(mockResponse.user);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/alumni']);
  });
});
