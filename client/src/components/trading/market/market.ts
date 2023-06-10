/* Autor: Alexander Schellenberg */

import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { property, state } from 'lit-element';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './market.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { StockService } from '../../../stock-service.js';
import { TradingComponent } from '../tradingcomponent.js';
import { UserStock } from '../stock-interface.js';
import { httpClient } from '../../../http-client';
import { router } from '../../../router/router';

@customElement('app-market')
export class MarketComponent extends TradingComponent {
  static styles = [sharedStyle, componentStyle, sharedTradingStyle];
  static publicUrl = './../../../../public/';
  @state() searchText = '';
  @property({ type: Object })
  stockService = new StockService();
  constructor() {
    super();
  }

  async firstUpdated() {
    this.dispatchEvent(new CustomEvent('update-pagename', { detail: 'Market', bubbles: true, composed: true }));
    try {
      this.startAsyncInit();
      const response = await httpClient.get('trading/market' + location.search);
      const data = await response.json();
      const userTransactions = data.results;
      this.money = data.money;
      this.userStocks = userTransactions.map((transaction: UserStock) => ({
        name: transaction.name,
        symbol: transaction.symbol,
        price: 0,
        image: transaction.image,
        shares: transaction.shares,
        dailyPercentage: 0
      }));
      this.stockService.setObserver(this);
      await this.stockService.connectSocket();
      this.sendSubscriptions();
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit();
    }
  }

  /*

  async connectedCallback() {
    super.connectedCallback();
    await httpClient.get('/users/auth').catch((e: { statusCode: number }) => {
      if (e.statusCode === 401) router.navigate('/users/sign-in');
    });
  }

  */

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stockService.closeSocket();
  }

  handleSearchInput(event: InputEvent) {
    const inputElement = event.target as HTMLInputElement;
    this.searchText = inputElement.value;
  }

  render() {
    const filteredStocks = this.userStocks.filter(stock =>
      stock.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
    return html`
      ${this.renderNotification()}
      <div class="container">
        <app-trading-notification></app-trading-notification>
        <h1 class="upp">Marketplace</h1>
        <div>
          <p class="account" style="color: #E58400">
            <img src="${this.publicUrl}dollar.png" alt="Cash Icon" class="icon" /> ${this.money}$
          </p>
          <p class="account" style="color: #663399">
            <img src="${this.publicUrl}stock.png" alt="Stocks Icon" class="icon" />
            ${this.calculateTotalValue()}$
          </p>
        </div>
        <div class="search-bar">
          <input type="text" placeholder="Search stocks..." @input=${this.handleSearchInput} />
        </div>
        <div class="market-stocks">
          ${filteredStocks.map(
            stock => html`
              <app-stock class="stock" id=${stock.symbol}>
                <img src="${stock.image}" alt="${stock.name} Logo" />
                <h2 @click=${(event: MouseEvent) => this.handleStockClick(event, stock)}>${stock.name}</h2>
                <p class="prices" id="price${stock.symbol}">Price: ${stock.price ? stock.price + '$' : 'N/A'}</p>
                <p
                  class="percentages"
                  id="perc${stock.symbol}"
                  style="color: ${stock.dailyPercentage >= 0 ? 'green' : 'red'}"
                >
                  ${stock.dailyPercentage ? stock.dailyPercentage + '%' : 'N/A'}
                </p>
                ${stock.shares > 0 ? html` <p class="shares" id="shares${stock.symbol}">${stock.shares}x</p> ` : ''}
              </app-stock>
            `
          )}
        </div>
      </div>
    `;
  }
}
