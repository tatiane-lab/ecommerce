import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { CartItem } from '../cart/cart.service';

export interface OrderPayload {
  items: CartItem[];
  shipping: Record<string, string>;
  total: number;
}

export interface Order {
  id: string;
  status: 'confirmed';
  createdAt: string;
}

/** Algoritmo de Luhn para validar o número do cartão. */
export function luhn(value: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = value.length - 1; i >= 0; i--) {
    let n = Number(value[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return value.length > 0 && sum % 10 === 0;
}

/** Simula a API de pagamentos/pedidos (sem backend). */
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  placeOrder(_payload: OrderPayload): Observable<Order> {
    const order: Order = {
      id: 'PED-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    return of(order).pipe(delay(1000));
  }

  validateCard(cardNumber: string): Observable<{ valid: boolean }> {
    return of({ valid: luhn(cardNumber) }).pipe(delay(300));
  }
}
