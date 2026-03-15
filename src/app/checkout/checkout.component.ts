import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { CartService } from '../cart/cart.service';
import { CheckoutService } from './checkout.service';

type Step = 'shipping' | 'payment' | 'review';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private checkoutService = inject(CheckoutService);
  private router = inject(Router);

  steps: Step[] = ['shipping', 'payment', 'review'];
  currentStep = signal<Step>('shipping');
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  currentStepIndex = computed(() =>
    this.steps.indexOf(this.currentStep())
  );

  cartItems = this.cartService.items;
  total = this.cartService.total;

  shippingForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
    country: ['BR', [Validators.required]],
  });

  paymentForm = this.fb.nonNullable.group({
    cardNumber: [
      '',
      [Validators.required, Validators.pattern(/^\d{16}$/)],
      [this.cardValidator()],
    ],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    cardName: ['', [Validators.required]],
  });

  ngOnInit() {
    if (this.cartService.isEmpty()) {
      this.router.navigate(['/products']);
    }
  }

  nextStep() {
    const forms: Record<Step, typeof this.shippingForm | null> = {
      shipping: this.shippingForm,
      payment: this.paymentForm as never,
      review: null,
    };

    const form = forms[this.currentStep()];
    if (form && form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const index = this.currentStepIndex();
    if (index < this.steps.length - 1) {
      this.currentStep.set(this.steps[index + 1]);
    }
  }

  prevStep() {
    const index = this.currentStepIndex();
    if (index > 0) {
      this.currentStep.set(this.steps[index - 1]);
    }
  }

  submitOrder() {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.checkoutService
      .placeOrder({
        items: this.cartItems(),
        shipping: this.shippingForm.getRawValue(),
        payment: this.paymentForm.getRawValue(),
      })
      .subscribe({
        next: (order) => {
          this.cartService.clear();
          this.router.navigate(['/order-confirmation', order.id]);
        },
        error: (err) => {
          this.error.set(err.message);
          this.isSubmitting.set(false);
        },
      });
  }

  private cardValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);
      return timer(600).pipe(
        switchMap(() =>
          this.checkoutService.validateCard(control.value).pipe(
            map((result) => (result.valid ? null : { cardInvalid: true })),
            catchError(() => of(null))
          )
        )
      );
    };
  }
}
