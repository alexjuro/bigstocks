/* Autor: Alexander Schellenberg */

import { customElement } from 'lit/decorators.js';
import { LitElement, html } from 'lit';
import { property, query } from 'lit-element';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './market.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { StockService } from '../../../stock-service.js';
import { StockComponent } from '../stockcomponent.js';
import { stocks, Stock } from '../../../interfaces/stock-interface.js';

@customElement('app-market')
export class MarketComponent extends StockComponent {
  static styles = [sharedStyle, componentStyle, sharedTradingStyle];
  @property({ type: Array })
  userStocks: Stock[] = stocks;
  @property({ type: Object })
  stockService = new StockService();
  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.stockService.connectSocket();
    this.stockService.setObserver(this);
    this.sendSubscriptions();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stockService.closeSocket();
  }

  render() {
    return html`
      <div class="container">
        <h1 id="upp">Marketplace</h1>
        <div class="market-stocks" class="stock">
          ${this.userStocks.map(
            stock => html`
              <div class="market-stock" class="stock" id=${stock.symbol} @click=${this.handleStockClick}>
                <span id="dot${stock.symbol}" class="dot"></span>
                <img src="${stock.image}" alt="${stock.name} Logo" />
                <h2>${stock.name}</h2>
                <p id="price${stock.symbol}">Price: ${stock.price ? stock.price + '$' : 'N/A'}</p>
                <p class="percentages" id="perc${stock.symbol}">
                  ${stock.dailyPercentage ? stock.dailyPercentage + '%' : 'N/A'}
                </p>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }
}
