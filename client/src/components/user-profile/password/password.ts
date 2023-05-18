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
    // TODO:
    // * constraints and feedback
    // * validation
    // * button to show password
    // * entropy bar
    return html`<h3>Password</h3>
      <p>
        After changing your password you will be logged out and redirect. You can then log in using your new password.
      </p>
      <form novalidate>
        <div>
          <label for="pass1">New Password</label>
          <input id="pass1" type="password" autocomplete="off" required />
          <span />
        </div>
        <div>
          <label for="pass2">New Password Confirmation</label>
          <input id="pass2" type="password" autocomplete="off" required />
          <span />
        </div>
        <button type="button" @click=${this.submit}>Save</button>
        <button type="button" @click=${this.cancel}>Cancel</button>
      </form>`;
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

    // FIX: this overwrites the value in the parent component
    this.data.password = this.password.value;
    this.dispatchEvent(
      new CustomEvent('submit-req', {
        bubbles: true,
        detail: async () => {
          try {
            await httpClient.post('/users/profile', this.data);
            this.dispatchEvent(
              new CustomEvent('submit-suc', { bubbles: true, detail: 'Password updated successfully.' })
            );
            // TODO: log-out and redirect
          } catch (e) {
            this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: e }));
          }
        }
      })
    );
  }

  cancel() {
    this.form.reset();
  }
}
