/* Autor: Alexander Lesnjak */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import componentStyle from './friends.css?inline';

@customElement('app-friends')
class AppFriendsComponent extends LitElement {
  static styles = componentStyle;

  private circle: boolean;

  constructor() {
    super();
    this.circle = false;
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
              <input type="text" name="username" placeholder="Username" />
              <button type="submit" @click="${this._displayFeedback}">Senden</button>
            </div>

            <!--Feedback ob das senden funktioniert hat oder nicht-->
            <div id="feedback" class="clear"></div>

            <div id="textFreunde">Freundschaftsanfragen:</div>
            <div id="requestwindow" class="window">
              <!--Beispiel fuer eine Anfrage-->
              <div class="friendelem">
                <div class="a">
                  <div class="frame"></div>
                </div>
                <div class="b"><button>name</button></div>
                <div class="c">
                  <button>accept</button>
                  <button>decline</button>
                </div>
              </div>
            </div>
          </div>

          <div id="friendsList" class="containerelem">
            <div id="textFreunde">Freunde:</div>
            <div id="friendswindow" class="window">
              <div class="friendelem">
                <div class="a">
                  <div class="frame"></div>
                </div>
                <div class="b"><button>name</button></div>
                <div class="c">score</div>
              </div>
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

  async _displayFeedback() {
    const feedbackElement = this.shadowRoot!.getElementById('feedback');
    feedbackElement!.classList.remove('yes');
    feedbackElement!.classList.remove('no');

    if (this.circle) {
      feedbackElement!.classList.add('no');
      feedbackElement!.innerHTML = 'Could not send Friend Request!';
      setTimeout(() => {
        feedbackElement!.classList.remove('no');
        feedbackElement!.innerHTML = '';
      }, 2000);
      this.circle = false;
    } else {
      feedbackElement!.classList.add('yes');
      feedbackElement!.innerHTML = 'great sucess';
      setTimeout(() => {
        feedbackElement!.classList.remove('yes');
        feedbackElement!.innerHTML = '';
      }, 2000);
      this.circle = true;
    }
  }
}
