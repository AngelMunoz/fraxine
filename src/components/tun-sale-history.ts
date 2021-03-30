import {
  customElement,
  property,
  LitElement,
  html,
  css,
  internalProperty
} from 'lit-element';
import type { ISaleHistory, Sale } from 'types/interfaces';
import PouchDB from 'pouchdb-browser';
import { formatCurrency, formatDateTime } from '../utils.js';

@customElement('tun-sale-history')
export class TunSaleHistory extends LitElement implements ISaleHistory {
  static get styles() {
    return css`
      header {
        position: sticky;
        top: 0;
        background-color: white;
      }
      ul {
        padding: 0;
        display: grid;
        gap: 1em;
        grid-auto-flow: column;
        grid-template-rows: repeat(4, 1fr);
        grid-auto-columns: 1fr;
        justify-items: stretch;
      }
      li {
        list-style: none;
      }
    `;
  }

  dbname: string = 'sales';
  remote?: string;
  db = new PouchDB<Sale>(this.dbname);
  private _remotedb?: PouchDB.Database<Sale>;
  private _replicationHandler?: PouchDB.Replication.Sync<Sale>;

  @internalProperty()
  private _sales: Sale[] = [];

  async refreshResources() {
    if (!this._remotedb) return;
    try {
      const result = await this.db.replicate.from(this._remotedb);
      await this.getSales();
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }

  async addSale(sale: Sale): Promise<boolean> {
    try {
      const result = await this.db.post(sale);
      this._sales = [sale, ...this._sales];
      return result.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async firstUpdated() {
    if (this.remote) {
      this._remotedb = new PouchDB(this.remote, {
        auth: { username: 'developer', password: 'developer123' }
      });
      this._replicationHandler = this.db
        .sync(this._remotedb, {
          live: true,
          retry: true
        })
        .on('active', console.log)
        .on('error', console.error);
    }
    await this.getSales();
  }

  private async getSales() {
    try {
      const sales = await this.db.allDocs({ include_docs: true });
      this._sales = sales.rows
        .map(({ doc }) => {
          return {
            ...doc,
            createdAt: new Date((doc as Sale).createdAt)
          } as Sale;
        })
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      console.log(this._sales);
    } catch (error) {
      console.error(error);
    }
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this._replicationHandler?.cancel();
    await Promise.allSettled([this.db.close(), this._remotedb?.close()]);
  }

  render() {
    return html`
      <header>
        <h3>Sale History</h3>
        <button @click="${(e: Event) => this.refreshResources()}">
          Refresh History
        </button>
      </header>
      <ul>
        ${this._sales.map(
          sale =>
            html`<li>
              ${formatCurrency(sale.amount)} -
              ${formatDateTime(sale.createdAt as Date)}
            </li>`
        )}
      </ul>
    `;
  }
}
