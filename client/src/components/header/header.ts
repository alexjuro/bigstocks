import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import componentStyle from './header.css?inline';
import { PageMixin } from '../page.mixin';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';

@customElement('app-header')
class AppHeader extends PageMixin(LitElement) {
  static styles = componentStyle;

  private visable: boolean;

  constructor() {
    super();
    this.visable = false;
  }

  toggle() {
    const circle = this.shadowRoot!.getElementById('circle');
    const mnav = this.shadowRoot!.getElementById('mnav');

    if (this.visable) {
      mnav!.style.visibility = 'hidden';

      setTimeout(() => {
        circle!.style.width = '0px';
        circle!.style.height = '0px';
        this.visable = false;
      }, 150);
    } else {
      circle!.style.width = '220px';
      circle!.style.height = '220px';
      setTimeout(() => {
        mnav!.style.visibility = 'visible';
      }, 280);
      this.visable = true;
    }
  }

  autoResize() {
    const circle = this.shadowRoot!.getElementById('circle');
    const mnav = this.shadowRoot!.getElementById('mnav');

    if (window.innerWidth >= 810) {
      mnav!.style.visibility = 'hidden';

      setTimeout(() => {
        circle!.style.width = '0px';
        circle!.style.height = '0px';
        this.visable = false;
      }, 150);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.autoResize.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.autoResize.bind(this));
  }

  render() {
    return html`
      <div id="background">
        <div id="circle"></div>
      </div>
      <div id="background2">
        <nav id="mnav">
          <ul>
            <li><button type="button" @click="${this.getNews}">news</button></li>
            <li><button type="button" @click="${this.getPortfolio}">portfolio</button></li>
            <li><button type="button" @click="${this.getProfile}">profile</button></li>
          </ul>
        </nav>
      </div>
      <div id="flexheader">
        <div id="left" class="headelem">
          <button type="button" @click="${this.getLeaderboard}">bigStocks</button>
        </div>
        <div id="mid" class="headelem"><a href="">pagename</a></div>
        <div id="right" class="headelem">
          <nav id="dnav">
            <button type="button" @click="${this.getNews}">news</button>
            <button type="button" @click="${this.getPortfolio}">portfolio</button>
            <button type="button" @click="${this.getProfile}">profile</button>
          </nav>
          <button id="btn" @click="${this.toggle}">
            <img src="../../../public/list.svg" alt="" height="27px" />
          </button>
        </div>
      </div>
    `;
  }

  async getLeaderboard() {
    try {
      router.navigate('/leaderboard');
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async getNews() {
    try {
      router.navigate('/news');
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async getPortfolio() {
    try {
      router.navigate('/users/portfolio');
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async getProfile() {
    try {
      router.navigate('/users/profile');
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }
}
