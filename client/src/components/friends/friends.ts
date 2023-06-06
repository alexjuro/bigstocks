/* Autor: Alexander Lesnjak */
//TODO: show the picture of the user
//TODO: make the accept and decline buttons work
//TODO: make the add friend not redirect to another website
//TODO: stop autofill
//TODO: find the friend by its username or save friends with email for the performance

import { LitElement, PropertyValueMap, html } from 'lit';
import { httpClient } from '../../http-client.js';
import { customElement, query, property, eventOptions } from 'lit/decorators.js';
import { router } from '../../router/router.js';
import componentStyle from './friends.css?inline';

@customElement('app-friends')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppFriendsComponent extends LitElement {
  static styles = componentStyle;

  @query('#input') private nameElement!: HTMLInputElement;

  constructor() {
    super();
  }

  @property({ type: Array })
  requests: any[] = [];
  @property({ type: Array })
  friends: any[] = [];

  @eventOptions({ capture: true })
  protected async firstUpdated() {
    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: 'Friends', bubbles: true, composed: true })
    );

    try {
      const response = await httpClient.get('friends');
      const data = await response.json();

      //filters the data by accepted state
      const friendsArray = data.friends;

      const friends = friendsArray.filter((friend: any) => friend.accepted === true);
      const requests = friendsArray.filter((friend: any) => friend.accepted === false);

      this.friends = friends;
      this.requests = requests;

      const friendsNew = friends.map((friend: any) => {
        const newPerformance = friend.performance.map((performance: any) => {
          const formattedValue = performance.value.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: false
          });

          return { ...performance, value: formattedValue };
        });

        return { ...friend, performance: newPerformance };
      });

      this.friends = friendsNew;
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/user/sign-in');
      } else {
        console.log((e as Error).message);
      }
    }
  }

  render() {
    return html`
      <div id="background">
        <div id="kreis"></div>
      </div>

      <div id="main">
        <div id="addFriend">
          <button @click="${this._scrollToFriendForm}">Freund hinzufügen</button>
        </div>
        <div id="friendsContainer">
          <div id="addMethod" class="containerelem">
            <div id="textFreunde" class="textone">Freund hinzufügen:</div>
            <!--Das Fenster zum absenden-->
            <div id="addwindow" class="window">
              <form autocomplete="off">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  onfocus="this.value=''"
                  id="input"
                  autocomplete="off"
                />
                <button type="submit" @click="${this._addFriend}">Senden</button>
              </form>
            </div>

            <!--Feedback ob das senden funktioniert hat oder nicht-->
            <div id="feedback" class="clear"></div>

            <div id="textFreunde">Freundschaftsanfragen:</div>
            <div id="requestwindow" class="window">
              <!--Beispiel fuer eine Anfrage-->
              ${this.requests.map(
                request => html`
                  <div class="friendelem">
                    <div class="a">
                      <div class="frame"></div>
                    </div>
                    <div class="b"><button>${request.username}</button></div>
                    <div class="c">
                      <button @click="${this.accept(request.name)}">accept</button>
                      <button>decline</button>
                    </div>
                  </div>
                `
              )}
            </div>
          </div>

          <div id="friendsList" class="containerelem">
            <div id="textFreunde">Freunde:</div>
            <div id="friendswindow" class="window">
              ${this.friends.map(
                friend => html`
                  <div class="friendelem">
                    <div class="a">
                      <div class="frame"></div>
                    </div>
                    <div class="b"><button>${friend.username}</button></div>
                    <div class="c">${friend.performance[0].value} €</div>
                  </div>
                `
              )}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async _scrollToFriendForm() {
    const scroll = this.shadowRoot!.getElementById('addMethod');
    scroll!.scrollIntoView({ behavior: 'smooth' });
  }

  async _addFriend() {
    const friend = this.nameElement.value;
    try {
      const response = await httpClient.post('friends', { username: friend });
      console.log(friend);

      if (response.ok) {
        this._displaySuccess();
      } else {
        // Handle error response
      }
    } catch (e) {
      this._displayError((e as Error).message);
      console.log((e as Error).message);
    }
  }

  async _displaySuccess() {
    const inputElement = this.shadowRoot!.getElementById('input');
    const feedbackElement = this.shadowRoot!.getElementById('feedback');
    feedbackElement!.classList.remove('yes');
    feedbackElement!.classList.remove('no');

    feedbackElement!.classList.add('yes');
    feedbackElement!.innerHTML = 'request sent';
    setTimeout(() => {
      feedbackElement!.classList.remove('yes');
      feedbackElement!.innerHTML = '';
    }, 2000);
  }

  async _displayError(msg: string) {
    const inputElement = this.shadowRoot!.getElementById('input');
    const feedbackElement = this.shadowRoot!.getElementById('feedback');
    feedbackElement!.classList.remove('yes');
    feedbackElement!.classList.remove('no');

    feedbackElement!.classList.add('no');
    feedbackElement!.innerHTML = msg;
    setTimeout(() => {
      feedbackElement!.classList.remove('no');
      feedbackElement!.innerHTML = '';
    }, 2000);
  }

  async accept(name: string) {
    this.requests = [];
    this.requestUpdate();
  }
}
