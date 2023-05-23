/* Autor: Lakzan Nathan */
import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { router } from '../../router/router.js';
import xss from 'xss';

import style from './style.css?inline';
import sharedStyle from '../shared.css?inline';

@customElement('sign-out')
class SignOutComponent extends PageMixin(LitElement) {
  static styles = [style, sharedStyle];
  @query('comment') private commentElement!: HTMLInputElement;
  @query('form') private form!: HTMLInputElement;
  @query('my-rating') private myRating!: HTMLElement;
  @query('#valueInput') private valueInput!: HTMLInputElement;

  private comment = '';

  render() {
    return html`
      ${this.renderNotification()}
      <div class="Rating-Page">
        <div class="Rating-Form">
          <form id="ratingForm">
            <h1>Did you like your visit?</h1>
            <div class="stars">
              <my-rating value="0" max="5"></my-rating>
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
                .value=${this.comment}
                @input=${this.handleCommentChange}
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
      this.startAsyncInit();
      const ratingStatusJSON = await httpClient.get('/users/rating' + location.search);
      const ratingStatus = (await ratingStatusJSON.json()).rating;
      console.log(ratingStatus);
      await httpClient.delete('/users/sign-out');
      if (ratingStatus) {
        router.navigate('/users/sign-in');
      }
      this.showNotification('You have been successfully signed out!');
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit();
    }
  }

  async sendRating() {
    const value = this.myRating.getAttribute('value');
    // Send the rating value and comment to the server{

    if (value && this.validate(this.comment, parseInt(value))) {
      try {
        await httpClient.post('/comment/rating', { rating: parseInt(value), comment: this.comment });
        router.navigate('users/sign-in');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  async skip() {
    router.navigate('users/sign-in');
  }

  validate(comment: string, rating: number) {
    let result = true;
    if (rating > 5 || rating < 0) {
      result = false;
    }

    // Überprüfung auf potenzielle SQL-Injection
    const sqlInjectionPattern = /[';]|--|\/\*|\*\//gi;
    if (sqlInjectionPattern.test(comment)) {
      result = false;
    }

    // Überprüfung auf potenzielle XSS-Attacken
    const sanitizedComment = xss(comment);
    if (sanitizedComment !== comment) {
      result = false;
    }
    return result;
  }
  handleCommentChange(event: InputEvent) {
    this.comment = (event.target as HTMLInputElement).value;
  }
}
