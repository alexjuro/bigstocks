/* Autor: Alexander Lesnjak */
//TODO: show the picture of the user
//TODO: show success
//TODO: reload after eg. accept friend

import { LitElement, PropertyValueMap, html } from 'lit';
import { httpClient } from '../../http-client.js';
import { customElement, query, property, eventOptions, state } from 'lit/decorators.js';
import { router } from '../../router/router.js';
import componentStyle from './friends.css?inline';
import { until } from 'lit/directives/until.js';

@customElement('app-friends')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppFriendsComponent extends LitElement {
  static styles = componentStyle;

  @query('#input') private nameElement!: HTMLInputElement;

  constructor() {
    super();
  }

  @state() request = httpClient.get('friends').then(async res => (await res.json()) as any);

  @state()
  requests: any[] = [];
  @state()
  friends: any[] = [];

  @eventOptions({ capture: true })
  protected async firstUpdated() {
    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: 'friends', bubbles: true, composed: true })
    );

    try {
      const response = await httpClient.get('friends');
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
                    <button type="submit" @click="${() => this.addFriend()}">Senden</button>
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
                          <div class="c">Profit made: ${friend.profit} $</div>
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
  }

  async scollToForm() {
    const scroll = this.shadowRoot!.getElementById('addMethod');
    scroll!.scrollIntoView({ behavior: 'smooth' });
  }

  async addFriend() {
    const friendname = this.nameElement.value;

    try {
      const response = await httpClient.post('friends', { username: friendname });
      console.log('succes');
      this._displaySuccess();
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
      //If you already send a Request to that person
      else if ((e as Error).message == 'Not Acceptable') {
        this._displayError('You have already send a Request to that person');
        console.log('You have already send a Request to that person');
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
    }, 3000);
  }

  async acceptRequest(name: string) {
    try {
      const response = await httpClient.post('friends/accept', { username: name });
      console.log('accepted');
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
      const response = await httpClient.post('friends/decline', { username: name });
      console.log('declined'); //TODO: das wird nicht ausgefuehrt
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
      const response = await httpClient.post('friends/delete', { username: name });
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
      this.request = httpClient.get('friends').then(async res => (await res.json()) as any);

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
