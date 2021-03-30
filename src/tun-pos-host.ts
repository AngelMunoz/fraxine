import { customElement, LitElement, html, property, css } from 'lit-element';
import type {
  CartItem,
  ICatalogue,
  IHost,
  IPayments,
  IPrinter,
  ISaleHistory,
  IShoppingCart,
  Product,
  Sale
} from 'types/interfaces';

@customElement('tun-pos-host')
export class TunPosHost extends LitElement implements IHost {
  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template:
          'header header cart' 45px
          'catalogue catalogue cart' 1fr
          'catalogue catalogue cart' 1fr
          'history history history' 1fr / 1fr 1fr 320px;

        gap: 0.5em;
        height: 100vh;
        overflow-y: auto;
      }
      .zone-header {
        grid-area: header;
        display: flex;
        margin: auto;
      }

      .zone-a {
        grid-area: catalogue;
        display: flex;
        overflow-y: auto;
        justify-content: stretch;
      }
      .zone-b {
        grid-area: cart;
        display: flex;
        flex-direction: column;
        place-items: center;
      }
      .zone-c {
        grid-area: history;
        display: flex;
        overflow: auto;
        justify-content: stretch;
      }
    `;
  }

  @property({ type: String })
  hostname = 'Tun POS Host';

  get catalogue(): (HTMLElement & ICatalogue) | null {
    return this.getFirstElementFromSlot('catalogue') as
      | (HTMLElement & ICatalogue)
      | null;
  }

  get shoppingCart(): (HTMLElement & IShoppingCart) | null {
    return this.getFirstElementFromSlot('shopping-cart') as
      | (HTMLElement & IShoppingCart)
      | null;
  }

  get payment(): (HTMLElement & IPayments) | null {
    return this.getFirstElementFromSlot('payment') as
      | (HTMLElement & IPayments)
      | null;
  }

  get printer(): (HTMLElement & IPrinter) | null {
    return this.getFirstElementFromSlot('printer') as
      | (HTMLElement & IPrinter)
      | null;
  }

  get saleHistory(): (HTMLElement & ISaleHistory) | null {
    return this.getFirstElementFromSlot('sale-history') as
      | (HTMLElement & ISaleHistory)
      | null;
  }

  firstUpdated() {
    if (this.catalogue)
      this.catalogue.remote = 'http://localhost:5984/catalogue';
    if (this.saleHistory)
      this.saleHistory.remote = 'http://localhost:5984/sales';
  }

  onQtyUpdated(event: CustomEvent<CartItem>): void {
    const items = this.shoppingCart?.items.map(item => {
      if (item[0]._id === event.detail[0]._id) {
        return event.detail;
      }
      return item;
    });
    this.shoppingCart?.fillCart(items ?? []);
  }

  onItemRemoved(event: CustomEvent<CartItem>): void {
    const items = this.shoppingCart?.items.filter(
      item => item[0]._id !== event.detail[0]._id
    );
    this.shoppingCart?.fillCart(items ?? []);
  }

  onSelectProduct(event: CustomEvent<Product>): void {
    const item =
      this.shoppingCart?.items.findIndex(
        item => item[0]._id === event.detail._id
      ) ?? -1;
    let items: CartItem[];
    if (item >= 0) {
      const found = this.shoppingCart?.items?.[item];
      if (found) {
        found[1]++;
      }
      items = [...(this.shoppingCart?.items ?? [])];
    } else {
      items = [...(this.shoppingCart?.items ?? []), [event.detail, 1]];
    }
    this.shoppingCart?.fillCart(items);
  }
  async onToPayment(event: CustomEvent<Sale>) {
    const result = await this.payment?.makePayment(event.detail);
    if (result) {
      this.saleHistory?.addSale(event.detail);
      this.printer?.setSale(event.detail);
      this.shoppingCart?.cleanUp();
    }
  }

  render() {
    return html`
      <header class="zone-header">
        <h4>${this.hostname}</h4>
      </header>
      <section class="zone-a">
        <slot
          name="catalogue"
          @on-select-product="${this.onSelectProduct}"
        ></slot>
      </section>
      <aside class="zone-b">
        <slot
          name="shopping-cart"
          @on-to-payment="${this.onToPayment}"
          @on-item-removed="${this.onItemRemoved}"
          @on-qty-updated="${this.onQtyUpdated}"
        ></slot>
      </aside>
      <section class="zone-c">
        <slot name="printer" style="display: none;"></slot>
        <slot name="payment" style="display: none;"></slot>
        <slot name="sale-history"></slot>
      </section>
    `;
  }

  private getFirstElementFromSlot(name: string): HTMLElement | null {
    const slot = this.shadowRoot?.querySelector(
      `slot[name=${name}]`
    ) as HTMLSlotElement | null;
    return slot?.assignedElements({ flatten: true })?.[0] as HTMLElement | null;
  }
}
