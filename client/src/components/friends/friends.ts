/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { httpClient } from '../../http-client.js';
import { customElement, query } from 'lit/decorators.js';
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

  requests: any[] = [];
  friends: any[] = [];

  async connectedCallback() {
    super.connectedCallback();

    // Beim Laden der Komponente Freunde des Benutzers abrufen
    try {
      const response = await fetch('/friends', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          //'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const { friends, requests } = data;

        this.friends = friends.filter((friend: any) => friend.accepted === true);
        this.requests = requests.filter((request: any) => request.accepted === false);

        this.requestUpdate();
      } else {
        // Fehler beim Abrufen der Freunde
        console.error('Fehler beim Abrufen der Freunde:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Freunde:', error);
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
              <form>
                <input type="text" name="username" placeholder="Username" onfocus="this.value=''" id="input" />
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
                    <div class="b"><button>${request.name}</button></div>
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
                    <div class="b"><button>${friend.name}</button></div>
                    <div class="c">${friend.score} €</div>
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
      await httpClient.post('friends', friend);
      router.navigate('/main');
      this._displaySuccess();
    } catch (e) {
      this._displayError((e as Error).message);
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
