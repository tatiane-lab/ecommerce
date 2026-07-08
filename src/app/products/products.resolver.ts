import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Product, ProductsService } from './products.service';

/** Resolve o produto; se não existir, redireciona para o catálogo. */
export const productDetailResolver: ResolveFn<Product | RedirectCommand> = (route) => {
  const router = inject(Router);
  return inject(ProductsService)
    .getProductById(route.paramMap.get('id') ?? '')
    .pipe(catchError(() => of(new RedirectCommand(router.parseUrl('/products')))));
};
