/* Autor: Lakzan Nathan (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from '../sign-in/style.css?inline';

@customElement('app-resetpassword')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ActivationComponent extends PageMixin(LitElement) {
  static styles = [componentStyle, sharedStyle];
  @state() showConstraints = false;
  @state() entropy = 0;
  @state() visibility = 'none';
  @query('form')
  private form!: HTMLFormElement;

  @query('#safetyAnswerTwo') private safetyAnswerTwo!: HTMLInputElement;

  @query('#code') private codeElement!: HTMLFormElement;

  @query('#password') private passwordElement!: HTMLInputElement;

  @query('#password-check') private passwordCheckElement!: HTMLInputElement;

  private pageName = 'Reset your Password';
  private code = '';
  private pw = '';
  private pwCheck = '';
  private secQueTwo = '';

  private quality = [
    { minEntropy: 0, color: 'none', class: 'none', strength: '' },
    { minEntropy: 1, color: '#ff0d0d', class: 'weak', strength: ' Weak!' },
    { minEntropy: 25, color: '#ff4e11', class: 'mid', strength: ' Mid!' },
    { minEntropy: 50, color: '#fab733', class: 'sufficient', strength: ' Okay!' },
    { minEntropy: 75, color: '#acb334', class: 'good', strength: ' Good!' },
    { minEntropy: 100, color: '#50C878', class: 'secure', strength: ' Secure!' }
  ];
  private color = this.quality[0].color;
  private strength = '';
  private class = '.none';

  render() {
    return html` ${this.renderNotification()} ${this.showConstraints ? this.renderConstraints() : this.renderForm()} `;
  }

  renderForm() {
    return html`
      <div class="Login-page">
        <div class="form ">
          <form novalidate>
            <button id="constraintButton" type="button" @click="${this.toggleConstraints}">?</button>
            <div>
              <label for="Code">Code</label>
              <input .value="${this.code}"
                @input="${this.handleCodeChange}" type="number" required id="code" placeholder="Code" min="99999" max="999999"/>
              <div class="invalid-feedback">Code is required and must be valid</div>
            </div>
              <div>
              <label for="safetyAnswerTwo">What is your favorite animal?</label>
              <input type="password" id="safetyAnswerTwo" placeholder="Please enter here" autocomplete="off" required @input=${this.handleSecureQuestionTwoChange}
                .value=${this.secQueTwo}/>
              <div class="invalid-feedback">Entering a answer is mandatory</div>
            </div> 
             <div>
              <label for="password">Password</label>
              <input
                style="--color: ${this.color}"
                type="password"
                required
                minlength="8"
                maxlength="32"
                id="password"
                placeholder="Password"
                autocomplete="off"
                @focus=${this.toggleEntropy}
                @blur=${this.toggleEntropy}
                @input=${this.updateEntropy}
                .value=${this.pw}
              />
              <div class="invalid-feedback">Password is required and must be valid</div>
            </div>
            <div id="pwstrengthContainer" style="--visibility: ${this.visibility}">
              Password strength =<span style="--color: ${this.color}" id="pwstrength">${this.strength}</span>
            </div>
            <div id="indicatorBarContainer" style="--visibility: ${this.visibility}">
              <div id="indicatorBar" style="--color: ${this.color}" class="${this.class}"></div>
            </div>
            <div>
              <label for="password-check">Enter password again</label>
              <input
                type="password"
                required
                minlength="8"
                maxlength="32"
                id="password-check"
                placeholder="Password again"
                autocomplete="off"
                @input=${this.handlePasswordCheckChange}
                .value=${this.pwCheck}
              />
              <div class="invalid-feedback">
                Re-entering the password is required and must match the first password entered
              </div>
            </div>       
            <button type="button" @click="${this.submit}">Create account</button>
          </form>
            </p>
           
        </div>
      </div>
    `;
  }

  renderConstraints() {
    return html`
      <div class="Login-page">
        <div class="form">
          <h1>Password Constraints:</h1>
          <div class="constraints">
            <ul>
              <li>Password must be between 8 and 32 characters long</li>
              <li>One lowercase letter [a-z]</li>
              <li>One uppercase letter [A-Z]</li>
              <li>One digit [0-9]</li>
            </ul>
          </div>
          <button type="button" @click="${this.toggleConstraints}">Go Back!</button>
        </div>
      </div>
    `;
  }

  toggleConstraints() {
    this.showConstraints = !this.showConstraints;
  }

  async submit() {
    if (this.isFormValid()) {
      const accountData = {
        code: this.codeElement.value,
        password: this.passwordElement.value,
        passwordCheck: this.passwordCheckElement.value,
        safetyAnswerTwo: this.safetyAnswerTwo.value
      };
      try {
        await httpClient.post('users/resetPassword', accountData);
        router.navigate('/news');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
        router.navigate('/sign-up');
      }
    } else {
      this.form.classList.add('was-validated');
      this.showNotification('Click on the "?" to view our Constraints', 'info');
    }
  }

  isFormValid() {
    const rePassword = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,32}$/;
    this.passwordElement.setCustomValidity(rePassword.test(this.passwordElement.value) ? '' : 'Invalid Input');
    this.passwordCheckElement.setCustomValidity(
      this.passwordElement.value === this.passwordCheckElement.value
        ? ''
        : 'Please ensure that your passwords are identical'
    );
    return this.form.checkValidity();
  }

  async signIn() {
    // window.location.href = 'users/sign-in';
    router.navigate('users/sign-in');
  }

  async firstUpdated() {
    //er ekennt nich dass das die Variable in einem Event weitergegeben wird
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const appHeader = this.dispatchEvent(
      new CustomEvent('update-pagename', { detail: this.pageName, bubbles: true, composed: true })
    );
    try {
      this.startAsyncInit();
      await httpClient.get('/users/auth' + location.search);
      this.showNotification('We have sent you an email with a confirmation code that is valid for 3 minutes');
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit();
    }
  }
  updateEntropy = (event: InputEvent) => {
    const str = this.passwordElement.value;

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
      if (this.entropy >= l.minEntropy) {
        this.color = l.color;
        this.class = l.class;
        this.strength = l.strength;
      }
    });
    this.pw = (event.target as HTMLInputElement).value;
  };
  handlePasswordCheckChange(event: InputEvent) {
    this.pwCheck = (event.target as HTMLInputElement).value;
  }
  handleCodeChange(event: InputEvent) {
    this.code = (event.target as HTMLInputElement).value;
  }
  handleSecureQuestionTwoChange(event: InputEvent) {
    this.secQueTwo = (event.target as HTMLInputElement).value;
  }

  toggleEntropy(e: Event) {
    if (e.type === 'focus') return (this.visibility = 'block');
    this.visibility = this.passwordElement.value === '' ? 'none' : 'block';
  }
}
