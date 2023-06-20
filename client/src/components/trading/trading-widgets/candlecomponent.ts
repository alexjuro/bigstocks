/* Autor: Alexander Schellenberg */

import { LitElement, html } from 'lit';

import sharedStyle from '../../shared.css?inline';
import sharedTradingStyle from '../shared-trading.css?inline';
import { PageMixin } from '../../page.mixin';
import { customElement, query } from 'lit/decorators.js';

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
        <canvas width="200" height="200" id="candle"></canvas>
      </div>
    `;
  }
}
