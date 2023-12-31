/* Autor: Alexander Schellenberg */
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../../page.mixin';
import sharedStyle from '../../shared.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { router } from '../../../router/router';
import { UserStock } from '../stock-interface';

@customElement('app-trading-info')
export class TradingInfoComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedTradingStyle];

  static properties = {
    stock: { type: Object },
    buyStock: { type: Function },
    sellStock: { type: Function }
  };

  stock: UserStock = {
    shares: 0,
    name: '',
    symbol: '',
    image: '',
    price: 0,
    dailyPercentage: 0
  };

  get buyButton(): HTMLButtonElement | null {
    return this.shadowRoot?.querySelector('.buy') as HTMLButtonElement | null;
  }

  get sellButton(): HTMLButtonElement | null {
    return this.shadowRoot?.querySelector('.sell') as HTMLButtonElement | null;
  }

  get detailButton(): HTMLButtonElement | null {
    return this.shadowRoot?.querySelector('.stockdetails') as HTMLButtonElement | null;
  }

  get infoDiv(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.info-div') as HTMLElement | null;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  buyStock = (event: Event, stock: UserStock) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  sellStock = (event: Event, stock: UserStock) => {};

  render() {
    const { stock, buyStock, sellStock } = this;

    return html`
      <div class="info-div">
        <button class="buy" @click=${(event: Event) => buyStock(event, stock)}>
          Buy
          <img src="buy.png" alt="Buy" />
        </button>
        <button class="sell" @click=${(event: Event) => sellStock(event, stock)}>
          Sell
          <img src="sell.png" alt="Sell" />
        </button>
        <button class="stockdetails" @click=${() => this.navigateToDetails(stock)}>
          Details
          <img src="details.png" alt="Details" />
        </button>
      </div>
    `;
  }

  navigateToDetails(stock: UserStock) {
    const symbol = stock.symbol;
    const name = stock.name;
    router.navigate(`trading/details?symbol=${symbol}&name=${name}`);
  }
}
