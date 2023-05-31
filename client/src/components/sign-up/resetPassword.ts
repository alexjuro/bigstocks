/* Autor: Lakzan Nathan (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from '../sign-in/style.css?inline';

@customElement('app-resetpassword')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ActivationComponent extends PageMixin(LitElement) {
  static styles = [componentStyle, sharedStyle];

  @query('form') private form!: HTMLFormElement;

  @query('#safetyAnswerTwo') private safetyAnswerTwo!: HTMLInputElement;

  @query('#code') private codeElement!: HTMLFormElement;

  @query('#password') private passwordElement!: HTMLInputElement;

  @query('#password-check') private passwordCheckElement!: HTMLInputElement;

  private pageName = 'Reset your Password';

  render() {
    return html`
      ${this.renderNotification()}
      <div class="Login-page">
        <div class="form ">
          <form novalidate>
            <div>
              <label for="Code">Code</label>
              <input type="number" required id="code" placeholder="Code" min="99999" max="999999"/>
              <div class="invalid-feedback">Code is required and must be valid</div>
            </div>
              <div>
              <label for="safetyAnswerTwo">What is your favorite animal?</label>
              <input type="password" id="safetyAnswerTwo" placeholder="Please enter here" autocomplete="off" required/>
              <div class="invalid-feedback">Entering a answer is mandatory</div>
            </div> 
            <div>
              <label for="password">Password</label>
              <input type="password" required minlength="10" id="password" placeholder="Password" autocomplete="off"/>
              <div class="invalid-feedback">Password is required and must be at least 10 characters long</div>
            </div>
            <div>
              <label for="password-check">Enter password again</label>
              <input type="password" required minlength="10" id="password-check" placeholder="Password again" autocomplete="off"/>
              <div class="invalid-feedback">
                Re-entering the password is required and must match the first password entered
              </div>
            </div>       
            <button type="button" @click="${this.submit}">Create account</button>
          </form>
            </p>
           
        </div>
      </div>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      console.log('submit');
      const accountData = {
        code: this.codeElement.value,
        password: this.passwordElement.value,
        passwordCheck: this.passwordCheckElement.value,
        safetyAnswerTwo: this.safetyAnswerTwo.value
      };
      try {
        await httpClient.post('users/resetPassword', accountData);
        console.log('after post');
        router.navigate('/news');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
        router.navigate('/sign-up');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    if (this.passwordElement.value !== this.passwordCheckElement.value) {
      this.passwordCheckElement.setCustomValidity('Please ensure that your passwords are identical');
    } else {
      this.passwordCheckElement.setCustomValidity('');
    }
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
    try {
      this.startAsyncInit();
      await httpClient.get('/users/auth' + location.search);
      this.showNotification('We have sent you an email with a confirmation code that is valid for 3 minutes');
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
}
