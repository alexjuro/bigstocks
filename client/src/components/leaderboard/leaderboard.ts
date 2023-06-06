/* Autor: Alexander Lesnjak */
//TODO: chnage redirect url to normal url
//TODO: make the button work

import { LitElement, html } from 'lit';
import { customElement, property, eventOptions } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import componentStyle from './leaderboard.css?inline';
import { router } from '../../router/router.js';

@customElement('app-leaderboard')
class AppLeaderboardComponent extends LitElement {
  static styles = componentStyle;

  @property({ type: Array })
  scores: any[] = [];

  @eventOptions({ capture: true })
  protected async firstUpdated() {
    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: 'Leaderboard', bubbles: true, composed: true })
    );

    try {
      const response = await httpClient.get('leaderboard');
      const data = await response.json();

      const scores = data.map((entry: { name: any; performance: any }) => {
        const { name, performance } = entry;
        let totalMoney = performance[0].value;
        const formattedMoney = totalMoney.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: false
        });
        return { name, money: formattedMoney };
      });

      scores.sort((a: { money: string }, b: { money: string }) => {
        const moneyA = parseFloat(a.money.replace(/\./g, '').replace(',', '.'));
        const moneyB = parseFloat(b.money.replace(/\./g, '').replace(',', '.'));
        return moneyB - moneyA;
      });

      this.scores = scores.slice(0, 5);

      //console.log('scores:', scores);
    } catch (e) {
      console.log((e as Error).message, 'error');
    }
  }

  render() {
    return html`
      <div id="content">
        <div id="pagetitle">
          <button @click="">Friend leaderboard</button>
          <button @click="${this.getFriends}">Friends</button>
        </div>

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
                      <div><button @click="${() => this.redirectToProfile(score.name)}">${score.name}</button></div>
                      <div>${score.money} $</div>
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

  redirectToProfile(username: string) {
    router.navigate(`users/${username}`);
  }

  async getFriends() {
    try {
      router.navigate('/users/friends');
    } catch (e) {
      console.log(e);
    }
  }
}
