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
  @state() leaderboard: any[] = [];
  @state() nottype: string = '';
  @state() avatars: any = [];

  dayTrading = false;

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
          this.leaderboard = json.leaderboard;
          this.nottype = json.nottype;
          if (this.leaderboard[0]) {
            this.avatars.push(this.leaderboard[0].avatar);
          }
          if (this.leaderboard[1]) {
            this.avatars.push(this.leaderboard[1].avatar);
          }
          if (this.leaderboard[2]) {
            this.avatars.push(this.leaderboard[2].avatar);
          }

          return html`
            <div id="content">
              <div id="pagetitle">
                <button id="change" @click="${this._changeBoard}">${this.nottype} profit leaderboard</button>
                <button @click="${this.redirectMinesweeper}">need cash?</button>
              </div>

              <div id="imagesflex">
                <div id="images">
                  <div class="frame">
                    <img src="${this.avatars[2]}" />
                  </div>
                  <div class="frame">
                    <img src="${this.avatars[0]}" />
                  </div>
                  <div class="frame">
                    <img src="${this.avatars[1]}" />
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
                    ${this.leaderboard.map(
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

  async redirectMinesweeper() {
    try {
      router.navigate('/minesweeper');
    } catch (e) {
      console.log(e);
    }
  }

  async _changeBoard() {
    if (this.dayTrading == false) {
      try {
        this.request = httpClient.get('leaderboard/lastDay').then(async res => (await res.json()) as any);
        //resets the avatars
        //this.avatars = [];
        this.dayTrading = true;

        this.requestUpdate(); // Komponente neu laden
      } catch (e) {
        if ((e as Error).message == 'Unauthorized!') {
          router.navigate('/users/sign-in');
        } else {
          console.log((e as Error).message);
        }
      }
    } else {
      try {
        this.request = httpClient.get('leaderboard/lastWeek').then(async res => (await res.json()) as any);
        //resets the avatars
        //this.avatars = [];
        this.dayTrading = false;

        this.requestUpdate(); // Komponente neu laden
      } catch (e) {
        if ((e as Error).message == 'Unauthorized!') {
          router.navigate('/users/sign-in');
        } else {
          console.log((e as Error).message);
        }
      }
    }
  }
}
