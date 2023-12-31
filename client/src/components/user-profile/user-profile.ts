/* Autor: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import sharedStyle from '../shared.css?inline';
import sharedLocalStyle from './shared-local.css?inline';
import componentStyle from './user-profile.css?inline';
import { PageMixin } from '../page.mixin.js';
import { UserData } from './types';
import { compare } from 'bcryptjs';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';

@customElement('user-profile')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Profile extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedLocalStyle, componentStyle];

  @query('dialog') modal!: HTMLDialogElement;
  @query('form') form!: HTMLFormElement;
  @query('input') input!: HTMLInputElement;

  @state() request = httpClient.get('/users/account').then(async res => (await res.json()) as UserData);
  private user!: UserData;

  async connectedCallback() {
    super.connectedCallback();
    await httpClient.get('/users/auth').catch((e: { statusCode: number }) => {
      if (e.statusCode === 401) router.navigate('/users/sign-in');
    });
  }

  firstUpdated() {
    this.dispatchEvent(new CustomEvent('update-pagename', { bubbles: true, composed: true, detail: 'Profile' }));
  }

  render() {
    return html`
      ${until(
        this.request.then(json => {
          this.user = json;

          return html`${this.renderNotification()}
            <dialog>
              <form novalidate @submit="${this.verifyPassword}">
                <label for="input">Password confirmation:</label>
                <input id="input" type="password" autocomplete="off" required />
                <button type="button" @click="${this.verifyPassword}">Confirm</button>
                <button type="button" @click="${() => this.modal.close()}">Cancel</button>
              </form>
            </dialog>

            <h2>Account</h2>
            <user-profile-avatar
              .data=${{ id: this.user.id, avatar: this.user.avatar }}
              @load-err="${this.loadError}"
              @submit-req="${this.submitRequest}"
              @submit-suc="${this.submitSuccess}"
              @submit-err="${this.submitError}"
            ></user-profile-avatar>
            <div class="divider"><hr /></div>
            <user-profile-details
              .data="${{ id: this.user.id, email: this.user.email, username: this.user.username }}"
              @submit-req="${this.submitRequest}"
              @submit-suc="${this.submitSuccess}"
              @submit-err="${this.submitError}"
            ></user-profile-details>
            <div class="divider"><hr /></div>
            <user-profile-password
              .data="${{ id: this.user.id, password: this.user.password }}"
              @submit-req="${this.submitRequest}"
              @submit-suc="${this.submitSuccess}"
              @submit-err="${this.submitError}"
            ></user-profile-password>

            <div class="divider"><hr /></div>
            <h2>Transactions</h2>
            <p>
              To view your past transactions, click
              <a @click="${() => router.navigate('/transactions')}">here</a>.
            </p>`;
        }),
        html`<is-loading></is-loading>`
      )}
    `;
  }

  async verifyPassword(e: Event) {
    e.type === 'submit' && e.preventDefault();

    if (!this.form.checkValidity()) return this.form.classList.add('was-validated');

    this.modal.close();
    if (!(await compare(this.input.value, this.user.password)))
      return this.showNotification('Incorrect password.', 'error');

    await this.cb();
  }

  loadError(e: CustomEvent) {
    this.showNotification(e.detail, 'error');
  }

  async submitRequest(e: CustomEvent) {
    const { cb, confirm } = e.detail;
    if (!confirm) return cb();
    this.cb = cb;
    this.modal.showModal();
  }

  submitSuccess(e: CustomEvent) {
    this.request = httpClient.get('/users/account').then(async res => (await res.json()) as UserData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showNotification(e.detail, 'info');
  }

  submitError(e: CustomEvent) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showNotification((e.detail as Error).message, 'error');
  }

  private cb = async () => this.showNotification('Error calling internal.', 'error');
}
