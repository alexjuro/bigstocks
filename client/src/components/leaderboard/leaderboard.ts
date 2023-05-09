/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './leaderboard.css?inline';

@customElement('app-leaderboard')
class AppHeaderComponent extends LitElement {
  static styles = componentStyle;
  render() {
    return html` <button>Mit Freunden vergleichen</button>
      <div id="leaderboard">
        <div id="names"></div>
        <div id="scores"></div>
      </div>
      <h5>Das Leaderbaord wird jeden Wochentag um 15:45 Uhr aktualisiert</h5>`;
  }
}
