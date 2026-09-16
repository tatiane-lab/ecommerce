import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { Product, ProductsService } from './products.service';

type Sort = 'relevance' | 'price-asc' | 'price-desc' | 'rating';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h1>Produtos</h1>

      <div class="filters card">
        <input type="search" placeholder="Buscar produtos…" aria-label="Buscar produtos"
          [value]="search()" (input)="search.set($any($event.target).value)" />
        <select aria-label="Categoria" [value]="category()" (change)="category.set($any($event.target).value)">
          <option value="">Todas as categorias</option>
          @for (c of categories(); track c) { <option [value]="c">{{ c }}</option> }
        </select>
        <select aria-label="Ordenar" [value]="sort()" (change)="sort.set($any($event.target).value)">
          <option value="relevance">Relevância</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="rating">Melhor avaliação</option>
        </select>
      </div>

      @if (products.isLoading()) {
        <div class="grid" aria-busy="true" aria-label="Carregando produtos">
          @for (i of skeletons; track i) {
            <div class="card sk">
              <div class="skeleton img"></div>
              <div class="skeleton line"></div>
              <div class="skeleton line short"></div>
            </div>
          }
        </div>
      } @else if (products.error()) {
        <div class="card state" role="alert">
          <p>Não foi possível carregar os produtos.</p>
          <button class="btn" type="button" (click)="products.reload()">Tentar novamente</button>
        </div>
      } @else {
        <p class="muted count">{{ filtered().length }} produto(s)</p>
        <div class="grid">
          @for (p of filtered(); track p.id) {
            <article class="card product">
              <a [routerLink]="['/products', p.id]" class="thumb">
                <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" width="400" height="400" />
                @if (p.stock === 0) { <span class="tag out">Esgotado</span> }
                @else if (p.stock <= 5) { <span class="tag low">Últimas {{ p.stock }} unidades</span> }
              </a>
              <span class="muted cat">{{ p.category }}</span>
              <h3><a [routerLink]="['/products', p.id]">{{ p.name }}</a></h3>
              <p class="rating">★ {{ p.rating }} <span class="muted">({{ p.reviews }})</span></p>
              <div class="foot">
                <strong class="price">{{ p.price | currency: 'BRL' }}</strong>
                <button class="btn" type="button" (click)="add(p)" [disabled]="p.stock === 0">
                  {{ p.stock === 0 ? 'Indisponível' : 'Adicionar' }}
                </button>
              </div>
            </article>
          } @empty {
            <div class="card state wide">
              <p>Nenhum produto encontrado para os filtros atuais.</p>
              <button class="btn secondary" type="button" (click)="reset()">Limpar filtros</button>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: `
    h1 { margin: 0 0 1rem; }
    .filters { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: .75rem; padding: 1rem; margin-bottom: 1rem; }
    .count { margin: 0 0 .75rem; font-size: .9rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1.1rem; }
    .product { padding: 0 0 1rem; overflow: hidden; display: flex; flex-direction: column; gap: .25rem; transition: transform .15s, box-shadow .15s;
      &:hover { transform: translateY(-3px); } }
    .product > :not(.thumb) { margin-inline: 1rem; }
    .thumb { position: relative; display: block; margin-bottom: .6rem; }
    img { width: 100%; height: auto; aspect-ratio: 1; display: block; object-fit: cover; }
    .tag { position: absolute; top: .6rem; left: .6rem; padding: .2rem .55rem; border-radius: 99px; font-size: .72rem; font-weight: 700; color: #fff; }
    .tag.out { background: #6b7280; } .tag.low { background: #ea580c; }
    .cat { font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; }
    h3 { margin: 0; font-size: 1rem; } h3 a { color: inherit; text-decoration: none; }
    .rating { margin: 0; font-size: .85rem; color: #d97706; }
    .foot { display: flex; align-items: center; justify-content: space-between; margin-top: .6rem; gap: .5rem; }
    .price { font-size: 1.1rem; }
    .state { text-align: center; padding: 2.5rem 1rem; } .state.wide { grid-column: 1 / -1; }
    .sk { padding: 0 0 1rem; display: grid; gap: .6rem; overflow: hidden; }
    .sk .img { aspect-ratio: 1; border-radius: 0; } .sk .line { height: 14px; margin: 0 1rem; } .sk .short { width: 40%; }
    @media (max-width: 720px) { .filters { grid-template-columns: 1fr; } .grid { grid-template-columns: repeat(2, 1fr); gap: .7rem; } }
    @media (max-width: 420px) { .foot { flex-direction: column; align-items: stretch; } }
  `,
})
export class ProductListComponent {
  private readonly cart = inject(CartService);
  private readonly service = inject(ProductsService);

  protected readonly products = rxResource({ stream: () => this.service.getProducts() });
  protected readonly search = signal('');
  protected readonly category = signal('');
  protected readonly sort = signal<Sort>('relevance');
  protected readonly skeletons = Array.from({ length: 8 }, (_, i) => i);

  protected readonly categories = computed(() =>
    [...new Set((this.products.value() ?? []).map((p) => p.category))].sort(),
  );

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const cat = this.category();
    const list = (this.products.value() ?? []).filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!term || p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)),
    );
    switch (this.sort()) {
      case 'price-asc': return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating': return [...list].sort((a, b) => b.rating - a.rating);
      default: return list;
    }
  });

  protected add(p: Product): void {
    this.cart.addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl });
  }

  protected reset(): void {
    this.search.set('');
    this.category.set('');
    this.sort.set('relevance');
  }
}
