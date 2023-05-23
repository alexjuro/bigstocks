/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import componentStyle from './leaderboard.css?inline';

@customElement('app-leaderboard')
class AppLeaderboardComponent extends LitElement {
  static styles = componentStyle;

  scores: any[] = [];

  async connectedCallback() {
    super.connectedCallback();

    try {
      const response = await fetch('/top-scores', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.scores = data.slice(0, 5); // Begrenze die Anzahl der Top Scores auf 5
        this.requestUpdate();
      } else {
        console.error('Fehler beim Abrufen der Top Scores:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Top Scores:', error);
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
