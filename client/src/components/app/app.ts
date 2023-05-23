/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';

@customElement('app-root')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppComponent extends LitElement {
  constructor() {
    super();
    const port = 3000;
    httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
  }

  renderSelect() {
    return router.select(
      {
        'leaderboard': () => html`<app-leaderboard></app-leaderboard>`,
        'news': () => html`<finnhub-market-news></finnhub-market-news>`,
        'profile': () => html`<user-profile></user-profile>`,
        'stonks': () => html`<app-stonks></app-stonks>`,
        'users/portfolio': () => html`<app-portfolio></app-portfolio>`,
        'users/market': () => html`<app-market></app-market>`,
        'users/sign-in': () => html`<sign-in></sing-in>`,
        'users/sign-up': () => html`<sign-up></sing-up>`,
        'users/sign-out': () => html`<sign-out></sign-out>`
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
