import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../../http-client';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './avatar.css?inline';
import { UserData } from '../types';

@customElement('user-profile-avatar')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProfileAvatar extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @query('input') input!: HTMLInputElement;
  @query('img') img!: HTMLImageElement;

  @property() data!: UserData;

  private media_types = ['image/png', 'image/jpeg'];

  firstUpdated() {
    this.img.onerror = () => (this.img.src = 'PLACEHOLDER');
  }

  render() {
    return html`
      <h3>Avatar</h3>
      <p>Accepted image formats are PNG and JPEG. The image's size must not exceed 200KiB.</p>
      <form>
        <img src="${this.data.avatar || 'PLACEHOLDER'}" />
        <input type="file" accept="${this.media_types.join(',')}" />
        <button type="button" @click=${this.submit}>Save</button>
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
      await this.base64enc(file!).then(base64 => (this.data.avatar = base64));
      await httpClient.post('/users/profile', this.data);
    } catch (e) {
      this.dispatchEvent(new CustomEvent('submit-error', { bubbles: true, detail: e }));
    }
  }

  checkValidity(): File | null {
    const files = this.input.files || new FileList();
    const valid = files.length === 1 && files[0].size <= 1024 * 200 && this.media_types.includes(files[0].type);

    return valid ? files[0] : null;
  }

  async base64enc(file: File): Promise<string> {
    const reader = new FileReader();

    return new Promise((res, rej) => {
      reader.onload = () => res(reader.result as string);
      reader.onerror = () => rej(new Error('Failed to read image, please try again.'));
      reader.readAsDataURL(file);
    });
  }
}
