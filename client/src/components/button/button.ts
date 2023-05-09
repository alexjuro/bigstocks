import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('mein-element')
export class MeinElement extends LitElement {
  private isButton1Clicked = false;
  private isButton2Clicked = false;

  static styles = css`
    .button-clicked {
      background-color: red;
      transition: background-color 5ms ease-in-out;
    }

    .button2-clicked {
      background-color: aquamarine;
      transition: background-color 5ms ease-in-out;
    }
  `;

  constructor() {
    super();
    this._onButtonClick1 = this._onButtonClick1.bind(this);
    this._onButtonClick2 = this._onButtonClick2.bind(this);
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

  private _onButtonClick1() {
    document.body.style.backgroundColor = 'red';
    window.history.pushState({ colorChanged: 'red' }, '', '/bgcolorchangedred');
    this.isButton1Clicked = true;
  }

  private _onButtonClick2() {
    document.body.style.backgroundColor = 'aquamarine';
    window.history.pushState({ colorChanged: 'aquamarine' }, '', '/bgcolorchangedaquamarine');
    this.isButton2Clicked = true;
  }

  private _onPopState(event: PopStateEvent) {
    if (event.state) {
      if (event.state.colorChanged === 'red') {
        document.body.style.backgroundColor = 'red';
        this.isButton1Clicked = true;
        this.isButton2Clicked = false;
      } else if (event.state.colorChanged === 'aquamarine') {
        document.body.style.backgroundColor = 'aquamarine';
        this.isButton1Clicked = false;
        this.isButton2Clicked = true;
      } else {
        document.body.style.backgroundColor = '';
        this.isButton1Clicked = false;
        this.isButton2Clicked = false;
      }
    } else {
      document.body.style.backgroundColor = '';
      this.isButton1Clicked = false;
      this.isButton2Clicked = false;
    }
  }

  render() {
    return html`
      <button @click=${this._onButtonClick1} class="${this.isButton1Clicked ? 'button-clicked' : ''}">
        Hintergrund rot
      </button>
      <button @click=${this._onButtonClick2} class="${this.isButton2Clicked ? 'button2-clicked' : ''}">
        Hintergrund aquamarin
      </button>
    `;
  }
}
