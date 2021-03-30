import {
  customElement,
  LitElement,
  html,
  query,
  internalProperty
} from 'lit-element';
import type { IPayments, Sale } from 'types/interfaces';

@customElement('tun-payments')
export class TunPayments extends LitElement implements IPayments {
  @internalProperty()
  sale?: Sale;

  render() {
    return html` <h1>Tun Payments</h1> `;
  }

  async makePayment(sale: Sale): Promise<boolean> {
    this.sale = sale;
    const details: PaymentDetailsInit = {
      total: {
        amount: { currency: 'MXN', value: sale.amount.toFixed(2) },
        label: 'Total'
      },
      displayItems: sale.items.map(([product, amount]) => {
        return {
          amount: {
            currency: 'MXN',
            value: (product.price * amount).toFixed(2)
          },
          label: `${product.name} x ${amount}`
        };
      })
    };
    const payment = new PaymentRequest(
      [{ supportedMethods: 'basic-card' }],
      details
    );
    try {
      const result = await payment.show();
      // send information to your backend
      // do the payment and return the appropiate response
      await result.complete();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
