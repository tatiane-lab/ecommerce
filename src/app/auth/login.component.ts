import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, DEMO_CREDENTIALS } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth card">
      <h1>Entrar</h1>
      <p class="muted">Acesse sua conta para finalizar a compra.</p>

      <div class="demo" role="note">
        <strong>Conta demo</strong>
        <span>E-mail: <code>{{ demo.email }}</code></span>
        <span>Senha: <code>{{ demo.password }}</code></span>
        <button type="button" class="btn secondary" (click)="useDemo()" [disabled]="loading()">
          Entrar com conta demo
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label>E-mail
          <input type="email" formControlName="email" autocomplete="username" />
        </label>
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <small class="error">Informe um e-mail válido.</small>
        }
        <label>Senha
          <input type="password" formControlName="password" autocomplete="current-password" />
        </label>
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <small class="error">Informe a senha.</small>
        }
        @if (error(); as msg) {
          <p class="error" role="alert">{{ msg }}</p>
        }
        <button class="btn" type="submit" [disabled]="loading()">
          {{ loading() ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </section>
  `,
  styles: `
    .auth { max-width: 420px; margin: 3rem auto; }
    h1 { margin: 0 0 .25rem; }
    .demo { display: grid; gap: .35rem; background: var(--primary-soft); border: 1px dashed var(--primary);
      border-radius: var(--radius); padding: 1rem; margin: 1rem 0 1.25rem; font-size: .9rem; }
    .demo .btn { margin-top: .5rem; }
    code { background: #fff; padding: .1rem .4rem; border-radius: 4px; }
    form { display: grid; gap: .6rem; }
    label { display: grid; gap: .3rem; font-weight: 600; font-size: .9rem; }
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly demo = DEMO_CREDENTIALS;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: [DEMO_CREDENTIALS.email, [Validators.required, Validators.email]],
    password: [DEMO_CREDENTIALS.password, [Validators.required]],
  });

  protected useDemo(): void {
    this.form.setValue({ ...DEMO_CREDENTIALS });
    this.submit();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(email, password).subscribe({
      next: () => {
        const url = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
        void this.router.navigateByUrl(url.startsWith('/') ? url : '/products');
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }
}
