import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FREE_SHIPPING_THRESHOLD, CartService } from './cart.service';

@Component({
  selector: 'app-cart-drawer',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cart.drawerOpen()) {
      <div class="backdrop" (click)="close()"></div>
      <aside class="drawer" role="dialog" aria-modal="true" aria-label="Carrinho">
        <header>
          <h2>Seu carrinho ({{ cart.totalItems() }})</h2>
          <button class="btn ghost" type="button" (click)="close()" aria-label="Fechar carrinho">✕</button>
        </header>

        @if (cart.isEmpty()) {
          <div class="empty">
            <p class="big">🛒</p>
            <p>Seu carrinho está vazio.</p>
            <button class="btn" type="button" (click)="close()">Continuar comprando</button>
          </div>
        } @else {
          <div class="ship">
            @if (cart.freeShippingProgress() >= 100) {
              <span>Você ganhou frete grátis! 🎉</span>
            } @else {
              <span>Faltam {{ threshold - cart.subtotal() | currency: 'BRL' }} para frete grátis</span>
            }
            <div class="bar"><i [style.width.%]="cart.freeShippingProgress()"></i></div>
          </div>

          <ul>
            @for (item of cart.items(); track item.productId) {
              <li>
                <img [src]="item.imageUrl" [alt]="item.name" />
                <div class="info">
                  <strong>{{ item.name }}</strong>
                  <span class="muted">{{ item.price | currency: 'BRL' }}</span>
                  <div class="qty">
                    <button type="button" (click)="cart.updateQuantity(item.productId, item.quantity - 1)" [attr.aria-label]="'Diminuir ' + item.name">−</button>
                    <span>{{ item.quantity }}</span>
                    <button type="button" (click)="cart.updateQuantity(item.productId, item.quantity + 1)" [attr.aria-label]="'Aumentar ' + item.name">+</button>
                    <button type="button" class="rm" (click)="cart.removeItem(item.productId)">Remover</button>
                  </div>
                </div>
                <strong>{{ item.price * item.quantity | currency: 'BRL' }}</strong>
              </li>
            }
          </ul>

          <footer>
            <div class="row"><span>Subtotal</span><span>{{ cart.subtotal() | currency: 'BRL' }}</span></div>
            <div class="row"><span>Impostos (10%)</span><span>{{ cart.tax() | currency: 'BRL' }}</span></div>
            <div class="row total"><span>Total</span><span>{{ cart.total() | currency: 'BRL' }}</span></div>
            <button class="btn block" type="button" (click)="checkout()">Finalizar compra</button>
          </footer>
        }
      </aside>
    }
  `,
  styles: `
    .backdrop { position: fixed; inset: 0; background: rgb(15 23 42 / 45%); z-index: 40; }
    .drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100%); background: #fff;
      z-index: 50; display: flex; flex-direction: column; box-shadow: -8px 0 32px rgb(0 0 0 / 15%);
      animation: slide .22s ease-out; }
    @keyframes slide { from { transform: translateX(100%); } }
    header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); }
    h2 { margin: 0; font-size: 1.1rem; }
    .empty { margin: auto; text-align: center; padding: 2rem; }
    .big { font-size: 3rem; margin: 0; }
    .ship { padding: .8rem 1.25rem; font-size: .85rem; background: var(--primary-soft); }
    .bar { height: 6px; background: #fff; border-radius: 99px; margin-top: .4rem; overflow: hidden; }
    .bar i { display: block; height: 100%; background: var(--primary); transition: width .3s; }
    ul { list-style: none; margin: 0; padding: 0 1.25rem; overflow-y: auto; flex: 1; }
    li { display: grid; grid-template-columns: 64px 1fr auto; gap: .8rem; padding: 1rem 0; border-bottom: 1px solid var(--border); align-items: start; }
    img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; }
    .info { display: grid; gap: .2rem; font-size: .9rem; }
    .qty { display: flex; align-items: center; gap: .5rem; }
    .qty button { width: 26px; height: 26px; border: 1px solid var(--border); background: #fff; border-radius: 6px; cursor: pointer; }
    .qty .rm { width: auto; border: 0; color: var(--danger); font-size: .8rem; padding: 0 .3rem; }
    footer { padding: 1rem 1.25rem 1.25rem; border-top: 1px solid var(--border); display: grid; gap: .4rem; }
    .row { display: flex; justify-content: space-between; font-size: .9rem; }
    .total { font-weight: 800; font-size: 1.1rem; margin-bottom: .5rem; }
  `,
})
export class CartDrawerComponent {
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);
  protected readonly threshold = FREE_SHIPPING_THRESHOLD;

  @HostListener('document:keydown.escape')
  protected close(): void {
    this.cart.drawerOpen.set(false);
  }

  protected checkout(): void {
    this.close();
    void this.router.navigateByUrl('/checkout');
  }
}
