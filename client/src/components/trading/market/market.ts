/* Autor: Alexander Schellenberg */

import { customElement } from 'lit/decorators.js';
import { LitElement, html } from 'lit';
import { property, query, state } from 'lit-element';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './market.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { StockService } from '../../../stock-service.js';
import { TradingComponent } from '../tradingcomponent.js';
import { stocks, Stock } from '../../../interfaces/stock-interface.js';
import { httpClient } from '../../../http-client';
import { router } from '../../../router/router';

@customElement('app-market')
export class MarketComponent extends TradingComponent {
  static styles = [sharedStyle, componentStyle, sharedTradingStyle];
  @state() userStocks: Stock[] = stocks;
  @property({ type: Object })
  stockService = new StockService();
  constructor() {
    super();
  }

  async firstUpdated() {
    try {
      this.startAsyncInit();
      const newStatusJSON = await httpClient.get('/users/new' + location.search);
      const newStatus = (await newStatusJSON.json()).new;
      if (newStatus) {
        this.showNotification('new user was created successfully', 'info');
      }
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

  async connectedCallback() {
    super.connectedCallback();
    await this.stockService.connectSocket();
    this.stockService.setObserver(this);
    this.sendSubscriptions();
  }

  /*  async connectedCallback() {
    super.connectedCallback();
    await this.stockService.connectSocket();
    console.log('test');
    this.stockService.setObserver(this);
    this.sendSubscriptions();
    this.stockService.updateStockPercentages();
    this.createDoughnut();
    this.createGraph();
  }*/

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stockService.closeSocket();
  }

  render() {
    return html`
      <div class="container">
        <h1 id="upp">Marketplace</h1>
        <div class="market-stocks">
          ${this.userStocks.map(
            stock => html`
              <app-stock class="stock" id=${stock.symbol} @click=${this.handleStockClick}>
                <span id="dot${stock.symbol}" class="dot"></span>
                <img src="${stock.image}" alt="${stock.name} Logo" />
                <h2>${stock.name}</h2>
                <p id="price${stock.symbol}">Price: ${stock.price ? stock.price + '$' : 'N/A'}</p>
                <p class="percentages" id="perc${stock.symbol}">
                  ${stock.dailyPercentage ? stock.dailyPercentage + '%' : 'N/A'}
                </p>
              </app-stock>
            `
          )}
        </div>
      </div>
    `;
  }
}
