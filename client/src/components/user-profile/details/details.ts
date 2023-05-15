import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import sharedStyle from '../../shared.css?inline';
import sharedLocalStyle from '../shared-local.css?inline';
import componentStyle from './details.css?inline';
import { httpClient } from '../../../http-client';
import { PageMixin } from '../../page.mixin';
import { UserData } from '../types';

// FIX: make invalid-feedback visible even with intermediate span
@customElement('user-profile-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProfileMain extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedLocalStyle, componentStyle];

  @query('form') form!: HTMLFormElement;
  @query('#name') name!: HTMLInputElement;
  @query('#email') email!: HTMLInputElement;

  @property() data!: UserData;

  render() {
    return html`<h3>Account Information</h3>
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
        <button type="button" @click=${this.submit}>Save</button>
        <button type="button" @click=${this.cancel}>Cancel</button>
      </form>`;
  }

  async submit() {
    if (!this.form.checkValidity()) {
      this.form.classList.add('was-validated');
      return;
    }

    if (this.email.value === this.data.email && this.name.value === this.data.name) return;

    try {
      await httpClient.post('/users/profile', {
        email: this.email.value,
        name: this.name.value
      });
      this.dispatchEvent(new CustomEvent('submit-suc', { bubbles: true, detail: 'Profile' }));
    } catch (e) {
      this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: e }));
    }
  }

  cancel() {
    this.form.reset();
  }
}
