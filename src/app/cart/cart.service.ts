import { Injectable, signal, computed, effect } from '@angular/core';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const CART_STORAGE_KEY = 'ng_ecommerce_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>(this.loadFromStorage());

  items = this._items.asReadonly();

  totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  subtotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  tax = computed(() => this.subtotal() * 0.1);

  total = computed(() => this.subtotal() + this.tax());

  isEmpty = computed(() => this._items().length === 0);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this._items()));
      } catch {
        // localStorage not available (SSR, private mode)
      }
    });
  }

  addItem(item: Omit<CartItem, 'quantity'>): void {
    this._items.update((items) => {
      const existing = items.find((i) => i.productId === item.productId);
      if (existing) {
        return items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...items, { ...item, quantity: 1 }];
    });
  }

  removeItem(productId: string): void {
    this._items.update((items) =>
      items.filter((i) => i.productId !== productId)
    );
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this._items.update((items) =>
      items.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }

  clear(): void {
    this._items.set([]);
  }

  private loadFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
