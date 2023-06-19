/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import componentStyle from './leaderboard.css?inline';
import { router } from '../../router/router.js';

@customElement('app-leaderboard')
export class AppLeaderboardComponent extends LitElement {
  static styles = componentStyle;

  //@state() request = httpClient.get('leaderboard/lastWeek').then(async res => (await res.json()) as any);
  @state() leaderboard: { username: string; avatar: string; profit: string }[] = [];
  @state() avatars: string[] = [];
  @state() nottype = '';

  dayTrading = false;

  @eventOptions({ capture: true })
  protected async firstUpdated() {
    this.dispatchEvent(new CustomEvent('update-pagename', { detail: 'Leaderboard', bubbles: true, composed: true }));

    try {
      const response = await httpClient.get('leaderboard/lastWeek');
      const data = await response.json();

      this.leaderboard = data.leaderboard;
      this.nottype = data.nottype;

      if (this.leaderboard[0]) {
        this.avatars.push(this.leaderboard[0].avatar);
      }
      if (this.leaderboard[1]) {
        this.avatars.push(this.leaderboard[1].avatar);
      }
      if (this.leaderboard[2]) {
        this.avatars.push(this.leaderboard[2].avatar);
      }
    } catch (e) {
      console.log((e as Error).message);
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    await httpClient.get('/users/auth').catch((e: { statusCode: number }) => {
      if (e.statusCode === 401) router.navigate('/users/sign-in');
    });
  }

  render() {
    return html`
      <div id="content">
        <div id="pagetitle">
          <button id="change" @click="${this._changeBoard}">${this.nottype} profit</button>
          <button id="btnMinesweeper" @click="${this.redirectMinesweeper}">need cash?</button>
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
  }

  /*
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
                <button id="change" @click="${this._changeBoard}">${this.nottype} profit</button>
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
  */

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
        const response = await httpClient.get('leaderboard/lastDay');
        const data = await response.json();

        this.avatars = [];
        this.dayTrading = true;

        this.leaderboard = data.leaderboard;
        this.nottype = data.nottype;

        if (this.leaderboard[0]) {
          this.avatars.push(this.leaderboard[0].avatar);
        }
        if (this.leaderboard[1]) {
          this.avatars.push(this.leaderboard[1].avatar);
        }
        if (this.leaderboard[2]) {
          this.avatars.push(this.leaderboard[2].avatar);
        }

        this.requestUpdate();
      } catch (e) {
        if ((e as Error).message == 'Unauthorized!') {
          router.navigate('/users/sign-in');
        } else {
          console.log((e as Error).message);
        }
      }
    } else {
      try {
        const response = await httpClient.get('leaderboard/lastWeek');
        const data = await response.json();

        this.avatars = [];
        this.dayTrading = true;

        this.leaderboard = data.leaderboard;
        this.nottype = data.nottype;

        if (this.leaderboard[0]) {
          this.avatars.push(this.leaderboard[0].avatar);
        }
        if (this.leaderboard[1]) {
          this.avatars.push(this.leaderboard[1].avatar);
        }
        if (this.leaderboard[2]) {
          this.avatars.push(this.leaderboard[2].avatar);
        }

        this.requestUpdate();
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
