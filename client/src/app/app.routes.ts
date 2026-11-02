import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';

// Each feature owns its routes and is lazy-loaded.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadChildren: () => import('./features/products/products.routes').then((m) => m.PRODUCT_ROUTES),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ORDER_ROUTES),
  },
  { path: '**', redirectTo: 'dashboard' },
];
