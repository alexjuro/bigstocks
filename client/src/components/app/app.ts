/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';
import componentStyle from './app.css?inline';
import sharedStyle from '../shared.css?inline';

@customElement('app-root')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppComponent extends LitElement {
  static styles = [componentStyle, sharedStyle];
  constructor() {
    super();
    const port = location.protocol === 'https:' ? 3443 : 3000;
    httpClient.init({ baseURL: `https://${location.hostname}:${port}/api/` });
  }

  firstUpdated() {
    router.subscribe(() => this.requestUpdate());
  }

  renderSelect() {
    return router.select(
      {
        'users/friends': () => html`<app-friends></app-friends>`,
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
        'users/sign-up': () => html`<sign-up></sign-up>`,
        'users/activation': () => html`<app-activation></app-activation>`,
        'users/resetPassword': () => html`<app-resetPassword></app-resetPassword>`,
        'users/forgotPassword': () => html`<app-forgotPassword></app-forgotPassword>`,
        'minesweeper': () => html`<app-minesweeper></app-minesweeper>`
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
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('update-pagename', this.handleUpdatePageName);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('update-pagename', this.handleUpdatePageName);
  }

  private handleUpdatePageName(event: Event) {
    const customEvent = event as CustomEvent;
    const appHeader = this.shadowRoot?.querySelector('app-header');
    if (appHeader && 'pagename' in appHeader) {
      appHeader.pagename = customEvent.detail;
    }
  }
}
