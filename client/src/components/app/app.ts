/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';
import { StockService } from '../../stock-service';

@customElement('app-root')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppComponent extends LitElement {
  stockService = new StockService();
  constructor() {
    super();
    const port = 3000;
    httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
  }

  firstUpdated() {
    router.subscribe(() => this.requestUpdate());
  }
  renderSelect() {
    return router.select(
      {
        'trading/details/:id': params => html`<app-trading-details .tradingId=${params.id}></app-trading-details>`,
        'trading/portfolio': () => html`<app-portfolio></app-portfolio>`,
        'trading/market': () => html`<app-market></app-market>`,
        'leaderboard': () => html`<app-leaderboard></app-leaderboard>`,
        'users/sign-in': () => html`<sign-in></sing-in>`,
        'users/sign-up': () => html`<sign-up></sing-up>`,
        'users/sign-out': () => html`<sign-out></sign-out>`,
        'stonks': () => html`<app-stonks></app-stonks>`,
        'news': () => html`<finnhub-market-news></finnhub-market-news>`
      },
      () => {
        return html`<app-portfolio></app-portfolio>`;
      }
    );
  }

  render() {
    return html`<app-header></app-header>
      <div class="main">${this.renderSelect()}</div> `;
  }
}
