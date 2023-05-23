/* Author: Nico Pareigis */

import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../../http-client';
import sharedStyle from '../../shared.css?inline';
import sharedLocalStyle from '../shared-local.css?inline';
import componentStyle from './avatar.css?inline';
import { UserData } from '../types';

@customElement('user-profile-avatar')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ProfileAvatar extends LitElement {
  static styles = [sharedStyle, sharedLocalStyle, componentStyle];

  @property() data!: Pick<UserData, 'id' | 'avatar'>;
  // TODO: sanitize filename
  @property() file = 'No file chosen.';

  @query('input') input!: HTMLInputElement;
  @query('button') button!: HTMLButtonElement;
  @query('img') img!: HTMLImageElement;

  private media_types = ['image/png', 'image/jpeg'];

  firstUpdated() {
    this.img.onerror = () => {
      this.img.src = '';
      this.dispatchEvent(new CustomEvent('load-failure', { bubbles: true, detail: 'Failed to load avatar.' }));
    };
  }

  render() {
    return html`<div class="container">
      <div>
        <h3>Avatar</h3>
        <p>Accepted image formats are PNG and JPEG.</p>
      </div>
      <form>
        <div class="inner">
          <img src="${this.data.avatar || '../../../../../../public/placeholder.png'}" />
          <div>
            <h4>Change avatar</h4>
            <div>
              <label for="input">Choose file...</label>
              <p id="file">${this.file}</p>
              <input id="input" type="file" accept="${this.media_types.join(',')}" @change="${this.updateFile}" />
            </div>
            <p id="size">Image size must not exceed 200KiB.</p>
            <button type="button" @click="${this.submit}">Upload</button>
          </div>
        </div>
      </form>
    </div>`;
  }

  updateFile() {
    if (this.input.files) {
      this.file = this.input.files[0].name;
      this.button.style.visibility = 'visible';
    }
  }

  async submit() {
    const file = this.checkValidity();
    if (!file) {
      this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: new Error('Invalid file.') }));
      return;
    }

    try {
      await this.base64enc(file!).then(base64 => (this.data.avatar = base64));
      await httpClient.post('/users/profile/avatar', this.data);
    } catch (e) {
      this.dispatchEvent(new CustomEvent('submit-err', { bubbles: true, detail: e }));
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
      reader.onerror = () => rej(new Error('Failed to load image, please try again.'));
      reader.readAsDataURL(file);
    });
  }
}
