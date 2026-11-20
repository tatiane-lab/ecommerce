# LojaNg · E-commerce em Angular 22

Loja de demonstração (portfólio) com catálogo, busca/filtros, carrinho lateral persistido, login e checkout em múltiplas etapas. Funciona 100% no navegador: os dados são fictícios e a "API" é simulada com latência (RxJS `delay`).

## Credenciais demo

| E-mail | Senha |
|---|---|
| `demo@loja.dev` | `demo1234` |

A tela de login já vem pré-preenchida e tem o botão **Entrar com conta demo**. O checkout exige login. Cartão de teste: `4242424242424242` (qualquer validade `MM/AA` e CVV).

## Features

- Catálogo com skeletons de carregamento, estados de erro (com "tentar novamente") e vazio.
- Busca, filtro por categoria e ordenação (preço, avaliação).
- Detalhe do produto com galeria de imagens e dados vindos de um `ResolveFn` (redireciona se o produto não existe).
- Carrinho lateral (drawer) com quantidades, remoção, barra de frete grátis e totais; persistido em `localStorage`.
- Login com guard (`returnUrl`) e sessão persistida.
- Checkout em 3 etapas (entrega, pagamento, revisão) com validador assíncrono de cartão (Luhn, debounce) e confirmação de pedido.
- Imagens de produto geradas como SVG inline: nunca quebram, nem offline.
- Responsivo, acessível (foco visível, `aria-*`, `prefers-reduced-motion`).

## Stack

Angular 22 (standalone, signals, `rxResource`, control flow, `input()` via `withComponentInputBinding`), RxJS 7, SCSS, Vitest.

## Como rodar

```bash
npm install --legacy-peer-deps   # o peer range de @angular/build exige TypeScript 6
npm start                        # http://localhost:4200
npm run build
npm test
```

## Decisões de arquitetura

- **Componentes standalone + OnPush** em todo o app; rotas com `loadComponent` (lazy).
- **Estado com signals**: `CartService` expõe `computed` (subtotal, imposto, total, progresso de frete) e persiste via `effect()`; `AuthService` segue o mesmo padrão.
- **Sem backend**: serviços (`ProductsService`, `CheckoutService`, `AuthService`) devolvem `Observable` com delay, então trocar por `HttpClient` não muda os componentes.
- **Guards funcionais**: `authGuard` (redireciona ao login) e guard de carrinho vazio no checkout.
- **Formulários tipados** (`nonNullable.group`) e validador assíncrono com `timer + switchMap`.

```
src/app/
├── auth/       # AuthService, guard, login
├── cart/       # CartService, drawer
├── products/   # service, resolver, lista, detalhe
├── checkout/   # checkout multi-etapas, confirmação
└── shared/     # gerador de imagens SVG
```
