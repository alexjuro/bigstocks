/* Author: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import sharedStyle from '../../shared.css?inline';
import sharedLocalStyle from '../shared-local.css?inline';
import componentStyle from './password.css?inline';
import { httpClient } from '../../../http-client';
import { PageMixin } from '../../page.mixin';
import { UserData } from '../types';

@customElement('user-profile-password')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProfilePassword extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedLocalStyle, componentStyle];

  @property() data!: Pick<UserData, 'id' | 'password'>;

  @query('form') form!: HTMLFormElement;
  @query('#pass1') password!: HTMLInputElement;
  @query('#pass2') passwordConfirm!: HTMLInputElement;

  @state() isText = false;

  render() {
    // TODO: entropy bar
    return html`<h3>Password</h3>
      <p>
        After changing your password you will be logged out and redirect. You can then log in using your new password.
      </p>
      <form novalidate>
        <div>
          <label for="pass1">New Password</label>
          <input id="pass1" type="${this.isText ? 'text' : 'password'}" autocomplete="off" required />
          <span />
          <img
            src="http://localhost:8080/app/eye_${this.isText ? 'off' : 'on'}28.png"
            @click="${this.togglePasswordVisibility}"
          />
        </div>
        <div>
          <label for="pass2">New Password Confirmation</label>
          <input id="pass2" type="${this.isText ? 'text' : 'password'}" autocomplete="off" required />
          <span />
        </div>
        <button type="button" @click="${this.submit}">Save</button>
        <button type="button" @click="${this.cancel}">Cancel</button>
      </form>`;
  }

  togglePasswordVisibility() {
    this.isText = !this.isText;
  }

  async submit() {
    const re = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,32}$/;
    this.password.setCustomValidity(re.test(this.password.value) ? '' : 'pattern-mismatch');

    if (!this.form.checkValidity()) {
      this.form.classList.add('was-validated');
      return;
    }

    // TODO: bcrypt compare this.data.password
    if (this.password.value !== this.passwordConfirm.value) {
      this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: new Error("Passwords don't match!") }));
      return;
    }

    this.data.password = this.password.value;
    this.dispatchEvent(
      new CustomEvent('submit-req', {
        bubbles: true,
        detail: async () => {
          await httpClient
            .post('/users/profile/password', this.data)
            .then(() =>
              // TODO: log-out and redirect
              this.dispatchEvent(
                new CustomEvent('submit-suc', { bubbles: true, detail: 'Password updated successfully.' })
              )
            )
            .catch(e => this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: e })));
        }
      })
    );
  }

  cancel() {
    this.form.classList.remove('was-validated');
    this.form.reset();
  }
}
