/* Autor: Lakzan Nathan*/

import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import { router } from '../../router/router.js';
// ToDo: Add ComponentStyle
@customElement('sign-in')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignInComponent extends PageMixin(LitElement) {
  static styles = sharedStyle;

  @query('form') private form!: HTMLFormElement;

  @query('#email') private emailElement!: HTMLInputElement;

  @query('#password') private passwordElement!: HTMLInputElement;

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Sign-In</h1>
      <form novalidate>
        <div>
          <label for="email">E-Mail</label>
          <input type="email" autofocus required id="email" />
          <div class="invalid-feedback">Email is required and must be valid</div>
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" required id="password" />
          <div class="invalid-feedback">Password is required</div>
        </div>
        <button type="button" @click="${this.submit}">Sign-In</button>
        <button type="button" @click="${this.signUp}">Sign-Up</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const authData = {
        email: this.emailElement.value,
        password: this.passwordElement.value
      };
      try {
        await httpClient.post('/users/sign-in', authData);
        //router.navigate('/tasks'); --> Add our Website
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    return this.form.checkValidity();
  }

  async signUp() {
    window.location.href = 'users/sign-up';
  }
}
