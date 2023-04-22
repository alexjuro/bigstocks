/* Autor: TODO */

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

  renderRouterOutlet() {
    return router.select(
      {
        profile: () => html`<user-profile></user-profile>`
      },
      () => html`main_page_redirect`
    );
  }

  render() {
    return html`<div class="main">${this.renderRouterOutlet()}</div>`;
  }
}
