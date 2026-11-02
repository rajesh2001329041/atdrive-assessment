import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { errorMessage } from '@shared/utils/http-error';
import { Weather } from '@shared/models/weather.model';
import { OrderService } from '@features/orders/services/order.service';
import { ProductService } from '@features/products/services/product.service';
import { WeatherService } from '@features/dashboard/services/weather.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly products = inject(ProductService);
  protected readonly orders = inject(OrderService);
  private readonly weatherService = inject(WeatherService);

  readonly cityName = signal('Hyderabad');
  readonly weather = signal<Weather | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly totalOrdered = computed(() => this.orders.orders().reduce((sum, o) => sum + o.totalAmount, 0));

  ngOnInit(): void {
    this.products.load();
    this.orders.load();
    this.search(this.cityName());
  }

  search(city: string): void {
    const name = city.trim();
    if (!name) return;
    this.cityName.set(name);
    this.loading.set(true);
    this.error.set('');
    this.weatherService.getWeather(name).subscribe({
      next: (w) => {
        this.weather.set(w);
        this.loading.set(false);
      },
      error: (err) => {
        this.weather.set(null);
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
