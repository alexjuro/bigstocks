/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import componentStyle from './header.css?inline';

@customElement('app-header')
class AppHeaderComponent extends LitElement {
  static styles = componentStyle;

  isNavMobileOpen = false;

  private _toggleNav() {
    const hamburger = this.shadowRoot!.getElementById('hamburger');
    const navMobile = this.shadowRoot!.getElementById('navMobile');

    if (this.isNavMobileOpen) {
      navMobile!.style.display = 'none';
      this.isNavMobileOpen = false;
    } else {
      navMobile!.style.display = 'flex';
      this.isNavMobileOpen = true;
    }
  }

  private _hideNavMobile() {
    const navMobile = this.shadowRoot!.getElementById('navMobile');

    if (window.innerWidth > 900) {
      navMobile!.style.display = 'none';
      this.isNavMobileOpen = false;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._hideNavMobile.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._hideNavMobile.bind(this));
  }

  render() {
    return html`
      <div id="headercontainer">
        <div id="logo"><a href="/leaderboard">bigstocks</a></div>
        <div id="pagetitle">pagename</div>
        <div id="nav">
          <div class="navelem"><a href="/news">news</a></div>
          <div class="navelem"><a href="/portfolio">portfolio</a></div>
          <div class="navelem"><a href="/profile">profile</a></div>
          <button id="hamburger" @click="${this._toggleNav}">
            <img src="./list.svg" alt="" height="20px" width="20px" />
          </button>
        </div>
      </div>

      <nav id="navMobile">
        <div class="mobileelem"><a href="/news">news</a></div>
        <div class="mobileelem"><a href="/portfolio">portfolio</a></div>
        <div class="mobileelem"><a href="/profile">profile</a></div>
      </nav>
    `;
  }
}
