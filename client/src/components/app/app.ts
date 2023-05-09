/* Autor: Alexander Lesnjak */
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import componentStyle from './app.css?inline';

@customElement('app-root')
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
}
