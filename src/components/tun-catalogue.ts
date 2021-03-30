import {
  customElement,
  property,
  LitElement,
  html,
  internalProperty,
  css
} from 'lit-element';
import type { ICatalogue, Product } from 'types/interfaces';
import PouchDB from 'pouchdb-browser';

@customElement('tun-catalogue')
export class TunCatalogue extends LitElement implements ICatalogue {
  static get styles() {
    return css`
      .product-grid {
        display: grid;
        gap: 1em;
        grid-auto-flow: column;
        grid-template-rows: repeat(4, 1fr);
        grid-auto-columns: 1fr;
        justify-items: stretch;
        padding: 0;
      }

      .grid-item {
        cursor: pointer;
      }
    `;
  }
  dbname: string = 'catalogue';
  remote?: string;
  db = new PouchDB<Product>(this.dbname);
  private _remotedb?: PouchDB.Database<Product>;
  private _replicationHandler?: PouchDB.Replication.Replication<Product>;

  @internalProperty()
  private _products: Product[] = [];

  selectProduct(product: Product): void {
    const evt = new CustomEvent<Product>('on-select-product', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: product
    });
    this.dispatchEvent(evt);
  }

  async refreshResources() {
    if (!this._remotedb) return;
    try {
      const result = await this.db.replicate.from(this._remotedb);
      console.log(result);
    } catch (error) {
      console.warn({ error });
    }
    await this.getProducts();
  }

  async firstUpdated() {
    if (this.remote) {
      this._remotedb = new PouchDB(this.remote, {
        auth: { username: 'developer', password: 'developer123' }
      });
      try {
        const result = await this.db.sync(this._remotedb);
        console.log(result);
      } catch (error) {
        console.error(error);
      }
      this._replicationHandler = this.db.replicate
        .to(this._remotedb, { live: true })
        .on('active', console.log)
        .on('error', console.error);
    }
    await this.getProducts();
  }

  private async getProducts() {
    try {
      const products = await this.db.allDocs({ include_docs: true });
      this._products = products.rows
        .map(doc => doc.doc as Product)
        .sort((a, b) => (a.name > b.name ? 1 : -1));
    } catch (error) {
      console.warn({ error });
    }
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this._replicationHandler?.cancel();
    await Promise.allSettled([this.db.close(), this._remotedb?.close()]);
  }

  private renderProduct = (product: Product) => {
    return html`
      <li
        class="grid-item"
        @click="${(e: Event) => this.selectProduct(product)}"
      >
        <header>${product.name} - ${product.price}</header>
        <p>${product.description}</p>
      </li>
    `;
  };

  render() {
    return html`
      <header>
        <h1>Product Catalogue</h1>
        ${this._remotedb
          ? html`
              <button @click="${(e: Event) => this.refreshResources()}">
                Refresh Catalogue
              </button>
            `
          : ''}
      </header>
      <ul class="product-grid">
        ${this._products.map(this.renderProduct)}
      </ul>
    `;
  }
}
