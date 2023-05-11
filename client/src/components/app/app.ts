/* Autor: TODO */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';

@customElement('app-root')
class AppComponent extends LitElement {
  // Könnte für den Header nützlich sein
  @state() private services = [{ title: 'Konto erstellen', routePath: 'users/sign-up' }];

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
        'users/sign-in': () => html`<sign-in></sing-in>`,
        'users/sign-up': () => html`<sign-up></sing-up>`,
        'users/sign-out': () => html`<sign-out></sign-out>`,
        'stonks': () => html`<app-stonks></app-stonks>`,
        'news': () => html`<finnhub-market-news></finnhub-market-news>`
      },
      () => {
        return html`<app-stonks></app-stonks>`;
      }
    );
  }

  render() {
    return html` <div class="main">${this.renderSelect()}</div> `;
  }
}
