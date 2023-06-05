/* Autor: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import sharedStyle from '../../shared.css?inline';
import sharedLocalStyle from '../shared-local.css?inline';
import componentStyle from './details.css?inline';
import { httpClient } from '../../../http-client';
import { PageMixin } from '../../page.mixin';
import { UserData } from '../types';
import { Constraint } from '../constraints/constraints';

@customElement('user-profile-details')
export class ProfileMain extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedLocalStyle, componentStyle];

  @query('form') form!: HTMLFormElement;
  @query('#name') name!: HTMLInputElement;
  @query('#email') email!: HTMLInputElement;

  @property() data!: Pick<UserData, 'id' | 'email' | 'username'>;

  private constraints: Constraint[] = [
    {
      section: 'Username must be between 4 and 32 characters long, legal characters are',
      bullets: ['lowercase letters [a-z]', 'uppercase letters [A-Z]', 'digits [0-9]', 'hyphenation characters [-_.]']
    },
    {
      section: 'Email must be a valid email address'
    }
  ];

  render() {
    return html`<div class="container">
      <div class="description">
        <h3>Account Information</h3>
        <p>General account information.</p>
        <field-constraints .constraints="${this.constraints}"></field-constraints>
      </div>
      <form novalidate>
        <div>
          <label for="name">Username</label>
          <input
            id="name"
            type="text"
            value="${this.data.username}"
            @input="${() => this.checkValidity(false)}"
            required
          />
          <div class="invalid-feedback">Invalid username.</div>
          <div class="annotation">Your public username.</div>
        </div>
        <div>
          <label for="email">Email address </label>
          <input
            id="email"
            type="email"
            value="${this.data.email}"
            @input="${() => this.checkValidity(false)}"
            required
          />
          <div class="invalid-feedback">Invalid email address.</div>
          <div class="annotation">Your email address.</div>
        </div>
        <button type="button" @click="${this.submit}">Save</button>
        <button type="button" @click="${this.cancel}">Cancel</button>
      </form>
    </div>`;
  }

  firstUpdated() {
    this.form.onkeydown = async e => {
      if ([e.key, e.code].includes('Enter')) {
        e.preventDefault();
        await this.submit();
      }
    };
  }

  checkValidity(force: boolean) {
    if (!(this.form.classList.contains('was-validated') || force)) return;

    const reEmail =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const reName = /^[\w-.]{4,32}$/;

    this.email.setCustomValidity(reEmail.test(this.email.value) ? '' : 'pattern-mismatch');
    this.name.setCustomValidity(reName.test(this.name.value) ? '' : 'pattern-mismatch');
  }

  async submit() {
    this.checkValidity(true);

    if (!this.form.checkValidity()) return this.form.classList.add('was-validated');
    if (this.email.value === this.data.email && this.name.value === this.data.username) return;

    this.dispatchEvent(
      new CustomEvent('submit-req', {
        bubbles: true,
        detail: async () => {
          this.data.email = this.email.value;
          this.data.username = this.name.value;

          await httpClient
            .post('/users/account/details', this.data)
            .then(() =>
              this.dispatchEvent(new CustomEvent('submit-suc', { bubbles: true, detail: 'Profile update successful.' }))
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
