/* Author: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import componentStyle from './loading-animation.css?inline';

@customElement('loading-animation')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LoadingAnimation extends LitElement {
  static styles = componentStyle;

  @property() delay = 0;

  @state() show = false;

  render() {
    setTimeout(() => (this.show = true), this.delay);
    return this.show
      ? html`<div id="container">
          <div class="bar" id="b1"></div>
          <div class="bar" id="b2"></div>
          <div class="bar" id="b3"></div>
          <div class="bar" id="b4"></div>
          <div class="bar" id="b5"></div>
          <div class="bar" id="b6"></div>
        </div>`
      : html``;
  }
}
