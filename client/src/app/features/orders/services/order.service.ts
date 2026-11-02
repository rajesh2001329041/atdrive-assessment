import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { errorMessage } from '@shared/utils/http-error';
import { Order } from '@shared/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/orders`;

  private readonly _orders = signal<Order[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal('');

  readonly orders = this._orders.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  load(): void {
    this._loading.set(true);
    this._error.set('');
    this.http.get<Order[]>(this.url).subscribe({
      next: (list) => {
        this._orders.set(list);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(errorMessage(err));
        this._loading.set(false);
      },
    });
  }

  getById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.url}/${orderId}`);
  }

  create(productIds: string[]): Observable<Order> {
    return this.http
      .post<Order>(this.url, { productIds })
      .pipe(tap((o) => this._orders.update((list) => [o, ...list])));
  }

  update(orderId: number, productIds: string[]): Observable<Order> {
    return this.http
      .put<Order>(`${this.url}/${orderId}`, { productIds })
      .pipe(tap((o) => this._orders.update((list) => list.map((x) => (x.orderId === orderId ? o : x)))));
  }

  remove(orderId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${orderId}`)
      .pipe(tap(() => this._orders.update((list) => list.filter((x) => x.orderId !== orderId))));
  }
}
