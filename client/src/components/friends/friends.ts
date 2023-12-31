/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { httpClient } from '../../http-client.js';
import { customElement, query, eventOptions, state } from 'lit/decorators.js';
import { router } from '../../router/router.js';
import componentStyle from './friends.css?inline';

@customElement('app-friends')
export class AppFriendsComponent extends LitElement {
  static styles = componentStyle;

  @state() requests: { username: string; accepted: boolean; avatar: string; profit: string }[] = [];
  @state() friends: { username: string; accepted: boolean; avatar: string; profit: string }[] = [];

  @query('#input') private nameElement!: HTMLInputElement;

  constructor() {
    super();
  }

  @eventOptions({ capture: true })
  protected async firstUpdated() {
    this.dispatchEvent(new CustomEvent('update-pagename', { detail: 'friends', bubbles: true, composed: true }));

    const response = await httpClient.get('friends');

    const data = await response.json();

    this.friends = data.friends;
    this.requests = data.requests;
  }

  async connectedCallback() {
    super.connectedCallback();
    await httpClient.get('/users/auth').catch((e: { statusCode: number }) => {
      if (e.statusCode === 401) router.navigate('/users/sign-in');
    });
  }

  render() {
    return html`
      <div id="background">
        <div id="kreis"></div>
      </div>

      <div id="main">
        <div id="addFriend">
          <button @click="${this.scollToForm}">Add friend</button>
        </div>
        <div id="friendsContainer">
          <div id="addMethod" class="containerelem">
            <div id="textFreunde" class="textone">Add friend:</div>
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
              <button type="submit" id="sendbtn" @click="${() => this.addFriend()}">Send</button>
            </div>

            <!--Feedback ob das senden funktioniert hat oder nicht-->
            <div id="feedback" class="clear"></div>

            <div id="textFreunde">Requests:</div>
            <div id="requestwindow" class="window">
              <!--Beispiel fuer eine Anfrage-->
              ${this.requests.map(
                request => html`
                  <div class="friendelem">
                    <div class="a">
                      <div class="frame">
                        <img src="${request.avatar}" />
                      </div>
                    </div>
                    <div class="b"><button>${request.username}</button></div>
                    <div class="c">
                      <button id="acceptBtn" @click="${() => this.acceptRequest(request.username)}">accept</button>
                      <button id="declineBtn" @click="${() => this.declineRequest(request.username)}">decline</button>
                    </div>
                  </div>
                `
              )}
            </div>
          </div>

          <div id="friendsList" class="containerelem">
            <div id="textFreunde">Friends:</div>
            <div id="friendswindow" class="window">
              ${this.friends.map(
                friend => html`
                  <div class="friendelem">
                    <div class="a">
                      <div class="frame">
                        <img src="${friend.avatar}" />
                      </div>
                    </div>
                    <div class="b"><button>${friend.username}</button></div>
                    <div class="c">profit made: ${friend.profit} $</div>
                    <div class="d">
                      <button id="deleteBtn" @click="${() => this.deleteFriend(friend.username)}">
                        <img src="/trash-red.svg" alt="" height="30px" width="30px" />
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

  /*
  render() {
    if (!this.request) {
      return html`<is-loading></is-loading>`;
    }

    return html`
      ${until(
        this.request.then(json => {
          this.friends = json.friends;
          this.requests = json.requests;

          return html`
            <div id="background">
              <div id="kreis"></div>
            </div>

            <div id="main">
              <div id="addFriend">
                <button @click="${this.scollToForm}">Freund hinzufügen</button>
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
                    <button type="submit" id="sendbtn" @click="${() => this.addFriend()}">Senden</button>
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
                            <div class="frame">
                              <img src="${request.avatar}" />
                            </div>
                          </div>
                          <div class="b"><button>${request.username}</button></div>
                          <div class="c">
                            <button @click="${() => this.acceptRequest(request.username)}">accept</button>
                            <button @click="${() => this.declineRequest(request.username)}">decline</button>
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
                            <div class="frame">
                              <img src="${friend.avatar}" />
                            </div>
                          </div>
                          <div class="b"><button>${friend.username}</button></div>
                          <div class="c">profit made: ${friend.profit} $</div>
                          <div class="d">
                            <button @click="${() => this.deleteFriend(friend.username)}">
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
        }),
        html`<is-loading></is-loading>`
      )}
    `;
  }*/

  async scollToForm() {
    const scroll = this.shadowRoot!.getElementById('addMethod');
    scroll!.scrollIntoView({ behavior: 'smooth' });
  }

  isFormValid() {
    const reUsername = /^[\w-.]{4,32}$/;
    const friendname = this.nameElement.value;
    if (!reUsername.test(friendname)) {
      this._displayError('Invalid username');
      return false;
    }
    return true;
  }

  async addFriend() {
    const friendname = this.nameElement.value;

    if (friendname == '') {
      this._displayError('Please enter a username');
      return;
    }

    if (!this.isFormValid()) {
      return;
    }

    try {
      await httpClient.post('friends', { username: friendname });
      this._displaySuccess();
    } catch (e) {
      // redirect if the user isn't logged in (never appears)
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      }
      // print error when the user isn't found
      else if ((e as Error).message == 'Not Found') {
        this._displayError('User not found');
      }
      // print error if the friend is already in friends or requests
      else if ((e as Error).message == 'Conflict') {
        this._displayError('This friend already sent you a request');
      }
      // If you already sent a request to that person
      else if ((e as Error).message == 'Not Acceptable') {
        this._displayError('You have already sent a request to that person');
      }
      // print error if the user tries to add themselves
      else if ((e as Error).message == 'Bad Request') {
        this._displayError('You tried to add yourself');
      }
    }

    this.nameElement.value = '';
  }

  async _displaySuccess() {
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
    const feedbackElement = this.shadowRoot!.getElementById('feedback');
    feedbackElement!.classList.remove('yes');
    feedbackElement!.classList.remove('no');

    feedbackElement!.classList.add('no');
    feedbackElement!.innerHTML = msg;
    setTimeout(() => {
      feedbackElement!.classList.remove('no');
      feedbackElement!.innerHTML = '';
    }, 3000);
  }

  async acceptRequest(name: string) {
    try {
      await httpClient.post('friends/accept', { username: name });
      this.reloadComponent();
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        this._displayError('Could not accept request');
      }
    }
  }

  async declineRequest(name: string) {
    try {
      await httpClient.post('friends/decline', { username: name });
      this.reloadComponent();
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        this._displayError('Could not decline request');
      }
    }
  }

  async deleteFriend(name: string) {
    const confirmed = confirm('Möchten Sie diesen Freund wirklich löschen?');
    if (!confirmed) {
      return;
    }

    try {
      await httpClient.post('friends/delete', { username: name });
      this.reloadComponent();
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        this._displayError('Could not delete friend');
      }
    }
  }

  async reloadComponent() {
    try {
      const response = await httpClient.get('friends');
      const data = await response.json();
      this.friends = data.friends;
      this.requests = data.requests;
      this.requestUpdate();
    } catch (e) {
      if ((e as Error).message == 'Unauthorized!') {
        router.navigate('/users/sign-in');
      } else {
        this._displayError('Could not reload page');
      }
    }
  }
}
