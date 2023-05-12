import { html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './user-profile.css?inline';
import { PageMixin } from '../page.mixin.js';
import { UserData } from './types';

@customElement('user-profile')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Profile extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @query('form') form!: HTMLFormElement;

  // private userInfo = httpClient.get('/users/profile');
  private userInfo = new Promise<Response>((resolve, reject) => {
    setTimeout(() => {
      const res = new Response();
      res.json = async () => ({ name: 'admin', email: 'email' });
      resolve(res);
    }, 1000);
  });

  constructor() {
    super();
    // TODO: check auth header; redirect to sign-in if not present
  }

  render() {
    return html`
      ${until(
        this.userInfo
          .then(async res => {
            const user: UserData = await res.json();

            return html` ${this.renderNotification()}
              <h2>Profile</h2>
              <user-profile-avatar .data=${user}></user-profile-avatar>
              <div class="divider"><hr /></div>
              <user-profile-details @submit-error=${this.submitError} .data=${user}></user-profile-details>
              <div class="divider"><hr /></div>
              <user-profile-password @submit-error=${this.submitError}></user-profile-password>`;
          })
          .catch(() => {
            // TODO: pop-up 'failed to load'
            window.location.assign('/');
          }),
        html`Loading...`
      )}
    `;
  }

  submitError(e: CustomEvent) {
    this.showNotification((e.detail as Error).message, 'error');
  }
}
