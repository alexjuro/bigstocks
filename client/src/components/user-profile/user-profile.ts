import { html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
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
  @query('#name') name!: HTMLInputElement;
  @query('#email') email!: HTMLInputElement;
  @query('#password') password!: HTMLInputElement;

  private userInfo = httpClient.get('/users/profile');

  constructor() {
    super();
    // TODO: check auth header; redirect to sign-in if not present
  }

  render() {
    return html`
      ${until(
        this.userInfo
          .then(async res => {
            const user: User = await res.json();

            return html` ${this.renderNotification()}
              <h2>Profile</h2>
              <div id="avatar">
                <h3>Avatar</h3>
                <p>profile_picture_here</p>
              </div>
              <div class="divider"><hr /></div>
              <div id="settings">
                <h3>Account Details</h3>
                <form novalidate>
                  <div>
                    <label for="name">Username</label>
                    <input id="name" type="text" value=${user.name} required />
                    <span />
                    <div class="invalid-feedback">Username must not be empty.</div>
                    <div id="annotation">Your public username.</div>
                  </div>
                  <div>
                    <label for="email">Email address</label>
                    <input id="email" type="email" value=${user.email} required />
                    <span />
                    <div id="annotation">Your email address.</div>
                    <div class="invalid-feedback">Email address must be a valid email.</div>
                  </div>
                  <div>
                    <label for="password">Password</label>
                    <input id="password" type="password" minlength="8" />
                    <span />
                    <div id="annotation">Your account password.</div>
                    <div class="invalid-feedback">Password must be longer than 7 characters.</div>
                  </div>
                  <div class="divider"><hr /></div>
                  <div>
                    <button type="button" @click=${this.submit}>Save</button>
                    <button type="reset">Cancel</button>
                  </div>
                </form>
              </div>`;
          })
          .catch(() => {
            // TODO: pop-up 'failed to load'
            window.location.assign('/');
          }),
        html`Loading...`
      )}
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
