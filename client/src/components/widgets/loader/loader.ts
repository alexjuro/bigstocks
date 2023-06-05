/* Autor: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import componentStyle from './loader.css?inline';

@customElement('is-loading')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LoadingAnimation extends LitElement {
  static styles = componentStyle;

  @property() delay = 0;

  @state() show = false;

  render() {
    setTimeout(() => (this.show = true), this.delay);
    return this.show
      ? html`<div id="container">
          <div class="bar" style="--delay: 1" id="b1"></div>
          <div class="bar" style="--delay: 2"></div>
          <div class="bar" style="--delay: 3"></div>
          <div class="bar" style="--delay: 4"></div>
          <div class="bar" style="--delay: 5"></div>
          <div class="bar" style="--delay: 6" id="b2"></div>
        </div>`
      : html``;
  }
}
