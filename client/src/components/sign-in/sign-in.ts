import { LitElement, html } from 'lit';
import { customElement, eventOptions, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { router } from '../../router/router.js';
import sharedStyle from '../shared.css?inline';
import style from './style.css?inline';

@customElement('sign-in')
class SignInComponent extends PageMixin(LitElement) {
  static styles = [style, sharedStyle];

  @query('form')
  private form!: HTMLFormElement;

  @query('#username')
  private usernameElement!: HTMLInputElement;

  @query('#password')
  private passwordElement!: HTMLInputElement;

  @state()
  private step = 1;

  private pagenName = 'Log-In';

  private username = '';
  private password = '';
  private pageName = 'Log-In';

  @eventOptions({ capture: true })
  async firstUpdated() {
    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: this.pageName, bubbles: true, composed: true })
    );
  }

  handleKeyDownPassword(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission by Enter key
      this.submit();
    }
  }

  handleKeyDownUsername(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission by Enter key
      this.nextStep();
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <div class="Login-Page">
        <div class="form">${this.step === 1 ? this.renderUsernameStep() : this.renderPasswordStep()}</div>
      </div>
    `;
  }

  renderUsernameStep() {
    return html`
      <form @keydown="${this.handleKeyDownUsername}" novalidate class="login-form">
        <div>
          <label for="username">Username</label>
          <input
            type="text"
            autofocus
            required
            id="username"
            placeholder="Username"
            .value=${this.username}
            @input=${this.handleUsernameChange}
          />
          <div class="invalid-feedback">Invalid Input</div>
        </div>
        <p id="forgotPasswordMessage" class="message">
          Forgot you password?<button id="forgotPasswordButton" @click="${this.forgotPassword}">Reset password!</button>
        </p>
        <p id="notRegisteredMessage" class="message">
          Not registered?<button id="signUpButton" @click=${this.signUp}>Create an account</button>
        </p>
        <button type="button" id="nextButton" @click=${this.nextStep}>Next</button>
      </form>
    `;
  }

  async forgotPassword() {
    router.navigate('users/forgotPassword');
  }

  renderPasswordStep() {
    return html`
      <form @keydown="${this.handleKeyDownPassword}" novalidate class="login-form">
        <div>
          <label for="password">Password</label>
          <input
            type="password"
            required
            minlength="8"
            maxlength="32"
            id="password"
            placeholder="Password"
            autocomplete="off"
            .value=${this.password}
            @input=${this.handlePasswordChange}
          />
          <div class="invalid-feedback">Invalid Input</div>
        </div>
        <p id="forgotPasswordMessage" class="message">
          Forgot you password?<button @click="${this.forgotPassword}">Reset password!</button>
        </p>
        <p id="notRegisteredMessage" class="message">
          Not registered?<button id="signUpButton" @click=${this.signUp}>Create an account</button>
        </p>
        <button type="button" id="backButton" @click=${this.backStep}>Back</button>
        <button type="button" id="submitButton" @click=${this.submit}>Sign-In</button>
      </form>
    `;
  }

  handleUsernameChange(event: InputEvent) {
    this.username = (event.target as HTMLInputElement).value;
  }

  handlePasswordChange(event: InputEvent) {
    this.password = (event.target as HTMLInputElement).value;
  }

  nextStep() {
    if (this.isFormValid()) {
      this.step = 2;
    } else {
      this.form.classList.add('was-validated');
    }
  }
  backStep() {
    this.step = 1;
  }

  async submit() {
    if (this.isFormValid()) {
      const authData = {
        username: this.username,
        password: this.password
      };
      try {
        await httpClient.post('/users/sign-in', authData);
        router.navigate('/news');
        this.step = 1; // Zurücksetzen auf den ersten Schritt nach erfolgreichem Einloggen
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    const re = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,32}$/;
    if (this.passwordElement !== null)
      this.passwordElement.setCustomValidity(re.test(this.passwordElement.value) ? '' : 'pattern-mismatch');
    const reUsername = /^[\w-.]{4,32}$/;
    if (this.usernameElement !== null)
      this.usernameElement.setCustomValidity(reUsername.test(this.usernameElement.value) ? '' : 'pattern-missmatch');
    return this.form.checkValidity();
  }

  async signUp() {
    router.navigate('users/sign-up');
  }
}
