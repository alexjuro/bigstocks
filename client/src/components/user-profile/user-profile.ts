import { html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './user-profile.css?inline';
import { httpClient } from '../../http-client';
import { PageMixin } from '../page.mixin.js';

type User = {
  name: string;
  email: string;
};

@customElement('user-profile')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Profile extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @query('form') form!: HTMLFormElement;
  @query('#Username') name!: HTMLInputElement;
  @query('#Email') email!: HTMLInputElement;
  @query('#Password') password!: HTMLInputElement;

  private user!: User;

  constructor() {
    super();
    // TODO: check auth header; redirect to sign-in if not present
  }

  async connectedCallback() {
    super.connectedCallback();

    this.user = await httpClient
      .get('/users/profile')
      .then(res => res.json())
      .catch(() => {
        // TODO: pop-up 'failed to load'
        // FIX: error in render, even though this should redirect immediately?
        window.location.assign('/');
      });
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h2>Profile</h2>
      <div id="avatar">
        <h3>Avatar</h3>
        <p>profile_picture_here</p>
      </div>
      <div class="divider"><hr /></div>
      <div id="settings">
        <h3>Account Details</h3>
        <form>
          <div>
            <label for="name">Username</label>
            <input id="name" type="text" value=${this.user.name} required />
            <span />
            <div class="invalid-feedback">Username must not be empty.</div>
            <div id="annotation">Your public username.</div>
          </div>
          <div>
            <label for="email">Email address</label>
            <input id="email" type="email" value=${this.user.email} required />
            <span />
            <div class="invalid-feedback">Email address must be a valid email.</div>
            <div id="annotation">Your email address.</div>
          </div>
          <div>
            <label for="password">Password</label>
            <input id="password" type="password" minlength="8" />
            <span />
            <div class="invalid-feedback">Password must not be longer than 7 characters.</div>
            <div id="annotation">Your account password.</div>
          </div>
          <div class="divider"><hr /></div>
          <div>
            <button type="button" @click=${this.submit}>Save</button>
            <button type="reset">Cancel</button>
          </div>
        </form>
      </div>
    `;
  }

  async submit() {
    if (this.form.checkValidity()) {
      try {
        // TODO: pop-up 'update successful'
        await httpClient.post('/users/profile', {
          email: this.email.value,
          name: this.name.value,
          password: this.password.value
        });
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }
}
