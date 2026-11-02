import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  it('adds the bearer token when logged in', () => {
    localStorage.setItem('atdrive.token', 't0ken');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([])],
    });
    TestBed.inject(HttpClient).get('/api/products').subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/products');
    expect(req.request.headers.get('Authorization')).toBe('Bearer t0ken');
  });

  it('logs out when the API answers 401', () => {
    const spy = spyOn(auth, 'logout');
    http.get('/api/products').subscribe({ error: () => undefined });
    controller.expectOne('/api/products').flush({ message: 'expired' }, { status: 401, statusText: 'Unauthorized' });
    expect(spy).toHaveBeenCalled();
  });
});
