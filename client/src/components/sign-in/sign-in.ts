/* Autor: Lakzan Nathan*/

import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { router } from '../../router/router.js';

import sharedStyle from '../shared.css?inline';
import style from './style.css?inline';

@customElement('sign-in')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignInComponent extends PageMixin(LitElement) {
  static styles = [style, sharedStyle];

  @query('form') private form!: HTMLFormElement;

  @query('#email') private emailElement!: HTMLInputElement;

  @query('#password') private passwordElement!: HTMLInputElement;

  render() {
    return html`
      ${this.renderNotification()}
      <div class="Login-Page">
        <div class="form">
          <h1>Log-In</h1>
          <form novalidate class="login-form">
            <div>
              <label for="email">E-Mail</label>
              <input type="email" autofocus required id="email" placeholder="Email" />
              <div class="invalid-feedback">Email is required and must be valid</div>
            </div>
            <div>
              <label for="password">Password</label>
              <input type="password" required id="password" placeholder="Password" />
              <div class="invalid-feedback">Password is required</div>
            </div>
            <button type="button" @click="${this.submit}">Sign-In</button>
            <p class="message">
              Not registered?
              <button @click="${this.signUp}">Create an account</button>
            </p>
          </form>
        </div>
      </div>
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
        router.navigate('/news');
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
    router.navigate('users/sign-up');
  }
}
