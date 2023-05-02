import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './form-controls.css?inline';

@customElement('form-control')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class FormSubmit extends LitElement {
  static styles = [sharedStyle, componentStyle];

  render() {
    return html`<div>
      <button type="button" @click=${this.submit}>Save</button>
      <button type="button" @click=${this.cancel}>Cancel</button>
    </div>`;
  }

  submit() {
    this.dispatchEvent(new CustomEvent('req-submit', { bubbles: true }));
  }
  cancel() {
    this.dispatchEvent(new CustomEvent('req-cancel', { bubbles: true }));
  }
}
