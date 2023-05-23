/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
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
    const port = 3000;
    httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
  }
  firstUpdated() {
    router.subscribe(() => this.requestUpdate());
  }
  renderSelect() {
    return router.select(
      {
        'users/portfolio': () => html`<app-portfolio></app-portfolio>`,
        'users/market': () => html`<app-market></app-market>`,
        'leaderboard': () => html`<app-leaderboard></app-leaderboard>`,
        'users/sign-in': () => html`<sign-in></sing-in>`,
        'users/sign-up': () => html`<sign-up></sing-up>`,
        'users/sign-out': () => html`<sign-out></sign-out>`,
        'users/activation': () => html`<app-activation></app-activation>`,
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
