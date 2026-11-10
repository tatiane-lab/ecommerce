import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card done">
      <p class="icon">✅</p>
      <h1>Pedido confirmado!</h1>
      <p>Número do pedido: <strong>{{ id() }}</strong></p>
      <p class="muted">Obrigada pela compra. (Pedido simulado: nenhum pagamento real foi feito.)</p>
      <a class="btn" routerLink="/products">Continuar comprando</a>
    </section>
  `,
  styles: `.done { max-width: 480px; margin: 3rem auto; text-align: center; } .icon { font-size: 3rem; margin: 0; }`,
})
export class OrderConfirmationComponent {
  readonly id = input.required<string>();
}
