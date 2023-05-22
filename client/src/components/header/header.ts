import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import componentStyle from './header.css?inline';
import { PageMixin } from '../page.mixin';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';

@customElement('app-header')
class AppHeader extends PageMixin(LitElement) {
  static styles = componentStyle;
  @property() pagename = 'pagename';

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
            <li><a href="">news</a></li>
            <li><a href="">users/portfolio</a></li>
            <li><a href="">profile</a></li>
          </ul>
        </nav>
      </div>
      <div id="flexheader">
        <div id="left" class="headelem">
          <button type="button" @click="${this.getLeaderboard}">BigStocks</button>
        </div>
        <div id="mid" class="headelem"><a href="">${this.pagename}</a></div>
        <div id="right" class="headelem">
          <nav id="dnav">
            <a href="">news</a>
            <a href="">portfolio</a>
            <a href="">profile</a>
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
}
