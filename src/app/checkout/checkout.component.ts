import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CartService } from '../cart/cart.service';
import { CheckoutService } from './checkout.service';

type Step = 'shipping' | 'payment' | 'review';
const STEPS: readonly Step[] = ['shipping', 'payment', 'review'];
const LABELS: Record<Step, string> = { shipping: 'Entrega', payment: 'Pagamento', review: 'Revisão' };

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Finalizar compra</h1>
    <ol class="steps">
      @for (s of steps; track s; let i = $index) {
        <li [class.active]="i === stepIndex()" [class.done]="i < stepIndex()">
          <span>{{ i + 1 }}</span> {{ labels[s] }}
        </li>
      }
    </ol>

    <div class="layout">
      <section class="card">
        @switch (step()) {
          @case ('shipping') {
            <form [formGroup]="shippingForm" class="form" (ngSubmit)="next()" novalidate>
              <label>Nome completo <input formControlName="fullName" autocomplete="name" /></label>
              <label>Endereço <input formControlName="address" autocomplete="street-address" /></label>
              <div class="two">
                <label>Cidade <input formControlName="city" autocomplete="address-level2" /></label>
                <label>CEP <input formControlName="zipCode" placeholder="00000-000" autocomplete="postal-code" /></label>
              </div>
              @if (shippingForm.touched && shippingForm.invalid) {
                <p class="error">Preencha todos os campos (CEP no formato 00000-000).</p>
              }
              <button class="btn" type="submit">Continuar</button>
            </form>
          }
          @case ('payment') {
            <form [formGroup]="paymentForm" class="form" (ngSubmit)="next()" novalidate>
              <p class="muted hint">Teste: use o cartão <code>4242424242424242</code>.</p>
              <label>Número do cartão
                <input formControlName="cardNumber" inputmode="numeric" maxlength="16" autocomplete="cc-number" />
              </label>
              @if (paymentForm.controls.cardNumber.pending) { <small class="muted">Validando…</small> }
              @if (paymentForm.controls.cardNumber.touched && paymentForm.controls.cardNumber.errors) {
                <small class="error">Número de cartão inválido.</small>
              }
              <label>Nome no cartão <input formControlName="cardName" autocomplete="cc-name" /></label>
              <div class="two">
                <label>Validade <input formControlName="expiry" placeholder="MM/AA" autocomplete="cc-exp" /></label>
                <label>CVV <input formControlName="cvv" inputmode="numeric" maxlength="4" autocomplete="cc-csc" /></label>
              </div>
              <div class="actions">
                <button class="btn ghost" type="button" (click)="prev()">Voltar</button>
                <button class="btn" type="submit" [disabled]="paymentForm.pending">Continuar</button>
              </div>
            </form>
          }
          @case ('review') {
            <div class="form">
              <h2>Confirme seu pedido</h2>
              <p><strong>Entrega:</strong> {{ shippingForm.getRawValue().fullName }},
                {{ shippingForm.getRawValue().address }} — {{ shippingForm.getRawValue().city }}</p>
              <p><strong>Cartão:</strong> final {{ last4() }}</p>
              @if (error(); as e) { <p class="error" role="alert">{{ e }}</p> }
              <div class="actions">
                <button class="btn ghost" type="button" (click)="prev()" [disabled]="submitting()">Voltar</button>
                <button class="btn" type="button" (click)="submit()" [disabled]="submitting()">
                  {{ submitting() ? 'Processando…' : 'Confirmar pedido' }}
                </button>
              </div>
            </div>
          }
        }
      </section>

      <aside class="card summary">
        <h2>Resumo</h2>
        @for (i of cart.items(); track i.productId) {
          <div class="row"><span>{{ i.quantity }}× {{ i.name }}</span><span>{{ i.price * i.quantity | currency: 'BRL' }}</span></div>
        }
        <hr />
        <div class="row"><span>Subtotal</span><span>{{ cart.subtotal() | currency: 'BRL' }}</span></div>
        <div class="row"><span>Impostos</span><span>{{ cart.tax() | currency: 'BRL' }}</span></div>
        <div class="row total"><span>Total</span><span>{{ cart.total() | currency: 'BRL' }}</span></div>
      </aside>
    </div>
  `,
  styles: `
    h1 { margin: 0 0 1rem; }
    .steps { display: flex; gap: 1rem; list-style: none; padding: 0; margin: 0 0 1.25rem; flex-wrap: wrap; }
    .steps li { display: flex; align-items: center; gap: .5rem; color: var(--muted); font-weight: 600; }
    .steps span { width: 26px; height: 26px; border-radius: 50%; background: var(--border); display: grid; place-items: center; font-size: .8rem; }
    .steps .active { color: var(--text); } .steps .active span, .steps .done span { background: var(--primary); color: #fff; }
    .layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1.25rem; align-items: start; }
    .form { display: grid; gap: .8rem; } label { display: grid; gap: .3rem; font-weight: 600; font-size: .9rem; }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; } .actions { display: flex; gap: .6rem; justify-content: space-between; }
    .hint { margin: 0; font-size: .85rem; } code { background: var(--primary-soft); padding: .1rem .35rem; border-radius: 4px; }
    .summary h2, .form h2 { margin: 0 0 .5rem; font-size: 1.1rem; }
    .row { display: flex; justify-content: space-between; gap: 1rem; font-size: .9rem; padding: .2rem 0; }
    .total { font-weight: 800; font-size: 1.1rem; } hr { border: 0; border-top: 1px solid var(--border); }
    @media (max-width: 820px) { .layout { grid-template-columns: 1fr; } .summary { order: -1; } }
  `,
})
export class CheckoutComponent {
  private readonly fb = inject(FormBuilder);
  private readonly checkout = inject(CheckoutService);
  private readonly router = inject(Router);
  protected readonly cart = inject(CartService);

  protected readonly steps = STEPS;
  protected readonly labels = LABELS;
  protected readonly step = signal<Step>('shipping');
  protected readonly stepIndex = computed(() => STEPS.indexOf(this.step()));
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly shippingForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
  });

  protected readonly paymentForm = this.fb.nonNullable.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)], [this.cardValidator()]],
    cardName: ['', Validators.required],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  protected last4(): string {
    return this.paymentForm.getRawValue().cardNumber.slice(-4);
  }

  protected next(): void {
    const form = this.step() === 'shipping' ? this.shippingForm : this.paymentForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.step.set(STEPS[Math.min(this.stepIndex() + 1, STEPS.length - 1)]);
  }

  protected prev(): void {
    this.step.set(STEPS[Math.max(this.stepIndex() - 1, 0)]);
  }

  protected submit(): void {
    this.submitting.set(true);
    this.error.set(null);
    this.checkout
      .placeOrder({
        items: this.cart.items(),
        shipping: this.shippingForm.getRawValue(),
        total: this.cart.total(),
      })
      .subscribe({
        next: (order) => {
          this.cart.clear();
          void this.router.navigate(['/order-confirmation', order.id]);
        },
        error: () => {
          this.error.set('Não foi possível concluir o pedido. Tente novamente.');
          this.submitting.set(false);
        },
      });
  }

  private cardValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);
      return timer(400).pipe(
        switchMap(() => this.checkout.validateCard(control.value as string)),
        map((r) => (r.valid ? null : { cardInvalid: true })),
        catchError(() => of(null)),
      );
    };
  }
}
