import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../cart/cart.service';

interface OrderPayload {
  items: CartItem[];
  shipping: Record<string, string>;
  payment: Record<string, string>;
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http = inject(HttpClient);

  placeOrder(payload: OrderPayload): Observable<Order> {
    return this.http.post<Order>('/api/orders', payload);
  }

  validateCard(cardNumber: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>('/api/payments/validate', {
      cardNumber,
    });
  }
}
