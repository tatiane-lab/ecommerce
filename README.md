# E-commerce

> Angular 22 · `@defer` · Skeleton Loaders · `computed` Cart · Multi-step Checkout · Async Validators · Route Resolvers

A product catalogue, shopping cart and multi-step checkout built with modern Angular primitives.

## Features

- **Persistent Cart with `computed`** – cart items live in a `signal<CartItem[]>()` backed by `localStorage` via `effect()`; `subtotal`, `tax`, `total`, and `isEmpty` are `computed()` values that update automatically.
- **`@defer` with Skeleton Placeholder** – the product grid uses `@defer (on viewport)` so it only loads when it enters the viewport; the `@placeholder` block shows skeleton cards; `@loading (minimum 300ms)` avoids flash-of-loading.
- **Route Resolvers** – `productsResolver` and `productDetailResolver` are `ResolveFn<T>` functions; routes use `withComponentInputBinding()` so resolved data flows directly into component `@Input()` signals.
- **Multi-step Checkout** – shipping → payment → review flow driven by a `signal<Step>()` with `computed()` for the step index; each step has its own typed `fb.nonNullable.group`.
- **Async Card Validator** – card number field uses an `AsyncValidatorFn` that debounces 600 ms with `timer(600).pipe(switchMap(...))` before hitting `/api/payments/validate`.

## Tech Stack

| Package | Version |
|---|---|
| `@angular/core` | ^22.3.0 |
| `@angular/router` | ^22.3.0 |
| `rxjs` | ~7.8.0 |

## Running locally

```bash
npm install
ng serve
```

## Architecture

```
src/app/
├── cart/
│   └── cart.service.ts       # signal + computed + localStorage effect
├── products/
│   ├── products.service.ts   # HTTP service
│   ├── products.resolver.ts  # ResolveFn<Product[]> and ResolveFn<Product>
│   └── product-list.component.ts  # @defer / @placeholder / @loading
└── checkout/
    ├── checkout.component.ts # multi-step form with async validator
    └── checkout.service.ts   # placeOrder + validateCard
```
