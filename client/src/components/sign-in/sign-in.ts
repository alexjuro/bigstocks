import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
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

  private pagenName = 'Sign-In';

  private username = '';
  private password = '';

  async firstUpdated() {
    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: this.pagenName, bubbles: true, composed: true })
    );
  }

  render() {
    return html`
      ${this.renderNotification()}
      <div class="Login-Page">
        <div class="form">${this.step === 1 ? this.renderEmailStep() : this.renderPasswordStep()}</div>
      </div>
    `;
  }

  renderEmailStep() {
    return html`
      <h1>Log-In</h1>
      <form novalidate class="login-form">
        <div>
          <label for="username">Username</label>
          <input
            type="text"
            autofocus
            required
            id="text"
            placeholder="Username"
            .value=${this.username}
            @input=${this.handleUsernameChange}
          />
          <div class="invalid-feedback">Username is required and must be valid</div>
        </div>
        <button type="button" @click=${this.nextStep}>Next</button>
        <p class="message">
          Not registered?
          <button @click=${this.signUp}>Create an account</button>
        </p>
      </form>
    `;
  }

  renderPasswordStep() {
    return html`
      <h1>Log-In</h1>
      <form novalidate class="login-form">
        <div>
          <label for="password">Password</label>
          <input
            type="password"
            required
            id="password"
            placeholder="Password"
            autocomplete="off"
            .value=${this.password}
            @input=${this.handlePasswordChange}
          />
          <div class="invalid-feedback">Password is required</div>
        </div>
        <button type="button" @click=${this.backStep}>Back</button>
        <button type="button" @click=${this.submit}>Sign-In</button>
        <p class="message">
          Not registered?
          <button @click=${this.signUp}>Create an account</button>
        </p>
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
    return this.form.checkValidity();
  }

  async signUp() {
    router.navigate('users/sign-up');
  }
}
