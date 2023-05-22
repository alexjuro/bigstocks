/* Autor: Lakzan Nathan */
import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { router } from '../../router/router.js';

import style from './style.css?inline';
import sharedStyle from '../shared.css?inline';

@customElement('sign-out')
class SignOutComponent extends PageMixin(LitElement) {
  static styles = [style, sharedStyle];
  @query('comment') private comment!: HTMLInputElement;
  @query('form') private form!: HTMLInputElement;
  @query('my-rating') private myRating!: HTMLElement;
  @query('#valueInput') private valueInput!: HTMLInputElement;

  render() {
    return html`
      ${this.renderNotification()}
      <div class="Rating-Page">
        <div class="Rating-Form">
          <form id="ratingForm">
            <h1>Did you like your visit?</h1>
            <div class="stars">
              <my-rating value="0" max="5" }></my-rating>
            </div>
            <div>
              <input type="number" id="valueInput" placeholder="Enter the value" />
            </div>
            <div>
              <label for="comment">Comment</label>
              <input
                type="textarea"
                required
                form="rating"
                id="comment"
                placeholder="Maximum comment length:300 characters"
                maxlength="300"
                cols=""
                ;
              />
            </div>
            <button type="button" @click=${this.sendRating}>Send!</button>
            <button type="button" @click=${this.skip}>Skip</button>
          </form>
        </div>
      </div>
    `;
  }

  async firstUpdated() {
    try {
      await httpClient.delete('/users/sign-out');
      this.showNotification('You have been successfully signed out!');
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async sendRating() {
    const value = this.myRating.getAttribute('value');
    if (typeof value === 'string') this.valueInput.value = value;
    console.log(value);
    // Send the rating value and comment to the server
  }

  async skip() {
    router.navigate('users/sign-in');
  }
}
