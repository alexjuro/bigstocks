/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PageMixin } from '../../page.mixin';
import componentStyle from './ratingStyle.css?inline';

@customElement('my-rating')
class RatingComponent extends PageMixin(LitElement) {
  static styles = componentStyle;

  @property({ type: Number, reflect: true }) value = 1;
  @property({ type: Number, reflect: true }) max = 5;

  render() {
    return html`<div class="rating">
      ${Array.from(' '.repeat(this.max)).map(
        (_, i) =>
          html`<span class="${i + 1 <= this.value ? 'checked' : ''}" @click=${() => (this.value = i + 1)}>★</span>`
      )}
    </div>`;
  }
}
