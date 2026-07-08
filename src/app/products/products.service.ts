import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { productImage } from '../shared/product-image';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  gallery: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
}

type Seed = Omit<Product, 'imageUrl' | 'gallery'> & { emoji: string; hue: number };

const SEEDS: Seed[] = [
  { id: 'p1', name: 'Fone Bluetooth Aura', emoji: '🎧', hue: 260, category: 'Áudio', price: 349.9, stock: 14, rating: 4.7, reviews: 212, description: 'Over-ear com cancelamento ativo de ruído, 40h de bateria e microfone com beamforming para chamadas nítidas.' },
  { id: 'p2', name: 'Smartwatch Pulse S2', emoji: '⌚', hue: 200, category: 'Wearables', price: 899, stock: 8, rating: 4.5, reviews: 148, description: 'Tela AMOLED, GPS integrado, monitor cardíaco 24h e resistência à água de 50 metros.' },
  { id: 'p3', name: 'Teclado Mecânico Keyra', emoji: '⌨️', hue: 330, category: 'Periféricos', price: 459.5, stock: 0, rating: 4.8, reviews: 301, description: 'Switches hot-swap, layout 75%, iluminação RGB por tecla e estrutura em alumínio.' },
  { id: 'p4', name: 'Mouse Ergonômico Flow', emoji: '🖱️', hue: 160, category: 'Periféricos', price: 189.9, stock: 32, rating: 4.4, reviews: 97, description: 'Formato vertical que reduz a tensão no pulso, sensor de 8000 DPI e conexão multi-dispositivo.' },
  { id: 'p5', name: 'Câmera Instantânea Snap', emoji: '📷', hue: 30, category: 'Foto & Vídeo', price: 629, stock: 5, rating: 4.3, reviews: 64, description: 'Fotos reveladas em segundos, flash automático e acabamento retrô em três cores.' },
  { id: 'p6', name: 'Caixa de Som Boom Mini', emoji: '🔊', hue: 15, category: 'Áudio', price: 259.9, stock: 41, rating: 4.6, reviews: 389, description: 'Portátil, à prova d’água IP67, 12h de bateria e som 360 graus.' },
  { id: 'p7', name: 'Monitor UltraWide 34"', emoji: '🖥️', hue: 220, category: 'Monitores', price: 2799, stock: 6, rating: 4.9, reviews: 76, description: 'Painel IPS 144Hz curvo, 1440p, HDR400 e hub USB-C com carregamento de 90W.' },
  { id: 'p8', name: 'Webcam Full HD Clear', emoji: '📹', hue: 290, category: 'Periféricos', price: 219, stock: 22, rating: 4.2, reviews: 120, description: 'Full HD 60fps, autofoco, correção de luz e tampa de privacidade física.' },
  { id: 'p9', name: 'Drone Compacto Sky', emoji: '🚁', hue: 190, category: 'Foto & Vídeo', price: 3190, stock: 3, rating: 4.7, reviews: 52, description: 'Vídeo 4K estabilizado, 30 min de voo, retorno automático e menos de 250g.' },
  { id: 'p10', name: 'Notebook Slim Air 14"', emoji: '💻', hue: 245, category: 'Computadores', price: 5490, stock: 9, rating: 4.8, reviews: 133, description: '14" OLED, 16GB RAM, SSD 512GB e bateria para o dia todo em apenas 1,2kg.' },
  { id: 'p11', name: 'Tablet Canvas 11"', emoji: '📱', hue: 120, category: 'Computadores', price: 2390, stock: 17, rating: 4.5, reviews: 88, description: 'Tela 120Hz com suporte a caneta, ideal para anotações, desenho e estudos.' },
  { id: 'p12', name: 'Fone Esportivo Run', emoji: '🎵', hue: 80, category: 'Áudio', price: 179.9, stock: 60, rating: 4.1, reviews: 215, description: 'True wireless com ganchos firmes, resistência a suor e 8h de reprodução.' },
];

const PRODUCTS: Product[] = SEEDS.map(({ emoji, hue, ...p }) => ({
  ...p,
  imageUrl: productImage(emoji, hue, 0),
  gallery: [0, 1, 2].map((v) => productImage(emoji, hue, v)),
}));

/** Catálogo em memória com latência simulada (sem backend). */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  getProducts(): Observable<Product[]> {
    return of(PRODUCTS).pipe(delay(700));
  }

  getProductById(id: string): Observable<Product> {
    const found = PRODUCTS.find((p) => p.id === id);
    return found
      ? of(found).pipe(delay(400))
      : throwError(() => new Error('Produto não encontrado'));
  }
}
