import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { CartService } from './cart/cart.service';
import { productDetailResolver } from './products/products.resolver';

/** Impede abrir o checkout com carrinho vazio. */
const cartNotEmptyGuard: CanActivateFn = () =>
  inject(CartService).isEmpty() ? inject(Router).createUrlTree(['/products']) : true;

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  {
    path: 'products',
    title: 'Produtos',
    loadComponent: () => import('./products/product-list.component').then((m) => m.ProductListComponent),
  },
  {
    path: 'products/:id',
    title: 'Produto',
    resolve: { product: productDetailResolver },
    loadComponent: () => import('./products/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'login',
    title: 'Entrar',
    loadComponent: () => import('./auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'checkout',
    title: 'Checkout',
    canActivate: [authGuard, cartNotEmptyGuard],
    loadComponent: () => import('./checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'order-confirmation/:id',
    title: 'Pedido confirmado',
    loadComponent: () =>
      import('./checkout/order-confirmation.component').then((m) => m.OrderConfirmationComponent),
  },
  { path: '**', redirectTo: 'products' },
];
