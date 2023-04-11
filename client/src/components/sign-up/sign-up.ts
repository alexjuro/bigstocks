/* Autor: Lakzan Nathan (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
//import componentStyle from './sign-up.css?inline';

@customElement('sign-up')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignUpComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle];

  @query('form') private form!: HTMLFormElement;

  @query('#name') private nameElement!: HTMLInputElement;

  @query('#email') private emailElement!: HTMLInputElement;

  @query('#password') private passwordElement!: HTMLInputElement;

  @query('#password-check') private passwordCheckElement!: HTMLInputElement;

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Sign-Up</h1>
      <form novalidate>
        <div>
          <label for="name">Name</label>
          <input type="text" autofocus required id="name" />
          <div class="invalid-feedback">Name is required</div>
        </div>
        <div>
          <label for="email">E-Mail</label>
          <input type="email" required id="email" />
          <div class="invalid-feedback">>Email is required and must be valid</div>
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" required minlength="10" id="password" />
          <div class="invalid-feedback">Passwort ist erforderlich und muss mind. 10 Zeichen lang sein</div>
        </div>
        <div>
          <label for="password-check">Enter password again</label>
          <input type="password" required minlength="10" id="password-check" />
          <div class="invalid-feedback">
            Re-entering the password is required and must match the first password entered
          </div>
        </div>
        <button type="button" @click="${this.submit}">Create account</button>
      </form>
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
}
