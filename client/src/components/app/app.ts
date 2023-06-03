/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
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
        'friends': () => html`<app-friends></app-friends>`,
        'leaderboard': () => html`<app-leaderboard></app-leaderboard>`,
        'news': () => html`<finnhub-market-news></finnhub-market-news>`,
        'profile': () => html`<user-profile></user-profile>`,
        'stonks': () => html`<app-stonks></app-stonks>`,
        'trading/details': params =>
          html`<app-trading-details .symbol=${params.symbol} .name=${params.name}></app-trading-details>`,
        'trading/portfolio': () => html`<app-portfolio></app-portfolio>`,
        'trading/market': () => html`<app-market></app-market>`,
        'transactions': () => html`<transaction-history></transaction-history>`,
        'users/market': () => html`<app-market></app-market>`,
        'users/portfolio': () => html`<app-portfolio></app-portfolio>`,
        'users/sign-in': () => html`<sign-in></sign-in>`,
        'users/sign-out': () => html`<sign-out></sign-out>`,
        'users/sign-up': () => html`<sign-up></sign-up>`
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
