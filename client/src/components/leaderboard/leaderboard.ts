/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import componentStyle from './leaderboard.css?inline';

@customElement('app-leaderboard')
class AppLeaderboardComponent extends LitElement {
  static styles = componentStyle;

  scores: any[] = [];

  protected async firstUpdated() {
    try {
      const response = await httpClient.get('leaderboard');
      const data = await response.json();

      const scores = data
        .filter((user: { name?: any; performance?: any }) => user.name && user.performance) // Filtere Benutzer mit Namen und Leistungsdaten
        .map((user: { name: any; performance: any }) => ({
          name: user.name,
          performance: user.performance[user.performance.length - 1].value
        }));

      console.log('scores:', scores);
    } catch (e) {
      console.log((e as Error).message, 'error');
    }
  }

  render() {
    return html`
      <div id="content">
        <div id="pagetitle">leaderboard</div>

        <div id="imagesflex">
          <div id="images">
            <div class="frame"></div>
            <div class="frame"></div>
            <div class="frame"></div>
          </div>
        </div>

        <div id="placementsflex">
          <div id="placements">
            <ol>
              ${this.scores.map(
                (score, index) => html`
                  <li>
                    <div class="position">
                      <div><a href="#top">${score.name}</a></div>
                      <div>${score.score}</div>
                    </div>
                  </li>
                `
              )}
            </ol>
          </div>
        </div>

        <div id="background">
          <div id="kreis"></div>
        </div>
      </div>
    `;
  }
}
