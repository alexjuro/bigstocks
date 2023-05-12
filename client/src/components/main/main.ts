/* Autor: Alexander Lesnjak */
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import componentStyle from './main.css?inline';

@customElement('app-main')
class AppComponent extends LitElement {
  @state() private services = [{ title: 'bigstocks', routePath: '' }];

  static styles = componentStyle;

  pos = 100;

  constructor() {
    super();
    this._left = this._left.bind(this);
    this._right = this._right.bind(this);
    this._onPopState = this._onPopState.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this._onPopState);
    if (window.location.pathname === '/news') {
      this.pos = 0;
      setTimeout(() => {
        const maincontainer = this.shadowRoot!.getElementById('maincontainer');
        maincontainer!.style.right = '0%';
      }, 0);
    } else if (window.location.pathname === '/leaderboard') {
      this.pos = 100;
      setTimeout(() => {
        const maincontainer = this.shadowRoot!.getElementById('maincontainer');
        maincontainer!.style.right = '100%';
      }, 0);
    } else if (window.location.pathname === '/portfolio') {
      this.pos = 200;
      setTimeout(() => {
        const maincontainer = this.shadowRoot!.getElementById('maincontainer');
        maincontainer!.style.right = '200%';
      }, 0);
    } else if (window.location.pathname === '/profile') {
      this.pos = 300;
      setTimeout(() => {
        const maincontainer = this.shadowRoot!.getElementById('maincontainer');
        maincontainer!.style.right = '300%';
      }, 0);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this._onPopState);
  }

  private _left() {
    if (this.pos != 0) {
      this.pos = this.pos - 100;
      this._jumpTo(this.pos);
    }
  }

  private _right() {
    if (this.pos != 300) {
      this.pos = this.pos + 100;
      this._jumpTo(this.pos);
    }
  }

  private _jumpTo(pos: number) {
    if (this.pos == 0) {
      window.history.pushState({ showing: 'news' }, '', '/news');
    } else if (this.pos == 100) {
      window.history.pushState({ showing: 'leaderboard' }, '', '/leaderboard');
    } else if (this.pos == 200) {
      window.history.pushState({ showing: 'portfolio' }, '', '/portfolio');
    } else if (this.pos == 300) {
      window.history.pushState({ showing: 'profile' }, '', '/profile');
    }
    this._move(this.pos);
  }

  private _move(pos: number) {
    const maincontainer = this.shadowRoot!.getElementById('maincontainer');
    maincontainer!.style.right = this.pos + '%';
  }

  private _onPopState(event: PopStateEvent) {
    if (event.state) {
      if (event.state.showing === 'news') {
        this.pos = 0;
      } else if (event.state.showing === 'leaderboard') {
        this.pos = 100;
      } else if (event.state.showing === 'portfolio') {
        this.pos = 200;
      } else if (event.state.showing === 'profile') {
        this.pos = 300;
      } else {
        this.pos = 100;
      }
      this._move(this.pos);
    } else {
      this.pos = 100;
      this._move(this.pos);
    }
  }

  render() {
    return html` <div id="maincontainer">
        <div id="news" class="page">news</div>
        <div id="leaderboard" class="page">
          leaderboard
          <app-leaderboard></app-leaderboard>
        </div>
        <div id="portfolio" class="page">
          portfolio
          <iframe
            src="https://www.retrogames.cc/embed/8843-jojos-bizarre-adventure%3A-heritage-for-the-future-jojo-no-kimyou-na-bouken%3A-mirai-e-no-isan-japan-990927-no-cd.html"
            width="600"
            height="450"
            frameborder="no"
            allowfullscreen="true"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            scrolling="no"
          ></iframe>
        </div>
        <div id="profile" class="page">profile</div>
      </div>

      <button id="left" @click="${this._left}" class="btn"><</button>
      <button id="right" @click="${this._right}" class="btn">></button>`;
  }
}
