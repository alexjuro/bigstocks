/* Author: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './user-profile.css?inline';
import { PageMixin } from '../page.mixin.js';
import { UserData } from './types';

// TODO: escape / sanitize inputs
@customElement('user-profile')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Profile extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @query('dialog') modal!: HTMLDialogElement;
  @query('form') form!: HTMLFormElement;
  @query('input') input!: HTMLInputElement;

  // private userInfo = httpClient.get('/users/profile');
  private userInfo = new Promise<Response>(resolve => {
    setTimeout(() => {
      const res = new Response();
      res.json = async () => ({ id: 1, email: 'admin@bigstocks.com', name: 'harry-hacker', password: 'password' });
      resolve(res);
    }, 3000);
  });
  private user!: UserData;

  constructor() {
    super();
    // TODO: check auth header; redirect to sign-in if not present
  }

  render() {
    return html`
      ${until(
        this.userInfo
          .then(async res => {
            this.user = await res.json();

            return html`${this.renderNotification()}
              <dialog>
                <form novalidate @submit="${this.verifyPassword}">
                  <label for="input">Password confirmation:</label>
                  <input id="input" type="password" autocomplete="off" required />
                  <button type="button" @click="${this.verifyPassword}">Confirm</button>
                </form>
              </dialog>

              <h2>Profile</h2>
              <user-profile-avatar .data=${{ id: this.user.id, avatar: this.user.avatar }}></user-profile-avatar>
              <div class="divider"><hr /></div>
              <user-profile-details
                @submit-req="${this.submitRequest}"
                @submit-suc="${this.submitSuccess}"
                @submit-err="${this.submitError}"
                .data="${{ id: this.user.id, email: this.user.email, name: this.user.name }}"
              ></user-profile-details>
              <div class="divider"><hr /></div>
              <user-profile-password
                @submit-req="${this.submitRequest}"
                @submit-suc="${this.submitSuccess}"
                @submit-err="${this.submitError}"
                .data="${{ id: this.user.id, password: this.user.password }}"
              ></user-profile-password>`;
          })
          .catch(() => {
            this.showNotification('Failed to load user data. Please try again.');
            window.location.assign('/');
          }),
        html`<is-loading></is-loading>`
      )}
    `;
  }

  async verifyPassword(e: Event) {
    e.type == 'submit' && e.preventDefault();

    if (!this.form.checkValidity()) return this.form.classList.add('was-validated');

    this.modal.close();
    // TODO: bcrypt compare
    if (this.input.value !== this.user.password) return this.showNotification('Password incorrect.', 'error');

    await this.confirmCb();
  }

  async submitRequest(e: CustomEvent) {
    this.confirmCb = e.detail;
    this.modal.showModal();
  }

  submitSuccess(e: CustomEvent) {
    this.showNotification(e.detail, 'info');
  }

  submitError(e: CustomEvent) {
    this.showNotification((e.detail as Error).message, 'error');
  }

  private confirmCb = async () => this.showNotification('Error calling internal.', 'error');
}
