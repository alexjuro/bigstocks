import { html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import sharedLocalStyle from './shared-local.css?inline';
import { httpClient } from '../../http-client';
import { PageMixin } from '../page.mixin';

@customElement('user-profile-password')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProfilePassword extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedLocalStyle];

  @query('form') form!: HTMLFormElement;
  @query('#pass1') password!: HTMLInputElement;
  @query('#pass2') passwordConfirm!: HTMLInputElement;

  render() {
    // TODO: add constraints and feedback
    return html`
      <h3>Password</h3>
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
        <form-control @req-submit=${this.submit} @req-cancel=${this.cancel}></form-submit>
      </form>`;
  }

  async submit() {
    if (this.password !== this.passwordConfirm) {
      this.dispatchEvent(
        new CustomEvent('submit-error', { bubbles: true, detail: new Error("Passwords don't match!") })
      );
      return;
    }

    if (this.form.checkValidity()) {
      try {
        // TODO: pop-up 'update successful'
        await httpClient.post('/users/profile', {
          password: this.password
        });
      } catch (e) {
        this.dispatchEvent(new CustomEvent('submit-error', { bubbles: true, detail: e }));
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  cancel() {
    this.form.reset();
  }
}
