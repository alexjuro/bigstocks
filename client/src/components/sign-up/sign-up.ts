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

  @query('#name') private nameElement!: HTMLInputElement;

  @query('#email') private emailElement!: HTMLInputElement;

  @query('#password') private passwordElement!: HTMLInputElement;

  @query('#password-check') private passwordCheckElement!: HTMLInputElement;

  render() {
    return html`
      ${this.renderNotification()}
      <div class="Login-page">
        <div class="form ">
          <form novalidate>
            <div>
              <label for="name">Name</label>
              <input type="text" autofocus required id="name" placeholder="Name" />
              <div class="invalid-feedback">Name is required</div>
            </div>
            <div>
              <label for="email">E-Mail</label>
              <input type="email" required id="email" placeholder="Email" />
              <div class="invalid-feedback">>Email is required and must be valid</div>
            </div>
            <div>
              <label for="password">Password</label>
              <input type="password" required minlength="10" id="password" placeholder="Password" />
              <div class="invalid-feedback">Passwort ist erforderlich und muss mind. 10 Zeichen lang sein</div>
            </div>
            <div>
              <label for="password-check">Enter password again</label>
              <input type="password" required minlength="10" id="password-check" placeholder="Password again" />
              <div class="invalid-feedback">
                Re-entering the password is required and must match the first password entered
              </div>
            </div>
            <button type="button" @click="${this.submit}">Create account</button>
            <p class="message">
              Already registered?
              <a @click="${this.signIn}" href="/users/sign-up">Sign-In</a>
            </p>
          </form>
        </div>
      </div>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const accountData = {
        name: this.nameElement.value,
        email: this.emailElement.value,
        password: this.passwordElement.value,
        passwordCheck: this.passwordCheckElement.value
      };
      try {
        await httpClient.post('users', accountData);
        router.navigate('/tasks');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    if (this.passwordElement.value !== this.passwordCheckElement.value) {
      this.passwordCheckElement.setCustomValidity('Passwörter müssen gleich sein');
    } else {
      this.passwordCheckElement.setCustomValidity('');
    }
    return this.form.checkValidity();
  }

  async signIn() {
    window.location.href = 'users/sign-in';
  }
}
