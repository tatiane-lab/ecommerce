import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { CartService } from './cart/cart.service';
import { luhn } from './checkout/checkout.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.brand')?.textContent).toContain('Loja');
  });
});

describe('CartService', () => {
  const item = { productId: 'x', name: 'X', price: 100, imageUrl: '' };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('aggregates quantities and totals', () => {
    const cart = TestBed.inject(CartService);
    cart.addItem(item, false);
    cart.addItem(item, false);
    expect(cart.totalItems()).toBe(2);
    expect(cart.subtotal()).toBe(200);
    expect(cart.total()).toBeCloseTo(220);
  });

  it('removes item when quantity reaches zero', () => {
    const cart = TestBed.inject(CartService);
    cart.addItem(item, false);
    cart.updateQuantity('x', 0);
    expect(cart.isEmpty()).toBe(true);
  });
});

describe('luhn', () => {
  it('validates card numbers', () => {
    expect(luhn('4242424242424242')).toBe(true);
    expect(luhn('4242424242424243')).toBe(false);
  });
});
