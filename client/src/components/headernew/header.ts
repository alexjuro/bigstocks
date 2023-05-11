import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import componentStyle from './header.css?inline';

@customElement('app-header2')
class AppHeader extends LitElement {
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
      circle!.style.width = '0px';
      circle!.style.height = '0px';
      mnav!.style.display = 'none';
      this.visable = false;
    } else {
      circle!.style.width = '220px';
      circle!.style.height = '220px';
      setTimeout(() => {
        mnav!.style.display = 'block';
      }, 280);
      this.visable = true;
    }
  }

  autoResize() {
    const circle = this.shadowRoot!.getElementById('circle');
    const mnav = this.shadowRoot!.getElementById('mnav');

    if (window.innerWidth >= 810) {
      circle!.style.width = '0px';
      circle!.style.height = '0px';
      mnav!.style.display = 'none';
      this.visable = false;
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
            <li><a href="">portfolio</a></li>
            <li><a href="">profile</a></li>
          </ul>
        </nav>
      </div>
      <div id="flexheader">
        <div id="left" class="headelem"><a href="">bigstocks</a></div>
        <div id="mid" class="headelem"><a href="">pagename</a></div>
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
}
