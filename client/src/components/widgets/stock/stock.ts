/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import componentStyle from './stock.css?inline';

@customElement('app-stock')
class StockComponent extends LitElement {
  static styles = componentStyle;

  @property() name = '';
  @property() symbol = '';
  @property() price = '';
  @property() image = '';
  @property() shares = 0;
  @property() dailyPercentage = '';

  render() {
    return html`
      <span class="dot"></span>
      <img src="${this.image}" alt="${this.name} Logo" />
      <h2>${this.name}</h2>
      <p class="prices">Price: ${this.price ? this.price + '$' : 'N/A'}</p>
      <p class="percentages">${this.dailyPercentage ? this.dailyPercentage + '%' : 'N/A'}</p>
      <p class="shares">${this.shares}x</p>
    `;
  }
}

export { StockComponent };
