/* Autor: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import sharedStyle from '../../shared.css?inline';
import sharedLocalStyle from '../shared-local.css?inline';
import componentStyle from './password.css?inline';
import { httpClient } from '../../../http-client';
import { PageMixin } from '../../page.mixin';
import { UserData } from '../types';
import { Constraint } from '../constraints/constraints';
import bcrypt from 'bcryptjs';
import { router } from '../../../router/router';

@customElement('user-profile-password')
export class ProfilePassword extends PageMixin(LitElement) {
  static styles = [sharedStyle, sharedLocalStyle, componentStyle];

  @property() data!: Pick<UserData, 'id' | 'password'>;

  @query('form') form!: HTMLFormElement;
  @query('#pass1') pass!: HTMLInputElement;
  @query('#pass2') passConfirm!: HTMLInputElement;
  @query('.indicator') entropyIndicator!: HTMLDivElement;

  @state() isText = false;
  @state() entropy = 0;
  @state() visibility = 'hidden';

  private quality = [
    { minEntropy: 0, color: '#ff0d0d' },
    { minEntropy: 25, color: '#ff4e11' },
    { minEntropy: 50, color: '#fab733' },
    { minEntropy: 75, color: '#acb334' },
    { minEntropy: 100, color: '#69b34c' }
  ];
  private color = this.quality[0].color;

  private constraints: Constraint[] = [
    {
      section: 'Password must be between 8 and 32 characters long, containing at least',
      bullets: ['one lowercase letter [a-z]', 'one uppercase letter [A-Z]', 'one digit [0-9]']
    },
    {
      section: "The bar below the input gives an indication to the entered password's strength"
    }
  ];

  render() {
    return html`<div class="container">
      <div class="description">
        <h3>Password</h3>
        <p>
          After changing your password you will be logged out and redirect. You can then log in using your new password.
        </p>
        <field-constraints .constraints="${this.constraints}"></field-constraints>
      </div>
      <form novalidate>
        <div>
          <label for="pass1">New Password</label>
          <input
            id="pass1"
            type="${this.isText ? 'text' : 'password'}"
            @focus="${this.toggleEntropy}"
            @blur="${this.toggleEntropy}"
            @input=${this.updateEntropy}
            autocomplete="off"
            required
          />
          <div><span @click="${this.togglePasswordVisibility}"></span></div>
          <div class="entropy" style="--color:${this.color};--visibility:${this.visibility}"></div>
          <div class="invalid-feedback">Password does not match constraints.</div>
        </div>
        <div>
          <label for="pass2">New Password Confirmation</label>
          <input id="pass2" type="password" autocomplete="off" required />
        </div>
        <button type="button" @click="${this.submit}">Save</button>
        <button type="button" @click="${this.cancel}">Cancel</button>
      </form>
    </div>`;
  }

  firstUpdated() {
    this.form.onkeydown = async e => {
      if (this.isText) return;
      if ([e.key, e.code].includes('Enter')) {
        e.preventDefault();
        await this.submit();
      }
    };
  }

  toggleEntropy(e: Event) {
    if (e.type === 'focus') return (this.visibility = 'visible');
    this.visibility = this.pass.value === '' ? 'hidden' : 'visible';
  }

  updateEntropy() {
    const str = this.pass.value;

    const unique = new Set();
    str.split('').forEach(c => unique.add(c));

    // NOTE: does not account for all possible characters
    let chr = 0;
    if (/[a-z]/.test(str)) chr += 26;
    if (/[A-Z]/.test(str)) chr += 26;
    if (/\d/.test(str)) chr += 10;
    // owasp common special password characters (see https://owasp.org/www-community/password-special-characters)
    if (/[ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(str)) chr += 33;

    const penalty = Math.max(0.6, unique.size / (str.length || 1));
    this.entropy = str.length * Math.log2((chr || 1) * penalty);

    this.quality.forEach(l => {
      if (this.entropy >= l.minEntropy) this.color = l.color;
    });
  }

  togglePasswordVisibility() {
    this.isText = !this.isText;
    this.passConfirm.disabled = this.isText;
  }

  async submit() {
    const re = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,32}$/;
    this.pass.setCustomValidity(re.test(this.pass.value) ? '' : 'pattern-mismatch');

    if (!this.form.checkValidity()) {
      this.form.classList.add('was-validated');
      return;
    }

    if (this.pass.value !== this.passConfirm.value) {
      this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: new Error("Passwords don't match!") }));
      return;
    }

    if (await bcrypt.compare(this.pass.value, this.data.password)) {
      this.dispatchEvent(
        new CustomEvent('submit-err', { bubbles: true, detail: new Error('New password must differ from old one.') })
      );
      return;
    }

    this.dispatchEvent(
      new CustomEvent('submit-req', {
        bubbles: true,
        detail: {
          cb: async () => {
            this.data.password = this.pass.value;

            await httpClient
              .put('/users/account/password', this.data)
              .then(() => httpClient.delete('/users/sign-out'))
              .then(() => {
                router.navigate('/users/sign-in');
                this.dispatchEvent(
                  new CustomEvent('submit-suc', { bubbles: true, detail: 'Password updated successfully.' })
                );
              })
              .catch(e => this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: e })));
          },
          confirm: true
        }
      })
    );
  }

  cancel() {
    this.form.classList.remove('was-validated');
    this.form.reset();
  }
}
