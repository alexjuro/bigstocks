import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import sharedStyle from '../../shared.css?inline';
import sharedLocalStyle from '../shared-local.css?inline';
import { httpClient } from '../../../http-client';
import { PageMixin } from '../../page.mixin';
import { UserData } from '../types';

@customElement('user-profile-password')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProfilePassword extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedLocalStyle];

  @property() data!: UserData;

  @query('form') form!: HTMLFormElement;
  @query('#pass1') password!: HTMLInputElement;
  @query('#pass2') passwordConfirm!: HTMLInputElement;

  render() {
    // TODO: add constraints and feedback
    return html`<h3>Password</h3>
      <p>
        After changing your password you will be logged out and redirect. You can then log in using your new password.
      </p>
      <form novalidate>
        <div>
          <label for="pass1">New Password</label>
          <input id="pass1" type="password" required />
          <span />
        </div>
        <div>
          <label for="pass2">New Password Confirmation</label>
          <input id="pass2" type="password" required />
          <span />
        </div>
        <button type="button" @click=${this.submit}>Save</button>
        <button type="button" @click=${this.cancel}>Cancel</button>
      </form>`;
  }

  async submit() {
    if (!this.form.checkValidity()) {
      this.form.classList.add('was-validated');
      return;
    }

    // TODO: hash and compare to this.data.password

    if (this.password.value !== this.passwordConfirm.value) {
      this.form.classList.add('was-validated');
      this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: new Error("Passwords don't match!") }));
      return;
    }

    this.data.password = this.password.value;
    try {
      await httpClient.post('/users/profile', this.data);
      this.dispatchEvent(new CustomEvent('submit-suc', { bubbles: true, detail: 'Password' }));
      // TODO: log-out and redirect
    } catch (e) {
      this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: e }));
    }
  }

  cancel() {
    this.form.reset();
  }
}
