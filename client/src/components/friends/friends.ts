/* Autor: Alexander Lesnjak */
//TODO: show the picture of the user
//TODO: show success

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

      this.friends = data.friends;
      this.requests = data.requests;
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        console.log((e as Error).message);
      }
    }

    /*
    try {
      const response = await httpClient.post('friends', { username: 'axel' });
      const data = await response.json();
      console.log(data);
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        console.log((e as Error).message);
      }
    }*/
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
              <input
                type="text"
                name="username"
                placeholder="Username"
                onfocus="this.value=''"
                id="input"
                autocomplete="off"
              />
              <button type="submit" @click="${() => this._addFriend()}">Senden</button>
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
                      <button @click="${() => this._accept(request.username)}">accept</button>
                      <button @click="${() => this._decline(request.username)}">decline</button>
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
                    <div class="d">
                      <button @click="${() => this._delete(friend.username)}">
                        <img src="/trash-red.svg" alt="" height="30px" />
                      </button>
                    </div>
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
    const friendname = this.nameElement.value;

    try {
      const response = await httpClient.post('friends', { username: friendname });
      //TODO: hier
    } catch (e) {
      //redirect if the user isnt logged in(never appears)
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      }
      //print error when the user isnt found
      else if ((e as Error).message == 'Not Found') {
        this._displayError('User not found');
        console.log('User not found');
      }
      //print error if the friend is already in friends or requests
      else if ((e as Error).message == 'Conflict') {
        this._displayError('This friend already send you an request');
        console.log('This friend already send you an request');
      }
      //print error if the user to add himself
      else if ((e as Error).message == 'Bad Request') {
        this._displayError('You tried to add yourself');
        console.log('You tried to add yourself');
      } else {
        console.log((e as Error).message);
      }
    }

    this.nameElement.value = '';
  }

  async _displaySuccess() {
    console.log('success');
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

  async _accept(name: string) {
    try {
      const response = await httpClient.post('friends/accept', { username: name });
      const data = await response.json();
      console.log('accepted');
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        console.log((e as Error).message);
      }
    }
  }

  async _decline(name: string) {
    try {
      const response = await httpClient.post('friends/decline', { username: name });
      console.log('declined'); //TODO: das wird nicht ausgefuehrt
      this._reloadFriends();
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        console.log((e as Error).message);
      }
    }
  }

  async _delete(name: string) {
    try {
      const response = await httpClient.post('friends/delete', { username: name });
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        console.log((e as Error).message);
      }
    }
  }

  async _reloadFriends() {
    const friendswindow = this.shadowRoot!.getElementById('friendswindow');
    friendswindow!.innerHTML = 'hello :)';
  }
}
