import {
  customElement,
  property,
  LitElement,
  html,
  internalProperty
} from 'lit-element';
import type { CartItem, IShoppingCart, Sale } from 'types/interfaces';
@customElement('tun-shopping-cart')
export class TunShoppingCart extends LitElement implements IShoppingCart {
  @internalProperty()
  _items: CartItem[] = [];

  get items(): CartItem[] {
    return this._items;
  }

  cleanUp() {
    this._items = [];
  }

  fillCart(items: CartItem[]) {
    this._items = [...items];
  }

  toPayment(): void {
    const amount = this.items.reduce(
      (prev, next) => prev + +(next[0].price * next[1]).toFixed(2),
      0
    );
    const sale: Sale = {
      amount,
      items: [...this.items],
      createdAt: new Date()
    };

    const evt = new CustomEvent<Sale>('on-to-payment', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: sale
    });
    this.dispatchEvent(evt);
  }

  onQtyUpdated(item: CartItem) {
    const evt = new CustomEvent<CartItem>('on-qty-updated', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: { ...item }
    });
    this.dispatchEvent(evt);
  }

  onItemRemoved(item: CartItem) {
    const evt = new CustomEvent<CartItem>('on-item-removed', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: { ...item }
    });
    this.dispatchEvent(evt);
  }

  private cartItem = (item: CartItem) => html`
    <tr>
      <td>
        <details>
          <summary>${item[0].name}</summary>
          ${item[0].description}
        </details>
      </td>
      <td>
        <input
          id="${item[0]._id}"
          name="${item[0]._id}"
          type="number"
          min="1"
          required
          .value="${item[1].toString()}"
          @change="${(e: Event) =>
            this.onQtyUpdated([
              item[0],
              Number((e.target as HTMLInputElement)?.value ?? 1)
            ])}"
        />
      </td>
      <td>${item[0].price.toFixed(2)}</td>
    </tr>
  `;

  render() {
    return html`
      <h2>Cart Items</h2>
      <form
        @submit="${(e: Event) => {
          e.preventDefault();
          this.toPayment();
        }}"
      >
        <table>
          <thead>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </thead>
          <tbody>
            ${this._items.length === 0
              ? html`
                  <tr>
                    <td colspan="3" style="text-align: center;">Empty Cart</td>
                  </tr>
                `
              : this._items.map(this.cartItem)}
          </tbody>
        </table>
        ${this._items.length === 0
          ? ''
          : html`<button type="submit">To Payment</button>`}
      </form>
    `;
  }
}
