import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;
  const keyboard = { id: '1', name: 'Keyboard', price: 49, description: '', ownerId: 1 };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  it('loads products into state', () => {
    service.load();
    http.expectOne((r) => r.url.endsWith('/products')).flush([keyboard]);
    expect(service.products()).toEqual([keyboard]);
    expect(service.loading()).toBeFalse();
  });

  it('exposes a friendly error when loading fails', () => {
    service.load();
    http.expectOne((r) => r.url.endsWith('/products')).flush({ message: 'boom' }, { status: 500, statusText: 'Error' });
    expect(service.error()).toBe('boom');
  });

  it('adds, updates and removes products in state', () => {
    service.create({ name: 'Keyboard', price: 49, description: '' }).subscribe();
    http.expectOne((r) => r.method === 'POST').flush(keyboard);
    expect(service.products().length).toBe(1);

    service.update('1', { price: 59 }).subscribe();
    http.expectOne((r) => r.method === 'PUT').flush({ ...keyboard, price: 59 });
    expect(service.products()[0].price).toBe(59);

    service.remove('1').subscribe();
    http.expectOne((r) => r.method === 'DELETE').flush(null);
    expect(service.products()).toEqual([]);
  });
});
