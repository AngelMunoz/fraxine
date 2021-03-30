import {
  customElement,
  property,
  LitElement,
  html,
  query,
  internalProperty
} from 'lit-element';
import type { IPrinter, Sale } from 'types/interfaces';

@customElement('tun-printer')
export class TunPrinter extends LitElement implements IPrinter {
  @query('#print-area')
  private printArea?: HTMLIFrameElement;

  @query('#print-content')
  private printContent?: HTMLDivElement;

  @internalProperty()
  sale?: Sale;

  setSale(sale?: Sale) {
    this.sale = sale;
  }

  printReceipt() {
    const content = this.printContent?.cloneNode(true);
    if (!content) return;
    this.printArea?.contentDocument?.body?.appendChild(content);
    this.printArea?.contentWindow?.print();
    this.sale = undefined;
    this.printArea?.contentDocument?.body.removeChild(content);
    this.sale = undefined;
  }

  render() {
    return html`
      <div id="print-content">
        <ul>
          ${this.sale?.items.map(
            ([product, amount]) =>
              html`
                <li>
                  <span>${product.name} x ${amount}</span>
                  <strong>${(product.price * amount).toFixed(2)}</strong>
                </li>
              `
          )}
        </ul>
        ${this.sale ? html`<p>Total: ${this.sale?.amount.toFixed(2)}</p>` : ''}
      </div>
      <iframe id="print-area" style="display: none"></iframe>
    `;
  }
}
