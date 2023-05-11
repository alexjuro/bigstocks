import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';

@customElement('sign-out')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {
  render() {
    return html` ${this.renderNotification()} `;
  }

  async firstUpdated() {
    try {
      await httpClient.delete('/users/sign-out');
      this.showNotification('You have been successfully signed out!');
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }
}
