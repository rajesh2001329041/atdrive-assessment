import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  it('stores the token and user after login', () => {
    service.login({ username: 'rajesh', password: 'secret123' }).subscribe();
    http.expectOne((r) => r.url.endsWith('/auth/login')).flush({ token: 'abc', user: { id: 1, username: 'rajesh' } });

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.user()?.username).toBe('rajesh');
    expect(localStorage.getItem('atdrive.token')).toBe('abc');
  });

  it('clears the session on logout', () => {
    service.login({ username: 'rajesh', password: 'secret123' }).subscribe();
    http.expectOne((r) => r.url.endsWith('/auth/login')).flush({ token: 'abc', user: { id: 1, username: 'rajesh' } });

    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('atdrive.token')).toBeNull();
  });
});
