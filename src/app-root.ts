import { customElement, property, LitElement, html, css } from 'lit-element';

@customElement('app-root')
export class AppRoot extends LitElement {
  static get styles() {
    return css`
      :host {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        height: 100vh;
        display: flex;
        flex-direction: column;
        margin: 0 0.5em;
      }

      main {
        flex: 1;
      }
    `;
  }

  render() {
    return html`
      <main>
        <tun-pos-host>
          <tun-shopping-cart slot="shopping-cart"></tun-shopping-cart>
          <tun-catalogue slot="catalogue"></tun-catalogue>
          <tun-payments slot="payment"></tun-payments>
          <tun-printer slot="printer"></tun-printer>
          <tun-sale-history slot="sale-history"></tun-sale-history>
          <tun-scanner slot="scanner"></tun-scanner>
        </tun-pos-host>
      </main>
    `;
  }
}
