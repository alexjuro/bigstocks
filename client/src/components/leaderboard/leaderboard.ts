/* Autor: Alexander Lesnjak */

//This Component shows who made the most Profit in one Day/ Week and All Time

import { LitElement, html } from 'lit';
import { customElement, property, eventOptions, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import componentStyle from './leaderboard.css?inline';
import { router } from '../../router/router.js';
import { until } from 'lit/directives/until.js';

@customElement('app-leaderboard')
class AppLeaderboardComponent extends LitElement {
  static styles = componentStyle;

  @state() request = httpClient.get('leaderboard/lastWeek').then(async res => (await res.json()) as any);

  @property({ type: Array })
  global: any[] = [];

  @property({ type: Array })
  friends: any[] = [];

  friendsshowed = false;

  @eventOptions({ capture: true })
  protected async firstUpdated() {
    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: 'Leaderboard', bubbles: true, composed: true })
    );

    try {
      const response = await httpClient.get('leaderboard/lastWeek');
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        console.log((e as Error).message);
      }
    }
  }

  render() {
    return html`
      ${until(
        this.request.then(json => {
          this.global = json;

          return html`
            <div id="content">
              <div id="pagetitle">
                <button @click="${this._changeBoard}">Friend leaderboard</button>
                <button @click="${this.getFriends}">Friends</button>
              </div>

              <div id="imagesflex">
                <div id="images">
                  <div class="frame">
                    <img src="${this.global[2].avatar}" />
                  </div>
                  <div class="frame">
                    <img src="${this.global[0].avatar}" />
                  </div>
                  <div class="frame">
                    <img src="${this.global[1].avatar}" />
                  </div>
                </div>
              </div>

              <div id="namesflex">
                <div id="names">
                  <div>3.</div>
                  <div>1.</div>
                  <div>2.</div>
                </div>
              </div>

              <div id="placementsflex">
                <div id="placements">
                  <ol>
                    ${this.global.map(
                      entry => html`
                        <li>
                          <div class="position">
                            <div>${entry.username}</div>
                            <div>${entry.profit} $</div>
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
        }),
        html`<is-loading></is-loading>`
      )}
    `;
  }

  async getFriends() {
    try {
      router.navigate('/users/friends');
    } catch (e) {
      console.log(e);
    }
  }

  async _changeBoard() {
    if (this.friendsshowed == false) {
      try {
        const response = await httpClient.get('leaderboard/lastWeek');
        const data = await response.json();

        console.log(data);
      } catch (e) {}
    } else {
    }
  }
}
