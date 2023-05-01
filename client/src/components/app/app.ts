/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';

@customElement('app-root')
class AppComponent extends LitElement {
  @state() private services = [{ title: 'Leaderboard', routePath: 'leaderboard' }];

  constructor() {
    super();
    const port = 3000;
    httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
  }

  render() {
    return html`
    <app-header2></app-header2>
    <app-leaderboard2></app-leaderboard2>`;
  }
}


