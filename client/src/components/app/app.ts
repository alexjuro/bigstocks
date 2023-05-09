/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';
import sharedStyle from '../shared.css?inline';
import componentStyle from './app.css?inline';

@customElement('app-root')
class AppComponent extends LitElement {
  @state() private services = [{ title: 'bigstocks', routePath: '' }];

  static styles = componentStyle;

  pos = 100;
  page = 1;
  pages = ['news', 'leaderboard', 'protfolio', 'profile'];

  constructor() {
    super();
    const port = 3000;
    httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
  }

  /*
    function left() {
      if (pos == 0) {
        maincontainer!.style.right = pos + '%';
      } else {
        pos = pos - 100;
        maincontainer!.style.right = pos + '%';
      }
    }

    function right() {
      if (pos == 300) {
        maincontainer!.style.right = pos + '%';
      } else {
        pos = pos + 100;
        maincontainer!.style.right = pos + '%';
      }
    }

    function news() {
      maincontainer!.style.right = '0%';
    }

    function leaderboard() {
      maincontainer!.style.right = '100%';
    }

    function portfolio() {
      maincontainer!.style.right = '200%';
    }

    function profile() {
      maincontainer!.style.right = '300%';
    }*/

  //vielleicht irgendwie die url catchen und dann anhand daran und this.page anzeigen was angezeigt wird

  renderSelect() {
    return router.select(
      {
        'users/sign-in': () => html`<app-header></app-header>`,
        'users/sign-up': () => html`<sign-up></sing-up>`,
        'stonks': () => html`<app-stonks></app-stonks>`
      },
      () => {
        return html`<app-stonks></app-stonks>`;
      }
    );
  }

  render() {
    return html` <app-header></app-header>

      <div id="maincontainer">
        <div id="news" class="page">news</div>
        <div id="leaderboard" class="page">
          leaderboard
          <app-leaderboard></app-leaderboard>
        </div>
        <div id="portfolio" class="page">portfolio</div>
        <div id="profile" class="page">profile</div>
      </div>

      <button id="left" @click="${this._left}">left</button>
      <button id="right" @click="${this._right}">right</button>`;
  }

  _left() {
    const maincontainer = this.shadowRoot!.getElementById('maincontainer');

    if (this.pos == 0) {
      maincontainer!.style.right = this.pos + '%';
    } else {
      this.pos = this.pos - 100;
      this.page--;
      maincontainer!.style.right = this.pos + '%';
      window.history.pushState('obj', 'newtitle', this.pages[this.page]);
    }
  }

  _right() {
    const maincontainer = this.shadowRoot!.getElementById('maincontainer');

    if (this.pos == 300) {
      maincontainer!.style.right = this.pos + '%';
    } else {
      this.pos = this.pos + 100;
      this.page++;
      maincontainer!.style.right = this.pos + '%';
      window.history.pushState('obj', 'newtitle', this.pages[this.page]);
    }
  }
}
