/* Autor: Alexander Schellenberg */

import { LitElement, css, html } from 'lit';

import sharedStyle from '../../shared.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { PageMixin } from '../../page.mixin';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('app-trading-candle')
export class CandleComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedTradingStyle];
  @query('#candle') candle!: HTMLCanvasElement;

  get candleDiv(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.candle-div') as HTMLElement | null;
  }

  render() {
    return html`
      <div class="candle-div">
        <canvas width="200" height="300" id="candle"></canvas>
      </div>
    `;
  }
}
