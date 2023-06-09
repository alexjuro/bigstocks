/* Autor: Lakzan Nathan (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from '../sign-in/style.css?inline';

@customElement('sign-up')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignUpComponent extends PageMixin(LitElement) {
  static styles = [componentStyle, sharedStyle];
  @state() showConstraints = false;
  @query('form') private form!: HTMLFormElement;

  @query('#username') private usernameElement!: HTMLInputElement;

  @query('#email') private emailElement!: HTMLInputElement;

  private pageName = 'Sign-Up';
  private email = '';
  private username = '';

  render() {
    return html` ${this.renderNotification()} ${this.showConstraints ? this.renderConstraints() : this.renderForm()} `;
  }
  renderForm() {
    return html`
      <div class="Login-page">
        <div class="form ">
          <form @keydown="${this.handleKeyDown}" novalidate>
            <button id="constraintButton" type="button" @click="${this.toggleConstraints}">?</button>
            <div class="userNameContainer">
              <label for="username">Username</label>
              <input minlength="4" maxlength="32" type="text" autofocus required id="username" placeholder="Username" @input=${this.handleUsernameChange} .value=${this.username} />
              <div class="invalid-feedback">Username must be valid</div>
            </div>
            <div class="emailContainer">
              <label for="email">E-Mail</label>
              <input type="email" required id="email" placeholder="Email"  @input=${this.handleEmailChange} .value=${this.email}/>
              <div class="invalid-feedback">Email is required and must be valid</div>
            </div>
            <p class="message">
              Already registered? <button @click="${this.signIn}">Sign-In</button>  </p>
              <button type="button" @click="${this.submit}">Create account</button>
            </p>
          </form>
        </div>
      </div>
    `;
  }

  renderConstraints() {
    return html`
      <div class="Login-page">
        <div class="form">
          <h1>Username Constraints:</h1>
          <div class="password-constraints">
            <ul>
              <li>
                : It must consist of 4 to 32 characters, which can be alphanumeric (letters and numbers), hyphens, or
                periods.
              </li>
            </ul>
          </div>
          <button type="button" @click="${this.toggleConstraints}">Go it!</button>
        </div>
      </div>
    `;
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission by Enter key
      this.submit();
    }
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
      this.showNotification('Click on the "?" to view our Constraints', 'info');
    }
  }

  isFormValid() {
    console.log('is Form valid function');
    const reUsername = /^[\w-.]{4,32}$/;
    this.usernameElement.setCustomValidity(reUsername.test(this.username) ? '' : 'pattern-missmatch');
    console.log(reUsername.test(this.usernameElement.value) ? '' : 'pattern-missmatch');
    return this.form.checkValidity();
  }

  async signIn() {
    router.navigate('users/sign-in');
  }

  async firstUpdated() {
    //er ekennt nich dass das die Variable in einem Event weitergegeben wird
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: this.pageName, bubbles: true, composed: true })
    );
  }

  handleUsernameChange(event: InputEvent) {
    this.username = (event.target as HTMLInputElement).value;
  }

  handleEmailChange(event: InputEvent) {
    this.email = (event.target as HTMLInputElement).value;
  }
  toggleConstraints() {
    this.showConstraints = !this.showConstraints;
  }
}
