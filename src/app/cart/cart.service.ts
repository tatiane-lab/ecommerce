import { Injectable, computed, effect, signal } from '@angular/core';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const CART_STORAGE_KEY = 'ng_ecommerce_cart';
export const TAX_RATE = 0.1;
export const FREE_SHIPPING_THRESHOLD = 500;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.load());
  readonly drawerOpen = signal(false);

  readonly items = this._items.asReadonly();
  readonly totalItems = computed(() => this._items().reduce((s, i) => s + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((s, i) => s + i.price * i.quantity, 0));
  readonly tax = computed(() => this.subtotal() * TAX_RATE);
  readonly total = computed(() => this.subtotal() + this.tax());
  readonly isEmpty = computed(() => this._items().length === 0);
  readonly freeShippingProgress = computed(() =>
    Math.min(100, (this.subtotal() / FREE_SHIPPING_THRESHOLD) * 100),
  );

  constructor() {
    effect(() => {
      const value = JSON.stringify(this._items());
      try {
        localStorage.setItem(CART_STORAGE_KEY, value);
      } catch {
        /* storage indisponível (modo privado) */
      }
    });
  }

  addItem(item: Omit<CartItem, 'quantity'>, openDrawer = true): void {
    this._items.update((items) =>
      items.some((i) => i.productId === item.productId)
        ? items.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i))
        : [...items, { ...item, quantity: 1 }],
    );
    if (openDrawer) this.drawerOpen.set(true);
  }

  removeItem(productId: string): void {
    this._items.update((items) => items.filter((i) => i.productId !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) return this.removeItem(productId);
    this._items.update((items) =>
      items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  }

  clear(): void {
    this._items.set([]);
  }

  private load(): CartItem[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]');
      return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
      return [];
    }
  }
}
