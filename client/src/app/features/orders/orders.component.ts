import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { errorMessage } from '@shared/utils/http-error';
import { Order } from '@shared/models/order.model';
import { OrderService } from '@features/orders/services/order.service';
import { ProductService } from '@features/products/services/product.service';

@Component({
  selector: 'app-orders',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  protected readonly products = inject(ProductService);
  protected readonly orderSvc = inject(OrderService);

  readonly qty = signal<Partial<Record<string, number>>>({});
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal('');
  readonly lookupResult = signal<Order | null>(null);
  readonly lookupError = signal('');

  // One id per unit of quantity, which is the shape the API expects.
  readonly selectedIds = computed(() =>
    Object.entries(this.qty()).flatMap(([id, n]) => Array<string>(n ?? 0).fill(id)),
  );
  readonly estimatedTotal = computed(() =>
    this.products.products().reduce((sum, p) => sum + p.price * (this.qty()[p.id] ?? 0), 0),
  );

  ngOnInit(): void {
    this.products.load();
    this.orderSvc.load();
  }

  setQty(productId: string, value: number): void {
    const n = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    this.qty.update((q) => ({ ...q, [productId]: n }));
  }

  describe(order: Order): string[] {
    const counts = new Map<string, number>();
    order.productIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
    return [...counts].map(([id, n]) => {
      const name = this.products.products().find((p) => p.id === id)?.name ?? 'Deleted product';
      return n > 1 ? `${name} ×${n}` : name;
    });
  }

  startEdit(order: Order): void {
    const q: Record<string, number> = {};
    order.productIds.forEach((id) => (q[id] = (q[id] ?? 0) + 1));
    this.qty.set(q);
    this.editingId.set(order.orderId);
    this.formError.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.qty.set({});
    this.formError.set('');
  }

  submit(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) {
      this.formError.set('Select at least one product.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    const id = this.editingId();
    const request = id ? this.orderSvc.update(id, ids) : this.orderSvc.create(ids);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelEdit();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(errorMessage(err));
      },
    });
  }

  remove(order: Order): void {
    if (!confirm(`Delete order #${order.orderId}?`)) return;
    this.orderSvc.remove(order.orderId).subscribe({ error: (err) => this.formError.set(errorMessage(err)) });
  }

  lookup(orderId: number): void {
    this.lookupResult.set(null);
    this.lookupError.set('');
    if (!Number.isInteger(orderId) || orderId < 1) {
      this.lookupError.set('Enter a valid order ID.');
      return;
    }
    this.orderSvc.getById(orderId).subscribe({
      next: (o) => this.lookupResult.set(o),
      error: (err) => this.lookupError.set(errorMessage(err)),
    });
  }
}
