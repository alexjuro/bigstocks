import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import sharedStyle from '../shared.css?inline';
import sharedLocalStyle from './shared-local.css?inline';
import componentStyle from './details.css?inline';
import { httpClient } from '../../http-client';
import { PageMixin } from '../page.mixin';

type Data = {
  name: string;
  email: string;
};

// FIX: make invalid-feedback visible even with intermediate span
@customElement('user-profile-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProfileMain extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedLocalStyle, componentStyle];

  @query('form') form!: HTMLFormElement;
  @query('#name') name!: HTMLInputElement;
  @query('#email') email!: HTMLInputElement;

  @property() data!: Data;

  render() {
    return html`
      <h3>Account Information</h3>
      <form novalidate>
        <div>
          <label for="name">Username</label>
          <input id="name" type="text" value=${this.data.name} required />
          <span />
          <div class="invalid-feedback">Username must not be empty.</div>
          <div id="annotation">Your public username.</div>
        </div>
        <div>
          <label for="email">Email address</label>
          <input id="email" type="email" value=${this.data.email} required />
          <span />
          <div id="annotation">Your email address.</div>
          <div class="invalid-feedback">Email address must be a valid email.</div>
        </div>
        <form-control @req-submit=${this.submit} @req-cancel=${this.cancel}></form-submit>
      </form>`;
  }

  async submit() {
    if (!this.form.checkValidity()) {
      this.form.classList.add('was-validated');
      return;
    }

    try {
      // TODO: pop-up 'update successful'
      await httpClient.post('/users/profile', {
        email: this.email.value,
        name: this.name.value
      });
    } catch (e) {
      this.dispatchEvent(new CustomEvent('submit-error', { bubbles: true, detail: e }));
    }
  }

  cancel() {
    this.form.reset();
  }
}
