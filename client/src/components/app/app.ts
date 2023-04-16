/* Autor: TODO */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
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
        'users/portfolio': () => html`<app-portfolio></app-portfolio>`,
      },
      () => {
        return html`<app-portfolio></app-portfolio>`;
      }
    );
  }

render() {
    return html` <div class="main">${this.renderSelect()}</div> `;
  }
}
