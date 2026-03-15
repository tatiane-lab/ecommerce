import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { Product } from './products.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  template: `
    <section class="product-list">
      <h1>Products</h1>

      @defer (on viewport) {
        <div class="grid">
          @for (product of filteredProducts(); track product.id) {
            <article class="product-card">
              <img [src]="product.imageUrl" [alt]="product.name" loading="lazy" />
              <h3>{{ product.name }}</h3>
              <p class="price">{{ product.price | currency }}</p>
              <p class="rating">★ {{ product.rating }}</p>
              <button
                (click)="addToCart(product)"
                [disabled]="product.stock === 0"
              >
                {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
              </button>
            </article>
          } @empty {
            <p class="empty">No products found.</p>
          }
        </div>
      } @placeholder {
        <div class="skeleton-grid">
          @for (i of skeletons; track i) {
            <div class="skeleton-card">
              <div class="skeleton-img"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text short"></div>
            </div>
          }
        </div>
      } @loading (minimum 300ms) {
        <div class="loading-overlay">Loading products…</div>
      }
    </section>
  `,
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cartService = inject(CartService);

  products = signal<Product[]>([]);
  searchTerm = signal('');
  skeletons = Array(8).fill(0);

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return !term
      ? this.products()
      : this.products().filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );
  });

  ngOnInit() {
    const resolved = this.route.snapshot.data['products'] as Product[];
    this.products.set(resolved);
  }

  addToCart(product: Product) {
    this.cartService.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  }
}
