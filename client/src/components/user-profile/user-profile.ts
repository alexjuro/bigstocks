/* Author: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
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

  private userInfo = httpClient.get('/users/account');
  private user!: UserData;

  async connectedCallback() {
    super.connectedCallback();
    // TODO: change to /users/auth once merged
    await httpClient.get('/users/account').catch((e: { statusCode: number }) => {
      if (e.statusCode === 401) router.navigate('/users/sign-in');
    });
  }

  render() {
    return html`
      ${until(
        this.userInfo.then(async res => {
          this.user = await res.json();

          return html`${this.renderNotification()}
            <dialog>
              <form novalidate @submit="${this.verifyPassword}">
                <label for="input">Password confirmation:</label>
                <input id="input" type="password" autocomplete="off" required />
                <button type="button" @click="${this.verifyPassword}">Confirm</button>
                <button type="button" @click="${() => this.modal.close()}">Cancel</button>
              </form>
            </dialog>

            <h2>Profile</h2>
            <user-profile-avatar
              .data=${{ id: this.user.id, avatar: this.user.avatar }}
              @load-err="${this.loadError}"
              @submit-req="${this.submitRequest}"
              @submit-suc="${this.submitSuccess}"
              @submit-err="${this.submitError}"
            ></user-profile-avatar>
            <div class="divider"><hr /></div>
            <user-profile-details
              @submit-req="${this.submitRequest}"
              @submit-suc="${this.submitSuccess}"
              @submit-err="${this.submitError}"
              .data="${{ id: this.user.id, email: this.user.email, username: this.user.username }}"
            ></user-profile-details>
            <div class="divider"><hr /></div>
            <user-profile-password
              @submit-req="${this.submitRequest}"
              @submit-suc="${this.submitSuccess}"
              @submit-err="${this.submitError}"
              .data="${{ id: this.user.id, password: this.user.password }}"
            ></user-profile-password>`;
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

    await this.confirmCb();
  }

  loadError(e: CustomEvent) {
    this.showNotification(e.detail, 'error');
  }

  async submitRequest(e: CustomEvent) {
    this.confirmCb = e.detail;
    this.modal.showModal();
  }

  submitSuccess(e: CustomEvent) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showNotification(e.detail, 'info');
  }

  submitError(e: CustomEvent) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showNotification((e.detail as Error).message, 'error');
  }

  private confirmCb = async () => this.showNotification('Error calling internal.', 'error');
}
