import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { Product } from './products.service';

/** `product` chega via resolver + withComponentInputBinding. */
@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = product();
    <a routerLink="/products" class="back">← Voltar ao catálogo</a>
    <div class="layout">
      <div class="gallery">
        <img class="main card" [src]="selected() ?? p.gallery[0]" [alt]="p.name" width="600" height="600" />
        <div class="thumbs">
          @for (g of p.gallery; track g; let i = $index) {
            <button type="button" [class.active]="(selected() ?? p.gallery[0]) === g"
              (click)="selected.set(g)" [attr.aria-label]="'Imagem ' + (i + 1)">
              <img [src]="g" alt="" width="80" height="80" />
            </button>
          }
        </div>
      </div>
      <div class="info card">
        <span class="muted">{{ p.category }}</span>
        <h1>{{ p.name }}</h1>
        <p class="rating">★ {{ p.rating }} <span class="muted">({{ p.reviews }} avaliações)</span></p>
        <p class="price">{{ p.price | currency: 'BRL' }}</p>
        <p>{{ p.description }}</p>
        <p [class]="p.stock === 0 ? 'error' : 'ok'">
          {{ p.stock === 0 ? 'Produto esgotado' : p.stock + ' em estoque' }}
        </p>
        <button class="btn" type="button" (click)="add(p)" [disabled]="p.stock === 0">Adicionar ao carrinho</button>
      </div>
    </div>
  `,
  styles: `
    .back { display: inline-block; margin-bottom: 1rem; text-decoration: none; }
    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
    .main { width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; padding: 0; }
    .thumbs { display: flex; gap: .6rem; margin-top: .75rem; }
    .thumbs button { padding: 0; border: 2px solid transparent; border-radius: 10px; overflow: hidden; cursor: pointer; background: none; width: 80px; }
    .thumbs button.active { border-color: var(--primary); }
    .thumbs img { width: 100%; height: auto; display: block; }
    .info { display: grid; gap: .5rem; }
    h1 { margin: 0; } .rating { color: #d97706; margin: 0; } .price { font-size: 1.8rem; font-weight: 800; margin: .3rem 0; }
    .ok { color: var(--success); margin: 0; }
    @media (max-width: 760px) { .layout { grid-template-columns: 1fr; } }
  `,
})
export class ProductDetailComponent {
  readonly product = input.required<Product>();
  private readonly cart = inject(CartService);
  protected readonly selected = signal<string | null>(null);

  protected add(p: Product): void {
    this.cart.addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl });
  }
}
