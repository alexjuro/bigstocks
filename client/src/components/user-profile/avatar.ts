import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client';
import sharedStyle from '../shared.css?inline';
import componentStyle from './avatar.css?inline';

// FIX: also used in other components, export?
type Data = {
  name: string;
  email: string;
  avatar: string; // TODO: default avatar
};

@customElement('user-profile-avatar')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProfileAvatar extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @query('input') input!: HTMLInputElement;

  @property() data!: Data;

  render() {
    return html`
      <h3>Avatar</h3>
      <p>Accepted image formats are PNG and JPEG. The image's size must not exceed 200KiB.</p>
      <form>
        <img src="${this.data.avatar}" alt="Avatar" />
        <input type="file" accept="image/png,image/jpeg" />
        <form-control @req-submit=${this.submit}></form-control>
      </form>
    `;
  }

  async submit() {
    const file = this.checkValidity();
    if (!file) {
      this.dispatchEvent(new CustomEvent('submit-error', { bubbles: true, detail: new Error('Invalid file.') }));
      return;
    }

    try {
      await this.base64enc(file!).then(value => (this.data.avatar = value as string));
      await httpClient.post('/users/profile', this.data);
    } catch (e) {
      this.dispatchEvent(new CustomEvent('submit-error', { bubbles: true, detail: e }));
    }
  }

  checkValidity(): File | null {
    const files = this.input.files || new FileList();
    const valid =
      files.length === 1 && files[0].size <= 1024 * 200 && ['image/png', 'image/jpeg'].includes(files[0].type);

    return valid ? files[0] : null;
  }

  async base64enc(file: File) {
    const reader = new FileReader();

    return new Promise((res, rej) => {
      reader.onload = () => res(reader.result);
      reader.onerror = () => rej(new Error('Failed to read image, please try again.'));
      reader.readAsDataURL(file);
    });
  }
}
