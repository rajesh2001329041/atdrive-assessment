import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { errorMessage } from '@shared/utils/http-error';
import { Product, ProductInput } from '@shared/models/product.model';

/** Holds product state (signals) so every component sees the same, up-to-date list. */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/products`;

  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal('');

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  load(): void {
    this._loading.set(true);
    this._error.set('');
    this.http.get<Product[]>(this.url).subscribe({
      next: (list) => {
        this._products.set(list);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(errorMessage(err));
        this._loading.set(false);
      },
    });
  }

  create(input: ProductInput): Observable<Product> {
    return this.http
      .post<Product>(this.url, input)
      .pipe(tap((p) => this._products.update((list) => [p, ...list])));
  }

  update(id: string, input: Partial<ProductInput>): Observable<Product> {
    return this.http
      .put<Product>(`${this.url}/${id}`, input)
      .pipe(tap((p) => this._products.update((list) => list.map((x) => (x.id === id ? p : x)))));
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(tap(() => this._products.update((list) => list.filter((x) => x.id !== id))));
  }
}
