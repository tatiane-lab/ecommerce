import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { ProductsService, Product } from './products.service';

export const productsResolver: ResolveFn<Product[]> = () => {
  return inject(ProductsService).getProducts();
};

export const productDetailResolver: ResolveFn<Product> = (
  route: ActivatedRouteSnapshot
) => {
  const id = route.paramMap.get('id')!;
  return inject(ProductsService).getProductById(id);
};
