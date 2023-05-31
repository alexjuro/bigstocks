/* Autor: Lakzan Nathan (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from '../sign-in/style.css?inline';

@customElement('app-forgotpassword')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class forgotPasswordOne extends PageMixin(LitElement) {
  static styles = [componentStyle, sharedStyle];

  @query('form') private form!: HTMLFormElement;
  @query('#username') private username!: HTMLInputElement;
  @query('#safetyAnswerOne') private safetyAnswerOne!: HTMLInputElement;

  private pageName = 'Forgot Password';

  render() {
    return html`
      ${this.renderNotification()}
      <div class="Login-page">
        <div class="form ">
          <h1>Forgot Password</h1>
          <form novalidate>
            <div>
              <label for="username">Username</label>
              <input type="text" autofocus required id="username" placeholder="Username" />
              <div class="invalid-feedback">Username is required</div>
            </div>
            <div>
              <label for="safetyAnswerOne">What is your favorite food?</label>
              <input type="password" id="safetyAnswerOne" placeholder="Please enter here" autocomplete="off" required/>
              <div class="invalid-feedback">Entering a answer is mandatory</div> 
            </div>      
            <button type="button" @click="${this.submit}">Reset Password</button>
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
        username: this.username.value,
        safetyAnswerOne: this.safetyAnswerOne.value
      };
      console.log(accountData);
      try {
        await httpClient.post('users/forgotPassword', accountData);
        console.log('after post');
        router.navigate('/users/resetPassword');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
        // router.navigate('/sign-up');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    return this.form.checkValidity();
  }

  async firstUpdated() {
    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: this.pageName, bubbles: true, composed: true })
    );
  }
}
