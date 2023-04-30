/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './leaderboard.css?inline'

@customElement('app-leaderboard')
class AppLeaderboardComponent extends LitElement {
  static styles = [componentStyle, sharedStyle]
  render() {
    return html`
    <div id="friendsbtncontainer">
      <button>View Friends Leaderboard</button>
    </div>

    <div class="contentspacer"></div>

    <div id="leaderboard">
      <div id="names" class="half">TODO: list</div>
      <div id="scores" class="half">TODO: list</div>
    </div>

    <div class="contentspacer"></div>`;
  }
}