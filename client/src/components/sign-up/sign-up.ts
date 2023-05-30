/* Autor: Lakzan Nathan (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from '../sign-in/style.css?inline';

@customElement('sign-up')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignUpComponent extends PageMixin(LitElement) {
  static styles = [componentStyle, sharedStyle];

  @query('form') private form!: HTMLFormElement;

  @query('#username') private usernameElement!: HTMLInputElement;

  @query('#email') private emailElement!: HTMLInputElement;

  // @query('#password') private passwordElement!: HTMLInputElement;

  // @query('#password-check') private passwordCheckElement!: HTMLInputElement;

  private pageName = 'Sign-Up';

  render() {
    return html`
      ${this.renderNotification()}
      <div class="Login-page">
        <div class="form ">
          <h1>Sign-Up</h1>
          <form novalidate>
            <div>
              <label for="username">Username</label>
              <input type="text" autofocus required id="username" placeholder="Username" />
              <div class="invalid-feedback">Username is required</div>
            </div>
            <div>
              <label for="email">E-Mail</label>
              <input type="email" required id="email" placeholder="Email" />
              <div class="invalid-feedback">Email is required and must be valid</div>
            </div>
            <p class="message">
              Already registered? <button @click="${this.signIn}">Sign-In</button>
               <button type="button" @click="${this.submit}">Create account</button>
          </form>
            </p>
           
        </div>
      </div>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const accountData = {
        username: this.usernameElement.value,
        email: this.emailElement.value
      };
      try {
        await httpClient.post('users/sign-up', accountData);
        router.navigate('/users/activation');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    // if (this.passwordElement.value !== this.passwordCheckElement.value) {
    //   this.passwordCheckElement.setCustomValidity('Please ensure that your passwords are identical');
    // } else {
    //   this.passwordCheckElement.setCustomValidity('');
    // }
    return this.form.checkValidity();
  }

  async signIn() {
    // window.location.href = 'users/sign-in';
    router.navigate('users/sign-in');
  }
  async firstUpdated() {
    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: this.pageName, bubbles: true, composed: true })
    );
  }
}
