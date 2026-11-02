import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { errorMessage } from '@shared/utils/http-error';
import { Product } from '@shared/models/product.model';
import { ProductService } from '@features/products/services/product.service';

@Component({
  selector: 'app-products',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly svc = inject(ProductService);
  private readonly auth = inject(AuthService);

  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly formError = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });

  canModify(p: Product): boolean {
    return p.ownerId === this.auth.user()?.id;
  }

  ngOnInit(): void {
    this.svc.load();
  }

  edit(p: Product): void {
    this.editingId.set(p.id);
    this.form.setValue({ name: p.name, price: p.price, description: p.description });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancel(): void {
    this.editingId.set(null);
    this.formError.set('');
    this.form.reset({ name: '', price: 0, description: '' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    const value = this.form.getRawValue();
    const id = this.editingId();
    const request = id ? this.svc.update(id, value) : this.svc.create(value);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancel();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(errorMessage(err));
      },
    });
  }

  remove(p: Product): void {
    if (!confirm(`Delete "${p.name}"?`)) return;
    this.svc.remove(p.id).subscribe({ error: (err) => this.formError.set(errorMessage(err)) });
  }
}
